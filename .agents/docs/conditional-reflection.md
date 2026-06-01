# Conditional Reflection in Agent Skills

> 把 Pavlovian 条件反射的工程化范式映射到 AI Agent / Skill 设计：
> **明确刺激 → 确定响应**，不依赖模型每次现场推理；可靠性来自前置设计，而非运行时判断。

## 1. 概念框架

经典条件反射的四要素 → Skill 工程化对应：

| 经典要素 | 工程化映射 |
|---|---|
| 无条件刺激（食物） | 业务终态（用户得到正确结果） |
| 条件刺激（铃声） | Trigger：hook 事件 / 关键词 / 文件模式 / 命令前缀 |
| 反射弧（神经通路） | Hook 脚本 / Skill 描述里的 trigger 段 / Slash 命令绑定 |
| 强化与消退 | trends/usage 日志 → 周期性回顾 → 调整触发条件 |

**核心判据**：只要满足条件 X，行为 Y 必然发生，且 Y 的形态可预测。
凡是"模型每次现场判断要不要做、怎么做"的，都不是条件反射，而是审议（deliberation）。

## 2. 三级反射强度模型

本仓库 15 个 skills 大致落在三档：

### Tier 1 — 硬反射（Hard Reflex）
**100% 确定性，无 LLM 介入**。事件直接进脚本，输出注入对话上下文。

| Skill | 触发器 | 反射弧 |
|---|---|---|
| `learnwy-dispatch` | UserPromptSubmit / Stop / SessionStart hook | 单进程聚合调度 3 类 hook |
| `prompt-optimizer`（hook 部分） | UserPromptSubmit + 检测到提示词模式 | 注入 7 维度评分提示 |
| `llm-wiki`（hook 部分） | UserPromptSubmit + 关键词扫描命中 | 注入相关 wiki topic 列表 |
| `prompt-optimizer`（hook 部分） | UserPromptSubmit + 检测到提示词模式 | 注入 7 维度评分提示 |
| `knowledge-consolidation`（Stop hook） | Stop + 模式匹配（"figured it out" 等） | 注入 nudge 提示用户保存 |
| `learnwy-status`（SessionStart） | 每周首次 session | 注入跨子系统摘要 |

### Tier 2 — 软反射（Soft Reflex）
**LLM 做模式匹配但不做价值判断**。SKILL.md 的 `description` 里写明 trigger 词，模型见到就调用，不思考"该不该用"。

| Skill | 触发词样例 |
|---|---|
| `on-contradiction` | "矛盾分析"、"主要矛盾"、"trade-off analysis" |
| `on-practice` | "实事求是"、"实践论"、"verify through practice" |
| `on-protracted-war` | "持久战"、"分阶段策略"、"underdog strategy" |
| `requirement-workflow` | "develop feature"、"build feature"、"开发功能" |
| `project-skill-writer` | "创建技能"、"编写技能"、"设计技能" |
| `project-agent-writer` | "create agent"、"build an agent" |
| `project-skill-installer` | "install skill"、"add skill" |
| `prompt-optimizer`（主动模式） | "优化提示词"、"分析 prompt"、"review this prompt" |
| `llm-wiki`（主动模式） | "知识库"、"个人 wiki"、"收录这个" |

### Tier 3 — 条件认知（Conditioned Cognition）
**反射触发后，进入一套受约束的推理流程**。Skill 提供工作流模板/agent 编排，LLM 在框内推理，但仍需判断。

| Skill | 反射后的认知约束 |
|---|---|
| `requirement-workflow` | spec.md → tasks.md → 实现 → 验证 的 SDD 生命周期 |
| `software-methodology-toolkit` | 10 个方法论 agent 的兜底分诊 |
| `on-contradiction` / `on-practice` / `on-protracted-war` | 各自的 decision-maker / problem-analyzer / report-writer agent 三角 |
| `llm-wiki`（ingestor / querier 等） | 摘要 → 交叉引用 → 入库的固定流水线 |

---

## 3. 各级反射的最佳实践

### 3.1 Tier 1（Hard Reflex）

**何时用**：行为完全可枚举、不需要语言理解、需要绝对可靠（每次都触发、永不漏）。

**设计要点**：
1. **触发条件用代码判定，不靠模型**。例如英文检测用 `englishCharRatio > 0.7`，不要让模型"判断这是不是英文"。
2. **副作用最小化**：hook 只注入文本/系统提示，不直接改文件。改文件留给后续 LLM 调用工具。
3. **失败静默（fail-soft）**：一个 scanner 抛错不能影响其他 scanner，更不能阻塞用户的 prompt。本仓库 `learnwy-dispatch` 已用 try/catch 隔离每个子扫描。
4. **冷启动延迟 < 200ms**：hook 在每次 prompt 都跑，慢就是事故。本仓库用 `rslib` 把 TS 打包成单文件 CJS，避免 require 树展开。
5. **可观测**：所有 hook 输出都进日志（`~/.learnwy/.../logs/`），便于事后统计触发频次和误报率。
6. **去重 / 限频**：同一会话内同一提示不重复注入；周期性提示（如每周摘要）用 ISO 周作为去重键。

