#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { memoryDir, getPaths } = require('./lib.cjs');

const mem = memoryDir();
const p = getPaths(mem);

console.log('=== AI Brain: Export All Memories ===\n');

const memories = {};

function collect(dir, key) {
  if (!fs.existsSync(dir)) return;
  const walk = (d, prefix = '') => {
    const files = fs.readdirSync(d, { withFileTypes: true });
    for (const f of files) {
      if (f.isDirectory()) {
        walk(path.join(d, f.name), prefix + f.name + '/');
      } else if (f.name.endsWith('.md')) {
        const fullPath = path.join(d, f.name);
        const relative = prefix + f.name;
        const content = fs.readFileSync(fullPath, 'utf8');
        memories[relative] = content;
      }
    }
  };
  walk(dir);
}

collect(p.session, 'session/');
collect(p.semanticFacts, 'semantic/facts/');
collect(p.semanticPrefs, 'semantic/preferences/');
collect(p.proceduralPatterns, 'procedural/patterns/');
collect(p.episodicHistory, 'episodic/history/');

console.log(JSON.stringify({
  exported_at: new Date().toISOString(),
  total_memories: Object.keys(memories).length,
  memories
}, null, 2));
