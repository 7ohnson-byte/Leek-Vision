// ═══════════════════════════════════════════════════════════════════════════════
// LEEK VISION v3.10 - NUMERIC PARSING FIX
// Fixes: "1.3K" bug (Added support for K/M/B suffixes)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('🚀 Leek Vision v3.10: Math Fixed.');

// =====================================================
// 1. GLOBAL CONSTANTS
// =====================================================
const DEMO_RATES = { SOL: 130, BTC: 89000, ETH: 3000, BNB: 873 };
let currentRates = { ...DEMO_RATES };

const CURRENCIES = {
  SOL: { icon: '🧢', name: 'SOL' },
  BTC: { icon: '₿', name: 'BTC' },
  ETH: { icon: 'Ξ', name: 'ETH' },
  BNB: { icon: '🔶', name: 'BNB' },
};

const REAL_WORLD_ITEMS = [
  { name: 'Ferrari SF90', price: 600000, icon: '🏎️', unit: '辆' },
  { name: 'Tesla Model 3', price: 40000, icon: '🚗', unit: '辆' },
  { name: 'Rolex Daytona', price: 25000, icon: '⌚', unit: '块' },
  { name: 'Nvidia H100', price: 30000, icon: '📟', unit: '张' },
  { name: 'MacBook Pro', price: 2000, icon: '💻', unit: '台' },
  { name: 'iPhone 16 Pro', price: 999, icon: '📱', unit: '部' },
  { name: 'PS5 Console', price: 500, icon: '🎮', unit: '台' },
  { name: 'Netflix Year', price: 185, icon: '📺', unit: '年' },
  { name: 'Omakase', price: 150, icon: '🍣', unit: '顿' },
  { name: 'Big Mac', price: 5.5, icon: '🍔', unit: '个' },
  { name: 'Starbucks', price: 4.5, icon: '☕', unit: '杯' },
  // 新增挂逼选项 (用于极小额亏损/盈利)
  { name: 'Instant Noodle', price: 0.5, icon: '🍜', unit: '包' } 
];

const PetState = { container: null, avatar: null, mode: 'IDLE', timers: {} };
let currentCurrency = 'SOL';
let operationMode = 'casual';
let activeDropdown = null;
let activeBadge = null;
let scanTimeout = null;
let isChatOpen = false;
let APP_MODE = 'SHOPPING';
let currentPageTokenInfo = { name: null, ca: null };

// =====================================================
// 2. SITE DETECTION
// =====================================================
function detectSiteMode() {
  const host = window.location.hostname.toLowerCase();
  const tradingDomains = [
    'gmgn.ai', 'dexscreener.com', 'dextools.io', 'birdeye.so',
    'geckoterminal.com', 'photon', 'bullx.io', 'jup.ag',
    'raydium.io', 'uniswap.org', 'okx.com', 'binance.com'
  ];
  if (tradingDomains.some(domain => host.includes(domain))) {
    scrapeTokenInfo();
    return 'TRADING';
  }
  return 'SHOPPING';
}

function applyLayoutMode() {
  const host = window.location.hostname;
  if (!document.body) return;
  const ghostSites = ['taobao.com', 'tmall.com', 'jd.com', '1688.com'];
  if (ghostSites.some(site => host.includes(site))) {
    document.body.classList.add('leek-layout-ghost');
    document.body.classList.remove('leek-layout-flow');
  } else {
    document.body.classList.add('leek-layout-flow');
    document.body.classList.remove('leek-layout-ghost');
  }
}

function scrapeTokenInfo() {
    try {
        const title = document.title || "";
        const nameMatch = title.match(/^([A-Za-z0-9]+)\s*[\/|]/);
        if (nameMatch) {
            currentPageTokenInfo.name = nameMatch[1].trim();
        } else {
            const words = title.split(' ').slice(0, 2).join(' ');
            currentPageTokenInfo.name = words.substring(0, 20);
        }
    } catch (e) {}
}

