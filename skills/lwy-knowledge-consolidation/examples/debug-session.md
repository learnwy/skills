# 示例：调试会话知识沉淀

## 场景

用户完成了一次 iOS 图片缓存内存泄漏的调试。

## AI 检测

```
AI: 我注意到我们完成了一次重要的调试会话。让我来沉淀这些知识。

📊 知识检测:
- 类型: debug
- 主题: 图片缓存内存泄漏
- 价值: 根因分析 + 修复方案
```

## 路径生成

```bash
$ node {skill_root}/scripts/cli.cjs path -r /project -a trae-cn -t debug -n image-cache-memory-leak
/project/.trae/knowledges/20260223_001_debug_image-cache-memory-leak.md
```

## 输出确认

```
📚 知识已沉淀:
- 文件: /project/.trae/knowledges/20260223_001_debug_image-cache-memory-leak.md
- 类型: debug
- 主题: 图片缓存内存泄漏修复

摘要: 发现 ImageCacheManager 中因完成回调中的强引用导致的循环引用。
通过使用 [weak self] 捕获修复。
```

## 生成的文档

````markdown
# 图片缓存内存泄漏修复

> **类型:** debug
> **日期:** 2026-02-23
> **上下文:** 调查应用在浏览图片时的内存持续增长

## 摘要

发现 ImageCacheManager 中因异步完成回调中的强引用 self 导致的循环引用。
通过使用 [weak self] 捕获列表修复。

## 背景

用户滑动浏览图片画廊时，应用内存持续增长。
内存分析器显示 ImageCacheManager 实例从未被释放。

## 详情

根因：完成回调中的强引用循环

```swift
// 修复前（循环引用）
imageLoader.load(url: url) { result in
    self.cache[url] = result  // 强引用 self
}

// 修复后
imageLoader.load(url: url) { [weak self] result in
    self?.cache[url] = result
}
```
````

## 关键收获

- 始终在被对象持有的异步闭包中使用 [weak self]
- 使用 Instruments Leaks 模板检测循环引用
- 调查内存增长时检查完成回调

## 相关

- /project/Sources/ImageCacheManager.swift

```

```
