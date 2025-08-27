import type { Plugin } from "vite";

export interface ManifestBuilderPluginOptions {
  /** 是否启用调试日志 */
  debug?: boolean;
  /** 自定义 CSS 文件匹配规则 */
  cssPattern?: RegExp;
  /** 是否只注入到特定的 content_scripts */
  targetScripts?: string[];
  /** 输出目录，默认为 'dist' */
  outDir?: string;
  /** manifest.json 文件名，默认为 'manifest.json' */
  manifestName?: string;
  /** manifest.json 源文件路径，默认为项目根目录的 manifest.json */
  manifestSource?: string;
  /** 要替换的 manifest 字段，支持嵌套对象 */
  manifestOverrides?: Record<string, any>;
  /** 是否启用版本号自增 */
  autoIncrementVersion?: boolean;
  /** 版本号自增步长，默认为 1 */
  versionIncrementStep?: number;
  /** 版本号自增类型：'patch' | 'minor' | 'major'，默认为 'patch' */
  versionIncrementType?: 'patch' | 'minor' | 'major';
}

/**
 * 解析版本号字符串为数字数组
 * @param version 版本号字符串，如 "1.2.3"
 * @returns 版本号数字数组 [major, minor, patch]
 */
function parseVersion(version: string): [number, number, number] {
  const parts = version.split('.').map(part => parseInt(part, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

/**
 * 格式化版本号数组为字符串
 * @param versionParts 版本号数字数组 [major, minor, patch]
 * @returns 版本号字符串
 */
function formatVersion(versionParts: [number, number, number]): string {
  return versionParts.join('.');
}

/**
 * 自增版本号
 * @param currentVersion 当前版本号
 * @param incrementType 自增类型
 * @param step 自增步长
 * @returns 新的版本号
 */
function incrementVersion(
  currentVersion: string,
  incrementType: 'patch' | 'minor' | 'major' = 'patch',
  step: number = 1
): string {
  const [major, minor, patch] = parseVersion(currentVersion);
  
  switch (incrementType) {
    case 'major':
      return formatVersion([major + step, 0, 0]);
    case 'minor':
      return formatVersion([major, minor + step, 0]);
    case 'patch':
    default:
      return formatVersion([major, minor, patch + step]);
  }
}

/**
 * CSS 注入插件
 * 用于将 CSS 文件自动注入到 Chrome Extension 的 manifest.json 中
 *
 * @param options 插件配置选项
 * @returns Vite 插件
 *
 * @example
 * ```typescript
 * import { cssInjectPlugin } from 'vite-plugin-css-inject-manifest'
 *
 * export default defineConfig({
 *   plugins: [
 *     cssInjectPlugin({
 *       debug: true,
 *       cssPattern: /\.(css|scss|less)$/,
 *       targetScripts: ['content-scripts'],
 *       autoIncrementVersion: true,
 *       versionIncrementType: 'patch'
 *     })
 *   ]
 * })
 * ```
 */
export function manifestBuilderPlugin(options: ManifestBuilderPluginOptions = {}): Plugin {
  const {
    debug = false,
    cssPattern = /\.css$/,
    targetScripts = [],
    outDir = "dist",
    manifestName = "manifest.json",
    manifestSource = "manifest.json",
    manifestOverrides = {},
    autoIncrementVersion = false,
    versionIncrementStep = 1,
    versionIncrementType = 'patch',
  } = options;

  return {
    name: "vite-plugin-manifest-builder",
    enforce: "post",
    async closeBundle() {
      const fs = await import("fs");
      const path = await import("path");

      const manifestPath = path.default.join(outDir, manifestName);

      try {
        // 如果目标manifest不存在，尝试从源文件复制
        if (!fs.default.existsSync(manifestPath)) {
          if (fs.default.existsSync(manifestSource)) {
            if (debug) {
              console.log(
                `[vite-plugin-manifest-builder] 复制 manifest.json 从 ${manifestSource} 到 ${manifestPath}`
              );
            }
            fs.default.copyFileSync(manifestSource, manifestPath);
          } else {
            if (debug) {
              console.log(
                `[vite-plugin-manifest-builder] manifest.json 不存在: ${manifestPath}`
              );
            }
            return;
          }
        }

        // 读取 manifest.json
        const manifestContent = fs.default.readFileSync(manifestPath, "utf-8");
        const manifest = JSON.parse(manifestContent);

        // 处理版本号自增
        if (autoIncrementVersion && manifest.version) {
          const oldVersion = manifest.version;
          const newVersion = incrementVersion(oldVersion, versionIncrementType, versionIncrementStep);
          
          if (debug) {
            console.log(
              `[vite-plugin-manifest-builder] 版本号自增: ${oldVersion} -> ${newVersion} (类型: ${versionIncrementType}, 步长: ${versionIncrementStep})`
            );
          }
          
          manifest.version = newVersion;
          
          // 如果 manifestOverrides 中也有 version，则覆盖它
          if (manifestOverrides.version) {
            if (debug) {
              console.log(
                `[vite-plugin-manifest-builder] 警告: manifestOverrides 中的 version 将被自增版本号覆盖`
              );
            }
          }
        }

        // 应用 manifest 字段替换
        if (Object.keys(manifestOverrides).length > 0) {
          if (debug) {
            console.log(
              `[vite-plugin-manifest-builder] 应用 manifest 字段替换:`,
              manifestOverrides
            );
          }
          
          // 递归合并对象
          function deepMerge(target: any, source: any): any {
            for (const key in source) {
              if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                deepMerge(target[key], source[key]);
              } else {
                target[key] = source[key];
              }
            }
            return target;
          }
          
          deepMerge(manifest, manifestOverrides);
          
          if (debug) {
            console.log(
              `[vite-plugin-manifest-builder] manifest 字段替换完成`
            );
          }
        }

        // 查找 CSS 文件
        const cssFiles: string[] = [];

        // 递归查找所有CSS文件
        function findCssFiles(dir: string, baseDir: string = ""): void {
          if (!fs.default.existsSync(dir)) return;

          const files = fs.default.readdirSync(dir);
          files.forEach((file: string) => {
            const filePath = path.default.join(dir, file);
            const relativePath = path.default.join(baseDir, file);
            const stat = fs.default.statSync(filePath);

            if (stat.isDirectory()) {
              findCssFiles(filePath, relativePath);
            } else if (cssPattern.test(file)) {
              cssFiles.push(relativePath.replace(/\\/g, "/"));
            }
          });
        }

        findCssFiles(outDir);

        if (debug) {
          console.log(
            `[vite-plugin-manifest-builder] 找到 ${cssFiles.length} 个 CSS 文件:`,
            cssFiles
          );
          console.log(`[vite-plugin-manifest-builder] 输出目录: ${outDir}`);
          console.log(
            `[vite-plugin-manifest-builder] manifest 路径: ${manifestPath}`
          );
        }

        // 将 CSS 文件注入到 content_scripts 中
        if (debug) {
          console.log(
            `[vite-plugin-manifest-builder] content_scripts 数量: ${
              manifest.content_scripts?.length || 0
            }`
          );
          console.log(
            `[vite-plugin-manifest-builder] CSS 文件数量: ${cssFiles.length}`
          );
        }

        if (manifest.content_scripts && cssFiles.length > 0) {
          let injectedCount = 0;

          manifest.content_scripts.forEach((script: any, index: number) => {
            // 检查是否为目标脚本
            if (targetScripts.length > 0) {
              const scriptFiles = script.js || [];
              const isTarget = scriptFiles.some((scriptFile: string) =>
                targetScripts.some((target) => scriptFile.includes(target))
              );
              if (!isTarget) {
                if (debug) {
                  console.log(
                    `[vite-plugin-manifest-builder] 跳过非目标脚本:`,
                    scriptFiles
                  );
                }
                return;
              }
            }

            if (script.js && script.js.length > 0) {
              // 确保 css 数组存在
              if (!script.css) {
                script.css = [];
              }

              // 添加 CSS 文件
              cssFiles.forEach((cssFile) => {
                if (!script.css.includes(cssFile)) {
                  script.css.push(cssFile);
                  injectedCount++;
                }
              });
            }
          });

          // 写回 manifest.json
          fs.default.writeFileSync(
            manifestPath,
            JSON.stringify(manifest, null, 2)
          );

          if (debug) {
            console.log(
              `[vite-plugin-manifest-builder] 成功注入 ${injectedCount} 个 CSS 文件到 manifest.json`
            );
          }
        } else {
          if (debug) {
            console.log(
              "[vite-plugin-manifest-builder] 未找到 content_scripts 或 CSS 文件"
            );
          }
        }
      } catch (error) {
        console.error(
          "[vite-plugin-manifest-builder] 处理 manifest.json 时发生错误:",
          error
        );
      }
    },
  };
}

// 默认导出
export default manifestBuilderPlugin;
