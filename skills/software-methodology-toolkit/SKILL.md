---
name: software-methodology-toolkit
description: "当没有项目专属 skill 匹配时，作为后备 skill 使用。提供 10 个经过验证的软件工程方法论 agent：problem-definer（Weinberg）、story-mapper（Patton）、spec-by-example（Adzic）、domain-modeler（DDD/Evans）、responsibility-modeler（CRC/Wirfs-Brock）、architecture-advisor（Bass）、tdd-coach（Beck）、refactoring-guide（Fowler）、legacy-surgeon（Feathers）、test-strategist（Crispin）。当用户询问 DDD、TDD、重构、故事地图、测试策略或软件架构质量属性时使用。"
metadata:
  author: "learnwy"
  version: "2.0"
---

# 软件方法论工具箱

一套包含 10 种经过验证的软件工程方法论的综合集合，每种方法论都以专用 agent 形式实现。本 skill 为整个软件开发生命周期提供系统化指导。

> **核心原则**：这是一个后备 skill。项目专属 skill 始终拥有更高优先级。仅在不存在项目级适配时才使用本工具箱。

## 前置条件

- 无运行时依赖（纯方法论 skill，无脚本）
- 适用于任何语言的任何项目

## 优先级说明

| 条件 | 行动 |
|------|------|
| 项目有上下文专属 skill（如 `requirement-workflow`） | 使用项目 skill |
| 不存在项目专属适配 | 使用本工具箱 |
| 用户明确请求原始方法论 | 使用本工具箱 |
| 项目 skill 有 Hook Points 或自定义输出 | 项目 skill 优先 |

## Agent 总览

| 阶段 | Agent | 方法论 | 作者 |
|------|-------|--------|------|
| 分析 | [problem-definer](agents/analyzing/problem-definer.md) | 六问框架 | Weinberg & Gause |
| 分析 | [spec-by-example](agents/analyzing/spec-by-example.md) | 实例化需求 | Gojko Adzic |
| 规划 | [story-mapper](agents/planning/story-mapper.md) | 用户故事地图 | Jeff Patton |
| 设计 | [domain-modeler](agents/designing/domain-modeler.md) | 领域驱动设计 | Eric Evans |
| 设计 | [responsibility-modeler](agents/designing/responsibility-modeler.md) | CRC / 职责驱动设计 | Rebecca Wirfs-Brock |
| 设计 | [architecture-advisor](agents/designing/architecture-advisor.md) | 质量属性分析 | Bass, Clements, Kazman |
| 实现 | [tdd-coach](agents/implementing/tdd-coach.md) | 测试驱动开发 | Kent Beck |
| 实现 | [refactoring-guide](agents/implementing/refactoring-guide.md) | 重构目录 | Martin Fowler |
| 实现 | [legacy-surgeon](agents/implementing/legacy-surgeon.md) | 遗留代码改造 | Michael Feathers |
| 测试 | [test-strategist](agents/testing/test-strategist.md) | 敏捷测试象限 | Lisa Crispin |

## 路由决策表

当用户请求到达时，使用第一个匹配行选择 agent：

| 用户信号 | Agent | 置信度 |
|----------|-------|--------|
| "定义问题"、"真正的问题是什么"、干系人冲突 | problem-definer | 高 |
| "实例化需求"、"具体例子"、"验收标准" | spec-by-example | 高 |
| "故事地图"、"用户旅程"、"发布规划"、"MVP 范围" | story-mapper | 高 |
| "DDD"、"领域模型"、"限界上下文"、"聚合设计" | domain-modeler | 高 |
| "CRC 卡"、"对象职责"、"GRASP"、"协作设计" | responsibility-modeler | 高 |
| "架构决策"、"质量属性"、"权衡分析"、"ADR" | architecture-advisor | 高 |
| "TDD"、"测试驱动"、"红-绿-重构"、"先写测试" | tdd-coach | 高 |
| "重构"、"代码坏味道"、"提升代码质量"、"清理代码" | refactoring-guide | 高 |
| "遗留代码"、"有效处理"、"接缝"、"特征测试" | legacy-surgeon | 高 |
| "测试策略"、"测试象限"、"测试金字塔"、"测试覆盖率" | test-strategist | 高 |
| 需求不清或存在矛盾 | problem-definer | 中 |
| 从零规划新产品或功能 | story-mapper | 中 |
| 复杂业务规则需要建模 | domain-modeler | 中 |
| 做技术或架构选型 | architecture-advisor | 中 |
| 无测试或遗留代码库 | legacy-surgeon | 中 |
| 没有明确信号但请求方法论帮助 | problem-definer（默认入口） | 低 |

