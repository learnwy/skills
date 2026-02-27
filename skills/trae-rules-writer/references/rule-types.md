# Rule Types Reference

Guide for selecting appropriate rule types based on project analysis.

## Analysis → Rule Type Mapping

| What You Find in Project        | Recommended Rule Type | Application Mode      |
| ------------------------------- | --------------------- | --------------------- |
| Consistent naming patterns      | Code Style            | Always Apply          |
| Specific framework usage        | Framework             | File-Specific (globs) |
| Clear layer boundaries          | Architecture          | Apply Intelligently   |
| Test file conventions           | Testing               | File-Specific (globs) |
| Security-sensitive code         | Security              | Always Apply          |
| Business domain patterns        | Domain                | Apply Intelligently   |

## Rule Categories by Project Aspect

### 1. Architecture Rules

**Analyze for:**

- Directory structure (src/, lib/, core/, infra/)
- Layer separation (UI, Domain, Data)
- Module boundaries
- Dependency direction

**Rule example:**

```markdown
---
description: Apply when designing modules or reviewing architecture
alwaysApply: false
---

# Architecture Guidelines

## Layer Boundaries
- UI → Domain → Data (unidirectional)
- Domain layer has no external dependencies
- Use dependency injection for cross-layer communication

## Module Structure
- One responsibility per module
- Explicit public interface via index.ts
```

### 2. Code Style Rules

**Analyze for:**

- Variable naming (camelCase, snake_case, PascalCase)
- File naming conventions
- Import organization
- Formatting preferences

**Rule example:**

```markdown
---
alwaysApply: true
---

# Code Style

## Naming Conventions
- Variables/functions: camelCase
- Classes/Types/Components: PascalCase
- Constants: UPPER_SNAKE_CASE
- Private fields: prefix with _

## Import Order
1. External packages
2. Internal modules (@/)
3. Relative imports (./)
```

### 3. Framework-Specific Rules

**Analyze for:**

- Framework version and patterns
- Component structure
- State management approach
- API patterns

**Rule example (React):**

```markdown
---
globs: *.tsx,*.jsx
alwaysApply: false
---

# React Patterns

## Components
- Functional components with hooks
- Extract logic to custom hooks when reused
- Use composition over prop drilling

## State
- Local state for UI-only concerns
- Context for cross-component state
- External store for global state
```

### 4. Testing Rules

**Analyze for:**

- Test file patterns (*.test.ts, *.spec.ts)
- Testing framework (Jest, Vitest, etc.)
- Test structure (describe/it, AAA pattern)
- Mock patterns

**Rule example:**

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
- Use dependency injection for testability
```

### 5. Security Rules

**Analyze for:**

- Authentication patterns
- Data validation
- Sensitive data handling
- API security

**Rule example:**

```markdown
---
alwaysApply: true
---

# Security Practices

## CRITICAL
- Never log sensitive data (passwords, tokens, PII)
- Always validate user input at entry points
- Use parameterized queries for database operations
- Sanitize output to prevent XSS
```

### 6. Domain Rules

**Analyze for:**

- Business entity names
- Workflow patterns
- Domain terminology
- Business constraints

**Rule example:**

```markdown
---
description: Apply when working with business logic or domain entities
alwaysApply: false
---

# Domain Guidelines

## Entity Naming
- User, Account, Transaction (not usr, acct, txn)
- Use domain terminology consistently

## Business Rules
- All monetary values in cents (integer)
- Dates in UTC, display in user timezone
```

## Application Mode Selection

```
┌─────────────────────────────────────────────────────────────────┐
│ Question: When should this rule apply?                          │
├─────────────────────────────────────────────────────────────────┤
│ Always, for all code?           → alwaysApply: true             │
│ Only for specific file types?   → globs: *.ts + alwaysApply: false │
│ When AI thinks it's relevant?   → description: "..." + alwaysApply: false │
│ Only when explicitly mentioned? → alwaysApply: false (no globs) │
└─────────────────────────────────────────────────────────────────┘
```

## Priority When Multiple Rules Apply

1. User Rules (global preferences)
2. Always Apply rules (project-wide)
3. File-Specific rules (when globs match)
4. Intelligent rules (when AI determines relevant)
5. Manual rules (`#RuleName` reference)
