console.log("🧪 测试空字符串在 join() 中的作用\n");

// 模拟多个 .ling.md 文件
const lingMds = [
    { path: "/project/.ling.md", content: "这是项目根目录的配置\n包含一些全局规则" },
    { path: "/project/src/.ling.md", content: "这是 src 目录的配置\n包含代码风格要求" },
    { path: "/project/src/tools/.ling.md", content: "这是 tools 目录的配置\n包含工具开发规范" }
];

// 版本 1：没有空字符串
console.log("❌ 版本 1：没有空字符串（挤在一起）");
console.log("=".repeat(50));
const parts1: string[] = ["## Project Instructions"];
for (const md of lingMds) {
    parts1.push(`<!-- source: ${md.path} -->`);
    parts1.push(md.content);
    // 没有 parts1.push("");
}
console.log(parts1.join("\n"));
console.log("\n");

// 版本 2：有空字符串
console.log("✅ 版本 2：有空字符串（清晰分隔）");
console.log("=".repeat(50));
const parts2: string[] = ["## Project Instructions"];
for (const md of lingMds) {
    parts2.push(`<!-- source: ${md.path} -->`);
    parts2.push(md.content);
    parts2.push("");  // 🔑 添加空字符串
}
console.log(parts2.join("\n"));
console.log("\n");

// 解释原理
console.log("📚 原理解释:");
console.log("=".repeat(50));
console.log("parts.join('\\n') 会在每个元素之间插入换行符");
console.log("");
console.log("示例:");
console.log("  ['A', 'B', 'C'].join('\\n')");
console.log("  输出: A\\nB\\nC");
console.log("");
console.log("  ['A', 'B', '', 'C'].join('\\n')");
console.log("  输出: A\\nB\\n\\nC  ← 注意中间有两个 \\n（空行）");
console.log("");
console.log("💡 空字符串 '' 在 join('\\n') 后会产生一个空行！");
