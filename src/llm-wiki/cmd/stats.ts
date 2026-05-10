import { join } from 'node:path';
import {
  WIKI_DIR, RAW_DIR, PAGE_TYPES, RAW_SUBDIRS, countMdFiles, countMdFilesDeep,
} from '../lib/index.js';
import type { Command } from '../../shared/cli.js';

const pad = (str: string | number, width: number): string => String(str).padEnd(width);
const num = (val: number, width: number): string => String(val).padStart(width);

async function stats(): Promise<void> {
  const DEEP_TYPES = new Set(['concepts']);
  const wiki: Record<string, number> = {};
  for (const { type } of PAGE_TYPES) {
    wiki[type] = DEEP_TYPES.has(type)
      ? await countMdFilesDeep(join(WIKI_DIR, type))
      : await countMdFiles(join(WIKI_DIR, type));
  }

  const raw: Record<string, number> = {};
  for (const sub of RAW_SUBDIRS) {
    raw[sub] = await countMdFiles(join(RAW_DIR, sub));
  }

  const totalRaw = Object.values(raw).reduce((a, b) => a + b, 0);
  const totalWiki = Object.values(wiki).reduce((a, b) => a + b, 0);

  const W = 38;
  const line = (l: string, content: string, r: string): string => `${l}${content.padEnd(W - 2)}${r}`;

  console.log(line('╔', '═'.repeat(W - 2), '╗'));
  console.log(line('║', '        LLM Wiki Dashboard         ', '║'));
  console.log(line('╠', '═'.repeat(W - 2), '╣'));
  console.log(line('║', '  Raw Sources (Layer 1)             ', '║'));

  for (const [key, val] of Object.entries(raw)) {
    if (val > 0) console.log(line('║', `    ${pad(key, 20)} ${num(val, 5)}  `, '║'));
  }
  console.log(line('║', `    ${pad('TOTAL', 20)} ${num(totalRaw, 5)}  `, '║'));

  console.log(line('╠', '═'.repeat(W - 2), '╣'));
  console.log(line('║', '  Wiki Pages (Layer 2)              ', '║'));

  for (const [key, val] of Object.entries(wiki)) {
    if (val > 0) console.log(line('║', `    ${pad(key, 20)} ${num(val, 5)}  `, '║'));
  }
  console.log(line('║', `    ${pad('TOTAL', 20)} ${num(totalWiki, 5)}  `, '║'));

  console.log(line('╠', '═'.repeat(W - 2), '╣'));
  console.log(line('║', `    ${pad('Grand Total', 20)} ${num(totalRaw + totalWiki, 5)}  `, '║'));
  console.log(line('╚', '═'.repeat(W - 2), '╝'));
}

export const command: Command = {
  description: 'Box-drawing dashboard of raw + wiki page counts',
  run: () => stats(),
};
