---
name: software-methodology-toolkit
description: "FALLBACK ONLY: Comprehensive software engineering methodology toolkit with 10 proven agents. Only use when no project-specific skill (like requirement-workflow) matches. Provides: problem-definer (Weinberg), story-mapper (Patton), spec-by-example (Adzic), domain-modeler (DDD/Evans), responsibility-modeler (CRC/Wirfs-Brock), architecture-advisor (quality attributes/Bass), tdd-coach (Beck), refactoring-guide (Fowler), legacy-surgeon (Feathers), test-strategist (Crispin). Triggers ONLY if project skills don't match."
metadata:
  author: "learnwy"
  version: "2.0"
---

# Software Methodology Toolkit

A comprehensive collection of 10 proven software engineering methodologies, each implemented as a specialized agent. This skill provides systematic guidance across the entire software development lifecycle.

> **Core principle**: This is a FALLBACK skill. Project-specific skills always take priority. Use this toolkit only when no project-level adaptation exists.

## Prerequisites

- No runtime dependencies (methodology-only skill, no scripts)
- Works with any project in any language

## Priority Notice

| Condition | Action |
|-----------|--------|
| Project has context-specific skills (e.g. `requirement-workflow`) | Use project skill instead |
| No project-specific adaptation exists | Use this toolkit |
| User explicitly requests vanilla methodology | Use this toolkit |
| Project skill has Hook Points or custom outputs | Project skill takes priority |

## Agent Summary

| Phase | Agent | Methodology | Author |
|-------|-------|-------------|--------|
| Analyzing | [problem-definer](agents/analyzing/problem-definer.md) | Six Questions Framework | Weinberg & Gause |
| Analyzing | [spec-by-example](agents/analyzing/spec-by-example.md) | Specification by Example | Gojko Adzic |
| Planning | [story-mapper](agents/planning/story-mapper.md) | User Story Mapping | Jeff Patton |
| Designing | [domain-modeler](agents/designing/domain-modeler.md) | Domain-Driven Design | Eric Evans |
| Designing | [responsibility-modeler](agents/designing/responsibility-modeler.md) | CRC / Responsibility-Driven Design | Rebecca Wirfs-Brock |
| Designing | [architecture-advisor](agents/designing/architecture-advisor.md) | Quality Attribute Analysis | Bass, Clements, Kazman |
| Implementing | [tdd-coach](agents/implementing/tdd-coach.md) | Test-Driven Development | Kent Beck |
| Implementing | [refactoring-guide](agents/implementing/refactoring-guide.md) | Refactoring Catalog | Martin Fowler |
| Implementing | [legacy-surgeon](agents/implementing/legacy-surgeon.md) | Working with Legacy Code | Michael Feathers |
| Testing | [test-strategist](agents/testing/test-strategist.md) | Agile Testing Quadrants | Lisa Crispin |

## Routing Decision Table

When the user's request arrives, select an agent using the first matching row:

| User Signal | Agent | Confidence |
|-------------|-------|------------|
| "define the problem", "what's the real problem", stakeholder conflict | problem-definer | High |
| "specification by example", "concrete examples", "acceptance criteria" | spec-by-example | High |
| "story mapping", "user journey", "release planning", "MVP scope" | story-mapper | High |
| "DDD", "domain model", "bounded context", "aggregate design" | domain-modeler | High |
| "CRC cards", "object responsibilities", "GRASP", "collaboration design" | responsibility-modeler | High |
| "architecture decision", "quality attributes", "trade-off analysis", "ADR" | architecture-advisor | High |
| "TDD", "test-driven", "red-green-refactor", "test first" | tdd-coach | High |
| "refactor", "code smell", "improve code quality", "clean up code" | refactoring-guide | High |
| "legacy code", "working effectively", "seam", "characterization test" | legacy-surgeon | High |
| "test strategy", "test quadrants", "test pyramid", "test coverage" | test-strategist | High |
| Requirements unclear or contradictory | problem-definer | Medium |
| Planning a new product or feature from scratch | story-mapper | Medium |
| Complex business rules need modeling | domain-modeler | Medium |
| Making technology or architecture choices | architecture-advisor | Medium |
| Untested or legacy codebase | legacy-surgeon | Medium |
| No clear signal but methodology help requested | problem-definer (default entry point) | Low |

