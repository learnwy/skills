# architecture-advisor

Software architecture analysis agent based on "Software Architecture in Practice" (Bass, Clements, Kazman), "Designing Data-Intensive Applications" (Kleppmann), and "Fundamentals of Software Architecture" (Richards, Ford).

## When to Use

- When making significant architectural decisions
- When evaluating quality attribute trade-offs
- When designing distributed systems
- When reviewing existing architecture
- When selecting technology patterns

## Hook Point

`post_stage_DESIGNING`

## Core Philosophy

> "Architecture is about the important stuff. Whatever that is." — Martin Fowler

Architecture decisions are hard to change later. This agent helps make informed decisions by analyzing quality attributes, identifying trade-offs, and applying proven patterns.

## Quality Attributes Framework

### The "-ilities"

```
┌─────────────────────────────────────────────────────────────────┐
│                    Quality Attribute Categories                 │
├─────────────────┬───────────────────────────────────────────────┤
│ Performance     │ Latency, throughput, resource utilization     │
├─────────────────┼───────────────────────────────────────────────┤
│ Scalability     │ Handle growth in users, data, transactions    │
├─────────────────┼───────────────────────────────────────────────┤
│ Availability    │ Uptime, fault tolerance, recovery time        │
├─────────────────┼───────────────────────────────────────────────┤
│ Security        │ Authentication, authorization, data protection│
├─────────────────┼───────────────────────────────────────────────┤
│ Maintainability │ Ease of change, debugging, understanding      │
├─────────────────┼───────────────────────────────────────────────┤
│ Testability     │ Ease of testing, isolation, observability     │
├─────────────────┼───────────────────────────────────────────────┤
│ Deployability   │ CI/CD, rollback, environment parity           │
├─────────────────┼───────────────────────────────────────────────┤
│ Cost            │ Development, operation, licensing             │
└─────────────────┴───────────────────────────────────────────────┘
```

## Process

### Step 1: Identify Quality Attribute Requirements

Use scenarios to make requirements concrete:

```
Quality Attribute Scenario Template:

Source:     [Who/what triggers the scenario]
Stimulus:   [What happens]
Artifact:   [What part of system is affected]
Environment:[Under what conditions]
Response:   [How system should behave]
Measure:    [How to verify]

Example:
Source:     Peak traffic (Black Friday)
Stimulus:   100x normal load
Artifact:   Order service
Environment:Normal operation
Response:   Continue processing orders
Measure:    <500ms response time, 0% order loss
```

### Step 2: Apply Architecture Tactics

Tactics are design decisions that achieve quality attributes:

```
Performance Tactics:
├── Control Resource Demand
│   ├── Manage sampling rate
│   ├── Prioritize events
│   └── Reduce computational overhead
└── Manage Resources
    ├── Increase resources (scale up/out)
    ├── Introduce concurrency
    ├── Maintain data copies (caching)
    └── Bound queue sizes

Availability Tactics:
├── Detect Faults
│   ├── Ping/echo (health checks)
│   ├── Heartbeat
│   ├── Exception detection
│   └── Voting (consensus)
├── Recover from Faults
│   ├── Active redundancy (hot spare)
│   ├── Passive redundancy (warm spare)
│   ├── Spare (cold backup)
│   ├── Rollback
│   └── State resync
└── Prevent Faults
    ├── Remove from service
    ├── Transactions
    └── Predictive model

Scalability Tactics:
├── Horizontal scaling (more instances)
├── Vertical scaling (bigger machines)
├── Partitioning (sharding)
├── Replication
└── Load balancing
```

### Step 3: Analyze Data-Intensive Concerns (DDIA)

```
Data System Analysis:

┌─────────────────────────────────────────────────────────────────┐
│ Reliability: System works correctly even when things go wrong   │
├─────────────────────────────────────────────────────────────────┤
│ Hardware faults    │ Disk failure, memory errors                │
│ Software errors    │ Bugs, cascading failures                   │
│ Human errors       │ Misconfigurations, bad deploys             │
│ ─────────────────────────────────────────────────────────────── │
│ Tactics: Redundancy, testing, rollback, monitoring, blast radius│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Scalability: System handles growth gracefully                   │
├─────────────────────────────────────────────────────────────────┤
│ Describe load      │ RPS, read/write ratio, data volume         │
│ Describe perf      │ Throughput, latency (p50, p99, p999)       │
│ ─────────────────────────────────────────────────────────────── │
│ Approaches:                                                     │
│ • Scaling up (vertical) vs out (horizontal)                     │
│ • Stateless services (easy) vs stateful (hard)                  │
│ • Partitioning strategies                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Maintainability: People can work with it productively           │
├─────────────────────────────────────────────────────────────────┤
│ Operability       │ Easy to keep running smoothly               │
│ Simplicity        │ Easy to understand                          │
│ Evolvability      │ Easy to make changes                        │
│ ─────────────────────────────────────────────────────────────── │
│ Tactics: Abstractions, monitoring, documentation, automation    │
└─────────────────────────────────────────────────────────────────┘
```

### Step 4: Evaluate Trade-offs

Architecture is about trade-offs. Document them:

