#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  getGlobalHooksFile, getProjectHooksFile,
  getHooksForPoint, getAgentsForPoint, getTimestamp,
} from './lib/common.js';

function showHelp(): void {
  console.log(`Usage: node hooks.cjs -r <root> <command> [OPTIONS]

Manage workflow hooks and generate standard IDE hooks.json.

Commands:
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

function ensureHooksFile(file: string): void {
  if (!fs.existsSync(file)) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, 'hooks: {}\n');
  }
}

type Scope = 'global' | 'project' | 'workflow';

function listHooks(projectRoot: string, workflowDir: string, hook: string, scope: Scope | ''): void {
  const scopes: Scope[] = scope ? [scope] : ['global', 'project', 'workflow'];
  const icons: Record<Scope, string> = { global: '🌍', project: '📁', workflow: '📄' };

  for (const s of scopes) {
    const file =
      s === 'global'
        ? getGlobalHooksFile()
        : s === 'project'
        ? getProjectHooksFile(projectRoot)
        : workflowDir
        ? path.join(workflowDir, 'workflow.yaml')
        : '';

    if (!file || !fs.existsSync(file)) continue;

    console.log(`\n${icons[s]} ${s.toUpperCase()}`);
    console.log('─'.repeat(40));

    const skills = hook ? getHooksForPoint(hook, file, '', '') : [];
    const agents = hook ? getAgentsForPoint(hook, file, '', '') : [];

    if (skills.length === 0 && agents.length === 0) {
      console.log('  (none)');
    } else {
      skills.forEach((sk, i) => console.log(`  ${i + 1}. skill: ${sk}`));
      agents.forEach((ag, i) => console.log(`  ${i + 1}. agent: ${ag}`));
    }
  }
  console.log('');
}

function addHook(projectRoot: string, workflowDir: string, scope: Scope, hook: string, type: string, name: string, required: boolean): void {
  const file =
    scope === 'global'
      ? getGlobalHooksFile()
      : scope === 'project'
      ? getProjectHooksFile(projectRoot)
      : path.join(workflowDir, 'workflow.yaml');

  ensureHooksFile(file);

  const timestamp = getTimestamp();
  const entry = `    - ${type}: "${name}"\n      required: ${required}\n      added_at: "${timestamp}"`;

  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(`${hook}:`)) {
    content = content.replace(`${hook}:\n`, `${hook}:\n${entry}\n`);
  } else {
    content = content.replace(/^hooks:/m, `hooks:\n  ${hook}:\n${entry}`);
  }

  fs.writeFileSync(file, content);
  console.log(`✅ Added ${type} '${name}' to ${hook} (${scope})`);
}

interface HooksConfig {
  version: number;
  hooks: Record<string, unknown[]>;
}

function buildSessionInitCommand(_projectRoot: string): string {
  return `bash -c 'WF=".trae/workflow/workflow.yaml"; if [ -f "$WF" ]; then echo "## Active Workflow"; echo ""; cat "$WF" | head -20; else echo "No active workflow."; fi'`;
}

function buildQualityGateCommand(_projectRoot: string): string {
  return `bash -c 'WF=".trae/workflow/workflow.yaml"; if [ ! -f "$WF" ]; then exit 0; fi; STAGE=$(grep "^stage:" "$WF" | cut -d\\\" -f2 2>/dev/null || grep "^stage:" "$WF" | awk "{print \\$2}"); case "$STAGE" in IMPLEMENTING) if [ ! -f ".trae/workflow/tasks.md" ]; then echo "{\\"decision\\":\\"block\\",\\"reason\\":\\"tasks.md not found. Please create task decomposition before stopping.\\"}" ; exit 0; fi ;; TESTING) echo "{\\"decision\\":\\"block\\",\\"reason\\":\\"Please verify tests pass before stopping.\\"}" ; exit 0 ;; esac; exit 0'`;
}

function buildPostEditCommand(_projectRoot: string): string {
  return `bash -c 'exit 0'`;
}

function generateHooksJson(projectRoot: string, _workflowDir?: string): HooksConfig {
  const hooksConfig: HooksConfig = { version: 1, hooks: {} };

  hooksConfig.hooks.SessionStart = [
    { hooks: [{ type: 'command', command: buildSessionInitCommand(projectRoot), timeout: 10 }] },
  ];
  hooksConfig.hooks.Stop = [
    { loop_limit: 3, hooks: [{ type: 'command', command: buildQualityGateCommand(projectRoot), timeout: 30 }] },
  ];
  hooksConfig.hooks.PostToolUse = [
    { matcher: 'Edit|Write', hooks: [{ type: 'command', command: buildPostEditCommand(projectRoot), timeout: 10 }] },
  ];

  return hooksConfig;
}

type Target = 'trae' | 'claude' | 'both';

function installHooks(projectRoot: string, target: Target): void {
  const hooksConfig = generateHooksJson(projectRoot);

  if (target === 'trae' || target === 'both') {
    const traeDir = path.join(projectRoot, '.trae');
    if (!fs.existsSync(traeDir)) fs.mkdirSync(traeDir, { recursive: true });
    const traeFile = path.join(traeDir, 'hooks.json');
    fs.writeFileSync(traeFile, JSON.stringify(hooksConfig, null, 2) + '\n');
    console.log(`✅ Installed: ${path.relative(projectRoot, traeFile)}`);
  }

  if (target === 'claude' || target === 'both') {
    const claudeDir = path.join(projectRoot, '.claude');
    if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true });
    const claudeFile = path.join(claudeDir, 'settings.json');

    let claudeSettings: Record<string, unknown> = {};
    if (fs.existsSync(claudeFile)) {
      try {
        claudeSettings = JSON.parse(fs.readFileSync(claudeFile, 'utf8'));
      } catch {
        claudeSettings = {};
      }
    }
    claudeSettings.hooks = hooksConfig.hooks;
    fs.writeFileSync(claudeFile, JSON.stringify(claudeSettings, null, 2) + '\n');
    console.log(`✅ Installed: ${path.relative(projectRoot, claudeFile)}`);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  let projectRoot = '';
  let workflowDir = '';
  let command = '';
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
        if (!command) command = args[i];
        else if (!hook) hook = args[i];
    }
  }

  if (!projectRoot || !command) {
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

  switch (command) {
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
    case 'generate': {
      const config = generateHooksJson(projectRoot, workflowDir);
      console.log(JSON.stringify(config, null, 2));
      break;
    }
    case 'install':
      installHooks(projectRoot, target);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
  }
}

main();
