#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const {
  getGlobalHooksFile, getProjectHooksFile,
  getHooksForPoint, getAgentsForPoint, getTimestamp
} = require('./lib/common.cjs');

function showHelp() {
  console.log(`Usage: node hooks.cjs -r <root> <command> [OPTIONS]

Manage workflow hooks.

Commands:
    list [hook]       List hooks (all or specific)
    add <hook> <name> Add hook

Options:
    -r, --root DIR     Project root (REQUIRED)
    -p, --path DIR     Specific workflow path
    --scope SCOPE     global|project|workflow (default: workflow)
    --type TYPE       skill|agent (default: skill)
    -n, --name NAME   Name (for add)
    --required        Mark as required
    -h, --help        Show help

Examples:
    node hooks.cjs -r . list
    node hooks.cjs -r . add pre_stage_DEFINING -n prd-writer`);
}

function ensureHooksFile(file) {
  if (!fs.existsSync(file)) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, 'hooks: {}\nagents: {}\n');
  }
}

function listHooks(projectRoot, workflowDir, hook, scope) {
  const scopes = scope ? [scope] : ['global', 'project', 'workflow'];
  const icons = { global: '🌍', project: '📁', workflow: '📄' };

  for (const s of scopes) {
    const file = s === 'global' ? getGlobalHooksFile() :
                 s === 'project' ? getProjectHooksFile(projectRoot) :
                 workflowDir ? path.join(workflowDir, 'workflow.yaml') : '';

    if (!file || !fs.existsSync(file)) continue;

    console.log(`\n${icons[s]} ${s.toUpperCase()}`);
    console.log('─'.repeat(40));

    const skills = hook ? getHooksForPoint(hook, file, '', '') : [];
    const agents = hook ? getAgentsForPoint(hook, file, '', '') : [];

    if (skills.length === 0 && agents.length === 0) {
      console.log('  (none)');
    } else {
      skills.forEach((s, i) => console.log(`  ${i + 1}. skill: ${s}`));
      agents.forEach((a, i) => console.log(`  ${i + 1}. agent: ${a}`));
    }
  }
  console.log('');
}

function addHook(projectRoot, workflowDir, scope, hook, type, name, required) {
  const file = scope === 'global' ? getGlobalHooksFile() :
               scope === 'project' ? getProjectHooksFile(projectRoot) :
               path.join(workflowDir, 'workflow.yaml');

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

function main() {
  const args = process.argv.slice(2);
  let projectRoot = '', workflowDir = '', command = '', scope = 'workflow';
  let hook = '', type = 'skill', name = '', required = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '-p': case '--path': workflowDir = args[++i]; break;
      case '--scope': scope = args[++i]; break;
      case '--type': type = args[++i]; break;
      case '-n': case '--name': name = args[++i]; break;
      case '--required': required = true; break;
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
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
  }
}

main();
