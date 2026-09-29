import fs from 'fs';
import path from 'path';

// Read stdin provided by pi-subagents
const input = fs.readFileSync(0, 'utf-8'); // Using 0 for stdin is safer
const { repoRoot, worktreePath } = JSON.parse(input);

const envSource = path.join(repoRoot, '.env');
const envTarget = path.join(worktreePath, '.env');

// Copy .env if it exists in the parent
if (fs.existsSync(envSource)) {
  fs.copyFileSync(envSource, envTarget);
}

const envWtSource = path.join(repoRoot, '.env.wt');
const envWtTarget = path.join(worktreePath, '.env.wt');

if (fs.existsSync(envWtSource)) {
  fs.copyFileSync(envWtSource, envWtTarget);
}

// Tell pi-subagents to exclude .env and .env.wt from diff/patch generation
console.log(JSON.stringify({ syntheticPaths: [".env", ".env.wt"] }));
