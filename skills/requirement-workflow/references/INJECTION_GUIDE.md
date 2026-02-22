# Skill & Agent Injection Guide

How to inject custom skills and agents at workflow stages.

## Overview

The requirement-workflow supports **3-level injection** for both **skills** (prompt-based) and **agents** (autonomous sub-agents). Injected items are automatically displayed when transitioning stages.

```
advance-stage.sh → DESIGNING
         │
         ▼
"🤖 Injected Agents for DESIGNING:
   📤 After stage: tech-design-reviewer

🔌 Injected Skills for DESIGNING:
   📥 Before stage: tech-design-writer"
```

### Agents vs Skills

| Type | Purpose | Examples |
|------|---------|----------|
| **Agent** | Autonomous complex tasks | risk-auditor, code-reviewer, mvp-freeze-architect |
| **Skill** | Prompt-based context/templates | prd-writer, lint-checker |

## Configuration Levels

| Level | Config File | Scope | Best For |
|-------|-------------|-------|----------|
| **Global** | `{skill_dir}/hooks.yaml` | All projects | PRD writer, tech design writer |
| **Project** | `{root}/.trae/workflow/hooks.yaml` | This project | Project-specific reviewers |
| **Workflow** | `{workflow}/workflow.yaml` | This workflow | One-time requirements |

**Resolution Order:** workflow > project > global (higher priority wins)

## Quick Setup

### Default Agents (Pre-configured in hooks.yaml)

The workflow comes with pre-configured agents:

| Hook | Agent | Purpose |
|------|-------|---------|
| `pre_stage_ANALYZING` | risk-auditor | PRD risk assessment |
| `post_stage_ANALYZING` | iron-audit-pm | PRD audit |
| `post_stage_ANALYZING` | mvp-freeze-architect | MVP scope freeze |
| `post_stage_DESIGNING` | tech-design-reviewer | Design review |
| `post_stage_IMPLEMENTING` | code-reviewer | Code review |
| `pre_stage_TESTING` | test-strategy-advisor | Test strategy |
| `on_blocked` | blocker-resolver | Resolve blockers |
| `on_error` | error-analyzer | Analyze errors |

### Add Custom Agents

```bash
./scripts/inject-agent.sh -r /project --scope global \
  --hook post_stage_DESIGNING --agent my-custom-reviewer
```

### Add Custom Skills

```bash
# Document generation
./scripts/inject-skill.sh -r /project --scope global \
  --hook pre_stage_ANALYZING --skill prd-writer

./scripts/inject-skill.sh -r /project --scope global \
  --hook pre_stage_DESIGNING --skill tech-design-writer

# Quality gates
./scripts/inject-skill.sh -r /project --scope global \
  --hook quality_gate --skill lint-checker --required

./scripts/inject-skill.sh -r /project --scope global \
  --hook quality_gate --skill type-checker --required
```

### Project-Level Configuration

```bash
# Project-specific security scanner
./scripts/inject-skill.sh -r /project --scope project \
  --hook pre_delivery --skill security-scanner --required
```

### Workflow-Level Configuration

```bash
# One-time special requirement
./scripts/inject-skill.sh -r /project --scope workflow \
  --hook post_stage_TESTING --skill performance-analyzer
```

## Available Hooks

### Stage Hooks

| Hook | Trigger | Typical Skills |
|------|---------|----------------|
| `pre_stage_{STAGE}` | Before entering stage | prd-writer, tech-design-writer |
| `post_stage_{STAGE}` | After completing stage | code-reviewer, doc-generator |

**Available stages:** ANALYZING, PLANNING, DESIGNING, IMPLEMENTING, TESTING, DELIVERING

### Global Hooks

| Hook | Trigger | Typical Skills |
|------|---------|----------------|
| `quality_gate` | Before quality checks | lint-checker, type-checker, security-scanner |
| `pre_delivery` | Before final delivery | compliance-checker, final-reviewer |
| `on_blocked` | When workflow blocked | blocker-analyzer |
| `on_error` | On any error | error-reporter |

## Injection Commands

### Add Skill

```bash
./scripts/inject-skill.sh -r <root> \
  --scope <global|project|workflow> \
  --hook <hook_name> \
  --skill <skill_name> \
  [--required] \
  [--order <number>] \
  [--config '<json>']
```

