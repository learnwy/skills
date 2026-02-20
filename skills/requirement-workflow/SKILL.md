---
name: "requirement-workflow"
description: "State-machine driven orchestrator for structured software development. Invoke when user wants to develop features, fix bugs, or refactor code. Supports skill/agent injection at each stage for PRD generation, tech design, code review, etc. Triggers: 'build a feature', 'fix this bug', 'implement', 'develop', 'refactor'."
---

# Requirement Workflow Orchestrator

A state-machine driven orchestrator that provides structured development workflows with **skill/agent injection** support at each stage.

## Core Value

- **Structured Process**: Ensures consistent development practices across features
- **Stage-based Injection**: Invoke custom skills/agents at any stage (PRD writer, tech design, code review, etc.)
- **3-Level Configuration**: Global → Project → Workflow cascading configuration
- **Flexible Complexity**: L1 (Quick) → L2 (Standard) → L3 (Full) workflows

## When to Use

**Invoke this skill when:**
- User requests feature development: "build a user authentication system"
- User needs bug fixes: "fix the login issue"
- User wants refactoring: "refactor this module"
- User asks about progress: "what's the status?"
- Keywords: `feature`, `bugfix`, `refactor`, `implement`, `develop`, `build`

**Do NOT invoke when:**
- Simple Q&A or code explanations
- Single-line code changes (too trivial)
- User explicitly declines: "just fix it, no workflow"

## Quick Start

### 1. Initialize Workflow

```bash
./scripts/init-workflow.sh -r <project_root> -n <name> -t <type> [-l <level>]
```

| Level | Flow | Best For |
|-------|------|----------|
| **L1** | PLANNING → IMPLEMENTING → TESTING | Bug fixes, config changes (< 1h) |
| **L2** | ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING | Standard feature dev (1-8h) |
| **L3** | Extended stages with security/compliance checks | Complex/security-sensitive (> 8h) |

### 2. Configure Skill Injection (Optional but Recommended)

```bash
# Inject PRD writer at ANALYZING stage
./scripts/inject-skill.sh -r /project --scope global \
  --hook pre_stage_ANALYZING --skill prd-writer

# Inject tech design writer at DESIGNING stage
./scripts/inject-skill.sh -r /project --scope global \
  --hook pre_stage_DESIGNING --skill tech-design-writer

# Inject code reviewer after implementation
./scripts/inject-skill.sh -r /project --scope project \
  --hook post_stage_IMPLEMENTING --skill code-reviewer
```

### 3. Execute Workflow

```bash
./scripts/advance-stage.sh -r <project_root>  # Auto-advance to next stage
./scripts/get-status.sh -r <project_root>     # Check current status
```

When transitioning, injected skills are displayed:

```
✅ Successfully transitioned to DESIGNING

🔌 Injected Skills for DESIGNING:
─────────────────────────────────────────
  📥 Before stage (pre_stage_DESIGNING):
     → Invoke skill: tech-design-writer

📝 Next: Document technical design in design.md
```

**AI MUST invoke the listed skills at the appropriate timing.**

## Best Practices

### 1. Efficient Workflow Selection

| Scenario | Recommended | Reason |
|----------|-------------|--------|
| Typo fix, 1-3 files | L1 | Fast, minimal overhead |
| New feature, clear scope | L2 | Balanced structure |
| Security/payment/cross-module | L3 | Full audit trail |

**Rule of Thumb:** Start with L1 for simple tasks, upgrade if complexity grows.

### 2. Skill Injection Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Injection Levels                         │
├─────────────────────────────────────────────────────────────┤
│ Global:   {skill_dir}/hooks.yaml                           │
│           → PRD writer, Tech design writer (all projects)   │
│                                                             │
│ Project:  {root}/.trae/workflow/hooks.yaml                 │
│           → Project-specific reviewers, linters             │
│                                                             │
│ Workflow: {workflow}/workflow.yaml                          │
│           → One-time special requirements                   │
└─────────────────────────────────────────────────────────────┘
```

**Recommended Global Injections:**
```bash
# Document generation skills
./scripts/inject-skill.sh --scope global --hook pre_stage_ANALYZING --skill prd-writer
./scripts/inject-skill.sh --scope global --hook pre_stage_DESIGNING --skill tech-design-writer

