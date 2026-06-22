import { useCallback, useEffect, useState } from "react";
import { fetchProject, startSandbox } from "../api/projects";
import { fetchMessages } from "../api/messages";
import { useProjectStore } from "../store/projectStore";

export function useProject(projectId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const setMessages = useProjectStore((s) => s.setMessages);
  const setPreviewUrl = useProjectStore((s) => s.setPreviewUrl);
  const activeProject = useProjectStore((s) => s.activeProject);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [project, messages] = await Promise.all([
        fetchProject(projectId),
        fetchMessages(projectId)
      ]);
      setActiveProject(project);
      setMessages(messages);

      if (!project.previewUrl) {
        const { previewUrl } = await startSandbox(projectId);
        setPreviewUrl(previewUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, setActiveProject, setMessages, setPreviewUrl]);

  useEffect(() => {
    load();
  }, [load]);

  return { project: activeProject, isLoading, error, reload: load };
}
