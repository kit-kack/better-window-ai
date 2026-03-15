import { App, PermissionResponse } from "./App.tsx";
import "~/assets/tailwind.css";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    // 监听来自 bridge 的权限请求
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === "ai:showPermissionDialog") {
        showPermissionDialog(message.origin, message.body, message.config);
      }
    });

    async function showPermissionDialog(
      origin: string,
      body?: any,
      config?: any,
    ) {
      await createContentUi(
        ctx,
        "ai-permission-dialog",
        "modal",
        (ui, root, el, container) => {
          const handleResponse = (response: PermissionResponse) => {
            // 发送响应到 background
            browser.runtime.sendMessage({
              type: "ai:permissionResponse",
              origin,
              response,
            });

            // 卸载 UI
            root.unmount();
            ui.remove();
          };
          return (
            <App body={body} config={config} onResponse={handleResponse} />
          );
        },
      );
    }
  },
});
