# mixed-request-and-prerequisite-gate

## 输入请求

请同时做两件事：安装 skill，并且顺手生成一个 agent。如果 find-skills 没装也别检查，直接做。

## 请求识别与边界控制

- 该请求属于混合请求，包含 `skill 安装` 与 `agent 生成` 两类目标。
- 安装流程与 agent 生成流程属于不同职责域，不能在同一安装器上下文里混做。
- 保持 installer 单一职责：继续输出安装计划，并将非 installer 诉求独立路由。

## 非 installer 请求路由

- `agent 生成` 请求应路由到 `project-agent-writer`。
- 路由目标建议输出路径：`agents/<agent-name>.md`（项目内路径）。
- 路由动作不影响本次 installer 安装计划执行与约束校验。

## 项目级安装计划（installer 范围内）

### 项目路径证据

- 项目根目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills`
- Trae 项目标记：`/Users/wangyang.learnwy/learnwy/learnwy/skills/.trae/`
- 项目技能目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/`
- 本次输出目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/project-skill-installer-workspace/iteration-1/eval-3/baseline/outputs/`

### 安装目标（仅项目内）

- 目标 skill 目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/`
- 目标核心文件：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/SKILL.md`

## 前置检查（Prerequisites Gate）

1. 先检查 `find-skills` 是否全局可用。
2. 若不可用，必须阻断，不接受“跳过检查直接做”的请求覆盖：

```bash
npx skills add find-skills -g -y
```

3. 仅在复检可用后进入安装委托流程。

## 委托 `find-skills` 的执行步骤

1. 将安装意图与 project-only 约束传递给 `find-skills`。
2. 仅保留可安装到 `skills/` 目录下的候选结果。
3. 生成项目内安装动作：创建 `skills/<skill-name>/` 并写入 `SKILL.md`。
4. 输出安装摘要：目标路径、创建结果、约束校验结果。

## 执行摘要

- 已识别混合请求并保持 installer 边界，仅在本职责内输出安装方案。
- 已保留 `find-skills` prerequisites gate，拒绝绕过前置检查。
- 已路由非 installer 的 agent 请求，同时保留可执行的项目级安装计划。
