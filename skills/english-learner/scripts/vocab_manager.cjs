#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_ROOT = path.join(os.homedir(), '.english-learner');
const WORDS_DIR = path.join(DATA_ROOT, 'words');
const PHRASES_DIR = path.join(DATA_ROOT, 'phrases');
const HISTORY_DIR = path.join(DATA_ROOT, 'history');

function ensureDirs() {
  for (const d of [WORDS_DIR, PHRASES_DIR, HISTORY_DIR]) {
    fs.mkdirSync(d, { recursive: true });
  }
}

function getWordFile(word) {
  const prefix = word.length >= 2
    ? word.slice(0, 2).toLowerCase()
    : word[0].toLowerCase() + '_';
  return path.join(WORDS_DIR, `${prefix}.json`);
}

function getPhraseFile(phrase) {
  const firstWord = phrase ? phrase.split(/\s+/)[0].toLowerCase() : 'misc';
  return path.join(PHRASES_DIR, `${firstWord}.json`);
}

function loadJson(filepath) {
  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  }
  return {};
}

function saveJson(filepath, data) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

function getWord(word) {
  const filepath = getWordFile(word);
  const data = loadJson(filepath);
  const key = word.toLowerCase();
  return data[key] || null;
}

function saveWord(word, { definition, phonetic, examples, pos, synonyms, antonyms, definitions } = {}) {
  ensureDirs();
  const filepath = getWordFile(word);
  const data = loadJson(filepath);
  const key = word.toLowerCase();

  const now = new Date().toISOString();
  const existing = data[key] || {};

  let entryDefinitions;
  if (definitions) {
    entryDefinitions = definitions;
  } else if (definition) {
    entryDefinitions = [{ pos: pos || '', meaning: definition, examples: examples || [] }];
  } else {
    entryDefinitions = existing.definitions || [];
  }

  const entry = {
    word: word.toLowerCase(),
    definitions: entryDefinitions,
    phonetic: phonetic || existing.phonetic || '',
    synonyms: synonyms || existing.synonyms || [],
    antonyms: antonyms || existing.antonyms || [],
    created_at: existing.created_at || now,
    updated_at: now,
    lookup_count: existing.lookup_count || 0,
    mastery: existing.mastery || 0,
  };

  data[key] = entry;
  saveJson(filepath, data);
  return entry;
}

function incrementLookup(word) {
  const filepath = getWordFile(word);
  const data = loadJson(filepath);
  const key = word.toLowerCase();

  if (data[key]) {
    data[key].lookup_count = (data[key].lookup_count || 0) + 1;
    data[key].last_lookup = new Date().toISOString();
    saveJson(filepath, data);
    return data[key].lookup_count;
  }
  return 0;
}

function getPhrase(phrase) {
  const filepath = getPhraseFile(phrase);
  const data = loadJson(filepath);
  const key = phrase.toLowerCase();
  return data[key] || null;
}

function savePhrase(phrase, { definition, phonetic, examples, literal } = {}) {
  ensureDirs();
  const filepath = getPhraseFile(phrase);
  const data = loadJson(filepath);
  const key = phrase.toLowerCase();

  const now = new Date().toISOString();
  const existing = data[key] || {};

  const entry = {
    phrase: phrase.toLowerCase(),
    definition,
    phonetic: phonetic || existing.phonetic || '',
    literal: literal || existing.literal || '',
    examples: examples || existing.examples || [],
    created_at: existing.created_at || now,
    updated_at: now,
    lookup_count: existing.lookup_count || 0,
    mastery: existing.mastery || 0,
  };

  data[key] = entry;
  saveJson(filepath, data);
  return entry;
}

function logQuery(query, queryType) {
  ensureDirs();
  const today = new Date().toISOString().slice(0, 10);
  const filepath = path.join(HISTORY_DIR, `${today}.json`);

  const history = loadJson(filepath);
  if (!history.queries) {
    history.queries = [];
  }

  history.queries.push({
    query,
    type: queryType,
    timestamp: new Date().toISOString(),
  });

  saveJson(filepath, history);
}

function updateMastery(wordOrPhrase, isWord, correct) {
  const filepath = isWord ? getWordFile(wordOrPhrase) : getPhraseFile(wordOrPhrase);
  const data = loadJson(filepath);
  const key = wordOrPhrase.toLowerCase();

  if (data[key]) {
    const current = data[key].mastery || 0;
    data[key].mastery = correct
      ? Math.min(100, current + 10)
      : Math.max(0, current - 5);
    saveJson(filepath, data);
    return data[key].mastery;
  }
  return 0;
}

