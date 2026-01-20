// Degen Vision - Universal Price Detection 🎮🌍

// =====================================================
// CONFIGURATION & STATE
// =====================================================

// Crypto prices (mock USD rates)
const CRYPTO_RATES = {
  SOL: 150,
  BTC: 96000,
  ETH: 3300,
  BNB: 600
};

// Fiat to USD conversion rates
const FIAT_RATES = {
  USD: 1.0,
  CNY: 0.14,      // 1 CNY ≈ 0.14 USD
  EUR: 1.08,      // 1 EUR ≈ 1.08 USD
  GBP: 1.27,      // 1 GBP ≈ 1.27 USD
  JPY: 0.0065,    // 1 JPY ≈ 0.0065 USD
  KRW: 0.00075,   // 1 KRW ≈ 0.00075 USD
  HKD: 0.13,      // 1 HKD ≈ 0.13 USD
  SGD: 0.74,      // 1 SGD ≈ 0.74 USD
  AUD: 0.65,      // 1 AUD ≈ 0.65 USD
  CAD: 0.74,      // 1 CAD ≈ 0.74 USD
  CHF: 1.11,      // 1 CHF ≈ 1.11 USD
  INR: 0.012,     // 1 INR ≈ 0.012 USD
  RUB: 0.011,     // 1 RUB ≈ 0.011 USD
  BRL: 0.20       // 1 BRL ≈ 0.20 USD
};

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
// PRICE DETECTION PATTERNS
// =====================================================

/**
 * HUNTER MODE - Comprehensive price detection patterns
 * Aggressive regex to catch prices in any format
 */