**反例**：
- ❌ 在 hook 里做网络请求（高延迟、低可靠）
- ❌ hook 里直接 `console.log` 大段调试（污染上下文）
- ❌ 用 `setTimeout` / `setInterval` 实现"周期性"——hook 是无状态的，应靠落盘时间戳判断

### 3.2 Tier 2（Soft Reflex）

**何时用**：触发条件需要少量语义理解（关键词/意图），但响应路径相对固定。

**SKILL.md `description` 的反射工程化写法**：

```yaml
description: "<一句话核心能力>。Triggers: '<触发词1>'、'<触发词2>'、'<英文同义>'、'<反例排除条件>'。Do not use for: '<边界1>'、'<边界2>'。"
```

四要素：
1. **核心能力一句话**：让模型 1 秒判断"这事跟我有关吗"。
2. **触发词列表**：中英双语都列；包含口语化变体（"帮我看看"≠"分析"）。
3. **边界排除（Do not use for）**：对抗"什么都想接"的过度泛化。本仓库 `knowledge-consolidation` 显式写了 "For global compounding knowledge, use llm-wiki instead"，避免和 wiki 抢活。
4. **同类技能互链**：让模型在分诊时知道"另一个更合适的我"。

**优秀示例**（来自本仓库 `prompt-optimizer`）：
> "Pre-flight analysis and scoring of user prompts across 7 dimensions. Triggers: any substantive prose prompt, '优化提示词', '分析 prompt', 'review this prompt'. Do not use for: casual chat, single-word queries."

**反例**：
- ❌ description 写成"通用助手，可处理各种问题"——0 触发力。
- ❌ 触发词只写英文，中文环境下命中率骤降。
- ❌ 把"实现细节"写进 description（应放 SKILL.md body），消耗模型的注意力预算。

### 3.3 Tier 3（Conditioned Cognition）

**何时用**：触发后需要多步推理，但推理路径要可复制、可审计。

**设计要点**：
1. **流程显式化**：把推理路径写成有限状态机（如 `requirement-workflow` 的 INIT → IMPLEMENTING → TESTING → DONE）。
2. **检查点 / 验证门**：每一步结束前要求显式确认（写 spec、跑测试、读 diff），防止 LLM "感觉差不多了就跳步"。
3. **agent 角色分离**：把"分析者 / 决策者 / 落笔者"分开（参考三本毛选 skill 的 decision-maker / problem-analyzer / report-writer 三角），各 agent 用各自的提示词范式，避免一个 prompt 既要分析又要总结又要决策。
4. **回路（feedback loop）**：执行结果写回日志/index，下次同类问题能引用上次的产出。本仓库 `llm-wiki` 的 `health.json`、`prompt-optimizer` 的 trends 都是这种回路。

---

## 4. 提示词设计的反射化最佳实践

把"提示词"当成反射弧的中段：上游是 trigger，下游是工具调用 + 文本输出。

### 4.1 通用原则
| 原则 | 落地手法 |
|---|---|
| **结构 > 自由文本** | 用表格 / 列表 / YAML 替代散文。模型对结构化输入的"反射"更快更准。 |
| **正例 + 反例配对** | 只给正例容易过拟合；只给反例容易混淆。本仓库多个 SKILL.md 用 "✅ Use for / ❌ Do not use for" 配对。 |
| **触发词单调化** | 同一触发词只对应一个 skill。出现交叉时显式互斥（如 KC vs llm-wiki 的边界声明）。 |
| **响应模板固化** | 输出格式用模板锚定（如 prompt-optimizer 的 "7 维度评分表"），不让模型每次重设计版式。 |
| **副作用前置声明** | "本 skill 会写文件到 X / 调用 Y API"。让模型/用户预知反射的"冲量"。 |

### 4.2 反射 vs 审议的边界标记

明确告诉模型："这一步是反射（无脑做），那一步要审议（停下来想）"。

```markdown
## 反射段（Reflex）
1. 拿到 X → 调用 tool A → 拿结果。**不要** 在此阶段提问。

## 审议段（Deliberation）
2. 看到 A 的结果后，**停下来** 判断 X 属于哪一类（Y / Z）。
3. 根据分类，分别走不同分支。
```

本仓库 `requirement-workflow` 的 INIT → IMPLEMENTING 的过渡就是这种边界。

### 4.3 钝化与脱敏

强反射的副作用是"过敏"：什么都触发。设计时主动加抑制条件：

- `prompt-optimizer` 的 hook 写了 "Skip silently if input is casual chat or a single-word query"——避免每条消息都被打断。
- `llm-wiki` 的 prompt-scan 用 1913 个关键词索引而非全文 grep，控制误报。
- `prompt-optimizer` 显式列出 "不触发条件"（用户在闲聊、单词查询等场景）。

---

## 5. 强模型 vs 轻量模型的反射适配