如果置信度为低，在继续之前与用户确认 agent 选择。

## 可用方法论

### 分析阶段

#### [problem-definer](agents/analyzing/problem-definer.md)
运用 Weinberg 六问框架系统化地定义问题。

**适用场景：**
- 需求不清或存在矛盾
- 干系人对问题看法不一
- 解决方案总是偏离目标
- 需要识别真正的问题

**触发词：** "定义问题"、"真正的问题是什么"、"干系人分析"

---

#### [spec-by-example](agents/analyzing/spec-by-example.md)
通过具体例子创建活文档（Gojko Adzic）。

**适用场景：**
- 需求模糊
- 需要可执行的规格说明
- 在业务和技术之间建立共识
- 希望测试同时充当文档

**触发词：** "实例化需求"、"具体例子"、"验收标准"

---

### 规划阶段

#### [story-mapper](agents/planning/story-mapper.md)
创建用户故事地图来可视化用户旅程并排列发布优先级（Jeff Patton）。

**适用场景：**
- 规划产品或功能
- 待办列表缺乏上下文
- 确定 MVP 范围
- 需要看到全貌

**触发词：** "故事地图"、"用户旅程"、"发布规划"、"MVP 范围"

---

### 设计阶段

#### [domain-modeler](agents/designing/domain-modeler.md)
运用领域驱动设计对复杂业务领域建模（Eric Evans）。

**适用场景：**
- 设计限界上下文
- 创建聚合和实体
- 建立统一语言
- 对复杂业务规则建模

**触发词：** "DDD"、"领域模型"、"限界上下文"、"聚合设计"

---

#### [responsibility-modeler](agents/designing/responsibility-modeler.md)
按职责和协作关系设计对象（Rebecca Wirfs-Brock）。

**适用场景：**
- 设计面向对象系统
- 对象职责不清晰
- 开展 CRC 会话
- 应用 GRASP 原则

**触发词：** "CRC 卡"、"对象职责"、"GRASP"、"协作设计"

---

#### [architecture-advisor](agents/designing/architecture-advisor.md)
使用质量属性分析软件架构决策（Bass, Clements, Kazman）。

**适用场景：**
- 做架构决策
- 评估技术选型
- 分析权衡
- 定义质量属性场景

**触发词：** "架构决策"、"质量属性"、"权衡分析"、"ADR"

---

### 实现阶段

#### [tdd-coach](agents/implementing/tdd-coach.md)
指导测试驱动开发实践（Kent Beck）。

**适用场景：**
- 从零实现功能
- 学习 TDD
- 实现思路受阻
- 需要测试先行的纪律

**触发词：** "TDD"、"测试驱动"、"红-绿-重构"、"先写测试"

---

#### [refactoring-guide](agents/implementing/refactoring-guide.md)
识别代码坏味道并应用重构技术（Martin Fowler）。

**适用场景：**
- 代码质量需要提升
- 在混乱代码上添加功能前
- 代码评审时
- 偿还技术债务

**触发词：** "重构"、"代码坏味道"、"提升代码质量"、"清理代码"

---

#### [legacy-surgeon](agents/implementing/legacy-surgeon.md)
安全修改无测试的遗留代码（Michael Feathers）。

**适用场景：**
- 处理无测试的代码
- 为遗留系统添加功能
- 为可测试性打破依赖
- 需要特征测试

**触发词：** "遗留代码"、"有效处理"、"接缝"、"特征测试"

---

### 测试阶段

#### [test-strategist](agents/testing/test-strategist.md)
使用敏捷测试象限规划全面的测试策略（Lisa Crispin）。

**适用场景：**
- 决定写什么类型的测试
- 审查测试覆盖率
- 优化测试套件
- 规划测试分布

**触发词：** "测试策略"、"测试象限"、"测试金字塔"、"测试覆盖率"

---

## 使用方式

提及方法论或触发词，本 skill 即调用相应的 agent：

