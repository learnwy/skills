# Complete Workflow: Creating a Skill (Problem-Driven)

End-to-end example of creating a skill by understanding user's problem.

## The Problem-First Approach

**Old way**: User says "I want a skill" → ask questions → generate

**New way**: User describes frustration → understand problem → analyze project → design → validate → generate

## Scenario

**User says**: "I keep writing the same React component boilerplate with TypeScript, styled-components, and tests. Every single time I create a Button or Card, I copy-paste from an old file and modify. It's so repetitive and I always miss something."

## Step 1: Problem Understanding

Instead of asking "What do you want to name the skill?", understand the problem:

```
Problem Analysis:
- Pattern: "I keep writing the same... every time"
- Type: Generator (creates code repeatedly)
- Input: component name, props type
- Output: complete component files (index.tsx, styles.ts, types.ts, test.tsx)
- Frequency: high (every new component)
```

## Step 2: Project Analysis

Run in parallel:
- Tech Stack: React + TypeScript + styled-components
- Conventions: PascalCase for components, functional components with hooks
- Existing: no similar skill

## Step 3: Design the Skill

Show user BEFORE generating:

```
I'll create a skill that:

Problem: You keep writing React component boilerplate manually
Solution: Auto-generate complete component files with styles and tests
Triggers: "new component", "create component", "generate component"
Files created: 
  - {name}/index.tsx (component)
  - {name}/styles.ts (styled-components)
  - {name}/types.ts (TypeScript interfaces)
  - {name}/test.tsx (basic test)

Is this correct? Should I adjust anything?
```

## Step 4: User Confirms

User says: "Yes, but I also want prop-types generated"

## Step 5: Generate Skill

```bash
mkdir -p .trae/skills/react-component-generator/{references,scripts,assets}
```

Write SKILL.md with user's confirmed requirements...

```
db-migration/
├── SKILL.md              # Core workflow
├── references/
│   ├── migration-types.md # Type-specific guidance
│   └── rollback.md       # Rollback procedures
├── scripts/
│   └── validate-migration.sh
└── assets/
    └── migration.sql.template
```

## Step 3: Create Skill Directory

```bash
mkdir -p skills/db-migration/{references,scripts,assets}
```

## Step 4: Write SKILL.md

```markdown
---
name: db-migration
description: "Manage database migrations safely. Use when creating, running, or rolling back database schema changes. Triggers on 'create migration', 'run migration', 'database migration', 'schema change', 'alter table'."
---

# Database Migration

Safely manage database schema changes.

## When to Use

**Invoke when:**

- Creating new migration files
- Running pending migrations
- Rolling back failed migrations
- Reviewing migration safety

**Do NOT invoke when:**

- Simple SELECT queries
- Application code changes without schema impact

## Workflow

\`\`\`
[Analyze schema change]
       ↓
[Determine migration type]
       ↓
[Generate migration file]
       ↓
[Validate with script]
       ↓
[Provide rollback plan]
\`\`\`

## Migration Types

| Type       | Risk  | Requires Rollback | Reference                              |
| ---------- | ----- | ----------------- | -------------------------------------- |
| Additive   | Low   | Optional          | [migration-types.md](references/migration-types.md#additive) |
| Modify     | Medium| Required          | [migration-types.md](references/migration-types.md#modify)   |
| Destructive| High  | Required          | [migration-types.md](references/migration-types.md#destructive) |

## Quick Reference

\`\`\`bash
# Validate migration
{skill_root}/scripts/validate-migration.sh <migration_file>
\`\`\`

## Best Practices

- Always create rollback script for modify/destructive
- Test on staging before production
- Use transactions when possible
- Document breaking changes

## References

- [Migration Types](references/migration-types.md) - Type-specific guidance
- [Rollback Procedures](references/rollback.md) - Recovery steps
```

## Step 5: Write References

### references/migration-types.md

```markdown
# Migration Types

## Additive

Safe changes that add without modifying existing structure.

**Examples:**

- ADD COLUMN with default
- CREATE TABLE
- CREATE INDEX

**Template:**

\`\`\`sql
-- Migration: add_user_email
ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT NULL;
\`\`\`

## Modify

Changes that alter existing structure.

**Examples:**

- ALTER COLUMN type
- RENAME COLUMN
- ADD NOT NULL constraint

**Requires:**

- Rollback script
- Data migration plan
- Downtime estimation

## Destructive

Changes that remove data or structure.

**Examples:**

- DROP COLUMN
- DROP TABLE
- TRUNCATE

**⚠️ CRITICAL:**

- Backup data before execution
- Rollback may not recover data
- Require explicit user confirmation
```

## Step 6: Create Validation Script

### scripts/validate-migration.sh

```bash
#!/bin/bash
# Validate migration file

MIGRATION_FILE="$1"

if [ -z "$MIGRATION_FILE" ]; then
  echo "Usage: validate-migration.sh <migration_file>"
  exit 1
fi

echo "Validating: $MIGRATION_FILE"

# Check for destructive operations
if grep -iE "(DROP|TRUNCATE|DELETE FROM)" "$MIGRATION_FILE"; then
  echo "⚠️  WARNING: Destructive operation detected"
  echo "   Ensure rollback plan exists"
fi

# Check for transactions
if ! grep -iE "BEGIN|START TRANSACTION" "$MIGRATION_FILE"; then
  echo "⚠️  WARNING: No transaction wrapper"
  echo "   Consider wrapping in transaction"
fi

echo "✅ Validation complete"
```

## Step 7: Test the Skill

Start new chat and try:

```
User: "I need to add an email column to the users table"
→ db-migration skill should trigger
→ AI provides migration with rollback plan
```

## Verification Checklist

- [ ] Description includes all trigger keywords
- [ ] "When to Use" section is clear
- [ ] "Do NOT invoke when" prevents false triggers
- [ ] References are linked from SKILL.md
- [ ] Scripts are executable and tested
- [ ] No README.md or extra documentation
