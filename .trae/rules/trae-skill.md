---
description: Trae IDE 工具编写技能的开发指南（trae-rules-writer）
globs: skills/trae-rules-writer/**/*.md
alwaysApply: false
---

# Trae 编写技能开发

## 适用范围

本规则适用于 `trae-rules-writer` 及未来所有 `trae-*-writer` 类技能。

## 当前结构

```
skills/trae-rules-writer/
├── agents/
│   ├── convention-detector.md
│   ├── project-scanner.md
│   └── quality-validator.md
├── assets/
│   ├── rule.md.template
│   └── trae-rules-docs.md
├── evals/
├── examples/
├── references/
├── scripts/
│   └── cli.cjs    # 子命令：init
└── SKILL.md
```

## 代理

| 代理 | 用途 |
|------|------|
| project-scanner | 分析项目结构和约定 |
| convention-detector | 提取命名、风格和模式约定 |
| quality-validator | 验证生成的输出质量 |

## 关键规则

**路径：** 禁止使用绝对路径。使用 `src/` 或 `{project_root}/`。

**Globs：** frontmatter globs 中禁止使用引号。`globs: *.ts,*.tsx` 而非 `globs: "*.ts"`。

**Frontmatter：** 每条规则必须包含 `description` 和 `alwaysApply` 或 `globs`。

## 质量检查清单

- [ ] Frontmatter 包含 `description`
- [ ] Frontmatter 包含 `alwaysApply: true` 或 `globs:`（两者不能同时启用）
- [ ] description 中包含触发条件
- [ ] 内容中无绝对路径
- [ ] Globs 不使用引号
- [ ] 内容使用英文
