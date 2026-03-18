#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { memoryDir, ensureDir, getPaths } = require('./lib.cjs');

const args = process.argv.slice(2);

if (args.includes('--confirm') || args.includes('-y')) {
  const mem = memoryDir();
  const p = getPaths(mem);

  function rmDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      const fullPath = path.join(dir, f.name);
      if (f.isDirectory()) {
        rmDir(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    }
    fs.rmdirSync(dir);
  }

  const dirs = [p.session, p.semantic, p.procedural, p.episodic];
  for (const d of dirs) {
    rmDir(d);
  }

  console.log('✅ All memories cleared');
  process.exit(0);
}

console.log(`⚠️  This will delete ALL memories.

To confirm, run:
  node clear.cjs --confirm
`);
