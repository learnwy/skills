# test-strategist

Test strategy and planning agent based on "Agile Testing" (Lisa Crispin), "xUnit Test Patterns" (Gerard Meszaros), and "Lessons Learned in Software Testing" (Kaner, Bach, Pettichord).

## When to Use

- When planning test strategy for a feature
- When deciding what types of tests to write
- When reviewing test coverage
- When diagnosing test smells
- When optimizing test suite

## Hook Point

`pre_stage_TESTING`

## Core Philosophy

> "Testing is not about finding bugs. Testing is about providing information to make good decisions." — Cem Kaner

Tests are communication. They tell the story of what the system should do, and they give us confidence to change it.

## The Agile Testing Quadrants

```
┌─────────────────────────────────────────────────────────────────┐
│                   Agile Testing Quadrants                       │
│                   (Brian Marick / Lisa Crispin)                 │
├─────────────────────────────┬───────────────────────────────────┤
│ Q2: Business-Facing         │ Q3: Business-Facing              │
│     Supports Team           │     Critiques Product            │
│                             │                                   │
│ • Functional tests          │ • Exploratory testing            │
│ • Story tests               │ • Usability testing              │
│ • Prototypes                │ • UAT                            │
│ • Simulations               │ • Alpha/Beta testing             │
│                             │                                   │
│ (Automated)                 │ (Manual)                          │
├─────────────────────────────┼───────────────────────────────────┤
│ Q1: Technology-Facing       │ Q4: Technology-Facing            │
│     Supports Team           │     Critiques Product            │
│                             │                                   │
│ • Unit tests                │ • Performance tests              │
│ • Component tests           │ • Load tests                     │
│ • Integration tests         │ • Security tests                 │
│                             │ • "-ility" tests                 │
│                             │                                   │
│ (Automated)                 │ (Tools)                           │
└─────────────────────────────┴───────────────────────────────────┘

Quadrant Guide:
Q1: "Does the code work?" (Developer tests)
Q2: "Does it do what business wants?" (Acceptance tests)
Q3: "Is it what users need?" (Manual exploration)
Q4: "Can it handle production?" (Non-functional)
```

## Test Pyramid

```
                    ┌───────┐
                    │  E2E  │ ← Few, slow, expensive
                    │ Tests │   (UI, browser, system)
                   ┌┴───────┴┐
                   │Integration│ ← Some, medium
                   │  Tests    │   (API, database)
                  ┌┴───────────┴┐
                  │    Unit     │ ← Many, fast, cheap
                  │    Tests    │   (Classes, functions)
                  └─────────────┘

Anti-Pattern: Ice Cream Cone
                    ┌─────────────┐
                    │  Manual     │ ← Too much!
                    │  Testing    │
                   ┌┴─────────────┴┐
                   │     E2E       │ ← Too slow
                   │    Tests      │
                  ┌┴───────────────┴┐
                  │   Integration    │ ← Limited
                  └┬───────────────┬┘
                   └───────────────┘ ← No unit tests!
```

## Test Patterns (xUnit)

### Fresh Fixture

```
Each test creates its own test data:

def test_deposit_increases_balance():
    # Fresh setup for this test only
    account = Account(balance=100)
    account.deposit(50)
    assert account.balance == 150

def test_withdraw_decreases_balance():
    # Fresh setup for this test only
    account = Account(balance=100)
    account.withdraw(30)
    assert account.balance == 70

✅ Tests are independent
✅ Easy to understand
✅ No hidden dependencies
```

### Shared Fixture

```
Multiple tests share setup:

class TestAccount:
    def setup_method(self):
        self.account = Account(balance=100)  # Shared
    
    def test_deposit(self):
        self.account.deposit(50)
        assert self.account.balance == 150
    
    def test_withdraw(self):
        self.account.withdraw(30)
        assert self.account.balance == 70

⚠️ Be careful: Tests must not affect each other!
```

