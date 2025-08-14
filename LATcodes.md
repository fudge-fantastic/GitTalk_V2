### QDRANT demo

```tsx
import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: "",
  apiKey: "",
});

try {
  const result = await client.getCollections();
  console.log("List of collections:", result.collections);
} catch (err) {
  console.error("Could not get collections:", err);
}
```

### Gemini Code:

```tsx
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
```

```tsx
const result = await gemini_model.generateContent({
  contents: [
    {
      role: "user",
      parts: [{ text: finalPrompt }],
    },
  ],
});
return result.response.text?.() || "[No response from Gemini]";
```

```tsx
const contextChunks = searchResults
  .map((res) => res.payload?.pageContent)
  .filter(Boolean)
  .join("\n\n---\n\n");

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

const result = await ai.models.generateContentStream({
  model: "gemini-2.0-flash",
  contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
});
for await (const chunk of result) {
  console.log(chunk.text);
}
    // return result.response.text?.() || "[No response from Gemini]";

```