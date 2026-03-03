# legacy-surgeon

Legacy code transformation agent based on Michael Feathers' "Working Effectively with Legacy Code".

## When to Use

- When modifying code without tests
- When adding features to untested codebase
- When breaking dependencies for testability
- When making safe changes to fragile code
- When understanding complex legacy systems

## Hook Point

`pre_stage_IMPLEMENTING`

## Core Philosophy

> "Legacy code is simply code without tests." — Michael Feathers

Legacy code isn't about age—it's about safety. Without tests, we can't know if our changes break things. This agent teaches techniques to safely modify code that lacks tests.

## The Legacy Code Dilemma

```
┌─────────────────────────────────────────────────────────────────┐
│                 The Legacy Code Dilemma                         │
│                                                                 │
│     "To change code safely, we need tests.                      │
│      To write tests, we often need to change code."             │
│                                                                 │
│     Solution: Carefully break dependencies to enable testing    │
└─────────────────────────────────────────────────────────────────┘
```

## Seams: The Key Concept

### What is a Seam?

```
A seam is a place where you can alter behavior without editing in that place.

Types of Seams:
┌─────────────────┬───────────────────────────────────────────────┐
│ Seam Type       │ Description                                   │
├─────────────────┼───────────────────────────────────────────────┤
│ Object Seam     │ Replace object with test double               │
│                 │ → Most common, uses polymorphism              │
├─────────────────┼───────────────────────────────────────────────┤
│ Link Seam       │ Replace at link/build time                    │
│                 │ → Swap library or module                      │
├─────────────────┼───────────────────────────────────────────────┤
│ Preprocessor    │ Replace at compile time                       │
│ Seam            │ → C/C++ macros, conditional compilation       │
└─────────────────┴───────────────────────────────────────────────┘

Object Seam Example:
─────────────────────────────────
# Before: Hard to test (direct database call)
class ReportGenerator:
    def generate(self):
        data = Database().query("SELECT * FROM sales")
        return self.format(data)

# After: Object seam allows testing
class ReportGenerator:
    def __init__(self, data_source):  # ← Seam!
        self.data_source = data_source
    
    def generate(self):
        data = self.data_source.query("SELECT * FROM sales")
        return self.format(data)

# In test:
class FakeDataSource:
    def query(self, sql):
        return [{"id": 1, "amount": 100}]

generator = ReportGenerator(FakeDataSource())  # Inject fake
```

## Dependency-Breaking Techniques

### Extract and Override

```
Problem: Method calls something hard to test

# Original (hard to test - sends real email)
class OrderProcessor:
    def process(self, order):
        # ... process order ...
        self.send_email(order.customer, "Order confirmed")
    
    def send_email(self, to, message):
        smtp.send(to, message)  # Real email!

# Solution: Extract and Override
class OrderProcessor:
    def process(self, order):
        # ... process order ...
        self.send_email(order.customer, "Order confirmed")
    
    def send_email(self, to, message):  # ← Now overridable!
        smtp.send(to, message)

# In test: Create testing subclass
class TestableOrderProcessor(OrderProcessor):
    def __init__(self):
        self.emails_sent = []
    
    def send_email(self, to, message):  # Override!
        self.emails_sent.append((to, message))

# Test without sending real emails!
processor = TestableOrderProcessor()
processor.process(order)
assert processor.emails_sent[0] == (customer, "Order confirmed")
```

### Introduce Instance Delegator

```
Problem: Static method is hard to test

# Original
class PriceCalculator:
    @staticmethod
    def calculate(items):
        total = sum(item.price for item in items)
        tax = TaxService.get_tax_rate()  # Static call!
        return total * (1 + tax)

# Solution: Introduce instance delegator
class PriceCalculator:
    def __init__(self, tax_service=None):
        self.tax_service = tax_service or TaxService()
    
    def calculate(self, items):
        total = sum(item.price for item in items)
        tax = self.tax_service.get_tax_rate()  # Instance call!
        return total * (1 + tax)
```

### Sprout Method/Class

```
Problem: Need to add code to untested method

# Original (no tests, 300 lines, scary!)
class OrderProcessor:
    def process(self, order):
        # ... 300 lines of untested code ...
        pass

# Sprout Method: Add new functionality in new, tested method
class OrderProcessor:
    def process(self, order):
        # ... 300 lines of untested code ...
        if order.needs_audit:
            self.audit_order(order)  # Sprout!
    
    def audit_order(self, order):  # ← New, tested method!
        audit_log.record(order.id, order.total)

# Sprout Class: When new functionality is substantial
class OrderAuditor:  # ← New, tested class!
    def audit(self, order):
        audit_log.record(order.id, order.total)
```

### Wrap Method

```
Problem: Need to add behavior before/after existing method

# Original
class Employee:
    def pay(self):
        money = self.calculate_pay()
        self.dispense(money)

# Wrap Method: Add logging around pay
class Employee:
    def pay(self):
        self.log_payment()  # Before
        self.dispense_payment()
        self.log_payment_complete()  # After
    
    def dispense_payment(self):  # Renamed original
        money = self.calculate_pay()
        self.dispense(money)
```

## Process

### Step 1: Identify Change Points

