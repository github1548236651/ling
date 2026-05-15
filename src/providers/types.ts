/** 工具定义类 */
export interface Tool {
    name: string;
    description: string;
    schema: Record<string, unknown>;
    execute(params:Record<string,unknown>): Promise<string>;
}

/** 工具调用请求：模型说"我要调这个工具" */
export interface ToolCall {
    id: string;
    name: string;
    arguments: string; // JSON 字符串，和 OpenAI 保持一致
}

// 统一消息格式
export type Message =
    | { role: 'system'; content: string }
    | { role: 'user'; content: string }
    | { role: 'assistant'; content: string; toolCalls?: ToolCall[] }
    | { role: 'tool'; toolCallId: string; content: string };

// 模型返回的统一响应
export interface LLMResponse {
    content: string | null;
    toolCalls: ToolCall[];
    finishReason: 'stop' | 'too_calls' | 'length' | 'unknown';
}

export interface LLMProvider {
    readonly name: string;
    chat(messages: Message[], tools?: Tool[]): Promise<LLMResponse>;
    stream(messages: Message[], tools?: Tool[]): AsyncIterableIterator<StreamChunk>
}

/** 流式返回的 chunk */
export interface StreamChunk {
    type: "text" | "tool_call_start" | "tool_call_delta" | "tool_call_end";
    content?: string;
    toolCall?: Partial<ToolCall>;
}

/** Provider 配置 */
export interface ProviderConfig {
  provider: "volcano" | "claude" | "openai";
  apiKey: string;
  model: string;
  baseURL?: string;
}