| Option | Description |
|--------|-------------|
| `--scope` | Configuration level |
| `--hook` | Hook point name |
| `--skill` | Skill name to invoke |
| `--required` | Block workflow on skill failure |
| `--order` | Execution order (lower = earlier) |
| `--config` | JSON config passed to skill |

### List Injected Skills

```bash
# List all levels
./scripts/inject-skill.sh -r /project --list

# List specific scope
./scripts/inject-skill.sh -r /project --list-scope global
./scripts/inject-skill.sh -r /project --list-scope project
./scripts/inject-skill.sh -r /project --list-scope workflow
```

### Query Hooks

```bash
# Get all skills for a stage
./scripts/get-hooks.sh -r /project --stage DESIGNING

# Get specific hook
./scripts/get-hooks.sh -r /project --hook quality_gate

# Get skill names only
./scripts/get-hooks.sh -r /project --hook pre_stage_ANALYZING --format skills-only
```

## Workflow Execution

### How AI Should Handle Injected Items

When `advance-stage.sh` outputs injected agents/skills, AI **MUST**:

1. **Pre-stage agents/skills**: Launch/invoke BEFORE starting stage work
2. **Stage work**: Complete the stage's main objectives
3. **Post-stage agents/skills**: Launch/invoke AFTER completing stage work
4. **Quality gate**: Invoke before moving to next stage

### Example Flow

```
User: "Add user authentication"

AI: ./scripts/init-workflow.sh -r /project -n "user-auth" -t feature

AI: ./scripts/advance-stage.sh -r /project
Output:
  ✅ Successfully transitioned to ANALYZING
  🔌 Injected Skills:
     📥 Before stage (pre_stage_ANALYZING):
        → Invoke skill: prd-writer

AI: [Invokes prd-writer skill to generate PRD]
AI: [Completes ANALYZING stage work]

AI: ./scripts/advance-stage.sh -r /project
Output:
  ✅ Successfully transitioned to PLANNING
  ...

AI: ./scripts/advance-stage.sh -r /project
Output:
  ✅ Successfully transitioned to DESIGNING
  🔌 Injected Skills:
     📥 Before stage (pre_stage_DESIGNING):
        → Invoke skill: tech-design-writer

AI: [Invokes tech-design-writer skill to generate design.md]
...
```

## Configuration File Format

### hooks.yaml (Global/Project)

```yaml
# Skill Hooks Configuration
hooks:
  pre_stage_ANALYZING:
    - skill: "prd-writer"
      required: false
      order: 0
      added_at: "2024-01-15T10:30:00Z"
  
  pre_stage_DESIGNING:
    - skill: "tech-design-writer"
      required: false
      order: 0
      added_at: "2024-01-15T10:30:00Z"
  
  quality_gate:
    - skill: "lint-checker"
      required: true
      order: 1
      added_at: "2024-01-15T10:30:00Z"
    - skill: "type-checker"
      required: true
      order: 2
      added_at: "2024-01-15T10:30:00Z"
```

### workflow.yaml (Workflow-level)

```yaml
name: "user-auth"
type: feature
level: L2
status: DESIGNING
# ... other fields ...

hooks:
  post_stage_IMPLEMENTING:
    - skill: "special-reviewer"
      required: false
      order: 0
      added_at: "2024-01-15T10:30:00Z"
```

## Best Practices

### DO

1. **Use global for standard skills** - PRD writer, tech design writer should be global
2. **Mark critical skills as required** - lint-checker, type-checker should block on failure
3. **Use order for dependencies** - Ensure lint runs before type check
4. **Keep skills focused** - Each skill does one thing well

### DON'T

1. **Over-inject at workflow level** - Use project/global for repeating patterns
2. **Make everything required** - Only block for critical checks
3. **Ignore skill output** - Skills provide valuable feedback
4. **Skip injected skills** - AI MUST invoke them when listed

## Troubleshooting

### Skill Not Showing

```bash
# Check if skill is registered
./scripts/inject-skill.sh -r /project --list

# Check specific hook
./scripts/get-hooks.sh -r /project --hook pre_stage_DESIGNING
```

### Wrong Order

```bash
# Re-inject with correct order
./scripts/inject-skill.sh -r /project --scope global \
  --hook quality_gate --skill lint-checker --order 1

./scripts/inject-skill.sh -r /project --scope global \
  --hook quality_gate --skill type-checker --order 2
```

### Config File Location

```
Global:   {skill_dir}/hooks.yaml
Project:  {root}/.trae/workflow/hooks.yaml
Workflow: {workflow_dir}/workflow.yaml
```
