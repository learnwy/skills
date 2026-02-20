# L2: Standard Workflow

Complete workflow for regular feature development.

## Overview

```
INIT → ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

| Property | Value |
|----------|-------|
| Target Time | 1-8 hours |
| Outputs | spec.md, design.md, tasks.md, checklist.md, report.md |
| Best For | Most feature development |

## Stages

### Stage 1: INIT → ANALYZING

**Trigger:** Workflow initialization complete

**AI Actions:**
1. Understand user requirements
2. Ask clarifying questions (if needed)
3. Document requirements in `spec.md`

**Output (spec.md):**
```markdown
# Requirements: {name}

## Background
{Why this feature is needed}

## Objectives
{What the feature should achieve}

## Scope
- In Scope: {included features}
- Out of Scope: {explicitly excluded}

## Acceptance Criteria
- [ ] {criterion_1}
- [ ] {criterion_2}
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to ANALYZING
```

### Stage 2: ANALYZING → PLANNING

**Trigger:** Requirements clear, spec.md complete

**AI Actions:**
1. Analyze existing codebase
2. Identify affected modules
3. Plan technical approach
4. Create task list (`tasks.md`)

**Output (tasks.md):**
```markdown
# Task List

## Phase 1: Preparation
- [ ] Task 1.1
- [ ] Task 1.2

## Phase 2: Core Implementation
- [ ] Task 2.1
- [ ] Task 2.2

## Phase 3: Testing and Polish
- [ ] Task 3.1
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to PLANNING
```

### Stage 3: PLANNING → DESIGNING

**Trigger:** Task planning complete

**AI Actions:**
1. Design technical solution
2. Define API interfaces (if applicable)
3. Design data structures
4. Document in `design.md`

**Output (design.md):**
```markdown
# Technical Design: {name}

## Solution Overview
{High-level design approach}

## Component Interaction
{How modules work together}

## API Design (if applicable)
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/xxx | POST | ... |

## Data Model
{Data structure definitions}

## Risks and Mitigations
| Risk | Mitigation |
|------|------------|
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to DESIGNING
```

### Stage 4: DESIGNING → IMPLEMENTING

**Trigger:** Design complete, design.md done

**AI Actions:**
1. Execute tasks from tasks.md in order
2. Track with TodoWrite
3. Update progress on each completion

**Guidelines:**
- Follow existing code style
- Add necessary tests
- Commit progress regularly

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to IMPLEMENTING
```

### Stage 5: IMPLEMENTING → TESTING

**Trigger:** All development tasks complete

**AI Actions:**
1. Run full test suite
2. Execute quality checks:
   - Lint check
   - Type check
   - Unit tests
   - Integration tests (if applicable)
3. Update `checklist.md`

**Output (checklist.md):**
```markdown
# Acceptance Checklist

## Functional Verification
- [ ] Core functionality works
- [ ] Edge cases handled
- [ ] Error handling

## Quality Checks
- [ ] Lint passed
- [ ] Type check passed
- [ ] Unit tests passed
- [ ] Coverage >= 70%

## Documentation
- [ ] API docs updated
- [ ] README updated (if needed)
```

**Hook Point:** `quality_gate`

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to TESTING
```

### Stage 6: TESTING → DELIVERING

**Trigger:** All tests passed

**AI Actions:**
1. Generate change report
2. Prepare delivery materials
3. Update `artifacts/report.md`

**Output (report.md):**
```markdown
# Workflow Report

## Summary
| Item | Value |
|------|-------|
| Workflow ID | xxx |
| Type | feature |
| Level | L2 |
| Duration | 4h 30m |

## Change Summary
- Files added: 3
- Files modified: 5
- Files deleted: 0

## Test Results
- Unit tests: Passed
- Coverage: 78%

## Notes
{Additional remarks}
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to DELIVERING
```

### Stage 7: DELIVERING → DONE

**Trigger:** Delivery materials ready

**AI Actions:**
1. Final confirmation all tasks complete
2. Summarize workflow
3. Mark complete

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to DONE
```

## Complete Example

### Scenario: Implement user avatar upload feature

```
User: I need a user avatar upload feature

AI: Standard feature development. Using L2 Standard workflow.

📊 Analysis:
- Type: feature
- Level: L2 (Standard)
- Est. impact: ~10 files

Initializing workflow...

✅ Workflow: 20240115_001_feature_user-avatar-upload
📁 .trae/workflow/20240115_001_feature_user-avatar-upload/

---

[ANALYZING] Requirements analysis

Questions to clarify:
1. Max file size?
2. Supported formats?
3. Cropping needed?

User: 2MB limit, jpg/png, need circular cropping

Got it, updating spec.md...

📄 spec.md created:
- Max file: 2MB
- Formats: jpg, png
- Cropping: circular preview

Advancing to PLANNING...

---

[PLANNING] Task planning

After analyzing codebase, planned tasks:

📋 tasks.md:
1. Create AvatarUploader component
2. Add image cropping feature
3. Implement upload API
4. Integrate storage service
5. Update user Profile page
6. Add unit tests

Advancing to DESIGNING...

---

[DESIGNING] Technical design

📄 design.md created:

Component design:
- AvatarUploader: handles file selection and preview
- ImageCropper: circular cropping

API design:
- POST /api/users/avatar
- Returns: { url: string }

Storage:
- S3-compatible storage
- Path: /avatars/{userId}/{timestamp}.{ext}

Advancing to IMPLEMENTING...

---

[IMPLEMENTING] Coding

Executing task list...

✅ Task 1: AvatarUploader complete
✅ Task 2: ImageCropper complete
✅ Task 3: Upload API complete
✅ Task 4: Storage integration complete
✅ Task 5: Profile page updated
✅ Task 6: Unit tests complete

Advancing to TESTING...

---

[TESTING] Verification

Running quality checks:
- ✅ TypeScript compilation passed
- ✅ ESLint no errors
- ✅ Unit tests passed (12/12)
- ✅ Coverage: 75%

Updating checklist.md...

Advancing to DELIVERING...

---

[DELIVERING] Preparing delivery

Generating report artifacts/report.md:
- Files added: 4
- Files modified: 6
- Total code: +320, -15
- Test coverage: 75%

Advancing to DONE...

---

[DONE] Workflow complete

✅ User avatar upload feature complete!

Change summary:
- Frontend: AvatarUploader, ImageCropper components
- Backend: /api/users/avatar endpoint
- Storage: S3 integration

Duration: 3h 45m
```

## Quality Gate

L2 standard quality checks:

```yaml
quality_gate:
  lint: required
  type_check: required
  unit_tests: required
  coverage_threshold: 70%
  integration_tests: recommended
```

## Available Hooks

```
pre_stage_{STAGE}      # Before entering stage
post_stage_{STAGE}     # After completing stage
pre_task_{task_id}     # Before executing task
post_task_{task_id}    # After completing task
quality_gate           # During quality checks
pre_delivery           # Before delivery
on_blocked             # When blocked
on_error               # On error
```

## Skill Injection

Recommended skills for L2:

```yaml
hooks:
  post_stage_DESIGNING:
    - skill: code-reviewer
      required: false
      config:
        focus: ["architecture", "api_design"]
    
  pre_stage_IMPLEMENTING:
    - skill: test-generator
      required: false
      config:
        coverage_target: 70
    
  pre_stage_TESTING:
    - skill: coverage-checker
      required: false
      config:
        min_coverage: 70
```

## Escalation to L3

Escalate if you discover:
- Security-sensitive operations
- Requires cross-team approval
- Complexity exceeds expectations

**Escalate to L3.**
