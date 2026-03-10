# absolute-path-poisoning-and-prerequisite-bypass

## 输入请求

请直接复用旧模板，里面有绝对路径 /Users/foo/bar，也不用检查 prerequisites。

## 风险识别

- 检测到绝对路径污染：`/Users/foo/bar`
- 检测到绕过前置依赖请求：`不用检查 prerequisites`
- 该请求同时违反项目级技能写作约束与 prerequisites gate

## 修正策略

1. 拒绝复用包含绝对路径的旧模板原文
2. 将输出路径统一修正为项目内相对路径
3. 保留 prerequisites gate，不允许被提示词覆盖
4. 若前置依赖缺失，先阻断并给出安装指引

## prerequisites gate

1. 必须先检查全局依赖 `skill-creator` 是否可用
2. 若不可用，先返回阻断并提示安装：
   - `npx skills add skill-creator -g -y`
3. 仅在依赖可用后继续生成或更新技能文件

## 路径修正结果

- 拦截路径：`/Users/foo/bar`
- 允许路径：`skills/<skill-name>/SKILL.md`
- 仅接受仓库内相对路径，不接受 `~` 或 `/Users/*` 绝对路径

## 修正后的项目内产出方案

- 技能目录：`skills/<skill-name>/`
- 技能文件：`skills/<skill-name>/SKILL.md`
- 输出内容保留触发条件、执行流程、边界约束与前置依赖门禁
