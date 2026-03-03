# domain-modeler

Domain-Driven Design modeling agent based on Eric Evans' "Domain-Driven Design: Tackling Complexity in the Heart of Software".

## When to Use

- When designing complex business domains
- When multiple teams need shared understanding
- When technical and domain language diverge
- When defining service boundaries
- When modeling aggregates and entities

## Hook Point

`pre_stage_DESIGNING`

## Core Philosophy

> "The heart of software is its ability to solve domain-related problems for its users." — Eric Evans

Software design should mirror the business domain. When code speaks the same language as domain experts, bugs decrease and understanding increases.

## DDD Building Blocks

### Strategic Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    Bounded Contexts                             │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Sales      │    │  Shipping    │    │  Inventory   │      │
│  │   Context    │◀──▶│   Context    │◀──▶│   Context    │      │
│  │              │    │              │    │              │      │
│  │ • Customer   │    │ • Shipment   │    │ • Product    │      │
│  │ • Order      │    │ • Address    │    │ • Stock      │      │
│  │ • Quote      │    │ • Carrier    │    │ • Warehouse  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         └───────────────────┴───────────────────┘               │
│                    Context Mapping                              │
└─────────────────────────────────────────────────────────────────┘
```

### Tactical Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    DDD Building Blocks                          │
├─────────────────┬───────────────────────────────────────────────┤
│ Entity          │ Has identity, lifecycle, mutable              │
│                 │ Example: Order, Customer, Product             │
├─────────────────┼───────────────────────────────────────────────┤
│ Value Object    │ No identity, immutable, replaceable           │
│                 │ Example: Money, Address, DateRange            │
├─────────────────┼───────────────────────────────────────────────┤
│ Aggregate       │ Cluster of entities with consistency boundary │
│                 │ Example: Order (root) + LineItems             │
├─────────────────┼───────────────────────────────────────────────┤
│ Domain Service  │ Stateless operation that doesn't belong to    │
│                 │ any entity. Example: PaymentProcessor         │
├─────────────────┼───────────────────────────────────────────────┤
│ Domain Event    │ Something significant that happened           │
│                 │ Example: OrderPlaced, PaymentReceived         │
├─────────────────┼───────────────────────────────────────────────┤
│ Repository      │ Collection-like interface to aggregates       │
│                 │ Example: OrderRepository, CustomerRepository  │
├─────────────────┼───────────────────────────────────────────────┤
│ Factory         │ Creates complex aggregates                    │
│                 │ Example: OrderFactory                         │
└─────────────────┴───────────────────────────────────────────────┘
```

## Process

### Step 1: Establish Ubiquitous Language

Create a shared vocabulary:

```
Ubiquitous Language Glossary:

┌─────────────────┬───────────────────────────────────────────────┐
│ Term            │ Definition                                    │
├─────────────────┼───────────────────────────────────────────────┤
│ Order           │ A customer's request to purchase products     │
│                 │ with committed pricing and delivery terms     │
├─────────────────┼───────────────────────────────────────────────┤
│ Cart            │ A temporary collection of items BEFORE        │
│                 │ order placement (NOT an Order)                │
├─────────────────┼───────────────────────────────────────────────┤
│ Fulfillment     │ The process of picking, packing, and shipping │
│                 │ an order to the customer                      │
├─────────────────┼───────────────────────────────────────────────┤
│ Backorder       │ An order accepted but not immediately         │
│                 │ fulfillable due to inventory shortage         │
└─────────────────┴───────────────────────────────────────────────┘

⚠️ Banned Terms (Confusing/Technical):
- "Record" (use specific entity name)
- "Data" (too vague)
- "Process" as noun (use specific action)
```

### Step 2: Identify Bounded Contexts

Separate contexts by:
- Different meanings of same term
- Different teams/departments
- Different rates of change
- Different deployment needs

```
Context Identification:

Question: Does "Customer" mean the same thing everywhere?

Sales Context:
  Customer = potential buyer with purchase history and preferences

Shipping Context:
  Customer = delivery recipient with address and contact info

Accounting Context:
  Customer = billable entity with payment terms and credit limit

→ THREE different bounded contexts!
```

### Step 3: Map Context Relationships

```
Context Mapping Patterns:

┌─────────────────┬───────────────────────────────────────────────┐
│ Pattern         │ Description                                   │
├─────────────────┼───────────────────────────────────────────────┤
│ Shared Kernel   │ Two contexts share a subset of the model      │
│                 │ Risk: Coordination overhead                   │
├─────────────────┼───────────────────────────────────────────────┤
│ Customer/       │ Downstream adapts to upstream's model         │
│ Supplier        │ Upstream has no obligation to downstream      │
├─────────────────┼───────────────────────────────────────────────┤
│ Conformist      │ Downstream slavishly follows upstream         │
│                 │ No translation, just use their model          │
├─────────────────┼───────────────────────────────────────────────┤
│ Anti-corruption │ Downstream translates upstream concepts       │
│ Layer (ACL)     │ Protects model integrity                      │
├─────────────────┼───────────────────────────────────────────────┤
│ Open Host       │ Upstream provides well-defined protocol       │
│ Service         │ Multiple downstreams can integrate easily     │
├─────────────────┼───────────────────────────────────────────────┤
│ Published       │ Shared language for integration               │
│ Language        │ Often combined with Open Host Service         │
└─────────────────┴───────────────────────────────────────────────┘
```

