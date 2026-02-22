# Requirement Workflow Usage Examples

Practical examples demonstrating how to use the requirement-workflow skill.

## Script Path Convention

**All scripts are relative to `{skill_root}` (the directory containing SKILL.md).**

```bash
# Resolve skill root first
SKILL_ROOT=/path/to/skills/requirement-workflow

# Then use absolute paths
$SKILL_ROOT/scripts/init-workflow.sh ...
$SKILL_ROOT/scripts/advance-stage.sh ...
```

## Core Concept: Active Workflow

All scripts use an **active workflow** mechanism:
- `init-workflow.sh` creates a workflow and sets it as active
- Other scripts automatically read the active workflow from `.trae/active_workflow`
- Use `-p` to override with a specific workflow path

## Scripts Reference

**Note:** All script paths below use `./scripts/` for brevity. In actual usage, replace with `{skill_root}/scripts/` or `$SKILL_ROOT/scripts/`.

### init-workflow.sh

Initialize a new development workflow.

```bash
{skill_root}/scripts/init-workflow.sh -r <root> -n <name> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-r, --root DIR` | Project root directory (required) |
| `-n, --name NAME` | Requirement name, lowercase hyphenated (required) |
| `-t, --type TYPE` | `feature` \| `bugfix` \| `refactor` \| `hotfix` (default: feature) |
| `-l, --level LEVEL` | `L1` \| `L2` \| `L3` (default: L2) |
| `-d, --description` | Brief description |
| `--tags TAGS` | Comma-separated tags |
| `-h, --help` | Show help |

**Output:**
- Creates: `{root}/.trae/workflow/{date}_{seq}_{type}_{name}/`
- Sets: `{root}/.trae/active_workflow`
- Generates: workflow.yaml, spec.md, tasks.md, checklist.md, logs/, artifacts/

### get-status.sh

Check workflow status and progress.

```bash
./scripts/get-status.sh -r <root> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-r, --root DIR` | Project root directory (required) |
| `-p, --path DIR` | Override active workflow path |
| `--history` | Show stage transition history |
| `--json` | Output in JSON format |

### advance-stage.sh

Advance workflow to the next stage.

```bash
./scripts/advance-stage.sh -r <root> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-r, --root DIR` | Project root directory (required) |
| `-p, --path DIR` | Override active workflow path |
| `-t, --to STAGE` | Target stage (auto-advance if not specified) |
| `--validate` | Validate only, don't transition |
| `--force` | Force transition (skip validation) |

### inject-skill.sh

Inject skills at workflow hook points (3-level: global, project, workflow).

```bash
./scripts/inject-skill.sh -r <root> --hook <hook> --skill <skill> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-r, --root DIR` | Project root directory (required) |
| `-p, --path DIR` | Override active workflow path |
| `--scope SCOPE` | Injection scope: `global` \| `project` \| `workflow` (default: workflow) |
| `--hook HOOK` | Hook point (required unless --list) |
| `--skill SKILL` | Skill name (required unless --list/--remove) |
| `--config JSON` | Skill configuration |
| `--required` | Mark as required (blocks on failure) |
| `--remove` | Remove skill from hook |
| `--list` | List all injected skills |
| `--list-scope` | List skills for specific scope only |

**Injection Scopes (priority: workflow > project > global):**
- `global` - Applies to all projects (stored in skill directory)
- `project` - Applies to project (stored in `{root}/.trae/workflow/hooks.yaml`)
- `workflow` - Applies to current workflow only

**Available Hooks:**
- `pre_stage_{STAGE}` - Before entering stage
- `post_stage_{STAGE}` - After completing stage
- `quality_gate` - Before quality checks
- `pre_delivery` - Before final delivery
- `on_blocked` - When workflow is blocked
- `on_error` - On error

### generate-report.sh

Generate workflow summary report.

```bash
./scripts/generate-report.sh -r <root> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-r, --root DIR` | Project root directory (required) |
| `-p, --path DIR` | Override active workflow path |
| `--format FORMAT` | `markdown` \| `json` \| `text` (default: markdown) |
| `--output FILE` | Output file (default: artifacts/report.md) |
| `--include-logs` | Include stage logs in report |
| `--notify` | Send notification after generation |

