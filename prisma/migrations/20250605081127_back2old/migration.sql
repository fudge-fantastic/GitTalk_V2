/*
  Warnings:

  - You are about to drop the column `repositoryId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `repositoryId` on the `RepoCommit` table. All the data in the column will be lost.
  - You are about to drop the `Repository` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `githubUrl` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `RepoCommit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_repositoryId_fkey";

-- DropForeignKey
ALTER TABLE "RepoCommit" DROP CONSTRAINT "RepoCommit_repositoryId_fkey";

-- DropIndex
DROP INDEX "RepoCommit_repositoryId_idx";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "repositoryId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "githubUrl" VARCHAR(200) NOT NULL;

-- AlterTable
ALTER TABLE "RepoCommit" DROP COLUMN "repositoryId",
ADD COLUMN     "projectId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Repository";

-- AddForeignKey
ALTER TABLE "RepoCommit" ADD CONSTRAINT "RepoCommit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
