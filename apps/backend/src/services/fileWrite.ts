import type { GeneratedFile } from "shared-types";
import { upsertFiles } from "../db/queries/files.js";
import { applyFilesToSandbox } from "./sandboxManager.js";

export async function persistAndApplyFiles(
  projectId: string,
  sandboxId: string,
  files: GeneratedFile[]
): Promise<void> {
  await upsertFiles(projectId, files);
  await applyFilesToSandbox(sandboxId, files);
}
