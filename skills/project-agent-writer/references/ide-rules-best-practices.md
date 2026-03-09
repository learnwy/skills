## IDE Rules Best Practices

Use this reference when task target is project rules.

### Claude Code

- Project instructions: `./CLAUDE.md` or `./.claude/CLAUDE.md`
- Modular project rules: `./.claude/rules/*.md`
- Path-scoped rule files use YAML `paths` field
- Keep rules concise and avoid conflicting instructions

Source:
- https://docs.anthropic.com/en/docs/claude-code/memory

### Trae / Trae-CN

- Project rule files: `./.trae/rules/*.md`
- Rule frontmatter: `description`, `globs`, `alwaysApply`
- `globs` must be comma-separated without quotes
- Match activation mode to intent:
  - Always Apply → `alwaysApply: true`
  - Specific Files → `globs`
  - Intelligent Apply → `description`
  - Manual Apply → explicit rule mention in chat

Source:
- https://docs.trae.ai/ide/rules

### Routing Guidance

- If IDE is Claude Code, follow CLAUDE.md and `.claude/rules/` conventions
- If IDE is Trae or Trae-CN, follow `.trae/rules/*.md` conventions
- If IDE is ambiguous, prefer current project convention and explain the decision
