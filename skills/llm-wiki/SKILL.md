---
name: llm-wiki
description: "Use this skill to build and maintain a persistent, compounding knowledge base where the LLM summarizes sources, compiles wiki pages, and maintains cross-references. When a wiki exists at ~/.learnwy/llm-wiki/, check it before answering complex questions — skip if the directory does not exist. Use when the user mentions 'knowledge base', 'llm wiki', 'personal wiki', 'ingest this source', 'compile knowledge', 'second brain', 'build a wiki', 'knowledge management', or wants to add books, articles, or notes to a persistent store."
metadata:
  author: "learnwy"
  version: "3.1"
  source: "Andrej Karpathy, LLM Wiki (GitHub Gist, April 2026)"
  trigger: "always"
---

# LLM Wiki

Build and maintain a persistent, compounding knowledge base where the LLM does all the grunt work — summarizing, cross-referencing, filing, and bookkeeping — while you focus on sourcing, exploration, and asking the right questions.

> **Core Principle**: Stop using LLMs like search engines. Use them as knowledge compilers. Instead of re-deriving knowledge from raw documents on every query (RAG), the LLM incrementally builds a persistent wiki — structured, interlinked markdown files that compound in value with every source you add and every question you ask.

## Prerequisites

- Any LLM Agent with file read/write capability
- A file system for storing markdown files
- Node.js >= 18 (for management scripts)
- Optional: Obsidian for browsing/graph view, Git for version control

## When to Use

| Signal | Action |
|--------|--------|
| "ingest this", "add this source", "process this document" | Ingest |
| "what does the wiki say about X", complex knowledge question | Query / Auto-query |
| "save this to wiki", "capture this" | Quick-capture |
| "save this pattern", reusable code snippet | Snippet-capture |
| "health check", "lint the wiki", "find contradictions" | Lint |
| "set up a new wiki", "initialize knowledge base" | Setup |
| "build a wiki from these files" | Setup → batch ingest |

**Do NOT invoke when:** single conversation insight (→ `knowledge-consolidation`), structural analysis (→ `on-contradiction`), practice validation (→ `on-practice`), long-term strategy (→ `on-protracted-war`), code implementation (→ `requirement-workflow`).

## Auto Modes

### Auto-Query

When a wiki exists at `~/.learnwy/llm-wiki/`, proactively check before answering complex questions:

1. Scan `wiki/topics.txt` (flat keyword file) for topic match
2. If match → read relevant wiki pages
3. Prepend wiki insight with `[[page]]` citations to your answer
4. Offer write-back if answer adds new knowledge

Skip auto-query for: code questions, trivial facts, when wiki doesn't exist.

### Quick-Capture

Lightweight save to `raw/notes/{date}-{slug}.md` when user says "save this" or shares valuable knowledge. Does NOT create wiki pages — run ingest later.

### Snippet-Capture

Save code patterns to `raw/snippets/` → `wiki/snippets/` with platform + language tags. Cross-reference with related concepts.

## The Three-Layer Architecture

| Layer | Owner | Path | Purpose |
|-------|-------|------|---------|
| **Raw** | You | `raw/` | Immutable source material — LLM reads, never modifies |
| **Wiki** | LLM | `wiki/` | Compiled pages: summaries, concepts, entities, comparisons, snippets, troubleshooting, decisions, cheatsheets |
| **Schema** | Co-evolved | `CLAUDE.md` | Structure rules, conventions, templates |

### Storage Location

- **Global (default)**: `~/.learnwy/llm-wiki/` — shared across all projects and sessions
- **Project-scoped**: `<project-root>/.trae/wikis/` — for domain-specific knowledge

## Directory Structure

```
~/.learnwy/llm-wiki/
├── raw/                    # Layer 1: articles/, books/, notes/, snippets/, ...
├── wiki/                   # Layer 2
│   ├── summaries/          #   One per raw source
│   ├── concepts/           #   Organized by domain subdirs
│   │   ├── frontend/       #     React, TS, CSS, bundlers
│   │   ├── ios/            #     Swift, SwiftUI, UIKit
│   │   ├── android/        #     Kotlin, Compose
│   │   ├── go/             #     Go, BFF, middleware
│   │   ├── architecture/   #     Patterns, DDD
│   │   ├── se-practices/   #     Testing, refactoring
│   │   ├── system-design/  #     Distributed systems
│   │   ├── philosophy/     #     Ethics, Taoism
│   │   ├── psychology/     #     Habits, mindset
│   │   ├── methodology/    #     Mao trilogy
│   │   └── ...             #     21 domain dirs total
│   ├── entities/           #   People, orgs, products
│   ├── comparisons/        #   Side-by-side analyses
│   ├── snippets/           #   Code patterns (tagged)
│   ├── troubleshooting/    #   Problem → solution
│   ├── index.md            #   Auto-generated master index
│   └── topics.txt          #   Auto-generated keyword list
├── CLAUDE.md               # Layer 3: Schema
└── log.md                  # Audit trail
```

## Operations & Agents

