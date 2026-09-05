import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function findTests(dir) {
  /** @type {string[]} */
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...findTests(full));
    } else if (name.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

const files = findTests(join(root, 'src'));
if (files.length === 0) {
  console.log('No test files found under src/');
  process.exit(0);
}

const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...files], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
