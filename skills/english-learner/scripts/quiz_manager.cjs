#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_ROOT = path.join(os.homedir(), '.english-learner');
const WORDS_DIR = path.join(DATA_ROOT, 'words');
const PHRASES_DIR = path.join(DATA_ROOT, 'phrases');

function loadJson(filepath) {
  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  }
  return {};
}

function getAllWords() {
  const words = [];
  if (fs.existsSync(WORDS_DIR)) {
    for (const f of fs.readdirSync(WORDS_DIR).filter(n => n.endsWith('.json'))) {
      const data = loadJson(path.join(WORDS_DIR, f));
      words.push(...Object.values(data));
    }
  }
  return words;
}

function getAllPhrases() {
  const phrases = [];
  if (fs.existsSync(PHRASES_DIR)) {
    for (const f of fs.readdirSync(PHRASES_DIR).filter(n => n.endsWith('.json'))) {
      const data = loadJson(path.join(PHRASES_DIR, f));
      phrases.push(...Object.values(data));
    }
  }
  return phrases;
}

function generateQuiz(count = 10, quizType = 'all', focus = 'low_mastery') {
  let items = [];

  if (quizType === 'word' || quizType === 'all') {
    items.push(...getAllWords().map(w => ({ ...w, type: 'word' })));
  }

  if (quizType === 'phrase' || quizType === 'all') {
    items.push(...getAllPhrases().map(p => ({ ...p, type: 'phrase' })));
  }

  if (!items.length) return [];

  if (focus === 'low_mastery') {
    items.sort((a, b) => (a.mastery || 0) - (b.mastery || 0));
  } else if (focus === 'high_lookup') {
    items.sort((a, b) => (b.lookup_count || 0) - (a.lookup_count || 0));
  } else if (focus === 'new') {
    items.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  } else {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  }

  const selected = items.slice(0, count);

  return selected.map(item => {
    if (item.type === 'word') {
      const defs = item.definitions || [];
      const answer = defs.map(d => `${d.pos} ${d.meaning}`).join('; ') || '';
      const examples = defs.flatMap(d => d.examples || []);
      return {
        id: item.word,
        type: 'word',
        question: item.word,
        answer,
        definitions: defs,
        phonetic: item.phonetic || '',
        examples,
        mastery: item.mastery || 0,
        lookup_count: item.lookup_count || 0,
      };
    } else {
      return {
        id: item.phrase,
        type: 'phrase',
        question: item.phrase,
        answer: item.definition || '',
        phonetic: item.phonetic || '',
        examples: item.examples || [],
        mastery: item.mastery || 0,
        lookup_count: item.lookup_count || 0,
      };
    }
  });
}

function getReviewCandidates(limit = 20) {
  const items = [];

  for (const w of getAllWords()) {
    const score = (100 - (w.mastery || 0)) + (w.lookup_count || 0) * 5;
    const defs = w.definitions || [];
    items.push({
      item: w.word,
      type: 'word',
      mastery: w.mastery || 0,
      lookup_count: w.lookup_count || 0,
      definition: defs.map(d => `${d.pos} ${d.meaning}`).join('; ') || '',
      score,
    });
  }

  for (const p of getAllPhrases()) {
    const score = (100 - (p.mastery || 0)) + (p.lookup_count || 0) * 5;
    items.push({
      item: p.phrase,
      type: 'phrase',
      mastery: p.mastery || 0,
      lookup_count: p.lookup_count || 0,
      definition: p.definition || '',
      score,
    });
  }

  items.sort((a, b) => b.score - a.score);
  return items.slice(0, limit);
}

function getLearningSummary() {
  const words = getAllWords();
  const phrases = getAllPhrases();

  function categorize(items) {
    const mastered = items.filter(i => (i.mastery || 0) >= 80).length;
    const learning = items.filter(i => (i.mastery || 0) >= 30 && (i.mastery || 0) < 80).length;
    const newCount = items.filter(i => (i.mastery || 0) < 30).length;
    return { mastered, learning, new: newCount };
  }

  const allItems = [...words, ...phrases];
  allItems.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  return {
    words: {
      total: words.length,
      ...categorize(words),
      total_lookups: words.reduce((sum, w) => sum + (w.lookup_count || 0), 0),
    },
    phrases: {
      total: phrases.length,
      ...categorize(phrases),
      total_lookups: phrases.reduce((sum, p) => sum + (p.lookup_count || 0), 0),
    },
    recent_additions: allItems.slice(0, 10),
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: quiz_manager.cjs <command> [args]');
    console.log('Commands: generate, review, summary');
    process.exit(1);
  }

  const cmd = args[0];

  if (cmd === 'generate') {
    const count = args[1] ? parseInt(args[1], 10) : 10;
    const quizType = args[2] || 'all';
    const focus = args[3] || 'low_mastery';
    const result = generateQuiz(count, quizType, focus);
    console.log(JSON.stringify(result, null, 2));
  } else if (cmd === 'review') {
    const limit = args[1] ? parseInt(args[1], 10) : 20;
    const result = getReviewCandidates(limit);
    console.log(JSON.stringify(result, null, 2));
  } else if (cmd === 'summary') {
    const result = getLearningSummary();
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(JSON.stringify({ error: 'invalid_command' }));
    process.exit(1);
  }
}

main();
