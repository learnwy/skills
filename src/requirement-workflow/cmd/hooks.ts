import * as fs from 'node:fs';
import * as path from 'node:path';
import { listHooks, addHook, type Scope } from '../lib/workflow-yaml-hooks.js';
import { generateHooksJson, installIdeHooks, type Target } from '../lib/ide-hooks-installer.js';
import type { Command } from '../../shared/cli.js';

function showHelp(): void {
  console.log(`Usage: cli.cjs hooks -r <root> <action> [OPTIONS]

Manage workflow hooks and generate standard IDE hooks.json.

Actions:
    list [hook]       List internal workflow hooks (all or specific)
    add <hook> <name> Add internal workflow hook
    generate          Generate standard hooks.json for IDE integration
    install           Install hooks.json into both .trae/ and .claude/

Options:
    -r, --root DIR     Project root (REQUIRED)
    -p, --path DIR     Specific workflow path
    --scope SCOPE     global|project|workflow (default: workflow)
    --type TYPE       skill|agent (default: skill)
    -n, --name NAME   Name (for add)
    --required        Mark as required
    --target TARGET   trae|claude|both (for generate/install, default: both)
    -h, --help        Show help`);
}

function run(args: string[]): void {
  let projectRoot = '';
  let workflowDir = '';
  let action = '';
  let scope: Scope = 'workflow';
  let hook = '';
  let type = 'skill';
  let name = '';
  let required = false;
  let target: Target = 'both';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '-p': case '--path': workflowDir = args[++i]; break;
      case '--scope': scope = args[++i] as Scope; break;
      case '--type': type = args[++i]; break;
      case '-n': case '--name': name = args[++i]; break;
      case '--required': required = true; break;
      case '--target': target = args[++i] as Target; break;
      case '-h': case '--help': showHelp(); process.exit(0);
      default:
        if (!action) action = args[i];
        else if (!hook) hook = args[i];
    }
  }

  if (!projectRoot || !action) {
    showHelp();
    process.exit(1);
  }

  projectRoot = path.resolve(projectRoot);

  if (!workflowDir) {
    const activeFile = path.join(projectRoot, '.trae', 'active_workflow');
    if (fs.existsSync(activeFile)) {
      workflowDir = fs.readFileSync(activeFile, 'utf8').trim();
    }
  }

  switch (action) {
    case 'list':
      listHooks(projectRoot, workflowDir, hook, scope);
      break;
    case 'add':
      if (!hook || !name) {
        console.error('Error: hook and name required for add');
        process.exit(1);
      }
      addHook(projectRoot, workflowDir, scope, hook, type, name, required);
      break;
    case 'generate':
      console.log(JSON.stringify(generateHooksJson(projectRoot), null, 2));
      break;
    case 'install':
      installIdeHooks(projectRoot, target);
      break;
    default:
      console.error(`Unknown action: ${action}`);
      showHelp();
  }
}

export const command: Command = {
  description: 'Manage workflow-internal hooks (list/add) and generate/install IDE hooks.json',
  run,
};
