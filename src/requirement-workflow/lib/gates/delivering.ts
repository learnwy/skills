import * as path from 'node:path';
import { readFileOrEmpty } from '../markdown.js';
import { buildMatrix } from '../traceability.js';
import type { WorkflowState } from '../state.js';

const REQUIRED_SECTIONS = [
  /##\s+(What\s+shipped|Summary)/i,
  /##\s+Files\s+changed/i,
  /##\s+AC\s+verification/i,
  /##\s+(Open\s+issues|Follow[-\s]?ups)/i,
  /##\s+(How\s+to\s+demo|Demo)/i,
];

const SECTION_LABELS = ['What shipped', 'Files changed', 'AC verification', 'Open issues', 'How to demo'];

export function gateDelivering(state: WorkflowState): string[] {
  const summary = readFileOrEmpty(path.join(state.workflowDir, 'summary.md'));
  const failures: string[] = [];
  if (!summary.trim()) {
    failures.push('summary.md is empty.');
    return failures;
  }
  for (let i = 0; i < REQUIRED_SECTIONS.length; i++) {
    if (!REQUIRED_SECTIONS[i].test(summary)) {
      failures.push(`summary.md is missing the \`## ${SECTION_LABELS[i]}\` section.`);
    }
  }
  const matrix = buildMatrix(state.workflowDir);
  if (matrix.acs.length > 0) {
    const unverified = matrix.rows.filter((r) => !r.acDone);
    if (unverified.length) {
      failures.push(
        `${unverified.length} AC(s) not yet ticked in spec.md: ${unverified.map((r) => r.acId).join(', ')}.`,
      );
    }
    if (matrix.unmappedTasks.length) {
      failures.push(`${matrix.unmappedTasks.length} task(s) not mapped to any AC.`);
    }
  }
  return failures;
}
