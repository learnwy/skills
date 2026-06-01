# Phase: DEFINING

**Purpose:** translate the raw request into a structured spec with EARS acceptance criteria.

**Default agent:** `problem-definer` — Weinberg-style problem framing.
**Optional:** `iron-audit-pm` (PRD audit), `risk-auditor` (cost / policy / execution risk), `spec-by-example` (Adzic).

## Brief contents

`briefs/DEFINING.md` is auto-written when you advance into this phase. It contains:

- The original user request
- Detected risk keywords (auth / payment / crypto / PII / login / …)
- The EARS template the spec must follow
- Gate criteria (what `advance` will check)

Read it instead of re-asking the user for context.

## Producing spec.md

```markdown
# <Feature name>

## Background
<one short paragraph: the problem, not the solution>

## Scope
- In: <bullet list>
- Out: <bullet list>

## Acceptance Criteria
- [ ] When <trigger>, the system shall <response>
- [ ] While <state>, the system shall <behavior>
- [ ] Where <constraint>, the system shall <limit>

## Constraints
- <perf, security, compatibility>

## Out of Scope
- <explicit exclusions; write "None" if truly nothing>
```

## Gate criteria

`cli.cjs advance` blocks until:

- spec.md has **≥3 real EARS-format AC(s)** (placeholders like `<trigger>` don't count).
- `## Background` is non-empty.
- `## Out of Scope` section exists.

## Checkpoint

Always pause for user review before advancing. The DEFINING brief is the contract — get it agreed before planning tasks.

## Common pitfalls

- Writing the *solution* in Background (it should be the problem).
- ACs that aren't testable. EARS forces a trigger and response — keep it that way.
- Missing Out of Scope. "None" is a valid answer; absence is not.
