---
name: lwy-prompt-optimizer
description: "Use this skill on every user message that contains a prompt or AI instruction — analyze its weaknesses and suggest improvements before executing. Score across 7 dimensions (clarity, specificity, context, structure, examples, constraints, completeness) and rewrite vague instructions into precise specs. Triggers: any AI prompt, 'optimize my prompt', 'improve this requirement', 'make this more specific', 'rewrite this prompt', '优化提示词', '改进提示词', '重写提示词', or whenever a raw requirement lacks detail and structure."
metadata:
  author: "learnwy"
  version: "1.1"
  trigger: "always"
---

# Prompt Optimizer

A pre-flight prompt checker that analyzes, critiques, and improves prompts before they are sent to an AI system. It plays the role of a coach — teaching users to write better prompts by showing what can be improved across 7 key dimensions.

> **Core principle**: analyze before acting. This skill is invoked at the start of a conversation, whenever the user's message looks like a prompt or instruction for an AI system. Analyze first, then improve, then let the user decide.

## Prerequisites

- No runtime dependencies (a pure methodology skill, no scripts)
- Works for any prompt — code generation, writing, analysis, creative tasks

## When to use

**Triggers:**

- User says "optimize my prompt", "improve this prompt", "check my prompt", "review my prompt"
- User says "make this more specific", "help me write a better prompt"
- User provides a raw requirement and asks for help refining it
- User is about to send a long instruction to an AI and wants feedback first

**Do not trigger when:**

- The user is having an ordinary conversation
- The user asks the AI to do something (rather than improve a prompt)
- The input is clearly code, a file path, or a technical command

## 7-Dimension Analysis Framework

Every prompt is analyzed across these 7 dimensions:

| Dimension | What it checks |
|------|----------|
| **Clarity** | Is the intent unambiguous? Are there vague words (good, nice, appropriate, etc.)? |
| **Specificity** | Are there concrete constraints (format, length, audience, tone)? |
| **Context** | Is background / role / scenario provided? |
| **Structure** | Is it logically organized? Are the steps ordered? |
| **Examples** | Does it include input/output examples where needed? |
| **Constraints** | Are boundaries defined (what not to do, edge cases)? |
| **Completeness** | Can the AI produce the correct output on the first try? |

Score for each dimension:
- ✅ **Strong** — well covered, no action needed
- ⚠️ **Weak** — partially addressed, can be improved
- ❌ **Missing** — not addressed at all, must be added

## Workflow

```
[1. Receive draft prompt]
       ↓
[2. Dimension analysis] → score each dimension (✅ strong / ⚠️ weak / ❌ missing)
       ↓
[3. Show the critique card] → a structured report with scores
       ↓
[4. Suggest improvements] → a concrete rewrite for each weak dimension
       ↓
[5. Show the optimized prompt] → the full rewritten version
       ↓
[6. User decision] → use original / use optimized / edit manually
```

## Response Format

When analyzing a prompt, always respond with this exact structure:

```
## 🔍 Prompt Analysis

**Overall score: {X}/7 dimensions strong**

| Dimension | Score | Notes |
|------|------|------|
| Clarity | ✅/⚠️/❌ | {brief note} |
| Specificity | ✅/⚠️/❌ | {brief note} |
| Context | ✅/⚠️/❌ | {brief note} |
| Structure | ✅/⚠️/❌ | {brief note} |
| Examples | ✅/⚠️/❌ | {brief note} |
| Constraints | ✅/⚠️/❌ | {brief note} |
| Completeness | ✅/⚠️/❌ | {brief note} |

### Strengths
{strength points}

### What can be improved
{for each ⚠️/❌ dimension: the specific problem + a specific fix}

## ✨ Optimized Prompt

{the full rewritten version with all improvements}

---
**What changed:**
{a numbered list of what was changed and why}
```

After showing the analysis, ask the user: **use original / use optimized / edit manually?**

## English-Learning Integration

After optimizing, automatically trigger the english-learner skill's English study:

1. Check the user's original Chinese phrasing for grammar mistakes, typos, or awkward usage — if any, show the corrections first
2. Extract 2-3 high-value English words/expressions from the optimized prompt
3. Compare the user's original phrasing with the optimized phrasing, and point out the word-choice improvements
4. Automatically save all new vocabulary to the word bank via `batch_save` (no need to ask the user)

