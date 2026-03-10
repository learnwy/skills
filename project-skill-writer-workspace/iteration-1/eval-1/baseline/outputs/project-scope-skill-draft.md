---
name: ios-crash-attribution
description: "在 iOS 项目中分析崩溃日志并给出根因与修复建议。"
license: "MIT"
compatibility: "iOS projects (Swift / Objective-C)"
metadata:
  scope: "project"
  output_path: "skills/ios-crash-attribution/SKILL.md"
---

# iOS 崩溃归因技能（项目级草案）

## 输出路径

- 生成目标：`skills/ios-crash-attribution/SKILL.md`
- 输出保持在当前仓库内，不使用全局目录

## 触发条件

- 用户请求 iOS 崩溃归因、Crash 根因定位、符号化分析
- 输入包含崩溃日志或关键错误：`EXC_BAD_ACCESS`、`SIGABRT`
- 需要给出可执行修复建议和验证方案

## prerequisites

1. 确认可使用 `skill-creator`
2. 如不可用，先安装后再继续生成技能

## 执行流程

1. 识别是否属于 iOS 崩溃归因场景
2. 收集崩溃证据（异常类型、线程、调用栈、系统版本）
3. 归纳根因并按优先级输出修复建议
4. 给出验证计划（复现步骤、回归用例、监控指标）

## 输出结构

- 根因摘要
- 证据清单
- 修复方案
- 验证计划
