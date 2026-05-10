#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { looksLikeNonProse, englishRatio } from '../../shared/text-classifiers.js';

async function main(): Promise<void> {
  const payload = await readStdin();
  const userMessage = payload.user_message || payload.prompt || '';
  if (!userMessage || userMessage.length < 10) return;
  if (looksLikeNonProse(userMessage)) return;
  if (englishRatio(userMessage) < 0.6) return;

  injectContext(
    [
      '[english-learner hook] The user wrote in English.',
      'Before responding, scan for grammar/word-choice/expression issues (max 3).',
      'If found, prepend a brief "💡 English Tip" table, then proceed with the task.',
      'Save any corrected words via batch_save. Skip if English is fluent/natural.',
    ].join(' '),
  );
}

main().catch(() => process.exit(0));
