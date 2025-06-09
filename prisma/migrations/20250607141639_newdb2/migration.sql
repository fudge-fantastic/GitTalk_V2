/*
  Warnings:

  - Added the required column `authorUrl` to the `RepoCommit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RepoCommit" ADD COLUMN     "authorUrl" TEXT NOT NULL;
