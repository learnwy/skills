---
name: "requirement-workflow"
description: "State-machine driven orchestrator for structured software development. Supports skill/agent injection at each stage. Triggers: 'build a feature', 'fix this bug', 'implement', 'develop', 'refactor'."
---

# Requirement Workflow Orchestrator

State-machine driven development workflow with **agent/skill injection** support.

## When to Use

**Invoke when:**
- Feature development: "build a user authentication system"
- Bug fixes: "fix the login issue"
- Refactoring: "refactor this module"
- Keywords: `feature`, `bugfix`, `refactor`, `implement`, `develop`

**Do NOT invoke when:**
- Simple Q&A or code explanations
- Single-line changes
- User declines: "just fix it, no workflow"

## Execution Steps

### Step 1: Analyze & Select Level

```
📊 Quick Analysis:
- Type: feature | bugfix | refactor | hotfix
- Scope: Files/modules affected
- Complexity: L1 (simple) | L2 (standard) | L3 (complex)
```

| Level | Condition | Doc Depth |
|-------|-----------|-----------|
| **L1** | Clear scope, ≤3 files, quick fix | Brief PRD + simple design |
| **L2** | Standard feature, 4-15 files | Full PRD + detailed design |
| **L3** | Security/cross-module/breaking | Comprehensive + compliance |

### Step 2: Initialize

```bash
./scripts/init-workflow.sh -r <project_root> -n <name> -t <type> -l <level>
```

### Step 3: Execute Each Stage

**ALL levels require PRD and technical design**, depth varies by level.

```
┌─────────────────────────────────────────────────────────────────────┐
│ ANALYZING → spec.md (PRD)                                          │
│   - Clarify requirements, scope, acceptance criteria               │
│   - L1: Brief (1-2 paragraphs) | L2: Standard | L3: Comprehensive  │
├─────────────────────────────────────────────────────────────────────┤
│ PLANNING → tasks.md                                                │
│   - Break down into tasks, estimate effort                         │
│   - L1: 3-5 tasks | L2: 5-15 tasks | L3: Full breakdown            │
├─────────────────────────────────────────────────────────────────────┤
│ DESIGNING → design.md (Technical Design)                           │
│   - Architecture, API design, data model                           │
│   - L1: Key decisions only | L2: Full design | L3: + security      │
├─────────────────────────────────────────────────────────────────────┤
│ IMPLEMENTING → Code                                                │
│   - Write code following design                                    │
│   - All levels: Quality code with proper structure                 │
├─────────────────────────────────────────────────────────────────────┤
│ TESTING → checklist.md                                             │
│   - Verify against acceptance criteria                             │
│   - L1: Basic tests | L2: Full coverage | L3: + security tests     │
├─────────────────────────────────────────────────────────────────────┤
│ DELIVERING → report.md                                             │
│   - Summary, what changed, how to verify                           │
│   - All levels: Clear delivery summary                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 4: Stage Loop Pattern

```
For each stage:
  1. ./scripts/advance-stage.sh -r <root>
  2. Check output for injected agents/skills
  3. Launch pre_stage agents → Do stage work → Launch post_stage agents
  4. Complete stage document
  5. Repeat until DONE
```

**Output Example:**
```
✅ Successfully transitioned to DESIGNING

🤖 Injected Agents for DESIGNING:
  📤 After stage: tech-design-reviewer

📝 Next: Write design.md with architecture and API design
```

**AI MUST:**
- Launch listed agents at indicated timing
- Complete stage document before advancing
- Follow document depth for selected level

## Scripts

| Script | Purpose |
|--------|---------|
| `init-workflow.sh` | Initialize workflow |
| `get-status.sh` | Check status |
| `advance-stage.sh` | Advance stage |
| `inject-agent.sh` | Manage agents |
| `inject-skill.sh` | Manage skills |
| `generate-report.sh` | Generate report |

## Stage Documents

| Stage | Output |
|-------|--------|
| ANALYZING | `spec.md` |
| PLANNING | `tasks.md` |
| DESIGNING | `design.md` |
| IMPLEMENTING | Code |
| TESTING | `checklist.md` |
| DELIVERING | `report.md` |

## References

- [Agents](agents/AGENTS.md) - Available agents
- [L1 Workflow](references/WORKFLOW_L1.md)
- [L2 Workflow](references/WORKFLOW_L2.md)
- [L3 Workflow](references/WORKFLOW_L3.md)
- [Level Selection](references/LEVEL_SELECTION.md)
- [State Machine](references/STATE_MACHINE.md)
- [Injection Guide](references/INJECTION_GUIDE.md)
- [Usage Examples](examples/USAGE.md)
