import {
  getAppSettings,
  getActiveConfig,
  getPermission,
  setPermission,
} from "~/utils/storage";
import { callAI } from "~/utils/openai";

// 存储待处理的权限请求
const pendingPermissionRequests = new Map<
  string,
  {
    resolve: (granted: boolean) => void;
    reject: (error: Error) => void;
  }
>();

// 临时授权的来源（仅当次允许）
const temporaryGrants = new Set<string>();

export default defineBackground(() => {
  /**
   * 请求权限
   */
  async function requestPermission(
    origin: string,
    tabId: number,
    body?: any,
    config?: any,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // 存储 promise 的 resolve/reject
      pendingPermissionRequests.set(origin, { resolve, reject });

      // 在当前标签页显示权限确认对话框
      browser.tabs
        .sendMessage(tabId, {
          type: "ai:showPermissionDialog",
          origin,
          body,
          config,
        })
        .catch((error) => {
          pendingPermissionRequests.delete(origin);
          reject(new Error("无法显示权限对话框"));
        });

      // 30秒超时
      setTimeout(() => {
        if (pendingPermissionRequests.has(origin)) {
          pendingPermissionRequests.delete(origin);
          reject(new Error("权限请求超时"));
        }
      }, 30000);
    });
  }

  /**
   * 处理权限响应
   */
  async function handlePermissionResponse(
    msg: any,
    sendResponse: (response: any) => void,
  ) {
    const { origin, response } = msg;

    const pending = pendingPermissionRequests.get(origin);
    if (pending) {
      pendingPermissionRequests.delete(origin);

      if (response === "granted") {
        // 始终允许：保存权限状态
        await setPermission(origin, "granted");
        pending.resolve(true);
      } else if (response === "once") {
        // 仅当次允许：不保存权限，但标记为临时授权
        temporaryGrants.add(origin);
        pending.resolve(true);
      } else if (response === "denyOnce") {
        // 仅当次拒绝：不保存权限，仅拒绝当前请求
        pending.resolve(false);
      } else {
        // 拒绝：保存拒绝状态
        await setPermission(origin, "denied");
        pending.resolve(false);
      }

      sendResponse({ success: true });
    } else {
      sendResponse({ error: "未找到待处理的权限请求" });
    }
  }
  /**
   * 处理来自 window.ai 的消息
   */
  async function handleAIMessage(
    msg: any,
    sender: any,
    sendResponse: (response: any) => void,
  ) {
    try {
      switch (msg.type) {
        case "ai:available": {
          const config = await getActiveConfig();
          sendResponse({
            available: config !== null && config.enabled,
          });
          break;
        }

        case "ai:getModels": {
          const settings = await getAppSettings();
          const models = settings.configs
            .filter((c) => c.enabled)
            .map((c) => ({
              id: c.id,
              name: c.name,
              model: c.model,
            }));
          sendResponse({ models });
          break;
        }

        case "ai:getCurrentModel": {
          const config = await getActiveConfig();
          if (config) {
            sendResponse({
              model: {
                id: config.id,
                name: config.name,
                model: config.model,
              },
            });
          } else {
            sendResponse({ model: null });
          }
          break;
        }

        case "ai:generateText": {
          const { body, origin } = msg;

          if (!body || !body.messages) {
            sendResponse({ error: "缺少 body 或 messages 参数" });
            break;
          }

          // 从 sender 获取 tabId
          const tabId = sender?.tab?.id;
          if (!tabId) {
            sendResponse({ error: "无法获取标签页 ID" });
            break;
          }

          try {
            // 检查权限
            const permission = await getPermission(origin);

            if (permission === "denied") {
              sendResponse({ error: "该网站已被拒绝访问 AI 功能" });
              break;
            }

            // 检查是否有临时授权（仅当次允许）
            const hasTemporaryGrant = temporaryGrants.has(origin);
            if (hasTemporaryGrant) {
              // 临时授权只使用一次，使用后删除
              temporaryGrants.delete(origin);
            }

            if (permission === "prompt" && !hasTemporaryGrant) {
              // 请求权限，传递消息内容供用户查看
              try {
                // 获取当前激活的配置信息
                const activeConfig = await getActiveConfig();
                const granted = await requestPermission(
                  origin,
                  tabId,
                  body,
                  activeConfig,
                );
                if (!granted) {
                  sendResponse({ error: "用户拒绝了 AI 访问请求" });
                  break;
                }
              } catch (error: any) {
                sendResponse({ error: error.message || "权限请求失败" });
                break;
              }
            }

            // 执行 AI 调用
            browser.action.setBadgeBackgroundColor({ color: "blue" });
            const response = await callAI(body);
            sendResponse(response);
          } catch (error: any) {
            sendResponse({ error: error.message || "生成文本失败" });
          } finally {
            browser.action.setBadgeBackgroundColor({ color: "green" });
          }
          break;
        }

        default:
          sendResponse({ error: "未知的消息类型" });
      }
    } catch (error: any) {
      sendResponse({ error: error.message || "处理请求失败" });
    }
  }

  // 点击插件图标时打开设置页面
  browser.action.onClicked.addListener(() => {
    browser.tabs.create({
      url: browser.runtime.getURL("/options.html"),
    });
  });

  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // 打开设置页面（供其他组件调用）
    if (msg.openPopup) {
      browser.tabs.create({
        url: browser.runtime.getURL("/options.html"),
      });
      return;
    }

    // 处理权限响应
    if (msg.type === "ai:permissionResponse") {
      handlePermissionResponse(msg, sendResponse);
      return true;
    }

    // 处理 window.ai API 调用
    if (msg.type?.startsWith("ai:")) {
      handleAIMessage(msg, sender, sendResponse);
      return true; // 保持消息通道开启以支持异步响应
    }
  });
});
