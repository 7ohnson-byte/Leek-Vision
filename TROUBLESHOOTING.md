# 🐛 抓韭菜游戏 - 故障排查指南

## 问题：点击"抓韭菜"没反应

### 🔍 步骤 1: 检查控制台错误

**打开控制台：**
```
Windows/Linux: 按 F12 或 Ctrl+Shift+J
Mac: 按 Cmd+Option+J
```

**查看Console标签：**
- 是否有红色错误信息？
- 截图发给我看

---

### 🔍 步骤 2: 手动测试

**在控制台粘贴以下代码：**

```javascript
// 测试函数是否存在
console.log('1. 函数检查:', typeof startLeekCatchGame);
console.log('2. Window函数:', typeof window.startLeekCatchGame);
console.log('3. 类存在:', typeof LeekCatchGame);

// 手动启动游戏
try {
  startLeekCatchGame();
  console.log('✅ 游戏启动成功！');
} catch (e) {
  console.error('❌ 错误:', e);
}
```

**期望结果：**
```
1. 函数检查: function
2. Window函数: function
3. 类存在: function
✅ 游戏启动成功！
```

---

### 🔍 步骤 3: 检查插件加载

**在控制台运行：**

```javascript
// 检查所有脚本是否加载
console.log('Items Database:', typeof ITEMS_DATABASE !== 'undefined' ? '✅' : '❌');
console.log('Game Engine:', typeof LeekCatchGame !== 'undefined' ? '✅' : '❌');
console.log('Skin Manager:', typeof skinManager !== 'undefined' ? '✅' : '❌');
console.log('Audio Engine:', typeof leekAudio !== 'undefined' ? '✅' : '❌');
```

**期望看到：**
```
Items Database: ✅
Game Engine: ✅
Skin Manager: ✅
Audio Engine: ✅
```

---

### 🔍 步骤 4: 强制重新加载

**完整重新加载流程：**

```
1. 完全关闭浏览器
2. 重新打开浏览器
3. 访问: chrome://extensions
4. 找到 "Leek Vision | 韭菜眼镜"
5. 先点击 "移除" (Remove)
6. 重新加载扩展:
   - 打开开发者模式 (Developer mode)
   - 点击 "加载已解压的扩展程序"
   - 选择文件夹: /Users/johnsonwang/Desktop/Leek-Vision-Beta2.8
7. 刷新测试网页
```

---

### 🔍 步骤 5: 检查文件顺序

**确认 manifest.json 中的加载顺序：**

```json
"js": [
  "audio-engine.js",           // 1️⃣ 第1个
  "skin-database.js",          // 2️⃣ 第2个
  "skin-manager.js",           // 3️⃣ 第3个
  "leek-catch-items.js",       // 4️⃣ 第4个
  "leek-catch-game.js",        // 5️⃣ 第5个
  "content.js",                // 6️⃣ 第6个
  "content-enhanced.js",       // 7️⃣ 第7个
  "game-engine.js"             // 8️⃣ 第8个
]
```

**顺序很重要！** 如果顺序错了，会导致函数未定义。

---

## 常见错误和解决方案

### 错误1: `startLeekCatchGame is not defined`

**原因：** 函数未正确加载

**解决：**
```javascript
// 检查 leek-catch-game.js 是否在 manifest.json 中
// 确保它在 content.js 之前加载
```

---

### 错误2: `LeekCatchGame is not a constructor`

**原因：** 类定义有问题

**解决：**
```javascript
// 检查 leek-catch-game.js 第6行
// 确保是: class LeekCatchGame {
// 而不是: class leekCatchGame { (小写)
```

---

### 错误3: `Cannot read property 'createElement' of null`

**原因：** document.body 不存在

**解决：**
```javascript
// 确保在页面加载完成后运行
// 如果还是不行，改成：
leekCatchGame = new LeekCatchGame(document.documentElement);
```

---

### 错误4: 游戏容器没有显示

**原因：** CSS 可能没加载

**解决：**
```javascript
// 检查 styles-leek-catch.css 是否在 manifest.json 中
// 确保它在 css 数组中
```

---

## 快速修复脚本

**复制以下代码到控制台：**

```javascript
// 🔧 快速修复
(function() {
  console.log('🔧 开始修复...');

  // 1. 检查并创建游戏
  if (typeof LeekCatchGame === 'undefined') {
    console.error('❌ LeekCatchGame 类未加载！');
    return;
  }

  // 2. 移除旧游戏
  if (window.leekCatchGame && window.leekCatchGame.gameContainer) {
    window.leekCatchGame.gameContainer.remove();
    console.log('✅ 旧游戏已移除');
  }

  // 3. 创建新游戏
  try {
    window.leekCatchGame = new LeekCatchGame(document.body);
    window.leekCatchGame.init();
    console.log('✅ 游戏创建成功！');

    // 4. 验证
    setTimeout(() => {
      const container = document.querySelector('.leek-catch-container');
      if (container) {
        console.log('✅ 游戏容器已创建');
        console.log('位置:', {
          top: container.style.top,
          left: container.style.left,
          width: container.style.width,
          height: container.style.height
        });
      } else {
        console.error('❌ 游戏容器未找到');
      }
    }, 1000);

  } catch (error) {
    console.error('❌ 创建失败:', error);
    alert('游戏启动失败: ' + error.message);
  }
})();
```

---

## 📸 请提供以下信息

如果还是不行，请告诉我：

1. **控制台错误截图**
   - F12 打开控制台
   - 截图所有红色错误

2. **浏览器版本**
   - Chrome/Edge 版本号

3. **测试结果**
   - 运行上面的"快速修复脚本"
   - 把输出复制给我

4. **其他游戏是否正常？**
   - Leek Jump 能玩吗？
   - 皮肤系统能打开吗？

---

## 🎯 最可能的原因

基于经验，最可能是：

1. **浏览器缓存** → 需要强制刷新
2. **文件未加载** → manifest.json 顺序问题
3. **CSS冲突** → z-index 太低被遮挡

---

**先试试"快速修复脚本"，然后把结果告诉我！** 🔧✨
