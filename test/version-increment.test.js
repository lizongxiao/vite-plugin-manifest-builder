const fs = require('fs');
const path = require('path');

// 导入版本号自增函数（从插件源码中提取）
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

// 测试用例
const testCases = [
  // 基础测试
  {
    name: 'Patch increment - basic',
    input: '1.2.3',
    type: 'patch',
    step: 1,
    expected: '1.2.4'
  },
  {
    name: 'Minor increment - basic',
    input: '1.2.3',
    type: 'minor',
    step: 1,
    expected: '1.3.0'
  },
  {
    name: 'Major increment - basic',
    input: '1.2.3',
    type: 'major',
    step: 1,
    expected: '2.0.0'
  },
  
  // 步长测试
  {
    name: 'Patch increment with step 2',
    input: '1.2.3',
    type: 'patch',
    step: 2,
    expected: '1.2.5'
  },
  {
    name: 'Minor increment with step 3',
    input: '1.2.3',
    type: 'minor',
    step: 3,
    expected: '1.5.0'
  },
  {
    name: 'Major increment with step 2',
    input: '1.2.3',
    type: 'major',
    step: 2,
    expected: '3.0.0'
  },
  
  // 边界情况测试
  {
    name: 'Zero version',
    input: '0.0.0',
    type: 'patch',
    step: 1,
    expected: '0.0.1'
  },
  {
    name: 'Large version numbers',
    input: '999.999.999',
    type: 'patch',
    step: 1,
    expected: '999.999.1000'
  },
  
  // 格式测试
  {
    name: 'Incomplete version (1.2)',
    input: '1.2',
    type: 'patch',
    step: 1,
    expected: '1.2.1'
  },
  {
    name: 'Incomplete version (1)',
    input: '1',
    type: 'patch',
    step: 1,
    expected: '1.0.1'
  },
  {
    name: 'Empty version',
    input: '',
    type: 'patch',
    step: 1,
    expected: '0.0.1'
  },
  
  // 特殊情况测试
  {
    name: 'Version with leading zeros',
    input: '01.02.03',
    type: 'patch',
    step: 1,
    expected: '1.2.4'
  },
  {
    name: 'Version with invalid parts',
    input: '1.abc.3',
    type: 'patch',
    step: 1,
    expected: '1.0.4'
  }
];

console.log('🧪 Running version increment unit tests...\n');

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  const result = incrementVersion(testCase.input, testCase.type, testCase.step);
  const passed = result === testCase.expected;
  
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Input: "${testCase.input}" (${testCase.type} +${testCase.step})`);
  console.log(`  Expected: "${testCase.expected}"`);
  console.log(`  Result: "${result}"`);
  console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  if (passed) {
    passedTests++;
  }
});

console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All unit tests passed!');
} else {
  console.log('⚠️  Some unit tests failed.');
  process.exit(1);
} 