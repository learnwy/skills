# Advanced Skill Patterns

Patterns for creating project-specific skills based on analysis.

## Analysis → Skill Pattern Mapping

| What You Find in Project         | Recommended Skill Pattern    | Example                      |
| -------------------------------- | ---------------------------- | ---------------------------- |
| Multi-step workflows             | Workflow Automation          | Order processing, deployment |
| Complex business domain          | Domain Knowledge Injection   | Pricing rules, entity models |
| Repetitive code generation       | Template/Scaffold Generation | Component creation, API stubs|
| CLI tools with specific usage    | Tool Integration             | Database migration, testing  |
| Multiple variants (frameworks)   | Multi-Variant Selection      | Cloud providers, DB types    |

## Pattern 1: Workflow Automation Skills

**When to use:** Project has repetitive multi-step processes.

**Structure:**

```
workflow-skill/
├── SKILL.md (overview + stage flow)
├── references/
│   ├── stage-details.md
│   └── error-handling.md
└── scripts/
    └── validate.sh
```

**SKILL.md pattern:**

```markdown
## Workflow

\`\`\`
[Stage 1: Analyze]
       ↓
[Stage 2: Validate]
       ↓
[Stage 3: Execute]
       ↓
[Stage 4: Verify]
\`\`\`

## Stage Details

| Stage    | Input         | Output        | Reference                         |
| -------- | ------------- | ------------- | --------------------------------- |
| Analyze  | User request  | Requirements  | [details.md](references/stage-details.md#analyze) |
| Validate | Requirements  | Validation OK | [details.md](references/stage-details.md#validate) |
```

## Pattern 2: Domain Knowledge Skills

**When to use:** Project has complex business logic that AI needs to understand.

**Structure:**

```
domain-skill/
├── SKILL.md (domain overview)
└── references/
    ├── entities.md (entity models)
    ├── rules.md (business rules)
    └── terminology.md (domain vocabulary)
```

**SKILL.md pattern:**

```markdown
## Domain Model

| Entity      | Key Attributes        | Rules                           |
| ----------- | --------------------- | ------------------------------- |
| Order       | id, status, items     | [rules.md#order](references/rules.md#order) |
| Payment     | amount, method        | [rules.md#payment](references/rules.md#payment) |

## Terminology

- **SKU**: Stock Keeping Unit, unique product identifier
- **Fulfillment**: Process of preparing and shipping order

See [terminology.md](references/terminology.md) for complete glossary.
```

## Pattern 3: Multi-Variant Selection

**When to use:** Skill needs to support multiple frameworks/variants.

**Structure:**

```
multi-variant-skill/
├── SKILL.md (selection logic + quick start)
└── references/
    ├── variant-a.md
    ├── variant-b.md
    └── variant-c.md
```

**SKILL.md pattern:**

```markdown
## Variant Selection

| Variant | Use When                      | Reference                        |
| ------- | ----------------------------- | -------------------------------- |
| AWS     | Team uses AWS infrastructure  | [aws.md](references/aws.md)      |
| GCP     | Team uses GCP                 | [gcp.md](references/gcp.md)      |
| Azure   | Team uses Azure               | [azure.md](references/azure.md)  |

**Selection logic:**
1. Check existing infrastructure in project
2. Look for existing cloud config files
3. Ask user if unclear
```

## Pattern 4: Tool Integration Skills

**When to use:** Project uses CLI tools with specific patterns.

**Structure:**

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

**SKILL.md pattern:**

```markdown
## Command Reference

| Command | Purpose              | Reference                      |
| ------- | -------------------- | ------------------------------ |
| `init`  | Initialize           | [cmd-init.md](references/cmd-init.md) |
| `run`   | Execute              | [cmd-run.md](references/cmd-run.md)   |

## Quick Usage

\`\`\`bash
# Most common commands
tool init <name>
tool run <target>
\`\`\`
```

## Pattern 5: Template Generation Skills

**When to use:** Project needs standardized file generation.

**Structure:**

```
template-skill/
├── SKILL.md (generation rules)
└── assets/
    ├── component.tsx.template
    ├── test.tsx.template
    └── style.css.template
```

**SKILL.md pattern:**

```markdown
## Generation Rules

1. Analyze target location
2. Select appropriate template
3. Fill template with context
4. Create file at correct path

## Templates

| Type      | Template                          | Output Location        |
| --------- | --------------------------------- | ---------------------- |
| Component | [component.tsx](assets/component.tsx.template) | src/components/{name}/ |
| Test      | [test.tsx](assets/test.tsx.template) | src/components/{name}/__tests__/ |
```

## Project Analysis Checklist

Before creating any skill, analyze:

- [ ] What workflows are repetitive?
- [ ] What domain knowledge is project-specific?
- [ ] What tools does the project use?
- [ ] What conventions exist?
- [ ] What templates would help?
- [ ] What patterns exist in existing `.trae/skills/`?

## Anti-Patterns to Avoid

| Anti-Pattern                 | Problem                     | Solution                         |
| ---------------------------- | --------------------------- | -------------------------------- |
| Generic skills               | Don't match project         | Analyze project first            |
| Vague triggers               | Won't activate correctly    | Specific keywords in description |
| Everything in SKILL.md       | Token bloat                 | Split to references/             |
| Imposing new patterns        | Conflicts with project      | Match existing conventions       |
| README/docs files            | Not for AI                  | Delete these files               |
