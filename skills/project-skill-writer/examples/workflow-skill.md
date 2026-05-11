# 完整工作流：创建技能（问题驱动）

问题驱动创建技能的端到端示例。

## 问题优先方法

**旧方式**：用户说"我要一个技能" → 提问 → 生成

**新方式**：用户描述困扰 → 理解问题 → 分析项目 → 设计 → 确认 → 生成

## 场景

**用户说**："我每次创建新组件时都在写相同的 React 组件样板代码——TypeScript、styled-components 和测试。每次创建 Button 或 Card，都是从旧文件复制粘贴然后修改。太重复了，而且总会遗漏什么。"

## 步骤 1：问题理解（L1）

不要问"你想给技能起什么名字？"，而是理解问题：

```
问题分析：
- 模式："我每次都在写相同的……"
- 类型：Generator（生成器，重复创建代码）
- 输入：组件名称、props 类型
- 输出：完整组件文件（index.tsx、styles.ts、types.ts、test.tsx）
- 频率：高（每个新组件）
```

## 步骤 2：项目分析（L2）

通过 Task 工具并行运行：

- **项目扫描器**：发现 `src/components/` 下有 12 个现有组件，每个包含 `index.tsx`、`styles.ts`、`types.ts`
- **技术栈分析器**：React 18 + TypeScript 5 + styled-components v6
- **约定检测器**：组件使用 PascalCase、函数式组件 + Hooks、桶导出

## 步骤 3：技能设计（L3）

生成**之前**展示给用户：

```
我将创建一个技能：

问题：你在手动编写 React 组件样板代码
方案：自动生成包含样式和测试的完整组件文件
触发条件："new component"、"create component"、"generate component"
创建的文件：
  - {name}/index.tsx（组件）
  - {name}/styles.ts（styled-components）
  - {name}/types.ts（TypeScript 接口）
  - {name}/test.tsx（基础测试）

这样是否正确？需要调整什么吗？
```

## 步骤 4：用户确认（L4）

用户说："可以，但我还想生成 prop-types"

→ 更新设计，在 `types.ts` 中加入 prop-types。

## 步骤 5：生成技能（L5）

创建的技能目录：

```
.agents/skills/react-component-generator/
├── SKILL.md
├── assets/
│   ├── component.tsx.template
│   ├── styles.ts.template
│   ├── types.ts.template
│   └── test.tsx.template
└── references/
    └── component-patterns.md
```

SKILL.md 包含：
- 带触发词的 Frontmatter："new component"、"create component"
- 工作流：分析目标 → 选择模板 → 填充上下文 → 创建文件
- 组件类型与模板的快速参考表
- 名称冲突和缺少目录的错误处理

## 步骤 6：质量验证（L6）

运行质量验证器：

```json
{
  "overall_score": 0.92,
  "status": "pass",
  "checks": {
    "triggers": "3 个独立、具体的触发词",
    "output_path": ".agents/skills/（项目相对路径） ✓",
    "frontmatter": "name + description ✓",
    "workflow": "4 步，原子化，已验证 ✓"
  }
}
```

## 验证清单

- [x] 描述中包含所有触发关键词
- [x] "适用场景"章节清晰
- [x] "不适合调用"防止误触发
- [x] 参考文档从 SKILL.md 链接
- [x] 模板匹配项目约定（PascalCase、styled-components）
- [x] 输出路径为项目相对路径
