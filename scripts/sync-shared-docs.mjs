#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(repoRoot, '.agents/docs');
const skillsDir = join(repoRoot, 'skills');

const banner = (relSourcePath) => `<!--
AUTO-GENERATED — DO NOT EDIT DIRECTLY.
Source of truth: ${relSourcePath}
After editing the source, run \`pnpm run sync-docs\` to propagate.
-->

`;

function listSkills() {
  return readdirSync(skillsDir).filter((name) => {
    const p = join(skillsDir, name);
    return statSync(p).isDirectory() && existsSync(join(p, 'SKILL.md'));
  });
}

function main() {
  if (!existsSync(sourceDir)) {
    console.error(`✗ source dir not found: ${sourceDir}`);
    process.exit(1);
  }

  const docs = readdirSync(sourceDir).filter((f) => f.endsWith('.md'));
  if (docs.length === 0) {
    console.log('No shared docs to sync.');
    return;
  }

  const skills = listSkills();
  let written = 0;
  let unchanged = 0;

  for (const skill of skills) {
    const refsDir = join(skillsDir, skill, 'references');
    mkdirSync(refsDir, { recursive: true });

    for (const doc of docs) {
      const src = join(sourceDir, doc);
      const dst = join(refsDir, doc);
      const next = banner(`.agents/docs/${doc}`) + readFileSync(src, 'utf8');
      const prev = existsSync(dst) ? readFileSync(dst, 'utf8') : '';

      if (prev === next) {
        unchanged++;
      } else {
        writeFileSync(dst, next);
        written++;
        console.log(`  + ${relative(repoRoot, dst)}`);
      }
    }
  }

  const summary = `${written} written, ${unchanged} unchanged across ${skills.length} skills × ${docs.length} docs.`;
  if (written === 0) {
    console.log(`✓ shared docs already in sync (${summary})`);
  } else {
    console.log(`\n✓ sync complete: ${summary}`);
    console.log('  Commit the changes before pushing.');
  }
}

main();
