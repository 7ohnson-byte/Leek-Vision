# 🎮 游戏修复指南 - 快速测试

## ✅ 已修复的问题

**问题**: 点击宠物后直接随机移动，没有弹出菜单

**原因**: `content-enhanced.js` 和 `leek-jump-integration.js` 冲突

**解决方案**: 创建了 `leek-jump-integration-fixed.js`，它会：
1. ✅ 劫持原有的宠物点击行为
2. ✅ 显示一个菜单，让用户选择
3. ✅ 保留原有的随机动画功能
4. ✅ 添加新游戏选项

---

## 🚀 快速测试步骤

### **1. 重新加载插件**

```
1. 打开 chrome://extensions
2. 找到 Leek Vision
3. 点击 🔄 刷新按钮 (重要！)
```

### **2. 确认 Casual Mode**

```
1. 点击插件图标
2. 确保模式选择为 "Casual Mode"
3. 如果不是，切换到 Casual Mode
```

### **3. 测试宠物点击**

```
1. 刷新任意网页 (如 google.com)
2. 看到右下角的像素宠物
3. 点击宠物
```

**期望结果**:
```
应该弹出一个菜单，显示：
┌─────────────────────────────┐
│  🌿 CASUAL MODE 🌿          │
├─────────────────────────────┤
│                             │
│  🎲 Random Animation        │
│     宠物随机移动             │
│                             │
│  🎮 Play Leek Jump  NEW!    │
│     "Thanks Crypto" Edition  │
│                             │
│  🏆 High Score: $0          │
│  💰 Total Earned: $0        │
│  🏎️ SF90 Progress: 0%      │
└─────────────────────────────┘
```

### **4. 测试两个选项**

**选项 A: Random Animation**
```
1. 点击 "🎲 Random Animation"
2. 宠物应该在屏幕上随机移动
3. 和之前的行为一样
```

**选项 B: Play Leek Jump**
```
1. 点击 "🎮 Play Leek Jump"
2. 游戏界面应该弹出
3. 点击/空格键开始跳跃
```

---

## 🐛 如果还是不行

### **检查 1: 控制台错误**

```javascript
// 打开控制台 (F12)
// 查看是否有以下错误信息:

❌ "Game engine not loaded"
→ 解决: 刷新页面，重试

❌ "Cannot read property 'xxx' of undefined"
→ 解决: 发送错误给我，我来修复

✅ "Pet click intercepted successfully"
→ 说明劫持成功，继续下一步
```

### **检查 2: 加载顺序**

```javascript
// 在控制台运行
console.log(typeof LeekJumpGame);      // 应该是 "function"
console.log(typeof LeekJumpIntegration); // 应该是 "object"
```

如果显示 `undefined`，说明文件加载顺序有问题。

### **检查 3: 手动启动**

```javascript
// 在控制台运行
window.LeekJumpIntegration.showMenu();
```

这应该会强制显示菜单。

### **检查 4: 绕过劫持**

如果还是不行，直接启动游戏：

```javascript
// 在控制台运行
window.LeekJumpIntegration.startGame();
```

这会直接启动游戏，跳过菜单。

---

## 🔧 调试模式

### **启用调试日志**

```javascript
// 在控制台运行
localStorage.setItem('leekJumpDebug', 'true');
```

然后点击宠物，控制台会显示详细日志。

### **查看所有游戏数据**

```javascript
// 在控制台运行
const data = {
    highScore: localStorage.getItem('leekJumpHighScore'),
    totalEarnings: localStorage.getItem('leekJumpTotalEarnings'),
    sessions: localStorage.getItem('leekJumpSessions'),
    achievements: localStorage.getItem('leekJumpAchievements'),
    sf90Progress: ((parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0) / 600000 * 100).toFixed(2) + '%'
};
console.table(data);
```

---

## 📸 成功截图

当你成功启动游戏后，应该看到：

### **菜单界面**
```
┌───────────────────────────────────────┐
│                                       │
│    🌿 CASUAL MODE 🌿                 │
│                                       │
│    [🎲 Random Animation    ▶]        │
│    宠物随机移动                       │
│                                       │
│    [🎮 Play Leek Jump  ▶]  NEW!      │
│    "Thanks Crypto" Edition            │
│                                       │
│    🏆 High Score: $0                  │
│    💰 Total Earned: $0                │
│    🏎️ SF90 Progress: 0%              │
│    ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱       │
│                                       │
│    🎯 DAILY CHALLENGE                 │
│    $1,234 / $1,500                   │
│                                       │
└───────────────────────────────────────┘
```

### **游戏界面**
```
┌───────────────────────────────────────┐
│  🧢 LEEK JUMP                         │
├───────────────────────────────────────┤
│                                       │
│              💰 $10                   │
│                                       │
│            🧢 ↗                      │
│           💰💎                       │
│         🟦🟦🟦🟦                     │
│       🔴    🟦  🟦                   │
│     🟦🟦🟦🟦🟦🟦                   │
│                                       │
│  Click or Press Space to Jump         │
└───────────────────────────────────────┘
```

---

## ✅ 测试清单

完成以下测试，确认一切正常：

- [ ] 插件已刷新
- [ ] Casual Mode 已启用
- [ ] 点击宠物弹出菜单
- [ ] "Random Animation" 选项正常工作
- [ ] "Play Leek Jump" 选项能启动游戏
- [ ] 游戏中点击/空格键可以跳跃
- [ ] 收集金币有音效
- [ ] ESC 可以关闭游戏
- [ ] 控制台没有错误

---

## 💬 仍有问题？

请提供以下信息：

1. **浏览器版本**: Chrome/Edge + 版本号
2. **控制台错误**: 复制所有红色错误信息
3. **描述**: 点击宠物后发生了什么
4. **截图**: 如果可能，提供截图

我会立即帮你解决！

---

## 🎉 成功标志

当你看到这个时，说明成功了：

```javascript
✅ 控制台显示: "Pet click intercepted successfully"
✅ 点击宠物弹出菜单
✅ 菜单有两个选项
✅ 点击 "Play Leek Jump" 启动游戏
✅ 游戏正常运行
```

**现在重新加载插件，试试吧！** 🚀
