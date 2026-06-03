# Apply-Mode Examples

Complete examples for each rule apply mode.

## Example 1: Always-apply (security rule)

**Scenario**: enforce security practices across all code.

### Step 1: Create the rule file

```bash
# Create: .agents/rules/security.md
```

### Step 2: Write the rule

```markdown
---
alwaysApply: true
---

# Security Practices

## Sensitive data
- Never log passwords, tokens, API keys, or personal information
- Use environment variables to store secrets
- Mask sensitive data in error messages

## Input validation
- Validate all user input at entry points
- Prefer allowlists over denylists
- Sanitise data before database operations

## Authentication
- Use secure session management
- Implement proper CSRF protection
- Enforce a strong-password policy
```

### Step 3: Verify

Open a new chat and write any code — the security rule takes effect automatically.

---

## Example 2: File-specific (TypeScript rule)

**Scenario**: TypeScript guidelines that apply only to `.ts` and `.tsx` files.

### Step 1: Create the rule file

```bash
# Create: .agents/rules/typescript.md
```

### Step 2: Write the rule

```markdown
---
globs: *.ts,*.tsx
alwaysApply: false
---

# TypeScript Guidelines

## Type safety
- Enable strict mode in tsconfig
- Avoid `any` — use `unknown` for unknown types
- Prefer type inference when the type is obvious
- Use discriminated unions for complex state

## Patterns
- Export types alongside their implementation
- Use `as const` for literal types
- Use interfaces for objects, type aliases for unions

## Imports
- Absolute imports via path aliases
- Group: external → internal → relative
```

### Step 3: Usage

The rule activates automatically when editing TypeScript files:

```
User: "Create a user service"
→ involves user.service.ts
→ the TypeScript rule activates automatically
```

---

## Example 3: Smart-apply (testing rule)

**Scenario**: apply testing guidelines when writing tests.

### Step 1: Create the rule file

```bash
# Create: .agents/rules/testing.md
```

### Step 2: Write the rule

```markdown
---
description: Apply when writing, reviewing, or discussing test code
alwaysApply: false
---

# Testing Guidelines

## Test structure
- Follow the AAA pattern: Arrange, Act, Assert
- One assertion concept per test
- Use descriptive test names

## Naming conventions
- Format: `describe('[unit]', () => it('should [behavior] when [condition]'))`
- Example: `it('should return null when user not found')`

## Mocking
- Mock external dependencies only
- Reset mocks between tests
- Use dependency injection to improve testability

## Coverage
- Target 80% coverage for business logic
- 100% coverage for utility functions
- Don't test implementation details
```

### Step 3: Usage

The AI judges relevance:

```
User: "Help me write tests for the auth module"
→ the AI detects test intent
→ the testing rule activates automatically

User: "Refactor the auth module"
→ no test intent detected
→ the testing rule does not activate
```

---

## Example 4: Manual-apply (experimental rule)

**Scenario**: experimental patterns used only on explicit request.

### Step 1: Create the rule file

```bash
# Create: .agents/rules/experimental-patterns.md
```

### Step 2: Write the rule

```markdown
---
alwaysApply: false
---

# Experimental Patterns

## Feature flags
- Wrap experimental features in a feature flag
- Use the LaunchDarkly SDK to manage flags
- All flags default to false in production

## A/B testing
- Track conversions with analytics events
- Assign variants at session start
- Log all variant assignments

## Gradual rollout
- Start at 5% of traffic
- Monitor error rates before each increment
- Have a circuit breaker ready
```

### Step 3: Usage

Must be referenced explicitly:

```
User: "Using #experimental-patterns, implement the new checkout flow"
→ the experimental rule activates via reference
```

---

## Quick reference

| Mode | Configuration | Activation |
| ---- | ------------- | ---------- |
| Always-apply | `alwaysApply: true` | Every chat in the project |
| File-specific | `globs: *.ts` + `alwaysApply: false` | When a matching file is involved |
| Smart | `description: "..."` + `alwaysApply: false` | The AI judges relevance |
| Manual | `alwaysApply: false` (no globs/desc) | Via `#RuleName` in chat |

## Workflow summary

```
[Determine the rule's purpose]
       ↓
[Pick the mode based on scope]
       ↓
┌─────────────────────────────────────────┐
│ Enforce globally?    → always-apply      │
│ Specific file types? → file-specific     │
│ Context-dependent?   → smart             │
│ On demand only?      → manual            │
└─────────────────────────────────────────┘
       ↓
[Create .agents/rules/<name>.md]
       ↓
[Configure the frontmatter]
       ↓
[Write the rule content]
       ↓
[Verify in a new chat]
```
