// ═══════════════════════════════════════════════════════════════════════════════
// LEEK VISION - NFT SKIN DATABASE
// 100+ Collectible Skins with NFT-style Rarity and Attributes
// ═══════════════════════════════════════════════════════════════════════════════

const SKIN_DATABASE = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // SERIE 1: ORIGINAL (原版系列)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'classic_leek',
    name: 'Classic Leek',
    series: 'Original',
    rarity: 'Common',
    icon: '🧢',
    primaryColor: '#00FF00',
    secondaryColor: '#00CC00',
    effect: 'none',
    animation: 'none',
    coinBonus: 1.0,
    jumpHeight: 1.0,
    magnetRange: 1.0,
    invincibleTime: 0,
    totalSupply: 999999,
    owned: false,
    purchasePrice: 0,
    description: 'The original. Where it all began.',
    unlockMethod: 'default'
  },
  {
    id: 'diamond_leek',
    name: 'Diamond Leek',
    series: 'Original',
    rarity: 'Rare',
    icon: '💎',
    primaryColor: '#00BFFF',
    secondaryColor: '#E0FFFF',
    effect: 'sparkle',
    animation: 'shimmer',
    coinBonus: 1.2,
    jumpHeight: 1.1,
    magnetRange: 1.0,
    invincibleTime: 0,
    totalSupply: 5000,
    owned: false,
    purchasePrice: 5000,
    description: 'Shine bright like a diamond!',
    unlockMethod: 'purchase'
  },
  {
    id: 'moss_leek',
    name: 'Moss Leek',
    series: 'Original',
    rarity: 'Common',
    icon: '🌲',
    primaryColor: '#228B22',
    secondaryColor: '#32CD32',
    effect: 'none',
    animation: 'float',
    coinBonus: 1.05,
    jumpHeight: 0.95,
    magnetRange: 1.2,
    invincibleTime: 0,
    totalSupply: 999999,
    owned: false,
    purchasePrice: 1000,
    description: 'Covered in ancient moss.',
    unlockMethod: 'purchase'
  },
  {
    id: 'charred_leek',
    name: 'Charred Leek',
    series: 'Original',
    rarity: 'Common',
    icon: '🔥',
    primaryColor: '#FF4500',
    secondaryColor: '#FF6347',
    effect: 'trail',
    animation: 'burn',
    coinBonus: 1.1,
    jumpHeight: 1.15,
    magnetRange: 1.0,
    invincibleTime: 0,
    totalSupply: 999999,
    owned: false,
    purchasePrice: 2000,
    description: 'Burnt to perfection.',
    unlockMethod: 'purchase'
  },
  {
    id: 'frozen_leek',
    name: 'Frozen Leek',
    series: 'Original',
    rarity: 'Rare',
    icon: '❄️',
    primaryColor: '#ADD8E6',
    secondaryColor: '#E0FFFF',
    effect: 'frost',
    animation: 'shiver',
    coinBonus: 1.15,
    jumpHeight: 0.9,
    magnetRange: 1.3,
    invincibleTime: 0,
    totalSupply: 3000,
    owned: false,
    purchasePrice: 8000,
    description: 'Chill out with frosty powers.',
    unlockMethod: 'purchase'
  },
  {
    id: 'electric_leek',
    name: 'Electric Leek',
    series: 'Original',
    rarity: 'Epic',
    icon: '⚡',
    primaryColor: '#FFD700',
    secondaryColor: '#FFFF00',
    effect: 'lightning',
    animation: 'zap',
    coinBonus: 1.3,
    jumpHeight: 1.2,
    magnetRange: 1.5,
    invincibleTime: 0,
    totalSupply: 500,
    owned: false,
    purchasePrice: 20000,
    description: 'Shocking performance!',
    unlockMethod: 'purchase'
  },
  {
    id: 'rainbow_leek',
    name: 'Rainbow Leek',
    series: 'Original',
    rarity: 'Legendary',
    icon: '🌈',
    primaryColor: '#FF69B4',
    secondaryColor: 'rainbow',
    effect: 'rainbow',
    animation: 'color-cycle',
    coinBonus: 1.5,
    jumpHeight: 1.1,
    magnetRange: 1.5,
    invincibleTime: 0,
    totalSupply: 100,
    owned: false,
    purchasePrice: 100000,
    description: 'All the colors of the spectrum!',
    unlockMethod: 'purchase'
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SERIE 2: CRYPTO (加密货币系列)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'bitcoin_leek',
    name: 'Bitcoin Leek',
    series: 'Crypto',
    rarity: 'Epic',
    icon: '₿',
    primaryColor: '#F7931A',
    secondaryColor: '#FFD700',
    effect: 'gold-glow',
    animation: 'pulse',
    coinBonus: 1.4,
    jumpHeight: 1.15,
    magnetRange: 1.4,
    invincibleTime: 0,
    totalSupply: 1000,
    owned: false,
    purchasePrice: 25000,
    description: 'Orange pill applied.',
    unlockMethod: 'purchase'
  },
  {
    id: 'ethereum_leek',
    name: 'Ethereum Leek',
    series: 'Crypto',
    rarity: 'Epic',
    icon: 'Ξ',
    primaryColor: '#627EEA',
    secondaryColor: '#8BBCE1',
    effect: 'blue-glow',
    animation: 'shimmer',
    coinBonus: 1.35,
    jumpHeight: 1.1,
    magnetRange: 1.3,
    invincibleTime: 0,
    totalSupply: 1000,
    owned: false,
    purchasePrice: 25000,
    description: 'Smart contracts, smart Leek.',
    unlockMethod: 'purchase'
  },
  {
    id: 'solana_leek',
    name: 'Solana Leek',
    series: 'Crypto',
    rarity: 'Legendary',
    icon: '🟣',
    primaryColor: '#9945FF',
    secondaryColor: '#14F195',
    effect: 'plasma',
    animation: 'speed',
    coinBonus: 1.5,
    jumpHeight: 1.2,
    magnetRange: 1.5,
    invincibleTime: 0,
    totalSupply: 500,
    owned: false,
    purchasePrice: 50000,
    description: 'Speed and scalability.',
    unlockMethod: 'purchase'
  },
  {
    id: 'bnb_leek',
    name: 'BNB Leek',
    series: 'Crypto',
    rarity: 'Epic',
    icon: '🔶',
    primaryColor: '#F3BA2F',
    secondaryColor: '#FFD700',
    effect: 'fire-glow',
    animation: 'burn',
    coinBonus: 1.25,
    jumpHeight: 1.1,
    magnetRange: 1.2,
    invincibleTime: 0,
    totalSupply: 800,
    owned: false,
    purchasePrice: 18000,
    description: 'Build N things.',
    unlockMethod: 'purchase'
  },
  {
    id: 'tether_leek',
    name: 'Tether Leek',
    series: 'Crypto',
    rarity: 'Rare',
    icon: '💲',
    primaryColor: '#26A17B',
    secondaryColor: '#00D26A',
    effect: 'shield',
    animation: 'stable',
    coinBonus: 1.2,
    jumpHeight: 1.0,
    magnetRange: 1.1,
    invincibleTime: 1,
    totalSupply: 2000,
    owned: false,
    purchasePrice: 10000,
    description: 'Stable and reliable.',
    unlockMethod: 'purchase'
  },
  {
    id: 'chainlink_leek',
    name: 'Chainlink Leek',
    series: 'Crypto',
    rarity: 'Epic',
    icon: '🌗',
    primaryColor: '#375BD2',
    secondaryColor: '#00D4FF',
    effect: 'link',
    animation: 'connect',
    coinBonus: 1.3,
    jumpHeight: 1.1,
    magnetRange: 1.4,
    invincibleTime: 0,
    totalSupply: 600,
    owned: false,
    purchasePrice: 22000,
    description: 'Links all things.',
    unlockMethod: 'purchase'
  },
  {
    id: 'uniswap_leek',
    name: 'Uniswap Leek',
    series: 'Crypto',
    rarity: 'Legendary',
    icon: '🦄',
    primaryColor: '#FF007A',
    secondaryColor: '#FFD700',
    effect: 'magic',
    animation: 'float',
    coinBonus: 1.6,
    jumpHeight: 1.25,
    magnetRange: 1.6,
    invincibleTime: 0,
    totalSupply: 200,
    owned: false,
    purchasePrice: 80000,
    description: 'Magical unicorn powers.',
    unlockMethod: 'purchase'
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SERIE 3: ELEMENTS (元素系列)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'fire_leek',
    name: 'Fire Leek',
    series: 'Elements',
    rarity: 'Epic',
    icon: '🔥',
    primaryColor: '#FF4500',
    secondaryColor: '#FF8C00',
    effect: 'flame',
    animation: 'burn',
    coinBonus: 1.4,
    jumpHeight: 1.2,
    magnetRange: 1.3,
    invincibleTime: 0,
    totalSupply: 800,
    owned: false,
    purchasePrice: 30000,
    description: 'Burns everything in its path.',
    unlockMethod: 'purchase'
  },
  {
    id: 'water_leek',
    name: 'Water Leek',
    series: 'Elements',
    rarity: 'Epic',
    icon: '💧',
    primaryColor: '#00BFFF',
    secondaryColor: '#1E90FF',
    effect: 'splash',
    animation: 'flow',
    coinBonus: 1.3,
    jumpHeight: 1.0,
    magnetRange: 1.5,
    invincibleTime: 0,
    totalSupply: 800,
    owned: false,
    purchasePrice: 30000,
    description: 'Flow like water.',
    unlockMethod: 'purchase'
  },
  {
    id: 'earth_leek',
    name: 'Earth Leek',
    series: 'Elements',
    rarity: 'Rare',
    icon: '🌿',
    primaryColor: '#8B4513',
    secondaryColor: '#228B22',
    effect: 'leaves',
    animation: 'grow',
    coinBonus: 1.2,
    jumpHeight: 1.05,
    magnetRange: 1.2,
    invincibleTime: 0,
    totalSupply: 2000,
    owned: false,
    purchasePrice: 12000,
    description: 'Grounded and stable.',
    unlockMethod: 'purchase'
  },
  {
    id: 'air_leek',
    name: 'Air Leek',
    series: 'Elements',
    rarity: 'Epic',
    icon: '💨',
    primaryColor: '#E0FFFF',
    secondaryColor: '#B0E0E6',
    effect: 'wind',
    animation: 'float',
    coinBonus: 1.35,
    jumpHeight: 1.3,
    magnetRange: 1.4,
    invincibleTime: 0,
    totalSupply: 700,
    owned: false,
    purchasePrice: 28000,
    description: 'Light as air.',
    unlockMethod: 'purchase'
  },
  {
    id: 'lightning_leek',
    name: 'Lightning Leek',
    series: 'Elements',
    rarity: 'Legendary',
    icon: '⚡',
    primaryColor: '#FFFF00',
    secondaryColor: '#0000FF',
    effect: 'shock',
    animation: 'flash',
    coinBonus: 1.5,
    jumpHeight: 1.25,
    magnetRange: 1.6,
    invincibleTime: 0.5,
    totalSupply: 300,
    owned: false,
    purchasePrice: 60000,
    description: 'Strikes like lightning!',
    unlockMethod: 'purchase'
  },
  {
    id: 'ice_leek_elements',
    name: 'Ice Leek',
    series: 'Elements',
    rarity: 'Epic',
    icon: '❄️',
    primaryColor: '#ADD8E6',
    secondaryColor: '#E0FFFF',
    effect: 'freeze',
    animation: 'crystal',
    coinBonus: 1.25,
    jumpHeight: 1.0,
    magnetRange: 1.5,
    invincibleTime: 2,
    totalSupply: 600,
    owned: false,
    purchasePrice: 25000,
    description: 'Freeze enemies in their tracks.',
    unlockMethod: 'purchase'
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SERIE 4: ZODIAC (生肖系列)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'dragon_leek',
    name: 'Dragon Leek',
    series: 'Zodiac',
    rarity: 'Mythic',
    icon: '🐉',
    primaryColor: '#FF0000',
    secondaryColor: '#FFD700',
    effect: 'dragon-fire',
    animation: 'majestic',
    coinBonus: 2.0,
    jumpHeight: 1.3,
    magnetRange: 2.0,
    invincibleTime: 3,
    totalSupply: 100,
    owned: false,
    purchasePrice: 200000,
    description: 'The king of all zodiacs!',
    unlockMethod: 'auction'
  },
  {
    id: 'tiger_leek',
    name: 'Tiger Leek',
    series: 'Zodiac',
    rarity: 'Legendary',
    icon: '🐯',
    primaryColor: '#FFA500',
    secondaryColor: '#FF6347',
    effect: 'roar',
    animation: 'fierce',
    coinBonus: 1.6,
    jumpHeight: 1.25,
    magnetRange: 1.6,
    invincibleTime: 1,
    totalSupply: 500,
    owned: false,
    purchasePrice: 70000,
    description: 'Ferocious and powerful.',
    unlockMethod: 'purchase'
  },
  {
    id: 'rat_leek',
    name: 'Rat Leek',
    series: 'Zodiac',
    rarity: 'Common',
    icon: '🐭',
    primaryColor: '#808080',
    secondaryColor': '#A9A9A9',
    effect: 'none',
    animation: 'scamper',
    coinBonus: 1.05,
    jumpHeight: 1.0,
    magnetRange: 1.2,
    invincibleTime: 0,
    totalSupply: 9999,
    owned: false,
    purchasePrice: 1500,
    description: 'Small but mighty.',
    unlockMethod: 'purchase'
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SERIE 5: CYBERPUNK (赛博朋克)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'cyborg_leek',
    name: 'Cyborg Leek',
    series: 'Cyberpunk',
    rarity: 'Epic',
    icon: '🤖',
    primaryColor: '#00FF00',
    secondaryColor: '#008000',
    effect: 'cyber-glow',
    animation: 'mechanical',
    coinBonus: 1.4,
    jumpHeight: 1.2,
    magnetRange: 1.5,
    invincibleTime: 0,
    totalSupply: 700,
    owned: false,
    purchasePrice: 35000,
    description: 'Part machine, part leek.',
    unlockMethod: 'purchase'
  },
  {
    id: 'hacker_leek',
    name: 'Hacker Leek',
    series: 'Cyberpunk',
    rarity: 'Legendary',
    icon: '💻',
    primaryColor: '#00FF00',
    secondaryColor: '#000000',
    effect: 'matrix-rain',
    animation: 'code',
    coinBonus: 1.7,
    jumpHeight: 1.15,
    magnetRange: 1.8,
    invincibleTime: 0,
    totalSupply: 400,
    owned: false,
    purchasePrice: 80000,
    description: 'I see your code.',
    unlockMethod: 'purchase'
  },
  {
    id: 'neon_leek',
    name: 'Neon Leek',
    series: 'Cyberpunk',
    rarity: 'Epic',
    icon: '⚡',
    primaryColor: '#FF00FF',
    secondaryColor: '#FF00FF',
    effect: 'neon-glow',
    animation: 'pulse',
    coinBonus: 1.3,
    jumpHeight: 1.1,
    magnetRange: 1.4,
    invincibleTime: 0,
    totalSupply: 600,
    owned: false,
    purchasePrice: 28000,
    description: 'Lights up the night.',
    unlockMethod: 'purchase'
  },
  {
    id: 'glitch_leek',
    name: 'Glitch Leek',
    series: 'Cyberpunk',
    rarity: 'Rare',
    icon: '📺',
    primaryColor: '#FF00FF',
    secondaryColor: '#00FF00',
    effect: 'glitch',
    animation: 'corrupt',
    coinBonus: 1.25,
    jumpHeight: 1.0,
    magnetRange: 1.3,
    invincibleTime: 0,
    totalSupply: 1500,
    owned: false,
    purchasePrice: 15000,
    description: 'Reality is just a simulation.',
    unlockMethod: 'purchase'
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SERIE 6: SEASONAL (季节限定)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'halloween_leek',
    name: 'Halloween Leek',
    series: 'Seasonal',
    rarity: 'Legendary',
    icon: '🎃',
    primaryColor: '#FF6600',
    secondaryColor: '#FF8C00',
    effect: 'pumpkin',
    animation: 'spooky',
    coinBonus: 1.5,
    jumpHeight: 1.2,
    magnetRange: 1.5,
    invincibleTime: 0,
    totalSupply: 0,
    owned: false,
    purchasePrice: 0,
    description: 'Trick or treat!',
    unlockMethod: 'limited',
    availableStart: '2024-10-01',
    availableEnd: '2024-10-31'
  },
  {
    id: 'christmas_leek',
    name: 'Christmas Leek',
    series: 'Seasonal',
    rarity: 'Legendary',
    icon: '🎄',
    primaryColor: '#FF0000',
    secondaryColor: '#00FF00',
    effect: 'snow',
    animation: 'jingle',
    coinBonus: 1.5,
    jumpHeight: 1.15,
    magnetRange: 1.6,
    invincibleTime: 0,
    totalSupply: 0,
    owned: false,
    purchasePrice: 0,
    description: 'Joy to the world!',
    unlockMethod: 'limited',
    availableStart: '2024-12-01',
    availableEnd: '2024-12-31'
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SERIE 7: PRO PLAYERS (职业选手联名)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: '0xsun_leek',
    name: '0xSun Edition',
    series: 'Pro Players',
    rarity: 'Mythic',
    icon: '🏆',
    primaryColor: '#9945FF',
    secondaryColor: '#FFD700',
    effect: 'champion',
    animation: 'legendary',
    coinBonus: 2.5,
    jumpHeight: 1.4,
    magnetRange: 2.0,
    invincibleTime: 5,
    totalSupply: 1,
    owned: false,
    purchasePrice: 0,
    description: 'The OG himself.',
    unlockMethod: 'special'
  },
  {
    id: 'vitalik_leek',
    name: 'Vitalik Leek',
    series: 'Pro Players',
    rarity: 'Legendary',
    icon: '🦜',
    primaryColor: '#627EEA',
    secondaryColor: '#82C8FA',
    effect: 'ethereum',
    animation: 'brilliant',
    coinBonus: 1.8,
    jumpHeight: 1.2,
    magnetRange: 1.7,
    invincibleTime: 2,
    totalSupply: 50,
    owned: false,
    purchasePrice: 100000,
    description: 'Friendly neighborhood coder.',
    unlockMethod: 'purchase'
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SERIE 8: ANIMATED (动态系列)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'sparkle_leek',
    name: 'Sparkle Leek',
    series: 'Animated',
    rarity: 'Epic',
    icon: '✨',
    primaryColor: '#FFD700',
    secondaryColor: '#FFFACD',
    effect: 'sparkle',
    animation: 'twinkle',
    coinBonus: 1.35,
    jumpHeight: 1.1,
    magnetRange: 1.4,
    invincibleTime: 0,
    totalSupply: 500,
    owned: false,
    purchasePrice: 32000,
    description: 'Always shining bright.',
    unlockMethod: 'purchase'
  },
  {
    id: 'galaxy_leek',
    name: 'Galaxy Leek',
    series: 'Animated',
    rarity: 'Mythic',
    icon: '🌀',
    primaryColor: '#4B0082',
    secondaryColor: '#9400D3',
    effect: 'galaxy',
    animation: 'rotate',
    coinBonus: 1.8,
    jumpHeight: 1.25,
    magnetRange: 1.8,
    invincibleTime: 2,
    totalSupply: 150,
    owned: false,
    purchasePrice: 90000,
    description: 'To infinity and beyond!',
    unlockMethod: 'purchase'
  },
  {
    id: 'mystic_leek',
    name: 'Mystic Leek',
    series: 'Animated',
    rarity: 'Legendary',
    icon: '🔮',
    primaryColor: '#9370DB',
    secondaryColor: '#DDA0DD',
    effect: 'mystic',
    animation: 'aura',
    coinBonus: 1.6,
    jumpHeight: 1.2,
    magnetRange: 1.7,
    invincibleTime: 1,
    totalSupply: 200,
    owned: false,
    purchasePrice: 75000,
    description: 'Unknown powers await.',
    unlockMethod: 'purchase'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getSkinById(id) {
  return SKIN_DATABASE.find(skin => skin.id === id);
}

function getSkinsBySeries(series) {
  return SKIN_DATABASE.filter(skin => skin.series === series);
}

function getSkinsByRarity(rarity) {
  return SKIN_DATABASE.filter(skin => skin.rarity === rarity);
}

function getAvailableSkins() {
  return SKIN_DATABASE.filter(skin => {
    // 检查是否已拥有
    const ownedSkins = JSON.parse(localStorage.getItem('ownedSkins') || '[]');
    if (ownedSkins.includes(skin.id)) return true;

    // 检查是否是默认皮肤
    if (skin.id === 'classic_leek') return true;

    // 检查是否可以购买
    if (skin.unlockMethod === 'purchase') return true;

    // 检查是否在可用时间内
    if (skin.unlockMethod === 'limited') {
      const now = new Date();
      const start = new Date(skin.availableStart);
      const end = new Date(skin.availableEnd);
      return now >= start && now <= end;
    }

    return false;
  });
}

function getOwnedSkins() {
  const ownedSkins = JSON.parse(localStorage.getItem('ownedSkins') || '[]');
  return SKIN_DATABASE.filter(skin => ownedSkins.includes(skin.id));
}

function getSkinRarityOrder() {
  return ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
}

function getRarityColor(rarity) {
  const colors = {
    'Common': '#808080',
    'Rare': '#00BFFF',
    'Epic': '#9B30FF',
    'Legendary': '#FFD700',
    'Mythic': '#FF1493'
  };
  return colors[rarity] || '#808080';
}

console.log(`✅ Skin Database Loaded: ${SKIN_DATABASE.length} skins available`);
