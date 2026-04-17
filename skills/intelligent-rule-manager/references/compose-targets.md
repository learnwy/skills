# Compose Targets

The rule manager supports two export targets from the shared library.

## `agents-md`

Use this target when the user wants one consolidated instruction file for a repository.

Output shape:

- One `AGENTS.md` file
- Concise sections assembled from the selected rules
- Best for repository-root guidance and onboarding instructions

Choose this when:

- The user wants one project-wide guidance document
- The consumer expects one markdown file
- The user wants a portable baseline for multiple coding agents

## `trae-rule`

Use this target when the user wants split rule files for Trae.

Output shape:

- Multiple markdown files under `.trae/rules/`
- Each file stays focused on one rule or one narrow concern
- Metadata is shaped for Trae-style rule usage

Choose this when:

- The user wants IDE-native project rules
- The user prefers several focused files over one bundle
- The user wants to keep rule boundaries explicit after export

## Selection strategy

- Use tags for category-driven composition.
- Use rule ids for exact curation.
- Use both when the user wants a broad baseline with a few guaranteed inclusions.

## Review checklist

Before finalizing an export:

1. Confirm the selected rules are the intended ones.
2. Check whether ancestor-tag matching pulled in more rules than expected.
3. Confirm the target matches the downstream tool:
   - `agents-md` for one bundled file
   - `trae-rule` for split Trae rule files
