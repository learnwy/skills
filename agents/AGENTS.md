# Software Engineering Methodology Agents

Universal agents based on classic software engineering books. These agents encapsulate timeless methodologies that can be applied across different contexts.

## Organization

Each agent is a folder containing:
- `agent.md` — Core methodology (universal, no context-specific logic)

When used in skills (like `requirement-workflow`), create an adapted version that:
1. References the core methodology
2. Adds context-specific logic (Hook Points, output formats, etc.)

## Available Agents

### Requirements Analysis

| Agent | Based On | Purpose |
|-------|----------|---------|
| [problem-definer](problem-definer/agent.md) | Are Your Lights On? (Weinberg) | Systematic problem definition |
| [spec-by-example](spec-by-example/agent.md) | Specification by Example (Adzic) | Living documentation through examples |
| [story-mapper](story-mapper/agent.md) | User Story Mapping (Patton) | User journey visualization |

### Object & Domain Modeling

| Agent | Based On | Purpose |
|-------|----------|---------|
| [responsibility-modeler](responsibility-modeler/agent.md) | Object Design (Wirfs-Brock) | Responsibility-Driven Design |
| [domain-modeler](domain-modeler/agent.md) | Domain-Driven Design (Evans) | Strategic & tactical DDD |

### Architecture & Design

| Agent | Based On | Purpose |
|-------|----------|---------|
| [architecture-advisor](architecture-advisor/agent.md) | Software Architecture in Practice, DDIA | Quality attributes & trade-offs |

### Implementation

| Agent | Based On | Purpose |
|-------|----------|---------|
| [refactoring-guide](refactoring-guide/agent.md) | Refactoring (Fowler) | Code smells & refactoring techniques |
| [tdd-coach](tdd-coach/agent.md) | TDD by Example (Beck) | Test-Driven Development guidance |
| [legacy-surgeon](legacy-surgeon/agent.md) | Working Effectively with Legacy Code (Feathers) | Safe legacy code modification |

### Testing

| Agent | Based On | Purpose |
|-------|----------|---------|
| [test-strategist](test-strategist/agent.md) | Agile Testing, xUnit Patterns | Test strategy & planning |

## Usage Pattern

### Direct Usage (Generic)

```
AI: Use problem-definer agent to analyze this requirement...
```

### Via Skill (Adapted)

```
# In requirement-workflow skill:
# Uses adapted version with Hook Point and workflow integration
AI: Launching problem-definer at pre_stage_ANALYZING...
```

## Contribution

When updating an agent:
1. Update the core version in `agents/{agent-name}/agent.md`
2. Propagate changes to adapted versions in skill directories
3. Follow the sync rule: `.trae/rules/agent-sync.md`

## References

See each agent's `agent.md` for detailed references to source materials.
