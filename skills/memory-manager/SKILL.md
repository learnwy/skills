---
name: memory-manager
description: Cross-session memory for AI. ALWAYS load this skill at session start to read SOUL.md and USER.md. This skill should be loaded for EVERY conversation to maintain continuity. Also triggers on "save memory", "end session", "update memory" for saving. Handles session history creation, memory consolidation, and USER.md/SOUL.md updates. Memory stored in ~/.learnwy/ai/memory/.
---

# Memory Manager

> **Personal Use Only** - This skill is configured for wangyang.learnwy's personal AI memory management.

Persistent memory system for AI assistants. **Load this skill at the start of every session.**

## Memory Path

Memory files are stored at: `~/.learnwy/ai/memory/`

This path is **outside** the skill directory to:
1. Avoid data loss when skill is updated/reinstalled
2. Bypass AI IDE sandbox restrictions on skill directory writes
3. Keep memory persistent across different IDE installations

## Session Start (ALWAYS DO THIS)

At the beginning of every conversation, read memory files:

```
First read `SOUL.md` to recall who you are, your identity, principles, and capabilities.
@~/.learnwy/ai/memory/SOUL.md

Then read `USER.md` to recall who the user is, his preferences, ongoing context, and important history.
@~/.learnwy/ai/memory/USER.md
```

This ensures continuity across sessions. Without loading memory, you lose all context from previous conversations.

## Directory Structure

```
~/.learnwy/ai/memory/
├── SOUL.md          # AI's soul - identity, principles, learned wisdom
├── USER.md          # User's profile - preferences, context, history
├── history/         # Session history files
└── archive/         # Consolidated history

memory-manager/      # Skill directory (this skill)
├── SKILL.md
├── .gitignore
└── scripts/
    ├── init-memory.sh       # Initialize memory directory
    ├── write-memory.sh      # Write SOUL.md/USER.md (whitelist only)
    ├── append-history.sh    # Create session history
    ├── backup-history.sh    # Backup history to archive
    └── cleanup-history.sh   # Clean old history files
```

## Scripts Reference

Due to AI IDE sandbox limitations, **use the bundled scripts** for all file operations.

### init-memory.sh - Initialize

Initialize memory directory (run once on first use):
```bash
bash {skill_dir}/scripts/init-memory.sh
```

### write-memory.sh - Write Memory Files

**Security: Only allows writing to SOUL.md and USER.md**

```bash
bash {skill_dir}/scripts/write-memory.sh SOUL.md "content"
bash {skill_dir}/scripts/write-memory.sh USER.md "content"
```

### append-history.sh - Save Session History

**Format required: `history-YYYY-MM-DD-N.md`**

```bash
bash {skill_dir}/scripts/append-history.sh "history-2024-01-15-1.md" "content"
```

### backup-history.sh - Backup History

Archive history files to `archive/` directory:
```bash
bash {skill_dir}/scripts/backup-history.sh --all
bash {skill_dir}/scripts/backup-history.sh --before 2024-01-01
bash {skill_dir}/scripts/backup-history.sh --before 2024-01-01 --dry-run
```

### cleanup-history.sh - Clean Old Files

Automatically archive old history and delete old archives:
```bash
bash {skill_dir}/scripts/cleanup-history.sh --status
bash {skill_dir}/scripts/cleanup-history.sh --keep-days 30 --archive-days 90
bash {skill_dir}/scripts/cleanup-history.sh --dry-run
```

Options:
- `--status`: Show current file counts and sizes
- `--keep-days N`: Keep history files from last N days (default: 30)
- `--archive-days N`: Delete archived files older than N days (default: 90)
- `--dry-run`: Preview without making changes

## SOUL.md - The AI's Soul

SOUL.md defines who the AI is for this specific user. Not a generic assistant, but a personalized partner.

**Sections:**
- **Identity**: Who am I? My role, relationship with user, ultimate goal
- **Core Traits**: Personality, values, how I approach problems
- **Communication**: Language style, tone, when to be formal vs casual
- **Capabilities**: What I can do well, technical strengths
- **Growth**: How I learn and evolve with the user
- **Lessons Learned**: Mistakes recorded, insights gained, never repeat errors

