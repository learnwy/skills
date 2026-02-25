---
name: knowledge-consolidation
description: "Proactively summarize and consolidate knowledge from AI conversation sessions. MUST use this skill when: (1) User asks to 'summarize', 'consolidate', 'save this', 'document this', 'capture this knowledge', or 'write this down', (2) User says '总结一下', '记录下来', '保存这个知识', (3) Session contains significant debugging insights, architecture decisions, or lessons learned worth preserving. Also proactively trigger at end of substantial debug sessions or when user says 'we figured it out' or 'that was hard to solve'. Saves knowledge to .trae/knowledges/, .claude/knowledges/, or .cursor/knowledges/ based on detected AI IDE."
---

# Knowledge Consolidation

Persist valuable knowledge from AI conversations into structured documents.

## When to Invoke

**Proactive (AI self-invoke):**

- Starting new session after substantial prior work
- Accumulated debugging/architecture/pattern knowledge worth preserving
- Resolved non-trivial issues with reusable insights

**Skip when:**

- Simple Q&A with no novel insights
- Trivial changes with nothing worth preserving

## Workflow

### Step 1: Detect AI IDE Type

Check project root for AI IDE indicator directory:

| Environment Indicator             | AI Type       | Storage Path            |
| --------------------------------- | ------------- | ----------------------- |
| `.trae/` dir or TraeAI/TraeCN env | `trae-cn`     | `.trae/knowledges/`     |
| `.claude/` dir or Claude Code env | `claude-code` | `.claude/knowledges/`   |
| `.cursor/` dir                    | `cursor`      | `.cursor/knowledges/`   |
| `.windsurf/` dir                  | `windsurf`    | `.windsurf/knowledges/` |

### Step 2: Identify Consolidation Candidates

Scan conversation for knowledge worth preserving:

- Debug sessions with root cause analysis
- Architecture decisions with rationale
- Code patterns discovered or established
- Configuration knowledge (build, env, tooling)
- API integration insights
- Workflow improvements
- Lessons learned from issues

### Step 3: Classify Knowledge Type

Select appropriate type based on content:

| Type           | When to Use                                    |
| -------------- | ---------------------------------------------- |
| `debug`        | Bug fixes, crash analysis, error resolution    |
| `architecture` | System design, module structure, dependencies  |
| `pattern`      | Reusable code patterns, idioms, best practices |
| `config`       | Build settings, environment, tooling setup     |
| `api`          | API design, integration, protocol details      |
| `workflow`     | Development processes, procedures              |
| `lesson`       | Post-mortems, retrospectives, project insights |
| `reference`    | Technical specs, schema docs, standards        |

See [knowledge-types.md](references/knowledge-types.md) for detailed guidance on each type.

### Step 4: Generate Document Path

Run path generation script:

```bash
{skill_root}/scripts/get-knowledge-path.sh \
  -r <project_root> -a <ai_type> -t <type> -n <filename>
```

Output format: `{project_root}/{ai_path}/knowledges/{YYYYMMDD}_{seq}_{type}_{filename}.md`

### Step 5: Write Knowledge Document

Create document using [template](assets/knowledge.md.template):

```markdown
# {Title}

> **Type:** {type}
> **Date:** {YYYY-MM-DD}
> **Context:** {Brief context}

## Summary

{2-3 sentence summary}

## Background

{Situation/problem/context}

## Details

{Technical content, code snippets, analysis}

## Key Takeaways

{Bullet points of actionable insights}

## Related

{Links to related files or knowledge entries}
```

### Step 6: Confirm with User

```
📚 Knowledge Consolidated:
- File: {path}
- Type: {type}
- Topic: {title}

Summary: {brief summary}
```

## Resources

| Resource                        | Purpose                        |
| ------------------------------- | ------------------------------ |
| `scripts/get-knowledge-path.sh` | Generate timestamped file path |
| `references/knowledge-types.md` | Detailed type selection guide  |
| `assets/knowledge.md.template`  | Document template              |
| `examples/debug-session.md`     | Complete workflow example      |