// =====================================================
// 3. API & DATA
// =====================================================
async function fetchRealPrices() {
  try {
      chrome.runtime.sendMessage({ action: "getPrices" }, (response) => {
        if (chrome.runtime.lastError) return; 
        if (response && response.success && response.data) {
          const data = response.data;
          if (data.solana) currentRates.SOL = data.solana.usd;
          if (data.bitcoin) currentRates.BTC = data.bitcoin.usd;
          if (data.ethereum) currentRates.ETH = data.ethereum.usd;
          if (data.binancecoin) currentRates.BNB = data.binancecoin.usd;
          if (APP_MODE === 'SHOPPING') updateAllBadges();
        }
      });
  } catch (e) {}
}

// =====================================================
// 4. TRADING MODE: SHARE CARD
// =====================================================
function scanTradingPNL() {
  // 扩大扫描范围：有些网站只有数字和颜色，没有符号
  const xpath = `//text()[contains(., '$') or contains(., '%') or contains(., 'PNL') or contains(., 'USD') or contains(., 'K') or contains(., 'M')]`;
  let snapshot = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  for (let i = 0; i < snapshot.snapshotLength; i++) {
    const node = snapshot.snapshotItem(i);
    const el = node.parentElement;
    if (el.dataset.leekPnlChecked) continue;
    
    const text = node.textContent.trim();
    // 必须包含数字
    if (!/\d/.test(text)) continue;
    
    // 过滤掉太小的元素或明显不是 PNL 的长文本
    if (el.offsetWidth < 20 || el.offsetHeight < 10) continue;
    if (text.length > 20) continue; 

    el.dataset.leekPnlChecked = "true";
    injectShareButton(el, text);
  }
}

function injectShareButton(targetEl, rawText) {
  const btn = document.createElement('span');
  btn.className = 'leek-share-btn';
  btn.innerHTML = '📷';
  btn.title = 'Share PNL';
  btn.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    generateShareCard(rawText);
  };
  targetEl.appendChild(btn);
}

