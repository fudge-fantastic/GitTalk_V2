import bcrypt from "bcryptjs";
import { prisma } from "~/db.server";

interface CreateUser {
    email: string;
    password: string;
    username: string;
}

// For Register
export async function createUser({ email, password, username }: CreateUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
    data: { email, password: hashedPassword, username },
  });
}

// For Login
export async function getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }