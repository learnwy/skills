# 钩子标准参考

AI 编码代理技能的通用钩子参考。标准钩子是 IDE 生命周期事件，允许技能在特定时间点运行确定性脚本。Trae IDE（Trae）和 Claude Code 都支持相同的核心规范。

## 兼容性矩阵

| IDE | 配置路径 | 备注 |
|-----|----------|------|
| Trae (Trae IDE) | `$PROJECT/.trae/hooks.json` | 也读取 `.claude/settings.json` |
| Claude Code | `$PROJECT/.claude/settings.json` | 在 `"hooks"` 键中 |

**建议**：使用 `.claude/settings.json` 以获得跨 IDE 最大可移植性。

## 核心事件

Trae 和 Claude Code 共享：

| 事件 | 触发条件 | 使用场景 |
|------|----------|----------|
| `SessionStart` | 会话初始化 | 环境配置、上下文注入、加载项目状态 |
| `UserPromptSubmit` | 用户提示被处理前 | 拦截/增强提示、注入上下文 |
| `PreToolUse` | 工具调用执行前 | 验证、阻止或修改工具调用 |
| `PostToolUse` | 工具调用完成后 | 自动格式化、日志记录、验证结果 |
| `Stop` | 代理停止响应前 | 质量门禁，允许停止前验证输出 |

**PreToolUse/PostToolUse** 支持 `matcher`——匹配工具名称的正则模式。
**Stop** 支持 `loop_limit`——钩子可以拒绝的最大次数，之后强制停止。

## 扩展事件（Claude Code 2.1+）

| 事件 | 触发条件 | 使用场景 |
|------|----------|----------|
| `Notification` | 代理需要用户输入 | 桌面提醒 |
| `PermissionRequest` | 工具需要授权 | 自动批准安全操作 |
| `ConfigChange` | 设置被修改 | 审计跟踪 |
| `CwdChanged` | 工作目录变更 | 重新加载环境/上下文 |
| `FileChanged` | 监控文件被修改 | 热重载配置 |
| `SubagentStart` | 子代理启动 | 监控生命周期 |
| `SubagentStop` | 子代理完成 | 收集结果 |
| `PreCompact` | 上下文压缩前 | 保留关键状态 |
| `PostCompact` | 上下文压缩后 | 重新注入丢失的上下文 |

## 配置格式