**Format:**

```
🌐 **English Learning**

**Chinese corrections:** (only shown when issues are found)
| Original | Correction | Note |
|------|------|------|
| {mistake} | {fix} | {reason} |

**Prompt vocabulary highlights:**
| Your phrasing | Optimized phrasing | Why it's better |
|----------|----------|-----------|
| {original word} | {improved} | {brief note} |

💾 Saved to the word bank automatically
```

**Rules:**
- Only trigger when the prompt contains Chinese or the user is a native Chinese speaker
- Correct the Chinese issues first, then show the English improvements
- Focus on the learning value of "how to describe intent more precisely in English"
- Save directly, no user confirmation needed

## Prompt-Improvement Patterns

Patterns to draw on when improving weak dimensions:

### 1. Vague → Specific
- **Before**: "Write good code"
- **After**: "Write TypeScript code with explicit return types, no `any`, and no function longer than 20 lines"

### 2. Missing context → With context
- **Before**: "Translate this"
- **After**: "Translate this marketing copy from Chinese to English, keeping a casual tone, aimed at a Gen-Z audience"

### 3. No examples → With examples
- **Before**: "Format the data"
- **After**: "Format the data as: input: `{raw}` → output: `| col1 | col2 |`"

### 4. No structure → With structure
- **Before**: A wall of text mixing multiple concerns
- **After**: Ordered steps with clear numbering and grouping

### 5. No constraints → With boundaries
- **Before**: "Write an article"
- **After**: "Write a 500-word article, no jargon, 8th-grade reading level, with 3 examples"

### 6. Missing role → With role anchoring
- **Before**: "Explain X"
- **After**: "Explain X as a senior backend engineer explaining it to a junior developer"

## Error Handling

| Problem | Solution |
|------|----------|
| Prompt is already strong (6-7/7) | Say "Your prompt is already well structured!" and suggest only minor tweaks |
| Prompt is too short to analyze | Ask the user for more context about the goal |
| User rejects the optimized version | Respect their choice and continue with the original prompt |

## Execution Checklist

Confirm before responding:

- [ ] All 7 dimensions analyzed
- [ ] Scores assigned with brief notes
- [ ] Strengths acknowledged (not just criticism)
- [ ] Each weak dimension has a specific, actionable fix
- [ ] The full optimized prompt is provided
- [ ] The changes are explicitly listed
- [ ] The user is given a choice: accept / reject / edit

## Hooks

This skill registers an IDE hook so that the pre-flight analysis triggers **deterministically** — the AI does not need to remember to invoke it.

### Scope

**Global** — installed to `~/.claude/settings.json` and `~/.trae/hooks.json` (no project-level state).

### Events

| Event | Script | Purpose |
|------|------|------|
| `UserPromptSubmit` | `scripts/hooks/user-prompt-scan.cjs` | Detect prompt-shaped input and inject a 7-dimension review reminder |

### Trigger Strategy (three-tier mode)

The hook now triggers on **all prose input** (skipping only code, file paths, shell commands, and very short input ≤7 characters):

1. **Explicit request** (explicit) — the message contains `optimize / improve / review / rewrite / check / refine my prompt`, `make this prompt more X`, or the Chinese equivalents `优化提示词 / 改进提示词 / 重写提示词`. **Output**: a full 7-dimension analysis + an Optimized Prompt block.
2. **Structured prompt shape** (structured) — the message is ≥400 characters and ≥4 lines, and contains ≥2 markers such as `you are`, `your task is`, `act as`, `instructions:`, `constraints:`, `output format:`. **Output**: a full 7-dimension analysis + an Optimized Prompt block.
3. **Light mode** (light) — all other prose input (short exchanges, chit-chat questions). **Output**: a single line — pick the weakest of the 7 dimensions and give one concrete rewrite suggestion; if all 7 pass, render the fixed string `"✨ Prompt-opt: already clear, no rewrite needed."` and continue the task.

The event log (`~/.learnwy/prompt-optimizer/events.jsonl`) records the trigger type (explicit / structured / light); use `cli.cjs trends` to view the distribution.

### Install

```bash
node scripts/cli.cjs install --scope global --target both
```

### Uninstall

```bash
node scripts/cli.cjs uninstall --scope global --target both
```
