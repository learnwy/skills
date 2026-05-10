#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { buildDigest, formatCompact } from '../lib/digest.js';

const STATE_FILE = path.join(os.homedir(), '.learnwy', 'learnwy-status', 'state.json');

interface State {
  last_status_week?: string;
}

function isoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((t.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function readState(): State {
  if (!fs.existsSync(STATE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as State;
  } catch {
    return {};
  }
}

function writeState(state: State): void {
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {
    /* swallow */
  }
}

async function main(): Promise<void> {
  await readStdin();
  const week = isoWeek(new Date());
  const state = readState();
  if (state.last_status_week === week) return;

  const digest = buildDigest();
  if (!digest.vocab && !digest.wiki && !digest.optimizer && !digest.consolidation) return;

  const compact = formatCompact(digest);
  const wikiAlert = digest.wiki && digest.wiki.broken_links > 0
    ? `  ⚠ wiki: ${digest.wiki.broken_links} broken link(s) — run "llm-wiki health-check"`
    : null;
  const lines = [
    `[learnwy-status] Weekly digest (${week}): ${compact}`,
    wikiAlert,
    '  Run `learnwy-status status` for the full report.',
  ].filter((l): l is string => l !== null);
  injectContext(lines.join('\n'));

  writeState({ ...state, last_status_week: week });
}

main().catch(() => process.exit(0));
