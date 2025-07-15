/*
  Warnings:

  - You are about to drop the `FileEmbeddingCache` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "FileEmbeddingCache";

-- CreateTable
CREATE TABLE "SummarizedDocument" (
    "id" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SummarizedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SummarizedDocument_contentHash_key" ON "SummarizedDocument"("contentHash");
