#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { installHooks, uninstallHooks, type HooksConfig, type InstallOptions } from './hooks-lib.js';

function showHelp(): void {
  console.log(`Usage: node install.cjs <action> [options]

Install or uninstall skill hooks into IDE config files.

Actions:
  install   Install hooks from a skill's hooks config
  uninstall Remove hooks matching a skill identifier

Options:
  --config PATH    Path to skill's hooks.json config file (for install)
  --skill-id ID    Skill identifier string to match commands (for uninstall)
  --target TARGET  trae|claude|both (default: both)
  --scope SCOPE    global|project (default: global)
  --root DIR       Project root (for scope=project, default: cwd)

Examples:
  node install.cjs install --config ../hooks.json --scope global
  node install.cjs uninstall --skill-id english-learner --scope global`);
}

function main(): void {
  const args = process.argv.slice(2);
  let action = '';
  let configPath = '';
  let skillId = '';
  let target: NonNullable<InstallOptions['target']> = 'both';
  let scope: NonNullable<InstallOptions['scope']> = 'global';
  let root = process.cwd();

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--config':
        configPath = args[++i] || '';
        break;
      case '--skill-id':
        skillId = args[++i] || '';
        break;
      case '--target':
        target = (args[++i] as InstallOptions['target']) || 'both';
        break;
      case '--scope':
        scope = (args[++i] as InstallOptions['scope']) || 'global';
        break;
      case '--root':
        root = args[++i] || process.cwd();
        break;
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
      default:
        if (!action) action = arg;
    }
  }

  if (!action) {
    showHelp();
    process.exit(1);
  }

  if (action === 'install') {
    if (!configPath) {
      console.error('Error: --config required for install');
      process.exit(1);
    }
    const absPath = path.resolve(configPath);
    const config = JSON.parse(fs.readFileSync(absPath, 'utf8')) as HooksConfig;
    const results = installHooks(config, { target, scope, projectRoot: path.resolve(root) });
    results.forEach((f) => console.log(`✅ Installed to: ${f}`));
  } else if (action === 'uninstall') {
    if (!skillId) {
      console.error('Error: --skill-id required for uninstall');
      process.exit(1);
    }
    uninstallHooks(skillId, { target, scope, projectRoot: path.resolve(root) });
    console.log(`✅ Uninstalled hooks matching: ${skillId}`);
  } else {
    console.error(`Unknown action: ${action}`);
    showHelp();
    process.exit(1);
  }
}

main();
