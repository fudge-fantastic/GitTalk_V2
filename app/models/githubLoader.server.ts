// githubLoader.server.ts
import dotenv from "dotenv";
import weaviate from "weaviate-ts-client";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import {
  generateEmbeddingsForSummary,
  summarizeCode,
} from "./llmIntegration.server";
import { Document } from "@langchain/core/documents";
import { WeaviateStore } from "@langchain/weaviate";
dotenv.config();

const host = process.env.WEAVIATE_URL;
const apiKey = process.env.WEAVIATE_API_KEY;

if (!host || !apiKey) {
  throw new Error("Missing WEAVIATE_URL or WEAVIATE_API_KEY in .env");
}

class GeminiEmbeddings {
  async embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.all(
      texts.map(
        (text) => generateEmbeddingsForSummary(text) as Promise<number[]>
      )
    );
  }

  async embedQuery(text: string): Promise<number[]> {
    return generateEmbeddingsForSummary(text) as Promise<number[]>;
  }
}

// Instantiating Vector-DB client
const client = weaviate.client({
  // eslint-disable-next-line import/no-named-as-default-member
  apiKey: apiKey ? new weaviate.ApiKey(apiKey) : undefined,
  scheme: "https",
  host,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

// Returning bunch of documents
export async function loadGithubRepo(
  githubUrl: string,
  userId?: string,
  projectId?: string,
  githubToken?: string
): Promise<Document[]> {
  // Loading Github Repository
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || process.env.GITHUB_ACCESS_TOKEN,
    branch: "main",
    ignoreFiles: [".gitignore"],
    recursive: true,
    maxConcurrency: 5,
    unknown: "warn",
  });

  // Skipping Large Files
  const isBinaryOrLarge = (doc: Document) => {
    const contentSize = Buffer.byteLength(doc.pageContent, "utf-8");
    return (
      contentSize > 1000000 ||
      /(\.png|\.jpg|\.jpeg|\.gif|\.ico|\.exe|\.dll|\.bin|\.zip|\.tar|\.gz|\.pdf)$/i.test(
        doc.metadata.source || ""
      )
    );
  };

  const rawDocs = (await loader.load()).filter((doc) => !isBinaryOrLarge(doc));

  const documents = rawDocs.map(
    (doc) =>
      new Document({
        pageContent: doc.pageContent,
        metadata: {
          source: doc.metadata.source,
          userId,
          projectId,
          repo: githubUrl,
          // summary: try adding this here
        },
      })
  );
  return documents;
}

// Generating Embeddings (pipeline)
export async function generateEmbeddings(docs: Document[]) {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summarizeCode(doc);
      const embedding = await generateEmbeddingsForSummary(summary);
      doc.metadata.summary = summary;
      return {
        summary,
        embedding,
        sourceCode: doc.pageContent,
        fileName: doc.metadata.source,
      };
    })
  );
}

// Store in Weaviate
export async function storeInWeaviate(docs: Document[]) {
  const vectorStore = await WeaviateStore.fromDocuments(
    docs,
    new GeminiEmbeddings(),
    {
      client,
      indexName: "GitTalkRepoDocs",
    }
  );
  return vectorStore;
}

export async function deleteEmbeddingsForProject(projectId: string) {
  await client.data
    .deleter()
    .withClassName("GitTalkRepoDocs")
    .withWhere({
      path: ["projectId"],
      operator: "Equal",
      valueString: projectId,
    })
    .do();
}

// const docs = await loadGithubRepo("https://github.com/fudge-fantastic/WordSmith");
// console.log("Called from githubLoader.server.ts, Total Docs", docs[4]);
// console.log("Called from githubLoader.server.ts",await summarizeCode(docs[0]));