---

## Usage Examples

### Example 1: Bug Fix (L1)

```
User: The login button doesn't respond when clicked

AI: This is a clear bug. Using L1 Quick workflow.

📊 Requirement Analysis:
- Type: bugfix
- Level: L1 (Quick)
- Scope: 1 file
- Reason: Clear issue, single file fix

Initializing workflow...
```

```bash
./scripts/init-workflow.sh -r /project -n "fix-login-button" -t bugfix -l L1
```

```
✅ Workflow: 20240115_001_bugfix_fix-login-button
```

```bash
./scripts/advance-stage.sh -r /project  # → ANALYZING
```

```
[ANALYZING] Brief requirements

📄 spec.md (brief):
- Background: Login button not responding
- Scope: Fix onClick in LoginButton.tsx
- Criteria: Button triggers login action
```

```bash
./scripts/advance-stage.sh -r /project  # → PLANNING
```

```
[PLANNING] Task breakdown

📋 tasks.md:
1. Locate onClick handler issue
2. Fix the handler
3. Verify button works
```

```bash
./scripts/advance-stage.sh -r /project  # → DESIGNING
```

```
[DESIGNING] Technical approach

📄 design.md (brief):
- Issue: Typo in handler name (handleLgoin → handleLogin)
- Files: src/components/LoginButton.tsx
```

```bash
./scripts/advance-stage.sh -r /project  # → IMPLEMENTING
```

```
[IMPLEMENTING] Executing fix
Fixed: handleLgoin → handleLogin
✅ All tasks complete
```

```bash
./scripts/advance-stage.sh -r /project  # → TESTING
```

```
[TESTING] Verifying fix
- ✅ TypeScript: passed
- ✅ ESLint: passed  
- ✅ Tests: passed
```

```bash
./scripts/advance-stage.sh -r /project  # → DELIVERING
```

```
[DELIVERING] Report

📄 report.md (brief):
- Files changed: 1
- Duration: ~5 minutes
```

```bash
./scripts/advance-stage.sh -r /project  # → DONE
```

```
[DONE] Workflow complete
```

---

### Example 2: New Feature (L2)

```
User: I need a user avatar upload feature

AI: Standard feature development. Using L2 Standard workflow.

📊 Analysis:
- Type: feature
- Level: L2 (Standard)
- Modules: User, Storage

Initializing workflow...
```

```bash
./scripts/init-workflow.sh -r /project -n "user-avatar-upload" -t feature
```

```
✅ Workflow: 20240115_002_feature_user-avatar-upload

[ANALYZING] Requirements clarification

Need to clarify:
1. Max file size?
2. Supported formats?
3. Cropping needed?

User: 2MB, jpg/png, circular crop needed

Updating spec.md...
```

```bash
./scripts/advance-stage.sh -r /project  # → ANALYZING
```

```
[PLANNING] Task breakdown

📋 tasks.md created:
1. Create AvatarUploader component
2. Add ImageCropper component
3. Implement upload API
4. Integrate storage service
5. Update Profile page
6. Add unit tests

Est. time: 4h
```

```bash
./scripts/advance-stage.sh -r /project  # → PLANNING
```

```
[DESIGNING] Technical design

📄 design.md created:
- API: POST /api/users/avatar
- Storage: S3 /avatars/{userId}/{timestamp}.{ext}
```

```bash
./scripts/advance-stage.sh -r /project  # → DESIGNING
```

```
[IMPLEMENTING] Coding
...executing tasks...
✅ All 6 tasks completed
```

```bash
./scripts/advance-stage.sh -r /project  # → IMPLEMENTING
```

```
[TESTING] Verification
- ✅ Tests: 12/12 passed
- ✅ Coverage: 75%
```

```bash
./scripts/advance-stage.sh -r /project  # → TESTING
```

```
[DELIVERING] Report generation
```

```bash
./scripts/generate-report.sh -r /project
./scripts/advance-stage.sh -r /project  # → DELIVERING
```

