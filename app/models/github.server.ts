import dotenv from "dotenv";
dotenv.config();

import { Octokit } from "octokit";
import { prisma } from "~/db.server";
import { CommitResponse } from "~/utils/interfacesAndTypes";
import { extractOwnerRepo } from "~/utils/someFunctions";

export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const DEFAULT_HUMAN_AVATAR = "https://avatars.githubusercontent.com/u/583231?v=4";
const DEFAULT_BOT_AVATAR = "https://github.githubassets.com/images/modules/logos/github-mark.png";
const MAX_COMMITS_TO_STORE = 100;
const COMMITS_PAGE_SIZE = 25;

// Simple in-memory per-project lock to avoid duplicate concurrent refreshes
const projectLocks = new Map<string, Promise<unknown>>();
function withProjectLock<T>(projectId: string, fn: () => Promise<T>): Promise<T> {
  const running = projectLocks.get(projectId) ?? Promise.resolve();
  const next = running
    .catch(() => undefined) // ignore previous errors
    .then(fn) as Promise<T>;
  projectLocks.set(projectId, next.finally(() => {
    // Only clear if this is the last promise stored
    if (projectLocks.get(projectId) === next) projectLocks.delete(projectId);
  }));
  return next;
}

// Fetching GitHub URL FROM the DB
export async function getGithubUrl(projectId: string): Promise<string | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { githubUrl: true },
    });
    return project?.githubUrl || null;
  } catch (error) {
    console.error("❌ Error fetching GitHub URL:", error);
    return null;
  }
}

// Fetching commits from GitHub Repository using Octokit, not from DB
export async function fetchCommitsFromGitHub(githubUrl: string, limit = MAX_COMMITS_TO_STORE): Promise<CommitResponse[]> {
  // Validate and extract owner/repo
  const { owner, repo } = extractOwnerRepo(githubUrl) || {};
  if (!owner || !repo) {
    console.error("❌ Invalid GitHub URL for extracting owner/repo:", githubUrl);
    return [];
  }

  // Use max per_page for efficiency
  const per_page = 100;
  const commits: CommitResponse[] = [];
  let page = 1;
  try {
    while (commits.length < limit) {
      const remaining = limit - commits.length;
      const pageSize = remaining < per_page ? remaining : per_page;
      let data = [];
      try {
        const resp = await octokit.rest.repos.listCommits({ owner, repo, per_page: pageSize, page });
        data = resp.data;
      } catch (err) {
        console.error("❌ Error fetching commits from GitHub API:", err);
        break;
      }
      if (!data.length) break;
      for (const commit of data) {
        // Validate commit structure
        if (!commit || !commit.sha || !commit.commit || !commit.commit.message) continue;
        const isBot = commit.author?.type === "Bot";
        commits.push({
          commitHash: commit.sha,
          commitMessage: commit.commit.message,
          commitUrl: commit.html_url || "",
          authorName: commit.commit.author?.name || commit.author?.login || (isBot ? "GitHub Bot" : "Unknown"),
          authorAvatarUrl: commit.author?.avatar_url || (isBot ? DEFAULT_BOT_AVATAR : DEFAULT_HUMAN_AVATAR),
          authorUrl: commit.author?.html_url || "",
          committedAt: commit.commit.author?.date || new Date().toISOString(),
        });
      }
      if (data.length < pageSize) break; // no more pages
      page += 1;
    }
    console.log(`Octokit fetched ${commits.length} commits`);
    return commits;
  } catch (error) {
    console.error("❌ Unexpected error in fetchCommitsFromGitHub:", error);
    return commits;
  }
}

export async function saveCommitsToDB(projectId: string, commits: CommitResponse[]) {
  if (commits.length === 0) return;
  try {
    // Prefetch existing commit hashes to avoid unique constraint errors on SQLite (no skipDuplicates)
    const existing = await prisma.repoCommit.findMany({
      where: { projectId },
      select: { commitHash: true },
    });
    const existingSet = new Set(existing.map(e => e.commitHash));
    const toInsert = commits
      .filter(c => c.commitHash && !existingSet.has(c.commitHash))
      .map(commit => ({
        projectId,
        commitHash: commit.commitHash,
        commitMessage: commit.commitMessage,
        commitUrl: commit.commitUrl,
        authorName: commit.authorName ?? "Unknown",
        authorAvatarUrl: commit.authorAvatarUrl ?? DEFAULT_HUMAN_AVATAR,
        authorUrl: commit.authorUrl ?? "",
        committedAt: new Date(commit.committedAt ?? new Date().toISOString()),
      }));
    if (toInsert.length > 0) {
      const res = await prisma.repoCommit.createMany({ data: toInsert });
      console.log(`✅ Saved ${res.count} new commits to DB.`);
    } else {
      console.log("✅ No new commits to save.");
    }
    await enforceCommitRetention(projectId);
  } catch (error) {
    console.error("❌ Error saving commits to DB:", error);
  }
}


