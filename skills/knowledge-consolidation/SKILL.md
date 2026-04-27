---
name: knowledge-consolidation
description: "Use this skill when the user wants to save, summarize, or persist knowledge from the current AI conversation into structured documents. Captures debugging breakthroughs, architecture decisions, patterns, and lessons learned. Triggers on: '总结一下', '记录下来', 'save this knowledge', 'document this', 'we figured it out', 'that was hard to solve', 'remember this', 'write this down', or when a hard-won insight should be preserved for future sessions. Saves to .trae/knowledges/, .claude/knowledges/, or .cursor/knowledges/ based on AI IDE."
metadata:
  author: "learnwy"
  version: "2.0"
---

# Knowledge Consolidation

Persist valuable knowledge from AI conversations into structured, reusable documents. Captures debugging breakthroughs, architecture decisions, patterns, and lessons learned — so neither you nor the AI have to rediscover them.

> **Core Principle**: Knowledge that stays in a chat thread is lost knowledge. This skill extracts it, classifies it, and writes it to a discoverable location in the project.

## When to Use

**Invoke when:**

- User says "save this knowledge", "document this", "记录下来", "总结一下"
- User says "we figured it out", "that was hard to solve", "let's not forget this"
- A debugging session reaches resolution — root cause is known and fix is applied
- An architecture decision is made with clear trade-offs discussed
- A reusable pattern or workaround is discovered during development
- A non-obvious configuration was required to make something work
- User asks to summarize, consolidate, or preserve learnings from the conversation

**Do NOT invoke when:**

- User wants to save AI memory/identity across sessions → delegate to `ai-brain`
- User wants to create a reusable skill → delegate to `project-skill-writer`
- User wants to create a rule → delegate to `trae-rules-writer`
- The knowledge is trivial or already well-documented in official docs
- The conversation contains no actionable insight worth preserving

## Prerequisites

- Node.js >= 18
- Target project with a supported AI IDE marker (`.trae/`, `.claude/`, `.cursor/`, `.windsurf/`)

## Workflow

```
[L1: Detect AI IDE]
         ↓
[L2: Identify Knowledge Candidates]
         ↓
[L3: Classify Knowledge Type]
         ↓
[L4: Generate Output Path]  ← get-knowledge-path.cjs
         ↓
[L5: Write Document]        ← knowledge.md.template
         ↓
[L6: Verify & Deliver]
```

## L1: Detect AI IDE

Scan the project root for AI IDE markers to determine the correct storage path. Check in priority order:

| Indicator          | AI Type     | Storage Path            |
|--------------------|-------------|-------------------------|
| `.trae/` dir       | trae        | `.trae/knowledges/`     |
| `.claude/` dir     | claude-code | `.claude/knowledges/`   |
| `.cursor/` dir     | cursor      | `.cursor/knowledges/`   |
| `.windsurf/` dir   | windsurf    | `.windsurf/knowledges/` |

**Detection method**: Use `LS` or `Glob` on the project root looking for these marker directories. If multiple markers exist, prefer the one matching the current AI IDE environment. If none are found, halt and inform the user that a supported AI IDE marker directory is required.

## L2: Identify Knowledge Candidates

Review the conversation for knowledge worth preserving. Do NOT ask the user "what should I save?" — infer from the conversation.

### Candidate Signals

| Signal | Indicates | Priority |
|--------|-----------|----------|
| Root cause identified after investigation | Debug knowledge | High |
| Trade-off discussion with a decision made | Architecture knowledge | High |
| "This is how you should always do X" | Pattern knowledge | High |
| Non-obvious config that took effort to find | Config knowledge | Medium |
| API integration with gotchas discovered | API knowledge | Medium |
| Multi-step process that was established | Workflow knowledge | Medium |
| "I wish I'd known this earlier" | Lesson knowledge | Medium |

### Extraction Rules

1. Extract the **core insight**, not the entire conversation
2. Include the **context** that makes the insight actionable (what project, what version, what constraints)
3. Preserve **code snippets** only when they demonstrate the key point
4. Capture **why**, not just **what** — future readers need the reasoning

If the user explicitly requests consolidation, capture everything they mention. If auto-detecting, focus on the highest-value candidate first and ask whether additional items should also be saved.

## L3: Classify Knowledge Type

Select the appropriate type from the reference guide. Each type has specific structural expectations:

| Type           | When to Use                                  | Key Elements                                      |
|----------------|----------------------------------------------|---------------------------------------------------|
| `debug`        | Bug fixes, crash analysis, error resolution  | Symptoms, investigation steps, root cause, fix     |
| `architecture` | System design, module structure decisions     | Context, decisions, trade-offs, future concerns    |
| `pattern`      | Reusable code patterns, best practices        | Problem context, pattern description, code example |
| `config`       | Build settings, environment setup             | Configuration context, settings, rationale         |
| `api`          | API design, integration details               | Purpose, endpoints, usage examples, error handling |
| `workflow`     | Development processes, procedures             | Steps, tools used, best practices                  |
| `lesson`       | Post-mortems, retrospectives                  | What happened, what was learned, recommendations   |
| `reference`    | Technical references, specifications          | Scope, specifications, examples                    |

See [knowledge-types.md](references/knowledge-types.md) for detailed descriptions and key elements per type.

**Type selection rule**: If the knowledge spans multiple types (e.g., a debug session that also revealed an architecture pattern), pick the **primary** type and mention the secondary insight in the Key Takeaways section.

## L4: Generate Output Path

Run the path generator to get a unique, date-sequenced filename:

