# Composition Workflows & Reference

Detailed workflows, error handling, and roadmap for the llm-wiki skill.

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
| Wiki index too large for context window | Use `wiki/topics.txt` for topic scanning; read pages on demand, not index.md wholesale |
| Android content may be unverified | Require `**Verified**: yes/no` field on Android pages; lint flags unverified pages older than 7 days |
| Cross-reference count explosion (425+ pages) | Limit cross-refs per section to top-5 most relevant; use `## See Also` for secondary links |
| Snippet in wrong language/framework | Tag with `platform:` and `language:`; lint validates tags match content |

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
