import { getDb, withTransaction, type CorrectionRow } from '../../shared/db.js';
import { nowIso } from '../../shared/fs-utils.js';
import { batchSaveWords, type BatchWordItem } from './vocab-store.js';

export interface CorrectionInput {
  original: string;
  corrected: string;
  reason?: string;
  words?: BatchWordItem[];
}

export interface RecordCorrectionResult {
  recorded: number;
  skipped: number;
  word_saves: number;
  details: Array<{ original: string; corrected: string; count: number }>;
}

export function recordCorrection(input: CorrectionInput): { id: number; count: number } {
  const db = getDb();
  const now = nowIso();
  const original = input.original.trim();
  const corrected = input.corrected.trim();
  if (!original || !corrected) {
    throw new Error('original and corrected are required');
  }

  const upsert = db.prepare(`
    INSERT INTO corrections (original, corrected, reason, count, first_seen, last_seen)
    VALUES (?, ?, ?, 1, ?, ?)
    ON CONFLICT(original, corrected) DO UPDATE SET
      count = count + 1,
      last_seen = excluded.last_seen,
      reason = COALESCE(excluded.reason, corrections.reason)
  `);
  upsert.run(original, corrected, input.reason ?? null, now, now);

  const row = db
    .prepare('SELECT id, count FROM corrections WHERE original = ? AND corrected = ?')
    .get(original, corrected) as { id: number; count: number };
  return row;
}

export function batchRecordCorrections(items: CorrectionInput[]): RecordCorrectionResult {
  const result: RecordCorrectionResult = { recorded: 0, skipped: 0, word_saves: 0, details: [] };
  const wordItems: BatchWordItem[] = [];

  withTransaction(() => {
    for (const item of items) {
      try {
        const r = recordCorrection(item);
        result.recorded += 1;
        result.details.push({ original: item.original, corrected: item.corrected, count: r.count });
        if (item.words && item.words.length) {
          for (const w of item.words) wordItems.push(w);
        }
      } catch {
        result.skipped += 1;
      }
    }
  });

  if (wordItems.length) {
    const saved = batchSaveWords(wordItems);
    result.word_saves = saved.count;
  }
  return result;
}

export interface TopCorrection {
  original: string;
  corrected: string;
  reason: string | null;
  count: number;
  last_seen: string;
}

export function getTopCorrections(limit = 5, sinceIso?: string): TopCorrection[] {
  const db = getDb();
  const stmt = sinceIso
    ? db.prepare(
        `SELECT original, corrected, reason, count, last_seen FROM corrections
         WHERE last_seen >= ? ORDER BY count DESC, last_seen DESC LIMIT ?`,
      )
    : db.prepare(
        `SELECT original, corrected, reason, count, last_seen FROM corrections
         ORDER BY count DESC, last_seen DESC LIMIT ?`,
      );
  const rows = (sinceIso ? stmt.all(sinceIso, limit) : stmt.all(limit)) as unknown as CorrectionRow[];
  return rows.map((r) => ({
    original: r.original,
    corrected: r.corrected,
    reason: r.reason,
    count: r.count,
    last_seen: r.last_seen,
  }));
}

export function getCorrectionStats(): { total: number; unique_pairs: number; recent_count: number } {
  const db = getDb();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const total = (db.prepare('SELECT COALESCE(SUM(count),0) AS s FROM corrections').get() as { s: number }).s;
  const uniquePairs = (db.prepare('SELECT COUNT(*) AS c FROM corrections').get() as { c: number }).c;
  const recent = (
    db
      .prepare('SELECT COALESCE(SUM(count),0) AS s FROM corrections WHERE last_seen >= ?')
      .get(cutoff) as { s: number }
  ).s;
  return { total, unique_pairs: uniquePairs, recent_count: recent };
}
