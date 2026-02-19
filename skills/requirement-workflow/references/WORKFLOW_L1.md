# L1: Quick Workflow

Streamlined workflow for quick fixes and minor changes.

## Overview

```
INIT → PLANNING → IMPLEMENTING → TESTING → DONE
```

| Property | Value |
|----------|-------|
| Target Time | < 1 hour |
| Outputs | tasks.md, checklist.md |
| Skipped | spec.md, design.md |
| Best For | Bug fixes, minor changes, config updates |

## Stages

### Stage 1: INIT → PLANNING

**Trigger:** Workflow initialization complete

**AI Actions:**
1. Quick analysis of issue/requirement
2. Plan fix approach directly
3. Create simple task list (`tasks.md`)

**Output:**
```markdown
# Tasks

- [ ] Locate issue
- [ ] Implement fix
- [ ] Verify fix works
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to PLANNING
```

### Stage 2: PLANNING → IMPLEMENTING

**Trigger:** Task planning complete

**AI Actions:**
1. Execute tasks sequentially
2. Track progress with TodoWrite
3. Mark each task ✅ when done

**Notes:**
- L1 does not require detailed design documents
- Proceed directly to coding

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to IMPLEMENTING
```

### Stage 3: IMPLEMENTING → TESTING

**Trigger:** All tasks complete

**AI Actions:**
1. Run relevant tests
2. Execute basic quality checks:
   - Lint check
   - Type check (if applicable)
3. Update `checklist.md`

**Output:**
```markdown
# Checklist

- [x] Code changes complete
- [x] Local tests pass
- [ ] Lint check passed
- [ ] Related unit tests passed
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to TESTING
```

### Stage 4: TESTING → DONE

**Trigger:** All checks passed

**AI Actions:**
1. Confirm all checklist items complete
2. Brief summary of changes
3. Mark workflow complete

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to DONE
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

[PLANNING] Analyzing and planning fix

Checking login button code...

Found issue: onClick handler has typo, calling non-existent function

📋 Task list:
1. Fix function name typo in LoginButton.tsx
2. Verify button click works

Advancing to IMPLEMENTING...

---

[IMPLEMENTING] Executing fix

Modified: src/components/LoginButton.tsx
- Changed `handleLgoin` to `handleLogin`

✅ Task 1 complete

Advancing to TESTING...

---

[TESTING] Verifying fix

Running checks:
- ✅ TypeScript compilation passed
- ✅ ESLint no new errors
- ✅ Related tests passed

Advancing to DONE...

---

[DONE] Workflow complete

📋 Fix Summary:
- Fixed function name typo in LoginButton.tsx
- Files changed: 1
- Duration: ~5 minutes

✅ Bug fixed. Login button now responds to clicks.
```

## Skip Conditions

L1 workflow skips:

| Stage | Skipped? | Reason |
|-------|----------|--------|
| ANALYZING | ✅ Skip | Issue is already clear |
| DESIGNING | ✅ Skip | No design needed |
| DELIVERING | ✅ Skip | No formal delivery |

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
quality_gate     # Before testing
on_error        # On error
```

## Escalation

If during L1 execution you discover:

- Issue is more complex than expected
- Multiple modules need changes
- Design discussion needed

**Escalate to L2:**

```bash
# Record in workflow.yaml
escalated_from: L1
escalation_reason: "Issue spans multiple modules"
level: L2
```
