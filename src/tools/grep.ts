import { execFile } from "child_process";
import { promisify } from "util";
import type { Tool } from "./types.js";

// 直接执行指定的可执行文件，不通过shell。
const exec = promisify(execFile);

// 这个工具的作用是搜索文件内容，当然，搜文件还需要指定目录
export const grepTool: Tool = {
  name: "grep",
  // regex pattern 正则表达式， matching匹配
  description: "Search file contents using regex pattern. Returns matching lines with file paths and line numbers.",
  schema: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Regex pattern to search" },
      //指定搜索的目录或文件，默认值 "."(当前目录)
      path: { type: "string", description: "Directory or file to search in (default: .)" },
      // 文件名过滤器
      glob: { type: "string", description: "File glob filter, e.g. '*.ts'" },
    },
    required: ["pattern"],
  },
  async execute(params) {
    const pattern = params.pattern as string;
    const path = (params.path as string) ?? ".";
    // 构建grep命令的参数数组
    // -rn = -r + -n； -r：递归搜索子目录； -n:显示行号
    const args = ["-rn", "--color=never", "-E", pattern, path];
    if (params.glob) args.splice(1, 0, `--include=${params.glob}`);

    try {
      // { maxBuffer: 1024 * 1024 }  // 1MB = 1,048,576 字节
      const { stdout } = await exec("grep", args, { maxBuffer: 1024 * 1024 });
      // trimEnd移除字符串末尾的空白字符（空格、换行等，比如\n）
      const lines = stdout.trimEnd().split("\n");
      return lines.length > 100 ? lines.slice(0, 100).join("\n") + `\n... (${lines.length} total matches)` : stdout.trimEnd();
    } catch {
      return "No matches found.";
    }
  },
};
