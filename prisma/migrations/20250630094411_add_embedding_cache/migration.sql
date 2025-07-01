-- CreateTable
CREATE TABLE "FileEmbeddingCache" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileEmbeddingCache_pkey" PRIMARY KEY ("id")
);