# Quality gate skills
./scripts/inject-skill.sh --scope global --hook quality_gate --skill lint-checker --required
./scripts/inject-skill.sh --scope global --hook quality_gate --skill type-checker --required
```

### 3. Stage Execution Pattern

**Every stage MUST follow:**

```
📍 [STAGE_NAME] Starting

🎯 Objectives:
- {objective_1}

📋 Tasks:
1. {task_1}
2. {task_2}

─── Execute with TodoWrite tracking ───

✅ [STAGE_NAME] Completed
📊 Summary: {N} tasks completed
➡️ Next Stage: {NEXT_STAGE}
```

### 4. When to Skip vs. When to Follow

| Stage | Skip OK When | Never Skip When |
|-------|--------------|-----------------|
| ANALYZING | Requirements 100% clear | Any ambiguity exists |
| DESIGNING | Simple change (<50 LOC) | API changes, new modules |
| TESTING | Manual test sufficient | Production code |

### 5. Handling Blocked State

```bash
# Check what's blocking
./scripts/get-status.sh -r /project --history

# Force advance if truly stuck (use with caution)
./scripts/advance-stage.sh -r /project --force
```

## Skill Injection System

### 3-Level Configuration

| Level | Config Location | Scope | Use Case |
|-------|-----------------|-------|----------|
| **Global** | `{skill_dir}/hooks.yaml` | All projects | Standard skills (PRD, design writers) |
| **Project** | `{root}/.trae/workflow/hooks.yaml` | This project | Project-specific rules |
| **Workflow** | `{workflow}/workflow.yaml` | This workflow | One-time requirements |

Resolution: **workflow > project > global** (higher priority wins)

### Available Hooks

| Hook | Trigger | Typical Skills |
|------|---------|----------------|
| `pre_stage_{STAGE}` | Before entering stage | prd-writer, tech-design-writer |
| `post_stage_{STAGE}` | After completing stage | code-reviewer, doc-generator |
| `quality_gate` | Before quality checks | lint-checker, type-checker, security-scanner |
| `pre_delivery` | Before final delivery | compliance-checker |
| `on_blocked` | When workflow blocked | blocker-analyzer |
| `on_error` | On any error | error-reporter |

### Skill Invocation Flow

```
advance-stage.sh → DESIGNING
         │
         ▼
