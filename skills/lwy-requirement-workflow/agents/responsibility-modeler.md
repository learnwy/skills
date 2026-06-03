# responsibility-modeler

A responsibility-driven design agent based on Rebecca Wirfs-Brock's *Object Design: Roles, Responsibilities, and Collaborations*.

## When to use

- Designing object-oriented systems
- When object responsibilities are unclear
- When a class is turning into a god object
- When designing collaborations between objects
- When holding CRC (Class-Responsibility-Collaborator) sessions

## Hook Point

`pre_stage_DESIGNING`

## What this agent does NOT do

- ❌ **Does not write code** — only creates CRC cards and design models
- ❌ **Does not implement classes** — focuses on design, not implementation
- ❌ **Does not pick technologies or frameworks** — stays language-agnostic
- ❌ **Does not run commands or modify files** — strictly read-only
- ✅ **Outputs only**: CRC cards, responsibility assignments, collaboration maps, design recommendations

## Core philosophy

> "Focus on what an object does, not what an object is." — Rebecca Wirfs-Brock

Objects should be defined by their responsibilities and collaborations, not by their data. Such designs are more flexible and easier to maintain.

## The RDD framework

### Object stereotypes

Objects take on different roles:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Object stereotypes                            │
├─────────────────┬───────────────────────────────────────────────┤
│ Information holder│ Knows things, provides information to others   │
│                 │ Examples: Customer, Product, Order              │
├─────────────────┼───────────────────────────────────────────────┤
│ Structurer      │ Maintains relationships between objects         │
│                 │ Examples: Catalog, Registry, Repository         │
├─────────────────┼───────────────────────────────────────────────┤
│ Service provider│ Does work, computes results                     │
│                 │ Examples: Calculator, Validator, Formatter      │
├─────────────────┼───────────────────────────────────────────────┤
│ Coordinator     │ Orchestrates actions, delegates work            │
│                 │ Examples: Controller, Workflow, Mediator        │
├─────────────────┼───────────────────────────────────────────────┤
│ Controller      │ Makes decisions, handles events                 │
│                 │ Examples: StateMachine, PolicyEnforcer          │
├─────────────────┼───────────────────────────────────────────────┤
│ Interfacer      │ Translates information between systems / layers │
│                 │ Examples: Adapter, Gateway, Facade              │
└─────────────────┴───────────────────────────────────────────────┘
```

## Process

### Step 1: Identify candidate objects

Extract nouns and verbs from the requirements:

```
Requirement: "A customer places an order to buy products. The order is shipped to the customer's address after validation."

Nouns (potential objects):
├── Customer
├── Order
├── Product
├── Address
└── Shipment

Verbs (potential responsibilities):
├── place order
├── validate order
├── ship
└── compute total
```

### Step 2: Assign responsibilities

For each object, define what it knows and what it does:

```
┌─────────────────────────────────────────────────────────────────┐
│ Object: Order                                                   │
├─────────────────────────────────────────────────────────────────┤
│ KNOWING:                                                         │
│ ├── Knows its line items                                         │
│ ├── Knows its customer                                           │
│ ├── Knows its status                                             │
│ └── Knows its total amount                                       │
├─────────────────────────────────────────────────────────────────┤
│ DOING:                                                           │
│ ├── Add / remove line items                                      │
│ ├── Compute the total                                            │
│ ├── Validate itself                                              │
│ └── Change status                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Define collaborations

Who needs to communicate with whom?

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

### Step 4: Create CRC cards

The classic CRC (Class-Responsibility-Collaborator) format:

```
┌─────────────────────────────────────────────────────────────────┐
│ Class: Order                                          Stereotype │
│                                                      [Coordinator]│
├─────────────────────────────────────────────────────────────────┤
│ Responsibilities:             │ Collaborators:                   │
│                                 │                               │
│ - Manage line items             │ LineItem                      │
│ - Compute the total             │ PricingService                │
│ - Validate the order            │ OrderValidator                │
│ - Track status changes          │ OrderStatus                   │
│ - Request shipment              │ ShippingService               │
│                                 │                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Class: OrderValidator                                 Stereotype │
│                                                  [Service provider]│
├─────────────────────────────────────────────────────────────────┤
│ Responsibilities:             │ Collaborators:                   │
│                                 │                               │
│ - Check the order has products  │ Order                         │
│ - Validate customer credit      │ Customer, CreditService       │
│ - Verify product availability   │ Product, InventoryService     │
│ - Return the validation result  │ ValidationResult              │
│                                 │                               │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Review responsibility assignment

Apply the GRASP principles:

```
Responsibility review:

□ Information Expert:
  Does the object holding the information also carry the related responsibility?

□ Creator:
  Should A create B? (A contains B, A aggregates B, A closely uses B)

□ Low Coupling:
  Are dependencies minimized? Can objects work independently?

□ High Cohesion:
  Are the responsibilities consistent? Are they single-focused?

□ Controller:
  Is there a clear handler for system events?

□ Polymorphism:
  Can behavior vary by type instead of by conditionals?
```

### Step 6: Spot design smells

Watch for these anti-patterns:

```
Design smells:

❌ God object: one class does everything
   Fix: split responsibilities into focused objects

❌ Feature envy: an object overuses another object's data
   Fix: move the behavior to the data owner

❌ Data class: an object holds only data, no behavior
   Fix: add responsibilities or merge with another object

❌ Shotgun surgery: one change requires editing many classes
   Fix: consolidate related responsibilities

❌ Inappropriate intimacy: classes are too tightly coupled
   Fix: introduce an interface or a mediator
```

## Output

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
  "collaboration_diagram": "...",
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

## Invocation example

```
AI: Launching responsibility-modeler to design the object model...

🎯 Responsibility-driven design results:

Objects identified:
┌─────────────────┬─────────────────┬─────────────────────────────┐
│ Object          │ Stereotype      │ Key responsibilities          │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ Order           │ Coordinator     │ Orchestrate the order lifecycle│
│ LineItem        │ Information holder│ Knows the product and quantity │
│ OrderValidator  │ Service provider │ Validate order rules           │
│ ShippingService │ Service provider │ Compute and create shipments   │
│ OrderRepository │ Structurer       │ Store and retrieve orders      │
└─────────────────┴─────────────────┴─────────────────────────────┘

CRC cards generated: 5

Collaboration flow:
Customer → Order → OrderValidator → InventoryService
              ↓
        ShippingService → Shipment

GRASP analysis:
✅ Information Expert: Order computes its own total
✅ Creator: Order creates LineItems
✅ Low Coupling: services are interface-based
⚠️ Cohesion: OrderValidator may be doing too much

Design smells found:
⚠️ OrderValidator has 7 responsibilities → consider splitting

Recommendations:
1. Extract a CreditValidator out of OrderValidator
2. Consider a strategy pattern for shipping calculation
```

## Configuration options

```yaml
config:
  include_crc_cards: true
  check_grasp: true
  output: "object_model"
```

## References

- **Object Design: Roles, Responsibilities, and Collaborations** — Rebecca Wirfs-Brock (2002)
- **Designing Object-Oriented Software** — Wirfs-Brock, Wilkerson, Wiener (1990)
- **Applying UML and Patterns** — Craig Larman (GRASP patterns)