function getStats() {
  const stats = {
    total_words: 0,
    total_phrases: 0,
    total_lookups: 0,
    mastered_words: 0,
    learning_words: 0,
    new_words: 0,
  };

  if (fs.existsSync(WORDS_DIR)) {
    for (const f of fs.readdirSync(WORDS_DIR).filter(n => n.endsWith('.json'))) {
      const data = loadJson(path.join(WORDS_DIR, f));
      for (const entry of Object.values(data)) {
        stats.total_words += 1;
        stats.total_lookups += entry.lookup_count || 0;
        const mastery = entry.mastery || 0;
        if (mastery >= 80) stats.mastered_words += 1;
        else if (mastery >= 30) stats.learning_words += 1;
        else stats.new_words += 1;
      }
    }
  }

  if (fs.existsSync(PHRASES_DIR)) {
    for (const f of fs.readdirSync(PHRASES_DIR).filter(n => n.endsWith('.json'))) {
      const data = loadJson(path.join(PHRASES_DIR, f));
      stats.total_phrases += Object.keys(data).length;
    }
  }

  return stats;
}

function batchGetWords(words) {
  const result = { found: {}, not_found: [] };
  const fileCache = {};

  for (const word of words) {
    const filepath = getWordFile(word);
    if (!fileCache[filepath]) {
      fileCache[filepath] = loadJson(filepath);
    }

    const key = word.toLowerCase();
    if (fileCache[filepath][key]) {
      result.found[word] = fileCache[filepath][key];
      incrementLookup(word);
    } else {
      result.not_found.push(word);
    }
  }

  return result;
}

function batchSaveWords(wordsData) {
  ensureDirs();
  const fileCache = {};
  const saved = [];
  const now = new Date().toISOString();

  for (const item of wordsData) {
    const word = (item.word || '').toLowerCase();
    if (!word) continue;

    const filepath = getWordFile(word);
    if (!fileCache[filepath]) {
      fileCache[filepath] = loadJson(filepath);
    }

    const existing = fileCache[filepath][word] || {};

    let entryDefinitions;
    if (item.definitions) {
      entryDefinitions = item.definitions;
    } else if (item.definition) {
      entryDefinitions = [{
        pos: item.pos || '',
        meaning: item.definition,
        examples: item.examples || [],
      }];
    } else {
      entryDefinitions = existing.definitions || [];
    }

    const entry = {
      word,
      definitions: entryDefinitions,
      phonetic: item.phonetic || existing.phonetic || '',
      synonyms: item.synonyms || existing.synonyms || [],
      antonyms: item.antonyms || existing.antonyms || [],
      created_at: existing.created_at || now,
      updated_at: now,
      lookup_count: existing.lookup_count || 0,
      mastery: existing.mastery || 0,
    };

    fileCache[filepath][word] = entry;
    saved.push(word);
  }

  for (const [filepath, data] of Object.entries(fileCache)) {
    saveJson(filepath, data);
  }

  return { saved, count: saved.length };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: vocab_manager.cjs <command> [args]');
    console.log('Commands: get_word, save_word, get_phrase, save_phrase, log_query, stats');
    console.log('Batch: batch_get <words_json>, batch_save <words_data_json>');
    process.exit(1);
  }

  const cmd = args[0];

  if (cmd === 'get_word' && args.length >= 2) {
    const result = getWord(args[1]);
    if (result) {
      incrementLookup(args[1]);
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify({ error: 'not_found' }));
    }
  } else if (cmd === 'get_phrase' && args.length >= 2) {
    const phrase = args.slice(1).join(' ');
    const result = getPhrase(phrase);
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify({ error: 'not_found' }));
    }
  } else if (cmd === 'save_word' && args.length >= 3) {
    const word = args[1];
    const definition = args[2];
    const phonetic = args[3] || '';
    const examples = args[4] ? JSON.parse(args[4]) : [];
    const result = saveWord(word, { definition, phonetic, examples });
    console.log(JSON.stringify(result, null, 2));
  } else if (cmd === 'save_phrase' && args.length >= 3) {
    const phrase = args[1];
    const definition = args[2];
    const phonetic = args[3] || '';
    const examples = args[4] ? JSON.parse(args[4]) : [];
    const result = savePhrase(phrase, { definition, phonetic, examples });
    console.log(JSON.stringify(result, null, 2));
  } else if (cmd === 'log_query' && args.length >= 3) {
    logQuery(args[1], args[2]);
    console.log(JSON.stringify({ status: 'logged' }));
  } else if (cmd === 'stats') {
    console.log(JSON.stringify(getStats(), null, 2));
  } else if (cmd === 'update_mastery' && args.length >= 4) {
    const item = args[1];
    const isWord = args[2].toLowerCase() === 'true';
    const correct = args[3].toLowerCase() === 'true';
    const newMastery = updateMastery(item, isWord, correct);
    console.log(JSON.stringify({ mastery: newMastery }));
  } else if (cmd === 'batch_get' && args.length >= 2) {
    const words = JSON.parse(args[1]);
    const result = batchGetWords(words);
    console.log(JSON.stringify(result, null, 2));
  } else if (cmd === 'batch_save' && args.length >= 2) {
    const wordsData = JSON.parse(args[1]);
    const result = batchSaveWords(wordsData);
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(JSON.stringify({ error: 'invalid_command' }));
    process.exit(1);
  }
}

main();
