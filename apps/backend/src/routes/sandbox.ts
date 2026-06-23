import { Router } from "express";
import { getProjectById, updateSandboxInfo } from "../db/queries/projects.js";
import { listFiles } from "../db/queries/files.js";
import { ensureSandboxRunning } from "../services/sandboxManager.js";
import { logger } from "../utils/logger.js";

export const sandboxRouter = Router();

sandboxRouter.post("/:projectId/start", async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const existingFiles = await listFiles(projectId);
    const result = await ensureSandboxRunning(project.sandboxId, existingFiles);

    const updated = await updateSandboxInfo(
      projectId,
      result.sandboxId,
      result.previewUrl,
      "running"
    );

    res.json({ project: updated, previewUrl: result.previewUrl });
  } catch (err) {
    logger.error("Failed to start sandbox", { error: String(err), projectId });
    await updateSandboxInfo(projectId, null, null, "error");
    res.status(500).json({ error: "Failed to start sandbox" });
  }
});

sandboxRouter.get("/:projectId/status", async (req, res) => {
  try {
    const project = await getProjectById(req.params.projectId);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json({
      sandboxStatus: project.sandboxStatus,
      previewUrl: project.previewUrl
    });
  } catch (err) {
    logger.error("Failed to get sandbox status", { error: String(err) });
    res.status(500).json({ error: "Failed to get sandbox status" });
  }
});
