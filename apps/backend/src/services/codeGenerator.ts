import type { GenerateCodeResponse, Message, ProjectFile } from "shared-types";
import { buildCodeGenMessages } from "../llm/promptTemplates.js";
import { callCodeGenModel } from "../llm/openaiClient.js";
import { parseCodeGenResponse } from "../llm/responseParser.js";

export async function generateCode(
  history: Message[],
  existingFiles: ProjectFile[],
  newUserPrompt: string
): Promise<GenerateCodeResponse> {
  const messages = buildCodeGenMessages(history, existingFiles, newUserPrompt);
  const raw = await callCodeGenModel(messages);
  return parseCodeGenResponse(raw);
}
