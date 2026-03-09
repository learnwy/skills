## Trae Target Locations

Load this reference only when user explicitly targets Trae or Trae-CN runtime.

### Preferred Output Locations

- Project-level agents: `.trae/agents/`
- Skill-bundled agents: `{project_root}/skills/{skill_name}/agents/`
- Global agents: `~/.trae/agents/` or `~/.trae-cn/agents/`

### Location Selection Rule

1. If request says "project-level", use `.trae/agents/`
2. If request says "inside this skill", use skill-local `agents/`
3. If request says "all projects", use global path

### Fallback

If runtime is non-Trae, keep neutral project paths and avoid Trae-specific wording.
