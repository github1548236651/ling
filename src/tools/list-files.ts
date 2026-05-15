import { readdir, stat } from "fs/promises";
import { join } from "path";
import type { Tool } from "./types.js";

export const listFilesTool: Tool = {
  name: "list_files",
  description: "List files and directories in a given path. Shows type (file/dir) and size.",
  schema: {
    type: "object",
    properties: {
      path: { type: "string", description: "Directory path (default: .)" },
    },
  },
  async execute(params) {
    const dirPath = (params.path as string) ?? ".";
    // readdir，node.js文件系统模块的一部函数，用于读取目录内容
    // withFileTypes: true 的作用
    // 1.不使用withFileTypes
    // const entries = await readdir("src/tools");
    // entries = ["glob.ts", "grep.ts", "read-file.ts", ...]
    //           ↑ 只是文件名字符串
    // 2.使用 withFileTypes: true
    // const entries = await readdir("src/tools", { withFileTypes: true });
    // entries = [
    //   Dirent { name: "glob.ts", isFile: true, isDirectory: false },
    //   Dirent { name: "grep.ts", isFile: true, isDirectory: false },
    //   Dirent { name: "types.ts", isFile: true, isDirectory: false },
    // ]
    //   ↑ Dirent 对象，包含类型信息

    const entries = await readdir(dirPath, { withFileTypes: true });
    const lines: string[] = [];

    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      // join函数：拼接路径，自动处理分隔符（/ 或 \）。
      const fullPath = join(dirPath, entry.name);
      // 检查当前条目是否是目录
      if (entry.isDirectory()) {
        lines.push(`[dir]  ${entry.name}/`);
      } else {
        // stat 获取文件或目录的详细信息,返回stats对象
        const s = await stat(fullPath);
        lines.push(`[file] ${entry.name} (${s.size} bytes)`);
      }
    }
    return lines.join("\n") || "(empty directory)";
  },
};
