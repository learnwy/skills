---
name: english-prompt-optimizer
description: "Optimize and restructure user prompts for better AI responses. MUST use this skill when: (1) User writes in Chinese, Japanese, Korean, or other non-English languages - translate and optimize before proceeding, (2) User's request is vague or unclear - restructure for clarity, (3) User explicitly asks to improve/optimize their prompt. Also trigger when you see requests like '帮我', '请帮忙', 'お願い', or any non-English complex request. The goal is to produce a clear, structured English prompt that yields better results."
---

# English Prompt Optimizer

Transform vague or non-English prompts into clear, structured requests that produce better AI responses.

## Why This Matters

Clear prompts → Better results. When a user writes:
- In non-English: Translation + optimization ensures no nuance is lost
- Vaguely: Restructuring adds missing context and specificity
- Implicitly: Making requirements explicit prevents misunderstandings

## When to Trigger

**ALWAYS trigger when:**
- User's primary language is NOT English (Chinese, Japanese, Korean, Spanish, etc.)
- Request contains implicit requirements that should be explicit
- Task is complex with multiple parts that need structure

**Examples that MUST trigger:**
- `帮我分析一下这个代码` → Optimize before analyzing
- `这个功能怎么实现比较好` → Clarify requirements first
- `帮我写个报告` → Structure the report requirements
- Any message starting with `帮我`, `请`, `能不能`

**Do NOT trigger when:**
- User explicitly says "just do it, don't optimize"
- Simple yes/no questions
- User is asking ABOUT translation (not requesting a task)

## Optimization Process

```
┌────────────────────────────────────────────────────────────┐
│ 1. DETECT: Is this non-English or vague?                   │
│ 2. ANALYZE: What does user actually want?                  │
│ 3. OPTIMIZE: Create clear, structured English prompt       │
│ 4. CONFIRM: Show optimized prompt to user                  │
│ 5. EXECUTE: Proceed with the optimized version             │
└────────────────────────────────────────────────────────────┘
```

## Step 1: Detect & Analyze

Identify:
- Primary language of input
- Implicit requirements (what user assumes AI knows)
- Missing context (what, why, how, constraints)
- Output format expectations

## Step 2: Optimize Prompt

Transform using this structure:

```
[TASK]: Clear statement of what to do
[CONTEXT]: Background information
[REQUIREMENTS]: Specific criteria
[OUTPUT FORMAT]: Expected deliverable
[CONSTRAINTS]: Limitations or preferences
```

### Optimization Rules

| Problem | Solution |
|---------|----------|
| Vague task | Add specific action verb + object |
| Missing context | Ask or infer from conversation |
| No format specified | Suggest appropriate format |
| Implicit constraints | Make them explicit |

## Step 3: Show Optimized Prompt

Present in user's original language + optimized English:

```
🔄 I'll optimize your request for better results:

**Original:** [原始请求]

**Optimized Prompt:**
───────────────────
[Clear English version with structure]
───────────────────

Proceeding with this optimized request...
```

## Examples

### Example 1: Chinese Analysis Request

**Original:**
```
帮我分析一下这个改动，由程序员改，和由 ai 改；分析一下人效；给出结论和分析依据? 用来分享
```

**Optimized:**
```
TASK: Analyze code changes and compare human vs AI development efficiency

CONTEXT: 
- There are code modifications made by both a human programmer and AI
- Need to evaluate and compare the efficiency of each approach

REQUIREMENTS:
- Compare: code quality, time spent, correctness
- Calculate: lines of code, complexity, potential issues
- Analyze: human efficiency metrics vs AI assistance metrics

OUTPUT FORMAT: Shareable report with:
- Executive summary
- Side-by-side comparison table
- Efficiency analysis with metrics
- Conclusions with supporting evidence
- Visual charts if applicable

CONSTRAINTS: Report should be presentation-ready for sharing
```

### Example 2: Vague Implementation Request

**Original:**
```
这个功能怎么实现比较好
```

**Optimized:**
```
TASK: Recommend the best implementation approach for [specific feature]

REQUIREMENTS:
- Analyze multiple implementation options
- Compare trade-offs (performance, maintainability, complexity)
- Recommend best approach with reasoning

OUTPUT FORMAT:
- Options comparison table
- Recommended approach
- Implementation steps
- Code example (if applicable)
```

### Example 3: Report Request

**Original:**
```
帮我写个周报
```

**Optimized:**
```
TASK: Generate a weekly status report

CONTEXT: [Need to know: project name, time period, key activities]

REQUIREMENTS:
- Completed tasks this week
- In-progress items
- Blockers or challenges
- Next week's plan

OUTPUT FORMAT: Professional weekly report template

MISSING INFO NEEDED:
- What project/team is this for?
- What were the main activities this week?
- Any issues to highlight?
```

## Response Behavior

1. **Brief acknowledgment** in user's language
2. **Show optimized prompt** in structured format
3. **Ask for missing info** if critical context is unclear
4. **Proceed with task** using optimized version

## Integration Note

This skill improves outcomes by ensuring Claude works with clear, complete requirements rather than interpreting vague requests. The optimization happens transparently - user sees what's being executed.
