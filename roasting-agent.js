/**
 * 📰 Crypto News Agent - 加密货币新闻推送
 * 自动显示重要加密货币新闻（来源：CryptoCompare API）
 */

class CryptoNewsAgent {
  constructor() {
    this.lastActivityTime = Date.now();
    this.idleThreshold = 180000; // 3分钟不操作
    this.newsInterval = 600000; // 每10分钟推送一次
    this.lastNewsTime = 0;
    this.isShowingNews = false;

    // 新闻缓存
    this.newsCache = [];
    this.lastFetch = 0;
    this.fetchInterval = 600000; // 每10分钟刷新新闻列表

    console.log('📰 Crypto News Agent 初始化');

    // 监听用户活动
    this.setupActivityTracking();

    // 初始获取新闻
    this.fetchNews();
  }

  // 设置活动追踪
  setupActivityTracking() {
    // 监听鼠标移动
    document.addEventListener('mousemove', () => {
      this.lastActivityTime = Date.now();
    });

    // 监听键盘输入
    document.addEventListener('keydown', () => {
      this.lastActivityTime = Date.now();
    });

    // 监听点击
    document.addEventListener('click', () => {
      this.lastActivityTime = Date.now();
    });

    // 定期检查是否需要显示新闻
    setInterval(() => {
      this.checkAndShowNews();
    }, 10000); // 每10秒检查一次
  }

  // 检查并触发新闻显示
  checkAndShowNews() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTime;
    const timeSinceLastNews = now - this.lastNewsTime;

    // 用户长时间不操作
    if (timeSinceLastActivity > this.idleThreshold && timeSinceLastNews > this.newsInterval) {
      console.log('📰 触发空闲新闻推送');
      this.showRandomNews();
      this.lastNewsTime = now;
      return;
    }

    // 定时推送新闻（即使有活动）
    if (timeSinceLastNews > this.newsInterval && Math.random() < 0.15) {
      console.log('📰 触发定时新闻推送');
      this.showRandomNews();
      this.lastNewsTime = now;
      return;
    }
  }

  // 获取加密货币新闻
  async fetchNews() {
    try {
      console.log('📡 获取加密货币新闻...');

      // 使用 CryptoCompare API（免费，实时，无需认证）
      const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest');

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 获取到', data.Data.length, '条新闻');

      // 过滤重要新闻
      this.newsCache = data.Data
        .slice(0, 50) // 获取更多新闻
        .filter(post => {
          // 过滤掉一些不太重要的来源
          const title = post.title.toLowerCase();
          return !title.includes('submit') &&
                 !title.includes('press release') &&
                 !title.includes('sponsored') &&
                 post.categories && post.categories.length > 0;
        })
        .slice(0, 30) // 只保留前30条
        .map(post => ({
          title: post.title,
          url: post.url,
          source: post.source || 'CryptoNews',
          published_at: new Date(post.published_on * 1000).toISOString(),
          image: post.imageurl
        }));

      console.log('✅ 解析完成，共', this.newsCache.length, '条新闻');
      if (this.newsCache.length > 0) {
        console.log('📰 最新新闻:', this.newsCache[0].title);
      }

      this.lastFetch = Date.now();

    } catch (error) {
      console.error('❌ 获取新闻失败:', error);

      // 备用：使用预设的重要新闻
      this.newsCache = this.getFallbackNews();
    }
  }

  // 备用新闻列表（API失败时使用）
  getFallbackNews() {
    return [
      {
        title: 'Bitcoin breaks $100,000 milestone!',
        url: 'https://cointelegraph.com',
        source: 'CoinTelegraph',
        published_at: new Date().toISOString()
      },
      {
        title: 'Ethereum ETF approval expected soon',
        url: 'https://coindesk.com',
        source: 'CoinDesk',
        published_at: new Date().toISOString()
      },
      {
        title: 'Solana transaction volume surges to new high',
        url: 'https://decrypt.co',
        source: 'Decrypt',
        published_at: new Date().toISOString()
      }
    ];
  }

  // 显示随机新闻
  showRandomNews() {
    if (this.isShowingNews) return;

    // 如果新闻缓存为空或过期，重新获取
    if (this.newsCache.length === 0 || Date.now() - this.lastFetch > this.fetchInterval) {
      this.fetchNews().then(() => {
        this.displayNews();
      });
    } else {
      this.displayNews();
    }
  }

  // 显示新闻
  displayNews() {
    if (this.newsCache.length === 0) {
      console.warn('⚠️ 没有可显示的新闻');
      return;
    }

    this.isShowingNews = true;

    // 随机选择一条新闻
    const news = this.newsCache[Math.floor(Math.random() * this.newsCache.length)];

    // 显示新闻气泡
    this.showNewsBubble(news);

    // 播放音效
    leekAudio?.aiMessage();

    this.isShowingNews = false;
  }

  // 显示新闻气泡
  showNewsBubble(news) {
    const pet = document.getElementById('degen-pet');
    if (!pet) {
      console.error('❌ 宠物元素不存在，无法显示新闻');
      return;
    }

    console.log('📰 显示新闻:', news.title);

    // 移除旧气泡
    const oldBubble = document.querySelector('.roast-bubble');
    if (oldBubble) {
      console.log('移除旧气泡');
      oldBubble.remove();
    }

    // 创建新气泡
    const bubble = document.createElement('div');
    bubble.className = 'roast-bubble';

    // 截断标题（太长的话）
    let title = news.title;
    if (title.length > 80) {
      title = title.substring(0, 77) + '...';
    }

    // 格式化时间
    const timeAgo = this.formatTimeAgo(news.published_at);

    bubble.innerHTML = `
      <div class="news-header">
        <span class="news-source">📰 ${news.source || 'Crypto News'}</span>
        <span class="news-time">${timeAgo}</span>
      </div>
      <div class="news-title">${title}</div>
      <div class="roast-close" onclick="this.parentElement.remove()">✖</div>
    `;

    // 点击新闻标题跳转
    const titleEl = bubble.querySelector('.news-title');
    titleEl.style.cursor = 'pointer';
    titleEl.addEventListener('click', () => {
      window.open(news.url, '_blank');
    });

    // 定位到固定位置
    bubble.style.position = 'fixed';
    bubble.style.right = '20px';
    bubble.style.bottom = '100px';
    bubble.style.zIndex = '2147483647';
    bubble.style.display = 'block';

    document.body.appendChild(bubble);

    console.log('✅ 新闻气泡已创建');

    // 10秒后自动消失（给用户更多时间阅读）
    setTimeout(() => {
      if (bubble.parentElement) {
        console.log('新闻气泡即将消失');
        bubble.style.animation = 'bubblePopOut 0.3s ease-out';
        setTimeout(() => {
          if (bubble.parentElement) {
            bubble.remove();
            console.log('新闻气泡已移除');
          }
        }, 300);
      }
    }, 10000);
  }

  // 格式化时间（相对时间）
  formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    return `${diffDays}天前`;
  }

  // 手动触发新闻显示（用于测试）
  showNewsNow() {
    this.showRandomNews();
  }

  // 刷新新闻缓存
  refreshNews() {
    this.fetchNews();
  }
}

// 全局实例
const cryptoNewsAgent = new CryptoNewsAgent();

// 页面加载完成后的首次新闻
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('📰 首次新闻推送');
    cryptoNewsAgent.showNewsNow();
  }, 30000); // 30秒后首次推送
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CryptoNewsAgent;
}
