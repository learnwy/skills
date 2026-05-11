import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractAcceptanceCriteria, extractTasks, readFileOrEmpty } from '../markdown.js';
import { PHASES } from '../phases.js';
import type { WorkflowState } from '../state.js';

function detectTestRunner(projectRoot: string): string {
  const exists = (p: string): boolean => fs.existsSync(path.join(projectRoot, p));
  if (exists('rstest.config.ts')) return 'pnpm test';
  if (exists('vitest.config.ts')) return 'pnpm vitest run';
  if (exists('jest.config.js') || exists('jest.config.ts')) return 'pnpm jest';
  if (exists('Cargo.toml')) return 'cargo test';
  if (exists('go.mod')) return 'go test ./...';
  if (exists('pyproject.toml')) return 'pytest';
  return '(no recognised test runner — set the project standard)';
}

function detectLinter(projectRoot: string): string {
  const exists = (p: string): boolean => fs.existsSync(path.join(projectRoot, p));
  if (exists('biome.json')) return 'pnpm biome check .';
  if (exists('.eslintrc.json') || exists('.eslintrc.cjs')) return 'pnpm eslint .';
  if (exists('Cargo.toml')) return 'cargo clippy';
  if (exists('pyproject.toml')) return 'ruff check .';
  return '(no linter detected)';
}

export function generateTestingBrief(state: WorkflowState): string {
  const spec = readFileOrEmpty(path.join(state.workflowDir, 'spec.md'));
  const tasksMd = readFileOrEmpty(path.join(state.workflowDir, 'tasks.md'));
  const acs = extractAcceptanceCriteria(spec);
  const tasks = extractTasks(tasksMd);

  const changed = new Set<string>();
  for (const t of tasks) for (const f of t.files) changed.add(f);

  const lines: string[] = [];
  lines.push('# Brief: TESTING');
  lines.push('');
  lines.push(`**Workflow:** ${state.id}  •  **Lifecycle:** ${state.lifecycle}`);
  lines.push('');
  lines.push('## Goal');
  lines.push(PHASES.TESTING.purpose);
  lines.push('');
  lines.push('## Files Touched in this Workflow');
  lines.push('');
  if (changed.size === 0) {
    lines.push('_No files annotated in tasks.md._');
  } else {
    for (const f of [...changed].sort()) lines.push(`- \`${f}\``);
  }
  lines.push('');
  lines.push('## Acceptance Criteria to Verify');
  lines.push('');
  if (acs.length === 0) {
    lines.push('_No spec.md (lite lifecycle). Verify against the user request directly._');
  } else {
    for (const ac of acs) lines.push(`- ${ac.checked ? '✓' : '·'} **${ac.id}** — ${ac.text}`);
  }
  lines.push('');
  lines.push('## Suggested Commands');
  lines.push('');
  lines.push(`- Lint: \`${detectLinter(state.projectRoot)}\``);
  lines.push(`- Tests: \`${detectTestRunner(state.projectRoot)}\``);
  lines.push('');
  lines.push('## What to Produce');
  lines.push('');
  lines.push('Update `checklist.md`:');
  lines.push('1. Tick `Implementation complete` once every task in tasks.md is `[x]`.');
  lines.push('2. Tick `Lint clean` after the lint command passes.');
  lines.push('3. Tick `Type check pass` after `pnpm tsc --noEmit` (or equivalent).');
  lines.push('4. Tick each AC line under `## Acceptance Criteria` after manual or automated verification.');
  lines.push('');
  lines.push('## Gate Criteria');
  lines.push('');
  lines.push('- Every checkbox in checklist.md is `[x]`.');
  lines.push('- traceability.md shows every AC with `Tasks done: ✓`.');
  lines.push('');
  lines.push('## Default Agent');
  lines.push('');
  lines.push(`Run \`${PHASES.TESTING.defaultAgent}\`. Optional: \`${PHASES.TESTING.optionalAgents.join('`, `')}\`.`);
  return lines.join('\n');
}
