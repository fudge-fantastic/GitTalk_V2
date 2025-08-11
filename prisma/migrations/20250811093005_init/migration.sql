-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 100
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectName" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RepoCommit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commitHash" TEXT NOT NULL,
    "commitMessage" TEXT NOT NULL,
    "commitUrl" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorUrl" TEXT NOT NULL,
    "authorAvatarUrl" TEXT NOT NULL,
    "committedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "RepoCommit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SummarizedDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repoUrl" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "RepoCommit_commitHash_idx" ON "RepoCommit"("commitHash");

-- CreateIndex
CREATE UNIQUE INDEX "SummarizedDocument_contentHash_key" ON "SummarizedDocument"("contentHash");
