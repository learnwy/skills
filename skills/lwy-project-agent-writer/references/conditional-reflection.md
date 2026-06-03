<!--
AUTO-GENERATED — DO NOT EDIT DIRECTLY.
Source of truth: .agents/docs/conditional-reflection.md
After editing the source, run `pnpm run sync-docs` to propagate.
-->

# Conditional Reflection in Agent Skills

> Maps the engineering paradigm of Pavlovian conditioned reflexes onto AI Agent / Skill design:
> **explicit stimulus → deterministic response**, without relying on the model to reason from scratch every time. Reliability comes from up-front design, not runtime judgment.

## 1. Conceptual framework

The four elements of classical conditioning → their Skill-engineering counterparts:

| Classical element | Engineering mapping |
|---|---|
| Unconditioned stimulus (food) | Business end-state (the user gets the correct result) |
| Conditioned stimulus (bell) | Trigger: hook event / keyword / file pattern / command prefix |
| Reflex arc (neural pathway) | Hook script / the trigger section of a Skill description / slash-command binding |
| Reinforcement & extinction | trends/usage logs → periodic review → adjust the trigger conditions |

**Core criterion**: whenever condition X holds, behavior Y necessarily fires, and the form of Y is predictable.
Anything where "the model decides on the spot whether to act and how" is not a reflex but deliberation.

## 2. Three-tier reflex-strength model

The 15 skills in this repo fall roughly into three tiers:

### Tier 1 — Hard Reflex
**100% deterministic, no LLM involvement**. The event goes straight into a script, and the output is injected into the conversation context.

| Skill | Trigger | Reflex arc |
|---|---|---|
| `lwy-dispatch` | UserPromptSubmit / Stop / SessionStart hook | Single-process aggregation of 3 hook classes |
| `lwy-prompt-optimizer` (hook part) | UserPromptSubmit + prompt pattern detected | Inject the 7-dimension scoring prompt |
| `lwy-llm-wiki` (hook part) | UserPromptSubmit + keyword scan hit | Inject the list of relevant wiki topics |
| `lwy-prompt-optimizer` (hook part) | UserPromptSubmit + prompt pattern detected | Inject the 7-dimension scoring prompt |
| `lwy-knowledge-consolidation` (Stop hook) | Stop + pattern match ("figured it out", etc.) | Inject a nudge prompting the user to save |
| `lwy-status` (SessionStart) | First session of the week | Inject the cross-subsystem digest |

### Tier 2 — Soft Reflex
**The LLM does pattern matching but no value judgment**. The `description` in SKILL.md spells out the trigger words; when the model sees them it invokes the skill without deliberating over "should I use this".

| Skill | Sample trigger words |
|---|---|
| `on-contradiction` | "矛盾分析", "主要矛盾", "trade-off analysis" |
| `on-practice` | "实事求是", "实践论", "verify through practice" |
| `on-protracted-war` | "持久战", "分阶段策略", "underdog strategy" |
| `lwy-requirement-workflow` | "develop feature", "build feature", "开发功能" |
| `lwy-project-skill-writer` | "创建技能", "编写技能", "设计技能" |
| `lwy-project-agent-writer` | "create agent", "build an agent" |
| `lwy-project-skill-installer` | "install skill", "add skill" |
| `lwy-prompt-optimizer` (proactive mode) | "优化提示词", "分析 prompt", "review this prompt" |
| `lwy-llm-wiki` (proactive mode) | "知识库", "个人 wiki", "收录这个" |

### Tier 3 — Conditioned Cognition
**Once the reflex fires, it enters a constrained reasoning flow**. The skill provides a workflow template / agent orchestration; the LLM reasons within the frame but still has to make judgments.

