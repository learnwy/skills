# Scripts Reference / 脚本参考手册

本文档详细描述了 requirement-workflow 中所有脚本的用法、输入输出和示例。

---

## 参数设计说明

| 脚本 | 关键参数 | 说明 |
|------|----------|------|
| `init-workflow.sh` | `-r, --root` (必需) | 项目根目录，用于创建 `.trae/workflow/` |
| 其他脚本 | `-p, --path` (必需) | workflow 目录的完整路径 |

**设计原则**:
- `init-workflow.sh` 是唯一需要知道项目根目录的脚本
- 其他脚本只需要 workflow 目录路径即可获取所有信息
- 日期和序号由 `init-workflow.sh` 自动生成

---

## 1. init-workflow.sh

初始化新的需求开发工作流。

### Usage / 用法

```bash
./scripts/init-workflow.sh -r <root> -n <name> [OPTIONS]
```

### Options / 选项

| Option | Description |
|--------|-------------|
| `-r, --root DIR` | 项目根目录 (必需) |
| `-n, --name NAME` | 需求名称 (必需) |
| `-t, --type TYPE` | 类型: feature\|bugfix\|refactor\|hotfix (默认: feature) |
| `-l, --level LEVEL` | 流程级别: L1\|L2\|L3 (默认: L2) |
| `-d, --description DESC` | 简要描述 |
| `--tags TAGS` | 逗号分隔的标签 |
| `-h, --help` | 显示帮助信息 |

### Input / 输入

- 命令行参数

### Output / 输出

- 创建工作流目录: `{root}/.trae/workflow/{date}_{seq}_{type}_{name}/`
- 自动生成:
  - `{date}` - 当天日期 (YYYYMMDD)
  - `{seq}` - 当天第几个工作流 (001, 002, ...)
- 生成文件:
  - `workflow.yaml` - 状态文件
  - `spec.md` - 需求规格说明模板
  - `tasks.md` - 任务拆分模板
  - `checklist.md` - 验收检查清单模板
  - `logs/` - 日志目录
  - `artifacts/` - 产出物目录

### Examples / 示例

```bash
# 创建新功能开发流程
./scripts/init-workflow.sh -r /path/to/project -n "user-authentication" -t feature
# OUTPUT:
# ✅ Workflow initialized successfully!
# 📋 Workflow ID: 20240115_001_feature_user-authentication
# 📁 Directory: /path/to/project/.trae/workflow/20240115_001_feature_user-authentication
# 📊 Level: L2
# 🏷️  Type: feature

# 当前目录创建快速 bug 修复流程 (L1)
./scripts/init-workflow.sh -r . -n "fix-login-bug" -t bugfix -l L1
# OUTPUT:
# ✅ Workflow initialized successfully!
# 📋 Workflow ID: 20240115_002_bugfix_fix-login-bug
# 📁 Directory: ./.trae/workflow/20240115_002_bugfix_fix-login-bug
# 📊 Level: L1
# 🏷️  Type: bugfix

# 带描述和标签的重构流程
./scripts/init-workflow.sh -r ~/projects/myapp -n "api-refactor" -t refactor -l L3 \
  -d "Refactor payment API for better performance" \
  --tags "breaking,api,performance"
```

---

## 2. advance-stage.sh

推进工作流到下一阶段，包含验证逻辑。

### Usage / 用法

```bash
./scripts/advance-stage.sh -p <workflow_dir> [OPTIONS]
```

### Options / 选项

| Option | Description |
|--------|-------------|
| `-p, --path DIR` | workflow 目录路径 (必需) |
| `-t, --to STAGE` | 目标阶段 (不指定则自动推进) |
| `--validate` | 仅验证，不实际转换 |
| `--force` | 强制转换（即使验证失败） |
| `-h, --help` | 显示帮助信息 |

### Stages / 阶段

