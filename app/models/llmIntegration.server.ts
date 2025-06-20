// llmIntegration.server.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import dotenv from "dotenv";
dotenv.config();

// eslint-disable-next-line no-undef
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("API key not found.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export const embeddignModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

// Returns Summary of the commits (returns a string/text)
export async function summarizeCommits(diffs: string): Promise<string> {
  // Example: https://github.com/fudge-fantastic/WordSmith/commit/55fc71d0b18a2e297427d85dcc2850c2b682cf80
  // https://github.com/fudge-fantastic/WordSmith/commit/<commitHash>.diff

  const template = `You're an expert at summarizing code changes. Summarize the following Git diff:${diffs}`;

  try {
    const result = await model.generateContent(template);
    return result.response.text();
  } catch (error) {
    console.log("Error Summarizing commits", error);
    return "Summary Failed";
  }
}

// Summarizing Code for each Document of a Github Repo
export async function summarizeCode(doc: Document): Promise<string> {
  try {
    console.log("Getting Summary for", doc.metadata.source);
    const code = doc.pageContent.slice(0, 10000);
    const response = await model.generateContent([
      `You're an intelligent senior software engineer who specialises in onboarding junior software engineers onto the projects and explaining them the purpose of the ${doc.metadata.source} file. Please provide a detailed and concise summary of the following code: ${code}`,
    ]);
    return response.response.text();
  } catch (error) {
    console.log("Error Summarizing code from summarizeCode()", error);
    return "Summary Failed, from summarizeCode()";
  }
}

// Generates Embeddings for the summary (returns an array/vectors)
export async function generateEmbeddingsForSummary(summary: string) {
  try {
    const result = await embeddignModel.embedContent(summary);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.log(
      "Error generating embeddings from generateEmbeddingsForSummary()",
      error
    );
    return "Embeddings Failed from generateEmbeddingsForSummary()";
  }
}

// console.log(await generateEmbeddingsForSummary("The quick brown fox jumps over the lazy dog."));
