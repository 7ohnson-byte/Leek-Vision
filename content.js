// ═══════════════════════════════════════════════════════════════════════════════
// LEEK VISION v2.6 - STABLE RELEASE
// Features: Dual Mode • Background API (Prices & AI) • Smooth Resize • Clean Reports
// ═══════════════════════════════════════════════════════════════════════════════

console.log('🚀 Leek Vision: Script Injecting...');

// =====================================================
// 1. GLOBAL CONSTANTS & STATE
// =====================================================

const DEMO_RATES = {
  SOL: 130,      
  BTC: 89000,    
  ETH: 3000,     
  BNB: 873       
};

let currentRates = { ...DEMO_RATES };

const CURRENCIES = {
  SOL: { icon: '🧢', name: 'SOL' },
  BTC: { icon: '₿', name: 'BTC' },
  ETH: { icon: 'Ξ', name: 'ETH' },
  BNB: { icon: '🔶', name: 'BNB' },
  CUSTOM: { icon: '🍌', name: 'CUSTOM' }
};

// CRITICAL: Initialize PetState FIRST
const PetState = { container: null, avatar: null, mode: 'IDLE', timers: {} };

let currentCurrency = 'SOL';
let operationMode = 'casual'; 
let activeDropdown = null;
let activeBadge = null;
let scanTimeout = null;
let isChatOpen = false;

// =====================================================
// 2. SAFETY & SHIELDING
// =====================================================

function isTradingInterface() {
  const host = window.location.hostname.toLowerCase();
  const title = document.title.toLowerCase();
  
  const blockedDomains = [
    'gmgn.ai', 'dexscreener.com', 'dextools.io', 'birdeye.so', 
    'geckoterminal.com', 'photon-sol', 'bullx.io', 'jup.ag', 
    'raydium.io', 'uniswap.org', 'pancakeswap.finance',
    'okx.com', 'binance.com', 'coinbase.com', 'bybit.com', 
    'kraken.com', 'kucoin.com', 'gate.io', 'bitget.com',
    'tradingview.com', 'finance.yahoo.com', 'bloomberg.com', 
    'marketwatch.com', 'investing.com', 'futunn.com', 'tigerbrokers'
  ];

  if (blockedDomains.some(domain => host.includes(domain))) {
    console.log(`🛡️ Leek Vision: Blocked Domain (${host})`);
    return true;
  }

  const tradingKeywords = [
    'dex screener', 'liquidity pool', 'order book', 'connect wallet', 
    'slippage', 'price chart', 'candlestick', 'market cap', 'fdv'
  ];

  if (tradingKeywords.some(kw => title.includes(kw))) {
    console.log(`🛡️ Leek Vision: Blocked Keyword in Title`);
    return true;
  }
  return false;
}

function applyLayoutMode() {
  const host = window.location.hostname;
  const body = document.body;
  if (!body) return;

  const ghostSites = ['taobao.com', 'tmall.com', 'jd.com', '1688.com'];
  
  if (ghostSites.some(site => host.includes(site))) {
    body.classList.add('leek-layout-ghost');
    body.classList.remove('leek-layout-flow');
  } else {
    body.classList.add('leek-layout-flow');
    body.classList.remove('leek-layout-ghost');
  }
}

// =====================================================
// 3. API & DATA FETCHING (Prices via Background)
// =====================================================

async function fetchRealPrices() {
  // 🟢 核心修改：不再直接 Fetch，而是发消息给 background.js
  chrome.runtime.sendMessage({ action: "getPrices" }, (response) => {
    
    // 检查是否有扩展上下文错误（防止插件更新后页面没刷新导致的断连）
    if (chrome.runtime.lastError) {
      // 这里的错误通常可以忽略，或者提示用户刷新
      return;
    }

    if (response && response.success && response.data) {
      const data = response.data;
      
      // 更新本地汇率
      if (data.solana) currentRates.SOL = data.solana.usd;
      if (data.bitcoin) currentRates.BTC = data.bitcoin.usd;
      if (data.ethereum) currentRates.ETH = data.ethereum.usd;
      if (data.binancecoin) currentRates.BNB = data.binancecoin.usd;
      
      console.log('✅ Real-time Prices Updated (via Background):', currentRates);
      
      // 立即刷新页面上的价格标签
      updateAllBadges();
    } else {
      console.warn('⚠️ Background price fetch failed, using cached/demo rates.');
    }
  });
}

// =====================================================
// 4. PARSING LOGIC (Trusted Mode)
// =====================================================

