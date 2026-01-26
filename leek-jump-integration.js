// ═══════════════════════════════════════════════════════════════════════════════
// LEEK JUMP GAME - INTEGRATION WITH PET SYSTEM
// This file connects the game to your existing Leek Vision extension
// ═══════════════════════════════════════════════════════════════════════════════

console.log('🎮 Loading Leek Jump Integration...');

// Global game instance
let leekJumpGame = null;

// =====================================================
// MODIFY PET CLICK BEHAVIOR FOR CASUAL MODE
// =====================================================

// Save original onPetClick
const originalOnPetClick = window.onPetClick;

// Enhanced pet click with game option
window.onPetClick = function() {
    try {
        new Audio(chrome.runtime.getURL('audio/open.mp3')).play();
    } catch (e) {}

    if (operationMode === 'pro') {
        toggleAgentChat();
        return;
    }

    // CASUAL MODE: Show menu
    showCasualModeMenu();
};

// Show casual mode menu
function showCasualModeMenu() {
    // Remove existing menu
    const existing = document.getElementById('leek-casual-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'leek-casual-menu';
    menu.className = 'leek-casual-menu';
    menu.innerHTML = `
        <div class="casual-menu-content">
            <div class="casual-header">
                <h2>🌿 CASUAL MODE 🌿</h2>
                <button class="close-btn" id="close-casual-menu">✖</button>
            </div>

            <div class="casual-options">
                <button class="casual-option" id="play-random-animation">
                    <span class="option-icon">🎲</span>
                    <span class="option-text">Random Animation</span>
                    <span class="option-desc">宠物随机移动</span>
                </button>

                <button class="casual-option primary" id="play-leek-jump">
                    <span class="option-icon">🎮</span>
                    <span class="option-text">Play Leek Jump</span>
                    <span class="option-desc">"Thanks Crypto" Edition</span>
                    <span class="option-badge">NEW!</span>
                </button>
            </div>

            <div class="game-stats">
                <div class="stat-item">
                    <span class="stat-label">🏆 High Score</span>
                    <span class="stat-value">$${(localStorage.getItem('leekJumpHighScore') || 0).toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">💰 Total Earnings</span>
                    <span class="stat-value">$${(parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0).toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">🏎️ SF90 Progress</span>
                    <span class="stat-value">${((parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0) / 600000 * 100).toFixed(2)}%</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(menu);

    // Add event listeners
    menu.querySelector('#close-casual-menu').addEventListener('click', () => {
        menu.remove();
        leekAudio?.modalClose();
    });

    menu.querySelector('#play-random-animation').addEventListener('click', () => {
        menu.remove();
        originalOnPetClick?.call(this);
    });

    menu.querySelector('#play-leek-jump').addEventListener('click', () => {
        menu.remove();
        startLeekJumpGame();
    });

    leekAudio?.modalOpen();
}

// =====================================================
// GAME LAUNCHER
// =====================================================

function startLeekJumpGame() {
    // Remove existing game
    const existing = document.querySelector('canvas[leek-jump-game]');
    if (existing) {
        existing.remove();
    }

    // Create game container
    const container = document.body;

    // Initialize game
    leekJumpGame = new LeekJumpGame(container);
    leekJumpGame.init();

    // Play start sound
    leekAudio?.success();

    console.log('🎮 Leek Jump Game Started!');

    // Track game session
    const sessions = parseInt(localStorage.getItem('leekJumpSessions')) || 0;
    localStorage.setItem('leekJumpSessions', sessions + 1);

    // Show daily challenge reminder
    showDailyChallengeReminder();
}

// =====================================================
// DAILY CHALLENGE SYSTEM
// =====================================================

function showDailyChallengeReminder() {
    const today = new Date().toDateString();
    const lastChallengeDate = localStorage.getItem('leekJumpLastChallenge');
    const challengeCompleted = localStorage.getItem('leekJumpChallengeCompleted') === today;

    if (lastChallengeDate !== today && !challengeCompleted) {
        // Set today's challenge
        const dailyTarget = 500 + Math.floor(Math.random() * 1500); // $500-$2000
        localStorage.setItem('leekJumpDailyTarget', dailyTarget);
        localStorage.setItem('leekJumpLastChallenge', today);

        // Show reminder after a few seconds
        setTimeout(() => {
            showDailyChallengePopup(dailyTarget);
        }, 2000);
    }
}

function showDailyChallengePopup(target) {
    const popup = document.createElement('div');
    popup.className = 'leek-game-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <h3>🎯 DAILY CHALLENGE!</h3>
            <p>Earn <strong>$${target}</strong> today!</p>
            <p class="popup-sub">Progress: <span id="daily-progress">$0</span> / $${target}</p>
            <button class="popup-btn" id="close-challenge-popup">Let's Go!</button>
        </div>
    `;

    document.body.appendChild(popup);

    popup.querySelector('#close-challenge-popup').addEventListener('click', () => {
        popup.remove();
    });

    setTimeout(() => popup.remove(), 5000);
}

function updateDailyChallengeProgress(sessionEarnings) {
    const today = new Date().toDateString();
    const dailyTarget = parseInt(localStorage.getItem('leekJumpDailyTarget')) || 1000;
    const todayEarnings = parseFloat(localStorage.getItem('leekJumpTodayEarnings')) || 0;

    const newEarnings = todayEarnings + sessionEarnings;
    localStorage.setItem('leekJumpTodayEarnings', newEarnings);

    // Check if challenge completed
    if (newEarnings >= dailyTarget) {
        localStorage.setItem('leekJumpChallengeCompleted', today);
        showChallengeCompletedPopup(newEarnings);
    }
}

function showChallengeCompletedPopup(earnings) {
    const popup = document.createElement('div');
    popup.className = 'leek-game-popup success';
    popup.innerHTML = `
        <div class="popup-content">
            <h3>🎉 CHALLENGE COMPLETE!</h3>
            <p>You earned <strong>$${earnings}</strong> today!</p>
            <p class="popup-sub">🔥 Come back tomorrow for a new challenge!</p>
            <button class="popup-btn" id="close-completed-popup">Awesome!</button>
        </div>
    `;

    document.body.appendChild(popup);

    popup.querySelector('#close-completed-popup').addEventListener('click', () => {
        popup.remove();
    });

    leekAudio?.success();
}

// =====================================================
// ACHIEVEMENT SYSTEM
// =====================================================

const achievements = {
    firstGame: {
        id: 'firstGame',
        name: '🎮 First Steps',
        description: 'Play your first game',
        check: () => true,
        reward: 0
    },
    earn100: {
        id: 'earn100',
        name: '💰 Getting Started',
        description: 'Earn $100 in one game',
        check: (score) => score >= 100,
        reward: 0
    },
    earn500: {
        id: 'earn500',
        name: '💎 Diamond Hands',
        description: 'Earn $500 in one game',
        check: (score) => score >= 500,
        reward: 0
    },
    earn1000: {
        id: 'earn1000',
        name: '🚀 To The Moon',
        description: 'Earn $1,000 in one game',
        check: (score) => score >= 1000,
        reward: 0
    },
    earn5000: {
        id: 'earn5000',
        name: '🏆 High Roller',
        description: 'Earn $5,000 in one game',
        check: (score) => score >= 5000,
        reward: 0
    },
    streak7: {
        id: 'streak7',
        name: '🔥 Weekly Warrior',
        description: '7-day play streak',
        check: () => {
            const streak = calculatePlayStreak();
            return streak >= 7;
        },
        reward: 0
    },
    total100k: {
        id: 'total100k',
        name: '💵 Six Figures',
        description: 'Earn $100,000 total',
        check: () => {
            const total = parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0;
            return total >= 100000;
        },
        reward: 0
    },
    sf90: {
        id: 'sf90',
        name: '🏎️ Thanks Crypto!',
        description: 'Unlock Ferrari SF90 ($600,000)',
        check: () => {
            const total = parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0;
            return total >= 600000;
        },
        reward: 0
    }
};

function checkAchievements(score) {
    const unlockedAchievements = JSON.parse(localStorage.getItem('leekJumpAchievements')) || [];

    Object.values(achievements).forEach(achievement => {
        if (!unlockedAchievements.includes(achievement.id) && achievement.check(score)) {
            unlockAchievement(achievement);
        }
    });
}

function unlockAchievement(achievement) {
    const unlockedAchievements = JSON.parse(localStorage.getItem('leekJumpAchievements')) || [];
    unlockedAchievements.push(achievement.id);
    localStorage.setItem('leekJumpAchievements', JSON.stringify(unlockedAchievements));

    // Show popup
    showAchievementPopup(achievement);

    leekAudio?.success();
    console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
}

function showAchievementPopup(achievement) {
    const popup = document.createElement('div');
    popup.className = 'leek-achievement-popup';
    popup.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-icon">🏆</div>
            <h3>ACHIEVEMENT UNLOCKED!</h3>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
        </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add('show');
    }, 100);

    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

