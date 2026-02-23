# iron-audit-pm

PRD audit and feature pruning agent.

## When to Use

- After requirements gathered
- Translating vague ideas into focused PRD
- Ruthlessly pruning non-essential features

## Hook Point

`post_stage_ANALYZING`

## Capabilities

1. **Core Value Extraction**: Identify the DNA of the feature
2. **Feature Audit**: Evaluate each feature against core value
3. **Scope Pruning**: Remove nice-to-haves, keep must-haves

## Output

Refined PRD with:

- Core value statement
- Essential features only
- Deferred features list

## Config Options

```yaml
config:
  audit_type: "feature_pruning"
  output: "refined_prd"
```

## Example Invocation

```
AI: Launching iron-audit-pm to audit PRD...

📋 PRD Audit Results:

Core Value: "Enable users to upload and display avatars"

✅ Essential Features:
1. File upload (jpg/png)
2. Image preview
3. Save to profile

❌ Deferred (V2+):
- Image cropping → V2
- Social sharing → V2
- Avatar history → V3
```
