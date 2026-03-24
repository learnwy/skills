#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const lib = require('./lib.cjs');

const args = process.argv.slice(2);
const query = args.filter(a => !a.startsWith('--'))[0];
let category = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--category' && args[i + 1]) category = args[i + 1];
}

if (!query) {
  console.error('Usage: node forget.cjs <content_substring> [--category fact|preference|pattern]');
  process.exit(1);
}

const dirsToSearch = [];
if (!category || category === 'fact') dirsToSearch.push({ dir: lib.DIRS.semantic.facts, cat: 'fact' });
if (!category || category === 'preference') dirsToSearch.push({ dir: lib.DIRS.semantic.preferences, cat: 'preference' });
if (!category || category === 'pattern') dirsToSearch.push({ dir: lib.DIRS.procedural.patterns, cat: 'pattern' });

const q = query.toLowerCase();
let removed = 0;
const removedItems = [];

for (const { dir, cat } of dirsToSearch) {
  const memories = lib.getAllMemories(dir);
  for (const mem of memories) {
    if (!mem.content) continue;
    if (mem.content.toLowerCase().includes(q)) {
      try {
        fs.unlinkSync(mem._file);
        removed++;
        removedItems.push({ content: mem.content, category: cat, file: path.basename(mem._file) });
      } catch {}
    }
  }
}

console.log(JSON.stringify({
  action: 'forgot',
  query,
  removed_count: removed,
  removed: removedItems,
}, null, 2));
