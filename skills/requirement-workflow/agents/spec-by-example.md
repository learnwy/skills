# spec-by-example

Specification by Example agent based on Gojko Adzic's methodology for creating living documentation through concrete examples.

## When to Use

- When requirements are vague or abstract
- When stakeholders and developers interpret stories differently
- When acceptance criteria need clarification
- When building executable specifications
- During Three Amigos sessions (BA, Dev, QA)

## Hook Point

`post_stage_ANALYZING`

## Core Philosophy

> "Specifications are not about documentation. They're about building shared understanding." — Gojko Adzic

Abstract requirements lead to misunderstandings. Concrete examples eliminate ambiguity and serve as both specification AND automated tests.

## The SBE Process

### Key Principles

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
| Multiple items       | $150       | fixed         | $20            | $130           |

Negative Cases:
| Scenario             | Cart Total | Discount      | Expected       |
|----------------------|------------|---------------|----------------|
| Expired discount     | $100       | EXPIRED20     | Error: Expired |
| Invalid code         | $100       | INVALID       | Error: Invalid |
```

### Step 5: Validate with Stakeholders

Create a validation checklist:

```
Three Amigos Validation:

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

### Step 6: Generate Living Documentation

Format as executable specification:

```gherkin
Feature: Shopping Cart Discounts
  As a customer
  I want to apply discounts to my cart
  So that I can save money on purchases

  Background:
    Given I am a registered customer
    And I have items in my cart

  Scenario Outline: Apply valid discount
    Given my cart total is <cart_total>
    When I apply a <discount_type> discount of <discount_value>
    Then my new total should be <expected_total>

    Examples:
      | cart_total | discount_type | discount_value | expected_total |
      | $100       | percentage    | 10%            | $90            |
      | $100       | fixed         | $15            | $85            |
      | $10        | fixed         | $15            | $0             |

  Scenario: Reject expired discount
    Given my cart total is $100
    When I apply an expired discount code
    Then I should see error "Discount has expired"
    And my cart total should remain $100
```

## Output

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

## Example Invocation

```
AI: Launching spec-by-example to create executable specifications...

📋 Specification by Example Results:

Feature: User Registration

User Story:
"As a new visitor, I want to register an account, so that I can access member features"

Key Examples Identified:

✅ Happy Path:
| Email              | Password   | Name    | Result       |
|--------------------|------------|---------|--------------|
| user@example.com   | Valid123!  | John    | Success      |

❌ Validation Errors:
| Email              | Password   | Name    | Result       |
|--------------------|------------|---------|--------------|
| invalid-email      | Valid123!  | John    | Invalid email|
| user@example.com   | short      | John    | Weak password|
| user@example.com   | Valid123!  | ""      | Name required|

🔄 Edge Cases:
| Email              | Password   | Name    | Result       |
|--------------------|------------|---------|--------------|
| EXISTING@test.com  | Valid123!  | Jane    | Already exists|
| a@b.c              | Valid123!  | A       | Min length?  |

Business Rules Extracted:
1. Email must be valid format
2. Password must be 8+ chars with number and special char
3. Name is required, non-empty
4. Email must be unique in system

⚠️ Questions for Stakeholders:
- What's the minimum email/name length?
- Should we allow disposable email domains?
- Password history policy?
```

## Config Options

```yaml
config:
  format: "gherkin"  # or "table" or "both"
  include_negative_cases: true
  generate_executable_spec: true
  output: "living_documentation"
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
