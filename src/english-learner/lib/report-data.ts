import {
  getDb, rowToWord, rowToPhrase,
  type WordRow, type PhraseRow, type WordRecord, type PhraseRecord,
} from '../../shared/db.js';
import { getStats, type Stats } from './vocab-store.js';
import { getTopCorrections, getCorrectionStats, type TopCorrection } from './corrections-store.js';
import { getProseStats, getRecentProse, type ProseLogRow } from './prose-store.js';

export const ALL_ITEMS_CAP = 5000;
export const TOP_CORRECTIONS_LIMIT = 50;
export const ACTIVITY_DAYS = 30;
export const DUE_LIMIT = 200;
export const RECENT_PROSE_LIMIT = 20;

export interface ActivityBucket {
  day: string;
  total: number;
  by_type: Record<string, number>;
}

export interface MaterialsReport {
  total_materials: number;
  by_type: Record<string, number>;
  date_range: { from: string; to: string } | null;
  words_per_source: Array<{ source_type: string; unique_words: number }>;
  recent_materials: Array<{ date: string; source_type: string; word_count: number }>;
}

export interface ProseReport {
  total: number;
  clean: number;
  with_issues: number;
  clean_rate: number;
  by_language: Array<{ language: string; total: number; clean: number; clean_rate: number }>;
  recent_30d: { total: number; clean: number; with_issues: number; clean_rate: number };
  recent_entries: Array<{
    ts: string;
    language: string;
    length: number;
    had_issues: boolean;
    issue_count: number;
    excerpt: string | null;
  }>;
}

export interface ReportData {
  generated_at: string;
  stats: Stats;
  correction_stats: { total: number; unique_pairs: number; recent_count: number };
  due_words: WordRecord[];
  due_phrases: PhraseRecord[];
  all_words: WordRecord[];
  all_phrases: PhraseRecord[];
  words_truncated: boolean;
  phrases_truncated: boolean;
  top_corrections: TopCorrection[];
  activity: ActivityBucket[];
  prose: ProseReport;
  materials?: MaterialsReport;
}

function dayKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function denseActivity(rows: Array<{ day: string; query_type: string; c: number }>, now: Date): ActivityBucket[] {
  const buckets = new Map<string, ActivityBucket>();
  for (let i = ACTIVITY_DAYS - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const key = dayKey(d);
    buckets.set(key, { day: key, total: 0, by_type: {} });
  }
  for (const row of rows) {
    const bucket = buckets.get(row.day);
    if (!bucket) continue;
    bucket.total += row.c;
    bucket.by_type[row.query_type] = (bucket.by_type[row.query_type] || 0) + row.c;
  }
  return Array.from(buckets.values());
}

export function collectReportData(now: Date = new Date()): ReportData {
  const db = getDb();
  const nowIso = now.toISOString();

  const dueWordRows = db
    .prepare(`SELECT * FROM words WHERE next_review_at IS NOT NULL AND next_review_at <= ? ORDER BY next_review_at LIMIT ?`)
    .all(nowIso, DUE_LIMIT) as unknown as WordRow[];
  const duePhraseRows = db
    .prepare(`SELECT * FROM phrases WHERE next_review_at IS NOT NULL AND next_review_at <= ? ORDER BY next_review_at LIMIT ?`)
    .all(nowIso, DUE_LIMIT) as unknown as PhraseRow[];

  const allWordRows = db
    .prepare(`SELECT * FROM words ORDER BY mastery DESC, lookup_count DESC LIMIT ?`)
    .all(ALL_ITEMS_CAP + 1) as unknown as WordRow[];
  const allPhraseRows = db
    .prepare(`SELECT * FROM phrases ORDER BY mastery DESC, lookup_count DESC LIMIT ?`)
    .all(ALL_ITEMS_CAP + 1) as unknown as PhraseRow[];

  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - ACTIVITY_DAYS + 1);
  cutoff.setUTCHours(0, 0, 0, 0);
  const activityRows = db
    .prepare(`SELECT date(ts) AS day, query_type, count(*) AS c FROM history WHERE ts >= ? GROUP BY day, query_type`)
    .all(cutoff.toISOString()) as unknown as Array<{ day: string; query_type: string; c: number }>;

  const allWords = allWordRows.slice(0, ALL_ITEMS_CAP).map(rowToWord).filter((w): w is WordRecord => w !== null);
  const allPhrases = allPhraseRows.slice(0, ALL_ITEMS_CAP).map(rowToPhrase).filter((p): p is PhraseRecord => p !== null);

  return {
    generated_at: nowIso,
    stats: getStats(),
    correction_stats: getCorrectionStats(),
    due_words: dueWordRows.map(rowToWord).filter((w): w is WordRecord => w !== null),
    due_phrases: duePhraseRows.map(rowToPhrase).filter((p): p is PhraseRecord => p !== null),
    all_words: allWords,
    all_phrases: allPhrases,
    words_truncated: allWordRows.length > ALL_ITEMS_CAP,
    phrases_truncated: allPhraseRows.length > ALL_ITEMS_CAP,
    top_corrections: getTopCorrections(TOP_CORRECTIONS_LIMIT),
    activity: denseActivity(activityRows, now),
    prose: collectProseReport(),
    materials: collectMaterialsReport(db),
  };
}

function collectProseReport(): ProseReport {
  const stats = getProseStats();
  const recent = getRecentProse(RECENT_PROSE_LIMIT);
  return {
    total: stats.total,
    clean: stats.clean,
    with_issues: stats.with_issues,
    clean_rate: stats.clean_rate,
    by_language: stats.by_language,
    recent_30d: stats.recent_30d,
    recent_entries: recent.map((r: ProseLogRow) => ({
      ts: r.ts,
      language: r.language,
      length: r.length,
      had_issues: r.had_issues === 1,
      issue_count: r.issue_count,
      excerpt: r.excerpt,
    })),
  };
}

function collectMaterialsReport(db: ReturnType<typeof getDb>): MaterialsReport | undefined {
  const totalRow = db.prepare('SELECT COUNT(*) as c FROM materials').get() as { c: number } | undefined;
  if (!totalRow || totalRow.c === 0) return undefined;

  const byTypeRows = db.prepare(
    'SELECT source_type, COUNT(*) as count FROM materials GROUP BY source_type',
  ).all() as Array<{ source_type: string; count: number }>;
  const byType: Record<string, number> = {};
  for (const row of byTypeRows) byType[row.source_type] = row.count;

  const dateRange = db.prepare(
    'SELECT MIN(date) as min_date, MAX(date) as max_date FROM materials',
  ).get() as { min_date: string | null; max_date: string | null };

  const wordsPerSource = db.prepare(
    'SELECT m.source_type, COUNT(DISTINCT mw.word) as unique_words FROM material_words mw JOIN materials m ON mw.material_id = m.id GROUP BY m.source_type',
  ).all() as Array<{ source_type: string; unique_words: number }>;

  const recentMaterials = db.prepare(
    'SELECT date, source_type, word_count FROM materials ORDER BY date DESC LIMIT 10',
  ).all() as Array<{ date: string; source_type: string; word_count: number }>;

  return {
    total_materials: totalRow.c,
    by_type: byType,
    date_range: dateRange.min_date ? { from: dateRange.min_date, to: dateRange.max_date! } : null,
    words_per_source: wordsPerSource,
    recent_materials: recentMaterials,
  };
}
