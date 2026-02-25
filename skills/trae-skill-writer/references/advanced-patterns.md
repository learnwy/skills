# Advanced Skill Patterns

Reference for complex skill design patterns. Load when creating sophisticated skills with multiple variants or workflows.

## Pattern 1: Multi-Variant Skills

For skills supporting multiple frameworks/options, keep selection logic in SKILL.md and variant details in references:

```
cloud-deploy/
├── SKILL.md (workflow + provider selection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

## Pattern 2: Domain-Specific Organization

```
analytics-skill/
├── SKILL.md (overview + navigation)
└── references/
    ├── finance.md (revenue, billing)
    ├── sales.md (opportunities, pipeline)
    └── product.md (usage, features)
```

## Pattern 3: Conditional Details

```markdown
# DOCX Processing

## Basic
Use docx-js for new documents.

## Advanced
**Tracked changes**: See [REDLINING.md](REDLINING.md)
**OOXML details**: See [OOXML.md](OOXML.md)
```

## Freedom Levels

Match specificity to task fragility:

| Freedom | When to Use | Format |
|---------|-------------|--------|
| High | Multiple valid approaches | Text instructions |
| Medium | Preferred pattern exists | Pseudocode/params |
| Low | Fragile/critical ops | Specific scripts |

## Resource Types

### scripts/
- Deterministic, reusable code
- Tested and validated
- Run without loading to context

### references/
- Domain knowledge, schemas
- Loaded when needed
- Keep >10k words with grep patterns

### assets/
- Output resources (templates, images)
- Not loaded to context
- Used in final output
