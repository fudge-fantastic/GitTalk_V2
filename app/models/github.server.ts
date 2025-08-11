import { Octokit } from "octokit";
import dotenv from "dotenv";
import { prisma } from "~/db.server";
dotenv.config();

export const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
export type CommitResponse = {
  commitHash: string;
  commitMessage: string;
  commitUrl: string;
  authorName?: string;
  authorAvatarUrl?: string;
  authorUrl?: string;
  committedAt?: string;
};

const DEFAULT_HUMAN_AVATAR = "https://avatars.githubusercontent.com/u/583231?v=4";
const DEFAULT_BOT_AVATAR = "https://github.githubassets.com/images/modules/logos/github-mark.png";

// Configurable limits
// Keep only the latest 50 commits per project in DB (older ones trimmed automatically)
export const MAX_COMMITS_TO_STORE = 50;
// UI pagination size
export const DEFAULT_PAGE_SIZE = 10;

// Splits a GitHub URL into its owner and repo parts
function extractOwnerRepo(url: string) {
  const parts = url.split("/");
  return { owner: parts[3], repo: parts[4] };
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
  const { owner, repo } = extractOwnerRepo(githubUrl);

  // GitHub API returns max 100 per page – loop until we hit limit or run out
  const per_page = 100;
  const commits: CommitResponse[] = [];
  let page = 1;
  while (commits.length < limit) {
    const remaining = limit - commits.length;
    const pageSize = remaining < per_page ? remaining : per_page;
    const { data } = await octokit.rest.repos.listCommits({ owner, repo, per_page: pageSize, page });
    if (!data.length) break;
    for (const commit of data) {
      const isBot = commit.author?.type === "Bot";
      commits.push({
        commitHash: commit.sha,
        commitMessage: commit.commit.message,
        commitUrl: commit.html_url,
        authorName: commit.commit.author?.name || commit.author?.login || (isBot ? "GitHub Bot" : "Unknown"),
        authorAvatarUrl: commit.author?.avatar_url || (isBot ? DEFAULT_BOT_AVATAR : DEFAULT_HUMAN_AVATAR),
        authorUrl: commit.author?.html_url,
        committedAt: commit.commit.author?.date || new Date().toISOString(),
      });
    }
    if (data.length < pageSize) break; // no more pages
    page += 1;
  }
  console.log(`Octokit fetched ${commits.length} commits`);
  return commits;
}

export async function saveCommitsToDB(projectId: string, commits: CommitResponse[]) {
  // Fetch only commit hashes to minimize payload
  const existing = await prisma.repoCommit.findMany({
    where: { projectId },
    select: { commitHash: true },
  });
  const existingHashes = new Set(existing.map(c => c.commitHash));
  const newCommits = commits.filter(c => !existingHashes.has(c.commitHash));

  if (newCommits.length > 0) {
    await prisma.repoCommit.createMany({
      data: newCommits.map(commit => ({
        projectId,
        commitHash: commit.commitHash,
        commitMessage: commit.commitMessage,
        commitUrl: commit.commitUrl,
        authorName: commit.authorName ?? "Unknown",
        authorAvatarUrl: commit.authorAvatarUrl ?? DEFAULT_HUMAN_AVATAR,
        authorUrl: commit.authorUrl ?? "",
        committedAt: commit.committedAt ?? new Date().toISOString(),
      })),
    });
    console.log(`✅ Saved ${newCommits.length} new commits to DB.`);
  } else {
    console.log("✅ No new commits to save.");
  }

  // Retention: keep only the most recent MAX_COMMITS_TO_STORE commits
  // Delete older commits in one query (subquery to find cutoff)
  const surplus = await prisma.repoCommit.count({ where: { projectId } }) - MAX_COMMITS_TO_STORE;
  if (surplus > 0) {
    // Get ids of oldest surplus commits
    const oldest = await prisma.repoCommit.findMany({
      where: { projectId },
      orderBy: { committedAt: "desc" },
      skip: MAX_COMMITS_TO_STORE,
      select: { id: true },
    });
    const idsToDelete = oldest.map(o => o.id);
    if (idsToDelete.length) {
      await prisma.repoCommit.deleteMany({ where: { id: { in: idsToDelete } } });
      console.log(`🧹 Trimmed ${idsToDelete.length} old commits (retained latest ${MAX_COMMITS_TO_STORE}).`);
    }
  }
}

export async function getCommitsPage(projectId: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const take = pageSize;
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.repoCommit.findMany({
      where: { projectId },
      orderBy: { committedAt: "desc" },
      skip,
      take,
    }),
    prisma.repoCommit.count({ where: { projectId } }),
  ]);
  const commits: CommitResponse[] = items.map(commit => ({
    commitHash: commit.commitHash,
    commitMessage: commit.commitMessage,
    commitUrl: commit.commitUrl,
    authorName: commit.authorName ?? "Unknown",
    authorAvatarUrl: commit.authorAvatarUrl ?? DEFAULT_HUMAN_AVATAR,
    authorUrl: commit.authorUrl ?? "",
    committedAt: commit.committedAt.toISOString(),
  }));
  return { commits, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function fetchAndReplaceCommits(projectId: string) {
  const githubUrl = await getGithubUrl(projectId);
  if (!githubUrl) throw new Error("GitHub URL not found.");
  // Instead of blind delete, fetch fresh commits and then replace efficiently:
  const commits = await fetchCommitsFromGitHub(githubUrl, MAX_COMMITS_TO_STORE);
  // Simplest approach: wipe & insert (bounded set of 50)
  await prisma.repoCommit.deleteMany({ where: { projectId } });
  await saveCommitsToDB(projectId, commits);
  return commits.slice(0, DEFAULT_PAGE_SIZE); // first page
}

// Storing commits in DB 
export async function pollCommits(projectId: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  try {
    // If we already have commits, just paginate
    const count = await prisma.repoCommit.count({ where: { projectId } });
    if (count > 0) {
      // Ensure retention in case previous limit was higher
      if (count > MAX_COMMITS_TO_STORE) {
        const surplus = count - MAX_COMMITS_TO_STORE;
        const oldest = await prisma.repoCommit.findMany({
          where: { projectId },
          orderBy: { committedAt: "desc" },
          skip: MAX_COMMITS_TO_STORE,
          select: { id: true },
        });
        const idsToDelete = oldest.map(o => o.id);
        if (idsToDelete.length) {
          await prisma.repoCommit.deleteMany({ where: { id: { in: idsToDelete } } });
          console.log(`🧹 Trimmed ${idsToDelete.length} surplus commits (initial retention enforcement).`);
        }
        console.log(`Retention enforced. Surplus removed: ${surplus}`);
      }
      return await getCommitsPage(projectId, page, pageSize);
    }
    // Otherwise initial fetch
    const githubUrl = await getGithubUrl(projectId);
    if (!githubUrl) throw new Error("GitHub URL not found.");
    const commits = await fetchCommitsFromGitHub(githubUrl, MAX_COMMITS_TO_STORE);
    await saveCommitsToDB(projectId, commits);
    return await getCommitsPage(projectId, page, pageSize);
  } catch (error) {
    console.error("❌ Error polling commits:", error);
    return { commits: [], total: 0, page, pageSize, totalPages: 0 };
  }
}