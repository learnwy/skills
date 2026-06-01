import * as path from 'node:path';
import type { Command } from '../../shared/cli.js';
import { isValidLifecycle, type Lifecycle } from '../lib/phases.js';
import { escalateLifecycle, getActiveWorkflowDir, loadState, saveState } from '../lib/state.js';

function showHelp(): void {
  console.log(`Usage: cli.cjs escalate -r <root> --to <lifecycle> --reason "<why>"

Promote the active workflow to a richer lifecycle.

Options:
    -r, --root DIR        Project root (REQUIRED)
    -p, --path DIR        Specific workflow path
        --to KIND         lite | standard | full (REQUIRED; must be higher than current)
        --reason TEXT     Why escalating — recorded in state history (REQUIRED)
    -h, --help            Show help

Escalation rationale matters: when scope grows mid-flight, recording the
reason on advance lets you audit later why the lifecycle changed.
`);
}

function run(args: string[]): void {
  let projectRoot = '';
  let workflowDir = '';
  let target: Lifecycle | null = null;
  let reason = '';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '-p': case '--path': workflowDir = args[++i]; break;
      case '--to': {
        const v = args[++i];
        if (!isValidLifecycle(v)) {
          console.error(`Error: --to must be lite | standard | full (got: ${v})`);
          process.exit(1);
        }
        target = v;
        break;
      }
      case '--reason': reason = args[++i]; break;
      case '-h': case '--help': showHelp(); process.exit(0);
    }
  }

  if (!projectRoot || !target || !reason) {
    console.error('Error: --root, --to, and --reason are required');
    showHelp();
    process.exit(1);
  }

  projectRoot = path.resolve(projectRoot);
  if (!workflowDir) {
    const dir = getActiveWorkflowDir(projectRoot);
    if (!dir) {
      console.error('Error: no active workflow.');
      process.exit(1);
    }
    workflowDir = dir;
  }

  const state = loadState(workflowDir);
  if (!state) {
    console.error(`state.json not found in ${workflowDir}`);
    process.exit(1);
  }

  const result = escalateLifecycle(state, target, reason);
  if (!result.changed) {
    console.error(`✘ Cannot escalate: current lifecycle is "${state.lifecycle}", target "${target}" is not higher.`);
    process.exit(1);
  }
  saveState(state);
  console.log(`✓ Lifecycle: ${result.from} → ${state.lifecycle}`);
  console.log(`Reason: ${reason}`);
  console.log('');
  console.log('The next `cli.cjs advance` will route through the new path.');
  console.log('Earlier-phase artifacts (spec.md, design.md) may need to be back-filled.');
}

export const command: Command = {
  description: 'Promote workflow lifecycle (lite → standard → full)',
  run,
};
