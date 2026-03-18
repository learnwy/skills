#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { memoryDir, getPaths } = require('./lib.cjs');

const mem = memoryDir();
const p = getPaths(mem);

console.log('=== AI Brain Status ===\n');

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const walk = (d) => {
    const files = fs.readdirSync(d, { withFileTypes: true });
    for (const f of files) {
      if (f.isDirectory()) walk(path.join(d, f.name));
      else if (f.name.endsWith('.md')) count++;
    }
  };
  walk(dir);
  return count;
}

console.log('📊 Memory Stats:\n');
console.log(`  Session:     ${countFiles(p.session)} files`);
console.log(`  Preferences:  ${countFiles(p.semanticPrefs)} files`);
console.log(`  Facts:       ${countFiles(p.semanticFacts)} files`);
console.log(`  Patterns:    ${countFiles(p.proceduralPatterns)} files`);
console.log(`  History:     ${countFiles(p.episodicHistory)} files`);
console.log(`\n  Total:       ${countFiles(mem)} files`);

console.log('\n📁 Location:', mem);

const recentHistory = p.episodicHistory;
if (fs.existsSync(recentHistory)) {
  const files = fs.readdirSync(recentHistory).filter(f => f.startsWith('history-')).sort().reverse().slice(0, 3);
  if (files.length > 0) {
    console.log('\n📖 Recent Sessions:');
    for (const f of files) {
      const stat = fs.statSync(path.join(recentHistory, f));
      const date = stat.mtime.toISOString().slice(0, 10);
      console.log(`   ${date} - ${f}`);
    }
  }
}
