# Quick Reference — Requirement Workflow (SDD)

## Mode Selection

```
Is it a bugfix AND tiny/small?  →  Agent Mode (fast path)
Is it medium+ OR elevated+ risk? →  Spec Mode (full SDD)
Not sure?                        →  Default to Agent Mode, upgrade if scope grows
```

## Stage Flow

```
Agent Mode:  INIT → IMPLEMENTING → TESTING → DONE
Spec Mode:   INIT → DEFINING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

## Classification Quick Table

| Keywords | Type | Default Size | Default Risk |
|----------|------|-------------|-------------|
| fix, bug, broken, crash, error | bugfix | small | normal |
| add, create, implement, build, feature | feature | small | normal |
| refactor, clean, reorganize, simplify | refactor | small | normal |
| upgrade, migrate, tech-debt, deprecate | tech-debt | medium | elevated |
| auth, payment, security, PII, encrypt | any | any | critical |

## SDD Artifact Templates

### spec.md (EARS format)

```
When <condition>, the system shall <response>
While <state>, the system shall <behavior>
Where <constraint>, the system shall <limit>
```

### tasks.md (Phase-based)

```
## Phase 1: Foundation
- [ ] Task 1.1 [files: x]
## Phase 2: Core
- [ ] Task 2.1 [files: y]
```

### checklist.md

```
- [ ] Implementation complete
- [ ] Lint clean
- [ ] Type check pass
- [ ] Tests pass
- [ ] Acceptance criteria verified
```

## Checkpoint Decision

| Stage | Pause When |
|-------|-----------|
| DEFINING | risk ≥ elevated |
| PLANNING | size = large OR risk ≥ elevated |
| DESIGNING | size ≥ medium OR risk ≥ elevated |
| TESTING | always |

## Script Commands

```bash
node init.cjs -r . -n "name" -t feature -s medium -k normal
node advance.cjs -r .
node status.cjs -r .
node hooks.cjs -r . list
```

## Agent Quick Lookup

| Need | Agent |
|------|-------|
| Audit a PRD | iron-audit-pm |
| Define the real problem | problem-definer |
| Scan for risks | risk-auditor |
| Map user stories | story-mapper |
| Freeze MVP scope | mvp-freeze-architect |
| Model domain entities | domain-modeler |
| Architecture quality | architecture-advisor |
| TDD guidance | tdd-coach |
| Test strategy | test-strategist |
| Code review | code-reviewer |
| Design review | tech-design-reviewer |
| Resolve blockers | blocker-resolver |
