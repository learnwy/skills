---
name: "requirement-workflow"
description: "State-machine driven orchestrator for structured software development. Invoke when user wants to develop features, fix bugs, or refactor code. Triggers: 'build a feature', 'fix this bug', 'implement', 'develop', 'refactor'."
---

# Requirement Workflow Orchestrator

A state-machine driven orchestrator that provides structured development workflows for requirements of varying complexity.

## When to Use

**Invoke this skill when:**
- User requests feature development: "build a user authentication system"
- User needs bug fixes: "fix the login issue", "this button doesn't work"
- User wants refactoring: "refactor this module", "clean up this code"
- User asks about progress: "what's the status?", "where are we?"
- Keywords detected: `feature`, `bugfix`, `refactor`, `implement`, `develop`, `build`

**Do NOT invoke this skill when:**
- Simple Q&A or code explanations (no workflow needed)
- Single-line code changes (too trivial for workflow tracking)
- User explicitly declines: "just fix it, no workflow"
- Only checking status of existing workflow (use `get-status.sh` directly)

## Quick Start

### Step 1: Determine Requirement Level

| Level | Name | Use Case | Est. Time |
|-------|------|----------|-----------|
| **L1** | Quick | Bug fixes, config changes, minor tweaks | < 1h |
| **L2** | Standard | Regular feature development, API changes | 1-8h |
| **L3** | Full | Complex features, cross-module, security-sensitive | > 8h |

> 📖 See [Level Selection Guide](references/LEVEL_SELECTION.md) for detailed criteria

### Step 2: Initialize Workflow

```bash
./scripts/init-workflow.sh -r <project_root> -n <name> -t <type> [-l <level>]
```

**Required Parameters:**
- `-r, --root`: Project root directory
- `-n, --name`: Requirement name (lowercase, hyphenated)

**Optional Parameters:**
- `-t, --type`: `feature` | `bugfix` | `refactor` | `hotfix` (default: feature)
- `-l, --level`: `L1` | `L2` | `L3` (default: L2)

**Output:**
- Creates `.trae/workflow/{date}_{seq}_{type}_{name}/` directory
- Sets as active workflow (`.trae/active_workflow`)

### Step 3: Execute Workflow by Level

| Level | Flow | Reference |
|-------|------|-----------|
| L1 | PLANNING → IMPLEMENTING → TESTING | [L1 Workflow](references/WORKFLOW_L1.md) |
| L2 | ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING | [L2 Workflow](references/WORKFLOW_L2.md) |
| L3 | Extended analysis → Architecture review → Security audit → Implementation → Testing → Approval | [L3 Workflow](references/WORKFLOW_L3.md) |

### Step 4: Progress and Status Management

```bash
./scripts/get-status.sh -r <project_root>           # Check status
./scripts/advance-stage.sh -r <project_root>        # Advance to next stage
./scripts/generate-report.sh -r <project_root>      # Generate report
```

## Stage Execution Pattern

**Every stage MUST follow this structure:**

### 1. Stage Entry (Planning)

```
📍 [STAGE_NAME] Starting

🎯 Objectives:
- {objective_1}
- {objective_2}

📋 Tasks:
1. {task_1}
2. {task_2}

📄 Expected Outputs:
- {output_file_1}
- {output_file_2}
```

### 2. Stage Execution

- Use TodoWrite to track task progress
- Execute tasks in order
- Update output files in real-time

### 3. Stage Exit (Summary)

```
✅ [STAGE_NAME] Completed

📊 Summary:
- Tasks completed: {N}/{M}
- Duration: {duration}

📄 Outputs:
- {file_1}: {brief_description}
- {file_2}: {brief_description}

➡️ Next Stage: {NEXT_STAGE}
Prerequisites: {what_next_stage_needs}
```

### Stage Document Requirements

Each stage has explicit **input** and **output** documents:

| Stage | Input (Prerequisites) | Output (Must Produce) |
|-------|----------------------|----------------------|
| **ANALYZING** | User requirement | `spec.md` (PRD) |
| **PLANNING** | `spec.md` | `tasks.md` |
| **DESIGNING** | `spec.md`, `tasks.md` | `design.md` |
| **IMPLEMENTING** | `design.md`, `tasks.md` | Code files, `logs/impl.md` |
| **TESTING** | Code files | `checklist.md` |
| **DELIVERING** | `checklist.md` (all passed) | `artifacts/report.md` |

### Document Specifications

#### 1. spec.md - Product Requirements Document
**Stage:** ANALYZING
**Contents:**
- Background and objectives
- User stories
- Scope (In/Out)
- Acceptance criteria
- Constraints

#### 2. tasks.md - Task Breakdown
**Stage:** PLANNING
**Contents:**
- Task list with priorities
- Time estimates
- Dependencies
- Assignees (if applicable)

#### 3. design.md - Technical Design
**Stage:** DESIGNING
**Contents:**
- Solution overview
- Architecture design
- API design (if applicable)
- Data models
- Risk assessment

#### 4. logs/impl.md - Implementation Log
**Stage:** IMPLEMENTING
**Contents:**
- Progress tracking
- Issues encountered and solutions
- Code change summary

#### 5. checklist.md - Test Checklist
**Stage:** TESTING
**Contents:**
- Code quality checks (Lint, Type)
- Test results
- Coverage metrics
- Security checks (if applicable)

