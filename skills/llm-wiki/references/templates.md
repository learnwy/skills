# Wiki 页面模板

llm-wiki 技能使用的所有 wiki 页面模板参考文档。

## 摘要页面模板 (wiki/summaries/)

```markdown
# {来源标题}

**来源**: [[raw/{path}]]
**收录日期**: {date}
**类型**: {article | paper | book | podcast | notes}

## 要点
- {要点1}
- {要点2}
- {要点3}

## 引用的概念
- [[concepts/{concept1}]]
- [[concepts/{concept2}]]

## 提及的实体
- [[entities/{entity1}]]

## 与已有知识的矛盾
- {与已有 wiki 页面的冲突，或"未检测到"}

## 备注
{额外上下文、质量评估、相关性说明}
```

## 概念页面模板 (wiki/concepts/)

```markdown
# {概念名称}

## 定义
{从所有来源综合的清晰、简洁定义}

## 关键来源
- [[summaries/{source1}]] — {该来源对此概念的阐述}
- [[summaries/{source2}]] — {该来源的补充}

## 相关概念
- [[concepts/{related1}]] — {关系描述}
- [[concepts/{related2}]] — {关系描述}

## 开放问题
- {关于此概念的未答问题}

## 演进
| 日期 | 更新 | 来源 |
|------|------|------|
| {date} | 从 {source} 创建 | [[summaries/{source}]] |
| {date} | 用 {新信息} 更新 | [[summaries/{source}]] |
```

## 实体页面模板 (wiki/entities/)

```markdown
# {实体名称}

**类型**: {person | organization | product | technology}

## 概述
{从所有来源综合的描述}

## 出现记录
- [[summaries/{source1}]] — {在该来源中的角色/上下文}
- [[summaries/{source2}]] — {在该来源中的角色/上下文}

## 关系
- {entity} → {关系} → [[entities/{other}]]

## 关键主张
| 主张 | 来源 | 置信度 |
|------|------|--------|
| {claim} | [[summaries/{source}]] | {高/中/低} |
```

## 索引模板 (wiki/index.md)

> 注意：index.md 由 `scripts/generate-index` 自动生成。请勿手动编辑。

```markdown
# 知识库索引

**最后更新**: {date}
**总来源数**: {count}
**总 wiki 页面数**: {count}

## 按主题
- [{topic}](concepts/{topic}.md) ({N} 个来源)

## 按类型
### 文章 ({N})
- [{title}](summaries/{file}.md)

### 论文 ({N})
- [{title}](summaries/{file}.md)

## 最近收录
| 日期 | 来源 | 更新的页面 |
|------|------|-----------|
| {date} | {source} | {更新的页面列表} |
```

## 代码片段模板 (wiki/snippets/)

```markdown
# {标题}

**语言**: {typescript | swift | go | kotlin | shell | css}
**平台**: {web | ios | android | server | cross-platform}
**来源**: [[raw/snippets/{source}]] 或 [[summaries/{book}]]
**最后验证**: {date}

## 代码

{带语言标签的代码块}

## 用法

{何时以及如何使用此代码片段}

## 注意事项

- {常见错误或边界情况}

## 交叉引用

- 相关：[[concepts/...]], [[snippets/...]]
```

## 故障排除模板 (wiki/troubleshooting/)

```markdown
# {问题标题}

**平台**: {web | ios | android | server}
**严重程度**: {critical | moderate | minor}
**首次出现**: {date}

## 症状

- {可观察的行为}

## 根因

{技术解释}

## 解决方案

{修复代码或步骤}

## 预防

- {未来如何避免}

## 交叉引用

- 相关：[[concepts/...]], [[troubleshooting/...]]
```

## 决策记录模板 (wiki/decisions/)

```markdown
# {决策标题}

**日期**: {date}
**状态**: {proposed | accepted | superseded}
**决策者**: {who}

## 背景

{是什么促成了此决策}

## 考虑的选项

| 选项 | 优点 | 缺点 |
|------|------|------|
| {A} | ... | ... |
| {B} | ... | ... |

## 决策

{选择了什么以及原因}

## 后果

- {正面和负面影响}

## 交叉引用

- 相关：[[concepts/...]], [[decisions/...]]
```

## 速查表模板 (wiki/cheatsheets/)

```markdown
# {主题} 速查表

**平台**: {web | ios | android | server | all}
**最后更新**: {date}

## 快速参考

| 命令/模式 | 描述 |
|-----------|------|
| {item} | {功能说明} |

## 常用模式

### {模式1}

{带语言标签的代码块}

## 交叉引用

- 编译自：[[concepts/...]]
```

## 跨平台对比模板 (wiki/comparisons/)

```markdown
# {主题}: {平台A} vs {平台B} [vs {平台C}]

**最后更新**: {date}

## 概述

{对比内容和原因}

| 维度 | {平台A} | {平台B} | {平台C} |
|------|---------|---------|---------|
| {方面1} | ... | ... | ... |
| {方面2} | ... | ... | ... |

## 关键差异

### {差异1}
- **{平台A}**: {工作方式}
- **{平台B}**: {工作方式}

## 迁移说明

{开发者在平台间切换的技巧}

## 交叉引用

- 相关：[[concepts/...]], [[comparisons/...]]
```
