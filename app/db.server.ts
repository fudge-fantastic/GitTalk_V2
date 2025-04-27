/* eslint-disable no-var */
import { PrismaClient } from "generated/prisma/client";

let prisma: PrismaClient;

// Prevent multiple instances in development
declare global {
  var __db: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
  }
  prisma = global.__db;
}

export { prisma };
