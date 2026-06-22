export type SandboxStatus = "idle" | "creating" | "running" | "error" | "stopped";

export interface Project {
  id: string;
  name: string;
  sandboxId: string | null;
  previewUrl: string | null;
  sandboxStatus: SandboxStatus;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  projectId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  updatedAt: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GenerateCodeRequest {
  projectId: string;
  prompt: string;
}

export interface GenerateCodeResponse {
  files: GeneratedFile[];
  explanation: string;
}

export interface SandboxRunResult {
  previewUrl: string;
  sandboxId: string;
}

export type StreamEventType =
  | "status"
  | "file_written"
  | "preview_ready"
  | "error"
  | "done";

export interface StreamEvent {
  type: StreamEventType;
  message?: string;
  path?: string;
  previewUrl?: string;
}

export interface CreateProjectRequest {
  name: string;
}

export interface SendMessageRequest {
  content: string;
}
