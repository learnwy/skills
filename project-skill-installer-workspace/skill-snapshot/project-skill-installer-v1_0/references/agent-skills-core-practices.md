## Agent Skills Core Practices

Use this reference for generic skill standards that are not IDE-specific.

### Core Model

- A skill is a directory with required `SKILL.md`
- Optional resources include `scripts/`, `references/`, and `assets/`
- Use progressive disclosure: metadata discovery → full SKILL.md activation → on-demand resource loading

### SKILL.md Requirements

- YAML frontmatter must include `name` and `description`
- `name` should be lowercase with hyphens and match directory name
- `description` should cover both capability and trigger timing

### Authoring Guidance

- Keep responsibilities focused and avoid oversized multi-domain instructions
- Keep SKILL.md concise; move long details to `references/`
- Put deterministic operations in `scripts/` and reusable patterns in `examples/` or `assets/`

### Evaluation Guidance

- Validate skills with structured evals: prompt, expected output, optional files
- Compare with-skill versus baseline behavior to verify real value
- Iterate with measurable quality checks instead of ad-hoc impressions

### Runtime Web Fetch Policy

- If local references are insufficient, fetch official specification pages directly
- Prefer official docs first, then ecosystem examples
- Record the selected source links in output rationale

### Sources

- https://agentskills.io/home
- https://agentskills.io/what-are-skills
- https://agentskills.io/specification
- https://agentskills.io/skill-creation/evaluating-skills
- https://agentskills.io/skill-creation/using-scripts
- https://agentskills.io/client-implementation/adding-skills-support
