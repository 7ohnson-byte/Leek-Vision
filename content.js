// ═══════════════════════════════════════════════════════════════════════════════
// LEEK VISION - Universal Price Detection with Real-Time Crypto Prices
// ═══════════════════════════════════════════════════════════════════════════════

// =====================================================
// CONFIGURATION & STATE
// =====================================================

// Dynamic crypto prices (USD) - fallback values if API fails
let cryptoPrices = {
  SOL: 150,
  BTC: 96000,
  ETH: 3300,
  BNB: 600
};

// Global tracking to prevent duplicates (WeakSet doesn't prevent garbage collection)
const processedElements = new WeakSet();

// Currency definitions
const CURRENCIES = {
  SOL: { icon: '🧢', name: 'Solana' },
  BTC: { icon: '₿', name: 'Bitcoin' },
  ETH: { icon: 'Ξ', name: 'Ethereum' },
  BNB: { icon: '🔶', name: 'BNB' },
  CUSTOM: { icon: '🍌', name: 'Custom CA' }
};

// Global state
let currentCurrency = 'SOL';
let customTokenData = null;
let activeDropdown = null;
let activeBadge = null;
let scanTimeout = null;

// Storage key
const STORAGE_KEY = 'degen_vision_currency';

// =====================================================
// NUCLEAR SITE SETTINGS (Forced Currency Overrides)
// =====================================================

/**
 * Get forced currency settings based on hostname
 * This OVERRIDES all symbol detection for known sites
 * @returns {object|null} { currency: string, rate: number, mode: 'strict'|'loose' } or null
 */
function getSiteSettings() {
  const hostname = window.location.hostname.toLowerCase();

  console.log(`🌍 LeekVision: Checking domain: ${hostname}`);

  // Chinese e-commerce sites - LOOSE MODE (accept pure numbers)
  if (hostname.includes('taobao.com') ||
      hostname.includes('tmall.com') ||
      hostname.includes('jd.com') ||
      hostname.includes('1688.com') ||
      hostname.includes('pinduoduo') ||
      hostname.includes('yangkeduo')) {
    console.log('✅ LeekVision: LOOSE MODE - CNY (Chinese site, ¥ often separate)');
    return { currency: 'CNY', rate: 0.138, mode: 'loose' };
  }

  // Japanese sites - LOOSE MODE
  if (hostname.includes('amazon.co.jp') ||
      hostname.includes('rakuten') ||
      hostname.includes('yahoo.co.jp')) {
    console.log('✅ LeekVision: LOOSE MODE - JPY (Japanese site)');
    return { currency: 'JPY', rate: 0.0065, mode: 'loose' };
  }

  // Western sites - STRICT MODE (require currency symbol)
  if (hostname.includes('amazon.') ||
      hostname.includes('apple.com') ||
      hostname.includes('ebay.') ||
      hostname.includes('.amazon')) {
    console.log('✅ LeekVision: STRICT MODE - USD/EUR/GBP (Western sites, must have symbol)');
    // Determine currency by domain
    if (hostname.includes('amazon.co.uk') || hostname.includes('ebay.co.uk') || hostname.includes('.co.uk')) {
      return { currency: 'GBP', rate: 1.20, mode: 'strict' };
    }
    if (hostname.includes('amazon.de') || hostname.includes('amazon.fr') ||
        hostname.includes('amazon.it') || hostname.includes('amazon.es')) {
      return { currency: 'EUR', rate: 1.05, mode: 'strict' };
    }
    return { currency: 'USD', rate: 1.0, mode: 'strict' };
  }

  console.log('⏭️  LeekVision: No forced currency, using symbol detection');
  return null; // No override, use symbol detection
}

// =====================================================
// REAL-TIME PRICE FETCHING
// =====================================================

/**
 * Fetch real-time crypto prices from CoinGecko API
 * Falls back to hardcoded values if API fails
 */
