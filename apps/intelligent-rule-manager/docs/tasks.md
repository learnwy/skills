# Intelligent Rule Manager Tasks

## Phase 1: Workspace Structure

- [x] Split the app into `client/`, `cli/`, and `extension/`
- [x] Move planning docs to `apps/intelligent-rule-manager/docs/`
- [x] Update extension commands to target the workspace-level docs

## Phase 2: Shared Rule Model

- [x] Resolve the default shared rule root
- [x] Support recursive rule discovery below the shared root
- [x] Expose resolved ancestor tags for filtering
- [x] Preserve canonical tags in saved rule files
- [ ] Add explicit domain error types instead of string-only errors

## Phase 3: Rule Library Baseline

- [x] Implement `create`
- [x] Implement `list`
- [x] Implement `inspect`
- [x] Implement `stats`
- [x] Implement `recommend-visualization`
- [ ] Implement `decide`
- [ ] Implement `compose`
- [ ] Implement export actions

## Phase 4: Shared Starter Rules

- [x] Add initial TypeScript rules under `~/.learnwy/ai/rules`
- [x] Add initial lint/format and git-hooks rules under `~/.learnwy/ai/rules`
- [x] Verify the starter rules are visible in the client, CLI, and extension

## Phase 5: Verification

- [x] Add unit tests for storage-root behavior
- [x] Add unit tests for recursive discovery
- [x] Add unit tests for hierarchical tag expansion
- [ ] Run a manual Tauri smoke test
- [x] Review the current behavior against `docs/spec.md`
