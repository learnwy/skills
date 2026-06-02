import * as fs from 'node:fs';
import * as path from 'node:path';
import { wikiPaths } from './constants.js';
import { activeDefaultRoot, activeLabel } from './skin.js';

export function scanSession(root: string = activeDefaultRoot()): string | null {
  const { root: resolved, wikiDir } = wikiPaths(root);
  const topicsFile = path.join(wikiDir, 'topics.txt');
  if (!fs.existsSync(topicsFile)) return null;

  const topics = fs.readFileSync(topicsFile, 'utf8').trim();
  if (!topics) return null;

  const topicLines = topics.split('\n').slice(0, 30);
  return [
    `[${activeLabel()}] Personal wiki available at ${resolved}/.`,
    `Known topics (${topicLines.length}): ${topicLines.join(', ')}`,
    'For complex knowledge questions, check wiki pages before answering.',
  ].join('\n');
}
