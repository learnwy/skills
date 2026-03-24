---
name: requirement-workflow
description: "Structured software development workflow orchestrator. Triggers on: '开发功能', '实现这个', 'build this feature', 'implement', 'add new module', 'fix bug'. Workflows: Define→Plan→Design→Implement→Test→Deliver."
---

# Requirement Workflow

## Quick Start

```bash
# Initialize workflow
{skill_root}/scripts/init.cjs -r . -n "user-auth" -t feature -s medium

# Advance stages
{skill_root}/scripts/advance.cjs -r . [--auto]

# Check status
{skill_root}/scripts/status.cjs -r . [--json]
```

## Prerequisites

- Node.js >= 18
- Writable project directory for workflow state files

## Classification Matrix

### Type (What)

| Type | Description | Typical Scope |
|------|-------------|---------------|
| **bugfix** | Fix defects | ≤5 files |
| **feature** | New functionality | any |
| **refactor** | Code restructure | any |
| **tech-debt** | Technical improvements | any |

### Size (How Much)

| Size | Files | Duration | Stages |
|------|-------|----------|--------|
| **tiny** | ≤2 | <30min | Define→Implement→Done |
| **small** | 3-5 | 30min-2h | Define→Implement→Test→Done |
| **medium** | 6-15 | 2h-1d | Full flow |
| **large** | >15 | >1d | Full + checkpoints |

### Risk (Impact)

| Risk | Indicators | Checkpoints |
|------|------------|-------------|
| **normal** | No safety/security | Standard |
| **elevated** | Auth, payments, data | Extra review |
| **critical** | Security, financial | Mandatory approval |

## Stage Flow

```
INIT → DEFINING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
         ↓            ↓           ↓
      AskUserQ   AskUserQ   AskUserQ
```

## Type × Size → Stage Mapping

| Type | Size | Stages |
|------|------|--------|
| bugfix | tiny | INIT→IMPLEMENTING→DONE |
| bugfix | small | INIT→IMPLEMENTING→TESTING→DONE |
| bugfix | medium/large | Full flow |
| feature | any | Full flow |
| refactor | any | Full flow |
| tech-debt | any | Full flow |

## Human Checkpoints

| Stage | When | Who |
|-------|------|-----|
| After DEFINING | elevated/critical | User confirms scope |
| After PLANNING | large + elevated | User approves plan |
| After DESIGNING | medium+ or elevated | User reviews design |
| Before DELIVERING | all | User verifies checklist |

## Quality Gates

| Size | Checks |
|------|--------|
| tiny | Lint only |
| small | Lint + manual test |
| medium | Lint + type check + unit tests |
| large | medium + integration tests |

## Scripts

| Script | Purpose |
|--------|---------|
| `init.cjs` | Create workflow |
| `advance.cjs` | Move to next stage |
| `status.cjs` | Show progress |
| `hooks.cjs` | Manage hooks |

## Enforcement

AI **MUST** follow this workflow:
1. Read `SKILL.md` on trigger
2. Run `{skill_root}/scripts/init.cjs` to create workflow
3. Execute stage tasks
4. Run `{skill_root}/scripts/advance.cjs` to progress
5. At checkpoints, use `AskUserQuestion` to confirm

Use `{skill_root}/scripts/status.cjs -r . --json` to verify current stage.
