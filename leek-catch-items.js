/**
 * 🌿 抓韭菜 - 物品数据库
 * 2D消除游戏的物品定义
 */

// 物品类型定义
const ITEM_TYPES = {
  LEEK: 'leek',           // 韭菜类
  CRYPTO: 'crypto',       // 加密货币类
  CHART: 'chart',         // 图表类
  HAND: 'hand',           // 手类型
  SPECIAL: 'special'      // 特殊物品
};

// 物品稀有度
const RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

// 完整物品数据库
const ITEMS_DATABASE = [
  // ========== 韭菜类 ==========
  {
    id: 'leek_basic',
    name: '普通韭菜',
    emoji: '🌿',
    type: ITEM_TYPES.LEEK,
    rarity: RARITY.COMMON,
    weight: 50, // 出现权重
    score: 10
  },
  {
    id: 'leek_cap',
    name: '带帽韭菜',
    emoji: '🧢',
    type: ITEM_TYPES.LEEK,
    rarity: RARITY.COMMON,
    weight: 40,
    score: 15
  },
  {
    id: 'leek_golden',
    name: '金韭菜',
    emoji: '✨',
    type: ITEM_TYPES.LEEK,
    rarity: RARITY.RARE,
    weight: 20,
    score: 30
  },
  {
    id: 'leek_rainbow',
    name: '彩虹韭菜',
    emoji: '🌈',
    type: ITEM_TYPES.LEEK,
    rarity: RARITY.EPIC,
    weight: 10,
    score: 50
  },
  {
    id: 'leek_diamond',
    name: '钻石韭菜',
    emoji: '💎',
    type: ITEM_TYPES.LEEK,
    rarity: RARITY.LEGENDARY,
    weight: 5,
    score: 100
  },

  // ========== 加密货币类 ==========
  {
    id: 'btc',
    name: '比特币',
    emoji: '₿',
    type: ITEM_TYPES.CRYPTO,
    rarity: RARITY.COMMON,
    weight: 35,
    score: 20
  },
  {
    id: 'eth',
    name: '以太坊',
    emoji: 'Ξ',
    type: ITEM_TYPES.CRYPTO,
    rarity: RARITY.COMMON,
    weight: 35,
    score: 20
  },
  {
    id: 'sol',
    name: 'Solana',
    emoji: '◎',
    type: ITEM_TYPES.CRYPTO,
    rarity: RARITY.RARE,
    weight: 15,
    score: 35
  },
  {
    id: 'doge',
    name: '狗狗币',
    emoji: '🐕',
    type: ITEM_TYPES.CRYPTO,
    rarity: RARITY.COMMON,
    weight: 30,
    score: 15
  },
  {
    id: 'pepe',
    name: 'Pepe',
    emoji: '🐸',
    type: ITEM_TYPES.CRYPTO,
    rarity: RARITY.RARE,
    weight: 10,
    score: 40
  },

  // ========== 图表类 ==========
  {
    id: 'chart_up',
    name: '暴涨',
    emoji: '📈',
    type: ITEM_TYPES.CHART,
    rarity: RARITY.COMMON,
    weight: 40,
    score: 10
  },
  {
    id: 'chart_down',
    name: '暴跌',
    emoji: '📉',
    type: ITEM_TYPES.CHART,
    rarity: RARITY.COMMON,
    weight: 40,
    score: 10
  },
  {
    id: 'candle',
    name: 'K线',
    emoji: '🕯️',
    type: ITEM_TYPES.CHART,
    rarity: RARITY.COMMON,
    weight: 30,
    score: 15
  },
  {
    id: 'phone',
    name: '看盘手机',
    emoji: '📱',
    type: ITEM_TYPES.CHART,
    rarity: RARITY.COMMON,
    weight: 35,
    score: 10
  },
  {
    id: 'computer',
    name: '交易终端',
    emoji: '💻',
    type: ITEM_TYPES.CHART,
    rarity: RARITY.RARE,
    weight: 15,
    score: 30
  },

  // ========== 手类型 ==========
  {
    id: 'diamond_hand',
    name: '钻石手',
    emoji: '💪',
    type: ITEM_TYPES.HAND,
    rarity: RARITY.EPIC,
    weight: 8,
    score: 60
  },
  {
    id: 'paper_hand',
    name: '纸手',
    emoji: '👐',
    type: ITEM_TYPES.HAND,
    rarity: RARITY.COMMON,
    weight: 25,
    score: 10
  },
  {
    id: 'buy_hand',
    name: '买入',
    emoji: '🤲',
    type: ITEM_TYPES.HAND,
    rarity: RARITY.COMMON,
    weight: 30,
    score: 10
  },
  {
    id: 'sell_hand',
    name: '卖出',
    emoji: '👋',
    type: ITEM_TYPES.HAND,
    rarity: RARITY.COMMON,
    weight: 30,
    score: 10
  },

  // ========== 特殊物品 ==========
  {
    id: 'wallet',
    name: '钱包',
    emoji: '💰',
    type: ITEM_TYPES.SPECIAL,
    rarity: RARITY.RARE,
    weight: 12,
    score: 35
  },
  {
    id: 'money_bag',
    name: '钱袋',
    emoji: '💵',
    type: ITEM_TYPES.SPECIAL,
    rarity: RARITY.EPIC,
    weight: 6,
    score: 55
  },
  {
    id: 'rocket',
    name: '火箭',
    emoji: '🚀',
    type: ITEM_TYPES.SPECIAL,
    rarity: RARITY.LEGENDARY,
    weight: 3,
    score: 80
  },
  {
    id: 'bull',
    name: '牛市',
    emoji: '🐂',
    type: ITEM_TYPES.SPECIAL,
    rarity: RARITY.EPIC,
    weight: 7,
    score: 65
  },
  {
    id: 'bear',
    name: '熊市',
    emoji: '🐻',
    type: ITEM_TYPES.SPECIAL,
    rarity: RARITY.RARE,
    weight: 12,
    score: 25
  },
  {
    id: 'moon',
    name: 'To The Moon',
    emoji: '🌙',
    type: ITEM_TYPES.SPECIAL,
    rarity: RARITY.LEGENDARY,
    weight: 4,
    score: 90
  }
];

