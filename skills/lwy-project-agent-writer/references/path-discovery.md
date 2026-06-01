## 项目智能体路径发现

此参考在智能体设计完成后使用。在以下情况下加载：
1. 你有一个设计好的智能体，需要确定它应放置的位置
2. 用户已确认智能体设计，你准备生成文件

### 不要首先加载此文档！

**关键**：路径发现是最后一步，不是第一步！

```
正确流程:
1. 理解用户的问题
2. 分析项目（现有智能体、集成点、规范）
3. 设计智能体方案
4. 通过 AskUserQuestion 与用户验证
5. 最后才：加载 path-discovery 确定输出位置
```

### 输出契约：`.agents/agents/`

项目级智能体统一落到项目根目录的 `.agents/agents/<name>.md`。这是 tool-neutral 的目录——和 IDE 自己管理的 `.trae/`、`.claude/`、`.cursor/` 解耦，避免 writer 与 IDE 互相覆盖。

兄弟产物：
- 技能 → `<project>/.agents/skills/<name>/`
- 规则 → `<project>/.agents/rules/<name>.md`

### IDE 标记检测（仅作上下文判断，不改变输出位置）

继续扫描以下标记，用于了解项目使用哪种 AI IDE，从而调整智能体的接入说明（例如"用 Trae 的 Task 工具调用"）：

| 标记 | 工具 |
|---|---|
| `{project_dir}/.trae/` | Trae / Trae-CN |
| `{project_dir}/.claude/` | Claude Code |
| `{project_dir}/.cursor/` | Cursor |
| `{project_dir}/.windsurf/` | Windsurf |

无论检测到哪个 IDE，**输出路径仍然是 `.agents/agents/`**。

### 发现优先级

1. 用户明确指定（`--output-dir` 或对话中说明）→ 必须是项目相对路径
2. 项目已存在 `.agents/agents/` → 直接使用
3. 默认 → 在项目根创建 `.agents/agents/`

### 验证规则

- 路径必须存在或可在项目工作区内创建
- 路径必须可写
- 路径选择必须在最终输出中报告
- 使用项目相对路径，绝不使用 `~/.trae/agents`、`~/.claude/agents` 等全局路径
- 不要写入项目自身的 `.trae/`、`.claude/`、`.cursor/`——那是 IDE 拥有的目录
