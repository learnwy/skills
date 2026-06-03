## Agent Skills — Core Practices

Best practices for AI-assistable skills in the AI agent ecosystem.

### Skill Quality Metrics

| Metric | Good | Bad |
|------|-----|-----|
| Description | Includes trigger phrases, use cases, exclusions | Generic "does something" |
| SKILL.md | Structured sections, workflow, references | One big block of plain text |
| Triggers | Specific: "create react component" | Vague: "help me" |
| Scope | Explicit "does not handle" section | No scope limitation |
| Error handling | Explicit failure scenarios + solutions | Silent failure |

### Project-level vs Global Skills

| Aspect | Project-level | Global |
|------|--------|------|
| Path | `.agents/skills/` in the project root | `~/.trae/skills/`, `~/.claude/skills/`, etc. |
| Scope | This project only | All projects |
| Version control | Committed with the project | User-specific |
| Use case | Project-specific workflow | General-purpose tools |

**This installer handles project-level skills only.**

### Install Verification Checklist

Verify after installing a skill:

1. **Directory exists**: `<path>/<skill-name>/` has been created
2. **SKILL.md exists**: the main skill file is readable
3. **Description is valid**: includes trigger keywords
4. **No conflict**: does not overlap with an existing skill
5. **Dependencies satisfied**: referenced tools/libraries are available

### Skill Discovery Best Practices

1. **Search by problem, not by name** — "how to lint my code" rather than "eslint skill"
2. **Check local first** — an already-installed global skill may already fit
3. **Prefer specific over generic** — "react-component-generator" beats "code-generator"
4. **Read SKILL.md** — verify it actually meets the user's need
5. **Check compatibility** — does the language/framework match the project
