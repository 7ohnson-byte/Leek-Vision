// ═══════════════════════════════════════════════════════════════════════════════
// LEEK VISION - 8-BIT AUDIO ENGINE
// 使用 Web Audio API 生成复古游戏音效，无需外部音频文件
// ═══════════════════════════════════════════════════════════════════════════════

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.3; // 默认音量 30%
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // 设置音量 (0.0 - 1.0)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // 切换静音
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // 通用的音调生成器
    playTone(frequency, duration, type = 'square', volume = null) {
        if (!this.enabled) return;
        this.init();

        const ctx = this.ctx;
        const vol = volume !== null ? volume : this.volume;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(vol, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 音效库 (8-bit 风格)
    // ═══════════════════════════════════════════════════════════════════════════════

    // 1️⃣ 按钮悬停 (轻微的上升音)
    hover() {
        this.playTone(440, 0.05, 'square', this.volume * 0.3);
    }

    // 2️⃣ 按钮点击 (清脆的确认音)
    click() {
        if (!this.enabled) return;
        this.init();

        const ctx = this.ctx;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    // 3️⃣ 像素按键按下 (Minecraft 风格)
    pixelPress() {
        if (!this.enabled) return;
        this.init();

        const ctx = this.ctx;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);

        gainNode.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
    }

    // 4️⃣ 模态框打开 (上升滑音)
    modalOpen() {
        if (!this.enabled) return;
        this.init();

        const ctx = this.ctx;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);

        gainNode.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }

    // 5️⃣ 模态框关闭 (下降滑音)
    modalClose() {
        if (!this.enabled) return;
        this.init();

        const ctx = this.ctx;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);

        gainNode.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }

    // 6️⃣ 宠物点击 (可爱的跳跃音)
    petClick() {
        if (!this.enabled) return;
        this.init();

        const ctx = this.ctx;
        const now = ctx.currentTime;

        // 双音调效果
        [523, 659].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'square';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(this.volume * 0.4, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.1);

            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.1);
        });
    }

    // 7️⃣ 宠物开始移动 (引擎声)
    petRun() {
        if (!this.enabled) return;
        this.init();

        const ctx = this.ctx;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.3);

        gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    }

    // 8️⃣ 成功/切换 (悦耳的三连音)
    success() {
        if (!this.enabled) return;
        this.init();

        const ctx = this.ctx;
        const now = ctx.currentTime;

        [523, 659, 784].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'square';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(this.volume * 0.3, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);

            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.15);
        });
    }

    // 9️⃣ AI 消息接收 (科技感音效)
    aiMessage() {
        if (!this.enabled) return;
        this.init();

        const ctx = this.ctx;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

        gainNode.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }

    // 🔟 分享/截图 (相机快门音)
    screenshot() {
        if (!this.enabled) return;
        this.init();

        const ctx = this.ctx;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(2000, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

        gainNode.gain.setValueAtTime(this.volume * 0.6, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
    }

    // 1️⃣1️⃣ 错误/失败 (低沉音)
    error() {
        if (!this.enabled) return;
        this.init();

        const ctx = this.ctx;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);

        gainNode.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 全局单例
// ═══════════════════════════════════════════════════════════════════════════════
const leekAudio = new AudioEngine();

// 自动初始化（需要用户交互后才能真正播放）
document.addEventListener('click', () => leekAudio.init(), { once: true });
document.addEventListener('keydown', () => leekAudio.init(), { once: true });

console.log('🎵 Leek Audio Engine Loaded');
