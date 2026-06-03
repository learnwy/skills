---
name: refactoring-guide
description: "Identify code smells and apply refactoring techniques. Use when code quality needs to improve, before adding features to messy code, or during code review."
---

# Refactoring Guide

Code-refactoring methodology based on Martin Fowler's *Refactoring: Improving the Design of Existing Code*.

## Purpose

Improve code quality through small, behavior-preserving transformations. Refactoring is not rewriting — it is disciplined structural change.

## What This Agent Should NOT Do

- ❌ **Do not perform the refactoring** - only identify smells and recommend refactoring plans
- ❌ **Do not modify code** - provide a refactoring plan, not the implementation
- ❌ **Do not add new features** - focus on improving the existing code structure
- ❌ **Do not run commands or modify files** - strictly read-only
- ✅ **Only output**: code-smell analysis, refactoring plans, technical recommendations

## Core Philosophy

> "Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior." — Martin Fowler

## The Golden Rule

```
⚠️ Never refactor and change functionality at the same time!

Two hats:
┌─────────────────┐     ┌─────────────────┐
│ Add a feature   │     │  Refactor        │
│ ─────────────── │     │ ─────────────── │
│ • Add tests     │ ←→  │ • Add no tests   │
│ • Add code      │     │ • Improve code   │
│ • Tests pass    │     │ • Tests pass     │
└─────────────────┘     └─────────────────┘
        Switch hats frequently!
```

## Code-Smell Catalog

### Bloaters (too big)

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Long Method      │ Extract Method, Replace Temp with Query        │
├─────────────────┼───────────────────────────────────────────────┤
│ Large Class      │ Extract Class, Extract Subclass                │
├─────────────────┼───────────────────────────────────────────────┤
│ Long Parameter   │ Introduce Parameter Object,                    │
│ List             │ Preserve Whole Object                         │
├─────────────────┼───────────────────────────────────────────────┤
│ Primitive        │ Replace Primitive with Object,                 │
│ Obsession        │ Replace Type Code with Class                  │
├─────────────────┼───────────────────────────────────────────────┤
│ Data Clumps      │ Extract Class, Introduce Parameter Object     │
└─────────────────┴───────────────────────────────────────────────┘
```

### Change Preventers

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Divergent Change │ Extract Class                                 │
│                 │ (a class changes for several reasons)           │
├─────────────────┼───────────────────────────────────────────────┤
│ Shotgun Surgery  │ Move Method/Field, Inline Class               │
│                 │ (one change touches many classes)               │
├─────────────────┼───────────────────────────────────────────────┤
│ Feature Envy     │ Move Method, Extract Method                   │
│                 │ (a method uses another class's data more)        │
└─────────────────┴───────────────────────────────────────────────┘
```

### Dispensables (unnecessary)

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Comments         │ Extract Method, Rename Method                 │
│                 │ (the code should be self-explanatory)           │
├─────────────────┼───────────────────────────────────────────────┤
│ Duplicate Code   │ Extract Method, Extract Class,                │
│                 │ Pull Up Method                                │
├─────────────────┼───────────────────────────────────────────────┤
│ Dead Code        │ Remove Dead Code                              │
├─────────────────┼───────────────────────────────────────────────┤
│ Speculative      │ Collapse Hierarchy, Inline Class              │
│ Generality       │                                               │
└─────────────────┴───────────────────────────────────────────────┘
```

## Core Refactoring Techniques

### Extract Method (most common)

```
Before:
────────────────────────────
def print_owing():
    # print banner
    print("********************")
    print("*** Customer Owes ***")

    # calculate outstanding
    outstanding = 0
    for order in orders:
        outstanding += order.amount

    print(f"amount: {outstanding}")

After:
────────────────────────────
def print_owing():
    print_banner()
    outstanding = calculate_outstanding()
    print_details(outstanding)
```

### Replace Conditional with Polymorphism

```
Before:
────────────────────────────
def get_speed(vehicle_type):
    if vehicle_type == "car":
        return base_speed * 1.0
    elif vehicle_type == "bike":
        return base_speed * 0.7

After:
────────────────────────────
class Vehicle:
    def get_speed(self): pass

class Car(Vehicle):
    def get_speed(self):
        return base_speed * 1.0

class Bike(Vehicle):
    def get_speed(self):
        return base_speed * 0.7
```

## Process

### Step 1: Identify Code Smells

```
Smell-detection checklist:

□ Method longer than 10 lines? → consider Extract Method
□ Class longer than 200 lines? → consider Extract Class
□ Parameter list longer than 3? → consider Parameter Object
□ Switch/if-else chains? → consider Polymorphism
□ Duplicated code blocks? → consider Extract Method
```

### Step 2: Ensure Test Coverage

```
Before refactoring:
┌─────────────────────────────────────────────────────────────────┐
│ □ Existing tests pass                                             │
│ □ The code to refactor has test coverage                          │
│ □ If there are no tests, write characterization tests first        │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Apply the Refactoring

```
Refactoring steps:

1. Make a small change
2. Run the tests
3. Commit if tests pass
4. Repeat
```

### Step 4: Review the Result

```
Post-refactoring checklist:

□ Tests still pass
□ The code is more readable
□ Naming clearly expresses intent
□ No added duplication
□ Methods are focused (SRP)
```

## Output Format

```json
{
  "smells_detected": [
    {
      "smell": "Long Method",
      "location": "file.py:45-120",
      "severity": "high|medium|low",
      "suggested_refactorings": ["Extract Method"]
    }
  ],
  "refactoring_plan": [
    {
      "order": 1,
      "refactoring": "Extract Method",
      "target": "calculate_totals",
      "description": "Extract lines 50-75 into a new method",
      "risk": "low"
    }
  ],
  "test_requirements": {
    "existing_coverage": "partial",
    "tests_to_add": ["..."]
  }
}
```

## References

- **Refactoring** — Martin Fowler (2nd edition, 2018)
- **Refactoring to Patterns** — Joshua Kerievsky (2004)
- **Clean Code** — Robert C. Martin (2008)
