# mvp-freeze-architect

MVP scope-definition and feature-freeze agent.

## When to use

- After the PRD has been refined
- To compress scope into the smallest deliverable loop
- To apply the three-state rule to features

## Hook trigger

`post_stage_ANALYZING`

## Capabilities

1. **Three-state rule**: every feature must be either done / not-started / deleted
2. **Blacklist check**: reject features that break the MVP
3. **Scope freeze**: lock the V1 scope, defer everything else

## Output

An MVP-freeze spec containing:

- V1 feature list (locked)
- Frozen / deferred features
- Risk-driven cuts

## Configuration options

```yaml
config:
  freeze_mode: "v1_only"
  output: "mvp_scope"
```

## Invocation example

```
AI: Launching mvp-freeze-architect to define the MVP...

🧊 MVP-freeze results:

V1 scope (locked):
┌────┬─────────────────────┬────────┐
│ #  │ Feature             │ Status │
├────┼─────────────────────┼────────┤
│ 1  │ File upload         │ ✅ V1  │
│ 2  │ Image preview       │ ✅ V1  │
│ 3  │ Save to profile     │ ✅ V1  │
└────┴─────────────────────┴────────┘

❄️ Frozen (not in V1):
- Image cropping
- Social sharing
- Avatar history

Estimated V1 time: 4 hours
```
