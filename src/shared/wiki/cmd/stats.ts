import { join } from 'node:path';
import {
  resolveWikiPaths, PAGE_TYPES, RAW_SUBDIRS, countMdFiles,
} from '../lib/index.js';
import { parseArgs, type Command } from '../../cli.js';

const pad = (str: string | number, width: number): string => String(str).padEnd(width);
const num = (val: number, width: number): string => String(val).padStart(width);

async function stats(wikiDir: string, rawDir: string): Promise<void> {
  const wiki: Record<string, number> = {};
  for (const { type } of PAGE_TYPES) {
    wiki[type] = await countMdFiles(join(wikiDir, type));
  }

  const raw: Record<string, number> = {};
  for (const sub of RAW_SUBDIRS) {
    raw[sub] = await countMdFiles(join(rawDir, sub));
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
  description: 'Box-drawing dashboard of raw + wiki page counts. --root DIR',
  run: (args) => {
    const { wikiDir, rawDir } = resolveWikiPaths(parseArgs(args).flags);
    return stats(wikiDir, rawDir);
  },
};
