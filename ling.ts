import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
});
const MODEL = process.env.LLM_MODEL || "doubao-1.5-pro-32k-250115";

const res = await client.chat.completions.create({
  model: MODEL,
  messages: [{ role: "user", content: "你好" }],
});
console.log(res.choices[0].message.content);