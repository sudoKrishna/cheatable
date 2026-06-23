require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sandbox } = require('e2b');

const TEMPLATE_DIR = path.join('src', 'sandboxTemplates', 'react-vite');

function readTemplateFiles(dir, relativeTo) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(relativeTo, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      files.push(...readTemplateFiles(fullPath, relativePath));
    } else {
      files.push({ path: relativePath.split(path.sep).join('/'), content: fs.readFileSync(fullPath, 'utf-8') });
    }
  }
  return files;
}

(async () => {
  const sandbox = await Sandbox.create({ timeoutMs: 300000 });
  console.log('Sandbox created:', sandbox.sandboxId);

  const files = readTemplateFiles(TEMPLATE_DIR, '');
  for (const file of files) {
    await sandbox.files.write(file.path, file.content);
  }
  console.log('Files written. Running npm install...');
  const install = await sandbox.commands.run('npm install', { timeoutMs: 120000 });
  console.log('npm install exitCode:', install.exitCode);

  console.log('Starting npm run dev with background:true (matching real sandboxManager.ts)...');
  const bgHandle = await sandbox.commands.run('npm run dev', { background: true });
  console.log('Background command issued. Handle:', JSON.stringify(bgHandle, null, 2));

  console.log('Waiting 5s...');
  await new Promise(r => setTimeout(r, 5000));

  const host = sandbox.getHost(5173);
  console.log('Trying to reach:', 'https://' + host);
  try {
    const res = await fetch('https://' + host, { signal: AbortSignal.timeout(15000) });
    console.log('Status:', res.status);
  } catch (err) {
    console.log('Fetch failed:', err.message);
  }

  console.log('Checking for vite/node process...');
  const ps = await sandbox.commands.run('ps aux');
  console.log(ps.stdout);

  console.log('Sandbox left alive:', sandbox.sandboxId);
})();
