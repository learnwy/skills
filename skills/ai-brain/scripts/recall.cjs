#!/usr/bin/env node
'use strict';

const lib = require('./lib.cjs');

const VALID_CATEGORIES = ['fact', 'preference', 'pattern'];

function parseArgs(argv) {
  const raw = argv.slice(2);
  const opts = { query: null, category: 'all', project: null, limit: 10, context: false };
  const positional = [];

  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i];
    if (arg === '--category' && i + 1 < raw.length) {
      opts.category = raw[++i];
    } else if (arg === '--project' && i + 1 < raw.length) {
      opts.project = raw[++i];
    } else if (arg === '--limit' && i + 1 < raw.length) {
      opts.limit = parseInt(raw[++i], 10) || 10;
    } else if (arg === '--context') {
      opts.context = true;
    } else if (arg === 'help' || arg === '--help') {
      opts.help = true;
    } else if (!arg.startsWith('--')) {
      positional.push(arg);
    }
  }

  opts.query = positional.join(' ') || null;
  return opts;
}

function printUsage() {
  console.log(`Usage: node recall.cjs <query> [options]

Search memories with relevance scoring.

Options:
  --category <fact|preference|pattern|all>  Filter by category (default: all)
  --project <name>                          Boost results matching project
  --limit <N>                               Max results (default: 10)
  --context                                 Include recent sessions & identity

Examples:
  node recall.cjs "React patterns"
  node recall.cjs "typescript" --category preference --limit 5
  node recall.cjs "deployment" --project my-app --context
`);
}

function resolveCategories(category) {
  if (!category || category === 'all') return VALID_CATEGORIES;
  const cat = category.toLowerCase();
  if (VALID_CATEGORIES.includes(cat)) return [cat];
  return VALID_CATEGORIES;
}

function boostForProject(results, project) {
  if (!project) return results;
  const proj = project.toLowerCase();
  return results.map(r => {
    const memProject = (r.project || '').toLowerCase();
    const contentMatch = (r.content || '').toLowerCase().includes(proj);
    const tagMatch = (r.tags || []).some(t => t.toLowerCase().includes(proj));
    let boost = 0;
    if (memProject === proj) boost += 8;
    else if (memProject.includes(proj)) boost += 4;
    if (contentMatch) boost += 2;
    if (tagMatch) boost += 3;
    return { ...r, score: r.score + boost };
  });
}

function buildContext() {
  const ctx = {};

  const sessions = lib.getRecentSessions(3);
  ctx.recent_sessions = sessions.map(s => ({
    id: s.file,
    started: s.started || null,
    ended: s.ended || null,
    project: s.project || null,
    summary: s.summary || null,
  }));

  const aiIdentity = lib.loadIdentity('AI');
  const userIdentity = lib.loadIdentity('user');
  ctx.identity = {
    ai: aiIdentity ? aiIdentity.slice(0, 500) : null,
    user: userIdentity ? userIdentity.slice(0, 500) : null,
  };

  return ctx;
}

function formatResult(mem) {
  return {
    content: mem.content || null,
    category: mem.category || null,
    score: mem.score,
    tags: mem.tags || [],
    project: mem.project || null,
    frequency: mem.frequency || 1,
    created: mem.created || null,
    accessed: mem.accessed || null,
  };
}

function main() {
  const opts = parseArgs(process.argv);

  if (opts.help || !opts.query) {
    printUsage();
    process.exit(opts.help ? 0 : 1);
  }

  lib.ensureDirs();

  const categories = resolveCategories(opts.category);
  let results = lib.searchMemories(opts.query, categories);

  results = boostForProject(results, opts.project);
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.frequency || 1) - (a.frequency || 1);
  });
  results = results.slice(0, opts.limit);

  for (const r of results) {
    if (r._file) lib.touchAccess(r._file);
  }

  const session = lib.getActiveSession();
  if (session) {
    session.memories_recalled = (session.memories_recalled || 0) + results.length;
    lib.saveActiveSession(session);
  }

  const output = {
    action: 'recalled',
    query: opts.query,
    results_count: results.length,
    results: results.map(formatResult),
  };

  if (opts.context) {
    output.context = buildContext();
  }

  console.log(JSON.stringify(output, null, 2));
}

main();
