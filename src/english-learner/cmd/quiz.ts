import {
  getDb, rowToWord, rowToPhrase,
  type WordRow, type PhraseRow, type WordRecord, type PhraseRecord,
} from '../../shared/db.js';
import type { Command } from '../../shared/cli.js';

type Focus = 'low_mastery' | 'high_lookup' | 'new' | 'random';

function pickOrderClause(focus: Focus): string {
  switch (focus) {
    case 'low_mastery': return 'ORDER BY mastery ASC, updated_at DESC';
    case 'high_lookup': return 'ORDER BY lookup_count DESC, mastery ASC';
    case 'new': return 'ORDER BY created_at DESC';
    case 'random': return 'ORDER BY RANDOM()';
    default: return 'ORDER BY mastery ASC, updated_at DESC';
  }
}

function fetchWords(orderClause: string, limit: number): WordRecord[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM words ${orderClause} LIMIT ?`).all(limit) as unknown as WordRow[];
  return rows.map((r) => rowToWord(r)).filter((w): w is WordRecord => w !== null);
}

function fetchPhrases(orderClause: string, limit: number): PhraseRecord[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM phrases ${orderClause} LIMIT ?`).all(limit) as unknown as PhraseRow[];
  return rows.map((r) => rowToPhrase(r)).filter((p): p is PhraseRecord => p !== null);
}

interface QuizItem {
  id: string;
  type: 'word' | 'phrase';
  question: string;
  answer: string;
  phonetic: string;
  examples: string[];
  mastery: number;
  lookup_count: number;
  definitions?: { pos: string; meaning: string; examples: string[] }[];
}

export function generateQuiz(
  count = 10,
  quizType: 'word' | 'phrase' | 'all' = 'all',
  focus: Focus = 'low_mastery',
): QuizItem[] {
  const orderClause = pickOrderClause(focus);
  const limit = Math.max(count * 2, count);

  type WordItem = WordRecord & { type: 'word' };
  type PhraseItem = PhraseRecord & { type: 'phrase' };
  let pool: (WordItem | PhraseItem)[] = [];
  if (quizType === 'word' || quizType === 'all') {
    pool.push(...fetchWords(orderClause, limit).map((w) => ({ ...w, type: 'word' as const })));
  }
  if (quizType === 'phrase' || quizType === 'all') {
    pool.push(...fetchPhrases(orderClause, limit).map((p) => ({ ...p, type: 'phrase' as const })));
  }
  if (!pool.length) return [];

  if (focus === 'low_mastery') {
    pool.sort((a, b) => (a.mastery || 0) - (b.mastery || 0));
  } else if (focus === 'high_lookup') {
    pool.sort((a, b) => (b.lookup_count || 0) - (a.lookup_count || 0));
  } else if (focus === 'new') {
    pool.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  } else {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }

  return pool.slice(0, count).map((item): QuizItem => {
    if (item.type === 'word') {
      const defs = item.definitions || [];
      return {
        id: item.word,
        type: 'word',
        question: item.word,
        answer: defs.map((d) => `${d.pos} ${d.meaning}`).join('; '),
        definitions: defs,
        phonetic: item.phonetic || '',
        examples: defs.flatMap((d) => d.examples || []),
        mastery: item.mastery || 0,
        lookup_count: item.lookup_count || 0,
      };
    }
    return {
      id: item.phrase,
      type: 'phrase',
      question: item.phrase,
      answer: item.definition || '',
      phonetic: item.phonetic || '',
      examples: item.examples || [],
      mastery: item.mastery || 0,
      lookup_count: item.lookup_count || 0,
    };
  });
}

interface ReviewCandidate {
  item: string;
  type: 'word' | 'phrase';
  mastery: number;
  lookup_count: number;
  definition: string;
  score: number;
}

