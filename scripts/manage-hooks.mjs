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

function runForSkill(skill, op) {
  const cli = join(SKILLS_DIR, skill, 'scripts', 'cli.cjs');
  const hooksJson = join(SKILLS_DIR, skill, 'hooks.json');
  const args =
    op === 'install'
      ? [op, '--config', hooksJson, '--scope', 'global', '--target', 'both']
      : [op, '--skill-id', skill, '--scope', 'global', '--target', 'both'];
  console.log(`▶ ${skill}: ${op}`);
  const result = spawnSync('node', [cli, ...args], { stdio: 'inherit' });
  return result.status === 0;
}

let failures = 0;

if (action === 'install') {
  console.log('— sweep: uninstalling stale entries before re-install (idempotent) —');
  for (const skill of hookSkills) {
    if (!runForSkill(skill, 'uninstall')) failures++;
  }
  console.log('— install pass —');
  for (const skill of hookSkills) {
    if (!runForSkill(skill, 'install')) failures++;
  }
} else {
  for (const skill of hookSkills) {
    if (!runForSkill(skill, 'uninstall')) failures++;
  }
}

if (failures > 0) console.error(`Completed with ${failures} failure(s).`);
process.exit(failures > 0 ? 1 : 0);
