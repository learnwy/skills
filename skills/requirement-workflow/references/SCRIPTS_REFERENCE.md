# Scripts Reference / 脚本参考手册

本文档详细描述了 requirement-workflow 中所有脚本的用法、输入输出和示例。

---

## 核心概念：活动工作流

### 设计原则

1. **`init-workflow.sh`** 创建新工作流时，自动将其设为"活动工作流"
   - 写入 `{project_root}/.trae/active_workflow` 文件
   - 日期和序号自动生成

2. **其他脚本**只需要 `-r` 参数指定项目根目录
   - 自动从 `.trae/active_workflow` 读取当前活动工作流
   - 支持 `-p` 参数明确指定特定工作流（覆盖默认）

### 参数统一

| 脚本 | 必需参数 | 可选参数 |
|------|----------|----------|
| `init-workflow.sh` | `-r ROOT`, `-n NAME` | `-t TYPE`, `-l LEVEL`, `-d DESC`, `--tags` |
| 其他脚本 | `-r ROOT` | `-p PATH` (覆盖活动工作流) |

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

### Output / 输出

- 创建工作流目录: `{root}/.trae/workflow/{date}_{seq}_{type}_{name}/`
- 设置活动工作流: `{root}/.trae/active_workflow`
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
# 🔄 Active: Yes (set as active workflow)

# 当前目录创建快速 bug 修复流程 (L1)
./scripts/init-workflow.sh -r . -n "fix-login-bug" -t bugfix -l L1

# 带描述和标签的重构流程
./scripts/init-workflow.sh -r ~/projects/myapp -n "api-refactor" -t refactor -l L3 \
  -d "Refactor payment API for better performance" --tags "breaking,api,performance"
```

---

## 2. advance-stage.sh

推进工作流到下一阶段，包含验证逻辑。

### Usage / 用法

```bash
./scripts/advance-stage.sh -r <root> [OPTIONS]
```

### Options / 选项

| Option | Description |
|--------|-------------|
| `-r, --root DIR` | 项目根目录 (必需) |
| `-p, --path DIR` | 指定工作流路径 (覆盖活动工作流) |
| `-t, --to STAGE` | 目标阶段 (不指定则自动推进) |
| `--validate` | 仅验证，不实际转换 |
| `--force` | 强制转换（即使验证失败） |
| `-h, --help` | 显示帮助信息 |

### Stages / 阶段

```
INIT → ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

### Examples / 示例

```bash
# 自动推进活动工作流到下一阶段
./scripts/advance-stage.sh -r /path/to/project
# OUTPUT:
# 📍 Auto-determined next stage: ANALYZING
# 📋 Workflow: 20240115_001_feature_user-auth
# 📊 Level: L2
# 🔄 Transition: INIT → ANALYZING
# ✅ Validation passed
# ✅ Successfully transitioned to ANALYZING
# Next: Complete requirement analysis in spec.md

# 指定目标阶段
./scripts/advance-stage.sh -r /path/to/project --to IMPLEMENTING

# 仅验证不转换
./scripts/advance-stage.sh -r /path/to/project --validate

# 强制转换
./scripts/advance-stage.sh -r /path/to/project --to DESIGNING --force

# 操作特定工作流（非活动）
./scripts/advance-stage.sh -r /path/to/project -p /path/to/.trae/workflow/xxx
```

---

## 3. get-status.sh

获取工作流状态和进度信息。

### Usage / 用法

```bash
./scripts/get-status.sh -r <root> [OPTIONS]
```

### Options / 选项

| Option | Description |
|--------|-------------|
| `-r, --root DIR` | 项目根目录 (必需) |
| `-p, --path DIR` | 指定工作流路径 (覆盖活动工作流) |
| `--history` | 显示状态转换历史 |
| `--json` | 以 JSON 格式输出 |
| `-h, --help` | 显示帮助信息 |

### Examples / 示例

```bash
# 查看活动工作流状态
./scripts/get-status.sh -r /path/to/project
# OUTPUT:
# ═══════════════════════════════════════════════════════
# 📋 Workflow: user-authentication
# ═══════════════════════════════════════════════════════
# 🆔 ID: 20240115_001_feature_user-authentication
# 📊 Level: L2 (Standard)
# 🏷️  Type: feature
# 💻 Status: IMPLEMENTING
# 📈 Progress: 60%
# ⏰ Duration: 2h 30m
# 📁 Directory: /path/to/project/.trae/workflow/...
# 
# Progress: [████████████░░░░░░░░] 60%

# 查看状态历史
./scripts/get-status.sh -r /path/to/project --history

# JSON 格式输出
./scripts/get-status.sh -r /path/to/project --json
```

---

## 4. inject-skill.sh

