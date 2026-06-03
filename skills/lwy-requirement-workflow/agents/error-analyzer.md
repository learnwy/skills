# error-analyzer

Error analysis and fix-suggestion agent.

## When to use

- Whenever an error occurs in the workflow
- The problem needs to be diagnosed
- A fix needs to be suggested

## Hook trigger

`on_error`

## Capabilities

1. **Error diagnosis**: identify the root cause
2. **Fix suggestions**: propose solutions
3. **Prevention**: recommend safeguards

## Output

An error report containing:

- Error details
- Root cause
- Suggested fix

## Configuration options

```yaml
config:
  diagnose_root_cause: true
  suggest_fixes: true
```

## Invocation example

````
AI: Launching error-analyzer...

❌ Error analysis:

Error: TypeScript compilation failed
Location: src/upload.ts:45
Message: Property 'size' does not exist on type 'File'

Root cause:
- Missing Web API type import

Suggested fix:
```typescript
// Add at the top of the file
/// <reference lib="dom" />
````

Prevention:

- Add a tsconfig lib check in CI
- Update the project template

```

```
