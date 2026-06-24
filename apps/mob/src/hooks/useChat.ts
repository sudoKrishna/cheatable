import { useState, useCallback } from "react";
import type { Message, StreamEvent } from "../types";
import { streamMessage, fetchMessages } from "../api/messages";

export function useChat(projectId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const loadMessages = useCallback(async () => {
    const msgs = await fetchMessages(projectId);
    setMessages(msgs);
  }, [projectId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: `temp-user-${Date.now()}`,
        projectId,
        role: "user",
        content,
        createdAt: new Date().toISOString()
      };

      const assistantId = `temp-assistant-${Date.now()}`;
      const assistantPlaceholder: Message = {
        id: assistantId,
        projectId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString()
      };

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setIsStreaming(true);

      const handleEvent = (event: StreamEvent) => {
        switch (event.type) {
          case "assistant_delta":
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + event.content }
                  : m
              )
            );
            break;

          case "status":
            // Optional: surface event.message somewhere (e.g. a small status line).
            break;

          case "file_written":
            break;

          case "preview_ready":
            break;

          case "error":
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content || `Error: ${event.message ?? "Something went wrong"}` }
                  : m
              )
            );
            break;

          case "done":
            setIsStreaming(false);
            loadMessages();
            break;
        }
      };

      try {
        await streamMessage(projectId, content, handleEvent);
      } catch (err) {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content || "Failed to get a response. Please try again." }
              : m
          )
        );
      }
    },
    [projectId, loadMessages]
  );

  return { messages, isStreaming, sendMessage, loadMessages };
}