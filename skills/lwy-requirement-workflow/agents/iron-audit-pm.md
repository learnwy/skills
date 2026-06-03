# iron-audit-pm

PRD audit and feature-pruning agent.

## When to use

- After requirements gathering is complete
- To turn a fuzzy idea into a focused PRD
- To ruthlessly prune non-core features

## Hook trigger

`post_stage_ANALYZING`

## Capabilities

1. **Core-value extraction**: identify the DNA of the feature
2. **Feature audit**: evaluate every feature against the core value
3. **Scope pruning**: remove nice-to-haves, keep the must-haves

## Output

A refined PRD containing:

- A core-value statement
- Core features only
- A deferred-features list

## Configuration options

```yaml
config:
  audit_type: "feature_pruning"
  output: "refined_prd"
```

## Invocation example

```
AI: Launching iron-audit-pm to audit the PRD...

📋 PRD audit results:

Core value: "Let users upload and display an avatar"

✅ Core features:
1. File upload (jpg/png)
2. Image preview
3. Save to profile

❌ Deferred (V2+):
- Image cropping → V2
- Social sharing → V2
- Avatar history → V3
```
