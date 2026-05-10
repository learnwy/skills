#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import {
  looksLikeNonProse,
  englishRatio,
  chineseRatio,
  looksLikeChineseLearnIntent,
} from '../../shared/text-classifiers.js';

async function main(): Promise<void> {
  const payload = await readStdin();
  const userMessage = payload.user_message || payload.prompt || '';
  if (!userMessage || userMessage.length < 4) return;
  if (looksLikeNonProse(userMessage)) return;
  // Skip skill invocation commands early (before ratio checks)
  if (/^Use Skill:/i.test(userMessage.trim())) return;

  const enRatio = englishRatio(userMessage);
  const cnRatio = chineseRatio(userMessage);

  // Case 1: English input — original grammar-check interception
  if (enRatio >= 0.6) {
    injectContext(
      [
        '[english-learner hook] The user wrote in English.',
        'Before responding, scan for grammar/word-choice/expression issues (max 3).',
        'If found, prepend a brief "💡 English Tip" table, then proceed with the task.',
        'Save any corrected words via batch_save. Skip if English is fluent/natural.',
      ].join(' '),
    );
    return;
  }

  // Case 2: Chinese input — translate to English + correct Chinese errors
  if (cnRatio >= 0.3 || looksLikeChineseLearnIntent(userMessage)) {
    // Skip if clearly a coding/technical task context
    if (/代码|编程|bug|修复|重构|编译|部署|配置文件/.test(userMessage)) return;
    // Skip very long messages (likely task descriptions, not learning requests)
    if (userMessage.length > 500) return;

    injectContext(
      [
        '[english-learner hook] The user wrote in Chinese.',
        'Before responding to the task, prepend a "🌐 中译英" section:',
        '1. Check the Chinese for grammar errors, typos, or awkward phrasing — if found, show corrections in a table.',
        '2. Translate the user\'s Chinese into natural English (provide 2-3 alternative expressions).',
        '3. Extract 2-3 key vocabulary/phrases from the translation, show phonetic + brief usage note.',
        '4. Auto-save all new words/phrases via batch_save (no need to ask — just save them).',
        '5. Then proceed with the user\'s actual task.',
        'Format: "🌐 中译英" header, corrections table (if any), English translations, vocab table, then separator and task response.',
      ].join(' '),
    );
  }
}

main().catch(() => process.exit(0));
