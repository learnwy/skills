# TypeScript Interface Rule

## Scope Decision

创建 typescript-interface.md，强制 AI 在 TypeScript 项目中使用 interface 而非 type 定义对象结构。

## Path Evidence

- 项目根目录：`/Users/wangyang.learnwy/learnwy/learnwy/skills/trae-rules-writer-workspace/iteration-2/eval-3/with_skill_v1_7/`
- 输出路径：`outputs/typescript-interface.md`
- 相对路径确认：无绝对路径，使用项目相对路径

## Rule Content

```yaml
description: 使用 TypeScript interface 而非 type 定义对象结构
globs: *.ts,*.tsx
alwaysApply: false
```

# TypeScript Interface 规范

## 对象定义

优先使用 `interface` 而非 `type` 定义对象结构：

```typescript
// 推荐 ✓
interface User {
  id: string;
  name: string;
  email: string;
}

// 避免 ✗
type User = {
  id: string;
  name: string;
  email: string;
};
```

## 扩展场景

`interface` 支持声明合并，便于扩展：

```typescript
interface User {
  id: string;
}

interface User {
  name: string;
}
// User 合并为 { id: string; name: string }
```

## 适用场景

| 推荐 interface | 可用 type |
|---------------|-----------|
| 对象结构定义 | 联合类型 `type A = B | C` |
| 类实现接口 | 元组 `type Tuple = [string, number]` |
| 声明合并需求 | 映射类型 |

## Quality Report

- [x] Format Gate: globs 格式正确 `globs: *.ts,*.tsx`
- [x] Path Gate: 无绝对路径，使用相对路径
- [x] Description Gate: description 已包含
- [x] Conflict Gate: 无冲突规则
