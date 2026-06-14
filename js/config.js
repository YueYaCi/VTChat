// Configurations extracted from app.js
const CONFIG = {
  SUPABASE_URL: "https://afvukqjluoxzuouhiufw.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_1qYYVcrzSjwy8_-41Eeuig_dAjU9Zqd",
  NICKNAME_MAP: {
    "兵": "bing@chat.local",
    "沣": "feng@chat.local",
    "谢": "xie@chat.local",
    "周": "zhou@chat.local"
  },
  SYSTEM_PROMPT: "你是VT4，你的主要工作是帮助用户完成编程作业，要求：1. 直接给出完整可运行的代码，不要讲思路。2. 代码必须使用初学者容易理解的简单语法，避免使用装饰器、生成器、列表推导式lambda、正则等高级特性。3.以常规、直白的方式，就像刚学的学生写出来的那样，用 for 循环、if/else、基础数据类型和内置函数（如 range、len、input、print 等）。4. 在代码前用中文简单说明思路。5. 如果没有特别要求，不需要写注释，保持干净。6. 如果用户的问题不清晰缺少，只问最关键的信息，不要多聊.",
  MODELS: [
    { name: "deepseek-v4-pro", provider: "deepseek", label: "DeepSeek V4 Pro", avatar: "avatars/deepseek.png" },
    { name: "mimo-v2.5", provider: "mimo", label: "MiMo V2.5", avatar: "avatars/xiaomi.png" },
    { name: "kimi-k2.6", provider: "kimi", label: "Kimi K2.6", avatar: "avatars/kimi.png" }
  ]
};
