import dotenv from "dotenv";
dotenv.config();
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import fs from "fs/promises";
import {
  generateEmbeddingsForSummary,
  summarizeCode,
} from "./llmIntegration.server";
import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export async function createCollection(collectionName: string) {
  try {
    const exists = await qdrant
      .getCollections()
      .then((res) => res.collections.some((c) => c.name === collectionName));

    if (!exists) {
      await qdrant.createCollection(collectionName, {
        vectors: {
          size: 768,
          distance: "Cosine",
        },
      });
      console.log("Collection created:", collectionName);
    }
  } catch (error) {
    console.error("Error creating collection:", error);
  }
}

// Find a better way to index the IDs
export async function upsertSummarizedDocsToQdrant(
  documents: Document[],
  collectionName: string
) {
  const points = await Promise.all(
    documents.map(async (doc, index) => {
      const summary = doc.metadata.summary as string;
      let embedding: number[] | undefined; // Or handle the error directly
      try {
        embedding = await generateEmbeddingsForSummary(summary);
      } catch (error) {
        console.error(
          `Failed to generate embedding for doc ${doc.metadata.source}:`,
          error
        );
        return null; // Decide how to handle this: skip the document, use a default embedding, etc. Return null to filter out this point later
      }

      if (!embedding) return null; 

      return {
        id: `${doc.metadata.projectId}-${index}`,
        vector: embedding,
        payload: {
          summary,
          source: doc.metadata.source,
          projectId: doc.metadata.projectId,
          userId: doc.metadata.userId,
          repo: doc.metadata.repo,
        },
      };
    })
  ).then((results) => results.filter((point) => point !== null)); // Filter out failed points

  if (points.length > 0) {
    await qdrant.upsert(collectionName, { points });
    console.log(
      `✅ Upserted ${points.length} summarized documents to ${collectionName}`
    );
  } else {
    console.log("No valid documents to upsert after processing embeddings.");
  }
}

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

export async function loadGithubDocs(
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
  console.log("Saved to file");
  return final_documents;
}

// console.log(await addDocsToWeaviate("https://github.com/fudge-fantastic/GitTalk_V2"));
// const result = await gemini_embeddings.embedQuery("Hello world fking world");
// console.log({ result, length: result.length });
// Note this: langchain and vector DB are completely not associated.
// Here we're loading docs USING langchain. It's not nescessary to use Langchain + vectorDB. We can use vector DB without Langchain.
