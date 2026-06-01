import * as fs from 'node:fs';
import * as path from 'node:path';
import { DEFAULT_WIKI_ROOT, wikiPaths } from './constants.js';

export function scanSession(root: string = DEFAULT_WIKI_ROOT): string | null {
  const { root: resolved, wikiDir } = wikiPaths(root);
  const topicsFile = path.join(wikiDir, 'topics.txt');
  if (!fs.existsSync(topicsFile)) return null;

  const topics = fs.readFileSync(topicsFile, 'utf8').trim();
  if (!topics) return null;

  const topicLines = topics.split('\n').slice(0, 30);
  return [
    `[llm-wiki] Personal wiki available at ${resolved}/.`,
    `Known topics (${topicLines.length}): ${topicLines.join(', ')}`,
    'For complex knowledge questions, check wiki pages before answering.',
  ].join('\n');
}
