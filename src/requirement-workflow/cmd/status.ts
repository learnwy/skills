import * as path from 'node:path';
import type { Command } from '../../shared/cli.js';
import { LIFECYCLES, PHASES, nextPhase } from '../lib/phases.js';
import { buildMatrix } from '../lib/traceability.js';
import { getActiveWorkflowDir, loadState } from '../lib/state.js';

function showHelp(): void {
  console.log(`Usage: cli.cjs status -r <root> [OPTIONS]

Show the active workflow's phase, brief, gate, and traceability summary.

Options:
    -r, --root DIR    Project root (REQUIRED)
    -p, --path DIR    Specific workflow path
    --json            Machine-readable output
    -h, --help        Show help
`);
}

function progressBar(idx: number, total: number): string {
  const pct = total <= 1 ? 100 : Math.round((idx / (total - 1)) * 100);
  const width = 20;
  const filled = Math.round((pct * width) / 100);
  return `[${'█'.repeat(filled)}${'░'.repeat(width - filled)}] ${pct}%`;
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function run(args: string[]): void {
  let projectRoot = '';
  let workflowDir = '';
  let asJson = false;
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '-p': case '--path': workflowDir = args[++i]; break;
      case '--json': asJson = true; break;
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
      console.error('No active workflow. Run `cli.cjs init` to start one.');
      process.exit(1);
    }
    workflowDir = dir;
  }
  const state = loadState(workflowDir);
  if (!state) {
    console.error(`state.json not found in ${workflowDir}`);
    process.exit(1);
  }

  const phases = LIFECYCLES[state.lifecycle];
  const idx = phases.indexOf(state.phase);
  const matrix = buildMatrix(workflowDir);
  const briefPath = state.briefs[state.phase];

  if (asJson) {
    console.log(JSON.stringify({
      id: state.id,
      name: state.name,
      lifecycle: state.lifecycle,
      phase: state.phase,
      next: nextPhase(state.lifecycle, state.phase),
      lifecyclePhases: phases,
      brief: briefPath ? path.relative(projectRoot, briefPath) : null,
      lastGate: state.lastGate,
      ac: { total: matrix.acs.length, done: matrix.rows.filter((r) => r.acDone).length },
      tasks: { total: matrix.tasks.length, done: matrix.tasks.filter((t) => t.checked).length },
      unmappedTasks: matrix.unmappedTasks.length,
    }, null, 2));
    return;
  }

  const created = new Date(state.createdAt).getTime();
  console.log('═══════════════════════════════════════════');
  console.log(`📋 ${state.name}`);
  console.log('═══════════════════════════════════════════');
  console.log(`ID:        ${state.id}`);
  console.log(`Lifecycle: ${state.lifecycle}`);
  console.log(`Phase:     ${state.phase}  (${PHASES[state.phase].purpose})`);
  console.log(`Path:      ${phases.join(' → ')}`);
  console.log(`Progress:  ${progressBar(idx, phases.length)}`);
  console.log(`Age:       ${formatDuration(Date.now() - created)}`);
  console.log('');

  if (briefPath) {
    console.log(`Brief:     ${path.relative(projectRoot, briefPath)}`);
  } else {
    console.log('Brief:     (none — run `cli.cjs brief --regen`)');
  }

  if (state.lastGate) {
    const tag = state.lastGate.ok ? '✓ pass' : '✘ fail';
    console.log(`Last gate: ${state.lastGate.phase} ${tag}`);
    if (!state.lastGate.ok) {
      for (const f of state.lastGate.failures) console.log(`           - ${f}`);
    }
  }

  console.log('');
  console.log(`AC:        ${matrix.rows.filter((r) => r.acDone).length} / ${matrix.acs.length} verified`);
  console.log(`Tasks:     ${matrix.tasks.filter((t) => t.checked).length} / ${matrix.tasks.length} done`);
  if (matrix.unmappedTasks.length) {
    console.log(`Unmapped:  ${matrix.unmappedTasks.length} task(s) without an AC`);
  }
  console.log('');
  console.log(`→ ${PHASES[state.phase].hint}`);
  if (PHASES[state.phase].defaultAgent) {
    console.log(`→ Default agent: ${PHASES[state.phase].defaultAgent}`);
  }
}

export const command: Command = {
  description: 'Show active workflow status, brief, and traceability summary',
  run,
};
