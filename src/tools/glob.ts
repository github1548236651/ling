import { glob } from "glob";
import type { Tool } from "./types.js";

// 文件名匹配
export const globTool: Tool = {
  name: "glob",
  description: "Find files matching a glob pattern. Returns a list of matching file paths.",
  schema: {
    type: "object",
    properties: {
      // Glob 模式字符串
      // "*.ts"           // 当前目录的所有 .ts 文件
      // "src/**/*.ts"    // src 目录及子目录的所有 .ts 文件
      // "**/*.json"      // 所有目录的 .json 文件
      // "test/*.test.js" // test 目录的测试文件
      pattern: { type: "string", description: "Glob pattern, e.g. 'src/**/*.ts'" },
      // cwd 指定从哪个目录开始搜索
      // cwd: "."           // 从当前目录开始
      // cwd: "src"         // 从 src 目录开始
      // cwd: "/absolute"   // 从绝对路径开始
      cwd: { type: "string", description: "Base directory (default: .)" },
    },
    required: ["pattern"],
  },
  async execute(params) {
    const pattern = params.pattern as string;
    const cwd = (params.cwd as string) ?? ".";

    const files = await glob(pattern, { cwd, nodir: true });
    if (files.length === 0) return "No files matched.";
    return files.sort().join("\n");
  },
};
