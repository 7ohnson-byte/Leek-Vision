/**
* 🎭 Market Mood Sync - 情绪挂钩系统
* 根据BTC/SOL价格涨跌改变宠物状态
*/

class MarketMoodSync {
  constructor() {
    this.currentMood = 'neutral'; // neutral, happy, sad, dead
    this.priceCache = {
      btc: { current: 0, previous: 0, change: 0 },
      sol: { current: 0, previous: 0, change: 0 }
    };
    this.lastUpdate = 0;
    this.updateInterval = 60000; // 每分钟更新一次

    console.log('🎭 Market Mood Sync 初始化');
  }

  // 初始化
  async init() {
    console.log('🎭 开始同步市场情绪...');

    // 初始获取价格
    await this.fetchPrices();

    // 定期更新价格
    setInterval(() => {
      this.fetchPrices();
    }, this.updateInterval);

    // 立即应用情绪
    this.applyMood();
  }

  // 获取价格数据
  async fetchPrices() {
    try {
      console.log('💰 获取最新价格...');

      // 优先从API获取，因为CoinGecko API提供24小时涨跌幅
      const apiPrices = await this.fetchPriceFromAPI();

      if (apiPrices.btc && apiPrices.sol) {
        console.log('✅ 从API获取价格成功');

        // 保存旧价格
        if (this.priceCache.btc.current > 0) {
          this.priceCache.btc.previous = this.priceCache.btc.current;
        }
        if (this.priceCache.sol.current > 0) {
          this.priceCache.sol.previous = this.priceCache.sol.current;
        }

        // 更新当前价格
        this.priceCache.btc.current = apiPrices.btc;
        this.priceCache.sol.current = apiPrices.sol;

        // 从API获取24小时涨跌幅
        if (apiPrices.btc_24h_change !== undefined) {
          this.priceCache.btc.change = apiPrices.btc_24h_change;
        }
        if (apiPrices.sol_24h_change !== undefined) {
          this.priceCache.sol.change = apiPrices.sol_24h_change;
        }

        console.log('BTC 价格:', this.priceCache.btc.current, '24h涨跌:', this.priceCache.btc.change.toFixed(2) + '%');
        console.log('SOL 价格:', this.priceCache.sol.current, '24h涨跌:', this.priceCache.sol.change.toFixed(2) + '%');
      } else {
        console.log('⚠️ API获取失败，尝试备用方法');
        // 备用方法：从页面获取
        const pagePrices = await this.getPriceFromPage();
        if (pagePrices.btc && pagePrices.sol) {
          // 更新价格
          if (this.priceCache.btc.current > 0) {
            this.priceCache.btc.previous = this.priceCache.btc.current;
          }
          if (this.priceCache.sol.current > 0) {
            this.priceCache.sol.previous = this.priceCache.sol.current;
          }

          this.priceCache.btc.current = pagePrices.btc;
          this.priceCache.sol.current = pagePrices.sol;

          // 计算涨跌幅（基于上次价格）
          this.priceCache.btc.change = this.calculateChange(
            this.priceCache.btc.current,
            this.priceCache.btc.previous
          );
          this.priceCache.sol.change = this.calculateChange(
            this.priceCache.sol.current,
            this.priceCache.sol.previous
          );

          console.log('BTC 价格:', this.priceCache.btc.current, '涨跌:', this.priceCache.btc.change.toFixed(2) + '%');
          console.log('SOL 价格:', this.priceCache.sol.current, '涨跌:', this.priceCache.sol.change.toFixed(2) + '%');
        }
      }

      // 计算综合情绪
      this.calculateMood();

      // 应用情绪
      this.applyMood();

    } catch (error) {
      console.error('❌ 获取价格失败:', error);
    }
  }

  // 从页面获取价格（如果有显示的话）
  async getPriceFromPage() {
    return new Promise((resolve) => {
      // 尝试从页面上的价格标签获取
      const btcBadge = document.querySelector('.degen-price-badge[data-symbol="BTC"]');
      const solBadge = document.querySelector('.degen-price-badge[data-symbol="SOL"]');

      const prices = {};

      if (btcBadge) {
        const btcText = btcBadge.textContent;
        const btcMatch = btcText.match(/\$?([\d,]+\.?\d*)/);
        if (btcMatch) {
          prices.btc = parseFloat(btcMatch[1].replace(/,/g, ''));
        }
      }

      if (solBadge) {
        const solText = solBadge.textContent;
        const solMatch = solText.match(/\$?([\d,]+\.?\d*)/);
        if (solMatch) {
          prices.sol = parseFloat(solMatch[1].replace(/,/g, ''));
        }
      }

      // 如果页面上没有，使用API
      if (!prices.btc || !prices.sol) {
        this.fetchPriceFromAPI().then(apiPrices => {
          resolve({ ...prices, ...apiPrices });
        });
      } else {
        resolve(prices);
      }
    });
  }

  // 从API获取价格
  async fetchPriceFromAPI() {
    try {
      console.log('📡 请求CoinGecko API...');
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,solana&vs_currencies=usd&include_24hr_change=true');

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API响应:', data);

      const result = {
        btc: data.bitcoin?.usd || null,
        sol: data.solana?.usd || null,
        btc_24h_change: data.bitcoin?.usd_24h_change || null,
        sol_24h_change: data.solana?.usd_24h_change || null
      };

      console.log('解析后的价格数据:', result);
      return result;

    } catch (error) {
      console.error('❌ API获取失败:', error);
      return { btc: null, sol: null, btc_24h_change: null, sol_24h_change: null };
    }
  }

  // 计算涨跌幅
  calculateChange(current, previous) {
    if (!previous || !current) return 0;
    return ((current - previous) / previous) * 100;
  }

