import dotenv from "dotenv";
import { deleteProjectFromCollection } from "./qdrant.server";
dotenv.config();

async function run() {
  const projectId: string = "24afdab2-0e64-4677-9353-31a9583effa6";
  await deleteProjectFromCollection(projectId);
  console.log(`🗑️ Deleted all points for projectId=${projectId}`);
}

run().catch((err) => console.error("❌ Pipeline failed:", err));
