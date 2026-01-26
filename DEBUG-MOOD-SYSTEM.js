/**
 * 🔧 调试脚本 - 检查价格API和吐槽系统
 * 在浏览器控制台运行此脚本
 */

console.log('='.repeat(60));
console.log('🔍 开始调试情绪系统...');
console.log('='.repeat(60));

// 1. 检查价格API
console.log('\n1️⃣ 检查价格获取:');
console.log('marketMood 存在:', typeof marketMood !== 'undefined');
console.log('roastingAgent 存在:', typeof roastingAgent !== 'undefined');

if (typeof marketMood !== 'undefined') {
  const priceInfo = marketMood.getPriceInfo();
  console.log('BTC 当前价格:', priceInfo.btc.current);
  console.log('BTC 上次价格:', priceInfo.btc.previous);
  console.log('BTC 涨跌幅:', priceInfo.btc.change + '%');
  console.log('SOL 当前价格:', priceInfo.sol.current);
  console.log('SOL 上次价格:', priceInfo.sol.previous);
  console.log('SOL 涨跌幅:', priceInfo.sol.change + '%');
  console.log('当前情绪:', priceInfo.mood);
} else {
  console.error('❌ marketMood 未定义！');
}

// 2. 手动获取价格
console.log('\n2️⃣ 手动获取最新价格:');
fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,solana&vs_currencies=usd&include_24hr_change=true')
  .then(response => response.json())
  .then(data => {
    console.log('✅ API 响应成功:');
    console.log('BTC:', data.bitcoin);
    console.log('SOL:', data.solana);

    if (data.bitcoin && data.solana) {
      console.log('✅ 价格数据正常');
      console.log('BTC 价格:', data.bitcoin.usd);
      console.log('SOL 价格:', data.solana.usd);

      if (data.bitcoin.usd_24h_change !== undefined) {
        console.log('BTC 24h涨跌:', data.bitcoin.usd_24h_change.toFixed(2) + '%');
      }
      if (data.solana.usd_24h_change !== undefined) {
        console.log('SOL 24h涨跌:', data.solana.usd_24h_change.toFixed(2) + '%');
      }
    } else {
      console.error('❌ API返回数据格式错误');
    }
  })
  .catch(error => {
    console.error('❌ API 请求失败:', error);
  });

// 3. 检查吐槽系统
console.log('\n3️⃣ 检查吐槽系统:');
if (typeof roastingAgent !== 'undefined') {
  console.log('✅ roastingAgent 已定义');
  console.log('上次活动时间:', new Date(roastingAgent.lastActivityTime).toLocaleTimeString());
  console.log('空闲阈值:', roastingAgent.idleThreshold / 1000, '秒');

  const timeSinceActivity = (Date.now() - roastingAgent.lastActivityTime) / 1000;
  console.log('距离上次活动:', timeSinceActivity.toFixed(0), '秒');

  if (timeSinceActivity > roastingAgent.idleThreshold / 1000) {
    console.log('✅ 应该触发空闲吐槽了');
  } else {
    console.log('⏳ 还需要等待:', (roastingAgent.idleThreshold / 1000 - timeSinceActivity).toFixed(0), '秒');
  }
} else {
  console.error('❌ roastingAgent 未定义！');
}

// 4. 测试吐槽气泡
console.log('\n4️⃣ 手动触发吐槽:');
if (typeof roastingAgent !== 'undefined') {
  console.log('触发随机吐槽...');
  roastingAgent.roastNow('random');

  // 检查气泡是否创建
  setTimeout(() => {
    const bubble = document.querySelector('.roast-bubble');
    console.log('吐槽气泡存在:', bubble !== null);
    if (bubble) {
      console.log('气泡位置:', {
        position: getComputedStyle(bubble).position,
        right: getComputedStyle(bubble).right,
        bottom: getComputedStyle(bubble).bottom,
        zIndex: getComputedStyle(bubble).zIndex,
        display: getComputedStyle(bubble).display,
        visibility: getComputedStyle(bubble).visibility,
        opacity: getComputedStyle(bubble).opacity
      });
      console.log('气泡文本:', bubble.textContent);
    } else {
      console.error('❌ 气泡未创建！');
    }
  }, 1000);
}

// 5. 检查宠物位置
console.log('\n5️⃣ 检查宠物元素:');
const pet = document.getElementById('leek-pet');
if (pet) {
  const rect = pet.getBoundingClientRect();
  console.log('宠物位置:', {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height,
    visible: rect.width > 0 && rect.height > 0
  });
} else {
  console.error('❌ 宠物元素不存在！');
}

// 6. 检查CSS加载
console.log('\n6️⃣ 检查样式文件:');
const testStyle = document.createElement('div');
testStyle.className = 'roast-bubble';
testStyle.style.display = 'none';
document.body.appendChild(testStyle);
const computed = getComputedStyle(testStyle);
console.log('吐槽气泡样式加载:', {
  background: computed.background,
  padding: computed.padding,
  borderRadius: computed.borderRadius,
  position: computed.position
});
testStyle.remove();

console.log('\n' + '='.repeat(60));
console.log('✨ 调试完成！');
console.log('='.repeat(60));

// 7. 提供快速修复
console.log('\n💡 如果有问题，尝试以下修复：');
console.log('1. 手动触发吐槽: roastingAgent.roastNow("random")');
console.log('2. 手动更新价格: marketMood.fetchPrices()');
console.log('3. 刷新页面: location.reload()');
