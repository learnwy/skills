import { buildMatrix, writeMatrix } from '../traceability.js';
import type { WorkflowState } from '../state.js';

const MAX_FILES_PER_TASK = 5;

export function gatePlanning(state: WorkflowState): string[] {
  const matrix = buildMatrix(state.workflowDir);
  writeMatrix(state.workflowDir, matrix);
  const failures: string[] = [];

  if (matrix.tasks.length === 0) {
    failures.push('tasks.md has no tasks.');
    return failures;
  }
  const oversized = matrix.tasks.filter((t) => t.files.length > MAX_FILES_PER_TASK);
  if (oversized.length) {
    failures.push(
      `${oversized.length} task(s) touch >${MAX_FILES_PER_TASK} files: ${oversized.map((t) => t.id).join(', ')}.`,
    );
  }
  const annotated = matrix.tasks.filter((t) => t.files.length > 0);
  if (annotated.length === 0) {
    failures.push('No task in tasks.md has a `[files: …]` annotation.');
  }
  if (matrix.acs.length > 0) {
    const unmappedAcs = matrix.rows.filter((r) => r.taskIds.length === 0);
    if (unmappedAcs.length) {
      failures.push(
        `${unmappedAcs.length} AC(s) have no mapped task: ${unmappedAcs.map((r) => r.acId).join(', ')}.`,
      );
    }
  }
  return failures;
}
