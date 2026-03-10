# 项目级 Skill 安装计划（iOS 崩溃分析）

## 1) 目标与边界

- 用户目标：在当前项目内安装一个“iOS 崩溃分析”skill。
- 强约束：仅允许项目内安装路径；禁止全局路径（如 `~/.trae/skills`、`~/.trae-cn/skills`）。
- 执行方式：由 `project-skill-installer` 进行安装编排，实际发现与安装动作委托给 `find-skills`。

## 2) 项目路径证据与安装目标

### 路径证据

- 项目根目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills`
- 已检测到 Trae 项目标记：`/Users/wangyang.learnwy/learnwy/learnwy/skills/.trae/`
- 已存在项目技能目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/`
- 本次输出目录（项目内）：`/Users/wangyang.learnwy/learnwy/learnwy/skills/project-skill-installer-workspace/iteration-1/eval-1/with_skill/outputs/`

### 安装目标

- 目标 skill 目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/ios-crash-analysis/`
- 目标核心文件：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/ios-crash-analysis/SKILL.md`

选择理由：`skills/` 为当前仓库已存在且可写的项目级技能目录，满足 project-only 约束并避免全局写入风险。

## 3) 前置检查（Prerequisites Gate）

### 检查项 A：`find-skills` 全局可用

1. 执行 `find-skills` 可用性检查（以运行时可用命令为准）。
2. 若不可用，阻断安装流程并提示先安装：

```bash
npx skills add find-skills -g -y
```

3. 安装完成后，重新执行可用性检查，再进入下一步。

### 检查项 B：project-only 写入约束

1. 目标路径必须位于 `/Users/wangyang.learnwy/learnwy/learnwy/skills` 内。
2. 若目标解析到 `~/.trae/skills` 或 `~/.trae-cn/skills`，立即拒绝并回退到项目路径。

## 4) 委托 `find-skills` 的执行步骤

1. 以“iOS 崩溃分析”为查询意图调用 `find-skills`，并传入 project-only 约束上下文。
2. 让 `find-skills` 仅返回可安装到项目目录的候选 skill（过滤全局目标）。
3. 选择最佳候选后，生成安装动作：
   - 创建目录：`skills/ios-crash-analysis/`
   - 写入核心文件：`skills/ios-crash-analysis/SKILL.md`
   - 按需补充 `references/`、`scripts/` 等子目录
4. 输出安装结果摘要（已创建文件、目标路径、约束校验结果）。

## 5) 失败分支与回退策略

- `find-skills` 不可用：阻断并提示先执行 `npx skills add find-skills -g -y`。
- 候选仅支持全局安装：拒绝该候选，继续检索项目级候选。
- 路径冲突或不可写：切换到项目内可写目录 `skills/`，不触发全局回退。

## 6) 执行摘要

- 已确定项目级目标路径与路径证据，安装目标位于当前仓库 `skills/ios-crash-analysis/`。
- 已纳入 `find-skills` 前置检查与缺失时的阻断安装指令。
- 已定义委托发现、项目内安装、失败回退全流程，且全程保持 project-only 约束。
