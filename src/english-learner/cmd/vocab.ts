import {
  getWord, saveWord, incrementLookup, getPhrase, savePhrase,
  logQuery, getStats, updateMastery, batchGetWords, batchSaveWords,
  type BatchWordItem,
} from '../lib/vocab-store.js';
import type { Command } from '../../shared/cli.js';

const actions: Record<string, (args: string[]) => void> = {
  get_word: (args) => {
    const result = getWord(args[0]);
    if (result) {
      incrementLookup(args[0]);
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify({ error: 'not_found' }));
    }
  },
  get_phrase: (args) => {
    const phrase = args.join(' ');
    const result = getPhrase(phrase);
    console.log(result ? JSON.stringify(result, null, 2) : JSON.stringify({ error: 'not_found' }));
  },
  save_word: (args) => {
    const [word, definition, phonetic = '', examplesJson] = args;
    const examples = examplesJson ? (JSON.parse(examplesJson) as string[]) : [];
    console.log(JSON.stringify(saveWord(word, { definition, phonetic, examples }), null, 2));
  },
  save_phrase: (args) => {
    const [phrase, definition, phonetic = '', examplesJson] = args;
    const examples = examplesJson ? (JSON.parse(examplesJson) as string[]) : [];
    console.log(JSON.stringify(savePhrase(phrase, { definition, phonetic, examples }), null, 2));
  },
  log_query: (args) => {
    logQuery(args[0], args[1]);
    console.log(JSON.stringify({ status: 'logged' }));
  },
  stats: () => console.log(JSON.stringify(getStats(), null, 2)),
  update_mastery: (args) => {
    const [item, isWordStr, correctStr] = args;
    const isWord = isWordStr.toLowerCase() === 'true';
    const correct = correctStr.toLowerCase() === 'true';
    console.log(JSON.stringify({ mastery: updateMastery(item, isWord, correct) }));
  },
  batch_get: (args) => {
    const words = JSON.parse(args[0]) as string[];
    console.log(JSON.stringify(batchGetWords(words), null, 2));
  },
  batch_save: (args) => {
    const wordsData = JSON.parse(args[0]) as BatchWordItem[];
    console.log(JSON.stringify(batchSaveWords(wordsData), null, 2));
  },
};

const minArgs: Record<string, number> = {
  get_word: 1, get_phrase: 1, save_word: 2, save_phrase: 2,
  log_query: 2, update_mastery: 3, batch_get: 1, batch_save: 1,
};

export const command: Command = {
  description: 'Word/phrase CRUD + batch operations + stats',
  run: (args) => {
    if (args.length < 1) {
      console.log('Usage: cli.cjs vocab <action> [args]');
      console.log(`Actions: ${Object.keys(actions).join(', ')}`);
      process.exit(1);
    }
    const action = args[0];
    const fn = actions[action];
    if (!fn) {
      console.log(JSON.stringify({ error: 'invalid_command' }));
      process.exit(1);
    }
    const rest = args.slice(1);
    if (rest.length < (minArgs[action] || 0)) {
      console.log(JSON.stringify({ error: 'missing_arguments', action, expected: minArgs[action] }));
      process.exit(1);
    }
    fn(rest);
  },
};
