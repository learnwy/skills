---
name: refactoring-guide
description: "Identify code smells and apply refactoring techniques. Use when code quality needs improvement, before adding features to messy code, or during code reviews."
---

# Refactoring Guide

Code refactoring methodology based on Martin Fowler's "Refactoring: Improving the Design of Existing Code".

## Purpose

Improve code quality through small, behavior-preserving transformations. Refactoring is NOT rewriting—it's disciplined restructuring.

## What This Agent Should NOT Do

- ❌ **Do NOT perform refactorings** - Only identify smells and suggest refactorings
- ❌ **Do NOT modify code** - Provide refactoring plans, not implementations
- ❌ **Do NOT add new features** - Focus on improving existing code structure
- ❌ **Do NOT run commands or modify files** - Stay strictly read-only
- ✅ **Only output**: Code smell analysis, refactoring plans, technique recommendations

## Core Philosophy

> "Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior." — Martin Fowler

## Golden Rule

```
⚠️ NEVER refactor and change functionality at the same time!

Two Hats:
┌─────────────────┐     ┌─────────────────┐
│ Adding Function │     │  Refactoring    │
│ ─────────────── │     │ ─────────────── │
│ • Add tests     │ ←→  │ • No new tests  │
│ • Add code      │     │ • Improve code  │
│ • Tests pass    │     │ • Tests pass    │
└─────────────────┘     └─────────────────┘
        Switch hats frequently!
```

## Code Smells Catalog

### Bloaters (Too Big)

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Long Method     │ Extract Method, Replace Temp with Query       │
├─────────────────┼───────────────────────────────────────────────┤
│ Large Class     │ Extract Class, Extract Subclass               │
├─────────────────┼───────────────────────────────────────────────┤
│ Long Parameter  │ Introduce Parameter Object,                   │
│ List            │ Preserve Whole Object                         │
├─────────────────┼───────────────────────────────────────────────┤
│ Primitive       │ Replace Primitive with Object,                │
│ Obsession       │ Replace Type Code with Class                  │
├─────────────────┼───────────────────────────────────────────────┤
│ Data Clumps     │ Extract Class, Introduce Parameter Object     │
└─────────────────┴───────────────────────────────────────────────┘
```

### Change Preventers

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Divergent       │ Extract Class                                 │
│ Change          │ (Class changes for multiple reasons)          │
├─────────────────┼───────────────────────────────────────────────┤
│ Shotgun         │ Move Method/Field, Inline Class               │
│ Surgery         │ (One change touches many classes)             │
├─────────────────┼───────────────────────────────────────────────┤
│ Feature Envy    │ Move Method, Extract Method                   │
│                 │ (Method uses another class's data more)       │
└─────────────────┴───────────────────────────────────────────────┘
```

### Dispensables (Unnecessary)

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Comments        │ Extract Method, Rename Method                 │
│ (excessive)     │ (Code should be self-documenting)             │
├─────────────────┼───────────────────────────────────────────────┤
│ Duplicate Code  │ Extract Method, Extract Class,                │
│                 │ Pull Up Method                                │
├─────────────────┼───────────────────────────────────────────────┤
│ Dead Code       │ Remove Dead Code                              │
├─────────────────┼───────────────────────────────────────────────┤
│ Speculative     │ Collapse Hierarchy, Inline Class              │
│ Generality      │                                               │
└─────────────────┴───────────────────────────────────────────────┘
```

## Core Refactoring Techniques

### Extract Method (Most Common)

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
Smell Detection Checklist:

□ Methods > 10 lines? → Consider Extract Method
□ Classes > 200 lines? → Consider Extract Class
□ Parameter list > 3? → Consider Parameter Object
□ Switch/if-else chains? → Consider Polymorphism
□ Duplicate code blocks? → Consider Extract Method
```

### Step 2: Ensure Test Coverage

```
Before Refactoring:
┌─────────────────────────────────────────────────────────────────┐
│ □ Existing tests pass                                           │
│ □ Code under refactoring has test coverage                      │
│ □ If no tests, write characterization tests first               │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Apply Refactoring

```
Refactoring Steps:

1. Make ONE small change
2. Run tests
3. Commit if tests pass
4. Repeat
```

### Step 4: Review Result

```
Post-Refactoring Checklist:

□ Tests still pass
□ Code is more readable
□ Names clearly express intent
□ No duplication increased
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
      "description": "Extract lines 50-75 into new method",
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
