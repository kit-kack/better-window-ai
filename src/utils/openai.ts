import OpenAI from "openai";
import { getActiveConfig } from "./storage";

/**
 * 调用 AI 生成文本（标准模式）
 * @param body OpenAI 完整请求参数
 * @returns OpenAI 完整响应
 */
export async function callAI(
  body: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming,
): Promise<OpenAI.Chat.ChatCompletion> {
  const config = await getActiveConfig();
  if (!config) {
    throw new Error("请先在设置页面添加并激活一个配置");
  }

  if (!config.enabled) {
    throw new Error("当前配置已被禁用，请启用或切换到其他配置");
  }

  if (!config.apiKey) {
    throw new Error("请先在设置页面配置 API Key");
  }

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    dangerouslyAllowBrowser: true,
  });

  try {
    // 使用配置中的模型、temperature 和 max_tokens（如果 body 中没有指定）
    const requestParams: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      ...body,
      model: body.model || config.model,
      temperature: body.temperature ?? config.temperature,
      max_tokens: body.max_tokens ?? config.maxTokens,
    };

    const completion = await client.chat.completions.create(requestParams);
    return completion;
  } catch (error: any) {
    // 处理 OpenAI API 错误
    if (error.status) {
      throw new Error(
        `API 请求失败 (${error.status}): ${error.message || "未知错误"}`,
      );
    }
    throw new Error(error.message || "调用 AI 失败");
  }
}

/**
 * 调用 AI 生成文本（流式模式）
 * @param body OpenAI 完整请求参数（stream 会被强制设为 true）
 * @yields 生成的文本片段
 */
export async function* callAIStream(
  body: OpenAI.Chat.ChatCompletionCreateParamsStreaming,
): AsyncGenerator<string, void, unknown> {
  const config = await getActiveConfig();
  if (!config) {
    throw new Error("请先在设置页面添加并激活一个配置");
  }

  if (!config.enabled) {
    throw new Error("当前配置已被禁用，请启用或切换到其他配置");
  }

  if (!config.apiKey) {
    throw new Error("请先在设置页面配置 API Key");
  }

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    dangerouslyAllowBrowser: true,
  });

  try {
    // 使用配置中的模型、temperature 和 max_tokens（如果 body 中没有指定）
    const requestParams: OpenAI.Chat.ChatCompletionCreateParamsStreaming = {
      ...body,
      model: body.model || config.model,
      temperature: body.temperature ?? config.temperature,
      max_tokens: body.max_tokens ?? config.maxTokens,
      stream: true,
    };

    const stream = await client.chat.completions.create(requestParams);

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    // 处理 OpenAI API 错误
    if (error.status) {
      throw new Error(
        `API 请求失败 (${error.status}): ${error.message || "未知错误"}`,
      );
    }
    throw new Error(error.message || "调用 AI 失败");
  }
}