async function fetchCryptoPrices() {
  console.log('📡 LeekVision: Fetching real-time crypto prices from CoinGecko...');

  const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum,binancecoin&vs_currencies=usd';

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate response data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response format');
    }

    // Update prices from API
    if (data.solana?.usd) {
      cryptoPrices.SOL = data.solana.usd;
    }
    if (data.bitcoin?.usd) {
      cryptoPrices.BTC = data.bitcoin.usd;
    }
    if (data.ethereum?.usd) {
      cryptoPrices.ETH = data.ethereum.usd;
    }
    if (data.binancecoin?.usd) {
      cryptoPrices.BNB = data.binancecoin.usd;
    }

    console.log('✅ LeekVision: Real-time prices fetched successfully:', cryptoPrices);
    return true;

  } catch (error) {
    console.warn('❌ LeekVision: Failed to fetch crypto prices from CoinGecko:', error.message);
    console.log('🔄 LeekVision: Using fallback prices:', cryptoPrices);
    return false;
  }
}

// =====================================================
// AGGRESSIVE NUMBER PARSING (Fixes Apple Bug)
// =====================================================

/**
 * AGGRESSIVE PARSER - Extract number from text with robust cleaning
 * Handles: "¥69.9", "$1099", "1,299.00", "69", "69.9"
 */
function extractNumber(text) {
  if (!text || typeof text !== 'string') {
    console.warn('❌ LeekVision: Invalid text for number extraction:', text);
    return null;
  }

  const original = text;

  // Step 1: Remove all invisible Unicode characters
  let cleaned = text.replace(/[\u200B-\u200D\uFEFF\u00A0\u2060\u180E\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000]/g, '');

  // Step 2: Remove ALL commas (thousand separators)
  cleaned = cleaned.replace(/,/g, '');

  // Step 3: Trim whitespace
  cleaned = cleaned.trim();

  // Step 4: Extract the first valid number (integer or decimal)
  // Pattern: captures digits with optional decimal part
  const numberMatch = cleaned.match(/(\d+(?:\.\d+)?)/);

  if (!numberMatch) {
    console.warn('❌ LeekVision: No number found in:', original);
    return null;
  }

  const numberStr = numberMatch[1];
  const parsedNumber = parseFloat(numberStr);

  if (isNaN(parsedNumber)) {
    console.warn('❌ LeekVision: Failed to parse number:', numberStr, 'from:', original);
    return null;
  }

  // Sanity checks
  if (parsedNumber <= 0) {
    console.warn('❌ LeekVision: Number must be positive:', parsedNumber);
    return null;
  }

  if (parsedNumber > 1000000000) {
    console.warn('⚠️  LeekVision: Number seems unreasonably large:', parsedNumber);
    // Still return it, but log warning
  }

  console.log(`✅ LeekVision: Extracted number: "${original}" → cleaned: "${cleaned}" → ${parsedNumber}`);
  return parsedNumber;
}

// =====================================================
// CURRENCY DETECTION
// =====================================================

/**
 * Detect currency from symbol in text
 * @returns {object|null} { currency: string, rate: number } or null
 */
function detectCurrencyFromSymbol(text) {
  const symbolMap = {
    '$': 'USD',
    '¥': 'CNY',
    '€': 'EUR',
    '£': 'GBP',
    '₹': 'INR',
    '₩': 'KRW',
    '₽': 'RUB'
  };

  const rates = {
    USD: 1.0,
    CNY: 0.138,
    EUR: 1.05,
    GBP: 1.20,
    JPY: 0.0065,
    KRW: 0.0007,
    HKD: 0.128,
    INR: 0.012,
    RUB: 0.011
  };

  // Check for currency codes (e.g., "USD", "CNY", "EUR")
  const codeMatch = text.match(/\b(USD|CNY|EUR|GBP|JPY|KRW|HKD|INR|RUB)\b/i);
  if (codeMatch) {
    const currency = codeMatch[1].toUpperCase();
    const rate = rates[currency];
    if (rate) {
      console.log(`✅ LeekVision: Detected currency code: ${currency}`);
      return { currency, rate };
    }
  }

  // Check for Chinese postfix (元, 块, 圆)
  if (/(?:元|块|圆)/.test(text)) {
    console.log('✅ LeekVision: Detected Chinese currency postfix (元/块/圆)');
    return { currency: 'CNY', rate: 0.138 };
  }

  // Check for symbols
  for (const [symbol, currency] of Object.entries(symbolMap)) {
    if (text.includes(symbol)) {
      const rate = rates[currency];
      if (rate) {
        console.log(`✅ LeekVision: Detected currency symbol: ${symbol} → ${currency}`);
        return { currency, rate };
      }
    }
  }

  console.log('⏭️  LeekVision: No currency symbol detected');
  return null;
}

