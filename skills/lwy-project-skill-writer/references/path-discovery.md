## Project skill path discovery

Use this reference **after** problem analysis and skill design. Load it when:
1. The skill is designed and you need to determine where to place it
2. The user has confirmed the skill design and you are ready to generate files

### Do not load this file first!

```
Correct flow:
1. Understand the user's problem
2. Analyze the project (tech stack, conventions, patterns)
3. Design the skill solution
4. Confirm with the user (show what will be created)
5. Only then: load path-discovery to determine the output location
```

### Output contract: `.agents/skills/`

All writer skills consistently place project-level artifacts under `.agents/` at the project root:

| Artifact | Path |
|------|------|
| Skill | `<project>/.agents/skills/<name>/SKILL.md` |
| Agent | `<project>/.agents/agents/<name>.md` |
| Rule | `<project>/.agents/rules/<name>.md` |

This is **decoupled** from the IDE's own `.trae/`, `.claude/`, `.cursor/` directories: those are written and managed by the IDE, and this repository's writer skills no longer write into them, to avoid conflicting with IDE-generated content.

### IDE marker detection (for context only, does not affect the output path)

We still scan the following markers, in order to understand which IDE / tool stack the project uses, so we can give closer examples in SKILL.md, agents/, references/:

| Marker | Runtime |
|------|--------|
| `{project_dir}/.trae/` | Trae (project-level) |
| `{project_dir}/.claude/` | Claude Code |
| `{project_dir}/.cursor/` | Cursor |
| `{project_dir}/.windsurf/` | Windsurf |
| `~/.trae/`, `~/.claude/`, `~/.cursor/` | User-level install |

Whichever is detected, **the output path is still `.agents/skills/`**.

### Discovery priority

When the user does not specify explicitly, resolve the output root in this order:

1. **User explicitly specified** — the user provided `--output-root` or indicated it in the conversation
2. **Existing `.agents/` directory** — the project root already has `.agents/skills/` → use it directly
3. **Existing IDE mirror** — when the project root has `.trae/skills/` or `.claude/skills/`, still create under `.agents/skills/` and tell the user "you can symlink to the IDE directory yourself if you want to sync"
4. **Default** — create `.agents/skills/` at the project root

If ambiguity remains, choose the most conservative writable path and report the reason.

### Validation rules

- The path must exist or be creatable within the project workspace
- The path must be writable
- The path choice must be reported in the final output
- **Never** use global paths like `~/.trae/skills`, `~/.claude/skills`, `~/.agents/skills`
- Reject absolute paths (such as `/Users/foo/bar`) — always use project-relative paths
