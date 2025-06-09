import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";

import dotenv from "dotenv";
import { generateEmbeddingsForSummary, summarizeCode } from "./llmIntegration.server";
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