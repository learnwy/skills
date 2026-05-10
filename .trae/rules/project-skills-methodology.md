---
description: 项目技能方法论 - 创建技能、代理和安装能力的问题优先方法
globs: skills/project-*/**/*.md
alwaysApply: false
---

# 项目技能方法论

## 理念：问题优先，而非问卷优先

当用户想要创建项目技能、代理或安装技能时，他们描述的是**问题**，而不是资产类型：

- "我总是在写相同的组件样板代码"
- "我需要有人自动审查我的 PR"
- "我希望 AI 帮我做 X"

## 工作流

每个 project-* 技能遵循相同的 3 阶段流程：

```
[1. 理解]  → 从问题推断，分析项目
     ↓
[2. 确认]  → AskUserQuestion（创建任何文件前必须执行）
     ↓
[3. 交付]  → 生成文件、验证、报告
```

## 问题分类

| 问题模式 | 资产类型 | 使用的技能 |
|---------|---------|-----------|
| "我每次都写相同的代码" | Skill（生成器） | project-skill-writer |
| "我每次都做相同的检查" | Skill（验证器） | project-skill-writer |
| "我每次都遵循相同的步骤" | Skill（工作流） | project-skill-writer |
| "我需要有人评估/评分…" | Agent（评估器） | project-agent-writer |
| "我需要有人分析/查找…" | Agent（分析器） | project-agent-writer |
| "我想借助 AI 做 X" | 安装一个技能 | project-skill-installer |
| "我想要一条规则…" | Rule | trae-rules-writer |

## 激活触发条件

### project-skill-writer
- "我总是手动做 X"
- "每次我需要 Y 的时候…"
- "你能为…创建一个技能吗"

### project-agent-writer
- "我需要有人自动…"
- "你能让 AI 每次都做 X 吗…"
- "我想要一个代理来…"

### project-skill-installer
- "我想借助 AI 做 X"
- "找一个…的技能"、"有什么可用的…"

### trae-rules-writer
- "我想要一条强制执行…的规则"
- "为…设置编码规范"

## AskUserQuestion（必须执行）

所有 project-* 技能在生成文件前必须使用 `AskUserQuestion`：

```json
{
  "questions": [{
    "question": "根据您的项目，以下是我将创建的内容。是否继续？",
    "header": "确认",
    "options": [
      { "label": "{asset-name}（推荐）", "description": "{功能说明}" },
      { "label": "调整", "description": "让我调整设计方案" },
      { "label": "跳过", "description": "不创建任何内容" }
    ]
  }]
}
```

## 路径规则

- 路径发现是最后一步，不是第一步
- 始终使用项目相对路径 — 切勿使用全局路径（`~/.trae/`、`~/.claude/`）
- 检测 IDE 标记（`.trae/`、`.claude/`、`.cursor/`）以确定约定

## 质量门禁

交付任何项目资产前：

- [ ] 有有意义的触发条件（不仅仅是文件名）
- [ ] 输出路径是项目相对路径
- [ ] Frontmatter 包含 name 和 description
- [ ] 工作流/流程可执行
- [ ] 依赖在 Prerequisites 章节中声明
