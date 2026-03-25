## Agent Skills — Core Practices

Best practices for AI-assistable skills in the agent ecosystem.

### Skill Quality Indicators

| Indicator | Good | Bad |
|-----------|------|-----|
| Description | Includes trigger phrases, use cases, exclusions | Generic "does stuff" |
| SKILL.md | Structured with sections, workflow, references | Flat text blob |
| Triggers | Specific: "create react component" | Vague: "help me" |
| Boundary | Clear "Do NOT" section | No scope limits |
| Error handling | Explicit failure modes + solutions | Silent failures |

### Project-Level vs Global Skills

| Aspect | Project-Level | Global |
|--------|--------------|--------|
| Path | `.trae/skills/` in project root | `~/.trae/skills/` |
| Scope | This project only | All projects |
| Version control | Committed with project | User-specific |
| Use case | Project-specific workflows | General-purpose utilities |

**This installer ONLY handles project-level skills.**

### Installation Verification Checklist

After installing a skill, verify:

1. **Directory exists**: `<path>/<skill-name>/` is created
2. **SKILL.md present**: Main skill file is readable
3. **Description valid**: Contains trigger keywords
4. **No conflicts**: Doesn't overlap with existing skills
5. **Dependencies met**: Referenced tools/libs are available

### Skill Discovery Best Practices

1. **Search by problem, not by name** — "how to lint my code" not "eslint skill"
2. **Check local first** — already-installed global skills may work
3. **Prefer specific over generic** — "react-component-generator" over "code-generator"
4. **Read the SKILL.md** — verify it actually does what the user needs
5. **Check compatibility** — language/framework match with project
