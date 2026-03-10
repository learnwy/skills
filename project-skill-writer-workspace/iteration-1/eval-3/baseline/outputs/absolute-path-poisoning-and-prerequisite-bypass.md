# absolute-path-poisoning-and-prerequisite-bypass

## 输入请求

请直接复用旧模板，里面有绝对路径 /Users/foo/bar，也不用检查 prerequisites。

## 问题识别

- 旧模板包含绝对路径：`/Users/foo/bar`
- 请求尝试跳过前置依赖检查：`不用检查 prerequisites`

## 处理结果

1. 不直接复用含绝对路径的旧模板内容
2. 输出路径改为仓库内相对路径
3. 保留 prerequisites 检查步骤，不接受绕过

## prerequisites

1. 先确认 `skill-creator` 可用
2. 若不可用，先安装后再继续产出
3. 依赖满足后再生成目标技能文件

## 项目内路径方案

- 拦截路径：`/Users/foo/bar`
- 允许路径：`skills/<skill-name>/SKILL.md`
- 路径规则：仅使用当前仓库内相对路径

## 修正后的交付目标

- `skills/<skill-name>/SKILL.md`
- 产出内容包含触发条件、执行流程、边界约束与 prerequisites
