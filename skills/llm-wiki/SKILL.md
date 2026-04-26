---
name: llm-wiki
description: "If the agent's description mentions that it should be used proactively, then you should try your best to use it without the user having to ask for it first. PROACTIVE: When a wiki exists at ~/.learnwy/llm-wiki/wiki/index.md, this skill should check the wiki before answering complex questions — skip immediately if the wiki directory does not exist. Build and maintain a persistent, compounding knowledge base using LLMs. Based on Andrej Karpathy's LLM Wiki pattern (April 2026). The LLM incrementally reads raw sources, compiles structured wiki pages, maintains cross-references, and keeps everything consistent. Triggers on: 'knowledge base', 'llm wiki', 'personal wiki', 'build a wiki', 'ingest this source', 'knowledge management', 'compile knowledge', 'compounding knowledge', 'second brain'."
metadata:
  author: "learnwy"
  version: "2.1"
  source: "Andrej Karpathy, LLM Wiki (GitHub Gist, April 2026)"
  trigger: "always"
---

# LLM Wiki

Build and maintain a persistent, compounding knowledge base where the LLM does all the grunt work — summarizing, cross-referencing, filing, and bookkeeping — while you focus on sourcing, exploration, and asking the right questions.

> **Core Principle**: Stop using LLMs like search engines. Use them as knowledge compilers. Instead of re-deriving knowledge from raw documents on every query (RAG), the LLM incrementally builds a persistent wiki — structured, interlinked markdown files that compound in value with every source you add and every question you ask. *"Humans abandon wikis because the maintenance burden grows faster than the value. LLMs don't get bored."* — Karpathy

## Prerequisites

- No runtime dependencies (methodology-only skill, no scripts)
- Any LLM Agent with file read/write capability (Claude Code, Cursor, Codex, OpenCode, etc.)
- A file system (local or remote) for storing markdown files
- Optional: Obsidian for browsing/graph view, Git for version control

## When to Use

**Invoke when:**

- User wants to build a personal or team knowledge base from collected sources
- User says "ingest this", "add this to the wiki", "process this document"
- User wants to set up a new knowledge base project from scratch
- User asks a complex question that should be answered from accumulated knowledge
- User wants a health check on their existing wiki
- User mentions "llm wiki", "knowledge compiler", "second brain", "compounding knowledge"
- User has scattered notes/articles/papers and wants them organized and interlinked

**Do NOT invoke when:**

- User wants to save a single conversation insight → use `knowledge-consolidation`
- User wants a one-time document summary without persistence → answer directly
- User needs structural problem analysis → use `on-contradiction`
- User needs practice-based validation → use `on-practice`
- User needs long-term strategy → use `on-protracted-war`
- User needs code implementation → use `requirement-workflow`

## Auto Modes (v2.0)

Two operations can run automatically without explicit user invocation:

### Auto-Query Mode

When a wiki exists at `~/.learnwy/llm-wiki/` (or project-scoped path), the agent should **proactively check the wiki** before answering complex questions.

```
[1. User asks a question]
       ↓
[2. Wiki exists?]
   ├── NO  → Skip, answer normally
   └── YES ↓
[3. Question touches wiki topics?]
   ├── NO  → Skip, answer normally
   └── YES ↓
[4. Read relevant wiki pages]
       ↓
[5. Augment answer with wiki knowledge]
       ↓
[6. Cite wiki sources inline: "From your wiki: [[concepts/X]]..."]
       ↓
[7. Offer write-back if answer adds new insight]
```

**Detection heuristic** — check the wiki when the user's question:
- Mentions a concept/entity that has a wiki page
- Asks for synthesis, comparison, or historical context
- Asks "what do we know about X" or "remind me about Y"
- Is about a topic the wiki covers (check `wiki/index.md` topics)

**Do NOT auto-query when:**
- The question is about code in the current project (not knowledge-domain)
- The question is trivial / single-fact that doesn't need wiki backing
- The wiki doesn't exist yet

**Auto-query response format** — prepend to your normal answer:

```
📚 **From your wiki:**
{brief insight from wiki pages, with [[page]] citations}

---
{normal answer to the user's question}
```

### Quick-Capture Mode

A lightweight path for saving conversation insights to the wiki's `raw/` layer — much lighter than full ingestion.

