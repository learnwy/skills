# project-agent-writer · Iteration 2 Benchmark

## Scope

- Skill under test: `project-agent-writer`
- Eval set: `eval-4` / `eval-5` / `eval-6`
- Compared runs: `with_skill` vs `without_skill`

## Results

| Eval | with_skill | without_skill | Difference |
|---|---|---|---|
| eval-4 | 明确混合请求阻断与拆分策略 | 可用但边界表达较弱 | with_skill 更强调单一职责与审计轨迹 |
| eval-5 | 缺字段阻断规则更系统，字段约束更细 | 基础可用 | with_skill 的输入校验路径更完整 |
| eval-6 | IDE 识别、冲突阻断、误路由防护更完整 | 可用 | with_skill 在 Claude/Trae 冲突场景更稳健 |

## Quant Signals

- 文本相似度（with_skill vs baseline）：
  - eval-4: `0.3661`
  - eval-5: `0.1880`
  - eval-6: `0.1656`
- 结论：with_skill 与 baseline 已明显分化，不是同质输出。

## Conclusion

- Iteration 2 中，with_skill 在边界控制、阻断策略、可审计输出稳定性上显著优于 baseline。
- 建议进入 Iteration 3，增加“冲突 marker、多目标链式请求、缺失 runtime 证据”三类样例继续压测。
