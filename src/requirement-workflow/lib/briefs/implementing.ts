import * as path from 'node:path';
import { extractTasks, readFileOrEmpty, type TaskItem } from '../markdown.js';
import { PHASES } from '../phases.js';
import type { WorkflowState } from '../state.js';

function pickTask(tasks: TaskItem[], requestedId?: string): TaskItem | null {
  if (requestedId) {
    const exact = tasks.find((t) => t.id === requestedId);
    if (exact) return exact;
  }
  const next = tasks.find((t) => !t.checked);
  return next ?? null;
}

export function generateImplementingBrief(state: WorkflowState, taskId?: string): string | null {
  const tasksMd = readFileOrEmpty(path.join(state.workflowDir, 'tasks.md'));
  const allTasks = extractTasks(tasksMd);
  const task = pickTask(allTasks, taskId);

  const lines: string[] = [];
  lines.push('# Brief: IMPLEMENTING');
  lines.push('');
  lines.push(`**Workflow:** ${state.id}  •  **Lifecycle:** ${state.lifecycle}`);
  lines.push('');
  if (!task) {
    lines.push('## No tasks to implement');
    lines.push('');
    lines.push('Either tasks.md is empty (go back to PLANNING) or every task is already checked off.');
    lines.push('Run `cli.cjs advance` to move to TESTING.');
    return lines.join('\n');
  }

  lines.push('## Current Task');
  lines.push('');
  lines.push(`- **ID:** ${task.id}`);
  lines.push(`- **Title:** ${task.title}`);
  if (task.phase) lines.push(`- **Phase block:** ${task.phase}`);
  if (task.files.length) {
    lines.push(`- **Files to touch:** ${task.files.map((f) => `\`${f}\``).join(', ')}`);
  } else {
    lines.push('- **Files:** _not annotated — list them in tasks.md before starting._');
  }
  lines.push('');
  lines.push('## Constraint');
  lines.push('');
  lines.push('Implement **only** this task. Other unchecked tasks are out of scope for this brief.');
  lines.push('When complete:');
  lines.push('1. Mark this task `[x]` in tasks.md.');
  lines.push('2. Run `node scripts/cli.cjs trace` to refresh the traceability matrix.');
  lines.push('3. Pick the next unchecked task and regenerate this brief: `cli.cjs brief --regen`.');
  lines.push('');
  lines.push('## Suggested Reading Before You Start');
  lines.push('');
  if (task.files.length) {
    lines.push('Read these files first to align with existing patterns:');
    for (const f of task.files) lines.push(`- \`${f}\``);
  } else {
    lines.push('Annotate this task with `[files: …]` in tasks.md, then regenerate this brief.');
  }
  lines.push('');
  lines.push('## Gate Criteria (when leaving IMPLEMENTING)');
  lines.push('');
  lines.push('- Every task in tasks.md is checked `[x]`.');
  lines.push('- traceability.md has no entries marked `(unmapped)`.');
  lines.push('');
  lines.push('## Remaining Tasks');
  lines.push('');
  for (const t of allTasks) {
    const mark = t.checked ? '[x]' : '[ ]';
    lines.push(`- ${mark} ${t.id}: ${t.title}`);
  }
  lines.push('');
  lines.push('## Default Agent');
  lines.push('');
  lines.push(`Run \`${PHASES.IMPLEMENTING.defaultAgent}\` for TDD-discipline tasks. Optional: \`${PHASES.IMPLEMENTING.optionalAgents.join('`, `')}\`.`);
  return lines.join('\n');
}
