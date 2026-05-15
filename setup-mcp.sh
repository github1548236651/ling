#!/bin/bash

# Ling MCP 配置脚本

echo "🚀 配置 Ling 为 MCP Server"
echo ""

# 获取当前目录的绝对路径
LING_PATH=$(pwd)

echo "📁 Ling 项目路径: $LING_PATH"
echo ""

# 创建 MCP 配置
MCP_CONFIG=$(cat <<EOF
{
  "mcpServers": {
    "ling-agent": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "$LING_PATH",
      "env": {},
      "disabled": false,
      "autoApprove": ["read_file", "list_files", "grep", "glob"]
    }
  }
}
EOF
)

echo "📝 生成的 MCP 配置："
echo "$MCP_CONFIG"
echo ""

# 保存到临时文件
echo "$MCP_CONFIG" > mcp-config.json

echo "✅ 配置已保存到 mcp-config.json"
echo ""
echo "📋 下一步："
echo "1. 在 VS Code 中按 Cmd+Shift+P (Mac) 或 Ctrl+Shift+P (Windows/Linux)"
echo "2. 输入 'MCP: Configure Servers'"
echo "3. 选择 'Edit User MCP Settings' 或 'Edit Workspace MCP Settings'"
echo "4. 将 mcp-config.json 的内容复制到配置文件中"
echo ""
echo "或者手动编辑："
echo "  Mac/Linux: ~/.kiro/settings/mcp.json"
echo "  Windows: %USERPROFILE%\\.kiro\\settings\\mcp.json"
echo ""
echo "🧪 测试 MCP Server："
echo "  npm run mcp"
echo ""
