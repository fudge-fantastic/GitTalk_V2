

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
  "generated/",
  "dist/",
  "build/",
  "out/",
  "tmp/",
  "temp/",
  "coverage/",
  ".ipynb_checkpoints/",
  "*.test.ts",
  "*.spec.ts",
  "*.test.js",
  "*.spec.js",
];

function isValidGitHubRepoUrl(url: string): boolean {
    const regex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/i;
    return regex.test(url.trim());
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export interface SingleProjectData {
    id: string;
    projectName: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    githubUrl: string;
}

export interface ProjectData {
  id: string;
  projectName: string;
  description: string;
  createdAt: string;
}

type SupportedLang =
  | "cpp" | "go" | "java" | "js" | "php" | "proto"
  | "python" | "rst" | "ruby" | "rust" | "scala"
  | "swift" | "markdown" | "latex" | "html" | "sol";

function detectLanguage(filePath: string): SupportedLang | "text" {
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

function isSupportedLang(lang: string): lang is SupportedLang {
  return [
    "cpp", "go", "java", "js", "php", "proto", "python", "rst",
    "ruby", "rust", "scala", "swift", "markdown", "latex", "html", "sol",
  ].includes(lang);
}

function cleanCodeForEmbedding(code: string): string {
  return code
    .replace(/\\n/g, "\n")                      // Convert escaped newlines
    .replace(/\\"/g, '"')                       // Convert escaped quotes
    .replace(/[ \t]+\n/g, "\n")                 // Trim trailing spaces
    .replace(/\n{3,}/g, "\n\n")                 // Collapse 3+ newlines to max 2
    .trim();                                    // Final trim
}

export { removeUnwanted, isValidGitHubRepoUrl, formatDate, detectLanguage, isSupportedLang, cleanCodeForEmbedding };