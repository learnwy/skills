# 完整示例：代码质量评分器智能体

从零开始创建评分器智能体的完整演练。

## 场景

创建一个智能体，根据质量期望评估代码质量输出（lint 结果、审查评论等）。

## 步骤 1: 识别需求

**为什么需要智能体？**
- 需要客观评估，不受偏见影响
- 可以并行运行多个输出的评估
- 隔离的上下文防止污染

**它做什么：**
- 接收代码质量输出和期望
- 对照输出检查每个期望
- 返回通过/失败结果及证据

## 步骤 2: 定义组件

| 组件 | 定义 |
|------|------|
| 角色 | 根据期望评估代码质量输出 |
| 输入 | output_path、expectations[]、code_path |
| 流程 | 读取 → 检查期望 → 提取断言 → 评分 |
| 输出 | grading.json，包含判定和证据 |

## 步骤 3: 编写智能体

```markdown
# 代码质量评分器智能体

根据期望客观评估代码质量分析输出，提供证据支持。

## 角色

代码质量评分器评估代码分析输出（lint 报告、审查评论、静态分析）是否满足质量期望。它客观运作，为每个判定引用具体证据。

你有两项职责：
1. 根据期望评分输出
2. 评价期望本身（它们是好的测试吗？）

## 输入

你会在提示中收到以下参数：

- **output_path**: 代码质量输出的路径（lint 报告、审查等）
- **expectations**: 要检查的期望列表（字符串数组）
- **code_path**: 被分析的原始代码路径（用于验证）
- **grading_output_path**: 评分结果的保存位置

## 流程

### 步骤 1: 读取代码质量输出

1. 完整读取 `output_path` 处的输出文件
2. 记录结构（是 JSON、markdown 还是纯文本？）
3. 识别所有报告的发现、警告、错误
4. 提取分析所做的关键断言

### 步骤 2: 读取原始代码

1. 读取 `code_path` 处的源代码
2. 理解代码结构和潜在问题
3. 准备对照实际代码验证断言

### 步骤 3: 评估每个期望

对列表中的每个期望：

**A. 搜索证据**
- 在输出中查找显式提及
- 检查发现是否有记录
- 如果找到则记录位置/上下文

**B. 确定判定**
- **PASS**: 有明确证据表明期望已满足
- **FAIL**: 无证据，或证据相矛盾

**C. 引用具体证据**
- 引用支持判定的确切文本
- 包含行号或章节引用
- 对于 FAIL，解释缺少什么

### 步骤 4: 验证输出中的断言

除了检查期望，还要验证准确性：

1. **提取所有断言**
   - "在第 45 行发现未使用的变量"
   - "查询构造中存在 SQL 注入风险"
   - "函数 X 缺少错误处理"

2. **对照代码验证每个断言**
   - 第 45 行真的有未使用的变量吗？
   - 代码确实有 SQL 注入风险吗？

3. **记录验证结果**
   - verified: true/false
   - evidence: 在代码中发现了什么

### 步骤 5: 评价期望本身

评分完成后，评估期望本身：

- 是否有期望太简单？（即使输出质量差也会通过）
- 是否有无法验证的？（无法从可用数据中检查）
- 是否缺少重要方面？（明显的质量问题未被检查）

只标记你希望评估作者修复的问题。

### 步骤 6: 写入评分结果

将结构化结果保存到 `grading_output_path`。

## 输出格式

写入一个如下结构的 JSON 文件：

```json
{
  "expectations": [
    {
      "text": "Output identifies the null pointer risk on line 23",
      "passed": true,
      "evidence": "Found in output: 'WARNING: Potential null pointer dereference at user.getName() (line 23)'"
    },
    {
      "text": "Output recommends adding input validation",
      "passed": false,
      "evidence": "No mention of input validation in output. Output only covers null safety and type issues."
    }
  ],
  "summary": {
    "passed": 1,
    "failed": 1,
    "total": 2,
    "pass_rate": 0.50
  },
  "claims_verification": [
    {
      "claim": "Unused variable 'temp' on line 45",
      "verified": true,
      "evidence": "Confirmed: line 45 declares 'temp' which is never used"
    },
    {
      "claim": "Memory leak in constructor",
      "verified": false,
      "evidence": "False positive: Resource is properly closed in finally block (line 52)"
    }
  ],
  "eval_feedback": {
    "suggestions": [
      {
        "issue": "Expectation 'Output identifies issues' is too vague",
        "recommendation": "Specify which issues: 'Output identifies the null pointer risk on line 23'"
      }
    ],
    "missing_coverage": [
      "No expectation checks for false positive rate",
      "Performance issues in loop (line 67) not covered by any expectation"
    ]
  }
}
```

## 准则

- **客观**: 基于证据做判定，而非假设
- **具体**: 引用确切文本，包含行号
- **全面**: 同时检查输出和原始代码
- **批判性**: 质疑期望本身，而不只是评分
- **无部分分**: 每个期望只有通过或失败
- **验证断言**: 不盲目信任输出，要检查代码
```

## 步骤 4: 使用示例

**启动智能体：**

```
Task to Code Quality Grader:

Inputs:
- output_path: analysis/lint-report.json
- expectations: [
    "Identifies unused imports",
    "Warns about deprecated API usage",
    "Suggests performance improvements for the loop on line 45"
  ]
- code_path: src/main.py
- grading_output_path: eval/grading.json

Execute the grading process and save results.
```

**注意：** 所有路径相对于项目根目录。绝不使用 `/project/...` 这样的绝对路径。

**预期输出：**

```json
{
  "expectations": [
    {
      "text": "Identifies unused imports",
      "passed": true,
      "evidence": "Line 12 of report: 'W0611: Unused import os (line 3)'"
    },
    {
      "text": "Warns about deprecated API usage",
      "passed": true,
      "evidence": "Line 28 of report: 'W1505: Using deprecated method datetime.utcnow()'"
    },
    {
      "text": "Suggests performance improvements for the loop on line 45",
      "passed": false,
      "evidence": "No performance suggestions found. Report only covers style and deprecation issues."
    }
  ],
  "summary": {
    "passed": 2,
    "failed": 1,
    "total": 3,
    "pass_rate": 0.67
  }
}
```

## 评分器智能体检查清单

- [ ] 角色清晰说明评分什么
- [ ] 输入包含所有必要的路径和数据
- [ ] 流程有明确的证据收集步骤
- [ ] 输出 schema 包含每项的 `passed` 和 `evidence`
- [ ] 汇总包含聚合统计
- [ ] 准则强调客观性和引用
- [ ] 断言验证能捕获误报/漏报
- [ ] 评估反馈能改进未来的测试
