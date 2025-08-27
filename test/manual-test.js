const fs = require('fs');
const path = require('path');

console.log('🔍 Manual Testing Script for vite-plugin-manifest-builder\n');

// 测试配置
const testConfigs = [
  {
    name: 'Basic version increment (patch)',
    config: {
      autoIncrementVersion: true,
      versionIncrementType: 'patch',
      versionIncrementStep: 1
    },
    inputVersion: '1.0.0',
    expectedVersion: '1.0.1'
  },
  {
    name: 'Minor version increment',
    config: {
      autoIncrementVersion: true,
      versionIncrementType: 'minor',
      versionIncrementStep: 1
    },
    inputVersion: '1.0.0',
    expectedVersion: '1.1.0'
  },
  {
    name: 'Major version increment',
    config: {
      autoIncrementVersion: true,
      versionIncrementType: 'major',
      versionIncrementStep: 1
    },
    inputVersion: '1.0.0',
    expectedVersion: '2.0.0'
  },
  {
    name: 'Custom step increment',
    config: {
      autoIncrementVersion: true,
      versionIncrementType: 'patch',
      versionIncrementStep: 3
    },
    inputVersion: '1.0.0',
    expectedVersion: '1.0.3'
  },
  {
    name: 'Version increment disabled',
    config: {
      autoIncrementVersion: false,
      versionIncrementType: 'patch',
      versionIncrementStep: 1
    },
    inputVersion: '1.0.0',
    expectedVersion: '1.0.0'
  }
];

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

// 运行测试
function runManualTests() {
  console.log('🧪 Running manual tests...\n');
  
  let passedTests = 0;
  let totalTests = testConfigs.length;
  
  testConfigs.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`  Config:`, testCase.config);
    console.log(`  Input version: ${testCase.inputVersion}`);
    console.log(`  Expected version: ${testCase.expectedVersion}`);
    
    let resultVersion = testCase.inputVersion;
    
    if (testCase.config.autoIncrementVersion) {
      resultVersion = incrementVersion(
        testCase.inputVersion,
        testCase.config.versionIncrementType,
        testCase.config.versionIncrementStep
      );
    }
    
    console.log(`  Result version: ${resultVersion}`);
    
    const passed = resultVersion === testCase.expectedVersion;
    console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
    
    if (passed) {
      passedTests++;
    }
  });
  
  console.log(`📊 Manual Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All manual tests passed!');
  } else {
    console.log('⚠️  Some manual tests failed.');
  }
}

// 演示实际使用场景
function demonstrateUsage() {
  console.log('\n📚 Usage Demonstration:\n');
  
  // 场景1: 开发环境
  console.log('🔧 Development Environment:');
  console.log('```typescript');
  console.log('manifestBuilderPlugin({');
  console.log('  autoIncrementVersion: false, // 开发时不自增版本');
  console.log('  debug: true');
  console.log('})');
  console.log('```\n');
  
  // 场景2: 生产环境 - 小版本更新
  console.log('🚀 Production Environment - Patch Release:');
  console.log('```typescript');
  console.log('manifestBuilderPlugin({');
  console.log('  autoIncrementVersion: true,');
  console.log('  versionIncrementType: "patch",');
  console.log('  versionIncrementStep: 1');
  console.log('})');
  console.log('```\n');
  
  // 场景3: 生产环境 - 功能版本
  console.log('✨ Production Environment - Feature Release:');
  console.log('```typescript');
  console.log('manifestBuilderPlugin({');
  console.log('  autoIncrementVersion: true,');
  console.log('  versionIncrementType: "minor",');
  console.log('  versionIncrementStep: 1');
  console.log('})');
  console.log('```\n');
  
  // 场景4: 生产环境 - 重大版本
  console.log('🎯 Production Environment - Major Release:');
  console.log('```typescript');
  console.log('manifestBuilderPlugin({');
  console.log('  autoIncrementVersion: true,');
  console.log('  versionIncrementType: "major",');
  console.log('  versionIncrementStep: 1');
  console.log('})');
  console.log('```\n');
  
  // 场景5: 条件性版本自增
  console.log('🔄 Conditional Version Increment:');
  console.log('```typescript');
  console.log('export default defineConfig(({ mode }) => ({');
  console.log('  plugins: [');
  console.log('    manifestBuilderPlugin({');
  console.log('      autoIncrementVersion: mode === "production",');
  console.log('      versionIncrementType: mode === "production" ? "minor" : "patch"');
  console.log('    })');
  console.log('  ]');
  console.log('}));');
  console.log('```\n');
}

// 运行测试和演示
runManualTests();
demonstrateUsage();

console.log('✅ Manual testing completed!'); 