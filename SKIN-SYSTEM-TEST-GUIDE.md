# 🎨 Skin System Test Guide

## ✅ What's Been Implemented

### **1. Skin Database** (`skin-database.js`)
- ✅ 30+ NFT-style skins across 8 series
- ✅ Rarity system: Common, Rare, Epic, Legendary, Mythic
- ✅ Stat bonuses: coin multiplier, jump height, magnet range, invincibility time
- ✅ Purchase prices and total supply

### **2. Skin Manager** (`skin-manager.js`)
- ✅ Inventory management
- ✅ Skin purchasing with Leek Coins
- ✅ Skin equipment system
- ✅ Collection progress tracking
- ✅ Filtering by rarity, series, ownership
- ✅ Search functionality
- ✅ Blind box gacha system

### **3. Skin Showcase UI** (`styles-skin-showcase.css`)
- ✅ NFT-style card design
- ✅ Pixel art aesthetics
- ✅ Collection progress banner
- ✅ Filter controls
- ✅ Hover animations
- ✅ Responsive grid layout

### **4. Game Integration** (`game-engine.js`)
- ✅ "🎨 SKINS" button in game menu
- ✅ Modal overlay for skin showcase
- ✅ Click detection for button
- ✅ Real-time filtering

---

## 🚀 How to Test

### **Step 1: Reload the Extension**
```
1. Open new tab
2. Go to: chrome://extensions
3. Find "Leek Vision | 韭菜眼镜"
4. Click 🔄 refresh button
```

### **Step 2: Open the Game**
```
1. Refresh any webpage
2. Click the pet (Casual Mode)
3. Click "🎮 Play Leek Jump"
4. Game menu opens
```

### **Step 3: Access Skin System**
```
Look for the "🎨 SKINS" button in the top-right corner of the game menu
```

**Expected UI:**
```
┌─────────────────────────────────────┐
│  [🎨 SKINS]                         │ ← NEW BUTTON!
│                                     │
│         🧢 LEEK JUMP                │
│   "THANKS CRYPTO" EDITION           │
│                                     │
│   🏆 High Score: $0                 │
│                                     │
│   Click or Press Space to Jump      │
│   Collect 💰 +$10                   │
│   Collect 💎 +$50 (Rare)            │
│   Avoid 🔴 FUD Monsters             │
│                                     │
│      ▶ PRESS TO START               │
│                                     │
│   🏎️ Road to SF90: 0.00%            │
└─────────────────────────────────────┘
```

### **Step 4: Explore Skin Collection**
```
1. Click "🎨 SKINS" button
2. Skin showcase modal opens
```

**Expected Modal UI:**
```
┌──────────────────────────────────────────────────┐
│  🎨 SKIN COLLECTION                    [✖]       │
├──────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐     │
│  │  1  COLLECTED  |  30  TOTAL  |  3%  │     │
│  │  ════════════════════════════════════  │     │
│  └────────────────────────────────────────┘     │
│                                                  │
│  Filters: [All Rarities▼] [All Series▼]        │
│            [All Skins▼] [Search...]             │
│                                                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │Common│  │Rare  │  │Epic  │  │Mythic│       │
│  │🌿    │  │₿     │  │🔥    │  │☀️    │       │
│  │      │  │      │  │      │  │      │       │
│  │Equip │  │$500  │  │$2K   │  │$50K  │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
└──────────────────────────────────────────────────┘
```

### **Step 5: Test Features**

**A. Collection Stats**
- Check "COLLECTED / TOTAL" count
- View progress bar animation
- Verify rarity stats

**B. Filter System**
- Test rarity filter (Common → Rare → Epic → Legendary → Mythic)
- Test series filter (Original, Crypto, Elements, etc.)
- Test ownership filter (All, Owned, Not Owned)
- Test search box (try "bitcoin", "fire", "dragon")

**C. Skin Cards**
- Hover over cards (should lift up with glow)
- Check rarity badge colors:
  - Common: Gray
  - Rare: Blue
  - Epic: Purple
  - Legendary: Orange
  - Mythic: Red
- View stat bonuses (coin bonus, jump height, magnet range)
- Click "Equip" on owned skins
- View purchase prices on locked skins

**D. Blind Box System** (via console)
```javascript
// Test blind box opening
skinManager.openBlindBox();
```

### **Step 6: Test Console Commands**
```javascript
// Check owned skins
console.log(skinManager.ownedSkins);

// Check equipped skin
console.log(skinManager.getEquippedSkin());

// Check coin balance
console.log(skinManager.getCoins());

// Add coins (for testing)
skinManager.addCoins(10000);

// Purchase a skin
skinManager.purchaseSkin('bitcoin_leek');

// Equip a skin
skinManager.equipSkin('bitcoin_leek');

// Get collection stats
console.log(skinManager.getCollectionStats());

// Filter skins
console.log(skinManager.filterSkins({ rarity: 'Rare' }));
```

---

## 📊 Skin Database Preview

**Total Skins:** 30+
**Series:** 8 (Original, Crypto, Elements, Zodiac, Cyberpunk, Seasonal, Pro Players, Animated)

**Sample Skins:**
1. **Classic Leek** (Common) - FREE - Default skin
2. **Bitcoin Leek** (Rare) - 500 coins - 1.2x coin bonus
3. **Ethereum Leek** (Rare) - 500 coins - 1.2x magnet range
4. **Fire Leek** (Epic) - 2,000 coins - 1.5x jump height
5. **Ice Leek** (Epic) - 2,000 coins - 2x invincibility time
6. **Dragon Leek** (Legendary) - 10,000 coins - 2x coin bonus
7. **0xSun Edition** (Mythic) - 50,000 coins - 2.5x ALL stats

---

## 🎯 Success Criteria

✅ Game menu shows "🎨 SKINS" button
✅ Clicking button opens skin showcase modal
✅ Modal displays all skins in grid
✅ Collection stats are accurate
✅ Filters work correctly
✅ Search function works
✅ Hover animations on cards
✅ Rarity badges have correct colors
✅ Can equip owned skins
✅ Can see purchase prices
✅ Modal closes with ✖ button
✅ Modal closes on backdrop click
✅ No console errors

---

## 🐛 Troubleshooting

**Issue: Button doesn't appear**
- Check manifest.json loading order
- Verify skin-database.js and skin-manager.js are loaded
- Check console for errors

**Issue: Clicking button does nothing**
- Check console for "skinManager is not defined"
- Verify click event is firing
- Check isInButtonArea logic

**Issue: Modal doesn't open**
- Check if styles-skin-showcase.css is loaded
- Verify modal HTML generation
- Check for z-index conflicts

**Issue: Filters don't work**
- Check if event listeners are attached
- Verify filterSights() function logic
- Check criteria object values

---

## 🎮 Next Features (Pending)

1. **Skill Tree System** - Upgradeable abilities
2. **Room Decoration** - Decorate your personal space
3. **Blind Box Shop** - Purchase blind boxes
4. **Leaderboards** - Global rankings
5. **Daily Challenges** - Special rewards
6. **Skin Preview** - See skin in action before purchasing

---

**Ready to test?** 🚀

Reload the extension, open the game, and click the "🎨 SKINS" button!
