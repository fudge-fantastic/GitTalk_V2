import dotenv from "dotenv";
dotenv.config();

import { Octokit } from "octokit";
import { prisma } from "~/db.server";
import { CommitResponse } from "~/utils/interfacesAndTypes";
import { extractOwnerRepo } from "~/utils/someFunctions";

export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const DEFAULT_HUMAN_AVATAR = "https://avatars.githubusercontent.com/u/583231?v=4";
const DEFAULT_BOT_AVATAR = "https://github.githubassets.com/images/modules/logos/github-mark.png";
export const MAX_COMMITS_TO_STORE = 100;
const COMMITS_PAGE_SIZE = 25;

// Fetching GitHub URL FROM the DB via Project -> Repo
export async function getGithubUrl(projectId: string): Promise<string | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { repo: { select: { githubUrl: true } } },
    });
    return project?.repo?.githubUrl || null;
  } catch (error) {
    console.error("❌ Error fetching GitHub URL:", error);
    return null;
  }
}

// Fetching commits from GitHub Repository using Octokit, not from DB
export async function fetchCommitsFromGitHubUsingOctokit(githubUrl: string, limit = MAX_COMMITS_TO_STORE): Promise<CommitResponse[]> {
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

// Fetch a paginated page of commits (25 per page by default)
export async function getCommitsPageFromDB(projectId: string, page = 1, pageSize = COMMITS_PAGE_SIZE): Promise<CommitResponse[]> {
  // Always at most the newest 100 commits are stored per repo.
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { repoId: true },
    });
    if (!project?.repoId) return [];
    const all = await prisma.repoCommit.findMany({
      where: { repoId: project.repoId },
      orderBy: { committedAt: "desc" },
      take: MAX_COMMITS_TO_STORE,
    });
    const start = (page - 1) * pageSize;
    const pageItems = all.slice(start, start + pageSize);
    return pageItems.map(commit => ({
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

export async function fetchAndReplaceCommits(projectId: string): Promise<CommitResponse[]> {
  try {
    // Get the repoId and githubUrl for this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { repoId: true, repo: { select: { githubUrl: true } } },
    });
    if (!project?.repoId || !project.repo?.githubUrl) throw new Error("Repo or GitHub URL not found.");
    const repoId = project.repoId;
    const githubUrl = project.repo.githubUrl;

    // 1. REUSE: If another repo already has commits, just use those (no need to copy, since all projects share the same repoId now)
    const existingCommits = await prisma.repoCommit.findMany({
      where: { repoId },
      orderBy: { committedAt: "desc" },
      take: MAX_COMMITS_TO_STORE,
    });
    if (existingCommits.length > 0) {
      return existingCommits.map(c => ({
        commitHash: c.commitHash,
        commitMessage: c.commitMessage,
        commitUrl: c.commitUrl,
        authorName: c.authorName,
        authorAvatarUrl: c.authorAvatarUrl,
        authorUrl: c.authorUrl,
        committedAt: c.committedAt.toISOString(),
      }));
    }

    // 2. FRESH FETCH: No commits for this repo yet.
    const commits = await fetchCommitsFromGitHubUsingOctokit(githubUrl, MAX_COMMITS_TO_STORE);
    await prisma.repoCommit.createMany({
      data: commits.map(c => ({
        repoId,
        commitHash: c.commitHash,
        commitMessage: c.commitMessage,
        commitUrl: c.commitUrl,
        authorName: c.authorName ?? "Unknown",
        authorAvatarUrl: c.authorAvatarUrl ?? DEFAULT_HUMAN_AVATAR,
        authorUrl: c.authorUrl ?? "",
        committedAt: new Date(c.committedAt ?? new Date().toISOString()),
      })),
    });
    return commits.slice(0, MAX_COMMITS_TO_STORE);
  } catch (error) {
    console.error("❌ Error in fetchAndReplaceCommits:", error);
    return [];
  }
}
// Retention: we always insert at most MAX_COMMITS_TO_STORE so explicit trimming is no longer required.

// Simple in-memory refresh rate limit per project (resets on server restart)
const lastRefreshAt = new Map<string, number>();
export class RateLimitError extends Error {
  constructor(public retryAfterMs: number) {
    super("Rate limited");
    this.name = "RateLimitError";
  }
}

export function canRefreshNow(projectId: string, windowMs = 30 * 1000) {
  const now = Date.now();
  const last = lastRefreshAt.get(projectId) ?? 0;
  const diff = now - last;
  const allowed = diff >= windowMs;
  return { allowed, retryAfterMs: allowed ? 0 : windowMs - diff };
}

export async function refreshCommitsWithRateLimit(projectId: string, windowMs = 30 * 1000) {
  const { allowed, retryAfterMs } = canRefreshNow(projectId, windowMs);
  if (!allowed) throw new RateLimitError(retryAfterMs);
  // Get repoId for this project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { repoId: true },
  });
  if (!project?.repoId) throw new Error("Repo not found for project");
  const existing = await prisma.repoCommit.findMany({
    where: { repoId: project.repoId },
    select: { commitHash: true },
  });
  const existingSet = new Set(existing.map(e => e.commitHash));
  const commits = await fetchAndReplaceCommits(projectId);
  const newCount = commits.filter(c => !existingSet.has(c.commitHash)).length;
  if (commits.length) lastRefreshAt.set(projectId, Date.now());
  return { commits, newCount };
}