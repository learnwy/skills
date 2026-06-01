import * as path from 'node:path';
import type { Command } from '../../shared/cli.js';
import { buildMatrix, renderMatrix, writeMatrix } from '../lib/traceability.js';
import { getActiveWorkflowDir, loadState } from '../lib/state.js';

function showHelp(): void {
  console.log(`Usage: cli.cjs trace -r <root> [OPTIONS]

Rebuild and print the AC ↔ task ↔ files traceability matrix.

Options:
    -r, --root DIR    Project root (REQUIRED)
    -p, --path DIR    Specific workflow path
    --json            Machine-readable output (no file write)
    --print           Print rendered Markdown instead of writing
    -h, --help        Show help
`);
}

function run(args: string[]): void {
  let projectRoot = '';
  let workflowDir = '';
  let asJson = false;
  let printOnly = false;
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '-p': case '--path': workflowDir = args[++i]; break;
      case '--json': asJson = true; break;
      case '--print': printOnly = true; break;
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
  const matrix = buildMatrix(workflowDir);
  if (asJson) {
    console.log(JSON.stringify(matrix, null, 2));
    return;
  }
  if (printOnly) {
    console.log(renderMatrix(matrix));
    return;
  }
  const file = writeMatrix(workflowDir, matrix);
  console.log(`✓ Wrote ${path.relative(projectRoot, file)}`);
  console.log(`AC:    ${matrix.rows.filter((r) => r.acDone).length} / ${matrix.acs.length} verified`);
  console.log(`Tasks: ${matrix.tasks.filter((t) => t.checked).length} / ${matrix.tasks.length} done`);
  if (matrix.unmappedTasks.length) {
    console.log(`Unmapped: ${matrix.unmappedTasks.map((t) => t.id).join(', ')}`);
  }
}

export const command: Command = {
  description: 'Rebuild the AC ↔ task ↔ files traceability matrix',
  run,
};
