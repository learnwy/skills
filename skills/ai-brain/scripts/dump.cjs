#!/usr/bin/env node
'use strict';

const lib = require('./lib.cjs');

const args = process.argv.slice(2);
const format = args.includes('--json') ? 'json' : 'text';

const stats = lib.getStats();
const session = lib.getActiveSession();
const recentSessions = lib.getRecentSessions(3);

const facts = lib.getAllMemories(lib.DIRS.semantic.facts);
const prefs = lib.getAllMemories(lib.DIRS.semantic.preferences);
const patterns = lib.getAllMemories(lib.DIRS.procedural.patterns);

if (format === 'json') {
  console.log(JSON.stringify({
    action: 'brain_dump',
    stats,
    active_session: session,
    recent_sessions: recentSessions,
    memories: {
      facts: facts.map(m => ({ content: m.content, tags: m.tags, project: m.project, frequency: m.frequency })),
      preferences: prefs.map(m => ({ content: m.content, tags: m.tags, frequency: m.frequency })),
      patterns: patterns.map(m => ({ content: m.content, tags: m.tags, project: m.project, frequency: m.frequency })),
    },
  }, null, 2));
} else {
  console.log('=== AI Brain Dump ===\n');
  console.log(`Total: ${stats.facts} facts, ${stats.preferences} prefs, ${stats.patterns} patterns, ${stats.sessions} sessions\n`);

  if (session) {
    console.log(`Active session: ${session.id} (project: ${session.project || 'general'})\n`);
  }

  const printSection = (title, items) => {
    console.log(`--- ${title} (${items.length}) ---`);
    items.forEach((m, i) => {
      const tags = m.tags ? ` [${m.tags.join(', ')}]` : '';
      const proj = m.project ? ` @${m.project}` : '';
      console.log(`  ${i + 1}. ${m.content}${tags}${proj} (freq: ${m.frequency || 1})`);
    });
    console.log('');
  };

  printSection('Facts', facts);
  printSection('Preferences', prefs);
  printSection('Patterns', patterns);

  if (recentSessions.length > 0) {
    console.log(`--- Recent Sessions (${recentSessions.length}) ---`);
    recentSessions.forEach((s, i) => {
      const preview = s.summary ? s.summary.substring(0, 80) : 'no summary';
      console.log(`  ${i + 1}. ${s.file} | ${s.project || 'general'} | ${preview}`);
    });
  }
}