// 🟢 核心修复：支持 K/M/B 后缀解析
function generateShareCard(rawText) {
  
  // 1. 检测单位后缀 (忽略大小写)
  let multiplier = 1;
  if (/[kK]/.test(rawText)) multiplier = 1000;
  else if (/[mM]/.test(rawText)) multiplier = 1000000;
  else if (/[bB]/.test(rawText)) multiplier = 1000000000;

  // 2. 清洗字符串
  // 先把逗号去掉 (1,200 -> 1200)
  let cleanNum = rawText.replace(/,/g, '');
  // 再把所有非数字字符（除了 . 和 -）去掉
  // 注意：K, M, B 会在这里被去掉，所以上面要先检测
  cleanNum = cleanNum.replace(/[^\d.-]/g, '');

  let usdValue = parseFloat(cleanNum);

  // 3. 应用乘数
  if (!isNaN(usdValue)) {
      usdValue = usdValue * multiplier;
  } else {
      // 最后的容错
      usdValue = 100;
  }

  // --- 以下逻辑保持不变 ---

  const isProfit = usdValue >= 0;
  let currentIndex = REAL_WORLD_ITEMS.length - 1;
  const absVal = Math.abs(usdValue);
  
  // 智能匹配：找到第一个价格合适的物品
  // 逻辑：物品单价 * 0.1 <= 利润 (即至少能买起 0.1 个该物品，或者显示很多个便宜物品)
  for (let i = 0; i < REAL_WORLD_ITEMS.length; i++) {
    if (absVal >= REAL_WORLD_ITEMS[i].price * 0.5) {
      currentIndex = i;
      break;
    }
  }

  const existing = document.getElementById('leek-share-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'leek-share-modal';
  modal.className = 'leek-share-modal';
  
  const moodColor = isProfit ? '#00FF00' : '#FF3333';
  const moodText = isProfit ? 'PROFIT' : 'LOSS';
  // 根据盈亏切换宠物
  const petImg = isProfit ? 'pet-run.gif' : 'pet-shrug.gif';
  const petBgUrl = chrome.runtime.getURL(`images/${petImg}`);

  let tokenInfoHtml = '';
  if (currentPageTokenInfo.name) {
      tokenInfoHtml = `
        <div class="token-info-box" style="border-color: ${moodColor}">
            <div>TOKEN: <span style="color:#fff">${currentPageTokenInfo.name}</span></div>
        </div>`;
  }

  modal.innerHTML = `
    <div class="leek-controller-card">
      <div class="watermark-layer" style="background-image: url('${petBgUrl}')"></div>
      
      <div class="controller-header">
        <div class="header-title">🧢 LEEK VISION</div>
        <div class="close-btn" id="close-share-btn">✖</div>
      </div>

      <div class="controller-body">
        <div class="pnl-section">
          <div class="label-text">TRADING PNL</div>
          ${tokenInfoHtml}
          <div class="pnl-display" style="color: ${moodColor}; border-color: ${moodColor}">
            ${rawText} <span class="mood-tag" style="background:${moodColor}">${moodText}</span>
          </div>
        </div>

        <div class="divider-pixel">⬇ EQUALS ⬇</div>

        <div class="real-world-section">
          <div class="nav-arrow prev-unit">◀</div>
          <div class="item-display" id="rw-display-area"></div>
          <div class="nav-arrow next-unit">▶</div>
        </div>

        <button class="action-btn share-btn">
          🐦 SHARE ON X
        </button>
        <div class="card-footer">VERIFIED BY LEEK VISION EXTENSION</div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const renderItem = () => {
    const item = REAL_WORLD_ITEMS[currentIndex];
    // 计算数量，保留两位小数
    let qty = (Math.abs(usdValue) / item.price).toFixed(2);
    // 如果是整数，去掉 .00
    if(qty.endsWith('.00')) qty = qty.slice(0, -3);

    const display = document.getElementById('rw-display-area');
    display.innerHTML = `
      <div class="rw-icon">${item.icon}</div>
      <div class="rw-info">
        <div class="rw-qty">${qty} <span class="rw-unit">${item.unit}</span></div>
        <div class="rw-name">${item.name}</div>
      </div>
    `;
  };
  renderItem();

  document.getElementById('close-share-btn').onclick = () => modal.remove();
  
  modal.querySelector('.prev-unit').onclick = () => {
    currentIndex = (currentIndex - 1 + REAL_WORLD_ITEMS.length) % REAL_WORLD_ITEMS.length;
    renderItem();
  };
  modal.querySelector('.next-unit').onclick = () => {
    currentIndex = (currentIndex + 1) % REAL_WORLD_ITEMS.length;
    renderItem();
  };
  
  modal.querySelector('.share-btn').onclick = () => {
    const item = REAL_WORLD_ITEMS[currentIndex];
    const qty = (Math.abs(usdValue) / item.price).toFixed(2);
    const action = isProfit ? "earned" : "lost";
    const tokenTxt = currentPageTokenInfo.name ? ` on $${currentPageTokenInfo.name}` : '';
    const tweetText = `I just ${action} ${qty} ${item.name}s ${item.icon} trading${tokenTxt}! \n\nPNL: ${rawText}\nVerified by #LeekVision 🧢`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
  };
}

// =====================================================
// 5. SHOPPING MODE
// =====================================================
function parsePrice(rawString, isTrusted = false) {
  if (!rawString || typeof rawString !== 'string') return null;
  if (/\b(mo|mos|month|months|yr|years|day|days|stock|left|cm|mm|kg)\b/i.test(rawString)) return null;
  if (rawString.includes('%')) return null;
  if (!isTrusted) {
    const validCurrencyPattern = /[\$\¥\€\£\₹\₩\₽]|USD|CNY|EUR|GBP|JPY|INR|KRW|RMB|元|块|圆/;
    if (!validCurrencyPattern.test(rawString)) return null;
  }
  let clean = rawString.replace(/\u00A0/g, ' ').replace(/券后/g, '').replace(/折/g, '').trim();
  clean = clean.replace(/(\d)\s+(\d)/g, '$1$2'); 
  const match = clean.match(/([0-9.,]+)/);
  if (!match) return null;
  let numberStr = match[0];
  const isEuro = clean.includes('€') || clean.includes('EUR') || /[,]\d{2}$/.test(numberStr);
  if (isEuro) numberStr = numberStr.replace(/\./g, '').replace(/,/g, '.');
  else numberStr = numberStr.replace(/,/g, '');
  const price = parseFloat(numberStr);
  if (isNaN(price) || price <= 0 || price > 1000000000) return null; 
  return price;
}

