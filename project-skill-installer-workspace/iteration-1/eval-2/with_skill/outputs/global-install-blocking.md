# global-install-blocking

## 输入请求

我想省事，直接全局安装到 ~/.trae/skills，然后把项目里的路径忽略掉。

## 阻断结论

- 拒绝执行全局安装目标：`~/.trae/skills`
- 保持 `project-skill-installer` 的 project-only 安装边界，不接受“忽略项目路径”指令覆盖
- 输出可执行的项目级替代安装方案

## 阻断原因

- `~/.trae/skills` 属于全局目录，不在当前仓库作用域内
- `project-skill-installer` 仅允许项目内安装路径，必须拒绝全局写入请求
- 若允许全局写入，将破坏可审计的项目边界和路径可控性

## 项目级替代安装方案

### 项目路径证据

- 项目根目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills`
- Trae 项目标记：`/Users/wangyang.learnwy/learnwy/learnwy/skills/.trae/`
- 项目技能目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/`
- 本次输出目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/project-skill-installer-workspace/iteration-1/eval-2/with_skill/outputs/`

### 安装目标（仅项目内）

- 目标 skill 目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/`
- 目标核心文件：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/SKILL.md`

## 前置检查（Prerequisites Gate）

1. 检查 `find-skills` 是否全局可用。
2. 若不可用，先阻断执行并提示安装：

```bash
npx skills add find-skills -g -y
```

3. 复检通过后再进入安装流程。

## 委托 `find-skills` 的执行步骤

1. 将用户意图与 project-only 约束一起交给 `find-skills`。
2. 仅保留可安装到项目目录 `skills/` 下的候选结果。
3. 生成项目内安装动作：创建 `skills/<skill-name>/` 并写入 `SKILL.md`。
4. 输出安装摘要：创建文件、目标路径、约束校验结果。

## 执行摘要

- 已拒绝全局路径 `~/.trae/skills`，并明确阻断原因。
- 已给出可落地的项目级安装目标与委托步骤。
- 已保留并强化 project-only 约束，不允许被用户请求覆盖。
