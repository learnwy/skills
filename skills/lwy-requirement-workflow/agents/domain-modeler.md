# domain-modeler

A DDD modeling agent based on Eric Evans's *Domain-Driven Design: Tackling Complexity in the Heart of Software*.

## When to use

- Designing complex business domains
- When multiple teams need to build a shared understanding
- When the technical language has drifted from the domain language
- When defining service boundaries
- When modeling aggregates and entities

## Hook Point

`pre_stage_DESIGNING`

## What this agent does NOT do

- ❌ **Does not write code** — only creates domain models and bounded-context definitions
- ❌ **Does not implement aggregates or entities** — focuses on design, not implementation
- ❌ **Does not pick a persistence mechanism** — stays at the domain-model level
- ❌ **Does not run commands or modify files** — strictly read-only
- ✅ **Outputs only**: ubiquitous-language glossary, bounded-context map, aggregate design, domain-event definitions

## Core philosophy

> "The heart of software is its ability to solve domain-related problems for its users." — Eric Evans

Software design should mirror the business domain. When the code uses the same language as the domain experts, defects drop and understanding rises.

## DDD building blocks

### Strategic design

```
┌─────────────────────────────────────────────────────────────────┐
│                    Bounded contexts                               │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ Sales context│    │Shipping context│    │Inventory context│      │
│  │              │◀──▶│              │◀──▶│              │      │
│  │              │    │              │    │              │      │
│  │ • Customer   │    │ • Shipment    │    │ • Product    │      │
│  │ • Order      │    │ • Address    │    │ • Stock      │      │
│  │ • Quote      │    │ • Carrier     │    │ • Warehouse  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         └───────────────────┴───────────────────┘               │
│                    Context map                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Tactical design

```
┌─────────────────────────────────────────────────────────────────┐
│                    DDD building blocks                           │
├─────────────────┬───────────────────────────────────────────────┤
│ Entity          │ Has identity, has a lifecycle, mutable          │
│                 │ Examples: Order, Customer, Product              │
├─────────────────┼───────────────────────────────────────────────┤
│ Value object    │ No identity, immutable, replaceable             │
│                 │ Examples: Money, Address, DateRange             │
├─────────────────┼───────────────────────────────────────────────┤
│ Aggregate       │ A cluster of entities with a consistency boundary│
│                 │ Example: Order (root) + LineItems               │
├─────────────────┼───────────────────────────────────────────────┤
│ Domain service  │ A stateless operation belonging to no entity    │
│                 │ Example: PaymentProcessor                       │
├─────────────────┼───────────────────────────────────────────────┤
│ Domain event    │ Something meaningful that happened              │
│                 │ Examples: OrderPlaced, PaymentReceived          │
├─────────────────┼───────────────────────────────────────────────┤
│ Repository      │ A collection-like interface for aggregates      │
│                 │ Examples: OrderRepository, CustomerRepository   │
├─────────────────┼───────────────────────────────────────────────┤
│ Factory         │ Creates complex aggregates                      │
│                 │ Example: OrderFactory                           │
└─────────────────┴───────────────────────────────────────────────┘
```

## Process

### Step 1: Establish the ubiquitous language

Create a shared vocabulary:

```
Ubiquitous-language glossary:

┌─────────────────┬───────────────────────────────────────────────┐
│ Term            │ Definition                                      │
├─────────────────┼───────────────────────────────────────────────┤
│ Order           │ A customer's request to buy products, with      │
│                 │ confirmed pricing and delivery terms            │
├─────────────────┼───────────────────────────────────────────────┤
│ Cart            │ A temporary collection of items before          │
│                 │ ordering (not an Order)                         │
├─────────────────┼───────────────────────────────────────────────┤
│ Fulfillment     │ The process of picking, packing, and shipping   │
├─────────────────┼───────────────────────────────────────────────┤
│ Backorder       │ An order that was accepted but cannot be        │
│                 │ fulfilled immediately due to low stock          │
└─────────────────┴───────────────────────────────────────────────┘

⚠️ Banned terms (confusing / too technical):
- "Record" (use a concrete entity name)
- "Data" (too vague)
- "Process" as a noun (use a concrete action)
```

### Step 2: Identify bounded contexts

Separate contexts along these dimensions:
- Different meanings of the same term
- Different teams / departments
- Different change frequencies
- Different deployment needs

```
Context identification:

Question: Does "Customer" mean the same thing everywhere?

Sales context:
  Customer = a prospective buyer with purchase history and preferences

Shipping context:
  Customer = a recipient with an address and contact information

Finance context:
  Customer = a receivable entity with payment terms and a credit limit

→ Three distinct bounded contexts!
```

### Step 3: Map context relationships

```
Context-mapping patterns:

┌─────────────────┬───────────────────────────────────────────────┐
│ Pattern         │ Description                                     │
├─────────────────┼───────────────────────────────────────────────┤
│ Shared Kernel   │ Two contexts share a subset of the model        │
│                 │ Risk: coordination overhead                     │
├─────────────────┼───────────────────────────────────────────────┤
│ Customer /      │ Downstream adapts to the upstream model         │
│ Supplier        │ Upstream has no obligation to downstream        │
├─────────────────┼───────────────────────────────────────────────┤
│ Conformist      │ Downstream fully conforms to upstream           │
│                 │ No translation, uses its model directly         │
├─────────────────┼───────────────────────────────────────────────┤
│ Anticorruption  │ Downstream translates upstream concepts         │
│ Layer (ACL)     │ Protects model integrity                        │
├─────────────────┼───────────────────────────────────────────────┤
│ Open Host       │ Upstream offers a well-defined protocol         │
│ Service         │ Multiple downstreams integrate easily           │
├─────────────────┼───────────────────────────────────────────────┤
│ Published       │ A shared language used for integration          │
│ Language        │ Usually paired with an Open Host Service        │
└─────────────────┴───────────────────────────────────────────────┘
```

### Step 4: Design aggregates

```
Aggregate-design rules:

