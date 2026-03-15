# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WXT browser extension that provides a `window.ai` API to web pages. It acts as a bridge between websites and AI providers (OpenAI, Anthropic, Ollama, etc.), allowing users to configure their own API keys and models, then grant websites permission to use AI capabilities.

## Commands

```bash
# Development
pnpm dev              # Start dev server (Chrome)
pnpm dev:firefox      # Start dev server (Firefox)

# Build
pnpm build            # Build for production (Chrome)
pnpm build:firefox    # Build for production (Firefox)

# Package
pnpm zip              # Create extension zip (Chrome)
pnpm zip:firefox      # Create extension zip (Firefox)

# Type checking
pnpm compile          # Run TypeScript type check
```

## Architecture

### Extension Entry Points (`src/entrypoints/`)

- **background.ts** - Service worker that handles AI API calls, permission management, and message routing between content scripts and the AI provider
- **ai.content/index.ts** - Injected into page's main world (`world: "MAIN"`) to expose `window.ai` API via `postMessage` communication
- **bridge.content/index.ts** - Runs in isolated world, bridges messages between the page (`window.ai`) and background script
- **permission.content/index.tsx** - Displays permission dialogs when websites request AI access
- **ui.content/** - Example content UI entry point
- **popup/** - Extension popup UI (WXT starter template)
- **settings/** - Extension settings page for configuring AI models

### Key Utilities (`src/utils/`)

- **storage.ts** - Storage management for model configs (`ModelConfig[]`), active config ID, and site permissions. Uses WXT's `storage` API with key `local:ai-conf`
- **openai.ts** - AI API client using OpenAI SDK. Supports both standard and streaming responses. Uses active config from storage
- **create-content-ui.tsx** - Helper for creating React UIs in content scripts with Shadow DOM, Ant Design theming, and proper z-index handling

### Data Flow

```
Web Page → window.ai (ai.content) → postMessage → bridge.content → runtime.sendMessage → background.ts → OpenAI API
                                    ↑                                                                     ↓
                              permission.content ← ai:showPermissionDialog ← permission check ← AI response
```

### Permission System

- Sites can be: `granted` (always allow), `denied` (always block), or `prompt` (ask each time)
- Permission dialog offers: Allow once, Always allow, Deny once, Always deny
- Temporary grants are stored in memory only (not persisted)

### Configuration Model (`ModelConfig`)

```typescript
interface ModelConfig {
  id: string;
  name: string;
  apiKey: string;
  baseUrl: string;  // e.g., "https://api.openai.com/v1"
  model: string;    // e.g., "gpt-4o"
  temperature: number;
  maxTokens: number;
  enabled: boolean;
}
```

### Sub-packages

- **packages/window-ai-types/** - TypeScript type definitions for the `window.ai` API, published as `@better-window-ai/types`

## Tech Stack

- **Framework**: WXT (browser extension toolkit)
- **Frontend**: React 19, Ant Design 6, Tailwind CSS 4
- **State**: Jotai (for future UI state management)
- **AI SDK**: OpenAI SDK (compatible with any OpenAI-compatible API)
- **Hooks**: ahooks
- **Icons**: @remixicon/react

## Important Implementation Details

- `ai.content` runs with `world: "MAIN"` and `runAt: "document_start"` to inject `window.ai` before page scripts run
- The bridge pattern is required because content scripts in `MAIN` world cannot directly use `browser.runtime.sendMessage`
- Permission dialogs are rendered via Shadow DOM using `createContentUi()` helper
- Max z-index of 9999999 is used for content UI to ensure dialogs appear above page content
- Streaming responses are supported in `callAIStream()` but disabled for `window.ai.generateText()`
