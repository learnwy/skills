# L1: Quick Workflow

Streamlined workflow for quick fixes and minor changes.

> **Note:** All `./scripts/` paths below are relative to `{skill_root}` (the directory containing SKILL.md). Use absolute path in actual execution.

## Overview

```
INIT → ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

| Property | Value |
|----------|-------|
| Target Time | < 1 hour |
| Outputs | spec.md (brief), design.md (brief), tasks.md, checklist.md, report.md |
| Doc Depth | Brief, 1-2 paragraphs per section |
| Best For | Bug fixes, minor changes, config updates |

## Stages

### Stage 1: INIT → ANALYZING

**Trigger:** Workflow initialization complete

**AI Actions:**
1. Quick analysis of issue/requirement
2. Document brief PRD in `spec.md`
3. Define scope and acceptance criteria

**Output (spec.md - Brief):**
```markdown
# Requirements: {name}

## Background
{1-2 sentences: why this is needed}

## Scope
- Fix: {what needs to be fixed}
- Files: {estimated files affected}

## Acceptance Criteria
- [ ] {primary criterion}
- [ ] {secondary criterion if any}
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project
```

### Stage 2: ANALYZING → PLANNING

**Trigger:** Brief requirements documented

**AI Actions:**
1. Analyze issue/code
2. Create simple task list (`tasks.md`)

**Output (tasks.md):**
```markdown
# Tasks

- [ ] Locate and analyze issue
- [ ] Implement fix
- [ ] Verify fix works
- [ ] Run tests
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project
```

### Stage 3: PLANNING → DESIGNING

**Trigger:** Task planning complete

**AI Actions:**
1. Document key technical decisions
2. Brief solution approach in `design.md`

**Output (design.md - Brief):**
```markdown
# Technical Design: {name}

## Solution
{1-2 paragraphs: what will be changed and why}

## Key Decisions
- {decision 1}: {reason}
- {decision 2}: {reason if any}

## Files to Change
- {file1}: {change description}
- {file2}: {change description}
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project
```

### Stage 4: DESIGNING → IMPLEMENTING

**Trigger:** Design documented

**AI Actions:**
1. Execute tasks sequentially
2. Track progress with TodoWrite
3. Mark each task ✅ when done

**Transition:**
```bash
./scripts/advance-stage.sh -r /project
```

### Stage 5: IMPLEMENTING → TESTING

**Trigger:** All tasks complete

**AI Actions:**
1. Run relevant tests
2. Execute basic quality checks:
   - Lint check
   - Type check (if applicable)
3. Update `checklist.md`

**Output (checklist.md):**
```markdown
# Checklist

- [x] Code changes complete
- [x] Local tests pass
- [ ] Lint check passed
- [ ] Related unit tests passed
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project
```

### Stage 6: TESTING → DELIVERING

**Trigger:** All checks passed

**AI Actions:**
1. Generate brief change report
2. Update `report.md`

**Output (report.md - Brief):**
```markdown
# Workflow Report

## Summary
- Type: bugfix
- Level: L1
- Duration: ~{X} minutes

## Changes
- {file1}: {change description}

## Verification
- Tests: Passed
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project
```

### Stage 7: DELIVERING → DONE

**Trigger:** Report generated

**AI Actions:**
1. Final summary of changes
2. Mark workflow complete

**Transition:**
```bash
./scripts/advance-stage.sh -r /project
```

## Complete Example

### Scenario: Fix login button not responding

```
User: Login button doesn't respond when clicked

AI: This is a clear bug. Using L1 Quick workflow.

📊 Analysis:
- Type: bugfix
- Level: L1
- Impact: 1 file

Initializing workflow...

✅ Workflow: 20240115_001_bugfix_fix-login-button
📁 .trae/workflow/20240115_001_bugfix_fix-login-button/

---

[ANALYZING] Brief requirements

📄 spec.md:
- Background: Login button click handler broken
- Scope: Fix onClick in LoginButton.tsx
- Criteria: Button triggers login action

Advancing to PLANNING...

---

[PLANNING] Task breakdown

📋 tasks.md:
1. Locate issue in LoginButton.tsx
2. Fix the handler
3. Verify button works

Advancing to DESIGNING...

---

[DESIGNING] Technical approach

📄 design.md:
- Solution: Fix typo in onClick handler (handleLgoin → handleLogin)
- Files: src/components/LoginButton.tsx

Advancing to IMPLEMENTING...

---

[IMPLEMENTING] Executing fix

Modified: src/components/LoginButton.tsx
- Changed `handleLgoin` to `handleLogin`

✅ All tasks complete

Advancing to TESTING...

---

[TESTING] Verifying fix

Running checks:
- ✅ TypeScript compilation passed
- ✅ ESLint no new errors
- ✅ Related tests passed

Advancing to DELIVERING...

---

[DELIVERING] Report

📄 report.md generated:
- Files changed: 1
- Duration: ~5 minutes

Advancing to DONE...

---

[DONE] Workflow complete

📋 Fix Summary:
- Fixed function name typo in LoginButton.tsx
- Files changed: 1
- Duration: ~5 minutes

✅ Bug fixed. Login button now responds to clicks.
```

## Quality Gate

L1 minimum quality checks:

```yaml
quality_gate:
  lint: required
  type_check: required (if applicable)
  unit_tests: optional
  integration_tests: skip
```

## Available Hooks

```
pre_stage_{STAGE}   # Before entering stage
post_stage_{STAGE}  # After completing stage
quality_gate        # Before testing
on_error            # On error
```

## Escalation

If during L1 execution you discover:

- Issue is more complex than expected
- Multiple modules need changes
- Deeper design discussion needed

**Escalate to L2:**

```bash
# Record in workflow.yaml
escalated_from: L1
escalation_reason: "Issue spans multiple modules"
level: L2
```
