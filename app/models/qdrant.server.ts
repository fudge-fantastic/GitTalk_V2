/* eslint-disable @typescript-eslint/no-explicit-any */
// qdrant.server.ts
// To run locally:
// docker pull qdrant/qdrant
// docker run --name git-talk-container -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_data:/qdrant/storage qdrant/qdrant
// http://localhost:6333/dashboard
// Try not to re-run the 'docker run' command, use 'docker start git-talk-container'

import dotenv from "dotenv";
dotenv.config();
import { QdrantClient } from "@qdrant/js-client-rest";
import { Document } from "@langchain/core/documents";

// Read collection name lazily; don't throw during module import so the app can run
export const getCollectionName = (): string | undefined => process.env.COLLECTION_NAME;

// Instantiating Vector-DB client (For cloud)
export const qdrant_cloud = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// For local (default)
export const qdrant = new QdrantClient({
  url: "http://localhost:6333",
});

// Health check helper for Qdrant
export async function pingQdrant(): Promise<boolean> {
  try {
    await qdrant.getCollections();
  return true;
  } catch (err) {
  const e: any = err;
  console.warn("⚠️ Qdrant ping failed:", e?.message ?? e);
    return false;
  }
}

// 1. Create Collection
export async function createCollection(collectionName: string) {
  try {
    if (!collectionName) {
      console.warn("⚠️ createCollection called without collectionName");
      return;
    }

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
        // Generating unique ID, find a fix for this
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
  const col = getCollectionName();
  if (!col) throw new Error("COLLECTION_NAME missing");

  // Be defensive: different versions of the Qdrant client expose different APIs.
  // Try the high-level methods first, then fall back to the HTTP REST endpoint.
  const client: any = qdrant;

  const filterBody = {
    filter: {
      must: [
        {
          key: "projectId",
          match: { value: projectId },
        },
      ],
    },
  };

  if (typeof client.delete === "function") {
    // Older convenience method signature: delete(collectionName, { filter })
    await client.delete(col as string, filterBody);
  } else if (client.points && typeof client.points.delete === "function") {
    // Some client variants use points.delete({ collection_name, filter })
    await client.points.delete({ collection_name: col, ...filterBody });
  } else {
    // Final fallback: call the HTTP REST API directly.
    const baseUrl = process.env.QDRANT_URL ?? "http://localhost:6333";
    const url = `${baseUrl.replace(/\/+$/, "")}/collections/${encodeURIComponent(col)}/points/delete`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filterBody),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "<no body>");
      throw new Error(`Qdrant HTTP delete failed: ${res.status} ${res.statusText} - ${text}`);
    }
  }

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
  scoreThreshold = 0.5, 
}: {
  collectionName: string;
  queryVector: number[];
  topK?: number;
  repoUrl?: string;
  scoreThreshold?: number; // Add it to the type definition
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
    score_threshold: scoreThreshold,
  });

  return results;
}
