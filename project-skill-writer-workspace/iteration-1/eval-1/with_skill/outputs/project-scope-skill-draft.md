---
name: ios-crash-attribution
description: "在 iOS 项目中分析崩溃日志、定位根因并输出可执行修复建议。触发词包括：崩溃归因、Crash 分析、EXC_BAD_ACCESS、符号化。Do NOT use for 非 iOS 平台问题或纯业务需求排期。"
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

## 项目级输出路径

- 目标文件仅写入当前仓库：`skills/ios-crash-attribution/SKILL.md`
- 不写入任何全局目录：`~/.trae/skills`、`~/.trae-cn/skills`、`/Users/*`

## 触发条件

- 用户请求“崩溃归因”“Crash 根因分析”“符号化后定位崩溃点”
- 输入包含 iOS 崩溃特征：`EXC_BAD_ACCESS`、`SIGABRT`、`Terminating app due to uncaught exception`
- 输入包含崩溃上下文：`ips/crash` 日志、线程栈、设备与系统版本

## 非触发场景

- Android、Web、后端异常排查
- 纯代码风格优化或重构请求
- 无崩溃证据且仅要求功能开发

## prerequisites 检查

1. 检查全局前置依赖 `skill-creator` 是否可用
2. 若缺失，先给出安装引导并阻断执行：
   - `npx skills add skill-creator -g -y`
3. 仅在依赖可用后继续生成或更新技能文件

## 工作流程

1. 校验请求是否属于 iOS 崩溃归因技能范围
2. 确认项目内输出路径并执行路径安全检查（仅仓库内相对路径）
3. 提取崩溃证据（异常类型、崩溃线程、关键调用栈、符号化状态）
4. 归类根因（内存访问、空指针、并发竞态、生命周期问题、桥接问题）
5. 生成修复建议（立即止血、长期修复、回归验证）
6. 输出结构化结果（根因假设、置信度、证据、修复优先级）

## 输出结构

- 根因摘要：一句话问题定义
- 证据清单：线程、栈帧、关键符号、触发条件
- 修复方案：短期与长期方案分层
- 验证计划：复现步骤、监控指标、回归用例

## 边界约束

- 仅生成项目级技能内容，不混合 rule/agent 写作任务
- 严禁使用绝对路径与用户主目录路径
- 证据不足时明确标记 blocked，不猜测结论
