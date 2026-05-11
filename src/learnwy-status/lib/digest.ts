import * as fs from 'node:fs';
import * as path from 'node:path';
import { DB_PATH, getDb } from '../../shared/db.js';
import { LEARNWY_ROOT } from '../../shared/learnwy-paths.js';

export interface VocabSection {
  total: number;
  mastered: number;
  learning: number;
  new: number;
  total_lookups: number;
  top_review: string[];
}

export interface WikiSection {
  generated_at: string;
  age_hours: number;
  pages: number;
  broken_links: number;
  orphans: number;
  broken_sources: number;
}

export interface OptimizerSection {
  last_7d: number;
  last_30d: number;
  by_trigger_30d: Record<string, number>;
}

export interface ConsolidationSection {
  last_nudge_at: string;
  hours_ago: number;
}

export interface LogsSection {
  largest_file: string | null;
  largest_size_bytes: number;
  rotated_count: number;
}

export interface Digest {
  generated_at: string;
  vocab: VocabSection | null;
  wiki: WikiSection | null;
  optimizer: OptimizerSection | null;
  consolidation: ConsolidationSection | null;
  logs: LogsSection;
}

interface ReviewRow {
  item: string;
  mastery: number;
  lookup_count: number;
}

interface SummaryCount {
  total: number;
  mastered: number;
  learning: number;
  new_count: number;
  total_lookups: number;
}

export function readVocabSection(): VocabSection | null {
  if (!fs.existsSync(DB_PATH)) return null;
  const db = getDb();

  const totalsW = db.prepare(`
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(lookup_count), 0) AS total_lookups,
      SUM(CASE WHEN mastery >= 80 THEN 1 ELSE 0 END) AS mastered,
      SUM(CASE WHEN mastery >= 30 AND mastery < 80 THEN 1 ELSE 0 END) AS learning,
      SUM(CASE WHEN mastery < 30 THEN 1 ELSE 0 END) AS new_count
    FROM words
  `).get() as SummaryCount | undefined;
  const totalsP = db.prepare(`
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(lookup_count), 0) AS total_lookups,
      SUM(CASE WHEN mastery >= 80 THEN 1 ELSE 0 END) AS mastered,
      SUM(CASE WHEN mastery >= 30 AND mastery < 80 THEN 1 ELSE 0 END) AS learning,
      SUM(CASE WHEN mastery < 30 THEN 1 ELSE 0 END) AS new_count
    FROM phrases
  `).get() as SummaryCount | undefined;

  const total = (totalsW?.total || 0) + (totalsP?.total || 0);
  if (total === 0) return null;

  const reviewRows = db.prepare(`
    SELECT item, mastery, lookup_count, score FROM (
      SELECT word AS item, mastery, lookup_count, (100 - mastery) + lookup_count * 5 AS score FROM words
      UNION ALL
      SELECT phrase AS item, mastery, lookup_count, (100 - mastery) + lookup_count * 5 AS score FROM phrases
    )
    ORDER BY score DESC
    LIMIT 3
  `).all() as unknown as ReviewRow[];

  return {
    total,
    mastered: (totalsW?.mastered || 0) + (totalsP?.mastered || 0),
    learning: (totalsW?.learning || 0) + (totalsP?.learning || 0),
    new: (totalsW?.new_count || 0) + (totalsP?.new_count || 0),
    total_lookups: (totalsW?.total_lookups || 0) + (totalsP?.total_lookups || 0),
    top_review: reviewRows.map((r) => r.item),
  };
}

interface HealthFile {
  generated_at: string;
  totals: { pages: number; broken_links: number; orphans: number; broken_sources: number };
}

export function readWikiSection(): WikiSection | null {
  const f = path.join(LEARNWY_ROOT, 'llm-wiki', 'health.json');
  if (!fs.existsSync(f)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(f, 'utf8')) as HealthFile;
    const ts = Date.parse(j.generated_at);
    return {
      generated_at: j.generated_at,
      age_hours: Number.isFinite(ts) ? Math.round((Date.now() - ts) / (60 * 60 * 1000)) : -1,
      pages: j.totals.pages,
      broken_links: j.totals.broken_links,
      orphans: j.totals.orphans,
      broken_sources: j.totals.broken_sources,
    };
  } catch {
    return null;
  }
}

interface OptimizerEvent {
  ts: string;
  trigger: string;
}

export function readOptimizerSection(): OptimizerSection | null {
  const f = path.join(LEARNWY_ROOT, 'prompt-optimizer', 'events.jsonl');
  if (!fs.existsSync(f)) return null;
  const now = Date.now();
  const cutoff7 = now - 7 * 24 * 60 * 60 * 1000;
  const cutoff30 = now - 30 * 24 * 60 * 60 * 1000;
  let last7 = 0;
  let last30 = 0;
  const byTrigger: Record<string, number> = {};
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    if (!line) continue;
    try {
      const e = JSON.parse(line) as OptimizerEvent;
      const t = Date.parse(e.ts);
      if (!Number.isFinite(t) || t < cutoff30) continue;
      last30++;
      byTrigger[e.trigger] = (byTrigger[e.trigger] || 0) + 1;
      if (t >= cutoff7) last7++;
    } catch {
      /* skip */
    }
  }
  if (last30 === 0) return null;
  return { last_7d: last7, last_30d: last30, by_trigger_30d: byTrigger };
}

