import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { WIKI_DIR, PAGE_DIRS, ORPHAN_EXEMPT_DIRS, readMdFiles } from '../lib/index.js';
import type { Command } from '../../shared/cli.js';

// True if the page has an `# H1` title, skipping any leading YAML frontmatter.
export function hasTitle(content: string): boolean {
  const lines = content.split('\n');
  let i = 0;
  if (lines[0]?.trim() === '---') {
    i = 1;
    while (i < lines.length && lines[i].trim() !== '---') i++;
    i++; // past closing fence
  }
  while (i < lines.length && lines[i].trim() === '') i++;
  return lines[i]?.startsWith('# ') ?? false;
}

async function buildInventory(): Promise<{ inventory: Set<string>; allFiles: Record<string, string[]> }> {
  const inventory = new Set<string>();
  const allFiles: Record<string, string[]> = {};

  for (const dir of PAGE_DIRS) {
    const files = (await readMdFiles(join(WIKI_DIR, dir))).filter((f) => f !== 'index.md');
    allFiles[dir] = files;
    for (const file of files) {
      inventory.add(`${dir}/${file.replace('.md', '')}`);
      inventory.add(`${dir}/${file}`);
    }
  }

  inventory.add('index.md');

  return { inventory, allFiles };
}

function checkWikilinks(content: string, inventory: Set<string>): { broken: string[]; resolved: string[] } {
  const broken: string[] = [];
  const resolved: string[] = [];

  for (const match of content.matchAll(/\[\[([^\]]+)\]\]/g)) {
    // Strip an optional `|alias` display suffix and `#anchor` before resolving.
    const link = match[1].split('|')[0].split('#')[0].trim().replace(/\.md$/, '');
    const normalized = link.replace(/^raw\//, '').replace(/^wiki\//, '');
    const isWikiLink = PAGE_DIRS.some((d) => normalized.startsWith(`${d}/`));
    if (!isWikiLink) continue;

    const withMd = normalized.endsWith('.md') ? normalized : `${normalized}.md`;
    const withoutMd = normalized.replace(/\.md$/, '');

    if (!inventory.has(withMd) && !inventory.has(withoutMd)) {
      broken.push(match[1]);
    } else {
      resolved.push(withoutMd);
    }
  }

  return { broken, resolved };
}

async function lint(): Promise<number> {
  console.log('Linting wiki...\n');

  const { inventory, allFiles } = await buildInventory();
  const errors: string[] = [];
  const warnings: string[] = [];
  const incomingLinks: Record<string, number> = {};
  let totalLinks = 0;
  let totalPages = 0;

  for (const dir of PAGE_DIRS) {
    for (const file of allFiles[dir] || []) {
      const content = await readFile(join(WIKI_DIR, dir, file), 'utf-8');
      const loc = `${dir}/${file}`;
      totalPages++;

      if (!hasTitle(content)) {
        warnings.push(`${loc}: Missing # title`);
      }

      const { broken, resolved } = checkWikilinks(content, inventory);
      totalLinks += broken.length + resolved.length;

      for (const link of broken) errors.push(`${loc}: Broken link -> [[${link}]]`);
      for (const target of resolved) incomingLinks[target] = (incomingLinks[target] || 0) + 1;
    }
  }

  for (const dir of PAGE_DIRS) {
    if (ORPHAN_EXEMPT_DIRS.has(dir)) continue;
    for (const file of allFiles[dir] || []) {
      const key = `${dir}/${file.replace('.md', '')}`;
      if (!incomingLinks[key]) warnings.push(`${dir}/${file}: Orphan page (no incoming wikilinks)`);
    }
  }

  console.log('Statistics:');
  for (const dir of PAGE_DIRS) {
    const count = (allFiles[dir] || []).length;
    if (count > 0) console.log(`   ${dir}: ${count}`);
  }
  console.log(`   Total pages: ${totalPages}`);
  console.log(`   Total wikilinks: ${totalLinks}`);
  console.log(`   Broken links: ${errors.length}`);
  console.log('');

  if (errors.length > 0) {
    console.log(`Errors (${errors.length}):`);
    for (const e of errors.slice(0, 50)) console.log(`   ${e}`);
    if (errors.length > 50) console.log(`   ... and ${errors.length - 50} more`);
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length}):`);
    for (const w of warnings.slice(0, 30)) console.log(`   ${w}`);
    if (warnings.length > 30) console.log(`   ... and ${warnings.length - 30} more`);
    console.log('');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('No issues found!');
  }

  return errors.length > 0 ? 1 : 0;
}

export const command: Command = {
  description: 'Check broken wikilinks and orphan pages',
  run: async () => {
    const code = await lint();
    process.exit(code);
  },
};
