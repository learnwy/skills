import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { spawn } from 'node:child_process';
import { buildDigest, formatCompact } from './digest.js';

const STATE_FILE = path.join(os.homedir(), '.learnwy', '.var', 'learnwy-status', 'state.json');
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const HOME = os.homedir();
const AGENTS_ROOT = path.join(HOME, '.agents', 'skills');

interface RefreshTarget {
  artifact: string;
  precondition: () => boolean;
  cli: string;
  args: string[];
}

const REFRESH_TARGETS: RefreshTarget[] = [
  {
    artifact: path.join(HOME, '.learnwy', 'llm-wiki', 'health.json'),
    precondition: () => fs.existsSync(path.join(HOME, '.learnwy', 'llm-wiki', 'wiki', 'topics.txt')),
    cli: path.join(AGENTS_ROOT, 'llm-wiki', 'scripts', 'cli.cjs'),
    args: ['health-check'],
  },
];

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

function isStale(p: string, maxAgeMs: number): boolean {
  try {
    const s = fs.statSync(p);
    return Date.now() - s.mtimeMs > maxAgeMs;
  } catch {
    return true;
  }
}

function spawnDetached(cli: string, args: string[]): boolean {
  if (!fs.existsSync(cli)) return false;
  try {
    const child = spawn('node', [cli, ...args], { detached: true, stdio: 'ignore' });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function autoRefresh(): string[] {
  const refreshed: string[] = [];
  for (const t of REFRESH_TARGETS) {
    if (!t.precondition()) continue;
    if (!isStale(t.artifact, SEVEN_DAYS_MS)) continue;
    if (spawnDetached(t.cli, t.args)) refreshed.push(path.basename(t.artifact));
  }
  return refreshed;
}

export function scanSession(): string | null {
  const refreshed = autoRefresh();

  const week = isoWeek(new Date());
  const state = readState();
  if (state.last_status_week === week) {
    if (refreshed.length) {
      return `[learnwy-status] Auto-refreshing stale data: ${refreshed.join(', ')} (background).`;
    }
    return null;
  }

  const digest = buildDigest();
  if (!digest.wiki && !digest.optimizer && !digest.consolidation) return null;

  const compact = formatCompact(digest);
  const wikiAlert = digest.wiki && digest.wiki.broken_links > 0
    ? `  ⚠ wiki: ${digest.wiki.broken_links} broken link(s) — run "llm-wiki health-check"`
    : null;
  const refreshLine = refreshed.length
    ? `  ↻ auto-refreshing in background: ${refreshed.join(', ')}`
    : null;
  const lines = [
    `[learnwy-status] Weekly digest (${week}): ${compact}`,
    wikiAlert,
    refreshLine,
    '  Run `learnwy-status status` for the full report.',
  ].filter((l): l is string => l !== null);

  writeState({ ...state, last_status_week: week });
  return lines.join('\n');
}
