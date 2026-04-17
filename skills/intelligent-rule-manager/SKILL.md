---
name: intelligent-rule-manager
description: Manage a shared Markdown rule library in ~/.learnwy/ai/rules with tagging, hierarchical tag matching, rule editing, rule selection, and composition into AGENTS.md bundles or split Trae rules.
metadata:
  author: "learnwy"
  version: "2.0"
---

# Intelligent Rule Manager

Use this skill when the user wants to create, review, organize, compose, or export reusable AI rules that should be shared across repositories and tools.

## What This Skill Covers

- One shared rule library lives in `~/.learnwy/ai/rules`.
- Rules are plain Markdown files with YAML frontmatter and normal Markdown bodies.
- The same library is used from four peer surfaces:
  - this skill
  - the Rust CLI
  - the desktop client
  - the VS Code-compatible extension
- Users can select rules by explicit rule id, by tags, or by both.
- Composition supports:
  - one consolidated `AGENTS.md` bundle
  - split Trae rule files under `.trae/rules/`

## When To Use

- The user wants to add or strengthen a reusable coding rule.
- The user wants to browse or filter the shared rule library.
- The user wants to compose a project-facing `AGENTS.md` from selected rules.
- The user wants to export selected rules as split Trae rule files.
- The user wants to understand the current storage model, schema, or export targets.

## When Not To Use

- The user needs one project-local rule that should not live in the shared library.
- The user wants a project skill or agent rather than a reusable rule.
- The user needs a one-off answer and there is no reuse value in turning it into a rule.

## Shared Model

1. Treat `~/.learnwy/ai/rules` as the canonical storage root.
2. Treat Markdown rule files as the source of truth.
3. Keep the Markdown body readable on its own so it can be reused in:
   - `AGENTS.md`
   - Trae project rules
   - rule review flows in the desktop client or extension
4. Use tags for filtering and composition.
5. Remember that tags can resolve hierarchically. A broader selection such as `web` may intentionally include a more specific rule tagged `typescript`.

## Default Workflow

1. Inspect the library state.
2. Create or update one rule at a time.
3. Verify tags, groups, and targets.
4. Compose by selected tags and explicit rules.
5. Review the generated `AGENTS.md` or Trae bundle before using it in a project.

## Preferred Operations

### Inspect the workspace

```bash
cargo run -p rule-cli --manifest-path apps/intelligent-rule-manager/cli/Cargo.toml -- workspace-summary
```

```bash
cargo run -p rule-cli --manifest-path apps/intelligent-rule-manager/cli/Cargo.toml -- list
```

```bash
cargo run -p rule-cli --manifest-path apps/intelligent-rule-manager/cli/Cargo.toml -- stats
```

### Inspect one rule

```bash
cargo run -p rule-cli --manifest-path apps/intelligent-rule-manager/cli/Cargo.toml -- inspect --file ~/.learnwy/ai/rules/web/typescript/no-default-export.md
```

### Create a rule

```bash
cargo run -p rule-cli --manifest-path apps/intelligent-rule-manager/cli/Cargo.toml -- create \
  --title "TypeScript Import Hygiene" \
  --summary "Keep imports explicit, stable, and easy to refactor." \
  --groups frontend,shared \
  --tags web,typescript,imports \
  --targets agents-md,trae-rule
```

### Compose an AGENTS bundle

```bash
cargo run -p rule-cli --manifest-path apps/intelligent-rule-manager/cli/Cargo.toml -- compose \
  --target agents-md \
  --tags web,typescript \
  --rule-ids no-default-export,import-path-boundaries
```

### Compose split Trae rules

```bash
cargo run -p rule-cli --manifest-path apps/intelligent-rule-manager/cli/Cargo.toml -- compose \
  --target trae-rule \
  --tags lint,format \
  --rule-ids eslint-prettier-baseline
```

## Composition Guidance

- Prefer tags when the user is describing a category or stack.
- Prefer explicit rule ids when the user is curating a precise bundle.
- Use both when the user wants a broad baseline plus a few hand-picked rules.
- Review the matched rules before finalizing the export, especially when ancestor tags widen the selection.

## Authoring Guidance

- Make each rule strong, explicit, and reviewable.
- Prefer mandatory language when the rule is intended to be enforced.
- Include exceptions when there are valid escape hatches.
- Include examples when the rule is easy to misread.
- Keep one rule focused on one decision or behavior.

## References

- Read [references/rule-schema.md](references/rule-schema.md) for the frontmatter shape.
- Read [references/storage-and-surfaces.md](references/storage-and-surfaces.md) for the shared storage model and surfaces.
- Read [references/compose-targets.md](references/compose-targets.md) for `AGENTS.md` and Trae export behavior.
- Read [references/operating-workflow.md](references/operating-workflow.md) for the recommended day-to-day workflow.
- Use [assets/rule-template.md](assets/rule-template.md) as the starting point for new rules.
