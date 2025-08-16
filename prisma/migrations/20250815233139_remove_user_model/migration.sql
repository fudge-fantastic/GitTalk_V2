/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPreference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `userId` on the `Project` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserPreference";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "repoId" TEXT NOT NULL,
    "ragStatus" TEXT NOT NULL DEFAULT 'IDLE',
    "lastIndexedAt" DATETIME,
    "indexingError" TEXT,
    "vectorCount" INTEGER NOT NULL DEFAULT 0,
    "embeddingProvider" TEXT,
    "vectorStore" TEXT,
    CONSTRAINT "Project_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("createdAt", "description", "embeddingProvider", "id", "indexingError", "lastIndexedAt", "projectName", "ragStatus", "repoId", "updatedAt", "vectorCount", "vectorStore") SELECT "createdAt", "description", "embeddingProvider", "id", "indexingError", "lastIndexedAt", "projectName", "ragStatus", "repoId", "updatedAt", "vectorCount", "vectorStore" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
