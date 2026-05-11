# Per-agent Detail

When-to-use + trigger phrases for each of the 10 methodology agents. Use this when the routing decision table in SKILL.md doesn't fit the situation cleanly.

## Analysis

### [problem-definer](../agents/analyzing/problem-definer.md)
Apply Weinberg & Gause's six-question framing.

- Requirements unclear or conflicting
- Stakeholders disagree on the problem
- Solutions keep missing the target
- Need to identify the *real* problem

Triggers: "define the problem", "what is the real problem", "stakeholder analysis"

### [spec-by-example](../agents/analyzing/spec-by-example.md)
Living documentation through concrete examples (Gojko Adzic).

- Vague requirements
- Need executable specifications
- Build shared understanding between business and tech
- Want tests that double as documentation

Triggers: "spec by example", "concrete examples", "acceptance criteria"

## Planning

### [story-mapper](../agents/planning/story-mapper.md)
User story maps to visualise the journey and prioritise releases (Jeff Patton).

- Planning a product or feature
- Backlog lacks context
- Pinning down MVP scope
- Need to see the whole picture

Triggers: "story map", "user journey", "release planning", "MVP scope"

## Design

### [domain-modeler](../agents/designing/domain-modeler.md)
Model complex business domains with Domain-Driven Design (Eric Evans).

- Designing bounded contexts
- Creating aggregates and entities
- Building a ubiquitous language
- Modelling complex business rules

Triggers: "DDD", "domain model", "bounded context", "aggregate"

### [responsibility-modeler](../agents/designing/responsibility-modeler.md)
Design objects by responsibilities and collaborations (Wirfs-Brock).

- Designing OO systems
- Object responsibilities are unclear
- Running CRC card sessions
- Applying GRASP principles

Triggers: "CRC card", "object responsibility", "GRASP", "collaboration design"

### [architecture-advisor](../agents/designing/architecture-advisor.md)
Analyse architecture decisions through quality attributes (Bass, Clements, Kazman).

- Making architecture decisions
- Evaluating tech choices
- Trade-off analysis
- Defining quality-attribute scenarios

Triggers: "architecture decision", "quality attribute", "trade-off analysis", "ADR"

## Implementation

### [tdd-coach](../agents/implementing/tdd-coach.md)
Coach test-driven development (Kent Beck).

- Implementing a feature from zero
- Learning TDD
- Stuck on implementation
- Need test-first discipline

Triggers: "TDD", "test-driven", "red-green-refactor", "tests first"

### [refactoring-guide](../agents/implementing/refactoring-guide.md)
Spot code smells and apply refactoring techniques (Martin Fowler).

- Code quality needs to improve
- Before adding a feature to messy code
- During code review
- Repaying technical debt

Triggers: "refactor", "code smell", "improve quality", "clean up code"

### [legacy-surgeon](../agents/implementing/legacy-surgeon.md)
Safely modify untested legacy code (Michael Feathers).

- Working with code that has no tests
- Adding features to legacy systems
- Breaking dependencies for testability
- Need characterization tests

Triggers: "legacy code", "working effectively", "seam", "characterization test"

## Testing

### [test-strategist](../agents/testing/test-strategist.md)
Plan a comprehensive test strategy via the agile testing quadrants (Lisa Crispin).

- Deciding what kinds of tests to write
- Reviewing test coverage
- Optimising the test suite
- Planning test distribution

Triggers: "test strategy", "test quadrant", "test pyramid", "test coverage"
