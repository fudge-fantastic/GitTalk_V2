import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";

import dotenv from "dotenv";
import { generateEmbeddingsForSummary, summarizeCode } from "./llmIntegration.server";
import { prisma } from "~/db.server";
dotenv.config();

export async function loadGithubRepo(githubUrl: string, githubToken?: string) {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || process.env.GITHUB_ACCESS_TOKEN,
        branch: "main",
        ignoreFiles: [".gitignore", ],
        recursive: true,
        maxConcurrency: 10,
        unknown: "warn",
    });

    const docs = await loader.load();
    return docs
}

export async function indexGithubRepo(projectId: string, githubUrl: string, githubToken?: string) {
    const docs = await loadGithubRepo(githubUrl, githubToken);
    const embeddings = await generateEmbeddings(docs); 
    await Promise.allSettled(embeddings.map(async (embedding, index) => {
        console.log(`Processing ${index} of ${embeddings.length} embeddings`);
        if (!embedding) return console.log(`Failed to process ${index} of ${embeddings.length} embeddings`);

        const sourceCodeEmbedding = await prisma.sourceCodeEmbedding.create({
            data: {
                projectId,
                summary: embedding.summary,
                // embedding: embedding.embedding,
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName
            }
        })

        await prisma.$executeRaw`UPDATE "SourceCodeEmbedding" SET "summaryEmbedding" = ${embedding.embedding}::vector WHERE "id" = ${sourceCodeEmbedding.id}`
    }))
}

// Getting List of Documents and generating Embeddings
export async function generateEmbeddings(docs: Document[]) {
    return await Promise.all(docs.map(async doc => {
        const summary = await summarizeCode(doc);
        const embedding = await generateEmbeddingsForSummary(summary);
        return {
            summary, 
            embedding, 
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)), 
            fileName: doc.metadata.source
        };
    }))
}

console.log("Called from githubLoader.server.ts",await loadGithubRepo("https://github.com/fudge-fantastic/WordSmith"));