```
[DONE] Workflow complete
- Duration: 3h 45m
```

---

### Example 3: Check Status

```
User: What's the current progress?

AI: Let me check the workflow status.
```

```bash
./scripts/get-status.sh -r /project
```

```
═══════════════════════════════════════════════════════
� Workflow: user-avatar-upload
═══════════════════════════════════════════════════════
🆔 ID: 20240115_002_feature_user-avatar-upload
📊 Level: L2 (Standard)
🏷️  Type: feature
💻 Status: IMPLEMENTING
📈 Progress: 60%
⏰ Duration: 2h 30m

Progress: [████████████░░░░░░░░] 60%

Next: Complete remaining implementation tasks
```

---

### Example 4: Continue Existing Workflow

```
User: Let's continue the avatar upload feature

AI: Checking current workflow status...
```

```bash
./scripts/get-status.sh -r /project
```

```
📊 Status: IMPLEMENTING
📍 Current task: Implement upload API

Continuing from where we left off...
```

---

### Example 5: Working with Multiple Workflows

```bash
# Initialize first workflow
./scripts/init-workflow.sh -r /project -n "feature-a" -t feature
# feature-a is now active

# Initialize second workflow
./scripts/init-workflow.sh -r /project -n "feature-b" -t feature
# feature-b is now active

# Operate on active workflow (feature-b)
./scripts/advance-stage.sh -r /project

# Operate on specific workflow (feature-a)
./scripts/get-status.sh -r /project -p /project/.trae/workflow/xxx_feature-a
```

---

## Quick Reference

**Remember:** Replace `$SKILL_ROOT` with actual skill directory path.

| Task | Command |
|------|---------|
| Initialize workflow | `$SKILL_ROOT/scripts/init-workflow.sh -r /project -n "name" -t feature` |
| Check status | `$SKILL_ROOT/scripts/get-status.sh -r /project` |
| Advance stage | `$SKILL_ROOT/scripts/advance-stage.sh -r /project` |
| Inject skill (workflow) | `$SKILL_ROOT/scripts/inject-skill.sh -r /project --hook quality_gate --skill linter` |
| Inject skill (global) | `$SKILL_ROOT/scripts/inject-skill.sh -r /project --scope global --hook pre_stage_DESIGNING --skill tech-writer` |
| List injected skills | `$SKILL_ROOT/scripts/inject-skill.sh -r /project --list` |
| Generate report | `$SKILL_ROOT/scripts/generate-report.sh -r /project` |

## Common Workflows

### L1 Quick Fix

```bash
# Set skill root first
SKILL_ROOT=/path/to/skills/requirement-workflow

$SKILL_ROOT/scripts/init-workflow.sh -r /project -n "fix-bug" -t bugfix -l L1
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → ANALYZING (brief spec.md)
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → PLANNING (simple tasks.md)
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → DESIGNING (brief design.md)
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → IMPLEMENTING
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → TESTING
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → DELIVERING (brief report.md)
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → DONE
```

### L2 Standard Development

```bash
SKILL_ROOT=/path/to/skills/requirement-workflow

$SKILL_ROOT/scripts/init-workflow.sh -r /project -n "new-feature" -t feature
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → ANALYZING
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → PLANNING
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → DESIGNING
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → IMPLEMENTING
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → TESTING
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → DELIVERING
$SKILL_ROOT/scripts/generate-report.sh -r /project
$SKILL_ROOT/scripts/advance-stage.sh -r /project  # → DONE
```

## FAQ

### How to manually specify level?

```bash
./scripts/init-workflow.sh -r /project -n "simple-task" -l L3
```

### How to override active workflow?

```bash
./scripts/get-status.sh -r /project -p /project/.trae/workflow/xxx
```

### How to force stage transition?

```bash
./scripts/advance-stage.sh -r /project --to TESTING --force
```

### Workflow stuck?

```bash
# Check history
./scripts/get-status.sh -r /project --history

# Force advance
./scripts/advance-stage.sh -r /project --force
```
