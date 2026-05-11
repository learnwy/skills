---
name: software-methodology-toolkit
description: "Fallback skill when no project-specific one matches. Provides 10 battle-tested software-engineering methodology agents: problem-definer (Weinberg), story-mapper (Patton), spec-by-example (Adzic), domain-modeler (DDD/Evans), responsibility-modeler (CRC/Wirfs-Brock), architecture-advisor (Bass), tdd-coach (Beck), refactoring-guide (Fowler), legacy-surgeon (Feathers), test-strategist (Crispin). Use when user asks about DDD, TDD, refactoring, story mapping, test strategy, or software-architecture quality attributes."
metadata:
  author: "learnwy"
  version: "3.0"
---

# Software Methodology Toolkit

Ten methodology agents covering analysis → planning → design → implementation → testing. Pure-prose skill — no scripts.

> **Fallback rule:** project-specific skills always win. Use this toolkit only when no project skill matches, OR when the user explicitly asks for the raw methodology.

The same 10 agents are also referenced by `requirement-workflow` (one default + opt-ins per phase) — see [requirement-workflow/agents/AGENTS.md](../requirement-workflow/agents/AGENTS.md). Use those phase contracts when a workflow is active; come back here for ad-hoc methodology queries.

## The 10 agents

| Phase | Agent | Methodology | Author |
|---|---|---|---|
| Analysis | [problem-definer](agents/analyzing/problem-definer.md) | Six-question framing | Weinberg & Gause |
| Analysis | [spec-by-example](agents/analyzing/spec-by-example.md) | Specification by example | Gojko Adzic |
| Planning | [story-mapper](agents/planning/story-mapper.md) | User story mapping | Jeff Patton |
| Design | [domain-modeler](agents/designing/domain-modeler.md) | Domain-driven design | Eric Evans |
| Design | [responsibility-modeler](agents/designing/responsibility-modeler.md) | CRC / responsibility-driven | Rebecca Wirfs-Brock |
| Design | [architecture-advisor](agents/designing/architecture-advisor.md) | Quality-attribute analysis | Bass, Clements, Kazman |
| Implementation | [tdd-coach](agents/implementing/tdd-coach.md) | Test-driven development | Kent Beck |
| Implementation | [refactoring-guide](agents/implementing/refactoring-guide.md) | Refactoring catalogue | Martin Fowler |
| Implementation | [legacy-surgeon](agents/implementing/legacy-surgeon.md) | Working with legacy code | Michael Feathers |
| Testing | [test-strategist](agents/testing/test-strategist.md) | Agile testing quadrants | Lisa Crispin |

## Routing decision table

Match the first row that fires:

| User signal | Agent | Confidence |
|---|---|---|
| "define the problem", "what is the real problem", stakeholder conflict | problem-definer | high |
| "spec by example", "concrete examples", "acceptance criteria" | spec-by-example | high |
| "story map", "user journey", "release planning", "MVP scope" | story-mapper | high |
| "DDD", "domain model", "bounded context", "aggregate" | domain-modeler | high |
| "CRC card", "object responsibility", "GRASP", "collaboration design" | responsibility-modeler | high |
| "architecture decision", "quality attribute", "trade-off analysis", "ADR" | architecture-advisor | high |
| "TDD", "test-driven", "red-green-refactor", "tests first" | tdd-coach | high |
| "refactor", "code smell", "improve quality", "clean up code" | refactoring-guide | high |
| "legacy code", "working effectively", "seam", "characterization test" | legacy-surgeon | high |
| "test strategy", "test quadrant", "test pyramid", "test coverage" | test-strategist | high |
| Requirements unclear or conflicting | problem-definer | medium |
| Planning a brand-new product/feature from zero | story-mapper | medium |
| Complex business rules to model | domain-modeler | medium |
| Tech / architecture choice | architecture-advisor | medium |
| Untested or legacy codebase | legacy-surgeon | medium |
| No clear signal but methodology help requested | problem-definer (default entry) | low |

If confidence is **low**, confirm the agent choice with the user before continuing.

## Agent output contract

Every agent in this toolkit follows the same output rules:

| Allowed | Not allowed |
|---|---|
| Analysis and structured reports | Writing or generating code |
| Recommendations with trade-offs | Deciding for the user |
| Diagrams / models (text form) | Running commands or modifying files |
| Asking questions to clarify | Producing unstructured prose |

Each agent's output must contain: (1) **Context summary**, (2) **Findings**, (3) **Ranked recommendations with trade-offs**, (4) **Next steps**.

## Boundaries

This skill **only**:
- Routes user requests to the right methodology agent
- Provides structured analysis, recommendations, reports
- Composes agents into multi-step workflows

This skill **does not**:
- Generate or modify code → use the IDE directly
- Project-specific orchestration → delegate to `requirement-workflow`
- Run commands or do file I/O → no runtime dependency
- Create agents / skills / rules → delegate to `project-agent-writer` / `project-skill-writer` / `project-rules-writer`

## See also (loaded on demand)

- [references/per-agent-detail.md](references/per-agent-detail.md) — when-to-use + trigger phrases for each of the 10 agents
- [references/workflows.md](references/workflows.md) — composed multi-agent workflows (new-feature / legacy-code / architecture)
- [references/bibliography.md](references/bibliography.md) — the 10 source books
