# AGENTS.md

This file provides guidance to AI agents (Claude Code, Codex, Cursor, etc.) when working with this repository.

## Project Overview

Personal skills repository containing reusable AI capabilities following the [Agent Skills Specification](https://agentskills.io/specification). Each skill is a self-contained directory with a `SKILL.md` file defining its functionality, triggers, and usage patterns.

## Repository Structure

```
skills/                                    # Repository root
├── AGENTS.md                              # This file — project guidelines
├── CLAUDE.md                              # Claude-specific pointer (→ AGENTS.md)
├── LICENSE                                # MIT License
├── agents/                                # Universal methodology agents (canonical copies)
│   ├── AGENTS.md
│   ├── problem-definer/
│   ├── story-mapper/
│   ├── domain-modeler/
│   ├── architecture-advisor/
│   ├── responsibility-modeler/
│   ├── spec-by-example/
│   ├── tdd-coach/
│   ├── refactoring-guide/
│   ├── legacy-surgeon/
│   └── test-strategist/
└── skills/                                # Runnable skill modules
    ├── english-learner/                   # Vocabulary learning assistant
    ├── knowledge-consolidation/           # Persist conversation insights
    ├── llm-wiki/                          # Karpathy-style knowledge base
    ├── on-contradiction/                  # Mao's contradiction methodology
    ├── on-practice/                       # Mao's practice methodology
    ├── on-protracted-war/                 # Mao's protracted war methodology
    ├── project-agent-writer/              # Create project-level agents
    ├── project-skill-installer/           # Install skills into projects
    ├── project-skill-writer/              # Create project-level skills
    ├── requirement-workflow/              # SDD development orchestrator
    ├── software-methodology-toolkit/      # 10 methodology agents (fallback)
    ├── prompt-optimizer/                  # Pre-flight prompt analysis & improvement
    └── trae-rules-writer/                 # Create Trae IDE rules
```

## Skills by Category

### Methodology Skills (No Scripts — Pure Agent Frameworks)

| Skill | Description | Agents |
|-------|-------------|--------|
| **on-contradiction** | Mao's *On Contradiction* — structural analysis of opposing forces | decision-maker, problem-analyzer, report-writer |
| **on-practice** | Mao's *On Practice* — practice-cognition spiral for validation | decision-maker, problem-analyzer, report-writer |
| **on-protracted-war** | Mao's *On Protracted War* — staged strategy for long games | decision-maker, problem-analyzer, report-writer |
| **llm-wiki** | Karpathy's LLM Wiki — compounding knowledge base | ingestor, querier, linter, schema-writer |
| **software-methodology-toolkit** | 10 methodology agents (fallback when no specific skill matches) | problem-definer, story-mapper, domain-modeler, etc. |

### Development Workflow Skills

| Skill | Description | Has Scripts |
|-------|-------------|-------------|
| **requirement-workflow** | Spec-Driven Development: spec.md → tasks.md → implementation → verification | Yes (shell) |
| **project-skill-writer** | Create project-level skills with convention detection | No |
| **project-agent-writer** | Create project-level agents | No |
| **project-skill-installer** | Install skills into projects | No |
| **trae-rules-writer** | Create Trae IDE rules | No |

### Utility Skills

| Skill | Description | Has Scripts |
|-------|-------------|-------------|
| **english-learner** | Vocabulary learning with auto-intercept English coaching | Yes (TS → bundled CJS) |
| **knowledge-consolidation** | Persist conversation insights to project knowledges/ | Yes (CJS) |
| **prompt-optimizer** | Pre-flight prompt analysis & improvement (7-dimension scoring) | TS → bundled CJS (hooks only) |

## Skill Specification

### Directory Layout

```
{skill-name}/
├── SKILL.md              # REQUIRED: Skill definition
├── scripts/              # Optional: Executable code
├── references/           # Optional: Detailed documentation
├── assets/               # Optional: Templates and resources
└── agents/               # Optional: Sub-agent definitions
    ├── thinking/         #   Analysis/decision agents
    ├── writing/          #   Report/document agents
    └── operations/       #   Workflow operation agents
```

### SKILL.md Frontmatter

```yaml
---
name: skill-name              # 1-64 chars, lowercase, hyphens only
description: "What it does and when to use it (1-1024 chars)"
metadata:
  author: "learnwy"
  version: "1.0"
  source: "optional source reference"
---
```

### Progressive Disclosure

| Level | Token Budget | When Loaded |
|-------|-------------|-------------|
| Metadata | ~100 tokens | Startup (all skills) |
| Instructions | < 5000 tokens | Skill activation |
| Resources | As needed | On demand |

### Script Conventions

- **TypeScript source** lives at repo root in `src/<skill-name>/` and `src/shared/`
- **Build outputs** are committed at `skills/<skill-name>/scripts/*.cjs` (do NOT edit them by hand)
- Each skill follows a 1:1 layout that the `rslib.config.ts` scanner picks up automatically:
  ```
  src/<skill>/
  ├── cli.ts              ← optional; bundled as scripts/cli.cjs (single entry, subcommand dispatcher)
  ├── cmd/<verb>.ts       ← exports `command: Command` consumed by cli.ts
  ├── lib/*.ts            ← internal helpers (bundled into above; never an entry)
  └── hooks/<event>.ts    ← optional; one bundled scripts/hooks/<event>.cjs per file
  ```
  `src/shared/cli.ts` provides `dispatch({ name, commands })` and `parseArgs`. Skills with hooks add `install` / `uninstall` subcommands by importing from `src/shared/install-entry.ts`.
- All scripts ship as bundled CJS targeting Node.js ≥ 22 (the `english-learner` SQLite path additionally requires Node ≥ 24 for the built-in `node:sqlite` module)
- **Path convention**: All script paths in SKILL.md are relative to `{skill_root}` (the SKILL.md directory). The standard invocation form is `node scripts/cli.cjs <subcommand> [args]` for command skills and `node scripts/hooks/<event>.cjs` for hook entry points.
- All skill documents in English

## Development Guidelines

### Creating a New Skill

1. Create directory: `skills/{skill-name}/`
2. Create `SKILL.md` with valid frontmatter
3. Verify name matches directory name (lowercase, hyphens only)
4. Include: When to Use, When NOT to Use, Prerequisites
5. Add agents to `agents/` if the skill has sub-agents
6. Add scripts to `scripts/` if needed

### Code Style

- No comments unless explicitly requested
- English for all skill documents and code
- Named exports, arrow functions for scripts
- Follow existing patterns in neighboring skills

### Testing

No automated test framework. Test skills by:
1. Loading them in an AI assistant
2. Verifying triggers work as specified
3. Checking scripts execute correctly
4. Validating output format

## Common Workflows

### Structured Development
Use `requirement-workflow` for multi-stage software development:
```
ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING
```

### Methodology Analysis
The Mao Zedong Trilogy provides three complementary lenses:
```
on-contradiction   → WHAT are the forces?      (Structure)
on-practice        → HOW do we verify?          (Process)
on-protracted-war  → WHEN do we act & evolve?   (Time/Strategy)
```

### Knowledge Management
```
knowledge-consolidation  → Save single conversation insights
llm-wiki                 → Build full compounding knowledge base
```

### Creating Project-Level Extensions
```
project-skill-writer     → Create a reusable skill for a project
project-agent-writer     → Create a specialized agent
trae-rules-writer        → Create AI behavior rules
project-skill-installer  → Install an existing skill into a project
```

### Build System (rslib + pnpm)

The repo uses [`@rslib/core`](https://rslib.rs) and [pnpm](https://pnpm.io). `rslib.config.ts` auto-scans `src/<skill>/` directories and emits one bundled CJS entry per `cli.ts` plus one per `hooks/<event>.ts` — there is no per-skill entry list to maintain.

```
src/                          ← source of truth (TypeScript)
├── shared/
│   ├── cli.ts                ← Command dispatcher + parseArgs helper
│   ├── hooks-lib.ts          ← Hook utilities (stdin, injectContext, install/uninstall primitives)
│   ├── install-entry.ts      ← `installCommand` / `uninstallCommand` exposed as subcommands
│   └── db.ts                 ← SQLite helper (english-learner)
├── english-learner/{cli,cmd/,hooks/}
├── llm-wiki/{cli,cmd/,lib/,hooks/}
├── prompt-optimizer/{cli,hooks/}
├── requirement-workflow/{cli,cmd/,lib/}
├── knowledge-consolidation/{cli,cmd/}
├── project-{agent,skill}-writer/{cli,cmd/}
└── trae-rules-writer/{cli,cmd/}

skills/<name>/scripts/        ← bundled output, COMMITTED, never hand-edit
├── cli.cjs                   ← single entry per skill
└── hooks/<event>.cjs         ← one per src/<skill>/hooks/*.ts

scripts/manage-hooks.mjs      ← orchestrator that runs `cli.cjs install` for every skill with hooks.json
```

**Build commands**:
```bash
pnpm install                  # one-time
pnpm run build                # bundle all skills
pnpm run watch                # watch mode for development
pnpm run typecheck            # type-check without emitting
pnpm run check                # typecheck + build (CI gate)
```

**Skill commands** (uniform per-skill CLI):
```bash
pnpm run install:hooks                                     # register all skill hooks globally
pnpm run uninstall:hooks                                   # remove all skill hooks
node skills/english-learner/scripts/cli.cjs migrate        # legacy JSON → SQLite (any subcommand --help for usage)
node skills/english-learner/scripts/cli.cjs install        # per-skill install (called by manage-hooks)
```

**Release commands**:
```bash
pnpm run release              # git push + pnpm dlx skills install + register IDE hooks
```

The release runs three steps in order:
1. `git push origin main` — publish the new bundles to GitHub
2. `pnpm dlx skills install -g -y learnwy/skills` — pull the latest into `~/.agents/skills/<name>/` and register every skill with all 15 supported AI agents
3. `pnpm run install:hooks` — `scripts/manage-hooks.mjs` walks each skill that ships a `hooks.json`, runs its `cli.cjs install --scope global --target both`, and registers entries in `~/.claude/settings.json`, `~/.trae/hooks.json`, and `~/.trae-cn/hooks.json`. Idempotent.

**Pre-commit guard**: `.githooks/pre-commit` runs `pnpm run check` whenever `src/`, `scripts/`, `rslib.config.ts`, `tsconfig.json`, or `package.json` is staged, then refuses the commit if `skills/*/scripts/` is out of sync. `pnpm install` wires this in via the `prepare` script (`git config core.hooksPath .githooks`).

### Dependency Strategy

When a skill needs runtime dependencies, pick the right tier — never default to "consumer runs `pnpm install`":

| Dep type | Strategy |
|---|---|
| **Built-in Node modules** (`node:sqlite`, `node:fs`, …) | Add to `output.externals` in `rslib.config.ts`. Document the required Node version in the skill's SKILL.md `## Prerequisites`. |
| **Pure-JS deps** (e.g. `yaml`, `zod`, `chalk`) | Bundle into the output (rslib's default). No install needed at consumer site. |
| **Native deps** (e.g. `better-sqlite3`, `sharp`) | Ship a tiny per-skill `skills/<name>/package.json` with the runtime dep. Add a Prerequisites note in SKILL.md telling the user to run `cd skills/<name> && pnpm install` once. |

Every skill that has a non-trivial runtime requirement MUST list it in its SKILL.md `## Prerequisites` section so the AI assistant (and human reader) sees it before running.

**Build philosophy**:
- One source per shared utility — hook helpers, the CLI dispatcher, and the install entry are bundled in from `src/shared/`, never copy-pasted.
- Bundle output is **readable** (no minify, no mangle) so AI assistants can introspect it.
- `cleanDistPath: false` — the build never deletes `SKILL.md`, `hooks.json`, `agents/`, or `references/`. It only writes `*.cjs` files under `scripts/`.
- Every commit that changes `src/` MUST be accompanied by the corresponding rebuilt `skills/*/scripts/`. Run `pnpm run build` before committing — the `pre-commit` hook also enforces this.

### IDE Hooks

Skills can register deterministic hooks that fire at IDE lifecycle events (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop). Works with both Trae and Claude Code.

```
skills/<name>/hooks.json                       → Per-skill hook configuration (handwritten)
skills/<name>/scripts/cli.cjs                  → install/uninstall subcommands (via shared install-entry)
skills/<name>/scripts/hooks/<event>.cjs        → Bundled hook event handlers
```

**Scope Convention**:
- Skills storing data globally (`~/...`) → install hooks globally (`--scope global`)
- Skills operating per-project → install hooks per-project (`--scope project`)

**Hook Installation**:
```bash
# Install (from skill directory)
node scripts/cli.cjs install --scope global --target both

# Uninstall
node scripts/cli.cjs uninstall --scope global --target both
```

**Installed locations**:
- Trae: `~/.trae/hooks.json` (standalone hooks file)
- Claude Code: `~/.claude/settings.json` (merged into `hooks` key)