function calculatePlayStreak() {
    const playDates = JSON.parse(localStorage.getItem('leekJumpPlayDates')) || [];

    const today = new Date().toDateString();
    if (!playDates.includes(today)) {
        playDates.push(today);
        localStorage.setItem('leekJumpPlayDates', JSON.stringify(playDates));
    }

    // Calculate consecutive days
    let streak = 0;
    const date = new Date();

    while (true) {
        const dateStr = date.toDateString();
        if (playDates.includes(dateStr)) {
            streak++;
            date.setDate(date.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

// =====================================================
// TRADING PNL INTEGRATION
// =====================================================

function showTradingProfitPopup(profit) {
    const totalEarnings = parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0;
    const combinedTotal = totalEarnings + profit;
    const sf90Progress = (combinedTotal / 600000 * 100).toFixed(2);

    const equivalents = calculateRealWorldEquivalents(profit);

    const popup = document.createElement('div');
    popup.className = 'leek-game-popup trading';
    popup.innerHTML = `
        <div class="popup-content">
            <h3>🎉 TRADING PROFIT!</h3>
            <p class="profit-amount">+$${profit.toLocaleString()}</p>

            <div class="equivalents">
                <p>This could buy:</p>
                ${equivalents.map(eq => `<p>• ${eq}</p>`).join('')}
            </div>

            <div class="sf90-progress">
                <p>🏎️ Road to SF90: <strong>${sf90Progress}%</strong></p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${sf90Progress}%"></div>
                </div>
            </div>

            <p class="popup-sub">
                💡 "Every profit brings you closer to Ferrari!"
            </p>

            <button class="popup-btn" id="close-trading-popup">Celebrate!</button>
        </div>
    `;

    document.body.appendChild(popup);

    popup.querySelector('#close-trading-popup').addEventListener('click', () => {
        popup.remove();
    });

    leekAudio?.success();
}

function showTradingLossPopup(loss) {
    const totalEarnings = parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0;
    const equivalentLosses = Math.floor(totalEarnings / loss);

    const popup = document.createElement('div');
    popup.className = 'leek-game-popup loss';
    popup.innerHTML = `
        <div class="popup-content">
            <h3>🤗 KEEP GOING!</h3>
            <p class="loss-amount">-$${loss.toLocaleString()}</p>
            <p>But don't worry!</p>

            <div class="perspective">
                <p>This is just:</p>
                <p>• One Omakase 🍣</p>
                <p>• Half a Uniqlo shirt 👕</p>
                <p>• 1/${Math.floor(600000 / loss)} of a Ferrari 🏎️</p>
            </div>

            <p class="popup-sub">
                💪 Remember: You've earned <strong>$${totalEarnings.toLocaleString()}</strong> in game!<br>
                That's <strong>${equivalentLosses} times</strong> this loss!
            </p>

            <button class="popup-btn" id="close-loss-popup">Play to Relax</button>
        </div>
    `;

    document.body.appendChild(popup);

    const playBtn = popup.querySelector('#close-loss-popup');
    playBtn.addEventListener('click', () => {
        popup.remove();
        startLeekJumpGame();
    });

    leekAudio?.petClick();
}

function calculateRealWorldEquivalents(amount) {
    const items = [
        { name: '猪脚饭', price: 5, emoji: '🍜' },
        { name: 'Big Mac', price: 5.5, emoji: '🍔' },
        { name: '优衣库', price: 200, emoji: '👕' },
        { name: 'AirPods Pro', price: 800, emoji: '🎧' },
        { name: 'MacBook Pro', price: 5000, emoji: '💻' },
        { name: 'Rolex Daytona', price: 25000, emoji: '⌚' }
    ];

    const equivalents = [];

    for (const item of items) {
        const qty = Math.floor(amount / item.price);
        if (qty > 0 && qty < 1000) {
            equivalents.push(`${qty} ${item.emoji} ${item.name}${qty > 1 ? 's' : ''}`);
        }
    }

    return equivalents.slice(0, 3);
}

// =====================================================
// HOOK INTO EXISTING TRADING SYSTEM
// =====================================================

// Override generateShareCard to show PNL popups
const originalGenerateShareCard = window.generateShareCard;
if (originalGenerateShareCard) {
    window.generateShareCard = function(rawText) {
        originalGenerateShareCard.call(this, rawText);

        // Parse PNL value
        const cleanText = rawText.replace(/[^\d.-]/g, '');
        const pnlValue = parseFloat(cleanText);

        if (!isNaN(pnlValue)) {
            setTimeout(() => {
                if (pnlValue > 0) {
                    showTradingProfitPopup(pnlValue);
                } else if (pnlValue < 0) {
                    showTradingLossPopup(Math.abs(pnlValue));
                }
            }, 500);
        }
    };
}

// =====================================================
// GAME OVER HANDLER
// =====================================================

// Hook into game over to save progress and check achievements
LeekJumpGame.prototype.gameOver = (function(original) {
    return function() {
        // Call original game over
        original.call(this);

        // Save session stats
        const today = new Date().toDateString();
        const sessionEarnings = this.score;

        // Update daily challenge
        updateDailyChallengeProgress(sessionEarnings);

        // Check achievements
        checkAchievements(this.score);

        // Show play count encouragement
        const sessions = parseInt(localStorage.getItem('leekJumpSessions')) || 1;
        if (sessions % 10 === 0) {
            showMilestonePopup(sessions);
        }
    };
})(LeekJumpGame.prototype.gameOver);

function showMilestonePopup(sessions) {
    const popup = document.createElement('div');
    popup.className = 'leek-game-popup milestone';
    popup.innerHTML = `
        <div class="popup-content">
            <h3>🌟 MILESTONE!</h3>
            <p>You've played <strong>${sessions} games!</strong></p>
            <p class="popup-sub">Thanks for being a loyal player! 🧢</p>
            <button class="popup-btn" id="close-milestone-popup">Thanks!</button>
        </div>
    `;

    document.body.appendChild(popup);

    popup.querySelector('#close-milestone-popup').addEventListener('click', () => {
        popup.remove();
    });

    leekAudio?.success();
}

// =====================================================
// ADD STYLES
// =====================================================

const gameStyles = document.createElement('style');
gameStyles.textContent = `
    .leek-casual-menu {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2147483648;
        animation: popupIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .casual-menu-content {
        background: linear-gradient(145deg, #2b2b2b 0%, #1a1a1a 100%);
        border: 4px solid #000;
        box-shadow: 12px 12px 0px rgba(0,0,0,0.8);
        padding: 20px;
        min-width: 320px;
        font-family: 'Pixelify Sans', monospace;
        position: relative;
    }

    .casual-menu-content::before {
        content: '';
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
        background-size: 4px 4px;
        pointer-events: none;
    }

    .casual-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 3px solid #00FF00;
        padding-bottom: 10px;
    }

    .casual-header h2 {
        color: #00FF00;
        font-size: 20px;
        margin: 0;
        text-transform: uppercase;
    }

    .close-btn {
        background: #ff0000;
        border: 3px solid #000;
        color: #fff;
        font-size: 18px;
        font-weight: bold;
        width: 32px;
        height: 32px;
        cursor: pointer;
        box-shadow: 2px 2px 0px #000;
        transition: all 0.1s;
    }

    .close-btn:hover {
        transform: scale(1.1);
    }

    .close-btn:active {
        transform: scale(0.95);
        box-shadow: inset 2px 2px 0px #000;
    }

    .casual-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
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
        transition: all 0.1s;
    }

    .casual-option:hover {
        background: #9f9f9f;
        transform: scale(1.02);
        box-shadow:
            inset -3px -3px 0px #3f3f3f,
            inset 3px 3px 0px #fff,
            0 0 15px rgba(0, 255, 0, 0.5);
    }

    .casual-option:active {
        background: #6f6f6f;
        transform: scale(0.98);
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

    .option-icon {
        font-size: 28px;
        flex-shrink: 0;
    }

    .option-text {
        flex-grow: 1;
        font-weight: bold;
        color: #fff;
        font-size: 16px;
        text-shadow: 1px 1px 0px #000;
    }

    .option-desc {
        display: block;
        font-size: 12px;
        color: #aaa;
        margin-top: 2px;
    }

    .option-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #FFA500;
        color: #000;
        font-size: 10px;
        font-weight: bold;
        padding: 4px 8px;
        border: 2px solid #000;
        animation: badgePulse 1s infinite;
    }

    @keyframes badgePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }

    .game-stats {
        background: rgba(0, 0, 0, 0.3);
        border: 2px solid #333;
        padding: 12px;
        border-radius: 8px;
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        font-size: 12px;
    }

    .stat-label {
        color: #aaa;
    }

    .stat-value {
        color: #00FF00;
        font-weight: bold;
    }

    .leek-game-popup {
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: linear-gradient(145deg, #2b2b2b 0%, #1a1a1a 100%);
        border: 4px solid #000;
        box-shadow: 12px 12px 0px rgba(0,0,0,0.8);
        padding: 20px;
        min-width: 300px;
        font-family: 'Pixelify Sans', monospace;
        z-index: 2147483649;
        animation: slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .leek-game-popup.trading {
        border-color: #00FF00;
    }

    .leek-game-popup.loss {
        border-color: #FF6B6B;
    }

    .leek-game-popup.success {
        border-color: #FFD700;
    }

    .popup-content {
        position: relative;
        z-index: 1;
    }

    .popup-content h3 {
        color: #00FF00;
        font-size: 18px;
        margin: 0 0 12px 0;
        text-transform: uppercase;
    }

    .profit-amount {
        font-size: 28px;
        font-weight: bold;
        color: #00FF00;
        text-align: center;
        margin: 16px 0;
    }

    .loss-amount {
        font-size: 28px;
        font-weight: bold;
        color: #FF6B6B;
        text-align: center;
        margin: 16px 0;
    }

    .equivalents, .perspective {
        background: rgba(0, 255, 0, 0.1);
        border: 2px solid #00FF00;
        padding: 12px;
        margin: 12px 0;
        border-radius: 8px;
        font-size: 13px;
        color: #fff;
    }

    .sf90-progress {
        margin: 16px 0;
    }

    .progress-bar {
        background: #000;
        border: 2px solid #00FF00;
        height: 20px;
        margin-top: 8px;
        position: relative;
    }

    .progress-fill {
        background: repeating-linear-gradient(
            90deg,
            #00FF00 0px,
            #00FF00 4px,
            #00cc00 4px,
            #00cc00 8px
        );
        height: 100%;
        transition: width 0.5s;
    }

    .popup-sub {
        font-size: 12px;
        color: #aaa;
        text-align: center;
        margin: 12px 0;
        line-height: 1.5;
    }

    .popup-btn {
        width: 100%;
        background: #9945FF;
        color: #fff;
        border: 3px solid #000;
        padding: 12px;
        font-family: 'Pixelify Sans', monospace;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 12px;
        box-shadow: 4px 4px 0px #000;
        transition: all 0.1s;
    }

    .popup-btn:hover {
        background: #b06bff;
        transform: translate(-2px, -2px);
        box-shadow: 6px 6px 0px #000;
    }

    .popup-btn:active {
        transform: translate(2px, 2px);
        box-shadow: 2px 2px 0px #000;
    }

    .leek-achievement-popup {
        position: fixed;
        top: 20px;
        right: -400px;
        background: linear-gradient(145deg, #2b2b2b 0%, #1a1a1a 100%);
        border: 4px solid #FFD700;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
        padding: 20px;
        min-width: 300px;
        font-family: 'Pixelify Sans', monospace;
        z-index: 2147483650;
        transition: right 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .leek-achievement-popup.show {
        right: 20px;
    }

    .achievement-content {
        text-align: center;
    }

    .achievement-icon {
        font-size: 48px;
        margin-bottom: 12px;
    }

    .achievement-content h3 {
        color: #FFD700;
        font-size: 14px;
        margin: 0 0 8px 0;
    }

    .achievement-content h4 {
        color: #fff;
        font-size: 18px;
        margin: 0 0 8px 0;
    }

    .achievement-content p {
        color: #aaa;
        font-size: 12px;
        margin: 0;
    }

    @keyframes popupIn {
        from {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

document.head.appendChild(gameStyles);

console.log('✅ Leek Jump Integration Loaded!');

// Export functions for global access
window.LeekJumpIntegration = {
    startGame: startLeekJumpGame,
    showTradingPopup: showTradingProfitPopup,
    showLossPopup: showTradingLossPopup,
    checkAchievements: checkAchievements
};
