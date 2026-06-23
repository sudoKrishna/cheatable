import { prisma } from "../client.js";
import type { ProjectFile, GeneratedFile } from "shared-types";

type PrismaFile = Awaited<ReturnType<typeof prisma.projectFile.findFirstOrThrow>>;
// what this do ?
// mapfile() ka main purpose data transformation ok ek hi jagah centrilze karna hai
function mapFile(row: PrismaFile): ProjectFile {
  return {
    id: row.id,
    projectId: row.projectId,
    path: row.path,
    content: row.content,
    updatedAt: row.updatedAt.toISOString()
  };
}

export async function upsertFile(
  projectId: string,
  path: string,
  content: string
): Promise<ProjectFile> {
  const row = await prisma.projectFile.upsert({
    where: { projectId_path: { projectId, path } },
    create: { projectId, path, content },
    update: { content }
  });
  return mapFile(row);
}

export async function upsertFiles(
  projectId: string,
  files: GeneratedFile[]
): Promise<void> {
  await prisma.$transaction(
    files.map((file) =>
      prisma.projectFile.upsert({
        where: { projectId_path: { projectId, path: file.path } },
        create: { projectId, path: file.path, content: file.content },
        update: { content: file.content }
      })
    )
  );
}

export async function listFiles(projectId: string): Promise<ProjectFile[]> {
  const rows = await prisma.projectFile.findMany({
    where: { projectId },
    orderBy: { path: "asc" }
  });
  return rows.map(mapFile);
}