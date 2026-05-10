## 项目技能安装路径发现

确定在项目中安装技能的位置。

### 发现优先级

1. **用户明确指定** — 用户说了放在哪里 → 使用该路径（如果是项目相对的）
2. **已有技能目录** — `.trae/skills/` 已存在 → 使用它
3. **IDE 标记** — `.cursor/`、`.claude/`、`.windsurf/` 存在 → 使用其技能目录
4. **默认** — 在项目根目录创建 `.trae/skills/`

### 检测逻辑

```
1. 检查: <project_root>/.trae/skills/ 是否存在？
   是 → 使用它
   否 → 继续

2. 检查: <project_root>/.cursor/skills/ 是否存在？
   是 → 使用它
   否 → 继续

3. 检查: <project_root>/.claude/skills/ 是否存在？
   是 → 使用它
   否 → 继续

4. 默认: 创建 <project_root>/.trae/skills/
```

### 验证规则

- 路径必须在项目根目录内
- 路径必须是项目相对的（不使用 `/Users/...` 这样的绝对路径）
- **绝不**安装到全局路径：`~/.trae/skills/`、`~/.trae-cn/skills/`、`~/.cursor/skills/`
- 如果用户请求全局安装，拒绝并解释项目范围限制

### 路径输出格式

始终在安装摘要中报告解析后的路径：

```
安装路径: <project_root>/.trae/skills/<skill-name>/
依据: 找到已有 .trae/skills/ 目录
```
