// ═══════════════════════════════════════════════════════════════════════════════
// LEEK VISION v3.12 - 音效 + Minecraft 按键增强版
// 这个文件需要放在 content.js 之后加载
// ═══════════════════════════════════════════════════════════════════════════════

console.log('🎵 Loading Leek Vision Audio & UI Enhancements...');

// =====================================================
// 1. 重写币种选择函数 - Minecraft 按键版
// =====================================================

// 保存原始的 createDropdown 函数
const originalCreateDropdown = window.createDropdown;

// 新的 Minecraft 按键选择器
window.createPixelSelector = function(badge) {
    // 关闭现有的选择器
    const existing = document.getElementById('leek-pixel-selector');
    if (existing) {
        existing.remove();
        leekAudio?.modalClose();
        return;
    }

    // 播放打开音效
    leekAudio?.modalOpen();

    const selector = document.createElement('div');
    selector.id = 'leek-pixel-selector';
    selector.className = 'degen-pixel-selector';

    const rect = badge.getBoundingClientRect();
    selector.style.top = (rect.bottom + 12) + 'px';
    selector.style.left = rect.left + 'px';

    // 构建 HTML
    selector.innerHTML = `
        <div class="pixel-corner-decoration tl"></div>
        <div class="pixel-corner-decoration tr"></div>
        <div class="pixel-corner-decoration bl"></div>
        <div class="pixel-corner-decoration br"></div>

        <div class="pixel-close-btn" id="pixel-close-btn">✖</div>

        <div class="pixel-selector-header">
            ⛏️ SELECT COIN
        </div>

        <div class="pixel-coin-grid">
            <div class="pixel-coin-btn ${currentCurrency === 'SOL' ? 'selected' : ''}" data-coin="SOL">
                <span class="pixel-coin-icon">🧢</span>
                <span class="pixel-coin-name">SOL</span>
            </div>
            <div class="pixel-coin-btn ${currentCurrency === 'BTC' ? 'selected' : ''}" data-coin="BTC">
                <span class="pixel-coin-icon">₿</span>
                <span class="pixel-coin-name">BTC</span>
            </div>
            <div class="pixel-coin-btn ${currentCurrency === 'ETH' ? 'selected' : ''}" data-coin="ETH">
                <span class="pixel-coin-icon">Ξ</span>
                <span class="pixel-coin-name">ETH</span>
            </div>
            <div class="pixel-coin-btn ${currentCurrency === 'BNB' ? 'selected' : ''}" data-coin="BNB">
                <span class="pixel-coin-icon">🔶</span>
                <span class="pixel-coin-name">BNB</span>
            </div>
        </div>

        <div class="pixel-volume-control">
            <span class="pixel-volume-icon">🔊</span>
            <div class="pixel-volume-slider" id="pixel-volume-slider">
                <div class="pixel-volume-fill" style="width: 30%"></div>
                <div class="pixel-volume-knob" style="left: 30%"></div>
            </div>
        </div>
    `;

    document.body.appendChild(selector);

    // 触发动画
    requestAnimationFrame(() => {
        selector.classList.add('visible');
    });

    // 事件监听
    setupPixelSelectorEvents(selector, badge);
};

// 设置按键事件
function setupPixelSelectorEvents(selector, badge) {
    // 币种按键点击
    const coinButtons = selector.querySelectorAll('.pixel-coin-btn');
    coinButtons.forEach(btn => {
        const coin = btn.dataset.coin;

        // Hover 音效
        btn.addEventListener('mouseenter', () => {
            leekAudio?.hover();
        });

        // Click 音效 + 切换
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            // 按下效果
            btn.classList.add('pressed');
            setTimeout(() => btn.classList.remove('pressed'), 100);

            // 播放音效
            leekAudio?.pixelPress();

            // 切换币种
            if (coin !== currentCurrency) {
                handleCurrencySwitch(coin);
                chrome.storage.sync.set({ selectedCoin: coin });

                // 更新选中状态
                coinButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                // 成功音效
                setTimeout(() => leekAudio?.success(), 200);
            }

            // 延迟关闭
            setTimeout(() => {
                selector.classList.remove('visible');
                setTimeout(() => selector.remove(), 200);
                leekAudio?.modalClose();
            }, 300);
        });
    });

    // 关闭按钮
    const closeBtn = selector.querySelector('#pixel-close-btn');
    closeBtn.addEventListener('mouseenter', () => leekAudio?.hover());
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        leekAudio?.modalClose();
        selector.classList.remove('visible');
        setTimeout(() => selector.remove(), 200);
    });

    // 音量控制
    const volumeSlider = selector.querySelector('#pixel-volume-slider');
    const volumeFill = selector.querySelector('.pixel-volume-fill');
    const volumeKnob = selector.querySelector('.pixel-volume-knob');
    let isDragging = false;

    volumeSlider.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateVolume(e);
        leekAudio?.click();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateVolume(e);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            leekAudio?.click();
        }
    });

    function updateVolume(e) {
        const rect = volumeSlider.getBoundingClientRect();
        let percent = ((e.clientX - rect.left) / rect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));

        volumeFill.style.width = percent + '%';
        volumeKnob.style.left = percent + '%';

        if (leekAudio) {
            leekAudio.setVolume(percent / 100);
        }
    }
}

// =====================================================
// 2. 增强原始函数 - 添加音效
// =====================================================

