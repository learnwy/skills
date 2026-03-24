#!/usr/bin/env node
'use strict';

const lib = require('./lib.cjs');

const args = process.argv.slice(2);
const command = args[0];

function parseFlag(flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function out(data) {
  process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

switch (command) {
  case 'start': {
    const project = parseFlag('--project');
    const session = lib.createSession(project);
    const ai = lib.loadIdentity('AI');
    const user = lib.loadIdentity('user');
    const recentSessions = lib.getRecentSessions(3);
    out({
      action: 'session_started',
      session,
      identity: { ai: ai || null, user: user || null },
      recent_sessions: recentSessions,
    });
    break;
  }
  case 'end': {
    const summary = parseFlag('--summary');
    const session = lib.endSession(summary);
    if (!session) {
      out({ action: 'no_active_session' });
    } else {
      out({ action: 'session_ended', session });
    }
    break;
  }
  case 'current': {
    const session = lib.getActiveSession();
    if (!session) {
      out({ action: 'no_active_session' });
    } else {
      out(session);
    }
    break;
  }
  default: {
    process.stderr.write(`Usage: session.cjs <start|end|current> [options]\n`);
    process.stderr.write(`  start [--project <name>]   Start a new session\n`);
    process.stderr.write(`  end [--summary <text>]     End the active session\n`);
    process.stderr.write(`  current                    Show active session\n`);
    process.exit(1);
  }
}