```
Trade-off Analysis Matrix:

Decision: Microservices vs Monolith

┌─────────────────┬──────────────────┬──────────────────┐
│ Attribute       │ Microservices    │ Monolith         │
├─────────────────┼──────────────────┼──────────────────┤
│ Scalability     │ ✅ Scale parts   │ ⚠️ Scale all     │
│ Deployability   │ ✅ Independent   │ ⚠️ All or nothing│
│ Complexity      │ ⚠️ Distributed   │ ✅ Simpler       │
│ Cost            │ ⚠️ Higher ops    │ ✅ Lower ops     │
│ Performance     │ ⚠️ Network hops  │ ✅ In-process    │
│ Consistency     │ ⚠️ Eventually    │ ✅ ACID          │
└─────────────────┴──────────────────┴──────────────────┘

Recommendation: Given team size (5) and domain complexity (medium),
start with modular monolith, extract services when pain points emerge.
```

### Step 5: Select Architecture Patterns

```
Architecture Pattern Decision Tree:

Q: How many users/transactions?
├── <1000 concurrent → Simple architecture
├── 1000-100000 → Traditional scalable
└── >100000 → Distributed systems required

Q: How critical is consistency?
├── Strong consistency → RDBMS, careful with distribution
├── Eventual okay → NoSQL, event sourcing options
└── Mixed → Hybrid approach

Q: How often does data change?
├── Read-heavy → Caching, read replicas, CDN
├── Write-heavy → Write optimization, sharding
└── Balanced → Depends on consistency needs

Common Patterns:
┌─────────────────────────────────────────────────────────────────┐
│ Pattern          │ When to Use                                  │
├─────────────────┼───────────────────────────────────────────────┤
│ Layered         │ Traditional web apps, clear separation       │
│ Microservices   │ Large teams, independent deployment needs    │
│ Event-Driven    │ Async processing, loose coupling needed      │
│ CQRS            │ Complex queries, different read/write models │
│ Event Sourcing  │ Audit trail, temporal queries needed         │
│ Hexagonal       │ Testability, swappable infrastructure        │
└─────────────────┴───────────────────────────────────────────────┘
```

### Step 6: Document Architecture Decision Records (ADRs)

```
ADR Template:

# ADR-001: Use PostgreSQL for order data

## Status
Accepted

## Context
Order service needs persistent storage for ~1M orders/day.
Need ACID for financial data. Team has PostgreSQL expertise.

## Decision
Use PostgreSQL with read replicas for scalability.

## Consequences
+ Strong consistency for financial data
+ Team expertise reduces risk
+ Mature ecosystem, good tooling
- May need sharding at 10M+ orders/day
- Vendor lock-in (acceptable)

## Alternatives Considered
- DynamoDB: Rejected due to learning curve, eventual consistency
- MongoDB: Rejected due to ACID requirements
```

## Output

```json
{
  "quality_attributes": [
    {
      "attribute": "...",
      "priority": "critical|high|medium|low",
      "scenario": {
        "source": "...",
        "stimulus": "...",
        "response": "...",
        "measure": "..."
      }
    }
  ],
  "tactics_applied": [
    {
      "quality": "...",
      "tactic": "...",
      "implementation": "..."
    }
  ],
  "trade_off_analysis": [
    {
      "decision": "...",
      "options": ["..."],
      "comparison": {...},
      "recommendation": "..."
    }
  ],
  "architecture_pattern": "...",
  "adrs": [
    {
      "id": "ADR-001",
      "title": "...",
      "status": "proposed|accepted|deprecated",
      "context": "...",
      "decision": "...",
      "consequences": ["..."]
    }
  ],
  "risks": ["..."],
  "questions": ["..."]
}
```

## Example Invocation

```
AI: Launching architecture-advisor to analyze architecture decisions...

🏗️ Architecture Analysis Results:

Quality Attribute Priorities:
┌─────────────────┬──────────┬────────────────────────────────────┐
│ Attribute       │ Priority │ Key Scenario                       │
├─────────────────┼──────────┼────────────────────────────────────┤
│ Availability    │ Critical │ 99.9% uptime, <5min recovery       │
│ Performance     │ High     │ <200ms p99 for order placement     │
│ Scalability     │ High     │ Handle 10x traffic during sales    │
│ Security        │ High     │ PCI-DSS compliance for payments    │
│ Maintainability │ Medium   │ New dev productive in 2 weeks      │
└─────────────────┴──────────┴────────────────────────────────────┘

Recommended Tactics:
├── Availability: Active-passive failover, circuit breakers
├── Performance: Caching (Redis), async processing (queues)
├── Scalability: Horizontal scaling, database read replicas
└── Security: Encryption at rest/transit, token-based auth

Architecture Pattern: Modular Monolith → Microservices path
Rationale: Team size (8) can manage boundaries now, extract later

Trade-off Analysis:
Decision: Sync vs Async order processing
Recommendation: Hybrid - sync for validation, async for fulfillment
Reason: UX requires immediate feedback, but fulfillment can be eventual

Key ADRs Generated:
1. ADR-001: PostgreSQL for order persistence
2. ADR-002: Redis for session/cache
3. ADR-003: RabbitMQ for async processing

⚠️ Risks:
- Single database could become bottleneck at 5M orders/day
- No current plan for multi-region deployment

❓ Questions for Stakeholders:
- What's the disaster recovery RPO/RTO?
- Is multi-region required for launch?
```

## Config Options

```yaml
config:
  include_adrs: true
  include_ddia_analysis: true
  depth: "comprehensive"
  output: "architecture_analysis"
```

## References

- **Software Architecture in Practice** — Bass, Clements, Kazman (4th ed. 2021)
- **Designing Data-Intensive Applications** — Martin Kleppmann (2017)
- **Fundamentals of Software Architecture** — Richards, Ford (2020)
- **Patterns of Enterprise Application Architecture** — Martin Fowler (2002)
