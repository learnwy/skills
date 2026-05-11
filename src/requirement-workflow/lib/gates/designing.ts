import * as path from 'node:path';
import { readFileOrEmpty } from '../markdown.js';
import type { WorkflowState } from '../state.js';

const REQUIRED_SECTIONS = [
  /##\s+Components/i,
  /##\s+Data Flow/i,
  /##\s+API/i,
  /##\s+Trade[-\s]?offs?/i,
  /##\s+(Non[-\s]?Functional|NFR)/i,
];

const SECTION_LABELS = ['Components', 'Data Flow', 'API', 'Trade-offs', 'Non-Functional Requirements'];

export function gateDesigning(state: WorkflowState): string[] {
  const design = readFileOrEmpty(path.join(state.workflowDir, 'design.md'));
  const failures: string[] = [];
  if (!design.trim()) {
    failures.push('design.md is empty.');
    return failures;
  }
  for (let i = 0; i < REQUIRED_SECTIONS.length; i++) {
    if (!REQUIRED_SECTIONS[i].test(design)) {
      failures.push(`design.md is missing the \`## ${SECTION_LABELS[i]}\` section.`);
    }
  }
  return failures;
}