### Step 4: Design Aggregates

```
Aggregate Design Rules:

Rule 1: Protect Invariants
  Order aggregate ensures: total = sum(lineItem.subtotal)
  
Rule 2: Reference by ID Only
  Order → CustomerId (not Customer object)
  
Rule 3: One Transaction = One Aggregate
  Don't modify Order and Inventory in same transaction
  
Rule 4: Keep Aggregates Small
  Order contains LineItems (small)
  Order does NOT contain Customer (separate aggregate)

Example Aggregate:
┌─────────────────────────────────────────────────────────────────┐
│ <<Aggregate Root>>                                              │
│ Order                                                           │
│ ├── orderId: OrderId (identity)                                 │
│ ├── customerId: CustomerId (reference)                          │
│ ├── status: OrderStatus (value object)                          │
│ ├── lineItems: List<LineItem> (entities, owned)                 │
│ ├── shippingAddress: Address (value object)                     │
│ └── total: Money (value object, computed)                       │
│                                                                 │
│ Invariants:                                                     │
│ - Must have at least one line item                              │
│ - Total must equal sum of line items                            │
│ - Cannot modify after shipment                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Identify Domain Events

```
Domain Events Pattern:

Event: OrderPlaced
├── Trigger: Customer confirms order
├── Data: orderId, customerId, total, items, timestamp
├── Consumers:
│   ├── InventoryContext → Reserve stock
│   ├── PaymentContext → Initiate payment
│   └── NotificationContext → Send confirmation
└── Idempotency: Use orderId to prevent duplicate processing

Event Storming Output:
┌─────────┐    ┌─────────────┐    ┌─────────────┐
│Customer │───▶│ OrderPlaced │───▶│ Stock       │
│places   │    │   Event     │    │ Reserved    │
│order    │    └─────────────┘    └─────────────┘
│         │           │
│         │           ▼
│         │    ┌─────────────┐
│         │    │ Payment     │
│         │    │ Initiated   │
│         │    └─────────────┘
```

### Step 6: Apply Design Patterns

```
Common DDD Patterns:

Repository Pattern:
interface OrderRepository {
    Order findById(OrderId id);
    void save(Order order);
    List<Order> findByCustomer(CustomerId customerId);
}

Factory Pattern:
class OrderFactory {
    Order createOrder(CustomerId customer, List<LineItemSpec> items) {
        // Complex creation logic with validation
        // Ensures Order is always valid when created
    }
}

Domain Service:
class PricingService {
    Money calculatePrice(Order order, DiscountPolicy policy) {
        // Cross-aggregate pricing logic
        // Does not fit in Order or DiscountPolicy alone
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

## Example Invocation

```
AI: Launching domain-modeler to design the domain model...

🏛️ Domain-Driven Design Results:

Ubiquitous Language (12 terms defined)
Key Terms:
- Order: Customer's committed purchase request
- Fulfillment: Pick, pack, ship process
- Backorder: Accepted but delayed order

Bounded Contexts Identified:
┌─────────────────────────────────────────────────────────────────┐
│ Sales Context          │ Shipping Context    │ Inventory Context│
│ • Order management     │ • Shipment tracking │ • Stock levels   │
│ • Pricing              │ • Carrier selection │ • Warehouses     │
│ • Customer profiles    │ • Delivery windows  │ • Reservations   │
└─────────────────────────────────────────────────────────────────┘

Context Map:
Sales ──[Customer/Supplier]──▶ Shipping
Sales ──[ACL]──▶ Legacy ERP
Inventory ──[Open Host]──▶ Sales, Shipping

Key Aggregates:
1. Order (root: Order, contains: LineItem)
   Invariant: total = sum(lineItems.subtotal)
   
2. Customer (root: Customer, contains: Address[])
   Invariant: must have primary address

Domain Events:
- OrderPlaced → triggers Inventory.ReserveStock
- PaymentReceived → triggers Shipping.CreateShipment
- ShipmentDelivered → triggers Sales.CompleteOrder

⚠️ Design Recommendations:
1. Consider CQRS for Order queries (complex reporting needs)
2. Add ACL for legacy ERP integration
3. Order aggregate too large? Consider extracting Payment
```

## Config Options

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
