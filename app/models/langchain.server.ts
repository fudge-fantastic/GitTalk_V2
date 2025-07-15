import dotenv from "dotenv";
dotenv.config();
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
// import fs from "fs/promises";
import { generateEmbeddingsForSummary, summarizeCode } from "./gemini.server";
import crypto from "crypto";
import { prisma } from "~/db.server";

const removeUnwanted = [
  "*.md",
  "*.db",
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


export function hashContent(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}


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
  const firstDocs = rawDocs.slice(0, 15);

  // Hash each doc content and collect hashes
  const contentHashes = firstDocs.map((doc) => hashContent(doc.pageContent));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hashToDoc = new Map<string, any>();
  firstDocs.forEach((doc, i) => hashToDoc.set(contentHashes[i], doc));

  // Fetch from cache
  const cachedDocs = await prisma.summarizedDocument.findMany({
    where: {
      contentHash: {
        in: contentHashes,
      },
    },
  });

  const cacheMap = new Map(cachedDocs.map((c) => [c.contentHash, c]));

  const final_documents = await Promise.all(
    contentHashes.map(async (hash) => {
      const doc = hashToDoc.get(hash);
      const cached = cacheMap.get(hash);

      let summary: string;
      let embedding: number[];

      if (cached) {
        summary = cached.summary;
        embedding = cached.embedding as number[];
      } else {
        summary = await summarizeCode(doc); // Gemini
        embedding = await generateEmbeddingsForSummary(summary); // Gemini

        await prisma.summarizedDocument.create({
          data: {
            repoUrl: githubUrl,
            filePath: doc.metadata.source,
            contentHash: hash,
            summary,
            embedding,
          },
        });
      }

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

  return final_documents;
}


// Made changes here, deal with Caching Strategy