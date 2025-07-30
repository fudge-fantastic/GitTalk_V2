import dotenv from "dotenv";
import { createCollection, deleteProjectFromCollection, searchPointsInQdrant, upsertChunksToQdrant, collection_name } from "./qdrant.server";
import { askQuestionsBasedOnCodebase } from "./gemini.server";
import { loadGithubDocs } from "./langchain.server";
import { ollamaEmbeddingsForSummary } from "./ollama.server";
dotenv.config();

export async function run() {
  const projectId: string = "test-project";
  await deleteProjectFromCollection(projectId);
  console.log(`🗑️ Deleted all points for projectId=${projectId}`);
}

export async function test2() {
  const COLLECTION_NAME = collection_name as string;
  const githubUrl = "https://github.com/sidpandagle/timesheet-manager-backend"; 
  const projectId = "test-project";
  const userId = "test-user";

  await createCollection(COLLECTION_NAME);
  const docs = await loadGithubDocs(githubUrl, userId, projectId);
  await upsertChunksToQdrant(docs, COLLECTION_NAME);

  const testQuery = "How is backend implemented?";
  const queryEmbedding = await ollamaEmbeddingsForSummary(testQuery);

  const results = await searchPointsInQdrant({
    collectionName: COLLECTION_NAME,
    queryVector: queryEmbedding,
    topK: 10,
    repoUrl: githubUrl,
  });

  console.log("🔍 Search Results:");
  results.forEach((r, i) => {
    console.log(`\n--- Result ${i + 1} ---`);
    console.log("Score:", r.score);
    console.log("Chunk:", r.payload?.pageContent);
  });
}


export async function test3() {
  const repoUrl = "https://github.com/fudge-fantastic/QueryForge";
  const question = "How is qdrant implemented?";

  const results = await askQuestionsBasedOnCodebase({
    userQuery: question,
    repoUrl,
  });

  console.log("🧠 Top results:");
  results.forEach((res, i) => {
    console.log(`#${i + 1}:`, res.payload?.pageContent);
    console.log(`Score: ${res.score?.toFixed(4)}`);
    console.log("----------");
  });
}

test2().catch((err) => console.error("❌ Pipeline failed:", err));
// run().catch((err) => console.error("❌ Pipeline failed:", err));
// test3().catch((err) => console.error("❌ Pipeline failed:", err));
// Do not store chunk in Chunktype but smart chunking