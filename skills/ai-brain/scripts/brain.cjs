#!/usr/bin/env node
'use strict';

const lib = require('./lib.cjs');

const args = process.argv.slice(2);
const subcommand = args[0];

if (!subcommand) {
  console.error('Usage: node brain.cjs <start|stop|status|recall|remember>');
  console.error('  start    - start a new session (or resume existing)');
  console.error('  stop     - end current session');
  console.error('  status   - show brain status');
  console.error('  recall   - search memories');
  console.error('  remember - save a memory');
  console.error('');
  console.error('For detailed usage, run the individual scripts directly.');
  process.exit(1);
}

const { execFileSync } = require('child_process');
const path = require('path');
const scriptDir = __dirname;

const scriptMap = {
  start: 'start.cjs',
  stop: 'session.cjs',
  status: 'status.cjs',
  recall: 'recall.cjs',
  remember: 'remember.cjs',
  dump: 'dump.cjs',
  forget: 'forget.cjs',
  clear: 'clear.cjs',
  reflect: 'reflect.cjs',
  session: 'session.cjs',
};

const script = scriptMap[subcommand];
if (!script) {
  console.error(`Unknown subcommand: ${subcommand}`);
  console.error(`Available: ${Object.keys(scriptMap).join(', ')}`);
  process.exit(1);
}

const forwardArgs = args.slice(1);
if (subcommand === 'stop') {
  forwardArgs.unshift('end');
}

try {
  const result = execFileSync('node', [path.join(scriptDir, script), ...forwardArgs], {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  process.stdout.write(result);
} catch (e) {
  if (e.status) process.exit(e.status);
  console.error(e.message);
  process.exit(1);
}
