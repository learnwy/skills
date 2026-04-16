# Intelligent Rule Manager Design

## Summary

The workspace is a three-product system:

- `client/` renders the desktop experience
- `cli/` owns shared domain logic and automation entrypoints
- `extension/` bridges the workspace into VS Code-compatible IDEs

The Rust core remains the behavioral center. The UI and IDE layers should stay thin and consume that shared contract.
Localization should follow the same philosophy: one shared source, thin per-target adapters, and generated artifacts where packaging requires them.

## Workspace Layout

```text
apps/intelligent-rule-manager/
├── docs/
│   ├── spec.md
│   ├── design.md
│   └── tasks.md
├── client/
│   ├── src/
│   └── src-tauri/
├── cli/
│   ├── Cargo.toml
│   └── crates/
│       ├── rule-core/
│       └── rule-cli/
├── extension/
│   ├── src/
│   └── package.json
└── README.md
```

## Architectural Decisions

### 1. Shared Home-Directory Rule Store

Decision:
Use `~/.learnwy/ai/rules` as the default shared rule root.

Why:

- The same rules need to be available in the desktop app, CLI, and IDE extension.
- A user-owned home-directory path is a better fit than a repo-local folder for reusable personal rules.
- Nested folders make taxonomy and curation easier than a flat file list.

### 2. Canonical Tags In Files, Resolved Tags In Views

Decision:
Keep only canonical tags in rule files and resolve ancestor tags at read time.

Why:

- Files stay small and intentional.
- Filtering can still support parent categories such as `web`, `quality`, and `tooling`.
- The UI can expose broader discovery without rewriting parent tags into every document.

### 3. Recursive Rule Discovery

Decision:
Traverse the shared rules directory recursively.

Why:

- Initial rules are easier to maintain when grouped into folders such as `web/typescript/` and `quality/git-hooks/`.
- The storage layout can grow without changing the discovery contract.

### 4. Thin Clients

Decision:
Keep both the Tauri shell and the IDE extension thin and route behavior through `rule-core` and `rule-cli`.

Why:

- Shared storage behavior should not drift between surfaces.
- The extension can remain simple by shelling out to the CLI.
- The client can focus on UX while Rust owns parsing, storage, and rule semantics.

### 5. Generated I18n With One Canonical Source

Decision:
Keep canonical locale content in shared JSON files and generate target-specific outputs for the client, CLI, and extension.

Why:

- Copying strings into each runtime creates drift very quickly.
- The client wants typed TS access, the CLI wants generated Rust message tables, and the extension needs both runtime strings and `package.nls*.json`.
- Key and placeholder validation should happen once at generation time instead of being discovered through UI regressions.

Implementation direction:

- `i18n/en.json` and `i18n/zh-CN.json` are the only hand-edited locale sources.
- `scripts/generate-i18n.mjs` validates shape and placeholder parity across locales.
- Generated outputs are committed where downstream tools need direct file inputs.

## Rule-Core Responsibilities

- resolve the shared storage root
- find nested Markdown rule files
- parse and serialize rule frontmatter and body
- expose canonical tags plus resolved ancestor tags
- compute stats and recommendations
- provide safe create/load/save operations

## Tag Taxonomy Direction

The first taxonomy layer should stay small and practical:

- `web`
- `frontend`
- `typescript`
- `javascript`
- `tooling`
- `build-tools`
- `module-structure`
- `exports`
- `path-alias`
- `quality`
- `lint`
- `format`
- `git-hooks`

Representative ancestry:

- `typescript` -> `web`, `javascript`, `tooling`
- `eslint` -> `lint`, `typescript`, `javascript`, `web`
- `prettier` -> `format`, `typescript`, `javascript`, `web`
- `lint-staged` -> `git-hooks`, `lint`, `format`, `tooling`
- `path-alias` -> `typescript`, `build-tools`, `module-resolution`

## Initial Rule Set

Recommended starter rule folders:

- `web/typescript/no-default-export.md`
- `web/typescript/project-structure.md`
- `web/typescript/barrel-exports.md`
- `web/typescript/tsconfig-path-aliases.md`
- `quality/lint/eslint-prettier-baseline.md`
- `quality/git-hooks/husky-lint-staged.md`

## Testing Strategy

Unit tests should cover:

- default shared storage root resolution
- recursive rule discovery
- frontmatter parsing
- ancestor-tag expansion

Integration-style verification should cover:

- CLI list/stats commands against the shared root
- client build after the type changes
- extension compile after the docs-path update

## Near-Term Follow-Up

1. Add compose and export behavior to `rule-core`.
2. Expose compose/export in the client and extension.
3. Add richer tag browsing and taxonomy visibility in the client UI.