```
INIT → ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

### Input / 输入

- workflow 目录路径（包含 workflow.yaml）
- 目标阶段（可选）

### Output / 输出

- 更新 `workflow.yaml` 状态
- 添加状态历史记录
- 执行钩子函数

### Examples / 示例

```bash
# 自动推进到下一阶段
./scripts/advance-stage.sh -p /project/.trae/workflow/20240115_001_feature_user-auth
# OUTPUT:
# 📍 Auto-determined next stage: ANALYZING
# 📋 Workflow: 20240115_001_feature_user-auth
# 📊 Level: L2
# 🔄 Transition: INIT → ANALYZING
# ✅ Validation passed
# ✅ Successfully transitioned to ANALYZING
# Next: Complete requirement analysis in spec.md

# 指定目标阶段
./scripts/advance-stage.sh -p /project/.trae/workflow/20240115_001_feature_user-auth --to IMPLEMENTING
# OUTPUT:
# 📋 Workflow: 20240115_001_feature_user-auth
# 📊 Level: L2
# 🔄 Transition: DESIGNING → IMPLEMENTING
# ✅ Validation passed
# ✅ Successfully transitioned to IMPLEMENTING

# 仅验证不转换
./scripts/advance-stage.sh -p /project/.trae/workflow/20240115_001_feature_auth --validate
# OUTPUT:
# 📋 Workflow: 20240115_001_feature_auth
# 📊 Level: L2
# 🔄 Transition: PLANNING → DESIGNING
# ✅ Validation passed
# ✅ Validation complete (no changes made)
```

---

## 3. get-status.sh

获取工作流状态和进度信息。

### Usage / 用法

```bash
./scripts/get-status.sh -p <workflow_dir> [OPTIONS]
```

### Options / 选项

| Option | Description |
|--------|-------------|
| `-p, --path DIR` | workflow 目录路径 (必需) |
| `--history` | 显示状态转换历史 |
| `--json` | 以 JSON 格式输出 |
| `-h, --help` | 显示帮助信息 |

### Input / 输入

- workflow 目录路径

### Output / 输出

- 工作流状态详情（文本或 JSON 格式）
- 进度条和完成百分比
- 状态历史（可选）

### Examples / 示例

```bash
# 查看工作流状态
./scripts/get-status.sh -p /project/.trae/workflow/20240115_001_feature_user-auth
# OUTPUT:
# ═══════════════════════════════════════════════════════
# 📋 Workflow: user-authentication
# ═══════════════════════════════════════════════════════
# 🆔 ID: 20240115_001_feature_user-authentication
# 📊 Level: L2 (Standard)
# 🏷️  Type: feature
# 💻 Status: IMPLEMENTING
# 📈 Progress: 62%
# ⏰ Duration: 2h 30m
# 📁 Directory: /project/.trae/workflow/20240115_001_feature_user-auth
# 
# Progress: [████████████░░░░░░░░] 62%

# 查看状态历史
./scripts/get-status.sh -p /project/.trae/workflow/20240115_001_feature_user-auth --history
# OUTPUT:
# ... (基本状态信息) ...
# ═══════════════════════════════════════════════════════
# 📜 State History
# ═══════════════════════════════════════════════════════
#   INIT @ 2024-01-15T09:00:00Z
#   ANALYZING @ 2024-01-15T09:15:00Z
#   PLANNING @ 2024-01-15T10:00:00Z
#   DESIGNING @ 2024-01-15T10:30:00Z
# ▶ IMPLEMENTING @ 2024-01-15T11:00:00Z

