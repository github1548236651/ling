import { readFile } from "fs/promises";
import type { Tool } from "./types.js";

export const readFileTool: Tool = {
  name: "read_file",
  description: "Read a file and return its content with line numbers. Supports offset and limit for reading specific ranges.",
  // schema意思就是JSON Schema，这是一种数据格式定义
  schema: {
    // 参数是一个对象，告诉LLM参数的基本类型。这个就是LLM定义的结构
    type: "object",
    properties: {
      file_path: { type: "string", description: "Absolute path to the file" },
      offset: { type: "number", description: "Start line (1-based, default: 1)" },
      limit: { type: "number", description: "Max lines to read (default: all)" },
    },
    required: ["file_path"],
  },
  async execute(params) {
    const filePath = params.file_path as string;
    // offset: 从第几行开始读（从 1 开始计数）
    // limit: 最多读取多少行
    const offset = (params.offset as number) ?? 1;
    const limit = params.limit as number | undefined;

    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n");
    const start = Math.max(0, offset - 1);
    const end = limit ? start + limit : lines.length;
    const slice = lines.slice(start, end);

    return slice
      .map((line, i) => `${String(start + i + 1).padStart(4)}\t${line}`)
      .join("\n");
  },
};

