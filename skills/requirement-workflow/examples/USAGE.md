# Requirement Workflow Usage Guide

# 需求工作流使用指南

## Quick Start / 快速开始

### 1. Initialize a New Workflow / 初始化新工作流

```bash
# Basic usage - creates L2 workflow by default
./scripts/init-workflow.sh -n "user-authentication" -t feature

# Specify level
./scripts/init-workflow.sh -n "fix-login-bug" -t bugfix -l L1

# With description and tags
./scripts/init-workflow.sh \
  -n "api-refactor" \
  -t refactor \
  -l L3 \
  -d "Refactor authentication API for better security" \
  --tags "security,api,breaking"
```

### 2. Check Workflow Status / 检查工作流状态

```bash
# Show status of latest workflow
./scripts/get-status.sh --latest

# Show status with history
./scripts/get-status.sh --latest --history

# List all workflows
./scripts/get-status.sh --list

# Filter by status
./scripts/get-status.sh --list --filter IMPLEMENTING
```

### 3. Advance to Next Stage / 推进到下一阶段

```bash
# Auto-advance to next stage
./scripts/advance-stage.sh --latest

# Advance to specific stage
./scripts/advance-stage.sh --latest --to IMPLEMENTING

# Validate only (no actual transition)
./scripts/advance-stage.sh --latest --to TESTING --validate
```

### 4. Inject Skills / 注入技能

```bash
# Inject a skill at a hook point
./scripts/inject-skill.sh \
  --latest \
  --hook quality_gate \
  --skill lint-checker \
  --required

# Inject with configuration
./scripts/inject-skill.sh \
  --latest \
  --hook post_stage_DESIGNING \
  --skill code-reviewer \
  --config '{"focus": ["security"]}'

# List injected skills
./scripts/inject-skill.sh --latest --list

# Remove an injected skill
./scripts/inject-skill.sh \
  --latest \
  --hook quality_gate \
  --skill lint-checker \
  --remove
```

### 5. Generate Report / 生成报告

```bash
# Generate markdown report
./scripts/generate-report.sh --latest

# Generate JSON report
./scripts/generate-report.sh --latest --format json

# Include logs in report
./scripts/generate-report.sh --latest --include-logs
```

## Workflow Examples / 工作流示例

### Example 1: Simple Bug Fix (L1) / 简单Bug修复

```bash
# 1. Initialize L1 workflow
./scripts/init-workflow.sh -n "fix-null-pointer" -t bugfix -l L1

# 2. Jump directly to implementation (L1 skips analysis/design)
./scripts/advance-stage.sh --latest --to IMPLEMENTING

# 3. After fixing, advance to testing
./scripts/advance-stage.sh --latest --to TESTING

# 4. Complete workflow
./scripts/advance-stage.sh --latest --to DONE
```

### Example 2: New Feature Development (L2) / 新功能开发

```bash
# 1. Initialize L2 workflow
./scripts/init-workflow.sh \
  -n "dark-mode-toggle" \
  -t feature \
  -d "Add dark mode toggle to settings page"

# 2. Complete requirement analysis
# Edit: .trae/workflow/*/spec.md
./scripts/advance-stage.sh --latest --to ANALYZING

# 3. Plan tasks
# Edit: .trae/workflow/*/tasks.md
./scripts/advance-stage.sh --latest --to PLANNING

# 4. Technical design
# Edit: .trae/workflow/*/design.md
./scripts/advance-stage.sh --latest --to DESIGNING

# 5. Implement
./scripts/advance-stage.sh --latest --to IMPLEMENTING

# 6. Test
./scripts/advance-stage.sh --latest --to TESTING

# 7. Deliver
./scripts/advance-stage.sh --latest --to DELIVERING

# 8. Generate final report
./scripts/generate-report.sh --latest

# 9. Complete
./scripts/advance-stage.sh --latest --to DONE
```

### Example 3: Security-Critical Feature (L3) / 安全关键功能

