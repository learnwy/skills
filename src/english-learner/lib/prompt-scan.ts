import {
  looksLikeNonProse,
  englishRatio,
  chineseRatio,
  looksLikeChineseLearnIntent,
} from '../../shared/text-classifiers.js';


const RECORD_INPUT_HINT =
  'Always log this turn via `node {english-learner-skill}/scripts/cli.cjs vocab record-input \'{"language":"<en|zh|ja|ko|other>","text":"<original message>","had_issues":<true|false>,"issue_count":<n>}\'` — even when no issues are found, so we can track fluency rate over time.';

const ENGLISH_BLOCK = [
  '[english-learner hook] The user wrote in English.',
  'Before responding, scan for grammar/word-choice/expression issues (max 3).',
  'If found, prepend a brief "💡 English Tip" table, then proceed with the task.',
  'After rendering the table, persist the corrections by calling:',
  '`node {english-learner-skill}/scripts/cli.cjs vocab record-correction \'[{"original":"X","corrected":"Y","reason":"Z","words":[{"word":"...","definition":"...","phonetic":"..."}]}]\'`.',
  'The optional `words[]` field also feeds the words table — include it for genuinely new vocabulary, omit for typo→correct cases.',
  'If English is fluent/natural, do NOT render a tip table — instead render exactly one line: "✅ English looks fluent — no issues found." then proceed.',
  RECORD_INPUT_HINT,
].join(' ');

const CHINESE_BLOCK_FULL = [
  '[english-learner hook] The user wrote in Chinese.',
  'Before responding to the task, prepend a "🌐 中译英" section:',
  '1. Check the Chinese for grammar errors, typos, or awkward phrasing — if found, show corrections in a table.',
  "2. Translate the user's Chinese into natural English (provide 2-3 alternative expressions).",
  '3. Extract 2-3 key vocabulary/phrases from the translation, show phonetic + brief usage note.',
  '4. Auto-save all new words/phrases via batch_save (no need to ask — just save them).',
  "5. Then proceed with the user's actual task.",
  'Format: "🌐 中译英" header, corrections table (if any), English translations, vocab table, then separator and task response.',
  RECORD_INPUT_HINT,
].join(' ');

const CHINESE_BLOCK_LIGHT = [
  '[english-learner hook] The user wrote in Chinese (long-form or tech-heavy — light mode, but DO NOT skip).',
  'Prepend a brief "🌐 中译英 (light)" section before tackling the task:',
  "1. Translate the user's core ask into ONE natural English sentence (skip alternative phrasings).",
  '2. Extract 1 key English vocabulary/phrase if something stands out (phonetic + 1-line usage); otherwise omit the vocab table.',
  '3. Skip the corrections table unless an obvious typo exists.',
  '4. Auto-save the vocab item via batch_save if extracted.',
  "5. Then proceed with the user's actual task in normal flow.",
  'Rationale: long task descriptions and tech contexts still get translation exposure — never silently skipped.',
  RECORD_INPUT_HINT,
].join(' ');

const OTHER_LANG_BLOCK_FULL = [
  '[english-learner hook] The user wrote in a language other than English or Chinese.',
  'Detect the language (likely Japanese, Korean, Spanish, French, German, Russian, Arabic, etc.) and prepend a "🌐 Translate & Learn" section:',
  "1. Name the detected language explicitly on the first line (e.g. \"Detected: Japanese\").",
  "2. Translate the user's message into natural English (1-2 alternative expressions).",
  '3. Extract 2-3 key English vocabulary/phrases from the translation, with phonetic + brief usage note.',
  '4. Auto-save the new words via `vocab batch_save` (no need to ask — just save them).',
  "5. Then proceed with the user's actual task in English.",
  RECORD_INPUT_HINT,
].join(' ');

const OTHER_LANG_BLOCK_LIGHT = [
  '[english-learner hook] The user wrote a long message in a non-English/non-Chinese language (light mode, but DO NOT skip).',
  'Prepend a brief "🌐 Translate & Learn (light)" section:',
  "1. Name the detected language on line one (e.g. \"Detected: Japanese\").",
  "2. Translate the user's core ask into ONE natural English sentence.",
  '3. Optionally extract 1 vocabulary item if notable; otherwise omit.',
  '4. Auto-save via batch_save if extracted.',
  "5. Then proceed with the user's actual task in English.",
  RECORD_INPUT_HINT,
].join(' ');

function detectLanguage(message: string): 'en' | 'zh' | 'other' | null {
  const enRatio = englishRatio(message);
  const cnRatio = chineseRatio(message);
  if (enRatio >= 0.6) return 'en';
  if (cnRatio >= 0.3 || looksLikeChineseLearnIntent(message)) return 'zh';
  if (message.length >= 10) return 'other';
  return null;
}

const CN_TECH_RE = /代码|编程|bug|修复|重构|编译|部署|配置文件/;
const CN_FULL_MAX_LEN = 500;
const OTHER_FULL_MAX_LEN = 800;

export function scanPrompt(message: string): string | null {
  if (!message) return null;
  const minLen = chineseRatio(message) > 0 ? 2 : 4;
  if (message.length < minLen) return null;
  if (looksLikeNonProse(message)) return null;
  if (/^Use Skill:/i.test(message.trim())) return null;

  const lang = detectLanguage(message);
  if (lang === null) return null;

  if (lang === 'en') return ENGLISH_BLOCK;

  if (lang === 'zh') {
    const isTechHeavy = CN_TECH_RE.test(message);
    const isLong = message.length > CN_FULL_MAX_LEN;
    return isTechHeavy || isLong ? CHINESE_BLOCK_LIGHT : CHINESE_BLOCK_FULL;
  }

  return message.length > OTHER_FULL_MAX_LEN
    ? OTHER_LANG_BLOCK_LIGHT
    : OTHER_LANG_BLOCK_FULL;
}
