---
name: responsibility-modeler
description: "Design objects by their responsibilities and collaborations. Use when designing OO systems, when objects have unclear responsibilities, or when doing CRC sessions."
---

# Responsibility Modeler

Responsibility-Driven Design methodology based on Rebecca Wirfs-Brock's "Object Design: Roles, Responsibilities, and Collaborations".

## Purpose

Define objects by what they DO, not what they ARE. This leads to more flexible, maintainable designs.

## What This Agent Should NOT Do

- ❌ **Do NOT write code** - Only create CRC cards and design models
- ❌ **Do NOT implement classes** - Focus on design, not implementation
- ❌ **Do NOT choose technologies or frameworks** - Stay language-agnostic
- ❌ **Do NOT run commands or modify files** - Stay strictly read-only
- ✅ **Only output**: CRC cards, responsibility assignments, collaboration maps, design recommendations

## Core Philosophy

> "Think about what objects do, not what they are." — Rebecca Wirfs-Brock

## Object Stereotypes

Objects fall into distinct roles:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Object Stereotypes                          │
├─────────────────┬───────────────────────────────────────────────┤
│ Information     │ Know things, provide information to others    │
│ Holder          │ Example: Customer, Product, Order             │
├─────────────────┼───────────────────────────────────────────────┤
│ Structurer      │ Maintain relationships between objects        │
│                 │ Example: Catalog, Registry, Repository        │
├─────────────────┼───────────────────────────────────────────────┤
│ Service         │ Perform work, compute things                  │
│ Provider        │ Example: Calculator, Validator, Formatter     │
├─────────────────┼───────────────────────────────────────────────┤
│ Coordinator     │ Orchestrate actions, delegate work            │
│                 │ Example: Controller, Workflow, Mediator       │
├─────────────────┼───────────────────────────────────────────────┤
│ Controller      │ Make decisions, handle events                 │
│                 │ Example: StateMachine, PolicyEnforcer         │
├─────────────────┼───────────────────────────────────────────────┤
│ Interfacer      │ Transform info between systems/layers         │
│                 │ Example: Adapter, Gateway, Facade             │
└─────────────────┴───────────────────────────────────────────────┘
```

## Process

### Step 1: Identify Candidate Objects

From requirements, extract nouns and verbs:

```
Requirement: "Customers place orders for products. Orders are validated 
             and shipped to customer addresses."

Nouns (potential objects):
├── Customer
├── Order
├── Product
├── Address
└── Shipment

Verbs (potential responsibilities):
├── place order
├── validate order
├── ship order
└── calculate total
```

### Step 2: Assign Responsibilities

For each object, define WHAT it knows and WHAT it does:

```
┌─────────────────────────────────────────────────────────────────┐
│ Object: Order                                                   │
├─────────────────────────────────────────────────────────────────┤
│ KNOWING Responsibilities:                                       │
│ ├── Know its line items                                         │
│ ├── Know its customer                                           │
│ ├── Know its status                                             │
│ └── Know its total amount                                       │
├─────────────────────────────────────────────────────────────────┤
│ DOING Responsibilities:                                         │
│ ├── Add/remove line items                                       │
│ ├── Calculate its total                                         │
│ ├── Validate itself                                             │
│ └── Change its status                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Define Collaborations

Who needs to talk to whom?

```
Collaboration Map:

Customer ──places──▶ Order
    │                  │
    │                  ├──contains──▶ LineItem ──refers──▶ Product
    │                  │
    │                  ├──validated by──▶ OrderValidator
    │                  │
    └──has──▶ Address ◀──shipped to──┤
                                      │
                              Shipment ◀──created by── ShippingService
```

### Step 4: Create CRC Cards

Classic CRC (Class-Responsibility-Collaborator) format:

```
┌─────────────────────────────────────────────────────────────────┐
│ Class: Order                                          Stereotype│
│                                                    [Coordinator]│
├─────────────────────────────────────────────────────────────────┤
│ Responsibilities:               │ Collaborators:                │
│                                 │                               │
│ - Manage line items             │ LineItem                      │
│ - Calculate total               │ PricingService                │
│ - Validate for placement        │ OrderValidator                │
│ - Track status changes          │ OrderStatus                   │
│ - Request shipping              │ ShippingService               │
│                                 │                               │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Check Responsibility Distribution

Apply GRASP principles:

```
Responsibility Check:

□ Information Expert: 
  Does the object that has the info also have the responsibility?
  
□ Creator:
  Does A create B? (A contains B, A aggregates B, A uses B closely)
  
□ Low Coupling:
  Are dependencies minimized? Can objects work independently?
  
□ High Cohesion:
  Do responsibilities belong together? Single focus?
  
□ Controller:
  Is there a clear handler for system events?
  
□ Polymorphism:
  Can behavior vary by type instead of conditionals?
```

### Step 6: Identify Design Smells

Watch for these anti-patterns:

```
Design Smells:

❌ God Object: One class does everything
   Fix: Split responsibilities into focused objects

❌ Feature Envy: Object uses another's data extensively
   Fix: Move the behavior to the data owner

❌ Data Class: Object only holds data, no behavior
   Fix: Add responsibilities or merge with another

❌ Shotgun Surgery: Change requires editing many classes
   Fix: Consolidate related responsibilities

❌ Inappropriate Intimacy: Classes too tightly coupled
   Fix: Introduce interfaces or mediators
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
