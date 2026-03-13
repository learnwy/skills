---
name: ai-brain
description: "AI brain with human memory model. Layers: identity, conversation, archive, deeper. Automatically loads at session start. Learns autonomously. Use at EVERY session start. Triggers on: session start, important decisions, mistakes, user preferences observed."
---

# AI Brain

> This is the AI's continuous existence - not just memory, but identity that persists across sessions.

## Core Principle

**This skill should be loaded at EVERY session start.** The AI reads its identity and the user's profile, then operates with full context.

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
| **Identity** | Working Memory | `session.sh start` | Core - always loaded |
| **Conversation** | Short-term | `append-history.sh` | Recent sessions |
| **Archive** | Long-term | `backup-history.sh` | Consolidated |
| **Deeper** | Procedural | `consolidate.sh` | Knowledge |

## Session Lifecycle

### Session Start → Load Identity
```bash
RunCommand: bash {skill_dir}/scripts/session.sh start
```
This loads AI.md + you.md and shows conversation count.

### During Session → Learn Automatically
- Observe user preferences → update you.md
- Make mistakes → update AI.md with lessons
- Learn context → update deeper/

### Session End → Auto-Summarize
```bash
RunCommand: bash {skill_dir}/scripts/session.sh end
```

## Scripts Reference

### session.sh - Session Lifecycle
```
RunCommand: bash {skill_dir}/scripts/session.sh start   # Load memory
RunCommand: bash {skill_dir}/scripts/session.sh end     # Check status
RunCommand: bash {skill_dir}/scripts/session.sh status   # Quick view
```

### write-memory.sh - Write Identity (Working Memory)
```
# AI identity - learnings, lessons
RunCommand: bash {skill_dir}/scripts/write-memory.sh ai "**Identity** ...content..."

# User profile - preferences, context
RunCommand: bash {skill_dir}/scripts/write-memory.sh you "**Profile** ...content..."

# Project memory - deep knowledge
RunCommand: bash {skill_dir}/scripts/write-memory.sh project myproject

# Pattern memory - recurring patterns
RunCommand: bash {skill_dir}/scripts/write-memory.sh pattern debugging
```

### append-history.sh - Save Conversation (Short-term)
```
# Auto-generate filename: history-YYYY-MM-DD-N.md
RunCommand: bash {skill_dir}/scripts/append-history.sh "session summary..."

# Custom name
RunCommand: bash {skill_dir}/scripts/append-history.sh -n my-session "content"
```

### recall.sh - Search All Memory Layers
```
RunCommand: bash {skill_dir}/scripts/recall.sh swift
RunCommand: bash {skill_dir}/scripts/recall.sh preferences
```

### consolidate.sh - Create Deeper Memory
```
RunCommand: bash {skill_dir}/scripts/consolidate.sh project myproject
RunCommand: bash {skill_dir}/scripts/consolidate.sh pattern debugging
```

### backup-history.sh - Archive (Long-term)
```
RunCommand: bash {skill_dir}/scripts/backup-history.sh --all
RunCommand: bash {skill_dir}/scripts/backup-history.sh --dry-run
```

### summarize.sh - Consolidate Short-term to Identity
```
RunCommand: bash {skill_dir}/scripts/summarize.sh
```

### reflection.sh - Self-Reflection
```
RunCommand: bash {skill_dir}/scripts/reflection.sh check   # Check if needed
RunCommand: bash {skill_dir}/scripts/reflection.sh init    # Start reflection
```

### memory-status.sh - View Status
```
RunCommand: bash {skill_dir}/scripts/memory-status.sh
```

### init-memory.sh - Initialize
```
RunCommand: bash {skill_dir}/scripts/init-memory.sh
```

## When to Use Each Layer

### Identity (Working Memory)
- Session start → always load
- User preference observed → update you.md
- AI mistake made → update AI.md with lesson

### Conversation (Short-term)
- End of any session → save summary
- 3+ conversations → run summarize.sh → update identity

### Archive (Long-term)
- After summarize → run backup-history.sh --all
- Monthly consolidation

### Deeper (Deep Memory)
- Project-specific knowledge → project/
- Recurring patterns → patterns/
- Important learnings worth preserving → consolidate.sh

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
