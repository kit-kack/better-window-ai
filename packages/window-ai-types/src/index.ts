import type OpenAI from "openai";

/**
 * 模型信息
 */
export interface AiModelInfo {
  id: string;
  name: string;
  model: string;
}

/**
 * window.ai API 类型定义
 */
export interface WindowAI {
  /**
   * 检查 AI 功能是否可用
   * @returns 如果有可用的激活配置则返回 true
   */
  available(): Promise<boolean>;

  /**
   * 获取所有可用的模型配置
   * @returns 模型配置列表
   */
  getModels(): Promise<AiModelInfo[]>;

  /**
   * 获取当前激活的模型配置
   * @returns 当前模型配置，如果没有则返回 null
   */
  getCurrentModel(): Promise<AiModelInfo | null>;

  /**
   * 调用 AI 生成文本
   * @param prompt 用户输入的提示词
   * @param options 可选配置
   * @returns 生成的文本内容或 function call 结果
   */
  generateText(
    body: Omit<
      OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
      "stream" | "model"
    >,
  ): Promise<OpenAI.Chat.Completions.ChatCompletion>;
}

declare global {
  interface Window {
    ai: WindowAI;
  }
}
