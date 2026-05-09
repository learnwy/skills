#!/usr/bin/env node
'use strict';

const path = require('path');
const { installHooks, uninstallHooks, buildHooksConfig } = require('./lib.cjs');

function showHelp() {
  console.log(`Usage: node install.cjs <action> [options]

Install or uninstall skill hooks into IDE config files.

Actions:
  install   Install hooks from a skill's hooks config
  uninstall Remove hooks matching a skill identifier

Options:
  --config PATH    Path to skill's hooks.json config file (for install)
  --skill-id ID   Skill identifier string to match commands (for uninstall)
  --target TARGET  trae|claude|both (default: both)
  --scope SCOPE    global|project (default: global)
  --root DIR       Project root (for scope=project, default: cwd)

Examples:
  node install.cjs install --config ../hooks.json --scope global
  node install.cjs uninstall --skill-id english-learner --scope global`);
}

function main() {
  const args = process.argv.slice(2);
  let action = '', configPath = '', skillId = '';
  let target = 'both', scope = 'global', root = process.cwd();

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--config': configPath = args[++i]; break;
      case '--skill-id': skillId = args[++i]; break;
      case '--target': target = args[++i]; break;
      case '--scope': scope = args[++i]; break;
      case '--root': root = args[++i]; break;
      case '-h': case '--help': showHelp(); process.exit(0);
      default:
        if (!action) action = args[i];
    }
  }

  if (!action) { showHelp(); process.exit(1); }

  switch (action) {
    case 'install': {
      if (!configPath) {
        console.error('Error: --config required for install');
        process.exit(1);
      }
      const fs = require('fs');
      const absPath = path.resolve(configPath);
      const config = JSON.parse(fs.readFileSync(absPath, 'utf8'));
      const results = installHooks(config, { target, scope, projectRoot: path.resolve(root) });
      results.forEach(f => console.log(`✅ Installed to: ${f}`));
      break;
    }
    case 'uninstall': {
      if (!skillId) {
        console.error('Error: --skill-id required for uninstall');
        process.exit(1);
      }
      uninstallHooks(skillId, { target, scope, projectRoot: path.resolve(root) });
      console.log(`✅ Uninstalled hooks matching: ${skillId}`);
      break;
    }
    default:
      console.error(`Unknown action: ${action}`);
      showHelp();
      process.exit(1);
  }
}

main();
