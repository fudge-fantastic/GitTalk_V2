/*
  Warnings:

  - A unique constraint covering the columns `[projectId,commitHash]` on the table `RepoCommit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RepoCommit_projectId_commitHash_key" ON "RepoCommit"("projectId", "commitHash");
