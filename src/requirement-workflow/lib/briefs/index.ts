import * as fs from 'node:fs';
import * as path from 'node:path';
import { ensureDir } from '../../../shared/fs-utils.js';
import type { Phase } from '../phases.js';
import type { WorkflowState } from '../state.js';
import { generateDefiningBrief } from './defining.js';
import { generatePlanningBrief } from './planning.js';
import { generateDesigningBrief } from './designing.js';
import { generateImplementingBrief } from './implementing.js';
import { generateTestingBrief } from './testing.js';
import { generateDeliveringBrief } from './delivering.js';

export interface BriefContext {
  taskId?: string;
}

export function briefDir(workflowDir: string): string {
  return path.join(workflowDir, 'briefs');
}

export function briefPath(workflowDir: string, phase: Phase, ctx?: BriefContext): string {
  if (phase === 'IMPLEMENTING' && ctx?.taskId) {
    return path.join(briefDir(workflowDir), `IMPLEMENTING-${ctx.taskId}.md`);
  }
  return path.join(briefDir(workflowDir), `${phase}.md`);
}

export function generateBrief(
  state: WorkflowState,
  phase: Phase,
  ctx?: BriefContext,
): { path: string; content: string } | null {
  let content: string | null;
  switch (phase) {
    case 'DEFINING':
      content = generateDefiningBrief(state);
      break;
    case 'PLANNING':
      content = generatePlanningBrief(state);
      break;
    case 'DESIGNING':
      content = generateDesigningBrief(state);
      break;
    case 'IMPLEMENTING':
      content = generateImplementingBrief(state, ctx?.taskId);
      break;
    case 'TESTING':
      content = generateTestingBrief(state);
      break;
    case 'DELIVERING':
      content = generateDeliveringBrief(state);
      break;
    default:
      return null;
  }
  if (content === null) return null;
  const file = briefPath(state.workflowDir, phase, ctx);
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
  return { path: file, content };
}
