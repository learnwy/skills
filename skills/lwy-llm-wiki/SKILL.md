---
name: lwy-llm-wiki
description: "当用户提到'知识库'、'llm wiki'、'个人wiki'、'收录来源'、'编译知识'、'第二大脑'、'构建wiki'、'知识管理', or wants to add books, articles, notes, podcasts, videos, or Feishu group chats/documents to persistent storage, use this skill to build and maintain a continuously compounding knowledge base. When ~/.learnwy/llm-wiki/ exists, check the wiki before answering complex questions — skip if the directory does not exist."
metadata:
  author: "learnwy"
  version: "4.0"
  source: "Andrej Karpathy, LLM Wiki (GitHub Gist, April 2026)"
  trigger: "always"
---

# LLM Wiki

Build and maintain a continuously compounding personal knowledge base. The LLM does all the heavy lifting — summarizing, cross-referencing, archiving, and bookkeeping — while you focus on collecting sources, exploring, and asking good questions.

> **Core principle**: Don't use the LLM as a search engine. Use it as a knowledge compiler. Instead of re-deriving knowledge from raw documents on every query (RAG), the LLM incrementally builds a persistent wiki — structured, interlinked markdown files that keep gaining value as each source is added and each question is asked.

## Prerequisites

- An LLM agent with file read/write capability
- A file system to store the markdown files
- Node.js >= 18 (required by the management scripts)
- Optional: Feishu sources need `lark-context` + `lark-cli` (see the "Feishu sources" section); Obsidian for browsing/graph view; Git for version control

## When to use

| Signal | Action |
|------|------|
| "ingest this", "add this source", "process this document/article/podcast/video" | Ingest |
| "consolidate this Feishu group", "organize recent chats into the wiki", "ingest this Feishu document" | Feishu ingest (see below) |
| "what does the wiki say about X", complex knowledge questions | Query / auto-query |
| "save to wiki", "record this" | Quick capture |
| "health check", "lint wiki", "find contradictions" | Lint |
| "create a new wiki", "initialize the knowledge base" | Initialize (`cli.cjs init`) |
| "build a wiki from these files" | Initialize → bulk ingest |

**When NOT to invoke:** single-conversation insights (→ `knowledge-consolidation`), methodology analysis (contradiction/practice/protracted-war → `mao-methodology`), code implementation (→ `requirement-workflow`).

## Auto modes

### Auto-query

When `~/.learnwy/llm-wiki/` exists, proactively check it before answering complex questions:

1. Scan `wiki/topics.txt` (a flat keyword file) for matching topics
2. If a match → read the relevant wiki pages
3. Prepend wiki insights before answering, annotating `[[folder/slug]]` references
4. If the answer contributes new knowledge, propose a write-back

Skip auto-query for: simple facts, or when the wiki does not exist.

### Quick capture

When the user says "save this" or shares valuable knowledge, lightly save it to `raw/notes/{date}-{slug}.md`. Don't create a wiki page — run an ingest later.

## Two-layer architecture

| Layer | Owner | Path | Purpose |
|------|--------|------|------|
| **Raw layer** | You | `raw/` | Immutable source material — the LLM reads but never modifies it |
| **Wiki layer** | LLM | `wiki/` | Compiled pages: entities (people/organizations/places/products/events/concepts) + sources (articles/podcasts/videos/diaries/threads) |
| **Schema layer** | Co-evolved | `CLAUDE.md` | Structure rules, conventions, templates |

> **The immutable `raw/` is a core safety property**: all external material (books, articles, podcast transcripts, Feishu pulls) lands first in `raw/<source>/`, where the LLM reads but never modifies it; compiled artifacts are written to `wiki/`. `inbox/` is the "pulled but not yet compiled" staging area, and `archived/` holds retired pages.

### Storage location

- **Global (default)**: `~/.learnwy/llm-wiki/` — shared across projects and sessions
- Override with the `--root <dir>` option (e.g. the alter-ego library `--root ~/.learnwy/ai/private/self`)

## Directory structure (entity-first)

```
~/.learnwy/llm-wiki/
├── raw/                    # Layer 1 (immutable): books/ articles/ papers/ notes/
│                           #   podcasts/ vlogs/ transcripts/ snippets/ specs/
│                           #   lark/ docs/
├── wiki/                   # Layer 2 (compiled)
│   ├── people/             #   entity: people
│   ├── organizations/      #   entity: organizations / teams
│   ├── places/             #   entity: places
│   ├── products/           #   entity: products / projects / initiatives
│   ├── events/             #   entity: dated events / decisions
│   ├── concepts/           #   entity: concepts / terms / domain knowledge (incl. code patterns)
│   ├── other-entities/     #   entity: other, uncategorized
│   ├── articles/           #   source: article summaries
│   ├── podcasts/           #   source: podcast summaries
│   ├── vlogs/              #   source: video summaries
│   ├── diaries/            #   source: chronological stream (incl. Feishu weekly notes)
│   ├── threads/            #   source: conversation consolidations (Feishu group-chat digests)
│   ├── inbox/              #   lifecycle: pulled but not compiled
│   ├── archived/           #   lifecycle: retired pages
│   ├── index.md            #   auto-generated master index
│   └── topics.txt          #   auto-generated keyword list
├── CLAUDE.md               # Layer 3: schema
└── log.md                  # audit log
```

> **Where code knowledge goes**: code snippets / troubleshooting go into `concepts/` (concept pages), and the raw snippets land in `raw/snippets/`. This layout is entity-centric — there are no longer separate top-level `snippets/` / `troubleshooting/` directories.

## Feishu sources (merged from lark-context)

