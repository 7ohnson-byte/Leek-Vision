/**
 * 🎨 Skin Manager System
 * Handles NFT-style skin collection, inventory, purchasing, and equipment
 */

class SkinManager {
  constructor() {
    this.ownedSkins = this.loadOwnedSkins();
    this.equippedSkin = this.loadEquippedSkin();
    this.leekCoins = this.loadLeekCoins();
    this.inventory = this.loadInventory();
  }

  // ===== STORAGE ===== //
  loadOwnedSkins() {
    const saved = localStorage.getItem('leek_owned_skins');
    return saved ? JSON.parse(saved) : ['classic_leek']; // Default skin
  }

  saveOwnedSkins() {
    localStorage.setItem('leek_owned_skins', JSON.stringify(this.ownedSkins));
  }

  loadEquippedSkin() {
    return localStorage.getItem('leek_equipped_skin') || 'classic_leek';
  }

  saveEquippedSkin() {
    localStorage.setItem('leek_equipped_skin', this.equippedSkin);
  }

  loadLeekCoins() {
    return parseInt(localStorage.getItem('leek_coins') || '0');
  }

  saveLeekCoins() {
    localStorage.setItem('leek_coins', this.leekCoins.toString());
  }

  loadInventory() {
    const saved = localStorage.getItem('leek_inventory');
    return saved ? JSON.parse(saved) : {
      blindBoxes: 0,
      commonShards: 0,
      rareShards: 0,
      epicShards: 0,
      legendaryShards: 0,
      mythicShards: 0
    };
  }

  saveInventory() {
    localStorage.setItem('leek_inventory', JSON.stringify(this.inventory));
  }

  // ===== SKIN OWNERSHIP ===== //
  ownsSkin(skinId) {
    return this.ownedSkins.includes(skinId);
  }

  addSkin(skinId) {
    if (!this.ownsSkin(skinId)) {
      this.ownedSkins.push(skinId);
      this.saveOwnedSkins();
      return true;
    }
    return false;
  }

  equipSkin(skinId) {
    if (this.ownsSkin(skinId)) {
      this.equippedSkin = skinId;
      this.saveEquippedSkin();
      return true;
    }
    return false;
  }

  getEquippedSkin() {
    return SKIN_DATABASE.find(s => s.id === this.equippedSkin) || SKIN_DATABASE[0];
  }

  // ===== COIN MANAGEMENT ===== //
  addCoins(amount) {
    this.leekCoins += amount;
    this.saveLeekCoins();
  }

  spendCoins(amount) {
    if (this.leekCoins >= amount) {
      this.leekCoins -= amount;
      this.saveLeekCoins();
      return true;
    }
    return false;
  }

  getCoins() {
    return this.leekCoins;
  }

  // ===== PURCHASING ===== //
  purchaseSkin(skinId) {
    const skin = SKIN_DATABASE.find(s => s.id === skinId);
    if (!skin) return { success: false, error: 'Skin not found' };

    if (this.ownsSkin(skinId)) {
      return { success: false, error: 'Already owned' };
    }

    if (this.spendCoins(skin.purchasePrice)) {
      this.addSkin(skinId);
      return { success: true, skin };
    }

    return { success: false, error: 'Insufficient coins' };
  }

  // ===== COLLECTION STATS ===== //
  getCollectionStats() {
    const totalSkins = SKIN_DATABASE.length;
    const ownedCount = this.ownedSkins.length;
    const progress = Math.round((ownedCount / totalSkins) * 100);

    const rarityCount = {
      Common: 0,
      Rare: 0,
      Epic: 0,
      Legendary: 0,
      Mythic: 0
    };

    this.ownedSkins.forEach(skinId => {
      const skin = SKIN_DATABASE.find(s => s.id === skinId);
      if (skin) {
        rarityCount[skin.rarity]++;
      }
    });

    return {
      total: totalSkins,
      owned: ownedCount,
      progress,
      rarityCount
    };
  }

