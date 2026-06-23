import { apiGet, apiPost } from "./client";
import type { Project } from "../types";

export async function fetchProjects(): Promise<Project[]> {
  const data = await apiGet<{ projects: Project[] }>("/api/projects");
  return data.projects;
}

export async function fetchProject(projectId: string): Promise<Project> {
  const data = await apiGet<{ project: Project }>(`/api/projects/${projectId}`);
  return data.project;
}

export async function createProject(name: string): Promise<Project> {
  const data = await apiPost<{ project: Project }>("/api/projects", { name });
  return data.project;
}

export async function startSandbox(projectId: string): Promise<{ previewUrl: string }> {
  return apiPost<{ previewUrl: string }>(`/api/sandbox/${projectId}/start`, {});
}
