#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { readStdin, injectContext } from '../../shared/hooks-lib.js';

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

async function main(): Promise<void> {
  const payload = await readStdin();
  const transcript =
    (payload.assistant_message as string | undefined) ||
    (payload.last_response as string | undefined) ||
    (payload.transcript as string | undefined) ||
    '';
  if (transcript.length < MIN_RESPONSE_LEN) return;
  if (isSkillOutput(transcript)) return;

  const signals = countSignals(transcript);
  if (signals === 0) return;

  const sessionId = (payload.session_id as string | undefined) || (payload.sessionId as string | undefined);
  const prev = readState();
  const now = Date.now();
  if (prev) {
    const prevTs = Date.parse(prev.ts);
    if (sessionId && prev.session_id === sessionId) return;
    if (!sessionId && Number.isFinite(prevTs) && now - prevTs < DEBOUNCE_MS) return;
  }

  injectContext(
    [
      '[knowledge-consolidation] This turn looks like it resolved a non-trivial problem',
      `(${signals} resolution signal${signals > 1 ? 's' : ''} matched).`,
      'If the insight is reusable across future sessions, suggest invoking knowledge-consolidation to persist it —',
      'do NOT auto-write; only nudge once per session.',
    ].join(' '),
  );

  writeState({ session_id: sessionId, ts: new Date(now).toISOString() });
}

main().catch(() => process.exit(0));
