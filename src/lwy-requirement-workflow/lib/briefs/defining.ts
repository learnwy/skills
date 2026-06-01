import * as path from 'node:path';
import { readFileOrEmpty } from '../markdown.js';
import { PHASES } from '../phases.js';
import type { WorkflowState } from '../state.js';

const RISK_KEYWORDS = [
  'auth', 'authentication', 'authorize', 'oauth', 'jwt', 'session', 'token', 'login', 'signin', 'signup', 'password',
  'payment', 'charge', 'invoice', 'refund', 'stripe', 'billing',
  'crypto', 'encrypt', 'decrypt', 'hash', 'signature',
  'pii', 'personal', 'gdpr', 'hipaa',
  'admin', 'permission', 'role', 'rbac',
  'sql', 'injection', 'xss', 'csrf',
  'migration', 'schema', 'drop table',
];

function detectRiskKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const hits = new Set<string>();
  for (const kw of RISK_KEYWORDS) {
    if (lower.includes(kw)) hits.add(kw);
  }
  return [...hits];
}

export function generateDefiningBrief(state: WorkflowState): string {
  const spec = readFileOrEmpty(path.join(state.workflowDir, 'spec.md'));
  const risks = detectRiskKeywords(`${state.name} ${state.description}`);
  const lines: string[] = [];
  lines.push('# Brief: DEFINING');
  lines.push('');
  lines.push(`**Workflow:** ${state.id}  •  **Lifecycle:** ${state.lifecycle}`);
  lines.push('');
  lines.push('## Goal');
  lines.push(PHASES.DEFINING.purpose);
  lines.push('');
  lines.push('## User Request');
  lines.push(`> ${state.name}`);
  if (state.description) {
    lines.push('');
    for (const para of state.description.split(/\n+/)) lines.push(`> ${para}`);
  }
  lines.push('');
  if (risks.length) {
    lines.push('## ⚠️ Risk Keywords Detected');
    lines.push('');
    lines.push(`Words found in the request that flag elevated risk: \`${risks.join('`, `')}\``);
    lines.push('');
    lines.push('Treat AC reviews as mandatory checkpoints; consider running `risk-auditor` (optional agent).');
    lines.push('');
  }
  lines.push('## What to Produce');
  lines.push('');
  lines.push('Edit `spec.md` so that it contains:');
  lines.push('');
  lines.push('1. **Background** — one short paragraph: the problem, not the solution.');
  lines.push('2. **Scope** — `In:` and `Out:` bullet lists.');
  lines.push('3. **Acceptance Criteria** — at least 3 in EARS format:');
  lines.push('   - `When <trigger>, the system shall <response>`');
  lines.push('   - `While <state>, the system shall <behavior>`');
  lines.push('   - `Where <constraint>, the system shall <limit>`');
  lines.push('4. **Constraints** — performance, security, compatibility.');
  lines.push('5. **Out of Scope** — what we explicitly will not do.');
  lines.push('');
  lines.push('## Gate Criteria');
  lines.push('');
  lines.push('`cli.cjs advance` will block until:');
  lines.push('- spec.md has ≥3 EARS-format acceptance criteria.');
  lines.push('- Background section is non-empty.');
  lines.push('- Out-of-Scope section is non-empty (write "None" if truly nothing).');
  lines.push('');
  lines.push('## Default Agent');
  lines.push('');
  lines.push(`Run \`${PHASES.DEFINING.defaultAgent}\` first; escalate to \`${PHASES.DEFINING.optionalAgents.join('`, `')}\` if needed.`);
  lines.push('');
  if (spec.trim()) {
    lines.push('## Current spec.md');
    lines.push('');
    lines.push('```markdown');
    lines.push(spec);
    lines.push('```');
  }
  return lines.join('\n');
}