┌─────────────────────────────────────┐
│ 1. Check pre_stage_DESIGNING hooks  │
│    → Invoke: tech-design-writer     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 2. AI completes DESIGNING stage     │
│    → Write design.md                │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 3. Check post_stage_DESIGNING hooks │
│    → Invoke: design-reviewer        │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 4. Check quality_gate hooks         │
│    → Invoke: lint-checker           │
└─────────────────────────────────────┘
```

## Scripts Reference

### Core Scripts

| Script | Purpose | Required Args |
|--------|---------|---------------|
| `init-workflow.sh` | Initialize workflow | `-r ROOT`, `-n NAME` |
| `get-status.sh` | Check status | `-r ROOT` |
| `advance-stage.sh` | Advance stage | `-r ROOT` |
| `inject-skill.sh` | Manage skill injection | `-r ROOT` |
| `get-hooks.sh` | Query injected skills | `-r ROOT` |
| `generate-report.sh` | Generate report | `-r ROOT` |

### `init-workflow.sh`

```bash
./scripts/init-workflow.sh -r <root> -n <name> [-t <type>] [-l <level>]
```

| Option | Type | Required | Default |
|--------|------|----------|---------|
| `-r, --root` | PATH | ✅ | - |
| `-n, --name` | STRING | ✅ | - |
| `-t, --type` | ENUM | ❌ | feature |
| `-l, --level` | ENUM | ❌ | L2 |

Types: `feature`, `bugfix`, `refactor`, `hotfix`
Levels: `L1`, `L2`, `L3`

### `advance-stage.sh`

```bash
./scripts/advance-stage.sh -r <root> [-t <stage>] [--validate] [--force]
```

| Option | Description |
|--------|-------------|
| `-t, --to STAGE` | Target stage (auto if not specified) |
| `--validate` | Only validate, don't transition |
| `--force` | Force transition (skip validation) |

**Output includes injected skills to invoke.**

### `inject-skill.sh`

```bash
./scripts/inject-skill.sh -r <root> --scope <scope> --hook <hook> --skill <skill>
```

| Option | Description |
|--------|-------------|
| `--scope` | `global` \| `project` \| `workflow` |
| `--hook` | Hook point name |
| `--skill` | Skill name to inject |
| `--required` | Block workflow on failure |
| `--list` | List all injections |

### `get-hooks.sh`

```bash
./scripts/get-hooks.sh -r <root> --hook <hook> [--format <fmt>]
./scripts/get-hooks.sh -r <root> --stage <stage>
```

| Format | Output |
|--------|--------|
| `text` | Human readable (default) |
| `json` | JSON format |
| `skills-only` | Skill names only |

## Library Modules

All scripts use `common-utils.sh` which provides:

| Module | Functions |
|--------|-----------|
| `log-utils.sh` | `log_info`, `log_warn`, `log_error`, `log_success`, `die` |
| `time-utils.sh` | `get_timestamp`, `get_date_id`, `format_duration` |
| `fs-utils.sh` | `ensure_dir`, `ensure_file`, `file_exists`, `dir_exists` |
| `validation-utils.sh` | `is_valid_level`, `is_valid_type`, `is_valid_stage`, `require_param` |
| `yaml-utils.sh` | `yaml_read`, `yaml_write`, `yaml_append_history` |
| `workflow-utils.sh` | `get_active_workflow`, `set_active_workflow`, `workflow_exists` |
| `hooks-utils.sh` | `get_hooks_for_point`, `get_global_hooks_file` |

Usage:
```bash
source "$(dirname "$0")/lib/common-utils.sh"
```

## Stage Documents

| Stage | Input | Output |
|-------|-------|--------|
| **ANALYZING** | User requirement | `spec.md` (PRD) |
| **PLANNING** | spec.md | `tasks.md` |
| **DESIGNING** | spec.md, tasks.md | `design.md` |
| **IMPLEMENTING** | design.md, tasks.md | Code, `logs/impl.md` |
| **TESTING** | Code | `checklist.md` |
| **DELIVERING** | checklist.md | `artifacts/report.md` |

## Directory Structure

```
.trae/
├── active_workflow              # Current active workflow path
└── workflow/
    ├── hooks.yaml               # Project-level hooks config
    └── {date}_{seq}_{type}_{name}/
        ├── workflow.yaml        # State file
        ├── spec.md              # PRD (L2, L3)
        ├── design.md            # Tech design (L2, L3)
        ├── tasks.md             # Task breakdown
        ├── checklist.md         # Test checklist
        ├── logs/impl.md         # Implementation log
        └── artifacts/report.md  # Final report
```

## Examples

### Quick Bug Fix (L1)

```
User: The login button doesn't respond

AI: Clear bug → L1 workflow

./scripts/init-workflow.sh -r /project -n "fix-login" -t bugfix -l L1
./scripts/advance-stage.sh -r /project  # → PLANNING
# ... fix the bug ...
./scripts/advance-stage.sh -r /project  # → IMPLEMENTING
./scripts/advance-stage.sh -r /project  # → TESTING
./scripts/advance-stage.sh -r /project  # → DONE

Duration: ~5 min
```

### Feature with Skill Injection (L2)

```
User: Add user avatar upload

AI: Standard feature → L2 workflow

# One-time global setup (if not done)
./scripts/inject-skill.sh -r /project --scope global \
  --hook pre_stage_ANALYZING --skill prd-writer
./scripts/inject-skill.sh -r /project --scope global \
  --hook pre_stage_DESIGNING --skill tech-design-writer

# Workflow execution
./scripts/init-workflow.sh -r /project -n "avatar-upload" -t feature
./scripts/advance-stage.sh -r /project  # → ANALYZING
# Output: "→ Invoke skill: prd-writer"
# AI invokes prd-writer to generate PRD

./scripts/advance-stage.sh -r /project  # → PLANNING
./scripts/advance-stage.sh -r /project  # → DESIGNING
# Output: "→ Invoke skill: tech-design-writer"
# AI invokes tech-design-writer

# ... continue workflow ...
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

### Templates & Examples
- [Document Templates](assets/)
- [Example Configurations](examples/)
