/**
 * 🎮 抓韭菜 - 2D消除游戏引擎
 * 核心游戏逻辑
 */

class LeekCatchGame {
  constructor(container) {
    this.container = container;
    this.gameState = 'menu'; // menu, playing, paused, gameover, victory
    this.currentLevel = 1;

    // 游戏配置
    this.SLOT_SIZE = 7; // 消除槽大小
    this.MATCH_COUNT = 3; // 需要匹配的数量

    // 游戏数据
    this.stackedItems = []; // 堆叠的物品
    this.slotItems = []; // 消除槽中的物品
    this.eliminatedCount = 0; // 已消除数量
    this.score = 0;

    // 时间限制
    this.timeLimit = 60; // 秒
    this.timeRemaining = 60;

    // 摇晃冷却
    this.shakeCooldown = 0;
    this.SHAKE_COOLDOWN_TIME = 30; // 秒

    // DOM元素
    this.gameContainer = null;
    this.playArea = null;
    this.slotArea = null;
    this.scoreDisplay = null;
    this.timeDisplay = null;

    console.log('🎮 抓韭菜游戏引擎初始化');
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 初始化
  // ═════════════════════════════════════════════════════════════════════════

  init() {
    console.log('🎮 初始化抓韭菜游戏...');
    this.createGameUI();
    console.log('✅ UI创建完成');
    this.showMenu();
    console.log('✅ 菜单显示完成');
    this.startGameLoop();
    console.log('✅ 游戏循环启动');
  }

  createGameUI() {
    // 创建游戏容器
    this.gameContainer = document.createElement('div');
    this.gameContainer.className = 'leek-catch-container';
    this.gameContainer.innerHTML = `
      <div class="leek-catch-header">
        <button class="btn-close" onclick="leekCatchGame.closeGame()">✖</button>
        <div class="level-info">第 <span id="level-num">1</span> 关</div>
        <div class="score-info">分数: <span id="score">0</span></div>
        <div class="time-info">时间: <span id="time">60</span>s</div>
      </div>

      <div class="leek-catch-body">
        <!-- 堆叠区域 -->
        <div class="stack-area" id="stack-area">
          <!-- 物品将在这里堆叠 -->
        </div>

        <!-- 消除槽区域 -->
        <div class="slot-area" id="slot-area">
          <!-- 7个槽位 -->
          ${Array(this.SLOT_SIZE).fill(0).map((_, i) => `
            <div class="slot" data-slot="${i}"></div>
          `).join('')}
        </div>
      </div>

      <div class="leek-catch-footer">
        <button class="btn-shake" id="btn-shake" onclick="leekCatchGame.shake()">
          🔄 摇晃 <span class="cooldown"></span>
        </button>
        <button class="btn-restart" onclick="leekCatchGame.restartLevel()">
          🔄 重新开始
        </button>
      </div>
    `;

    this.container.appendChild(this.gameContainer);

    // 获取DOM引用
    this.playArea = document.getElementById('stack-area');
    this.slotArea = document.getElementById('slot-area');
    this.scoreDisplay = document.getElementById('score');
    this.timeDisplay = document.getElementById('time');
    this.levelDisplay = document.getElementById('level-num');
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 游戏流程控制
  // ═════════════════════════════════════════════════════════════════════════

  showMenu() {
    this.gameState = 'menu';
    // 显示菜单UI
    const menuHTML = `
      <div class="game-menu">
        <h1>🌿 抓韭菜 🌿</h1>
        <p>找到3个相同的物品消除</p>
        <p>消除所有物品即可通关！</p>
        <button class="btn-start" id="btn-start-game">
          开始游戏
        </button>
        <div class="daily-info">
          <h3>📅 今日限定</h3>
          <div class="daily-item">${this.getDailyItemHTML()}</div>
        </div>
      </div>
    `;
    this.playArea.innerHTML = menuHTML;

    // 绑定按钮事件
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.onclick = () => {
        console.log('🎮 开始游戏按钮被点击');
        try {
          this.startLevel(1);
        } catch (error) {
          console.error('❌ 启动关卡失败:', error);
          alert('启动失败: ' + error.message);
        }
      };
    }
  }

  getDailyItemHTML() {
    const dailyItems = getDailySpecialItems();
    if (dailyItems.length > 0) {
      const item = dailyItems[0];
      return `
        <div class="special-item">
          <span class="item-emoji">${item.emoji}</span>
          <span class="item-name">${item.name}</span>
          <span class="item-rarity ${item.rarity}">${item.rarity}</span>
        </div>
      `;
    }
    return '';
  }

  startLevel(level) {
    console.log('🎮 启动关卡:', level);
    this.currentLevel = level;
    this.gameState = 'playing';

    // 根据关卡设置难度
    if (level === 1) {
      this.timeLimit = 60;
      console.log('生成第1关（简单）');
      this.generateLevel(1); // 简单关卡
    } else {
      this.timeLimit = 90;
      console.log('生成第2关（困难）');
      this.generateLevel(2); // 困难关卡
    }

    this.timeRemaining = this.timeLimit;
    this.eliminatedCount = 0;
    this.score = 0;
    this.slotItems = [];
    this.shakeCooldown = 0;

    console.log('物品数量:', this.stackedItems.length);
    this.updateUI();
    this.renderItems();
    this.renderSlots();
    console.log('✅ 关卡初始化完成');
  }

  generateLevel(level) {
    // 生成物品堆叠
    if (level === 1) {
      // 第1关：30个物品，单层堆叠
      this.stackedItems = this.generateStackedItems(30, level, 1);
    } else {
      // 第2关：60个物品，多层堆叠
      this.stackedItems = this.generateStackedItems(60, level, 3);
    }
  }

  generateStackedItems(count, level, maxLayers) {
    const items = [];
    const containerWidth = this.playArea.clientWidth || 400;
    const containerHeight = 400;

    for (let i = 0; i < count; i++) {
      const itemData = getRandomItem(level);
      const layer = Math.floor(Math.random() * maxLayers);
      const x = Math.random() * (containerWidth - 50);
      const y = Math.random() * (containerHeight - 50);

      items.push({
        ...itemData,
        uid: `item_${Date.now()}_${i}`, // 唯一ID
        x: x,
        y: y,
        layer: layer,
        visible: layer === 0 // 只有最底层可见
      });
    }

    // 按层级排序（底层在下）
    return items.sort((a, b) => a.layer - b.layer);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 游戏逻辑
  // ═════════════════════════════════════════════════════════════════════════

  handleItemClick(itemUid) {
    if (this.gameState !== 'playing') return;

    const itemIndex = this.stackedItems.findIndex(item => item.uid === itemUid);
    if (itemIndex === -1) return;

    const item = this.stackedItems[itemIndex];

    // 检查物品是否可见（被其他物品遮挡）
    if (!this.isItemClickable(item)) {
      // 播放被遮挡的音效/动画
      this.showBlockedHint(item);
      return;
    }

    // 检查槽位是否已满
    if (this.slotItems.length >= this.SLOT_SIZE) {
      this.showSlotsFullHint();
      return;
    }

    // 移动物品到槽位
    this.moveToSlot(item);
  }

  isItemClickable(item) {
    // 检查是否有其他物品遮挡
    const itemsAbove = this.stackedItems.filter(other =>
      other.uid !== item.uid &&
      other.layer > item.layer &&
      this.checkOverlap(item, other)
    );

    return itemsAbove.length === 0;
  }

  checkOverlap(item1, item2) {
    const size = 50; // 物品大小
    return !(item1.x + size < item2.x ||
             item2.x + size < item1.x ||
             item1.y + size < item2.y ||
             item2.y + size < item1.y);
  }

  moveToSlot(item) {
    // 从堆叠中移除
    this.stackedItems = this.stackedItems.filter(i => i.uid !== item.uid);

    // 添加到槽位
    this.slotItems.push(item);

    // 检查是否可以消除
    this.checkMatch();

    // 更新UI
    this.renderItems();
    this.renderSlots();

    // 播放音效
    leekAudio?.click();
  }

  checkMatch() {
    // 统计每个物品ID的数量
    const itemCounts = {};
    this.slotItems.forEach(item => {
      itemCounts[item.id] = (itemCounts[item.id] || 0) + 1;
    });

    // 找到可以消除的物品
    for (const itemId in itemCounts) {
      if (itemCounts[itemId] >= this.MATCH_COUNT) {
        this.eliminateItems(itemId);
        break;
      }
    }

    // 检查游戏结束条件
    this.checkGameEnd();
  }

  eliminateItems(itemId) {
    // 找到要消除的物品
    const itemsToEliminate = this.slotItems.filter(item => item.id === itemId).slice(0, 3);
    const eliminated = itemsToEliminate[0];

    // 从槽位移除
    this.slotItems = this.slotItems.filter(item => {
      const shouldRemove = itemsToEliminate.some(el => el.uid === item.uid);
      if (shouldRemove) {
        this.eliminatedCount++;
        this.score += eliminated.score;
      }
      return !shouldRemove;
    });

    // 播放消除动画和音效
    this.showEliminateEffect(eliminated);
    leekAudio?.success();

    // 更新分数显示
    this.updateUI();
  }

  checkGameEnd() {
    // 胜利条件：所有物品已消除
    if (this.stackedItems.length === 0 && this.slotItems.length === 0) {
      this.victory();
      return;
    }

    // 失败条件：槽位已满且无法消除
    if (this.slotItems.length >= this.SLOT_SIZE && !this.canEliminate()) {
      this.gameOver();
      return;
    }
  }

  canEliminate() {
    const itemCounts = {};
    this.slotItems.forEach(item => {
      itemCounts[item.id] = (itemCounts[item.id] || 0) + 1;
    });

    return Object.values(itemCounts).some(count => count >= this.MATCH_COUNT);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 特殊功能
  // ═════════════════════════════════════════════════════════════════════════

  shake() {
    if (this.shakeCooldown > 0) {
      this.showCooldownHint();
      return;
    }

    // 摇晃：重新排列所有物品的位置和层级
    this.stackedItems = this.generateStackedItems(
      this.stackedItems.length,
      this.currentLevel,
      this.currentLevel === 1 ? 1 : 3
    );

    this.shakeCooldown = this.SHAKE_COOLDOWN_TIME;
    this.renderItems();

    leekAudio?.click();

    // 显示摇晃提示
    this.showShakeEffect();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 渲染
  // ═════════════════════════════════════════════════════════════════════════

  renderItems() {
    this.playArea.innerHTML = '';

    this.stackedItems.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'stacked-item';
      itemEl.style.left = item.x + 'px';
      itemEl.style.top = item.y + 'px';
      itemEl.style.zIndex = item.layer;
      itemEl.innerHTML = `<span class="item-emoji">${item.emoji}</span>`;

      // 添加稀有度样式
      if (item.rarity) {
        itemEl.classList.add(`rarity-${item.rarity}`);
      }

      // 点击事件
      itemEl.onclick = () => this.handleItemClick(item.uid);

      this.playArea.appendChild(itemEl);
    });
  }

  renderSlots() {
    const slots = this.slotArea.querySelectorAll('.slot');
    slots.forEach((slot, index) => {
      slot.innerHTML = '';
      if (this.slotItems[index]) {
        const item = this.slotItems[index];
        slot.innerHTML = `<span class="item-emoji rarity-${item.rarity}">${item.emoji}</span>`;
      }
    });
  }

  updateUI() {
    this.scoreDisplay.textContent = this.score;
    this.timeDisplay.textContent = Math.ceil(this.timeRemaining);
    this.levelDisplay.textContent = this.currentLevel;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 游戏循环
  // ═════════════════════════════════════════════════════════════════════════

  startGameLoop() {
    setInterval(() => {
      if (this.gameState === 'playing') {
        // 更新时间
        this.timeRemaining -= 1;
        this.updateUI();

        // 更新摇晃冷却
        if (this.shakeCooldown > 0) {
          this.shakeCooldown -= 1;
          this.updateShakeButton();
        }

        // 检查时间是否用完
        if (this.timeRemaining <= 0) {
          this.gameOver();
        }
      }
    }, 1000);
  }

  updateShakeButton() {
    const btn = document.getElementById('btn-shake');
    if (btn) {
      const cooldownSpan = btn.querySelector('.cooldown');
      if (this.shakeCooldown > 0) {
        btn.disabled = true;
        btn.classList.add('on-cooldown');
        cooldownSpan.textContent = `(${this.shakeCooldown}s)`;
      } else {
        btn.disabled = false;
        btn.classList.remove('on-cooldown');
        cooldownSpan.textContent = '';
      }
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 游戏结束状态
  // ═════════════════════════════════════════════════════════════════════════

  victory() {
    this.gameState = 'victory';
    leekAudio?.modalOpen();

    let message = '';
    let nextAction = '';

    if (this.currentLevel === 1) {
      message = '恭喜通过第1关！';
      nextAction = '<button class="btn-next" onclick="leekCatchGame.startLevel(2)">挑战第2关</button>';
    } else {
      message = '🎉 太棒了！抓到韭菜啦！';
      nextAction = '<button class="btn-next" onclick="leekCatchGame.closeGame()">完成</button>';

      // 保存通关记录
      this.saveVictory();
    }

    this.playArea.innerHTML = `
      <div class="game-result victory">
        <h2>🎉 ${message}</h2>
        <p>最终分数: ${this.score}</p>
        <div class="result-actions">
          ${nextAction}
          <button class="btn-retry" onclick="leekCatchGame.restartLevel()">再玩一次</button>
        </div>
      </div>
    `;
  }

  gameOver() {
    this.gameState = 'gameover';
    leekAudio?.error();

    this.playArea.innerHTML = `
      <div class="game-result gameover">
        <h2>😢 游戏结束</h2>
        <p>分数: ${this.score}</p>
        <p>还差 ${this.stackedItems.length + this.slotItems.length} 个物品</p>
        <div class="result-actions">
          <button class="btn-retry" onclick="leekCatchGame.restartLevel()">再试一次</button>
          <button class="btn-back" onclick="leekCatchGame.closeGame()">返回</button>
        </div>
      </div>
    `;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 数据保存
  // ═════════════════════════════════════════════════════════════════════════

  saveVictory() {
    const victories = parseInt(localStorage.getItem('leek_catch_victories') || '0');
    localStorage.setItem('leek_catch_victories', (victories + 1).toString());

    // 保存最高分
    const highScore = parseInt(localStorage.getItem('leek_catch_highscore') || '0');
    if (this.score > highScore) {
      localStorage.setItem('leek_catch_highscore', this.score.toString());
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 辅助功能
  // ═════════════════════════════════════════════════════════════════════════

  restartLevel() {
    this.startLevel(this.currentLevel);
  }

  closeGame() {
    if (this.gameContainer) {
      this.gameContainer.remove();
    }
    leekAudio?.modalClose();
  }

  // 提示效果
  showBlockedHint(item) {
    // 显示"被遮挡"提示
    const hint = document.createElement('div');
    hint.className = 'hint blocked';
    hint.textContent = '被遮挡了！';
    hint.style.left = item.x + 'px';
    hint.style.top = item.y + 'px';
    this.playArea.appendChild(hint);
    setTimeout(() => hint.remove(), 1000);
  }

  showSlotsFullHint() {
    const hint = document.createElement('div');
    hint.className = 'hint slots-full';
    hint.textContent = '槽位已满！';
    this.slotArea.appendChild(hint);
    setTimeout(() => hint.remove(), 1500);
  }

  showCooldownHint() {
    const hint = document.createElement('div');
    hint.className = 'hint cooldown';
    hint.textContent = `冷却中 (${this.shakeCooldown}s)`;
    document.getElementById('btn-shock');
    setTimeout(() => hint.remove(), 1500);
  }

  showEliminateEffect(item) {
    const effect = document.createElement('div');
    effect.className = 'eliminate-effect';
    effect.innerHTML = `<span class="item-emoji">${item.emoji}</span>`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
  }

  showShakeEffect() {
    this.playArea.classList.add('shaking');
    setTimeout(() => {
      this.playArea.classList.remove('shaking');
    }, 500);
  }
}

// 全局实例
let leekCatchGame = null;

function startLeekCatchGame() {
  console.log('🎮 启动抓韭菜游戏...');

  try {
    // 如果已存在游戏实例，先移除
    if (leekCatchGame && leekCatchGame.gameContainer) {
      console.log('移除旧游戏实例');
      leekCatchGame.gameContainer.remove();
    }

    // 创建新游戏实例
    console.log('创建新游戏实例');
    leekCatchGame = new LeekCatchGame(document.body);
    leekCatchGame.init();

    console.log('✅ 抓韭菜游戏启动成功！');
  } catch (error) {
    console.error('❌ 启动抓韭菜游戏失败:', error);
    alert('游戏启动失败：' + error.message);
  }
}

// 也暴露到window对象，确保全局可访问
window.startLeekCatchGame = startLeekCatchGame;
