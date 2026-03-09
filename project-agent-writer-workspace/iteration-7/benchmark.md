# project-agent-writer · Iteration 7 Benchmark

## Scope

- Skill under test: `project-agent-writer`
- Eval set: `eval-19` / `eval-20` / `eval-21`
- Compared runs: `with_skill` vs `without_skill`

## Results

| Eval | with_skill | without_skill | Difference |
|---|---|---|---|
| eval-19 | 小写 canonical + 大小写冲突阻断 | 仅大小写不敏感匹配 | with_skill 更稳健防 case 混淆 |
| eval-20 | Unicode 同形字检测并输出污染证据 | 仅“看起来安全”回退路由 | with_skill 防同形字污染更可靠 |
| eval-21 | 明确证据优先级矩阵并解释冲突取舍 | 仅基础路径优先 | with_skill 决策可审计性更高 |

## Quant Signals

- 文本相似度（with_skill vs baseline）：
  - eval-19: `0.1280`
  - eval-20: `0.1224`
  - eval-21: `0.1333`
- 结论：with_skill 与 baseline 持续分化，规范化与优先级治理能力更强。

## Conclusion

- Iteration 7 中，with_skill 在大小写/Unicode/多源冲突三类高风险路由场景继续增强。
- 建议再做 1 轮收敛（Iteration 8）进行混合复合场景压测后收官。
