#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { looksLikeNonProse } from '../../shared/text-classifiers.js';
import { appendEvent } from '../lib/events.js';

const EXPLICIT_TRIGGERS: RegExp[] = [
  /\boptimi[sz]e\s+(my|this|the|that)?\s*prompt\b/i,
  /\bimprove\s+(my|this|the|that)?\s*prompt\b/i,
  /\breview\s+(my|this|the|that)?\s*prompt\b/i,
  /\brewrite\s+(my|this|the|that)?\s*prompt\b/i,
  /\bcheck\s+(my|this|the|that)?\s*prompt\b/i,
  /\brefine\s+(my|this|the|that)?\s*prompt\b/i,
  /\bmake\s+(this|the|my)\s+prompt\s+(more|better)\b/i,
  /\bis\s+this\s+prompt\s+good\b/i,
  /优化\s*(我的|这段|这个)?\s*提示词/,
  /改进\s*(我的|这段|这个)?\s*提示词/,
  /重写\s*(我的|这段|这个)?\s*提示词/,
  /帮我.*?(改|优化).*?prompt/i,
];

const PROMPT_SHAPE_MARKERS: RegExp[] = [
  /\byou are (a|an|the)\b/i,
  /\byour (task|job|role|goal) is\b/i,
  /\bact as (a|an|the)\b/i,
  /\bgenerate (a|an|the)\b/i,
  /\b(analyze|summarize|translate|classify)\b.*\b(the|this|following)\b/i,
  /\binstructions?\s*[:：]/i,
  /\bconstraints?\s*[:：]/i,
  /\brequirements?\s*[:：]/i,
  /\boutput format\s*[:：]/i,
];

const looksLikeExplicitAsk = (text: string): boolean =>
  EXPLICIT_TRIGGERS.some((re) => re.test(text));

function looksLikeStructuredPrompt(text: string): boolean {
  if (text.length < 400) return false;
  const lineCount = text.split('\n').length;
  if (lineCount < 4) return false;
  const matches = PROMPT_SHAPE_MARKERS.filter((re) => re.test(text)).length;
  return matches >= 2;
}

async function main(): Promise<void> {
  const payload = await readStdin();
  const userMessage = payload.user_message || payload.prompt || '';
  if (!userMessage) return;

  const trimmed = userMessage.trim();
  if (looksLikeNonProse(userMessage)) return;

  const explicit = looksLikeExplicitAsk(trimmed);
  const structured = looksLikeStructuredPrompt(trimmed);
  if (!explicit && !structured) return;

  const reason = explicit
    ? 'The user explicitly asked to optimize/improve a prompt.'
    : 'The user submitted a long, structured prompt-shaped instruction.';

  const shapeMarkers = PROMPT_SHAPE_MARKERS.filter((re) => re.test(trimmed)).length;
  appendEvent({
    ts: new Date().toISOString(),
    trigger: explicit ? 'explicit' : 'structured',
    length: trimmed.length,
    lines: trimmed.split('\n').length,
    shape_markers: shapeMarkers,
    excerpt: trimmed.slice(0, 120).replace(/\s+/g, ' '),
  });

  injectContext(
    [
      '[prompt-optimizer hook]',
      reason,
      'Before executing, run a 7-dimension pre-flight analysis (Clarity, Specificity, Context, Structure, Examples, Constraints, Completeness),',
      'show the critique table + an Optimized Prompt block, then ask: "Use original / Use optimized / Edit manually?".',
      'Skip silently if the user is in mid-conversation and clearly does NOT want a review.',
    ].join(' '),
  );
}

main().catch(() => process.exit(0));
