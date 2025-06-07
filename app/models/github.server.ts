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

function extractOwnerRepo(url: string) {
  const parts = url.split("/");
  return { owner: parts[3], repo: parts[4] };
}

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

export async function fetchCommitsFromGitHub(githubUrl: string): Promise<CommitResponse[]> {
  const { owner, repo } = extractOwnerRepo(githubUrl);

  const { data } = await octokit.rest.repos.listCommits({ owner, repo });
  return data.slice(0, 10).map(commit => {
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
    return;
  }

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


// Poll and store commits
export async function pollCommits(projectId: string): Promise<CommitResponse[] | undefined> {
  try {
    const githubUrl = await getGithubUrl(projectId);
    if (!githubUrl) throw new Error("GitHub URL not found.");

    const commits = await fetchCommitsFromGitHub(githubUrl);
    await saveCommitsToDB(projectId, commits);
    return commits;
  } catch (error) {
    console.error("❌ Error polling commits:", error);
    return undefined;
  }
}