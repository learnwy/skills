# Data Storage

SQLite database at `~/.learnwy/english-learner/data.db`. Schema migration is managed by `src/shared/db.ts` (versioned `MIGRATIONS` array — never modify a published migration; add a new one).

## Tables

```sql
CREATE TABLE words (
  word TEXT PRIMARY KEY,
  data TEXT NOT NULL,           -- JSON: { definitions, phonetic, synonyms, antonyms }
  mastery INTEGER NOT NULL DEFAULT 0,
  lookup_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_lookup TEXT,
  next_review_at TEXT,         -- spaced-repetition (added v2)
  interval_days INTEGER         -- 1/3/7/14/30/90 ladder
);
CREATE INDEX idx_words_mastery       ON words(mastery);
CREATE INDEX idx_words_lookup        ON words(lookup_count);
CREATE INDEX idx_words_next_review   ON words(next_review_at);

CREATE TABLE phrases (
  phrase TEXT PRIMARY KEY,
  data TEXT NOT NULL,           -- JSON: { definition, phonetic, literal, examples }
  mastery INTEGER NOT NULL DEFAULT 0,
  lookup_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_lookup TEXT,
  next_review_at TEXT,
  interval_days INTEGER
);
CREATE INDEX idx_phrases_mastery     ON phrases(mastery);
CREATE INDEX idx_phrases_lookup      ON phrases(lookup_count);
CREATE INDEX idx_phrases_next_review ON phrases(next_review_at);

CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  query TEXT NOT NULL,
  query_type TEXT NOT NULL
);
CREATE INDEX idx_history_ts ON history(ts);
```

The `data` column stores JSON. Indexed columns support quiz/review ordering.

## Word record (returned by `get_word`)

```json
{
  "word": "run",
  "definitions": [
    { "pos": "v.", "meaning": "跑，奔跑", "examples": ["I run every morning."] },
    { "pos": "n.", "meaning": "跑步",     "examples": ["I went for a run."] }
  ],
  "phonetic": "/rʌn/",
  "synonyms": ["sprint", "jog"],
  "antonyms": ["walk", "stop"],
  "created_at": "2024-01-15T10:00:00",
  "updated_at": "2024-01-15T10:00:00",
  "lookup_count": 5,
  "mastery": 40,
  "next_review_at": "2026-05-12T00:00:00",
  "interval_days": 1
}
```

## Spaced-repetition cadence

Each correct answer advances the interval; each incorrect answer resets it:

| Step | Interval | Trigger |
|---|---|---|
| 0 | 1 day | new word saved |
| 1 | 3 days | first correct |
| 2 | 7 days | second correct |
| 3 | 14 days | third correct |
| 4 | 30 days | fourth correct |
| 5 | 90 days | fifth correct |

The SessionStart hook (`lib/session-scan.ts`) picks the 3 oldest items where `next_review_at <= now()` and prepends them to the first session of each day.

## JSON migration (one-shot, legacy)

If old JSON exports exist under `~/.learnwy/english-learner/{words,phrases,history}/`, run:

```bash
node scripts/cli.cjs migrate         # idempotent import into data.db
node scripts/cli.cjs migrate --dry-run
```

Mainline data is already in `data.db`; most users never need this.

## Error handling

| Problem | Resolution |
|---|---|
| `~/.learnwy/english-learner/` not writable | `mkdir -p ~/.learnwy/english-learner` |
| `node:sqlite` unavailable | Upgrade Node ≥ 24 |
| `batch_get` returns all `not_found` | AI generates definitions, then `batch_save` |
| Quiz returns empty | Show "词库为空" + usage hints |
| Input language ambiguous | `cli.cjs sentence classify`, then ask user if still unclear |
| `batch_save` fails | Retry once, then report error + raw data so user can save manually |
| Old JSON exports on disk | Run `node scripts/cli.cjs migrate` |
