// qdrant.server.ts
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv"; dotenv.config();
import { Document } from "@langchain/core/documents";
import { generateEmbeddingsForSummary } from "./gemini.server";

export const collection_name= process.env.COLLECTION_NAME;

// Instantiating Vector-DB client
export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

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
      const summary = doc.metadata.summary as string;
      let embedding: number[] | undefined;
      try {
        embedding = await generateEmbeddingsForSummary(summary);
      } catch (error) {
        console.error(
          `Failed to generate embedding for doc ${doc.metadata.source}:`,
          error
        );
        return null; // Decide how to handle this: skip the document, use a default embedding, etc. Return null to filter out this point later
      }

      if (!embedding) return null; 

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
  ).then((results) => results.filter((point) => point !== null)); // Filter out failed points

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