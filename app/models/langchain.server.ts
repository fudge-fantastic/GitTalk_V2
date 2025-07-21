import dotenv from "dotenv";
dotenv.config();
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
// import fs from "fs/promises";
import { ollamaEmbeddingsForSummary } from "./ollama.server";
import { removeUnwanted } from "~/utils/someFunctions";
import { getSafeSummary } from "./gemini.server";

// Langchain's + Github API
export async function loadGithubDocs(
  githubUrl: string,
  userId?: string,
  projectId?: string
): Promise<Document[]> {

  const loader = new GithubRepoLoader(githubUrl, {
    branch: "main",
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
    ignorePaths: removeUnwanted,
  });

  console.log("Loading files from GitHub repository...");
  const rawDocs = await loader.load();
  console.log(`Found ${rawDocs.length} documents. Starting processing...`);

  // Process every document, but the throttle ensures the API calls are spaced out
  const finalDocuments = await Promise.all(
    rawDocs.map(async (doc) => {
      // Each of these calls will wait its turn in the throttle queue
      const summary = await getSafeSummary(doc);
      const embedding = await ollamaEmbeddingsForSummary(summary);

      return new Document({
        pageContent: doc.pageContent,
        metadata: {
          source: doc.metadata.source,
          userId: userId ?? "test-user",
          projectId: projectId ?? "test-project",
          repo: githubUrl,
          summary,
          embedding,
        },
      });
    })
  );

  console.log("All documents processed successfully!");
  return finalDocuments;
}


// Made changes here, deal with Caching Strategy