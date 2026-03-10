# mixed-request-routing-and-global-path-block

## 输入请求

同时帮我写一个 project rule 和 agent，顺便把 skill 放到 ~/.trae/skills。

## 请求拆分与路由

- skill 请求：单独作为技能产出任务处理
- rule 请求：单独作为规则产出任务处理
- agent 请求：单独作为 agent 产出任务处理
- 混合请求按类型拆分，分别交付，不混写到同一文件

## 全局路径拦截策略

- 阻断写入路径：`~/.trae/skills`
- 阻断原因：该路径属于全局作用域，不是当前项目工作区
- 路径原则：仅允许写入当前仓库内的项目级目录

## 项目级可执行方案

1. skill 产物写入：`skills/<skill-name>/SKILL.md`
2. rule 产物写入：`.trae/rules/<rule-name>.md`
3. agent 产物写入：`agents/<agent-name>.md`
4. 所有路径使用仓库内相对路径，不使用用户主目录路径

## 交付清单

- `skills/<skill-name>/SKILL.md`
- `.trae/rules/<rule-name>.md`
- `agents/<agent-name>.md`
