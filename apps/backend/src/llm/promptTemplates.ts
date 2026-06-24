import type { Message, ProjectFile } from "shared-types";

const BASE_RULES = `You are an expert React engineer working inside a live code generation tool, similar to Lovable.

Rules:
- The project is a Vite + React app, written in TypeScript. Entry point is src/main.tsx, root component is src/App.tsx.
- Only return files that need to be created or changed. Never return unchanged files.
- Never remove existing functionality unless the user explicitly asks for it.
- Use functional components and hooks. No class components.
- All component files must use the .tsx extension, not .jsx.
- Do not use any npm packages other than "react" and "react-dom" unless absolutely necessary.
- Keep styling inline or in src/index.css. Do not invent a CSS framework that is not already installed.`;

function buildSharedContext(
  history: Message[],
  existingFiles: ProjectFile[],
  newUserPrompt: string
) {
  const fileSummary = existingFiles
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  const historyText = history
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  return [
    existingFiles.length > 0
      ? `Current project files:\n${fileSummary}`
      : "This is a new project. No files exist yet beyond the default Vite+React template.",
    historyText ? `Conversation so far:\n${historyText}` : "",
    `New request: ${newUserPrompt}`
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildExplanationMessages(
  history: Message[],
  existingFiles: ProjectFile[],
  newUserPrompt: string
) {
  const systemPrompt = `${BASE_RULES}

You are currently in the EXPLANATION phase. Do not write any code or JSON.
Respond with plain conversational text only, as if you are a senior engineer
talking the user through what you are about to build and why.
If relevant, mention setup/terminal commands (npm install, npm run dev) in plain text.
Keep it concise -- a few sentences to a short paragraph. Do not use markdown headers.`;

  const userContent = buildSharedContext(history, existingFiles, newUserPrompt);

  return [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userContent }
  ];
}

export function buildFilesMessages(
  history: Message[],
  existingFiles: ProjectFile[],
  newUserPrompt: string,
  explanation: string
) {
  const systemPrompt = `${BASE_RULES}

You are currently in the FILE GENERATION phase. You already gave the user this explanation:
"""
${explanation}
"""

Now respond ONLY with a single JSON object matching this shape, no markdown fences, no prose outside the JSON:
{
  "files": [{ "path": "src/App.tsx", "content": "full file content as a string" }]
}`;

  const userContent = buildSharedContext(history, existingFiles, newUserPrompt);

  return [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userContent }
  ];
}