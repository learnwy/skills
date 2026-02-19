# Requirement Workflow Usage Examples

Practical examples demonstrating how to use the requirement-workflow skill.

## Core Concept: Active Workflow

All scripts use an **active workflow** mechanism:
- `init-workflow.sh` creates a workflow and sets it as active
- Other scripts automatically read the active workflow from `.trae/active_workflow`
- Use `-p` to override with a specific workflow path

## Scripts Reference

### init-workflow.sh

Initialize a new development workflow.

```bash
./scripts/init-workflow.sh -r <root> -n <name> [OPTIONS]
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

Inject skills at workflow hook points.

```bash
./scripts/inject-skill.sh -r <root> --hook <hook> --skill <skill> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-r, --root DIR` | Project root directory (required) |
| `-p, --path DIR` | Override active workflow path |
| `--hook HOOK` | Hook point (required unless --list) |
| `--skill SKILL` | Skill name (required unless --list/--remove) |
| `--config JSON` | Skill configuration |
| `--required` | Mark as required (blocks on failure) |
| `--order N` | Execution order (lower = earlier) |
| `--remove` | Remove skill from hook |
| `--list` | List injected skills |

**Available Hooks:**
- `pre_stage_{STAGE}` - Before entering stage
- `post_stage_{STAGE}` - After completing stage
- `quality_gate` - Before quality checks
- `pre_delivery` - Before final delivery
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

📊 Analysis:
- Type: bugfix
- Level: L1 (Quick)
- Impact: 1 file

Initializing workflow...
```

```bash
./scripts/init-workflow.sh -r /project -n "fix-login-button" -t bugfix -l L1
```

```
✅ Workflow: 20240115_001_bugfix_fix-login-button

[PLANNING] Analyzing and planning fix
Found: onClick handler has typo (handleLgoin)

📋 Tasks:
1. Fix typo in LoginButton.tsx

[IMPLEMENTING] Executing fix
Fixed: handleLgoin → handleLogin
✅ Task 1 complete
```

```bash
./scripts/advance-stage.sh -r /project --to IMPLEMENTING
```

```
[TESTING] Verifying fix
```

```bash
./scripts/advance-stage.sh -r /project --to TESTING
```

```
- ✅ TypeScript: passed
- ✅ ESLint: passed  
- ✅ Tests: passed
```

```bash
./scripts/advance-stage.sh -r /project --to DONE
```

```
[DONE] Workflow complete
- Duration: ~5 minutes
- Files changed: 1
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

| Task | Command |
|------|---------|
| Initialize workflow | `./scripts/init-workflow.sh -r /project -n "name" -t feature` |
| Check status | `./scripts/get-status.sh -r /project` |
| Advance stage | `./scripts/advance-stage.sh -r /project` |
| Inject skill | `./scripts/inject-skill.sh -r /project --hook quality_gate --skill linter` |
| Generate report | `./scripts/generate-report.sh -r /project` |

## Common Workflows

### L1 Quick Fix

```bash
./scripts/init-workflow.sh -r /project -n "fix-bug" -t bugfix -l L1
./scripts/advance-stage.sh -r /project  # → PLANNING
./scripts/advance-stage.sh -r /project  # → IMPLEMENTING
./scripts/advance-stage.sh -r /project  # → TESTING
./scripts/advance-stage.sh -r /project  # → DONE
```

### L2 Standard Development

```bash
./scripts/init-workflow.sh -r /project -n "new-feature" -t feature
./scripts/advance-stage.sh -r /project  # → ANALYZING
./scripts/advance-stage.sh -r /project  # → PLANNING
./scripts/advance-stage.sh -r /project  # → DESIGNING
./scripts/advance-stage.sh -r /project  # → IMPLEMENTING
./scripts/advance-stage.sh -r /project  # → TESTING
./scripts/advance-stage.sh -r /project  # → DELIVERING
./scripts/generate-report.sh -r /project
./scripts/advance-stage.sh -r /project  # → DONE
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