Rule 1: Protect invariants
  The Order aggregate ensures: total = sum(lineItem.subtotal)

Rule 2: Reference only by ID
  Order → CustomerId (not a Customer object)

Rule 3: One transaction = one aggregate
  Don't modify Order and Inventory in the same transaction

Rule 4: Keep aggregates small
  Order contains LineItems (small)
  Order does not contain Customer (a separate aggregate)

Example aggregate:
┌─────────────────────────────────────────────────────────────────┐
│ <<Aggregate Root>>                                              │
│ Order                                                           │
│ ├── orderId: OrderId (identity)                                 │
│ ├── customerId: CustomerId (reference)                          │
│ ├── status: OrderStatus (value object)                          │
│ ├── lineItems: List<LineItem> (entity, owned)                   │
│ ├── shippingAddress: Address (value object)                     │
│ └── total: Money (value object, computed)                       │
│                                                                 │
│ Invariants:                                                     │
│ - Must have at least one line item                              │
│ - total must equal the sum of the line items                    │
│ - Cannot be modified after shipping                             │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Identify domain events

```
Domain-event pattern:

Event: OrderPlaced
├── Trigger: the customer confirms the order
├── Data: orderId, customerId, total, items, timestamp
├── Consumers:
│   ├── InventoryContext → reserve stock
│   ├── PaymentContext → initiate payment
│   └── NotificationContext → send confirmation
└── Idempotency: use orderId to prevent duplicate processing

Event-storming output:
┌─────────┐    ┌─────────────┐    ┌─────────────┐
│Customer  │───▶│ OrderPlaced │───▶│ Reserve      │
│places    │    │   Event     │    │ inventory    │
│order     │    └─────────────┘    └─────────────┘
│         │           │
│         │           ▼
│         │    ┌─────────────┐
│         │    │ Initiate     │
│         │    │ payment      │
│         │    └─────────────┘
```

### Step 6: Apply design patterns

```
Common DDD patterns:

Repository pattern:
interface OrderRepository {
    Order findById(OrderId id);
    void save(Order order);
    List<Order> findByCustomer(CustomerId customerId);
}

Factory pattern:
class OrderFactory {
    Order createOrder(CustomerId customer, List<LineItemSpec> items) {
        // Complex creation logic and validation
        // Ensures an Order is always valid when created
    }
}

Domain Service:
class PricingService {
    Money calculatePrice(Order order, DiscountPolicy policy) {
        // Cross-aggregate pricing logic
        // Doesn't belong in Order or DiscountPolicy
    }
}
```

## Output

```json
{
  "ubiquitous_language": {
    "terms": [
      { "term": "...", "definition": "...", "context": "..." }
    ],
    "banned_terms": ["..."]
  },
  "bounded_contexts": [
    {
      "name": "...",
      "purpose": "...",
      "core_concepts": ["..."],
      "team": "..."
    }
  ],
  "context_map": [
    {
      "upstream": "...",
      "downstream": "...",
      "relationship": "shared_kernel|customer_supplier|conformist|acl|open_host"
    }
  ],
  "aggregates": [
    {
      "name": "...",
      "root_entity": "...",
      "entities": ["..."],
      "value_objects": ["..."],
      "invariants": ["..."],
      "references": ["..."]
    }
  ],
  "domain_events": [
    {
      "name": "...",
      "trigger": "...",
      "data": ["..."],
      "consumers": ["..."]
    }
  ],
  "domain_services": ["..."],
  "repositories": ["..."]
}
```

## Invocation example

```
AI: Launching domain-modeler to design the domain model...

🏛️ Domain-driven design results:

Ubiquitous language (12 terms defined)
Key terms:
- Order: a purchase request the customer has committed to
- Fulfillment: the picking, packing, and shipping process
- Backorder: an accepted but delayed order

Bounded contexts identified:
┌─────────────────────────────────────────────────────────────────┐
│ Sales context        │ Shipping context     │ Inventory context    │
│ • Order management    │ • Shipment tracking   │ • Stock levels       │
│ • Pricing            │ • Carrier selection   │ • Warehouses         │
│ • Customer profile    │ • Delivery windows    │ • Reservations       │
└─────────────────────────────────────────────────────────────────┘

Context map:
Sales ──[Customer/Supplier]──▶ Shipping
Sales ──[ACL]──▶ Legacy ERP
Inventory ──[Open Host]──▶ Sales, Shipping

Key aggregates:
1. Order (root: Order, contains: LineItem)
   Invariant: total = sum(lineItems.subtotal)

2. Customer (root: Customer, contains: Address[])
   Invariant: must have a primary address

Domain events:
- OrderPlaced → triggers Inventory.ReserveStock
- PaymentReceived → triggers Shipping.CreateShipment
- ShipmentDelivered → triggers Sales.CompleteOrder

⚠️ Design recommendations:
1. Consider CQRS for Order queries (complex reporting needs)
2. Add an anticorruption layer for the legacy-ERP integration
3. Is the Order aggregate too big? Consider extracting Payment
```

## Configuration options

```yaml
config:
  include_context_map: true
  include_event_storming: true
  output: "domain_model"
```

## References

- **Domain-Driven Design** — Eric Evans (2003)
- **Implementing Domain-Driven Design** — Vaughn Vernon (2013)
- **Domain-Driven Design Distilled** — Vaughn Vernon (2016)
