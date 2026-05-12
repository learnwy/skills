import { type Command } from '../../shared/cli.js';
import { getDb } from '../../shared/db.js';

export const command: Command = {
  description: 'Show import statistics',
  run(args: string[]) {
    const db = getDb();
    const typeFilter = getFlag(args, '--type');

    const totalMaterials = (db.prepare(
      typeFilter
        ? 'SELECT COUNT(*) as c FROM materials WHERE source_type = ?'
        : 'SELECT COUNT(*) as c FROM materials',
    ).get(...(typeFilter ? [typeFilter] : [])) as { c: number }).c;

    const totalWordsExtracted = (db.prepare(
      typeFilter
        ? 'SELECT COUNT(*) as c FROM material_words mw JOIN materials m ON mw.material_id = m.id WHERE m.source_type = ?'
        : 'SELECT COUNT(*) as c FROM material_words',
    ).get(...(typeFilter ? [typeFilter] : [])) as { c: number }).c;

    const uniqueWords = (db.prepare(
      typeFilter
        ? 'SELECT COUNT(DISTINCT mw.word) as c FROM material_words mw JOIN materials m ON mw.material_id = m.id WHERE m.source_type = ?'
        : 'SELECT COUNT(DISTINCT word) as c FROM material_words',
    ).get(...(typeFilter ? [typeFilter] : [])) as { c: number }).c;

    const byType = db.prepare(
      'SELECT source_type, COUNT(*) as count FROM materials GROUP BY source_type',
    ).all() as Array<{ source_type: string; count: number }>;

    const byTypeObj: Record<string, number> = {};
    for (const row of byType) {
      byTypeObj[row.source_type] = row.count;
    }

    const dateRange = db.prepare(
      'SELECT MIN(date) as min_date, MAX(date) as max_date FROM materials',
    ).get() as { min_date: string | null; max_date: string | null };

    const result = {
      total_materials: totalMaterials,
      total_words_extracted: totalWordsExtracted,
      unique_words: uniqueWords,
      by_type: byTypeObj,
      date_range: dateRange.min_date ? { from: dateRange.min_date, to: dateRange.max_date } : null,
    };

    console.log(JSON.stringify(result, null, 2));
  },
};

function getFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}