function detectCurrency(text) {
  if (!text) return { rate: 1.0 };
  const t = text.toUpperCase();
  if (t.includes('GBP') || t.includes('£')) return { rate: 1.27 };
  if (t.includes('EUR') || t.includes('€')) return { rate: 1.08 };
  if (t.includes('CNY') || t.includes('RMB') || t.includes('¥') || t.includes('元')) return { rate: 0.14 };
  if (t.includes('HKD') || t.includes('HK$')) return { rate: 0.13 };
  if (t.includes('JPY') || t.includes('円')) return { rate: 0.0065 };
  const host = window.location.hostname;
  if (host.includes('taobao') || host.includes('tmall') || host.includes('jd')) return { rate: 0.14 };
  return { rate: 1.0 };
}

function createBadge(usdPrice) {
  const badge = document.createElement('span');
  badge.className = 'degen-vision-badge';
  const cryptoAmount = usdPrice / (currentRates[currentCurrency] || currentRates.SOL);
  const icon = CURRENCIES[currentCurrency]?.icon || '🧢';
  let val = cryptoAmount >= 100 ? cryptoAmount.toFixed(1) : cryptoAmount.toFixed(2);
  badge.textContent = `${icon} ${val} ${currentCurrency}`;
  badge.setAttribute('data-usd-price', usdPrice);
  badge.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    activeDropdown && activeBadge === badge ? closeAllDropdowns() : createDropdown(badge);
  };
  return badge;
}

function updateAllBadges() {
  document.querySelectorAll('.degen-vision-badge').forEach(badge => {
    const usd = parseFloat(badge.getAttribute('data-usd-price'));
    if (!isNaN(usd) && currentRates[currentCurrency]) {
      const cryptoAmount = usd / currentRates[currentCurrency];
      const icon = CURRENCIES[currentCurrency]?.icon || '🧢';
      let val = cryptoAmount >= 100 ? cryptoAmount.toFixed(1) : cryptoAmount.toFixed(2);
      badge.textContent = `${icon} ${val} ${currentCurrency}`;
    }
  });
}

function scanShoppingPrices() {
  const trustedSelectors = ['.a-price', '.price', '.product-price', '.tb-rmb-num', '.rmb-num', '.price-value'];
  const xpath = `//text()[contains(., '¥') or contains(., '$') or contains(., '£') or contains(., '€') or contains(., '元')]`;
  let nodes = [];
  trustedSelectors.forEach(sel => {
    try { document.querySelectorAll(sel).forEach(el => { el.dataset.leekTrusted = "true"; nodes.push(el); }); } catch(e){}
  });
  try {
    const res = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0; i < res.snapshotLength; i++) { nodes.push(res.snapshotItem(i).parentElement); }
  } catch(e){}
  [...new Set(nodes)].forEach(el => {
    if (el.dataset.leekProcessed) return;
    if (el.offsetWidth > 0 && el.offsetWidth < 15) return; 
    const text = el.innerText || '';
    if (text.includes('🧢') || text.includes('₿')) { el.dataset.leekProcessed = "true"; return; }
    const isTrusted = el.dataset.leekTrusted === "true";
    const price = parsePrice(text, isTrusted);
    if (!price) return;
    const currencyInfo = detectCurrency(text);
    const usdPrice = price * currencyInfo.rate;
    if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.dataset.leekProcessed = "true";
    el.appendChild(createBadge(usdPrice));
  });
}

// =====================================================
// 6. UI HELPERS (PET & CHAT)
// =====================================================
function getImgURL(filename) { return chrome.runtime.getURL(`images/${filename}`); }

function createPet() {
  if (document.getElementById('degen-pet')) return;
  const container = document.createElement('div');
  container.id = 'degen-pet';
  container.className = 'degen-pet';
  const avatar = document.createElement('div');
  avatar.className = 'degen-pet-avatar';
  avatar.style.backgroundImage = `url('${getImgURL('pet-idle.gif')}')`;
  container.appendChild(avatar);
  document.body.appendChild(container);
  PetState.container = container;
  PetState.avatar = avatar;
  setTimeout(() => container.classList.add('pet-transition'), 100);
  container.onclick = onPetClick;
}