# JSON 格式输出
./scripts/get-status.sh -p /project/.trae/workflow/20240115_001_feature_user-auth --json
# OUTPUT:
# {
#   "id": "20240115_001_feature_user-authentication",
#   "name": "user-authentication",
#   "type": "feature",
#   "level": "L2",
#   "status": "IMPLEMENTING",
#   "progress": 62,
#   "created_at": "2024-01-15T09:00:00Z",
#   "updated_at": "2024-01-15T11:00:00Z",
#   "duration_seconds": 9000
# }
```

---

## 4. inject-skill.sh

在工作流的特定钩子点注入技能。

### Usage / 用法

```bash
./scripts/inject-skill.sh -p <workflow_dir> --hook <hook> --skill <skill> [OPTIONS]
```

### Options / 选项

| Option | Description |
|--------|-------------|
| `-p, --path DIR` | workflow 目录路径 (必需) |
| `--hook HOOK` | 注入的钩子点 (必需，除非 --list) |
| `--skill SKILL` | 技能名称 (必需，除非 --remove 或 --list) |
| `--config CONFIG` | 技能配置 (JSON 字符串) |
| `--required` | 标记为必需（失败时阻塞） |
| `--order N` | 执行顺序（数字越小越早） |
| `--remove` | 从钩子移除技能 |
| `--list` | 列出已注入的技能 |
| `-h, --help` | 显示帮助信息 |

### Available Hooks / 可用钩子

| Hook | Description |
|------|-------------|
| `pre_stage_{STAGE}` | 进入阶段前 |
| `post_stage_{STAGE}` | 完成阶段后 |
| `pre_task_{task_id}` | 执行任务前 |
| `post_task_{task_id}` | 完成任务后 |
| `quality_gate` | 质量检查前 |
| `pre_delivery` | 最终交付前 |
| `on_blocked` | 工作流阻塞时 |
| `on_error` | 发生错误时 |

### Input / 输入

- workflow 目录路径
- 钩子名称
- 技能名称和配置

### Output / 输出

- 更新 `workflow.yaml` 中的 hooks 配置

### Examples / 示例

```bash
# 注入代码审查技能到设计完成后
./scripts/inject-skill.sh -p /project/.trae/workflow/20240115_001_feature_auth \
  --hook post_stage_DESIGNING --skill code-reviewer
# OUTPUT:
# ✅ Injected skill 'code-reviewer' at hook 'post_stage_DESIGNING'

# 注入必需的 lint 检查
./scripts/inject-skill.sh -p /project/.trae/workflow/20240115_001_feature_auth \
  --hook quality_gate --skill lint-checker --required
# OUTPUT:
# ✅ Injected skill 'lint-checker' at hook 'quality_gate'
#    Required: yes

# 带配置的技能注入
./scripts/inject-skill.sh -p /project/.trae/workflow/20240115_001_feature_auth \
  --hook pre_stage_TESTING --skill unit-test-runner --config '{"coverage_threshold": 80}'
# OUTPUT:
# ✅ Injected skill 'unit-test-runner' at hook 'pre_stage_TESTING'
#    Config: {"coverage_threshold": 80}

# 列出已注入的技能
./scripts/inject-skill.sh -p /project/.trae/workflow/20240115_001_feature_auth --list
# OUTPUT:
# ═══════════════════════════════════════════════════════
# 📋 Injected Skills for: 20240115_001_feature_auth
# ═══════════════════════════════════════════════════════
# 
# 📦 Configuration-based Injections:
# -----------------------------------
#   - stage: DESIGNING
#     skill: code-reviewer
#     timing: post
# 
# 🪝 Hook-based Injections:
# -------------------------
#   Hook: quality_gate
#     - skill: "lint-checker"
#       required: true

# 移除技能
./scripts/inject-skill.sh -p /project/.trae/workflow/20240115_001_feature_auth \
  --hook quality_gate --skill lint-checker --remove
# OUTPUT:
# ✅ Removed skill 'lint-checker' from hook 'quality_gate'
```

---

## 5. generate-report.sh

生成工作流摘要报告。

### Usage / 用法

```bash
./scripts/generate-report.sh -p <workflow_dir> [OPTIONS]
```

### Options / 选项

| Option | Description |
|--------|-------------|
| `-p, --path DIR` | workflow 目录路径 (必需) |
| `--format FORMAT` | 输出格式: markdown\|json\|text (默认: markdown) |
| `--output FILE` | 输出文件 (默认: artifacts/report.md) |
| `--include-logs` | 在报告中包含阶段日志 |
| `--notify` | 生成后发送通知 |
| `-h, --help` | 显示帮助信息 |

### Input / 输入

- workflow 目录路径

### Output / 输出

- 报告文件 (markdown/json/text 格式)
- 包含:
  - 工作流摘要
  - 任务完成情况
  - 状态历史
  - 产出物列表
  - 日志（可选）

### Examples / 示例

```bash
# 生成 Markdown 报告
./scripts/generate-report.sh -p /project/.trae/workflow/20240115_001_feature_auth
# OUTPUT:
# ✅ Report generated: /project/.trae/workflow/20240115_001_feature_auth/artifacts/report.md

