# 发布指南

## 准备发布

### 1. 安装依赖

```bash
cd packages/window-ai-types
npm install
```

### 2. 构建

```bash
npm run build
```

这会在 `dist/` 目录生成编译后的文件。

### 3. 检查构建结果

```bash
ls dist/
# 应该看到:
# - index.js
# - index.d.ts
# - index.d.ts.map
```

## 发布到 npm

### 首次发布

1. 登录 npm（如果还没登录）:

```bash
npm login --registry=https://registry.npmjs.org/
```

2. 发布包:

```bash
npm publish --access public --registry=https://registry.npmjs.org/
```

注意：由于包名以 `@` 开头（scoped package），需要使用 `--access public` 标志。

### 更新版本

1. 更新版本号:

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 小版本 (1.0.0 -> 1.1.0)
npm version minor

# 大版本 (1.0.0 -> 2.0.0)
npm version major
```

2. 发布新版本:

```bash
npm publish
```

## 版本管理

遵循语义化版本 (Semantic Versioning):

- **MAJOR** (1.0.0 -> 2.0.0): 不兼容的 API 变更
- **MINOR** (1.0.0 -> 1.1.0): 向后兼容的功能新增
- **PATCH** (1.0.0 -> 1.0.1): 向后兼容的问题修复

## 发布前检查清单

- [ ] 所有类型定义正确
- [ ] README.md 文档完整
- [ ] package.json 信息正确
- [ ] LICENSE 文件存在
- [ ] 构建成功 (`npm run build`)
- [ ] 版本号已更新
- [ ] Git 提交并推送

## 测试本地包

在发布前，可以在主项目中测试本地包：

```bash
# 在 packages/window-ai-types 目录
npm link

# 在主项目根目录
npm link @better-window-ai/types
```

## 发布后

1. 在主项目中安装发布的包:

```bash
npm install @better-window-ai/types
```

2. 更新主项目的类型导入:

```typescript
// src/types/window.d.ts
export type {
  AIFunction,
  AIFunctionCall,
  AIToolChoice,
  AIGenerateResponse,
  AIModelInfo,
  AICurrentModel,
  AIGenerateOptions,
  WindowAI,
} from "@better-window-ai/types";
```

## 常见问题

### 发布失败：需要登录

```bash
npm login
```

### 发布失败：包名已存在

修改 `package.json` 中的 `name` 字段为唯一的名称。

### 发布失败：权限不足

确保你有权限发布到该 scope（@better-window-ai）。

## npm 包信息

发布后，包将在以下位置可用：

- npm: https://www.npmjs.com/package/@better-window-ai/types
- 安装: `npm install @better-window-ai/types`
- 导入: `import type { WindowAI } from '@better-window-ai/types'`
