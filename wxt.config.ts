import { ConfigEnv, defineConfig } from "wxt";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  srcDir: "src",
  manifest: {
    permissions: ["storage",  "activeTab"],
    host_permissions: ["<all_urls>"],
    action: {},
  },
  // @ts-ignore
  autoIcons: {
    baseIconPath: __dirname + "/src/assets/icon.png",
    developmentIndicator: false,
  },
  webExt: {
    chromiumProfile: resolve(".wxt/chrome-data"),
    keepProfileChanges: true,
    startUrls: [__dirname + "/test-window-ai.html"],
  },
  // @ts-ignore
  vite: (env: ConfigEnv) => ({
    plugins: [tailwindcss()],
  }),
});