  // 计算综合情绪
  calculateMood() {
    // 综合BTC和SOL的涨跌幅
    const avgChange = (this.priceCache.btc.change + this.priceCache.sol.change) / 2;

    console.log('平均涨跌:', avgChange.toFixed(2) + '%');

    // 确定情绪
    if (avgChange <= -10) {
      this.currentMood = 'dead'; // 暴跌：骷髅/墓碑
    } else if (avgChange <= -2) {
      this.currentMood = 'sad'; // 下跌：流泪/发抖
    } else if (avgChange >= 2) {
      this.currentMood = 'happy'; // 上涨：戴墨镜/跳舞
    } else {
      this.currentMood = 'neutral'; // 震荡：正常状态
    }

    console.log('当前情绪:', this.currentMood);
  }

  // 应用情绪到宠物
  applyMood() {
    const pet = document.getElementById('degen-pet'); // 修复：使用正确的ID
    if (!pet) {
      console.error('❌ 找不到宠物元素 degen-pet');
      return;
    }

    console.log('🎭 应用情绪:', this.currentMood);

    // 移除所有情绪类
    pet.classList.remove('mood-happy', 'mood-sad', 'mood-dead', 'mood-neutral');

    // 添加当前情绪类
    pet.classList.add(`mood-${this.currentMood}`);

    // 更新宠物样式
    switch (this.currentMood) {
      case 'happy':
        this.applyHappyMood(pet);
        break;
      case 'sad':
        this.applySadMood(pet);
        break;
      case 'dead':
        this.applyDeadMood(pet);
        break;
      default:
        this.applyNeutralMood(pet);
    }
  }

  // 😎 快乐情绪（上涨）
  applyHappyMood(pet) {
    // 不要修改内部HTML结构，只添加装饰
    // 移除旧的装饰元素
    const oldSunglasses = pet.querySelector('.pet-sunglasses');
    if (oldSunglasses) oldSunglasses.remove();

    const oldTears = pet.querySelector('.pet-tears');
    if (oldTears) oldTears.remove();

    // 添加墨镜（作为装饰元素，不替换内容）
    const sunglasses = document.createElement('div');
    sunglasses.className = 'pet-sunglasses';
    sunglasses.innerHTML = '😎';
    sunglasses.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 32px;
      z-index: 10;
      pointer-events: none;
    `;
    pet.appendChild(sunglasses);

    // 添加表情气泡
    this.showMoodBubble(pet, '🚀 To The Moon!');

    leekAudio?.success();
  }

  // 😢 伤心情绪（下跌）
  applySadMood(pet) {
    // 移除旧装饰
    const oldSunglasses = pet.querySelector('.pet-sunglasses');
    if (oldSunglasses) oldSunglasses.remove();

    const oldTears = pet.querySelector('.pet-tears');
    if (oldTears) oldTears.remove();

    // 添加眼泪（作为装饰元素）
    const tears = document.createElement('div');
    tears.className = 'pet-tears';
    tears.innerHTML = '💧💧';
    tears.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 16px;
      z-index: 10;
      pointer-events: none;
      animation: tearsFall 1s ease-in infinite;
    `;
    pet.appendChild(tears);

    // 添加表情气泡
    this.showMoodBubble(pet, '😢 又亏了...');

    leekAudio?.error();
  }

  // 💀 死亡情绪（暴跌）
  applyDeadMood(pet) {
    // 不要改变宠物，只添加墓碑标记
    // 移除所有装饰
    const oldDecorations = pet.querySelectorAll('.pet-sunglasses, .pet-tears');
    oldDecorations.forEach(el => el.remove());

    // 添加死亡标记类（不改变内容）
    pet.classList.add('pet-dead');

    // 添加墓碑图标（作为叠加层）
    const tombstone = document.createElement('div');
    tombstone.className = 'pet-tombstone';
    tombstone.innerHTML = '🪦';
    tombstone.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 40px;
      z-index: 20;
      opacity: 0.7;
      pointer-events: none;
      filter: grayscale(100%);
    `;
    pet.appendChild(tombstone);

    // 添加表情气泡
    this.showMoodBubble(pet, '💀 安息吧...');

    leekAudio?.error();
  }

  // 😐 中性情绪
  applyNeutralMood(pet) {
    // 移除所有装饰元素
    const oldDecorations = pet.querySelectorAll('.pet-sunglasses, .pet-tears, .pet-tombstone');
    oldDecorations.forEach(el => el.remove());

    // 移除死亡标记
    pet.classList.remove('pet-dead');
  }

  // 显示情绪气泡
  showMoodBubble(pet, text) {
    // 移除旧气泡
    const oldBubble = document.querySelector('.mood-bubble');
    if (oldBubble) oldBubble.remove();

    // 创建新气泡
    const bubble = document.createElement('div');
    bubble.className = 'mood-bubble';
    bubble.textContent = text;

    // 定位
    const petRect = pet.getBoundingClientRect();
    bubble.style.right = '60px';
    bubble.style.bottom = '60px';

    document.body.appendChild(bubble);

    // 3秒后消失
    setTimeout(() => {
      bubble.style.animation = 'fadeOut 0.5s ease-out';
      setTimeout(() => bubble.remove(), 500);
    }, 3000);
  }

  // 获取当前情绪
  getMood() {
    return this.currentMood;
  }

  // 获取价格信息
  getPriceInfo() {
    return {
      btc: this.priceCache.btc,
      sol: this.priceCache.sol,
      mood: this.currentMood
    };
  }
}

// 全局实例
const marketMood = new MarketMoodSync();

// 自动初始化（延迟执行，确保页面加载完成）
setTimeout(() => {
  marketMood.init();
}, 2000);

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MarketMoodSync;
}