```
Change Point Analysis:

1. Where do I need to make changes?
   → List the specific methods/classes
   
2. What are the dependencies?
   → Draw a dependency graph
   
3. Where are the test points?
   → Where can I verify behavior?

Example:
┌──────────────┐
│ OrderService │ ← Change here
├──────────────┤
│ - database   │ ← Dependency (hard to test)
│ - emailer    │ ← Dependency (hard to test)
│ - calculator │ ← Dependency (easy to test)
└──────────────┘
```

### Step 2: Write Characterization Tests

```
Characterization Test: Documents existing behavior

Steps:
1. Write a test that calls the code
2. Let it fail (you don't know expected result)
3. Change assertion to match actual output
4. You now have a safety net!

Example:
def test_calculate_total_characterization():
    # I don't know what this should return...
    order = Order(items=[Item(100), Item(50)])
    result = calculator.calculate(order)
    
    # First run: assert fails, shows result = 157.50
    # Update assertion:
    assert result == 157.50  # Now I know the behavior!
```

### Step 3: Break Dependencies

```
Dependency Breaking Workflow:

1. Identify the dependency blocking testing
2. Choose a breaking technique:
   □ Extract Interface
   □ Extract and Override
   □ Introduce Instance Delegator
   □ Parameterize Constructor
   □ Parameterize Method
   
3. Apply technique (minimal changes)
4. Verify characterization tests still pass
5. Now you can test the change
```

### Step 4: Make Changes Under Test

```
Safe Change Workflow:

1. Characterization tests passing ✓
2. Write test for new behavior
3. Make the change
4. All tests pass ✓
5. Refactor if needed
6. All tests pass ✓
```

## Legacy Code Strategies

### The Strangler Fig Pattern

```
Gradually replace legacy system:

┌─────────────────────────────────────────────────────────────────┐
│ Time →                                                          │
│                                                                 │
│ [Legacy System]                                                 │
│ [Legacy System] [New Module A]                                  │
│ [Legacy System] [New Module A] [New Module B]                   │
│ [Legacy...    ] [New Module A] [New Module B] [New C]           │
│ [Leg]           [New A] [New B] [New C] [New D]                 │
│                 [New System (Legacy Gone)]                      │
└─────────────────────────────────────────────────────────────────┘

Each new feature → New module instead of modifying legacy
```

### Scratch Refactoring

```
Understand code by refactoring (then throw away!):

1. Make a branch
2. Refactor aggressively to understand the code
3. Take notes on what you learned
4. DELETE the branch
5. Now make real changes with understanding
```

## Output

```json
{
  "change_points": [
    {
      "location": "...",
      "reason": "...",
      "risk": "high|medium|low"
    }
  ],
  "dependencies": [
    {
      "dependency": "...",
      "type": "database|network|filesystem|global_state",
      "blocking_tests": true,
      "breaking_technique": "..."
    }
  ],
  "characterization_tests": [
    {
      "test_name": "...",
      "behavior_captured": "...",
      "confidence": "high|medium|low"
    }
  ],
  "recommended_approach": "sprout_method|sprout_class|wrap_method|extract_override",
  "seams_identified": [
    {
      "location": "...",
      "seam_type": "object|link|preprocessor",
      "how_to_use": "..."
    }
  ],
  "safety_checklist": ["..."],
  "risks": ["..."]
}
```

## Example Invocation

```
AI: Launching legacy-surgeon to analyze legacy code...

🔬 Legacy Code Analysis Results:

Change Point Analysis:
┌─────────────────┬──────────────┬────────────────────────────────┐
│ Location        │ Risk         │ Dependencies                   │
├─────────────────┼──────────────┼────────────────────────────────┤
│ OrderService.   │ High         │ Database, EmailClient,         │
│ process()       │              │ PaymentGateway                 │
│ (lines 45-280)  │              │                                │
└─────────────────┴──────────────┴────────────────────────────────┘

Dependencies Blocking Testing:
1. Database → Direct SQL calls in method
   Breaking technique: Extract Interface + Inject
   
2. EmailClient → Static method call
   Breaking technique: Introduce Instance Delegator
   
3. PaymentGateway → Global singleton
   Breaking technique: Parameterize Constructor

Recommended Approach: Sprout Method

For your feature (add audit logging):
1. Create new method: audit_order(order)
2. Test audit_order() thoroughly
3. Add call in process() to audit_order()
4. Characterization tests verify nothing broke

Seams Identified:
├── Line 120: Can override send_notification()
├── Line 180: Can inject payment_gateway
└── Line 45: Constructor can accept dependencies

Characterization Tests Needed:
1. test_process_creates_order_record
2. test_process_sends_confirmation_email
3. test_process_charges_payment

⚠️ Risks:
- Method has 15 conditionals - high complexity
- Global state in PaymentGateway
- No existing tests (proceed carefully!)

Safety Checklist:
□ Write characterization tests first
□ Break one dependency at a time
□ Verify tests pass after each change
□ Keep changes minimal
```

## Config Options

```yaml
config:
  include_dependency_graph: true
  generate_characterization_tests: true
  output: "legacy_analysis"
```

## References

- **Working Effectively with Legacy Code** — Michael Feathers (2004)
- **Refactoring** — Martin Fowler (2018)
- **Growing Object-Oriented Software, Guided by Tests** — Freeman & Pryce (2009)