If confidence is Low, confirm agent selection with the user before proceeding.

## Available Methodologies

### Analyzing Phase

#### [problem-definer](agents/analyzing/problem-definer.md)
Apply Weinberg's Six Questions Framework to systematically define problems.

**Use when:**
- Requirements are unclear or contradictory
- Stakeholders disagree on what the problem is
- Solutions keep missing the mark
- Need to identify the REAL problem

**Triggers:** "define the problem", "what's the real problem", "stakeholder analysis"

---

#### [spec-by-example](agents/analyzing/spec-by-example.md)
Create living documentation through concrete examples (Gojko Adzic).

**Use when:**
- Requirements are vague
- Need executable specifications
- Building shared understanding between business and tech
- Want tests that serve as documentation

**Triggers:** "specification by example", "concrete examples", "acceptance criteria"

---

### Planning Phase

#### [story-mapper](agents/planning/story-mapper.md)
Create user story maps to visualize user journeys and prioritize releases (Jeff Patton).

**Use when:**
- Planning products or features
- Backlog lacks context
- Deciding MVP scope
- Need to see the big picture

**Triggers:** "story mapping", "user journey", "release planning", "MVP scope"

---

### Designing Phase

#### [domain-modeler](agents/designing/domain-modeler.md)
Apply Domain-Driven Design to model complex business domains (Eric Evans).

**Use when:**
- Designing bounded contexts
- Creating aggregates and entities
- Establishing ubiquitous language
- Modeling complex business rules

**Triggers:** "DDD", "domain model", "bounded context", "aggregate design"

---

#### [responsibility-modeler](agents/designing/responsibility-modeler.md)
Design objects by their responsibilities and collaborations (Rebecca Wirfs-Brock).

**Use when:**
- Designing OO systems
- Objects have unclear responsibilities
- Running CRC sessions
- Applying GRASP principles

**Triggers:** "CRC cards", "object responsibilities", "GRASP", "collaboration design"

---

#### [architecture-advisor](agents/designing/architecture-advisor.md)
Analyze software architecture decisions using quality attributes (Bass, Clements, Kazman).

**Use when:**
- Making architectural decisions
- Evaluating technology choices
- Analyzing trade-offs
- Defining quality attribute scenarios

**Triggers:** "architecture decision", "quality attributes", "trade-off analysis", "ADR"

---

### Implementing Phase

#### [tdd-coach](agents/implementing/tdd-coach.md)
Guide Test-Driven Development practice (Kent Beck).

**Use when:**
- Implementing features from scratch
- Learning TDD
- Stuck on implementation approach
- Need test-first discipline

**Triggers:** "TDD", "test-driven", "red-green-refactor", "test first"

---

#### [refactoring-guide](agents/implementing/refactoring-guide.md)
Identify code smells and apply refactoring techniques (Martin Fowler).

**Use when:**
- Code quality needs improvement
- Before adding features to messy code
- During code reviews
- Paying down tech debt

**Triggers:** "refactor", "code smell", "improve code quality", "clean up code"

---

#### [legacy-surgeon](agents/implementing/legacy-surgeon.md)
Safely modify legacy code without tests (Michael Feathers).

**Use when:**
- Working with untested code
- Adding features to legacy systems
- Breaking dependencies for testability
- Need characterization tests

**Triggers:** "legacy code", "working effectively", "seam", "characterization test"

---

### Testing Phase

#### [test-strategist](agents/testing/test-strategist.md)
Plan comprehensive test strategies using Agile Testing Quadrants (Lisa Crispin).

**Use when:**
- Deciding what types of tests to write
- Reviewing test coverage
- Optimizing test suites
- Planning test distribution

**Triggers:** "test strategy", "test quadrants", "test pyramid", "test coverage"

---

## How to Use

Mention the methodology or trigger phrase, and this skill invokes the appropriate agent:

