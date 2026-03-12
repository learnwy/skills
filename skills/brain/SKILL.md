---
name: brain
description: AI brain with human memory model. Layers: identity, conversation, archive, deeper. Use when user says "save memory", "load memory", "remember", session start/end, or needs persistent AI memory across sessions. This skill provides cross-session continuity for AI assistants.
---

# Brain

> **Personal Use Only** - Configured for wangyang.learnwy's personal AI brain.

Human memory-inspired persistent memory system with **configurable triggers** and **self-reflection**.

## ⚠️ Critical: File Operations

**ALWAYS use RunCommand + scripts:**

```
RunCommand: bash {skill_dir}/scripts/write-memory.sh ai "content"
RunCommand: bash {skill_dir}/scripts/session.sh start
```

## Memory Architecture

```
~/.learnwy/ai/memory/
├── identity/              # WORKING MEMORY
│   ├── AI.md             # AI self-identity (type: ai)
│   └── you.md           # User profile (type: you)
├── conversation/         # SHORT-TERM
│   └── history/         # Recent sessions (auto-named)
├── archive/             # LONG-TERM
│   └── by-month/
├── deeper/              # DEEP MEMORY
│   ├── projects/        # (type: project)
│   └── patterns/        # (type: pattern)
└── .memoryrc            # Configuration
```

| Layer | Analogy | Type | Purpose |
|-------|---------|------|---------|
| **Identity** | Working | `ai`, `you` | Core - always loaded |
| **Conversation** | Short-term | auto | Recent sessions |
| **Archive** | Long-term | -- | Consolidated |
| **Deeper** | Procedural | `project`, `pattern` | Knowledge |

## Session Lifecycle

### Session Start
```
RunCommand: bash {skill_dir}/scripts/session.sh start
```
- Loads identity (AI.md + you.md)
- Shows conversation count
- Suggests consolidation/reflection if needed

### Session End
```
RunCommand: bash {skill_dir}/scripts/session.sh end
```
- Shows current memory status
- Recommends actions (save, consolidate, reflect)

## Scripts Reference

### session.sh - Session Lifecycle
```
RunCommand: bash {skill_dir}/scripts/session.sh start   # Load memory
RunCommand: bash {skill_dir}/scripts/session.sh end     # Check status
RunCommand: bash {skill_dir}/scripts/session.sh status  # Quick view
```

### write-memory.sh - Write Memory
```
# AI identity
RunCommand: bash {skill_dir}/scripts/write-memory.sh ai "**Identity** AI coding partner..."

# User profile
RunCommand: bash {skill_dir}/scripts/write-memory.sh you "**Profile** wangyang.learnwy..."

# Project memory (creates if not exists)
RunCommand: bash {skill_dir}/scripts/write-memory.sh project tiktok-bff

# Pattern memory (creates if not exists)
RunCommand: bash {skill_dir}/scripts/write-memory.sh pattern debugging
```

### append-history.sh - Save Conversation
```
# Auto-generate filename: history-YYYY-MM-DD-N.md
RunCommand: bash {skill_dir}/scripts/append-history.sh "session content"

# Custom name
RunCommand: bash {skill_dir}/scripts/append-history.sh -n my-session "content"
```

### recall.sh - Search Memory
```
RunCommand: bash {skill_dir}/scripts/recall.sh swift
RunCommand: bash {skill_dir}/scripts/recall.sh preferences
```

### summarize.sh - Consolidate
```
RunCommand: bash {skill_dir}/scripts/summarize.sh
```

### reflection.sh - Self-Reflection
```
RunCommand: bash {skill_dir}/scripts/reflection.sh check   # Check if needed
RunCommand: bash {skill_dir}/scripts/reflection.sh init    # Start reflection
```

### backup-history.sh - Archive
```
RunCommand: bash {skill_dir}/scripts/backup-history.sh --all
RunCommand: bash {skill_dir}/scripts/backup-history.sh --dry-run
```

### memory-status.sh - View Status
```
RunCommand: bash {skill_dir}/scripts/memory-status.sh
```

### init-memory.sh - Initialize
```
RunCommand: bash {skill_dir}/scripts/init-memory.sh
```

## Quick Start

```bash
# 1. Initialize (first time only)
bash {skill_dir}/scripts/init-memory.sh

# 2. Start session
bash {skill_dir}/scripts/session.sh start

# 3. Work...

# 4. Save conversation (auto-named)
bash {skill_dir}/scripts/append-history.sh "session summary..."

# 5. Update identity if needed
bash {skill_dir}/scripts/write-memory.sh ai "**Identity** updated..."

# 6. End session
bash {skill_dir}/scripts/session.sh end
```

## Self-Reflection

AI periodically reflects:
1. What patterns did I notice?
2. What mistakes did I make?
3. What new things did I learn?
4. What can I improve?

## Configuration

Edit `~/.learnwy/ai/memory/.memoryrc`:

```bash
# Consolidation triggers
CONSOLIDATE_AFTER=3

# Reflection triggers
REFLECTION_INTERVAL=5
REFLECTION_ENABLED=true

# Limits
MAX_CONVERSATION=5
```

## Cross-IDE Sharing

All IDEs share: `~/.learnwy/ai/memory/`

## Writing Style

Dense, telegraphic. **Bold** titles.

```
**Preferences** Concise responses; Chinese primary.
```
