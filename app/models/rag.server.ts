import { prisma } from "~/db.server";
import { loadGithubDocs } from "~/models/langchain.server";
import { upsertChunksToQdrant, pingQdrant, getCollectionName } from "~/models/qdrant.server";
import { ollamaEmbedding } from "~/models/ollama.server";

// Simple in-memory lock per project
const indexingLocks = new Map<string, Promise<unknown>>();
function withIndexLock<T>(projectId: string, fn: () => Promise<T>): Promise<T> {
  const running = indexingLocks.get(projectId) ?? Promise.resolve();
  const next = running.catch(() => undefined).then(fn) as Promise<T>;
  indexingLocks.set(projectId, next.finally(() => {
    if (indexingLocks.get(projectId) === next) indexingLocks.delete(projectId);
  }));
  return next;
}

export async function checkRagPrereqs() {
  const collection = getCollectionName();
  const qdrantOk = await pingQdrant();
  let embeddingsOk = false;
  try {
    // quick embedding health check
    const e = await ollamaEmbedding("health check ping");
    embeddingsOk = Array.isArray(e) && e.length > 0;
  } catch (err) {
    embeddingsOk = false;
  }

  return {
    collectionEnv: !!collection,
    qdrant: qdrantOk,
    embeddings: embeddingsOk,
    allReady: !!collection && qdrantOk && embeddingsOk,
  };
}

export async function getRagStatus(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { repo: true } });
  if (!project) return null;
  return {
    id: project.id,
  githubUrl: project.repo?.githubUrl,
    ragStatus: (project as any).ragStatus ?? "IDLE",
    lastIndexedAt: (project as any).lastIndexedAt ?? null,
    vectorCount: (project as any).vectorCount ?? 0,
    indexingError: (project as any).indexingError ?? null,
  };
}

export async function startIndexingProject(projectId: string, userId: string) {
  return withIndexLock(projectId, async () => {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { repo: true } });
    if (!project) throw new Error("Project not found");

    // Update DB state: INDEXING
    await prisma.project.update({ where: { id: projectId }, data: { ragStatus: "INDEXING", indexingError: null } as any });

    try {
      const prereqs = await checkRagPrereqs();
      if (!prereqs.allReady) {
        await prisma.project.update({ where: { id: projectId }, data: { ragStatus: "ERROR", indexingError: "Prerequisites not met" } as any });
        throw new Error("RAG prerequisites not satisfied");
      }

      const collection = getCollectionName() as string;
      // Load and embed docs (langchain.server handles embedding calls inside loadGithubDocs)
  if (!project.repo) throw new Error("Repo not associated with project");
  const docs = await loadGithubDocs(project.repo.githubUrl, userId, projectId);

      // Upsert to qdrant
      await upsertChunksToQdrant(docs, collection);

      // Update DB state: READY
      await prisma.project.update({ where: { id: projectId }, data: { ragStatus: "READY", lastIndexedAt: new Date(), vectorCount: docs.length } as any });
      return { success: true, count: docs.length };
    } catch (err: any) {
      const e = err?.message ?? String(err);
      await prisma.project.update({ where: { id: projectId }, data: { ragStatus: "ERROR", indexingError: e } as any });
      throw err;
    }
  });
}
