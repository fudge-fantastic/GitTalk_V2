// llmIntegration.server.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
import pThrottle from "p-throttle";
dotenv.config();

const gemini_apiKey = process.env.GEMINI_API_KEY;
if (!gemini_apiKey) {
  throw new Error("API key not found.");
}

const genAI = new GoogleGenerativeAI(gemini_apiKey);
export const gemini_model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export const gemini_embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: gemini_apiKey,
});

// Returns Summary of the commits (returns a string/text)
// Example: https://github.com/fudge-fantastic/WordSmith/commit/55fc71d0b18a2e297427d85dcc2850c2b682cf80
// https://github.com/fudge-fantastic/WordSmith/commit/<commitHash>.diff
export async function summarizeCommits(diffs: string): Promise<string> {
  const template = `You're an expert at summarizing code changes. Summarize the following Git diff:${diffs}`;
  try {
    const result = await gemini_model.generateContent(template);
    return result.response.text();
  } catch (error) {
    console.log("Error Summarizing commits", error);
    return "Summary Failed";
  }
}

const throttle = pThrottle({
  limit: 14,          // 14 requests
  interval: 80 * 1000 // ...per 80 seconds (1 minute, 20 seconds)
});
// Summarizing Code for each Document of a Github Repo
export const getSafeSummary = throttle(async (doc: Document) => {
  try {
    console.log("Getting Summary for:", doc.metadata.source);
    const code = doc.pageContent.slice(0, 10000); // Limiting to first 10,000 characters
    const response = await gemini_model.generateContent([
      `Explain the purpose of ${doc.metadata.source} file. Please provide a concise and detailed summary of the following code: ${code}`,
    ]);
    return response.response.text();
  } catch (error) {
    console.error("Error summarizing code:", error);
    return "Summary failed.";
  }
});


// Generates Embeddings for the summary (returns an array/vectors)
// result vs result.values in generateEmbeddingsForSummary:
// The GoogleGenerativeAIEmbeddings embedQuery method typically returns number[] directly. So, const embedding = result; return embedding.values; might be incorrect. 
export async function generateEmbeddingsForSummary(summary: string) {
  try {
    const result = await gemini_embeddings.embedQuery(summary);
    // const embedding = result; return embedding.values;
    return result;
  } catch (error) {
    console.log(
      "Error generating embeddings from generateEmbeddingsForSummary()",
      error
    );
    // Either throw error or return [], but returning empty array might cause trouble;
    // return undefined;
    throw error;
  }
}