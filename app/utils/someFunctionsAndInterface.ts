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

export { removeUnwanted, isValidGitHubRepoUrl, formatDate };