// 增强币种标签点击
const originalCreateBadge = window.createBadge;
if (originalCreateBadge) {
    window.createBadge = function(usdPrice) {
        const badge = originalCreateBadge.call(this, usdPrice);

        // 添加 hover 音效
        badge.addEventListener('mouseenter', () => {
            leekAudio?.hover();
        });

        // 替换点击事件
        const originalClick = badge.onclick;
        badge.onclick = (e) => {
            leekAudio?.click();
            window.createPixelSelector(badge);
        };

        return badge;
    };
}

// 增强宠物点击
const originalOnPetClick = window.onPetClick;
if (originalOnPetClick) {
    window.onPetClick = function() {
        leekAudio?.petClick();
        originalOnPetClick.call(this);

        // 如果是 Casual 模式，宠物开始跑动时播放音效
        if (operationMode === 'casual') {
            setTimeout(() => leekAudio?.petRun(), 100);
        }
    };
}

// 增强晒单按钮
const originalInjectShareButton = window.injectShareButton;
if (originalInjectShareButton) {
    window.injectShareButton = function(targetEl, rawText) {
        originalInjectShareButton.call(this, targetEl, rawText);

        const btn = targetEl.querySelector('.leek-share-btn');
        if (btn) {
            // Hover 音效
            btn.addEventListener('mouseenter', () => {
                leekAudio?.hover();
            });

            // Click 音效
            const originalClick = btn.onclick;
            btn.onclick = (e) => {
                leekAudio?.click();
                originalClick.call(btn, e);
            };
        }
    };
}

// 增强模态框打开/关闭
const originalGenerateShareCard = window.generateShareCard;
if (originalGenerateShareCard) {
    window.generateShareCard = function(rawText) {
        originalGenerateShareCard.call(this, rawText);

        const modal = document.getElementById('leek-share-modal');
        if (modal) {
            // 模态框打开音效
            leekAudio?.modalOpen();

            // 关闭按钮音效
            const closeBtn = modal.querySelector('#close-share-btn');
            if (closeBtn) {
                closeBtn.addEventListener('mouseenter', () => leekAudio?.hover());
                closeBtn.addEventListener('click', () => {
                    leekAudio?.modalClose();
                });
            }

            // 左右切换箭头音效
            const arrows = modal.querySelectorAll('.nav-arrow');
            arrows.forEach(arrow => {
                arrow.addEventListener('mouseenter', () => leekAudio?.hover());
                arrow.addEventListener('click', () => leekAudio?.pixelPress());
            });

            // Share 按钮音效
            const shareBtn = modal.querySelector('.share-btn');
            if (shareBtn) {
                shareBtn.addEventListener('mouseenter', () => leekAudio?.hover());
                shareBtn.addEventListener('click', () => {
                    leekAudio?.screenshot();
                });
            }
        }
    };
}

// 增强 AI 对话框
const originalToggleAgentChat = window.toggleAgentChat;
if (originalToggleAgentChat) {
    window.toggleAgentChat = function() {
        const wasOpen = isChatOpen;
        originalToggleAgentChat.call(this);

        if (!wasOpen) {
            leekAudio?.modalOpen();
        } else {
            leekAudio?.modalClose();
        }
    };
}

// 增强消息添加
const originalAddMessage = window.addMessage;
if (originalAddMessage) {
    window.addMessage = function(html, type) {
        const msgId = originalAddMessage.call(this, html, type);

        // AI 消息接收音效
        if (type === 'ai') {
            leekAudio?.aiMessage();
        }

        return msgId;
    };
}

// 增强 AI 发送按钮
document.addEventListener('DOMContentLoaded', () => {
    // 延迟绑定，等待对话框创建
    setTimeout(() => {
        const dialog = document.getElementById('leek-agent-dialog');
        if (dialog) {
            const sendBtn = dialog.querySelector('.agent-send-btn');
            if (sendBtn) {
                sendBtn.addEventListener('mouseenter', () => leekAudio?.hover());
                sendBtn.addEventListener('click', () => leekAudio?.click());
            }
        }
    }, 1000);
});

// =====================================================
// 3. 全局音效快捷键
// =====================================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + M 切换静音
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        if (leekAudio) {
            const enabled = leekAudio.toggle();
            console.log(`🔊 Audio ${enabled ? 'Enabled' : 'Muted'}`);

            // 显示提示
            const toast = document.createElement('div');
            toast.textContent = `🔊 ${enabled ? 'Sound ON' : 'Sound OFF'}`;
            toast.style.cssText = `
                position: fixed;
                bottom: 140px;
                right: 20px;
                background: #000;
                color: #00FF00;
                padding: 8px 16px;
                border: 2px solid #00FF00;
                font-family: 'Pixelify Sans', monospace;
                font-size: 12px;
                z-index: 999999;
                animation: fadeIn 0.2s;
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 1500);
        }
    }
});

// =====================================================
// 4. 键盘导航支持
// =====================================================
document.addEventListener('keydown', (e) => {
    const selector = document.getElementById('leek-pixel-selector');
    if (!selector || !selector.classList.contains('visible')) return;

    const buttons = Array.from(selector.querySelectorAll('.pixel-coin-btn'));
    const currentIndex = buttons.findIndex(btn => btn.classList.contains('selected'));

    // 数字键 1-4 快速切换
    if (e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < buttons.length) {
            buttons[index].click();
        }
    }

    // ESC 关闭
    if (e.key === 'Escape') {
        e.preventDefault();
        const closeBtn = selector.querySelector('#pixel-close-btn');
        if (closeBtn) closeBtn.click();
    }

    // 方向键切换
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % buttons.length;
        buttons[nextIndex].click();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        buttons[prevIndex].click();
    }
});

console.log('✅ Leek Vision Audio & UI Enhancements Loaded!');