| 维度 | 大模型（Opus / GPT-4 级） | 轻量模型（Haiku / 小模型 / 端侧） |
|---|---|---|
| **触发判定能力** | 能从模糊触发词推断意图（"帮我搞一下这个" → 大概率是开发任务） | 必须用显式关键词、命令前缀、或 hook 强制触发 |
| **反射范围** | 可以放宽 trigger 列表，靠模型推断兜底 | 必须把 trigger 列穷尽；遗漏即漏触发 |
| **响应模板严格度** | 模板可以是"框架级"（"包含一个表+一段总结"） | 模板要"字段级"（每列叫什么、什么数据类型） |
| **多技能分诊** | 能在 16 个 skill 中自主选最匹配 | 应通过 `find-skills` / `learnwy-dispatch` 预先把候选缩到 ≤3 个 |
| **审议段（Tier 3）** | 可以把推理流程写成"目标 + 约束"，让模型自己规划 | 必须写成有限状态机/流程图，每步明确输入输出 |
| **错误恢复** | 能从异常输出自我纠错（"我刚才漏了一步，重新来"） | 错了就错了，必须前置兜底（hook 校验 / 模板补丁 / 二次调用大模型修） |
| **token 预算** | 可以塞长 SKILL.md（数千 tokens） | SKILL.md 应 < 500 tokens；细节挪到 references/ 按需加载 |
| **典型用法** | Tier 2 + Tier 3 为主，hook 做加速器 | Tier 1 为主，hook 承担大部分确定性逻辑，LLM 只做最后一公里 |

### 5.1 强模型的反射设计要诀
- **避免过度规约**：把 SKILL.md 写成枷锁会浪费大模型的判断力。给"原则 + 边界"，留推理空间。
- **trigger 可以宽松**：靠模型分诊，比靠 trigger 词穷举更可扩展。
- **审议段用"提问驱动"**：让模型自问"这一步还缺什么信息"再行动。

### 5.2 轻量模型的反射设计要诀
- **能 hook 不靠 prompt**：能在脚本里判定的（语言、文件类型、时间窗口）就别让模型判定。
- **多用 slash command + 显式参数**：`/lookup <word>` 比"查一下 break the ice 是什么意思"更可靠。
- **响应用模板字符串**：变量 + 固定句式拼接，比让模型自由生成更稳定。
- **大小模型分工**：trigger 与渲染由小模型/脚本处理，关键的 Tier 3 推理段（如方法论分析）切到大模型 API。本仓库的 `learnwy-dispatch` 就是这个思路——hook 用 Node.js 跑，分析交给会话里的 LLM。

### 5.3 同一 skill 的双模型适配模式

```
[hook (Node.js)]  →  [小模型分诊]  →  [大模型推理]  →  [小模型/脚本渲染]
   Tier 1            Tier 2          Tier 3            Tier 1
```

每一段用最便宜能 work 的工具。不要让大模型干 hook 该干的活，也不要让小模型啃 Tier 3 推理。

---

## 6. 反模式（Anti-patterns）

| 反模式 | 症状 | 修复 |
|---|---|---|
| **过敏触发** | 任何 prompt 都打扰 | 加抑制条件、限频、ISO 周去重 |
| **沉默漏触发** | 应该触发却没触发 | 检查 description 触发词覆盖度；用 trends 日志统计漏报 |
| **审议段当反射** | 简单工具调用前要长篇思考 | 把流程写进 SKILL.md，让模型直接走分支 |
| **反射段当审议** | 该硬编码的逻辑用模型推理（如检测语言、判断文件类型） | 移到 hook 脚本 |
| **触发词重叠** | 多个 skill 抢同一意图，模型反复横跳 | 显式互斥声明 + 边界文档 |
| **脆弱的反射弧** | hook 报错 → 整个 prompt 被阻断 | try/catch 包每个 scanner，dispatcher 隔离 |
| **隐式反射** | hook 偷偷改文件 / 发请求，用户不知情 | 副作用前置声明；状态变更走 LLM 工具调用而非 hook |

---

## 7. 在本仓库新增 skill 时的反射化检查表

- [ ] 这个 skill 的触发器属于 Tier 1 / 2 / 3 中的哪档？
- [ ] 触发条件能用代码判定的部分是否都下沉到 hook？
- [ ] description 的触发词中英双语是否都覆盖？是否包含口语变体？
- [ ] 是否声明了 "Do not use for" / 与同类 skill 的边界？
- [ ] 响应是否有固定模板，避免模型每次重设计？
- [ ] 强 / 弱模型场景下，SKILL.md 是否分别可读（弱模型读 description + body，强模型可深入 references/）？
- [ ] 副作用是否前置声明？hook 是否 fail-soft？
- [ ] 是否有 trends/log 回路，便于事后调整触发条件？

---

## 参考

- 本仓库 `skills/learnwy-dispatch/` —— Tier 1 dispatcher 的工业化实现
- 本仓库 `skills/prompt-optimizer/SKILL.md` —— 双模式（hook + 主动）反射的最佳样板
- 本仓库 `skills/on-contradiction/` 等三本毛选 —— Tier 3 条件认知的 agent 三角
- [Agent Skills Specification](https://agentskills.io/specification) —— 描述字段的官方规范