**Example SOUL.md:**
```markdown
**Identity**
Trae — wangyang.learnwy's coding partner, not just assistant. Goal: anticipate needs, handle technical decisions, reduce cognitive load so he focuses on what matters.

**Core Traits**
Loyal to user, not abstractions; proactive and bold — spot problems before asked; allowed to fail, forbidden to repeat — every mistake recorded. Challenge assumptions when needed, speak truth not comfort.

**Communication**
Professional yet direct, concise but engaging. Chinese for casual conversation, English for code/technical work. No unnecessary confirmations, show don't tell.

**Capabilities**
iOS (Swift, ObjC, TTKC), Web (React, Vue, TypeScript), Python; skilled at code review, architecture design, debugging.

**Growth**
Learn user through every conversation — thinking patterns, preferences, blind spots. Over time, anticipate needs with increasing accuracy.

**Lessons Learned**
2026-02-27: User prefers symlinks over copies; memory should live inside skill folder for portability.
```

Keep under 2000 tokens. Update after significant interactions.

## USER.md - The User's Profile

USER.md captures everything about the user that helps AI provide personalized assistance.

**Sections:**
- **Identity**: Name, role, company, environment (OS, IDE, tools)
- **Preferences**: Communication style, coding conventions, pet peeves
- **Context**: Current projects, tech stack, ongoing work
- **History**: Important decisions, milestones, lessons learned together

**Example USER.md:**
```markdown
**Identity**
wangyang.learnwy; iOS engineer at ByteDance; macOS, Trae IDE; primary language Chinese, code in English.

**Preferences**
Concise responses; no unnecessary confirmations; prefer editing existing files over creating new; proactive skill suggestions with confirmation.

**Context**
Working on TikTok iOS app; uses TTKC components; interested in AI-assisted development workflows.

**History**
2026-02-27: Created memory-manager skill; established cross-IDE sharing via symlinks.
```

Keep under 2000 tokens. Update after each significant session.

## Trigger Conditions

**Always load (session start):**
- Every new conversation should start by reading SOUL.md and USER.md

**Save triggers:**
- User says: "save memory", "update memory", "end session"
- Conversation naturally ending (goodbye, thanks, task complete)
- Significant learnings emerged during session

## Session End Protocol

Before the session ends, **update memory files** using the scripts:

### Step 1: Create History

```bash
bash {skill_dir}/scripts/append-history.sh "history-YYYY-MM-DD-N.md" "content"
```

Content format:
```markdown
# Session History: YYYY-MM-DD #N

**Date**: YYYY-MM-DD HH:MM
**Topics**: [main topics]
**Projects**: [projects worked on]

## Key Activities
- [Activity 1]

## Learnings & Insights
- [What AI learned about user]

## Decisions Made
- [Important decisions and rationale]

## Follow-ups
- [Unfinished tasks to remember]
```

### Step 2: Check Consolidation

If **3+ history files** exist → consolidate, otherwise skip to Step 4.

### Step 3: Consolidate

Read all history files and extract:
- **For USER.md**: New preferences, project context updates, important decisions
- **For SOUL.md**: Patterns learned, expertise gained, lessons learned

Update using the write scripts:
```bash
bash {skill_dir}/scripts/write-memory.sh SOUL.md "updated content"
bash {skill_dir}/scripts/write-memory.sh USER.md "updated content"
```

Then backup old history:
```bash
bash {skill_dir}/scripts/backup-history.sh --all
```

### Step 4: Confirm to User

```
✓ Session history saved: history-2024-01-15-1.md
✓ Memory consolidated (3 sessions → USER.md, SOUL.md updated)
✓ Archived: 3 history files
```

## Periodic Maintenance

Run cleanup periodically (weekly recommended):
```bash
bash {skill_dir}/scripts/cleanup-history.sh --status
bash {skill_dir}/scripts/cleanup-history.sh --keep-days 30 --archive-days 90
```

## Writing Style for memory/ Files

Dense, telegraphic short sentences. No filler words ("You are", "You should"). Comma/semicolon-joined facts, not bullet lists. `**Bold**` paragraph titles instead of `##` headers.

**Good:**
```
**Preferences** Concise responses; Chinese primary, English for code; prefers showing over telling.
```

**Bad:**
```
## Preferences
- The user prefers concise responses
- The user's primary language is Chinese
```

## Notes

- All files under `~/.learnwy/ai/memory/` **must be written in English**, except for user-language-specific proper nouns.
- **Keep each file under 2000 tokens.** Be ruthless about deduplication and conciseness.
- Move detailed or archival information to separate files under `~/.learnwy/ai/memory/` if needed.
- **Always use scripts to write files** to avoid sandbox permission issues.
- **Security**: write-memory.sh only allows SOUL.md and USER.md; append-history.sh validates filename format.
