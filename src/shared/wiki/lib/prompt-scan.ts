import * as fs from 'node:fs';
import * as path from 'node:path';
import { looksLikeNonProse } from '../../text-classifiers.js';
import { activeDefaultRoot, activeLabel } from './skin.js';

export function scanPrompt(message: string, wikiRoot: string = activeDefaultRoot()): string | null {
  const lower = (message || '').toLowerCase();
  if (lower.length < 15) return null;
  if (looksLikeNonProse(message)) return null;

  const topicsFile = path.join(wikiRoot, 'wiki', 'topics.txt');
  if (!fs.existsSync(topicsFile)) return null;

  const topics = fs
    .readFileSync(topicsFile, 'utf8')
    .split('\n')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const words = lower.split(/\s+/).filter((w) => w.length > 3);
  const matches = topics.filter((topic) => words.some((word) => topic.includes(word)));
  if (matches.length === 0) return null;

  const topMatches = matches.slice(0, 5);
  return [
    `[${activeLabel()}] Relevant wiki topics found: ${topMatches.join(', ')}`,
    'Consider reading these wiki pages before answering.',
    `Wiki path: ${wikiRoot}/wiki/`,
  ].join('\n');
}