function parsePrice(rawString, isTrusted = false) {
  if (!rawString || typeof rawString !== 'string') return null;

  if (/\b(mo|mos|month|months|yr|years|day|days|stock|left|cm|mm|kg)\b/i.test(rawString)) return null;
  if (rawString.includes('%')) return null;

  if (!isTrusted) {
    const validCurrencyPattern = /[\$\¥\€\£\₹\₩\₽]|USD|CNY|EUR|GBP|JPY|INR|KRW|RMB|元|块|圆/;
    if (!validCurrencyPattern.test(rawString)) return null;
  }

  let clean = rawString
    .replace(/\u00A0/g, ' ') 
    .replace(/券后/g, '')     
    .replace(/折/g, '')       
    .trim();

  clean = clean.replace(/(\d)\s+(\d)/g, '$1$2'); 

  const match = clean.match(/([0-9.,]+)/);
  if (!match) return null;

  let numberStr = match[0];
  const isEuro = clean.includes('€') || clean.includes('EUR') || /[,]\d{2}$/.test(numberStr);

  if (isEuro) {
    numberStr = numberStr.replace(/\./g, '').replace(/,/g, '.');
  } else {
    numberStr = numberStr.replace(/,/g, '');
  }

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
  if (host.endsWith('.uk')) return { rate: 1.27 };
  if (host.endsWith('.de') || host.endsWith('.fr')) return { rate: 1.08 };

  return { rate: 1.0 };
}

// =====================================================
// 5. BADGE SYSTEM
// =====================================================

function calculateCryptoPrice(usdPrice) {
  const rate = currentRates[currentCurrency] || currentRates.SOL;
  return usdPrice / rate;
}

function formatBadgeText(cryptoPrice) {
  const icon = CURRENCIES[currentCurrency]?.icon || '🧢';
  let val;
  if (cryptoPrice >= 1000) val = (cryptoPrice/1000).toFixed(1) + 'k';
  else if (cryptoPrice >= 100) val = cryptoPrice.toFixed(1);
  else if (cryptoPrice >= 1) val = cryptoPrice.toFixed(2);
  else if (cryptoPrice >= 0.001) val = cryptoPrice.toFixed(4);
  else val = cryptoPrice.toFixed(6);
  return `${icon} ${val} ${currentCurrency}`;
}

function createBadge(usdPrice) {
  const badge = document.createElement('span');
  badge.className = 'degen-vision-badge';
  const cryptoAmount = calculateCryptoPrice(usdPrice);
  badge.textContent = formatBadgeText(cryptoAmount);
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
    if (!isNaN(usd)) {
      badge.textContent = formatBadgeText(calculateCryptoPrice(usd));
    }
  });
}

function closeAllDropdowns() {
  if (activeDropdown) { activeDropdown.remove(); activeDropdown = null; activeBadge = null; }
}

function handleCurrencySwitch(newCurrency) {
  currentCurrency = newCurrency;
  chrome.storage.sync.set({ selectedCoin: newCurrency });
  triggerPetTransform(newCurrency); 
  updateAllBadges(); 
  closeAllDropdowns();
}

function createDropdown(badge) {
  closeAllDropdowns();
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
    item.onclick = (e) => { e.stopPropagation(); handleCurrencySwitch(curr); };
    menu.appendChild(item);
  });
  
  const rect = badge.getBoundingClientRect();
  menu.style.top = (rect.bottom + 8) + 'px';
  menu.style.left = rect.left + 'px';
  document.body.appendChild(menu);
  activeDropdown = menu;
  activeBadge = badge;
}

// =====================================================
// 6. CHAT AGENT (With Smooth Resize & Report Renderer)
// =====================================================

