# Writer Discipline (shared across writer skills)

This file is the single source of truth for the discipline shared by:

- `project-skill-writer` — creates `.agents/skills/*/SKILL.md`
- `project-agent-writer` — creates `.agents/agents/*.md`
- `project-skill-installer` — installs an existing skill into `.agents/skills/`
- `project-rules-writer` — creates `.agents/rules/*.md` (Trae-format rules at a tool-neutral location)

Each writer skill has its **own** workflow (different artefact, different validation), but they share the same operating principles. This file is referenced from each writer's SKILL.md so the rules don't drift across copies.

## Five universal principles

1. **Understand the problem first**
   Don't ask "what do you want?" — infer from the user's prompt + project context. If the prompt is genuinely ambiguous, surface options via `AskUserQuestion`; never fish.

2. **Analyse the project before designing**
   Read existing files (package.json, Cargo.toml, go.mod, lock files, top-level dirs) and existing artefacts of the same type (existing skills / agents / rules) to align with the project's conventions, not generic best practice.

3. **Confirm before generating**
   Use `AskUserQuestion` to present the design (name, scope, output path, key choices) **before** writing any file. The user must explicitly approve. Always offer "create / adjust / skip".

4. **Generate to project-relative paths only — and to `<project>/.agents/`**
   Never write to `~/.trae/`, `~/.claude/`, `~/.cursor/` from a project writer — those are global IDE dirs. Equally, do **not** write into the project's own `.trae/`, `.claude/`, or `.cursor/` — those are owned by the IDE. Project-level writer outputs belong under `<project>/.agents/{skills,agents,rules}/`, which is tool-neutral and survives IDE switches. The shared `isInsideHomeIdeDir()` helper in `src/shared/ide-markers.ts` still blocks home-IDE escapes.

5. **Validate after generating**
   Run a short post-write checklist before reporting success: required frontmatter fields present, no absolute paths in content, no conflict with existing same-type artefacts, content in English (or the project language convention).

## Anti-patterns to avoid

| Anti-pattern | Why it hurts |
|---|---|
| Writing the file before user confirmation | Removes the user's chance to redirect; makes the writer feel pushy |
| Generic skill / agent / rule that "works for any project" | Fails the "specific problem" test; clutter |
| Frontmatter fields filled with `TODO` / `(unspecified)` | Looks unfinished; breaks downstream tooling that reads the field |
| Absolute paths inside the artefact | Makes the artefact non-portable; breaks for the next collaborator |
| Conflict with existing rules / skills / agents (same name, opposite advice) | Causes silent ambiguity at runtime — AI follows the wrong one |
| Skipping the analysis step ("I'll just write something close") | Misses local conventions; the artefact gets rewritten in the next pass |

## When the user confirms but the design is still off

If the user says "create" but you've spotted a problem (frontmatter conflict, scope too wide, etc.) during L5 validation — *stop*, surface the problem, and ask whether to fix-and-retry or override. Don't ship something you know is broken just because the user clicked "create".

## Shared validation gates

All writer outputs must pass:

- [ ] Output path is project-relative (use `isInsideHomeIdeDir()` to confirm)
- [ ] No `<placeholder>` syntax left in content (replace or delete)
- [ ] No `TODO` / `FIXME` markers
- [ ] Required frontmatter fields present per the artefact type
- [ ] Same-type collision check ran (existing files with same name surfaced to user)

## Delegation map

If the user request doesn't match the writer you're in, delegate:

| User wants | Use |
|---|---|
| A skill | `project-skill-writer` |
| An agent / subagent | `project-agent-writer` |
| To install an existing published skill | `project-skill-installer` |
| A rule (`.agents/rules/*.md`) | `project-rules-writer` |
| Personal-knowledge writer (project-local) | `knowledge-consolidation` |
| Global wiki author / curator | `llm-wiki` |
