import { useState } from "react";

function isValidGitHubRepoUrl(url: string): boolean {
  const regex = /^https:\/\/github\.com\/([\w-]+)\/([\w.-_]+)(\/)?$/i;
  return regex.test(url.trim());
}

export default function TestForm() {
  const [input, setInput] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">GitHub Repo URL Validator</h1>
      <input
        type="text"
        className="border px-2 py-1 mt-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter GitHub repo URL"
      />
      <button
        className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
        onClick={() => setValid(isValidGitHubRepoUrl(input))}
      >
        Check
      </button>
      {valid !== null && (
        <p className="mt-2 text-lg">
          {valid ? "✅ Valid GitHub Repo URL" : "❌ Invalid URL"}
        </p>
      )}
    </div>
  );
}
