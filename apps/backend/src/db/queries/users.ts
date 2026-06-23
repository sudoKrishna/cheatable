import { prisma } from "../client.js";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: string, passwordHash: string) {
  return prisma.user.create({
    data: { email, passwordHash }
  });
}