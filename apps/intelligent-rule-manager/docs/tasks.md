# Intelligent Rule Manager Tasks

## Phase 1: Workspace Foundation

- [x] Create `apps/intelligent-rule-manager/`
- [x] Add app-local docs in `docs/`
- [x] Add React/Vite scaffold files
- [x] Add Cargo workspace root
- [x] Add `src-tauri` scaffold
- [x] Add `rule-core` and `rule-cli` crate scaffolds

## Phase 2: Domain Foundation

- [x] Define shared rule metadata and workspace summary models
- [x] Implement storage root resolution in `rule-core`
- [ ] Add error handling strategy for domain and CLI usage
- [ ] Add fixture-based tests for sample rule files

## Phase 3: CLI Parity

- [ ] Implement `init`
- [ ] Implement `create`
- [x] Implement `list`
- [ ] Implement `inspect`
- [ ] Implement `stats`
- [ ] Implement `decide`
- [ ] Implement `compose`
- [ ] Implement `recommend-visualization`

## Phase 4: Desktop App Shell

- [x] Add typed Tauri invoke helpers in the frontend
- [x] Replace static summary content with live Tauri data
- [ ] Build the three-pane desktop layout
- [ ] Add loading, empty, and error states

## Phase 5: Rule Library UI

- [x] Implement rule list and search
- [ ] Implement tag/group/target filters
- [x] Implement rule detail viewer
- [ ] Implement create-rule flow from template

## Phase 6: Editing And Composition

- [ ] Implement metadata editor
- [ ] Implement Markdown body editor
- [ ] Implement live preview
- [ ] Implement compose studio
- [ ] Implement export actions

## Phase 7: Verification

- [ ] Run frontend typecheck
- [ ] Run Rust formatting and checks
- [ ] Run manual Tauri smoke test
- [ ] Review behavior against `docs/spec.md`
