import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractAcceptanceCriteria, extractTasks, readFileOrEmpty, type AcceptanceCriterion, type TaskItem } from './markdown.js';

export interface TraceRow {
  acId: string;
  acText: string;
  taskIds: string[];
  taskFiles: string[];
  acDone: boolean;
  tasksDone: boolean;
}

export interface TraceMatrix {
  rows: TraceRow[];
  unmappedTasks: TaskItem[];
  acs: AcceptanceCriterion[];
  tasks: TaskItem[];
}

const MAP_RE = /^\s*[-*]\s*(AC-\d+)\s*[→\->]+\s*(.+)$/;

function parseExistingMap(traceMarkdown: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const raw of traceMarkdown.split(/\r?\n/)) {
    const m = raw.match(MAP_RE);
    if (!m) continue;
    const ac = m[1];
    const tasks = m[2].split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    map.set(ac, tasks);
  }
  return map;
}

function autoMapByOrder(acs: AcceptanceCriterion[], tasks: TaskItem[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (acs.length === 0 || tasks.length === 0) return map;
  for (let i = 0; i < acs.length; i++) {
    const ac = acs[i];
    const taskIds: string[] = [];
    if (i < tasks.length) taskIds.push(tasks[i].id);
    map.set(ac.id, taskIds);
  }
  return map;
}

export function buildMatrix(workflowDir: string): TraceMatrix {
  const spec = readFileOrEmpty(path.join(workflowDir, 'spec.md'));
  const tasksMd = readFileOrEmpty(path.join(workflowDir, 'tasks.md'));
  const traceMd = readFileOrEmpty(path.join(workflowDir, 'traceability.md'));

  const acs = extractAcceptanceCriteria(spec);
  const tasks = extractTasks(tasksMd);

  const existing = parseExistingMap(traceMd);
  const autoMap = autoMapByOrder(acs, tasks);

  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const usedTaskIds = new Set<string>();

  const rows: TraceRow[] = acs.map((ac) => {
    const taskIds = (existing.get(ac.id) ?? autoMap.get(ac.id) ?? []).filter((id) => taskById.has(id));
    const taskFiles = new Set<string>();
    let allDone = taskIds.length > 0;
    for (const id of taskIds) {
      usedTaskIds.add(id);
      const t = taskById.get(id);
      if (!t) continue;
      for (const f of t.files) taskFiles.add(f);
      if (!t.checked) allDone = false;
    }
    return {
      acId: ac.id,
      acText: ac.text,
      taskIds,
      taskFiles: [...taskFiles],
      acDone: ac.checked,
      tasksDone: allDone,
    };
  });

  const unmappedTasks = tasks.filter((t) => !usedTaskIds.has(t.id));
  return { rows, unmappedTasks, acs, tasks };
}

export function renderMatrix(matrix: TraceMatrix): string {
  const lines: string[] = [];
  lines.push('# Traceability Matrix');
  lines.push('');
  lines.push('Auto-generated. Edit the `AC → tasks` lines to override the default mapping.');
  lines.push('');
  lines.push('## AC → Tasks');
  lines.push('');
  if (matrix.rows.length === 0) {
    lines.push('_No acceptance criteria found in spec.md._');
  } else {
    for (const row of matrix.rows) {
      const taskList = row.taskIds.length ? row.taskIds.join(', ') : '— (unmapped)';
      lines.push(`- ${row.acId} → ${taskList}`);
    }
  }
  lines.push('');
  lines.push('## Detail');
  lines.push('');
  lines.push('| AC | Tasks | Files | AC done | Tasks done |');
  lines.push('|----|-------|-------|---------|------------|');
  for (const row of matrix.rows) {
    const tasks = row.taskIds.join(', ') || '—';
    const files = row.taskFiles.join(', ') || '—';
    lines.push(`| ${row.acId} | ${tasks} | ${files} | ${row.acDone ? '✓' : '·'} | ${row.tasksDone ? '✓' : '·'} |`);
  }
  if (matrix.unmappedTasks.length) {
    lines.push('');
    lines.push('## Unmapped Tasks');
    lines.push('');
    for (const t of matrix.unmappedTasks) {
      lines.push(`- ${t.id}: ${t.title}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

export function writeMatrix(workflowDir: string, matrix: TraceMatrix): string {
  const file = path.join(workflowDir, 'traceability.md');
  fs.writeFileSync(file, renderMatrix(matrix));
  return file;
}