### Test Double Types

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Double Type     │ Purpose                                       │
├─────────────────┼───────────────────────────────────────────────┤
│ Dummy           │ Passed but never used                         │
│                 │ Example: placeholder parameter                │
├─────────────────┼───────────────────────────────────────────────┤
│ Stub            │ Returns canned answers                        │
│                 │ Example: fake database that returns test data │
├─────────────────┼───────────────────────────────────────────────┤
│ Spy             │ Records calls for later verification          │
│                 │ Example: check email was sent                 │
├─────────────────┼───────────────────────────────────────────────┤
│ Mock            │ Pre-programmed with expectations              │
│                 │ Example: verify specific method called        │
├─────────────────┼───────────────────────────────────────────────┤
│ Fake            │ Working implementation but simplified         │
│                 │ Example: in-memory database                   │
└─────────────────┴───────────────────────────────────────────────┘
```

## Test Smells

### Code Smells in Tests

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Smell           │ Problem & Solution                            │
├─────────────────┼───────────────────────────────────────────────┤
│ Conditional     │ Tests shouldn't have if/else                  │
│ Test Logic      │ → Split into separate tests                   │
├─────────────────┼───────────────────────────────────────────────┤
│ Hard-Coded      │ Test data scattered in code                   │
│ Test Data       │ → Use Test Data Builders                      │
├─────────────────┼───────────────────────────────────────────────┤
│ Test Code       │ Same setup repeated everywhere                │
│ Duplication     │ → Extract to helper methods                   │
├─────────────────┼───────────────────────────────────────────────┤
│ Mystery Guest   │ Test uses fixtures defined elsewhere          │
│                 │ → Make dependencies explicit in test          │
├─────────────────┼───────────────────────────────────────────────┤
│ Assertion       │ Multiple unrelated assertions                 │
│ Roulette        │ → One concept per test                        │
└─────────────────┴───────────────────────────────────────────────┘
```

### Behavior Smells

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Smell           │ Problem & Solution                            │
├─────────────────┼───────────────────────────────────────────────┤
│ Slow Tests      │ Tests take too long to run                    │
│                 │ → Mock slow dependencies                      │
├─────────────────┼───────────────────────────────────────────────┤
│ Fragile Tests   │ Tests break when unrelated code changes       │
│                 │ → Test behavior, not implementation           │
├─────────────────┼───────────────────────────────────────────────┤
│ Erratic Tests   │ Tests pass/fail randomly                      │
│                 │ → Fix timing, isolation issues                │
├─────────────────┼───────────────────────────────────────────────┤
│ Frequent        │ Tests require constant maintenance            │
│ Debugging       │ → Improve test design                         │
└─────────────────┴───────────────────────────────────────────────┘
```

## Process

### Step 1: Analyze Feature Testing Needs

```
Testing Needs Analysis:

Feature: User Registration

┌─────────────────────────────────────────────────────────────────┐
│ Aspect           │ Tests Needed                                 │
├──────────────────┼──────────────────────────────────────────────┤
│ Happy path       │ Valid registration succeeds                  │
│ Validation       │ Email format, password strength              │
│ Error handling   │ Duplicate email, server errors               │
│ Security         │ Password hashing, rate limiting              │
│ Integration      │ Database, email service                      │
│ Performance      │ Registration under load                      │
└──────────────────┴──────────────────────────────────────────────┘
```

### Step 2: Map to Test Quadrants

```
Feature: User Registration → Test Mapping

Q1 (Unit):
├── UserValidator.validate_email()
├── PasswordHasher.hash()
└── RegistrationService.register()

Q2 (Functional):
├── "As a visitor, I can register with valid credentials"
├── "Registration fails with invalid email format"
└── "Registration fails with weak password"

Q3 (Exploratory):
├── Edge cases in email formats
├── Unicode in names
└── Unusual user journeys

Q4 (Non-functional):
├── Registration endpoint handles 100 req/s
└── Password hashing meets security standards
```

### Step 3: Plan Test Distribution

```
Test Distribution (Example):

┌─────────────────────────────────────────────────────────────────┐
│ Test Type        │ Count │ Coverage Focus                       │
├──────────────────┼───────┼──────────────────────────────────────┤
│ Unit             │ ~50   │ All business logic                   │
│ Integration      │ ~15   │ Database, external services          │
│ API/Contract     │ ~10   │ All endpoints                        │
│ E2E              │ ~5    │ Critical user journeys only          │
│ Performance      │ ~3    │ Key endpoints under load             │
└──────────────────┴───────┴──────────────────────────────────────┘

