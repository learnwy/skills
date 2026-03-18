---
name: ai-brain
description: "Adaptive AI memory system. Triggers on: session start, 'remember', 'learn', 'what do you know about'. Combines OpenClaw's Mem0 with human memory model: episodic (conversations), semantic (knowledge), procedural (skills). Gets smarter with use."
---

# AI Brain

> Adaptive memory that evolves with every session. Like OpenClaw's Mem0 + human memory model.

## Core Concept

**The more you use it, the smarter it gets.** Memory is layered by type and accessibility.

## Memory Architecture

```
~/.learnwy/ai/memory/
├── session/              # Working Memory (current context)
│   └── context.md      # Current conversation context
├── episodic/            # Episodic Memory (experiences)
│   └── history/       # Past conversations
├── semantic/           # Semantic Memory (facts)
│   ├── facts/        # Known facts
│   └── preferences/  # User preferences
└── procedural/         # Procedural Memory (skills)
    ├── patterns/     # Recurring patterns
    └── workflows/    # Known workflows
```

| Layer | OpenClaw Scope | Human Analogy | Purpose |
|-------|---------------|---------------|---------|
| **session** | session | Working memory | Current context |
| **episodic** | long-term | Hippocampus | Past experiences |
| **semantic** | all | Cortex | Facts & preferences |
| **procedural** | all | Basal ganglia | Skills & patterns |

## Commands (Simplified)

```bash
# Session
node brain.cjs start              # Start session (load memory)
node brain.cjs remember "X"      # Store memory
node brain.cjs recall "X"        # Search memories
node brain.cjs forget "X"        # Remove memory

# Utility
node brain.cjs status            # Memory stats
node brain.cjs dump             # Export all memories
node brain.cjs clear            # Reset (with confirmation)
```

## Memory Storage

### Remember (Auto-categorized)
```bash
node brain.cjs remember "User prefers brief responses"
node brain.cjs remember "Project uses React + TypeScript"
node brain.cjs remember "Always check logs before debugging"
```

Memory is auto-categorized:
- **Preferences** → semantic/preferences/
- **Facts** → semantic/facts/
- **Patterns** → procedural/patterns/
- **Conversations** → episodic/history/

### Recall (Scoped Search)
```bash
node brain.cjs recall "preferences"           # All preferences
node brain.cjs recall "session:preferences"   # Session only
node brain.cjs recall "long-term:patterns"    # Patterns only
node brain.cjs recall "all:React"             # Everything about React
```

### Forget (Smart Deletion)
```bash
node brain.cjs forget "outdated-fact"        # Remove from all layers
node brain.cjs forget "session:temp-data"   # Session only
```

## Session Lifecycle

### Start → Load Context
```bash
node brain.cjs start
```
1. Load semantic/preferences (user likes/dislikes)
2. Load recent episodic history (last 3 conversations)
3. Build context for this session

### During Session → Learn
```bash
node brain.cjs remember "X"
```
- Explicit memories are stored immediately
- Implicit learning: track topic frequency
- Pattern detection: recurring workflows

### End → Consolidate
```bash
node brain.cjs end
```
1. Save session summary to episodic/history/
2. Update preference learned tokens
3. Detect if new pattern should be saved

## Adaptive Learning

### Frequency Tracking
- Track how often topics appear
- More frequent = higher priority in recall
- Fade rarely-used memories (but never delete)

### Pattern Detection
- Track recurring sequences:
  - "User asks X → they want Y next"
  - "When error Z occurs → check A first"
- Build workflow shortcuts

### Preference Learning
- Communication style (brief/detailed)
- Code style preferences
- Tool preferences
- Time zone & availability

## OpenClaw Memory Integration

Based on OpenClaw's memory scopes:

| Scope | Description |
|-------|-------------|
| `session:` | Current session only |
| `long-term:` | Persistent across sessions |
| `all:` | Search everything |

Example:
```bash
node brain.cjs remember "session:temp-note"    # Session only
node brain.cjs recall "long-term:preferences" # All preferences
```

## Smart Features

### Context Window Management
Inspired by OpenClaw's token budget:
- Keep only relevant recent context
- Summarize old sessions
- Prioritize frequently-used knowledge

### Memory Consolidation
- After 10 sessions → consolidate learnings
- Monthly archive of old episodic memories
- Semantic compression (similar facts merged)

### Confidence Scoring
Each memory has a confidence:
- **High**: User explicitly stated
- **Medium**: Observed multiple times
- **Low**: Single observation

Recall returns results sorted by confidence.

## When to Remember

### Explicit (User Triggers)
- "Remember that I prefer..."
- "Don't forget to..."
- "Learn that..."

### Implicit (Automatic)
- User repeats same preference
- Same error occurs 3+ times
- Workflow used frequently
- Important decision made

## Session Scripts

### brain.cjs - Main Entry
```bash
node brain.cjs <cmd> [args]
```

### Commands

| Command | Description |
|---------|-------------|
| `start` | Load memories, start session |
| `remember <text>` | Store memory (auto-categorized) |
| `recall <query>` | Search memories |
| `forget <query>` | Delete memory |
| `status` | Show memory statistics |
| `dump` | Export all memories (JSON) |
| `clear` | Reset all memories |

### Advanced Commands

| Command | Description |
|---------|-------------|
| `remember --scope session "text"` | Force scope |
| `remember --type preference "text"` | Force type |
| `recall --scope long-term --type pattern` | Filtered recall |
| `consolidate` | Merge similar memories |
| `archive` | Archive old sessions |

## Storage Format

### Memory File Format
```markdown
# semantic/preferences/user-communication.md

**Content**: User prefers brief, concise responses
**Confidence**: high
**Source**: explicit
**Created**: 2026-03-19T10:00:00Z
**Accessed**: 2026-03-19T14:30:00Z
**Frequency**: 5
**Tags**: communication, style
```

### Session Format
```markdown
# episodic/history/2026-03-19-1.md

**Summary**: User requested AI brain optimization
**Duration**: 45m
**Topics**: memory, skills, openclaw
**Learnings**: [list of new memories stored]
**Created**: 2026-03-19T10:00:00Z
```

## Key Philosophy

1. **Usage → Intelligence**: More use = smarter responses
2. **Explicit > Implicit**: Explicit memories are higher confidence
3. **Never Lose Context**: Archive, don't delete
4. **Adaptive Recall**: Frequently needed = easily found
5. **Human Memory Model**: Episodic, Semantic, Procedural layers

## Examples

```bash
# New user setup
node brain.cjs start
node brain.cjs remember "My name is Wang"
node brain.cjs remember "I prefer concise responses"
node brain.cjs remember "I work with TypeScript and Node.js"

# Recalling
node brain.cjs recall "name"           # What was the name?
node brain.cjs recall "preferences"    # What are my preferences?
node brain.cjs recall "session:all"    # What happened this session?

# Learning
node brain.cjs remember "I don't like long explanations"
node brain.cjs remember "When fixing bugs, check logs first"
```

## Quality Gates

| Condition | Action |
|-----------|--------|
| 5+ recalls of same topic | Boost priority |
| 30+ days unused memory | Archive (not delete) |
| 10+ sessions | Suggest consolidation |
| New pattern detected | Prompt confirmation |
