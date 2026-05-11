## 项目技能路径发现

此参考在问题分析和技能设计**之后**使用。在以下情况加载：
1. 已设计好技能，需要确定放置位置
2. 用户已确认技能设计，准备生成文件

### 不要先加载此文件！

```
正确流程：
1. 理解用户的问题
2. 分析项目（技术栈、约定、模式）
3. 设计技能方案
4. 与用户确认（展示将创建什么）
5. 仅在此时：加载 path-discovery 确定输出位置
```

### 输出契约：`.agents/skills/`

所有 writer 技能统一把项目级产物落到项目根目录的 `.agents/` 下：

| 产物 | 路径 |
|------|------|
| 技能 | `<project>/.agents/skills/<name>/SKILL.md` |
| 智能体 | `<project>/.agents/agents/<name>.md` |
| 规则 | `<project>/.agents/rules/<name>.md` |

这与 IDE 自身的 `.trae/`、`.claude/`、`.cursor/` 目录**解耦**：那些目录由 IDE 写入和管理，本仓库的 writer 技能不再写进去，避免与 IDE 自动生成内容冲突。

### IDE 标记检测（仅用于上下文判断，不影响输出路径）

仍然扫描以下标记，目的是了解项目使用哪个 IDE / 工具栈，以便在 SKILL.md、agents/、references/ 中给出更贴近的示例：

| 标记 | 运行时 |
|------|--------|
| `{project_dir}/.trae/` | Trae（项目级） |
| `{project_dir}/.claude/` | Claude Code |
| `{project_dir}/.cursor/` | Cursor |
| `{project_dir}/.windsurf/` | Windsurf |
| `~/.trae/`、`~/.claude/`、`~/.cursor/` | 用户级安装 |

无论检测到哪个，**输出路径仍然是 `.agents/skills/`**。

### 发现优先级

当用户没有显式指定时，按以下顺序解析输出根目录：

1. **用户明确指定** — 用户提供了 `--output-root` 或在对话中指明
2. **现有 `.agents/` 目录** — 项目根已有 `.agents/skills/` → 直接使用
3. **现有 IDE 镜像** — 项目根有 `.trae/skills/` 或 `.claude/skills/` 时，仍然在 `.agents/skills/` 新建，并告诉用户"如需同步到 IDE 目录可自行 symlink"
4. **默认值** — 在项目根创建 `.agents/skills/`

如果仍有歧义，选择最保守的可写路径并报告原因。

### 验证规则

- 路径必须存在或可在项目工作区内创建
- 路径必须可写
- 路径选择必须在最终输出中报告
- **绝不**使用全局路径如 `~/.trae/skills`、`~/.claude/skills`、`~/.agents/skills`
- 拒绝绝对路径（如 `/Users/foo/bar`）——始终使用项目相对路径