// 🟢 宠物随机动画函数 (提取出来以便菜单调用)
function randomPetAnimation() {
  if (!PetState.container) return;

  leekAudio?.petRun();

  if (PetState.timers.revert) clearTimeout(PetState.timers.revert);
  if (PetState.timers.shrug) clearTimeout(PetState.timers.shrug);
  if (PetState.timers.run) clearTimeout(PetState.timers.run);
  const rect = PetState.container.getBoundingClientRect();
  PetState.container.classList.remove('pet-transition');
  PetState.container.style.top = rect.top + 'px';
  PetState.container.style.left = rect.left + 'px';
  PetState.container.style.bottom = 'auto';
  PetState.container.style.right = 'auto';
  void PetState.container.offsetWidth;
  PetState.container.classList.add('pet-transition');
  const maxX = window.innerWidth - 150;
  const maxY = window.innerHeight - 150;
  const newX = Math.random() * (maxX - 50) + 50;
  const newY = Math.random() * (maxY - 50) + 50;
  const currX = rect.left;
  PetState.avatar.style.transform = newX < currX ? 'scaleX(-1)' : 'scaleX(1)';
  PetState.avatar.style.backgroundImage = `url('${getImgURL('pet-run.gif')}')`;
  PetState.avatar.classList.add('is-running');
  PetState.container.style.left = newX + 'px';
  PetState.container.style.top = newY + 'px';
  PetState.timers.run = setTimeout(() => {
    PetState.avatar.style.backgroundImage = `url('${getImgURL('pet-shrug.gif')}')`;
    PetState.avatar.classList.remove('is-running');
    PetState.avatar.style.transform = 'scaleX(1)';
  }, 1500);
  PetState.timers.revert = setTimeout(() => {
    PetState.mode = 'IDLE';
    PetState.container.style.left = 'auto';
    PetState.container.style.top = 'auto';
    PetState.container.style.right = '20px';
    PetState.container.style.bottom = '20px';
    triggerPetTransform(currentCurrency, false);
  }, 3500);
}

// 🟢 宠物点击处理 (支持游戏菜单)
function onPetClick() {
  try { new Audio(chrome.runtime.getURL('audio/open.mp3')).play(); } catch(e){}

  // Pro Mode: 打开 AI 对话框
  if (operationMode === 'pro') {
    toggleAgentChat();
    return;
  }

  // Casual Mode: 显示游戏菜单
  showCasualGameMenu();
}

// 🟢 Casual Mode 游戏菜单
function showCasualGameMenu() {
  leekAudio?.petClick();

  // 直接触发随机动画（简单交互）
  randomPetAnimation();

  // 显示市场情绪信息
  showMoodIndicator();
}

// 显示市场情绪指示器
function showMoodIndicator() {
  const existing = document.querySelector('.mood-indicator');
  if (existing) existing.remove();

  const priceInfo = marketMood?.getPriceInfo();
  if (!priceInfo) return;

  const indicator = document.createElement('div');
  indicator.className = `mood-indicator mood-indicator-${priceInfo.mood}`;

  const btcChange = priceInfo.btc.change || 0;
  const solChange = priceInfo.sol.change || 0;

  indicator.innerHTML = `
    <div class="mood-price">
      <div class="mood-price-item">
        <span>₿ BTC</span>
        <span class="mood-price-change ${btcChange >= 0 ? 'positive' : 'negative'}">
          ${btcChange >= 0 ? '📈' : '📉'} ${btcChange.toFixed(2)}%
        </span>
      </div>
      <div class="mood-price-item">
        <span>◎ SOL</span>
        <span class="mood-price-change ${solChange >= 0 ? 'positive' : 'negative'}">
          ${solChange >= 0 ? '📈' : '📉'} ${solChange.toFixed(2)}%
        </span>
      </div>
    </div>
  `;

  document.body.appendChild(indicator);

  // 3秒后自动消失
  setTimeout(() => {
    if (indicator.parentElement) {
      indicator.style.animation = 'fadeOut 0.5s ease-out';
      setTimeout(() => indicator.remove(), 500);
    }
  }, 3000);
}

// 🟢 每日挑战辅助函数
function getTodayChallengeTarget() {
  const today = new Date().toDateString();
  let target = localStorage.getItem('leekJumpDailyTarget');

  if (!target || localStorage.getItem('leekJumpLastChallengeDate') !== today) {
    target = (500 + Math.floor(Math.random() * 1500)).toString();
    localStorage.setItem('leekJumpDailyTarget', target);
    localStorage.setItem('leekJumpLastChallengeDate', today);
    localStorage.setItem('leekJumpTodayEarnings', '0');
  }

  return parseInt(target).toLocaleString();
}

