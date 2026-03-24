# Complete Workflow: Creating a Skill (Problem-Driven)

End-to-end example of creating a skill by understanding user's problem.

## The Problem-First Approach

**Old way**: User says "I want a skill" → ask questions → generate

**New way**: User describes frustration → understand problem → analyze project → design → validate → generate

## Scenario

**User says**: "I keep writing the same React component boilerplate with TypeScript, styled-components, and tests. Every single time I create a Button or Card, I copy-paste from an old file and modify. It's so repetitive and I always miss something."

## Step 1: Problem Understanding (L1)

Instead of asking "What do you want to name the skill?", understand the problem:

```
Problem Analysis:
- Pattern: "I keep writing the same... every time"
- Type: Generator (creates code repeatedly)
- Input: component name, props type
- Output: complete component files (index.tsx, styles.ts, types.ts, test.tsx)
- Frequency: high (every new component)
```

## Step 2: Project Analysis (L2)

Run in parallel via Task tool:

- **Project Scanner**: Found `src/components/` with 12 existing components, each containing `index.tsx`, `styles.ts`, `types.ts`
- **Tech Stack Analyzer**: React 18 + TypeScript 5 + styled-components v6
- **Convention Detector**: PascalCase for components, functional components with hooks, barrel exports

## Step 3: Skill Design (L3)

Show user BEFORE generating:

```
I'll create a skill that:

Problem: You keep writing React component boilerplate manually
Solution: Auto-generate complete component files with styles and tests
Triggers: "new component", "create component", "generate component"
Files created:
  - {name}/index.tsx (component)
  - {name}/styles.ts (styled-components)
  - {name}/types.ts (TypeScript interfaces)
  - {name}/test.tsx (basic test)

Is this correct? Should I adjust anything?
```

## Step 4: User Confirms (L4)

User says: "Yes, but I also want prop-types generated"

→ Update design to include prop-types in `types.ts`.

## Step 5: Generate Skill (L5)

Created skill directory:

```
.trae/skills/react-component-generator/
├── SKILL.md
├── assets/
│   ├── component.tsx.template
│   ├── styles.ts.template
│   ├── types.ts.template
│   └── test.tsx.template
└── references/
    └── component-patterns.md
```

SKILL.md includes:
- Frontmatter with triggers: "new component", "create component"
- Workflow: Analyze target → Select template → Fill context → Create files
- Quick reference table mapping component types to templates
- Error handling for name conflicts and missing directories

## Step 6: Quality Gates (L6)

Run Quality Validator:

```json
{
  "overall_score": 0.92,
  "status": "pass",
  "checks": {
    "triggers": "3 distinct, specific",
    "output_path": ".trae/skills/ (project-relative) ✓",
    "frontmatter": "name + description ✓",
    "workflow": "4 steps, atomic, verified ✓"
  }
}
```

## Verification Checklist

- [x] Description includes all trigger keywords
- [x] "When to Use" section is clear
- [x] "Do NOT invoke when" prevents false triggers
- [x] References are linked from SKILL.md
- [x] Templates match project conventions (PascalCase, styled-components)
- [x] Output path is project-relative
