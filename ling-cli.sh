#!/bin/bash

# Ling CLI - 在任何目录运行 Ling Agent
# 用法: ./ling-cli.sh [工作目录]

LING_DIR="/Users/jindun/Desktop/myCode/ling"
WORK_DIR="${1:-$(pwd)}"

cd "$LING_DIR"
npx tsx src/ling.ts "$WORK_DIR"
