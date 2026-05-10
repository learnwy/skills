import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const STATE_FILE = path.join(os.homedir(), '.learnwy', 'knowledge-consolidation', 'last-nudge.json');
const DEBOUNCE_MS = 60 * 60 * 1000;
const MIN_RESPONSE_LEN = 800;

const RESOLUTION_SIGNALS: RegExp[] = [
  /\bthe (?:root[- ]cause|bug|issue|problem)\s+(?:was|is|turned out)\b/i,
  /\bfixed it\b/i,
  /\bgot it (?:working|to work)\b/i,
  /\bnow (?:it|the .{1,30})\s+works?\b/i,
  /\b(?:resolved|solved)[—:.]\s/i,
  /^##\s+(?:solution|resolution|root[- ]cause|fix|takeaway)s?\b/im,
];

const SKILL_OUTPUT_MARKERS = [
  '[english-learner',
  '[llm-wiki]',
  '[prompt-optimizer',
  '[knowledge-consolidation]',
  '词义 Definitions',
  '掌握度:',
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

function countSignals(text: string): number {
  return RESOLUTION_SIGNALS.filter((re) => re.test(text)).length;
}

export function scanStop(transcript: string, payload: StopPayload = {}): string | null {
  if (transcript.length < MIN_RESPONSE_LEN) return null;
  if (isSkillOutput(transcript)) return null;

  const signals = countSignals(transcript);
  if (signals === 0) return null;

  const sessionId = payload.session_id || payload.sessionId;
  const prev = readState();
  const now = Date.now();
  if (prev) {
    const prevTs = Date.parse(prev.ts);
    if (sessionId && prev.session_id === sessionId) return null;
    if (!sessionId && Number.isFinite(prevTs) && now - prevTs < DEBOUNCE_MS) return null;
  }

  writeState({ session_id: sessionId, ts: new Date(now).toISOString() });

  return [
    '[knowledge-consolidation] This turn looks like it resolved a non-trivial problem',
    `(${signals} resolution signal${signals > 1 ? 's' : ''} matched).`,
    'If the insight is reusable across future sessions, suggest invoking knowledge-consolidation to persist it —',
    'do NOT auto-write; only nudge once per session.',
  ].join(' ');
}
