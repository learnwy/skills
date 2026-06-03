# Advanced Skill Patterns

Patterns for creating project-specific skills based on analysis.

## Analysis → skill-pattern mapping

| Found in the project | Recommended skill pattern | Example |
| -------------- | ------------ | ---- |
| Multi-step workflow | Workflow automation | Order processing, deployment |
| Complex business domain | Domain-knowledge injection | Pricing rules, entity models |
| Repetitive code generation | Template/scaffold generation | Component creation, API stubs |
| CLI tool with specific usage | Tool integration | Database migration, testing |
| Multiple variants (frameworks) | Multi-variant selection | Cloud providers, database types |

## Pattern 1: Workflow automation skill

**When it applies**: the project has a repetitive multi-step process.

**Structure**:

```
workflow-skill/
├── SKILL.md (overview + stage flow)
├── references/
│   ├── stage-details.md
│   └── error-handling.md
└── scripts/
    └── validate.sh
```

**SKILL.md pattern**:

```markdown
## Workflow

\`\`\`
[Stage 1: Analyze]
       ↓
[Stage 2: Validate]
       ↓
[Stage 3: Execute]
       ↓
[Stage 4: Confirm]
\`\`\`

## Stage details

| Stage | Input | Output | Reference |
| ---- | ---- | ---- | ---- |
| Analyze | User request | Requirements | [details.md](references/stage-details.md#analyze) |
| Validate | Requirements | Validated | [details.md](references/stage-details.md#validate) |
```

## Pattern 2: Domain-knowledge skill

**When it applies**: the project has complex business logic the AI needs to understand.

**Structure**:

```
domain-skill/
├── SKILL.md (domain overview)
└── references/
    ├── entities.md (entity models)
    ├── rules.md (business rules)
    └── terminology.md (domain vocabulary)
```

**SKILL.md pattern**:

```markdown
## Domain model

| Entity | Key attributes | Rules |
| ---- | ------- | ---- |
| Order | id, status, items | [rules.md#order](references/rules.md#order) |
| Payment | amount, method | [rules.md#payment](references/rules.md#payment) |

## Glossary

- **SKU**: Stock Keeping Unit, a unique product identifier
- **Fulfillment**: the process of preparing and shipping orders

See [terminology.md](references/terminology.md) for the full glossary.
```

## Pattern 3: Multi-variant selection

**When it applies**: the skill needs to support multiple frameworks/variants.

**Structure**:

```
multi-variant-skill/
├── SKILL.md (selection logic + quickstart)
└── references/
    ├── variant-a.md
    ├── variant-b.md
    └── variant-c.md
```

**SKILL.md pattern**:

```markdown
## Variant selection

| Variant | When it applies | Reference |
| ---- | ------- | ---- |
| AWS | The team uses AWS infrastructure | [aws.md](references/aws.md) |
| GCP | The team uses GCP | [gcp.md](references/gcp.md) |
| Azure | The team uses Azure | [azure.md](references/azure.md) |

**Selection logic:**
1. Check the existing infrastructure in the project
2. Look for existing cloud config files
3. Ask the user when unsure
```

## Pattern 4: Tool-integration skill

**When it applies**: the project uses a CLI tool with specific patterns.

**Structure**:

```
tool-skill/
├── SKILL.md (overview + quick usage)
├── references/
│   ├── cmd-x.md
│   ├── cmd-y.md
│   └── cmd-z.md
└── scripts/
    └── wrapper.sh
```

**SKILL.md pattern**:

```markdown
## Command reference

| Command | Purpose | Reference |
| ---- | ---- | ---- |
| `init` | Initialize | [cmd-init.md](references/cmd-init.md) |
| `run` | Execute | [cmd-run.md](references/cmd-run.md) |

## Quick usage

\`\`\`bash
tool init <name>
tool run <target>
\`\`\`
```

## Pattern 5: Template-generation skill

**When it applies**: the project needs standardized file generation.

**Structure**:

```
template-skill/
├── SKILL.md (generation rules)
└── assets/
    ├── component.tsx.template
    ├── test.tsx.template
    └── style.css.template
```

**SKILL.md pattern**:

```markdown
## Generation rules

1. Analyze the target location
2. Select the appropriate template
3. Populate the template with context
4. Create files at the correct path

## Templates

| Type | Template | Output location |
| ---- | ---- | ------- |
| Component | [component.tsx](assets/component.tsx.template) | src/components/{name}/ |
| Test | [test.tsx](assets/test.tsx.template) | src/components/{name}/__tests__/ |
```

## Pattern 6: IDE Hooks integration

**When it applies**: the skill needs deterministic automation on IDE lifecycle events (auto-formatting, quality gates, context injection). Supports both Trae and Claude Code.

**Structure**:

```
hooks-skill/
├── SKILL.md (skill logic + hook registration)
├── scripts/
│   ├── session-init.cjs    (SessionStart handler)
│   ├── quality-gate.cjs    (Stop handler)
│   └── post-edit.cjs       (PostToolUse handler)
└── references/
    └── hooks-standard.md   (spec reference)
```

**Config format** (generated into `.trae/hooks.json` and `.claude/settings.json`):

```json
{
  "version": 1,
  "hooks": {
    "SessionStart": [{
      "hooks": [{ "type": "command", "command": "node .hooks/init.cjs", "timeout": 10 }]
    }],
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "node .hooks/format.cjs", "timeout": 10 }]
    }],
    "Stop": [{
      "loop_limit": 3,
      "hooks": [{ "type": "command", "command": "node .hooks/verify.cjs", "timeout": 30 }]
    }]
  }
}
```

**Key events:**

| Event | Matcher | Purpose |
|------|---------|------|
| `SessionStart` | — | Inject context, load project state |
| `UserPromptSubmit` | — | Enrich/block the user prompt |
| `PreToolUse` | tool regex | Block/modify tool calls |
| `PostToolUse` | tool regex | Auto-format, log changes |
| `Stop` | — | Quality gate before stopping (loop_limit prevents infinite loops) |

**I/O contract**: scripts receive JSON from stdin and output JSON to stdout. Exit 0 = allow, Exit 2 = block.

**Portability**: use only the `command` type. Check `$TRAE_PROJECT_DIR` or `$CLAUDE_PROJECT_DIR`.

## Project-analysis checklist

Before creating any skill, analyze:

- [ ] Which workflows are repetitive?
- [ ] What domain knowledge is project-specific?
- [ ] What tools does the project use?
- [ ] What conventions exist?
- [ ] What templates would help?
- [ ] What patterns exist in the current `.agents/skills/`?
- [ ] Should the skill register IDE hooks for deterministic automation?
