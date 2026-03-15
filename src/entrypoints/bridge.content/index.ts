// 桥接脚本 (运行在扩展隔离世界，连接页面和 background)

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  main() {
    const origin = window.location.origin;

    // 监听来自页面的消息
    window.addEventListener("message", async (event) => {
      // 只接受来自同一窗口的消息
      if (event.source !== window) return;

      const message = event.data;

      // 处理 AI 请求
      if (message.source === "ai-bridge-request") {
        try {
          // 转发到 background script，附带 origin
          // tabId 由 background 通过 sender.tab.id 获取
          const response = await browser.runtime.sendMessage({
            type: message.type,
            origin,
            ...message.data,
          });

          // 发送响应回页面
          window.postMessage(
            {
              source: "ai-bridge-response",
              id: message.id,
              data: response,
            },
            "*",
          );
        } catch (error: any) {
          // 发送错误回页面
          window.postMessage(
            {
              source: "ai-bridge-response",
              id: message.id,
              error: error.message || "请求失败",
            },
            "*",
          );
        }
      }
    });
  },
});
