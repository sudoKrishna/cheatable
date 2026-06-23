import { apiGet, getApiBaseUrl } from "./client";
import type { Message, StreamEvent } from "../types";

export async function fetchMessages(projectId: string): Promise<Message[]> {
  const data = await apiGet<{ messages: Message[] }>(`/api/messages/${projectId}`);
  return data.messages;
}

export async function streamMessage(
  projectId: string,
  content: string,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/messages/${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to start message stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.replace(/^data:\s*/, "").trim();
      if (!trimmed) continue;
      try {
        const event: StreamEvent = JSON.parse(trimmed);
        onEvent(event);
      } catch {
        
      }
    }
  }
}
