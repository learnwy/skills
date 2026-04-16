# Intelligent Rule Manager Spec

## Background

The Intelligent Rule Manager workspace now contains three sibling products:

- `client/` for the Tauri desktop app
- `cli/` for the shared Rust core and CLI
- `extension/` for VS Code-compatible IDE workflows

All three products should operate on the same Markdown rule library so the rule source of truth is shared instead of copied between tools.

## Goal

Deliver a self-contained workspace under `apps/intelligent-rule-manager/` where the client, CLI, and extension all share:

- one rule storage root
- one Rust domain model
- one tag taxonomy with hierarchical filtering
- one i18n source of truth with generated per-target outputs
- one app-local documentation set in `docs/`

## Scope

### In Scope

- Root-level app docs at `apps/intelligent-rule-manager/docs/`
- Shared rule storage at `~/.learnwy/ai/rules/**/*`
- Recursive discovery of nested Markdown rule files
- Hierarchical tag resolution such that selecting a parent tag can include child-tagged rules
- Shared locale JSON files with generated outputs for the client, CLI, and extension
- Initial reusable rules for TypeScript, module structure, tsconfig aliases, lint, format, and git hooks
- Unit tests for storage resolution and tag behavior

### Out Of Scope For This Slice

- Cloud sync
- Release packaging
- Auto-generated exports or compose flows
- Replacing every remaining manual rule-authoring workflow

## Users

- Developers maintaining reusable coding rules across multiple tools
- Users who want desktop, CLI, and IDE access to the same rule library
- Teams standardizing TypeScript and frontend conventions

## Functional Requirements

### Shared Rule Storage

- The system shall default the shared rule root to `~/.learnwy/ai/rules`.
- The system shall allow nested rule files anywhere below that root.
- The system shall keep Markdown files with YAML frontmatter as the source of truth.

### Tag Taxonomy

- The system shall support hierarchical tag containment.
- When a rule is tagged with a child tag such as `typescript`, the system shall also resolve ancestor tags such as `web` for filtering.
- The system shall keep canonical tags in the file while exposing resolved tags for browsing and filtering.

### Workspace Docs

- The system shall keep `spec.md`, `design.md`, and `tasks.md` in `apps/intelligent-rule-manager/docs/`.
- The extension shall open the root workspace spec rather than a client-local copy.

### Shared I18n

- The system shall keep canonical locale content in shared JSON files under `apps/intelligent-rule-manager/i18n/`.
- The system shall generate client, CLI, and extension localization outputs from that shared source.
- The system shall infer translation keys from the locale data instead of maintaining handwritten key unions or parallel key tables.
- The system shall validate locale shape consistency and placeholder consistency across supported locales.

### Initial Shared Rules

- The system shall include initial rules for named exports, project structure, barrel exports, tsconfig aliases, lint/format setup, and git hooks.
- The initial rules shall be stored under the shared rules root so they are visible to the client, CLI, and extension.

## Acceptance Criteria

- [ ] `apps/intelligent-rule-manager/docs/spec.md`, `design.md`, and `tasks.md` exist and are the only active planning docs for this app.
- [ ] `rule-core` resolves `~/.learnwy/ai/rules` as the default shared store.
- [ ] `rule-core` discovers nested Markdown rules below the shared root.
- [ ] Selecting a parent tag such as `web` can match rules tagged with child tags such as `typescript`.
- [ ] The client and extension both follow the moved docs path.
- [ ] `apps/intelligent-rule-manager/i18n/*.json` are the canonical locale source for all three products.
- [ ] A generator updates the client, CLI, and extension localization outputs from that source.
- [ ] Locale placeholder names are validated across supported languages.
- [ ] Unit tests cover storage-root resolution and hierarchical tag expansion.

## Constraints

- Keep the workspace self-contained under `apps/intelligent-rule-manager/`.
- Use the Rust core as the shared rule behavior layer.
- Preserve the file-first model.
- Keep the tag taxonomy understandable and small enough to evolve deliberately.

## Risks

- Tag expansion can become noisy if the taxonomy grows without strong boundaries.
- Rewriting frontmatter may surprise users if canonical tags and resolved tags are confused.
- Shared home-directory storage requires extra care during verification and setup.

## Success Metrics

- One rule written into the shared root is visible to all three products.
- Parent-tag filtering works predictably in the client and extension-powered flows.
- The docs, storage path, and initial rules no longer need another folder reorganization.
