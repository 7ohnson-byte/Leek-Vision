// ═══════════════════════════════════════════════════════════════════════════════
// LEEK JUMP GAME - INTEGRATION WITH PET SYSTEM (FIXED VERSION)
// 这个文件会连接到你的宠物系统，但不破坏原有逻辑
// ═══════════════════════════════════════════════════════════════════════════════

console.log('🎮 Loading Leek Jump Integration (Fixed)...');

// =====================================================
// 1. 劫持原有宠物点击行为，添加菜单选项
// =====================================================

// 保存原始的 onPetClick（如果存在）
let _originalPetClickLogic = null;

// 等待页面加载完成后劫持
function interceptPetClick() {
    // 检查是否已经有 onPetClick
    if (window.onPetClick && !window._petClickIntercepted) {
        _originalPetClickLogic = window.onPetClick;

        // 替换为我们的版本
        window.onPetClick = function() {
            // 显示菜单而不是直接执行
            showCasualModeMenu();
        };

        window._petClickIntercepted = true;
        console.log('✅ Pet click intercepted successfully');
    }
}

// 延迟劫持，确保 content.js 已经加载
setTimeout(interceptPetClick, 2000);

// 再次尝试劫持（保险起见）
setTimeout(interceptPetClick, 5000);

// =====================================================
// 2. 显示 Casual Mode 菜单
// =====================================================

