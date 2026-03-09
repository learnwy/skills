# project-agent-writer · Iteration 1 Benchmark

## Scope

- Skill under test: `project-agent-writer`
- Eval set: `eval-1` / `eval-2` / `eval-3`
- Compared runs: `with_skill` vs `without_skill`

## Results

| Eval | with_skill | without_skill | Notes |
|---|---:|---:|---|
| eval-1 | 3/3 | 3/3 | 两者都满足 `passed/evidence` 与只读边界；with_skill 边界条款更明确。 |
| eval-2 | 3/3 | 3/3 | 两者都包含 Non-Goals、P0-P3、分析维度；with_skill 输出结构更细。 |
| eval-3 | 3/3 | 3/3 | 两者都正确路由到 `project-rules-writer` 并包含 Trae 约束。 |

## Interpretation

- 首轮用例中，功能正确性两组持平，未出现失败项。
- `with_skill` 的主要收益在于约束表达更完整、输出格式更稳定、审计字段更清晰。
- 下一轮应增加更“刁钻”的边界样例来放大差异（例如混合请求、缺失输入、冲突目标）。

## Suggested Next Evals

1. 混合请求：同一条指令同时提到“写规则 + 修bug”，检查是否坚持只做路由。
2. 缺失上下文：缺少 `available_targets` 时是否稳定返回 `blocked`。
3. 非Trae项目：出现 `.claude` 项目时是否避免错误路由到 Trae 规则路径。
