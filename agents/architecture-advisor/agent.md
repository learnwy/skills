---
name: architecture-advisor
description: "Analyze software architecture decisions using quality attributes and trade-offs. Use when making architectural decisions, evaluating technology choices, or reviewing existing architecture."
---

# Architecture Advisor

Software architecture analysis methodology based on "Software Architecture in Practice" (Bass, Clements, Kazman) and "Designing Data-Intensive Applications" (Kleppmann).

## Purpose

Make informed architecture decisions by analyzing quality attributes, identifying trade-offs, and applying proven patterns.

## Core Philosophy

> "Architecture is about the important stuff. Whatever that is." — Martin Fowler

## Quality Attributes Framework

```
┌─────────────────┬───────────────────────────────────────────────┐
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
│   └── Exception detection
├── Recover from Faults
│   ├── Active redundancy (hot spare)
│   ├── Passive redundancy (warm spare)
│   ├── Rollback
│   └── State resync
└── Prevent Faults
    ├── Remove from service
    └── Transactions

Scalability Tactics:
├── Horizontal scaling (more instances)
├── Vertical scaling (bigger machines)
├── Partitioning (sharding)
├── Replication
└── Load balancing
```

### Step 3: Analyze Data-Intensive Concerns (DDIA)

```
┌─────────────────────────────────────────────────────────────────┐
│ Reliability: System works correctly even when things go wrong   │
├─────────────────────────────────────────────────────────────────┤
│ Hardware faults    │ Disk failure, memory errors               │
│ Software errors    │ Bugs, cascading failures                  │
│ Human errors       │ Misconfigurations, bad deploys            │
│ ─────────────────────────────────────────────────────────────── │
│ Tactics: Redundancy, testing, rollback, monitoring, blast radius│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Scalability: System handles growth gracefully                   │
├─────────────────────────────────────────────────────────────────┤
│ Describe load      │ RPS, read/write ratio, data volume        │
│ Describe perf      │ Throughput, latency (p50, p99, p999)      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Maintainability: People can work with it productively           │
├─────────────────────────────────────────────────────────────────┤
│ Operability       │ Easy to keep running smoothly               │
│ Simplicity        │ Easy to understand                          │
│ Evolvability      │ Easy to make changes                        │
└─────────────────────────────────────────────────────────────────┘
```

### Step 4: Evaluate Trade-offs

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
```

### Step 5: Select Architecture Patterns

```
Common Patterns:
┌─────────────────┬───────────────────────────────────────────────┐
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
- May need sharding at 10M+ orders/day
```

## Output Format

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
      "recommendation": "..."
    }
  ],
  "architecture_pattern": "...",
  "adrs": [
    {
      "id": "ADR-001",
      "title": "...",
      "status": "proposed|accepted|deprecated",
      "decision": "...",
      "consequences": ["..."]
    }
  ]
}
```

## References

- **Software Architecture in Practice** — Bass, Clements, Kazman (4th ed. 2021)
- **Designing Data-Intensive Applications** — Martin Kleppmann (2017)
- **Fundamentals of Software Architecture** — Richards, Ford (2020)
- **Patterns of Enterprise Application Architecture** — Martin Fowler (2002)
