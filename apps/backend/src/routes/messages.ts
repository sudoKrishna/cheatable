import { Router } from "express";
import { z } from "zod";
import { addMessage, listMessages } from "../db/queries/messages.js";
import { listFiles } from "../db/queries/files.js";
import { getProjectById, updateSandboxInfo } from "../db/queries/projects.js";
import { ensureSandboxRunning } from "../services/sandboxManager.js";
import { generateCode } from "../services/codeGenerator.js";
import { persistAndApplyFiles } from "../services/fileWrite.js";
import { InvalidModelResponseError } from "../llm/responseParser.js";
import { logger } from "../utils/logger.js";
import type { StreamEvent } from "shared-types";

export const messagesRouter = Router();

const SendMessageSchema = z.object({
  content: z.string().min(1).max(4000)
});

messagesRouter.get("/:projectId", async (req, res) => {
  try {
    const messages = await listMessages(req.params.projectId);
    res.json({ messages });
  } catch (err) {
    logger.error("Failed to list messages", { error: String(err) });
    res.status(500).json({ error: "Failed to list messages" });
  }
});

function sendEvent(res: import("express").Response, event: StreamEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

messagesRouter.post("/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const parsed = SendMessageSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      sendEvent(res, { type: "error", message: "Project not found" });
      res.end();
      return;
    }

    await addMessage(projectId, "user", parsed.data.content);
    sendEvent(res, { type: "status", message: "Preparing sandbox" });

    const existingFiles = await listFiles(projectId);
    const sandboxResult = await ensureSandboxRunning(project.sandboxId, existingFiles);
    await updateSandboxInfo(projectId, sandboxResult.sandboxId, sandboxResult.previewUrl, "running");

    sendEvent(res, { type: "status", message: "Generating code" });
    const history = await listMessages(projectId);
    const generation = await generateCode(history, existingFiles, parsed.data.content);

    sendEvent(res, { type: "status", message: "Applying changes" });
    await persistAndApplyFiles(projectId, sandboxResult.sandboxId, generation.files);

    for (const file of generation.files) {
      sendEvent(res, { type: "file_written", path: file.path });
    }

    await addMessage(projectId, "assistant", generation.explanation);

    sendEvent(res, {
      type: "preview_ready",
      previewUrl: sandboxResult.previewUrl
    });

    sendEvent(res, { type: "done" });
    res.end();
  } catch (err) {
    const message =
      err instanceof InvalidModelResponseError
        ? `Model produced an invalid response: ${err.message}`
        : "Failed to process message";

    logger.error("Failed to process message", { error: String(err), projectId });
    sendEvent(res, { type: "error", message });
    res.end();
  }
});
