import { readdirSync, statSync } from "fs";
import { join } from "path";

// 测试目录（当前项目）
const cwd = process.cwd();
console.log('📁 当前工作目录:', cwd);
console.log('');

// 1. 读取目录内容
const entries = readdirSync(cwd).sort();
console.log('📋 目录内容 (共 ' + entries.length + ' 项):');
console.log(entries);
console.log('');

// 2. 测试过滤功能
const IGNORE = new Set(["node_modules", ".git", "dist", "build"]);
const filtered = entries.filter((e) => !IGNORE.has(e));
console.log('🔍 过滤后 (移除 node_modules, .git 等):');
console.log(filtered);
console.log('');

// 3. 测试前 20 个
const limited = filtered.slice(0, 20);
// console.log('📊 限制前 20 个:');
// console.log(limited);
// console.log('');

// 4. 测试文件/目录区分
console.log('📂 详细信息:');
for (const entry of limited.slice(0, 10)) {  // 只显示前 10 个
  const fullPath = join(cwd, entry);
  const stat = statSync(fullPath);
  const type = stat.isDirectory() ? '📁 目录' : '📄 文件';
  const suffix = stat.isDirectory() ? '/' : '';
  console.log(`  ${type}: ${entry}${suffix}`);
}
console.log('');

// 5. 测试缩进
console.log('🌳 缩进测试:');
const indent0 = "";
const indent1 = "  ";
const indent2 = "    ";
console.log(`${indent0}src/`);
console.log(`${indent1}ling.ts`);
console.log(`${indent1}tools/`);
console.log(`${indent2}bash.ts`);
console.log(`${indent2}grep.ts`);
console.log('');

// 6. 测试完整的目录树函数
function getDirectoryTree(cwd: string, maxDepth = 2, prefix = ""): string {
  const IGNORE = new Set(["node_modules", ".git", "dist", "build", "__pycache__", ".next", "vendor"]);
  const lines: string[] = [];

  function walk(dir: string, depth: number, indent: string) {
    if (depth > maxDepth) return;
    
    const entries = readdirSync(dir).filter((e) => !IGNORE.has(e)).sort();

    for (const entry of entries.slice(0, 20)) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      lines.push(`${indent}${entry}${stat.isDirectory() ? "/" : ""}`);
      if (stat.isDirectory()) walk(fullPath, depth + 1, indent + "  ");
    }
    if (entries.length > 20) lines.push(`${indent}... (${entries.length - 20} more)`);
  }

  walk(cwd, 0, prefix);
  return lines.join("\n");
}

console.log('🌲 完整目录树 (深度=2):');
const tree = getDirectoryTree(cwd, 2);
console.log(tree);


// // 7. 测试不同深度
// console.log('\n🔢 测试不同深度:');
// console.log('\n深度=1:');
// console.log(getDirectoryTree(cwd, 1));

// console.log('\n深度=3:');
// console.log(getDirectoryTree(cwd, 3));
