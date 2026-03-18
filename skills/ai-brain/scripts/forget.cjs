#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { memoryDir, getPaths } = require('./lib.cjs');

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === 'help') {
  console.log(`Usage: node forget.cjs "query"

Remove memories matching query.

Examples:
  node forget.cjs "outdated-fact"
  node forget.cjs "session:temp-note"
`);
  process.exit(0);
}

const query = args.join(' ').toLowerCase();
const mem = memoryDir();
const p = getPaths(mem);

let deleted = 0;

function searchAndDelete(dir, depth = 0) {
  if (!fs.existsSync(dir) || depth > 3) return;

  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      searchAndDelete(fullPath, depth + 1);
    } else if (file.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();
      if (content.includes(query)) {
        fs.unlinkSync(fullPath);
        console.log(`🗑️  Deleted: ${fullPath.replace(mem + '/', '')}`);
        deleted++;
      }
    }
  }
}

const dirs = [p.session, p.semantic, p.procedural, p.episodic];
for (const dir of dirs) {
  searchAndDelete(dir);
}

console.log(`\nTotal deleted: ${deleted}`);
