# Phase: DELIVERING

**Purpose:** final review against the original spec; produce a shippable summary.

**Default agent:** `tech-design-reviewer` — architecture review against the spec.
**Optional:** `code-reviewer`.

## Brief contents

`briefs/DELIVERING.md` includes:
- Counts of ACs / tasks / artifacts
- The original spec embedded for reference
- The required summary.md sections

## Producing summary.md

Required sections (the gate enforces these by name):

```markdown
# <Feature> — Delivery Summary

## What shipped
<one paragraph anchored to the original user request>

## Files changed
<bulleted, grouped by area>

## AC verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-01 | ✓ | tests/auth/login.test.ts:42 |
| AC-02 | ✓ | manual demo step 3 |

## Open issues
<explicit follow-ups; write "None" if truly nothing>

## How to demo
1. <command>
2. <action>
3. <expected outcome>
```

## Gate criteria

- summary.md exists with all five required sections.
- traceability.md shows every AC with `AC done: ✓`.
- No unmapped tasks remain.

## Checkpoint

Always pause for user review. This is the last gate before the workflow is closed.

## Common pitfalls

- Forgetting "Open issues: None" — the section must exist even if empty.
- AC verification table without evidence column — the audit trail dies here.
- Demo steps that assume hidden state — write them as if a fresh reviewer is running them.
