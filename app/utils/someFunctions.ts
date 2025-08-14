// someFunctionsAndInterface.ts
import crypto from "crypto";

export function isValidGitHubRepoUrl(url: string): boolean {
    const regex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/i;
    return regex.test(url.trim());
}

// Splits a GitHub URL into its owner and repo parts
export function extractOwnerRepo(url: string) {
  const parts = url.split("/");
  return { owner: parts[3], repo: parts[4] };
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

type SupportedLang =
  | "cpp" | "go" | "java" | "js" | "php" | "proto"
  | "python" | "rst" | "ruby" | "rust" | "scala"
  | "swift" | "markdown" | "latex" | "html" | "sol";

export function detectLanguage(filePath: string): SupportedLang | "text" {
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) return "js";
  if (filePath.endsWith(".js") || filePath.endsWith(".jsx")) return "js";
  if (filePath.endsWith(".py")) return "python";
  if (filePath.endsWith(".go")) return "go";
  if (filePath.endsWith(".java")) return "java";
  if (filePath.endsWith(".cpp") || filePath.endsWith(".cc") || filePath.endsWith(".h")) return "cpp";
  if (filePath.endsWith(".rs")) return "rust";
  if (filePath.endsWith(".sol")) return "sol";
  if (filePath.endsWith(".php")) return "php";
  if (filePath.endsWith(".html")) return "html";
  if (filePath.endsWith(".md")) return "markdown";
  return "text";
}

export function isSupportedLang(lang: string): lang is SupportedLang {
  return [
    "cpp", "go", "java", "js", "php", "proto", "python", "rst",
    "ruby", "rust", "scala", "swift", "markdown", "latex", "html", "sol",
  ].includes(lang);
}

export function cleanCodeForEmbedding(code: string): string {
  return code
    .replace(/\\n/g, "\n")                      // Convert escaped newlines
    .replace(/\\"/g, '"')                       // Convert escaped quotes
    .replace(/[ \t]+\n/g, "\n")                 // Trim trailing spaces
    .replace(/\n{3,}/g, "\n\n")                 // Collapse 3+ newlines to max 2
    .trim();                                    // Final trim
}


export function generateStableId(source: string, content: string): string {
  return crypto.createHash("sha256").update(source + content).digest("hex");
}

export function truncateContext(input: string, maxChars = 15000): string {
  return input.length > maxChars ? input.slice(0, maxChars) : input;
}

export function ragPrompt(contextChunks: string, userQuery: string) {
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

  return finalPrompt;
}