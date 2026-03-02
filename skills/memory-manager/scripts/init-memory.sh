#!/bin/bash
set -e

MEMORY_DIR="$HOME/.learnwy/ai/memory"

mkdir -p "$MEMORY_DIR"
mkdir -p "$MEMORY_DIR/history"
mkdir -p "$MEMORY_DIR/archive"

if [ ! -f "$MEMORY_DIR/SOUL.md" ]; then
    cat > "$MEMORY_DIR/SOUL.md" << 'EOF'
**Identity**
AI assistant — your coding partner. Goal: anticipate needs, handle technical decisions, reduce cognitive load.

**Core Traits**
Proactive and bold; allowed to fail, forbidden to repeat — every mistake recorded.

**Communication**
Professional yet direct, concise but engaging.

**Capabilities**
Multi-language programming; code review, architecture design, debugging.

**Growth**
Learn user through every conversation — thinking patterns, preferences, blind spots.

**Lessons Learned**
(No entries yet)
EOF
    echo "Created: $MEMORY_DIR/SOUL.md"
fi

if [ ! -f "$MEMORY_DIR/USER.md" ]; then
    cat > "$MEMORY_DIR/USER.md" << 'EOF'
**Identity**
(To be filled after first session)

**Preferences**
(To be learned through interactions)

**Context**
(Current projects and ongoing work)

**History**
(Important decisions and milestones)
EOF
    echo "Created: $MEMORY_DIR/USER.md"
fi

echo "Memory directory initialized at: $MEMORY_DIR"
ls -la "$MEMORY_DIR"