// Fetch the latest N commits (default 100)
export async function getLatestCommitsFromDB(projectId: string, limit = MAX_COMMITS_TO_STORE): Promise<CommitResponse[]> {
  try {
    const items = await prisma.repoCommit.findMany({
      where: { projectId },
      orderBy: { committedAt: "desc" },
      take: limit,
    });
    return items.map(commit => ({
      commitHash: commit.commitHash,
      commitMessage: commit.commitMessage,
      commitUrl: commit.commitUrl,
      authorName: commit.authorName ?? "Unknown",
      authorAvatarUrl: commit.authorAvatarUrl ?? DEFAULT_HUMAN_AVATAR,
      authorUrl: commit.authorUrl ?? "",
      committedAt: commit.committedAt.toISOString(),
    }));
  } catch (error) {
    console.error("❌ Error fetching latest commits from DB:", error);
    return [];
  }
}

// Fetch a paginated page of commits (25 per page by default)
export async function getCommitsPageFromDB(projectId: string, page = 1, pageSize = COMMITS_PAGE_SIZE): Promise<CommitResponse[]> {
  try {
    const skip = (page - 1) * pageSize;
    const items = await prisma.repoCommit.findMany({
      where: { projectId },
      orderBy: { committedAt: "desc" },
      skip,
      take: pageSize,
    });
    return items.map(commit => ({
      commitHash: commit.commitHash,
      commitMessage: commit.commitMessage,
      commitUrl: commit.commitUrl,
      authorName: commit.authorName ?? "Unknown",
      authorAvatarUrl: commit.authorAvatarUrl ?? DEFAULT_HUMAN_AVATAR,
      authorUrl: commit.authorUrl ?? "",
      committedAt: commit.committedAt.toISOString(),
    }));
  } catch (error) {
    console.error("❌ Error fetching paginated commits from DB:", error);
    return [];
  }
}

export async function fetchAndReplaceCommits(projectId: string) {
  return withProjectLock(projectId, async () => {
    try {
      const githubUrl = await getGithubUrl(projectId);
      if (!githubUrl) throw new Error("GitHub URL not found.");
      const commits = await fetchCommitsFromGitHub(githubUrl, MAX_COMMITS_TO_STORE);
      // Replace in a transaction to minimize lock time
      await prisma.$transaction([
        prisma.repoCommit.deleteMany({ where: { projectId } }),
        prisma.repoCommit.createMany({
          data: commits.map(c => ({
            projectId,
            commitHash: c.commitHash,
            commitMessage: c.commitMessage,
            commitUrl: c.commitUrl,
            authorName: c.authorName ?? "Unknown",
            authorAvatarUrl: c.authorAvatarUrl ?? DEFAULT_HUMAN_AVATAR,
            authorUrl: c.authorUrl ?? "",
            committedAt: new Date(c.committedAt ?? new Date().toISOString()),
          })),
        }),
      ]);
      await enforceCommitRetention(projectId);
      return commits.slice(0, MAX_COMMITS_TO_STORE);
    } catch (error) {
      console.error("❌ Error in fetchAndReplaceCommits:", error);
      return [];
    }
  });
}

async function enforceCommitRetention(projectId: string) {
  try {
    // Delete older commits beyond MAX_COMMITS_TO_STORE by committedAt desc, skipping first N
    const oldest = await prisma.repoCommit.findMany({
      where: { projectId },
      orderBy: { committedAt: "desc" },
      skip: MAX_COMMITS_TO_STORE,
      select: { id: true },
    });
    if (oldest.length) {
      await prisma.repoCommit.deleteMany({ where: { id: { in: oldest.map(o => o.id) } } });
      console.log(`🧹 Trimmed ${oldest.length} old commits (retained latest ${MAX_COMMITS_TO_STORE}).`);
    }
  } catch (error) {
    console.error("❌ Error enforcing commit retention:", error);
  }
}

// Simple in-memory refresh rate limit per project (resets on server restart)
const lastRefreshAt = new Map<string, number>();
export class RateLimitError extends Error {
  constructor(public retryAfterMs: number) {
    super("Rate limited");
    this.name = "RateLimitError";
  }
}

export function canRefreshNow(projectId: string, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const last = lastRefreshAt.get(projectId) ?? 0;
  const diff = now - last;
  const allowed = diff >= windowMs;
  return { allowed, retryAfterMs: allowed ? 0 : windowMs - diff };
}

export async function refreshCommitsWithRateLimit(projectId: string, windowMs = 5 * 60 * 1000) {
  const { allowed, retryAfterMs } = canRefreshNow(projectId, windowMs);
  if (!allowed) throw new RateLimitError(retryAfterMs);
  // Compare current DB hashes with incoming fetched set to compute new count
  const existing = await prisma.repoCommit.findMany({
    where: { projectId },
    select: { commitHash: true },
  });
  const existingSet = new Set(existing.map(e => e.commitHash));
  const commits = await fetchAndReplaceCommits(projectId);
  const newCount = commits.filter(c => !existingSet.has(c.commitHash)).length;
  lastRefreshAt.set(projectId, Date.now());
  return { commits, newCount };
}