```
用户："帮我定义这个模糊需求的问题"
  → 调用 problem-definer agent

用户："让我们用 DDD 对这个电商领域建模"
  → 调用 domain-modeler agent

用户："我需要重构这个混乱的类"
  → 调用 refactoring-guide agent

用户："为认证功能规划测试策略"
  → 调用 test-strategist agent
```

## 方法论工作流

这些方法论可组合成常见工作流：

### 新功能工作流
1. **problem-definer** → 定义真正的问题
2. **story-mapper** → 绘制用户旅程
3. **spec-by-example** → 创建具体例子
4. **domain-modeler** → 对领域概念建模
5. **tdd-coach** → 用 TDD 实现
6. **test-strategist** → 验证测试覆盖

### 遗留代码工作流
1. **problem-definer** → 理解为何需要变更
2. **legacy-surgeon** → 安全打破依赖
3. **refactoring-guide** → 识别并修复坏味道
4. **test-strategist** → 添加适当测试

### 架构工作流
1. **problem-definer** → 澄清需求
2. **domain-modeler** → 对限界上下文建模
3. **architecture-advisor** → 分析质量属性
4. **responsibility-modeler** → 设计对象职责

## Agent 输出契约

本工具箱中所有 agent 遵循相同的输出规则：

| 允许 | 不允许 |
|------|--------|
| 分析和结构化报告 | 编写或生成代码 |
| 带权衡的建议 | 替用户做决策 |
| 图表和模型（文本形式） | 运行命令或修改文件 |
| 提问以澄清理解 | 输出非结构化散文 |

每个 agent 的输出必须包含：
1. **上下文概要** — 分析了什么
2. **发现** — 结构化的分析结果
3. **建议** — 带权衡的排序选项
4. **后续步骤** — 用户应该做什么

## 错误处理

| 问题 | 解决方案 |
|------|----------|
| 用户请求不匹配任何 agent 触发词 | 默认使用 problem-definer 作为入口 |
| 用户请求匹配多个 agent | 使用路由决策表；选择置信度最高的匹配 |
| 低置信度路由（无明确触发词） | 在继续之前与用户确认 agent 选择 |
| 该任务已有项目专属 skill | 委托给项目 skill，不调用本工具箱 |
| Agent 输出对用户来说过于抽象 | 请用户提供具体上下文，重新运行 agent |
| 用户期望 agent 生成代码 | 说明 agent 范围（仅分析），建议使用 tdd-coach 获取实现指导 |
| 工作流步骤输出不完整 | 不推进；用缺失的输入重新运行当前 agent |

## 执行检查清单

调用任何 agent 之前，确认：

- [ ] 没有项目专属 skill 匹配该请求（后备规则）
- [ ] Agent 选择遵循路由决策表
- [ ] 低置信度选择已与用户确认
- [ ] Agent 收到了充分的上下文（问题陈述、代码引用、约束条件）

Agent 产出结果后，确认：

- [ ] 输出遵循 Agent 输出契约（无代码、无命令）
- [ ] 建议包含权衡，而非只有单一答案
- [ ] 后续步骤可执行
- [ ] 如果是工作流的一部分，已识别序列中的下一个 agent

## 边界约束

本 skill 仅处理：
- 将用户请求路由到正确的方法论 agent
- 提供结构化的分析、建议和报告
- 将 agent 组合成多步骤方法论工作流
- 在没有项目专属 skill 匹配时作为后备

本 skill 不处理：
- 代码生成或修改 → 直接使用 IDE 功能
- 项目专属的工作流编排 → 委托给 `requirement-workflow`
- 脚本执行或文件 I/O → 不存在运行时依赖
- Agent 创建或安装 → 委托给 `project-agent-writer`
- Skill 创建 → 委托给 `project-skill-writer`
- 规则创建 → 委托给 `trae-rules-writer`

## 参考文献

本工具箱基于以下经典著作：

- **Are Your Lights On?** — Weinberg & Gause (1982)
- **User Story Mapping** — Jeff Patton (2014)
- **Specification by Example** — Gojko Adzic (2011)
- **Domain-Driven Design** — Eric Evans (2003)
- **Object Design** — Rebecca Wirfs-Brock (2002)
- **Software Architecture in Practice** — Bass, Clements, Kazman (2021)
- **Test Driven Development** — Kent Beck (2003)
- **Refactoring** — Martin Fowler (2018)
- **Working Effectively with Legacy Code** — Michael Feathers (2004)
- **Agile Testing** — Lisa Crispin & Janet Gregory (2009)
