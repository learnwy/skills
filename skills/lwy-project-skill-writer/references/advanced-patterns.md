# 高级技能模式

基于分析创建项目特定技能的模式。

## 分析 → 技能模式映射

| 项目中发现的内容 | 推荐的技能模式 | 示例 |
| -------------- | ------------ | ---- |
| 多步骤工作流 | 工作流自动化 | 订单处理、部署 |
| 复杂业务领域 | 领域知识注入 | 定价规则、实体模型 |
| 重复的代码生成 | 模板/脚手架生成 | 组件创建、API 存根 |
| 有特定用法的 CLI 工具 | 工具集成 | 数据库迁移、测试 |
| 多种变体（框架） | 多变体选择 | 云服务商、数据库类型 |

## 模式 1：工作流自动化技能

**适用场景**：项目有重复的多步骤流程。

**结构**：

```
workflow-skill/
├── SKILL.md（概述 + 阶段流程）
├── references/
│   ├── stage-details.md
│   └── error-handling.md
└── scripts/
    └── validate.sh
```

**SKILL.md 模式**：

```markdown
## 工作流

\`\`\`
[阶段 1：分析]
       ↓
[阶段 2：验证]
       ↓
[阶段 3：执行]
       ↓
[阶段 4：确认]
\`\`\`

## 阶段详情

| 阶段 | 输入 | 输出 | 参考 |
| ---- | ---- | ---- | ---- |
| 分析 | 用户请求 | 需求 | [details.md](references/stage-details.md#analyze) |
| 验证 | 需求 | 验证通过 | [details.md](references/stage-details.md#validate) |
```

## 模式 2：领域知识技能

**适用场景**：项目有复杂的业务逻辑需要 AI 理解。

**结构**：

```
domain-skill/
├── SKILL.md（领域概述）
└── references/
    ├── entities.md（实体模型）
    ├── rules.md（业务规则）
    └── terminology.md（领域词汇）
```

**SKILL.md 模式**：

```markdown
## 领域模型

| 实体 | 关键属性 | 规则 |
| ---- | ------- | ---- |
| Order | id, status, items | [rules.md#order](references/rules.md#order) |
| Payment | amount, method | [rules.md#payment](references/rules.md#payment) |

## 术语表

- **SKU**：库存单位，唯一产品标识符
- **Fulfillment**：准备和发货订单的流程

完整术语表参见 [terminology.md](references/terminology.md)。
```

## 模式 3：多变体选择

**适用场景**：技能需要支持多种框架/变体。

**结构**：

```
multi-variant-skill/
├── SKILL.md（选择逻辑 + 快速入门）
└── references/
    ├── variant-a.md
    ├── variant-b.md
    └── variant-c.md
```

**SKILL.md 模式**：

```markdown
## 变体选择

| 变体 | 适用场景 | 参考 |
| ---- | ------- | ---- |
| AWS | 团队使用 AWS 基础设施 | [aws.md](references/aws.md) |
| GCP | 团队使用 GCP | [gcp.md](references/gcp.md) |
| Azure | 团队使用 Azure | [azure.md](references/azure.md) |

**选择逻辑：**
1. 检查项目中现有的基础设施
2. 查找现有的云配置文件
3. 不确定时询问用户
```

## 模式 4：工具集成技能

**适用场景**：项目使用有特定模式的 CLI 工具。

**结构**：

```
tool-skill/
├── SKILL.md（概述 + 快速用法）
├── references/
│   ├── cmd-x.md
│   ├── cmd-y.md
│   └── cmd-z.md
└── scripts/
    └── wrapper.sh
```

**SKILL.md 模式**：

```markdown
## 命令参考

| 命令 | 用途 | 参考 |
| ---- | ---- | ---- |
| `init` | 初始化 | [cmd-init.md](references/cmd-init.md) |
| `run` | 执行 | [cmd-run.md](references/cmd-run.md) |

## 快速用法

\`\`\`bash
tool init <name>
tool run <target>
\`\`\`
```

## 模式 5：模板生成技能

**适用场景**：项目需要标准化的文件生成。

**结构**：

```
template-skill/
├── SKILL.md（生成规则）
└── assets/
    ├── component.tsx.template
    ├── test.tsx.template
    └── style.css.template
```

**SKILL.md 模式**：

```markdown
## 生成规则

1. 分析目标位置
2. 选择合适的模板
3. 用上下文填充模板
4. 在正确路径创建文件

## 模板

| 类型 | 模板 | 输出位置 |
| ---- | ---- | ------- |
| 组件 | [component.tsx](assets/component.tsx.template) | src/components/{name}/ |
| 测试 | [test.tsx](assets/test.tsx.template) | src/components/{name}/__tests__/ |
```

## 模式 6：IDE Hooks 集成

**适用场景**：技能需要在 IDE 生命周期事件中进行确定性自动化（自动格式化、质量门禁、上下文注入）。同时支持 Trae 和 Claude Code。

**结构**：

```
hooks-skill/
├── SKILL.md（技能逻辑 + hook 注册）
├── scripts/
│   ├── session-init.cjs    （SessionStart 处理器）
│   ├── quality-gate.cjs    （Stop 处理器）
│   └── post-edit.cjs       （PostToolUse 处理器）
└── references/
    └── hooks-standard.md   （规范参考）
```

**配置格式**（生成至 `.trae/hooks.json` 和 `.claude/settings.json`）：

```json
{
  "version": 1,
  "hooks": {
    "SessionStart": [{
      "hooks": [{ "type": "command", "command": "node .hooks/init.cjs", "timeout": 10 }]
    }],
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "node .hooks/format.cjs", "timeout": 10 }]
    }],
    "Stop": [{
      "loop_limit": 3,
      "hooks": [{ "type": "command", "command": "node .hooks/verify.cjs", "timeout": 30 }]
    }]
  }
}
```

**关键事件：**

| 事件 | Matcher | 用途 |
|------|---------|------|
| `SessionStart` | — | 注入上下文、加载项目状态 |
| `UserPromptSubmit` | — | 丰富/阻止用户提示 |
| `PreToolUse` | 工具正则 | 阻止/修改工具调用 |
| `PostToolUse` | 工具正则 | 自动格式化、记录变更 |
| `Stop` | — | 停止前的质量门禁（loop_limit 防止无限循环） |

**I/O 合约**：脚本从 stdin 接收 JSON，stdout 输出 JSON。Exit 0 = 允许，Exit 2 = 阻止。

**可移植性**：仅使用 `command` 类型。检查 `$TRAE_PROJECT_DIR` 或 `$CLAUDE_PROJECT_DIR`。

## 项目分析清单

创建任何技能之前，分析：

- [ ] 哪些工作流是重复的？
- [ ] 哪些领域知识是项目特有的？
- [ ] 项目使用什么工具？
- [ ] 存在什么约定？
- [ ] 什么模板会有帮助？
- [ ] 现有 `.agents/skills/` 中有什么模式？
- [ ] 技能是否应注册 IDE hooks 用于确定性自动化？