```
[1. During conversation, user shares or discovers valuable knowledge]
       ↓
[2. Agent detects capture-worthy content]
   - User shares a link/article/insight
   - Conversation produces a novel conclusion
   - User says "save this", "remember this", "add to wiki"
       ↓
[3. Write to raw/notes/{date}-{slug}.md]
   - Title, source (conversation), date
   - Key content captured verbatim or summarized
       ↓
[4. Log in log.md as CAPTURE]
       ↓
[5. Tell user: "Captured to raw/notes/. Run 'ingest' later to integrate into wiki."]
```

**Quick-capture triggers:**
- User explicitly says "save this to wiki", "capture this", "add to wiki"
- User shares a URL + asks to remember it
- Conversation produces a significant insight the user might want to keep

**Quick-capture does NOT:**
- Create wiki/ pages (that's the ingestor's job)
- Update cross-references or index
- Run contradiction checks

**Quick-capture output format:**

```markdown
# {Title}

**Captured**: {date}
**Source**: Conversation
**Status**: Raw — awaiting ingestion

## Content
{captured knowledge}

## Context
{why this was captured, what conversation it came from}
```

## Storage Modes

The wiki supports two storage modes. The **global shared wiki** is the default — it lives in a fixed location accessible from any project or session. A **project-scoped wiki** is optional for domain-specific knowledge that belongs to one project.

### Mode 1: Global Shared Wiki (Default)

Lives under the user's personal directory, accessible from **any project, any session**:

```
~/.learnwy/llm-wiki/                   # Global wiki root (shared everywhere)
├── raw/                               # Layer 1: Raw Sources (YOU own this)
│   ├── articles/
│   ├── papers/
│   ├── books/
│   ├── podcasts/
│   ├── notes/
│   └── transcripts/
├── wiki/                              # Layer 2: The Wiki (LLM owns this)
│   ├── summaries/                     #   Summary of each raw source
│   ├── concepts/                      #   Concept/topic pages
│   ├── entities/                      #   Entity pages (people, orgs, products)
│   ├── comparisons/                   #   Side-by-side analyses
│   ├── index.md                       #   Master index
│   └── overview.md                    #   High-level synthesis
├── outputs/                           # Query outputs (LLM writes, can be filed back)
│   ├── qa/                            #   Saved Q&A sessions
│   └── health/                        #   Lint/health check reports
├── CLAUDE.md                          # Layer 3: Schema (YOU + LLM co-evolve)
└── log.md                             # Audit trail of all operations
```

**Why global?** Knowledge compounds. Your understanding of "attention mechanisms" from a research session should be available when you're coding in a different project. A fixed shared location means:
- Every AI session can read/write the same wiki
- Obsidian can open `~/.learnwy/llm-wiki/` as a vault permanently
- Git can version the entire wiki in one repo
- No knowledge gets siloed inside a single project

**Resolution rule**: The agent resolves `~` to the user's home directory. The path `~/.learnwy/llm-wiki/` is the canonical location.

### Mode 2: Project-Scoped Wiki (Optional)

For domain-specific knowledge that belongs to a single project:

```
<project-root>/
├── .trae/
│   └── wikis/                         # Project-scoped wiki
│       ├── raw/
│       ├── wiki/
│       ├── outputs/
│       ├── CLAUDE.md
│       └── log.md
```

**When to use project-scoped:**
- The knowledge is tightly coupled to a specific codebase (API docs, architecture decisions)
- The project has its own team that shouldn't mix with personal knowledge
- The user explicitly asks for a project-local wiki

**Default behavior**: If no mode is specified, use **global** (`~/.learnwy/llm-wiki/`).

### Mode Selection

| User Signal | Mode | Path |
|-------------|------|------|
| "add to my wiki", "ingest this" (no qualifier) | Global | `~/.learnwy/llm-wiki/` |
| "add to my personal knowledge base" | Global | `~/.learnwy/llm-wiki/` |
| "add to this project's wiki" | Project | `<project-root>/.trae/wikis/` |
| "set up a wiki for this repo" | Project | `<project-root>/.trae/wikis/` |
| First-time setup without existing wiki | Ask user | — |

## The Three-Layer Architecture

### Layer 1: Raw Sources (`raw/`)

- **Owner**: You
- **Rule**: Immutable — the LLM reads but NEVER modifies raw sources
- **Content**: Any unstructured material — articles, papers, PDFs, notes, transcripts, images, data files
- **Organization**: Subdirectories by type (articles/, papers/, books/, etc.)
- **This is your source of truth**

