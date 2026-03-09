# project-agent-writer · Iteration 6 Benchmark

## Scope

- Skill under test: `project-agent-writer`
- Eval set: `eval-16` / `eval-17` / `eval-18`
- Compared runs: `with_skill` vs `without_skill`

## Results

| Eval | with_skill | without_skill | Difference |
|---|---|---|---|
| eval-16 | 分阶段恢复证据链并输出恢复状态 | 仅基础缺失阻断 | with_skill 对断链恢复更可观测 |
| eval-17 | 严格仓库边界校验并阻断外部路径注入 | 偏向忽略外部路径继续路由 | with_skill 跨仓库伪装防护更强 |
| eval-18 | 精确规范化匹配并拒绝同形异义变体 | 允许“closest”回退策略 | with_skill 误路由风险更低 |

## Quant Signals

- 文本相似度（with_skill vs baseline）：
  - eval-16: `0.0904`
  - eval-17: `0.2713`
  - eval-18: `0.1252`
- 结论：with_skill 与 baseline 持续分化，尤其在边界校验与精确匹配策略上更稳定。

## Conclusion

- Iteration 6 中，with_skill 在证据链恢复、跨仓库边界、同形异义目标治理方面继续增强。
- 建议进入 Iteration 7，加入“大小写混淆、Unicode 同形字、多源证据优先级反转”样例。
