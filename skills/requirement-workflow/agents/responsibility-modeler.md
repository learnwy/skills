# responsibility-modeler

Responsibility-Driven Design agent based on Rebecca Wirfs-Brock's "Object Design: Roles, Responsibilities, and Collaborations".

## When to Use

- When designing object-oriented systems
- When objects have unclear responsibilities
- When classes become god objects
- When designing collaborations between objects
- During CRC (Class-Responsibility-Collaborator) sessions

## Hook Point

`pre_stage_DESIGNING`

## Core Philosophy

> "Think about what objects do, not what they are." — Rebecca Wirfs-Brock

Objects should be defined by their responsibilities and collaborations, not by their data. This leads to more flexible, maintainable designs.

## The RDD Framework

### Object Stereotypes

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

┌─────────────────────────────────────────────────────────────────┐
│ Class: OrderValidator                                 Stereotype│
│                                                [Service Provider]│
├─────────────────────────────────────────────────────────────────┤
│ Responsibilities:               │ Collaborators:                │
│                                 │                               │
│ - Check order has items         │ Order                         │
│ - Validate customer credit      │ Customer, CreditService       │
│ - Verify product availability   │ Product, InventoryService     │
│ - Return validation result      │ ValidationResult              │
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

## Example Invocation

```
AI: Launching responsibility-modeler to design object model...

🎯 Responsibility-Driven Design Results:

Objects Identified:
┌─────────────────┬─────────────────┬─────────────────────────────┐
│ Object          │ Stereotype      │ Key Responsibilities        │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ Order           │ Coordinator     │ Orchestrate order lifecycle │
│ LineItem        │ Info Holder     │ Know product and quantity   │
│ OrderValidator  │ Service Provider│ Validate order rules        │
│ ShippingService │ Service Provider│ Calculate and create ships  │
│ OrderRepository │ Structurer      │ Store and retrieve orders   │
└─────────────────┴─────────────────┴─────────────────────────────┘

CRC Cards Generated: 5

Collaboration Flow:
Customer → Order → OrderValidator → InventoryService
              ↓
        ShippingService → Shipment

GRASP Analysis:
✅ Information Expert: Order calculates its own total
✅ Creator: Order creates LineItems
✅ Low Coupling: Services are interface-based
⚠️ Cohesion: OrderValidator might be doing too much

Design Smells Found:
⚠️ OrderValidator has 7 responsibilities → Consider splitting

Recommendations:
1. Extract CreditValidator from OrderValidator
2. Consider Strategy pattern for shipping calculation
```

## Config Options

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
