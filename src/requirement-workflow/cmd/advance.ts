import * as path from 'node:path';
import type { Command } from '../../shared/cli.js';
import { generateBrief } from '../lib/briefs/index.js';
import { runGate } from '../lib/gates/index.js';
import { PHASES, nextPhase } from '../lib/phases.js';
import {
  appendHistory,
  getActiveWorkflowDir,
  loadState,
  recordGate,
  saveState,
} from '../lib/state.js';

function showHelp(): void {
  console.log(`Usage: cli.cjs advance -r <root> [OPTIONS]

Run the current-phase gate; if it passes, generate the next brief and transition.

Options:
    -r, --root DIR    Project root (REQUIRED)
    -p, --path DIR    Specific workflow path (default: active workflow)
    --force           Skip gate failures and advance anyway
    --skip-brief      Do not regenerate the next-phase brief
    -h, --help        Show help
`);
}

async function run(args: string[]): Promise<void> {
  let projectRoot = '';
  let workflowDir = '';
  let force = false;
  let skipBrief = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '-p': case '--path': workflowDir = args[++i]; break;
      case '--force': force = true; break;
      case '--skip-brief': skipBrief = true; break;
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
      console.error('Error: no active workflow. Run `cli.cjs init` first.');
      process.exit(1);
    }
    workflowDir = dir;
  }

  const state = loadState(workflowDir);
  if (!state) {
    console.error(`Error: state.json not found or unreadable in ${workflowDir}`);
    process.exit(1);
  }

  const next = nextPhase(state.lifecycle, state.phase);
  if (!next) {
    console.log(`Workflow already at terminal phase: ${state.phase}`);
    return;
  }

  console.log(`Workflow: ${state.id}`);
  console.log(`Lifecycle: ${state.lifecycle}`);
  console.log(`Transition: ${state.phase} → ${next}`);
  console.log('');

  const gate = runGate(state, state.phase);
  recordGate(state, gate);
  if (!gate.ok) {
    console.error(`✘ Gate failed for ${state.phase}:`);
    for (const f of gate.failures) console.error(`  - ${f}`);
    if (!force) {
      saveState(state);
      console.error('');
      console.error('Fix and retry, or rerun with --force.');
      process.exit(2);
    }
    console.error('⚠ Forcing advance despite gate failures.');
  } else {
    console.log(`✓ Gate passed for ${state.phase}`);
  }

  const from = state.phase;
  state.phase = next;
  appendHistory(state, { event: 'advance', from, to: next });

  if (!skipBrief) {
    const brief = generateBrief(state, next);
    if (brief) {
      state.briefs[next] = brief.path;
      appendHistory(state, { event: 'brief-regen', to: next });
      console.log(`📝 Brief written: ${path.relative(projectRoot, brief.path)}`);
    }
  }

  saveState(state);

  console.log('');
  console.log(`→ ${PHASES[next].hint}`);
  if (PHASES[next].defaultAgent) {
    console.log(`→ Default agent: ${PHASES[next].defaultAgent}`);
  }
  if (PHASES[next].checkpoint === 'always') {
    console.log('⏸  Checkpoint phase — review the brief with the user before continuing.');
  }
}

export const command: Command = {
  description: 'Run the current-phase gate and transition to the next phase',
  run,
};