Feishu group chats and documents are ingested as **one class of raw source**: the `lark-context` CLI degrades into a pure data pump (pull → SQLite, show → original text), while the compilation/consolidation logic is owned by this skill. See [`references/ingest-lark.md`](references/ingest-lark.md) for details.

- Pull: `lark-context pull` / `show` → lands in `raw/lark/`
- Compile: group-chat conversations → `wiki/threads/`, people → `wiki/people/`, decisions/events → `wiki/events/`, chronological stream → `wiki/diaries/`
- The old standalone `~/.claude/lark-memory/` memory store has been retired and migrated into this wiki (see the migration notes)

## Operations and agents

| Operation | Agent | Trigger | Mode |
|------|-------|----------|------|
| **Auto-query** | querier | User asks a complex question + wiki exists | Auto |
| **Quick capture** | (inline) | "save to wiki" or valuable knowledge detected | Semi-auto |
| **Ingest** | ingestor | A new raw source is added | Manual |
| **Feishu ingest** | ingestor | Consolidate a Feishu group / document | Manual |
| **Query** | querier | User explicitly asks the wiki | Manual |
| **Lint** | linter | Health check requested | Manual |
| **Initialize** | schema-writer / `cli.cjs init` | Create a new wiki project | Manual |

Agent definitions: [ingestor](agents/operations/ingestor.md), [querier](agents/operations/querier.md), [linter](agents/operations/linter.md), [schema-writer](agents/writing/schema-writer.md).

## Management scripts

A single CLI entry point `{skill_root}/scripts/cli.cjs` dispatches all maintenance subcommands:

```sh
cd skills/llm-wiki
node scripts/cli.cjs init                       # scaffold: create raw/ + wiki/ dirs, schema, index, log
node scripts/cli.cjs generate-index             # regenerate wiki/index.md from the file system
node scripts/cli.cjs generate-topics            # regenerate wiki/topics.txt
node scripts/cli.cjs lint                       # check for broken links and orphan pages
node scripts/cli.cjs stats                      # quick dashboard: raw-layer + wiki-layer stats
node scripts/cli.cjs freshness-check            # flag stale/unverified pages
node scripts/cli.cjs health-check               # aggregate health report → health.json
node scripts/cli.cjs install / uninstall        # register/remove IDE hooks
```

| Subcommand | Output | When to run |
|--------|------|----------|
| `init` | Full directory skeleton + CLAUDE.md / index.md / log.md | First-time setup |
| `generate-index` | `wiki/index.md` — page listing grouped by entity/source | After bulk ingest or when the index drifts |
| `generate-topics` | `wiki/topics.txt` — keywords used for auto-query matching | After adding new topics |
| `lint` | Errors (broken links) + warnings (orphan pages) | Weekly maintenance or pre-commit |
| `stats` | Box-diagram dashboard of raw-layer + wiki-layer counts | Anytime — a quick health snapshot |
| `freshness-check` | Stale pages (90 days for technical, 180 for stable), unverified, missing date | Monthly or after a major release |
| `health-check` | Broken links / orphans / dead **Source** references → `health.json` | CI / pre-commit |

Every command accepts a `--root <dir>` override for the wiki location (default `~/.learnwy/llm-wiki`); the same engine drives both the public world library and the private alter-ego library, with no environment variable needed.

## Agent output contract

| Allowed | Not allowed |
|------|------|
| Read raw sources (never modify) | Modify anything in `raw/` |
| Create/update files in `wiki/` | Delete raw sources |
| Update `index.md` and `log.md` after operations | Create pages with no cross-references |
| Flag contradictions between sources | Silently overwrite existing content |

Every operation must: (1) record to `log.md`, (2) update `index.md`, (3) check for contradictions, (4) maintain cross-references.

## Execution checklist

**Before an operation**: Does the wiki exist? → Does CLAUDE.md exist? → Is the raw source in the correct subdirectory (Feishu → `raw/lark/`)? → Set `Verified: no` for easily-stale content.

**After an operation**: Is log.md updated? → Does index.md reflect the change? → Are cross-references added (cap 5, use "See also" beyond that)? → Is topics.txt updated when there's a new topic?

## Scope boundaries

This skill handles: wiki initialization, ingest (incl. Feishu), query, lint, cross-referencing, index maintenance.

It does not handle: single insights (→ `knowledge-consolidation`), methodology analysis (→ `mao-methodology`), code implementation (→ `requirement-workflow`).

## Reference docs (load on demand)

- [Page templates](references/templates.md) — entity and source page templates: people / organizations / places / products / events / concepts / articles / podcasts / videos / diaries / threads / index
- [Feishu ingest workflow](references/ingest-lark.md) — pull → land in raw/lark → compile into threads/people/events/diaries
- [Workflows and reference](references/workflows.md) — composite workflows, error handling, core concepts, extension roadmap

## Hooks

Register **global** hooks via `learnwy-dispatch` (`~/.claude/settings.json` + `~/.trae/hooks.json`), because the wiki lives at `~/.learnwy/llm-wiki/`.

| Event | Lib function | Purpose |
|------|----------|------|
| `SessionStart` | `lib/session-scan.ts` | Inject up to 30 wiki topics into the session context |
| `UserPromptSubmit` | `lib/prompt-scan.ts` | Match the user's question ↔ topics keywords → inject relevant page hints |

Install/uninstall: `node scripts/cli.cjs install|uninstall --scope global --target both` (provided by `src/shared/install-entry.ts`, shared by all hook-type skills).

## From knowledge-consolidation

KC's `promote` subcommand copies a project-level knowledge document to `raw/notes/<date>-<slug>.md`, with a frontmatter back-pointer. On the next ingest, treat them as ordinary raw sources (they usually merge into a `wiki/concepts/` page and form a `[[link]]` with the original KC document). This is a one-way inflow channel from "project-local fix log" to "global compounding knowledge base".