const PRICE_PATTERNS = [
  // Symbol prefixes: $99.99, $5,228.00, ¥199, €50, £20
  // Handles whitespace, newlines, and mixed content
  {
    regex: /[\$\¥\€\£\₹\₩\₽]\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/gi,
    extractor: (match) => {
      const symbol = match[0];
      const amount = match[1];

      const symbolMap = {
        '$': 'USD',
        '¥': 'CNY',
        '€': 'EUR',
        '£': 'GBP',
        '₹': 'INR',
        '₩': 'KRW',
        '₽': 'RUB'
      };

      return {
        amount: amount,
        currency: symbolMap[symbol] || 'USD'
      };
    }
  },

  // Currency codes: 99 USD, 199 CNY, 5,228.00 EUR
  // More permissive whitespace handling
  {
    regex: /\b(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(USD|CNY|EUR|GBP|JPY|KRW|HKD|SGD|AUD|CAD|CHF|INR|RUB|BRL)\b/gi,
    extractor: (match) => ({
      amount: match[1],
      currency: match[2].toUpperCase()
    })
  },

  // Chinese post-fix: 99元, 199块, 50圆, 1,299元
  // Aggressive matching with relaxed boundaries
  {
    regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(元|块|圆)/gi,
    extractor: (match) => ({
      amount: match[1],
      currency: 'CNY'
    })
  },

  // Japanese: ¥1,000 (with comma), ¥1000
  {
    regex: /¥\s*(\d{1,3}(?:,\d{3})+)/gi,
    extractor: (match) => ({
      amount: match[1],
      currency: 'JPY'
    })
  }
];

/**
 * Parse price string with currency
 */
function parsePrice(text) {
  for (const pattern of PRICE_PATTERNS) {
    pattern.regex.lastIndex = 0; // Reset regex
    const matches = pattern.regex.exec(text);

    if (matches) {
      const result = pattern.extractor(matches);
      const amount = parseAmount(result.amount);
      const currency = result.currency;

      if (amount && currency && FIAT_RATES[currency]) {
        const usdValue = amount * FIAT_RATES[currency];
        console.log(`💰 Parsed price: ${text} → ${amount} ${currency} = $${usdValue.toFixed(2)} USD`);

        return {
          amount: amount,
          currency: currency,
          usdValue: usdValue
        };
      }
    }
  }

  return null;
}

/**
 * Parse amount string to float (handles commas as thousand separators)
 */
function parseAmount(amountStr) {
  if (!amountStr) return null;

  // Remove all commas (thousand separators)
  const cleaned = amountStr.replace(/,/g, '');

  // Parse as float
  const amount = parseFloat(cleaned);

  // Validate
  if (isNaN(amount)) {
    console.warn('❌ Failed to parse amount:', amountStr, '→ cleaned:', cleaned);
    return null;
  }

  console.log('✅ Parsed amount:', amountStr, '→', amount);

  return amount;
}

/**
 * HUNTER MODE - Check if text contains a price
 * More permissive - checks if text might contain a price anywhere
 */
function isLikelyPrice(text) {
  const trimmed = text.trim();

  // Too long to be just a price
  if (trimmed.length > 100) return false;

  // Must contain at least one digit
  if (!/\d/.test(trimmed)) return false;

  // Must contain at least one price indicator (symbol or currency code)
  const hasPriceIndicator = /[\$\¥\€\£\₹\₩\₽]|USD|CNY|EUR|GBP|JPY|元|块|圆/i.test(trimmed);

  return hasPriceIndicator;
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
      console.log('🎮 Loaded currency:', currentCurrency);
    }
  } catch (error) {
    console.error('Failed to load currency:', error);
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
    console.error('Failed to save currency:', error);
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
    console.log(`❌ ${chain.toUpperCase()} failed:`, error.message);
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
      console.log(`Trying next chain...`);
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

  const rate = CRYPTO_RATES[currentCurrency];
  if (!rate) return null;

  return usdPrice / rate;
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
    console.error('Failed to update badge:', error);
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
  console.log('🎮 Selected:', currency);

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
// UNIVERSAL PRICE SCANNING
// =====================================================

/**
 * Create badge with responsive sizing (inherits from parent via CSS)
 */
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

  // Badge automatically scales to parent font size via CSS (0.85em)
  // No manual font size setting needed!

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

/**
 * COMPONENT SCANNER - Element-based price detection
 * Catches fragmented prices (Amazon style) with duplicate prevention
 */
function scanPageForPrices() {
  console.log('🔍 [COMPONENT SCANNER] Scanning for price elements...');

  // Likely price container tags (optimized for performance)
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

  console.log(`📊 Found ${uniqueElements.length} candidate elements (sorted by depth)`);

  let matchedCount = 0;
  let injectedCount = 0;
  let skippedDuplicate = 0;
  let skippedInvisible = 0;

  uniqueElements.forEach(element => {
    // DUPLICATE PREVENTION: Skip if already processed
    if (element.hasAttribute('data-degen-processed')) {
      return;
    }

    // DUPLICATE PREVENTION: Skip if already has a badge in any descendant
    if (element.querySelector('.degen-vision-badge')) {
      skippedDuplicate++;
      return;
    }

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

    // Get combined text from all children (handles fragmented spans!)
    const text = element.innerText || element.textContent || '';

    if (!text || text.trim().length === 0) {
      return;
    }

    const trimmed = text.trim();

    // Filter: Must be short (prices are short, not paragraphs)
    if (trimmed.length > 50) {
      return;
    }

    // Filter: Must contain price indicator
    if (!isLikelyPrice(trimmed)) {
      return;
    }

    // Try to parse the price
    const priceData = parsePrice(trimmed);

    if (!priceData || !priceData.usdValue || priceData.usdValue <= 0) {
      return;
    }

    // Found a valid price!
    matchedCount++;
    console.log(`✅ Matched: "${trimmed.substring(0, 30)}..." → $${priceData.usdValue.toFixed(2)} USD`);

    // Mark as processed BEFORE injection (prevents duplicates)
    element.setAttribute('data-degen-processed', 'true');

    // Create badge
    const badge = createBadge(priceData.usdValue, element);

    // Inject as child of the price element
    element.appendChild(badge);

    injectedCount++;
    console.log(`💉 Injected badge → ${badge.textContent}`);
  });

  // CLEANUP: Remove any duplicate badges that slipped through
  const allBadges = document.querySelectorAll('.degen-vision-badge');
  let cleanedUp = 0;

  allBadges.forEach(badge => {
    // Find closest parent with data-degen-processed
    const processedParent = badge.closest('[data-degen-processed]');

    if (processedParent) {
      // Count badges in this parent
      const siblingBadges = processedParent.querySelectorAll('.degen-vision-badge');

      // If more than one, remove extras (keep first)
      if (siblingBadges.length > 1) {
        for (let i = 1; i < siblingBadges.length; i++) {
          siblingBadges[i].remove();
          cleanedUp++;
        }
      }
    }
  });

  console.log(`🎯 Matched ${matchedCount} prices, injected ${injectedCount} badges`);
  console.log(`⏭️  Skipped ${skippedDuplicate} duplicates, ${skippedInvisible} hidden elements`);
  if (cleanedUp > 0) {
    console.log(`🧹 Cleaned up ${cleanedUp} duplicate badges`);
  }
}

/**
 * HUNTER MODE - Debounced scan with faster response
 */
function debouncedScan() {
  if (scanTimeout) {
    clearTimeout(scanTimeout);
  }

  scanTimeout = setTimeout(() => {
    scanPageForPrices();
  }, 800); // Faster: 800ms debounce for snappier response
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

function init() {
  loadSavedCurrency();

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎮 DEGEN VISION - COMPONENT SCANNER MODE');
  console.log('🌍 Supported fiat currencies:', Object.keys(FIAT_RATES).join(', '));
  console.log('🔧 Fragmented price detection enabled (Amazon-style spans)');
  console.log('⚡ Element-based scanning - Catches broken prices!');
  console.log('═══════════════════════════════════════════════════════');
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

  console.log('👀 MutationObserver: Watching for DOM changes...');

  // Close dropdowns on scroll/resize
  window.addEventListener('scroll', closeAllDropdowns, true);
  window.addEventListener('resize', closeAllDropdowns);

  // Polling for dynamic content
  setInterval(() => {
    scanPageForPrices();
  }, 2000);

  console.log('⏰ Polling: Scanning every 2 seconds for dynamic content...');
  console.log('');
}

// Start the extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
