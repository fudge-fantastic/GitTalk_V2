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
  "*.test.ts",
  "*.spec.ts",
  "*.test.js",
  "*.spec.js",
];

function isValidGitHubRepoUrl(url: string): boolean {
    const regex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/i;
    return regex.test(url.trim());
}


export { removeUnwanted, isValidGitHubRepoUrl };