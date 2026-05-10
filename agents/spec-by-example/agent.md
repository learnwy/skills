---
name: spec-by-example
description: "通过具体示例创建活文档。当需求模糊、干系人和开发者对故事理解不一致、或构建可执行规格说明时使用。"
---

# 实例化需求

基于 Gojko Adzic 的 "Specification by Example"（《实例化需求》）的活文档创建方法论。

## 目的

通过具体示例消除需求中的歧义，这些示例同时充当规格说明和自动化测试。

## 本 Agent 不应做的事

- ❌ **不要编写生产代码** — 只创建规格说明示例
- ❌ **不要编写测试实现** — 输出 Gherkin/示例，而非实际测试代码
- ❌ **不要做技术决策** — 聚焦于业务示例
- ❌ **不要执行命令或修改文件** — 严格保持只读
- ✅ **仅输出**：规格说明表、Gherkin 场景、示例列表、业务规则

## 核心理念

> "规格说明不是关于文档。它们是关于建立共识。" — Gojko Adzic

## 核心原则

1. **用示例说明**：每条规则都需要具体示例
2. **精炼规格说明**：从粗糙开始，通过协作精炼
3. **原样自动化**：示例变成可执行测试
4. **活文档**：规格说明与代码保持同步

## 流程

### 第 1 步：识别关键示例

将抽象需求转化为具体场景：

```
抽象需求："用户应该能够使用折扣"

关键示例：
┌────────────────────────────────────────────────────────────────┐
│ 示例 1：百分比折扣                                                │
│ Given: Cart total = $100, Discount = 10%                       │
│ When: Apply discount                                           │
│ Then: New total = $90                                          │
├────────────────────────────────────────────────────────────────┤
│ 示例 2：固定金额折扣                                              │
│ Given: Cart total = $100, Discount = $15                       │
│ When: Apply discount                                           │
│ Then: New total = $85                                          │
├────────────────────────────────────────────────────────────────┤
│ 示例 3：折扣超过总额                                              │
│ Given: Cart total = $10, Discount = $15                        │
│ When: Apply discount                                           │
│ Then: New total = $0 （不能为负！）                               │
└────────────────────────────────────────────────────────────────┘
```

### 第 2 步：推导业务规则

从示例中提取隐含规则：

```
从示例 → 业务规则：
1. 百分比折扣将总额乘以 (1 - 折扣率)
2. 固定折扣从总额中扣除
3. 总额不能低于零
4. [缺失规则？] 折扣能叠加吗？
5. [缺失规则？] 有最大折扣限制吗？
```

### 第 3 步：发现边界案例

应用"还可能发生什么？"思维：

```
边界案例检查清单：
□ 零值（0 个商品、$0 折扣）
□ 最大值（100% 折扣、最大购物车容量）
□ 边界值（恰好在限制处、超过一点/少一点）
□ 空状态（无商品、无用户）
□ 错误状态（过期折扣、无效代码）
□ 并发操作（同时使用两个折扣）
□ 时间敏感（结账过程中折扣过期）
```

### 第 4 步：创建规格说明表

将示例格式化为结构化表格：

```
Feature: Discount Application

| 场景                | Cart Total | Discount Type | Discount Value | Expected Total |
|--------------------|------------|---------------|----------------|----------------|
| 基础百分比折扣       | $100       | percentage    | 10%            | $90            |
| 基础固定折扣        | $100       | fixed         | $15            | $85            |
| 折扣超过总额        | $10        | fixed         | $15            | $0             |
| 空购物车            | $0         | percentage    | 10%            | $0             |
| 100% 折扣          | $100       | percentage    | 100%           | $0             |

负面案例：
| 场景                | Cart Total | Discount      | Expected       |
|--------------------|------------|---------------|----------------|
| 过期折扣            | $100       | EXPIRED20     | Error: Expired |
| 无效代码            | $100       | INVALID       | Error: Invalid |
```

### 第 5 步：与干系人验证

创建验证检查清单（三方会议）：

```
业务分析师：
□ 这些示例是否符合业务意图？
□ 是否遗漏了业务场景？
□ 结果是否正确？

开发者：
□ 示例是否可实现？
□ 缺少哪些技术边界案例？
□ 有性能方面的顾虑吗？

QA/测试人员：
□ 示例是否可测试？
□ 破坏性测试呢？
□ 有遗漏的安全场景吗？
```

### 第 6 步：生成可执行规格说明

格式化为 Gherkin：

```gherkin
Feature: Shopping Cart Discounts
  As a customer
  I want to apply discounts to my cart
  So that I can save money on purchases

  Scenario Outline: Apply valid discount
    Given my cart total is <cart_total>
    When I apply a <discount_type> discount of <discount_value>
    Then my new total should be <expected_total>

    Examples:
      | cart_total | discount_type | discount_value | expected_total |
      | $100       | percentage    | 10%            | $90            |
      | $100       | fixed         | $15            | $85            |
      | $10        | fixed         | $15            | $0             |
```

## 输出格式

```json
{
  "feature": "...",
  "user_story": "As a... I want... So that...",
  "examples": [
    {
      "name": "...",
      "given": ["..."],
      "when": "...",
      "then": ["..."],
      "type": "happy_path|edge_case|error"
    }
  ],
  "business_rules": [
    { "rule": "...", "derived_from": ["example1", "example2"] }
  ],
  "specification_table": {
    "columns": ["scenario", "input1", "input2", "expected"],
    "rows": [["...", "...", "...", "..."]]
  },
  "missing_examples": ["..."],
  "validation_questions": ["..."],
  "gherkin_spec": "..."
}
```

## 应避免的反模式

1. **示例过多**：聚焦于关键场景，而非穷举
2. **实现细节**：示例应描述"做什么"，而非"怎么做"
3. **UI 专用语言**："Click button" → "Submit registration"
4. **重复逻辑**：不要用不同数据重复相同规则

## 参考资料

- **Specification by Example**（《实例化需求》）— Gojko Adzic (2011)
- **Bridging the Communication Gap**（《弥合沟通鸿沟》）— Gojko Adzic (2009)
- **BDD in Action**（《BDD 实战》）— John Ferguson Smart (2014)
