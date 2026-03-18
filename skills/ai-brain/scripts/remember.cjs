#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { memoryDir, ensureDir, getPaths, autoCategorize } = require('./lib.cjs');

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === 'help') {
  console.log(`Usage: node remember.cjs "text to remember"

Store a new memory (auto-categorized).

Examples:
  node remember.cjs "User prefers brief responses"
  node remember.cjs --type preference "User likes TypeScript"
  node remember.cjs --scope session "temporary note"
`);
  process.exit(0);
}

let text = '';
let type = null;
let scope = 'long-term';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--type' && args[i + 1]) {
    type = args[++i];
  } else if (args[i] === '--scope' && args[i + 1]) {
    scope = args[++i];
  } else {
    text = args.slice(i).join(' ');
    break;
  }
}

if (!text.trim()) {
  console.error('Error: text required');
  process.exit(1);
}

const mem = memoryDir();
ensureDir(mem);
const p = getPaths(mem);

const category = type || autoCategorize(text);
const timestamp = new Date().toISOString();
const id = crypto.randomBytes(4).toString('hex');

let targetDir;
let filename;

if (scope === 'session') {
  targetDir = p.session;
  filename = `session-${Date.now()}.md`;
} else {
  switch (category) {
    case 'preference':
      targetDir = p.semanticPrefs;
      filename = `pref-${id}.md`;
      break;
    case 'pattern':
      targetDir = p.proceduralPatterns;
      filename = `pattern-${id}.md`;
      break;
    case 'fact':
    default:
      targetDir = p.semanticFacts;
      filename = `fact-${id}.md`;
      break;
  }
}

ensureDir(targetDir);

const content = `**Content**: ${text}
**Category**: ${category}
**Scope**: ${scope}
**Confidence**: high
**Source**: explicit
**Created**: ${timestamp}
**Accessed**: ${timestamp}
**Frequency**: 1`;

fs.writeFileSync(path.join(targetDir, filename), content + '\n', 'utf8');

console.log(`✅ Remembered (${category})`);
console.log(`   ${text.slice(0, 60)}${text.length > 60 ? '...' : ''}`);
