---
name: memory-manager
description: Human memory model for AI. Layers: identity, conversation, archive, deeper. Auto-load, auto-save, reflection. Cross-IDE shared at ~/.learnwy/ai/memory/. Use when user says "save memory", "load memory", "remember", "forget", session start/end, or needs persistent AI memory.
---

# Memory Manager

> **Personal Use Only** - Configured for wangyang.learnwy's personal AI memory.

Human memory-inspired persistent memory system with **configurable triggers** and **self-reflection**.

## ⚠️ Critical: File Operations

**ALWAYS use RunCommand + scripts:**

```
RunCommand: bash {skill_dir}/scripts/write-memory.sh identity/AI.md "content"
RunCommand: bash {skill_dir}/scripts/session.sh start
```

## Memory Architecture

```
~/.learnwy/ai/memory/
├── identity/              # WORKING MEMORY
│   ├── AI.md             # AI self-identity
│   └── you.md            # User profile
├── conversation/         # SHORT-TERM
│   └── history/          # Recent sessions
├── archive/              # LONG-TERM
│   └── by-month/
├── deeper/               # DEEP MEMORY
│   ├── projects/
│   └── patterns/
└── .memoryrc             # Configuration
```

| Layer | Analogy | Purpose |
|-------|---------|---------|
| **Identity** | Working | Core - always loaded |
| **Conversation** | Short-term | Recent sessions |
| **Archive** | Long-term | Consolidated |
| **Deeper** | Procedural | Knowledge |

## Session Lifecycle

### Session Start → `session.sh start`

```
RunCommand: bash {skill_dir}/scripts/session.sh start
```

- Loads identity (AI.md + you.md)
- Shows conversation count
- Suggests consolidation/reflection if needed

### Session End → `session.sh end`

```
RunCommand: bash {skill_dir}/scripts/session.sh end
```

- Shows current memory status
- Recommends actions (save, consolidate, reflect)

## Triggers System

### 1. Load Triggers
| Trigger | Default | Description |
|---------|---------|-------------|
| `LOAD_ON_START` | true | Load identity at session start |

### 2. Save Triggers
| Trigger | Default | Description |
|---------|---------|-------------|
| `AUTO_SAVE_CONVERSATION` | true | Auto-save on conversation end |
| `AUTO_SAVE_INTERVAL` | 3 | Save after N conversations |
| `AUTO_SAVE_ON_EXIT` | true | Save on session exit |

### 3. Consolidation Triggers
| Trigger | Default | Description |
|---------|---------|-------------|
| `CONSOLIDATE_AFTER` | 3 | Consolidate after N conversations |
| `CONSOLIDATE_ON_EXIT` | true | Consolidate on exit |

### 4. Reflection Triggers
| Trigger | Default | Description |
|---------|---------|-------------|
| `ENABLE_REFLECTION` | true | Enable self-reflection |
| `REFLECTION_INTERVAL` | 5 | Reflect after N conversations |

### 5. Limits
| Trigger | Default | Description |
|---------|---------|-------------|
| `MAX_CONVERSATION` | 5 | Max before forced archive |

## Scripts Reference

### session.sh - Session Lifecycle

```
RunCommand: bash {skill_dir}/scripts/session.sh start   # Session start
RunCommand: bash {skill_dir}/scripts/session.sh end     # Session end
RunCommand: bash {skill_dir}/scripts/session.sh status  # Check status
```

### memory-config.sh - Configuration

```
RunCommand: bash {skill_dir}/scripts/memory-config.sh init   # Create config
RunCommand: bash {skill_dir}/scripts/memory-config.sh show   # Show config
```

Edit `~/.learnwy/ai/memory/.memoryrc` to customize triggers.

### init-memory.sh - Initialize

```
RunCommand: bash {skill_dir}/scripts/init-memory.sh
```

### write-memory.sh - Write Identity

```
RunCommand: bash {skill_dir}/scripts/write-memory.sh identity/AI.md "content"
RunCommand: bash {skill_dir}/scripts/write-memory.sh identity/you.md "content"
RunCommand: bash {skill_dir}/scripts/write-memory.sh deeper/projects/myproject.md "content"
```

### read-memory.sh - Read Memory

```
RunCommand: bash {skill_dir}/scripts/read-memory.sh
RunCommand: bash {skill_dir}/scripts/read-memory.sh identity/AI.md
```

### append-history.sh - Save Conversation

```
RunCommand: bash {skill_dir}/scripts/append-history.sh "history-2026-03-12-1.md" "content"
```

### backup-history.sh - Archive

```
RunCommand: bash {skill_dir}/scripts/backup-history.sh --all
RunCommand: bash {skill_dir}/scripts/backup-history.sh --before 2026-02-01
RunCommand: bash {skill_dir}/scripts/backup-history.sh --dry-run
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

### consolidate.sh - Create Deeper Memory

```
RunCommand: bash {skill_dir}/scripts/consolidate.sh project myproject
RunCommand: bash {skill_dir}/scripts/consolidate.sh pattern mypattern
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

## Self-Reflection

AI periodically reflects on its behavior:

1. **What patterns did I notice?**
2. **What mistakes did I make?**
3. **What new things did I learn?**
4. **What can I improve?**

Run reflection manually or let triggers prompt you.

## Model/IDE/Agent Specific

Add to `.memoryrc`:

```bash
# Trae-specific
MODEL_TRAE="CONSOLIDATE_AFTER=2"

# Claude-specific
MODEL_CLAUDE="CONSOLIDATE_AFTER=3"
```

## Session End Protocol

### Quick Save (single conversation)
```
RunCommand: bash {skill_dir}/scripts/append-history.sh "history-YYYY-MM-DD-N.md" "content"
```

### Full Save + Consolidate (3+ conversations)
```
# 1. Summarize
RunCommand: bash {skill_dir}/scripts/summarize.sh

# 2. Update identity (AI reviews and edits)
RunCommand: bash {skill_dir}/scripts/write-memory.sh identity/AI.md "updated"

# 3. Archive
RunCommand: bash {skill_dir}/scripts/backup-history.sh --all

# 4. Reflect (optional)
RunCommand: bash {skill_dir}/scripts/reflection.sh init
```

## Session Start Protocol

```
# Always run at session start
RunCommand: bash {skill_dir}/scripts/session.sh start
```

This loads identity and shows recommendations.

## Cross-IDE Sharing

All IDEs share: `~/.learnwy/ai/memory/`

Install skill in new IDE → uses same memory path → all IDEs share memory.

## Writing Style

Dense, telegraphic. **Bold** titles.

```
**Preferences** Concise responses; Chinese primary.
```

NOT:
```
## Preferences
- User prefers...
```

## Quick Start

1. Initialize memory:
   ```
   bash {skill_dir}/scripts/init-memory.sh
   ```

2. Start session:
   ```
   bash {skill_dir}/scripts/session.sh start
   ```

3. Work with user...

4. End session:
   ```
   bash {skill_dir}/scripts/session.sh end
   ```

5. Save conversation:
   ```
   bash {skill_dir}/scripts/append-history.sh "history-YYYY-MM-DD-1.md" "content"
   ```
