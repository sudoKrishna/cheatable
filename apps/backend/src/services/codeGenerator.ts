import type { GeneratedFile, Message, ProjectFile } from "shared-types";
import { buildExplanationMessages, buildFilesMessages } from "../llm/promptTemplates.js";
import { streamExplanation, callFileGenModel } from "../llm/openaiClient.js";
import { parseFilesResponse } from "../llm/responseParser.js";

export interface GenerateCodeResult {
  explanation: string;
  files: GeneratedFile[];
}

export async function generateCode(
  history: Message[],
  existingFiles: ProjectFile[],
  newUserPrompt: string,
  onExplanationChunk: (chunk: string) => void
): Promise<GenerateCodeResult> {
  const explanationMessages = buildExplanationMessages(history, existingFiles, newUserPrompt);
  const explanation = await streamExplanation(explanationMessages, onExplanationChunk);

  const filesMessages = buildFilesMessages(history, existingFiles, newUserPrompt, explanation);
  const raw = await callFileGenModel(filesMessages);
  const files = parseFilesResponse(raw);

  return { explanation, files };
}