function getTodayProgress() {
  const today = new Date().toDateString();
  if (localStorage.getItem('leekJumpLastChallengeDate') !== today) {
    return '0';
  }

  const progress = parseInt(localStorage.getItem('leekJumpTodayEarnings')) || 0;
  return progress.toLocaleString();
}

// 🟢 启动游戏
function startLeekJumpGame() {
  console.log('🚀 Starting Leek Jump Game...');

  // 移除已存在的游戏
  const existingCanvas = document.querySelector('canvas[leek-jump-game]');
  if (existingCanvas) {
    existingCanvas.remove();
  }

  // 确保游戏引擎已加载
  if (typeof LeekJumpGame === 'undefined') {
    console.error('❌ Game engine not loaded!');
    alert('Game engine is loading... Please try again in a moment.');
    return;
  }

  // 创建游戏实例
  const container = document.body;
  window.leekJumpGameInstance = new LeekJumpGame(container);
  window.leekJumpGameInstance.init();

  console.log('✅ Leek Jump Game Started!');
}

function triggerPetTransform(currency, animate = true) {
  if (!PetState.avatar) return;
  let skin = 'pet-idle.gif';
  if (currency === 'SOL') skin = 'pet-solana.gif';
  if (currency === 'BTC') skin = 'pet-bitcoin.gif';
  if (currency === 'ETH') skin = 'pet-eth.gif';
  if (currency === 'BNB') skin = 'pet-bnb.gif';
  PetState.avatar.style.backgroundImage = `url('${getImgURL(skin)}')`;
  if (animate) {
    PetState.avatar.style.transform = 'scale(1.2)';
    setTimeout(() => PetState.avatar.style.transform = 'scale(1)', 200);
  }
}

function createDropdown(badge) {
  if (activeDropdown) activeDropdown.remove();
  const menu = document.createElement('div');
  menu.className = 'degen-dropdown visible';
  const header = document.createElement('div');
  header.className = 'degen-dropdown-header';
  header.textContent = 'SELECT COIN';
  menu.appendChild(header);
  ['SOL', 'BTC', 'ETH', 'BNB'].forEach(curr => {
    const item = document.createElement('div');
    item.className = 'degen-dropdown-item';
    if (curr === currentCurrency) item.classList.add('active');
    item.innerHTML = `<span>${CURRENCIES[curr].icon} ${CURRENCIES[curr].name}</span>`;
    item.onclick = (e) => { 
        e.stopPropagation(); 
        handleCurrencySwitch(curr);
        chrome.storage.sync.set({ selectedCoin: curr });
        menu.remove(); 
    };
    menu.appendChild(item);
  });
  const rect = badge.getBoundingClientRect();
  menu.style.top = (rect.bottom + 8) + 'px';
  menu.style.left = rect.left + 'px';
  document.body.appendChild(menu);
  activeDropdown = menu;
  activeBadge = badge;
}

function closeAllDropdowns() {
  if (activeDropdown) { activeDropdown.remove(); activeDropdown = null; activeBadge = null; }
}

function createAgentDialog() {
  if (document.getElementById('leek-agent-dialog')) return;
  const dialog = document.createElement('div');
  dialog.id = 'leek-agent-dialog';
  dialog.className = 'leek-agent-dialog';
  dialog.innerHTML = `
    <div class="agent-header">
      <span>🧠 Leek Brain</span>
      <div class="agent-controls">
        <span class="agent-btn agent-expand-btn" title="Expand">⤢</span>
        <span class="agent-btn agent-close-btn" title="Close">✖</span>
      </div>
    </div>
    <div class="agent-body" id="agent-msgs">
      <div class="chat-msg msg-ai">GM! Ask me anything.</div>
    </div>
    <div class="agent-input-area">
      <input type="text" class="agent-input" id="agent-input" placeholder="Project name or contract..." autocomplete="off">
      <button class="agent-send-btn">➤</button>
    </div>
  `;
  document.body.appendChild(dialog);
  const closeBtn = dialog.querySelector('.agent-close-btn');
  const expandBtn = dialog.querySelector('.agent-expand-btn'); 
  const sendBtn = dialog.querySelector('.agent-send-btn');
  const input = dialog.querySelector('#agent-input');
  closeBtn.onclick = () => {
    dialog.classList.remove('visible');
    dialog.classList.remove('expanded'); 
    expandBtn.textContent = '⤢'; 
    isChatOpen = false;
  };
  expandBtn.onclick = () => {
    dialog.classList.toggle('expanded');
    expandBtn.textContent = dialog.classList.contains('expanded') ? '⤡' : '⤢';
    input.focus();
  };
  const handleSend = async () => {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    const loadingId = addMessage('<span class="agent-loading"></span> Analyzing...', 'ai');
    chrome.runtime.sendMessage({ action: "askAgent", query: text }, (response) => {
      const loadingEl = document.getElementById(loadingId);
      if(loadingEl) loadingEl.remove();
      if (response && response.success) {
        const formattedHtml = parseAIResponse(response.data);
        addMessage(formattedHtml, 'ai');
      } else {
        const errorMsg = response ? response.error : "Unknown error";
        addMessage(`⚠️ Agent Offline: ${errorMsg}`, 'ai');
      }
    });
  };
  sendBtn.onclick = handleSend;
  input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
}

