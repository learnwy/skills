#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const AI_TYPE_MAP = {
  'trae': '.trae',
  'trae-cn': '.trae',
  'TraeAI': '.trae',
  'TraeCN': '.trae',
  'claude-code': '.claude',
  'claude': '.claude',
  'ClaudeCode': '.claude',
  'cursor': '.cursor',
  'Cursor': '.cursor',
  'windsurf': '.windsurf',
  'Windsurf': '.windsurf',
};

const VALID_TYPES = ['debug', 'architecture', 'pattern', 'config', 'api', 'workflow', 'lesson', 'reference'];

function showHelp() {
  const help = `Usage: get-knowledge-path.cjs -r <project_root> -a <ai_type> -t <type> -n <filename>

Generate a knowledge document path based on project and AI IDE context.

Arguments:
  -r, --root      Project root directory (required)
  -a, --ai-type   AI/LLM type: trae, trae-cn, claude-code, cursor, windsurf (required)
  -t, --type      Knowledge type: debug, architecture, pattern, config, api, workflow, lesson, reference (required)
  -n, --name      Filename (without extension, required)
  -h, --help      Show this help message

AI Type to Path Mapping:
  trae, trae-cn      -> .trae/knowledges/
  claude-code        -> .claude/knowledges/
  cursor             -> .cursor/knowledges/
  windsurf           -> .windsurf/knowledges/

Output Format:
  {project_root}/{ai_path}/knowledges/{YYYYMMDD}_{daily_seq}_{type}_{filename}.md

Examples:
  get-knowledge-path.cjs -r /project -a trae-cn -t debug -n memory-leak-fix
  # Output: /project/.trae/knowledges/20260223_001_debug_memory-leak-fix.md

  get-knowledge-path.cjs -r /project -a claude-code -t pattern -n singleton-impl
  # Output: /project/.claude/knowledges/20260223_001_pattern_singleton-impl.md`;
  console.log(help);
}

function parseArgs(argv) {
  const args = { root: '', aiType: '', type: '', name: '' };
  let i = 0;
  while (i < argv.length) {
    switch (argv[i]) {
      case '-r': case '--root':
        args.root = argv[++i] || '';
        break;
      case '-a': case '--ai-type':
        args.aiType = argv[++i] || '';
        break;
      case '-t': case '--type':
        args.type = argv[++i] || '';
        break;
      case '-n': case '--name':
        args.name = argv[++i] || '';
        break;
      case '-h': case '--help':
        showHelp();
        process.exit(0);
        break;
      default:
        process.stderr.write(`Error: Unknown option: ${argv[i]}\n`);
        showHelp();
        process.exit(1);
    }
    i++;
  }
  return args;
}

function getToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '');
}

function countExisting(dir, datePrefix) {
  if (!fs.existsSync(dir)) return 0;
  const entries = fs.readdirSync(dir);
  return entries.filter((e) => {
    if (!e.startsWith(`${datePrefix}_`)) return false;
    const full = path.join(dir, e);
    return fs.statSync(full).isFile();
  }).length;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.root || !args.aiType || !args.type || !args.name) {
    process.stderr.write('Error: Missing required arguments\n');
    showHelp();
    process.exit(1);
  }

  if (!fs.existsSync(args.root) || !fs.statSync(args.root).isDirectory()) {
    process.stderr.write(`Error: Project root does not exist: ${args.root}\n`);
    process.exit(1);
  }

  const aiPath = AI_TYPE_MAP[args.aiType];
  if (!aiPath) {
    process.stderr.write(`Error: Unknown AI type: ${args.aiType}\n`);
    process.stderr.write(`Supported types: trae, trae-cn, claude-code, cursor, windsurf\n`);
    process.exit(1);
  }

  if (!VALID_TYPES.includes(args.type)) {
    process.stderr.write(`Error: Unknown knowledge type: ${args.type}\n`);
    process.stderr.write(`Supported types: ${VALID_TYPES.join(' ')}\n`);
    process.exit(1);
  }

  const knowledgeDir = path.join(args.root, aiPath, 'knowledges');
  fs.mkdirSync(knowledgeDir, { recursive: true });

  const today = getToday();
  const existingCount = countExisting(knowledgeDir, today);
  const dailySeq = String(existingCount + 1).padStart(3, '0');

  const safeName = sanitizeFilename(args.name);
  const outputPath = path.join(knowledgeDir, `${today}_${dailySeq}_${args.type}_${safeName}.md`);

  process.stdout.write(outputPath + '\n');
}

main();
