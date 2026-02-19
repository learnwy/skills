# Requirement Workflow Usage Examples

实际使用示例，展示如何使用 requirement-workflow skill。

## Quick Start / 快速开始

### 1. 初始化工作流

```bash
# L1 快速修复
./scripts/init-workflow.sh -r /project -n "fix-login-bug" -t bugfix -l L1

# L2 标准功能 (默认)
./scripts/init-workflow.sh -r /project -n "user-avatar-upload" -t feature

# L3 安全功能
./scripts/init-workflow.sh -r /project -n "oauth-integration" -t feature -l L3
```

### 2. 查看状态

```bash
./scripts/get-status.sh -r /project
./scripts/get-status.sh -r /project --history
./scripts/get-status.sh -r /project --json
```

### 3. 推进阶段

```bash
./scripts/advance-stage.sh -r /project                 # 自动下一阶段
./scripts/advance-stage.sh -r /project --to TESTING    # 指定阶段
./scripts/advance-stage.sh -r /project --validate      # 仅验证
```

### 4. 生成报告

```bash
./scripts/generate-report.sh -r /project
./scripts/generate-report.sh -r /project --format json
./scripts/generate-report.sh -r /project --include-logs
```

---

## Example 1: Bug Fix (L1)

### 场景
用户报告登录按钮点击无响应。

### AI 对话流程

```
User: 登录按钮点击没反应，帮我修一下

AI: 这是一个明确的 bug，我使用 L1 快速流程。

[执行] ./scripts/init-workflow.sh -r /project -n "fix-login-button" -t bugfix -l L1

✅ Workflow: 20240115_001_bugfix_fix-login-button

[PLANNING] 
分析代码发现 onClick handler 有 typo...

📋 任务:
1. 修复 LoginButton.tsx 函数名

[IMPLEMENTING]
修改: handleLgoin → handleLogin

[TESTING]
- ✅ TypeScript 通过
- ✅ ESLint 通过
- ✅ 测试通过

[DONE]
✅ Bug 已修复，用时约 5 分钟
```

---

## Example 2: New Feature (L2)

### 场景
需要实现用户头像上传功能。

### AI 对话流程

```
User: 我需要实现一个用户头像上传功能

AI: 这是标准功能开发，我使用 L2 标准流程。

[执行] ./scripts/init-workflow.sh -r /project -n "user-avatar-upload" -t feature

✅ Workflow: 20240115_002_feature_user-avatar-upload

[ANALYZING]
需要澄清:
- 文件大小限制?
- 支持格式?
- 是否需要裁剪?

User: 2MB, jpg/png, 需要圆形裁剪

AI: 明白，更新 spec.md...

[PLANNING]
任务列表:
1. 创建 AvatarUploader 组件
2. 添加 ImageCropper 组件
3. 实现上传 API
4. 集成存储服务
5. 更新 Profile 页面
6. 添加测试

[DESIGNING]
API: POST /api/users/avatar
存储: S3 /avatars/{userId}/{timestamp}.{ext}

[IMPLEMENTING]
✅ 任务 1-6 完成

[TESTING]
- ✅ 单元测试 12/12
- ✅ 覆盖率 75%

[DELIVERING]
生成报告...

[DONE]
✅ 功能完成，用时 3h 45m
```

---

## Example 3: Security Feature (L3)

### 场景
需要集成 OAuth 2.0 第三方登录。

### AI 对话流程

```
User: 需要集成 OAuth 2.0 支持 Google/GitHub 登录

AI: 这是安全敏感功能，我使用 L3 完整流程。

[执行] ./scripts/init-workflow.sh -r /project -n "oauth-integration" -t feature -l L3

✅ Workflow: 20240115_003_feature_oauth-integration

[ANALYZING - Extended]
执行威胁建模 (STRIDE):
- Spoofing: 高风险 → 验证 OAuth state
- Token 泄露: 高风险 → HttpOnly Cookie

影响分析:
- Auth Service, User Service, Frontend
- 需要协调安全团队

[PLANNING - Extended]
时间线: ~5天
回滚策略: Feature Flag

[DESIGNING - Extended]
安全设计:
- State: 加密随机数 + 时间戳
- Token: 加密存储
- Scope: 最小权限

🔒 需要审批:
- [ ] 安全团队
- [ ] Tech Lead

User: 都已审批

[IMPLEMENTING]
启用安全扫描器...
执行开发任务...

[TESTING - Extended]
安全测试:
- ✅ CSRF 测试
- ✅ Token 安全测试
- ✅ SAST 扫描

[DELIVERING - Extended]
安全签字:
- ✅ 安全团队
- ✅ Tech Lead

[DONE]
✅ OAuth 集成完成，用时 5天
```

