#!/usr/bin/env node
import { getDb, rowToWord, type WordRow, type WordRecord } from '../shared/db.js';

export function getWord(word: string): WordRecord | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM words WHERE word = ?').get(word.toLowerCase()) as
    | WordRow
    | undefined;
  return rowToWord(row);
}

export function extractWords(sentence: string): string[] {
  const matches = sentence.match(/[a-zA-Z']+/g) || [];
  const words = matches
    .map((w) => w.toLowerCase().replace(/^'+|'+$/g, ''))
    .filter((w) => w.length > 1);
  return [...new Map(words.map((w) => [w, w])).values()];
}

export function classifyInput(text: string): 'word' | 'phrase' | 'sentence' {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);
  if (words.length === 1) return 'word';
  if (words.length <= 5 && !/[.!?]/.test(trimmed)) return 'phrase';
  return 'sentence';
}

export function parseSentence(sentence: string): {
  sentence: string;
  words: string[];
  known: string[];
  unknown: string[];
  word_count: number;
  known_ratio: number;
} {
  const words = extractWords(sentence);
  const known: string[] = [];
  const unknown: string[] = [];

  if (words.length > 0) {
    const db = getDb();
    const placeholders = words.map(() => '?').join(',');
    const rows = db
      .prepare(`SELECT word FROM words WHERE word IN (${placeholders})`)
      .all(...words) as Array<{ word: string }>;
    const knownSet = new Set(rows.map((r) => r.word));
    for (const w of words) {
      if (knownSet.has(w)) known.push(w);
      else unknown.push(w);
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

export function batchCheckWords(words: string[]): {
  known: Record<string, WordRecord>;
  unknown: string[];
} {
  const result: { known: Record<string, WordRecord>; unknown: string[] } = { known: {}, unknown: [] };
  if (!Array.isArray(words) || words.length === 0) return result;
  const db = getDb();
  const placeholders = words.map(() => '?').join(',');
  const rows = db
    .prepare(`SELECT * FROM words WHERE word IN (${placeholders})`)
    .all(...words.map((w) => w.toLowerCase())) as unknown as WordRow[];
  const byKey = new Map(rows.map((r) => [r.word, r]));

  for (const w of words) {
    const row = byKey.get(w.toLowerCase());
    const wordRec = rowToWord(row);
    if (wordRec) result.known[w] = wordRec;
    else result.unknown.push(w);
  }
  return result;
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: sentence_parser.cjs <command> [args]');
    console.log('Commands: classify, parse, extract, batch_check');
    process.exit(1);
  }
  const cmd = args[0];
  if (cmd === 'classify' && args.length >= 2) {
    const text = args.slice(1).join(' ');
    console.log(JSON.stringify({ type: classifyInput(text), text }));
  } else if (cmd === 'parse' && args.length >= 2) {
    console.log(JSON.stringify(parseSentence(args.slice(1).join(' ')), null, 2));
  } else if (cmd === 'extract' && args.length >= 2) {
    console.log(JSON.stringify({ words: extractWords(args.slice(1).join(' ')) }));
  } else if (cmd === 'batch_check' && args.length >= 2) {
    console.log(JSON.stringify(batchCheckWords(args.slice(1)), null, 2));
  } else {
    console.log(JSON.stringify({ error: 'invalid_command' }));
    process.exit(1);
  }
}

main();
