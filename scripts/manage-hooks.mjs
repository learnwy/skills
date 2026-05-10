#!/usr/bin/env node
import { readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const SKILLS_DIR = join(REPO_ROOT, 'skills');

const action = process.argv[2] || 'install';
if (action !== 'install' && action !== 'uninstall') {
  console.error(`Usage: node scripts/manage-hooks.mjs <install|uninstall>`);
  process.exit(1);
}

const hookSkills = readdirSync(SKILLS_DIR).filter((name) => {
  const hooksJson = join(SKILLS_DIR, name, 'hooks.json');
  const cliPath = join(SKILLS_DIR, name, 'scripts', 'cli.cjs');
  return existsSync(hooksJson) && existsSync(cliPath);
});

if (hookSkills.length === 0) {
  console.log('No skills with hooks.json found.');
  process.exit(0);
}

let failures = 0;
for (const skill of hookSkills) {
  const cli = join(SKILLS_DIR, skill, 'scripts', 'cli.cjs');
  const hooksJson = join(SKILLS_DIR, skill, 'hooks.json');
  const args =
    action === 'install'
      ? [action, '--config', hooksJson, '--scope', 'global', '--target', 'both']
      : [action, '--skill-id', skill, '--scope', 'global', '--target', 'both'];

  console.log(`▶ ${skill}: ${action}`);
  const result = spawnSync('node', [cli, ...args], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`✗ ${skill}: failed with exit code ${result.status}`);
    failures++;
  }
}

process.exit(failures > 0 ? 1 : 0);
