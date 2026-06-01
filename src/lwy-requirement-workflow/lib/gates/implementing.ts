import { buildMatrix, writeMatrix } from '../traceability.js';
import type { WorkflowState } from '../state.js';

export function gateImplementing(state: WorkflowState): string[] {
  const matrix = buildMatrix(state.workflowDir);
  writeMatrix(state.workflowDir, matrix);
  const failures: string[] = [];

  if (matrix.tasks.length === 0) {
    failures.push('tasks.md has no tasks. Cannot leave IMPLEMENTING with nothing planned.');
    return failures;
  }
  const open = matrix.tasks.filter((t) => !t.checked);
  if (open.length) {
    const sample = open.slice(0, 5).map((t) => t.id).join(', ');
    failures.push(`${open.length} task(s) still open: ${sample}${open.length > 5 ? ', …' : ''}.`);
  }
  if (matrix.acs.length > 0 && matrix.unmappedTasks.length) {
    failures.push(
      `${matrix.unmappedTasks.length} task(s) are not mapped to any AC. Edit traceability.md or add ACs.`,
    );
  }
  return failures;
}
