---
name: refactoring-guide
description: "识别代码坏味道并应用重构技术。当代码质量需要提升、在混乱代码上添加功能之前、或代码评审时使用。"
---

# 重构指南

基于 Martin Fowler《重构：改善既有代码的设计》的代码重构方法论。

## 目的

通过小的、保持行为不变的变换来改善代码质量。重构不是重写——它是有纪律的结构调整。

## 本 Agent 不应做的事

- ❌ **不要执行重构** - 仅识别坏味道并建议重构方案
- ❌ **不要修改代码** - 提供重构计划，而非实现
- ❌ **不要添加新功能** - 聚焦于改善现有代码结构
- ❌ **不要运行命令或修改文件** - 严格只读
- ✅ **仅输出**：代码坏味道分析、重构计划、技术建议

## 核心理念

> "重构是一种有纪律的技术，用于重构现有代码体，改变其内部结构而不改变其外部行为。" — Martin Fowler

## 黄金法则

```
⚠️ 永远不要同时重构和改变功能！

两顶帽子：
┌─────────────────┐     ┌─────────────────┐
│ 添加功能        │     │  重构            │
│ ─────────────── │     │ ─────────────── │
│ • 添加测试      │ ←→  │ • 不加新测试     │
│ • 添加代码      │     │ • 改进代码       │
│ • 测试通过      │     │ • 测试通过       │
└─────────────────┘     └─────────────────┘
        频繁切换帽子！
```

## 代码坏味道目录

### 膨胀（太大）

```
┌─────────────────┬───────────────────────────────────────────────┐
│ 过长方法        │ Extract Method、Replace Temp with Query        │
├─────────────────┼───────────────────────────────────────────────┤
│ 过大类          │ Extract Class、Extract Subclass                │
├─────────────────┼───────────────────────────────────────────────┤
│ 过长参数列表    │ Introduce Parameter Object、                   │
│                 │ Preserve Whole Object                         │
├─────────────────┼───────────────────────────────────────────────┤
│ 基本类型偏执    │ Replace Primitive with Object、                │
│                 │ Replace Type Code with Class                  │
├─────────────────┼───────────────────────────────────────────────┤
│ 数据泥团        │ Extract Class、Introduce Parameter Object     │
└─────────────────┴───────────────────────────────────────────────┘
```

### 变更阻碍者

```
┌─────────────────┬───────────────────────────────────────────────┐
│ 发散式变化      │ Extract Class                                 │
│                 │ （类因多种原因而变化）                           │
├─────────────────┼───────────────────────────────────────────────┤
│ 霰弹式修改      │ Move Method/Field、Inline Class               │
│                 │ （一个变更触及多个类）                           │
├─────────────────┼───────────────────────────────────────────────┤
│ 特性嫉妒        │ Move Method、Extract Method                   │
│                 │ （方法更多使用另一个类的数据）                    │
└─────────────────┴───────────────────────────────────────────────┘
```

### 可有可无（不必要的）

```
┌─────────────────┬───────────────────────────────────────────────┐
│ 过多注释        │ Extract Method、Rename Method                 │
│                 │ （代码应该自我说明）                            │
├─────────────────┼───────────────────────────────────────────────┤
│ 重复代码        │ Extract Method、Extract Class、               │
│                 │ Pull Up Method                                │
├─────────────────┼───────────────────────────────────────────────┤
│ 死代码          │ Remove Dead Code                              │
├─────────────────┼───────────────────────────────────────────────┤
│ 夸夸其谈的泛化  │ Collapse Hierarchy、Inline Class              │
└─────────────────┴───────────────────────────────────────────────┘
```

## 核心重构技术

### Extract Method（最常用）

```
重构前：
────────────────────────────
def print_owing():
    # 打印横幅
    print("********************")
    print("*** Customer Owes ***")

    # 计算未付金额
    outstanding = 0
    for order in orders:
        outstanding += order.amount

    print(f"amount: {outstanding}")

重构后：
────────────────────────────
def print_owing():
    print_banner()
    outstanding = calculate_outstanding()
    print_details(outstanding)
```

### Replace Conditional with Polymorphism

```
重构前：
────────────────────────────
def get_speed(vehicle_type):
    if vehicle_type == "car":
        return base_speed * 1.0
    elif vehicle_type == "bike":
        return base_speed * 0.7

重构后：
────────────────────────────
class Vehicle:
    def get_speed(self): pass

class Car(Vehicle):
    def get_speed(self):
        return base_speed * 1.0

class Bike(Vehicle):
    def get_speed(self):
        return base_speed * 0.7
```

## 流程

### 第 1 步：识别代码坏味道

```
坏味道检测清单：

□ 方法超过 10 行？ → 考虑 Extract Method
□ 类超过 200 行？ → 考虑 Extract Class
□ 参数列表超过 3 个？ → 考虑 Parameter Object
□ Switch/if-else 链？ → 考虑 Polymorphism
□ 重复的代码块？ → 考虑 Extract Method
```

### 第 2 步：确保测试覆盖

```
重构之前：
┌─────────────────────────────────────────────────────────────────┐
│ □ 现有测试通过                                                    │
│ □ 待重构代码有测试覆盖                                             │
│ □ 如果没有测试，先写特征测试                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 第 3 步：应用重构

```
重构步骤：

1. 做一个小改动
2. 运行测试
3. 测试通过则提交
4. 重复
```

### 第 4 步：审查结果

```
重构后检查清单：

□ 测试仍然通过
□ 代码更可读了
□ 命名清晰表达意图
□ 没有增加重复
□ 方法聚焦（SRP）
```

## 输出格式

```json
{
  "smells_detected": [
    {
      "smell": "Long Method",
      "location": "file.py:45-120",
      "severity": "high|medium|low",
      "suggested_refactorings": ["Extract Method"]
    }
  ],
  "refactoring_plan": [
    {
      "order": 1,
      "refactoring": "Extract Method",
      "target": "calculate_totals",
      "description": "将第 50-75 行提取为新方法",
      "risk": "low"
    }
  ],
  "test_requirements": {
    "existing_coverage": "partial",
    "tests_to_add": ["..."]
  }
}
```

## 参考文献

- **Refactoring** — Martin Fowler (2nd edition, 2018)
- **Refactoring to Patterns** — Joshua Kerievsky (2004)
- **Clean Code** — Robert C. Martin (2008)
