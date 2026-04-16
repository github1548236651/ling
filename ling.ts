import "dotenv/config";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { execSync } from "child_process";

type Tool = OpenAI.Chat.ChatCompletionTool;
type Message = OpenAI.Chat.ChatCompletionMessageParam;
type ToolCall = OpenAI.Chat.ChatCompletionMessageToolCall;

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
});
const MODEL = process.env.LLM_MODEL || "doubao-seed-2-0-pro-260215";

// 装两个工具，一个读文件，一个跑命令
const tools: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: "Read the contents of a file at the given path",
      // parameters 标准的JSON Schema
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Absolute or relative file path'
          },
          required: ["file_path"],
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: "run_command",
      description: "Run a shell command and return its output",
      parameters: {
        type: "object",
        properties: { command: { type: "string", description: "Shell command to execute" } },
        required: ["command"],
      },
    },
  }
]

function executeTool(name: string, args: Record<string, string>): string {
  try {
    if (name === 'read_file') return readFileSync(args.file_path, 'utf-8');
    if (name === 'run_command') return execSync(args.command, { encoding: 'utf-8', timeout: 30000 })
    return `Unknown tool: ${name}`
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
}

async function agent(userMessage: string) {
  const messages: Message[] = [
    { role: "system", content: "You are Ling, a helpful coding assistant. Use tools to answer questions." },
    { role: "user", content: userMessage },
  ];

  while (true) {
    const stream = await client.chat.completions.create({ 
      model: MODEL, 
      messages, 
      tools,
      stream: true  // 开启流式输出
    });

    let fullContent = '';
    let toolCalls: ToolCall[] = [];
    let finishReason: string | null = null;

    // 处理流式响应
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      
      // 收集文本内容
      if (delta?.content) {
        process.stdout.write(delta.content);  // 实时输出
        fullContent += delta.content;
      }

      // 收集工具调用
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          // 流式响应的类型定义不完整，使用 any 绕过类型检查
          const toolCall = tc as any;
          
          if (!toolCall.function) continue;
          
          if (!toolCalls[toolCall.index]) {
            toolCalls[toolCall.index] = {
              id: toolCall.id || '',
              type: 'function',
              function: { name: '', arguments: '' }
            };
          }
          if (toolCall.function.name) toolCalls[toolCall.index].function.name = toolCall.function.name;
          if (toolCall.function.arguments) toolCalls[toolCall.index].function.arguments += toolCall.function.arguments;
        }
      }

      // 记录结束原因
      if (chunk.choices[0]?.finish_reason) {
        finishReason = chunk.choices[0].finish_reason;
      }
    }

    // 构建完整的消息对象
    const assistantMessage: Message = {
      role: 'assistant',
      content: fullContent || null,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined
    };
    messages.push(assistantMessage);

    // 如果没有工具调用，结束循环
    if (finishReason !== "tool_calls" || toolCalls.length === 0) {
      console.log();  // 换行
      return;
    }

    console.log();  // 换行

    // 执行工具调用
    for (const tc of toolCalls) {
      if (tc.type !== 'function') continue;
      const args = JSON.parse(tc.function.arguments);
      const result = executeTool(tc.function.name, args);
      console.log(`[tool] ${tc.function.name}(${JSON.stringify(args)}) → ${result.slice(0, 100)}...`);
      messages.push({ role: "tool", tool_call_id: tc.id, content: result });
    }
  }
}

agent(process.argv[2] || "Read package.json and summarize this project.");