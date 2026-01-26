# 🎉 Leek Vision Beta 3.0 发布说明

## 📦 版本信息
- **版本号**: 3.0
- **发布日期**: 2025-01-27
- **GitHub**: https://github.com/7ohnson-byte/Leek-Vision

---

## ✨ 重大更新

### 📰 加密货币新闻推送系统
- **实时新闻**: 使用 CryptoCompare API 获取最新加密货币新闻
- **智能推送**: 首次30秒后推送，之后每10分钟更新
- **点击跳转**: 点击新闻标题可直接跳转到原文
- **像素风格**: Minecraft 风格气泡，更加精致

### 🎭 市场情绪系统
- **价格追踪**: 实时追踪 BTC/SOL 价格（CoinGecko API）
- **情绪反应**: 根据涨跌幅改变宠物状态
  - 😎 上涨 > 2%: 戴墨镜 + 跳舞
  - 😢 下跌 < -2%: 流泪 + 发抖
  - 💀 暴跌 < -10%: 墓碑模式
  - 😐 震荡 ±2%: 正常漂浮

### 🔧 移除功能
- ❌ 移除"抓韭菜"游戏
- ❌ 移除"Leek Jump"游戏
- ✅ 专注新闻推送和情绪反应

---

## 🐛 修复的问题

### 1. 宠物兼容性问题
- **问题**: 情绪变化时宠物动画被破坏，变成 emoji
- **修复**: 只添加装饰层，不修改宠物内部结构
- **文件**: market-mood.js:234-337

### 2. 元素ID错误
- **问题**: 使用 `leek-pet` 但实际 ID 是 `degen-pet`
- **修复**: 更新所有引用为正确的 ID
- **文件**: market-mood.js:204, roasting-agent.js:195

### 3. 音频文件加载
- **问题**: 音频文件无法从内容页面访问
- **修复**: 添加 `audio/*.mp3` 到 web_accessible_resources
- **文件**: manifest.json:47

### 4. 气泡尺寸
- **问题**: 气泡太大（280px 宽）
- **修复**: 缩小到 200px，字体 12px → 9px
- **文件**: styles-market-mood.css:7-36

---

## 📊 推送频率优化

| 触发方式 | 之前 | 现在 |
|---------|------|------|
| 首次推送 | 5秒 | **30秒** ✅ |
| 空闲触发 | 1分钟 | **3分钟** ✅ |
| 定时推送 | 3分钟 | **10分钟** ✅ |
| 新闻刷新 | 5分钟 | **10分钟** ✅ |

---

## 🎨 UI 改进

### 气泡设计
- ✅ 像素风格边框（Minecraft 风格）
- ✅ 绿色文字 + 黑色阴影
- ✅ 更小的关闭按钮
- ✅ 新闻头部显示来源和时间

### 响应式
- 移动端优化（字体和尺寸自动调整）
- 固定定位确保可见性
- 最大 z-index 避免被遮挡

---

## 📁 文件变更

### 新增文件
- `market-mood.js` - 市场情绪系统
- `roasting-agent.js` - 新闻推送系统
- `styles-market-mood.css` - 像素风格样式
- `NEWS-FEATURE-GUIDE.md` - 新闻功能指南

### 修改文件
- `manifest.json` - 版本 2.8 → 3.0，更新脚本和样式列表
- `content.js` - 移除游戏菜单
- `styles.css` - 优化基础样式

### 移除文件
- `leek-catch-game.js`
- `leek-catch-items.js`
- `leek-jump-integration.js`
- 相关游戏样式文件

---

## 🚀 安装方法

1. 下载代码:
   ```bash
   git clone https://github.com/7ohnson-byte/Leek-Vision.git
   ```

2. 打开 Chrome 扩展管理页面:
   ```
   chrome://extensions
   ```

3. 启用"开发者模式"

4. 点击"加载已解压的扩展程序"

5. 选择项目文件夹

---

## 🧪 测试指南

### 测试新闻推送
```javascript
// 在控制台运行：
cryptoNewsAgent.showNewsNow();
```

### 测试市场情绪
```javascript
// 查看当前情绪：
console.log(marketMood.getMood());

// 查看价格信息：
console.log(marketMood.getPriceInfo());
```

### 测试刷新新闻
```javascript
// 刷新新闻缓存：
cryptoNewsAgent.refreshNews();
```

---

## 📝 API 使用

### CryptoCompare API
- **端点**: `https://min-api.cryptocompare.com/data/v2/news/`
- **参数**: `lang=EN&sortOrder=latest`
- **认证**: 无需 API Key（免费）
- **频率限制**: 每小时 300 次

### CoinGecko API
- **端点**: `https://api.coingecko.com/api/v3/simple/price`
- **参数**: `ids=bitcoin,solana&vs_currencies=usd&include_24hr_change=true`
- **认证**: 无需 API Key（免费）
- **频率限制**: 每分钟 30 次

---

## 🐛 已知问题

1. **CORS 限制**: 无法直接从 Twitter/X 获取 WatcherGuru 推文
   - **解决方案**: 使用 CryptoCompare 作为备用新闻源

2. **音频文件**: 部分 MP3 文件可能缺失
   - **解决方案**: 已在 manifest.json 中添加到 web_accessible_resources

---

## 🎯 下一步计划

- [ ] 添加更多新闻源（CoinDesk、CoinTelegraph）
- [ ] 支持自定义推送频率
- [ ] 添加新闻分类过滤（只看 BTC/ETH/SOL）
- [ ] 支持多语言新闻

---

## 🙏 致谢

- **CryptoCompare API**: 提供实时加密货币新闻
- **CoinGecko API**: 提供 BTC/SOL 价格数据
- **Claude Code**: AI 辅助开发

---

## 📞 反馈

如有问题或建议，请在 GitHub 提 Issue:
https://github.com/7ohnson-byte/Leek-Vision/issues

---

**🎉 享受你的加密货币新闻推送体验！**
