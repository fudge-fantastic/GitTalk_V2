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
} from "~/utils/someFunctionsAndInterface";
import { ollamaEmbeddingsForSummary } from "./ollama.server";

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
        chunkSize: 1000,
        chunkOverlap: 200,
      }
    );

    const chunks = await splitter.splitDocuments([doc]);

    const embeddedChunks = await Promise.all(
      chunks.map((chunk) =>
        limit(async () => {
          const cleaned = cleanCodeForEmbedding(chunk.pageContent);
          const embedding = await ollamaEmbeddingsForSummary(cleaned);

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

// Made changes here, deal with Caching Strategy
// Added a working dialogue
