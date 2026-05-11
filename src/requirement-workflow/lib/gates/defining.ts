import * as path from 'node:path';
import { extractAcceptanceCriteria, readFileOrEmpty, summarizeSpec } from '../markdown.js';
import type { WorkflowState } from '../state.js';

export function gateDefining(state: WorkflowState): string[] {
  const spec = readFileOrEmpty(path.join(state.workflowDir, 'spec.md'));
  const failures: string[] = [];
  if (!spec.trim()) {
    failures.push('spec.md is empty.');
    return failures;
  }
  const acs = extractAcceptanceCriteria(spec);
  const real = acs.filter((ac) => !/<[^>]+>/.test(ac.text));
  if (real.length < 3) {
    failures.push(
      `spec.md has ${real.length} real EARS-format AC(s); need ≥3 (replace the \`<placeholder>\` syntax with concrete text).`,
    );
  }
  const summary = summarizeSpec(spec);
  if (!summary.background) {
    failures.push('spec.md is missing a non-empty `## Background` section.');
  }
  const hasOutOfScope = /##\s+(Out of Scope|超出范围)/i.test(spec);
  if (!hasOutOfScope) {
    failures.push('spec.md is missing a `## Out of Scope` section (write "None" if truly nothing).');
  }
  return failures;
}