| Skill | Post-reflex cognitive constraint |
|---|---|
| `lwy-requirement-workflow` | The SDD lifecycle: spec.md → tasks.md → implement → verify |
| `lwy-software-methodology-toolkit` | Fallback triage across 10 methodology agents |
| `on-contradiction` / `on-practice` / `on-protracted-war` | Each one's decision-maker / problem-analyzer / report-writer triad |
| `lwy-llm-wiki` (ingestor / querier, etc.) | The fixed pipeline: summarize → cross-reference → file |

---

## 3. Best practices per reflex tier

### 3.1 Tier 1 (Hard Reflex)

**When to use**: the behavior is fully enumerable, needs no language understanding, and must be absolutely reliable (fires every time, never misses).

**Design points**:
1. **Decide the trigger condition in code, not via the model**. For example, detect English with `englishCharRatio > 0.7` rather than asking the model "is this English".
2. **Minimize side effects**: a hook only injects text / system prompts, it does not modify files directly. Leave file changes to a later LLM tool call.
3. **Fail-soft**: one scanner throwing must not affect the others, and certainly must not block the user's prompt. In this repo `lwy-dispatch` already isolates each sub-scan with try/catch.
4. **Cold-start latency < 200ms**: a hook runs on every prompt, so being slow is an incident. This repo uses `rslib` to bundle the TS into a single-file CJS, avoiding require-tree expansion.
5. **Observable**: all hook output goes to logs (`~/.learnwy/.../logs/`), making it easy to measure trigger frequency and false-positive rate after the fact.
6. **Dedup / rate-limit**: don't re-inject the same prompt within one session; for periodic prompts (e.g. the weekly digest) use the ISO week as the dedup key.

**Anti-examples**:
- ❌ Making network requests inside a hook (high latency, low reliability)
- ❌ `console.log`-ing big debug dumps in a hook (pollutes the context)
- ❌ Implementing "periodic" behavior with `setTimeout` / `setInterval` — hooks are stateless and should rely on a persisted timestamp instead

### 3.2 Tier 2 (Soft Reflex)

**When to use**: the trigger condition needs a little semantic understanding (keyword / intent), but the response path is relatively fixed.

**The reflex-engineering form for a SKILL.md `description`**:

```yaml
description: "<one-line core capability>. Triggers: '<trigger1>', '<trigger2>', '<english synonym>', '<exclusion condition>'. Do not use for: '<boundary1>', '<boundary2>'."
```

Four elements:
1. **Core capability in one sentence**: let the model judge "is this relevant to me?" in one second.
2. **Trigger-word list**: list both Chinese and English; include colloquial variants ("帮我看看" ≠ "分析").
3. **Boundary exclusion (Do not use for)**: counter the over-generalization of "wanting to take on everything". In this repo `lwy-knowledge-consolidation` explicitly says "For global compounding knowledge, use lwy-llm-wiki instead" to avoid competing with the wiki for work.
4. **Cross-link to sibling skills**: let the model know, during triage, that "a better-suited me exists".

