# Complete workflow: creating a skill (problem-driven)

An end-to-end example of problem-driven skill creation.

## Problem-first approach

**Old way**: the user says "I want a skill" → ask questions → generate

**New way**: the user describes an annoyance → understand the problem → analyze the project → design → confirm → generate

## Scenario

**The user says**: "Every time I create a new component, I write the same React component boilerplate — TypeScript, styled-components, and tests. Every time I create a Button or Card, I copy-paste from an old file and modify it. It is too repetitive, and I always miss something."

## Step 1: Problem understanding (L1)

Instead of asking "what do you want to name the skill?", understand the problem:

```
Problem analysis:
- Pattern: "I write the same ... every time"
- Type: Generator (repeatedly creating code)
- Input: component name, props types
- Output: complete component files (index.tsx, styles.ts, types.ts, test.tsx)
- Frequency: high (every new component)
```

## Step 2: Project analysis (L2)

Run in parallel via the Task tool:

- **Project scanner**: found 12 existing components under `src/components/`, each containing `index.tsx`, `styles.ts`, `types.ts`
- **Tech-stack analyzer**: React 18 + TypeScript 5 + styled-components v6
- **Convention detector**: components use PascalCase, function components + Hooks, barrel exports

## Step 3: Skill design (L3)

Show the user **before** generating:

```
I will create a skill:

Problem: you are manually writing React component boilerplate
Solution: auto-generate complete component files with styles and tests
Triggers: "new component", "create component", "generate component"
Files created:
  - {name}/index.tsx (component)
  - {name}/styles.ts (styled-components)
  - {name}/types.ts (TypeScript interfaces)
  - {name}/test.tsx (basic tests)

Is this correct? Anything to adjust?
```

## Step 4: User confirmation (L4)

The user says: "Looks good, but I also want prop-types generated."

→ Update the design to include prop-types in `types.ts`.

## Step 5: Generate the skill (L5)

The skill directory created:

```
.agents/skills/react-component-generator/
├── SKILL.md
├── assets/
│   ├── component.tsx.template
│   ├── styles.ts.template
│   ├── types.ts.template
│   └── test.tsx.template
└── references/
    └── component-patterns.md
```

SKILL.md contains:
- Frontmatter with trigger words: "new component", "create component"
- Workflow: analyze target → select template → populate context → create files
- A quick-reference table of component types vs templates
- Error handling for name conflicts and missing directories

## Step 6: Quality validation (L6)

Run the quality validator:

```json
{
  "overall_score": 0.92,
  "status": "pass",
  "checks": {
    "triggers": "3 distinct, specific trigger words",
    "output_path": ".agents/skills/ (project-relative path) ✓",
    "frontmatter": "name + description ✓",
    "workflow": "4 steps, atomic, verified ✓"
  }
}
```

## Validation checklist

- [x] The description contains all trigger keywords
- [x] The "When to Use" section is clear
- [x] The "Not a fit" section prevents false triggers
- [x] References are linked from SKILL.md
- [x] Templates match project conventions (PascalCase, styled-components)
- [x] The output path is project-relative
