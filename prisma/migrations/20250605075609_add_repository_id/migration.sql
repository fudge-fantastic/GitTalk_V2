/*
  Warnings:

  - You are about to drop the column `description` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `githubToken` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `githubUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `RepoCommit` table. All the data in the column will be lost.
  - Added the required column `repositoryId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repositoryId` to the `RepoCommit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RepoCommit" DROP CONSTRAINT "RepoCommit_projectId_fkey";

-- DropIndex
DROP INDEX "RepoCommit_projectId_idx";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "description",
DROP COLUMN "githubToken",
DROP COLUMN "githubUrl",
ADD COLUMN     "repositoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RepoCommit" DROP COLUMN "projectId",
ADD COLUMN     "repositoryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "githubUrl" VARCHAR(2048) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_githubUrl_key" ON "Repository"("githubUrl");

-- CreateIndex
CREATE INDEX "RepoCommit_repositoryId_idx" ON "RepoCommit"("repositoryId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepoCommit" ADD CONSTRAINT "RepoCommit_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
