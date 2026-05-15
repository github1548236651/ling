import { resolve, dirname, join } from "path";
import { existsSync } from "fs";

console.log("🧪 测试 .ling.md 查找范围\n");

// 模拟原始版本（查找到根目录）
function loadLingMdOld(cwd: string): string[] {
  const results: string[] = [];
  let dir = resolve(cwd);
  let count = 0;

  console.log("❌ 原始版本（查找到根目录）:");
  while (true) {
    count++;
    const filePath = join(dir, ".ling.md");
    console.log(`  [${count}] 查找: ${filePath}`);
    results.push(filePath);

    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
    
    if (count >= 10) {
      console.log("  ... (省略更多)");
      break;
    }
  }
  console.log(`  总共查找: ${count}+ 个位置\n`);
  return results;
}

// 模拟改进版本（限制到 Git 仓库）
function loadLingMdNew(cwd: string): string[] {
  const results: string[] = [];
  let dir = resolve(cwd);
  let count = 0;

  console.log("✅ 改进版本（限制到 Git 仓库）:");
  while (true) {
    count++;
    const filePath = join(dir, ".ling.md");
    console.log(`  [${count}] 查找: ${filePath}`);
    results.push(filePath);

    // 检查是否有 .git 目录
    const gitDir = join(dir, ".git");
    if (existsSync(gitDir)) {
      console.log(`  ✅ 找到 .git 目录: ${gitDir}`);
      console.log(`  🛑 停止向上查找`);
      break;
    }

    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  console.log(`  总共查找: ${count} 个位置\n`);
  return results;
}

// 测试
const testDir = resolve("./src/tools");
console.log(`📁 测试目录: ${testDir}\n`);

loadLingMdOld(testDir);
loadLingMdNew(testDir);

// 对比
console.log("📊 对比:");
console.log("  原始版本: 会查找到系统根目录 (/, C:\\)");
console.log("  改进版本: 只查找到 Git 仓库根目录");
console.log("");
console.log("💡 优点:");
console.log("  ✅ 避免读取用户主目录的配置");
console.log("  ✅ 避免读取系统根目录");
console.log("  ✅ 性能更好（查找层级更少）");
console.log("  ✅ 更符合项目隔离的原则");
