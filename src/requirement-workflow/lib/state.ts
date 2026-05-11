import * as fs from 'node:fs';
import * as path from 'node:path';
import { ensureDir, nowIso, readJsonSafe, writeJson } from '../../shared/fs-utils.js';
import { LIFECYCLES, type Lifecycle, type Phase, isValidLifecycle } from './phases.js';

export const SCHEMA_VERSION = 5 as const;

export interface GateResult {
  phase: Phase;
  ok: boolean;
  failures: string[];
  checkedAt: string;
}

export type HistoryEvent =
  | 'init'
  | 'advance'
  | 'escalate'
  | 'gate-fail'
  | 'gate-pass'
  | 'brief-regen'
  | 'checkpoint-skip';

export interface HistoryEntry {
  ts: string;
  event: HistoryEvent;
  from?: Phase;
  to?: Phase;
  reason?: string;
}

export interface WorkflowState {
  schemaVersion: typeof SCHEMA_VERSION;
  id: string;
  name: string;
  description: string;
  lifecycle: Lifecycle;
  phase: Phase;
  projectRoot: string;
  workflowDir: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  history: HistoryEntry[];
  briefs: Partial<Record<Phase, string>>;
  lastGate?: GateResult;
}

export function workflowBase(projectRoot: string): string {
  return path.join(projectRoot, '.trae', 'workflow');
}

export function activePointerFile(projectRoot: string): string {
  return path.join(projectRoot, '.trae', 'active_workflow');
}

export function stateFile(workflowDir: string): string {
  return path.join(workflowDir, 'state.json');
}

export function newId(projectRoot: string, name: string): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'workflow';
  const base = workflowBase(projectRoot);
  let maxSeq = 0;
  if (fs.existsSync(base)) {
    for (const dir of fs.readdirSync(base)) {
      if (!dir.startsWith(dateStr + '_')) continue;
      const parts = dir.split('_');
      const seq = Number.parseInt(parts[1], 10);
      if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
    }
  }
  const seq = String(maxSeq + 1).padStart(3, '0');
  return `${dateStr}_${seq}_${safeName}`;
}

export function createState(opts: {
  projectRoot: string;
  name: string;
  description: string;
  lifecycle: Lifecycle;
  tags: string[];
}): WorkflowState {
  const id = newId(opts.projectRoot, opts.name);
  const workflowDir = path.join(workflowBase(opts.projectRoot), id);
  const ts = nowIso();
  return {
    schemaVersion: SCHEMA_VERSION,
    id,
    name: opts.name,
    description: opts.description,
    lifecycle: opts.lifecycle,
    phase: 'INIT',
    projectRoot: opts.projectRoot,
    workflowDir,
    createdAt: ts,
    updatedAt: ts,
    tags: opts.tags,
    history: [{ ts, event: 'init', to: 'INIT' }],
    briefs: {},
  };
}

export function loadState(workflowDir: string): WorkflowState | null {
  const file = stateFile(workflowDir);
  if (!fs.existsSync(file)) return null;
  const data = readJsonSafe<Partial<WorkflowState> | null>(file, null);
  if (!data || data.schemaVersion !== SCHEMA_VERSION) return null;
  return data as WorkflowState;
}

export function saveState(state: WorkflowState): void {
  state.updatedAt = nowIso();
  writeJson(stateFile(state.workflowDir), state);
}

export function setActiveWorkflow(projectRoot: string, workflowDir: string): void {
  const file = activePointerFile(projectRoot);
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, workflowDir);
}

export function getActiveWorkflowDir(projectRoot: string): string | null {
  const file = activePointerFile(projectRoot);
  if (!fs.existsSync(file)) return null;
  const dir = fs.readFileSync(file, 'utf8').trim();
  if (!dir || !fs.existsSync(dir)) return null;
  return dir;
}

export function appendHistory(state: WorkflowState, entry: Omit<HistoryEntry, 'ts'>): void {
  state.history.push({ ts: nowIso(), ...entry });
}

export function escalateLifecycle(
  state: WorkflowState,
  target: Lifecycle,
  reason: string,
): { changed: boolean; from: Lifecycle } {
  if (!isValidLifecycle(target)) throw new Error(`Invalid lifecycle: ${target}`);
  const rank: Record<Lifecycle, number> = { lite: 0, standard: 1, full: 2 };
  if (rank[target] <= rank[state.lifecycle]) {
    return { changed: false, from: state.lifecycle };
  }
  const from = state.lifecycle;
  state.lifecycle = target;
  appendHistory(state, { event: 'escalate', reason, from: state.phase, to: state.phase });
  return { changed: true, from };
}

export function lifecyclePhases(lifecycle: Lifecycle): Phase[] {
  return LIFECYCLES[lifecycle];
}

export function recordGate(state: WorkflowState, result: GateResult): void {
  state.lastGate = result;
  appendHistory(state, {
    event: result.ok ? 'gate-pass' : 'gate-fail',
    to: result.phase,
    reason: result.ok ? undefined : result.failures.join('; '),
  });
}
