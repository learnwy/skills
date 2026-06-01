import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveWikiPaths, PAGE_DIRS, readMdFiles } from '../lib/index.js';
import { parseArgs, type Command } from '../../shared/cli.js';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into',
  'not', 'but', 'are', 'was', 'has', 'had', 'its', 'you', 'your',
  'how', 'why', 'what', 'when', 'who', 'all', 'can', 'will',
  'use', 'get', 'set', 'new', 'old', 'one', 'two', 'via', 'per',
]);

const MIN_WORD_LENGTH = 3;
const META_SCAN_LINES = 15;

async function extractDiscipline(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n').slice(0, META_SCAN_LINES);
    for (const line of lines) {
      if (line.startsWith('**Discipline**:')) return line.split(':').slice(1).join(':').trim();
      if (line.startsWith('**Platform**:')) return line.split(':').slice(1).join(':').trim();
    }
  } catch {
    /* empty */
  }
  return '';
}

function slugToWords(slug: string): string[] {
  return slug
    .split('-')
    .filter((w) => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w.toLowerCase()));
}

async function generateTopics(wikiDir: string): Promise<void> {
  const keywords = new Set<string>();
  const disciplines = new Set<string>();

  for (const dir of PAGE_DIRS) {
    const dirPath = join(wikiDir, dir);
    const files = await readMdFiles(dirPath);
    for (const file of files) {
      if (file === 'index.md') continue;
      const slug = file.replace('.md', '');
      keywords.add(slug);
      for (const word of slugToWords(slug)) keywords.add(word.toLowerCase());

      const disc = await extractDiscipline(join(dirPath, file));
      if (disc) disciplines.add(disc);
    }
  }

  const lines: string[] = [
    '# Auto-generated topic keywords for fast auto-query scanning',
    `# Generated: ${new Date().toISOString().slice(0, 10)}`,
    `# Total keywords: ${keywords.size}`,
    '',
  ];

  for (const d of [...disciplines].sort()) {
    lines.push(d.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  }
  lines.push('');

  for (const k of [...keywords].sort()) {
    lines.push(k);
  }

  await writeFile(join(wikiDir, 'topics.txt'), lines.join('\n'));
  console.log(`Generated wiki/topics.txt (${keywords.size} keywords from ${disciplines.size} disciplines)`);
}

export const command: Command = {
  description: 'Regenerate wiki/topics.txt keyword index. --root DIR',
  run: (args) => generateTopics(resolveWikiPaths(parseArgs(args).flags).wikiDir),
};
