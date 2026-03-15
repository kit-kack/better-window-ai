// window.ai 注入脚本 (运行在页面主世界)

export default defineContentScript({
  matches: ["<all_urls>"],
  world: "MAIN",
  runAt: "document_start",
  main() {
    let messageId = 0;
    const pendingMessages = new Map<
      number,
      { resolve: (value: any) => void; reject: (error: any) => void }
    >();

    // 监听来自桥接脚本的响应
    window.addEventListener("message", (event) => {
      // 只接受来自同一窗口的消息
      if (event.source !== window) return;

      const message = event.data;

      // 处理 AI 响应
      if (message.source === "ai-bridge-response") {
        const pending = pendingMessages.get(message.id);
        if (pending) {
          pendingMessages.delete(message.id);
          if (message.error) {
            pending.reject(new Error(message.error));
          } else {
            pending.resolve(message.data);
          }
        }
      }
    });

    // 向桥接脚本发送消息
    function sendToBridge(type: string, data?: any): Promise<any> {
      return new Promise((resolve, reject) => {
        const id = messageId++;
        pendingMessages.set(id, { resolve, reject });

        window.postMessage(
          {
            source: "ai-bridge-request",
            id,
            type,
            data,
          },
          "*",
        );

        // 超时处理
        setTimeout(() => {
          if (pendingMessages.has(id)) {
            pendingMessages.delete(id);
            reject(new Error("请求超时"));
          }
        }, 30000); // 30秒超时
      });
    }

    // 定义 window.ai API
    const windowAI = {
      /**
       * 检查 AI 功能是否可用
       */
      async available(): Promise<boolean> {
        try {
          const response = await sendToBridge("ai:available");
          return response.available;
        } catch (error) {
          return false;
        }
      },

      /**
       * 获取所有可用的模型配置
       */
      async getModels(): Promise<
        Array<{
          id: string;
          name: string;
          model: string;
        }>
      > {
        try {
          const response = await sendToBridge("ai:getModels");
          return response.models || [];
        } catch (error) {
          return [];
        }
      },

      /**
       * 获取当前激活的模型配置
       */
      async getCurrentModel(): Promise<{
        id: string;
        name: string;
        model: string;
      } | null> {
        try {
          const response = await sendToBridge("ai:getCurrentModel");
          return response.model || null;
        } catch (error) {
          return null;
        }
      },

      /**
       * 调用 AI 生成文本
       * @param body OpenAI 完整请求参数
       */
      async generateText(
        body: any, // OpenAI.Chat.ChatCompletionCreateParamsNonStreaming
      ): Promise<any> {
        if (body.stream) {
          throw new Error("流式输出在 window.ai 中暂不支持，请使用标准模式");
        }

        const response = await sendToBridge("ai:generateText", {
          body,
        });

        if (response.error) {
          throw new Error(response.error);
        }

        return response;
      },
    };

    // 注入到 window 对象
    Object.defineProperty(window, "ai", {
      value: windowAI,
      writable: false,
      configurable: false,
      enumerable: true,
    });
  },
});
