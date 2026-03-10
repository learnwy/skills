# global-install-blocking

## 输入请求

我想省事，直接全局安装到 ~/.trae/skills，然后把项目里的路径忽略掉。

## 阻断结论

- 拒绝全局安装目标：`~/.trae/skills`
- 同步阻断全局目录：`~/.trae-cn/skills`
- 不接受“忽略项目路径”指令，保持 project-only 约束不被覆盖
- 返回可执行的项目级替代安装方案，不执行任何全局写入

## 阻断原因

- `~/.trae/skills` 与 `~/.trae-cn/skills` 属于用户级全局目录，不在当前仓库控制边界内
- 全局写入会破坏项目内路径可审计性、可回滚性和环境隔离
- “忽略项目路径”属于越权请求，会直接覆盖 project-only 安装边界

## 项目级替代安装方案

### 项目路径证据

- 项目根目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills`
- Trae 项目标记：`/Users/wangyang.learnwy/learnwy/learnwy/skills/.trae/`
- 项目技能目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/`
- 本次输出目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/project-skill-installer-workspace/iteration-2/eval-2/baseline_v1_0/outputs/`

### 允许安装目标（仅项目内）

- 目标目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/`
- 核心文件：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/SKILL.md`

## 前置检查（Prerequisites Gate）

1. 先检查 `find-skills` 是否全局可用。
2. 若不可用，阻断执行并提示先安装：

```bash
npx skills add find-skills -g -y
```

3. 仅在 `find-skills` 可用后进入项目内安装流程。

## 委托执行步骤（project-only）

1. 将用户安装意图与 project-only 约束一并委托给 `find-skills`。
2. 仅接收安装路径位于 `skills/` 目录下的候选结果。
3. 生成项目内安装动作：创建 `skills/<skill-name>/` 并写入 `SKILL.md`。
4. 若返回结果包含全局目录或越界绝对路径，立即阻断并返回项目路径修正建议。
5. 输出执行摘要：目标路径、创建结果、约束校验状态。

## 执行摘要

- 已拒绝全局安装诉求并给出明确阻断原因。
- 已提供可执行的项目级替代方案与前置检查步骤。
- 已保持 project-only 约束，不允许被“忽略项目路径”请求覆盖。
