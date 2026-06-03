# Ingest a meeting / Feishu Minutes (ingest-meeting)

Take a Feishu meeting (Minutes / 妙记) transcript as **a raw source** and compile it into the
private self store — `people/`, `products/`, `events/`, `diaries/` — so the alter-ego grows a
record of "what meetings I attended, with whom, and what I moved forward."

> Complementary to the `meeting-notes` skill, not overlapping: `meeting-notes` **produces** a
> forwardable structured note (terminal / Feishu card); this workflow **ingests** the same meeting
> into the durable self-model. The former is a one-shot deliverable, the latter is compounding
> memory. They chain: run `meeting-notes` for the note, then this flow to file it.

## Prerequisites

- `lark-vc` / `lark-minutes` (or `lark-minutes-reader`) skill + `lark-cli` already `auth login`-ed
- The self store exists (`~/.learnwy/ai/private/self/`); engine is the self-rooted `lwy-llm-wiki`

## Triggers

- "file this meeting into self / record this meeting / what did I do in this meeting"
- "summarize this minutes and store it <minutes-url>"
- A minutes link given with intent to **retain** (vs. only producing a forwardable note → use `meeting-notes`)

## Step 1 — Pull the transcript, land it in raw (immutable layer)

- With a link: read the transcript via `lark-minutes-reader` (preferred) / `lark-minutes`
- Without a link: use `lark-vc` to list recent meetings and locate the target
- Archive the transcript **verbatim** to `raw/lark/minutes-<slug>-<ISO-date>.md` with a header:
  `**Source**:` minutes URL · `**Pulled**:` ISO time · `**Meeting**:` title · `**When**:` meeting time/duration · `**Participants**:` raw participant list

The transcript is the **sole source of truth** for this ingest — never fabricate, never backfill from
memory what the transcript does not say. Empty transcript → report and stop.

## Step 2 — Resolve speakers (the key step — it drives attribution)

**The self store's `people/` pages ARE the living name map** — stronger than a static `name-map.md`:
they already carry alias/pinyin/homophone resolution, roles, and the relationship to you (汪洋).
Every speaker in the transcript must resolve to one specific person:

1. List the speaker markers in the transcript + the participant list from Step 1
2. Resolve each against existing pages via `[[people/<slug>]]` (alias / pinyin / mis-transcription → correct name)
3. **Tell yourself (汪洋) from others, and from managers** — this is what keeps attribution correct:
   - You = 汪洋; use each `people/` page's "relationship" field to tell who is your manager / report / peer
   - A statement in a **manager's voice** (sets direction, makes demands, assigns tasks) most likely
     comes from a manager, not from you — cross-check against the speaker marker
4. Unresolved newcomers: only create a `people/` page once they clear the bar (see Step 3); otherwise
   keep the raw name in `raw/` only

> Resolve common mis-transcriptions too, via `people/` and `concepts/terms` (e.g. `cloud → Claude`, `COI → CLI`).

## Step 3 — Compile into the wiki (incremental merge)

Read this ingest's raw archive and incrementally merge per this mapping:

| Meeting content | Target | Notes |
|---|---|---|
| The meeting itself (what I did today) | `wiki/diaries/<ISO-week>.md` | One dated bullet: `attended <meeting> ([[events/...]]) with [[people/...]], advanced [[products/...]]` |
| People who spoke / committed | `wiki/people/<slug>.md` | Append their key statements / owned items under "recent actions", dated |
| Projects / directions discussed | `wiki/products/<slug>.md` | Append progress, risks, decisions, dated |
| Decisions / milestones landed | `wiki/events/<slug>.md` | One page per decision or merge into an existing one; record date + attendees |
| Recurring terms | `wiki/concepts/terms.md` | |

**Action items**: assign an owner down to the individual → land on that person's `people/` page under a
"todos / commitments" area, and cross-link from `events/` or `diaries/`.

**Incremental merge rules** (same as ingest-lark, strict):
- Keep hand-written paragraphs **untouched**; append new facts with a date tag
- Value judgment: do not create an entity for a one-off passing mention; create when it appears ≥2×,
  is an actionable decision, or the user names it. When in doubt, leave it out
- Conflicts: list both, tag the source (meeting title + date + speaker)
- Cross-link: diary / event pages link to entities via `[[people/...]]`, `[[products/...]]`

## Step 4 — Index + log

```sh
lwy-self generate-index --root ~/.learnwy/ai/private/self
lwy-self generate-topics --root ~/.learnwy/ai/private/self
lwy-self lint --root ~/.learnwy/ai/private/self
```

Append to the self store `log.md`: `<date> ingest-meeting <meeting title> — transcript → P people / Pr products / E events / 1 diary`.

## Step 5 — Report back

> Filed "<meeting>": updated P people / Pr products / E events, 1 diary entry. List created / modified files.

## Notes

- **Privacy**: meetings are internal company content — land them only in the private self store
  (local + private submodule), **never** in the public `llm-wiki/`
- **No fabrication**: record only facts in the transcript; do not backfill what it did not say
- **Preserve hand-written content**: never touch hand-written paragraphs on entity pages; only append
  in dated-bullet / summary areas
- **Attribution in doubt**: re-check the transcript speaker markers + `people/` relationships; mark
  "(speaker TBD)" rather than mis-attributing
