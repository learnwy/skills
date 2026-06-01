---
name: lwy-knowledge-consolidation
description: "Use when the user wants to persist a single insight from the current chat as a structured, project-local doc — debugging breakthroughs, hard-won config, workflow steps, or post-mortem lessons. Triggers: 'save this', 'document this', 'we figured it out', '记录下来', '总结一下'. Writes to <project>/.{trae,claude,cursor,windsurf}/knowledges/. For global compounding knowledge (architecture, patterns, APIs), use llm-wiki instead."
metadata:
  author: "learnwy"
  version: "3.0"
---

# Knowledge Consolidation

Project-local fix journal. One conversation → one structured Markdown file in this repo's IDE folder. Stays with the codebase; ships in the repo; future sessions on this project can find it.

> **Boundary:** project-local debugging/config/workflow/lesson notes belong here.
> Global, reusable knowledge (architectures, design patterns, API integrations, references) belongs in [llm-wiki](../llm-wiki/SKILL.md). KC's `promote` command moves a doc across the seam when it earns its way into the wiki.

## When to use

| Trigger | Action |
|---|---|
| User says "save this", "记录下来", "we solved it" | Run `cli.cjs save …` |
| Stop nudge fired ("looks like you resolved a non-trivial problem") | Offer to save |
| Solved a bug specific to this codebase | `--type debug` |
| Locked in a non-obvious config / build setting | `--type config` |
| Established an ops procedure (deploy / rollback) | `--type workflow` |
| Post-mortem / retrospective takeaway | `--type lesson` |

**Do not use** for: cross-project knowledge (→ `llm-wiki`), reusable skills (→ `project-skill-writer`), AI rules (→ `project-rules-writer`), updating a previously saved doc (KC is write-once).

## Prerequisites

- Node.js ≥ 18
- Project root contains an IDE marker dir: `.trae/`, `.claude/`, `.cursor/`, or `.windsurf/`

## The one command you usually want

```bash
node scripts/cli.cjs save \
  -r <project_root> \
  -a <ai_type> \
  -t <type> \
  -n <kebab-slug> \
  --title "Short, specific title" \
  --summary "2-3 sentences readers can stop at" \
  --details "Body in Markdown." \
  --takeaways "First actionable insight\nSecond insight" \
  [--background "<one-line problem context>"] \
  [--context "<project / version / component>"] \
  [--related "<links / files>"]
```

Returns the absolute path of the new file. Atomically resolves a date-sequenced name, creates the directory, fills the template, validates required fields.

| `-a, --ai-type` | `trae`, `trae-cn`, `claude-code` (or `claude`), `cursor`, `windsurf` |
|---|---|
| `-t, --type` | `debug`, `config`, `workflow`, `lesson` only — see [knowledge-types.md](references/knowledge-types.md) |
| `-n, --name` | kebab-case slug, ≤50 chars, specific (`react-18-hydration-mismatch`, not `bug-fix`) |

Output filename: `{YYYYMMDD}_{NNN}_{type}_{slug}.md` under `<root>/<ide>/knowledges/`.

## Promote to global wiki

When a doc turns out to be reusable across projects, push it into `llm-wiki`'s ingestion queue:

```bash
node scripts/cli.cjs promote -p <project>/.trae/knowledges/20260511_001_debug_x.md
```

Copies into `~/.learnwy/llm-wiki/raw/notes/<date>-<slug>.md` with a frontmatter pointer back to the original. No-op if the wiki isn't initialised. Run llm-wiki's ingestion next.

## Other commands

```bash
node scripts/cli.cjs path -r <root> -a <ai> -t <type> -n <name>
# → just prints the resolved path; useful for scripts that want to write the file themselves.
```

## Stop hook (auto-nudge)

A `Stop` hook scans the assistant's last response for **resolution signals** ("the bug was…", "fixed it", "## Solution"). If it fires AND the response shows substantive markers (race condition, regression, design decision, "subtle", etc.) AND no session-local trivia markers (typo, missing semicolon, wrong env var), it injects a one-time per-session nudge: *"consider running knowledge-consolidation save"*.

The hook never auto-writes. It nudges; the AI asks the user.

The hook is wired through `learnwy-dispatch` (single Node process, no per-skill spawn).

## Writing-quality rules

1. **Title** answers "what can I learn from this?" — not "Debug session" but "Memory leak in WebSocket reconnect handler".
2. **Summary** is self-contained — readers decide whether to keep going.
3. **Details** code blocks have language tags; long content uses sub-headers.
4. **Takeaways** are imperative — "Always check X before Y", not "X is important".
5. **Related** links to source files, PRs, or `[[wiki-page]]` references where applicable.

## Boundaries

This skill **only**:
- Detects the IDE marker and resolves a unique knowledge-doc path
- Atomically writes a structured doc from CLI args
- Promotes a doc into the global llm-wiki ingestion queue
- Surfaces a Stop nudge once per session when a non-trivial problem is resolved

This skill **does not**:
- Update existing docs (write-once on purpose)
- Index / lint / curate (that's llm-wiki)
- Save AI memory across sessions
- Search past knowledge docs
