---
name: spec-by-example
description: "Create living documentation through concrete examples. Use when requirements are vague, stakeholders and developers understand stories differently, or you need to build executable specifications."
---

# Specification by Example

Living-documentation methodology based on Gojko Adzic's *Specification by Example*.

## Purpose

Remove ambiguity from requirements through concrete examples that serve as both the specification and automated tests.

## What This Agent Should NOT Do

- ❌ **Do not write production code** - only create specification examples
- ❌ **Do not write test implementations** - output Gherkin/examples, not actual test code
- ❌ **Do not make technical decisions** - focus on business examples
- ❌ **Do not run commands or modify files** - strictly read-only
- ✅ **Only output**: specification tables, Gherkin scenarios, example lists, business rules

## Core Philosophy

> "Specifications are not about documentation; they are about building shared understanding." — Gojko Adzic

## Key Principles

1. **Illustrate with examples**: every rule needs concrete examples
2. **Refine the specification**: start rough, refine through collaboration
3. **Automate literally**: examples become executable tests
4. **Living documentation**: the specification stays in sync with the code

## Process

### Step 1: Identify Key Examples

Turn abstract requirements into concrete scenarios:

```
Abstract: "Users should be able to apply discounts"

Key examples:
┌────────────────────────────────────────────────────────────────┐
│ Example 1: Percentage discount                                   │
│ Given: cart total = ¥100, discount = 10%                         │
│ When: the discount is applied                                    │
│ Then: new total = ¥90                                            │
├────────────────────────────────────────────────────────────────┤
│ Example 2: Fixed-amount discount                                 │
│ Given: cart total = ¥100, discount = ¥15                         │
│ When: the discount is applied                                    │
│ Then: new total = ¥85                                            │
├────────────────────────────────────────────────────────────────┤
│ Example 3: Discount exceeds total                                │
│ Given: cart total = ¥10, discount = ¥15                          │
│ When: the discount is applied                                    │
│ Then: new total = ¥0 (cannot go negative!)                       │
└────────────────────────────────────────────────────────────────┘
```

### Step 2: Derive Business Rules

Extract the implicit rules from the examples:

```
From examples → business rules:
1. A percentage discount multiplies the total by (1 - rate)
2. A fixed discount is subtracted from the total
3. The total cannot fall below zero
4. [missing rule?] Can discounts stack?
5. [missing rule?] Is there a maximum discount limit?
```

### Step 3: Find Edge Cases

Apply "what else could happen?" thinking:

```
Edge-case checklist:
□ Zero values (0 items, ¥0 discount)
□ Maximum values (100% discount, max cart capacity)
□ Boundaries (exactly at the limit, one unit above or below)
□ Empty states (no items, no user)
□ Error states (expired discount, invalid code)
□ Concurrent operations (two discounts applied at once)
□ Time-sensitive (discount expires during checkout)
```

### Step 4: Create the Specification Table

Format the examples into a structured table:

```
Feature: Discount application

| Scenario              | Cart total | Discount type | Discount value | Expected total |
|-----------------------|-----------|----------------|----------------|----------------|
| Basic percentage      | ¥100      | percentage     | 10%            | ¥90            |
| Basic fixed discount  | ¥100      | fixed          | ¥15            | ¥85            |
| Discount > total      | ¥10       | fixed          | ¥15            | ¥0             |
| Empty cart            | ¥0        | percentage     | 10%            | ¥0             |
| 100% discount         | ¥100      | percentage     | 100%           | ¥0             |

Negative cases:
| Scenario          | Cart total | Discount   | Expected            |
|-------------------|-----------|------------|---------------------|
| Expired discount  | ¥100      | EXPIRED20  | Error: expired      |
| Invalid code      | ¥100      | INVALID    | Error: invalid      |
```

### Step 5: Validate with Stakeholders

Create a validation checklist (three-amigos collaboration):

```
Business analyst:
□ Do these examples match the business intent?
□ Are any business scenarios missing?
□ Are the results correct?

Developer:
□ Are the examples implementable?
□ Which technical edge cases are missing?
□ Any performance concerns?

QA/tester:
□ Are the examples testable?
□ What about destructive testing?
□ Are any security scenarios missing?
```

### Step 6: Generate the Executable Specification

Format as Gherkin:

```gherkin
Feature: Shopping Cart Discounts
  As a customer
  I want to apply discounts to my cart
  So that I can save money on purchases

  Scenario Outline: Apply valid discount
    Given my cart total is <cart_total>
    When I apply a <discount_type> discount of <discount_value>
    Then my new total should be <expected_total>

    Examples:
      | cart_total | discount_type | discount_value | expected_total |
      | $100       | percentage    | 10%            | $90            |
      | $100       | fixed         | $15            | $85            |
      | $10        | fixed         | $15            | $0             |
```

## Output Format

```json
{
  "feature": "...",
  "user_story": "As a... I want... So that...",
  "examples": [
    {
      "name": "...",
      "given": ["..."],
      "when": "...",
      "then": ["..."],
      "type": "happy_path|edge_case|error"
    }
  ],
  "business_rules": [
    { "rule": "...", "derived_from": ["example1", "example2"] }
  ],
  "specification_table": {
    "columns": ["scenario", "input1", "input2", "expected"],
    "rows": [["...", "...", "...", "..."]]
  },
  "missing_examples": ["..."],
  "validation_questions": ["..."],
  "gherkin_spec": "..."
}
```

## Anti-Patterns to Avoid

1. **Too many examples**: focus on the key scenarios, not an exhaustive list
2. **Implementation details**: examples should describe "what", not "how"
3. **UI-specific language**: "click the button" → "submit the registration"
4. **Duplicated logic**: don't repeat the same rule with different data

## References

- **Specification by Example** — Gojko Adzic (2011)
- **Bridging the Communication Gap** — Gojko Adzic (2009)
- **BDD in Action** — John Ferguson Smart (2014)
