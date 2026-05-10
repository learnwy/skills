import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { DatabaseSync } from 'node:sqlite';

export const DATA_ROOT = path.join(os.homedir(), '.learnwy', 'english-learner');
export const DB_PATH = path.join(DATA_ROOT, 'data.db');
export const LEGACY_DATA_ROOT = path.join(os.homedir(), '.english-learner');

function migrateLegacyRoot(): void {
  if (fs.existsSync(DATA_ROOT)) return;
  if (!fs.existsSync(LEGACY_DATA_ROOT)) return;
  fs.mkdirSync(path.dirname(DATA_ROOT), { recursive: true });
  try {
    fs.renameSync(LEGACY_DATA_ROOT, DATA_ROOT);
  } catch {
    fs.cpSync(LEGACY_DATA_ROOT, DATA_ROOT, { recursive: true });
    fs.rmSync(LEGACY_DATA_ROOT, { recursive: true, force: true });
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS words (
  word TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  mastery INTEGER NOT NULL DEFAULT 0,
  lookup_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_lookup TEXT
);
CREATE INDEX IF NOT EXISTS idx_words_mastery ON words(mastery);
CREATE INDEX IF NOT EXISTS idx_words_lookup ON words(lookup_count);

CREATE TABLE IF NOT EXISTS phrases (
  phrase TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  mastery INTEGER NOT NULL DEFAULT 0,
  lookup_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_lookup TEXT
);
CREATE INDEX IF NOT EXISTS idx_phrases_mastery ON phrases(mastery);
CREATE INDEX IF NOT EXISTS idx_phrases_lookup ON phrases(lookup_count);

CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  query TEXT NOT NULL,
  query_type TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_history_ts ON history(ts);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;
  migrateLegacyRoot();
  fs.mkdirSync(DATA_ROOT, { recursive: true });
  _db = new DatabaseSync(DB_PATH);
  _db.exec('PRAGMA journal_mode = WAL;');
  _db.exec('PRAGMA foreign_keys = ON;');
  _db.exec(SCHEMA);
  return _db;
}

export interface WordDefinition {
  pos: string;
  meaning: string;
  examples: string[];
}

export interface WordRecord {
  word: string;
  definitions: WordDefinition[];
  phonetic: string;
  synonyms: string[];
  antonyms: string[];
  mastery: number;
  lookup_count: number;
  created_at: string;
  updated_at: string;
  last_lookup?: string;
}

export interface PhraseRecord {
  phrase: string;
  definition: string;
  phonetic: string;
  literal: string;
  examples: string[];
  mastery: number;
  lookup_count: number;
  created_at: string;
  updated_at: string;
  last_lookup?: string;
}

interface WordRow {
  word: string;
  data: string;
  mastery: number;
  lookup_count: number;
  created_at: string;
  updated_at: string;
  last_lookup: string | null;
}

interface PhraseRow {
  phrase: string;
  data: string;
  mastery: number;
  lookup_count: number;
  created_at: string;
  updated_at: string;
  last_lookup: string | null;
}

export function rowToWord(row: WordRow | undefined): WordRecord | null {
  if (!row) return null;
  const inner = JSON.parse(row.data) as Partial<WordRecord>;
  return {
    word: row.word,
    definitions: inner.definitions || [],
    phonetic: inner.phonetic || '',
    synonyms: inner.synonyms || [],
    antonyms: inner.antonyms || [],
    mastery: row.mastery,
    lookup_count: row.lookup_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ...(row.last_lookup ? { last_lookup: row.last_lookup } : {}),
  };
}

export function rowToPhrase(row: PhraseRow | undefined): PhraseRecord | null {
  if (!row) return null;
  const inner = JSON.parse(row.data) as Partial<PhraseRecord>;
  return {
    phrase: row.phrase,
    definition: inner.definition || '',
    phonetic: inner.phonetic || '',
    literal: inner.literal || '',
    examples: inner.examples || [],
    mastery: row.mastery,
    lookup_count: row.lookup_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ...(row.last_lookup ? { last_lookup: row.last_lookup } : {}),
  };
}

export function withTransaction<T>(fn: (db: DatabaseSync) => T): T {
  const db = getDb();
  db.exec('BEGIN');
  try {
    const result = fn(db);
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch {
      /* swallow */
    }
    throw err;
  }
}

export type { WordRow, PhraseRow };
