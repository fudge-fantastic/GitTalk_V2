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

export async function summarizeCommits(diffs: string): Promise<string> {
  // Example: https://github.com/fudge-fantastic/WordSmith/commit/55fc71d0b18a2e297427d85dcc2850c2b682cf80
  // https://github.com/fudge-fantastic/WordSmith/commit/<commitHash>.diff

  const exampleDiff = `
    - Modified index.html to update meta tags for SEO.
    - Added new CSS file: light-605318cbe3a1.css.
    - Removed unused JavaScript functions from utils.js.`;

  const template = `You're an expert at summarizing code changes. Below is a diff of recent code changes. Please provide a neat and concise summary. Ensure to use neat format, for example, if the diff is: ${exampleDiff}
    A good summary might look like:
    * Updated meta tags in index.html for better SEO.
    * Added new light theme stylesheet.
    * Removed obsolete functions from utils.js.
    Now, please summarize the following diff: ${diffs}`;

  try {
    const result = await model.generateContent(template);
    return result.response.text();
  } catch (error) {
    console.log("Error Summarizing commits", error);
    return "Summary Failed";
  }
}

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

export async function generateEmbeddingsForSummary(summary: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  try {
    const result = await model.embedContent(summary);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.log("Error generating embeddings from generateEmbeddings()", error);
    return "Embeddings Failed from generateEmbeddings()";
  }
}

console.log(await generateEmbeddingsForSummary("The quick brown fox jumps over the lazy dog."));