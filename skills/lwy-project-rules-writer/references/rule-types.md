# Rule Types Reference

A guide to picking the right rule type based on project analysis.

## Analysis → rule-type mapping

| Found in the project | Recommended rule type | Apply mode |
| -------------------- | --------------------- | ---------- |
| Consistent naming patterns | Code style | Always-apply |
| Specific framework usage | Framework | File-specific (globs) |
| Clear layering boundaries | Architecture | Smart-apply |
| Test-file conventions | Testing | File-specific (globs) |
| Security-sensitive code | Security | Always-apply |
| Business-domain patterns | Domain | Smart-apply |

## Rules by project aspect

### 1. Architecture rules

**What to analyse**:

- Directory structure (src/, lib/, core/, infra/)
- Layer isolation (UI, Domain, Data)
- Module boundaries
- Dependency direction

**Example rule**:

```markdown
---
description: Apply when designing modules or reviewing architecture
alwaysApply: false
---

# Architecture Guidelines

## Layer boundaries
- UI → Domain → Data (one-directional)
- The Domain layer has no external dependencies
- Use dependency injection for cross-layer communication

## Module structure
- One responsibility per module
- Expose a clear public interface via index.ts
```

### 2. Code-style rules

**What to analyse**:

- Variable naming (camelCase, snake_case, PascalCase)
- File-naming conventions
- Import organisation
- Formatting preferences

**Example rule**:

```markdown
---
alwaysApply: true
---

# Code Style

## Naming conventions
- Variables/functions: camelCase
- Classes/types/components: PascalCase
- Constants: UPPER_SNAKE_CASE
- Private fields: prefixed with _

## Import order
1. External packages
2. Internal modules (@/)
3. Relative imports (./)
```

### 3. Framework-specific rules

**What to analyse**:

- Framework version and patterns
- Component structure
- State-management approach
- API patterns

**Example rule (React)**:

```markdown
---
globs: *.tsx,*.jsx
alwaysApply: false
---

# React Patterns

## Components
- Function components using Hooks
- Extract reused logic into custom Hooks
- Prefer composition over prop drilling

## State
- Local state for UI-only concerns
- Context for cross-component state
- An external store for global state
```

### 4. Testing rules

**What to analyse**:

- Test-file patterns (*.test.ts, *.spec.ts)
- Test framework (Jest, Vitest, etc.)
- Test structure (describe/it, AAA pattern)
- Mocking patterns

**Example rule**:

```markdown
---
globs: *.test.ts,*.spec.ts,__tests__/**
alwaysApply: false
---

# Testing Guidelines

## Structure
- Follow AAA: Arrange, Act, Assert
- One assertion concept per test
- Descriptive test names

## Mocking
- Mock external dependencies only
- Reset mocks between tests
- Use dependency injection to improve testability
```

### 5. Security rules

**What to analyse**:

- Authentication patterns
- Data validation
- Sensitive-data handling
- API security

**Example rule**:

```markdown
---
alwaysApply: true
---

# Security Practices

## Critical
- Never log sensitive data (passwords, tokens, personal information)
- Always validate user input at entry points
- Use parameterised queries for database operations
- Sanitise output to prevent XSS
```

### 6. Domain rules

**What to analyse**:

- Business-entity names
- Workflow patterns
- Domain terminology
- Business constraints

**Example rule**:

```markdown
---
description: Apply when handling business logic or domain entities
alwaysApply: false
---

# Domain Guidelines

## Entity naming
- User, Account, Transaction (not usr, acct, txn)
- Use domain terminology consistently

## Business rules
- All amounts in cents (integers)
- Store dates as UTC, convert to the user's timezone for display
```

## Choosing the apply mode

```
┌─────────────────────────────────────────────────────────────────┐
│ Question: when should this rule apply?                            │
├─────────────────────────────────────────────────────────────────┤
│ Always, for all code?       → alwaysApply: true                   │
│ Only for specific file types? → globs: *.ts + alwaysApply: false  │
│ When the AI judges it relevant? → description: "..." + alwaysApply: false │
│ Only when explicitly mentioned? → alwaysApply: false (no globs)   │
└─────────────────────────────────────────────────────────────────┘
```

## Precedence when multiple rules apply at once

1. User rules (global preferences)
2. Always-apply rules (project-wide)
3. File-specific rules (when globs match)
4. Smart rules (when the AI judges them relevant)
5. Manual rules (`#RuleName` reference)
