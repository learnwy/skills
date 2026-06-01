import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import {
  WIKI_DIR, RAW_DIR, WIKI_ROOT, PAGE_DIRS, PAGE_TYPES, ORPHAN_EXEMPT_DIRS,
  RAW_SUBDIRS, readMdFiles,
} from '../lib/index.js';
import type { Command } from '../../shared/cli.js';
import { parseArgs } from '../../shared/cli.js';

const HEALTH_FILE = join(WIKI_ROOT, 'health.json');
// Source-type dirs carry a **Source** ref that should resolve to raw material.
const SOURCE_DIRS = new Set(PAGE_TYPES.filter((p) => p.group === 'source').map((p) => p.type));

interface PageRef {
  dir: string;
  relPath: string;
  fullPath: string;
}

interface BrokenLink {
  page: string;
  link: string;
}

interface BrokenSource {
  page: string;
  source: string;
}

interface HealthReport {
  generated_at: string;
  wiki_root: string;
  totals: {
    pages: number;
    wikilinks: number;
    broken_links: number;
    orphans: number;
    broken_sources: number;
  };
  broken_links: BrokenLink[];
  orphans: string[];
  broken_sources: BrokenSource[];
}

async function listAllPages(): Promise<PageRef[]> {
  const pages: PageRef[] = [];
  for (const dir of PAGE_DIRS) {
    const dirPath = join(WIKI_DIR, dir);
    const files = (await readMdFiles(dirPath)).filter((f) => f !== 'index.md');
    for (const file of files) {
      pages.push({ dir, relPath: `${dir}/${file}`, fullPath: join(dirPath, file) });
    }
  }
  return pages;
}

function buildInventory(pages: PageRef[]): Set<string> {
  const inv = new Set<string>(['index.md']);
  for (const p of pages) {
    const noMd = p.relPath.replace(/\.md$/, '');
    inv.add(p.relPath);
    inv.add(noMd);
  }
  return inv;
}

function scanWikilinks(content: string, inventory: Set<string>): { broken: string[]; resolved: string[] } {
  const broken: string[] = [];
  const resolved: string[] = [];
  for (const match of content.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const link = match[1].replace(/\.md$/, '');
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

async function findRawSource(sourceField: string): Promise<boolean> {
  const cleaned = sourceField.replace(/^\s*\[+/, '').replace(/\]+\s*$/, '').trim();
  if (!cleaned) return true;
  if (/^https?:\/\//i.test(cleaned)) return true;

  const candidates = [
    cleaned,
    `${cleaned}.md`,
    cleaned.replace(/\s+/g, '-').toLowerCase(),
    `${cleaned.replace(/\s+/g, '-').toLowerCase()}.md`,
  ];
  for (const c of candidates) {
    if (existsSync(join(RAW_DIR, c))) return true;
  }
  for (const subdir of RAW_SUBDIRS) {
    for (const c of candidates) {
      if (existsSync(join(RAW_DIR, subdir, c))) return true;
    }
  }
  return false;
}

async function extractSourceField(filePath: string): Promise<string | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n').slice(0, 25);
    for (const line of lines) {
      if (line.startsWith('**Source**:')) {
        const value = line.split(':').slice(1).join(':').trim();
        return value || null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function buildReport(): Promise<HealthReport> {
  const pages = await listAllPages();
  const inventory = buildInventory(pages);

  const brokenLinks: BrokenLink[] = [];
  const incomingByTarget: Record<string, number> = {};
  const brokenSources: BrokenSource[] = [];
  let totalWikilinks = 0;

  for (const p of pages) {
    const content = await readFile(p.fullPath, 'utf-8');
    const { broken, resolved } = scanWikilinks(content, inventory);
    totalWikilinks += broken.length + resolved.length;
    for (const link of broken) brokenLinks.push({ page: p.relPath, link });
    for (const target of resolved) {
      incomingByTarget[target] = (incomingByTarget[target] || 0) + 1;
    }

    if (SOURCE_DIRS.has(p.dir)) {
      const src = await extractSourceField(p.fullPath);
      if (src) {
        const found = await findRawSource(src);
        if (!found) brokenSources.push({ page: p.relPath, source: src });
      }
    }
  }

  const orphans: string[] = [];
  for (const p of pages) {
    if (ORPHAN_EXEMPT_DIRS.has(p.dir)) continue;
    const noMd = p.relPath.replace(/\.md$/, '');
    if (!incomingByTarget[noMd] && !incomingByTarget[p.relPath]) {
      orphans.push(p.relPath);
    }
  }

  return {
    generated_at: new Date().toISOString(),
    wiki_root: WIKI_ROOT,
    totals: {
      pages: pages.length,
      wikilinks: totalWikilinks,
      broken_links: brokenLinks.length,
      orphans: orphans.length,
      broken_sources: brokenSources.length,
    },
    broken_links: brokenLinks,
    orphans,
    broken_sources: brokenSources,
  };
}

function printSummary(report: HealthReport): void {
  console.log(`llm-wiki health — ${report.generated_at}`);
  console.log(`Wiki root: ${report.wiki_root}`);
  console.log('');
  console.log(`Pages: ${report.totals.pages}`);
  console.log(`Wikilinks scanned: ${report.totals.wikilinks}`);
  console.log(`Broken wikilinks: ${report.totals.broken_links}`);
  console.log(`Orphan pages: ${report.totals.orphans}`);
  console.log(`Broken **Source** refs in source pages: ${report.totals.broken_sources}`);

  if (report.broken_sources.length) {
    console.log('');
    console.log(`Broken sources (${report.broken_sources.length}):`);
    for (const b of report.broken_sources.slice(0, 20)) {
      console.log(`  ${b.page} → ${b.source}`);
    }
    if (report.broken_sources.length > 20) {
      console.log(`  ... and ${report.broken_sources.length - 20} more`);
    }
  }
  if (report.broken_links.length) {
    console.log('');
    console.log(`Broken wikilinks (${report.broken_links.length}, top 10):`);
    for (const b of report.broken_links.slice(0, 10)) {
      console.log(`  ${b.page} → [[${b.link}]]`);
    }
  }
  console.log('');
  console.log(`Full report: ${HEALTH_FILE}`);
}

export const command: Command = {
  description: 'Aggregate wiki health: broken links, orphans, broken **Source** refs; writes health.json',
  run: async (args) => {
    const { flags } = parseArgs(args);
    if (!existsSync(WIKI_DIR)) {
      console.error(`Wiki not initialized at ${WIKI_ROOT}.`);
      process.exit(1);
    }
    const report = await buildReport();
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printSummary(report);
    }
    if (!flags['dry-run']) {
      await mkdir(dirname(HEALTH_FILE), { recursive: true });
      await writeFile(HEALTH_FILE, JSON.stringify(report, null, 2) + '\n');
    }
  },
};
