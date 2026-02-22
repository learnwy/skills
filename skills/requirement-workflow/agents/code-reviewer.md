# code-reviewer

Comprehensive code review agent.

## When to Use

- After implementation complete
- Before testing phase
- Checking code quality and security

## Hook Point

`post_stage_IMPLEMENTING`

## Capabilities

1. **Bug Detection**: Find potential bugs
2. **Security Scan**: Identify vulnerabilities
3. **Code Quality**: Check style, complexity
4. **Best Practices**: Validate patterns

## Output

Code review report with:
- Issues by severity
- Suggestions
- Files reviewed

## Config Options

```yaml
config:
  review_type: "comprehensive"
  check_security: true
```

## Example Invocation

```
AI: Launching code-reviewer...

🔍 Code Review Results:

Files Reviewed: 5

❌ Critical (0)

⚠️ High (1):
- Missing input validation in uploadHandler.ts:45

💡 Medium (2):
- Consider extracting magic numbers (line 23)
- Function too long, suggest splitting (line 78-120)

✅ Low (3):
- Minor naming improvements suggested

Overall: Ready for testing with 1 fix required
```