function createAgentDialog() {
  if (document.getElementById('leek-agent-dialog')) return;

  const dialog = document.createElement('div');
  dialog.id = 'leek-agent-dialog';
  dialog.className = 'leek-agent-dialog';
  
  // HTML: 包含放大和关闭按钮
  dialog.innerHTML = `
    <div class="agent-header">
      <span>🧠 Leek Brain</span>
      <div class="agent-controls">
        <span class="agent-btn agent-expand-btn" title="Expand">⤢</span>
        <span class="agent-btn agent-close-btn" title="Close">✖</span>
      </div>
    </div>
    <div class="agent-body" id="agent-msgs">
      <div class="chat-msg msg-ai">GM! Ask me about any project! 🧢</div>
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

  // 关闭逻辑
  closeBtn.onclick = () => {
    dialog.classList.remove('visible');
    dialog.classList.remove('expanded'); 
    expandBtn.textContent = '⤢'; 
    isChatOpen = false;
  };

  // 放大/缩小逻辑
  expandBtn.onclick = () => {
    dialog.classList.toggle('expanded');
    if (dialog.classList.contains('expanded')) {
      expandBtn.textContent = '⤡'; 
    } else {
      expandBtn.textContent = '⤢'; 
    }
    input.focus();
  };

  const handleSend = async () => {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    const loadingId = addMessage('<span class="agent-loading"></span> Analyzing...', 'ai');

    // 发送给 Background -> Cloudflare
    chrome.runtime.sendMessage({ action: "askAgent", query: text }, (response) => {
      const loadingEl = document.getElementById(loadingId);
      if(loadingEl) loadingEl.remove();

      if (chrome.runtime.lastError) {
        addMessage("⚠️ Extension Error: Refresh the page.", 'ai');
        console.error(chrome.runtime.lastError);
        return;
      }

      if (response && response.success) {
        // 调用渲染器，把 Markdown 变成漂亮的 HTML
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
  div.innerHTML = html; // 直接插入 HTML
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

// 🟢 迷你渲染器：把 AI 的 Markdown 转换为漂亮的 HTML
function parseAIResponse(text) {
  if (!text) return "";

  // 1. 处理标题 (### Title)
  let html = text.replace(/^###\s*(.*$)/gim, '<div class="report-header">$1</div>');

  // 2. 处理加粗 (**Text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<span class="report-highlight">$1</span>');

  // 3. 处理列表项 (- Item)
  html = html.replace(/^\s*[-•]\s*(.*$)/gim, '<div class="report-list-item"><span class="report-bullet">▶</span><span>$1</span></div>');

  // 4. 处理换行 (\n)
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/(<br>\s*){2,}/g, '<br>'); 

  return html;
}

// =====================================================
// 7. PET LOGIC
// =====================================================

function getImgURL(filename) {
  return chrome.runtime.getURL(`images/${filename}`);
}

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

  requestAnimationFrame(() => {
      const rect = container.getBoundingClientRect();
      container.style.top = rect.top + 'px';
      container.style.left = rect.left + 'px';
      container.style.bottom = 'auto';
      container.style.right = 'auto';
      setTimeout(() => container.classList.add('pet-transition'), 50);
  });

  container.onclick = onPetClick;
}

function onPetClick() {
  if (operationMode === 'pro') {
    toggleAgentChat();
    return;
  }

  // Casual Mode
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

// =====================================================
// 8. SCANNER ENGINE
// =====================================================

function scanPage() {
  const trustedSelectors = ['.a-price', '.price', '.product-price', '.tb-rmb-num', '.rmb-num', '.price-value', '.ui-yen', '.rc-prices-fullprice', '.inline-price', '[class*="price"]', '[id*="price"]'];
  const xpath = `//text()[contains(., '¥') or contains(., '$') or contains(., '£') or contains(., '€') or contains(., '元')]`;
  let nodes = [];

  trustedSelectors.forEach(sel => {
    try { document.querySelectorAll(sel).forEach(el => { el.dataset.leekTrusted = "true"; nodes.push(el); }); } catch(e){}
  });

  try {
    const res = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0; i < res.snapshotLength; i++) { nodes.push(res.snapshotItem(i).parentElement); }
  } catch(e){}

  const unique = [...new Set(nodes)];

  unique.forEach(el => {
    if (el.dataset.leekProcessed) return;
    if (el.closest('[data-leek-processed]')) return;
    if (el.querySelector('.degen-vision-badge')) return;
    if (el.offsetWidth > 0 && el.offsetWidth < 15) return; 

    const text = el.innerText || '';
    if (text.includes(CURRENCIES[currentCurrency].icon)) { el.dataset.leekProcessed = "true"; return; }
    
    const isTrusted = el.dataset.leekTrusted === "true";
    const price = parsePrice(text, isTrusted);
    if (!price) return;
    
    const currencyInfo = detectCurrency(text);
    const usdPrice = price * currencyInfo.rate;
    
    const computedStyle = window.getComputedStyle(el);
    if (computedStyle.position === 'static') el.style.position = 'relative';
    
    el.dataset.leekProcessed = "true";
    el.appendChild(createBadge(usdPrice));
  });
}

// =====================================================
// 9. INIT
// =====================================================

function init() {
  if (isTradingInterface()) return; 

  applyLayoutMode(); 

  chrome.storage.sync.get(['selectedCoin', 'opMode'], (res) => {
    if (res.selectedCoin) currentCurrency = res.selectedCoin;
    if (res.opMode) {
        operationMode = res.opMode;
        console.log(`🔧 Mode Loaded: ${operationMode.toUpperCase()}`);
    }
    
    createPet();
    scanPage();
    fetchRealPrices(); 

    setInterval(fetchRealPrices, 10 * 60 * 1000);

    new MutationObserver(() => {
      if (scanTimeout) clearTimeout(scanTimeout);
      scanTimeout = setTimeout(scanPage, 500);
    }).observe(document.body, { childList: true, subtree: true });
  });
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.selectedCoin) handleCurrencySwitch(changes.selectedCoin.newValue);
  if (changes.opMode) {
      operationMode = changes.opMode.newValue;
      console.log(`🔧 Mode Switched to: ${operationMode.toUpperCase()}`);
      if (operationMode === 'casual' && isChatOpen) {
          document.getElementById('leek-agent-dialog')?.classList.remove('visible');
          isChatOpen = false;
      }
  }
});

document.addEventListener('click', (e) => {
  if (activeDropdown && !activeDropdown.contains(e.target)) closeAllDropdowns();
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();