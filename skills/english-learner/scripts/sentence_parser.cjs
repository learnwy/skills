#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_ROOT = path.join(os.homedir(), '.english-learner');
const WORDS_DIR = path.join(DATA_ROOT, 'words');

function loadJson(filepath) {
  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  }
  return {};
}

function getWordFile(word) {
  const prefix = word.length >= 2
    ? word.slice(0, 2).toLowerCase()
    : word[0].toLowerCase() + '_';
  return path.join(WORDS_DIR, `${prefix}.json`);
}

function getWord(word) {
  const filepath = getWordFile(word);
  const data = loadJson(filepath);
  const key = word.toLowerCase();
  return data[key] || null;
}

function extractWords(sentence) {
  const matches = sentence.match(/[a-zA-Z']+/g) || [];
  const words = matches
    .map(w => w.toLowerCase().replace(/^'+|'+$/g, ''))
    .filter(w => w.length > 1);
  return [...new Map(words.map(w => [w, w])).values()];
}

function classifyInput(text) {
  text = text.trim();
  const words = text.split(/\s+/);

  if (words.length === 1) {
    return 'word';
  } else if (words.length <= 5 && !/[.!?]/.test(text)) {
    return 'phrase';
  } else {
    return 'sentence';
  }
}

function parseSentence(sentence) {
  const words = extractWords(sentence);
  const known = [];
  const unknown = [];

  for (const word of words) {
    if (getWord(word)) {
      known.push(word);
    } else {
      unknown.push(word);
    }
  }

  return {
    sentence,
    words,
    known,
    unknown,
    word_count: words.length,
    known_ratio: words.length ? known.length / words.length : 0,
  };
}

function batchCheckWords(words) {
  const result = { known: {}, unknown: [] };

  for (const word of words) {
    const data = getWord(word);
    if (data) {
      result.known[word] = data;
    } else {
      result.unknown.push(word);
    }
  }

  return result;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: sentence_parser.cjs <command> [args]');
    console.log('Commands: classify, parse, extract, batch_check');
    process.exit(1);
  }

  const cmd = args[0];

  if (cmd === 'classify' && args.length >= 2) {
    const text = args.slice(1).join(' ');
    const result = classifyInput(text);
    console.log(JSON.stringify({ type: result, text }));
  } else if (cmd === 'parse' && args.length >= 2) {
    const sentence = args.slice(1).join(' ');
    const result = parseSentence(sentence);
    console.log(JSON.stringify(result, null, 2));
  } else if (cmd === 'extract' && args.length >= 2) {
    const sentence = args.slice(1).join(' ');
    const words = extractWords(sentence);
    console.log(JSON.stringify({ words }));
  } else if (cmd === 'batch_check' && args.length >= 2) {
    const words = args.slice(1);
    const result = batchCheckWords(words);
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(JSON.stringify({ error: 'invalid_command' }));
    process.exit(1);
  }
}

main();
