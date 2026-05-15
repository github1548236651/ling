import { resolve, dirname } from "path";

console.log("🧪 测试 resolve() 的作用\n");

// 1. 测试相对路径
console.log("1️⃣ 相对路径:");
console.log("  输入: './src'");
console.log("  输出:", resolve("./src"));
console.log("");

console.log("  输入: '.'");
console.log("  输出:", resolve("."));
console.log("");

console.log("  输入: '../'");
console.log("  输出:", resolve("../"));
console.log("");

// 2. 测试绝对路径
console.log("2️⃣ 绝对路径:");
const absPath = "/Users/jindun/Desktop/myCode/ling";
console.log("  输入:", absPath);
console.log("  输出:", resolve(absPath));
console.log("");

// 3. 测试向上遍历（没有 resolve）
console.log("3️⃣ 向上遍历 - 没有 resolve() (错误示例):");
let dir1 = "./src";
console.log("  起始:", dir1);
for (let i = 0; i < 5; i++) {
  dir1 = dirname(dir1);
  console.log(`  第 ${i + 1} 次 dirname:`, dir1);
  if (i > 0 && dir1 === ".") {
    console.log("  ❌ 陷入死循环！一直是 '.'");
    break;
  }
}
console.log("");

// 4. 测试向上遍历（有 resolve）
console.log("4️⃣ 向上遍历 - 有 resolve() (正确示例):");
let dir2 = resolve("./src");
console.log("  起始:", dir2);
for (let i = 0; i < 5; i++) {
  const parent = dirname(dir2);
  console.log(`  第 ${i + 1} 次 dirname:`, parent);
  if (parent === dir2) {
    console.log("  ✅ 到达根目录，停止");
    break;
  }
  dir2 = parent;
}
console.log("");

// 5. 模拟 loadLingMd 的查找过程
console.log("5️⃣ 模拟查找 .ling.md:");
let searchDir = resolve("./src/tools");
console.log("  从目录开始:", searchDir);
let count = 0;
while (true) {
  count++;
  console.log(`  [${count}] 查找: ${searchDir}/.ling.md`);
  
  const parent = dirname(searchDir);
  if (parent === searchDir) {
    console.log("  ✅ 到达根目录，停止查找");
    break;
  }
  
  searchDir = parent;
  
  if (count >= 10) {
    console.log("  (限制 10 次，实际会继续到根目录)");
    break;
  }
}