export function getReviewCandidates(limit = 20): ReviewCandidate[] {
  const db = getDb();

  const wordRows = db.prepare(`
    SELECT word AS item, mastery, lookup_count, data,
           (100 - mastery) + lookup_count * 5 AS score
    FROM words
    ORDER BY score DESC
    LIMIT ?
  `).all(limit) as Array<{ item: string; mastery: number; lookup_count: number; data: string; score: number }>;

  const phraseRows = db.prepare(`
    SELECT phrase AS item, mastery, lookup_count, data,
           (100 - mastery) + lookup_count * 5 AS score
    FROM phrases
    ORDER BY score DESC
    LIMIT ?
  `).all(limit) as Array<{ item: string; mastery: number; lookup_count: number; data: string; score: number }>;

  const items: ReviewCandidate[] = [];
  for (const r of wordRows) {
    const data = JSON.parse(r.data) as { definitions?: { pos: string; meaning: string }[] };
    const defs = data.definitions || [];
    items.push({
      item: r.item,
      type: 'word',
      mastery: r.mastery,
      lookup_count: r.lookup_count,
      definition: defs.map((d) => `${d.pos} ${d.meaning}`).join('; '),
      score: r.score,
    });
  }
  for (const r of phraseRows) {
    const data = JSON.parse(r.data) as { definition?: string };
    items.push({
      item: r.item,
      type: 'phrase',
      mastery: r.mastery,
      lookup_count: r.lookup_count,
      definition: data.definition || '',
      score: r.score,
    });
  }
  items.sort((a, b) => b.score - a.score);
  return items.slice(0, limit);
}

interface CategorySummary {
  total: number;
  mastered: number;
  learning: number;
  new: number;
  total_lookups: number;
}

interface RecentItem {
  type: 'word' | 'phrase';
  id: string;
  created_at: string;
  mastery: number;
}

export function getLearningSummary(): {
  words: CategorySummary;
  phrases: CategorySummary;
  recent_additions: RecentItem[];
} {
  const db = getDb();

  const formatCats = (table: string): CategorySummary => {
    const c = db.prepare(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(lookup_count), 0) AS total_lookups,
        SUM(CASE WHEN mastery >= 80 THEN 1 ELSE 0 END) AS mastered,
        SUM(CASE WHEN mastery >= 30 AND mastery < 80 THEN 1 ELSE 0 END) AS learning,
        SUM(CASE WHEN mastery < 30 THEN 1 ELSE 0 END) AS new_count
      FROM ${table}
    `).get() as Record<string, number>;
    return {
      total: c.total || 0,
      mastered: c.mastered || 0,
      learning: c.learning || 0,
      new: c.new_count || 0,
      total_lookups: c.total_lookups || 0,
    };
  };

  const recent = db.prepare(`
    SELECT 'word' AS type, word AS id, created_at, mastery FROM words
    UNION ALL
    SELECT 'phrase' AS type, phrase AS id, created_at, mastery FROM phrases
    ORDER BY created_at DESC
    LIMIT 10
  `).all() as unknown as RecentItem[];

  return {
    words: formatCats('words'),
    phrases: formatCats('phrases'),
    recent_additions: recent,
  };
}

export const command: Command = {
  description: 'Quiz generation, review, and learning summary',
  run: (args) => {
    if (args.length < 1) {
      console.log('Usage: cli.cjs quiz <action> [args]');
      console.log('Actions: generate, review, summary');
      process.exit(1);
    }
    const action = args[0];
    if (action === 'generate') {
      const count = args[1] ? parseInt(args[1], 10) : 10;
      const quizType = (args[2] as 'word' | 'phrase' | 'all') || 'all';
      const focus = (args[3] as Focus) || 'low_mastery';
      console.log(JSON.stringify(generateQuiz(count, quizType, focus), null, 2));
    } else if (action === 'review') {
      const limit = args[1] ? parseInt(args[1], 10) : 20;
      console.log(JSON.stringify(getReviewCandidates(limit), null, 2));
    } else if (action === 'summary') {
      console.log(JSON.stringify(getLearningSummary(), null, 2));
    } else {
      console.log(JSON.stringify({ error: 'invalid_command' }));
      process.exit(1);
    }
  },
};
