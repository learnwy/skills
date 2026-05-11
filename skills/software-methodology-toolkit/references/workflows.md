# Composed Workflows

The 10 agents combine into common multi-step workflows. Use these when the user is doing a multi-stage piece of work and a single agent isn't enough.

## New-feature workflow

1. **problem-definer** → define the real problem
2. **story-mapper** → map the user journey
3. **spec-by-example** → create concrete examples
4. **domain-modeler** → model the domain concepts
5. **tdd-coach** → implement with TDD
6. **test-strategist** → verify test coverage

## Legacy-code workflow

1. **problem-definer** → understand why a change is needed
2. **legacy-surgeon** → safely break dependencies (seams + characterization tests)
3. **refactoring-guide** → spot and fix code smells
4. **test-strategist** → add appropriate tests

## Architecture workflow

1. **problem-definer** → clarify requirements
2. **domain-modeler** → model bounded contexts
3. **architecture-advisor** → analyse quality attributes
4. **responsibility-modeler** → design object responsibilities

## Composition rules

- Each step's output is the next step's input. Don't advance until the current step's output is complete.
- If a step output is incomplete, do not move on — re-run with missing context.
- Cross-cutting agents (problem-definer most often) can re-enter mid-workflow when ambiguity reappears.

## Pre-call checklist

Before invoking any agent:

- [ ] No project-specific skill matches the request (fallback rule)
- [ ] Agent choice follows the routing decision table in SKILL.md
- [ ] Low-confidence picks confirmed with the user
- [ ] Agent received enough context (problem statement, code refs, constraints)

After the agent produces output:

- [ ] Output follows the Agent Output Contract (no code, no commands)
- [ ] Recommendations include trade-offs, not just one answer
- [ ] Next steps are actionable
- [ ] If part of a workflow, the next agent in sequence is identified
