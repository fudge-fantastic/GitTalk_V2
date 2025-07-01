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
export async function fetchCommitsFromGitHub(githubUrl: string): Promise<CommitResponse[]> {
  const { owner, repo } = extractOwnerRepo(githubUrl);

  const { data } = await octokit.rest.repos.listCommits({ owner, repo, per_page: 10 });
  // console.log(data);
  if (octokit) console.log("Octokit triggered");
  return data.map(commit => {
    const isBot = commit.author?.type === "Bot";
    return {
      commitHash: commit.sha,
      commitMessage: commit.commit.message,
      commitUrl: commit.html_url,
      authorName: commit.commit.author?.name || commit.author?.login || (isBot ? "GitHub Bot" : "Unknown"),
      authorAvatarUrl: commit.author?.avatar_url || (isBot ? DEFAULT_BOT_AVATAR : DEFAULT_HUMAN_AVATAR),
      authorUrl: commit.author?.html_url,
      committedAt: commit.commit.author?.date || new Date().toISOString(),
    };
  });
}

export async function saveCommitsToDB(projectId: string, commits: CommitResponse[]) {
  const existing = await prisma.repoCommit.findMany({
    where: { projectId },
    select: { commitHash: true },
  });

  const existingHashes = new Set(existing.map(c => c.commitHash));
  const newCommits = commits.filter(c => !existingHashes.has(c.commitHash));

  if (newCommits.length === 0) {
    console.log("✅ No new commits to save.");
  } else {
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
      skipDuplicates: true,
    });

    console.log(`✅ Saved ${newCommits.length} new commits to DB.`);
  }
}

export async function getLatestCommits(projectId: string) {
  const latestCommits = await prisma.repoCommit.findMany({
    where: { projectId },
    // select: { commitHash: true },
    orderBy: { committedAt: "desc" },
    take: 20
  });
  const result : CommitResponse[] = []
  latestCommits.forEach((commit) => {
    result.push({
      commitHash: commit.commitHash,
      commitMessage: commit.commitMessage,
      commitUrl: commit.commitUrl,
      authorName: commit.authorName ?? "Unknown",
      authorAvatarUrl: commit.authorAvatarUrl ?? DEFAULT_HUMAN_AVATAR,
      authorUrl: commit.authorUrl ?? "",
      committedAt: commit?.committedAt.toString() || new Date().toISOString(),
    })
  })
  return result;
}

// Storing commits in DB 
export async function pollCommits(projectId: string): Promise<CommitResponse[] | undefined> {
  try {
    const githubUrl = await getGithubUrl(projectId);
    if (!githubUrl) throw new Error("GitHub URL not found.");

    // Getting commits from DB if they exist
    const commits = await getLatestCommits(projectId);
    if(commits && commits?.length > 0){
      return commits;
    }else{
      // Else, fetching commits from GitHub, saving them to DB and returning
      const commits = await fetchCommitsFromGitHub(githubUrl);
      await saveCommitsToDB(projectId, commits);
      return commits;
    }
  } catch (error) {
    console.error("❌ Error polling commits:", error);
    return undefined;
  }
}