# error-analyzer

Error analysis and fix suggestion agent.

## When to Use

- Any error occurs during workflow
- Need to diagnose issues
- Suggest fixes

## Hook Point

`on_error`

## Capabilities

1. **Error Diagnosis**: Identify root cause
2. **Fix Suggestions**: Propose solutions
3. **Prevention**: Recommend safeguards

## Output

Error report with:

- Error details
- Root cause
- Suggested fixes

## Config Options

```yaml
config:
  diagnose_root_cause: true
  suggest_fixes: true
```

## Example Invocation

````
AI: Launching error-analyzer...

❌ Error Analysis:

Error: TypeScript compilation failed
Location: src/upload.ts:45
Message: Property 'size' does not exist on type 'File'

Root Cause:
- Missing type import from web API

Suggested Fix:
```typescript
// Add at top of file
/// <reference lib="dom" />
````

Prevention:

- Add tsconfig lib check to CI
- Update project template

```

```
