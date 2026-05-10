#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { looksLikeNonProse } from '../../shared/text-classifiers.js';

const WIKI_ROOT = path.join(process.env.HOME || '', '.learnwy', 'llm-wiki');

async function main(): Promise<void> {
  const payload = await readStdin();
  const userMessage = (payload.user_message || payload.prompt || '').toLowerCase();
  if (!userMessage || userMessage.length < 15) return;
  if (looksLikeNonProse(userMessage)) return;

  const topicsFile = path.join(WIKI_ROOT, 'wiki', 'topics.txt');
  if (!fs.existsSync(topicsFile)) return;

  const topics = fs
    .readFileSync(topicsFile, 'utf8')
    .split('\n')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const words = userMessage.split(/\s+/).filter((w) => w.length > 3);
  const matches = topics.filter((topic) => words.some((word) => topic.includes(word)));
  if (matches.length === 0) return;

  const topMatches = matches.slice(0, 5);
  injectContext(
    [
      `[llm-wiki] Relevant wiki topics found: ${topMatches.join(', ')}`,
      'Consider reading these wiki pages before answering.',
      `Wiki path: ${WIKI_ROOT}/wiki/`,
    ].join('\n'),
  );
}

main().catch(() => process.exit(0));
