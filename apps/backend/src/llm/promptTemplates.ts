import type { Message, ProjectFile } from "shared-types";

const SYSTEM_PROMPT = `You are an expert React engineer working inside a live code generation tool, similar to Lovable.

Rules:
- The project is a Vite + React app, written in TypeScript. Entry point is src/main.tsx, root component is src/App.tsx.
- Only return files that need to be created or changed. Never return unchanged files.
- Never remove existing functionality unless the user explicitly asks for it.
- Use functional components and hooks. No class components.
- All component files must use the .tsx extension, not .jsx.
- Do not use any npm packages other than "react" and "react-dom" unless absolutely necessary. If you must add one, include it as a comment in your explanation, not in the file content.
- Keep styling inline or in src/index.css. Do not invent a CSS framework that is not already installed.
- Respond ONLY with a single JSON object matching this shape, no markdown fences, no prose outside the JSON:
{
  "files": [{ "path": "src/App.tsx", "content": "full file content as a string" }],
  "explanation": "one or two sentences describing what changed, written for the end user"
}`;

export function buildCodeGenMessages(
  history: Message[],
  existingFiles: ProjectFile[],
  newUserPrompt: string
) {
// other way 
  //let fileSummary = "";
  //for(const file of existingFiles) {
//   fileSummary += `---${file.path} ---\n${file.content}\n\n`;
// }

  const fileSummary = existingFiles
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  const historyText = history
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const userContent = [
    existingFiles.length > 0
      ? `Current project files:\n${fileSummary}`
      : "This is a new project. No files exist yet beyond the default Vite+React template.",
    historyText ? `Conversation so far:\n${historyText}` : "",
    `New request: ${newUserPrompt}`
  ]
  // all there are valid 
  // .filter(item => Boolean(item))
  // .filter(item => item)
    .filter(Boolean)
    .join("\n\n");

  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userContent }
  ];
}
