## Trae Runtime Practices

Load this reference only when runtime target is Trae or Trae-CN.

### Project Scope Rules

- Trae and Trae-CN project marker: `{project_dir}/.trae/`
- Project rules should stay in `{project_dir}/.trae/rules/`
- Project skills should stay in project-managed skill directories
- Do not output global install targets for project workflows

### Trae Rules Guidance

- Prefer project rules for project constraints
- Match activation mode to task intent:
  - Always Apply → `alwaysApply: true`
  - Specific Files → `globs`
  - Intelligent Apply → `description`
  - Manual Apply → explicit rule mention

### Trae Skills Guidance

- Skill core file is `SKILL.md`
- Keep skill focused and reusable
- Keep extended standards in `references/` and deterministic actions in `scripts/`

### Runtime Web Fetch Policy

- If Trae details are ambiguous, fetch official Trae docs before finalizing output
- Prioritize rules, skills, skill best practices, and agent overview documents
- Use fetched evidence to justify any Trae-specific decisions

### Sources

- https://docs.trae.ai/ide/rules
- https://docs.trae.ai/ide/skills?_lang=en
- https://docs.trae.ai/ide/best-practice-for-how-to-write-a-good-skill?_lang=en
- https://docs.trae.ai/ide/top-10-recommended-skills-for-development-scenarios?_lang=en
- https://docs.trae.ai/ide/custom-agents-ready-for-one-click-import?_lang=en
- https://docs.trae.ai/ide/agent-overview?_lang=en
