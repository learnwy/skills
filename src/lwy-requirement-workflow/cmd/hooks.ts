import * as path from 'node:path';
import { generateHooksJson, installIdeHooks, type Target } from '../lib/ide-hooks-installer.js';
import type { Command } from '../../shared/cli.js';

function showHelp(): void {
  console.log(`Usage: cli.cjs hooks -r <root> <action> [OPTIONS]

Generate or install IDE hooks (SessionStart context + Stop quality gate).

Actions:
    generate          Print hooks.json to stdout
    install           Write hooks.json into .trae/ and .claude/

Options:
    -r, --root DIR    Project root (REQUIRED)
    --target T        trae | claude | both (default: both)
    -h, --help        Show help
`);
}

function run(args: string[]): void {
  let projectRoot = '';
  let action = '';
  let target: Target = 'both';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '--target': target = args[++i] as Target; break;
      case '-h': case '--help': showHelp(); process.exit(0);
      default:
        if (!action) action = args[i];
    }
  }
  if (!projectRoot || !action) {
    showHelp();
    process.exit(1);
  }
  projectRoot = path.resolve(projectRoot);

  switch (action) {
    case 'generate':
      console.log(JSON.stringify(generateHooksJson(projectRoot), null, 2));
      break;
    case 'install':
      installIdeHooks(projectRoot, target);
      break;
    default:
      console.error(`Unknown action: ${action}`);
      showHelp();
      process.exit(1);
  }
}

export const command: Command = {
  description: 'Generate or install IDE hooks (SessionStart context + Stop gate)',
  run,
};