```bash
node {skill_root}/scripts/get-knowledge-path.cjs \
  -r <project_root> \
  -a <ai_type> \
  -t <type> \
  -n <filename>
```

### Arguments

| Flag | Required | Description | Example |
|------|----------|-------------|---------|
| `-r, --root` | Yes | Project root directory | `/Users/me/my-project` |
| `-a, --ai-type` | Yes | AI IDE type | `trae`, `trae-cn`, `claude-code`, `cursor`, `windsurf` |
| `-t, --type` | Yes | Knowledge type | `debug`, `architecture`, `pattern`, etc. |
| `-n, --name` | Yes | Descriptive filename (no extension) | `memory-leak-fix`, `singleton-impl` |

### Output Format

```
{project_root}/{ai_path}/knowledges/{YYYYMMDD}_{daily_seq}_{type}_{filename}.md
```

**Example**: `/project/.trae/knowledges/20260325_001_debug_memory-leak-fix.md`

The script auto-creates the `knowledges/` directory if it doesn't exist and auto-increments the daily sequence number.

### Filename Guidelines

- Use lowercase kebab-case: `memory-leak-fix`, not `MemoryLeakFix`
- Be specific: `react-18-hydration-mismatch`, not `bug-fix`
- Keep it under 50 characters

## L5: Write Document

Use the [knowledge.md.template](assets/knowledge.md.template) to write the document. Fill in all sections:

```markdown
# {Title}

> **Type:** {type}
> **Date:** {YYYY-MM-DD}
> **Context:** {Brief context — project name, component, technology}

## Summary

{2-3 sentence summary of the knowledge. A reader should know whether this document is relevant after reading only this section.}

## Background

{The situation, problem, or context that led to this knowledge. Include enough detail for someone unfamiliar with the conversation to understand.}

## Details

{Technical content: code snippets, configuration, analysis, step-by-step explanation. This is the core of the document.}

## Key Takeaways

{Bullet points of actionable insights. Each takeaway should be independently useful.}

## Related

{Links to related files, docs, issues, or other knowledge documents. Leave empty if none.}
```

### Writing Quality Rules

1. **Title**: Use a descriptive title that answers "what will I learn from this?" — not "Debug Session" but "Memory Leak in WebSocket Reconnection Handler"
2. **Summary**: Must be self-contained — a reader decides whether to read further based on this
3. **Background**: Include the "why" — what triggered this investigation or decision
4. **Details**: Use code blocks with language tags, use headings for subsections if lengthy
5. **Key Takeaways**: Each point is actionable — "Always check X before Y" not "X is important"
6. **Related**: Link to source files, PRs, or other knowledge docs when available

## L6: Verify & Deliver

Before responding to the user, run through the execution checklist.

### Execution Checklist

- [ ] AI IDE detected and storage path is correct
- [ ] Knowledge type matches the content (not a generic fallback)
- [ ] `get-knowledge-path.cjs` ran successfully and returned a valid path
- [ ] Document follows the template structure with all sections filled
- [ ] Title is descriptive and specific (not generic like "Bug Fix")
- [ ] Summary is self-contained (understandable without reading the rest)
- [ ] Code snippets have language tags and are minimal (only what illustrates the point)
- [ ] Key Takeaways are actionable bullet points
- [ ] File was written to the correct project-relative path

### Delivery Report

After writing the document, report to the user:

```
Knowledge saved:
  Type:  {type}
  Title: {title}
  Path:  {project-relative path}
  
Key takeaways:
  - {takeaway 1}
  - {takeaway 2}
```

## Error Handling

| Issue | Solution |
|-------|----------|
| No AI IDE marker directory found | Inform user, ask which IDE they use, create the marker directory |
| Multiple AI IDE markers detected | Prefer the one matching current environment; if ambiguous, ask user |
| `get-knowledge-path.cjs` fails | Check args are correct; verify project root exists and is writable |
| Knowledge type is ambiguous | Pick the primary type, mention secondary aspects in Key Takeaways |
| Conversation has no clear knowledge to extract | Tell user honestly — don't generate filler content |
| Filename collision (same day, same name) | Script auto-increments daily sequence; no manual intervention needed |
| Project root is not writable | Inform user of permission issue; suggest alternative path |
| User requests a type not in the valid list | Map to closest valid type, explain the mapping |

## Boundary Enforcement

This skill ONLY handles:

- Detecting the AI IDE and determining the storage path
- Identifying knowledge worth preserving from conversations
- Classifying knowledge into the defined type system
- Generating unique file paths via `get-knowledge-path.cjs`
- Writing structured knowledge documents using the template
- Verifying document quality before delivery

This skill does NOT handle:

- Building a full knowledge base from raw sources → `llm-wiki`
- Persistent AI memory across sessions → `ai-brain`
- Creating reusable skills → `project-skill-writer`
- Creating project rules → `trae-rules-writer`
- Creating agents → `project-agent-writer`
- Searching or indexing existing knowledge documents (read-only retrieval is out of scope)
- Modifying or updating previously written knowledge documents

## Scripts

| Script | Purpose | Invocation |
|--------|---------|------------|
| [get-knowledge-path.cjs](scripts/get-knowledge-path.cjs) | Generate unique date-sequenced file path | `node get-knowledge-path.cjs -r <root> -a <ai_type> -t <type> -n <name>` |

## Resources

| Resource | Purpose |
|----------|---------|
| [get-knowledge-path.cjs](scripts/get-knowledge-path.cjs) | Path generation script with auto-sequencing and directory creation |
| [knowledge-types.md](references/knowledge-types.md) | Detailed type selection guide with key elements per type |
| [knowledge.md.template](assets/knowledge.md.template) | Document template with all required sections |
