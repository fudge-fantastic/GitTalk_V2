import { Octokit } from "octokit";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error(
    "GitHub token not found. Please set GITHUB_TOKEN environment variable."
  );
}

export const octokit = new Octokit({ auth: GITHUB_TOKEN });
if (!octokit) {
  throw new Error("Error creating Octokit instance.");
}

type Response = {
  commitHash: string;
  commitMessage: string;
  authorName?: string;
  authorAvatarUrl?: string;
  committedAt?: string;
};

export async function getCommitHashes(githubUrl: string): Promise<Response[]> { 
  // Fetching entire detail of the repository
  const { data } = await octokit.rest.repos.listCommits({
    owner: githubUrl.split("/")[3],
    repo: githubUrl.split("/")[4],
  })

  // Filtering data
  const responses = data.map(commit => ({
    commitHash: commit.sha,
    commitMessage: commit.commit.message,
    authorName: commit.commit.author?.name,
    authorAvatarUrl: commit.author?.avatar_url,
    committedAt: commit.commit.author?.date
  }))

  console.log("data", responses);
  return responses;
}

console.log("All good! Octokit instance created.");
getCommitHashes("https://github.com/fudge-fantastic/GenerativeAI")
console.log("Process Completed!");
