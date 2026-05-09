#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';

async function main(): Promise<void> {
  const payload = await readStdin();
  const userMessage = payload.user_message || payload.prompt || '';
  if (!userMessage || userMessage.length < 10) return;

  const trimmed = userMessage.trim();
  const isLikelyCode = /^(import |const |let |var |function |class |\/\/|#!|{|}|\[|\])/.test(trimmed);
  const isLikelyPath = /^[\/~.].*\.[a-z]{1,4}$/i.test(trimmed);
  const isLikelyCommand = /^(git |npm |node |cd |ls |cat |mkdir |rm )/.test(trimmed);
  if (isLikelyCode || isLikelyPath || isLikelyCommand) return;

  const alphaChars = (userMessage.match(/[a-zA-Z]/g) || []).length;
  const totalChars = userMessage.replace(/\s/g, '').length;
  const englishRatio = totalChars > 0 ? alphaChars / totalChars : 0;
  if (englishRatio < 0.6) return;

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
