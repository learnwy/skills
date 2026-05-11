import * as fs from 'node:fs';

export interface AcceptanceCriterion {
  id: string;
  text: string;
  checked: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  files: string[];
  checked: boolean;
  phase?: string;
}

const EARS_RE = /^\s*[-*]\s*\[(?<state>[ xX])\]\s*(?<text>(When|While|Where|If)\b.+)$/;
const TASK_RE = /^\s*[-*]\s*\[(?<state>[ xX])\]\s*(?<rest>.+)$/;
const FILES_RE = /\[files?:\s*([^\]]+)\]/i;
const TASK_ID_RE = /^(Task\s+)?(\d+(?:\.\d+)+|[A-Z]+-\d+)\s*[:\-]\s*/i;
const SECTION_RE = /^##+\s+(.+?)\s*$/;

export function readFileOrEmpty(file: string): string {
  if (!fs.existsSync(file)) return '';
  return fs.readFileSync(file, 'utf8');
}

export function extractAcceptanceCriteria(specMarkdown: string): AcceptanceCriterion[] {
  const lines = specMarkdown.split(/\r?\n/);
  const acs: AcceptanceCriterion[] = [];
  let inAcSection = false;
  let counter = 0;
  for (const raw of lines) {
    const sec = raw.match(SECTION_RE);
    if (sec) {
      inAcSection = /acceptance criteria/i.test(sec[1]) || /验收标准/.test(sec[1]);
      continue;
    }
    if (!inAcSection) continue;
    const m = raw.match(EARS_RE);
    if (!m || !m.groups) continue;
    counter += 1;
    acs.push({
      id: `AC-${String(counter).padStart(2, '0')}`,
      text: m.groups.text.trim(),
      checked: m.groups.state.toLowerCase() === 'x',
    });
  }
  return acs;
}

export function extractTasks(tasksMarkdown: string): TaskItem[] {
  const lines = tasksMarkdown.split(/\r?\n/);
  const tasks: TaskItem[] = [];
  let currentPhase: string | undefined;
  let auto = 0;
  for (const raw of lines) {
    const sec = raw.match(SECTION_RE);
    if (sec) {
      currentPhase = sec[1].trim();
      continue;
    }
    const m = raw.match(TASK_RE);
    if (!m || !m.groups) continue;
    if (currentPhase && /verification|review|done/i.test(currentPhase)) continue;
    let rest = m.groups.rest.trim();
    let files: string[] = [];
    const fm = rest.match(FILES_RE);
    if (fm) {
      files = fm[1].split(',').map((s) => s.trim()).filter(Boolean);
      rest = rest.replace(FILES_RE, '').trim();
    }
    let id: string;
    const idMatch = rest.match(TASK_ID_RE);
    if (idMatch) {
      id = idMatch[2];
      rest = rest.slice(idMatch[0].length).trim();
    } else {
      auto += 1;
      id = `T-${String(auto).padStart(2, '0')}`;
    }
    tasks.push({
      id,
      title: rest,
      files,
      checked: m.groups.state.toLowerCase() === 'x',
      phase: currentPhase,
    });
  }
  return tasks;
}

export function summarizeSpec(specMarkdown: string): { background: string; scopeIn: string[]; scopeOut: string[] } {
  const lines = specMarkdown.split(/\r?\n/);
  let section: string | null = null;
  const buckets: Record<string, string[]> = {};
  for (const raw of lines) {
    const sec = raw.match(SECTION_RE);
    if (sec) {
      section = sec[1].toLowerCase();
      buckets[section] = [];
      continue;
    }
    if (!section) continue;
    if (raw.trim()) buckets[section].push(raw);
  }
  const pickList = (key: string): string[] => {
    const lines = buckets[key] || [];
    return lines
      .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
      .filter((l) => l && !/^[-*]?\s*$/.test(l));
  };
  return {
    background: ((buckets['background'] || buckets['背景'] || []).join('\n')).trim(),
    scopeIn: pickList('scope').filter((l) => /^in[:\-]/i.test(l)).map((l) => l.replace(/^in[:\-]\s*/i, '')),
    scopeOut: pickList('scope').filter((l) => /^out[:\-]/i.test(l)).map((l) => l.replace(/^out[:\-]\s*/i, '')),
  };
}
