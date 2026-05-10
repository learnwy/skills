import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export const DATA_ROOT = path.join(os.homedir(), '.learnwy', 'prompt-optimizer');
export const EVENTS_FILE = path.join(DATA_ROOT, 'events.jsonl');

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
    if (!fs.existsSync(DATA_ROOT)) fs.mkdirSync(DATA_ROOT, { recursive: true });
    let size = 0;
    try {
      size = fs.statSync(EVENTS_FILE).size;
    } catch {
      /* missing file — fine */
    }
    if (size > MAX_EVENTS_BYTES) {
      try {
        fs.renameSync(EVENTS_FILE, `${EVENTS_FILE}.1`);
      } catch {
        /* swallow */
      }
    }
    fs.appendFileSync(EVENTS_FILE, `${JSON.stringify(event)}\n`);
  } catch {
    /* never break the caller */
  }
}

export function readEvents(sinceMs: number): PromptEvent[] {
  if (!fs.existsSync(EVENTS_FILE)) return [];
  const out: PromptEvent[] = [];
  const cutoff = Date.now() - sinceMs;
  const raw = fs.readFileSync(EVENTS_FILE, 'utf8');
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
