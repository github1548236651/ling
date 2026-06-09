// Ling Agent — 集成上下文引擎
// ch04: System Prompt 分层 + 项目感知 + .ling.md + 长对话压缩

import OpenAI from "openai";
import { readFileSync } from "fs";
import { execSync } from "child_process";
import { createInterface } from "readline";
import { buildSystemPrompt, calculateBudget, estimateTokens, Compactor } from "./context/index.ts";
import "dotenv/config";
import { PermissionGuard, loadPermissionConfig } from "./permissions/index.js";
import { StreamChunk } from "./streaming/types.js";
import { ToolCallCollector } from "./streaming/collector.js";
import { StreamRenderer } from "./streaming/renderer.js";
import { SessionStore, SessionSummary, Session, SessionMetadata } from "./session/index.ts";


type Tool = OpenAI.Chat.ChatCompletionTool;

const config = loadPermissionConfig();
const guard = new PermissionGuard(config);
const MODEL = process.env.LLM_MODEL || "doubao-1.5-pro-32k-250115";

interface CliArgs {
  continue: boolean;       // --continue：恢复最近一次会话
  resume?: string;         // --resume <id>：恢复指定会话
  name?: string;           // --name <name>：给会话命名
  listSessions: boolean;   // --list-sessions：列出历史
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { continue: false, listSessions: false };

  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "--continue":
      case "-c":
        args.continue = true;
        break;
      case "--resume":
      case "-r":
        args.resume = argv[++i];
        break;
      case "--name":
      case "-n":
        args.name = argv[++i];
        break;
      case "--list-sessions":
      case "-l":
        args.listSessions = true;
        break;
    }
  }
  return args;
}

function detectMetadata(): SessionMetadata {
  let gitBranch: string | undefined;
  try {
    gitBranch = execSync("git branch --show-current", { encoding: "utf-8" }).trim();
  } catch {
    // 不在 git 仓库内，忽略
  }

  return {
    cwd: process.cwd(),
    provider: "openai",
    model: MODEL,
    gitBranch,
  };
}

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
});

const CONTEXT_WINDOW = parseInt(process.env.CONTEXT_WINDOW || "32000", 10);

// ===== 工具定义 =====

const tools: Tool[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the contents of a file at the given path",
      parameters: {
        type: "object",
        properties: { file_path: { type: "string", description: "Absolute or relative file path" } },
        required: ["file_path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_command",
      description: "Run a shell command and return its output",
      parameters: {
        type: "object",
        properties: { command: { type: "string", description: "Shell command to execute" } },
        required: ["command"],
      },
    },
  },
];

