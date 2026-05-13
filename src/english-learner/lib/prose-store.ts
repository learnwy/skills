import { getDb } from '../../shared/db.js';
import { nowIso } from '../../shared/fs-utils.js';

export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'other';

export interface ProseLogInput {
  language: Language | string;
  text?: string;
  length?: number;
  had_issues?: boolean;
  issue_count?: number;
}

export interface ProseLogRow {
  id: number;
  ts: string;
  language: string;
  length: number;
  had_issues: number;
  issue_count: number;
  excerpt: string | null;
}

const EXCERPT_MAX = 200;

export function recordProseInput(input: ProseLogInput): { id: number } {
  const db = getDb();
  const text = input.text ?? '';
  const length = input.length ?? text.length;
  const excerpt = text ? text.slice(0, EXCERPT_MAX).replace(/\s+/g, ' ').trim() : null;
  const hadIssues = input.had_issues ? 1 : 0;
  const issueCount = input.issue_count ?? 0;

  const stmt = db.prepare(`
    INSERT INTO prose_log (ts, language, length, had_issues, issue_count, excerpt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(nowIso(), String(input.language), length, hadIssues, issueCount, excerpt);
  return { id: Number(result.lastInsertRowid) };
}

export interface ProseStats {
  total: number;
  clean: number;
  with_issues: number;
  clean_rate: number;
  by_language: Array<{ language: string; total: number; clean: number; clean_rate: number }>;
  recent_30d: { total: number; clean: number; with_issues: number; clean_rate: number };
}

export function getProseStats(): ProseStats {
  const db = getDb();
  const totalRow = db
    .prepare('SELECT COUNT(*) AS c, SUM(CASE WHEN had_issues = 0 THEN 1 ELSE 0 END) AS clean FROM prose_log')
    .get() as { c: number; clean: number | null };
  const total = totalRow.c;
  const clean = totalRow.clean ?? 0;
  const withIssues = total - clean;
  const cleanRate = total > 0 ? clean / total : 0;

  const byLangRows = db
    .prepare(`
      SELECT language,
             COUNT(*) AS total,
             SUM(CASE WHEN had_issues = 0 THEN 1 ELSE 0 END) AS clean
      FROM prose_log
      GROUP BY language
      ORDER BY total DESC
    `)
    .all() as Array<{ language: string; total: number; clean: number | null }>;

  const byLanguage = byLangRows.map((r) => {
    const t = r.total;
    const c = r.clean ?? 0;
    return { language: r.language, total: t, clean: c, clean_rate: t > 0 ? c / t : 0 };
  });

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const recentRow = db
    .prepare(`
      SELECT COUNT(*) AS c, SUM(CASE WHEN had_issues = 0 THEN 1 ELSE 0 END) AS clean
      FROM prose_log
      WHERE ts >= ?
    `)
    .get(cutoff) as { c: number; clean: number | null };
  const recentTotal = recentRow.c;
  const recentClean = recentRow.clean ?? 0;
  const recentWithIssues = recentTotal - recentClean;
  const recentCleanRate = recentTotal > 0 ? recentClean / recentTotal : 0;

  return {
    total,
    clean,
    with_issues: withIssues,
    clean_rate: cleanRate,
    by_language: byLanguage,
    recent_30d: {
      total: recentTotal,
      clean: recentClean,
      with_issues: recentWithIssues,
      clean_rate: recentCleanRate,
    },
  };
}

export function getRecentProse(limit = 20): ProseLogRow[] {
  const db = getDb();
  return db
    .prepare('SELECT id, ts, language, length, had_issues, issue_count, excerpt FROM prose_log ORDER BY ts DESC LIMIT ?')
    .all(limit) as unknown as ProseLogRow[];
}
