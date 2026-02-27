# Application Mode Examples

Complete examples for each rule application mode.

## Example 1: Always Apply (Security Rule)

**Scenario:** Enforce security practices across all code.

### Step 1: Create Rule File

```bash
# Create: .trae/rules/security.md
```

### Step 2: Write Rule

```markdown
---
alwaysApply: true
---

# Security Practices

## Sensitive Data
- NEVER log passwords, tokens, API keys, or PII
- Use environment variables for secrets
- Mask sensitive data in error messages

## Input Validation
- Validate all user input at entry points
- Use allowlists over denylists
- Sanitize data before database operations

## Authentication
- Use secure session management
- Implement proper CSRF protection
- Enforce strong password policies
```

### Step 3: Verify

Start new chat and write any code - security rules will apply.

---

## Example 2: File-Specific (TypeScript Rule)

**Scenario:** TypeScript guidelines for `.ts` and `.tsx` files only.

### Step 1: Create Rule File

```bash
# Create: .trae/rules/typescript.md
```

### Step 2: Write Rule

```markdown
---
globs: *.ts,*.tsx
alwaysApply: false
---

# TypeScript Guidelines

## Type Safety
- Enable strict mode in tsconfig
- Avoid `any` - use `unknown` for unknown types
- Prefer type inference when obvious
- Use discriminated unions for complex state

## Patterns
- Export types alongside implementations
- Use `as const` for literal types
- Prefer interfaces for objects, types for unions

## Imports
- Use absolute imports with path aliases
- Group: external → internal → relative
```

### Step 3: Usage

Rule activates when editing TypeScript files:

```
User: "Create a user service"
→ Mentions user.service.ts
→ TypeScript rule auto-activates
```

---

## Example 3: Intelligent Application (Testing Rule)

**Scenario:** Apply testing guidelines when writing tests.

### Step 1: Create Rule File

```bash
# Create: .trae/rules/testing.md
```

### Step 2: Write Rule

```markdown
---
description: Apply when writing, reviewing, or discussing test code
alwaysApply: false
---

# Testing Guidelines

## Test Structure
- Follow AAA pattern: Arrange, Act, Assert
- One assertion concept per test
- Use descriptive test names

## Naming Convention
- Format: `describe('[Unit]', () => it('should [behavior] when [condition]'))`
- Example: `it('should return null when user not found')`

## Mocking
- Mock external dependencies only
- Reset mocks between tests
- Use dependency injection for testability

## Coverage
- Aim for 80% coverage on business logic
- 100% coverage on utility functions
- Don't test implementation details
```

### Step 3: Usage

AI determines relevance:

```
User: "Help me write tests for the auth module"
→ AI detects testing intent
→ Testing rule auto-activates

User: "Refactor the auth module"
→ No testing intent detected
→ Testing rule NOT activated
```

---

## Example 4: Manual Application (Experimental Rule)

**Scenario:** Experimental patterns used only when explicitly requested.

### Step 1: Create Rule File

```bash
# Create: .trae/rules/experimental-patterns.md
```

### Step 2: Write Rule

```markdown
---
alwaysApply: false
---

# Experimental Patterns

## Feature Flags
- Wrap experimental features in feature flags
- Use LaunchDarkly SDK for flag management
- Default all flags to false in production

## A/B Testing
- Use analytics events for conversion tracking
- Implement variant assignment at session start
- Log all variant assignments

## Gradual Rollout
- Start with 5% traffic
- Monitor error rates before increasing
- Have kill switch ready
```

### Step 3: Usage

Must explicitly reference:

```
User: "Using #experimental-patterns, implement the new checkout flow"
→ Experimental rule activated via mention
```

---

## Quick Reference

| Mode           | Config                                | Activation                   |
| -------------- | ------------------------------------- | ---------------------------- |
| Always Apply   | `alwaysApply: true`                   | Every chat in project        |
| File-Specific  | `globs: *.ts` + `alwaysApply: false`  | When matching files involved |
| Intelligent    | `description: "..."` + `alwaysApply: false` | AI determines relevance |
| Manual         | `alwaysApply: false` (no globs/desc)  | `#RuleName` in chat          |

## Workflow Summary

```
[Identify rule purpose]
       ↓
[Choose mode based on scope]
       ↓
┌─────────────────────────────────────────┐
│ Global enforcement? → Always Apply      │
│ Specific file types? → File-Specific    │
│ Context-dependent? → Intelligent        │
│ On-demand only? → Manual                │
└─────────────────────────────────────────┘
       ↓
[Create .trae/rules/<name>.md]
       ↓
[Configure frontmatter]
       ↓
[Write rule content]
       ↓
[Start new chat to verify]
```
