/**
 * 🧪 简化测试版本 - 用于快速诊断问题
 */

// 在控制台运行这个脚本来测试

console.log('='.repeat(50));
console.log('🧪 抓韭菜游戏 - 诊断测试');
console.log('='.repeat(50));

// 测试1: 检查所有依赖
console.log('\n1️⃣ 检查依赖:');
const deps = {
  'ITEMS_DATABASE': typeof ITEMS_DATABASE,
  'getRandomItem': typeof getRandomItem,
  'getDailySpecialItems': typeof getDailySpecialItems,
  'LeekCatchGame': typeof LeekCatchGame,
  'startLeekCatchGame': typeof startLeekCatchGame
};

Object.entries(deps).forEach(([name, type]) => {
  const status = type === 'undefined' ? '❌' : '✅';
  console.log(`  ${status} ${name}: ${type}`);
});

// 测试2: 检查window对象
console.log('\n2️⃣ 检查 window 对象:');
const windowDeps = {
  'window.startLeekCatchGame': typeof window.startLeekCatchGame,
  'window.leekCatchGame': typeof window.leekCatchGame
};

Object.entries(windowDeps).forEach(([name, type]) => {
  const status = type === 'undefined' ? '❌' : '✅';
  console.log(`  ${status} ${name}: ${type}`);
});

// 测试3: 尝试生成物品
if (typeof getRandomItem !== 'undefined') {
  console.log('\n3️⃣ 测试物品生成:');
  for (let i = 0; i < 5; i++) {
    const item = getRandomItem(1);
    console.log(`  ${item.emoji} ${item.name} (${item.rarity})`);
  }
}

// 测试4: 检查每日限定
if (typeof getDailySpecialItems !== 'undefined') {
  console.log('\n4️⃣ 今日限定:');
  const daily = getDailySpecialItems();
  daily.forEach(item => {
    console.log(`  ${item.emoji} ${item.name} (${item.rarity})`);
  });
}

// 测试5: 尝试创建游戏（不显示）
console.log('\n5️⃣ 测试游戏类:');
if (typeof LeekCatchGame !== 'undefined') {
  try {
    const testGame = new LeekCatchGame(document.body);
    console.log('  ✅ 游戏实例创建成功');
    console.log('  - gameState:', testGame.gameState);
    console.log('  - SLOT_SIZE:', testGame.SLOT_SIZE);
    console.log('  - MATCH_COUNT:', testGame.MATCH_COUNT);
  } catch (e) {
    console.error('  ❌ 创建游戏实例失败:', e.message);
  }
} else {
  console.log('  ❌ LeekCatchGame 类不存在');
}

// 测试6: 尝试启动游戏
console.log('\n6️⃣ 尝试启动游戏:');
if (typeof startLeekCatchGame !== 'undefined') {
  console.log('  调用 startLeekCatchGame()...');
  try {
    startLeekCatchGame();
    console.log('  ✅ 函数调用成功');

    // 检查是否创建了DOM
    setTimeout(() => {
      const container = document.querySelector('.leek-catch-container');
      if (container) {
        console.log('  ✅ 游戏容器已创建');
        console.log('  - 宽度:', container.offsetWidth);
        console.log('  - 高度:', container.offsetHeight);
        console.log('  - 可见:', container.style.display !== 'none');
        console.log('  - z-index:', getComputedStyle(container).zIndex);
      } else {
        console.error('  ❌ 游戏容器未找到');
      }
    }, 500);

  } catch (e) {
    console.error('  ❌ 启动失败:', e.message);
    console.error('  错误堆栈:', e.stack);
  }
} else {
  console.log('  ❌ startLeekCatchGame 函数不存在');
}

// 测试7: 检查CSS
console.log('\n7️⃣ 检查样式:');
const testStyle = document.createElement('div');
testStyle.className = 'leek-catch-container';
document.body.appendChild(testStyle);
const computed = getComputedStyle(testStyle);
console.log('  - 位置:', computed.position);
console.log('  - 边框:', computed.border);
console.log('  - 背景:', computed.background);
testStyle.remove();

console.log('\n' + '='.repeat(50));
console.log('✨ 诊断完成！');
console.log('='.repeat(50));

// 提供修复建议
console.log('\n💡 如果看到错误，请尝试：');
console.log('1. 刷新页面 (F5)');
console.log('2. 重新加载插件 (chrome://extensions)');
console.log('3. 检查控制台是否有其他错误');
