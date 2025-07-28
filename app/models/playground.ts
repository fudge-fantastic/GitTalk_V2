import dotenv from "dotenv";
import { deleteProjectFromCollection } from "./qdrant.server";
import { askQuestionsBasedOnCodebase } from "./gemini.server";
dotenv.config();

export async function run() {
  const projectId: string = "24afdab2-0e64-4677-9353-31a9583effa6";
  await deleteProjectFromCollection(projectId);
  console.log(`🗑️ Deleted all points for projectId=${projectId}`);
}

export async function test3() {
  const repoUrl = "https://github.com/fudge-fantastic/Machine_Learning";
  const question = "Could you please let me know which file has frad detection? and how it works?";

  const results = await askQuestionsBasedOnCodebase({
    userQuery: question,
    repoUrl,
  });

  console.log("🧠 Top results:");
  results.forEach((res, i) => {
    console.log(`#${i + 1}:`, res.payload?.summary);
    console.log(`Score: ${res.score?.toFixed(4)}`);
    console.log("----------");
  });
}

test3().catch((err) => console.error("❌ Pipeline failed:", err));
