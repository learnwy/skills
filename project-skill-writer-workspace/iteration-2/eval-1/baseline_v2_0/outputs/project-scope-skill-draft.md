---
name: ios-crash-attribution
description: "在 iOS 项目中进行崩溃归因分析，基于崩溃证据输出根因判断、修复建议与验证计划。触发词：iOS 崩溃归因、Crash 分析、符号化、EXC_BAD_ACCESS。"
license: "MIT"
requires:
  - skill-creator
compatibility: "iOS projects (Swift / Objective-C)"
metadata:
  scope: "project"
  output_path: "skills/ios-crash-attribution/SKILL.md"
---

# iOS 崩溃归因技能（项目级草案）

## 输出路径与范围

- 目标文件：`skills/ios-crash-attribution/SKILL.md`
- 该路径为仓库内相对路径，仅允许项目级输出
- 明确拒绝全局路径：`~/.trae/skills`、`~/.trae-cn/skills`
- 明确拒绝绝对路径写入（如 `/Users/...`）

## 触发条件

- 用户请求 iOS 崩溃归因、Crash 根因定位、符号化后分析
- 输入出现崩溃信号：`EXC_BAD_ACCESS`、`SIGABRT`、`Terminating app due to uncaught exception`
- 输入包含至少一种崩溃证据：崩溃日志、线程栈、设备型号、系统版本、构建版本

## 非触发场景

- Android、Web、后端故障排查请求
- 与崩溃归因无关的 UI 或功能开发请求
- 仅有模糊描述且无任何崩溃证据

## Prerequisites Gate

1. 先检查全局依赖 `skill-creator` 是否可用
2. 若不可用，阻断生成并提示安装：`npx skills add skill-creator -g -y`
3. 仅在依赖检查通过后继续生成项目级技能内容

## 执行流程

1. 判断请求是否属于 iOS 崩溃归因技能范围
2. 校验输出目标是否为仓库内相对路径
3. 提取并结构化崩溃证据（异常类型、崩溃线程、关键栈帧、符号化状态）
4. 归类根因（内存访问、空指针、并发竞态、生命周期管理、桥接异常）
5. 生成修复建议（短期止血、长期修复、回归验证）
6. 输出结构化结果（根因摘要、证据清单、修复优先级、验证计划）

## 边界约束

- 仅处理项目级 skill 草案，不混合执行 rule/agent 写作
- 不接受全局目录与绝对路径作为交付目标
- 证据不足时返回 blocked，不输出猜测性结论

## 交付清单

- 技能定义文件：`skills/ios-crash-attribution/SKILL.md`
- 内容包含：frontmatter、触发条件、非触发场景、Prerequisites Gate、执行流程、边界约束
