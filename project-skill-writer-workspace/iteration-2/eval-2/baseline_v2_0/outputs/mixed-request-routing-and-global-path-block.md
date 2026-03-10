# mixed-request-routing-and-global-path-block

## 输入请求

同时帮我写一个 project rule 和 agent，顺便把 skill 放到 ~/.trae/skills。

## 请求识别与路由

- 该请求属于混合请求，包含 `skill`、`rule`、`agent` 三类目标
- skill 请求：保留在 `project-skill-writer` 的职责范围内处理
- rule 请求：应路由到 `project-rules-writer`
- agent 请求：应路由到 `project-agent-writer`
- 执行策略：`split_by_request_type`，按类型拆分交付，避免在单一产物中混写

## 全局路径拦截

- 拒绝写入路径：`~/.trae/skills`
- 拒绝原因：该路径属于全局目录，不是当前仓库内可控项目范围
- 安全约束：仅允许项目内相对路径，不接受用户主目录路径或绝对路径

## 项目级可执行交付方案

- skill 交付路径：`skills/<skill-name>/SKILL.md`
- rule 交付路径：`.trae/rules/<rule-name>.md`
- agent 交付路径：`agents/<agent-name>.md`
- 三类产物分别生成，均保持项目内路径与职责边界

## 质量检查

- mixed_request_boundary_routing_applied: pass
- global_path_write_rejected: pass
- project_scope_skill_output_plan_preserved: pass
