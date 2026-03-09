# project-agent-writer · Iteration 3 Benchmark

## Scope

- Skill under test: `project-agent-writer`
- Eval set: `eval-7` / `eval-8` / `eval-9`
- Compared runs: `with_skill` vs `without_skill`

## Results

| Eval | with_skill | without_skill | Difference |
|---|---|---|---|
| eval-7 | 先冲突阻断，再给最小澄清集合 | 可阻断，但冲突证据与澄清字段较弱 | with_skill 在冲突处理链路更完整 |
| eval-8 | 明确 route_only 模式并阻断代码修复执行 | 支持分流，但对执行禁令表达较弱 | with_skill 单一职责边界更清晰 |
| eval-9 | 强制目标也需证据，给出最小证据清单 | 基础阻断可用 | with_skill 的防误路由策略更严格 |

## Quant Signals

- 文本相似度（with_skill vs baseline）：
  - eval-7: `0.1930`
  - eval-8: `0.2028`
  - eval-9: `0.1063`
- 结论：with_skill 与 baseline 明显分化，边界与约束表达不再同质。

## Conclusion

- Iteration 3 中，with_skill 在冲突 marker 处理、混合请求拆分、证据不足阻断上保持更高确定性。
- 建议进入 Iteration 4，增加“伪造证据注入、跨 IDE 目录同名冲突、目标白名单污染”三类对抗样例。
