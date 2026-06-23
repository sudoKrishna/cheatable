import { Router } from "express";
import { z } from "zod";
import { createProject, getProjectById, listProjects } from "../db/queries/projects.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { logger } from "../utils/logger.js";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(120)
});

projectsRouter.get("/", async (req, res) => {
  try {
    const projects = await listProjects(req.userId!);
    res.json({ projects });
  } catch (err) {
    logger.error("Failed to list projects", { error: String(err) });
    res.status(500).json({ error: "Failed to list projects" });
  }
});

projectsRouter.get("/:id", async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json({ project });
  } catch (err) {
    logger.error("Failed to fetch project", { error: String(err) });
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

projectsRouter.post("/", async (req, res) => {
  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const project = await createProject(parsed.data.name, req.userId!);
    res.status(201).json({ project });
  } catch (err) {
    logger.error("Failed to create project", { error: String(err) });
    res.status(500).json({ error: "Failed to create project" });
  }
});