import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Force production so hosts that set NODE_ENV=development (or other values) do not
// break `next build` with the App Router /404 Html prerender error.
const result = spawnSync('next', ['build'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
  },
});

process.exit(result.status ?? 1);