// =====================================================
// PRICE PARSING (The Core Logic)
// =====================================================

/**
 * Parse price from text with nuclear site overrides
 * @param {string} text - Text to parse
 * @returns {object|null} { usdValue: number, originalCurrency: string } or null
 */
function parsePrice(text) {
  if (!text || typeof text !== 'string') {
    console.warn('❌ LeekVision: Invalid text for price parsing:', text);
    return null;
  }

  console.log(`\n🔍 LeekVision: Parsing price from: "${text}"`);

  // Step 1: Get nuclear site settings (FORCED override)
  const siteSettings = getSiteSettings();

  // Step 2: Extract number (aggressive cleaning)
  const number = extractNumber(text);
  if (!number) {
    console.log('❌ LeekVision: Could not extract number from text');
    return null;
  }

  // Step 3: Determine currency rate
  let currency, rate;

  if (siteSettings) {
    // NUCLEAR OVERRIDE: Use forced site settings
    currency = siteSettings.currency;
    rate = siteSettings.rate;
    console.log(`🔥 LeekVision: Using NUCLEAR OVERRIDE → ${currency} (rate: ${rate})`);
  } else {
    // Fallback: Detect from symbol
    const detected = detectCurrencyFromSymbol(text);
    if (detected) {
      currency = detected.currency;
      rate = detected.rate;
    } else {
      // Last resort: Assume USD
      currency = 'USD';
      rate = 1.0;
      console.log('⚠️  LeekVision: No currency detected, defaulting to USD');
    }
  }

  // Step 4: Calculate USD value
  const usdValue = number * rate;

  console.log(`💰 LeekVision: ${number} ${currency} × ${rate} = $${usdValue.toFixed(2)} USD\n`);

  // Validation
  if (!isFinite(usdValue) || usdValue <= 0) {
    console.warn('❌ LeekVision: Invalid USD value:', usdValue);
    return null;
  }

  return {
    usdValue: usdValue,
    originalCurrency: currency,
    originalAmount: number
  };
}

/**
 * Check if text looks like it might contain a price
 * @param {string} text - Text to check
 * @returns {boolean} True if text looks like a price
 */
function isLikelyPrice(text) {
  if (!text || typeof text !== 'string') return false;

  const trimmed = text.trim();

  // Too long to be just a price
  if (trimmed.length > 100) return false;

  // Must contain at least one digit
  if (!/\d/.test(trimmed)) return false;

  // Check for currency symbol (used in both modes)
  const hasSymbol = /[\$\¥\€\£\₹\₩\₽]|USD|CNY|EUR|GBP|JPY|元|块|圆/i.test(trimmed);

  const siteSettings = getSiteSettings();

  // STRICT MODE: Must have currency symbol (Amazon, eBay, Apple)
  if (siteSettings && siteSettings.mode === 'strict') {
    if (!hasSymbol) {
      console.log(`⏭️  LeekVision: STRICT MODE - No symbol in: "${trimmed}"`);
      return false;
    }
    console.log(`✅ LeekVision: STRICT MODE - Has symbol: "${trimmed}"`);
    return true;
  }

  // LOOSE MODE: Accept numbers (Taobao, Tmall, JD)
  if (siteSettings && siteSettings.mode === 'loose') {
    // Try to extract number for validation
    const numberMatch = trimmed.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      const num = parseFloat(numberMatch[1]);

      // Filter: Ignore small numbers < 5 (likely ratings) - UNLESS they have a symbol
      if (num < 5 && !hasSymbol) {
        console.log(`⏭️  LeekVision: LOOSE MODE - Number too small (<5): ${num}`);
        return false;
      }

      // Filter: Ignore years (1900-2100)
      if (num >= 1900 && num <= 2100) {
        console.log(`⏭️  LeekVision: LOOSE MODE - Looks like a year: ${num}`);
        return false;
      }

      // Filter: Ignore large round numbers > 10000 without decimals (likely counts)
      if (num > 10000 && !numberMatch[1].includes('.')) {
        console.log(`⏭️  LeekVision: LOOSE MODE - Looks like a count: ${num}`);
        return false;
      }

      console.log(`✅ LeekVision: LOOSE MODE - Accept number: ${num}`);
      return true;
    }
  }

  // Default: Must have currency indicator
  return hasSymbol;
}

