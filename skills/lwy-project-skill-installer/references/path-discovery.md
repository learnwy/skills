## 项目技能安装路径发现

确定在项目中安装技能的位置。

### 输出契约：`.agents/skills/`

所有项目级技能统一安装到 `<project>/.agents/skills/<skill-name>/`。这是 tool-neutral 的目录，与 IDE 自管的 `.trae/`、`.claude/`、`.cursor/` 解耦——避免与 IDE 的自动同步冲突。

### 发现优先级

1. **用户明确指定** — 用户说了放在哪里 → 使用该路径（必须是项目相对路径且不在 IDE 自管目录内）
2. **已有 `.agents/skills/` 目录** → 使用它
3. **默认** — 在项目根目录创建 `.agents/skills/`

### 检测逻辑

```
1. 检查: <project_root>/.agents/skills/ 是否存在？
   是 → 使用它
   否 → 创建并使用 <project_root>/.agents/skills/
```

IDE 标记（`.trae/`、`.cursor/`、`.claude/`、`.windsurf/`）仍然检测，但**仅用于上下文判断**（例如选择推荐哪些技能、给安装报告的上下文行），不再作为安装目录。

### 验证规则

- 路径必须在项目根目录内
- 路径必须是项目相对的（不使用 `/Users/...` 这样的绝对路径）
- **绝不**安装到全局路径：`~/.trae/skills/`、`~/.trae-cn/skills/`、`~/.cursor/skills/`、`~/.claude/skills/`
- **绝不**安装到项目自身的 `.trae/`、`.claude/`、`.cursor/`、`.windsurf/` —— 那是 IDE 拥有的目录
- 如果用户请求全局安装，拒绝并解释项目范围限制

### 路径输出格式

始终在安装摘要中报告解析后的路径：

```
安装路径: <project_root>/.agents/skills/<skill-name>/
依据: 项目根使用统一的 .agents/ 目录（默认行为）
```