| Operation | Agent | Trigger | Mode |
|-----------|-------|---------|------|
| **Auto-Query** | querier | User asks complex question + wiki exists | Automatic |
| **Quick-Capture** | (inline) | "save to wiki" or valuable knowledge detected | Semi-auto |
| **Snippet-Capture** | (inline) | Code pattern shared or discovered | Semi-auto |
| **Ingest** | ingestor | New raw source added | Manual |
| **Query** | querier | User asks the wiki explicitly | Manual |
| **Lint** | linter | Health check requested | Manual |
| **Setup** | schema-writer | New wiki project | Manual |
| **Cross-Platform** | ingestor | Platform comparison needed | Manual |

Agents: [ingestor](agents/operations/ingestor.md), [querier](agents/operations/querier.md), [linter](agents/operations/linter.md), [schema-writer](agents/writing/schema-writer.md).

## Management Scripts

Four Node.js ESM scripts for wiki maintenance, plus two structural tools. Run from the skill directory:

```sh
cd skills/llm-wiki
node scripts/generate-index/index.mjs     # Regenerate wiki/index.md from filesystem
node scripts/generate-topics/index.mjs    # Regenerate wiki/topics.txt
node scripts/lint/index.mjs               # Check broken links, orphans, missing tags
node scripts/stats/index.mjs              # Quick dashboard of raw + wiki counts
node scripts/freshness-check/index.mjs    # Flag stale/unverified pages
node scripts/reorganize/index.mjs --dry-run  # Preview concept reorganization
```

| Script | Output | When to Run |
|--------|--------|-------------|
| `generate-index` | `wiki/index.md` — categorized, accurate page counts | After batch ingestion or when index drifts |
| `generate-topics` | `wiki/topics.txt` — keywords for auto-query matching | After new topic areas are added |
| `lint` | Errors (broken wikilinks) + warnings (orphans, missing tags) | Weekly maintenance or before commits |
| `stats` | Box-drawing dashboard of Layer 1 + Layer 2 counts | Anytime — quick health snapshot |
| `freshness-check` | Stale pages (90d tech, 180d stable), unverified, missing dates | Monthly or after major version releases |
| `reorganize` | Move concepts/ into domain subdirs (supports `--dry-run`) | When new domain areas are added |

Scripts use shared modules at `scripts/shared/` (constants, fs-utils, meta extraction, category mapping). Override wiki location with `LLM_WIKI_ROOT` env var.

## Agent Output Contract

| Allowed | Not Allowed |
|---------|-------------|
| Read raw sources (never modify) | Modify anything in `raw/` |
| Create/update files in `wiki/` and `outputs/` | Delete raw sources |
| Update `index.md` and `log.md` after operations | Create pages without cross-references |
| Flag contradictions between sources | Silently override existing content |

Every operation must: (1) log in `log.md`, (2) update `index.md`, (3) check contradictions, (4) maintain cross-references.

## Execution Checklist

**Before**: Wiki exists? → CLAUDE.md present? → Raw sources in correct subdir? → For Android: set `Verified: no`. For snippets: include platform + language tags.

**After**: log.md updated? → index.md reflects changes? → Cross-refs added (top-5 limit, "See Also" for extras)? → topics.txt updated if new topic area?

## Boundary Enforcement

This skill handles: wiki setup, ingestion, querying, linting, cross-references, index maintenance.

Does NOT handle: single insights (→ `knowledge-consolidation`), contradiction analysis (→ `on-contradiction`), practice validation (→ `on-practice`), phased strategy (→ `on-protracted-war`), code implementation (→ `requirement-workflow`).

## References (Loaded on Demand)

- [Page templates](references/templates.md) — 9 templates: summary, concept, entity, index, snippet, troubleshooting, decision, cheatsheet, comparison
- [Workflows & reference](references/workflows.md) — Composition workflows, error handling, key concepts, expansion roadmap

## Hooks

This skill registers IDE hooks to enable **deterministic auto-query** — the wiki is consulted automatically when relevant, without relying on the AI remembering.

### Scope

**Global** — installs to `~/.claude/settings.json` and `~/.trae/hooks.json` since wiki lives at `~/.learnwy/llm-wiki/`.

### Events

| Event | Script | Purpose |
|-------|--------|---------|
| `SessionStart` | `scripts/hooks/session-context.cjs` | Load wiki topics into session context (max 30 topics) |
| `UserPromptSubmit` | `scripts/hooks/auto-query.cjs` | Match user question against wiki topics, inject reading hints |

### Install

```bash
# Install hooks globally (supports both Trae and Claude Code)
node scripts/hooks/../../../../scripts/hooks/install.cjs install \
  --config ./hooks.json --scope global --target both
```

### Uninstall

```bash
node scripts/hooks/../../../../scripts/hooks/install.cjs uninstall \
  --skill-id llm-wiki --scope global --target both
```

### How It Works

1. **SessionStart**: loads `wiki/topics.txt` and injects up to 30 topic keywords into session context
2. **UserPromptSubmit**: for each user message >15 chars, checks keyword overlap with wiki topics
3. If matches found → injects topic names + wiki path for the AI to read relevant pages
4. If no matches or wiki doesn't exist → exits silently
