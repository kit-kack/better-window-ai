# Better Window.AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个浏览器扩展，为网页提供 `window.ai` API，让用户可以使用自己的 API 密钥在任意网站上使用 AI 功能。

## 功能特性

- **🔒 隐私优先** - API 密钥存储在本地，永远不会发送到我们的服务器
- **🌐 通用兼容** - 支持 OpenAI、Anthropic、Ollama 等任何 OpenAI 兼容的 API
- **🛡️ 权限控制** - 细粒度的站点权限管理，可以选择允许、拒绝或每次询问
- **⚡ 轻量快速** - 使用 WXT 构建，体积小巧，性能优异
- **📦 类型支持** - 提供完整的 TypeScript 类型定义

## 安装

### Chrome / Edge / 其他 Chromium 浏览器

1. 从 [Releases](https://github.com/yourusername/better-window-ai/releases) 页面下载最新的 `.zip` 文件
2. 解压下载的文件
3. 打开浏览器的扩展管理页面 (`chrome://extensions/`)
4. 开启右上角的"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的文件夹

### Firefox

1. 从 [Releases](https://github.com/yourusername/better-window-ai/releases) 页面下载最新的 `-firefox.zip` 文件
2. 打开 Firefox 的扩展调试页面 (`about:debugging#/runtime/this-firefox`)
3. 点击"临时载入附加组件"
4. 选择下载的 `.zip` 文件

## 使用方法

### 1. 配置 AI 模型

1. 点击浏览器工具栏上的扩展图标
2. 点击"设置"进入配置页面
3. 添加你的 AI 模型配置：
   - **名称** - 给这个配置起个名字（如"我的 OpenAI"）
   - **API 密钥** - 你的 OpenAI/Anthropic 等平台的 API 密钥
   - **基础 URL** - API 端点地址（如 `https://api.openai.com/v1`）
   - **模型** - 模型名称（如 `gpt-4o`、`claude-3-opus-20240229`）
   - **温度** - 生成文本的随机性（0-2）
   - **最大 Token** - 生成的最大长度

4. 启用你想使用的配置

### 2. 在网页中使用

配置完成后，任何网页都可以通过 `window.ai` API 调用 AI 功能：

```javascript
// 检查 AI 是否可用
const available = await window.ai.available();
if (!available) {
  console.log('AI 功能不可用');
  return;
}

// 获取可用模型列表
const models = await window.ai.getModels();
console.log('可用模型:', models);

// 获取当前激活的模型
const currentModel = await window.ai.getCurrentModel();
console.log('当前模型:', currentModel);

// 生成文本
const response = await window.ai.generateText({
  messages: [
    { role: 'system', content: '你是一个有帮助的助手。' },
    { role: 'user', content: '你好，请介绍一下自己。' }
  ]
});

console.log(response.choices[0].message.content);
```

### 3. 权限管理

当网站首次尝试使用 `window.ai` 时，扩展会弹出权限请求对话框：

- **允许一次** - 仅本次会话允许该网站使用 AI
- **始终允许** - 将该网站加入白名单，以后自动允许
- **拒绝一次** - 拒绝本次请求
- **始终拒绝** - 将该网站加入黑名单，以后自动拒绝

你可以在扩展设置中随时修改这些权限。

## 支持的 AI 提供商

| 提供商 | 基础 URL | 模型示例 |
|--------|----------|----------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo` |
| Anthropic | `https://api.anthropic.com/v1` | `claude-3-opus-20240229`, `claude-3-sonnet-20240229` |
| Ollama (本地) | `http://localhost:11434/v1` | `llama3`, `mistral`, `codellama` |
| OpenRouter | `https://openrouter.ai/api/v1` | 多种模型 |
| 自定义 | 你的 API 地址 | 你的模型名称 |

## 开发

### 环境要求

- Node.js 18+
- pnpm

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（Chrome）
pnpm dev

# 启动开发服务器（Firefox）
pnpm dev:firefox
```

开发服务器启动后：
1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目中的 `.output/chrome-mv3-dev` 文件夹

### 构建

```bash
# 构建生产版本（Chrome）
pnpm build

# 构建生产版本（Firefox）
pnpm build:firefox

# 打包为 zip 文件
pnpm zip
pnpm zip:firefox
```

### 类型检查

```bash
pnpm compile
```

## 项目结构

```
better-window-ai/
├── src/
│   ├── entrypoints/          # 扩展入口点
│   │   ├── ai.content/       # 注入 window.ai 到页面主世界
│   │   ├── bridge.content/   # 桥接页面和后台脚本
│   │   ├── permission.content/ # 权限请求对话框
│   │   ├── background.ts     # 后台服务工作线程
│   │   ├── popup/            # 扩展弹出窗口
│   │   └── settings/         # 设置页面
│   ├── utils/                # 工具函数
│   │   ├── storage.ts        # 存储管理
│   │   ├── openai.ts         # AI API 客户端
│   │   └── result-monad.ts   # 结果处理
│   └── types/                # 类型定义
├── packages/
│   └── window-ai-types/      # window.ai API 类型定义包
├── docs/                     # 文档
└── wxt.config.ts            # WXT 配置文件
```

## API 参考

### `window.ai`

#### `available(): Promise<boolean>`

检查 AI 功能是否可用。

#### `getModels(): Promise<ModelInfo[]>`

获取所有已启用的模型配置列表。

```typescript
interface ModelInfo {
  id: string;    // 配置 ID
  name: string;  // 显示名称
  model: string; // 模型名称
}
```

#### `getCurrentModel(): Promise<ModelInfo | null>`

获取当前激活的模型配置。

#### `generateText(body: ChatCompletionCreateParamsNonStreaming): Promise<ChatCompletion>`

调用 AI 生成文本。

参数：
- `body` - OpenAI 标准的聊天完成请求参数

注意：暂不支持 `stream: true` 的流式输出。

## 类型定义

项目提供了完整的 TypeScript 类型定义，可以通过 npm 安装：

```bash
npm install @better-window-ai/types
```

```typescript
import type { WindowAI } from '@better-window-ai/types';

declare global {
  interface Window {
    ai: WindowAI;
  }
}
```

## 技术栈

- [WXT](https://wxt.dev/) - 浏览器扩展开发框架
- [React 19](https://react.dev/) - UI 框架
- [Ant Design 6](https://ant.design/) - 组件库
- [Tailwind CSS 4](https://tailwindcss.com/) - 样式
- [Jotai](https://jotai.org/) - 状态管理
- [OpenAI SDK](https://github.com/openai/openai-node) - AI API 客户端
- [ahooks](https://ahooks.js.org/) - React Hooks 工具库

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的修改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 致谢

- 灵感来自 [window.ai](https://window.ai/) 项目
- 使用 [WXT](https://wxt.dev/) 构建

---

📖 [English Documentation](README.md)
