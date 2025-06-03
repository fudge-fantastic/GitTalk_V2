import { Octokit } from "octokit";
import dotenv from "dotenv";
import { prisma } from "~/db.server";
dotenv.config();

export const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
if (!octokit) {
  throw new Error("Error creating Octokit instance.");
} else {
  console.log("All good! Octokit instance created.");
}

export type commitResponse = {
  commitHash: string;
  commitMessage: string;
  commitUrl: string;
  authorName?: string;
  authorAvatarUrl?: string;
  authorUrl?: string;
  committedAt?: string;
};

// Stats : Working
export async function getCommitHashes(githubUrl: string): Promise<commitResponse[]> {
  // Fetching entire detail of the repository
  const { data } = await octokit.rest.repos.listCommits({
    owner: githubUrl.split("/")[3],
    repo: githubUrl.split("/")[4],
  });

  // console.log("Commits fetched from getCommitHashes function:", data);

  const DEFAULT_HUMAN_AVATAR = "https://avatars.githubusercontent.com/u/583231?v=4";
  const DEFAULT_BOT_AVATAR = "https://github.githubassets.com/images/modules/logos/github-mark.png";

  // Slicing the first 10 commits
  const slicedSortedCommits = data.slice(0, 10).map((commit) => {
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

  return slicedSortedCommits;
  // Returning Commits only, not being saved in the DB
}

// Fetching GitHub URL from the Database
export async function getGithubUrl(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        githubUrl: true,
      },
    });

    if (!project) {
      console.error("Project not found:", projectId);
      return { githubUrl: null };
    }

    // console.log("GitHub URL fetched from getGithubUrl function:", project.githubUrl);
    return { githubUrl: project?.githubUrl };
  } catch (error) {
    console.error("Error fetching GitHub URL:", error);
  }
}

export async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: commitResponse[]
) {
  try {
    const processedCommits = await prisma.repoCommit.findMany({
      where: { projectId },
      select: { commitHash: true },
    });

    const unprocessedCommits = commitHashes.filter((commit) => {
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash
      );
    });
    return unprocessedCommits;
  } catch (error) {
    console.error("Error fetching unprocessed commits:", error);
    return [];
  }
}

// Passing our project ID to the function. ProjectId example: "31952ad6-1ddf-4371-a7d9-e4a79bd3f5d8"
export async function pollCommits(projectId: string) {
  try {
    // Obtaining GitHub URL
    const githubUrl = (await getGithubUrl(projectId))?.githubUrl;
    if (!githubUrl) throw new Error("GitHub URL not found.");

    // Obtaining commit hashes from the GitHub URL
    const commitHashes = await getCommitHashes(githubUrl);

    // Filtering unprocessed commits
    // const unprocessedCommits = await filterUnprocessedCommits(
    //   projectId,
    //   commitHashes
    // );

    // Saving unprocessed commits
    // await saveCommits(projectId, unprocessedCommits);

    // console.log("POLLED COMMITS:", commitHashes);
    return commitHashes;
  } catch (error) {
    console.error("Error polling commits:", error);
  }
}

// export async function saveCommits(projectId: string, commitHashes: Response[]) {
//   const toCreate = commitHashes.map((commit) => ({
//     commitHash: commit.commitHash,
//     commitMessage: commit.commitMessage,
//     authorName: commit.authorName || "Unknown",
//     authorAvatarUrl: commit.authorAvatarUrl || "",
//     committedAt: new Date(commit.committedAt!),
//     projectId,
//   }));

//   const result = await prisma.repoCommit.createMany({
//     data: toCreate,
//   });

//   return result;
// }

// await pollCommits("31952ad6-1ddf-4371-a7d9-e4a79bd3f5d8").then(console.log);


// Testing
// (async () => {
//   try {
//     const commits = await getCommitHashes(
//       "https://github.com/fudge-fantastic/GenerativeAI"
//     );
//     console.log("Commits:", commits);

//     const githubUrl = await getGithubUrl(
//       "31952ad6-1ddf-4371-a7d9-e4a79bd3f5d8"
//     );
//     console.log("Project GitHub URL:", githubUrl);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// })();
