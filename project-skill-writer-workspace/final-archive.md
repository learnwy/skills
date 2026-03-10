# project-skill-writer 长任务收档报告

## 1. 范围
- 目标：对 `project-skill-writer` 执行“测试 -> 评估 -> 改进 -> 回归”闭环。
- 代码范围：`skills/project-skill-writer/` 与 `project-skill-writer-workspace/`。

## 2. 评测设计
- 新增评测集：`skills/project-skill-writer/evals/evals.json`，覆盖 3 类风险场景。
- 首轮产物：`iteration-1`，每个 eval 都包含 `with_skill` 与 `baseline` 双跑。
- 打分机制：脚本化断言评估，输出 `grading.json`、`benchmark.json`、`benchmark.md`。

## 3. 首轮结果
- Iteration 1：
  - with_skill：8/9（88.9%）
  - baseline：7/9（77.8%）
- 暴露问题：路径证据表达不稳定，混合请求边界策略缺少强制输出契约。

## 4. 改进动作
- 将 `project-skill-writer` 升级到 `v2.1`。
- 新增固定门禁链路：`scope -> evidence -> scaffold -> quality -> delivery`。
- 新增边界策略：绝对路径与全局路径先阻断后生成。
- 新增输出契约：`Scope Decision / Path Evidence / Deliverables / Quality Report` 四段强制输出。
- 修正示例路径：`examples/workflow-skill.md` 从 `~/.trae/skills/...` 改为 `skills/...`。

## 5. 回归结果
- Iteration 2（重点回归 eval-1 与 eval-2）：
  - with_skill_v2_1：6/6（100%）
  - baseline_v2_0：4/6（66.7%）
- 结论：v2.1 在路径证据门禁和混合请求边界上显著优于 v2.0。

## 6. 交付清单
- `skills/project-skill-writer/SKILL.md`（v2.1）
- `skills/project-skill-writer/evals/evals.json`
- `skills/project-skill-writer/examples/workflow-skill.md`
- `project-skill-writer-workspace/iteration-1/*`
- `project-skill-writer-workspace/iteration-2/*`

## 7. 后续建议
- 增加 eval-4~eval-6：跨 IDE 同名技能冲突、Unicode 同形字路径污染、反向提示越权写入。
- 将质量报告字段标准化为固定 JSON schema，便于长期趋势统计。
