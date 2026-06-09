import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const viteEntry = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');

const tasks = [
  {
    name: 'client',
    command: process.execPath,
    args: [viteEntry, '--host', '0.0.0.0'],
  },
  {
    name: 'server',
    command: process.execPath,
    args: ['--watch', 'server/index.js'],
  },
];

const children = [];
let isStopping = false;

for (const task of tasks) {
  const child = spawn(task.command, task.args, {
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code) => {
    if (!isStopping && code && code !== 0) {
      console.error(`${task.name} exited with code ${code}`);
      stopAll();
      process.exit(code);
    }
  });

  children.push(child);
}

function stopAll() {
  isStopping = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});
