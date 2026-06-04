import { readFileSync } from "fs";

console.log("🧪 测试 process.argv 和 process.chdir()\n");

// ========== 第 1 部分：process.argv ==========
console.log("1️⃣ process.argv 详解:");
console.log("=".repeat(60));
console.log("process.argv 是一个数组，包含所有命令行参数\n");

console.log("当前 process.argv 的值:");
process.argv.forEach((arg, index) => {
  let description = "";
  if (index === 0) description = "← Node.js 可执行文件路径";
  if (index === 1) description = "← 当前脚本文件路径";
  if (index === 2) description = "← 第一个用户参数";
  if (index === 3) description = "← 第二个用户参数";
  
  console.log(`  [${index}] ${arg} ${description}`);
});
console.log("");

// ========== 第 2 部分：获取用户参数 ==========
console.log("2️⃣ 获取用户参数:");
console.log("=".repeat(60));

const workDir = process.argv[2];
console.log("代码: const workDir = process.argv[2];");
console.log(`结果: workDir = ${workDir || "(未提供)"}`);
console.log("");

if (!workDir) {
  console.log("💡 提示: 运行时可以传入参数:");
  console.log("  npx tsx src/test-argv-chdir.ts /path/to/directory");
  console.log("");
}

// ========== 第 3 部分：process.cwd() ==========
console.log("3️⃣ process.cwd() - 获取当前工作目录:");
console.log("=".repeat(60));

console.log("初始工作目录:", process.cwd());
console.log("");

// ========== 第 4 部分：process.chdir() ==========
console.log("4️⃣ process.chdir() - 改变当前工作目录:");
console.log("=".repeat(60));

if (workDir) {
  console.log(`尝试切换到: ${workDir}`);
  try {
    process.chdir(workDir);
    console.log("✅ 切换成功！");
    console.log("新的工作目录:", process.cwd());
  } catch (err) {
    console.log("❌ 切换失败:", (err as Error).message);
  }
} else {
  console.log("演示: 切换到上级目录");
  const originalDir = process.cwd();
  process.chdir("..");
  console.log("原始目录:", originalDir);
  console.log("新目录:", process.cwd());
  
  // 切换回去
  process.chdir(originalDir);
  console.log("切换回去:", process.cwd());
}
console.log("");

// ========== 第 5 部分：工作目录的影响 ==========
console.log("5️⃣ 工作目录对文件操作的影响:");
console.log("=".repeat(60));

console.log("当前工作目录:", process.cwd());
console.log("");

console.log("示例: 读取相对路径 'package.json'");
try {
  const pkg = readFileSync("package.json", "utf-8");
  const pkgJson = JSON.parse(pkg);
  console.log("✅ 成功读取!");
  console.log(`   项目名: ${pkgJson.name || "(无)"}`);
  console.log(`   实际读取的文件: ${process.cwd()}/package.json`);
} catch (err) {
  console.log("❌ 读取失败:", (err as Error).message);
  console.log(`   尝试读取: ${process.cwd()}/package.json`);
}
console.log("");

// ========== 第 6 部分：完整流程演示 ==========
console.log("6️⃣ 完整流程演示 (Ling 的工作方式):");
console.log("=".repeat(60));

console.log("场景: 用户在项目 A 中运行 Ling");
console.log("");
console.log("命令: ling /Users/jindun/Desktop/project-a");
console.log("");
console.log("流程:");
console.log("  1. process.argv[2] = '/Users/jindun/Desktop/project-a'");
console.log("  2. process.chdir('/Users/jindun/Desktop/project-a')");
console.log("  3. 现在所有文件操作都在 project-a 中进行");
console.log("");
console.log("示例操作:");
console.log("  - readFileSync('package.json')");
console.log("    → 读取 /Users/jindun/Desktop/project-a/package.json");
console.log("  - readdirSync('.')");
console.log("    → 列出 /Users/jindun/Desktop/project-a 的内容");
console.log("  - execSync('git status')");
console.log("    → 在 /Users/jindun/Desktop/project-a 中执行");
console.log("");

// ========== 总结 ==========
console.log("📚 总结:");
console.log("=".repeat(60));
console.log("✅ process.argv[0] = Node.js 可执行文件");
console.log("✅ process.argv[1] = 当前脚本文件");
console.log("✅ process.argv[2] = 第一个用户参数");
console.log("✅ process.cwd() = 获取当前工作目录");
console.log("✅ process.chdir(path) = 改变当前工作目录");
console.log("");
console.log("💡 关键点:");
console.log("   改变工作目录后，所有相对路径操作都基于新目录！");
