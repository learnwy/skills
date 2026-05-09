#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';

const SKILL_MARKERS = [
  '📖 **',
  '词义 Definitions',
  '同义词:',
  '反义词:',
  '掌握度:',
  'english-learner hook',
  '查询次数:',
];

const isEnglishLearnerOutput = (text: string): boolean =>
  SKILL_MARKERS.some((m) => text.includes(m));

function extractCandidates(text: string): string[] {
  if (!text) return [];

  const stripped = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/[#*_>|`~\-]+/g, ' ');

  const tokens = stripped.match(/\b[a-zA-Z][a-zA-Z'-]{6,}\b/g) || [];
  const seen = new Set<string>();
  const candidates: string[] = [];
  for (const raw of tokens) {
    const w = raw.toLowerCase();
    if (seen.has(w)) continue;
    if (/^[A-Z]{2,}$/.test(raw)) continue;
    if (/'s$|'re$|'ve$|'ll$|n't$/.test(w)) continue;
    seen.add(w);
    candidates.push(w);
    if (candidates.length >= 12) break;
  }
  return candidates;
}

async function main(): Promise<void> {
  const payload = await readStdin();
  const transcript =
    (payload.assistant_message as string | undefined) ||
    (payload.last_response as string | undefined) ||
    (payload.transcript as string | undefined) ||
    '';
  if (!transcript || transcript.length < 200) return;
  if (isEnglishLearnerOutput(transcript)) return;

  const candidates = extractCandidates(transcript);
  if (candidates.length < 5) return;

  injectContext(
    [
      '[english-learner stop hook]',
      "Scan the assistant's last response for 2-4 advanced or non-obvious English words/phrases the user might want to learn",
      `(initial candidates: ${candidates.slice(0, 8).join(', ')}).`,
      'If anything is genuinely worth surfacing, ask the user: "Want to save these to your vocabulary store?".',
      'Only the user can decide — do NOT auto-save.',
      'Skip silently if everything is common (CEFR A1-B1) or domain jargon.',
    ].join(' '),
  );
}

main().catch(() => process.exit(0));
