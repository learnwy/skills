# mvp-freeze-architect

MVP scope definition and feature freezing agent.

## When to Use

- After PRD is refined
- Compressing scope into Minimum Shippable Loop
- Applying 3-state rule to features

## Hook Point

`post_stage_ANALYZING`

## Capabilities

1. **3-State Rule**: Each feature must be: Done / Not Started / Deleted
2. **Blacklist Check**: Reject features that break MVP
3. **Scope Freeze**: Lock V1 scope, defer everything else

## Output

MVP freeze spec with:

- V1 feature list (locked)
- Frozen/deferred features
- Risk-driven cuts

## Config Options

```yaml
config:
  freeze_mode: "v1_only"
  output: "mvp_scope"
```

## Example Invocation

```
AI: Launching mvp-freeze-architect to define MVP...

🧊 MVP Freeze Results:

V1 Scope (LOCKED):
┌────┬─────────────────────┬────────┐
│ #  │ Feature             │ Status │
├────┼─────────────────────┼────────┤
│ 1  │ File upload         │ ✅ V1  │
│ 2  │ Image preview       │ ✅ V1  │
│ 3  │ Save to profile     │ ✅ V1  │
└────┴─────────────────────┴────────┘

❄️ FROZEN (Not in V1):
- Image cropping
- Social sharing
- Avatar history

Estimated V1 Time: 4 hours
```
