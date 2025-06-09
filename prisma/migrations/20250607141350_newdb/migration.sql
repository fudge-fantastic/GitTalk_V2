/*
  Warnings:

  - You are about to alter the column `description` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - Added the required column `commitUrl` to the `RepoCommit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "description" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "RepoCommit" ADD COLUMN     "commitUrl" TEXT NOT NULL;