#### 6. artifacts/report.md - Delivery Report
**Stage:** DELIVERING
**Contents:**
- Workflow summary
- Completed tasks
- Change list
- Test results
- Lessons learned

## Workflow Levels Overview

### L1: Quick Workflow

```
INIT → PLANNING → IMPLEMENTING → TESTING → DONE
```

- **Skip:** spec.md, design.md
- **Required:** tasks.md, checklist.md
- **Best for:** Clear, low-risk changes

### L2: Standard Workflow

```
INIT → ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

- **Full documentation:** spec.md, design.md, tasks.md, checklist.md, report.md
- **Best for:** Most feature development

### L3: Full Workflow

```
INIT → ANALYZING(ext) → PLANNING(ext) → DESIGNING(ext) → IMPLEMENTING → TESTING → DELIVERING → DONE
```

- **Extended stages:** Threat modeling, architecture review, compliance check
- **Mandatory approvals:** Security team / Tech Lead sign-off
- **Best for:** Security-sensitive, cross-module, breaking changes

## Working Directory Structure

```
.trae/
├── active_workflow              # Path to current active workflow
└── workflow/
    └── {date}_{seq}_{type}_{name}/
        ├── workflow.yaml        # Workflow state
        ├── spec.md              # Requirements (L2, L3)
        ├── design.md            # Technical design (L2, L3)
        ├── tasks.md             # Task breakdown
        ├── checklist.md         # Test checklist
        ├── logs/
        │   └── impl.md          # Implementation log
        └── artifacts/
            └── report.md        # Final report
```

## Scripts Quick Reference

| Script | Purpose | Required Args |
|--------|---------|---------------|
| `init-workflow.sh` | Initialize workflow | `-r ROOT`, `-n NAME` |
| `get-status.sh` | Check status | `-r ROOT` |
| `advance-stage.sh` | Advance stage | `-r ROOT` |
| `inject-skill.sh` | Inject skill | `-r ROOT` |
| `generate-report.sh` | Generate report | `-r ROOT` |

## Examples

### Example 1: Bug Fix (L1)

```
User: The login button doesn't respond when clicked

AI: This is a clear bug. Using L1 Quick workflow.

📊 Analysis:
- Type: bugfix
- Level: L1 (Quick)
- Impact: 1 file

Initializing workflow...
✅ Workflow: 20240115_001_bugfix_fix-login-button

[PLANNING] Analyzing and planning fix
- Found: onClick handler has typo

[IMPLEMENTING] Executing fix
- Fixed: handleLgoin → handleLogin

[TESTING] Verifying
- ✅ TypeScript: passed
- ✅ ESLint: passed
- ✅ Tests: passed

[DONE] Workflow complete
- Duration: ~5 minutes
- Files changed: 1
```

### Example 2: New Feature (L2)

```
User: I need a user avatar upload feature

AI: Standard feature development. Using L2 Standard workflow.

📊 Analysis:
- Type: feature
- Level: L2 (Standard)
- Modules: User, Storage

Initializing workflow...
✅ Workflow: 20240115_002_feature_user-avatar-upload

[ANALYZING] Requirements clarification
- Max size: 2MB
- Formats: jpg, png
- Crop: circular preview

[PLANNING] Task breakdown
- 6 tasks identified
- Est. time: 4h

[DESIGNING] Technical design
- API: POST /api/users/avatar
- Storage: S3 /avatars/{userId}/{timestamp}.{ext}

[IMPLEMENTING] Coding
- ✅ All 6 tasks completed

[TESTING] Verification
- ✅ Tests: 12/12 passed
- ✅ Coverage: 75%

[DELIVERING] Report generation
- Report saved to artifacts/report.md

[DONE] Workflow complete
- Duration: 3h 45m
```

### Example 3: Security Feature (L3)

```
User: We need to integrate OAuth 2.0 for Google/GitHub login

AI: Security-sensitive feature. Using L3 Full workflow.

📊 Analysis:
- Type: feature
- Level: L3 (Full)
- Security: High
- Requires: Threat modeling, security review

Initializing workflow...
✅ Workflow: 20240115_003_feature_oauth-integration

[ANALYZING - Extended]
Threat modeling (STRIDE):
- Spoofing: High risk → Validate OAuth state
- Token leakage: High risk → HttpOnly cookies

[PLANNING - Extended]
- Timeline: ~5 days
- Rollback strategy: Feature flag

[DESIGNING - Extended]
Security design:
- State: encrypted random + timestamp
- Token: encrypted storage
- Scope: minimal permissions

🔒 Approvals required:
- [ ] Security team
- [ ] Tech Lead

User: Both approved

[IMPLEMENTING] Coding with security scanning
[TESTING - Extended] Security testing passed
[DELIVERING - Extended] Compliance sign-off complete

[DONE] Workflow complete
- Duration: 5 days
- Security review: Passed
```

## References

### Workflow Documentation
- [L1 Quick Workflow](references/WORKFLOW_L1.md)
- [L2 Standard Workflow](references/WORKFLOW_L2.md)
- [L3 Full Workflow](references/WORKFLOW_L3.md)

### Technical References
- [Level Selection Guide](references/LEVEL_SELECTION.md)
- [State Machine Specification](references/STATE_MACHINE.md)
- [Skill Injection Guide](references/INJECTION_GUIDE.md)

### Templates
- [Document Templates](assets/)
- [Example Configurations](examples/)
