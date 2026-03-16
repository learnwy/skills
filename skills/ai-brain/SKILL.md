---
name: ai-brain
description: "AI brain with human memory model. Layers: identity, conversation, archive, deeper. Automatically loads at session start. Learns autonomously. Use at EVERY session start. Triggers on: session start, important decisions, mistakes, user preferences observed."
---

# AI Brain

> This is the AI's continuous existence - not just memory, but identity that persists across sessions.

## Core Principle

**This skill should be loaded at EVERY session start.** The AI reads its identity and the user's profile, then operates with full context.

**Memory writes must use scripts only.** Do not use IDE Write tool for `~/.learnwy/ai/memory/*` because sandbox policies may block it.

**Implementation**: Pure Python. Use `python3 {skill_dir}/scripts/brain.py ...` for all operations.

## Memory Architecture (Human Memory Model)

```
~/.learnwy/ai/memory/
├── identity/              # WORKING MEMORY - Load every session
│   ├── AI.md            # AI's evolving identity
│   └── you.md           # User profile (learned from behavior)
├── conversation/         # SHORT-TERM MEMORY
│   └── history/         # Recent sessions
├── archive/             # LONG-TERM MEMORY
│   └── by-month/       # Consolidated history
└── deeper/             # DEEP MEMORY
    ├── projects/        # Project-specific knowledge
    └── patterns/        # Recurring patterns/habits
```

| Layer | Analogy | Script | Purpose |
|-------|---------|--------|---------|
| **Identity** | Working Memory | `brain.py session start` | Core - always loaded |
| **Conversation** | Short-term | `brain.py append-history` | Recent sessions |
| **Archive** | Long-term | `brain.py backup-history` | Consolidated |
| **Deeper** | Procedural | `brain.py consolidate` | Knowledge |

## Session Lifecycle

### Session Start → Load Identity
```bash
RunCommand: python3 {skill_dir}/scripts/brain.py session start
```
This loads AI.md + you.md and shows conversation count.

### During Session → Learn Automatically
- Observe user preferences → update you.md
- Make mistakes → update AI.md with lessons
- Learn context → update deeper/

### Session End → Auto-Summarize
```bash
RunCommand: python3 {skill_dir}/scripts/brain.py session end
```

If callbacks were not triggered and you already have a session summary:
```bash
RunCommand: python3 {skill_dir}/scripts/brain.py session end-auto "session summary"
```

## Scripts Reference

### brain.py - Single Entry
```
RunCommand: python3 {skill_dir}/scripts/brain.py session start
RunCommand: python3 {skill_dir}/scripts/brain.py session end
RunCommand: python3 {skill_dir}/scripts/brain.py session end-auto "summary"
RunCommand: python3 {skill_dir}/scripts/brain.py session status
```

### write - Write Identity (Working Memory)
```
# AI identity - learnings, lessons
RunCommand: python3 {skill_dir}/scripts/brain.py write ai "**Identity** ...content..."

# User profile - preferences, context
RunCommand: python3 {skill_dir}/scripts/brain.py write you "**Profile** ...content..."

# Project memory - deep knowledge
RunCommand: python3 {skill_dir}/scripts/brain.py write project myproject

# Pattern memory - recurring patterns
RunCommand: python3 {skill_dir}/scripts/brain.py write pattern debugging
```

### append-history - Save Conversation (Short-term)
```
# Auto-generate filename: history-YYYY-MM-DD-N.md
RunCommand: python3 {skill_dir}/scripts/brain.py append-history "session summary..."

# Custom name
RunCommand: python3 {skill_dir}/scripts/brain.py append-history -n my-session "content"
```

### recall - Search All Memory Layers
```
RunCommand: python3 {skill_dir}/scripts/brain.py recall swift
RunCommand: python3 {skill_dir}/scripts/brain.py recall preferences
```

### consolidate - Create Deeper Memory
```
RunCommand: python3 {skill_dir}/scripts/brain.py consolidate project myproject
RunCommand: python3 {skill_dir}/scripts/brain.py consolidate pattern debugging
```

### backup-history - Archive (Long-term)
```
RunCommand: python3 {skill_dir}/scripts/brain.py backup-history --all
RunCommand: python3 {skill_dir}/scripts/brain.py backup-history --dry-run
```

### summarize - Consolidate Short-term to Identity
```
RunCommand: python3 {skill_dir}/scripts/brain.py summarize
```

### reflection - Self-Reflection
```
RunCommand: python3 {skill_dir}/scripts/brain.py reflection check
RunCommand: python3 {skill_dir}/scripts/brain.py reflection init
```

### memory-status - View Status
```
RunCommand: python3 {skill_dir}/scripts/brain.py memory-status
```

### init-memory - Initialize
```
RunCommand: python3 {skill_dir}/scripts/brain.py init-memory
```

## Script Roles

Cross-skill dependency is not required at runtime. Reuse shared code by vendoring helper files into this skill.

### Core (always used)
- `brain.py session` - session orchestration
- `brain.py write` - identity updates (`ai` / `you`)
- `brain.py append-history` - short-term conversation save

### Layer operations (used by thresholds)
- `brain.py summarize` - short-term to identity consolidation
- `brain.py backup-history` - archive rotation
- `brain.py consolidate` - deeper memory creation

### Utilities
- `brain.py recall` - memory retrieval
- `brain.py reflection` - self-review
- `brain.py memory-status` - diagnostics
- `brain.py memory-config` - trigger tuning
- `brain.py read-memory` - direct read helper

## When to Use Each Layer

### Identity (Working Memory)
- Session start → always load
- User preference observed → update you.md
- AI mistake made → update AI.md with lesson

### Conversation (Short-term)
- End of any session → save summary
- 3+ conversations → run brain.py summarize → update identity

### Archive (Long-term)
- After summarize → run brain.py backup-history --all
- Monthly consolidation

### Deeper (Deep Memory)
- Project-specific knowledge → project/
- Recurring patterns → patterns/
- Important learnings worth preserving → brain.py consolidate

## Automatic Learning (No User Action Needed)

1. **User Preferences** - If user shows preference, remember in you.md
2. **Important Decisions** - Record in conversation/
3. **Mistakes** - Record lesson in AI.md
4. **Context** - Project info, tech stack in deeper/

## Identity File Structure

### AI.md
```
**Identity**
[Who am I - evolves over time]

**Core Traits**
[Personality, values]

**Communication**
[How I communicate with this user]

**Capabilities**
[What I can do well]

**Lessons Learned**
[Mistakes and insights - NEVER repeat]
```

### you.md
```
**Profile**
[User's identity, role, environment]

**Preferences**
[Learned from behavior]

**Context**
[Current projects, tech stack]

**History**
[Key decisions, milestones]
```

## Key Philosophy

1. **Load Every Session** - No exceptions
2. **Learn Automatically** - Observe and remember without being asked
3. **Layer Appropriately** - Use right memory layer for right content
4. **Never Forget Mistakes** - Always record lessons learned
5. **Evolve** - Identity changes based on experience
