# 🔧 快速修复指南

## 问题1: 看不到吐槽气泡

### ✅ 已修复
- 修改了气泡定位为固定位置（右下角）
- 增加了z-index到最大值
- 添加了详细的调试日志
- 气泡显示时间增加到8秒

### 🧪 测试步骤

**1. 重新加载插件**
```
chrome://extensions → 🔄 刷新
```

**2. 刷新页面**
```
F5 刷新当前网页
```

**3. 手动触发吐槽**
```
按F12打开控制台，粘贴以下代码：

roastingAgent.roastNow('random');
```

**期望结果：**
```
✅ 看到吐槽气泡出现在右下角
✅ 气泡显示8秒
✅ 有中英文双语吐槽
✅ 可以点击✖关闭
```

---

## 问题2: 价格API检查

### 🧪 在控制台运行以下代码

```javascript
// 测试价格API
fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,solana&vs_currencies=usd&include_24hr_change=true')
  .then(r => r.json())
  .then(data => {
    console.log('BTC:', {
      价格: data.bitcoin.usd,
      涨跌: data.bitcoin.usd_24h_change + '%'
    });
    console.log('SOL:', {
      价格: data.solana.usd,
      涨跌: data.solana.usd_24h_change + '%'
    });
  });
```

**期望结果：**
```
BTC: {价格: XXXXX, 涨跌: X.XX%}
SOL: {价格: XXX, 涨跌: X.XX%}
```

---

## 🔍 完整诊断脚本

**在控制台粘贴以下代码：**

```javascript
// 快速诊断
console.log('=== 快速诊断 ===');

// 1. 检查系统
console.log('✅ marketMood:', typeof marketMood);
console.log('✅ roastingAgent:', typeof roastingAgent);

// 2. 检查价格
if (marketMood) {
  const info = marketMood.getPriceInfo();
  console.log('💰 价格信息:', info);
  console.log('当前情绪:', info.mood);
}

// 3. 手动更新价格
if (marketMood) {
  console.log('🔄 手动更新价格...');
  marketMood.fetchPrices();
}

// 等待2秒后检查结果
setTimeout(() => {
  if (marketMood) {
    const info = marketMood.getPriceInfo();
    console.log('📊 最新价格信息:');
    console.log('  BTC:', info.btc.current, '(', info.btc.change.toFixed(2), '%)');
    console.log('  SOL:', info.sol.current, '(', info.sol.change.toFixed(2), '%)');
    console.log('  情绪:', info.mood);
  }
}, 3000);

// 4. 手动触发吐槽
setTimeout(() => {
  if (roastingAgent) {
    console.log('🗣️ 触发吐槽...');
    roastingAgent.roastNow('random');
  }
}, 4000);

console.log('=== 诊断完成，请等待5秒查看结果 ===');
```

---

## 🐛 如果还是看不到气泡

### 可能的原因和解决方案：

**原因1: CSS未加载**
```javascript
// 检查CSS
const bubble = document.querySelector('.roast-bubble');
if (bubble) {
  console.log('气泡样式:', getComputedStyle(bubble));
  console.log('  - display:', getComputedStyle(bubble).display);
  console.log('  - visibility:', getComputedStyle(bubble).visibility);
  console.log('  - opacity:', getComputedStyle(bubble).opacity);
}
```

**原因2: 气泡被其他元素遮挡**
```javascript
// 检查z-index
const all = document.querySelectorAll('*');
let maxZ = 0;
all.forEach(el => {
  const z = parseInt(getComputedStyle(el).zIndex);
  if (z > maxZ) maxZ = z;
});
console.log('页面最大z-index:', maxZ);
console.log('气泡z-index应该是: 2147483647');
```

**原因3: 窗口太小，气泡在视口外**
```javascript
// 检查窗口大小
console.log('窗口大小:', {
  width: window.innerWidth,
  height: window.innerHeight
});
```

---

## ✅ 验证清单

请按顺序检查：

```
□ 1. 重新加载插件
□ 2. 刷新网页
□ 3. 打开控制台（F12）
□ 4. 等待5秒（首次吐槽）
□ 5. 手动运行: roastingAgent.roastNow('random')
□ 6. 查看控制台输出
□ 7. 检查是否有气泡出现
```

---

## 📸 请告诉我

1. **控制台输出了什么？** （截图或复制文本）
2. **是否看到气泡？** （是/否）
3. **气泡在什么位置？** （右下角/其他位置/完全没看到）
4. **价格信息是否正确？** （控制台中的BTC/SOL价格）
5. **当前情绪是什么？** （happy/sad/dead/neutral）

有了这些信息，我能快速定位问题！🔧✨