function executeTool(name: string, args: Record<string, string>): string {
  try {
    if (name === "read_file") return readFileSync(args.file_path, "utf-8");
    if (name === "run_command") return execSync(args.command, { encoding: "utf-8", timeout: 30000 }).toString();
    return `Unknown tool: ${name}`;
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const store = new SessionStore();

  // --list-sessions：打印后退出
  if (args.listSessions) {
    const sessions = await store.list();
    if (sessions.length === 0) {
      console.log("No sessions found.");
      return;
    }
    console.log("Sessions:\n");
    for (const s of sessions) {
      const date = new Date(s.updatedAt).toLocaleString();
      const label = s.name ? `"${s.name}"` : s.id.slice(0, 8);
      const preview = s.lastUserMessage ?? "(empty)";
      console.log(`  ${label}  ${s.messageCount} msgs  ${date}`);
      console.log(`    ${preview}\n`);
    }
    return;
  }

  // 决定是新建还是恢复会话
  let session: Session;

  if (args.continue) {
    const latestId = await store.getLatestId();
    if (!latestId) {
      console.log("No previous session found. Starting new session.");
      session = await store.create(detectMetadata(), args.name);
    } else {
      session = (await store.load(latestId))!;
      console.log(`Resuming session ${session.id.slice(0, 8)}...`
        + ` (${session.messages.length} messages)`);
    }
  } else if (args.resume) {
    const loaded = await store.load(args.resume);
    if (!loaded) {
      console.error(`Session not found: ${args.resume}`);
      process.exit(1);
    }
    session = loaded;
    console.log(`Resuming session ${session.id.slice(0, 8)}...`
      + ` (${session.messages.length} messages)`);
  } else {
    session = await store.create(detectMetadata(), args.name);
    console.log(`New session: ${session.id.slice(0, 8)}`);
  }

  // 支持通过命令行参数指定工作目录
  const rawFirst = process.argv[2];
  const workDir = rawFirst && !rawFirst.startsWith("-") ? rawFirst : undefined;
  if (workDir) {
    try {
      // 切换到指定的工作目录
      process.chdir(workDir);
      console.log(`📁 Working directory: ${process.cwd()}\n`);
    } catch (err) {
      console.error(`❌ Failed to change directory to ${workDir}: ${(err as Error).message}`);
      process.exit(1);
    }
  }

  // ===== 上下文引擎初始化 =====

  const cwd = process.cwd();
  const systemPrompt = buildSystemPrompt({ cwd });
  const compactor = new Compactor(client, MODEL, { keepRecentTurns: 4, maxHistoryTokens: 50000 });

  // 启动时打印预算信息
  const toolDefs = JSON.stringify(tools);
  const budget = calculateBudget(CONTEXT_WINDOW, systemPrompt, toolDefs, "");
  console.log(`[ling] Project detected. System prompt: ${budget.systemPrompt} tokens`);
  console.log(`[ling] Budget: ${budget.available} tokens available (${budget.reserved} reserved for tool results)`);

  // ===== Agent 主循环 =====

  // 给 session 注入/更新 system prompt
  const sysIdx = session.messages.findIndex((m) => m.role === "system");
  if (sysIdx >= 0) {
    session.messages[sysIdx] = { role: "system", content: systemPrompt };
  } else {
    session.messages.unshift({ role: "system", content: systemPrompt });
  }

  async function handleTurn(userMessage: string) {
    // /compact 命令：手动触发压缩
    if (userMessage.trim() === "/compact") {
      session.messages = await compactor.compact(session.messages);
      console.log("[ling] Conversation compacted.");
      return;
    }

    session.messages.push({ role: "user", content: userMessage });

    // 自动压缩检查
    if (compactor.shouldCompact(session.messages)) {
      console.log("[ling] Context getting large, auto-compacting...");
      session.messages = await compactor.compact(session.messages);
    }

    const MAX_TURNS = 20;
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const renderer = new StreamRenderer();
      const collector = new ToolCallCollector();
      let collectedContent = "";

      // ---- 流式请求 ----
      const stream = await client.chat.completions.create({
        model: MODEL,
        messages: session.messages,
        tools,
        stream: true,
      });

      // 追踪本次请求中出现的 tool_call index
      const seenToolCallIndices = new Set<number>();

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        const finishReason = chunk.choices[0]?.finish_reason;

        // 文本 token → 实时输出
        if (delta?.content) {
          collectedContent += delta.content;
          renderer.onChunk({ type: "text", content: delta.content });
        }

        // 工具调用增量
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;

            // 首次出现（携带 id + function.name）→ tool_call_start
            if (tc.id && tc.function?.name) {
              seenToolCallIndices.add(idx);
              const startChunk: StreamChunk = {
                type: "tool_call_start",
                content: "",
                toolCallId: tc.id,
                toolName: tc.function.name,
                index: idx,
              };
              renderer.onChunk(startChunk);
              collector.feed(startChunk);
            }

            // 参数增量片段
            if (tc.function?.arguments) {
              collector.feed({
                type: "tool_call_delta",
                content: tc.function.arguments,
                index: idx,
              });
            }
          }
        }

        // 流结束：工具调用模式 → 结束所有 pending 调用
        if (finishReason === "tool_calls") {
          for (const idx of seenToolCallIndices) {
            collector.feed({ type: "tool_call_end", content: "", index: idx });
          }
        }

        if (finishReason === "stop") {
          renderer.onChunk({ type: "finish", content: "" });
        }
      }

      // ---- 处理收集到的工具调用 ----
      const toolCalls = collector.drain();

      if (toolCalls.length === 0) {
        // 没有工具调用，本轮结束
        return;
      }

      // 将 assistant 消息（含 tool_calls）写入历史
      session.messages.push({
        role: "assistant",
        content: collectedContent || null,
        tool_calls: toolCalls.map((tc) => ({
          id: tc.id,
          type: "function" as const,
          function: { name: tc.name, arguments: tc.arguments },
        })),
      });

      for (const tc of toolCalls) {
        const args = JSON.parse(tc.arguments);

        // ---- 权限检查 + spinner ----
        renderer.startToolExecution(tc.name, JSON.stringify(args));

        const allowed = await guard.check(tc.name, args);

        if (!allowed) {
          renderer.stopToolExecution(tc.name, false);
          session.messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: `Permission denied: this operation was blocked by the permission system. Try a different approach.`,
          });
          continue;
        }

        const result = executeTool(tc.name, args);
        renderer.stopToolExecution(tc.name, true);
        session.messages.push({ role: "tool", tool_call_id: tc.id, content: result });
      }
    }

    console.log("[ling] Reached max turns, stopping.");
  }

  // ===== REPL =====

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  function prompt() {
    const historyTokens = estimateTokens(JSON.stringify(session.messages));
    rl.question(`[${historyTokens} tokens] > `, async (input) => {
      const trimmed = input.trim();
      if (!trimmed || trimmed === "/quit") {
        rl.close();
        return;
      }
      await handleTurn(trimmed);
      // 每轮对话后自动保存
      await store.save(session);
      prompt();
    });
  }

  console.log("[ling] Ready. Type /compact to compress history, /quit to exit.\n");
  prompt();
}

main();
