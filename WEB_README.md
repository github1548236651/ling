# Ling AI Agent - Web 版本

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
npm run install:web
```

### 2. 启动项目

#### 方式一：同时启动前后端（推荐）
```bash
npm run dev
```

这会同时启动：
- 后端 API 服务器：http://localhost:3001
- 前端 React 应用：http://localhost:3000

#### 方式二：分别启动

**终端 1 - 启动后端：**
```bash
npm run server
```

**终端 2 - 启动前端：**
```bash
npm run web
```

### 3. 使用

打开浏览器访问 http://localhost:3000，你会看到一个聊天界面。

尝试问一些问题：
- "读取 package.json 并总结这个项目"
- "列出当前目录的所有文件"
- "README.md 里写了什么？"

## 📁 项目结构

```
.
├── src/
│   ├── ling.ts          # 原始命令行版本
│   └── server.ts        # Express API 服务器（SSE 流式响应）
├── web/
│   ├── src/
│   │   ├── App.tsx      # React 主组件
│   │   ├── App.css      # 样式
│   │   ├── main.tsx     # React 入口
│   │   └── index.css    # 全局样式
│   ├── index.html       # HTML 模板
│   ├── vite.config.ts   # Vite 配置
│   └── package.json     # 前端依赖
├── package.json         # 后端依赖
└── .env                 # 环境变量
```

## 🎯 功能特性

✅ **流式输出** - AI 回复像打字机一样逐字显示  
✅ **工具调用** - 可以读取文件和执行命令  
✅ **实时反馈** - 显示工具调用过程  
✅ **美观界面** - 渐变色设计，响应式布局  
✅ **对话历史** - 支持多轮对话  

## 🛠️ 技术栈

**后端：**
- Node.js + TypeScript
- Express.js
- OpenAI SDK
- Server-Sent Events (SSE)

**前端：**
- React 18
- TypeScript
- Vite
- CSS3

## 📝 命令行版本

如果你想使用原始的命令行版本：

```bash
npm start "你的问题"
```

例如：
```bash
npm start "读取 package.json"
```
