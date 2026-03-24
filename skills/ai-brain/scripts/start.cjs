#!/usr/bin/env node
'use strict';

const lib = require('./lib.cjs');

lib.ensureDirs();

const args = process.argv.slice(2);
let project = null;
const projectIdx = args.indexOf('--project');
if (projectIdx !== -1 && args[projectIdx + 1]) {
  project = args[projectIdx + 1];
}

let session;
let action;
const existing = lib.getActiveSession();
if (existing) {
  session = existing;
  action = 'resumed';
} else {
  session = lib.createSession(project);
  action = 'created';
}

const ai = lib.loadIdentity('AI');
const user = lib.loadIdentity('user');
const recentSessions = lib.getRecentSessions(3);
const stats = lib.getStats();

const parts = [];
parts.push(action === 'resumed' ? `Resumed session ${session.id}` : `New session ${session.id}`);
parts.push(`${stats.facts} facts, ${stats.patterns} patterns, ${stats.preferences} preferences`);
if (recentSessions.length > 0) {
  const last = recentSessions[0];
  const preview = (last.summary || 'no summary').slice(0, 60);
  parts.push(`Last session: ${preview}`);
}
const contextSummary = parts.join(' | ');

const output = {
  action: 'brain_started',
  session,
  identity: {
    ai: ai || null,
    user: user || null,
  },
  recent_sessions: recentSessions,
  stats,
  context_summary: contextSummary,
};

console.log(JSON.stringify(output, null, 2));