// =====================================================
// LOCAL STORAGE
// =====================================================

function loadSavedCurrency() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.currency) currentCurrency = data.currency;
      if (data.customTokenData) customTokenData = data.customTokenData;
      console.log('🎮 LeekVision: Loaded saved currency:', currentCurrency);
    }
  } catch (error) {
    console.error('LeekVision: Failed to load currency:', error);
  }
}

function saveCurrency() {
  try {
    const data = {
      currency: currentCurrency,
      customTokenData: customTokenData
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('LeekVision: Failed to save currency:', error);
  }
}

// =====================================================
// SMART CHAIN DETECTION
// =====================================================

function detectChain(address) {
  const trimmed = address.trim();

  if (trimmed.startsWith('0x') && trimmed.length === 42) {
    return ['eth', 'bsc'];
  }

  if (trimmed.length >= 32 && trimmed.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) {
    return ['solana'];
  }

  return null;
}

async function fetchTokenPrice(chain, address) {
  const url = `https://api.geckoterminal.com/api/v2/networks/${chain}/tokens/${address}`;

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data?.data?.attributes) {
      throw new Error('Invalid API response');
    }

    const priceUsd = parseFloat(data.data.attributes.price_usd);
    const symbol = data.data.attributes.symbol || 'TOKEN';

    if (isNaN(priceUsd)) {
      throw new Error('Invalid price');
    }

    return { price: priceUsd, symbol: symbol, chain: chain };

  } catch (error) {
    console.log(`❌ LeekVision: ${chain.toUpperCase()} failed:`, error.message);
    throw error;
  }
}

async function handleCustomToken(address) {
  const chains = detectChain(address);

  if (!chains) {
    alert('❌ Invalid address format!\n\nSupported formats:\n• SOL: Base58 (32-44 chars)\n• ETH/BSC: 0x... (42 chars)');
    return null;
  }

  updateAllBadgesSearching();

  for (const chain of chains) {
    try {
      const tokenData = await fetchTokenPrice(chain, address);

      customTokenData = {
        address: address,
        price: tokenData.price,
        symbol: tokenData.symbol,
        chain: chain
      };

      return customTokenData;

    } catch (error) {
      console.log(`LeekVision: Trying next chain...`);
      continue;
    }
  }

  alert(`❌ Token not found on any supported chain!\n\nTried: ${chains.map(c => c.toUpperCase()).join(', ')}`);
  return null;
}

// =====================================================
// CRYPTO CONVERSION
// =====================================================

function calculateCryptoPrice(usdPrice) {
  if (currentCurrency === 'CUSTOM') {
    if (!customTokenData?.price) return null;
    return usdPrice / customTokenData.price;
  }

  const price = cryptoPrices[currentCurrency];
  if (!price) {
    console.warn(`⚠️  LeekVision: No price available for ${currentCurrency}`);
    return null;
  }

  return usdPrice / price;
}

function formatBadgeText(cryptoPrice, fiatCurrency) {
  const icon = CURRENCIES[currentCurrency]?.icon || '🧢';

  if (currentCurrency === 'CUSTOM') {
    const symbol = customTokenData?.symbol || 'TOKEN';
    const formattedPrice = formatLargeNumber(cryptoPrice);
    return `${icon} ${formattedPrice} $${symbol}`;
  }

  const formattedPrice = formatCompactPrice(cryptoPrice);
  return `${icon} ${formattedPrice} ${currentCurrency}`;
}

function formatCompactPrice(price) {
  if (currentCurrency === 'BTC') {
    return price < 0.01 ? price.toFixed(6) : price.toFixed(4);
  } else if (currentCurrency === 'ETH' || currentCurrency === 'BNB') {
    return price < 0.1 ? price.toFixed(4) : price.toFixed(2);
  } else {
    return price.toFixed(2);
  }
}

function formatLargeNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toFixed(2);
  }
}

