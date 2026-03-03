---
name: spec-by-example
description: "Create living documentation through concrete examples. Use when requirements are vague, when stakeholders and developers interpret stories differently, or when building executable specifications."
---

# Specification by Example

Methodology for creating living documentation based on Gojko Adzic's "Specification by Example".

## Purpose

Eliminate ambiguity in requirements by using concrete examples that serve as both specification AND automated tests.

## Core Philosophy

> "Specifications are not about documentation. They're about building shared understanding." — Gojko Adzic

## Key Principles

1. **Illustrate with Examples**: Every rule needs concrete examples
2. **Refine Specifications**: Start messy, refine through collaboration
3. **Automate Literally**: Examples become executable tests
4. **Living Documentation**: Specs stay in sync with code

## Process

### Step 1: Identify Key Examples

Transform abstract requirements into concrete scenarios:

```
Abstract: "Users should be able to apply discounts"

Key Examples:
┌────────────────────────────────────────────────────────────────┐
│ Example 1: Percentage discount                                 │
│ Given: Cart total = $100, Discount = 10%                       │
│ When: Apply discount                                           │
│ Then: New total = $90                                          │
├────────────────────────────────────────────────────────────────┤
│ Example 2: Fixed amount discount                               │
│ Given: Cart total = $100, Discount = $15                       │
│ When: Apply discount                                           │
│ Then: New total = $85                                          │
├────────────────────────────────────────────────────────────────┤
│ Example 3: Discount exceeds total                              │
│ Given: Cart total = $10, Discount = $15                        │
│ When: Apply discount                                           │
│ Then: New total = $0 (not negative!)                           │
└────────────────────────────────────────────────────────────────┘
```

### Step 2: Derive Business Rules

Extract implicit rules from examples:

```
From Examples → Business Rules:
1. Percentage discounts multiply total by (1 - rate)
2. Fixed discounts subtract from total
3. Total cannot go below zero
4. [Missing rule?] Can discounts combine?
5. [Missing rule?] Is there a max discount?
```

### Step 3: Find Edge Cases

Apply "What else could happen?" thinking:

```
Edge Case Checklist:
□ Zero values (0 items, $0 discount)
□ Maximum values (100% discount, max cart size)
□ Boundaries (exactly at limit, one above/below)
□ Empty states (no items, no user)
□ Error states (expired discount, invalid code)
□ Concurrent operations (two discounts at once)
□ Time-sensitive (discount expired mid-checkout)
```

### Step 4: Create Specification Table

Format examples as structured tables:

```
Feature: Discount Application

| Scenario             | Cart Total | Discount Type | Discount Value | Expected Total |
|----------------------|------------|---------------|----------------|----------------|
| Percentage basic     | $100       | percentage    | 10%            | $90            |
| Fixed basic          | $100       | fixed         | $15            | $85            |
| Discount > total     | $10        | fixed         | $15            | $0             |
| Zero cart            | $0         | percentage    | 10%            | $0             |
| 100% discount        | $100       | percentage    | 100%           | $0             |

Negative Cases:
| Scenario             | Cart Total | Discount      | Expected       |
|----------------------|------------|---------------|----------------|
| Expired discount     | $100       | EXPIRED20     | Error: Expired |
| Invalid code         | $100       | INVALID       | Error: Invalid |
```

### Step 5: Validate with Stakeholders

Create a validation checklist (Three Amigos):

```
Business Analyst:
□ Do these examples match business intent?
□ Are there missing business scenarios?
□ Are the outcomes correct?

Developer:
□ Are examples implementable?
□ What technical edge cases are missing?
□ Any performance concerns?

QA/Tester:
□ Are examples testable?
□ What about destructive testing?
□ Any security scenarios missing?
```

### Step 6: Generate Executable Specification

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

1. **Too Many Examples**: Focus on key scenarios, not exhaustive lists
2. **Implementation Details**: Examples should describe WHAT, not HOW
3. **UI-Specific Language**: "Click button" → "Submit registration"
4. **Duplicated Logic**: Don't repeat the same rule with different data

## References

- **Specification by Example** — Gojko Adzic (2011)
- **Bridging the Communication Gap** — Gojko Adzic (2009)
- **BDD in Action** — John Ferguson Smart (2014)