  // ===== SKIN FILTERING ===== //
  filterSkins(criteria = {}) {
    let filtered = [...SKIN_DATABASE];

    if (criteria.rarity && criteria.rarity !== 'All') {
      filtered = filtered.filter(s => s.rarity === criteria.rarity);
    }

    if (criteria.series && criteria.series !== 'All') {
      filtered = filtered.filter(s => s.series === criteria.series);
    }

    if (criteria.owned !== undefined) {
      filtered = filtered.filter(s => this.ownsSkin(s.id) === criteria.owned);
    }

    if (criteria.search) {
      const search = criteria.search.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.description.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  // ===== UI GENERATION ===== //
  generateSkinShowcaseHTML(criteria = {}) {
    const skins = this.filterSkins(criteria);
    const stats = this.getCollectionStats();

    return `
      <div class="skin-showcase">
        <!-- Collection Stats Banner -->
        <div class="collection-banner">
          <div class="collection-stats">
            <div class="stat-item">
              <span class="stat-value">${stats.owned}</span>
              <span class="stat-label">COLLECTED</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${stats.total}</span>
              <span class="stat-label">TOTAL</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${stats.progress}%</span>
              <span class="stat-label">COMPLETE</span>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${stats.progress}%"></div>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
          <select class="filter-select" id="rarityFilter">
            <option value="All">All Rarities</option>
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
            <option value="Mythic">Mythic</option>
          </select>

          <select class="filter-select" id="seriesFilter">
            <option value="All">All Series</option>
            <option value="Original">Original</option>
            <option value="Crypto">Crypto</option>
            <option value="Elements">Elements</option>
            <option value="Zodiac">Zodiac</option>
            <option value="Cyberpunk">Cyberpunk</option>
            <option value="Seasonal">Seasonal</option>
            <option value="Pro Players">Pro Players</option>
            <option value="Animated">Animated</option>
          </select>

          <select class="filter-select" id="ownershipFilter">
            <option value="all">All Skins</option>
            <option value="owned">Owned</option>
            <option value="locked">Not Owned</option>
          </select>

          <input type="text" class="search-input" id="skinSearch" placeholder="Search skins..." />
        </div>

        <!-- Skin Grid -->
        <div class="skin-grid">
          ${skins.map(skin => this.generateSkinCard(skin)).join('')}
        </div>
      </div>
    `;
  }

  generateSkinCard(skin) {
    const isOwned = this.ownsSkin(skin.id);
    const isEquipped = this.equippedSkin === skin.id;
    const rarityColors = {
      'Common': '#9E9E9E',
      'Rare': '#2196F3',
      'Epic': '#9C27B0',
      'Legendary': '#FF9800',
      'Mythic': '#F44336'
    };
    const rarityColor = rarityColors[skin.rarity];

    return `
      <div class="skin-card ${isOwned ? 'owned' : 'locked'}" data-skin-id="${skin.id}">
        <div class="skin-card-border" style="border-color: ${rarityColor}"></div>

        <!-- Skin Preview -->
        <div class="skin-preview">
          <div class="skin-pixel-art ${isOwned ? '' : 'grayscale'}">
            ${this.generatePixelArt(skin.id)}
          </div>
          ${isEquipped ? '<div class="equipped-badge">EQUIPPED</div>' : ''}
        </div>

        <!-- Skin Info -->
        <div class="skin-info">
          <div class="skin-name">${skin.name}</div>
          <div class="skin-series">${skin.series}</div>
          <div class="skin-stats">
            ${skin.coinBonus > 1 ? `<span class="stat-tag">💰 +${Math.round((skin.coinBonus - 1) * 100)}% Coins</span>` : ''}
            ${skin.jumpHeight > 1 ? `<span class="stat-tag">🦘 +${Math.round((skin.jumpHeight - 1) * 100)}% Jump</span>` : ''}
            ${skin.magnetRange > 1 ? `<span class="stat-tag">🧲 +${Math.round((skin.magnetRange - 1) * 100)}% Magnet</span>` : ''}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="skin-actions">
          ${isOwned ? `
            <button class="btn btn-equip ${isEquipped ? 'equipped' : ''}" onclick="skinManager.equipSkin('${skin.id}')">
              ${isEquipped ? '✓ Equipped' : 'Equip'}
            </button>
          ` : `
            <button class="btn btn-purchase" onclick="skinManager.purchaseSkin('${skin.id}')">
              Purchase
            </button>
            <div class="skin-price">
              <span class="price-value">${skin.purchasePrice.toLocaleString()}</span>
              <span class="price-currency">🪙</span>
            </div>
          `}
        </div>

        <!-- Rarity Badge -->
        <div class="rarity-badge" style="background: ${rarityColor}">
          ${skin.rarity}
        </div>
      </div>
    `;
  }

  generatePixelArt(skinId) {
    // Simple pixel art representation (can be expanded with actual sprite data)
    const artPatterns = {
      'classic_leek': '🌿',
      'bitcoin_leek': '₿',
      'ethereum_leek': 'Ξ',
      'solana_leek': '◎',
      'fire_leek': '🔥',
      'ice_leek': '❄️',
      'dragon_leek': '🐉',
      'cyber_leek': '🤖',
      'santa_leek': '🎅',
      '0xsun_leek': '☀️'
    };

    return artPatterns[skinId] || '🌿';
  }

  // ===== BLIND BOX SYSTEM ===== //
  openBlindBox() {
    if (this.inventory.blindBoxes <= 0) {
      return { success: false, error: 'No blind boxes' };
    }

    this.inventory.blindBoxes--;
    this.saveInventory();

    // Gacha logic with rarity weights
    const roll = Math.random() * 100;
    let rarity;

    if (roll < 50) rarity = 'Common';      // 50%
    else if (roll < 80) rarity = 'Rare';   // 30%
    else if (roll < 95) rarity = 'Epic';   // 15%
    else if (roll < 99) rarity = 'Legendary'; // 4%
    else rarity = 'Mythic';                // 1%

    // Get all skins of this rarity
    const raritySkins = SKIN_DATABASE.filter(s => s.rarity === rarity && !this.ownsSkin(s.id));

    if (raritySkins.length === 0) {
      // If all skins owned, give coins instead
      const coinReward = {
        'Common': 100,
        'Rare': 500,
        'Epic': 2000,
        'Legendary': 10000,
        'Mythic': 50000
      }[rarity];

      this.addCoins(coinReward);
      return {
        success: true,
        type: 'coins',
        amount: coinReward,
        rarity,
        message: `All ${rarity} skins owned! Received ${coinReward} coins instead.`
      };
    }

    // Random skin from rarity pool
    const skin = raritySkins[Math.floor(Math.random() * raritySkins.length)];
    this.addSkin(skin.id);

    return {
      success: true,
      type: 'skin',
      skin,
      rarity,
      message: `🎉 You got: ${skin.name}!`
    };
  }
}

// Global instance
const skinManager = new SkinManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkinManager;
}