// 每日限定物品（根据日期生成）
function getDailySpecialItems() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

  // 每周7种限定韭菜
  const weeklyLeeks = [
    { id: 'leek_fire', name: '火系韭菜', emoji: '🔥', rarity: RARITY.EPIC, score: 70 },
    { id: 'leek_ice', name: '冰系韭菜', emoji: '❄️', rarity: RARITY.EPIC, score: 70 },
    { id: 'leek_electric', name: '电系韭菜', emoji: '⚡', rarity: RARITY.EPIC, score: 70 },
    { id: 'leek_nature', name: '自然韭菜', emoji: '🍀', rarity: RARITY.EPIC, score: 70 },
    { id: 'leek_cyber', name: '赛博韭菜', emoji: '🤖', rarity: RARITY.EPIC, score: 70 },
    { id: 'leek_galaxy', name: '星系韭菜', emoji: '🌌', rarity: RARITY.LEGENDARY, score: 95 },
    { id: 'leek_sun', name: '传说韭菜', emoji: '☀️', rarity: RARITY.LEGENDARY, score: 120 }
  ];

  const dayOfWeek = today.getDay(); // 0-6 (周日到周六)
  const special = weeklyLeeks[dayOfWeek];

  return [{
    ...special,
    id: `daily_${special.id}_${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`,
    type: ITEM_TYPES.LEEK,
    weight: 2, // 稀有出现
    isDaily: true
  }];
}

// 获取关卡物品池
function getLevelItems(level) {
  const baseItems = [...ITEMS_DATABASE];
  const dailyItems = getDailySpecialItems();

  if (level === 1) {
    // 第1关：只有15种常见物品
    return baseItems
      .filter(item => item.rarity === RARITY.COMMON)
      .slice(0, 15);
  } else {
    // 第2关：所有物品 + 每日限定
    return [...baseItems, ...dailyItems];
  }
}

// 根据权重随机获取物品
function getRandomItem(level) {
  const items = getLevelItems(level);

  // 计算总权重
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  // 随机选择
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }

  return items[0];
}

// 批量生成物品
function generateItems(count, level) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(getRandomItem(level));
  }
  return items;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ITEM_TYPES,
    RARITY,
    ITEMS_DATABASE,
    getDailySpecialItems,
    getLevelItems,
    getRandomItem,
    generateItems
  };
}