```json
{
  "version": 1,
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<工具名称的正则模式>",
        "loop_limit": 5,
        "hooks": [
          {
            "type": "command",
            "command": "<shell 命令>",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

- `matcher`——可选，仅用于 PreToolUse/PostToolUse（匹配工具名称的正则）
- `loop_limit`——可选，仅用于 Stop（防止无限拒绝循环）
- `timeout`——钩子被终止前的秒数（默认：30）

## 钩子类型

| 类型 | 可用性 | 描述 |
|------|--------|------|
| `command` | 通用 | 运行 shell 脚本；接收 stdin JSON，输出 stdout |
| `prompt` | 仅 Claude Code | 发送提示给模型进行判断 |
| `agent` | 仅 Claude Code | 启动子代理进行复杂决策 |
| `http` | 仅 Claude Code | 调用 HTTP 端点 |

为最大可移植性，建议仅使用 `command` 类型。

## 输入输出契约

### 输入（stdin 上的 JSON）

所有事件接收基础载荷：

```json
{
  "session_id": "abc-123",
  "cwd": "/path/to/project",
  "hook_event_name": "PreToolUse",
  "workspace_roots": ["/path/to/project"]
}
```

事件特定字段合并到此对象中：

| 事件 | 附加字段 |
|------|----------|
| `UserPromptSubmit` | `prompt`（字符串） |
| `PreToolUse` | `tool_name`、`tool_params`（对象） |
| `PostToolUse` | `tool_name`、`tool_params`、`tool_result` |
| `Stop` | `stop_reason`、`summary` |
| `SessionStart` | `env`（对象） |

### 输出

| 格式 | 使用场景 |
|------|----------|
| stdout 上的 JSON | 结构化响应（决策、修改） |
| stdout 上的纯文本 | SessionStart（注入为上下文）、UserPromptSubmit（前置拼接） |

### 退出码

| 退出码 | 含义 |
|--------|------|
| 0 | 成功——正常继续 |
| 2 | 阻止/拒绝——拒绝该操作 |
| 其他 | 忽略——视为无操作 |

## 环境变量

| 变量 | IDE | 描述 |
|------|-----|------|
| `TRAE_PROJECT_DIR` | Trae | 项目根路径 |
| `CLAUDE_PROJECT_DIR` | Claude Code | 项目根路径 |
| `TRAE_ENV_FILE` | Trae | 在此写入环境变量以持久化会话 |
| `CLAUDE_ENV_FILE` | Claude Code | 在此写入环境变量以持久化会话 |

脚本应检查两个变体以确保可移植性：

```bash
PROJECT_DIR="${TRAE_PROJECT_DIR:-$CLAUDE_PROJECT_DIR}"
```

## 工作流技能集成

工作流技能（如 `requirement-workflow`）可以为项目生成 `hooks.json` 以强制执行阶段门禁和质量检查。

### 内部钩子触发点 → 标准事件

| 内部钩子 | 标准事件 | 策略 |
|----------|----------|------|
| `pre_stage_*` | `UserPromptSubmit` 或 `PreToolUse` | 注入阶段上下文，验证前置条件 |
| `post_stage_*` | `PostToolUse` 或 `Stop` | 验证交付物，触发下一阶段 |
| `on_error` | `PostToolUse` | 检查退出码 2；记录并暴露错误 |
| `on_blocked` | `Stop` | 返回 `{"decision": "block"}` 阻止过早停止 |

### 生成的配置模式

```json
{
  "version": 1,
  "hooks": {
    "SessionStart": [
      {
        "hooks": [{ "type": "command", "command": "node .workflow/hooks/session-init.cjs" }]
      }
    ],
    "Stop": [
      {
        "loop_limit": 3,
        "hooks": [{ "type": "command", "command": "node .workflow/hooks/quality-gate.cjs" }]
      }
    ]
  }
}
```

## 实际示例

### 编辑后自动格式化

```json
{
  "version": 1,
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CHANGED_FILE\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### 阻止危险命令

```json
{
  "version": 1,
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "RunCommand",
        "hooks": [
          {
            "type": "command",
            "command": "node .hooks/block-dangerous.cjs",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

`block-dangerous.cjs` 读取 stdin，检查 `tool_params.command` 是否匹配危险模式（`rm -rf /`、`git push --force` 等），退出码 2 进行阻止。

### 停止时的质量门禁

```json
{
  "version": 1,
  "hooks": {
    "Stop": [
      {
        "loop_limit": 3,
        "hooks": [
          {
            "type": "command",
            "command": "node .hooks/verify-output.cjs",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

脚本验证交付物是否存在、测试是否通过、或规格标准是否满足。退出码 2 强制代理继续工作。在 3 次拒绝后（`loop_limit`），代理无论如何都会停止。

### 会话上下文注入

```json
{
  "version": 1,
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat .workflow/context.md",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

纯文本输出作为会话初始上下文注入。使用此方式加载项目状态、当前阶段或待办任务。

## 最佳实践

1. **保持钩子快速**——超时默认 30 秒，但交互事件建议 < 5 秒
2. **使用 `command` 类型**——唯一跨 IDE 可移植的选项
3. **检查两套环境变量**——`TRAE_*` 和 `CLAUDE_*` 以支持跨 IDE 脚本
4. **默认退出 0**——只在明确要阻止时退出 2
5. **日志输出到 stderr**——stdout 作为输出被消费；调试信息发送到 stderr
6. **脚本需幂等**——钩子可能因重试而多次触发
