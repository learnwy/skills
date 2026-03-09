## Trae Skill Best Practices

Load this reference only when runtime target is Trae or Trae-CN.

### Core Requirements

- Every skill must include `SKILL.md` as the required entry file
- Skills should be project-scoped when business rules are project-specific
- Keep skill responsibility focused; avoid oversized multi-domain skills

### Trigger and Structure Quality

- Define clear trigger conditions using **When / How / What** structure
- Keep metadata precise: `name` should be concise and unique, `description` should include trigger timing
- Prefer minimal necessary instructions to reduce context overhead and improve hit rate

### Resource Organization

- Use `references/` for standards, templates, and long-form guidance
- Use `examples/` for reusable I/O patterns
- Keep executable or deterministic operations in `scripts/`

### Iteration Practices

- Use failure-first and evaluation-driven iteration to refine skill quality
- Preserve stable project conventions during refactors instead of rewriting from scratch
- Prefer reusable patterns observed in high-value development skills

### Runtime Web Fetch Policy

- If local skill references are insufficient, fetch official Trae documentation before finalizing constraints
- Prefer official rules and skills pages first, then best-practice pages
- Keep fetched links in final rationale for traceability

### Sources

- https://docs.trae.ai/ide/skills?_lang=en
- https://docs.trae.ai/ide/best-practice-for-how-to-write-a-good-skill?_lang=en
- https://docs.trae.ai/ide/top-10-recommended-skills-for-development-scenarios?_lang=en
