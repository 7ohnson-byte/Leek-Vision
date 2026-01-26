# 🌐 网页中英文切换功能指南

## ✨ 功能概述

网页端现在支持**中英文双语切换**！点击导航栏的语言按钮即可切换。

---

## 🎯 如何使用

### 方法 1：点击语言按钮
**位置**：页面右上角，Twitter 和 GitHub 链接左侧

**按钮显示**：
- 英文时：`🌐 EN`
- 中文时：`🌐 中`

**操作**：点击按钮 → 立即切换语言 + 播放音效 + 按钮动画

---

### 方法 2：自动保存偏好
- ✅ 切换后自动保存到浏览器
- ✅ 刷新页面保持语言选择
- ✅ 下次访问自动应用

---

## 📝 翻译内容清单

### 1. **导航栏**
| 元素 | 英文 | 中文 |
|-----|------|------|
| Twitter X | Twitter X | 推特 |
| GitHub | GitHub | GitHub |

### 2. **Hero 区域**
| 元素 | 英文 | 中文 |
|-----|------|------|
| 标题 | Don't just hodl.<br>Play the Market. | 别只管持有。<br>玩转市场。 |
| 副标题 | The Pixel-Perfect Web3 Browser Toy.<br>Crypto News • Market Mood • AI Analysis | 像素完美的 Web3 浏览器玩具。<br>加密新闻 • 市场情绪 • AI 分析 |

### 3. **按钮**
| 元素 | 英文 | 中文 |
|-----|------|------|
| 下载按钮 | 💾 DOWNLOAD LEEK VISION 3.0 | 💾 下载韭菜眼镜 3.0 |
| TG 按钮 | ✈️ JOIN TG CHANNEL | ✈️ 加入 TG 频道 |

### 4. **CA 地址**
| 元素 | 英文 | 中文 |
|-----|------|------|
| 标签 | SUPPORT THE PROJECT | 支持本项目 |
| 复制提示 | ✅ COPIED! | ✅ 已复制！ |

### 5. **特性卡片**
| 卡片 | 英文标题 | 中文标题 |
|-----|---------|---------|
| 卡片 1 | Crypto News Push | 加密新闻推送 |
| 卡片 2 | Market Mood Sync | 市场情绪同步 |
| 卡片 3 | Degen AI Brain | 韭菜 AI 大脑 |

### 6. **安装步骤**
| 步骤 | 英文 | 中文 |
|-----|------|------|
| 标题 | ⚡ HOW TO INSTALL (BETA) | ⚡ 如何安装 (测试版) |
| 步骤 1 | DOWNLOAD & UNZIP | 下载并解压 |
| 步骤 2 | OPEN EXTENSIONS | 打开扩展程序 |
| 步骤 3 | LOAD UNPACKED | 加载已解压的扩展程序 |

### 7. **Footer**
| 元素 | 英文 | 中文 |
|-----|------|------|
| 文本 | &copy; 2025 Leek Vision Labs \| Beta 3.0 \| Press Start to Continue. | &copy; 2025 韭菜视觉实验室 \| Beta 3.0 \| 按开始键继续。 |

### 8. **音效提示**
| 元素 | 英文 | 中文 |
|-----|------|------|
| 启用前 | 🔊 Click anywhere to enable sounds | 🔊 点击页面任意位置启用音效 |
| 启用后 | 🔊 Sounds Enabled! | 🔊 音效已启用！ |

---

## 🎮 交互体验

### 切换动画
1. **点击语言按钮**
2. **音效**：播放选择音效（leekAudio.select()）
3. **动画**：按钮缩小 + 旋转 5°
4. **更新**：所有文本立即切换
5. **控制台**：显示 `🌐 语言已切换到: English/中文`

### 视觉反馈
```
🌐 EN → 点击 → 🌐 中
         ↓
    [缩小 0.9x]
    [旋转 5°]
         ↓
    播放音效
         ↓
    全部文本切换
```

---

## 🧪 测试步骤

### 基础测试
1. 打开 `index.html`
2. 查看右上角语言按钮（应该显示 `🌐 EN` 或 `🌐 中`）
3. 点击按钮切换语言
4. 检查所有文本是否正确切换

### 详细测试清单
- [ ] 导航栏链接正确翻译
- [ ] Hero 标题和副标题正确翻译
- [ ] 两个下载按钮正确翻译
- [ ] CA 地址标签正确翻译
- [ ] 三个特性卡片正确翻译
- [ ] 三个安装步骤正确翻译
- [ ] Footer 正确翻译
- [ ] 音效提示正确翻译

### 持久化测试
1. 切换到中文
2. 刷新页面（F5）
3. 检查是否还是中文
4. 关闭浏览器标签页
5. 重新打开 `index.html`
6. 检查语言是否保持

---

## 🔧 技术细节

### HTML 结构
```html
<!-- 带翻译标记的元素 -->
<h1 data-i18n="hero_title">...</h1>
<p data-i18n="hero_subtitle">...</p>
<a data-i18n="btn_download">...</a>
```

### JavaScript 翻译对象
```javascript
const translations = {
    en: {
        hero_title: 'Don\'t just hodl...',
        btn_download: '💾 DOWNLOAD...'
    },
    zh: {
        hero_title: '别只管持有...',
        btn_download: '💾 下载...'
    }
};
```

### 切换逻辑
```javascript
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'zh' : 'en';
    localStorage.setItem('leekVisionLang', currentLang);
    updateLanguage();
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = translations[currentLang][key];
    });
}
```

---

## 📊 浏览器兼容性

| 功能 | Chrome | Firefox | Safari | Edge |
|-----|--------|---------|--------|------|
| 基础切换 | ✅ | ✅ | ✅ | ✅ |
| localStorage | ✅ | ✅ | ✅ | ✅ |
| 音效 | ✅ | ✅ | ⚠️ | ✅ |

⚠️ **Safari 注意**：Safari 可能需要用户交互后才能播放音效。

---

## 🐛 故障排除

### 语言不切换？
1. 检查控制台是否有错误
2. 确认 JavaScript 已加载
3. 清除浏览器缓存后重试

### 刷新后语言丢失？
1. 检查浏览器是否支持 localStorage
2. 查看控制台：`localStorage.getItem('leekVisionLang')`
3. 手动设置：`localStorage.setItem('leekVisionLang', 'zh')`

### 部分文本未翻译？
1. 检查元素是否有 `data-i18n` 属性
2. 确认 translations 对象中是否有对应键值
3. 查看控制台的翻译日志

---

## 🎯 快捷测试

在控制台运行：

```javascript
// 切换到中文
toggleLanguage();

// 切换到英文
toggleLanguage();

// 查看当前语言
console.log(currentLang); // 'en' 或 'zh'

// 手动设置语言
currentLang = 'zh';
updateLanguage();
```

---

## 📝 控制台日志

打开控制台（F12），应该看到：

```
🌐 多语言系统已加载！
当前语言: English (或 中文)
🌐 语言已切换到: 中文 (或 English)
```

切换时会看到：
```
🌐 语言已切换到: 中文
```

---

## 🌟 用户体验亮点

1. **无缝切换**：点击即可切换，无需刷新
2. **记忆功能**：记住用户偏好
3. **音效反馈**：切换时播放音效
4. **视觉动画**：按钮旋转缩放
5. **完整翻译**：所有文本都支持

---

现在你的网站支持中英双语了！用户可以自由切换语言，非常友好！🌐✨
