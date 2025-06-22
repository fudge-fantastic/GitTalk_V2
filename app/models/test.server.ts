/* eslint-disable @typescript-eslint/no-explicit-any */
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import weaviate, { ApiKey } from "weaviate-ts-client";
import { Document } from "@langchain/core/documents";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs/promises";
import { summarizeCode } from "./llmIntegration.server";

// import { WeaviateStore } from "@langchain/weaviate";
// import { gemini_embeddings } from "./llmIntegration.server";

const weaviate_host = process.env.WEAVIATE_URL;
const weaviate_apiKey = process.env.WEAVIATE_API_KEY;
if (!weaviate_host || !weaviate_apiKey) {
  throw new Error("Missing WEAVIATE_URL or WEAVIATE_API_KEY in .env");
} else {
  console.log("Weaviate APIs loaded successfully");
}

const weaviateClient = (weaviate as any).client({
  scheme: "https",
  host: weaviate_host,
  apiKey: new ApiKey(weaviate_apiKey),
});
if (!weaviateClient) {
  throw new Error("Failed to load Weaviate client");
} else {
  console.log("Weaviate client loaded successfully");
}

const removeUnwanted = ["*.md","*.json","*.yaml","*.yml","*.txt","*.log","*.lock","*.mdx","*.cjs",
      "LICENCE", "LICENSE",
      ".gitignore", ".gitattributes", ".editorconfig", ".DS_Store",
      "node_modules/", "dist/", "build/", "out/", "tmp/", "temp/", "coverage/",
      "*.test.ts", "*.spec.ts", "*.test.js", "*.spec.js",
]

export async function loadDocs(
  githubUrl: string,
  userId?: string,
  projectId?: string
): Promise<Document[]> {
  const loader = new GithubRepoLoader(githubUrl, {
    branch: "main",
    recursive: false,
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
  return final_documents;
}

// console.log(await loadDocs("https://github.com/fudge-fantastic/GitTalk_V2"));
// const result = await gemini_embeddings.embedQuery("Hello world fking world");
// console.log({ result, length: result.length });
