# code-reviewer

Comprehensive code-review agent.

## When to use

- After implementation is complete
- Before the testing phase begins
- To check code quality and security

## Hook trigger

`post_stage_IMPLEMENTING`

## Capabilities

1. **Defect detection**: find potential bugs
2. **Security scan**: identify security vulnerabilities
3. **Code quality**: check style and complexity
4. **Best practices**: validate design patterns

## Output

A code-review report containing:

- Issues classified by severity
- Improvement suggestions
- Files reviewed

## Configuration options

```yaml
config:
  review_type: "comprehensive"
  check_security: true
```

## Invocation example

```
AI: Launching code-reviewer...

🔍 Code-review results:

Files reviewed: 5

❌ Critical (0)

⚠️ High (1):
- uploadHandler.ts:45 missing input validation

💡 Medium (2):
- Suggest extracting magic number (line 23)
- Function too long, suggest splitting (lines 78-120)

✅ Low (3):
- Minor naming improvements suggested

Overall: fix 1 issue before proceeding to testing
```
