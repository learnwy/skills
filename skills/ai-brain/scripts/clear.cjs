#!/usr/bin/env node
'use strict';

const fs = require('fs');
const lib = require('./lib.cjs');

const args = process.argv.slice(2);
const target = args[0];

const VALID_TARGETS = ['all', 'facts', 'preferences', 'patterns', 'sessions', 'identity', 'index'];

if (!target || !VALID_TARGETS.includes(target)) {
  console.error(`Usage: node clear.cjs <${VALID_TARGETS.join('|')}>`);
  console.error('  all         - clear everything');
  console.error('  facts       - clear semantic facts only');
  console.error('  preferences - clear semantic preferences only');
  console.error('  patterns    - clear procedural patterns only');
  console.error('  sessions    - clear episodic sessions only');
  console.error('  identity    - clear identity files only');
  console.error('  index       - clear index/active session only');
  process.exit(1);
}

function clearDir(dir) {
  let count = 0;
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fp = require('path').join(dir, f);
      if (fs.statSync(fp).isFile()) {
        fs.unlinkSync(fp);
        count++;
      }
    }
  } catch {}
  return count;
}

const cleared = {};

if (target === 'all' || target === 'facts') cleared.facts = clearDir(lib.DIRS.semantic.facts);
if (target === 'all' || target === 'preferences') cleared.preferences = clearDir(lib.DIRS.semantic.preferences);
if (target === 'all' || target === 'patterns') cleared.patterns = clearDir(lib.DIRS.procedural.patterns);
if (target === 'all' || target === 'sessions') cleared.sessions = clearDir(lib.DIRS.episodic.sessions);
if (target === 'all' || target === 'identity') cleared.identity = clearDir(lib.DIRS.identity);
if (target === 'all' || target === 'index') cleared.index = clearDir(lib.DIRS.index);

console.log(JSON.stringify({
  action: 'cleared',
  target,
  cleared,
}, null, 2));
