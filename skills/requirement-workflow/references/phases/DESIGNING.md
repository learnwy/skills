# Phase: DESIGNING

**Purpose:** lock cross-cutting decisions (data flow, contracts, NFRs) before code starts.

**Default agent:** `architecture-advisor` — Bass/Clements quality-attribute thinking.
**Optional:** `domain-modeler` (DDD/Evans), `responsibility-modeler` (CRC, Wirfs-Brock).

## Brief contents

`briefs/DESIGNING.md` includes:
- Spec ACs and the planned tasks
- Detected project conventions (lint, test runner, language)
- The required design.md sections

## Producing design.md

Required sections (the gate enforces these by name):

```markdown
# Design — <feature name>

## Components
<modules, responsibilities, owners>

## Data Flow
<diagrams or numbered steps showing how info moves>

## API
<endpoints, request/response shapes, error modes>

## Trade-offs
<at least 2: option chosen, option rejected, why>

## Non-Functional Requirements
<perf budgets, error handling, observability, security>
```

## Gate criteria

- design.md exists and is non-empty.
- All five `##` sections above are present.

## Checkpoint

Always pause for user review. Design decisions are expensive to undo — get sign-off here, not after IMPLEMENTING starts.

## Common pitfalls

- Skipping Trade-offs (just listing what was chosen). The discarded option matters: it's the proof the chosen one is deliberate.
- NFRs as wishes ("should be fast"). Use numbers ("p95 < 200 ms").
- Design that contradicts spec — re-run the brief; if you need to change spec, escalate back to DEFINING.
