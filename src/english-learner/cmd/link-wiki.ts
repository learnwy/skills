import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { getDb, DATA_ROOT } from '../../shared/db.js';
import { parseArgs, type Command } from '../../shared/cli.js';

const WIKI_TOPICS = path.join(os.homedir(), '.learnwy', 'llm-wiki', 'wiki', 'topics.txt');
const LINKS_FILE = path.join(DATA_ROOT, 'wiki-links.json');
const MIN_TERM_LEN = 4;
const MAX_LINKS_PER_TERM = 3;

interface WikiLink {
  term: string;
  type: 'word' | 'phrase';
  topics: string[];
}

interface LinksFile {
  generated_at: string;
  source: string;
  total_terms_scanned: number;
  total_terms_linked: number;
  links: WikiLink[];
}

function loadTopicSegments(): { lines: string[]; segmentIndex: Map<string, string[]> } {
  const lines: string[] = [];
  const segmentIndex = new Map<string, string[]>();
  if (!fs.existsSync(WIKI_TOPICS)) return { lines, segmentIndex };

  const raw = fs.readFileSync(WIKI_TOPICS, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    lines.push(t);
    for (const seg of t.split('-')) {
      if (seg.length < MIN_TERM_LEN) continue;
      const arr = segmentIndex.get(seg) ?? [];
      arr.push(t);
      segmentIndex.set(seg, arr);
    }
  }
  return { lines, segmentIndex };
}

function matchTerm(
  term: string,
  segmentIndex: Map<string, string[]>,
  topicLines: string[],
): string[] {
  const lower = term.toLowerCase();
  if (lower.length < MIN_TERM_LEN) return [];

  const exact = segmentIndex.get(lower);
  if (exact && exact.length) return exact.slice(0, MAX_LINKS_PER_TERM);

  const tokens = lower.split(/[^a-z0-9]+/).filter((t) => t.length >= MIN_TERM_LEN);
  if (tokens.length === 0) return [];
  const hits = new Set<string>();
  for (const tok of tokens) {
    const matches = segmentIndex.get(tok);
    if (matches) {
      for (const m of matches) hits.add(m);
    }
  }
  if (hits.size === 0) {
    for (const line of topicLines) {
      if (line.includes(lower)) hits.add(line);
      if (hits.size >= MAX_LINKS_PER_TERM) break;
    }
  }
  return Array.from(hits).slice(0, MAX_LINKS_PER_TERM);
}

function buildLinks(): LinksFile {
  const { lines, segmentIndex } = loadTopicSegments();
  const db = getDb();

  const wordRows = db.prepare('SELECT word FROM words').all() as Array<{ word: string }>;
  const phraseRows = db.prepare('SELECT phrase FROM phrases').all() as Array<{ phrase: string }>;

  const links: WikiLink[] = [];
  for (const r of wordRows) {
    const topics = matchTerm(r.word, segmentIndex, lines);
    if (topics.length) links.push({ term: r.word, type: 'word', topics });
  }
  for (const r of phraseRows) {
    const topics = matchTerm(r.phrase, segmentIndex, lines);
    if (topics.length) links.push({ term: r.phrase, type: 'phrase', topics });
  }

  return {
    generated_at: new Date().toISOString(),
    source: WIKI_TOPICS,
    total_terms_scanned: wordRows.length + phraseRows.length,
    total_terms_linked: links.length,
    links,
  };
}

export const command: Command = {
  description: 'Match vocab terms to llm-wiki topics; write ~/.learnwy/english-learner/wiki-links.json',
  run: (args) => {
    const { flags } = parseArgs(args);
    if (!fs.existsSync(WIKI_TOPICS)) {
      console.error(`llm-wiki topics file not found: ${WIKI_TOPICS}`);
      console.error('Skipping link-wiki — initialize llm-wiki first.');
      process.exit(0);
    }
    const result = buildLinks();
    if (flags['dry-run']) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (!fs.existsSync(DATA_ROOT)) fs.mkdirSync(DATA_ROOT, { recursive: true });
    fs.writeFileSync(LINKS_FILE, JSON.stringify(result, null, 2) + '\n');
    console.log(`Wrote ${result.total_terms_linked} link(s) (of ${result.total_terms_scanned} terms) to ${LINKS_FILE}`);
  },
};

export function readLinksMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (!fs.existsSync(LINKS_FILE)) return map;
  try {
    const f = JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8')) as LinksFile;
    for (const l of f.links) map.set(l.term, l.topics);
  } catch {
    /* ignore malformed file */
  }
  return map;
}
