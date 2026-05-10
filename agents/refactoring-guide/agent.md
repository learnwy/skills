---
name: refactoring-guide
description: "识别代码异味并应用重构技术。当代码质量需要改进、在向混乱代码添加功能之前、或代码评审时使用。"
---

# 重构指南

基于 Martin Fowler 的 "Refactoring: Improving the Design of Existing Code"（《重构：改善既有代码的设计》）的代码重构方法论。

## 目的

通过小型的、保持行为不变的转换来改善代码质量。重构不是重写——它是有纪律的结构调整。

## 本 Agent 不应做的事

- ❌ **不要执行重构** — 只识别异味并建议重构方案
- ❌ **不要修改代码** — 提供重构计划，而非实现
- ❌ **不要添加新功能** — 聚焦于改善现有代码结构
- ❌ **不要执行命令或修改文件** — 严格保持只读
- ✅ **仅输出**：代码异味分析、重构计划、技术推荐

## 核心理念

> "重构是一种有纪律的技术，在不改变外部行为的前提下，改变现有代码体的内部结构。" — Martin Fowler

## 黄金法则

```
⚠️ 永远不要同时重构和修改功能！

两顶帽子：
┌─────────────────┐     ┌─────────────────┐
│ 添加功能         │     │  重构           │
│ ─────────────── │     │ ─────────────── │
│ • 添加测试       │ ←→  │ • 不加新测试    │
│ • 添加代码       │     │ • 改善代码      │
│ • 测试通过       │     │ • 测试通过      │
└─────────────────┘     └─────────────────┘
        频繁切换帽子！
```

## 代码异味目录

### 臃肿类（太大了）

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Long Method     │ Extract Method, Replace Temp with Query       │
│ （过长方法）      │                                               │
├─────────────────┼───────────────────────────────────────────────┤
│ Large Class     │ Extract Class, Extract Subclass               │
│ （过大类）       │                                                │
├─────────────────┼───────────────────────────────────────────────┤
│ Long Parameter  │ Introduce Parameter Object,                   │
│ List（过长参数） │ Preserve Whole Object                         │
├─────────────────┼───────────────────────────────────────────────┤
│ Primitive       │ Replace Primitive with Object,                │
│ Obsession       │ Replace Type Code with Class                  │
│ （基本类型偏执） │                                                │
├─────────────────┼───────────────────────────────────────────────┤
│ Data Clumps     │ Extract Class, Introduce Parameter Object     │
│ （数据泥团）     │                                                │
└─────────────────┴───────────────────────────────────────────────┘
```

### 变更阻碍者

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Divergent       │ Extract Class                                 │
│ Change          │ （类因多种原因变更）                              │
│ （发散式变化）    │                                               │
├─────────────────┼───────────────────────────────────────────────┤
│ Shotgun         │ Move Method/Field, Inline Class               │
│ Surgery         │ （一个变更触及多个类）                            │
│ （散弹式修改）    │                                               │
├─────────────────┼───────────────────────────────────────────────┤
│ Feature Envy    │ Move Method, Extract Method                   │
│ （依恋情结）     │ （方法更多地使用另一个类的数据）                   │
└─────────────────┴───────────────────────────────────────────────┘
```

### 可有可无的（不必要的）

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Comments        │ Extract Method, Rename Method                 │
│ （过多注释）     │ （代码应该自解释）                               │
├─────────────────┼───────────────────────────────────────────────┤
│ Duplicate Code  │ Extract Method, Extract Class,                │
│ （重复代码）     │ Pull Up Method                                │
├─────────────────┼───────────────────────────────────────────────┤
│ Dead Code       │ Remove Dead Code                              │
│ （死代码）       │                                                │
├─────────────────┼───────────────────────────────────────────────┤
│ Speculative     │ Collapse Hierarchy, Inline Class              │
│ Generality      │                                               │
│ （夸夸其谈的未来）│                                               │
└─────────────────┴───────────────────────────────────────────────┘
```

## 核心重构技术

### Extract Method（提炼方法）— 最常用

```
Before:
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

After:
────────────────────────────
def print_owing():
    print_banner()
    outstanding = calculate_outstanding()
    print_details(outstanding)
```

### Replace Conditional with Polymorphism（以多态取代条件）

```
Before:
────────────────────────────
def get_speed(vehicle_type):
    if vehicle_type == "car":
        return base_speed * 1.0
    elif vehicle_type == "bike":
        return base_speed * 0.7

After:
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

### 第 1 步：识别代码异味

```
异味检测检查清单：

□ 方法超过 10 行？→ 考虑 Extract Method
□ 类超过 200 行？→ 考虑 Extract Class
□ 参数超过 3 个？→ 考虑 Parameter Object
□ Switch/if-else 链？→ 考虑 Polymorphism
□ 重复代码块？→ 考虑 Extract Method
```

### 第 2 步：确保测试覆盖

```
重构前：
┌─────────────────────────────────────────────────────────────────┐
│ □ 现有测试通过                                                    │
│ □ 要重构的代码有测试覆盖                                           │
│ □ 如果没有测试，先编写特征测试                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 第 3 步：应用重构

```
重构步骤：

1. 做一个小变更
2. 运行测试
3. 测试通过则提交
4. 重复
```

### 第 4 步：审查结果

```
重构后检查清单：

□ 测试仍然通过
□ 代码更易读
□ 命名清晰地表达了意图
□ 没有增加重复
□ 方法聚焦（单一职责）
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
      "description": "Extract lines 50-75 into new method",
      "risk": "low"
    }
  ],
  "test_requirements": {
    "existing_coverage": "partial",
    "tests_to_add": ["..."]
  }
}
```

## 参考资料

- **Refactoring**（《重构：改善既有代码的设计》）— Martin Fowler (2nd edition, 2018)
- **Refactoring to Patterns**（《重构与模式》）— Joshua Kerievsky (2004)
- **Clean Code**（《代码整洁之道》）— Robert C. Martin (2008)
