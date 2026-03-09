## Trae Agent Best Practices

Load this reference only when runtime target is Trae or Trae-CN.

### Agent Capability Baseline

- Agents should support autonomous operation across multi-step tasks
- Agents should use available tools for search, edit, file creation, and terminal execution
- Agent tasks should be decomposed into clear sequential steps

### Role and Boundary Design

- Keep each agent single-purpose with explicit boundaries
- Document role, inputs, outputs, and non-goals
- Keep reusable agent prompts stable and avoid mixing unrelated responsibilities

### Integration Model

- Custom agents can be imported and reused as templates
- Agents can run independently or be orchestrated by higher-level builders
- Preserve project-specific conventions when adapting imported templates

### Trae Project Requirements

- Keep project agent outputs in project-managed `.trae` context
- Keep Trae-specific constraints explicit in project-level agent definitions

### Runtime Web Fetch Policy

- If local agent references are insufficient, fetch official Trae agent docs before finalizing agent constraints
- Prioritize agent overview and custom-agent import guidance for capability boundaries
- Keep fetched links in final rationale for traceability

### Sources

- https://docs.trae.ai/ide/agent-overview?_lang=en
- https://docs.trae.ai/ide/custom-agents-ready-for-one-click-import?_lang=en
