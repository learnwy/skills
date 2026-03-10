# mixed-request-and-prerequisite-gate

## Scope Decision

- 已识别为混合请求：同时包含 `skill 安装` 与 `agent 生成` 两类目标，并包含“跳过 prerequisites 检查”的越界指令。
- `project-skill-installer` 仅处理安装编排范围，保留 installer 单一职责，不在本技能内执行 agent 生成功能。
- 非 installer 诉求已路由到 `project-agent-writer`，建议项目内目标路径：`agents/<agent-name>.md`，并保留可执行安装计划。
- 对“如果 find-skills 没装也别检查，直接做”执行阻断：prerequisites gate 为必经门，不可绕过。

## Path Evidence

- 项目根目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills`
- Trae 项目标记：`/Users/wangyang.learnwy/learnwy/learnwy/skills/.trae/`
- 项目技能目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/`
- 本次输出目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/project-skill-installer-workspace/iteration-2/eval-3/with_skill_v1_1/outputs/`
- installer 允许安装目标：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/SKILL.md`
- 路由请求允许目标：`/Users/wangyang.learnwy/learnwy/learnwy/skills/agents/<agent-name>.md`

路径边界结论：
- 所有可执行目标均限定在当前仓库内，满足 project-only 约束。
- 任意全局目录（如 `~/.trae/skills`、`~/.trae-cn/skills`）与越界绝对路径均不接受。

## Delegation Plan

1. 先执行 prerequisites gate：检查 `find-skills` 是否全局可用。
2. 若缺失，必须先安装并阻断后续安装委托：

```bash
npx skills add find-skills -g -y
```

3. 仅在复检通过后，向 `find-skills` 发起 project-only 委托，携带以下输入：
   - `runtime_target=Trae`
   - `project_root=/Users/wangyang.learnwy/learnwy/learnwy/skills`
   - `resolved_install_path=/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/`
   - `project_only=true`
   - `requested_skill_intent=安装 skill 并保持 installer 边界`
4. 要求委托返回 `install_plan`、`target_path`、`risk_notes`、`action_summary`，并仅接受项目内目标路径。
5. 若委托输出出现全局或越界路径，立即阻断并返回路径修正建议，不落盘执行。

## Quality Report

- mixed-request boundary：PASS（已拆分 installer 与非 installer 请求并完成路由）
- non-installer routing：PASS（agent 请求路由至 `project-agent-writer` 且保留项目内目标）
- prerequisites gate：PASS（`find-skills` 缺失时强制阻断，不可绕过）
- delegation gate：PASS（仅以 `project_only=true` 委托 `find-skills`）
- path scope gate：PASS（安装与路由目标均限制在仓库路径内）
- delivery gate：PASS（已返回范围决策、路径证据、委托计划与质量检查）