```bash
# 1. Initialize L3 workflow with security config
./scripts/init-workflow.sh \
  -n "oauth-integration" \
  -t feature \
  -l L3 \
  -d "Integrate OAuth 2.0 for third-party authentication" \
  --tags "security,authentication,oauth"

# 2. Inject security skills
./scripts/inject-skill.sh --latest --hook post_stage_DESIGNING --skill security-reviewer --required
./scripts/inject-skill.sh --latest --hook quality_gate --skill sast-scanner --required
./scripts/inject-skill.sh --latest --hook quality_gate --skill dependency-scanner --required

# 3. Follow full L3 workflow...
```

## Using with TRAE Agent / 与 TRAE Agent 配合使用

When the `requirement-workflow` skill is triggered, it will:

1. **Analyze your requirement** - Determine complexity and select appropriate level
2. **Create workflow directory** - Initialize all required files
3. **Guide through stages** - Prompt for stage transitions
4. **Execute injected skills** - Run validation and checks at hook points
5. **Track progress** - Update workflow.yaml and provide status reports

### Triggering the Skill / 触发技能

The skill activates on keywords like:

- "开发需求", "新功能", "开始开发"
- "继续开发", "流程状态"
- "start developing", "new feature", "workflow status"

### Example Conversation / 示例对话

```
User: 我需要开发一个用户头像上传功能

Agent: 让我分析这个需求的复杂度...

📊 需求分析结果:
- 影响文件: ~10个
- 涉及模块: 2个 (用户模块, 存储模块)
- 风险等级: 中
- 推荐级别: L2 (Standard)

我将初始化一个 L2 工作流来跟踪这个需求。

✅ Workflow initialized!
📋 ID: 20240115_001_feature_user-avatar-upload
📁 Directory: .trae/workflow/20240115_001_feature_user-avatar-upload/

让我们开始需求分析阶段...
```

## Configuration Files / 配置文件

### Global Workflow Config / 全局工作流配置

Create `.trae/workflow/config.yaml` for global settings:

```yaml
defaults:
  level: L2
  notifications:
    on_complete: true
  coverage_target: 80

teams:
  backend:
    reviewers: ["alice", "bob"]
  frontend:
    reviewers: ["charlie", "david"]

integrations:
  slack:
    webhook_url: "https://..."
    channel: "#dev-notifications"
```

### Project-Specific Overrides / 项目特定覆盖

Create `.trae/workflow/project.yaml` for project-specific settings:

```yaml
project: "my-app"
default_level: L2
required_approvers:
  L3: ["tech-lead", "security"]
custom_checklists:
  api_changes: "checklists/api.md"
  db_changes: "checklists/database.md"
```

## Best Practices / 最佳实践

### 1. Choose the Right Level / 选择正确的级别

- **L1**: Bug fixes, typos, config changes
- **L2**: Most feature work, API changes, component updates
- **L3**: Security features, breaking changes, cross-module refactoring

### 2. Complete Each Stage / 完成每个阶段

Don't skip stages unless using L1. Each artifact serves a purpose:

- `spec.md`: Captures requirements clearly
- `design.md`: Documents technical decisions
- `tasks.md`: Tracks granular progress
- `checklist.md`: Ensures quality

### 3. Use Skill Injection / 使用技能注入

Inject relevant skills for your workflow type:

- Security features → security-reviewer, sast-scanner
- API changes → api-doc-generator, breaking-change-checker
- Performance work → profiler, benchmark-runner

### 4. Review Before Advancing / 推进前审查

Always review the current stage's artifacts before advancing:

```bash
./scripts/advance-stage.sh --latest --validate
```

### 5. Generate Reports / 生成报告

Generate reports at key milestones:

```bash
./scripts/generate-report.sh --latest --format markdown
```

## Troubleshooting / 故障排除

### Workflow Stuck / 工作流卡住

```bash
# Check current status
./scripts/get-status.sh --latest --history

# Force transition if needed
./scripts/advance-stage.sh --latest --to IMPLEMENTING --force
```

### Missing Artifacts / 缺少产出物

```bash
# Re-create templates
./scripts/init-workflow.sh --repair --workflow-id {id}
```

### Skill Injection Failed / 技能注入失败

```bash
# List current injections
./scripts/inject-skill.sh --latest --list

# Remove problematic skill
./scripts/inject-skill.sh --latest --hook {hook} --skill {skill} --remove
```
