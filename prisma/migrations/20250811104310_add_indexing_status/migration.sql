-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectName" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "indexingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "indexingError" TEXT,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("createdAt", "description", "githubUrl", "id", "projectName", "updatedAt", "userId") SELECT "createdAt", "description", "githubUrl", "id", "projectName", "updatedAt", "userId" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
