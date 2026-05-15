// readline是node.js内置模块，用于从命令行读取用户输入
import * as readline from "readline";
import type { Tool } from "./types.js";

export const askUserTool: Tool = {
    name: "ask_user",
    description: "Ask the user a question and wait for their response. Use when you need clarification or confirmation.",
    schema: {
        type: "object",
        properties: {
            question: { type: "string", description: "The question to ask" },
        },
        required: ["question"],
    },
    // execute是执行程序
    // 抽取出工具的目的是什么
    async execute(params) {
        const question = params.question as string;
         // 创建 readline 接口
        const rl = readline.createInterface({
            input: process.stdin,   // 从标准输入读取（键盘）
            output: process.stderr, // 用 stderr 显示提示，stdout 留给程序输出
        });
        return new Promise<string>((resolve) => {
            rl.question(`\n🤖 Agent asks: ${question}\n> `, (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    },
};
