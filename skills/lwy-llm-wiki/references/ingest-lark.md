# Feishu ingest workflow (ingest-lark)

Ingest Feishu group chats and documents as **one class of raw source** for llm-wiki. The `lark-context` CLI only pulls data;
the compilation/consolidation logic is owned by this workflow, and artifacts are written into the unified `~/.learnwy/llm-wiki/` wiki — **not**
into a standalone `~/.claude/lark-memory/` (that store has been retired and migrated into this wiki).

> The whole process runs locally in Claude; it calls no external LLM API.

## Prerequisites

- `lark-context` ≥ 0.1.0 (`bnpm i -g @tiktok-fe/lark-context`)
- `lark-cli` has run `auth login`
- Self-check first: `lark-context --version`; if not installed/not logged in, pass stderr through — do not log in on the user's behalf.

## Triggers

- "consolidate this Feishu group" / "organize recent chats into the wiki"
- "ingest this Feishu document <url>"
- "what has the X group chatted about recently, record it into the knowledge base"

## Step 1 — Decide the time window

```bash
sqlite3 ~/.lark-context/raw.db "SELECT value FROM kv WHERE key='last_digest_at'"
```

| Case | Window |
|---|---|
| `last_digest_at` has a value and the user didn't specify a window | `--since 24h` |
| `last_digest_at` is empty + the user named a specific group | `--since 90d` (first-consolidation fallback) |
| The user explicitly stated a window | As the user said |

## Step 2 — Resolve the chat filter

```bash
lark-context groups list
```

Match the group name/alias the user mentioned to a concrete alias. "All groups" or no name → don't add `--chat`.
A new group not yet followed → suggest `groups add` + `pull`; the consolidation itself does not proactively join groups.

## Step 3 — Pull and land in raw (immutable layer)

```bash
lark-context pull [--chat <alias>] [--since <window>]      # sync to SQLite
lark-context show [--chat <alias>] --since <window>        # fetch the original text
```

Archive this `show` original text **verbatim** to `raw/lark/<alias>-<ISO-date>.md` (with `**Source**:`,
`**Pulled**:`, `**Chat**:` headers). This is the **single source of truth** for this consolidation — don't fabricate, don't fill in from memory what `show` doesn't contain.

`show` is empty → tell the user "no new messages in the window", write no compiled page, and finish (you may still update the timestamp if needed).

Document case: `lark-context show-doc <token-or-url>` → save to `raw/lark/doc-<slug>.md`.

## Step 4 — Compile into the wiki (compilation layer)

Read this consolidation's archive in `raw/lark/` and incrementally merge into the corresponding entity/source pages. Mapping:

| Feishu content | Target | slug example |
|---|---|---|
| Group-chat consolidation (one page per digest or accumulated per group) | `wiki/threads/<alias>.md` | `threads/gec-search.md` |
| Chronological stream (by ISO week) | `wiki/diaries/<ISO-week>.md` | `diaries/2026-W22.md` |
| People who appear | `wiki/people/<slug>.md` | `people/hou-yu.md` |
| Projects / products | `wiki/products/<slug>.md` | `products/toko-standalone.md` |
| Decisions / dated events | `wiki/events/<slug>.md` | `events/mira-router.md` |
| Organizations / teams | `wiki/organizations/<slug>.md` | |
| Terms / concepts | `wiki/concepts/<slug>.md` | |
| Document summary | `wiki/articles/<slug>.md` | |

**Incremental merge rules**:
- Keep user-written paragraphs **untouched**; append new facts with date tags
- A stale summary may be rewritten
- Value judgment: a fleeting first mention does not create a new entity; appears ≥2 times / the user says "record it" / actionable decision → create one. Better too few than too many
- Conflict (the same fact stated differently by two sources): list both, attributing the source (group + date + speaker)
- Cross-references: thread/diary pages use `[[people/...]]`, `[[products/...]]`, `[[events/...]]` to link to entities

## Step 5 — Update the index + timestamp + log

```bash
cd skills/llm-wiki && node scripts/cli.cjs generate-index && node scripts/cli.cjs generate-topics
sqlite3 ~/.lark-context/raw.db "INSERT INTO kv(key,value) VALUES('last_digest_at', datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
```

Append one line to `log.md`: `<date> ingest-lark <alias> — N messages → X entities / Y source pages`.

## Step 6 — Report to the user

> Consolidated N messages, updated X entities (P people / Pr products / E events) and Y source pages (threads/diaries).

You may attach a brief "created A / modified B files" list.

## Notes

- **Don't fabricate**: only record facts in the `show` output
- **Preserve user-written content**: hand-written paragraphs on entity pages are never touched; only append in machine-recognizable regions (dated bullet / summary)
- **CLI non-zero exit**: pass stderr through; if it hits a known case (not installed / not authed / kicked out of the group), add a one-line suggestion; otherwise pass through verbatim
- **Window too narrow, no messages**: report that the window is too narrow; don't force-write
