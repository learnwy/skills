# Wiki 页面模板

llm-wiki 技能使用的所有 wiki 页面模板（实体优先布局）。

> 约定：每页以 `# 标题` H1 开头；交叉引用用 `[[folder/slug]]`（上限 ~5，超出用"另见"）；
> slug 用 kebab-case；来源页带 `**Source**:` / `**Ingested**:`。

---

## 实体类（wiki/people, organizations, places, products, events, concepts, other-entities）

### 人物 (wiki/people/)

```markdown
# {姓名}

**角色**: {一句话身份}
**别名**: {可选}

## 概述
{从所有来源综合的描述}

## 关键事实
- {date} {事实}（来源：[[threads/{src}]] / [[articles/{src}]]）

## 关系
- → {关系} → [[organizations/{org}]]、[[people/{other}]]

## 另见
- [[products/{proj}]]
```

### 组织 (wiki/organizations/)

```markdown
# {组织 / 团队名}

**类型**: {company | team | community}

## 概述
{描述}

## 成员 / 关联
- [[people/{person}]] — {角色}

## 关键事实
- {date} {事实}（来源：[[...]]）
```

### 地点 (wiki/places/)

```markdown
# {地点名}

**类型**: {city | venue | region}

## 概述
{描述}

## 关联
- [[events/{event}]]、[[organizations/{org}]]
```

### 产品 / 项目 (wiki/products/)

```markdown
# {产品 / 项目名}

**类型**: {product | project | initiative}
**状态**: {active | shipped | sunset}

## 概述
{它是什么、归谁}

## 进展
- {date} {里程碑 / 数字}（来源：[[threads/{src}]]）

## 关联
- 负责人 [[people/{owner}]]；所属 [[organizations/{org}]]
```

### 事件 / 决策 (wiki/events/)

```markdown
# {事件 / 决策标题}

**日期**: {date}
**类型**: {decision | launch | incident | milestone}
**相关人**: [[people/{who}]]

## 背景
{是什么促成了此事 / 决策}

## 内容
{发生了什么 / 选择了什么及原因}

## 后果
- {正面 / 负面影响}

## 另见
- [[products/{proj}]]、[[concepts/{topic}]]
```

### 概念 / 术语 / 代码模式 (wiki/concepts/)

```markdown
# {概念名称}

**Discipline**: {可选，用于 freshness 分类}
**Verified**: {no — 易过时的技术内容}

## 定义
{从所有来源综合的清晰定义}

## 关键来源
- [[articles/{source1}]] — {该来源的阐述}
- [[podcasts/{source2}]] — {补充}

## 代码 / 用法（若是代码模式）
{带语言标签的代码块 + 何时使用 + 常见坑}

## 相关概念
- [[concepts/{related}]] — {关系}

## 演进
| 日期 | 更新 | 来源 |
|------|------|------|
| {date} | 从 {source} 创建 | [[articles/{source}]] |
```

---

## 来源类（wiki/articles, podcasts, vlogs, diaries, threads）

### 文章 / 播客 / 视频 (wiki/articles · podcasts · vlogs/)

```markdown
# {来源标题}

**Source**: [[raw/{articles|podcasts|vlogs}/{slug}]] 或 {URL}
**Ingested**: {date}
**Last verified**: {date}
**Author**: {作者} | **Year**: {年份}

## 要点
- {要点1}
- {要点2}

## 引用的概念 / 实体
- [[concepts/{c}]]、[[people/{p}]]

## 与已有知识的矛盾
- {冲突，或"未检测到"}
```

### 日记 / 编年流水 (wiki/diaries/)

```markdown
# {ISO-week，如 2026-W22}

## 2026-MM-DD
- **#{群名/场景}** {人} {时间}：{内容简述（关键数字 / 链接 / 决策保留）}（[[people/{p}]] / [[products/{proj}]]）
```

### 会话沉淀 (wiki/threads/)

```markdown
# {群 / 会话名}

**Source**: [[raw/lark/{alias}-{date}]]
**Chat**: {alias}

## 概述
{这个群在聊什么、长期主题}

## 近期沉淀
- {date} {议题 / 决策}（[[events/{e}]]、[[people/{p}]]）
```

---

## 索引模板 (wiki/index.md)

> 由 `scripts/cli.cjs generate-index` 自动生成，请勿手动编辑。

```markdown
# Knowledge Base Index

**Last updated**: {date}
**Total sources**: {count}
**Total wiki pages**: {count} ({per-type counts})

## Entities
### People ({N})
- [{title}](people/{file})
...

## Sources
### Articles ({N})
- [{title}](articles/{file})
...
```
