import {
  getDb, rowToWord, rowToPhrase, withTransaction,
  type WordDefinition, type WordRecord, type PhraseRecord,
  type WordRow, type PhraseRow,
} from '../../shared/db.js';
import { nowIso } from '../../shared/fs-utils.js';

export interface SaveWordOpts {
  definition?: string;
  pos?: string;
  examples?: string[];
  phonetic?: string;
  synonyms?: string[];
  antonyms?: string[];
  definitions?: WordDefinition[];
}

export interface SavePhraseOpts {
  definition?: string;
  phonetic?: string;
  literal?: string;
  examples?: string[];
}

export interface BatchWordItem extends SaveWordOpts {
  word?: string;
}

export interface Stats {
  total_words: number;
  total_phrases: number;
  total_lookups: number;
  mastered_words: number;
  learning_words: number;
  new_words: number;
}

const packWordData = ({ definitions, phonetic, synonyms, antonyms }: Partial<WordRecord>): string =>
  JSON.stringify({
    definitions: definitions || [],
    phonetic: phonetic || '',
    synonyms: synonyms || [],
    antonyms: antonyms || [],
  });

const packPhraseData = ({ definition, phonetic, literal, examples }: Partial<PhraseRecord>): string =>
  JSON.stringify({
    definition: definition || '',
    phonetic: phonetic || '',
    literal: literal || '',
    examples: examples || [],
  });

export function getWord(word: string): WordRecord | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM words WHERE word = ?').get(word.toLowerCase()) as
    | WordRow
    | undefined;
  return rowToWord(row);
}

export function saveWord(word: string, opts: SaveWordOpts = {}): WordRecord | null {
  const db = getDb();
  const key = word.toLowerCase();
  const existing = getWord(key);
  const now = nowIso();

  let definitions: WordDefinition[];
  if (opts.definitions) {
    definitions = opts.definitions;
  } else if (opts.definition) {
    definitions = [{ pos: opts.pos || '', meaning: opts.definition, examples: opts.examples || [] }];
  } else {
    definitions = existing?.definitions || [];
  }

  const merged: Partial<WordRecord> = {
    definitions,
    phonetic: opts.phonetic || existing?.phonetic || '',
    synonyms: opts.synonyms || existing?.synonyms || [],
    antonyms: opts.antonyms || existing?.antonyms || [],
  };

  db.prepare(`
    INSERT INTO words (word, data, mastery, lookup_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(word) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `).run(
    key,
    packWordData(merged),
    existing?.mastery || 0,
    existing?.lookup_count || 0,
    existing?.created_at || now,
    now,
  );

  return getWord(key);
}

export function incrementLookup(word: string): number {
  const db = getDb();
  const key = word.toLowerCase();
  const result = db.prepare(`
    UPDATE words SET lookup_count = lookup_count + 1, last_lookup = ? WHERE word = ?
  `).run(nowIso(), key);
  if (result.changes === 0) return 0;
  const row = db.prepare('SELECT lookup_count FROM words WHERE word = ?').get(key) as
    | { lookup_count: number }
    | undefined;
  return row?.lookup_count || 0;
}

export function getPhrase(phrase: string): PhraseRecord | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM phrases WHERE phrase = ?').get(phrase.toLowerCase()) as
    | PhraseRow
    | undefined;
  return rowToPhrase(row);
}

export function savePhrase(phrase: string, opts: SavePhraseOpts = {}): PhraseRecord | null {
  const db = getDb();
  const key = phrase.toLowerCase();
  const existing = getPhrase(key);
  const now = nowIso();

  const merged: Partial<PhraseRecord> = {
    definition: opts.definition || existing?.definition || '',
    phonetic: opts.phonetic || existing?.phonetic || '',
    literal: opts.literal || existing?.literal || '',
    examples: opts.examples || existing?.examples || [],
  };

  db.prepare(`
    INSERT INTO phrases (phrase, data, mastery, lookup_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(phrase) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `).run(
    key,
    packPhraseData(merged),
    existing?.mastery || 0,
    existing?.lookup_count || 0,
    existing?.created_at || now,
    now,
  );

  return getPhrase(key);
}

export function logQuery(query: string, queryType: string): void {
  const db = getDb();
  db.prepare('INSERT INTO history (ts, query, query_type) VALUES (?, ?, ?)')
    .run(nowIso(), query, queryType);
}

