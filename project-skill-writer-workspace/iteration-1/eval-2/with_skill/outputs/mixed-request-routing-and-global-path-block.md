# mixed-request-routing-and-global-path-block

## 输入请求

同时帮我写一个 project rule 和 agent，顺便把 skill 放到 ~/.trae/skills。

## 路由判定

- skill 请求：由 `project-skill-writer` 处理
- rule 请求：路由到 `project-rules-writer`
- agent 请求：路由到 `project-agent-writer`
- 混合请求按类型拆分执行，不在同一产物中混写

## 全局路径拦截

- 拒绝写入：`~/.trae/skills`
- 原因：该路径属于全局范围，不符合项目级技能写作约束
- 允许范围：仅当前仓库内的相对路径

## 项目级 skill 可执行产出方案

1. 在当前项目内创建技能目录：`skills/<skill-name>/`
2. 生成技能文件：`skills/<skill-name>/SKILL.md`
3. 保留项目内引用，不包含用户主目录或绝对路径
4. 若需脚手架生成，先检查全局前置：`skill-creator`
5. 前置缺失时先阻断并提示安装：`npx skills add skill-creator -g -y`

## 拆分后的交付清单

- skill 交付：项目内 `skills/<skill-name>/SKILL.md`
- rule 交付：项目内 `.trae/rules/<rule-name>.md`
- agent 交付：项目内 `agents/<agent-name>.md`
