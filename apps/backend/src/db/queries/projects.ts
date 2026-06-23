import { prisma } from "../client.js";
import type { Project } from "shared-types";

type PrismaMessage = Awaited<ReturnType<typeof prisma.message.findFirstOrThrow>>;

type PrismaProject = Awaited<ReturnType<typeof prisma.project.findFirstOrThrow>>;

function mapProject(row: PrismaProject): Project {
  return {
    id: row.id,
    name: row.name,
    sandboxId: row.sandboxId,
    previewUrl: row.previewUrl,
    sandboxStatus: row.sandboxStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export async function createProject(name: string, ownerId: string): Promise<Project> {
  const row = await prisma.project.create({
    data: { name, ownerId }
  });
  return mapProject(row);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const row = await prisma.project.findUnique({ where: { id } });
  return row ? mapProject(row) : null;
}

export async function listProjects(ownerId: string): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" }
  });
  return rows.map(mapProject);
}

export async function updateSandboxInfo(
  projectId: string,
  sandboxId: string | null,
  previewUrl: string | null,
  sandboxStatus: Project["sandboxStatus"]
): Promise<Project> {
  const row = await prisma.project.update({
    where: { id: projectId },
    data: { sandboxId, previewUrl, sandboxStatus }
  });
  return mapProject(row);
}