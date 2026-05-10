import * as fs from 'node:fs';
import * as path from 'node:path';
import { WIKI_ROOT } from './constants.js';

export function scanSession(): string | null {
  const topicsFile = path.join(WIKI_ROOT, 'wiki', 'topics.txt');
  if (!fs.existsSync(topicsFile)) return null;

  const topics = fs.readFileSync(topicsFile, 'utf8').trim();
  if (!topics) return null;

  const topicLines = topics.split('\n').slice(0, 30);
  return [
    '[llm-wiki] Personal wiki available at ~/.learnwy/llm-wiki/.',
    `Known topics (${topicLines.length}): ${topicLines.join(', ')}`,
    'For complex knowledge questions, check wiki pages before answering.',
  ].join('\n');
}
