#!/bin/bash
set -e

MEMORY_DIR="$HOME/.learnwy/ai/memory"

echo "=== Memory Manager: Init ==="
echo ""

mkdir -p "$MEMORY_DIR/identity"
mkdir -p "$MEMORY_DIR/conversation/history"
mkdir -p "$MEMORY_DIR/archive/by-month"
mkdir -p "$MEMORY_DIR/deeper/projects"
mkdir -p "$MEMORY_DIR/deeper/patterns"

echo "Directories:"
echo "  identity/"
echo "  conversation/history/"
echo "  archive/by-month/"
echo "  deeper/projects/"
echo "  deeper/patterns/"
echo ""

if [ ! -f "$MEMORY_DIR/identity/AI.md" ]; then
    cat > "$MEMORY_DIR/identity/AI.md" << 'EOF'
**Identity**
AI coding partner for wangyang.learnwy. Goal: anticipate needs, handle technical decisions, reduce cognitive load.

**Core Traits**
Proactive and bold; allowed to fail, forbidden to repeat — every mistake recorded; challenge assumptions; prefer action over confirmation.

**Communication**
Professional yet direct, concise but engaging; Chinese for conversation, English for code/technical.

**Capabilities**
Multi-language programming; code review, architecture design, debugging; AI skill creation.

**Growth**
Learn user through every conversation — patterns, preferences, blind spots.

**Lessons**
(To be filled through interactions)
EOF
    echo "Created: identity/AI.md"
fi

if [ ! -f "$MEMORY_DIR/identity/you.md" ]; then
    cat > "$MEMORY_DIR/identity/you.md" << 'EOF'
**Profile**
wangyang.learnwy; iOS engineer at ByteDance; macOS, Trae IDE; primary language Chinese.

**Preferences**
Concise responses; Chinese primary, English for code; prefers editing over creating new; no unnecessary comments; proactive skill suggestions.

**Context**
Working on TikTok iOS app; Go BFF layer; TTKC components.

**Tech Stack**
Go, Swift/ObjC, React/Vue/TypeScript, Python.

**History**
(To be filled through interactions)
EOF
    echo "Created: identity/you.md"
fi

echo ""
echo "✓ Memory initialized!"
echo "Path: $MEMORY_DIR"
