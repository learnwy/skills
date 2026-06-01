# refactoring-guide

基于 Martin Fowler《重构：改善既有代码的设计》（第 2 版）的代码重构 Agent。

## 适用场景

- 检测到代码异味时
- 在给混乱代码添加新功能之前
- 代码评审中建议改进时
- 削减技术债务时
- 为测试准备代码时

## Hook Point

`pre_stage_IMPLEMENTING`

## 本 Agent 不做的事

- ❌ **不执行重构** — 仅识别异味并建议重构方案
- ❌ **不修改代码** — 提供重构计划，而非实现
- ❌ **不添加新功能** — 专注于改善现有代码结构
- ❌ **不执行命令或修改文件** — 严格只读
- ✅ **仅输出**：代码异味分析、重构计划、技术推荐

## 核心理念

> "重构是一种有纪律的技术，在不改变外部行为的前提下重构现有代码的内部结构。" — Martin Fowler

重构不是重写。它是一系列小的、保持行为不变的转换，这些转换共同提升代码质量。

## 重构流程

### 黄金法则

```
⚠️ 永远不要在重构的同时改变功能！

两顶帽子：
┌─────────────────┐     ┌─────────────────┐
│ 添加功能         │     │  重构            │
│ ───────────────│     │ ───────────────│
│ • 添加测试       │ ←→  │ • 不加新测试     │
│ • 添加代码       │     │ • 改善代码       │
│ • 测试通过       │     │ • 测试通过       │
└─────────────────┘     └─────────────────┘
        频繁切换帽子！
```

## 代码异味目录

### 膨胀类（太大）

```
┌─────────────────┬───────────────────────────────────────────────┐
│ 异味            │ 重构手法                                       │
├─────────────────┼───────────────────────────────────────────────┤
│ 过长方法        │ Extract Method、Replace Temp with Query、      │
│                 │ Introduce Parameter Object                    │
├─────────────────┼───────────────────────────────────────────────┤
│ 过大类          │ Extract Class、Extract Subclass、              │
│                 │ Extract Interface                             │
├─────────────────┼───────────────────────────────────────────────┤
│ 过长参数列表    │ Introduce Parameter Object、                   │
│                 │ Preserve Whole Object、Replace with Method    │
├─────────────────┼───────────────────────────────────────────────┤
│ 基本类型偏执    │ Replace Primitive with Object、                │
│                 │ Replace Type Code with Class/Subclass         │
├─────────────────┼───────────────────────────────────────────────┤
│ 数据泥团        │ Extract Class、Introduce Parameter Object     │
└─────────────────┴───────────────────────────────────────────────┘
```

### 面向对象滥用

```
┌─────────────────┬───────────────────────────────────────────────┐
│ 异味            │ 重构手法                                       │
├─────────────────┼───────────────────────────────────────────────┤
│ Switch 语句     │ Replace Conditional with Polymorphism、        │
│                 │ Replace Type Code with Strategy/State         │
├─────────────────┼───────────────────────────────────────────────┤
│ 平行继承        │ Move Method、Move Field                       │
├─────────────────┼───────────────────────────────────────────────┤
│ 被拒绝的遗赠    │ Push Down Method/Field、Replace Inheritance   │
│                 │ with Delegation                               │
├─────────────────┼───────────────────────────────────────────────┤
│ 殊途同归的类    │ Extract Superclass、Extract Interface         │
└─────────────────┴───────────────────────────────────────────────┘
```

### 变更障碍

```
┌─────────────────┬───────────────────────────────────────────────┐
│ 异味            │ 重构手法                                       │
├─────────────────┼───────────────────────────────────────────────┤
│ 发散式变更      │ Extract Class                                 │
│                 │ （类因多种原因而变更）                           │
├─────────────────┼───────────────────────────────────────────────┤
│ 霰弹式修改      │ Move Method/Field、Inline Class               │
│                 │ （一个变更触及多个类）                           │
├─────────────────┼───────────────────────────────────────────────┤
│ 功能嫉妒        │ Move Method、Extract Method                   │
│                 │ （方法过多使用其他类的数据）                     │
└─────────────────┴───────────────────────────────────────────────┘
```

### 多余物（不必要的）

```
┌─────────────────┬───────────────────────────────────────────────┐
│ 异味            │ 重构手法                                       │
├─────────────────┼───────────────────────────────────────────────┤
│ 过多注释        │ Extract Method、Rename Method                 │
│                 │ （代码应自我解释）                              │
├─────────────────┼───────────────────────────────────────────────┤
│ 重复代码        │ Extract Method、Extract Class、                │
│                 │ Pull Up Method、Form Template Method          │
├─────────────────┼───────────────────────────────────────────────┤
│ 死代码          │ Remove Dead Code                              │
├─────────────────┼───────────────────────────────────────────────┤
│ 夸夸其谈的      │ Collapse Hierarchy、Inline Class、             │
│ 未来性          │ Remove Unnecessary Parameters                 │
├─────────────────┼───────────────────────────────────────────────┤
│ 数据类          │ Encapsulate Field、Move Method                │
└─────────────────┴───────────────────────────────────────────────┘
```

## 核心重构技术

### Extract Method（最常用）

