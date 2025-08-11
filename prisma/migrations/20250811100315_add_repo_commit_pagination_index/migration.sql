-- CreateIndex
CREATE INDEX "RepoCommit_projectId_committedAt_idx" ON "RepoCommit"("projectId", "committedAt");
