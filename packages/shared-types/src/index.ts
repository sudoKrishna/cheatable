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

// export type StreamEventType =
//   | "status"
//   | "file_written"
//   | "preview_ready"
//   | "error"
//   | "done"
//   | "message_chunk"
//   | "token"
//   | "assisant_delta"

export type StreamEvent =
  | { type: "status"; message?: string }
  | { type: "file_written"; path: string }
  | { type: "preview_ready"; previewUrl: string }
  | { type: "error"; message?: string }
  | { type: "done" }
  | { type: "message_chunk"; content: string }
  | { type: "token"; content: string }
  | { type: "assistant_delta"; content: string };



export interface CreateProjectRequest {
  name: string;
}

export interface SendMessageRequest {
  content: string;
}
