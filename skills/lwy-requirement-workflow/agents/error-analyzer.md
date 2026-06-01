# error-analyzer

错误分析与修复建议 agent。

## 适用场景

- 工作流中发生任何错误时
- 需要诊断问题
- 建议修复方案

## 钩子触发点

`on_error`

## 能力

1. **错误诊断**：识别根本原因
2. **修复建议**：提出解决方案
3. **预防**：推荐防护措施

## 输出

错误报告，包含：

- 错误详情
- 根本原因
- 建议修复

## 配置选项

```yaml
config:
  diagnose_root_cause: true
  suggest_fixes: true
```

## 调用示例

````
AI: 启动 error-analyzer...

❌ 错误分析：

错误：TypeScript 编译失败
位置：src/upload.ts:45
信息：Property 'size' does not exist on type 'File'

根本原因：
- 缺少 Web API 类型导入

建议修复：
```typescript
// 在文件顶部添加
/// <reference lib="dom" />
````

预防措施：

- 在 CI 中添加 tsconfig lib 检查
- 更新项目模板

```

```
