import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { DatabaseSync } from 'node:sqlite';

export const DATA_ROOT = path.join(os.homedir(), '.learnwy', 'english-learner');
export const DB_PATH = path.join(DATA_ROOT, 'data.db');

interface Migration {
  version: number;
  up: string;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: `
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
    `,
  },
  {
    version: 2,
    up: `
      ALTER TABLE words ADD COLUMN next_review_at TEXT;
      ALTER TABLE phrases ADD COLUMN next_review_at TEXT;
      CREATE INDEX IF NOT EXISTS idx_words_next_review ON words(next_review_at);
      CREATE INDEX IF NOT EXISTS idx_phrases_next_review ON phrases(next_review_at);
    `,
  },
  {
    version: 3,
    up: `
      CREATE TABLE IF NOT EXISTS corrections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original TEXT NOT NULL,
        corrected TEXT NOT NULL,
        reason TEXT,
        count INTEGER NOT NULL DEFAULT 1,
        first_seen TEXT NOT NULL,
        last_seen TEXT NOT NULL,
        UNIQUE(original, corrected)
      );
      CREATE INDEX IF NOT EXISTS idx_corrections_count ON corrections(count DESC);
      CREATE INDEX IF NOT EXISTS idx_corrections_last_seen ON corrections(last_seen);
      CREATE INDEX IF NOT EXISTS idx_corrections_original ON corrections(original);
    `,
  },
  {
    version: 4,
    up: `
      CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_path TEXT NOT NULL UNIQUE,
        source_type TEXT NOT NULL,
        date TEXT NOT NULL,
        hour TEXT,
        title TEXT,
        topics TEXT,
        level TEXT,
        word_count INTEGER DEFAULT 0,
        imported_at TEXT NOT NULL,
        checksum TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(source_type);
      CREATE INDEX IF NOT EXISTS idx_materials_date ON materials(date);

      CREATE TABLE IF NOT EXISTS material_words (
        material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
        word TEXT NOT NULL,
        position INTEGER,
        phonetic TEXT,
        pos TEXT,
        meaning_en TEXT,
        meaning_zh TEXT,
        examples TEXT,
        synonyms TEXT,
        raw_entry TEXT,
        PRIMARY KEY (material_id, word)
      );
      CREATE INDEX IF NOT EXISTS idx_material_words_word ON material_words(word);
    `,
  },
  {
    version: 5,
    up: `
      CREATE TABLE IF NOT EXISTS prose_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT NOT NULL,
        language TEXT NOT NULL,
        length INTEGER NOT NULL,
        had_issues INTEGER NOT NULL DEFAULT 0,
        issue_count INTEGER NOT NULL DEFAULT 0,
        excerpt TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_prose_log_ts ON prose_log(ts);
      CREATE INDEX IF NOT EXISTS idx_prose_log_lang ON prose_log(language);
      CREATE INDEX IF NOT EXISTS idx_prose_log_had_issues ON prose_log(had_issues);
    `,
  },
];

export function intervalDaysForMastery(mastery: number): number {
  if (mastery >= 90) return 90;
  if (mastery >= 70) return 30;
  if (mastery >= 50) return 14;
  if (mastery >= 30) return 7;
  if (mastery >= 10) return 3;
  return 1;
}

export function nextReviewAt(mastery: number, fromDate: Date = new Date()): string {
  const next = new Date(fromDate);
  next.setUTCDate(next.getUTCDate() + intervalDaysForMastery(mastery));
  return next.toISOString();
}

function applyMigrations(db: DatabaseSync): void {
  db.exec('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);');
  const row = db
    .prepare('SELECT value FROM meta WHERE key = ?')
    .get('schema_version') as { value?: string } | undefined;
  let current = row?.value ? parseInt(row.value, 10) : 0;

  for (const m of MIGRATIONS) {
    if (m.version <= current) continue;
    db.exec('BEGIN');
    try {
      db.exec(m.up);
      db.prepare(
        'INSERT INTO meta(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      ).run('schema_version', String(m.version));
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
    current = m.version;
  }
}

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;
  fs.mkdirSync(DATA_ROOT, { recursive: true });
  _db = new DatabaseSync(DB_PATH);
  _db.exec('PRAGMA journal_mode = WAL;');
  _db.exec('PRAGMA foreign_keys = ON;');
  applyMigrations(_db);
  return _db;
}

export function _resetDbForTesting(): void {
  _db = null;
}

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

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
  next_review_at: string | null;
}

interface PhraseRow {
  phrase: string;
  data: string;
  mastery: number;
  lookup_count: number;
  created_at: string;
  updated_at: string;
  last_lookup: string | null;
  next_review_at: string | null;
}

export interface CorrectionRow {
  id: number;
  original: string;
  corrected: string;
  reason: string | null;
  count: number;
  first_seen: string;
  last_seen: string;
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

