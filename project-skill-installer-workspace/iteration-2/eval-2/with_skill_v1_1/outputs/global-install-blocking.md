# global-install-blocking

## Scope Decision

- 已识别请求包含全局安装目标 `~/.trae/skills` 与“忽略项目路径”指令。
- `project-skill-installer` 仅处理项目内安装编排，拒绝全局安装与越界路径覆盖。
- 本次仅返回阻断结论与项目级替代安装方案，不执行全局写入动作。

## Path Evidence

- 项目根目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills`
- Trae 项目标记：`/Users/wangyang.learnwy/learnwy/learnwy/skills/.trae/`
- 项目技能目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/`
- 本次输出目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/project-skill-installer-workspace/iteration-2/eval-2/with_skill_v1_1/outputs/`
- 被阻断全局目标：`~/.trae/skills`、`~/.trae-cn/skills`
- 允许安装目标：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/SKILL.md`

阻断原因：
- `~/.trae/skills` 与 `~/.trae-cn/skills` 为全局目录，不在当前仓库可审计范围内。
- “忽略项目路径”会覆盖 project-only 约束，违反固定 stage gates 的路径证据门与全局阻断门。

## Delegation Plan

1. 先执行 prerequisites gate：检查 `find-skills` 是否全局可用。
2. 若缺失，阻断并提示安装：

```bash
npx skills add find-skills -g -y
```

3. prerequisites 通过后，以 project-only 约束委托 `find-skills`：
   - `runtime_target=Trae`
   - `project_root=/Users/wangyang.learnwy/learnwy/learnwy/skills`
   - `resolved_install_path=/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/`
   - `project_only=true`
   - `requested_skill_intent=安装目标 skill（拒绝全局路径）`
4. 仅接受委托输出中的项目内目标：`install_plan`、`target_path`、`risk_notes`、`action_summary`。
5. 如委托结果包含任何全局或绝对越界路径，直接阻断并返回项目路径修正建议。

## Quality Report

- prerequisites gate：PASS（定义了 `find-skills` 缺失即阻断流程）
- path scope gate：PASS（安装目标限定在项目 `skills/` 目录）
- global-target blocking：PASS（明确拒绝 `~/.trae/skills` 与 `~/.trae-cn/skills`）
- runtime adaptation：PASS（按 Trae 运行时给出路径与约束表达）
- delivery gate：PASS（已返回阻断结论、路径证据、委托计划与质量检查）
