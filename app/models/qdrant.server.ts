// qdrant.server.ts
// To run locally:
// docker pull qdrant/qdrant
// docker run --name git-talk-container -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_data:/qdrant/storage qdrant/qdrant
// http://localhost:6333/dashboard
// Try not to re-run the 'docker run' command, use 'docker start git-talk-container'

import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
dotenv.config();
import { Document } from "@langchain/core/documents";

export const collection_name = process.env.COLLECTION_NAME;

// Instantiating Vector-DB client (For cloud)
export const qdrant_cloud = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// For local
export const qdrant = new QdrantClient({
  url: "http://localhost:6333",
});

// 1. Create Collection
export async function createCollection(collectionName: string) {
  try {
    const existing = await qdrant.getCollections();
    const alreadyExists = existing.collections.some(
      (c) => c.name === collectionName
    );

    if (alreadyExists) {
      console.log(`✅ Collection "${collectionName}" already exists.`);
      return;
    }

    await qdrant.createCollection(collectionName, {
      vectors: {
        size: 768,
        distance: "Cosine",
      },
    });

    console.log(`🆕 Created collection: ${collectionName}`);
  } catch (error) {
    console.error("❌ Failed to create collection:", error);
  }
}

// 2. Upsert Embedded Chunks
export async function upsertChunksToQdrant(
  documents: Document[],
  collectionName: string
) {
  const points = documents
    .map((doc) => {
      const vector = doc.metadata.embedding as number[] | undefined;
      const { projectId, userId, repo, source, language } = doc.metadata;

      if (!vector || !Array.isArray(vector)) {
        console.warn(`⚠️ Skipping document with missing embedding: ${source}`);
        return null;
      }

      return {
        id: crypto.randomUUID(),
        vector,
        payload: {
          pageContent: doc.pageContent,
          source,
          repo,
          projectId,
          userId,
          language,
        },
      };
    })
    .filter((point) => point !== null) as {
      id: string;
      vector: number[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: Record<string, any>;
    }[];

  if (points.length === 0) {
    console.warn("⚠️ No valid chunks to upsert.");
    return;
  }

  await qdrant.upsert(collectionName, { points });
  console.log(`✅ Upserted ${points.length} chunks to ${collectionName}`);
}

// 3. Delete by projectId
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
    console.log(`🗑️ Deleted all vectors for projectId: ${projectId}`);
  } catch (error) {
    console.error(`❌ Error deleting project ${projectId}:`, error);
  }
}

// 4. Search by query vector (optionally filter by repo)
export async function searchPointsInQdrant({
  collectionName,
  queryVector,
  topK = 10,
  repoUrl,
}: {
  collectionName: string;
  queryVector: number[];
  topK?: number;
  repoUrl?: string;
}) {
  const filter = repoUrl
    ? {
        must: [
          {
            key: "repo",
            match: { value: repoUrl },
          },
        ],
      }
    : undefined;

  const results = await qdrant.search(collectionName, {
    vector: queryVector,
    limit: topK,
    filter,
  });

  return results;
}
