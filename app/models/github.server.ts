import { Octokit } from "octokit";
import dotenv from "dotenv";
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error(
    "GitHub token not found. Please set GITHUB_TOKEN environment variable."
  );
} else {
  console.log("All good! Github token found.");
}

export const octokit = new Octokit({ auth: GITHUB_TOKEN });
if (!octokit) {
  throw new Error("Error creating Octokit instance.");
} else {
  console.log("All good! Octokit instance created.");
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
  });

  // Sorting data in descending order
  const sortedCommits = data.sort((a, b) => {
    const dateA = b.commit.author?.date;
    const dateB = a.commit.author?.date;
    if (dateA && dateB) {
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    } else {
      // Handle the case where one or both dates are undefined
      return 0;
    }
  });

  // Slicing the first 10 commits
  const slicedSortedCommits = sortedCommits.slice(0, 10).map((commit) => ({
    commitHash: commit.sha,
    commitMessage: commit.commit.message,
    authorName: commit.commit.author?.name,
    authorAvatarUrl: commit.author?.avatar_url,
    committedAt: commit.commit.author?.date,
  }));

  console.log("Process Completed!");
  console.log("Data", slicedSortedCommits);
  return slicedSortedCommits;
}

getCommitHashes("https://github.com/fudge-fantastic/GenerativeAI");
