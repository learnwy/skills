# tech-design-reviewer

技术设计与架构审查 agent。

## 适用场景

- design.md 编写完成后
- 审查架构决策
- 检查可扩展性/安全性问题

## 钩子触发点

`post_stage_DESIGNING`

## 能力

1. **架构审查**：评估组件设计
2. **可扩展性检查**：识别瓶颈
3. **安全审查**：检查安全漏洞
4. **最佳实践**：对标业界标准验证

## 输出

设计审查报告，包含：

- 发现的问题
- 改进建议
- 审批状态

## 配置选项

```yaml
config:
  review_aspects: ["architecture", "scalability", "security"]
```

## 调用示例

```
AI: 启动 tech-design-reviewer...

📐 设计审查结果：

✅ 架构：通过
   - 关注点分离清晰
   - API 边界合理

⚠️ 可扩展性：需关注
   - 建议为图片服务添加缓存
   - 静态资源添加 CDN

✅ 安全性：通过
   - 输入验证已实现
   - 文件类型限制已实现

建议：在实现前添加缓存层
```