# 生成 JSON 报告
./scripts/generate-report.sh -p /project/.trae/workflow/20240115_001_feature_auth --format json
# OUTPUT:
# ✅ Report generated: /project/.trae/workflow/20240115_001_feature_auth/artifacts/report.json

# 包含日志并发送通知
./scripts/generate-report.sh -p /project/.trae/workflow/20240115_001_feature_auth --include-logs --notify
# OUTPUT:
# ✅ Report generated: /project/.trae/workflow/20240115_001_feature_auth/artifacts/report.md
# 📧 Notification would be sent for workflow: 20240115_001_feature_auth (status: DONE)

# 指定输出文件
./scripts/generate-report.sh -p /project/.trae/workflow/20240115_001_feature_auth \
  --format markdown --output ./reports/auth-feature-report.md
```

---

## Quick Reference / 快速参考

| Task | Command |
|------|---------|
| 初始化工作流 | `./scripts/init-workflow.sh -r /project -n "name" -t feature` |
| 查看状态 | `./scripts/get-status.sh -p /project/.trae/workflow/xxx` |
| 推进阶段 | `./scripts/advance-stage.sh -p /project/.trae/workflow/xxx` |
| 注入技能 | `./scripts/inject-skill.sh -p /project/.trae/workflow/xxx --hook quality_gate --skill linter` |
| 生成报告 | `./scripts/generate-report.sh -p /project/.trae/workflow/xxx` |

## Common Workflows / 常用工作流

### L1 快速修复流程

```bash
# 1. 初始化
./scripts/init-workflow.sh -r /project -n "fix-bug" -t bugfix -l L1
# 返回: 📁 Directory: /project/.trae/workflow/20240115_001_bugfix_fix-bug

# 2. 直接进入实现 (保存返回的路径)
WORKFLOW_DIR="/project/.trae/workflow/20240115_001_bugfix_fix-bug"
./scripts/advance-stage.sh -p "$WORKFLOW_DIR" --to IMPLEMENTING

# 3. 完成后测试
./scripts/advance-stage.sh -p "$WORKFLOW_DIR" --to TESTING

# 4. 完成
./scripts/advance-stage.sh -p "$WORKFLOW_DIR" --to DONE
```

### L2 标准功能开发

```bash
# 1. 初始化
./scripts/init-workflow.sh -r /project -n "new-feature" -t feature
# 返回: 📁 Directory: /project/.trae/workflow/20240115_001_feature_new-feature

WORKFLOW_DIR="/project/.trae/workflow/20240115_001_feature_new-feature"

# 2. 分析需求
./scripts/advance-stage.sh -p "$WORKFLOW_DIR"  # → ANALYZING

# 3. 完成 spec.md 后规划
./scripts/advance-stage.sh -p "$WORKFLOW_DIR"  # → PLANNING

# 4. 设计阶段
./scripts/advance-stage.sh -p "$WORKFLOW_DIR"  # → DESIGNING

# 5. 实现
./scripts/advance-stage.sh -p "$WORKFLOW_DIR"  # → IMPLEMENTING

# 6. 测试
./scripts/advance-stage.sh -p "$WORKFLOW_DIR"  # → TESTING

# 7. 交付
./scripts/advance-stage.sh -p "$WORKFLOW_DIR"  # → DELIVERING → DONE

# 8. 生成报告
./scripts/generate-report.sh -p "$WORKFLOW_DIR"
```
