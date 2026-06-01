import * as fs from 'node:fs';
import * as path from 'node:path';
import { learnwyPath } from '../../shared/learnwy-paths.js';

const STATE_FILE = learnwyPath('knowledge-consolidation', 'last-nudge.json');
const DEBOUNCE_MS = 60 * 60 * 1000;
const MIN_RESPONSE_LEN = 1500;

const RESOLUTION_SIGNALS: RegExp[] = [
  /\bthe (?:root[- ]cause|bug|issue|problem)\s+(?:was|is|turned out)\b/i,
  /\bfixed it\b/i,
  /\bgot it (?:working|to work)\b/i,
  /\bnow (?:it|the .{1,30})\s+works?\b/i,
  /\b(?:resolved|solved)[—:.]\s/i,
  /^##\s+(?:solution|resolution|root[- ]cause|fix|takeaway)s?\b/im,
];

const TRIVIA_SIGNALS: RegExp[] = [
  /\b(?:typo|misspell)\b/i,
  /\bmissing\s+(?:semicolon|comma|bracket|paren|quote|import)\b/i,
  /\bwrong\s+(?:env\s*var|environment\s*variable|path|directory|cwd)\b/i,
  /\boff[-\s]?by[-\s]?one\b/i,
  /\bforgot\s+to\s+(?:add|import|export|save|run)\b/i,
  /\bjust\s+a\s+(?:typo|missing|wrong)\b/i,
  /\bcase[-\s]?sensitiv/i,
];

const SUBSTANTIVE_SIGNALS: RegExp[] = [
  /\b(?:race condition|deadlock|memory leak|regression|production)\b/i,
  /\b(?:architecture|design decision|trade[-\s]?off|migration|schema change)\b/i,
  /\b(?:non[-\s]?obvious|subtle|tricky|gotcha|surprised)\b/i,
];

const SKILL_OUTPUT_MARKERS = [
  '[llm-wiki]',
  '[prompt-optimizer',
  '[knowledge-consolidation]',
];

interface NudgeState {
  session_id?: string;
  ts: string;
}

export interface StopPayload {
  session_id?: string;
  sessionId?: string;
}

function readState(): NudgeState | null {
  if (!fs.existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as NudgeState;
  } catch {
    return null;
  }
}

function writeState(state: NudgeState): void {
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {
    /* swallow */
  }
}

function isSkillOutput(text: string): boolean {
  return SKILL_OUTPUT_MARKERS.some((m) => text.includes(m));
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.filter((re) => re.test(text)).length;
}

export function scanStop(transcript: string, payload: StopPayload = {}): string | null {
  if (transcript.length < MIN_RESPONSE_LEN) return null;
  if (isSkillOutput(transcript)) return null;

  const resolution = countMatches(transcript, RESOLUTION_SIGNALS);
  if (resolution === 0) return null;

  const trivia = countMatches(transcript, TRIVIA_SIGNALS);
  const substantive = countMatches(transcript, SUBSTANTIVE_SIGNALS);

  // Suppress nudge for session-local trivia unless balanced by substantive markers.
  if (trivia > 0 && substantive === 0) return null;

  const sessionId = payload.session_id || payload.sessionId;
  const prev = readState();
  const now = Date.now();
  if (prev) {
    const prevTs = Date.parse(prev.ts);
    if (sessionId && prev.session_id === sessionId) return null;
    if (!sessionId && Number.isFinite(prevTs) && now - prevTs < DEBOUNCE_MS) return null;
  }

  writeState({ session_id: sessionId, ts: new Date(now).toISOString() });

  const tags: string[] = [];
  if (substantive) tags.push(`${substantive} substantive`);
  tags.push(`${resolution} resolution`);

  return [
    '[knowledge-consolidation] Looks like this turn resolved a non-trivial problem',
    `(${tags.join(', ')} signal${resolution + substantive > 1 ? 's' : ''} matched).`,
    'If the insight is reusable, suggest invoking knowledge-consolidation `save` to persist it.',
    'Use `promote` afterwards if it belongs in the global llm-wiki too.',
    'Do NOT auto-write; nudge once per session only.',
  ].join(' ');
}
