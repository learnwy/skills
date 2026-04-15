# Intelligent Rule Manager Spec

## Background

The current `intelligent-rule-manager` skill defines a rule library concept and a Node CLI for creating, filtering, composing, and exporting Markdown rule files stored outside the current repository. We now need a desktop application that makes this workflow easier to browse, edit, and operate while preserving the file-based source of truth.

The desktop app should be cross-platform, with macOS as the first polished platform, and should share its core domain logic with a Rust CLI so GUI and automation flows stay aligned.

## Goal

Deliver a self-contained desktop app workspace under `apps/intelligent-rule-manager` that establishes:

- a Tauri + React desktop shell
- a Rust core library for domain logic
- a Rust CLI using `clap`
- app-local planning docs for implementation

## Scope

### In Scope

- Cross-platform Tauri desktop architecture
- React/TypeScript UI scaffold
- Rust workspace with `rule-core` and `rule-cli`
- App-specific `spec.md`, `design.md`, and `tasks.md`
- Initial screens and commands that prove the shape of the app
- Rule storage compatibility with `AGENTS_HOME/rules` or `~/.agents/rules`

### Out of Scope For This Milestone

- Full rule editing and persistence
- AI-assisted rewriting inside the app
- Cloud sync or collaboration
- Auto-update, code signing, notarization, or release automation
- Complete parity with the existing Node CLI

## Users

- Individual AI power users maintaining reusable rule libraries
- Developers who want a visual workflow for browsing and composing rule packs
- Users who still need a CLI for automation or scripting

## Functional Requirements

### Rule Library

- The system shall resolve the rule storage root from `AGENTS_HOME/rules` when `AGENTS_HOME` is set.
- The system shall fall back to `~/.agents/rules` when `AGENTS_HOME` is not set.
- The system shall treat Markdown rule files with YAML frontmatter as the source of truth.

### Desktop App

- The system shall provide a desktop shell that can call Rust commands from the UI.
- The system shall expose an initial workspace summary so the UI can render useful startup context.
- The system shall present a rule-library-oriented layout that can evolve into browsing, editing, and compose flows.

### CLI

- The system shall provide a Rust CLI using `clap`.
- The CLI shall support a stable command structure that mirrors the existing Node CLI direction.
- The CLI shall be implemented on top of shared Rust domain code rather than duplicated logic.

### Architecture

- The system shall isolate domain logic in a reusable Rust crate.
- The system shall keep app-specific planning documents inside `apps/intelligent-rule-manager/docs/`.
- The system shall allow the UI and CLI to evolve independently while sharing the same domain layer.

## Acceptance Criteria

- [ ] When the app workspace is created, the repository contains `apps/intelligent-rule-manager/docs/spec.md`, `design.md`, and `tasks.md`.
- [ ] When a developer opens the app folder, they can see a React/Vite frontend scaffold, a Tauri shell, and Rust crates for `rule-core` and `rule-cli`.
- [ ] When a developer reads the design doc, they can understand the intended crate boundaries, UI architecture, and delivery phases.
- [ ] When a developer runs the Rust CLI help command after dependencies are installed, the command tree is visible and aligned with the planned product direction.
- [ ] When the Tauri app is launched after dependencies are installed, the initial shell can render a workspace-oriented landing screen.

## Constraints

- Use Tauri for cross-platform desktop support.
- Use Rust for shared business logic and CLI implementation.
- Keep the app self-contained inside `apps/intelligent-rule-manager`.
- Preserve the rule-file source-of-truth model.
- Prefer an architecture that can reach parity with the existing Node script incrementally.

## Non-Goals

- Replacing the existing Node script immediately
- Designing every future screen in this milestone
- Introducing a local database before the file model proves insufficient

## Risks

- Frontmatter parsing and rewrite fidelity may cause user-facing diffs if the serializer is too aggressive.
- Tauri and CLI parity may drift if the domain layer is not established first.
- UI polish could distract from the more important domain and file-model correctness work.

## Success Metrics

- The app workspace is understandable and implementation-ready.
- The domain layer becomes the clear home for future rule logic.
- The project can proceed from planning into implementation without restructuring the app folder again.

