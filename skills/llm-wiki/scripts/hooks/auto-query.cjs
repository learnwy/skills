#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const hooksLib = path.join(__dirname, '..', '..', '..', '..', 'scripts', 'hooks', 'lib.cjs');
const { readStdin, injectContext } = require(hooksLib);

const WIKI_ROOT = path.join(process.env.HOME || '', '.learnwy', 'llm-wiki');

async function main() {
  const payload = await readStdin();
  const userMessage = (payload.user_message || payload.prompt || '').toLowerCase();

  if (!userMessage || userMessage.length < 15) return;

  if (/^(import |const |let |var |function |git |npm |node )/.test(userMessage.trim())) return;

  const topicsFile = path.join(WIKI_ROOT, 'wiki', 'topics.txt');
  if (!fs.existsSync(topicsFile)) return;

  const topics = fs.readFileSync(topicsFile, 'utf8')
    .split('\n')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  const words = userMessage.split(/\s+/).filter(w => w.length > 3);
  const matches = topics.filter(topic =>
    words.some(word => topic.includes(word))
  );

  if (matches.length === 0) return;

  const topMatches = matches.slice(0, 5);
  injectContext([
    `[llm-wiki] Relevant wiki topics found: ${topMatches.join(', ')}`,
    'Consider reading these wiki pages before answering.',
    `Wiki path: ${WIKI_ROOT}/wiki/`,
  ].join('\n'));
}

main().catch(() => process.exit(0));
