# Rule Types Reference

## Type Selection Guide

| Category     | Rule Type         | When to Use                                     |
| ------------ | ----------------- | ----------------------------------------------- |
| Code Style   | Always Apply      | Enforced across all code                        |
| Framework    | File-Specific     | Only for specific file types                    |
| Architecture | Intelligent       | Context-dependent decisions                     |
| Security     | Always Apply      | Critical constraints                            |
| Testing      | File-Specific     | Test files only                                 |
| Documentation| Intelligent       | When writing docs                               |

## Rule Categories

### Code Style Rules

Enforce consistent coding patterns across the project.

**Key elements:**

- Naming conventions (camelCase, PascalCase, snake_case)
- Indentation and formatting
- Import organization
- Comment style

**Example:**

```markdown
---
alwaysApply: true
---

# Code Style

## Naming
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Classes/Types: PascalCase
- Private: prefix with `_`

## Formatting
- 2 spaces indentation
- Max line length: 100
- Trailing commas in multiline
```

### Framework Rules

Framework-specific guidelines and patterns.

**Key elements:**

- Framework version constraints
- Preferred patterns (hooks, composition)
- Anti-patterns to avoid
- Import preferences

**Example:**

```markdown
---
globs: "*.tsx,*.jsx"
alwaysApply: false
---

# React Guidelines

## Patterns
- Prefer functional components with hooks
- Use composition over inheritance
- Extract logic to custom hooks

## Anti-patterns
- Avoid prop drilling beyond 2 levels
- No inline styles for reusable components
```

### Architecture Rules

System design and module organization.

**Key elements:**

- Layer boundaries
- Dependency direction
- Module responsibilities
- Communication patterns

**Example:**

```markdown
---
description: Apply when designing new modules or refactoring architecture
alwaysApply: false
---

# Architecture Guidelines

## Layers
- UI → Domain → Data (unidirectional)
- Domain layer has no external dependencies

## Modules
- One responsibility per module
- Explicit public interface (index.ts)
```

### Security Rules

Security constraints and practices.

**Key elements:**

- Input validation
- Authentication/Authorization
- Data handling
- API security

**Example:**

```markdown
---
alwaysApply: true
---

# Security Rules

## CRITICAL
- Never log sensitive data (passwords, tokens, PII)
- Always validate user input
- Use parameterized queries (no string concatenation)
- Escape output for XSS prevention
```

### Testing Rules

Testing practices and patterns.

**Key elements:**

- Test structure (AAA pattern)
- Coverage requirements
- Mock strategies
- Test naming

**Example:**

```markdown
---
globs: "*.test.ts,*.spec.ts,__tests__/**"
alwaysApply: false
---

# Testing Guidelines

## Structure
- Arrange: Set up test data and mocks
- Act: Execute the function under test
- Assert: Verify expected outcomes

## Naming
- Pattern: `should_[expected]_when_[condition]`
- Descriptive, readable names
```

### Documentation Rules

Documentation standards.

**Key elements:**

- Comment requirements
- JSDoc/TSDoc format
- README structure
- API documentation

**Example:**

```markdown
---
description: Apply when writing documentation or public APIs
alwaysApply: false
---

# Documentation Guidelines

## Comments
- Explain WHY, not WHAT
- Document public APIs with JSDoc
- Keep comments up-to-date with code

## Public APIs
- Describe parameters and return values
- Include usage examples
- Note edge cases and errors
```

## Combining Rules

Rules can work together:

```
┌─────────────────────────────────────────────────────┐
│ Always Apply: Code Style, Security                   │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ File-Specific: *.tsx → React Guidelines         │ │
│ │ File-Specific: *.test.ts → Testing Guidelines   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Intelligent: Architecture (when designing)          │
│ Intelligent: Documentation (when documenting)       │
└─────────────────────────────────────────────────────┘
```

## Priority Order

When multiple rules apply:

1. User Rules (global preferences)
2. Always Apply (project-wide)
3. File-Specific (when globs match)
4. Intelligent (when AI determines relevant)
5. Manual (`#RuleName` reference)
