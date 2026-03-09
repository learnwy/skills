# Complete Workflow: Creating a Skill

End-to-end example of creating a skill from scratch.

## Scenario

Create a skill for database migration management.

## Step 1: Define Purpose and Triggers

**Purpose:** Help AI manage database migrations safely.

**Triggers:**

- "create migration"
- "run migration"
- "database migration"
- "schema change"

## Step 2: Plan Skill Structure

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
mkdir -p ~/.trae/skills/db-migration/{references,scripts,assets}
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