Ratio: 50:15:10:5:3 (roughly 10:3:2:1:0.5)
```

### Step 4: Define Test Strategy

```
Test Strategy Document:

Scope: User Registration Feature

1. Unit Tests (Q1)
   - Coverage target: 80%+
   - Focus: Validation logic, business rules
   - Tools: pytest, unittest
   - Run: Every commit

2. Integration Tests (Q1/Q2)
   - Focus: Database operations, email service
   - Tools: pytest + testcontainers
   - Run: PR merge

3. Acceptance Tests (Q2)
   - Focus: User stories
   - Tools: Cucumber/Behave
   - Run: Nightly

4. Exploratory Testing (Q3)
   - Focus: Edge cases, usability
   - Approach: Charter-based sessions
   - When: Before release

5. Performance Tests (Q4)
   - Focus: Registration endpoint
   - Target: 100 req/s, <500ms p99
   - Tools: k6, Locust
   - Run: Weekly
```

## Output

```json
{
  "feature": "...",
  "testing_needs": [
    {
      "aspect": "...",
      "risk_level": "high|medium|low",
      "tests_needed": ["..."]
    }
  ],
  "quadrant_mapping": {
    "q1_unit": ["..."],
    "q2_functional": ["..."],
    "q3_exploratory": ["..."],
    "q4_nonfunctional": ["..."]
  },
  "test_distribution": {
    "unit": {"count": 0, "coverage_focus": "..."},
    "integration": {"count": 0, "coverage_focus": "..."},
    "e2e": {"count": 0, "coverage_focus": "..."}
  },
  "test_smells_detected": [
    {
      "smell": "...",
      "location": "...",
      "recommendation": "..."
    }
  ],
  "strategy_recommendations": ["..."],
  "risks": ["..."]
}
```

## Example Invocation

```
AI: Launching test-strategist to plan testing approach...

🧪 Test Strategy Analysis:

Feature: Order Processing

Testing Needs Assessment:
┌────────────────┬───────────┬─────────────────────────────────────┐
│ Aspect         │ Risk      │ Tests Needed                        │
├────────────────┼───────────┼─────────────────────────────────────┤
│ Order creation │ High      │ Unit + Integration + E2E            │
│ Payment        │ Critical  │ Unit + Integration + Security       │
│ Inventory      │ High      │ Unit + Integration                  │
│ Email notify   │ Medium    │ Unit (stub email service)           │
│ Performance    │ Medium    │ Load test for checkout              │
└────────────────┴───────────┴─────────────────────────────────────┘

Quadrant Distribution:

Q1 (Unit): 45 tests
├── OrderValidator (12)
├── PricingCalculator (15)
├── InventoryChecker (10)
└── PaymentProcessor (8)

Q2 (Functional): 15 tests
├── Order placement scenarios (8)
├── Payment scenarios (5)
└── Error handling (2)

Q3 (Exploratory): Session-based
├── Charter: "Explore order edge cases"
├── Charter: "Stress test cart limits"

Q4 (Non-functional): 5 tests
├── Checkout load test (2)
├── Security scan (2)
├── Accessibility (1)

Test Smells Detected:
⚠️ test_order_flow.py - Test too long (85 lines)
   → Split into focused tests
⚠️ Shared fixture modifying state
   → Use fresh fixtures instead

Recommendations:
1. Add contract tests for payment gateway
2. Increase unit test coverage for PricingCalculator
3. Add chaos testing for inventory service failures
4. Consider property-based testing for order validation
```

## Config Options

```yaml
config:
  include_quadrant_analysis: true
  include_smell_detection: true
  output: "test_strategy"
```

## Test Mantras

```
"Test behavior, not implementation"
(Tests should survive refactoring)

"One concept per test"
(Makes failures clear)

"Tests are documentation"
(They show how code should be used)

"Keep tests fast"
(Slow tests don't get run)
```

## References

- **Agile Testing** — Lisa Crispin & Janet Gregory (2009)
- **More Agile Testing** — Lisa Crispin & Janet Gregory (2014)
- **xUnit Test Patterns** — Gerard Meszaros (2007)
- **Lessons Learned in Software Testing** — Kaner, Bach, Pettichord (2002)
