import dotenv from "dotenv";
dotenv.config();
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import fs from "fs/promises";
import { summarizeCode } from "./gemini.server";

const removeUnwanted = [
  "*.md",
  "*.json",
  "*.yaml",
  "*.yml",
  "*.txt",
  "*.log",
  "*.lock",
  "*.mdx",
  "*.cjs",
  "LICENCE",
  "LICENSE",
  ".gitignore",
  ".gitattributes",
  ".editorconfig",
  ".DS_Store",
  "node_modules/",
  "dist/",
  "build/",
  "out/",
  "tmp/",
  "temp/",
  "coverage/",
  "*.test.ts",
  "*.spec.ts",
  "*.test.js",
  "*.spec.js",
];

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

  const rawDocs = await loader.load();
  const first_three_docs = rawDocs.slice(0, 3);

  // Wait for summaries and wrap in Document
  const final_documents = await Promise.all(
    first_three_docs.map(async (doc) => {
      const summary = await summarizeCode(doc);
      return new Document({
        pageContent: doc.pageContent,
        metadata: {
          source: doc.metadata.source,
          userId: userId ?? "test-user",
          projectId: projectId ?? "test-project",
          repo: githubUrl,
          summary: summary,
        },
      });
    })
  );

  // Save to file
  console.log("Saving to file");
  await fs.writeFile(
    "final_docs.json",
    JSON.stringify(final_documents, null, 2),
    "utf-8"
  );
  console.log("Saved to file");
  return final_documents;
}
