#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getDb, withTransaction, DATA_ROOT } from '../shared/db.js';

const WORDS_DIR = path.join(DATA_ROOT, 'words');
const PHRASES_DIR = path.join(DATA_ROOT, 'phrases');
const HISTORY_DIR = path.join(DATA_ROOT, 'history');

function readJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith('.json'))
    .map((n) => path.join(dir, n));
}

function loadJson<T = unknown>(filepath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

interface LegacyWord {
  word?: string;
  definitions?: unknown[];
  phonetic?: string;
  synonyms?: string[];
  antonyms?: string[];
  mastery?: number;
  lookup_count?: number;
  created_at?: string;
  updated_at?: string;
  last_lookup?: string;
}

interface LegacyPhrase {
  phrase?: string;
  definition?: string;
  phonetic?: string;
  literal?: string;
  examples?: string[];
  mastery?: number;
  lookup_count?: number;
  created_at?: string;
  updated_at?: string;
  last_lookup?: string;
}

interface LegacyHistory {
  queries?: Array<{ query: string; type: string; timestamp?: string }>;
}

const packWordData = (e: LegacyWord): string =>
  JSON.stringify({
    definitions: e.definitions || [],
    phonetic: e.phonetic || '',
    synonyms: e.synonyms || [],
    antonyms: e.antonyms || [],
  });

const packPhraseData = (e: LegacyPhrase): string =>
  JSON.stringify({
    definition: e.definition || '',
    phonetic: e.phonetic || '',
    literal: e.literal || '',
    examples: e.examples || [],
  });

interface MigrationResult {
  words: number;
  phrases: number;
  history: number;
  skipped_words: number;
  skipped_phrases: number;
}

export function migrate({ dryRun = false }: { dryRun?: boolean } = {}): MigrationResult {
  const db = getDb();
  const result: MigrationResult = { words: 0, phrases: 0, history: 0, skipped_words: 0, skipped_phrases: 0 };

  const wordUpsert = db.prepare(`
    INSERT INTO words (word, data, mastery, lookup_count, created_at, updated_at, last_lookup)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(word) DO UPDATE SET
      data = excluded.data,
      mastery = MAX(words.mastery, excluded.mastery),
      lookup_count = MAX(words.lookup_count, excluded.lookup_count),
      updated_at = excluded.updated_at,
      last_lookup = COALESCE(excluded.last_lookup, words.last_lookup)
  `);

  const phraseUpsert = db.prepare(`
    INSERT INTO phrases (phrase, data, mastery, lookup_count, created_at, updated_at, last_lookup)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(phrase) DO UPDATE SET
      data = excluded.data,
      mastery = MAX(phrases.mastery, excluded.mastery),
      lookup_count = MAX(phrases.lookup_count, excluded.lookup_count),
      updated_at = excluded.updated_at,
      last_lookup = COALESCE(excluded.last_lookup, phrases.last_lookup)
  `);

  const historyInsert = db.prepare('INSERT INTO history (ts, query, query_type) VALUES (?, ?, ?)');

  withTransaction(() => {
    for (const filepath of readJsonFiles(WORDS_DIR)) {
      const data = loadJson<Record<string, LegacyWord>>(filepath);
      if (!data) {
        result.skipped_words += 1;
        continue;
      }
      for (const [key, entry] of Object.entries(data)) {
        if (!entry || typeof entry !== 'object') continue;
        const word = (entry.word || key).toLowerCase();
        if (!dryRun) {
          wordUpsert.run(
            word,
            packWordData(entry),
            entry.mastery || 0,
            entry.lookup_count || 0,
            entry.created_at || new Date().toISOString(),
            entry.updated_at || entry.created_at || new Date().toISOString(),
            entry.last_lookup || null,
          );
        }
        result.words += 1;
      }
    }

    for (const filepath of readJsonFiles(PHRASES_DIR)) {
      const data = loadJson<Record<string, LegacyPhrase>>(filepath);
      if (!data) {
        result.skipped_phrases += 1;
        continue;
      }
      for (const [key, entry] of Object.entries(data)) {
        if (!entry || typeof entry !== 'object') continue;
        const phrase = (entry.phrase || key).toLowerCase();
        if (!dryRun) {
          phraseUpsert.run(
            phrase,
            packPhraseData(entry),
            entry.mastery || 0,
            entry.lookup_count || 0,
            entry.created_at || new Date().toISOString(),
            entry.updated_at || entry.created_at || new Date().toISOString(),
            entry.last_lookup || null,
          );
        }
        result.phrases += 1;
      }
    }

    for (const filepath of readJsonFiles(HISTORY_DIR)) {
      const data = loadJson<LegacyHistory>(filepath);
      if (!data || !Array.isArray(data.queries)) continue;
      for (const q of data.queries) {
        if (!q || !q.query || !q.type) continue;
        if (!dryRun) {
          historyInsert.run(q.timestamp || new Date().toISOString(), q.query, q.type);
        }
        result.history += 1;
      }
    }
  });

  return result;
}

const dryRun = process.argv.includes('--dry-run');
const out = migrate({ dryRun });
console.log(JSON.stringify({ dryRun, ...out }, null, 2));
