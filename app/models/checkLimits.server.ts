import { Octokit } from "@octokit/core";
import dotenv from "dotenv";
dotenv.config();

async function checkRateLimit() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    const { data: rateLimit } = await octokit.request('GET /rate_limit');

    console.log("GitHub API Rate Limit Information:");
    console.log(`Core Limit: ${rateLimit.resources.core.limit}`);
    console.log(`Core Remaining: ${rateLimit.resources.core.remaining}`);
    console.log(`Core Reset: ${new Date(rateLimit.resources.core.reset * 1000)}`); // Convert reset time from seconds to milliseconds

    console.log(`Search Limit: ${rateLimit.resources.search.limit}`);
    console.log(`Search Remaining: ${rateLimit.resources.search.remaining}`);
    console.log(`Search Reset: ${new Date(rateLimit.resources.search.reset * 1000)}`);

  } catch (error) {
    console.error("Error fetching rate limit:", error);
  }
}

checkRateLimit();