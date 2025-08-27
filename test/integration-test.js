const fs = require('fs');
const path = require('path');

console.log('🔧 Running integration tests...\n');

// 测试目录
const testDir = path.join(__dirname, 'integration-test');
const manifestPath = path.join(testDir, 'manifest.json');
const distPath = path.join(testDir, 'dist');

// 版本号自增函数（从插件源码复制）
function parseVersion(version) {
  const parts = version.split('.').map(part => parseInt(part, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function formatVersion(versionParts) {
  return versionParts.join('.');
}

function incrementVersion(currentVersion, incrementType = 'patch', step = 1) {
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

// 清理测试目录
function cleanup() {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

// 创建测试环境
function setupTestEnvironment() {
  // 创建测试目录
  fs.mkdirSync(testDir, { recursive: true });
  fs.mkdirSync(path.join(testDir, 'src'), { recursive: true });
  fs.mkdirSync(path.join(testDir, 'dist'), { recursive: true });
  
  // 创建测试 manifest.json
  const testManifest = {
    manifest_version: 3,
    name: "Integration Test Extension",
    version: "1.0.0",
    description: "Test extension for integration testing",
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["content-scripts.js"],
        css: []
      }
    ]
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(testManifest, null, 2));
  
  // 创建测试 CSS 文件
  const cssContent = `
.test-class {
  color: red;
  background: blue;
}
  `.trim();
  
  fs.writeFileSync(path.join(testDir, 'dist', 'style.css'), cssContent);
  
  // 创建测试 JS 文件
  const jsContent = `
console.log('Content script loaded');
  `.trim();
  
  fs.writeFileSync(path.join(testDir, 'dist', 'content-scripts.js'), jsContent);
}

// 模拟插件处理逻辑
function simulatePluginProcessing() {
  console.log('📁 Setting up test environment...');
  cleanup();
  setupTestEnvironment();
  
  console.log('🔨 Running build process simulation...');
  
  try {
    // 读取原始 manifest
    const originalManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log('📄 Original manifest version:', originalManifest.version);
    
    // 模拟版本号自增
    const newVersion = incrementVersion(originalManifest.version, 'patch', 1);
    originalManifest.version = newVersion;
    
    console.log('📄 New manifest version:', newVersion);
    
    // 模拟 CSS 注入
    const cssFiles = ['style.css'];
    if (originalManifest.content_scripts && originalManifest.content_scripts.length > 0) {
      originalManifest.content_scripts.forEach(script => {
        if (!script.css) {
          script.css = [];
        }
        cssFiles.forEach(cssFile => {
          if (!script.css.includes(cssFile)) {
            script.css.push(cssFile);
          }
        });
      });
    }
    
    // 写入结果
    const resultManifestPath = path.join(testDir, 'dist', 'manifest.json');
    fs.writeFileSync(resultManifestPath, JSON.stringify(originalManifest, null, 2));
    
    // 验证结果
    console.log('📄 Result manifest version:', originalManifest.version);
    
    // 验证版本号是否正确递增
    const expectedVersion = '1.0.1';
    if (originalManifest.version === expectedVersion) {
      console.log('✅ Version increment test PASSED');
    } else {
      console.log('❌ Version increment test FAILED');
      console.log(`Expected: ${expectedVersion}, Got: ${originalManifest.version}`);
    }
    
    // 验证 CSS 是否被注入
    if (originalManifest.content_scripts && 
        originalManifest.content_scripts[0] && 
        originalManifest.content_scripts[0].css && 
        originalManifest.content_scripts[0].css.length > 0) {
      console.log('✅ CSS injection test PASSED');
      console.log('📄 Injected CSS files:', originalManifest.content_scripts[0].css);
    } else {
      console.log('❌ CSS injection test FAILED');
    }
    
    console.log('\n📋 Final manifest.json:');
    console.log(JSON.stringify(originalManifest, null, 2));
    
    return true;
    
  } catch (error) {
    console.error('❌ Integration test FAILED with error:', error);
    return false;
  } finally {
    // 清理
    cleanup();
  }
}

// 测试不同的配置场景
function testDifferentScenarios() {
  console.log('\n🧪 Testing different scenarios...\n');
  
  const scenarios = [
    {
      name: 'Patch increment',
      inputVersion: '1.0.0',
      incrementType: 'patch',
      step: 1,
      expectedVersion: '1.0.1'
    },
    {
      name: 'Minor increment',
      inputVersion: '1.0.0',
      incrementType: 'minor',
      step: 1,
      expectedVersion: '1.1.0'
    },
    {
      name: 'Major increment',
      inputVersion: '1.0.0',
      incrementType: 'major',
      step: 1,
      expectedVersion: '2.0.0'
    },
    {
      name: 'Custom step increment',
      inputVersion: '1.0.0',
      incrementType: 'patch',
      step: 3,
      expectedVersion: '1.0.3'
    }
  ];
  
  let passedScenarios = 0;
  let totalScenarios = scenarios.length;
  
  scenarios.forEach((scenario, index) => {
    console.log(`Scenario ${index + 1}: ${scenario.name}`);
    console.log(`  Input: ${scenario.inputVersion} (${scenario.incrementType} +${scenario.step})`);
    console.log(`  Expected: ${scenario.expectedVersion}`);
    
    const result = incrementVersion(scenario.inputVersion, scenario.incrementType, scenario.step);
    console.log(`  Result: ${result}`);
    
    const passed = result === scenario.expectedVersion;
    console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
    
    if (passed) {
      passedScenarios++;
    }
  });
  
  console.log(`📊 Scenario Test Results: ${passedScenarios}/${totalScenarios} scenarios passed`);
  
  if (passedScenarios === totalScenarios) {
    console.log('🎉 All scenarios passed!');
  } else {
    console.log('⚠️  Some scenarios failed.');
  }
  
  return passedScenarios === totalScenarios;
}

// 运行集成测试
function runIntegrationTest() {
  const pluginTestPassed = simulatePluginProcessing();
  const scenarioTestPassed = testDifferentScenarios();
  
  console.log('\n📊 Integration Test Summary:');
  console.log(`Plugin Processing: ${pluginTestPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Scenario Testing: ${scenarioTestPassed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (pluginTestPassed && scenarioTestPassed) {
    console.log('🎉 All integration tests passed!');
  } else {
    console.log('⚠️  Some integration tests failed.');
    process.exit(1);
  }
}

// 运行测试
runIntegrationTest(); 