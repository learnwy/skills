import * as path from 'node:path';
import { readFileOrEmpty } from '../markdown.js';
import { buildMatrix, writeMatrix } from '../traceability.js';
import type { WorkflowState } from '../state.js';

const CHECKBOX_RE = /^\s*[-*]\s*\[([ xX])\]/;

export function gateTesting(state: WorkflowState): string[] {
  const checklist = readFileOrEmpty(path.join(state.workflowDir, 'checklist.md'));
  const failures: string[] = [];
  if (!checklist.trim()) {
    failures.push('checklist.md is empty.');
    return failures;
  }
  let total = 0;
  let unchecked = 0;
  for (const line of checklist.split(/\r?\n/)) {
    const m = line.match(CHECKBOX_RE);
    if (!m) continue;
    total += 1;
    if (m[1] === ' ') unchecked += 1;
  }
  if (total === 0) {
    failures.push('checklist.md has no checkbox items.');
  } else if (unchecked > 0) {
    failures.push(`${unchecked} of ${total} checklist item(s) still unchecked.`);
  }
  const matrix = buildMatrix(state.workflowDir);
  writeMatrix(state.workflowDir, matrix);
  if (matrix.acs.length > 0) {
    const incomplete = matrix.rows.filter((r) => !r.tasksDone);
    if (incomplete.length) {
      failures.push(
        `${incomplete.length} AC(s) not fully covered by completed tasks: ${incomplete.map((r) => r.acId).join(', ')}.`,
      );
    }
  }
  return failures;
}
