#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { readStdin, injectContext } from '../../shared/hooks-lib.js';

const WIKI_ROOT = path.join(process.env.HOME || '', '.learnwy', 'llm-wiki');

async function main(): Promise<void> {
  await readStdin();

  const topicsFile = path.join(WIKI_ROOT, 'wiki', 'topics.txt');
  if (!fs.existsSync(topicsFile)) return;

  const topics = fs.readFileSync(topicsFile, 'utf8').trim();
  if (!topics) return;

  const topicLines = topics.split('\n').slice(0, 30);
  injectContext(
    [
      '[llm-wiki] Personal wiki available at ~/.learnwy/llm-wiki/.',
      `Known topics (${topicLines.length}): ${topicLines.join(', ')}`,
      'For complex knowledge questions, check wiki pages before answering.',
    ].join('\n'),
  );
}

main().catch(() => process.exit(0));
