# vite-plugin-manifest-builder

[![npm version](https://img.shields.io/npm/v/vite-plugin-manifest-builder.svg)](https://www.npmjs.com/package/vite-plugin-manifest-builder)
[![npm downloads](https://img.shields.io/npm/dm/vite-plugin-manifest-builder.svg)](https://www.npmjs.com/package/vite-plugin-manifest-builder)
[![License](https://img.shields.io/npm/l/vite-plugin-manifest-builder.svg)](https://github.com/lizongxiao/vite-plugin-manifest-builder/blob/main/LICENSE)

A powerful Vite plugin for dynamically building and modifying Chrome Extension `manifest.json` files with automatic CSS injection and field overrides.

## ✨ Features

- 🎯 **Automatic CSS Injection**: Automatically injects CSS files into content scripts
- 🔧 **Dynamic Manifest Building**: Builds manifest.json dynamically during build process
- 🎨 **CSS Pattern Matching**: Supports custom CSS file pattern matching
- 📝 **Field Overrides**: Override any manifest fields with custom values
- 🎯 **Targeted Injection**: Inject CSS only into specific content scripts
- 🐛 **Debug Mode**: Comprehensive debugging and logging
- 📦 **TypeScript Support**: Full TypeScript support with type definitions
- 🔄 **Module Support**: Supports both CommonJS and ESM

## 📦 Installation

```bash
npm install vite-plugin-manifest-builder
```

Or with yarn:

```bash
yarn add vite-plugin-manifest-builder
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { defineConfig } from "vite";
import { manifestBuilderPlugin } from "vite-plugin-manifest-builder";

export default defineConfig({
  plugins: [manifestBuilderPlugin()],
});
```

### Advanced Configuration

```typescript
import { defineConfig } from "vite";
import { manifestBuilderPlugin } from "vite-plugin-manifest-builder";

export default defineConfig({
  plugins: [
    manifestBuilderPlugin({
      debug: true,
      cssPattern: /\.(css|scss|less)$/,
      targetScripts: ["content-scripts"],
      outDir: "dist",
      manifestName: "manifest.json",
      manifestOverrides: {
        description: "A Chrome Extension with dynamic manifest",
        version: "1.0.1",
        name: "My Extension",
      },
    }),
  ],
});
```

## 📖 API Reference

### Plugin Options

#### `debug?: boolean`

Enable debug logging. Default: `false`

```typescript
manifestBuilderPlugin({
  debug: true, // Enable detailed logging
});
```

#### `cssPattern?: RegExp`

Custom CSS file pattern matching. Default: `/\.css$/`

```typescript
manifestBuilderPlugin({
  cssPattern: /\.(css|scss|less)$/, // Match CSS, SCSS, and Less files
});
```

#### `targetScripts?: string[]`

Target specific content scripts for CSS injection. Default: `[]` (all scripts)

```typescript
manifestBuilderPlugin({
  targetScripts: ["content-scripts", "background"], // Only inject into these scripts
});
```

#### `outDir?: string`

Output directory for the built manifest. Default: `'dist'`

```typescript
manifestBuilderPlugin({
  outDir: "build", // Custom output directory
});
```

#### `manifestName?: string`

Name of the output manifest file. Default: `'manifest.json'`

```typescript
manifestBuilderPlugin({
  manifestName: "extension-manifest.json", // Custom manifest filename
});
```

#### `manifestSource?: string`

Source manifest file path. Default: `'manifest.json'`

```typescript
manifestBuilderPlugin({
  manifestSource: "src/manifest.json", // Custom source manifest path
});
```

#### `manifestOverrides?: Record<string, any>`

Override manifest fields with custom values. Supports nested objects.

```typescript
manifestBuilderPlugin({
  manifestOverrides: {
    description: "A powerful Chrome Extension",
    version: "1.0.1",
    name: "My Awesome Extension",
    // Override any manifest field
    permissions: ["storage", "activeTab"],
    icons: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png",
    },
  },
});
```

## 🔄 How It Works

1. **Build Phase**: Plugin runs during Vite's build process
2. **Manifest Processing**: Applies `manifestOverrides` to the source manifest
3. **CSS Discovery**: Finds all CSS files matching the pattern in the output directory
4. **CSS Injection**: Automatically injects CSS files into content_scripts
5. **Output Generation**: Writes the final manifest.json to the output directory

## 📝 Examples

### Chrome Extension Development

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { manifestBuilderPlugin } from "vite-plugin-manifest-builder";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      manifestBuilderPlugin({
        debug: isDev, // Enable debug in development
        cssPattern: /\.css$/,
        targetScripts: ["content-scripts"],
        manifestOverrides: {
          description: isDev ? "Development Version" : "Production Version",
          version: "1.0.0",
        },
      }),
    ],
  };
});
```

### Multi-Environment Setup

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { manifestBuilderPlugin } from "vite-plugin-manifest-builder";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      manifestBuilderPlugin({
        debug: mode === "development",
        cssPattern: /\.(css|scss|less)$/,
        targetScripts: ["content-scripts", "popup", "options"],
        outDir: mode === "production" ? "dist" : "dev-dist",
        manifestOverrides: {
          name:
            mode === "production"
              ? "Production Extension"
              : "Development Extension",
          version: mode === "production" ? "1.0.0" : "1.0.0-dev",
        },
      }),
    ],
  };
});
```

## ⚡ Performance Considerations

1. **Plugin Order**: This plugin should run after other plugins with `enforce: 'post'`
2. **CSS Processing**: CSS files are processed after all other build steps
3. **File System**: Minimal file system operations for optimal performance
4. **Bundle Hook**: Uses `closeBundle` hook to ensure all files are built
5. **Selective Injection**: Use `targetScripts` to limit CSS injection scope

## 🐛 Troubleshooting

### CSS Not Found

1. Check if CSS files exist in the output directory
2. Verify the `cssPattern` configuration
3. Enable `debug` mode for detailed logging

### Manifest Issues

1. Check if manifest.json has `css` field in content_scripts
2. Verify CSS file paths are correct
3. Ensure content_scripts array exists in manifest

### Build Errors

1. Check output directory permissions
2. Verify `outDir` and `manifestName` configuration
3. Ensure source manifest file exists

### Override Issues

1. Check `manifestOverrides` object structure
2. Verify field names match manifest schema
3. Enable `debug` mode to see override details

## 🛠️ Development

### Setup

```bash
# Clone repository
git clone https://github.com/lizongxiao/vite-plugin-manifest-builder.git
cd vite-plugin-manifest-builder

# Install dependencies
npm install

# Start development
npm run dev

# Build
npm run build
```

### Testing

```bash
# Run tests
npm test

# Run full test suite
npm run build && npm test
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📋 Changelog

### v1.0.0

- Initial release
- Automatic CSS injection
- Dynamic manifest building
- Field override support
- Full TypeScript support

---

## 中文文档

### 简介

`vite-plugin-manifest-builder` 是一个强大的 Vite 插件，用于动态构建和修改 Chrome 扩展的 `manifest.json` 文件，支持自动 CSS 注入和字段覆盖。

### 主要特性

- 🎯 **自动 CSS 注入**: 自动将 CSS 文件注入到 content scripts 中
- 🔧 **动态清单构建**: 在构建过程中动态构建 manifest.json
- 🎨 **CSS 模式匹配**: 支持自定义 CSS 文件模式匹配
- 📝 **字段覆盖**: 使用自定义值覆盖任何清单字段
- 🎯 **定向注入**: 仅将 CSS 注入到特定的 content scripts
- 🐛 **调试模式**: 全面的调试和日志记录
- 📦 **TypeScript 支持**: 完整的 TypeScript 支持和类型定义
- 🔄 **模块支持**: 支持 CommonJS 和 ESM

### 快速开始

```typescript
import { defineConfig } from "vite";
import { manifestBuilderPlugin } from "vite-plugin-manifest-builder";

export default defineConfig({
  plugins: [
    manifestBuilderPlugin({
      debug: true,
      cssPattern: /\.(css|scss|less)$/,
      targetScripts: ["content-scripts"],
      manifestOverrides: {
        description: "一个动态配置的 Chrome 扩展",
        version: "1.0.1",
        name: "我的扩展",
      },
    }),
  ],
});
```

更多详细信息请参考英文文档部分。