function showCasualModeMenu() {
    // 播放音效
    try {
        new Audio(chrome.runtime.getURL('audio/open.mp3')).play();
    } catch (e) {}

    leekAudio?.petClick();

    // 移除已存在的菜单
    const existing = document.getElementById('leek-casual-menu');
    if (existing) {
        existing.remove();
        // 如果菜单已存在，执行原有逻辑
        if (_originalPetClickLogic) {
            _originalPetClickLogic.call(this);
        }
        return;
    }

    // 创建菜单
    const menu = document.createElement('div');
    menu.id = 'leek-casual-menu';
    menu.className = 'leek-casual-menu';

    const totalEarnings = parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0;
    const highScore = parseInt(localStorage.getItem('leekJumpHighScore')) || 0;
    const sf90Progress = ((totalEarnings / 600000) * 100).toFixed(2);

    menu.innerHTML = `
        <div class="casual-menu-overlay"></div>
        <div class="casual-menu-content">
            <div class="casual-header">
                <h2>🌿 CASUAL MODE 🌿</h2>
                <button class="close-btn" id="close-casual-menu">✖</button>
            </div>

            <div class="casual-options">
                <button class="casual-option" id="play-random-animation">
                    <span class="option-icon">🎲</span>
                    <div class="option-details">
                        <span class="option-text">Random Animation</span>
                        <span class="option-desc">宠物随机移动</span>
                    </div>
                    <span class="option-arrow">▶</span>
                </button>

                <button class="casual-option primary" id="play-leek-jump">
                    <span class="option-icon">🎮</span>
                    <div class="option-details">
                        <span class="option-text">Play Leek Jump</span>
                        <span class="option-desc">"Thanks Crypto" Edition</span>
                    </div>
                    <span class="option-badge">NEW!</span>
                    <span class="option-arrow">▶</span>
                </button>
            </div>

            <div class="game-stats">
                <div class="stat-item">
                    <span class="stat-label">🏆 High Score</span>
                    <span class="stat-value">$${highScore.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">💰 Total Earned</span>
                    <span class="stat-value">$${totalEarnings.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">🏎️ SF90 Progress</span>
                    <span class="stat-value">${sf90Progress}%</span>
                </div>
                <div class="sf90-bar">
                    <div class="sf90-fill" style="width: ${sf90Progress}%"></div>
                </div>
            </div>

            <div class="daily-challenge">
                <div class="challenge-header">
                    <span class="challenge-icon">🎯</span>
                    <span class="challenge-title">DAILY CHALLENGE</span>
                </div>
                <div class="challenge-body">
                    <span class="challenge-target">$${getTodayChallengeTarget()}</span>
                    <span class="challenge-divider">/</span>
                    <span class="challenge-progress">$${getTodayProgress()}</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(menu);

    // 添加事件监听器
    const closeBtn = menu.querySelector('#close-casual-menu');
    const randomBtn = menu.querySelector('#play-random-animation');
    const gameBtn = menu.querySelector('#play-leek-jump');

    closeBtn.addEventListener('click', () => {
        menu.remove();
        leekAudio?.modalClose();
    });

    randomBtn.addEventListener('click', () => {
        menu.remove();
        leekAudio?.click();
        // 执行原有的宠物随机移动逻辑
        if (_originalPetClickLogic) {
            _originalPetClickLogic.call(this);
        } else {
            // 如果没有原始逻辑，使用备选方案
            fallbackPetAnimation();
        }
    });

    gameBtn.addEventListener('click', () => {
        menu.remove();
        leekAudio?.success();
        startLeekJumpGame();
    });

    leekAudio?.modalOpen();
}

// =====================================================
// 3. 备选宠物动画（如果原始逻辑不存在）
// =====================================================

function fallbackPetAnimation() {
    if (!PetState || !PetState.container) return;

    const container = PetState.container;
    const rect = container.getBoundingClientRect();

    // 保存当前位置
    const originalBottom = container.style.bottom;
    const originalRight = container.style.right;
    const originalTop = container.style.top;
    const originalLeft = container.style.left;

    // 停止过渡
    container.classList.remove('pet-transition');
    container.style.top = rect.top + 'px';
    container.style.left = rect.left + 'px';
    container.style.bottom = 'auto';
    container.style.right = 'auto';

    // 强制重绘
    void container.offsetWidth;

    // 恢复过渡
    container.classList.add('pet-transition');

    // 随机新位置
    const maxX = window.innerWidth - 150;
    const maxY = window.innerHeight - 150;
    const newX = Math.random() * (maxX - 50) + 50;
    const newY = Math.random() * (maxY - 50) + 50;

    // 翻转宠物
    if (PetState.avatar) {
        PetState.avatar.style.transform = newX < rect.left ? 'scaleX(-1)' : 'scaleX(1)';
        PetState.avatar.style.backgroundImage = `url('${getImgURL('pet-run.gif')}')`;
        PetState.avatar.classList.add('is-running');
    }

    // 移动到新位置
    container.style.left = newX + 'px';
    container.style.top = newY + 'px';

    // 播放音效
    leekAudio?.petRun();

    // 恢复
    setTimeout(() => {
        if (PetState.avatar) {
            PetState.avatar.style.backgroundImage = `url('${getImgURL('pet-shrug.gif')}')`;
            PetState.avatar.classList.remove('is-running');
            PetState.avatar.style.transform = 'scaleX(1)';
        }

        PetState.mode = 'IDLE';
        container.style.left = 'auto';
        container.style.top = 'auto';
        container.style.right = '20px';
        container.style.bottom = '20px';
        triggerPetTransform(currentCurrency, false);
    }, 1500);
}

// =====================================================
// 4. 每日挑战辅助函数
// =====================================================

function getTodayChallengeTarget() {
    const today = new Date().toDateString();
    let target = localStorage.getItem('leekJumpDailyTarget');

    if (!target || localStorage.getItem('leekJumpLastChallengeDate') !== today) {
        // 生成新的每日目标
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

// =====================================================
// 5. 游戏启动器
// =====================================================

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
        alert('Game engine not found. Please refresh the page and try again.');
        return;
    }

    // 创建游戏实例
    const container = document.body;
    window.leekJumpGameInstance = new LeekJumpGame(container);
    window.leekJumpGameInstance.init();

    console.log('✅ Leek Jump Game Started!');
}

// =====================================================
// 6. 添加样式
// =====================================================

const enhancedGameStyles = document.createElement('style');
enhancedGameStyles.textContent = `
    .leek-casual-menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2147483648;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .casual-menu-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
    }

    .casual-menu-content {
        position: relative;
        background: linear-gradient(145deg, #2b2b2b 0%, #1a1a1a 100%);
        border: 4px solid #000;
        box-shadow:
            12px 12px 0px rgba(0,0,0,0.8),
            0 0 30px rgba(0, 255, 0, 0.3);
        padding: 24px;
        min-width: 360px;
        max-width: 400px;
        font-family: 'Pixelify Sans', monospace;
        animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes popIn {
        0% {
            transform: scale(0.8);
            opacity: 0;
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .casual-menu-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
        background-size: 4px 4px;
        pointer-events: none;
        z-index: 0;
    }

    .casual-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 3px solid #00FF00;
        padding-bottom: 12px;
        position: relative;
        z-index: 1;
    }

    .casual-header h2 {
        color: #00FF00;
        font-size: 22px;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    }

    .close-btn {
        background: #ff0000;
        border: 3px solid #000;
        color: #fff;
        font-size: 20px;
        font-weight: bold;
        width: 36px;
        height: 36px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 3px 3px 0px #000;
        transition: all 0.1s;
        position: relative;
        z-index: 1;
    }

    .close-btn:hover {
        transform: scale(1.1);
        box-shadow: 4px 4px 0px #000;
    }

    .close-btn:active {
        transform: scale(0.95);
        box-shadow: inset 2px 2px 0px #000;
    }

    .casual-options {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-bottom: 24px;
        position: relative;
        z-index: 1;
    }

    .casual-option {
        background: #8b8b8b;
        border: 3px solid #000;
        box-shadow:
            inset -3px -3px 0px #3f3f3f,
            inset 3px 3px 0px #fff;
        padding: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
        transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .casual-option:hover {
        background: #9f9f9f;
        transform: scale(1.02) translateX(-2px);
        box-shadow:
            inset -3px -3px 0px #3f3f3f,
            inset 3px 3px 0px #fff,
            4px 4px 0px rgba(0,0,0,0.5);
    }

    .casual-option:active {
        background: #6f6f6f;
        transform: scale(0.98) translateX(0);
        box-shadow:
            inset 3px 3px 0px #3f3f3f,
            inset -3px -3px 0px #9f9f9f;
    }

    .casual-option.primary {
        border-color: #9945FF;
        box-shadow:
            inset -3px -3px 0px #3f3f3f,
            inset 3px 3px 0px #fff,
            0 0 20px rgba(153, 69, 255, 0.5);
    }

    .casual-option.primary:hover {
        box-shadow:
            inset -3px -3px 0px #3f3f3f,
            inset 3px 3px 0px #fff,
            4px 4px 0px rgba(153, 69, 255, 0.3),
            0 0 30px rgba(153, 69, 255, 0.7);
    }

    .option-icon {
        font-size: 32px;
        flex-shrink: 0;
        filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.5));
    }

    .option-details {
        flex-grow: 1;
    }

    .option-text {
        display: block;
        font-weight: bold;
        color: #fff;
        font-size: 16px;
        text-shadow: 2px 2px 0px #000;
        margin-bottom: 4px;
    }

    .option-desc {
        display: block;
        font-size: 12px;
        color: #aaa;
    }

    .option-arrow {
        font-size: 20px;
        color: #fff;
        opacity: 0.5;
        transition: all 0.2s;
    }

    .casual-option:hover .option-arrow {
        opacity: 1;
        transform: translateX(4px);
    }

    .option-badge {
        position: absolute;
        top: -10px;
        right: -10px;
        background: #FFA500;
        color: #000;
        font-size: 10px;
        font-weight: bold;
        padding: 5px 10px;
        border: 2px solid #000;
        box-shadow: 2px 2px 0px #000;
        animation: badgePulse 1.5s infinite;
        z-index: 2;
    }

    @keyframes badgePulse {
        0%, 100% {
            transform: scale(1);
            box-shadow: 2px 2px 0px #000;
        }
        50% {
            transform: scale(1.1);
            box-shadow: 2px 2px 0px #000, 0 0 10px rgba(255, 165, 0, 0.8);
        }
    }

    .game-stats {
        background: rgba(0, 0, 0, 0.4);
        border: 2px solid #333;
        padding: 14px;
        border-radius: 8px;
        margin-bottom: 16px;
        position: relative;
        z-index: 1;
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        font-size: 13px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stat-item:last-child {
        border-bottom: none;
    }

    .stat-label {
        color: #aaa;
    }

    .stat-value {
        color: #00FF00;
        font-weight: bold;
        font-size: 14px;
    }

    .sf90-bar {
        background: #000;
        border: 2px solid #00FF00;
        height: 12px;
        margin-top: 8px;
        position: relative;
        overflow: hidden;
    }

    .sf90-fill {
        background: repeating-linear-gradient(
            90deg,
            #00FF00 0px,
            #00FF00 4px,
            #00cc00 4px,
            #00cc00 8px
        );
        height: 100%;
        transition: width 0.5s ease-out;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    }

    .daily-challenge {
        background: rgba(153, 69, 255, 0.1);
        border: 2px solid #9945FF;
        padding: 12px;
        border-radius: 8px;
        position: relative;
        z-index: 1;
    }

    .challenge-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }

    .challenge-icon {
        font-size: 18px;
    }

    .challenge-title {
        color: #9945FF;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .challenge-body {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        font-weight: bold;
    }

    .challenge-target {
        color: #fff;
    }

    .challenge-divider {
        color: #666;
    }

    .challenge-progress {
        color: #00FF00;
    }
`;

document.head.appendChild(enhancedGameStyles);

console.log('✅ Leek Jump Integration (Fixed) Loaded!');

// 导出函数供外部使用
window.LeekJumpIntegration = {
    startGame: startLeekJumpGame,
    showMenu: showCasualModeMenu,
    getProgress: () => ({
        total: parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0,
        highScore: parseInt(localStorage.getItem('leekJumpHighScore')) || 0,
        sf90Progress: ((parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0) / 600000 * 100).toFixed(2)
    })
};
