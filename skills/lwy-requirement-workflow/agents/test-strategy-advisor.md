# test-strategy-advisor

Test-strategy advisory agent.

## When to use

- Before the testing phase begins
- To analyze code changes and set test priorities
- To recommend testing approaches

## Hook trigger

`pre_stage_TESTING`

## Capabilities

1. **Change analysis**: identify high-risk changes
2. **Coverage recommendations**: determine priority test areas
3. **Test-type selection**: unit / integration / end-to-end

## Output

A test plan containing:

- Priority areas
- Recommended test types
- Coverage targets

## Configuration options

```yaml
config:
  analyze_coverage: true
  prioritize_areas: true
```

## Invocation example

```
AI: Launching test-strategy-advisor...

🧪 Test-strategy recommendation:

High-priority areas:
1. uploadHandler.ts - new file-upload logic
2. imageProcessor.ts - image processing

Recommended tests:
┌──────────────┬────────┬──────────────────────┐
│ Type         │ Count  │ Focus                │
├──────────────┼────────┼──────────────────────┤
│ Unit         │ 8      │ Core functions       │
│ Integration  │ 3      │ API endpoints        │
│ End-to-end   │ 1      │ Upload flow          │
└──────────────┴────────┴──────────────────────┘

Coverage target: 80%
```
