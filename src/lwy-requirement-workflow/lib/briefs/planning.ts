import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractAcceptanceCriteria, readFileOrEmpty, summarizeSpec } from '../markdown.js';
import { PHASES } from '../phases.js';
import type { WorkflowState } from '../state.js';

function topLevelDirs(projectRoot: string): string[] {
  if (!fs.existsSync(projectRoot)) return [];
  const skip = new Set(['node_modules', '.git', 'dist', '.next', '.cache', 'coverage', '.turbo', '.trae', '.claude']);
  return fs
    .readdirSync(projectRoot)
    .filter((entry) => {
      if (skip.has(entry)) return false;
      if (entry.startsWith('.')) return false;
      try {
        return fs.statSync(path.join(projectRoot, entry)).isDirectory();
      } catch {
        return false;
      }
    })
    .slice(0, 12);
}

export function generatePlanningBrief(state: WorkflowState): string {
  const spec = readFileOrEmpty(path.join(state.workflowDir, 'spec.md'));
  const acs = extractAcceptanceCriteria(spec);
  const summary = summarizeSpec(spec);
  const dirs = topLevelDirs(state.projectRoot);

  const lines: string[] = [];
  lines.push('# Brief: PLANNING');
  lines.push('');
  lines.push(`**Workflow:** ${state.id}  •  **Lifecycle:** ${state.lifecycle}`);
  lines.push('');
  lines.push('## Goal');
  lines.push(PHASES.PLANNING.purpose);
  lines.push('');
  lines.push('## Spec Summary');
  if (summary.background) {
    lines.push('');
    lines.push('**Background:** ' + summary.background.split(/\n/).slice(0, 4).join(' '));
  }
  if (summary.scopeIn.length) {
    lines.push('');
    lines.push('**In scope:**');
    for (const item of summary.scopeIn.slice(0, 8)) lines.push(`- ${item}`);
  }
  if (summary.scopeOut.length) {
    lines.push('');
    lines.push('**Out of scope:**');
    for (const item of summary.scopeOut.slice(0, 8)) lines.push(`- ${item}`);
  }
  lines.push('');
  lines.push('## Acceptance Criteria to Cover');
  lines.push('');
  if (acs.length === 0) {
    lines.push('_No EARS-format acceptance criteria found in spec.md. Go back to DEFINING._');
  } else {
    for (const ac of acs) lines.push(`- **${ac.id}** — ${ac.text}`);
  }
  lines.push('');
  lines.push('## Code Map (top-level directories)');
  lines.push('');
  for (const dir of dirs) lines.push(`- \`${dir}/\``);
  if (dirs.length === 0) lines.push('_(none discovered)_');
  lines.push('');
  lines.push('## What to Produce');
  lines.push('');
  lines.push('Edit `tasks.md` so that:');
  lines.push('1. Tasks are grouped under `## Phase 1`, `## Phase 2`, … sections.');
  lines.push('2. Each task is `- [ ] <id>: <title> [files: a, b]`.');
  lines.push('3. Every AC above maps to **at least one** task. Use IDs like `1.1`, `1.2`, `2.1`.');
  lines.push('4. No task touches more than 5 files (split if it does).');
  lines.push('');
  lines.push('## Gate Criteria');
  lines.push('');
  lines.push('- Every AC in spec.md is referenced by ≥1 task in `traceability.md`.');
  lines.push('- No task lists more than 5 files.');
  lines.push('- ≥1 task with non-empty `files:` annotation.');
  lines.push('');
  lines.push('## Default Agent');
  lines.push('');
  lines.push(`Run \`${PHASES.PLANNING.defaultAgent}\`. Optional: \`${PHASES.PLANNING.optionalAgents.join('`, `')}\`.`);
  return lines.join('\n');
}
