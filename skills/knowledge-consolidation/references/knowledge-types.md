# Knowledge Types

KC owns four types — all **project-local**, write-once. For global / reusable types (architecture, pattern, api, reference), use [llm-wiki](../../llm-wiki/SKILL.md).

| Type | Use when | Required elements |
|---|---|---|
| `debug` | A bug specific to this codebase was diagnosed and fixed | symptom, investigation, root cause, fix, prevention |
| `config` | Non-obvious config / build / env setting was locked in | what was configured, why, how to validate |
| `workflow` | An ops or dev procedure was established for this repo | when to run, steps, tools used, gotchas |
| `lesson` | Post-mortem / retro / "I wish I'd known this earlier" | what happened, what we learned, recommendation |

## Type selection rule

If the knowledge spans multiple types (debug session that exposed a workflow gap), pick the **primary** type and mention the secondary insight in `Key Takeaways`.

If it's actually a reusable pattern / architecture decision, **don't pick a KC type** — write it as a wiki page via `llm-wiki` so other projects benefit.

## debug

| Element | Notes |
|---|---|
| Symptom | What was observed; how did it surface |
| Investigation | Steps tried, dead ends pruned (briefly) |
| Root cause | The actual cause — not a guess |
| Fix | What changed, with code excerpt if illustrative |
| Prevention | Lint rule? test? code-review checklist? |

## config

| Element | Notes |
|---|---|
| What | The setting, the value |
| Why | Why this value; what the alternatives were |
| Validate | How to confirm it's still doing the right thing |

## workflow

| Element | Notes |
|---|---|
| When | The trigger condition |
| Steps | Numbered, copy-paste-able |
| Tools | Versions matter — pin them |
| Gotchas | Things that go wrong if you skip a step |

## lesson

| Element | Notes |
|---|---|
| Context | What we were doing, what we expected |
| What happened | The surprise, in plain language |
| What we learned | The model that's now updated |
| Recommendation | What we'd do differently next time |
