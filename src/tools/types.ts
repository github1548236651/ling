// 创建工具注册中心类，用于注册工具的，为什么需要这么写？
// 设计一个工具系统也非常的合理，要是我，估计就是一个tool class就完了

export interface Tool {
    name: string;
    description: string;
    schema: Record<string, unknown>; // JSON Schema for parameters
    execute(params: Record<string, unknown>): Promise<string>;
}

export class ToolRegistry {
    private tools = new Map<string, Tool>();

    register(tool: Tool): void {
        if (this.tools.has(tool.name)) {
            throw new Error(`Tool "${tool.name} already registered`)
        }
        this.tools.set(tool.name, tool);
    }

    get(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    list(): Tool[] {
        return Array.from(this.tools.values()); 1
    }

    async execute(name: string, params: Record<string, unknown>): Promise<string> {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Unknown tool: "${name}"`);
        }
        return tool.execute(params);
    }

    // 转换为 OpenAI function calling 格式
    toOpenAITools() {
        return this.list().map((tool) => ({
            type: "function" as const,
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.schema,
            },
        }));
    }

}