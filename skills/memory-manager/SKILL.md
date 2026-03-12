---
name: memory-manager
description: Human memory model for AI. Layers: identity, conversation, archive, deeper. ALWAYS load at session start. Cross-IDE shared memory at ~/.learnwy/ai/memory/
---

# Memory Manager

> **Personal Use Only** - Configured for wangyang.learnwy's personal AI memory.

Human memory-inspired persistent memory system. **Load at every session start.**

## ⚠️ Critical: File Operations

**NEVER use Write/SearchReplace tools** for memory files. **ALWAYS use RunCommand + scripts:**

```
RunCommand: bash {skill_dir}/scripts/write-memory.sh AI.md "content"
RunCommand: bash {skill_dir}/scripts/append-history.sh "history-YYYY-MM-DD-N.md" "content"
```

## Memory Architecture (Human Memory Model)

```
~/.learnwy/ai/memory/
├── identity/              # WORKING MEMORY - Load every session
│   ├── AI.md             # AI's self-identity (AI maintains)
│   └── you.md            # User profile (user can view/edit)
├── conversation/         # SHORT-TERM MEMORY
│   └── history/          # Recent conversations (3-5, then consolidate)
├── archive/               # LONG-TERM MEMORY
│   └── by-month/         # Archived by month (YYYY-MM/)
└── deeper/               # DEEP MEMORY
    ├── projects/         # Project-specific memories
    └── patterns/        # Recurring patterns/habits
```

| Layer | Human Analogy | Purpose |
|-------|--------------|---------|
| **Identity** | Working Memory | Core identity - always loaded |
| **Conversation** | Short-term | Recent sessions |
| **Archive** | Long-term | Consolidated history |
| **Deeper** | Procedural | Project/pattern knowledge |

## Session Start (ALWAYS)

```
Read: ~/.learnwy/ai/memory/identity/AI.md
Read: ~/.learnwy/ai/memory/identity/you.md
```

## Scripts Reference

**All via RunCommand tool:**

### init-memory.sh - Fresh Start

```
RunCommand: bash {skill_dir}/scripts/init-memory.sh
```

Creates fresh memory structure. **Warning: Deletes existing memory!**

### read-memory.sh - Read Memory

```
RunCommand: bash {skill_dir}/scripts/read-memory.sh
RunCommand: bash {skill_dir}/scripts/read-memory.sh identity/AI.md
```

### write-memory.sh - Write Identity

```
RunCommand: bash {skill_dir}/scripts/write-memory.sh AI.md "content"
RunCommand: bash {skill_dir}/scripts/write-memory.sh you.md "content"
RunCommand: bash {skill_dir}/scripts/write-memory.sh deeper/projects/myproject.md "content"
```

**Security**: Only allows identity/AI.md, identity/you.md, deeper/projects/*.md, deeper/patterns/*.md

### append-history.sh - Save Conversation

```
RunCommand: bash {skill_dir}/scripts/append-history.sh "history-2026-03-12-1.md" "session content"
```

### backup-history.sh - Archive

```
RunCommand: bash {skill_dir}/scripts/backup-history.sh --all
RunCommand: bash {skill_dir}/scripts/backup-history.sh --before 2026-02-01
```

### recall.sh - Search Memory

```
RunCommand: bash {skill_dir}/scripts/recall.sh swift
RunCommand: bash {skill_dir}/scripts/recall.sh preferences
```

Searches all memory layers for keyword.

### summarize.sh - Consolidate

```
RunCommand: bash {skill_dir}/scripts/summarize.sh
```

Shows last 3 conversations. AI reviews and updates identity.

### consolidate.sh - Create Deeper Memory

```
RunCommand: bash {skill_dir}/scripts/consolidate.sh project tiktok-bff
RunCommand: bash {skill_dir}/scripts/consolidate.sh pattern debugging-workflow
```

### memory-status.sh - View Status

```
RunCommand: bash {skill_dir}/scripts/memory-status.sh
```

## Memory Files

### identity/AI.md

AI's self-identity. Maintained by AI through conversations.

```
**Identity**
[Who am I - coding partner, not just assistant]

**Core Traits**
[Personality, values]

**Communication**
[Language style, tone]

**Capabilities**
[Technical strengths]

**Growth**
[How I learn from user]

**Lessons**
[Mistakes, insights - never repeat]
```

### identity/you.md

User profile. User can view and edit.

```
**Profile**
[Name, role, environment]

**Preferences**
[Communication, coding style]

**Context**
[Current projects, tech stack]

**Tech Stack**
[Languages, frameworks]

**History**
[Milestones, decisions]
```

### deeper/projects/*.md

Project-specific deep memory.

```
# Project Name

**Created**: YYYY-MM-DD

## Overview

## Key Details

## Decisions

## Learnings

## Related Conversations
```

### deeper/patterns/*.md

Recurring patterns and habits.

```
# Pattern Name

**Created**: YYYY-MM-DD

## Pattern

## When to Apply

## Related Projects
```

## Session End Protocol

### Step 1: Save Conversation

```
RunCommand: bash {skill_dir}/scripts/append-history.sh "history-YYYY-MM-DD-N.md" "# Session

**Date**: YYYY-MM-DD HH:MM
**Topics**: [main topics]

## Key Activities
- [Activity 1]

## Learnings
- [What AI learned]

## Decisions
- [Important decisions]
"
```

### Step 2: Check Consolidation

3+ conversations → Run summarize.sh → Update identity → Archive:

```
RunCommand: bash {skill_dir}/scripts/summarize.sh
# AI reviews and updates identity files
RunCommand: bash {skill_dir}/scripts/write-memory.sh AI.md "updated content"
RunCommand: bash {skill_dir}/scripts/write-memory.sh you.md "updated content"
RunCommand: bash {skill_dir}/scripts/backup-history.sh --all
```

### Step 3: Confirm

```
✓ Session saved: history-2026-03-12-1.md
✓ Identity updated
✓ Archived: N conversation(s)
```

## Writing Style

Dense, telegraphic. No filler. **Bold** titles, not headers.

```
**Preferences** Concise responses; Chinese primary, English for code.
```

NOT:
```
## Preferences
- The user prefers concise responses
```

## Cross-IDE Sharing

All IDEs share same memory path: `~/.learnwy/ai/memory/`

When installing skill in new IDE:
1. Clone/copy skill to new IDE
2. Run init-memory.sh (or point scripts to existing memory path)
3. All IDEs read/write same memory files

## Token Limits

- **Identity**: Keep under 2000 tokens each
- **Conversation**: Auto-archive at 3+ sessions
- **Archive**: Monthly organization
- **Deeper**: No limit - structured for searchability

## Notes

- Always use RunCommand + scripts for writes
- Identity files are primary - load every session
- Use recall.sh to find past information
- Create deeper memories for projects/patterns
- Archive regularly to keep conversation layer clean