function updateBadge(badgeElement, usdPrice) {
  try {
    const cryptoPrice = calculateCryptoPrice(usdPrice);

    if (cryptoPrice === null) {
      badgeElement.textContent = '❌';
      return;
    }

    badgeElement.textContent = formatBadgeText(cryptoPrice);
    badgeElement.setAttribute('data-usd-price', usdPrice);

  } catch (error) {
    console.error('LeekVision: Failed to update badge:', error);
    badgeElement.textContent = '❌';
  }
}

function updateAllBadges() {
  const badges = document.querySelectorAll('.degen-vision-badge');

  badges.forEach(badge => {
    const usdPrice = parseFloat(badge.getAttribute('data-usd-price'));
    if (!isNaN(usdPrice)) {
      updateBadge(badge, usdPrice);
    }
  });
}

function updateAllBadgesSearching() {
  const badges = document.querySelectorAll('.degen-vision-badge');
  badges.forEach(badge => {
    badge.textContent = '🔍';
    badge.classList.add('degen-searching');
  });

  setTimeout(() => {
    badges.forEach(badge => {
      badge.classList.remove('degen-searching');
    });
  }, 3000);
}

// =====================================================
// DROPDOWN MENU
// =====================================================

function closeAllDropdowns() {
  if (activeDropdown) {
    activeDropdown.remove();
    activeDropdown = null;
    activeBadge = null;
  }
}

function createDropdown(badge) {
  closeAllDropdowns();

  const dropdown = document.createElement('div');
  dropdown.className = 'degen-dropdown';

  const header = document.createElement('div');
  header.className = 'degen-dropdown-header';
  header.textContent = 'SELECT COIN';
  dropdown.appendChild(header);

  const menuItems = ['SOL', 'BTC', 'ETH', 'BNB', 'CUSTOM'];

  menuItems.forEach(currency => {
    const item = document.createElement('button');
    item.className = 'degen-dropdown-item';
    item.setAttribute('data-value', currency);

    if (currency === currentCurrency) {
      item.classList.add('active');
    }

    const icon = CURRENCIES[currency]?.icon || '🧢';
    const name = CURRENCIES[currency]?.name || currency;

    item.innerHTML = `
      <span class="currency-icon">${icon}</span>
      <span>${name}</span>
    `;

    item.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await handleCurrencySelection(currency);
      closeAllDropdowns();
    });

    dropdown.appendChild(item);
  });

  const badgeRect = badge.getBoundingClientRect();
  dropdown.style.position = 'fixed';
  dropdown.style.top = (badgeRect.bottom + 6) + 'px';
  dropdown.style.left = badgeRect.left + 'px';

  document.body.appendChild(dropdown);

  activeDropdown = dropdown;
  activeBadge = badge;

  setTimeout(() => {
    dropdown.classList.add('visible');
  }, 10);

  return dropdown;
}

async function handleCurrencySelection(currency) {
  console.log('🎮 LeekVision: Selected:', currency);

  if (currency === 'CUSTOM') {
    const address = window.prompt(
      '🍌 PASTE CONTRACT ADDRESS:\n\nSupports:\n• Solana (Base58)\n• Ethereum (0x...)\n• BSC (0x...)\n\nAuto-detects chain!'
    );

    if (!address || !address.trim()) {
      return;
    }

    const tokenData = await handleCustomToken(address.trim());

    if (tokenData) {
      currentCurrency = 'CUSTOM';
      saveCurrency();
      updateAllBadges();
    }

  } else {
    currentCurrency = currency;
    customTokenData = null;
    saveCurrency();
    updateAllBadges();
  }
}

// =====================================================
// BADGE CREATION
// =====================================================

function createBadge(usdPrice, parentElement) {
  const badge = document.createElement('span');
  badge.className = 'degen-vision-badge';

  const cryptoPrice = calculateCryptoPrice(usdPrice);

  if (cryptoPrice !== null) {
    badge.textContent = formatBadgeText(cryptoPrice);
  } else {
    badge.textContent = '❌';
  }

  badge.setAttribute('data-usd-price', usdPrice);

  // Click handler
  badge.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (activeDropdown && activeBadge === badge) {
      closeAllDropdowns();
    } else {
      createDropdown(badge);
    }
  });

  return badge;
}

