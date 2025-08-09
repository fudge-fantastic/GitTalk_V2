import dotenv from "dotenv";
dotenv.config();
import {
  createCollection,
  deleteProjectFromCollection,
  upsertChunksToQdrant,
  collection_name,
  searchPointsInQdrant,
} from "./qdrant.server";
import { getUserQueryAndRelevantPoints, loadGithubDocs } from "./langchain.server";
import { ollamaEmbedding } from "./ollama.server";


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
  const queryEmbedding = await ollamaEmbedding(testQuery);

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
  try {
    const result = await getUserQueryAndRelevantPoints({
      userQuery:
        "Where is the post creation form? How can I access it? How can I improve it?",
      repoUrl: "https://github.com/fudge-fantastic/WordSmith",
    });

    console.log("🔍 Search Results:");
    console.log(result);
  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

// test2().catch((err) => console.error("❌ Pipeline failed:", err));
// run().catch((err) => console.error("❌ Pipeline failed:", err));
// test3().catch((err) => console.error("❌ Pipeline failed:", err));
// Do not store chunk in Chunktype but smart chunking
