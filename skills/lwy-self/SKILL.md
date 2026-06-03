---
name: lwy-self
description: "Personal alter-ego life & work log. Triggers when the user wants to record what they did today, who they collaborated with, which projects/decisions they moved forward, or says 『记一下』『今天』『周报』『我的同事/项目』『把这场会/妙记沉淀进来』『alter ego』『life log』. Files daily life and meetings into the private self store (diaries/people/products/events) so the AI becomes an informed alter-ego. Counterpart to lwy-llm-wiki (world knowledge: books/concepts); this skill owns the personal layer."
metadata:
  author: "learnwy"
  version: "1.1"
  privacy: "private — local-only, never pushed to the public repo"
---

# lwy-self — Personal Alter-Ego

Record your **life and work** to build a private self-model that knows you — the **personal layer**,
counterpart to `lwy-llm-wiki` (world knowledge).

- **World wiki** (`~/.learnwy/llm-wiki/`, public): "what I know about the world" — books, concepts, authors.
- **Alter-ego / self** (`~/.learnwy/ai/private/self/`, private local-only submodule): "who I am, what I did, who I know" — diaries, colleagues, projects, decisions.

## Storage & engine

self shares the **same engine** as `lwy-llm-wiki` (the shared module `src/shared/wiki/`); only the
default root differs. `lwy-self` now has **its own binary** defaulting to the private self root
(`~/.learnwy/ai/private/self`), so everyday commands need **no `--root`**; pass `--root` to point at a different store.

```sh
# lwy-self defaults to the private self store — no --root needed
lwy-self stats
lwy-self lint
lwy-self generate-index
lwy-self generate-topics

# --root still overrides the default
lwy-self stats --root /some/other/wiki
```

Full operations manual lives in that root's `CLAUDE.md` (entity-first layout, capture rhythm, privacy conventions).

## When to use this skill

| Signal | Action |
|--------|--------|
| "record this / today / I just talked with X" | **Daily quick-capture**: append a dated bullet to `ai/private/self/wiki/diaries/<ISO-week>.md` |
| "review this week / weekly report / recap the week" | **Weekly review**: read the week's diary, promote durable facts into people/products/events entity pages |
| "who is X / who am I doing Y with / what's the status of this project" | **Query**: read the self people/products/events pages and answer |
| "file this Feishu group/doc into self" | **Ingest**: land via `lark-context` into `raw/lark/`, then compile into threads/people/events (see lwy-llm-wiki's ingest-lark flow) |
| "file this meeting/minutes into self / record this meeting" | **Meeting ingest**: pull the minutes transcript → resolve speakers → compile into diaries/people/products/events (see [`references/ingest-meeting.md`](references/ingest-meeting.md)) |

## Three-step workflow

1. **Daily quick-capture** → append one dated line (event / conversation / decision) under the date in `diaries/<ISO-week>.md`. One line each; land it first, lose nothing.
2. **Compile** → when a bullet warrants persistence, fold it into the relevant `[[people/slug]]` / `[[products/slug]]` / `[[events/slug]]` entity page and cross-link (compiling is integrating into the network, not isolated summarizing).
3. **Weekly review** → read the whole week's diary, promote durable facts into entity pages, run `lint` to keep links clean.

## Name resolution (the key to "being there")

When filing meetings / group chats, every speaker must resolve to one specific person — get it right and
each statement attributes to a person; get it wrong and it degrades into "some colleague thought…"
summary-speak. **The self store's `people/` pages ARE the living name map**: they already carry
alias/pinyin/homophone resolution, roles, and the relationship to you (汪洋) — stronger than a static
`name-map.md`, and they compound over time. When resolving, tell yourself from others and from managers
(a manager's-voice statement most likely comes from a manager); when in doubt re-check the speaker
markers and mark "(speaker TBD)" rather than mis-attributing.

## Boundaries

- **Privacy**: PII and internal company content. Local + private submodule only; **never** copied into the public `llm-wiki/` world store.
- **Not this skill**: world knowledge (books/concepts) → `lwy-llm-wiki`; generic conversation insight → `lwy-knowledge-consolidation`; a **forwardable one-shot meeting note** (terminal / Feishu card) → the `meeting-notes` skill (this skill only does **store-ingest**; the two chain).
- Chinese content is fine inside the store itself (single-user private library); skill docs stay English.