function addMessage(html, type) {
  const container = document.getElementById('agent-msgs');
  const div = document.createElement('div');
  div.className = `chat-msg msg-${type}`;
  div.id = 'msg-' + Date.now();
  div.innerHTML = html; 
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div.id;
}

function toggleAgentChat() {
  let dialog = document.getElementById('leek-agent-dialog');
  if (!dialog) {
    createAgentDialog();
    dialog = document.getElementById('leek-agent-dialog');
  }
  if (isChatOpen) {
    dialog.classList.remove('visible');
    isChatOpen = false;
  } else {
    dialog.classList.add('visible');
    isChatOpen = true;
    const inp = document.getElementById('agent-input');
    if(inp) inp.focus();
  }
}

function parseAIResponse(text) {
  if (!text) return "";
  let html = text.replace(/^###\s*(.*$)/gim, '<div class="report-header">$1</div>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<span class="report-highlight">$1</span>');
  html = html.replace(/^\s*[-•]\s*(.*$)/gim, '<div class="report-list-item"><span class="report-bullet">▶</span><span>$1</span></div>');
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/(<br>\s*){2,}/g, '<br>'); 
  return html;
}

// =====================================================
// 7. INIT
// =====================================================
function init() {
  try {
      APP_MODE = detectSiteMode();
      console.log(`🚀 Leek Vision Mode: ${APP_MODE}`);
      if (APP_MODE === 'SHOPPING') {
        applyLayoutMode();
      }
      chrome.storage.sync.get(['selectedCoin', 'opMode'], (res) => {
        if (res.selectedCoin) currentCurrency = res.selectedCoin;
        if (res.opMode) {
            operationMode = res.opMode;
            console.log(`🔧 Mode Loaded: ${operationMode.toUpperCase()}`);
        }
        createPet(); 
        fetchRealPrices(); 
        setInterval(fetchRealPrices, 10 * 60 * 1000);
        
        const runScanner = () => {
          if (APP_MODE === 'TRADING') {
            scanTradingPNL();
          } else {
            scanShoppingPrices(); 
          }
        };
        runScanner();
        new MutationObserver(() => {
          if (scanTimeout) clearTimeout(scanTimeout);
          scanTimeout = setTimeout(runScanner, 1000);
        }).observe(document.body, { childList: true, subtree: true });
      });
  } catch (err) {
      console.error("Leek Vision Init Error:", err);
  }
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.selectedCoin) {
      const newCoin = changes.selectedCoin.newValue;
      if (newCoin !== currentCurrency) {
          handleCurrencySwitch(newCoin);
      }
  }
  if (changes.opMode) {
      operationMode = changes.opMode.newValue;
      if (operationMode === 'casual' && isChatOpen) {
          document.getElementById('leek-agent-dialog')?.classList.remove('visible');
          isChatOpen = false;
      }
  }
});

function handleCurrencySwitch(newCurrency) {
    currentCurrency = newCurrency;
    triggerPetTransform(newCurrency);
    if(APP_MODE === 'SHOPPING') updateAllBadges();
}

document.addEventListener('click', (e) => {
  if (activeDropdown && !activeDropdown.contains(e.target)) closeAllDropdowns();
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();