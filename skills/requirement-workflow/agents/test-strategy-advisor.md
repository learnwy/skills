# test-strategy-advisor

Test strategy recommendation agent.

## When to Use

- Before testing phase
- Analyzing code changes for test priority
- Recommending test approach

## Hook Point

`pre_stage_TESTING`

## Capabilities

1. **Change Analysis**: Identify high-risk changes
2. **Coverage Recommendation**: Prioritize test areas
3. **Test Type Selection**: Unit/integration/e2e

## Output

Test plan with:
- Priority areas
- Recommended test types
- Coverage targets

## Config Options

```yaml
config:
  analyze_coverage: true
  prioritize_areas: true
```

## Example Invocation

```
AI: Launching test-strategy-advisor...

🧪 Test Strategy Recommendations:

High Priority Areas:
1. uploadHandler.ts - New file upload logic
2. imageProcessor.ts - Image manipulation

Recommended Tests:
┌──────────────┬────────┬──────────────────────┐
│ Type         │ Count  │ Focus                │
├──────────────┼────────┼──────────────────────┤
│ Unit         │ 8      │ Core functions       │
│ Integration  │ 3      │ API endpoints        │
│ E2E          │ 1      │ Upload flow          │
└──────────────┴────────┴──────────────────────┘

Coverage Target: 80%
```
