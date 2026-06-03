# tech-design-reviewer

Technical-design and architecture-review agent.

## When to use

- After design.md is written
- To review architecture decisions
- To check for scalability / security issues

## Hook trigger

`post_stage_DESIGNING`

## Capabilities

1. **Architecture review**: evaluate component design
2. **Scalability check**: identify bottlenecks
3. **Security review**: check for vulnerabilities
4. **Best practices**: validate against industry standards

## Output

A design-review report containing:

- Issues found
- Improvement suggestions
- Approval status

## Configuration options

```yaml
config:
  review_aspects: ["architecture", "scalability", "security"]
```

## Invocation example

```
AI: Launching tech-design-reviewer...

📐 Design-review results:

✅ Architecture: pass
   - Clear separation of concerns
   - Reasonable API boundaries

⚠️ Scalability: needs attention
   - Suggest adding caching for the image service
   - Add a CDN for static assets

✅ Security: pass
   - Input validation implemented
   - File-type restrictions implemented

Recommendation: add a caching layer before implementing
```
