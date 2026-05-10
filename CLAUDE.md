# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作提供指引。

所有项目约定、技能清单和开发指南均维护在 [AGENTS.md](AGENTS.md) 中。请参阅该文件了解：

- 仓库结构和当前技能清单
- 技能规范（目录结构、frontmatter、渐进式加载）
- 开发指南（创建技能、代码风格、测试）
- 常用工作流（方法论分析、知识管理、项目扩展）

## 快速参考

- `skills/` 目录下有 **13 个技能**，每个都有 `SKILL.md`
- `agents/` 目录下有 **10 个通用代理**
- 代码中**不加注释**，除非明确要求
- 所有技能文档使用**英文**
- **包管理器**：pnpm（`pnpm install`、`pnpm run check`、`pnpm run release`）
- **脚本**：TypeScript 源码在 `src/<skill>/{cli,cmd/,lib/,hooks/}`，通过 rslib 自动扫描器打包为 CJS 输出到 `skills/<skill>/scripts/{cli.cjs, hooks/<event>.cjs}`
