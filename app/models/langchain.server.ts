// langchain.server.ts
import dotenv from "dotenv";
dotenv.config();

import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import pLimit from "p-limit";

import {
  cleanCodeForEmbedding,
  detectLanguage,
  isSupportedLang,
  removeUnwanted,
  // truncateContext,
} from "~/utils/someFunctionsAndInterface";
import { ollamaEmbedding } from "./ollama.server";
import { ai } from "./gemini.server";
import { searchPointsInQdrant } from "./qdrant.server";

export async function loadGithubDocs(
  githubUrl: string,
  userId: string = "test-user",
  projectId: string = "test-project"
): Promise<Document[]> {
  console.log(`🔗 Loading GitHub repo: ${githubUrl}`);

  const loader = new GithubRepoLoader(githubUrl, {
    branch: "main",
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
    ignorePaths: removeUnwanted,
  });

  const rawDocs = await loader.load();
  console.log(`📄 Found ${rawDocs.length} files in ${githubUrl}`);

  const limit = pLimit(5); // Control concurrency
  const allChunks: Document[] = [];

  for (const doc of rawDocs) {
    const filePath = doc.metadata.source ?? "";
    const language = detectLanguage(filePath);

    const splitter = RecursiveCharacterTextSplitter.fromLanguage(
      isSupportedLang(language) ? language : "markdown",
      {
        chunkSize: 1200,
        chunkOverlap: 200,
      }
    );

    const chunks = await splitter.splitDocuments([doc]);

    const embeddedChunks = await Promise.all(
      chunks.map((chunk) =>
        limit(async () => {
          const cleaned = cleanCodeForEmbedding(chunk.pageContent);
          const embedding = await ollamaEmbedding(cleaned);

          return new Document({
            pageContent: chunk.pageContent,
            metadata: {
              source: filePath,
              repo: githubUrl,
              projectId,
              userId,
              language,
              embedding,
            },
          });
        })
      )
    );

    allChunks.push(...embeddedChunks);
  }

  console.log(`✅ Embedded and prepared ${allChunks.length} chunks.`);
  return allChunks;
}

export async function answerWithRAG({
  userQuery,
  repoUrl,
  topK = 10,
}: {
  userQuery: string;
  repoUrl: string;
  topK?: number;
}) {
  if (!userQuery?.trim() || !repoUrl?.trim()) {
    throw new Error("Missing or empty parameters: userQuery and repoUrl");
  }

  if (typeof topK !== "number" || topK <= 0) {
    throw new Error("topK must be a positive number");
  }

  try {
    const queryEmbedding = await ollamaEmbedding(userQuery);
    const searchResults = await searchPointsInQdrant({
      collectionName: process.env.COLLECTION_NAME!,
      queryVector: queryEmbedding,
      topK,
      repoUrl,
    });

    const contextChunks = searchResults
      .map((res) => res.payload?.pageContent)
      .filter(Boolean)
      .join("\n\n---\n\n");

    console.log(contextChunks);
    // const safeContext = truncateContext(contextChunks);
    const finalPrompt = `
      You are a senior software engineer tasked with answering questions based on a GitHub repository.
      Use the provided CONTEXT to answer the QUESTION. Be accurate, technical, and reference code when necessary.
      If the answer is not found in the context, reply clearly that it’s not available from the current codebase.
      Avoid assumptions. Respond concisely but clearly.

      ---

      CONTEXT START:
      ${contextChunks}
      CONTEXT END

      ---

      QUESTION:
      ${userQuery}`.trim();

    const result = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
    });
    for await (const chunk of result) {
      console.log(chunk.text);
    }
    // return result.response.text?.() || "[No response from Gemini]";
  } catch (err) {
    console.error("❌ RAG flow failed", { userQuery, repoUrl, error: err });
    throw new Error("RAG query failed");
  }
}