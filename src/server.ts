import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { execSync } from "child_process";

type Tool = OpenAI.Chat.ChatCompletionTool;
type Message = OpenAI.Chat.ChatCompletionMessageParam;
type ToolCall = OpenAI.Chat.ChatCompletionMessageToolCall;

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
});
const MODEL = process.env.LLM_MODEL || "doubao-seed-2-0-pro-260215";

const tools: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: "Read the contents of a file at the given path",
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
];

function executeTool(name: string, args: Record<string, string>): string {
  try {
    if (name === 'read_file') return readFileSync(args.file_path, 'utf-8');
    if (name === 'run_command') return execSync(args.command, { encoding: 'utf-8', timeout: 30000 })
    return `Unknown tool: ${name}`
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
}

// SSE 流式响应端点
app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const messages: Message[] = [
    { role: "system", content: "You are Ling, a helpful coding assistant. Use tools to answer questions." },
    ...history,
    { role: "user", content: message },
  ];

  try {
    while (true) {
      const stream = await client.chat.completions.create({
        model: MODEL,
        messages,
        tools,
        stream: true
      });

      let fullContent = '';
      let toolCalls: ToolCall[] = [];
      let finishReason: string | null = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          fullContent += delta.content;
          // 发送文本片段
          res.write(`data: ${JSON.stringify({ type: 'content', content: delta.content })}\n\n`);
        }

        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
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

        if (chunk.choices[0]?.finish_reason) {
          finishReason = chunk.choices[0].finish_reason;
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: fullContent || null,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined
      };
      messages.push(assistantMessage);

      if (finishReason !== "tool_calls" || toolCalls.length === 0) {
        res.write(`data: ${JSON.stringify({ type: 'done', messages })}\n\n`);
        res.end();
        return;
      }

      // 执行工具调用
      for (const tc of toolCalls) {
        if (tc.type !== 'function') continue;
        const args = JSON.parse(tc.function.arguments);
        const result = executeTool(tc.function.name, args);
        
        // 发送工具调用信息
        res.write(`data: ${JSON.stringify({ 
          type: 'tool', 
          tool: tc.function.name, 
          args, 
          result: result.slice(0, 200) 
        })}\n\n`);
        
        messages.push({ role: "tool", tool_call_id: tc.id, content: result });
      }
    }
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
