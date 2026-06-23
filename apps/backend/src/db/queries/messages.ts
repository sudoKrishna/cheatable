import { prisma } from "../client.js";
import type { Message, MessageRole } from "shared-types";

type PrismaMessage = Awaited<ReturnType<typeof prisma.message.findFirstOrThrow>>;

function mapMessage(row: PrismaMessage): Message {
  return {
    id: row.id,
    projectId: row.projectId,
    role: row.role as MessageRole,
    content: row.content,
    createdAt: row.createdAt.toISOString()
  };
}

export async function addMessage(
  projectId: string,
  role: MessageRole,
  content: string
): Promise<Message> {
  const row = await prisma.message.create({
    data: { projectId, role, content }
  });
  return mapMessage(row);
}

export async function listMessages(projectId: string): Promise<Message[]> {
  const rows = await prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" }
  });
  return rows.map(mapMessage);
}