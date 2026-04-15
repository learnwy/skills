# Intelligent Rule Manager Design

## Summary

The app will be a cross-platform desktop application built with Tauri 2, a React/TypeScript frontend, and a shared Rust domain layer. The architecture is intentionally split so the GUI and CLI both depend on the same `rule-core` crate.

## Workspace Layout

```text
apps/intelligent-rule-manager/
├── docs/
│   ├── spec.md
│   ├── design.md
│   └── tasks.md
├── src/                     # React UI
├── src-tauri/               # Tauri host app
├── crates/
│   ├── rule-core/           # Shared rule domain logic
│   └── rule-cli/            # clap-based CLI
├── Cargo.toml               # Cargo workspace root
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Architectural Decisions

### 1. Shared Rust Domain First

Decision:
Put rule parsing, validation, storage resolution, filtering, scoring, composing, and export logic into `crates/rule-core`.

Why:

- Prevents UI and CLI behavior drift
- Keeps business logic out of the Tauri shell
- Makes parity with the current Node CLI easier to achieve in phases

### 2. Thin Tauri Host

Decision:
Keep `src-tauri` thin and use it primarily for window lifecycle, command exposure, and platform integration.

Why:

- Reduces duplication
- Keeps platform shell concerns separate from rule logic
- Makes command boundaries explicit

### 3. React UI For Fast Desktop Product Iteration

Decision:
Use React + TypeScript + Vite for the initial frontend.

Why:

- Faster iteration on list/detail/editor flows
- Easier to build dense information layouts than a pure native toolkit for v1
- Good fit for preview-heavy composition screens

## Planned Crates

### `rule-core`

Responsibilities:

- resolve storage root
- represent rule metadata and rule documents
- parse and serialize Markdown rule files
- compute stats
- filter and score rules
- decide assembly mode
- compose artifacts
- recommend visualization level

Likely modules:

- `model`
- `storage`
- `parser`
- `compose`
- `stats`
- `error`

### `rule-cli`

Responsibilities:

- expose a stable `clap` interface
- call `rule-core`
- print JSON or Markdown results

Planned commands:

- `init`
- `create`
- `list`
- `inspect`
- `stats`
- `decide`
- `compose`
- `recommend-visualization`

## Tauri Command Surface

Initial commands:

- `healthcheck`
- `workspace_summary`

Planned follow-up commands:

- `list_rules`
- `load_rule`
- `save_rule`
- `delete_rule`
- `compute_stats`
- `decide_assembly`
- `compose_artifact`
- `recommend_visualization`

## Frontend Structure

Initial layout:

- Sidebar for library navigation, groups, tags, and targets
- Main column for rule list or compose workspace
- Inspector column for rule details, metadata, and preview

Initial frontend modules:

- `App.tsx`
- `lib/tauri.ts` for command wrappers
- `components/` for app chrome and panels
- `styles/` for app-specific CSS

## Data Flow

```text
React UI
  -> Tauri command invoke
  -> src-tauri command handler
  -> rule-core service or query
  -> file system or computed output
  -> serialized response
  -> React state update
```

## Storage Model

Rule storage root:

- `AGENTS_HOME/rules` when `AGENTS_HOME` exists
- otherwise `~/.agents/rules`

Export location:

- `<rules-root>/exports`

Source of truth:

- Markdown rule files with YAML frontmatter

## Serialization Strategy

Near-term approach:

- prioritize correctness and stable structure
- accept normalized output during early development if needed

Preferred long-term approach:

- preserve body formatting
- minimize frontmatter churn
- only rewrite fields the user actually changed

## UI Delivery Phases

### Phase 1

- app shell
- workspace summary
- static three-pane layout

### Phase 2

- rule listing
- filter controls
- basic rule detail view

### Phase 3

- rule editing
- markdown preview
- save flow

### Phase 4

- compose studio
- export actions
- insights dashboard

## Trade-Offs

### Tauri vs Electron

Chose Tauri because the app needs a shared Rust engine and Rust CLI. Electron would speed up pure-web scaffolding but would make the Rust domain story less central.

### Tauri vs SwiftUI

Chose Tauri because the app should remain cross-platform. SwiftUI would provide a stronger native macOS path, but that is not the product direction.

### File Model vs Database

Chose file-first because the current skill already defines Markdown files as the source of truth and there is no evidence yet that a database is needed.

## Immediate Next Steps

1. Flesh out `rule-core` data model and storage module.
2. Port the current Node CLI behavior into Rust incrementally.
3. Replace the static frontend summary with invoked Tauri data.
4. Build the rule library browsing flow.

