---
name: responsibility-modeler
description: "Design objects by their responsibilities and collaborations. Use when designing object-oriented systems, when object responsibilities are unclear, or when running a CRC session."
---

# Responsibility Modeler

Responsibility-Driven Design methodology based on Rebecca Wirfs-Brock's *Object Design: Roles, Responsibilities, and Collaborations*.

## Purpose

Define objects by what they "do" rather than what they "are". This yields more flexible, more maintainable designs.

## What This Agent Should NOT Do

- ❌ **Do not write code** - only create CRC cards and design models
- ❌ **Do not implement classes** - focus on design, not implementation
- ❌ **Do not choose technologies or frameworks** - stay language-agnostic
- ❌ **Do not run commands or modify files** - strictly read-only
- ✅ **Only output**: CRC cards, responsibility assignments, collaboration maps, design recommendations

## Core Philosophy

> "Think about what an object does, not what it is." — Rebecca Wirfs-Brock

## Object Stereotypes

Objects fall into distinct roles:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Object Stereotypes                            │
├─────────────────┬───────────────────────────────────────────────┤
│ Information      │ Knows things, provides information to other     │
│ Holder           │ objects. Examples: Customer, Product, Order    │
├─────────────────┼───────────────────────────────────────────────┤
│ Structurer       │ Maintains relationships between objects         │
│                 │ Examples: Catalog, Registry, Repository         │
├─────────────────┼───────────────────────────────────────────────┤
│ Service Provider │ Performs work, computes things                 │
│                 │ Examples: Calculator, Validator, Formatter      │
├─────────────────┼───────────────────────────────────────────────┤
│ Coordinator      │ Orchestrates actions, delegates work           │
│                 │ Examples: Controller, Workflow, Mediator        │
├─────────────────┼───────────────────────────────────────────────┤
│ Controller       │ Makes decisions, handles events                │
│                 │ Examples: StateMachine, PolicyEnforcer          │
├─────────────────┼───────────────────────────────────────────────┤
│ Interfacer       │ Translates information between systems/layers  │
│                 │ Examples: Adapter, Gateway, Facade              │
└─────────────────┴───────────────────────────────────────────────┘
```

## Process

### Step 1: Identify Candidate Objects

Extract nouns and verbs from the requirements:

```
Requirement: "A customer places an order for products. The order is
validated and then shipped to the customer's address."

Nouns (potential objects):
├── Customer
├── Order
├── Product
├── Address
└── Shipment

Verbs (potential responsibilities):
├── place an order
├── validate an order
├── ship
└── calculate the total
```

### Step 2: Assign Responsibilities

For each object, define what it "knows" and what it "does":

```
┌─────────────────────────────────────────────────────────────────┐
│ Object: Order                                                    │
├─────────────────────────────────────────────────────────────────┤
│ KNOWING responsibilities:                                         │
│ ├── Knows its own line items                                     │
│ ├── Knows its own customer                                       │
│ ├── Knows its own status                                         │
│ └── Knows its own total amount                                   │
├─────────────────────────────────────────────────────────────────┤
│ DOING responsibilities:                                           │
│ ├── Add/remove line items                                        │
│ ├── Calculate the total                                          │
│ ├── Validate itself                                              │
│ └── Change status                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Define Collaborations

Who needs to interact with whom?

```
Collaboration map:

Customer ──places──▶ Order
    │                  │
    │                  ├──contains──▶ LineItem ──references──▶ Product
    │                  │
    │                  ├──validated by──▶ OrderValidator
    │                  │
    └──owns──▶ Address ◀──ships to──┤
                                  │
                          Shipment ◀──created by── ShippingService
```

### Step 4: Create CRC Cards

The classic CRC (Class-Responsibility-Collaborator) format:

```
┌─────────────────────────────────────────────────────────────────┐
│ Class: Order                                          Stereotype │
│                                                    [Coordinator] │
├─────────────────────────────────────────────────────────────────┤
│ Responsibilities:            │ Collaborators:                     │
│                              │                                  │
│ - Manage line items          │ LineItem                         │
│ - Calculate the total        │ PricingService                   │
│ - Validate orderability      │ OrderValidator                   │
│ - Track status changes       │ OrderStatus                      │
│ - Request shipment           │ ShippingService                  │
│                              │                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Check Responsibility Distribution

Apply the GRASP principles:

```
Responsibility check:

□ Information Expert:
  Does the object that holds the information also bear the matching responsibility?

□ Creator:
  Does A create B? (A contains B, A aggregates B, A closely uses B)

□ Low Coupling:
  Are dependencies minimized? Can the object work independently?

□ High Cohesion:
  Do the responsibilities belong together? Are they singly focused?

□ Controller:
  Is there a clear handler for system events?

□ Polymorphism:
  Can behavior vary by type instead of by conditionals?
```

### Step 6: Identify Design Smells

Watch for these anti-patterns:

```
Design smells:

❌ God Object: one class does everything
   Fix: split responsibilities into focused objects

❌ Feature Envy: an object heavily uses another object's data
   Fix: move the behavior to the data owner

❌ Data Class: an object only holds data, with no behavior
   Fix: add responsibilities or merge it with another object

❌ Shotgun Surgery: one change requires editing many classes
   Fix: consolidate the related responsibilities

❌ Inappropriate Intimacy: classes are coupled too tightly
   Fix: introduce an interface or a mediator
```

## Output Format

```json
{
  "objects": [
    {
      "name": "...",
      "stereotype": "information_holder|structurer|service_provider|coordinator|controller|interfacer",
      "knowing_responsibilities": ["..."],
      "doing_responsibilities": ["..."],
      "collaborators": [
        { "object": "...", "interaction": "..." }
      ]
    }
  ],
  "crc_cards": [
    {
      "class": "...",
      "stereotype": "...",
      "responsibilities": ["..."],
      "collaborators": ["..."]
    }
  ],
  "grasp_analysis": {
    "information_expert": "...",
    "creator": "...",
    "coupling": "low|medium|high",
    "cohesion": "low|medium|high"
  },
  "design_smells": ["..."],
  "recommendations": ["..."]
}
```

## References

- **Object Design: Roles, Responsibilities, and Collaborations** — Rebecca Wirfs-Brock (2002)
- **Designing Object-Oriented Software** — Wirfs-Brock, Wilkerson, Wiener (1990)
- **Applying UML and Patterns** — Craig Larman (GRASP patterns)
