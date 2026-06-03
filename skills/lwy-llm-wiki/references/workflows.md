# Composite workflows and reference

Detailed workflows, error handling, and roadmap for the llm-wiki skill.

## Composite workflows

### New wiki initialization (cold start)

```
1. schema-writer    → create the directory structure + CLAUDE.md schema
2. ingestor         → bulk-ingest all raw sources in raw/
3. linter           → initial health check — verify cross-references and coverage
```

### Daily knowledge work

```
1. ingestor         → process new sources dropped into raw/ (incl. raw/lark/ Feishu sources, see references/ingest-lark.md)
2. querier          → answer questions, explore topics, generate insights
3. querier          → write interesting outputs back into wiki/ (write-back loop)
```

### Weekly maintenance

```
1. linter           → full health check: contradictions, orphan pages, stale content
2. ingestor         → re-process sources the linter flagged as poorly integrated
3. schema-writer    → update CLAUDE.md if new conventions are needed
```

### Deep-research sprint

```
1. ingestor         → bulk-ingest 10-20 sources on a topic
2. querier          → ask synthesis questions: "What are the main schools of thought?"
3. querier          → ask comparison questions: "How do X and Y differ?"
4. querier          → ask contradiction questions: "Where do the sources disagree?"
5. linter           → verify all new content is correctly linked and consistent
```

## Error handling

| Problem | Solution |
|------|----------|
| Raw source unreadable (binary, encrypted) | Mark it "skipped" in log.md with the reason; ask the user for an alternative format |
| Source contradicts existing wiki content | Create a contradiction note on both pages; never silently overwrite |
| Wiki too large for a single LLM context | Process section by section; use index.md as a navigation guide |
| Schema doesn't cover a new source type | Propose a schema update to the user; add a new template to CLAUDE.md |
| Lint finds an orphan page (no inbound links) | List it in the health report; suggest which pages should reference it |
| User asks something the wiki can't answer | State it clearly; suggest which raw sources need to be added |
| Multiple sources claim different things about the same thing | Create a comparison concept page under wiki/concepts/ presenting all positions with source attribution |
| Wiki index too large for the context window | Use `wiki/topics.txt` for topic scanning; read pages on demand instead of bulk-loading index.md |
| Android content may be unverified | Require Android pages to have a `**Verified**: yes/no` field; lint flags pages unverified for more than 7 days |
| Cross-reference count explosion (425+ pages) | Cap each section's cross-references at the 5 most relevant; use `## See also` for secondary links |
| Wrong language/framework on a code snippet | Tag with `platform:` and `language:`; lint verifies the tags match the content |

## Core concepts

| Concept | Definition |
|------|------|
| **Knowledge compilation** | Processing raw sources into structured, interlinked wiki pages — done once at ingest, not re-derived on every query |
| **Knowledge compounding** | Each new source enriches existing pages; each question deepens the wiki. Knowledge keeps accumulating and never resets |
| **Separation of concerns** | Raw sources (immutable source of truth) vs. wiki (the LLM's compiled output) vs. schema (the rules). Never conflate them |
| **Cross-reference maintenance** | The LLM automatically maintains bidirectional links between all related pages |
| **Contradiction detection** | When new information conflicts with existing wiki content, the LLM explicitly flags it |
| **Write-back loop** | Query outputs and insights are written back into the wiki, creating a feedback loop |
| **Lint check** | Periodic health checks to find orphan pages, broken links, stale content, and missing cross-references |
| **Schema evolution** | The CLAUDE.md rules file evolves as you discover what works for your domain |
| **Source of truth** | Raw sources are always authoritative. The wiki is a compiled representation, never the original |
| **LLM as maintainer** | The LLM does all the bookkeeping humans hate — updating the index, fixing links, keeping summaries current |

## Relationship to Knowledge Consolidation

| Dimension | llm-wiki | knowledge-consolidation |
|------|----------|------------------------|
| **Scope** | Complete knowledge-base system | Single-conversation insight |
| **Input** | Raw documents, articles, papers | AI conversation context |
| **Output** | Interlinked wiki: source pages, concepts, entities (people/organizations/events, etc.) | One knowledge document |
| **Lifecycle** | Continuous, compounding across months/years | One-off per conversation |
| **Combination** | Use knowledge-consolidation's output as a raw source for llm-wiki |

## Extension roadmap (v2.0 — 8-layer architecture)

> **Guiding principle**: Practice-test the 3-layer core first. The 8-layer upgrade adds infrastructure complexity and should only be adopted when the 3-layer version hits a clear scaling bottleneck.

| Layer | Name | Purpose | Status |
|----|------|------|------|
| 1 | Raw layer | Store unstructured raw material | ✅ v1.0 (raw/) |
| 2 | Storage layer | Database (PostgreSQL) + vector store (Chroma/Pinecone) + file storage | 🔮 v2.0 |
| 3 | Index layer | Full-text index + vector index for fast retrieval | 🔮 v2.0 |
| 4 | LLM processing layer | AI agents summarize, clean, and structure raw knowledge | ✅ v1.0 (ingestor agent) |
| 5 | Knowledge-graph layer | Entity-relationship graph linking knowledge nodes | 🔮 v2.0 |
| 6 | Cache layer | Cache high-frequency knowledge for fast queries | 🔮 v2.0 |
| 7 | Catalog layer | Generate a unified catalog and navigation | ✅ v1.0 (index.md + schema) |
| 8 | Visualization & API layer | Frontend visualization + open API | 🔮 v2.0 |

**Agents planned for v2.0:**

| Agent | Core function |
|-------|----------|
| graph-builder | Build and maintain the entity-relationship knowledge graph |
| vector-indexer | Generate and maintain vector embeddings for semantic search |
| api-server | Expose wiki content through a REST/GraphQL API |
| conflict-resolver | Advanced multi-source contradiction resolution |
| freshness-monitor | Track source freshness and trigger re-ingest of stale content |

## References

- **LLM Wiki** — Andrej Karpathy (GitHub Gist, April 2026)
- **Obsidian** — local-first markdown knowledge management (obsidian.md)
- **qmd** — fast full-text search for a markdown vault
- **Vannevar Bush, "As We May Think"** (1945) — the original Memex concept
