import { readdir, mkdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { WIKI_DIR } from '../lib/index.js';
import { classifyConcept } from '../lib/concept-domains.js';
import type { Command } from '../../shared/cli.js';

const CONCEPTS_DIR = join(WIKI_DIR, 'concepts');

async function reorganize(args: string[]): Promise<void> {
  const dryRun = args.includes('--dry-run');
  const files = (await readdir(CONCEPTS_DIR)).filter((f) => f.endsWith('.md'));

  console.log(`Scanning ${files.length} concept files...\n`);

  const moves: Record<string, string> = {};
  const stats: Record<string, number> = {};

  for (const file of files) {
    const domain = await classifyConcept(join(CONCEPTS_DIR, file), file);
    moves[file] = domain;
    stats[domain] = (stats[domain] || 0) + 1;
  }

  console.log('Domain distribution:');
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  for (const [domain, count] of sorted) {
    console.log(`  ${domain.padEnd(20)} ${String(count).padStart(4)}`);
  }
  console.log(`  ${'TOTAL'.padEnd(20)} ${String(files.length).padStart(4)}\n`);

  if (dryRun) {
    console.log('Dry run — no files moved. Remove --dry-run to execute.');
    const examples = Object.entries(moves).slice(0, 10);
    console.log('\nExample moves:');
    for (const [file, domain] of examples) {
      console.log(`  ${file} -> concepts/${domain}/`);
    }
    return;
  }

  const domains = [...new Set(Object.values(moves))];
  for (const domain of domains) {
    await mkdir(join(CONCEPTS_DIR, domain), { recursive: true });
  }

  let moved = 0;
  for (const [file, domain] of Object.entries(moves)) {
    const src = join(CONCEPTS_DIR, file);
    const dst = join(CONCEPTS_DIR, domain, file);
    await rename(src, dst);
    moved++;
  }

  console.log(`Moved ${moved} files into ${domains.length} subdirectories.`);
  console.log('\nNext steps:');
  console.log('  1. Run: node cli.cjs generate-index');
  console.log('  2. Run: node cli.cjs generate-topics');
  console.log('  3. Commit changes');
}

export const command: Command = {
  description: 'Move concept files into domain subdirs (--dry-run to preview)',
  run: (args) => reorganize(args),
};