interface NudgeFile {
  ts: string;
  session_id?: string;
}

export function readConsolidationSection(): ConsolidationSection | null {
  const f = path.join(LEARNWY_ROOT, 'knowledge-consolidation', 'last-nudge.json');
  if (!fs.existsSync(f)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(f, 'utf8')) as NudgeFile;
    const ts = Date.parse(j.ts);
    if (!Number.isFinite(ts)) return null;
    return {
      last_nudge_at: j.ts,
      hours_ago: Math.round((Date.now() - ts) / (60 * 60 * 1000)),
    };
  } catch {
    return null;
  }
}

export function readLogsSection(): LogsSection {
  const dir = path.join(LEARNWY_ROOT, 'logs');
  if (!fs.existsSync(dir)) return { largest_file: null, largest_size_bytes: 0, rotated_count: 0 };
  let largestName: string | null = null;
  let largestSize = 0;
  let rotated = 0;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    let sz = 0;
    try {
      sz = fs.statSync(p).size;
    } catch {
      continue;
    }
    if (/\.log\.\d+$/.test(name)) rotated++;
    if (sz > largestSize) {
      largestSize = sz;
      largestName = name;
    }
  }
  return { largest_file: largestName, largest_size_bytes: largestSize, rotated_count: rotated };
}

export function buildDigest(): Digest {
  return {
    generated_at: new Date().toISOString(),
    vocab: readVocabSection(),
    wiki: readWikiSection(),
    optimizer: readOptimizerSection(),
    consolidation: readConsolidationSection(),
    logs: readLogsSection(),
  };
}

export function formatHuman(d: Digest): string {
  const lines: string[] = [];
  lines.push(`learnwy status — ${d.generated_at}`);
  lines.push('');

  if (d.vocab) {
    lines.push('Vocab (~/.learnwy/english-learner/):');
    lines.push(`  ${d.vocab.total} items — ${d.vocab.mastered} mastered, ${d.vocab.learning} learning, ${d.vocab.new} new (${d.vocab.total_lookups} total lookups)`);
    if (d.vocab.top_review.length) {
      lines.push(`  Top review: ${d.vocab.top_review.join(', ')}`);
    }
  } else {
    lines.push('Vocab: (empty — run english-learner to start collecting)');
  }
  lines.push('');

  if (d.wiki) {
    const stale = d.wiki.age_hours > 24 ? `⚠ ${d.wiki.age_hours}h stale` : `${d.wiki.age_hours}h ago`;
    lines.push(`Wiki health (~/.learnwy/llm-wiki/health.json — ${stale}):`);
    lines.push(`  ${d.wiki.pages} pages, ${d.wiki.broken_links} broken links, ${d.wiki.orphans} orphans, ${d.wiki.broken_sources} broken **Source** refs`);
  } else {
    lines.push('Wiki health: (no health.json — run "llm-wiki health-check")');
  }
  lines.push('');

  if (d.optimizer) {
    const trig = Object.entries(d.optimizer.by_trigger_30d).map(([k, v]) => `${k}=${v}`).join(', ');
    lines.push('Prompt-optimizer:');
    lines.push(`  ${d.optimizer.last_7d} fires in last 7d, ${d.optimizer.last_30d} in 30d (${trig})`);
  } else {
    lines.push('Prompt-optimizer: (no events recorded)');
  }
  lines.push('');

  if (d.consolidation) {
    lines.push(`Knowledge-consolidation: last nudge ${d.consolidation.hours_ago}h ago (${d.consolidation.last_nudge_at})`);
  } else {
    lines.push('Knowledge-consolidation: (no nudges recorded)');
  }
  lines.push('');

  if (d.logs.largest_file) {
    const mb = (d.logs.largest_size_bytes / 1024 / 1024).toFixed(2);
    lines.push(`Logs: largest=${d.logs.largest_file} (${mb} MB), rotated=${d.logs.rotated_count}`);
  } else {
    lines.push('Logs: (none)');
  }

  return lines.join('\n');
}

export function formatCompact(d: Digest): string {
  const parts: string[] = [];
  if (d.vocab) {
    parts.push(`vocab=${d.vocab.total} (${d.vocab.mastered}m/${d.vocab.learning}l/${d.vocab.new}n)`);
  }
  if (d.wiki) {
    parts.push(`wiki=${d.wiki.pages}p ${d.wiki.broken_links}brk ${d.wiki.orphans}orphan ${d.wiki.broken_sources}srcdrift`);
  }
  if (d.optimizer) {
    parts.push(`optimizer=${d.optimizer.last_7d}/7d ${d.optimizer.last_30d}/30d`);
  }
  if (d.consolidation) {
    parts.push(`kc-nudge=${d.consolidation.hours_ago}h-ago`);
  }
  return parts.join(' · ');
}
