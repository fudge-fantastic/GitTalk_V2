import { prisma } from "~/db.server";

// Single-user local mode only: expose just ensureLocalUser
export const LOCAL_USER_ID = "local-user";
const LOCAL_USER_EMAIL = "local@localhost";
const LOCAL_USER_NAME = "Local User";

export async function ensureLocalUser() {
  const existing = await prisma.user.findUnique({ where: { id: LOCAL_USER_ID } });
  if (existing) return existing;
  try {
    return await prisma.user.create({
      data: {
        id: LOCAL_USER_ID,
        email: LOCAL_USER_EMAIL,
        username: LOCAL_USER_NAME,
        password: "local-mode", // plain placeholder; no real auth in single-user mode
        credits: 100,
      },
    });
  } catch (e) {
    const after = await prisma.user.findUnique({ where: { id: LOCAL_USER_ID } });
    if (!after) throw e;
    return after;
  }
}

export async function getCurrentUser() {
  return ensureLocalUser();
}