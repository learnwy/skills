#!/usr/bin/env node
import * as fs from 'node:fs';
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { DB_PATH, getDb } from '../../shared/db.js';
import { getReviewCandidates } from '../cmd/quiz.js';
import { readLinksMap } from '../cmd/link-wiki.js';

const REVIEW_LIMIT = 3;
const META_KEY = 'last_review_date';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  await readStdin();
  if (!fs.existsSync(DB_PATH)) return;

  const db = getDb();
  const row = db
    .prepare('SELECT value FROM meta WHERE key = ?')
    .get(META_KEY) as { value?: string } | undefined;
  const today = todayISO();
  if (row?.value === today) return;

  const candidates = getReviewCandidates(REVIEW_LIMIT);
  if (candidates.length === 0) return;

  const links = readLinksMap();
  const lines = candidates.map((c) => {
    const def = c.definition.length > 80 ? `${c.definition.slice(0, 77)}...` : c.definition;
    const matchedTopics = links.get(c.item);
    const wikiHint = matchedTopics && matchedTopics.length
      ? ` ↪ wiki: ${matchedTopics.slice(0, 2).join(', ')}`
      : '';
    return `  • ${c.type === 'phrase' ? '"' : ''}${c.item}${c.type === 'phrase' ? '"' : ''} (mastery ${c.mastery}) — ${def}${wikiHint}`;
  });

  injectContext(
    [
      `[english-learner review] Daily refresh — ${candidates.length} due-for-review item(s):`,
      ...lines,
      'When the user next references one of these, prefer it over fresh lookups, and bump mastery via batch_save once recalled correctly.',
    ].join('\n'),
  );

  db.prepare('INSERT INTO meta(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(META_KEY, today);
}

main().catch(() => process.exit(0));
