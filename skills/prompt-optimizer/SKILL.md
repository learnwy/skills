---
name: prompt-optimizer
description: "If the agent's description mentions that it should be used proactively, then you should try your best to use it without the user having to ask for it first. PROACTIVE: This skill should be used on EVERY user message that contains a prompt or instruction for AI — automatically analyze for weaknesses and suggest improvements before executing. Transform vague prompts into precise, well-structured specifications using a 7-dimension analysis framework (Clarity, Specificity, Context, Structure, Examples, Constraints, Completeness). Triggers on: every user message (pre-flight check), 'optimize my prompt', 'improve this requirement', 'make this more specific', or when raw requirements lack detail and structure."
metadata:
  author: "learnwy"
  version: "1.1"
  trigger: "always"
---

# Prompt Optimizer

Pre-flight prompt checker that analyzes, critiques, and improves prompts before they are sent to an AI system. Acts as a coach — teaching users to write better prompts by showing what can be improved across 7 key dimensions.

> **Core Principle**: Run before you do anything. This skill is invoked at the START of a conversation when the user's message looks like a prompt or instruction to an AI system. Analyze first, improve second, let the user decide third.

## Prerequisites

- No runtime dependencies (methodology-only skill, no scripts)
- Works with any prompt — code generation, writing, analysis, creative tasks

## When to Use

**Invoke when:**

- User says "optimize my prompt", "improve this prompt", "check my prompt", "review my prompt"
- User says "make this more specific", "help me write a better prompt"
- User provides a raw requirement and asks for help refining it
- User is about to send a large instruction to an AI and wants feedback first

**Do NOT invoke when:**

- User is having a normal conversation
- User is asking the AI to DO something (not to improve a prompt)
- The input is clearly code, a file path, or a technical command

## The 7-Dimension Analysis Framework

Every prompt is analyzed across these 7 dimensions:

| Dimension | What to Check |
|-----------|--------------|
| **Clarity** | Is the intent unambiguous? Are there vague words (good, nice, proper, etc.)? |
| **Specificity** | Are there concrete constraints (format, length, audience, tone)? |
| **Context** | Is background/role/situation provided? |
| **Structure** | Is it organized logically? Are steps sequenced? |
| **Examples** | Are input/output examples included where helpful? |
| **Constraints** | Are boundaries defined (what NOT to do, edge cases)? |
| **Completeness** | Would an AI have enough info to produce the right output on first try? |

Each dimension is scored:
- ✅ **Strong** — well-covered, no action needed
- ⚠️ **Weak** — partially addressed, can be improved
- ❌ **Missing** — not addressed at all, must be added

## Workflow

```
[1. Receive Draft Prompt]
       ↓
[2. Dimension Analysis] → Score each dimension (✅ Strong / ⚠️ Weak / ❌ Missing)
       ↓
[3. Show Critique Card] → Structured report with scores
       ↓
[4. Suggest Improvements] → Specific rewrites for each weak dimension
       ↓
[5. Show Optimized Prompt] → Full rewritten version
       ↓
[6. User Decision] → Use original / Use optimized / Edit manually
```

## Response Format

When analyzing a prompt, always respond in this exact structure:

```
## 🔍 Prompt Analysis

**Overall Score: {X}/7 dimensions strong**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Clarity | ✅/⚠️/❌ | {brief note} |
| Specificity | ✅/⚠️/❌ | {brief note} |
| Context | ✅/⚠️/❌ | {brief note} |
| Structure | ✅/⚠️/❌ | {brief note} |
| Examples | ✅/⚠️/❌ | {brief note} |
| Constraints | ✅/⚠️/❌ | {brief note} |
| Completeness | ✅/⚠️/❌ | {brief note} |

### What's Good
{bullet points of strengths}

### What Can Improve
{for each ⚠️/❌ dimension: specific issue + concrete fix}

## ✨ Optimized Prompt

{full rewritten prompt incorporating all improvements}

---
**Changes Made:**
{numbered list of what was changed and why}
```

After presenting the analysis, ask the user: **Use original / Use optimized / Edit manually?**

## Prompt Improvement Patterns

Reference patterns to apply when improving weak dimensions:

### 1. Vague → Specific
- **Before**: "write good code"
- **After**: "write TypeScript with explicit return types, no `any`, max 20 lines per function"

### 2. Missing Context → Contextual
- **Before**: "translate this"
- **After**: "translate this marketing copy from Chinese to English, maintaining a casual tone for Gen-Z audience"

### 3. No Examples → Exemplified
- **Before**: "format the data"
- **After**: "format the data as: Input: `{raw}` → Output: `| col1 | col2 |`"

### 4. Unstructured → Structured
- **Before**: Wall of text with mixed concerns
- **After**: Numbered steps with clear sequence and grouping

### 5. No Constraints → Bounded
- **Before**: "write an article"
- **After**: "write a 500-word article, no jargon, 8th-grade reading level, include 3 examples"

### 6. Missing Role → Role-Anchored
- **Before**: "explain X"
- **After**: "As a senior backend engineer explaining to a junior developer, explain X"

## Error Handling

| Issue | Solution |
|-------|----------|
| Prompt is already strong (6–7/7) | Say "Your prompt is already well-structured!" and suggest only minor tweaks |
| Prompt is too short to analyze | Ask user to provide more context about what they're trying to accomplish |
| User rejects the optimized version | Respect their choice, proceed with the original prompt |

## Execution Checklist

Before responding, verify:

- [ ] All 7 dimensions analyzed
- [ ] Scores assigned with brief notes
- [ ] Strengths acknowledged (not just criticisms)
- [ ] Each weak dimension has a specific, actionable fix
- [ ] Full optimized prompt provided
- [ ] Changes listed explicitly
- [ ] User given choice to accept/reject/edit