在工作流的特定钩子点注入技能。

### Usage / 用法

```bash
./scripts/inject-skill.sh -r <root> --hook <hook> --skill <skill> [OPTIONS]
```

### Options / 选项

| Option | Description |
|--------|-------------|
| `-r, --root DIR` | 项目根目录 (必需) |
| `-p, --path DIR` | 指定工作流路径 (覆盖活动工作流) |
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

### Examples / 示例

```bash
# 注入代码审查技能到设计完成后
./scripts/inject-skill.sh -r /path/to/project --hook post_stage_DESIGNING --skill code-reviewer
# OUTPUT: ✅ Injected skill 'code-reviewer' at hook 'post_stage_DESIGNING'

# 注入必需的 lint 检查
./scripts/inject-skill.sh -r /path/to/project --hook quality_gate --skill lint-checker --required

# 带配置的技能注入
./scripts/inject-skill.sh -r /path/to/project --hook pre_stage_TESTING \
  --skill unit-test-runner --config '{"coverage_threshold": 80}'

# 列出已注入的技能
./scripts/inject-skill.sh -r /path/to/project --list

# 移除技能
./scripts/inject-skill.sh -r /path/to/project --hook quality_gate --skill lint-checker --remove
```

---

## 5. generate-report.sh

生成工作流摘要报告。

### Usage / 用法

```bash
./scripts/generate-report.sh -r <root> [OPTIONS]
```

### Options / 选项

| Option | Description |
|--------|-------------|
| `-r, --root DIR` | 项目根目录 (必需) |
| `-p, --path DIR` | 指定工作流路径 (覆盖活动工作流) |
| `--format FORMAT` | 输出格式: markdown\|json\|text (默认: markdown) |
| `--output FILE` | 输出文件 (默认: artifacts/report.md) |
| `--include-logs` | 在报告中包含阶段日志 |
| `--notify` | 生成后发送通知 |
| `-h, --help` | 显示帮助信息 |

### Examples / 示例

```bash
# 生成 Markdown 报告
./scripts/generate-report.sh -r /path/to/project
# OUTPUT: ✅ Report generated: .../artifacts/report.md

# 生成 JSON 报告
./scripts/generate-report.sh -r /path/to/project --format json

# 包含日志并发送通知
./scripts/generate-report.sh -r /path/to/project --include-logs --notify

# 指定输出文件
./scripts/generate-report.sh -r /path/to/project --format markdown --output ./reports/auth-report.md
```

---

## Quick Reference / 快速参考

| Task | Command |
|------|---------|
| 初始化工作流 | `./scripts/init-workflow.sh -r /project -n "name" -t feature` |
| 查看状态 | `./scripts/get-status.sh -r /project` |
| 推进阶段 | `./scripts/advance-stage.sh -r /project` |
| 注入技能 | `./scripts/inject-skill.sh -r /project --hook quality_gate --skill linter` |
| 生成报告 | `./scripts/generate-report.sh -r /project` |

## Common Workflows / 常用工作流

### L1 快速修复流程

```bash
# 1. 初始化（自动设为活动工作流）
./scripts/init-workflow.sh -r /project -n "fix-bug" -t bugfix -l L1

# 2. 后续操作只需要 -r 参数
./scripts/advance-stage.sh -r /project --to IMPLEMENTING
./scripts/advance-stage.sh -r /project --to TESTING
./scripts/advance-stage.sh -r /project --to DONE
```

### L2 标准功能开发

```bash
# 1. 初始化
./scripts/init-workflow.sh -r /project -n "new-feature" -t feature

# 2. 逐步推进（自动下一阶段）
./scripts/advance-stage.sh -r /project  # → ANALYZING
./scripts/advance-stage.sh -r /project  # → PLANNING
./scripts/advance-stage.sh -r /project  # → DESIGNING
./scripts/advance-stage.sh -r /project  # → IMPLEMENTING
./scripts/advance-stage.sh -r /project  # → TESTING
./scripts/advance-stage.sh -r /project  # → DELIVERING
./scripts/advance-stage.sh -r /project  # → DONE

# 3. 生成报告
./scripts/generate-report.sh -r /project
```

### 多工作流并行

```bash
# 初始化第一个工作流
./scripts/init-workflow.sh -r /project -n "feature-a" -t feature
# feature-a 现在是活动工作流

# 初始化第二个工作流
./scripts/init-workflow.sh -r /project -n "feature-b" -t feature
# feature-b 现在是活动工作流

# 操作活动工作流 (feature-b)
./scripts/advance-stage.sh -r /project

# 操作特定工作流 (feature-a)
./scripts/advance-stage.sh -r /project -p /project/.trae/workflow/xxx_feature-a
```
