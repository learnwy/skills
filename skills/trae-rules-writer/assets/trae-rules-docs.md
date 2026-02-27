# TRAE IDE Rules Documentation

## Overview
"Establish rules to regulate AI's behavior within TRAE, making output better aligned with personal preferences."

## Types of Rules
1. **User Rules**: "Customized for personal habits and needs, applying to all projects."
2. **Project Rules**: "Located in .trae/rules directory, only effective within current project."

## Creating Rules
- **User Rules**: Settings > Rules & Skills > User Rules > "+ Create"
- **Project Rules**: Settings > Rules & Skills > Project Rules > "+ Create"

## Application Modes
- "Always Apply": Effective for all AI chats within project
- "Apply to Specific Files": Uses globs field for file matching
- "Apply Intelligently": AI determines relevance based on description
- "Apply Manually": Only when mentioned with #Rule

## Referencing Rules
- "Always Apply" rules display in chat input box
- "Apply Manually" referenced using #Rule syntax

## Best Practices
- "Control granularity of each rule to keep it clear"
- "Rules must not conflict or override each other"
- "Use relative paths based on project root directory"

## Special Files
- "AGENTS.md: Provides behavioral guidance to AI agents"
- "CLAUDE.md & CLAUDE.local.md: Compatible rule files"

## Example Rules
```markdown
# Coding rules

## General rules
- Avoid unnecessary object copying
- Use appropriate concurrency control
```

## Import Settings
- "Include AGENTS.md in the context"
- "Include CLAUDE.md in context"
