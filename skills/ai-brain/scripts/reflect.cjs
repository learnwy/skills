#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const lib = require('./lib.cjs');

const args = process.argv.slice(2);
const cmd = args[0];
const sub = args[1];

function out(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

function parseFlag(flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

function countAllFiles(dir) {
  try {
    return fs.readdirSync(dir).filter(f => f.endsWith('.md')).length;
  } catch {
    return 0;
  }
}

function walkFiles(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) results.push(...walkFiles(full));
      else if (e.name.endsWith('.md')) results.push(full);
    }
  } catch {}
  return results;
}

if (cmd === 'stats') {
  out({ action: 'stats', stats: lib.getStats(), memory_root: lib.MEMORY_ROOT });
} else if (cmd === 'sessions') {
  const limit = parseInt(parseFlag('--limit'), 10) || 10;
  out({ action: 'sessions', sessions: lib.getRecentSessions(limit) });
} else if (cmd === 'identity') {
  if (sub === 'show') {
    out({ action: 'identity', ai: lib.loadIdentity('AI'), user: lib.loadIdentity('user') });
  } else if (sub === 'set') {
    const who = args[2];
    const content = args.slice(3).join(' ');
    if (!who || !content) {
      console.error('Usage: reflect.cjs identity set <AI|user> <content>');
      process.exit(1);
    }
    lib.saveIdentity(who, content);
    out({ action: 'identity_saved', who });
  } else {
    console.error('Usage: reflect.cjs identity <show|set>');
    process.exit(1);
  }
} else if (cmd === 'health') {
  const dirs = {
    facts: lib.DIRS.semantic.facts,
    preferences: lib.DIRS.semantic.preferences,
    patterns: lib.DIRS.procedural.patterns,
    sessions: lib.DIRS.episodic.sessions,
  };

  const allFiles = Object.values(dirs).reduce((acc, d) => acc.concat(walkFiles(d)), []);
  const emptyFiles = allFiles.filter(f => {
    try { return fs.readFileSync(f, 'utf-8').trim().length === 0; } catch { return false; }
  }).length;

  const dir_sizes = {};
  for (const [key, dir] of Object.entries(dirs)) {
    dir_sizes[key] = countAllFiles(dir);
  }

  out({
    action: 'health',
    total_files: allFiles.length,
    empty_files: emptyFiles,
    dir_sizes,
  });
} else {
  console.error(`Usage: reflect.cjs <stats|sessions|identity|health>

Subcommands:
  stats                          Show comprehensive memory stats
  sessions [--limit N]           List recent sessions (default: 10)
  identity show                  Show AI and user identity
  identity set <AI|user> <text>  Save identity
  health                         Check memory health`);
  process.exit(1);
}