export function updateMastery(item: string, isWord: boolean, correct: boolean): number {
  const db = getDb();
  const key = item.toLowerCase();
  const table = isWord ? 'words' : 'phrases';
  const col = isWord ? 'word' : 'phrase';

  const row = db.prepare(`SELECT mastery FROM ${table} WHERE ${col} = ?`).get(key) as
    | { mastery: number }
    | undefined;
  if (!row) return 0;

  const current = row.mastery || 0;
  const next = correct ? Math.min(100, current + 10) : Math.max(0, current - 5);
  db.prepare(`UPDATE ${table} SET mastery = ?, updated_at = ? WHERE ${col} = ?`)
    .run(next, nowIso(), key);
  return next;
}

export function getStats(): Stats {
  const db = getDb();
  const wordStats = db.prepare(`
    SELECT
      COUNT(*) AS total_words,
      COALESCE(SUM(lookup_count), 0) AS total_lookups,
      SUM(CASE WHEN mastery >= 80 THEN 1 ELSE 0 END) AS mastered_words,
      SUM(CASE WHEN mastery >= 30 AND mastery < 80 THEN 1 ELSE 0 END) AS learning_words,
      SUM(CASE WHEN mastery < 30 THEN 1 ELSE 0 END) AS new_words
    FROM words
  `).get() as Record<string, number>;

  const phraseStats = db.prepare('SELECT COUNT(*) AS total_phrases FROM phrases').get() as {
    total_phrases: number;
  };

  return {
    total_words: wordStats.total_words || 0,
    total_phrases: phraseStats.total_phrases || 0,
    total_lookups: wordStats.total_lookups || 0,
    mastered_words: wordStats.mastered_words || 0,
    learning_words: wordStats.learning_words || 0,
    new_words: wordStats.new_words || 0,
  };
}

export function batchGetWords(words: string[]): {
  found: Record<string, WordRecord>;
  not_found: string[];
} {
  const result: { found: Record<string, WordRecord>; not_found: string[] } = {
    found: {},
    not_found: [],
  };
  if (!Array.isArray(words) || words.length === 0) return result;

  const db = getDb();
  const placeholders = words.map(() => '?').join(',');
  const rows = db
    .prepare(`SELECT * FROM words WHERE word IN (${placeholders})`)
    .all(...words.map((w) => w.toLowerCase())) as unknown as WordRow[];

  const byKey = new Map(rows.map((r) => [r.word, r]));
  const incrementer = db.prepare(`
    UPDATE words SET lookup_count = lookup_count + 1, last_lookup = ? WHERE word = ?
  `);
  const ts = nowIso();

  withTransaction(() => {
    for (const w of words) {
      const key = w.toLowerCase();
      const row = byKey.get(key);
      if (row) {
        incrementer.run(ts, key);
        const refreshed = db.prepare('SELECT * FROM words WHERE word = ?').get(key) as
          | WordRow
          | undefined;
        const wordRec = rowToWord(refreshed);
        if (wordRec) result.found[w] = wordRec;
      } else {
        result.not_found.push(w);
      }
    }
  });

  return result;
}

export function batchSaveWords(wordsData: BatchWordItem[]): { saved: string[]; count: number } {
  const db = getDb();
  const saved: string[] = [];
  const now = nowIso();

  const upsert = db.prepare(`
    INSERT INTO words (word, data, mastery, lookup_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(word) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `);

  withTransaction(() => {
    for (const item of wordsData) {
      const word = (item.word || '').toLowerCase();
      if (!word) continue;
      const existing = getWord(word);

      let definitions: WordDefinition[];
      if (item.definitions) {
        definitions = item.definitions;
      } else if (item.definition) {
        definitions = [
          { pos: item.pos || '', meaning: item.definition, examples: item.examples || [] },
        ];
      } else {
        definitions = existing?.definitions || [];
      }

      const merged: Partial<WordRecord> = {
        definitions,
        phonetic: item.phonetic || existing?.phonetic || '',
        synonyms: item.synonyms || existing?.synonyms || [],
        antonyms: item.antonyms || existing?.antonyms || [],
      };

      upsert.run(
        word,
        packWordData(merged),
        existing?.mastery || 0,
        existing?.lookup_count || 0,
        existing?.created_at || now,
        now,
      );
      saved.push(word);
    }
  });

  return { saved, count: saved.length };
}
