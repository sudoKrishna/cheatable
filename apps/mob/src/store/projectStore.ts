import { create } from "zustand";
import type { Message, Project } from "../types";

interface ProjectState {
  activeProject: Project | null;
  messages: Message[];
  isGenerating: boolean;
  statusText: string | null;
  setActiveProject: (project: Project | null) => void;
  setMessages: (messages: Message[]) => void;
  appendMessage: (message: Message) => void;
  setPreviewUrl: (previewUrl: string) => void;
  setGenerating: (isGenerating: boolean) => void;
  setStatusText: (statusText: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeProject: null,
  messages: [],
  isGenerating: false,
  statusText: null,

  setActiveProject: (project) => set({ activeProject: project }),

  setMessages: (messages) => set({ messages }),

  appendMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setPreviewUrl: (previewUrl) =>
    set((state) => ({
      activeProject: state.activeProject
        ? { ...state.activeProject, previewUrl }
        : state.activeProject
    })),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setStatusText: (statusText) => set({ statusText })
}));