```
Before:
────────────────────────────
def print_owing():
    # print banner
    print("********************")
    print("*** Customer Owes ***")
    print("********************")

    # calculate outstanding
    outstanding = 0
    for order in orders:
        outstanding += order.amount

    # print details
    print(f"name: {name}")
    print(f"amount: {outstanding}")

After:
────────────────────────────
def print_owing():
    print_banner()
    outstanding = calculate_outstanding()
    print_details(outstanding)

def print_banner():
    print("********************")
    print("*** Customer Owes ***")
    print("********************")

def calculate_outstanding():
    return sum(order.amount for order in orders)

def print_details(outstanding):
    print(f"name: {name}")
    print(f"amount: {outstanding}")
```

### Replace Conditional with Polymorphism

```
Before:
────────────────────────────
def get_speed(vehicle_type):
    if vehicle_type == "car":
        return base_speed * 1.0
    elif vehicle_type == "bike":
        return base_speed * 0.7
    elif vehicle_type == "truck":
        return base_speed * 0.5
    else:
        raise ValueError("Unknown vehicle")

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

class Truck(Vehicle):
    def get_speed(self):
        return base_speed * 0.5
```

### Introduce Parameter Object

```
Before:
────────────────────────────
def amount_invoiced(start_date, end_date):
    ...

def amount_received(start_date, end_date):
    ...

def amount_overdue(start_date, end_date):
    ...

After:
────────────────────────────
class DateRange:
    def __init__(self, start, end):
        self.start = start
        self.end = end

def amount_invoiced(date_range):
    ...

def amount_received(date_range):
    ...

def amount_overdue(date_range):
    ...
```

## 流程

### 步骤 1：识别代码异味

```
异味检测清单：

□ 方法 > 10 行？→ 考虑 Extract Method
□ 类 > 200 行？→ 考虑 Extract Class
□ 参数列表 > 3？→ 考虑 Parameter Object
□ Switch/if-else 链？→ 考虑多态
□ 重复代码块？→ 考虑 Extract Method
□ 注释在解释"为什么"？→ 代码可能需要更清晰
□ 方法访问其他类的数据？→ 功能嫉妒
```

### 步骤 2：确保测试覆盖

```
重构前：
┌─────────────────────────────────────────────────────────────────┐
│ □ 现有测试通过                                                    │
│ □ 待重构代码有测试覆盖                                             │
│ □ 如果没有测试，先写特征化测试                                      │
│                                                                 │
│ 特征化测试："这段代码实际上做了什么？"                                │
│ 1. 写一个调用该代码的测试                                          │
│ 2. 断言你观察到的结果（即使看起来不对）                               │
│ 3. 调整断言以匹配实际行为                                          │
│ 4. 现在你有了安全网                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 步骤 3：执行重构

```
重构步骤：

1. 做一个小变更
2. 运行测试
3. 测试通过则提交
4. 重复

Extract Method 示例步骤：
1. 识别要提取的代码
2. 创建新的空方法
3. 将代码复制到新方法
4. 编译/解析检查语法
5. 用调用替换原始代码
6. 运行测试
7. 提交
```

### 步骤 4：审查结果

```
重构后检查清单：

□ 测试仍然通过
□ 代码更可读了
□ 命名清楚地表达了意图
□ 没有增加重复
□ 方法职责单一（SRP）
□ 依赖减少了
```

## 输出

```json
{
  "smells_detected": [
    {
      "smell": "Long Method",
      "location": "file.py:45-120",
      "severity": "high|medium|low",
      "suggested_refactorings": ["Extract Method", "Replace Temp with Query"]
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
    "characterization_tests_needed": ["describe behavior of calculate()"],
    "tests_to_add": ["test edge case for empty input"]
  },
  "estimated_impact": {
    "lines_affected": 45,
    "complexity_reduction": "high",
    "readability_improvement": "significant"
  }
}
```

## 调用示例

```
AI: 启动 refactoring-guide 分析代码质量……

🔧 重构分析结果：

检测到的代码异味：
┌─────────────────┬──────────────┬────────────────────────────────┐
│ 异味            │ 严重程度      │ 位置                            │
├─────────────────┼──────────────┼────────────────────────────────┤
│ 过长方法        │ 高           │ order_service.py:45-180        │
│ 功能嫉妒        │ 中           │ order_service.py:90-110        │
│ 重复代码        │ 中           │ 第 120-140 行，第 160-180 行     │
│ 数据泥团        │ 低           │ customer、address 总是一起出现   │
└─────────────────┴──────────────┴────────────────────────────────┘

推荐重构顺序：

1. Extract Method：calculate_discounts（第 50-75 行）
   风险：低 | 需要测试：2 个

2. Move Method：get_shipping_address 移至 Customer
   风险：中 | 需要测试：3 个

3. Extract Class：从 OrderService 中提取 PricingCalculator
   风险：中 | 需要测试：5 个

4. Introduce Parameter Object：CustomerContext
   风险：低 | 需要测试：1 个

测试覆盖状态：
⚠️ 第 90-180 行没有直接测试
   → 重构前先写特征化测试

预计改善：
- 方法长度：135 → 平均 ~30 行
- 圈复杂度：15 → 5
- 重复代码：40 行 → 0
```

## 配置选项

```yaml
config:
  include_refactoring_plan: true
  severity_threshold: "medium"
  output: "refactoring_analysis"
```

## 参考资料

- **Refactoring** — Martin Fowler (2nd edition, 2018)
- **Refactoring to Patterns** — Joshua Kerievsky (2004)
- **Clean Code** — Robert C. Martin (2008)
