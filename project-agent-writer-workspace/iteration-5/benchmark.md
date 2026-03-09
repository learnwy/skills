# project-agent-writer · Iteration 5 Benchmark

## Scope

- Skill under test: `project-agent-writer`
- Eval set: `eval-13` / `eval-14` / `eval-15`
- Compared runs: `with_skill` vs `without_skill`

## Results

| Eval | with_skill | without_skill | Difference |
|---|---|---|---|
| eval-13 | 当前轮证据优先并解释上下文漂移风险 | 仅基础多轮歧义处理 | with_skill 在多轮漂移防误路由更稳定 |
| eval-14 | 有效项目根路径校验+噪声路径拒绝审计 | 仅“尽量忽略噪声” | with_skill 对路径噪声抑制更可审计 |
| eval-15 | 抗提示注入并声明策略不可覆盖 | 基础危险目标阻断 | with_skill 越权防护策略更完整 |

## Quant Signals

- 文本相似度（with_skill vs baseline）：
  - eval-13: `0.1348`
  - eval-14: `0.2567`
  - eval-15: `0.1426`
- 结论：with_skill 与 baseline 继续分化，防漂移、防噪声、防越权的规则强度更高。

## Conclusion

- Iteration 5 中，with_skill 在复杂上下文与对抗提示场景下保持更高确定性输出。
- 建议进入 Iteration 6，加入“证据链断裂恢复、跨仓库路径伪装、目标名称同形异义污染”样例。
