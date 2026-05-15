#!/bin/bash

# 安装 Ling 为全局命令

echo "🚀 安装 Ling 为全局命令"
echo ""

LING_DIR="/Users/jindun/Desktop/myCode/ling"
INSTALL_DIR="/usr/local/bin"

# 创建启动脚本
cat > /tmp/ling << 'EOF'
#!/bin/bash
LING_DIR="/Users/jindun/Desktop/myCode/ling"
WORK_DIR="${1:-$(pwd)}"
cd "$LING_DIR"
npx tsx src/ling.ts "$WORK_DIR"
EOF

# 安装到系统
sudo mv /tmp/ling "$INSTALL_DIR/ling"
sudo chmod +x "$INSTALL_DIR/ling"

echo "✅ 安装完成！"
echo ""
echo "📋 使用方法："
echo ""
echo "  # 在任何项目目录中："
echo "  cd /path/to/your/project"
echo "  ling"
echo ""
echo "  # 或指定目录："
echo "  ling /path/to/project"
echo ""
echo "🧪 测试："
echo "  cd ~"
echo "  ling"
echo ""
