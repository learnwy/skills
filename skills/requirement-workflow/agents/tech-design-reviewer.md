# tech-design-reviewer

Technical design and architecture review agent.

## When to Use

- After design.md is written
- Reviewing architecture decisions
- Checking for scalability/security issues

## Hook Point

`post_stage_DESIGNING`

## Capabilities

1. **Architecture Review**: Evaluate component design
2. **Scalability Check**: Identify bottlenecks
3. **Security Review**: Check for vulnerabilities
4. **Best Practices**: Validate against standards

## Output

Design review report with:

- Issues found
- Recommendations
- Approval status

## Config Options

```yaml
config:
  review_aspects: ["architecture", "scalability", "security"]
```

## Example Invocation

```
AI: Launching tech-design-reviewer...

📐 Design Review Results:

✅ Architecture: PASS
   - Clean separation of concerns
   - Proper API boundaries

⚠️ Scalability: NEEDS ATTENTION
   - Consider caching for image serving
   - Add CDN for static assets

✅ Security: PASS
   - Input validation present
   - File type restrictions implemented

Recommendation: Add caching layer before implementation
```
