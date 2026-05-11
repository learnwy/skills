import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractAcceptanceCriteria, extractTasks, readFileOrEmpty } from '../markdown.js';
import { PHASES } from '../phases.js';
import type { WorkflowState } from '../state.js';

function detectConventions(projectRoot: string): string[] {
  const hits: string[] = [];
  const probe = (file: string, label: string): void => {
    if (fs.existsSync(path.join(projectRoot, file))) hits.push(`${label} (\`${file}\`)`);
  };
  probe('package.json', 'Node project');
  probe('pnpm-lock.yaml', 'pnpm');
  probe('tsconfig.json', 'TypeScript');
  probe('biome.json', 'Biome');
  probe('.eslintrc.json', 'ESLint');
  probe('.eslintrc.cjs', 'ESLint');
  probe('vitest.config.ts', 'Vitest');
  probe('rstest.config.ts', 'rstest');
  probe('jest.config.js', 'Jest');
  probe('Cargo.toml', 'Rust');
  probe('go.mod', 'Go');
  probe('pyproject.toml', 'Python (pyproject)');
  return hits;
}

export function generateDesigningBrief(state: WorkflowState): string {
  const spec = readFileOrEmpty(path.join(state.workflowDir, 'spec.md'));
  const tasksMd = readFileOrEmpty(path.join(state.workflowDir, 'tasks.md'));
  const acs = extractAcceptanceCriteria(spec);
  const tasks = extractTasks(tasksMd);
  const conventions = detectConventions(state.projectRoot);

  const lines: string[] = [];
  lines.push('# Brief: DESIGNING');
  lines.push('');
  lines.push(`**Workflow:** ${state.id}  •  **Lifecycle:** ${state.lifecycle}`);
  lines.push('');
  lines.push('## Goal');
  lines.push(PHASES.DESIGNING.purpose);
  lines.push('');
  lines.push('## Acceptance Criteria');
  lines.push('');
  for (const ac of acs) lines.push(`- **${ac.id}** — ${ac.text}`);
  if (acs.length === 0) lines.push('_None — go back to DEFINING._');
  lines.push('');
  lines.push('## Tasks Already Planned');
  lines.push('');
  if (tasks.length === 0) lines.push('_None — go back to PLANNING._');
  for (const t of tasks.slice(0, 20)) {
    const files = t.files.length ? ` _(${t.files.join(', ')})_` : '';
    lines.push(`- ${t.id}: ${t.title}${files}`);
  }
  if (tasks.length > 20) lines.push(`- … ${tasks.length - 20} more`);
  lines.push('');
  if (conventions.length) {
    lines.push('## Project Conventions Detected');
    lines.push('');
    for (const c of conventions) lines.push(`- ${c}`);
    lines.push('');
  }
  lines.push('## What to Produce');
  lines.push('');
  lines.push('Edit `design.md` covering:');
  lines.push('1. **Components** — modules, their responsibilities, owners.');
  lines.push('2. **Data flow** — how information moves between components.');
  lines.push('3. **API contracts** — request/response shapes for new endpoints.');
  lines.push('4. **Key trade-offs** — at least 2, with the option not chosen and why.');
  lines.push('5. **Non-functional requirements** — perf budgets, error handling, observability.');
  lines.push('');
  lines.push('## Gate Criteria');
  lines.push('');
  lines.push('- design.md exists with all five sections above non-empty.');
  lines.push('- design.md mentions every component named in tasks.md `files:` annotations.');
  lines.push('');
  lines.push('## Default Agent');
  lines.push('');
  lines.push(`Run \`${PHASES.DESIGNING.defaultAgent}\`. Optional: \`${PHASES.DESIGNING.optionalAgents.join('`, `')}\`.`);
  return lines.join('\n');
}
