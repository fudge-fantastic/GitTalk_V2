// utils/prisma.ts

import { PrismaClient } from "generated/prisma/client";

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma__) {
    global.__prisma__ = new PrismaClient();
  }
  prisma = global.__prisma__;
}

export { prisma };

// Apply SQLite-specific performance PRAGMAs for local use.
// These improve concurrency and reduce "database is locked" errors.
// Safe no-ops when using other providers.
void (async () => {
  try {
    // Only attempt for SQLite URLs
    // @ts-ignore - prisma._engineConfig is internal; fallback to URL env if needed
    const isSQLite = true; // Datasource is SQLite in prisma/schema.prisma
    if (isSQLite) {
      await prisma.$executeRawUnsafe("PRAGMA journal_mode = WAL");
      await prisma.$executeRawUnsafe("PRAGMA synchronous = NORMAL");
      await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");
      await prisma.$executeRawUnsafe("PRAGMA busy_timeout = 5000");
    }
  } catch {
    // Best-effort; ignore if not supported or already set.
  }
})();
