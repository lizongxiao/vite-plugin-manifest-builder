# 测试指南

本文档详细说明如何测试 `vite-plugin-manifest-builder` 插件的各项功能。

## 🧪 测试类型

### 1. 单元测试 (Unit Tests)
测试版本号自增逻辑的核心功能。

```bash
npm run test:version
```

**测试内容：**
- 版本号解析和格式化
- Patch/Minor/Major 版本自增
- 自定义步长自增
- 边界情况处理
- 错误格式处理

### 2. 集成测试 (Integration Tests)
测试插件在实际构建环境中的表现。

```bash
npm run test:integration
```

**测试内容：**
- 完整的构建流程
- manifest.json 文件处理
- CSS 文件注入
- 版本号自增功能
- 调试日志输出

### 3. 手动测试 (Manual Tests)
快速验证插件配置和使用场景。

```bash
npm run test:manual
```

**测试内容：**
- 不同配置组合
- 实际使用场景演示
- 配置选项验证

### 4. 完整测试套件
运行所有测试。

```bash
npm run test:all
```

## 🔧 手动测试步骤

### 步骤 1: 准备测试环境

1. 确保已安装依赖：
```bash
npm install
```

2. 构建插件：
```bash
npm run build
```

### 步骤 2: 创建测试项目

1. 创建测试目录：
```bash
mkdir test-project
cd test-project
```

2. 初始化项目：
```bash
npm init -y
npm install vite
```

3. 创建 `manifest.json`：
```json
{
  "manifest_version": 3,
  "name": "Test Extension",
  "version": "1.0.0",
  "description": "Test extension",
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content-scripts.js"],
      "css": []
    }
  ]
}
```

4. 创建 `vite.config.js`：
```javascript
import { defineConfig } from 'vite';
import { manifestBuilderPlugin } from '../src/index.ts';

export default defineConfig({
  plugins: [
    manifestBuilderPlugin({
      debug: true,
      cssPattern: /\.css$/,
      targetScripts: ['content-scripts'],
      autoIncrementVersion: true,
      versionIncrementType: 'patch',
      versionIncrementStep: 1
    })
  ],
  build: {
    outDir: 'dist'
  }
});
```

5. 创建测试文件：
```bash
mkdir src
echo "console.log('Content script');" > src/content-scripts.js
echo ".test { color: red; }" > src/style.css
```

### 步骤 3: 运行测试

1. 构建项目：
```bash
npm run build
```

2. 检查结果：
```bash
cat dist/manifest.json
```

**预期结果：**
- 版本号从 `1.0.0` 变为 `1.0.1`
- CSS 文件被注入到 content_scripts
- 调试日志显示处理过程

## 📋 测试检查清单

### 版本号自增功能

- [ ] Patch 版本自增：`1.0.0` → `1.0.1`
- [ ] Minor 版本自增：`1.0.0` → `1.1.0`
- [ ] Major 版本自增：`1.0.0` → `2.0.0`
- [ ] 自定义步长：`1.0.0` → `1.0.3` (step=3)
- [ ] 禁用自增：版本号保持不变
- [ ] 不完整版本号处理：`1.2` → `1.2.1`
- [ ] 错误格式处理：`1.abc.3` → `1.0.4`

### CSS 注入功能

- [ ] CSS 文件自动发现
- [ ] CSS 文件注入到 content_scripts
- [ ] 自定义 CSS 模式匹配
- [ ] 目标脚本过滤
- [ ] 重复注入避免

### 配置选项

- [ ] debug 模式日志输出
- [ ] outDir 自定义输出目录
- [ ] manifestName 自定义文件名
- [ ] manifestSource 自定义源文件
- [ ] manifestOverrides 字段覆盖

### 错误处理

- [ ] 文件不存在处理
- [ ] 无效 JSON 处理
- [ ] 权限错误处理
- [ ] 路径错误处理

## 🐛 常见问题排查

### 版本号没有自增

1. 检查 `autoIncrementVersion` 是否设置为 `true`
2. 确认 manifest.json 中有 `version` 字段
3. 启用 `debug` 模式查看日志

### CSS 文件没有注入

1. 检查 `cssPattern` 配置是否正确
2. 确认 CSS 文件在输出目录中
3. 验证 `targetScripts` 配置

### 构建失败

1. 检查文件路径是否正确
2. 确认文件权限
3. 查看错误日志

## 📊 测试报告

运行测试后，您应该看到类似以下的输出：

```
🧪 Running version increment unit tests...

Test 1: Patch increment - basic
  Input: "1.2.3" (patch +1)
  Expected: "1.2.4"
  Result: "1.2.4"
  Status: ✅ PASS

📊 Test Results: 12/12 tests passed
🎉 All unit tests passed!

🔧 Running integration tests...
✅ Version increment test PASSED
✅ CSS injection test PASSED

📊 Manual Test Results: 5/5 tests passed
🎉 All manual tests passed!
```

## 🚀 持续集成

建议在 CI/CD 流程中包含以下测试：

```yaml
# GitHub Actions 示例
- name: Run tests
  run: |
    npm install
    npm run build
    npm run test:all
```

## 📝 测试最佳实践

1. **每次修改后运行测试**
2. **测试不同的配置组合**
3. **验证边界情况**
4. **检查错误处理**
5. **保持测试用例更新**

## 🤝 贡献测试

如果您要添加新功能，请：

1. 添加相应的单元测试
2. 更新集成测试
3. 更新测试文档
4. 确保所有测试通过

---

如有问题，请查看 [README.md](README.md) 或提交 Issue。 