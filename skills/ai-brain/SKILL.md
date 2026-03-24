---
name: ai-brain
description: "Adaptive AI memory system. Triggers on: session start, 'remember', 'learn', 'what do you know about'. Combines episodic (sessions), semantic (facts/preferences), and procedural (patterns) memory. Gets smarter with use."
metadata:
  author: "learnwy"
  version: "3.0"
---

# AI Brain — Persistent Memory System

Gives AI persistent memory across sessions. Remembers who you are, what you prefer, what patterns you've established, and what happened in past sessions.

## Prerequisites

- Node.js >= 18
- Writable home directory for `~/.learnwy/ai/memory/` storage

## Core Concept

Three memory types, inspired by human cognition:

| Type | What It Stores | Persists Across Sessions | Example |
|------|---------------|------------------------|---------|
| **Episodic** | Session history, what happened | Yes | "Last session we refactored the auth module" |
| **Semantic** | Facts, preferences, knowledge | Yes | "User prefers TypeScript", "Project uses React 18" |
| **Procedural** | Patterns, rules, how-to | Yes | "When fixing nil panic, check element IDs first" |

Plus **Identity**: who the AI is and who the user is — loaded at every session start.

## Memory Architecture

```
~/.learnwy/ai/memory/
├── semantic/
│   ├── facts/          # fact-{hash}.md
│   └── preferences/    # pref-{hash}.md
├── procedural/
│   └── patterns/       # pattern-{hash}.md
├── episodic/
│   └── sessions/       # session-{date}-{hash}.md
├── identity/
│   ├── AI.md           # Who the AI is
│   └── user.md         # Who the user is
└── index/
    └── active-session.json
```

## Session Lifecycle

Every interaction should be wrapped in a session:

```
Session Start  →  Load Identity + Recent Context  →  Work  →  Session End (save summary)
     ↓                                                                ↓
  start.cjs                                                    session.cjs end
```

### Session Start (run at conversation begin)

```bash
node start.cjs [--project <name>]
```

Returns JSON with:
- Active session (new or resumed)
- AI and user identity
- Last 3 session summaries (cross-session context)
- Memory stats

### Session End (run at conversation end)

```bash
node session.cjs end --summary "What we accomplished this session"
```

Saves session to episodic memory with: start/end time, project, memories created/recalled, summary.

## Commands

### Remember (save a memory)

```bash
node remember.cjs "<content>" [--category fact|preference|pattern] [--tags tag1,tag2] [--project name]
```

- **Auto-categorizes** if no `--category`: "prefer/like/want" → preference, "when/always/pattern" → pattern, else → fact
- **Auto-tags** based on content keywords (react, typescript, api, etc.)
- **Deduplicates**: if similar memory exists, increments frequency instead of creating duplicate
- **Session-aware**: tracks which session created this memory

### Recall (search memories)

```bash
node recall.cjs "<query>" [--category fact|preference|pattern|all] [--project name] [--limit N] [--context]
```

- **Relevance scoring**: exact match (10pts), token match (2pts/token), tag match (3pts), project match (5pts)
- **`--context` flag**: additionally returns recent sessions + identity — useful for full context load
- **Session-aware**: increments session recall counter

### Forget (remove memories)

```bash
node forget.cjs "<content_substring>" [--category fact|preference|pattern]
```

### Status

```bash
node status.cjs [--json]
```

Shows memory counts, identity status, active session info.

### Dump (export all memories)

```bash
node dump.cjs [--json]
```

Full brain dump: all facts, preferences, patterns, recent sessions.

### Clear

```bash
node clear.cjs <all|facts|preferences|patterns|sessions|identity|index>
```

### Reflect (analysis & identity management)

```bash
node reflect.cjs stats              # Memory statistics
node reflect.cjs sessions [--limit] # Recent session history
node reflect.cjs identity show      # Show AI & user identity
node reflect.cjs identity set AI "I am a coding assistant who remembers context"
node reflect.cjs identity set user "Senior dev, prefers TypeScript, works on TikTok iOS"
node reflect.cjs health             # Memory health check
```

### Brain (unified router)

```bash
node brain.cjs <start|stop|status|recall|remember|dump|forget|clear|reflect|session>
```

Routes to the appropriate script. `brain.cjs stop` = `session.cjs end`.

## Cross-Session Memory Flow

```
Session N:
  1. start.cjs loads identity + last 3 session summaries
  2. AI has context: "Last time we worked on X, user prefers Y"
  3. During work: remember.cjs saves new facts/patterns
  4. session.cjs end saves summary to episodic

Session N+1:
  1. start.cjs loads identity + sessions N, N-1, N-2 summaries
  2. AI knows: "Last session we did X. Before that, Y. User prefers Z."
  3. Continuity preserved across sessions
```

## AI Integration Guide

### At Session Start

When the AI brain skill triggers at conversation begin:

1. Run `node start.cjs --project <detected_project_name>`
2. Read the returned `identity.ai` and `identity.user` — adopt the persona
3. Read `recent_sessions` — mention relevant past work naturally
4. Read `stats` — know how much context is available

### During Conversation

When you learn something new about the user or project:

```bash
node remember.cjs "User wants all scripts in CJS format" --category preference --project skills-repo
```

When you need to recall past context:

```bash
node recall.cjs "CJS migration" --project skills-repo --context
```

### At Session End

Before the conversation ends:

```bash
node session.cjs end --summary "Migrated all Python scripts to CJS, added Prerequisites to all skills"
```

## Error Handling

| Issue | Solution |
|-------|----------|
| No identity files | AI works normally, just without persona. Set via `reflect.cjs identity set` |
| No previous sessions | First session — no context to load, start fresh |
| Duplicate memory | Auto-deduplicated, frequency incremented |
| Memory storage full | Use `reflect.cjs health` to check, `clear.cjs` to prune |
| Active session not ended | Next `start.cjs` resumes the existing session |

## Scripts

| Script | Purpose |
|--------|---------|
| [lib.cjs](scripts/lib.cjs) | Shared library (memory CRUD, sessions, identity, search) |
| [brain.cjs](scripts/brain.cjs) | Unified command router |
| [start.cjs](scripts/start.cjs) | Session start with context loading |
| [session.cjs](scripts/session.cjs) | Session lifecycle (start/end/current) |
| [remember.cjs](scripts/remember.cjs) | Save memory with dedup + auto-tag |
| [recall.cjs](scripts/recall.cjs) | Search with relevance scoring |
| [forget.cjs](scripts/forget.cjs) | Remove memories by content match |
| [status.cjs](scripts/status.cjs) | Brain status overview |
| [dump.cjs](scripts/dump.cjs) | Full memory export |
| [clear.cjs](scripts/clear.cjs) | Clear memory by category |
| [reflect.cjs](scripts/reflect.cjs) | Stats, sessions, identity, health |
