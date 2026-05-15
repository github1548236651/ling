# 将 Ling 打包为 VS Code 扩展

## 🎯 目标

创建一个 VS Code 扩展，让 Ling 可以在任何项目中使用，类似 GitHub Copilot Chat。

---

## 📋 实现步骤

### 方案 A：快速方案 - 使用终端集成（推荐）

最简单的方式：在 VS Code 中打开集成终端，直接运行 Ling。

#### 使用方法：

1. **在任何项目中打开 VS Code**
2. **打开终端**（`` Ctrl+` `` 或 `View > Terminal`）
3. **运行 Ling**：
   ```bash
   cd /Users/jindun/Desktop/myCode/ling
   npm start
   ```
4. **开始对话**：
   ```
   You: 读取当前项目的 package.json
   ```

**优点：**
- ✅ 无需开发扩展
- ✅ 立即可用
- ✅ 所有工具都能用

**缺点：**
- ❌ 需要手动切换目录
- ❌ 没有图形界面

---

### 方案 B：创建 VS Code 扩展（完整方案）

如果你想要完整的扩展体验（侧边栏、聊天界面等），需要开发 VS Code 扩展。

#### 技术栈：
- VS Code Extension API
- Webview（聊天界面）
- 你现有的 Ling Agent 逻辑

#### 开发时间：
- 基础版本：2-3 天
- 完整版本：1-2 周

#### 需要学习：
1. VS Code Extension 开发
2. Webview API
3. Extension 打包和发布

---

### 方案 C：使用 Web 版本（最佳体验）

你已经有了 Web 版本！可以在任何项目中使用：

#### 使用方法：

1. **启动 Ling 服务器**（在 Ling 项目目录）：
   ```bash
   cd /Users/jindun/Desktop/myCode/ling
   npm run dev
   ```

2. **在浏览器中打开**：
   ```
   http://localhost:3000
   ```

3. **在任何项目中使用**：
   - Ling 的工具会在 Ling 项目目录执行
   - 但你可以通过 `bash` 工具切换目录：
   ```
   You: 切换到 /path/to/other/project 并读取 package.json
   ```

**优点：**
- ✅ 已经实现
- ✅ 美观的界面
- ✅ 流式输出
- ✅ 立即可用

**缺点：**
- ❌ 需要在浏览器中使用
- ❌ 工具默认在 Ling 项目目录执行

---

## 🚀 推荐方案

### 立即可用：方案 A（终端）或方案 C（Web）

### 如果你想开发扩展：

我可以帮你创建一个基础的 VS Code 扩展脚手架，包含：
- 侧边栏聊天界面
- 集成你的 Ling Agent
- 基本的工具调用

**需要确认：**
1. 你是否有 VS Code 扩展开发经验？
2. 你想要什么样的界面？（侧边栏 / 命令面板 / 编辑器内嵌）
3. 预计投入多少时间开发？

---

## 💡 临时解决方案

在开发扩展之前，你可以：

### 1. 创建全局命令（推荐）

让 Ling 可以在任何目录运行：

```bash
# 在 Ling 项目中
npm link

# 然后在任何项目中
ling "你的问题"
```

### 2. 使用 VS Code Tasks

在任何项目的 `.vscode/tasks.json` 中添加：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Ling Agent",
      "type": "shell",
      "command": "cd /Users/jindun/Desktop/myCode/ling && npm start",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

然后：`Terminal > Run Task > Start Ling Agent`

---

## 🎓 下一步

**告诉我你想要哪个方案：**

- **A** - 使用终端（立即可用）
- **B** - 开发 VS Code 扩展（需要时间）
- **C** - 使用 Web 版本（立即可用）
- **D** - 创建全局命令（5 分钟配置）

我会根据你的选择提供详细指导！
