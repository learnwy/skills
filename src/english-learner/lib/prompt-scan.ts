import {
  looksLikeNonProse,
  englishRatio,
  chineseRatio,
  looksLikeChineseLearnIntent,
} from '../../shared/text-classifiers.js';

const ENGLISH_BLOCK = [
  '[english-learner hook] The user wrote in English.',
  'Before responding, scan for grammar/word-choice/expression issues (max 3).',
  'If found, prepend a brief "💡 English Tip" table, then proceed with the task.',
  'After rendering the table, persist the corrections by calling:',
  '`node {english-learner-skill}/scripts/cli.cjs vocab record-correction \'[{"original":"X","corrected":"Y","reason":"Z","words":[{"word":"...","definition":"...","phonetic":"..."}]}]\'`.',
  'The optional `words[]` field also feeds the words table — include it for genuinely new vocabulary, omit for typo→correct cases.',
  'Skip silently if English is fluent/natural.',
].join(' ');

const CHINESE_BLOCK = [
  '[english-learner hook] The user wrote in Chinese.',
  'Before responding to the task, prepend a "🌐 中译英" section:',
  '1. Check the Chinese for grammar errors, typos, or awkward phrasing — if found, show corrections in a table.',
  "2. Translate the user's Chinese into natural English (provide 2-3 alternative expressions).",
  '3. Extract 2-3 key vocabulary/phrases from the translation, show phonetic + brief usage note.',
  '4. Auto-save all new words/phrases via batch_save (no need to ask — just save them).',
  "5. Then proceed with the user's actual task.",
  'Format: "🌐 中译英" header, corrections table (if any), English translations, vocab table, then separator and task response.',
].join(' ');

export function scanPrompt(message: string): string | null {
  if (!message || message.length < 4) return null;
  if (looksLikeNonProse(message)) return null;
  if (/^Use Skill:/i.test(message.trim())) return null;

  const enRatio = englishRatio(message);
  const cnRatio = chineseRatio(message);

  if (enRatio >= 0.6) return ENGLISH_BLOCK;

  if (cnRatio >= 0.3 || looksLikeChineseLearnIntent(message)) {
    if (/代码|编程|bug|修复|重构|编译|部署|配置文件/.test(message)) return null;
    if (message.length > 500) return null;
    return CHINESE_BLOCK;
  }

  return null;
}