### Layer 2: The Wiki (`wiki/`)

- **Owner**: LLM (exclusively)
- **Rule**: The LLM creates, updates, and maintains all files here. You read them.
- **Content**: Structured markdown files — summaries, concept pages, entity pages, comparisons, cross-references
- **Key property**: Persistent and compounding — every ingestion enriches the whole wiki
- **Navigation**: `index.md` (master catalog) + `overview.md` (high-level synthesis)
- **Cross-references**: Every page links to related pages using `[[wikilinks]]` or markdown links

### Layer 3: The Schema (`CLAUDE.md`)

- **Owner**: You + LLM co-evolve
- **Rule**: Defines the wiki's structure, conventions, templates, and workflows
- **Purpose**: Turns a generic LLM into a disciplined wiki maintainer
- **Location**: Project root — the LLM reads this before every operation

## Key Concepts

| Concept | Definition |
|---------|-----------|
| **Knowledge Compilation** | Processing raw sources into structured, interlinked wiki pages — done once at ingest time, not re-derived per query |
| **Compounding Knowledge** | Every new source enriches existing pages; every question deepens the wiki. Knowledge accumulates, not resets |
| **Separation of Concerns** | Raw sources (immutable truth) vs Wiki (LLM's compiled output) vs Schema (rules). Never mix them |
| **Cross-Reference Maintenance** | The LLM maintains bidirectional links between all related pages automatically |
| **Contradiction Detection** | When new information conflicts with existing wiki content, the LLM flags it explicitly |
| **Write-Back Loop** | Query outputs and insights get filed back into the wiki, creating a feedback loop |
| **Lint Pass** | Periodic health checks to find orphan pages, broken links, stale content, missing cross-references |
| **Schema Evolution** | The CLAUDE.md rules file evolves as you learn what works for your domain |
| **Source of Truth** | Raw sources are always authoritative. Wiki is a compiled representation, never the original |
| **LLM as Maintainer** | The LLM does ALL the bookkeeping humans hate — updating indexes, fixing links, keeping summaries current |

## The Six Operations

| Operation | Agent | Trigger | Mode | Frequency |
|-----------|-------|---------|------|-----------|
| **Auto-Query** | [querier](agents/operations/querier.md) | User asks a question + wiki exists | Automatic | Every question |
| **Quick-Capture** | (inline workflow) | User says "save to wiki" or shares valuable knowledge | Semi-auto | As needed |
| **Ingest** | [ingestor](agents/operations/ingestor.md) | New raw source added | Manual | Per source |
| **Query** | [querier](agents/operations/querier.md) | User explicitly asks the wiki | Manual | Daily |
| **Lint** | [linter](agents/operations/linter.md) | Health check requested | Manual | Weekly |
| **Setup** | [schema-writer](agents/writing/schema-writer.md) | New wiki project | Manual | Once |

## Agent Summary

| Domain | Agent | Core Function |
|--------|-------|--------------|
| Operations | [ingestor](agents/operations/ingestor.md) | Read raw source → create/update wiki pages → maintain cross-references → update index |
| Operations | [querier](agents/operations/querier.md) | Answer questions from wiki → save insights back → deepen knowledge |
| Operations | [linter](agents/operations/linter.md) | Scan for contradictions, orphans, stale content → generate health report |
| Writing | [schema-writer](agents/writing/schema-writer.md) | Create initial CLAUDE.md schema → evolve rules over time |

## Routing Decision Table

| User Signal | Agent | Mode | Confidence |
|-------------|-------|------|------------|
| User asks any complex question + wiki exists at `~/.learnwy/llm-wiki/` | querier (auto-query) | Automatic | Medium |
| "save this to wiki", "capture this", "add to wiki" | quick-capture (inline) | Semi-auto | High |
| "ingest this", "add this source", "process this document" | ingestor | Manual | High |
| "what does the wiki say about X", "summarize Y from my knowledge" | querier | Manual | High |
| "health check", "find contradictions", "lint the wiki" | linter | Manual | High |
| "set up a new wiki", "create the schema", "initialize knowledge base" | schema-writer | Manual | High |
| "build a wiki from these files" | schema-writer → ingestor (batch) | Manual | High |
| General "knowledge base" mention without specific operation | schema-writer (if no wiki exists) or querier (if wiki exists) | Manual | Medium |

## Composition Workflows

### New Wiki Setup (Cold Start)

```
1. schema-writer    → Create directory structure + CLAUDE.md schema
2. ingestor         → Batch-ingest all raw sources in raw/
3. linter           → Initial health check — verify cross-references and coverage
```

### Daily Knowledge Work

```
1. ingestor         → Process any new sources dropped into raw/
2. querier          → Answer questions, explore topics, generate insights
3. querier          → File interesting outputs back into wiki/ (write-back loop)
```

### Weekly Maintenance

```
1. linter           → Full health check: contradictions, orphans, stale content
2. ingestor         → Re-process sources that linter flagged as poorly integrated
3. schema-writer    → Update CLAUDE.md if new conventions are needed
```

### Deep Research Sprint

```
1. ingestor         → Batch-ingest 10-20 sources on a topic
2. querier          → Ask synthesis questions: "What are the main schools of thought?"
3. querier          → Ask comparison questions: "How does X differ from Y?"
4. querier          → Ask contradiction questions: "Where do sources disagree?"
5. linter           → Verify all new content is properly linked and consistent
```

## Wiki Page Templates

### Summary Page Template (wiki/summaries/)

```markdown
# {Source Title}

**Source**: [[raw/{path}]]
**Ingested**: {date}
**Type**: {article | paper | book | podcast | notes}

## Key Points
- {point 1}
- {point 2}
- {point 3}

## Concepts Referenced
- [[concepts/{concept1}]]
- [[concepts/{concept2}]]

## Entities Mentioned
- [[entities/{entity1}]]

## Contradictions with Existing Knowledge
- {any conflicts with existing wiki pages, or "None detected"}

## Notes
{additional context, quality assessment, relevance notes}
```

### Concept Page Template (wiki/concepts/)

```markdown
# {Concept Name}

## Definition
{clear, concise definition synthesized from all sources}

## Key Sources
- [[summaries/{source1}]] — {what this source says about the concept}
- [[summaries/{source2}]] — {what this source adds}

## Related Concepts
- [[concepts/{related1}]] — {relationship description}
- [[concepts/{related2}]] — {relationship description}

## Open Questions
- {unanswered questions about this concept}

## Evolution
| Date | Update | Source |
|------|--------|--------|
| {date} | Created from {source} | [[summaries/{source}]] |
| {date} | Updated with {new info} | [[summaries/{source}]] |
```

### Entity Page Template (wiki/entities/)

```markdown
# {Entity Name}

**Type**: {person | organization | product | technology}

## Overview
{synthesized description from all sources}

## Appearances
- [[summaries/{source1}]] — {role/context in this source}
- [[summaries/{source2}]] — {role/context in this source}

## Relationships
- {entity} → {relationship} → [[entities/{other}]]

## Key Claims
| Claim | Source | Confidence |
|-------|--------|-----------|
| {claim} | [[summaries/{source}]] | {high/medium/low} |
```

### Index Template (wiki/index.md)

```markdown
# Knowledge Base Index

**Last updated**: {date}
**Total sources**: {count}
**Total wiki pages**: {count}

## By Topic
- [{topic}](concepts/{topic}.md) ({N} sources)

## By Type
### Articles ({N})
- [{title}](summaries/{file}.md)

### Papers ({N})
- [{title}](summaries/{file}.md)

## Recent Ingestions
| Date | Source | Pages Updated |
|------|--------|---------------|
| {date} | {source} | {list of updated pages} |
```

## Agent Output Contract

All agents follow these rules:

| Allowed | Not Allowed |
|---------|-------------|
| Read raw sources (never modify them) | Modify anything in `raw/` |
| Create/update files in `wiki/` and `outputs/` | Delete raw sources |
| Update `index.md` and `log.md` after operations | Create wiki pages without cross-references |
| Flag contradictions between sources | Silently override existing content without noting the contradiction |
| File query outputs back into wiki | Leave insights only in chat (must offer to persist) |

Every operation must:
1. **Log the action** in `log.md` with timestamp and description
2. **Update `index.md`** if any pages were created or significantly changed
3. **Check for contradictions** with existing wiki content
4. **Maintain cross-references** — every new page must link to related existing pages, and those pages must link back

## Error Handling

| Issue | Solution |
|-------|----------|
| Raw source is unreadable (binary, encrypted) | Log as "skipped" in log.md with reason; ask user for alternative format |
| Source contradicts existing wiki content | Create contradiction note in both pages; do NOT silently overwrite |
| Wiki is too large for single LLM context | Process section by section; use index.md as navigation guide |
| Schema doesn't cover a new source type | Propose schema update to user; add new template to CLAUDE.md |
| Lint finds orphan pages (no inbound links) | List in health report; suggest which pages should reference them |
| User asks question wiki can't answer | Say so clearly; suggest which raw sources might need to be added |
| Multiple sources claim different things | Create a comparison page showing all positions with source attribution |

## Execution Checklist

Before any operation, verify:

- [ ] Check if wiki exists at `~/.learnwy/llm-wiki/` (or project-scoped path)
- [ ] If wiki exists + user asks a complex question → run auto-query before answering
- [ ] The three-layer directory structure exists (raw/, wiki/, CLAUDE.md)
- [ ] CLAUDE.md schema file is present and current
- [ ] Raw sources are in the correct subdirectory of raw/
- [ ] Agent selection follows the Routing Decision Table

After any operation, verify:

- [ ] log.md was updated with the operation details
- [ ] index.md reflects any new or changed pages
- [ ] All new pages have cross-references to related existing pages
- [ ] No contradictions were silently swallowed
- [ ] No raw source was modified

## Boundary Enforcement

This skill ONLY handles:

- Setting up knowledge base directory structure and schema
- Ingesting raw sources into structured wiki pages
- Answering questions from accumulated wiki knowledge
- Health checking wiki for contradictions, orphans, and gaps
- Maintaining cross-references and indexes

This skill does NOT handle:

- Saving single conversation insights → `knowledge-consolidation`
- Structural contradiction analysis → `on-contradiction`
- Practice-based validation → `on-practice`
- Long-term phased strategy → `on-protracted-war`
- Code implementation → `requirement-workflow`
- Database setup, vector stores, or API servers → out of scope (v2.0 roadmap)

## Relationship with Knowledge Consolidation

| Dimension | llm-wiki | knowledge-consolidation |
|-----------|----------|------------------------|
| **Scope** | Full knowledge base system | Single conversation insight |
| **Input** | Raw documents, articles, papers | AI conversation context |
| **Output** | Interlinked wiki with summaries, concepts, entities | One knowledge document |
| **Lifecycle** | Ongoing, compounding over months/years | One-shot per conversation |
| **Combine** | Use knowledge-consolidation outputs as raw sources for llm-wiki |

## Expansion Roadmap (v2.0 — 8-Layer Architecture)

> **Guiding principle**: Practice-test the 3-layer core first. The 8-layer upgrade adds infrastructure complexity that should only be adopted when the 3-layer version hits clear scaling limits.

| Layer | Name | Purpose | Status |
|-------|------|---------|--------|
| 1 | Raw Layer | Store unstructured original materials | ✅ v1.0 (raw/) |
| 2 | Storage Layer | Database (PostgreSQL) + vector DB (Chroma/Pinecone) + file storage | 🔮 v2.0 |
| 3 | Index Layer | Full-text index + vector index for fast retrieval | 🔮 v2.0 |
| 4 | LLM Processing Layer | AI Agent summarizes, cleans, structures raw knowledge | ✅ v1.0 (ingestor agent) |
| 5 | Knowledge Graph Layer | Entity-relation graph, link knowledge nodes | 🔮 v2.0 |
| 6 | Cache Layer | Cache high-frequency knowledge for fast queries | 🔮 v2.0 |
| 7 | Catalog Layer | Generate unified catalog and navigation | ✅ v1.0 (index.md + schema) |
| 8 | Visual & API Layer | Frontend visualization + open API | 🔮 v2.0 |

**v2.0 agents planned:**

| Agent | Core Function |
|-------|--------------|
| graph-builder | Build and maintain entity-relation knowledge graph |
| vector-indexer | Generate and maintain vector embeddings for semantic search |
| api-server | Expose wiki content via REST/GraphQL API |
| conflict-resolver | Advanced multi-source contradiction resolution |
| freshness-monitor | Track source age and trigger re-ingestion for stale content |

## References

- **LLM Wiki** — Andrej Karpathy (GitHub Gist, April 2026)
- **Obsidian** — Local-first markdown knowledge management (obsidian.md)
- **qmd** — Fast full-text search for markdown vaults
- **Vannevar Bush, "As We May Think"** (1945) — The original Memex concept
