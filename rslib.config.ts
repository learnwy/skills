import { defineConfig } from '@rslib/core';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC_DIR = './src';
const SKILLS_OUT = './skills';
const SHARED_NAME = 'shared';

interface DiscoveredSkill {
  name: string;
  hasCli: boolean;
  hooks: string[];
}

function discoverSkills(): DiscoveredSkill[] {
  const skills: DiscoveredSkill[] = [];
  for (const entry of readdirSync(SRC_DIR)) {
    if (entry === SHARED_NAME) continue;
    const skillDir = join(SRC_DIR, entry);
    if (!statSync(skillDir).isDirectory()) continue;

    const hasCli = existsSync(join(skillDir, 'cli.ts'));

    const hooksDir = join(skillDir, 'hooks');
    let hooks: string[] = [];
    if (existsSync(hooksDir)) {
      hooks = readdirSync(hooksDir)
        .filter((f) => f.endsWith('.ts'))
        .map((f) => f.replace(/\.ts$/, ''));
    }

    if (!hasCli && hooks.length === 0) continue;

    skills.push({ name: entry, hasCli, hooks });
  }
  return skills;
}

function buildEntries(): Record<string, string> {
  const entry: Record<string, string> = {};
  for (const skill of discoverSkills()) {
    if (skill.hasCli) {
      entry[`${skill.name}/scripts/cli`] = `./src/${skill.name}/cli.ts`;
    }
    for (const hook of skill.hooks) {
      entry[`${skill.name}/scripts/hooks/${hook}`] = `./src/${skill.name}/hooks/${hook}.ts`;
    }
  }
  return entry;
}

const sharedNodeExternals = [
  'node:sqlite',
  'node:fs',
  'node:fs/promises',
  'node:path',
  'node:os',
  'node:child_process',
];

export default defineConfig({
  lib: [
    {
      format: 'cjs',
      syntax: 'es2022',
      bundle: true,
      shims: { cjs: { 'import.meta.url': true } },
      source: { entry: buildEntries() },
      output: {
        target: 'node',
        distPath: { root: SKILLS_OUT },
        filename: { js: '[name].cjs' },
        cleanDistPath: false,
        minify: false,
        externals: sharedNodeExternals,
      },
    },
  ],
});
