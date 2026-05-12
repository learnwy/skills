import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { getDb } from '../../shared/db.js';
import { nowIso } from '../../shared/fs-utils.js';
import { parseContent, type ParsedEntry, type SourceType } from './lexicon-parsers.js';
import { batchSaveWords, type BatchWordItem } from './vocab-store.js';

export interface ImportOptions {
  type?: SourceType | 'auto';
  dryRun?: boolean;
  force?: boolean;
  since?: string;
  verbose?: boolean;
}

export interface MaterialInfo {
  dirPath: string;
  lexiconPath: string;
  sourceType: SourceType;
  date: string;
  hour?: string;
  relativePath: string;
}

export interface ImportResult {
  total_materials: number;
  imported: number;
  skipped: number;
  total_words_extracted: number;
  unique_words: number;
  by_type: Record<string, number>;
}

const DATE_RE = /(\d{4}-\d{2}-\d{2})/;
const FALLBACK_DIR_RE = /(\d{4}-\d{2}-\d{2})-(\d{2})/;
const WEEK_RE = /week-(\d+)/;

export function inferSourceType(dirPath: string): SourceType {
  if (/english-fallback/.test(dirPath)) return 'fallback';
  if (/\/daily\//.test(dirPath)) {
    if (/\/weeks\//.test(dirPath)) return 'weeks';
    return 'daily';
  }
  if (/\/weekly\//.test(dirPath)) return 'weekly';
  if (/oral-course|oral/.test(dirPath)) return 'oral';
  if (/\/weeks\//.test(dirPath)) return 'weeks';
  return 'daily';
}

export function inferDate(dirPath: string, sourceType: SourceType): { date: string; hour?: string } {
  if (sourceType === 'fallback') {
    const m = dirPath.match(FALLBACK_DIR_RE);
    if (m) return { date: m[1], hour: m[2] };
  }
  const dateMatch = dirPath.match(DATE_RE);
  if (dateMatch) return { date: dateMatch[1] };
  const weekMatch = dirPath.match(WEEK_RE);
  if (weekMatch) {
    const weekNum = parseInt(weekMatch[1], 10);
    const year = new Date().getFullYear();
    const jan4 = new Date(year, 0, 4);
    const dayOffset = (weekNum - 1) * 7;
    const d = new Date(jan4.getTime() + dayOffset * 86400000);
    return { date: d.toISOString().slice(0, 10) };
  }
  return { date: new Date().toISOString().slice(0, 10) };
}

export function scanDirectory(baseDir: string): MaterialInfo[] {
  const results: MaterialInfo[] = [];

  function walk(dir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    const hasLexicon = entries.some(e => e.isFile() && e.name === 'LEXICON.md');
    if (hasLexicon) {
      const lexiconPath = path.join(dir, 'LEXICON.md');
      const sourceType = inferSourceType(dir);
      const { date, hour } = inferDate(dir, sourceType);
      const relativePath = path.relative(baseDir, dir);
      results.push({ dirPath: dir, lexiconPath, sourceType, date, hour, relativePath });
    }

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        walk(path.join(dir, entry.name));
      }
    }
  }

  walk(baseDir);
  return results.sort((a, b) => a.date.localeCompare(b.date));
}

function md5(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

export function runImport(baseDir: string, options: ImportOptions = {}): ImportResult {
  const resolvedDir = path.resolve(baseDir);
  if (!fs.existsSync(resolvedDir)) {
    throw new Error(`Directory not found: ${resolvedDir}`);
  }

  const materials = scanDirectory(resolvedDir);
  const result: ImportResult = {
    total_materials: materials.length,
    imported: 0,
    skipped: 0,
    total_words_extracted: 0,
    unique_words: 0,
    by_type: {},
  };

  if (options.dryRun) {
    for (const mat of materials) {
      const type = options.type && options.type !== 'auto' ? options.type : mat.sourceType;
      result.by_type[type] = (result.by_type[type] || 0) + 1;
      const content = fs.readFileSync(mat.lexiconPath, 'utf-8');
      const entries = parseContent(content, type);
      result.total_words_extracted += entries.length;
    }
    return result;
  }

  const db = getDb();
  const allWords = new Set<string>();

  for (const mat of materials) {
    const type = options.type && options.type !== 'auto' ? options.type : mat.sourceType;

    if (options.since && mat.date < options.since) {
      result.skipped++;
      continue;
    }

    const content = fs.readFileSync(mat.lexiconPath, 'utf-8');
    const checksum = md5(content);

    // Check existing
    if (!options.force) {
      const existing = db.prepare('SELECT checksum FROM materials WHERE source_path = ?').get(mat.relativePath) as { checksum: string } | undefined;
      if (existing?.checksum === checksum) {
        result.skipped++;
        continue;
      }
    }

    const entries = parseContent(content, type);
    if (entries.length === 0) {
      result.skipped++;
      continue;
    }

    result.by_type[type] = (result.by_type[type] || 0) + 1;
    result.total_words_extracted += entries.length;

    // Write materials + material_words in a transaction
    db.exec('BEGIN');
    try {
      // Upsert material
      db.prepare(`
        INSERT INTO materials (source_path, source_type, date, hour, word_count, imported_at, checksum)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(source_path) DO UPDATE SET
          source_type = excluded.source_type,
          date = excluded.date,
          hour = excluded.hour,
          word_count = excluded.word_count,
          imported_at = excluded.imported_at,
          checksum = excluded.checksum
      `).run(mat.relativePath, type, mat.date, mat.hour || null, entries.length, nowIso(), checksum);

      const matRow = db.prepare('SELECT id FROM materials WHERE source_path = ?').get(mat.relativePath) as { id: number };
      const materialId = matRow.id;

      // Delete old material_words for this material
      db.prepare('DELETE FROM material_words WHERE material_id = ?').run(materialId);

      // Insert material_words (dedupe by lowercase word within same material)
      const insertMW = db.prepare(`
        INSERT INTO material_words (material_id, word, position, phonetic, pos, meaning_en, meaning_zh, examples, synonyms, raw_entry)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const seenInMaterial = new Set<string>();
      entries.forEach((entry, idx) => {
        const wordLower = entry.word.toLowerCase();
        allWords.add(wordLower);
        if (seenInMaterial.has(wordLower)) return;
        seenInMaterial.add(wordLower);
        insertMW.run(
          materialId,
          wordLower,
          idx + 1,
          entry.phonetic || null,
          entry.pos || null,
          entry.meaning_en || null,
          entry.meaning_zh || null,
          entry.examples.length > 0 ? JSON.stringify(entry.examples) : null,
          entry.synonyms || null,
          entry.raw_entry || null,
        );
      });

      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }

    // Batch save to words table (has its own transaction)
    const batchItems: BatchWordItem[] = entries.map(e => ({
      word: e.word,
      phonetic: e.phonetic,
      definitions: [{
        pos: e.pos,
        meaning: e.meaning_zh || e.meaning_en,
        examples: e.examples,
      }],
      synonyms: e.synonyms ? e.synonyms.split(/[,;]/).map(s => s.trim()).filter(Boolean) : undefined,
    }));
    batchSaveWords(batchItems);

    result.imported++;
    if (options.verbose) {
      process.stderr.write(`✓ ${mat.relativePath} → ${entries.length} words\n`);
    }
  }

  result.unique_words = allWords.size;
  return result;
}
