#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { memoryDir, ensureDir, getPaths } = require('./lib.cjs');

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === 'help') {
  console.log(`Usage: node recall.cjs "query"

Search memories.

Examples:
  node recall.cjs "preferences"
  node recall.cjs "session:name"
  node recall.cjs "long-term:patterns"
  node recall.cjs "all:React"
`);
  process.exit(0);
}

const query = args.join(' ');

let scope = 'all';
let type = null;
let searchTerm = query;

if (query.includes(':')) {
  const [scopePart, rest] = query.split(':');
  if (['session', 'long-term', 'all'].includes(scopePart)) {
    scope = scopePart;
    searchTerm = rest;
  }
  if (rest.includes('|')) {
    const [typePart, search] = rest.split('|');
    if (['preference', 'fact', 'pattern', 'workflow'].includes(typePart)) {
      type = typePart;
      searchTerm = search;
    }
  }
}

const mem = memoryDir();
ensureDir(mem);
const p = getPaths(mem);

const searchLower = searchTerm.toLowerCase();
const results = [];

function searchDir(dir, depth = 0) {
  if (!fs.existsSync(dir) || depth > 3) return;

  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      searchDir(fullPath, depth + 1);
    } else if (file.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes(searchLower)) {
        const relative = fullPath.replace(mem + '/', '');
        const preview = content.split('\n').find(l => l.includes(searchTerm)) || content.slice(0, 100);
        results.push({
          path: relative,
          preview: preview.slice(0, 120)
        });
      }
    }
  }
}

const dirsToSearch = [];

if (scope === 'session' || scope === 'all') {
  dirsToSearch.push(p.session);
}
if (scope === 'long-term' || scope === 'all') {
  dirsToSearch.push(p.semantic);
  dirsToSearch.push(p.procedural);
  dirsToSearch.push(p.episodic);
}

for (const dir of dirsToSearch) {
  searchDir(dir);
}

console.log(`=== Recall: "${query}" ===\n`);
console.log(`Found: ${results.length} result(s)\n`);

for (const r of results) {
  console.log(`📄 ${r.path}`);
  console.log(`   ${r.preview}\n`);
}

if (results.length === 0) {
  console.log('No matching memories found.');
}
