# Workflow Level Definitions

# 工作流级别定义

## Overview / 概述

The requirement-workflow supports three levels of development workflow, automatically selected based on requirement complexity analysis.

## Level Definitions / 级别定义

### L1: Quick Workflow / 快速流程

**Target:** Simple tasks with minimal risk
**Duration:** < 1 hour

**Stages:**

```
INIT → PLANNING → IMPLEMENTING → TESTING → DONE
```

**Applicable Scenarios:**

- Bug fixes with clear root cause
- Minor UI adjustments
- Configuration changes
- Documentation updates
- Simple refactoring (single file)

**Selection Criteria:**
| Criterion | Threshold |
|-----------|-----------|
| Affected files | ≤ 3 |
| Affected modules | 1 |
| Risk level | Low |
| External dependencies | None |
| Requires design | No |

**Artifacts Generated:**

- `workflow.yaml` - Workflow state
- `tasks.md` - Task list
- `checklist.md` - Verification checklist

---

### L2: Standard Workflow / 标准流程

**Target:** Regular feature development
**Duration:** 1-8 hours

**Stages:**

```
INIT → ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

**Applicable Scenarios:**

- New feature implementation
- Moderate refactoring
- API additions/modifications
- Component updates
- Cross-file changes with clear scope

**Selection Criteria:**
| Criterion | Threshold |
|-----------|-----------|
| Affected files | 4-15 |
| Affected modules | 1-3 |
| Risk level | Medium |
| External dependencies | Optional |
| Requires design | Yes (simple) |

**Artifacts Generated:**

- `workflow.yaml` - Workflow state
- `spec.md` - Requirement specification
- `design.md` - Technical design
- `tasks.md` - Task list
- `checklist.md` - Verification checklist
- `artifacts/report.md` - Final report

---

### L3: Full Workflow / 完整流程

**Target:** Complex features with significant impact
**Duration:** > 8 hours or multi-day

**Stages:**

```
INIT → ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
        (extended)  (extended)  (extended)
```

**Extended Phase Details:**

**ANALYZING (Extended):**

- Stakeholder identification
- Impact analysis
- Risk assessment matrix
- Alternative solutions evaluation

**PLANNING (Extended):**

- Resource planning
- Timeline estimation
- Dependency mapping
- Rollback strategy

**DESIGNING (Extended):**

- Architecture review
- Security considerations
- Performance implications
- Migration plan (if applicable)

**Applicable Scenarios:**

- Major feature development
- System architecture changes
- Cross-module refactoring
- Breaking changes
- Security-sensitive features
- Features requiring migration

**Selection Criteria:**
| Criterion | Threshold |
|-----------|-----------|
| Affected files | > 15 |
| Affected modules | > 3 |
| Risk level | High |
| External dependencies | Multiple |
| Requires design | Yes (complex) |
| Breaking changes | Possible |

**Artifacts Generated:**

- `workflow.yaml` - Workflow state
- `spec.md` - Detailed requirement specification
- `design.md` - Comprehensive technical design
- `tasks.md` - Task list with estimates
- `checklist.md` - Verification checklist
- `artifacts/report.md` - Final report
- `artifacts/migration.md` - Migration guide (if applicable)
- `logs/*.md` - Stage execution logs

---

## Level Selection Algorithm / 级别选择算法

```python
def determine_level(requirement):
    score = 0

    # File count scoring
    if files_affected <= 3:
        score += 0
    elif files_affected <= 15:
        score += 1
    else:
        score += 2

    # Module count scoring
    if modules_affected == 1:
        score += 0
    elif modules_affected <= 3:
        score += 1
    else:
        score += 2

    # Risk assessment
    if risk_level == 'low':
        score += 0
    elif risk_level == 'medium':
        score += 1
    else:
        score += 2

    # Breaking changes
    if has_breaking_changes:
        score += 2

    # External dependencies
    if external_deps == 0:
        score += 0
    elif external_deps <= 2:
        score += 1
    else:
        score += 2

    # Level determination
    if score <= 2:
        return 'L1'
    elif score <= 6:
        return 'L2'
    else:
        return 'L3'
```

## Level Override / 级别覆盖

Users can manually override the auto-selected level:

```yaml
# In workflow.yaml
level: L3 # Manual override
level_override_reason: "Requires compliance review"
```

**Override Scenarios:**

- Compliance requirements mandate full documentation
- Team policy requires formal review
- User prefers more structure
- Educational/demonstration purposes

## Level Escalation / 级别升级

During execution, workflow can be escalated to a higher level if:

- Unexpected complexity discovered
- Additional modules affected
- New risks identified
- Stakeholder requests formal documentation

```yaml
# In workflow.yaml
level: L2
escalated_from: L1
escalation_reason: "Discovered additional module dependencies"
escalated_at: "2024-01-15T10:30:00Z"
```

## Comparison Matrix / 对比矩阵

| Feature          | L1      | L2       | L3                  |
| ---------------- | ------- | -------- | ------------------- |
| Requirement spec | ❌      | ✅       | ✅ (detailed)       |
| Technical design | ❌      | ✅       | ✅ (comprehensive)  |
| Task breakdown   | ✅      | ✅       | ✅ (with estimates) |
| Quality gates    | Basic   | Standard | Full                |
| Final report     | ❌      | ✅       | ✅ (detailed)       |
| Stage hooks      | Limited | All      | All + Extended      |
| Skill injection  | Basic   | Full     | Full + Validation   |
| Rollback plan    | ❌      | Optional | Required            |
