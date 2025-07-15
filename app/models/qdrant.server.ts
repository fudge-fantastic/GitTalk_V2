// qdrant.server.ts
// To run locally:
// docker pull qdrant/qdrant
// docker run -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_data:/qdrant/storage qdrant/qdrant
// http://localhost:6333/dashboard

import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv"; dotenv.config();
import { Document } from "@langchain/core/documents";

export const collection_name= process.env.COLLECTION_NAME;

// Instantiating Vector-DB client (For cloud)
export const qdrant_cloud = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// For local
export const qdrant = new QdrantClient({
  url: "http://localhost:6333",
})

// Create collection
export async function createCollection(collectionName: string) {
  try {
    const exists = await qdrant
      .getCollections()
      .then((res) => res.collections.some((c) => c.name === collectionName));

    if (!exists) {
      await qdrant.createCollection(collectionName, {
        vectors: {
          size: 768,
          distance: "Cosine",
        },
      });
      console.log("Collection created:", collectionName);
    }
  } catch (error) {
    console.error("Error creating collection:", error);
  }
}

// Upsert documents into Qdrant
export async function upsertSummarizedDocsToQdrant(
  documents: Document[],
  collectionName: string
) {
  const points = await Promise.all(
    documents.map(async (doc) => {
      // These should now come from metadata after caching check in loadGithubDocs
      const summary = doc.metadata.summary as string;
      const embedding = doc.metadata.embedding as number[]; // Now guaranteed to be there if coming from cache or newly generated

      if (!embedding) {
        console.error(`Document ${doc.metadata.source} has no embedding. Skipping.`);
        return null;
      }

      return {
        id: crypto.randomUUID(),
        vector: embedding,
        payload: {
          summary,
          source: doc.metadata.source,
          projectId: doc.metadata.projectId,
          userId: doc.metadata.userId,
          repo: doc.metadata.repo,
        },
      };
    })
  ).then((results) => results.filter((point) => point !== null));

  if (points.length > 0) {
    await qdrant.upsert(collectionName, { points });
    console.log(
      `✅ Upserted ${points.length} summarized documents to ${collectionName}`
    );
  } else {
    console.log("No valid documents to upsert after processing embeddings.");
  }
}

// Delete all points for a project
export async function deleteProjectFromCollection(projectId: string) {
  try {
    await qdrant.delete(collection_name as string, {
      filter: {
        must: [
          {
            key: "projectId",
            match: { value: projectId },
          },
        ],
      },
    });
    console.log(`🗑️ Deleted all points for projectId=${projectId}`);
  } catch (error) {
    console.error("❌ Deletion failed for projectId=", projectId, error);
  }
}