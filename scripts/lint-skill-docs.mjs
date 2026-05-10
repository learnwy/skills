#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

function parseRepoRootArg() {
  const idx = process.argv.indexOf('--repo-root');
  if (idx >= 0 && process.argv[idx + 1]) return resolve(process.argv[idx + 1]);
  return resolve(HERE, '..');
}

const REPO_ROOT = parseRepoRootArg();
const SKILLS_DIR = join(REPO_ROOT, 'skills');
const SRC_DIR = join(REPO_ROOT, 'src');

const SUBCOMMAND_RE = /cli\.cjs\s+([a-zA-Z][\w-]*)/g;
const KNOWN_SHARED = new Set(['install', 'uninstall']);

function listSkillDirs() {
  return readdirSync(SKILLS_DIR).filter((n) => statSync(join(SKILLS_DIR, n)).isDirectory());
}

function extractSubcommandsFromMd(md) {
  const found = new Set();
  for (const m of md.matchAll(SUBCOMMAND_RE)) {
    const name = m[1];
    if (name === 'help' || name === 'h') continue;
    found.add(name);
  }
  return found;
}

function extractCommandsFromCli(src) {
  const m = src.match(/commands\s*:\s*\{([\s\S]*?)\}\s*,?\s*\}\s*\)/);
  if (!m) return null;
  const body = m[1];
  const names = new Set();
  for (const entry of body.split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.indexOf(':');
    const keyPart = colonIdx >= 0 ? trimmed.slice(0, colonIdx).trim() : trimmed;
    let key;
    const quoted = keyPart.match(/^['"]([^'"]+)['"]$/);
    if (quoted) {
      key = quoted[1];
    } else if (/^[a-zA-Z][\w-]*$/.test(keyPart)) {
      key = keyPart;
    } else {
      continue;
    }
    if (/^[A-Z]/.test(key)) continue;
    names.add(key);
  }
  return names;
}

function main() {
  const errors = [];
  for (const skill of listSkillDirs()) {
    const md = join(SKILLS_DIR, skill, 'SKILL.md');
    const cli = join(SRC_DIR, skill, 'cli.ts');
    if (!existsSync(md)) continue;
    if (!existsSync(cli)) continue;

    const mdText = readFileSync(md, 'utf8');
    const cliText = readFileSync(cli, 'utf8');

    const mentioned = extractSubcommandsFromMd(mdText);
    const declared = extractCommandsFromCli(cliText);
    if (declared === null) {
      errors.push(`${skill}: could not parse commands map in src/${skill}/cli.ts`);
      continue;
    }

    for (const sub of mentioned) {
      if (declared.has(sub)) continue;
      if (KNOWN_SHARED.has(sub) && cliText.includes('installCommand')) continue;
      errors.push(`${skill}: SKILL.md mentions \`cli.cjs ${sub}\` but no such subcommand in src/${skill}/cli.ts (declared: ${[...declared].join(', ')})`);
    }
  }

  if (errors.length === 0) {
    console.log('[lint-skill-docs] OK — every cli.cjs <subcommand> in SKILL.md resolves to src/<skill>/cli.ts.');
    return 0;
  }
  console.error(`[lint-skill-docs] ${errors.length} issue(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  return 1;
}

process.exit(main());
