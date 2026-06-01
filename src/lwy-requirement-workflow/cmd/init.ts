import * as fs from 'node:fs';
import * as path from 'node:path';
import { ensureDir } from '../../shared/fs-utils.js';
import type { Command } from '../../shared/cli.js';
import { isValidLifecycle, type Lifecycle } from '../lib/phases.js';
import { createState, migrateLegacyTraeLayout, saveState, setActiveWorkflow, workflowBase } from '../lib/state.js';

function showHelp(): void {
  console.log(`Usage: cli.cjs init -r <root> -n <name> [OPTIONS]

Initialize a requirement workflow at the smallest viable lifecycle.

Options:
    -r, --root DIR        Project root (REQUIRED)
    -n, --name NAME       Requirement name (REQUIRED)
    -d, --desc DESC       One-line description
    -l, --lifecycle KIND  lite | standard | full (default: lite)
    --tags TAGS           Comma-separated tags
    -h, --help            Show help

The default lifecycle is "lite" (INIT → IMPLEMENTING → TESTING → DONE).
Escalate later with: cli.cjs escalate --to standard|full --reason "..."
`);
}

const SPEC_TEMPLATE_FULL = `# {{NAME}}

## Background
{{DESC}}

## Scope
- In:
- Out:

## Acceptance Criteria
- [ ] When <trigger>, the system shall <response>
- [ ] While <state>, the system shall <behavior>
- [ ] Where <constraint>, the system shall <limit>

## Constraints
-

## Out of Scope
-
`;

const TASKS_TEMPLATE = `# Tasks

## Phase 1: Foundation
- [ ] 1.1: <description> [files: ]

## Phase 2: Core
- [ ] 2.1: <description> [files: ]

## Phase 3: Polish
- [ ] 3.1: <description> [files: ]
`;

const CHECKLIST_TEMPLATE = `# Checklist

## Code Quality
- [ ] Implementation complete
- [ ] Lint clean
- [ ] Type check pass

## Tests
- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)

## Acceptance Criteria
- [ ] All ACs verified

## Review
- [ ] Self-review complete
- [ ] No TODO/FIXME left unresolved
`;

function fillTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? '');
}

function run(args: string[]): void {
  let projectRoot = '';
  let name = '';
  let desc = '';
  let lifecycle: Lifecycle = 'lite';
  let tags = '';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '-n': case '--name': name = args[++i]; break;
      case '-d': case '--desc': desc = args[++i]; break;
      case '-l': case '--lifecycle': {
        const v = args[++i];
        if (!isValidLifecycle(v)) {
          console.error(`Error: --lifecycle must be lite | standard | full (got: ${v})`);
          process.exit(1);
        }
        lifecycle = v;
        break;
      }
      case '--tags': tags = args[++i]; break;
      case '-h': case '--help': showHelp(); process.exit(0);
    }
  }

  if (!projectRoot || !name) {
    console.error('Error: --root and --name are required.');
    showHelp();
    process.exit(1);
  }

  projectRoot = path.resolve(projectRoot);
  if (!fs.existsSync(projectRoot)) {
    console.error(`Error: Directory not found: ${projectRoot}`);
    process.exit(1);
  }

  migrateLegacyTraeLayout(projectRoot);
  ensureDir(workflowBase(projectRoot));

  const state = createState({
    projectRoot,
    name,
    description: desc,
    lifecycle,
    tags: tags ? tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
  });

  ensureDir(state.workflowDir);
  ensureDir(path.join(state.workflowDir, 'briefs'));

  if (lifecycle === 'full') {
    fs.writeFileSync(
      path.join(state.workflowDir, 'spec.md'),
      fillTemplate(SPEC_TEMPLATE_FULL, { NAME: name, DESC: desc || '<problem statement>' }),
    );
  }
  fs.writeFileSync(path.join(state.workflowDir, 'tasks.md'), TASKS_TEMPLATE);
  fs.writeFileSync(path.join(state.workflowDir, 'checklist.md'), CHECKLIST_TEMPLATE);

  saveState(state);
  setActiveWorkflow(projectRoot, state.workflowDir);

  console.log('✅ Workflow initialized');
  console.log(`ID:        ${state.id}`);
  console.log(`Lifecycle: ${lifecycle}`);
  console.log(`Dir:       ${state.workflowDir}`);
  console.log('');
  console.log('Next: node scripts/cli.cjs advance -r .');
}

export const command: Command = {
  description: 'Initialize a requirement workflow (default: lite lifecycle)',
  run,
};
