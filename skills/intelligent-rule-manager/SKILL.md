---
name: intelligent-rule-manager
description: Manage globally stored Markdown rules in AGENTS_HOME/rules or ~/.agents/rules with grouping, tagging, dynamic assembly, script-vs-AI composition decisions, target-specific exports, and macOS visualization recommendations.
---

# Intelligent Rule Manager

Use this skill when the user wants to create, organize, filter, assemble, export, or evaluate reusable agent rules across projects.

## What This Skill Solves

- Rules live independently from the current repository under `AGENTS_HOME/rules` or `~/.agents/rules`.
- Each rule is a standalone Markdown file with frontmatter for tags, groups, targets, complexity, update frequency, and maintenance cost.
- The skill can decide whether the job should be handled deterministically by scripts or synthesized directly by AI.
- The skill can dynamically assemble rule sets for different task goals and export them as a single rule, a merged rule set, or a config manifest.
- The skill can recommend when the rule library has grown enough to justify a visual macOS editor.

## Storage Rules

1. Resolve the storage root with:
   - `AGENTS_HOME/rules` when `AGENTS_HOME` is set
   - Otherwise `~/.agents/rules`
2. Treat Markdown rule files as the source of truth.
3. Keep rules compatible with AGENTS-style and Trae-style Markdown by storing the actual instruction body in normal Markdown beneath YAML frontmatter.

## Rule Lifecycle

Use the CLI in `scripts/rule-manager.mjs`.

### Initialize storage

```bash
node .agents/skills/intelligent-rule-manager/scripts/rule-manager.mjs init
```

### Create a rule

```bash
node .agents/skills/intelligent-rule-manager/scripts/rule-manager.mjs create \
  --title "TypeScript Import Hygiene" \
  --group frontend \
  --tags typescript,imports,lint \
  --targets agents-md,trae-rule
```

### Inspect and filter

```bash
node .agents/skills/intelligent-rule-manager/scripts/rule-manager.mjs list --tags typescript --groups frontend
node .agents/skills/intelligent-rule-manager/scripts/rule-manager.mjs stats
```

## Intelligent Decision Workflow

1. Run `decide` when the user wants a composed deliverable or a rewritten rule set.
2. If the result is `script-first`, use `compose` directly.
3. If the result is `ai-first`, use `compose --mode ai-prep` to gather the selected rules, scoring, outline, and rationale, then let the model rewrite or reorganize the final artifact.

### Decision command

```bash
node .agents/skills/intelligent-rule-manager/scripts/rule-manager.mjs decide \
  --objective "Assemble cross-project frontend safety rules for AI coding tasks" \
  --artifact rule-set \
  --target agents-md
```

## Dynamic Assembly

Users can pick tags, groups, targets, and an objective. The skill should:

1. Filter rules by user-selected tags/groups/targets.
2. Score the remaining rules against the stated objective.
3. Produce the requested artifact:
   - `single-rule`
   - `rule-set`
   - `config-file`

### Script-first assembly

```bash
node .agents/skills/intelligent-rule-manager/scripts/rule-manager.mjs compose \
  --objective "Mobile app review rules" \
  --groups ios \
  --tags review,swiftui \
  --artifact rule-set \
  --target trae-rule \
  --mode auto
```

### AI-first preparation

```bash
node .agents/skills/intelligent-rule-manager/scripts/rule-manager.mjs compose \
  --objective "Merge overlapping platform rules into one concise onboarding pack" \
  --artifact rule-set \
  --mode ai-prep \
  --format json
```

When `ai-first` is chosen, rewrite the final output from the prepared structure rather than simply concatenating rule files.

## Visualization Recommendation

Use the recommender whenever the user asks whether a GUI is worth building, or when the rule library looks large and expensive to maintain.

```bash
node .agents/skills/intelligent-rule-manager/scripts/rule-manager.mjs recommend-visualization
```

The recommendation weighs:

- total rule count
- average and peak complexity
- update frequency
- maintenance cost
- tag/group sprawl

If the result recommends a macOS app, propose features such as rule editing, tagging, grouping, preview, one-click export, and sync.

## References

- Read [references/rule-schema.md](references/rule-schema.md) for the supported frontmatter schema.
- Use [assets/rule-template.md](assets/rule-template.md) as the starting shape for new rules.
