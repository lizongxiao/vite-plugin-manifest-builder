import { defineConfig, type Plugin } from "vite";
import { manifestBuilderPlugin } from "vite-plugin-manifest-builder";

export default defineConfig({
  plugins: [
    manifestBuilderPlugin({
      debug: true,
      cssPattern: /\.css$/,
      targetScripts: ["content"],
      manifestOverrides: {
        description: "这是一个通过构建时动态修改的扩展描述",
        name: "动态配置的扩展名称",
      },
      // 启用版本号自增功能
      autoIncrementVersion: true,
      versionIncrementType: 'patch',
      versionIncrementStep: 1,
      updateSourceFile: true,
    }) as Plugin,
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        "content-scripts": "src/content-scripts.js",
        main: "src/main.js",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "css/[name][extname]";
          }
          return "[name][extname]";
        },
      },
    },
  },
});
