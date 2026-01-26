/**
 * 测试脚本 - 在浏览器控制台运行
 */

// 测试1: 检查函数是否存在
console.log('=== 测试1: 检查函数 ===');
console.log('startLeekCatchGame 是否存在:', typeof startLeekCatchGame !== 'undefined');
console.log('window.startLeekCatchGame 是否存在:', typeof window.startLeekCatchGame !== 'undefined');

// 测试2: 检查类是否存在
console.log('\n=== 测试2: 检查类 ===');
console.log('LeekCatchGame 是否存在:', typeof LeekCatchGame !== 'undefined');

// 测试3: 检查物品数据库
console.log('\n=== 测试3: 检查物品数据库 ===');
console.log('ITEMS_DATABASE 长度:', typeof ITEMS_DATABASE !== 'undefined' ? ITEMS_DATABASE.length : 'undefined');
console.log('getRandomItem 是否存在:', typeof getRandomItem !== 'undefined');

// 测试4: 手动启动游戏
console.log('\n=== 测试4: 手动启动游戏 ===');
try {
  if (typeof startLeekCatchGame !== 'undefined') {
    startLeekCatchGame();
    console.log('✅ 游戏启动成功！');
  } else if (typeof window.startLeekCatchGame !== 'undefined') {
    window.startLeekCatchGame();
    console.log('✅ 游戏启动成功！');
  } else {
    console.error('❌ startLeekCatchGame 函数不存在！');
  }
} catch (error) {
  console.error('❌ 启动失败:', error);
}

// 测试5: 检查DOM元素
setTimeout(() => {
  console.log('\n=== 测试5: 检查DOM ===');
  const container = document.querySelector('.leek-catch-container');
  console.log('游戏容器是否存在:', container !== null);
  if (container) {
    console.log('容器HTML:', container.innerHTML.substring(0, 200) + '...');
  }
}, 1000);
