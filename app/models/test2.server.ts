import dotenv from "dotenv";
import { collection_name, createCollection, deleteProjectFromCollection, upsertSummarizedDocsToQdrant } from "./qdrant.server";
import { loadGithubDocs } from "./test.server";
dotenv.config();

async function run() {
  const githubUrl = "https://github.com/fudge-fantastic/GitTalk_V2";
  const userId = "aaditya";
  const projectId = "git-talk-v2";

  if (!collection_name) {
    throw new Error("❌ COLLECTION_NAME is missing in .env");
  }

  await createCollection(collection_name);

  if (process.argv.includes("--clean")) {
    await deleteProjectFromCollection(projectId);
  }

  const docs = await loadGithubDocs(githubUrl, userId, projectId);
  await upsertSummarizedDocsToQdrant(docs, collection_name);
  
}

run().catch((err) => console.error("❌ Pipeline failed:", err));
