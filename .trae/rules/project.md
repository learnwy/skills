---
description: 个人技能仓库概览
alwaysApply: true
---

# 个人技能仓库

## 目标

本仓库用于存储和维护个人 AI 技能、代理及配套规则。

## 结构

```
skills/                           # 仓库根目录
├── .trae/rules/                  # 项目规则（本目录）
├── agents/                       # 通用方法论代理
│   ├── problem-definer/
│   ├── story-mapper/
│   ├── domain-modeler/
│   ├── architecture-advisor/
│   ├── responsibility-modeler/
│   ├── spec-by-example/
│   ├── tdd-coach/
│   ├── refactoring-guide/
│   ├── legacy-surgeon/
│   ├── test-strategist/
│   └── AGENTS.md
├── skills/                       # 可运行的技能模块
│   ├── ai-brain/                 # 跨会话记忆系统
│   ├── english-learner/          # 词汇学习助手
│   ├── figma-node-fetcher/       # Figma 设计数据获取器
│   ├── knowledge-consolidation/  # 知识持久化
│   ├── project-agent-writer/     # 创建项目级代理
│   ├── project-skill-installer/  # 将技能安装到项目中
│   ├── project-skill-writer/     # 创建项目级技能
│   ├── requirement-workflow/     # SDD 开发工作流
│   ├── software-methodology-toolkit/  # 方法论代理（兜底）
│   └── trae-rules-writer/        # 创建 Trae IDE 规则
└── AGENT.md, CLAUDE.md, LICENSE
```

## 分类

**agents/**：通用方法论代理（problem-definer、story-mapper 等）。这些是权威副本；适配版本存放在各技能内部。

**skills/**：可运行的技能模块，每个都有独立的 SKILL.md、脚本和支持文件。

## 技能目录结构

```
skills/{name}/
├── SKILL.md          # 技能定义（必需）
├── scripts/          # CJS 脚本（Node.js >= 18）
├── evals/            # 评估测试用例
├── agents/           # 技能专属代理
├── assets/           # 模板、静态文件
├── references/       # 参考文档
└── examples/         # 使用示例
```

## 约定

- **脚本**：CommonJS (.cjs)，带 `#!/usr/bin/env node` 和 `'use strict'`
- **语言**：所有技能文档使用英文（参见 skills-english-only 规则）
- **路径**：始终使用项目相对路径，不使用全局路径
- **前置条件**：在每个 SKILL.md 的第 2 或第 3 节列出

## 使用方式

**用户**：AI 根据 SKILL.md 描述中的触发条件自动选择技能。
**开发者**：添加或更新 `skills/{name}/SKILL.md`。
