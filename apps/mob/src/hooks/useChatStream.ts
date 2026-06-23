import { useCallback, useState } from "react";
import { streamMessage } from "../api/messages";
import { useProjectStore } from "../store/projectStore";
import type { Message } from "../types";

export function useChatStream(projectId: string) {
  const [error, setError] = useState<string | null>(null);

  const appendMessage = useProjectStore((s) => s.appendMessage);
  const setPreviewUrl = useProjectStore((s) => s.setPreviewUrl);
  const setGenerating = useProjectStore((s) => s.setGenerating);
  const setStatusText = useProjectStore((s) => s.setStatusText);

  const sendPrompt = useCallback(
    async (content: string) => {
      setError(null);
      setGenerating(true);
      setStatusText("Sending prompt");

      const store = useProjectStore.getState();

      const optimisticUserMessage: Message = {
        id: `temp-${Date.now()}`,
        projectId,
        role: "user",
        content,
        createdAt: new Date().toISOString()
      };
      appendMessage(optimisticUserMessage);
      const assistantId = `temp-ai-${Date.now()}`;
      appendMessage({
        id : assistantId,
        projectId,
        role : "assistant",
        content : "" ,
        createdAt : new Date().toISOString()
      })

      try {
        await streamMessage(projectId, content, (event) => {
          switch (event.type) {
            case "status":
              setStatusText(event.message ?? null);
              break;
            case "file_written":
              setStatusText(`Updated ${event.path}`);
              break;
            case "preview_ready":
              if (event.previewUrl) {
                setPreviewUrl(event.previewUrl);
              }
              break;
              case "message_chunk" : 
              case "token" :
              case "assistant_delta" : 
                 store.updateMessage(assistantId , event.content ?? "");
                 break
            case "error":
              setError(event.message ?? "Something went wrong");
              break;
            case "done":
              setStatusText(null);
              break;
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setGenerating(false);
      }
    },
    [projectId, appendMessage, setPreviewUrl, setGenerating, setStatusText]
  );

  return { sendPrompt, error };
}
