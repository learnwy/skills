---
name: requirement-workflow
description: "State-machine driven orchestrator for structured software development. Use when user wants to build a feature, fix a bug, implement something substantial, refactor code, or develop new functionality. Triggers on: '开发功能', '实现这个', 'build this feature', 'implement', 'add new module'. Creates workflow in .trae/workflow/ with stages: ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING."
---

# Requirement Workflow Orchestrator

State-machine driven development workflow with agent/skill injection support.

## Execution Flow

```
1. ANALYZE & SELECT LEVEL → Run init-workflow.sh
2. STAGE LOOP → Run advance-stage.sh for each stage
3. CREATE DOCUMENTS → spec.md → tasks.md → design.md → checklist.md → report.md
```

## Step 1: Analyze & Select Level

| Level  | Condition                        | Doc Depth          |
| ------ | -------------------------------- | ------------------ |
| **L1** | ≤3 files, quick fix              | Brief + simple     |
| **L2** | 4-15 files, standard feature     | Full PRD + design  |
| **L3** | Security/cross-module/breaking   | Comprehensive      |

## Step 2: Initialize Workflow

```bash
{skill_root}/scripts/init-workflow.sh -r <project_root> -n <name> -t <type> -l <level>
```

**Types:** `feature`, `bugfix`, `refactor`, `hotfix`

## Step 3: Execute Stage Loop

For EACH stage:
```
A. Run: {skill_root}/scripts/advance-stage.sh -r <project_root>
B. Check for injected agents (pre_stage/post_stage)
C. Create stage document
D. Repeat until status = DONE
```

### Stage Documents

| Stage        | Document       | Content                |
| ------------ | -------------- | ---------------------- |
| ANALYZING    | `spec.md`      | Requirements, scope    |
| PLANNING     | `tasks.md`     | Task breakdown         |
| DESIGNING    | `design.md`    | Technical design       |
| IMPLEMENTING | Code           | Implementation         |
| TESTING      | `checklist.md` | Test checklist         |
| DELIVERING   | `report.md`    | Summary report         |

## Scripts

| Script               | Purpose             |
| -------------------- | ------------------- |
| `init-workflow.sh`   | Initialize workflow |
| `advance-stage.sh`   | Advance to next stage |
| `get-status.sh`      | Check current status |
| `inject-agent.sh`    | Add agent injection |
| `generate-report.sh` | Generate final report |

## Example

```
User: "Add user authentication feature"

$ {skill_root}/scripts/init-workflow.sh -r /project -n "user-auth" -t feature -l L2
✅ Created: .trae/workflow/20240115_001_feature_user-auth/

$ {skill_root}/scripts/advance-stage.sh -r /project
✅ Transitioned to ANALYZING
🤖 Injected: risk-auditor (pre_stage)

[Create spec.md...]

$ {skill_root}/scripts/advance-stage.sh -r /project
✅ Transitioned to PLANNING
...
```

## References

- [L1 Workflow](references/WORKFLOW_L1.md) - Quick workflow
- [L2 Workflow](references/WORKFLOW_L2.md) - Standard workflow  
- [L3 Workflow](references/WORKFLOW_L3.md) - Complex workflow
- [Injection Guide](references/INJECTION_GUIDE.md) - Agent/Skill injection
