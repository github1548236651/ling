# 在 VS Code 中使用 Ling Agent

## 🎯 方案：通过 MCP 集成到 Kiro

将 Ling 作为 MCP Server，让 Kiro 可以调用它的所有工具。

---

## 📋 配置步骤

### 1. 确保 Ling 项目已配置好

确保 `.env` 文件配置正确：
```env
LLM_API_KEY=你的API密钥
LLM_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
LLM_MODEL=doubao-seed-2-0-pro-260215
```

### 2. 测试 MCP Server

在 Ling 项目目录运行：
```bash
npm run mcp
```

应该看到：
```
Ling MCP Server running on stdio
```

按 `Ctrl+C` 退出。

### 3. 在 Kiro 中配置 MCP

#### 方式 A：通过 Kiro 命令面板（推荐）

1. 在 VS Code 中按 `Cmd+Shift+P`（Mac）或 `Ctrl+Shift+P`（Windows/Linux）
2. 输入 `MCP: Configure Servers`
3. 选择 `Edit User MCP Settings` 或 `Edit Workspace MCP Settings`

#### 方式 B：手动编辑配置文件

**用户级配置（所有项目可用）：**
```bash
# Mac/Linux
~/.kiro/settings/mcp.json

# Windows
%USERPROFILE%\.kiro\settings\mcp.json
```

**工作区配置（仅当前项目）：**
```bash
<你的项目>/.kiro/settings/mcp.json
```

### 4. 添加 Ling 配置

在 `mcp.json` 中添加：

```json
{
  "mcpServers": {
    "ling-agent": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/Users/jindun/Desktop/myCode/ling",
      "env": {},
      "disabled": false,
      "autoApprove": ["read_file", "list_files", "grep", "glob"]
    }
  }
}
```

**重要：** 将 `cwd` 路径改为你的 Ling 项目实际路径！

### 5. 重启 MCP Server

在 VS Code 中：
1. 打开 Kiro 侧边栏
2. 找到 "MCP Servers" 面板
3. 点击 "ling-agent" 旁边的刷新按钮

或者重启 VS Code。

---

## 🎮 使用方式

### 在任何项目中使用 Ling 的工具

打开任何项目，在 Kiro 聊天中：

```
You: 使用 ling-agent 的 read_file 工具读取 package.json

Kiro: [调用 ling-agent 的 read_file 工具]
```

### 可用工具

Ling 提供以下工具：

| 工具名 | 功能 | 示例 |
|--------|------|------|
| `read_file` | 读取文件 | 读取 src/index.ts |
| `write_file` | 写入文件 | 创建新文件 |
| `edit_file` | 编辑文件 | 修改代码 |
| `grep` | 搜索内容 | 搜索包含 "TODO" 的代码 |
| `glob` | 匹配文件 | 列出所有 .ts 文件 |
| `bash` | 执行命令 | 运行 npm test |
| `list_files` | 列出文件 | 查看目录结构 |
| `ask_user` | 询问用户 | 需要确认时使用 |

### 自动批准工具

配置中的 `autoApprove` 列表中的工具会自动执行，不需要手动确认：
- `read_file` - 读取文件（安全）
- `list_files` - 列出文件（安全）
- `grep` - 搜索（安全）
- `glob` - 文件匹配（安全）

其他工具（如 `write_file`、`bash`）会提示确认。

---

## 🔧 故障排查

### 问题 1：MCP Server 无法启动

**检查：**
```bash
cd /Users/jindun/Desktop/myCode/ling
npm run mcp
```

如果报错，检查：
- `.env` 文件是否存在
- 依赖是否安装完整：`npm install`

### 问题 2：Kiro 找不到工具

**解决：**
1. 在 VS Code 中打开 "MCP Servers" 面板
2. 检查 "ling-agent" 状态是否为 "Connected"
3. 如果是 "Disconnected"，点击刷新按钮

### 问题 3：工具执行失败

**检查 cwd 路径：**
- 确保 `mcp.json` 中的 `cwd` 是 Ling 项目的**绝对路径**
- Mac/Linux: `/Users/你的用户名/Desktop/myCode/ling`
- Windows: `C:\\Users\\你的用户名\\Desktop\\myCode\\ling`

---

## 🎓 进阶使用

### 在其他项目中测试

1. 在 VS Code 中打开任何项目（不是 Ling 项目）
2. 打开 Kiro 聊天
3. 尝试：

```
You: 使用 ling-agent 读取这个项目的 README.md

You: 用 ling-agent 搜索所有包含 "TODO" 的文件

You: 让 ling-agent 列出所有 TypeScript 文件
```

### 组合使用

Kiro 可以同时使用自己的工具和 Ling 的工具：

```
You: 分析这个项目的结构，并用 ling-agent 的工具读取关键文件
```

---

## 📚 总结

✅ Ling 现在是一个 MCP Server  
✅ 可以在任何 VS Code 项目中通过 Kiro 调用  
✅ 所有工具（读写文件、搜索、执行命令）都可用  
✅ 配置一次，到处使用  

**下一步：** 在另一个项目中打开 VS Code，试试让 Kiro 调用 Ling 的工具！
