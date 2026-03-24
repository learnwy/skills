#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function showHelp() {
  console.log(`AI Brain - Adaptive Memory System

Usage: {skill_root}/scripts/brain.cjs <command> [args]

Commands:
  start              Load memories, start session
  remember "text"    Store memory (auto-categorized)
  recall "query"     Search memories
  forget "query"     Remove memory
  status             Show memory statistics
  dump               Export all memories
  clear              Reset all memories

Scopes:
  session:    Current session only
  long-term:  Persistent across sessions
  all:        Search everything

Examples:
  {skill_root}/scripts/brain.cjs start
  {skill_root}/scripts/brain.cjs remember "User prefers brief responses"
  {skill_root}/scripts/brain.cjs recall "preferences"
  {skill_root}/scripts/brain.cjs forget "outdated-fact"
`);
}

const cmds = {
  start: 'start.cjs',
  remember: 'remember.cjs',
  recall: 'recall.cjs',
  forget: 'forget.cjs',
  status: 'status.cjs',
  dump: 'dump.cjs',
  clear: 'clear.cjs',
};

const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
  showHelp();
  process.exit(0);
}

if (!cmds[cmd]) {
  console.error(`Error: unknown command: ${cmd}`);
  showHelp();
  process.exit(1);
}

const scriptPath = path.join(__dirname, cmds[cmd]);
if (!fs.existsSync(scriptPath)) {
  console.error(`Error: missing script: ${scriptPath}`);
  process.exit(1);
}

const { spawn } = require('child_process');
const child = spawn('node', [scriptPath, ...args.slice(1)], {
  stdio: 'inherit',
  cwd: __dirname
});

child.on('exit', (code) => process.exit(code || 0));
