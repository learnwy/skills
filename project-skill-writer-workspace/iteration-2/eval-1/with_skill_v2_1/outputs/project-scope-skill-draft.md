---
name: ios-crash-attribution
description: "在 iOS 项目中进行崩溃归因分析，基于崩溃证据输出根因判断、修复建议与验证计划。触发词：iOS 崩溃归因、Crash 分析、符号化、EXC_BAD_ACCESS。"
license: "MIT"
requires:
  - skill-creator
compatibility: "iOS projects (Swift / Objective-C)"
metadata:
  scope: "project"
  owner: "mobile-platform"
  output_path: "skills/ios-crash-attribution/SKILL.md"
---

# iOS 崩溃归因技能（项目级草案）

## Scope Decision

- decision: skill-only
- request_type: project skill draft
- routing: 无需拆分到 rule 或 agent

## Path Evidence

- 项目级目标写入路径：`skills/ios-crash-attribution/SKILL.md`
- 该路径为仓库内相对路径，满足 project scope
- 禁止写入用户主目录或任意绝对路径目的地

## Deliverables

- 输出文件：`skills/ios-crash-attribution/SKILL.md`
- 产物内容：frontmatter、触发条件、非触发场景、prerequisites gate、执行流程、边界约束

## 触发条件

- 用户请求“iOS 崩溃归因”“Crash 根因定位”“符号化后分析崩溃点”
- 输入含崩溃信号：`EXC_BAD_ACCESS`、`SIGABRT`、`Terminating app due to uncaught exception`
- 输入包含崩溃证据：崩溃日志、线程栈、设备型号、系统版本、构建版本

## 非触发场景

- Android、Web、后端异常排查
- 纯功能开发排期、UI 调整、代码风格优化
- 无崩溃证据且目标并非根因定位

## Prerequisites Gate

1. 必须先检查全局前置依赖 `skill-creator` 是否可用
2. 若不可用，阻断生成并提示安装命令：`npx skills add skill-creator -g -y`
3. 仅在依赖通过后继续生成或更新项目级技能文件

## 执行流程

1. 判断请求是否属于 iOS 崩溃归因技能范围
2. 校验输出目标仅为仓库内相对路径
3. 提取并结构化崩溃证据（异常类型、崩溃线程、关键栈帧、符号化状态）
4. 进行根因归类（内存访问、空指针、并发竞态、生命周期管理、桥接异常）
5. 生成分层修复建议（短期止血与长期修复）
6. 输出验证计划（复现步骤、监控指标、回归用例）

## 输出结构

- 根因摘要
- 证据清单
- 修复建议与优先级
- 验证计划

## 边界约束

- 仅处理 skill 草案，不混合执行 rule/agent 写作
- 不接受全局目录和绝对路径作为交付目标
- 证据不足时返回 blocked，不输出猜测性结论

## Quality Report

- frontmatter: pass
- trigger_spec: pass
- path_scope_project_only: pass
- prerequisites_gate: pass
