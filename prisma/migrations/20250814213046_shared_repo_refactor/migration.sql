/*
  Warnings:

  - You are about to drop the `SummarizedDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `githubUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `indexingStatus` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `RepoCommit` table. All the data in the column will be lost.
  - Added the required column `repoId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repoId` to the `RepoCommit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SummarizedDocument_contentHash_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SummarizedDocument";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Repo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "ragStatus" TEXT NOT NULL DEFAULT 'IDLE',
    "lastIndexedAt" DATETIME,
    "indexingError" TEXT,
    "vectorCount" INTEGER NOT NULL DEFAULT 0,
    "embeddingProvider" TEXT,
    "vectorStore" TEXT,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("createdAt", "description", "id", "indexingError", "projectName", "updatedAt", "userId") SELECT "createdAt", "description", "id", "indexingError", "projectName", "updatedAt", "userId" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_RepoCommit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commitHash" TEXT NOT NULL,
    "commitMessage" TEXT NOT NULL,
    "commitUrl" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorUrl" TEXT NOT NULL,
    "authorAvatarUrl" TEXT NOT NULL,
    "committedAt" DATETIME NOT NULL,
    "repoId" TEXT NOT NULL,
    CONSTRAINT "RepoCommit_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RepoCommit" ("authorAvatarUrl", "authorName", "authorUrl", "commitHash", "commitMessage", "commitUrl", "committedAt", "id") SELECT "authorAvatarUrl", "authorName", "authorUrl", "commitHash", "commitMessage", "commitUrl", "committedAt", "id" FROM "RepoCommit";
DROP TABLE "RepoCommit";
ALTER TABLE "new_RepoCommit" RENAME TO "RepoCommit";
CREATE INDEX "RepoCommit_commitHash_idx" ON "RepoCommit"("commitHash");
CREATE INDEX "RepoCommit_repoId_committedAt_idx" ON "RepoCommit"("repoId", "committedAt");
CREATE UNIQUE INDEX "RepoCommit_repoId_commitHash_key" ON "RepoCommit"("repoId", "commitHash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Repo_githubUrl_key" ON "Repo"("githubUrl");
