import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Command } from '../../shared/cli.js';
import { generateBrief, briefPath } from '../lib/briefs/index.js';
import { type Phase } from '../lib/phases.js';
import { appendHistory, getActiveWorkflowDir, loadState, saveState } from '../lib/state.js';

const PHASE_NAMES: Phase[] = ['INIT', 'DEFINING', 'PLANNING', 'DESIGNING', 'IMPLEMENTING', 'TESTING', 'DELIVERING', 'DONE'];

function showHelp(): void {
  console.log(`Usage: cli.cjs brief -r <root> [OPTIONS]

Show or regenerate the curated context brief for a phase.

Options:
    -r, --root DIR    Project root (REQUIRED)
    -p, --path DIR    Specific workflow path
    --phase NAME      Phase name (default: current phase)
    --task ID         Task id for IMPLEMENTING brief (default: next unchecked)
    --regen           Regenerate the brief from current artifacts
    --print           Print brief contents to stdout
    -h, --help        Show help

By default, prints the brief path. Combine --regen --print to refresh and dump.
`);
}

function run(args: string[]): void {
  let projectRoot = '';
  let workflowDir = '';
  let phase: Phase | null = null;
  let taskId = '';
  let regen = false;
  let printContents = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '-p': case '--path': workflowDir = args[++i]; break;
      case '--phase': {
        const v = args[++i];
        if (!PHASE_NAMES.includes(v as Phase)) {
          console.error(`Error: --phase must be one of ${PHASE_NAMES.join(', ')}`);
          process.exit(1);
        }
        phase = v as Phase;
        break;
      }
      case '--task': taskId = args[++i]; break;
      case '--regen': regen = true; break;
      case '--print': printContents = true; break;
      case '-h': case '--help': showHelp(); process.exit(0);
    }
  }

  if (!projectRoot) {
    console.error('Error: --root is required');
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
  const target = phase ?? state.phase;
  const ctx = taskId ? { taskId } : undefined;

  let file = briefPath(state.workflowDir, target, ctx);

  if (regen) {
    const out = generateBrief(state, target, ctx);
    if (!out) {
      console.error(`No brief generator for phase ${target}`);
      process.exit(1);
    }
    file = out.path;
    state.briefs[target] = file;
    appendHistory(state, { event: 'brief-regen', to: target });
    saveState(state);
    console.log(`✓ Regenerated ${path.relative(projectRoot, file)}`);
  }

  if (!fs.existsSync(file)) {
    console.error(`Brief not found: ${file}`);
    console.error('Run with --regen to create it.');
    process.exit(1);
  }

  if (printContents) {
    console.log(fs.readFileSync(file, 'utf8'));
  } else if (!regen) {
    console.log(file);
  }
}

export const command: Command = {
  description: 'Show or regenerate the curated brief for a phase',
  run,
};