**A good example** (from this repo's `lwy-prompt-optimizer`):
> "Pre-flight analysis and scoring of user prompts across 7 dimensions. Triggers: any substantive prose prompt, '优化提示词', '分析 prompt', 'review this prompt'. Do not use for: casual chat, single-word queries."

**Anti-examples**:
- ❌ A description like "general assistant, handles all kinds of problems" — zero triggering power.
- ❌ Trigger words in English only — hit rate plummets in a Chinese-language environment.
- ❌ Putting "implementation details" in the description (they belong in the SKILL.md body) — it burns the model's attention budget.

### 3.3 Tier 3 (Conditioned Cognition)

**When to use**: multi-step reasoning is required after the trigger, but the reasoning path must be reproducible and auditable.

**Design points**:
1. **Make the flow explicit**: write the reasoning path as a finite state machine (e.g. `lwy-requirement-workflow`'s INIT → IMPLEMENTING → TESTING → DONE).
2. **Checkpoints / verification gates**: require an explicit confirmation before each step ends (write the spec, run the tests, read the diff) to stop the LLM from "feeling close enough and skipping a step".
3. **Separation of agent roles**: split "analyzer / decision-maker / writer" apart (see the decision-maker / problem-analyzer / report-writer triad in the three Mao-methodology skills); give each agent its own prompt paradigm, so one prompt isn't forced to analyze, summarize, and decide all at once.
4. **Feedback loop**: write execution results back to logs/index, so the next similar problem can cite the previous output. In this repo `lwy-llm-wiki`'s `health.json` and `lwy-prompt-optimizer`'s trends are both such loops.

---

## 4. Reflex-oriented best practices for prompt design

Treat "the prompt" as the middle segment of the reflex arc: upstream is the trigger, downstream is the tool call + text output.

### 4.1 General principles
| Principle | How to land it |
|---|---|
| **Structure > free text** | Use tables / lists / YAML instead of prose. The model "reflexes" faster and more accurately on structured input. |
| **Pair positive + negative examples** | Positives only tend to overfit; negatives only tend to confuse. Several SKILL.md files in this repo pair "✅ Use for / ❌ Do not use for". |
| **Keep trigger words monotonic** | One trigger word maps to exactly one skill. When overlap appears, make them explicitly mutually exclusive (e.g. the boundary declaration between KC and lwy-llm-wiki). |
| **Fix the response template** | Anchor the output format with a template (e.g. lwy-prompt-optimizer's "7-dimension scoring table") so the model doesn't redesign the layout every time. |
| **Declare side effects up front** | "This skill writes files to X / calls the Y API." Let the model/user anticipate the reflex's "momentum". |

### 4.2 Marking the reflex-vs-deliberation boundary

Tell the model explicitly: "this step is a reflex (do it mindlessly), that step is deliberation (stop and think)".

```markdown
## Reflex segment
1. Got X → call tool A → take the result. **Do not** ask questions in this phase.

## Deliberation segment
2. After seeing A's result, **stop** and judge which class X belongs to (Y / Z).
3. Branch differently based on the classification.
```

The INIT → IMPLEMENTING transition in this repo's `lwy-requirement-workflow` is exactly this kind of boundary.

### 4.3 Desensitization

A strong reflex has a side effect: "allergy" — triggering on everything. Add inhibitory conditions proactively at design time:

- `lwy-prompt-optimizer`'s hook says "Skip silently if input is casual chat or a single-word query" — to avoid interrupting on every message.
- `lwy-llm-wiki`'s prompt-scan uses an index of 1913 keywords rather than a full-text grep, to control false positives.
- `lwy-prompt-optimizer` explicitly lists "do-not-trigger conditions" (casual chat, single-word queries, etc.).

---

## 5. Reflex adaptation for strong vs. lightweight models

| Dimension | Large model (Opus / GPT-4 class) | Lightweight model (Haiku / small / on-device) |
|---|---|---|
| **Trigger-judgment ability** | Can infer intent from fuzzy triggers ("help me deal with this" → most likely a dev task) | Must use explicit keywords, command prefixes, or hook-forced triggering |
| **Reflex scope** | Can loosen the trigger list and let model inference backstop it | Must enumerate the trigger list exhaustively; an omission is a missed trigger |
| **Response-template strictness** | Templates can be "framework-level" ("include a table + a summary") | Templates must be "field-level" (what each column is called, what data type) |
| **Multi-skill triage** | Can autonomously pick the best match among 16 skills | Should pre-narrow candidates to ≤3 via `find-skills` / `lwy-dispatch` |
| **Deliberation segment (Tier 3)** | Can write the reasoning flow as "goal + constraints" and let the model plan itself | Must write it as a finite state machine / flowchart, with explicit I/O per step |
| **Error recovery** | Can self-correct from anomalous output ("I missed a step, let me redo it") | Wrong is wrong; must backstop up front (hook validation / template patch / a second call to a large model to fix) |
| **Token budget** | Can fit a long SKILL.md (thousands of tokens) | SKILL.md should be < 500 tokens; move detail to references/ for on-demand loading |
| **Typical usage** | Mostly Tier 2 + Tier 3, with hooks as accelerators | Mostly Tier 1; hooks carry most of the deterministic logic, the LLM only does the last mile |

### 5.1 Reflex-design tips for strong models
- **Avoid over-specification**: turning SKILL.md into a straitjacket wastes a large model's judgment. Give "principles + boundaries" and leave reasoning room.
- **Triggers can be loose**: relying on model triage scales better than exhaustively enumerating trigger words.
- **Make the deliberation segment "question-driven"**: have the model ask itself "what info is this step still missing" before acting.

### 5.2 Reflex-design tips for lightweight models
- **Prefer a hook over a prompt**: whatever can be decided in a script (language, file type, time window) shouldn't be left to the model.
- **Use slash commands + explicit arguments**: `/lookup <word>` is more reliable than "look up what 'break the ice' means".
- **Use template strings for responses**: variables + fixed phrasing concatenated is more stable than free generation.
- **Divide labor between large and small models**: let a small model/script handle triggering and rendering, and route the critical Tier 3 reasoning segment (e.g. methodology analysis) to a large-model API. This repo's `lwy-dispatch` follows exactly this idea — hooks run in Node.js, analysis is handed to the LLM in the conversation.

### 5.3 Dual-model adaptation pattern within one skill

```
[hook (Node.js)]  →  [small-model triage]  →  [large-model reasoning]  →  [small-model/script render]
   Tier 1              Tier 2                  Tier 3                      Tier 1
```

Use the cheapest tool that works for each segment. Don't make a large model do the hook's job, and don't make a small model chew through Tier 3 reasoning.

---

## 6. Anti-patterns

| Anti-pattern | Symptom | Fix |
|---|---|---|
| **Allergic triggering** | Every prompt gets interrupted | Add inhibitory conditions, rate-limit, ISO-week dedup |
| **Silent missed trigger** | Should have fired but didn't | Check the description's trigger-word coverage; use trends logs to count misses |
| **Deliberation-as-reflex** | Long deliberation before a simple tool call | Write the flow into SKILL.md and let the model branch directly |
| **Reflex-as-deliberation** | Logic that should be hard-coded is done by model inference (e.g. detecting language, judging file type) | Move it into the hook script |
| **Overlapping trigger words** | Multiple skills fight for the same intent; the model ping-pongs | Explicit mutual-exclusion declarations + a boundary doc |
| **Fragile reflex arc** | A hook error → the whole prompt is blocked | Wrap each scanner in try/catch; isolate via the dispatcher |
| **Implicit reflex** | A hook quietly modifies files / sends requests without the user knowing | Declare side effects up front; route state changes through LLM tool calls, not the hook |

---

## 7. Reflex-oriented checklist when adding a new skill to this repo

- [ ] Which tier (1 / 2 / 3) does this skill's trigger belong to?
- [ ] Have all the parts of the trigger condition that can be decided in code been pushed down into a hook?
- [ ] Does the description's trigger words cover both Chinese and English? Do they include colloquial variants?
- [ ] Is a "Do not use for" / boundary against sibling skills declared?
- [ ] Does the response have a fixed template, so the model doesn't redesign it each time?
- [ ] Under strong / weak model scenarios, is SKILL.md readable for each (weak models read description + body, strong models can go deep into references/)?
- [ ] Are side effects declared up front? Is the hook fail-soft?
- [ ] Is there a trends/log loop to make it easy to adjust trigger conditions afterward?

---

## References

- This repo's `skills/lwy-dispatch/` — the industrial implementation of a Tier 1 dispatcher
- This repo's `skills/lwy-prompt-optimizer/SKILL.md` — the best template for dual-mode (hook + proactive) reflexes
- This repo's `skills/on-contradiction/` and the other two Mao-methodology skills — the agent triad for Tier 3 conditioned cognition
- [Agent Skills Specification](https://agentskills.io/specification) — the official spec for the description field
