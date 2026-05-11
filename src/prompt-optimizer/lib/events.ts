import * as fs from 'node:fs';
import * as path from 'node:path';
import { envOr, learnwyPath } from '../../shared/learnwy-paths.js';

export function dataRoot(): string {
  return envOr('LEARNWY_PROMPT_OPTIMIZER_ROOT', learnwyPath('prompt-optimizer'));
}

export function eventsFile(): string {
  return path.join(dataRoot(), 'events.jsonl');
}

export const DATA_ROOT = dataRoot();
export const EVENTS_FILE = eventsFile();

export type TriggerKind = 'explicit' | 'structured';

export interface PromptEvent {
  ts: string;
  trigger: TriggerKind;
  length: number;
  lines: number;
  shape_markers: number;
  excerpt: string;
}

const MAX_EVENTS_BYTES = 5 * 1024 * 1024;

export function appendEvent(event: PromptEvent): void {
  try {
    const root = dataRoot();
    const file = eventsFile();
    if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
    let size = 0;
    try {
      size = fs.statSync(file).size;
    } catch {
      /* missing file — fine */
    }
    if (size > MAX_EVENTS_BYTES) {
      try {
        fs.renameSync(file, `${file}.1`);
      } catch {
        /* swallow */
      }
    }
    fs.appendFileSync(file, `${JSON.stringify(event)}\n`);
  } catch {
    /* never break the caller */
  }
}

export function readEvents(sinceMs: number): PromptEvent[] {
  const file = eventsFile();
  if (!fs.existsSync(file)) return [];
  const out: PromptEvent[] = [];
  const cutoff = Date.now() - sinceMs;
  const raw = fs.readFileSync(file, 'utf8');
  for (const line of raw.split('\n')) {
    if (!line) continue;
    try {
      const e = JSON.parse(line) as PromptEvent;
      if (Date.parse(e.ts) >= cutoff) out.push(e);
    } catch {
      /* skip malformed line */
    }
  }
  return out;
}
