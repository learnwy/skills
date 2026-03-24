#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const lib = require('./lib.cjs');

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
  console.log(`Usage: node remember.cjs <content> [options]

Store a new memory with deduplication, auto-tagging, session tracking, and project scope.

Options:
  --category <fact|preference|pattern>  Memory category (default: auto-detect)
  --tags <tag1,tag2>                    Comma-separated tags
  --project <name>                      Project scope
  --source <explicit|inferred>          Memory source (default: explicit)

Examples:
  node remember.cjs "User prefers TypeScript over JavaScript"
  node remember.cjs "Always run tests before committing" --category pattern
  node remember.cjs "API key rotation is quarterly" --tags security,ops --project acme
`);
  process.exit(0);
}

let content = '';
let category = null;
let tags = [];
let project = null;
let source = 'explicit';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--category' && args[i + 1]) {
    category = args[++i];
  } else if (args[i] === '--tags' && args[i + 1]) {
    tags = args[++i].split(',').map(t => t.trim()).filter(Boolean);
  } else if (args[i] === '--project' && args[i + 1]) {
    project = args[++i];
  } else if (args[i] === '--source' && args[i + 1]) {
    source = args[++i];
  } else if (!content) {
    content = args[i];
  }
}

if (!content.trim()) {
  console.error('Error: content required');
  process.exit(1);
}

function autoDetectCategory(text) {
  const lower = text.toLowerCase();
  if (/\b(prefer|prefers|preferred|like|likes|liked|want|wants|wanted)\b/.test(lower)) return 'preference';
  if (/\b(when|always|pattern|rule|never|every\s?time)\b/.test(lower)) return 'pattern';
  return 'fact';
}

function autoGenerateTags(text) {
  const auto = [];
  const lower = text.toLowerCase();
  const techKeywords = {
    typescript: 'typescript', javascript: 'javascript', react: 'react',
    node: 'node', python: 'python', rust: 'rust', go: 'golang',
    docker: 'docker', kubernetes: 'k8s', git: 'git', api: 'api',
    database: 'database', sql: 'sql', css: 'css', html: 'html',
    test: 'testing', ci: 'ci-cd', deploy: 'deployment', security: 'security',
  };
  for (const [keyword, tag] of Object.entries(techKeywords)) {
    if (lower.includes(keyword)) auto.push(tag);
  }
  return auto;
}

lib.ensureDirs();

const resolvedCategory = category || autoDetectCategory(content);

let targetDir;
switch (resolvedCategory) {
  case 'preference':
    targetDir = lib.DIRS.semantic.preferences;
    break;
  case 'pattern':
    targetDir = lib.DIRS.procedural.patterns;
    break;
  case 'fact':
  default:
    targetDir = lib.DIRS.semantic.facts;
    break;
}

const duplicate = lib.findDuplicate(content, targetDir);

if (duplicate) {
  lib.touchAccess(duplicate._file);
  const updated = lib.parseMemoryFile(duplicate._file);
  const result = {
    action: 'updated_existing',
    id: path.basename(duplicate._file, '.md'),
    content: updated.content,
    category: resolvedCategory,
    frequency: updated.frequency,
    deduplicated: true,
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const allTags = [...new Set([...tags, ...autoGenerateTags(content)])];
const session = lib.getActiveSession();

const body = lib.buildMemoryContent(content, resolvedCategory, {
  source,
  tags: allTags.length > 0 ? allTags : undefined,
  project: project || undefined,
  session: session ? session.id : undefined,
});

const prefix = resolvedCategory === 'preference' ? 'pref'
  : resolvedCategory === 'pattern' ? 'pattern'
  : 'fact';
const id = lib.generateId(prefix);
const filePath = path.join(targetDir, `${id}.md`);

fs.writeFileSync(filePath, body + '\n', 'utf-8');

if (session) {
  session.memories_created = (session.memories_created || 0) + 1;
  lib.saveActiveSession(session);
}

const result = {
  action: 'remembered',
  id,
  content,
  category: resolvedCategory,
  tags: allTags,
  project: project || null,
  deduplicated: false,
};
console.log(JSON.stringify(result, null, 2));
