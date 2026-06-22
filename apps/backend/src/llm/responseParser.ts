import { z } from "zod";
import type { GenerateCodeResponse } from "shared-types";

const FileSchema = z.object({
  path: z.string().min(1),
  content: z.string()
});

const ResponseSchema = z.object({
  files: z.array(FileSchema).min(1),
  explanation: z.string().default("")
});

const ALLOWED_PREFIXES = ["src/", "index.html", "package.json", "vite.config.js"];

function isPathAllowed(path: string): boolean {
  if (path.includes("..")) return false;
  return ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export class InvalidModelResponseError extends Error {}

export function parseCodeGenResponse(raw: string): GenerateCodeResponse {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new InvalidModelResponseError("Model response was not valid JSON");
  }

  const parsed = ResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new InvalidModelResponseError(
      `Model response did not match expected shape: ${parsed.error.message}`
    );
  }

  const unsafeFiles = parsed.data.files.filter((f) => !isPathAllowed(f.path));
  if (unsafeFiles.length > 0) {
    throw new InvalidModelResponseError(
      `Model attempted to write disallowed paths: ${unsafeFiles.map((f) => f.path).join(", ")}`
    );
  }

  return parsed.data;
}