// =====================================================
// UNIVERSAL PRICE SCANNING
// =====================================================

function scanPageForPrices() {
  console.log('\n🔍 LeekVision: SCANNING PAGE FOR PRICES...');

  // Likely price container tags
  const priceSelectors = [
    '.a-price',
    '.price',
    '.product-price',
    '[class*="price"]',
    '[class*="Price"]',
    '[id*="price"]',
    '[id*="Price"]',
    'span',
    'div',
    'p',
    'strong',
    'b'
  ];

  // Query all potential price elements
  const elements = [];
  priceSelectors.forEach(selector => {
    try {
      const found = document.querySelectorAll(selector);
      elements.push(...Array.from(found));
    } catch (e) {
      // Ignore invalid selectors
    }
  });

  // Remove duplicates
  const uniqueElements = [...new Set(elements)];

  // Sort by depth (deepest first) - prevents parent/child duplicates
  uniqueElements.sort((a, b) => {
    const getDepth = (el) => {
      let depth = 0;
      while (el.parentNode) {
        depth++;
        el = el.parentNode;
      }
      return depth;
    };
    return getDepth(b) - getDepth(a);
  });

  console.log(`📊 LeekVision: Found ${uniqueElements.length} candidate elements`);

  let matchedCount = 0;
  let injectedCount = 0;
  let skippedDuplicate = 0;
  let skippedInvisible = 0;

  uniqueElements.forEach(element => {
    // ============================================================
    // RECURSION SHIELD (Never scan our own badges!)
    // ============================================================

    // Check if this element IS a badge we injected
    if (element.classList && element.classList.contains('degen-vision-badge')) {
      return; // Never scan inside our own badges!
    }

    // Check if parent is a badge we injected
    if (element.parentElement && element.parentElement.classList && element.parentElement.classList.contains('degen-vision-badge')) {
      return; // Never scan children of our badges!
    }

    // ============================================================
    // CRITICAL: IDEMPOTENCY LOCK (Set IMMEDIATELY - First Thing!)
    // ============================================================

    // FASTEST CHECK: WeakSet lookup (O(1))
    if (processedElements.has(element)) {
      return; // Already processed, skip immediately
    }

    // MARK AS PROCESSED RIGHT NOW - Before ANY other checks
    // This prevents race conditions with concurrent scans
    processedElements.add(element);
    element.setAttribute('data-degen-processed', 'true');

    // ============================================================
    // DUPLICATE PREVENTION (Extra Safety Checks)
    // ============================================================

    // Check if already has a badge (defensive)
    if (element.querySelector('.degen-vision-badge')) {
      skippedDuplicate++;
      return;
    }

    // ============================================================
    // ELEMENT VALIDATION
    // ============================================================

    // VISIBILITY CHECK: Skip hidden elements
    if (element.offsetParent === null) {
      skippedInvisible++;
      return;
    }

    // Skip certain tags
    const tagName = element.tagName;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'OPTION', 'TEXTAREA', 'IFRAME', 'HTML', 'HEAD', 'BODY'].includes(tagName)) {
      return;
    }

    // Get text content
    const text = element.innerText || element.textContent || '';

    if (!text || text.trim().length === 0) {
      return;
    }

    const trimmed = text.trim();

    // Filter: Must be short
    if (trimmed.length > 50) {
      return;
    }

    // Filter: Must look like a price (strict/loose mode applies here)
    if (!isLikelyPrice(trimmed)) {
      return;
    }

    // Parse the price
    const priceData = parsePrice(trimmed);

    if (!priceData || !priceData.usdValue || priceData.usdValue <= 0) {
      return;
    }

    // ============================================================
    // VALID PRICE FOUND - INJECT SINGLE BADGE
    // ============================================================

    matchedCount++;
    console.log(`✅ LeekVision: Matched "${trimmed.substring(0, 30)}..." → $${priceData.usdValue.toFixed(2)} USD`);

    // Create badge (only ONE coin - currentCurrency)
    const badge = createBadge(priceData.usdValue, element);

    // Inject badge
    element.appendChild(badge);

    injectedCount++;
    console.log(`💉 LeekVision: Injected badge → ${badge.textContent}`);
  });

  // CLEANUP: Remove duplicate badges
  const allBadges = document.querySelectorAll('.degen-vision-badge');
  let cleanedUp = 0;

  allBadges.forEach(badge => {
    const processedParent = badge.closest('[data-degen-processed]');

    if (processedParent) {
      const siblingBadges = processedParent.querySelectorAll('.degen-vision-badge');

      if (siblingBadges.length > 1) {
        for (let i = 1; i < siblingBadges.length; i++) {
          siblingBadges[i].remove();
          cleanedUp++;
        }
      }
    }
  });

  console.log(`\n🎯 LeekVision: Scan complete`);
  console.log(`   ✅ Matched: ${matchedCount} prices`);
  console.log(`   💉 Injected: ${injectedCount} badges`);
  console.log(`   ⏭️  Skipped: ${skippedDuplicate} duplicates, ${skippedInvisible} hidden`);
  if (cleanedUp > 0) {
    console.log(`   🧹 Cleaned: ${cleanedUp} duplicate badges`);
  }
}

