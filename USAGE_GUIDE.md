# Ling Agent 使用指南

## 🎯 在任何项目中使用 Ling

---

## 方式 1：全局命令（推荐）

### 安装

在 Ling 项目目录运行：
```bash
./install-global.sh
```

需要输入密码（sudo 权限）。

### 使用

**在任何项目中：**
```bash
cd /path/to/your/project
ling
```

**示例：**
```bash
cd ~/Desktop/my-app
ling

You: 读取 package.json
# ✅ 读取的是 ~/Desktop/my-app/package.json

You: 列出所有 TypeScript 文件
# ✅ 列出 my-app 项目的文件

You: 运行 npm test
# ✅ 在 my-app 项目中执行
```

---

## 方式 2：使用脚本（无需 sudo）

### 使用

在任何项目目录中：
```bash
/Users/jindun/Desktop/myCode/ling/ling-cli.sh
```

或者在你的项目中创建快捷方式：
```bash
# 在你的项目目录
ln -s /Users/jindun/Desktop/myCode/ling/ling-cli.sh ./ling
./ling
```

---

## 方式 3：VS Code Tasks（推荐用于 VS Code）

### 配置

在你的项目中创建 `.vscode/tasks.json`：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Ling Agent",
      "type": "shell",
      "command": "/Users/jindun/Desktop/myCode/ling/ling-cli.sh",
      "args": ["${workspaceFolder}"],
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "focus": true
      },
      "isBackground": false,
      "problemMatcher": []
    }
  ]
}
```

### 使用

1. 在 VS Code 中按 `Cmd+Shift+P`
2. 输入 `Tasks: Run Task`
3. 选择 `Ling Agent`
4. 在打开的终端中与 Ling 对话

---

## 方式 4：VS Code 快捷键（最方便）

### 配置

在 `.vscode/keybindings.json` 中添加：

```json
[
  {
    "key": "cmd+shift+l",
    "command": "workbench.action.tasks.runTask",
    "args": "Ling Agent"
  }
]
```

### 使用

按 `Cmd+Shift+L` 直接启动 Ling！

---

## 🎮 使用示例

### 示例 1：分析新项目

```bash
cd ~/Downloads/some-new-project
ling

You: 分析这个项目的结构
You: 读取 README.md
You: 列出所有配置文件
```

### 示例 2：代码搜索

```bash
cd ~/my-app
ling

You: 搜索所有包含 "TODO" 的文件
You: 找出所有 API 调用
You: 列出所有测试文件
```

### 示例 3：执行任务

```bash
cd ~/my-app
ling

You: 运行 npm install
You: 执行测试
You: 查看 git 状态
```

### 示例 4：编辑代码

```bash
cd ~/my-app
ling

You: 在 src/utils.ts 中添加一个新函数
You: 修改 package.json，添加新的 script
You: 创建 .gitignore 文件
```

---

## 🔧 工作原理

### 修改前（❌ 问题）
```bash
cd /Users/jindun/Desktop/myCode/ling && npm start
# Ling 工作在 ling 项目目录
# 读取的是 ling 项目的文件
```

### 修改后（✅ 正确）
```bash
cd /path/to/your/project
ling
# Ling 工作在 your/project 目录
# 读取的是 your/project 的文件
```

### 技术实现

修改了 `src/ling.ts`，添加了工作目录参数：
```typescript
const workDir = process.argv[2];
if (workDir) {
  process.chdir(workDir);
}
```

---

## 📊 对比

| 方式 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| 全局命令 | 最方便，任何地方都能用 | 需要 sudo | ⭐⭐⭐⭐⭐ |
| 脚本 | 无需 sudo | 路径较长 | ⭐⭐⭐⭐ |
| VS Code Tasks | 集成在编辑器中 | 需要配置 | ⭐⭐⭐⭐⭐ |
| VS Code 快捷键 | 一键启动 | 需要配置 | ⭐⭐⭐⭐⭐ |

---

## 🎓 推荐工作流

### 日常使用（推荐）

1. **安装全局命令**：`./install-global.sh`
2. **在任何项目中**：直接运行 `ling`

### VS Code 用户（推荐）

1. **配置 Tasks**（见方式 3）
2. **配置快捷键**（见方式 4）
3. **按快捷键启动**：`Cmd+Shift+L`

---

## 🚀 下一步

1. **选择一种方式安装**
2. **在另一个项目中测试**
3. **享受 AI 编程助手！**

---

## 💡 提示

- Ling 会在**你指定的目录**中执行所有操作
- 所有工具（读写文件、执行命令）都在**当前项目**中运行
- 可以同时在多个项目中启动 Ling（不同终端）

现在试试吧！🎉
