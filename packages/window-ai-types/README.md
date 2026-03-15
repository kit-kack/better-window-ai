# @better-window-ai/types

TypeScript type definitions for the `window.ai` API.

## Installation

```bash
npm install @better-window-ai/types
```

## Usage

### In TypeScript Projects

```typescript
import type { WindowAI, AiModelInfo } from "@better-window-ai/types";

// Check if AI is available
const available = await window.ai.available();
if (available) {
  // Get current model
  const model = await window.ai.getCurrentModel();
  console.log(model?.name);
}
```

### Global Types

The package automatically extends the global `Window` interface, so you can use `window.ai` with full type support:

```typescript
// No import needed - types are global
const available = await window.ai.available();
const models = await window.ai.getModels();
const current = await window.ai.getCurrentModel();
```

## API Reference

### `window.ai.available()`

Check if AI functionality is available.

```typescript
const isAvailable: boolean = await window.ai.available();
```

### `window.ai.getModels()`

Get all available model configurations.

```typescript
const models: AiModelInfo[] = await window.ai.getModels();
// [{ id: "...", name: "GPT-4", model: "gpt-4o" }]
```

### `window.ai.getCurrentModel()`

Get the currently active model configuration.

```typescript
const model: AiModelInfo | null = await window.ai.getCurrentModel();
// { id: "...", name: "GPT-4", model: "gpt-4o" } or null
```

### `window.ai.generateText(body)`

Generate text using AI. Accepts OpenAI SDK compatible parameters (without `model` and `stream`) and returns OpenAI SDK compatible response.

```typescript
import type OpenAI from "openai";

const response = await window.ai.generateText({
  messages: [
    { role: "system", content: "You are a helpful assistant" },
    { role: "user", content: "Hello, AI!" },
  ],
  temperature: 0.7,
  max_tokens: 1000,
});

console.log(response.choices[0].message.content);
```

**Note:** The `model` and `stream` parameters are omitted - the extension uses the configured model and non-streaming mode.

See [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create) for full parameter documentation.

## Type Definitions

### `AiModelInfo`

Model configuration information.

```typescript
interface AiModelInfo {
  id: string;
  name: string;
  model: string;
}
```

### `WindowAI`

The main window.ai interface.

```typescript
interface WindowAI {
  available(): Promise<boolean>;
  getModels(): Promise<AiModelInfo[]>;
  getCurrentModel(): Promise<AiModelInfo | null>;
  generateText(
    body: Omit<
      OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
      "stream" | "model"
    >
  ): Promise<OpenAI.Chat.Completions.ChatCompletion>;
}
```

## Examples

### Basic Text Generation

```typescript
const response = await window.ai.generateText({
  messages: [{ role: "user", content: "Explain TypeScript" }],
});
console.log(response.choices[0].message.content);
```

### With System Prompt

```typescript
const response = await window.ai.generateText({
  messages: [
    { role: "system", content: "You are a poet" },
    { role: "user", content: "Write a haiku about coding" },
  ],
  temperature: 0.8,
});
```

### Checking Availability

```typescript
if (await window.ai.available()) {
  const models = await window.ai.getModels();
  console.log("Available models:", models);
} else {
  console.log("Please configure AI models in the extension first");
}
```

### Get Current Model

```typescript
const current = await window.ai.getCurrentModel();
if (current) {
  console.log(`Using model: ${current.name} (${current.model})`);
}
```

## Browser Extension Integration

This package is designed for use with browser extensions that inject the `window.ai` API. Make sure the extension is installed and configured before using these APIs.

## License

MIT
