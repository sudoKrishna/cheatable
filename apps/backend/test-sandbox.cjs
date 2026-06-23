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
  await sandbox.commands.run('npm install', { timeoutMs: 120000 });
  console.log('npm install done.');

  console.log('Running npm run dev in FOREGROUND (a 15s TIMEOUT now means SUCCESS)...');
  try {
    const result = await sandbox.commands.run('npm run dev', { timeoutMs: 15000 });
    console.log('Exit code:', result.exitCode);
    console.log('STDOUT:', result.stdout);
    console.log('STDERR:', result.stderr);
  } catch (err) {
    console.log('Command threw:', err.name);
    console.log(JSON.stringify(err, null, 2));
  }

  console.log('Sandbox left alive for inspection:', sandbox.sandboxId);
})();
