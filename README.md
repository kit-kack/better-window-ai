# Better Window.AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

📖 [中文文档](README-cn.md)

A browser extension that provides a `window.ai` API for web pages, allowing users to use AI capabilities on any website with their own API keys.

## Features

- **🔒 Privacy First** - API keys are stored locally and never sent to our servers
- **🌐 Universal Compatibility** - Supports OpenAI, Anthropic, Ollama, and any OpenAI-compatible API
- **🛡️ Permission Control** - Granular site permission management with allow, deny, or prompt options
- **⚡ Lightweight & Fast** - Built with WXT for small size and excellent performance
- **📦 Type Support** - Complete TypeScript type definitions included

## Installation

### Chrome / Edge / Other Chromium Browsers

1. Download the latest `.zip` file from the [Releases](https://github.com/yourusername/better-window-ai/releases) page
2. Extract the downloaded file
3. Open your browser's extension management page (`chrome://extensions/`)
4. Enable "Developer mode" in the top right corner
5. Click "Load unpacked"
6. Select the extracted folder

### Firefox

1. Download the latest `-firefox.zip` file from the [Releases](https://github.com/yourusername/better-window-ai/releases) page
2. Open Firefox's debugging page (`about:debugging#/runtime/this-firefox`)
3. Click "Load Temporary Add-on"
4. Select the downloaded `.zip` file

## Usage

### 1. Configure AI Models

1. Click the extension icon in your browser toolbar
2. Click "Settings" to enter the configuration page
3. Add your AI model configuration:
   - **Name** - A name for this configuration (e.g., "My OpenAI")
   - **API Key** - Your API key from OpenAI/Anthropic/etc.
   - **Base URL** - API endpoint address (e.g., `https://api.openai.com/v1`)
   - **Model** - Model name (e.g., `gpt-4o`, `claude-3-opus-20240229`)
   - **Temperature** - Randomness of generated text (0-2)
   - **Max Tokens** - Maximum length of generated text

4. Enable the configuration you want to use

### 2. Use in Web Pages

Once configured, any web page can call AI capabilities through the `window.ai` API:

```javascript
// Check if AI is available
const available = await window.ai.available();
if (!available) {
  console.log('AI is not available');
  return;
}

// Get list of available models
const models = await window.ai.getModels();
console.log('Available models:', models);

// Get currently active model
const currentModel = await window.ai.getCurrentModel();
console.log('Current model:', currentModel);

// Generate text
const response = await window.ai.generateText({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, please introduce yourself.' }
  ]
});

console.log(response.choices[0].message.content);
```

### 3. Permission Management

When a website first attempts to use `window.ai`, the extension will show a permission request dialog:

- **Allow Once** - Allow this website to use AI for this session only
- **Always Allow** - Add this website to the whitelist for automatic approval
- **Deny Once** - Deny this request
- **Always Deny** - Add this website to the blacklist for automatic denial

You can modify these permissions at any time in the extension settings.

## Supported AI Providers

| Provider | Base URL | Model Examples |
|----------|----------|----------------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo` |
| Anthropic | `https://api.anthropic.com/v1` | `claude-3-opus-20240229`, `claude-3-sonnet-20240229` |
| Ollama (Local) | `http://localhost:11434/v1` | `llama3`, `mistral`, `codellama` |
| OpenRouter | `https://openrouter.ai/api/v1` | Various models |
| Custom | Your API address | Your model name |

## Development

### Requirements

- Node.js 18+
- pnpm

### Local Development

```bash
# Install dependencies
pnpm install

# Start dev server (Chrome)
pnpm dev

# Start dev server (Firefox)
pnpm dev:firefox
```

After the dev server starts:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3-dev` folder in the project

### Build

```bash
# Build for production (Chrome)
pnpm build

# Build for production (Firefox)
pnpm build:firefox

# Package as zip file
pnpm zip
pnpm zip:firefox
```

### Type Checking

```bash
pnpm compile
```

## Project Structure

```
better-window-ai/
├── src/
│   ├── entrypoints/          # Extension entry points
│   │   ├── ai.content/       # Inject window.ai into page main world
│   │   ├── bridge.content/   # Bridge between page and background script
│   │   ├── permission.content/ # Permission request dialog
│   │   ├── background.ts     # Background service worker
│   │   ├── popup/            # Extension popup
│   │   └── settings/         # Settings page
│   ├── utils/                # Utility functions
│   │   ├── storage.ts        # Storage management
│   │   ├── openai.ts         # AI API client
│   │   └── result-monad.ts   # Result handling
│   └── types/                # Type definitions
├── packages/
│   └── window-ai-types/      # window.ai API type definitions package
├── docs/                     # Documentation
└── wxt.config.ts            # WXT configuration file
```

## API Reference

### `window.ai`

#### `available(): Promise<boolean>`

Check if AI functionality is available.

#### `getModels(): Promise<ModelInfo[]>`

Get a list of all enabled model configurations.

```typescript
interface ModelInfo {
  id: string;    // Configuration ID
  name: string;  // Display name
  model: string; // Model name
}
```

#### `getCurrentModel(): Promise<ModelInfo | null>`

Get the currently active model configuration.

#### `generateText(body: ChatCompletionCreateParamsNonStreaming): Promise<ChatCompletion>`

Call AI to generate text.

Parameters:
- `body` - OpenAI standard chat completion request parameters

Note: Streaming output with `stream: true` is not currently supported.

## Type Definitions

The project provides complete TypeScript type definitions, available via npm:

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

## Tech Stack

- [WXT](https://wxt.dev/) - Browser extension development framework
- [React 19](https://react.dev/) - UI framework
- [Ant Design 6](https://ant.design/) - Component library
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [Jotai](https://jotai.org/) - State management
- [OpenAI SDK](https://github.com/openai/openai-node) - AI API client
- [ahooks](https://ahooks.js.org/) - React Hooks utilities

## Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT](LICENSE) License.

## Acknowledgements

- Inspired by the [window.ai](https://window.ai/) project
- Built with [WXT](https://wxt.dev/)