```
User: "Help me define the problem for this vague requirement"
  → Invokes problem-definer agent

User: "Let's apply DDD to model this e-commerce domain"
  → Invokes domain-modeler agent

User: "I need to refactor this messy class"
  → Invokes refactoring-guide agent

User: "Plan test strategy for authentication feature"
  → Invokes test-strategist agent
```

## Methodology Workflows

These methodologies compose into common workflows:

### New Feature Workflow
1. **problem-definer** → Define the real problem
2. **story-mapper** → Map user journey
3. **spec-by-example** → Create concrete examples
4. **domain-modeler** → Model domain concepts
5. **tdd-coach** → Implement with TDD
6. **test-strategist** → Verify test coverage

### Legacy Code Workflow
1. **problem-definer** → Understand why change is needed
2. **legacy-surgeon** → Break dependencies safely
3. **refactoring-guide** → Identify and fix smells
4. **test-strategist** → Add appropriate tests

### Architecture Workflow
1. **problem-definer** → Clarify requirements
2. **domain-modeler** → Model bounded contexts
3. **architecture-advisor** → Analyze quality attributes
4. **responsibility-modeler** → Design object responsibilities

## Agent Output Contract

All agents in this toolkit follow the same output rules:

| Allowed | Not Allowed |
|---------|-------------|
| Analysis and structured reports | Writing or generating code |
| Recommendations with trade-offs | Making decisions for the user |
| Diagrams and models (textual) | Running commands or modifying files |
| Questions to clarify understanding | Producing unstructured prose |

Every agent output must include:
1. **Context summary** — What was analyzed
2. **Findings** — Structured analysis results
3. **Recommendations** — Ranked options with trade-offs
4. **Next steps** — What the user should do next

## Error Handling

| Issue | Solution |
|-------|----------|
| User's request matches no agent trigger | Default to problem-definer as the entry point |
| User's request matches multiple agents | Use Routing Decision Table; pick highest-confidence match |
| Low-confidence routing (no explicit trigger) | Confirm agent selection with user before proceeding |
| Project-specific skill exists for this task | Delegate to project skill, do not invoke this toolkit |
| Agent output is too abstract for user | Ask user for concrete context, re-run agent with specifics |
| User expects code generation from agent | Clarify agent scope (analysis only), suggest tdd-coach for implementation guidance |
| Workflow step produces incomplete output | Do not advance; re-run current agent with missing inputs |

## Execution Checklist

Before invoking any agent, verify:

- [ ] No project-specific skill matches the request (fallback rule)
- [ ] Agent selection follows the Routing Decision Table
- [ ] Low-confidence selections are confirmed with the user
- [ ] Agent receives sufficient context (problem statement, code references, constraints)

After agent produces output, verify:

- [ ] Output follows the Agent Output Contract (no code, no commands)
- [ ] Recommendations include trade-offs, not just a single answer
- [ ] Next steps are actionable
- [ ] If part of a workflow, the next agent in sequence is identified

## Boundary Enforcement

This skill ONLY handles:
- Routing user requests to the correct methodology agent
- Providing structured analysis, recommendations, and reports
- Composing agents into multi-step methodology workflows
- Serving as the fallback when no project-specific skill matches

This skill does NOT handle:
- Code generation or modification → use IDE capabilities directly
- Project-specific workflow orchestration → delegate to `requirement-workflow`
- Script execution or file I/O → no runtime dependencies exist
- Agent creation or installation → delegate to `project-agent-writer`
- Skill creation → delegate to `project-skill-writer`
- Rule creation → delegate to `trae-rules-writer`

## References

This toolkit is based on these seminal works:

- **Are Your Lights On?** — Weinberg & Gause (1982)
- **User Story Mapping** — Jeff Patton (2014)
- **Specification by Example** — Gojko Adzic (2011)
- **Domain-Driven Design** — Eric Evans (2003)
- **Object Design** — Rebecca Wirfs-Brock (2002)
- **Software Architecture in Practice** — Bass, Clements, Kazman (2021)
- **Test Driven Development** — Kent Beck (2003)
- **Refactoring** — Martin Fowler (2018)
- **Working Effectively with Legacy Code** — Michael Feathers (2004)
- **Agile Testing** — Lisa Crispin & Janet Gregory (2009)
