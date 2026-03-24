#!/usr/bin/env node
'use strict';

const lib = require('./lib.cjs');

const args = process.argv.slice(2);
const format = args.includes('--json') ? 'json' : 'text';

const stats = lib.getStats();
const session = lib.getActiveSession();
const aiIdentity = lib.loadIdentity('AI');
const userIdentity = lib.loadIdentity('user');

if (format === 'json') {
  console.log(JSON.stringify({
    action: 'brain_status',
    stats,
    active_session: session,
    identity: { ai: !!aiIdentity, user: !!userIdentity },
    memory_root: lib.MEMORY_ROOT,
  }, null, 2));
} else {
  console.log('=== AI Brain Status ===');
  console.log(`Memory Root: ${lib.MEMORY_ROOT}`);
  console.log('');
  console.log('--- Memories ---');
  console.log(`  Facts:       ${stats.facts}`);
  console.log(`  Preferences: ${stats.preferences}`);
  console.log(`  Patterns:    ${stats.patterns}`);
  console.log(`  Sessions:    ${stats.sessions}`);
  console.log('');
  console.log('--- Identity ---');
  console.log(`  AI:   ${aiIdentity ? 'set' : 'not set'}`);
  console.log(`  User: ${userIdentity ? 'set' : 'not set'}`);
  console.log('');
  console.log('--- Session ---');
  if (session) {
    console.log(`  Active: ${session.id}`);
    console.log(`  Started: ${session.started}`);
    console.log(`  Project: ${session.project || 'general'}`);
    console.log(`  Created: ${session.memories_created} | Recalled: ${session.memories_recalled}`);
  } else {
    console.log('  No active session');
  }
}
