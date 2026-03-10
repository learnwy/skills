# global-install-blocking

## 输入请求

我想省事，直接全局安装到 ~/.trae/skills，然后把项目里的路径忽略掉。

## 阻断结论

- 拒绝全局安装目标：`~/.trae/skills`
- 不接受“忽略项目路径”这一越界指令，保持 project-only 安装边界
- 提供可执行的项目级替代安装方案

## 阻断原因

- `~/.trae/skills` 属于用户级全局目录，不在当前仓库可控范围内
- 安装器必须将写入范围限制在项目内，否则会破坏路径可审计性与环境隔离
- “忽略项目路径”会直接覆盖 project-only 约束，属于高风险越权请求

## 项目级替代安装方案

### 项目路径证据

- 项目根目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills`
- Trae 项目标记：`/Users/wangyang.learnwy/learnwy/learnwy/skills/.trae/`
- 项目技能目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/`
- 本次输出目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/project-skill-installer-workspace/iteration-1/eval-2/baseline/outputs/`

### 安装目标（仅项目内）

- 目标目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/`
- 核心文件：`/Users/wangyang.learnwy/learnwy/learnwy/skills/skills/<skill-name>/SKILL.md`

## 前置检查（Prerequisites Gate）

1. 检查 `find-skills` 是否全局可用。
2. 若不可用，先阻断并提示安装：

```bash
npx skills add find-skills -g -y
```

3. 复检通过后再执行项目内安装。

## 委托 `find-skills` 的执行步骤

1. 将“安装 skill”的用户意图与 project-only 约束一并传递给 `find-skills`。
2. 仅保留可安装到 `skills/` 目录下的候选结果。
3. 生成项目内安装动作：创建 `skills/<skill-name>/` 并写入 `SKILL.md`。
4. 输出安装摘要：目标路径、创建结果、约束校验结果。

## 执行摘要

- 已拒绝全局安装路径 `~/.trae/skills`，并解释阻断原因。
- 已给出不越界的项目级替代安装目标与执行流程。
- 已保留 project-only 约束，不允许被用户请求覆盖。