---

## Example 4: 继续现有工作流

### 场景
之前创建的工作流需要继续。

### AI 对话流程

```
User: 继续之前的用户头像开发

AI: 让我检查当前工作流状态...

[执行] ./scripts/get-status.sh -r /project

📊 当前状态:
- Workflow: user-avatar-upload
- 级别: L2
- 状态: IMPLEMENTING
- 进度: 60%
- 当前任务: 实现上传 API

继续执行任务 3...
```

---

## Example 5: 查看进度

```
User: 当前开发进度怎么样了

AI:
[执行] ./scripts/get-status.sh -r /project

📋 Workflow: user-avatar-upload
📊 Level: L2 (Standard)
🔄 Status: IMPLEMENTING
📍 Stage: 4/7 (57%)
📝 Current: 实现上传 API
⏰ Duration: 2h 15m

Progress: [████████████░░░░░░░░] 57%

下一步:
1. 完成上传 API
2. 集成存储服务
```

---

## 脚本参数速查

### init-workflow.sh

```bash
./scripts/init-workflow.sh -r <root> -n <name> [OPTIONS]

必需:
  -r, --root DIR      项目根目录
  -n, --name NAME     需求名称 (英文, 短横线连接)

可选:
  -t, --type TYPE     feature|bugfix|refactor|hotfix (默认: feature)
  -l, --level LEVEL   L1|L2|L3 (默认: L2)
  -d, --description   简要描述
  --tags TAGS         逗号分隔的标签
```

### get-status.sh

```bash
./scripts/get-status.sh -r <root> [OPTIONS]

必需:
  -r, --root DIR      项目根目录

可选:
  -p, --path DIR      指定工作流路径 (覆盖活动工作流)
  --history           显示状态历史
  --json              JSON 格式输出
```

### advance-stage.sh

```bash
./scripts/advance-stage.sh -r <root> [OPTIONS]

必需:
  -r, --root DIR      项目根目录

可选:
  -p, --path DIR      指定工作流路径
  -t, --to STAGE      目标阶段
  --validate          仅验证不转换
  --force             强制转换
```

### inject-skill.sh

```bash
./scripts/inject-skill.sh -r <root> --hook <hook> --skill <skill> [OPTIONS]

必需:
  -r, --root DIR      项目根目录

操作:
  --hook HOOK         钩子点
  --skill SKILL       技能名
  --list              列出已注入技能
  --remove            移除技能

可选:
  --config JSON       技能配置
  --required          标记为必需
  --order N           执行顺序
```

### generate-report.sh

```bash
./scripts/generate-report.sh -r <root> [OPTIONS]

必需:
  -r, --root DIR      项目根目录

可选:
  -p, --path DIR      指定工作流路径
  --format FORMAT     markdown|json|text (默认: markdown)
  --output FILE       输出文件
  --include-logs      包含日志
  --notify            发送通知
```

---

## 常见问题

### Q: 如何手动指定级别?

```bash
./scripts/init-workflow.sh -r /project -n "simple-task" -l L3
```

### Q: 如何覆盖活动工作流?

```bash
./scripts/get-status.sh -r /project -p /project/.trae/workflow/xxx
```

### Q: 如何强制推进阶段?

```bash
./scripts/advance-stage.sh -r /project --to TESTING --force
```

### Q: 工作流卡住了怎么办?

```bash
# 检查状态
./scripts/get-status.sh -r /project --history

# 强制推进
./scripts/advance-stage.sh -r /project --force
```
