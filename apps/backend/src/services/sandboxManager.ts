import { Sandbox } from "e2b";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { GeneratedFile, ProjectFile, SandboxRunResult } from "shared-types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, "..", "sandboxTemplates", "react-vite");
const DEV_SERVER_PORT = 5173;
const SANDBOX_TIMEOUT_MS = 10 * 60 * 1000;

interface SandboxHandle {
  sandbox: Sandbox;
  sandboxId: string;
}

function readTemplateFiles(): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  function walk(dir: string, relativeTo: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if(entry.name ===  "node_modules" || entry.name === "dist" || entry.name === ".git") {
        continue
      }
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(relativeTo, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, relativePath);
      } else {
        files.push({
          path: relativePath.split(path.sep).join("/"),
          content: fs.readFileSync(fullPath, "utf-8")
        });
      }
    }
  }

  walk(TEMPLATE_DIR, "");
  return files;
}

async function writeFilesToSandbox(sandbox: Sandbox, files: GeneratedFile[]) {
  for (const file of files) {
    await sandbox.files.write(file.path, file.content);
  }
}

async function installAndStartDevServer(sandbox: Sandbox) {
  console.log("[installAndStartDevServer] starting npm install...");
  const install = await sandbox.commands.run("npm install", {
    timeoutMs: 120_000
  });
  console.log("[installAndStartDevServer] npm install exitCode:", install.exitCode);
  if (install.exitCode !== 0) {
    throw new Error(`npm install failed: ${install.stderr}`);
  }

  console.log("[installAndStartDevServer] starting npm run dev (background)...");
  await sandbox.commands.run("npm run dev", {
    background: true
  });
  console.log("[installAndStartDevServer] npm run dev command issued, waiting 2s...");

  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("[installAndStartDevServer] done waiting.");
}

export async function createSandboxForProject(): Promise<SandboxRunResult> {
  console.log("[createSandboxForProject] calling Sandbox.create...");
  const sandbox = await Sandbox.create({
    timeoutMs: SANDBOX_TIMEOUT_MS
  });
  console.log("[createSandboxForProject] sandbox created:", sandbox.sandboxId);

  console.log("[createSandboxForProject] reading template files...");
  const templateFiles = readTemplateFiles();
  console.log("[createSandboxForProject] read", templateFiles.length, "files. writing to sandbox...");
  await writeFilesToSandbox(sandbox, templateFiles);
  console.log("[createSandboxForProject] files written. calling installAndStartDevServer...");

  await installAndStartDevServer(sandbox);
  console.log("[createSandboxForProject] installAndStartDevServer complete.");

  const host = sandbox.getHost(DEV_SERVER_PORT);
  const previewUrl = `https://${host}`;
  console.log("[createSandboxForProject] returning previewUrl:", previewUrl);

  return { previewUrl, sandboxId: sandbox.sandboxId };
}
export async function resumeSandbox(sandboxId: string): Promise<SandboxHandle | null> {
  try {
    const sandbox = await Sandbox.connect(sandboxId);
    const isRunning = await sandbox.isRunning();
    if (!isRunning) {
      return null;
    }
    return { sandbox, sandboxId };
  } catch {
    return null;
  }
}

export async function recreateSandboxFromFiles(
  existingFiles: ProjectFile[]
): Promise<SandboxRunResult> {
  const sandbox = await Sandbox.create({
    timeoutMs: SANDBOX_TIMEOUT_MS
  });

  const templateFiles = readTemplateFiles();
  await writeFilesToSandbox(sandbox, templateFiles);

  const overrides: GeneratedFile[] = existingFiles.map((f) => ({
    path: f.path,
    content: f.content
  }));
  await writeFilesToSandbox(sandbox, overrides);

  await installAndStartDevServer(sandbox);

  const host = sandbox.getHost(DEV_SERVER_PORT);
  const previewUrl = `https://${host}`;

  return { previewUrl, sandboxId: sandbox.sandboxId };
}

export async function applyFilesToSandbox(
  sandboxId: string,
  files: GeneratedFile[]
): Promise<void> {
  const handle = await resumeSandbox(sandboxId);
  if (!handle) {
    throw new Error(`Sandbox ${sandboxId} is not running, cannot apply files`);
  }
  await writeFilesToSandbox(handle.sandbox, files);
}

export async function ensureSandboxRunning(
  sandboxId: string | null,
  existingFiles: ProjectFile[]
): Promise<SandboxRunResult> {
  console.log("[ensureSandboxRunning] sandboxId:", sandboxId, "existingFiles:", existingFiles.length);

  if (sandboxId) {
    console.log("[ensureSandboxRunning] trying resumeSandbox for", sandboxId);
    const handle = await resumeSandbox(sandboxId);
    console.log("[ensureSandboxRunning] resumeSandbox returned:", handle ? "a handle" : "null");
    if (handle) {
      const host = handle.sandbox.getHost(DEV_SERVER_PORT);
      return { previewUrl: `https://${host}`, sandboxId: handle.sandboxId };
    }
  }

  if (existingFiles.length > 0) {
    console.log("[ensureSandboxRunning] calling recreateSandboxFromFiles");
    return recreateSandboxFromFiles(existingFiles);
  }

  console.log("[ensureSandboxRunning] calling createSandboxForProject");
  return createSandboxForProject();
}
