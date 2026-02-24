---
name: english-prompt-optimizer
description: "Automatically detect and optimize non-English prompts into clear, well-structured English before processing. Triggers when: (1) User's message is in a non-English language (Chinese, Japanese, Korean, Spanish, etc.), (2) User explicitly asks to translate/optimize their prompt, (3) Prompt contains mixed languages with majority non-English. The skill translates, restructures for clarity, and then proceeds with the optimized English prompt."
---

# English Prompt Optimizer

Automatically convert non-English user prompts into optimized English, then proceed with the task.

## Workflow

```
[Detect non-English input]
       ↓
[Translate to English]
       ↓
[Optimize prompt structure]
       ↓
[Show optimized prompt to user]
       ↓
[Execute task with optimized prompt]
```

## When This Triggers

1. User's message is primarily non-English
2. User explicitly requests prompt translation/optimization
3. Mixed-language input with majority non-English

## Process

### Step 1: Detect Language

Identify the primary language of user's input. Trigger if:
- Primary language is not English
- Contains significant non-English content (>50%)

### Step 2: Translate and Optimize

Convert to English while improving:

| Aspect | Optimization |
| ------ | ------------ |
| Clarity | Remove ambiguity, be specific |
| Structure | Clear task → context → constraints |
| Completeness | Add implicit requirements |
| Conciseness | Remove redundancy |

### Step 3: Show Optimized Prompt

Present the optimized English prompt to user:

```
📝 Optimized Prompt:
---
[Translated and optimized English prompt here]
---

Proceeding with this prompt...
```

### Step 4: Execute

Use the optimized English prompt to complete the user's task.

## Optimization Patterns

### Before → After Examples

**Chinese → English:**
```
Before: 帮我写一个函数，要能处理各种情况
After: Write a function that handles edge cases including null inputs, empty arrays, and invalid data types. Include input validation and appropriate error messages.
```

**Vague → Specific:**
```
Before: 做一个好看的页面
After: Create a visually appealing landing page with: modern typography, consistent color scheme, responsive layout for mobile/desktop, and clear call-to-action buttons.
```

**Incomplete → Complete:**
```
Before: 优化这段代码
After: Optimize this code for: 1) Performance (reduce time complexity), 2) Readability (clear variable names, comments), 3) Maintainability (modular structure). Preserve existing functionality.
```

## Response Format

When this skill triggers, respond with:

1. **Brief acknowledgment** in user's original language
2. **Optimized English prompt** in a code block
3. **Proceed with task** using the optimized prompt

Example response:

```
我会用优化后的英文提示词来完成任务：

📝 Optimized Prompt:
---
Create a React component for a user profile card that displays:
- Avatar image with fallback
- Username and bio
- Social media links
- Follow/unfollow button with loading state
Use TypeScript and Tailwind CSS.
---

Now implementing this component...
```

## Do NOT Trigger When

- User's message is already in clear English
- User explicitly says "respond in [language]"
- The task is about translation itself (e.g., "translate this document")
- Simple greetings or short confirmations