/**
 * Debounced scan with faster response and rate limiting
 */
let isScanning = false;

function debouncedScan() {
  // Rate limiter: Don't start a new scan if one is already running
  if (isScanning) {
    console.log('⏸️  LeekVision: Scan already in progress, skipping');
    return;
  }

  if (scanTimeout) {
    clearTimeout(scanTimeout);
  }

  scanTimeout = setTimeout(() => {
    isScanning = true;
    scanPageForPrices();
    // Allow scanning again after completion
    setTimeout(() => {
      isScanning = false;
    }, 500);
  }, 800);
}

// =====================================================
// GLOBAL EVENT HANDLERS
// =====================================================

document.addEventListener('click', (event) => {
  if (activeDropdown &&
      !activeDropdown.contains(event.target) &&
      !event.target.classList.contains('degen-vision-badge')) {
    closeAllDropdowns();
  }
});

// =====================================================
// INITIALIZATION
// =====================================================

/**
 * Start the scanner and all observers
 */
function startScanner() {
  console.log('\n');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🧢 LEEK VISION - REAL-TIME PRICE SCANNER');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('💰 Current crypto prices:', cryptoPrices);
  console.log('🌍 Site detection: ENABLED (Nuclear overrides active)');
  console.log('🔧 Aggressive parsing: ENABLED (Fixes Apple integers)');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('');

  // Log current site settings
  const siteSettings = getSiteSettings();
  if (siteSettings) {
    console.log(`🔥 NUCLEAR OVERRIDE ACTIVE: ${siteSettings.currency} (rate: ${siteSettings.rate})`);
  } else {
    console.log('⏭️  No nuclear override - using symbol detection');
  }
  console.log('');

  // Initial scan
  setTimeout(() => {
    scanPageForPrices();
  }, 300);

  // Watch for DOM changes
  const observer = new MutationObserver(() => {
    debouncedScan();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });

  console.log('👀 LeekVision: MutationObserver watching for DOM changes...');

  // Close dropdowns on scroll/resize
  window.addEventListener('scroll', closeAllDropdowns, true);
  window.addEventListener('resize', closeAllDropdowns);

  // Polling for dynamic content (use debounced scan to prevent race conditions)
  setInterval(() => {
    debouncedScan();
  }, 5000); // Increased from 2000ms to 5000ms for stability

  console.log('⏰ LeekVision: Polling every 5 seconds for dynamic content');

  // Auto-refresh crypto prices every 5 minutes
  setInterval(async () => {
    console.log('\n🔄 LeekVision: Refreshing crypto prices...');
    const success = await fetchCryptoPrices();
    if (success) {
      updateAllBadges();
      console.log('✅ LeekVision: Badges updated with new prices');
    }
  }, 5 * 60 * 1000); // 5 minutes

  console.log('🔄 LeekVision: Auto-refresh enabled (every 5 minutes)');
  console.log('');
}

/**
 * Initialize the extension - fetch prices first, then start scanner
 */
async function init() {
  loadSavedCurrency();

  console.log('\n');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🚀 LEEK VISION - INITIALIZING');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('');

  // Fetch real-time prices before starting scanner
  await fetchCryptoPrices();

  // Start the scanner after prices are loaded
  startScanner();
}

// Start the extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
