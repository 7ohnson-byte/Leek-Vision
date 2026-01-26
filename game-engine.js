// ═══════════════════════════════════════════════════════════════════════════════
// LEEK JUMP: "THANKS CRYPTO" EDITION - GAME ENGINE
// 8-bit Pixel Style Platform Game
// ═══════════════════════════════════════════════════════════════════════════════

class LeekJumpGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.paused = false;
        this.score = 0; // In USD
        this.combo = 1;
        this.distance = 0;
        this.gameSpeed = 2;
        this.lastTime = 0;

        // Game entities
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.powerups = [];

        // Camera system
        this.cameraY = 0;
        this.targetCameraY = 0;

        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.highScore = parseInt(localStorage.getItem('leekJumpHighScore')) || 0;

        // Pixel art settings
        this.pixelSize = 4; // Each "pixel" is 4x4 real pixels
        this.gravity = 0.5;
        this.jumpForce = -10;

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Button areas for menu interaction
        this.skinsButtonArea = { x: 280, y: 50, width: 100, height: 35 };

        console.log('🎮 Leek Jump Engine Initialized');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════

    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.showMenu();
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }

    createCanvas() {
        // Create canvas with pixel-art-friendly size
        const width = 400;
        const height = 600;

        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border: 4px solid #00FF00;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
            z-index: 2147483648;
            background: #1a1a2e;
            display: none;
        `;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.container.appendChild(this.canvas);
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleInput();
            }
            // Left/Right movement
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                if (this.player) this.player.moveLeft = true;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                if (this.player) this.player.moveRight = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                if (this.player) this.player.moveLeft = false;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                if (this.player) this.player.moveRight = false;
            }
        });

        // Mouse/Touch controls
        this.canvas?.addEventListener('click', this.handleInput);
        this.canvas?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.gameState !== 'menu') {
                this.closeGame();
            }
        });

        // Handle resize
        window.addEventListener('resize', this.handleResize);
    }

    handleResize() {
        if (this.canvas && this.gameState !== 'menu') {
            const rect = this.canvas.getBoundingClientRect();
            // Keep game centered
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // GAME LOOP
    // ═══════════════════════════════════════════════════════════════════════════════

    gameLoop(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (this.running && !this.paused) {
            this.update(deltaTime);
            this.render();
        } else if (this.gameState === 'menu') {
            this.renderMenu();
        }

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        // Update player
        this.player.update(deltaTime);

        // Update camera to follow player
        // Camera target is player Y, but keep player in lower portion of screen
        this.targetCameraY = this.player.y - this.canvas.height * 0.6;
        if (this.targetCameraY < 0) this.targetCameraY = 0;

        // Smooth camera movement
        this.cameraY += (this.targetCameraY - this.cameraY) * 0.1;

        // Update platforms
        this.platforms.forEach(p => p.update(deltaTime, this.gameSpeed));

        // Update coins
        this.coins.forEach(c => c.update(deltaTime, this.gameSpeed));

        // Update enemies
        this.enemies.forEach(e => e.update(deltaTime, this.gameSpeed));

        // Update powerups
        this.powerups.forEach(p => p.update(deltaTime, this.gameSpeed));

        // Collision detection
        this.checkCollisions();

        // Remove off-screen entities (consider camera position)
        const bottomThreshold = this.cameraY + this.canvas.height + 50;
        this.platforms = this.platforms.filter(p => p.y < bottomThreshold);
        this.coins = this.coins.filter(c => c.y < bottomThreshold);
        this.enemies = this.enemies.filter(e => e.y < bottomThreshold);
        this.powerups = this.powerups.filter(p => p.y < bottomThreshold);

        // Spawn new entities
        this.spawnEntities();

        // Game over condition (consider camera position)
        if (this.player.y > this.cameraY + this.canvas.height) {
            this.gameOver();
        }

        // Increase difficulty
        this.gameSpeed = 2 + Math.floor(this.score / 500) * 0.5;
        if (this.gameSpeed > 8) this.gameSpeed = 8;
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw pixel grid background (scrolls with camera)
        this.drawPixelGrid();

        // Save context and apply camera offset
        this.ctx.save();
        this.ctx.translate(0, -this.cameraY);

        // Draw entities
        this.platforms.forEach(p => p.render(this.ctx));
        this.coins.forEach(c => c.render(this.ctx));
        this.powerups.forEach(p => p.render(this.ctx));
        this.enemies.forEach(e => e.render(this.ctx));
        this.player.render(this.ctx);

        // Restore context (for HUD)
        this.ctx.restore();

        // Draw HUD (on top, no camera offset)
        this.drawHUD();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INPUT HANDLING
    // ═══════════════════════════════════════════════════════════════════════════════

    handleInput(event) {
        if (this.gameState === 'playing') {
            if (this.player.grounded) {
                this.player.jump();
                leekAudio?.pixelPress();
            }
        } else if (this.gameState === 'menu') {
            // Check if click is on skins button
            if (event && event.clientX) {
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                // Scale coordinates if canvas is displayed at different size
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const canvasX = x * scaleX;
                const canvasY = y * scaleY;

                if (this.isInButtonArea(canvasX, canvasY, this.skinsButtonArea)) {
                    this.openSkinShowcase();
                    return;
                }
            }
            this.startGame();
        } else if (this.gameState === 'gameover') {
            this.restartGame();
        }
    }

    isInButtonArea(x, y, buttonArea) {
        return x >= buttonArea.x &&
               x <= buttonArea.x + buttonArea.width &&
               y >= buttonArea.y &&
               y <= buttonArea.y + buttonArea.height;
    }

    openSkinShowcase() {
        leekAudio?.click();
        const modal = document.createElement('div');
        modal.className = 'skin-showcase-modal';
        modal.innerHTML = `
            <div class="skin-showcase-content">
                <div class="skin-showcase-header">
                    <h1 class="skin-showcase-title">🎨 SKIN COLLECTION</h1>
                    <button class="close-btn" onclick="this.closest('.skin-showcase-modal').remove()">✖</button>
                </div>
                ${skinManager.generateSkinShowcaseHTML()}
            </div>
        `;
        document.body.appendChild(modal);

        // Setup filter listeners
        setTimeout(() => {
            const rarityFilter = document.getElementById('rarityFilter');
            const seriesFilter = document.getElementById('seriesFilter');
            const ownershipFilter = document.getElementById('ownershipFilter');
            const searchInput = document.getElementById('skinSearch');

            if (rarityFilter) rarityFilter.addEventListener('change', () => this.refreshSkinShowcase(modal));
            if (seriesFilter) seriesFilter.addEventListener('change', () => this.refreshSkinShowcase(modal));
            if (ownershipFilter) ownershipFilter.addEventListener('change', () => this.refreshSkinShowcase(modal));
            if (searchInput) searchInput.addEventListener('input', () => this.refreshSkinShowcase(modal));
        }, 100);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                leekAudio?.modalClose();
            }
        });
    }

    refreshSkinShowcase(modal) {
        const rarityFilter = document.getElementById('rarityFilter')?.value || 'All';
        const seriesFilter = document.getElementById('seriesFilter')?.value || 'All';
        const ownershipFilter = document.getElementById('ownershipFilter')?.value || 'all';
        const searchInput = document.getElementById('skinSearch')?.value || '';

        const criteria = {
            rarity: rarityFilter,
            series: seriesFilter,
            owned: ownershipFilter === 'owned' ? true : ownershipFilter === 'locked' ? false : undefined,
            search: searchInput
        };

        const showcaseContent = modal.querySelector('.skin-showcase-content');
        const newHTML = `
            <div class="skin-showcase-header">
                <h1 class="skin-showcase-title">🎨 SKIN COLLECTION</h1>
                <button class="close-btn" onclick="this.closest('.skin-showcase-modal').remove()">✖</button>
            </div>
            ${skinManager.generateSkinShowcaseHTML(criteria)}
        `;

        showcaseContent.innerHTML = newHTML;

        // Re-attach event listeners
        setTimeout(() => {
            const newRarityFilter = document.getElementById('rarityFilter');
            const newSeriesFilter = document.getElementById('seriesFilter');
            const newOwnershipFilter = document.getElementById('ownershipFilter');
            const newSearchInput = document.getElementById('skinSearch');

            if (newRarityFilter) newRarityFilter.value = rarityFilter;
            if (newSeriesFilter) newSeriesFilter.value = seriesFilter;
            if (newOwnershipFilter) newOwnershipFilter.value = ownershipFilter;
            if (newSearchInput) newSearchInput.value = searchInput;

            if (newRarityFilter) newRarityFilter.addEventListener('change', () => this.refreshSkinShowcase(modal));
            if (newSeriesFilter) newSeriesFilter.addEventListener('change', () => this.refreshSkinShowcase(modal));
            if (newOwnershipFilter) newOwnershipFilter.addEventListener('change', () => this.refreshSkinShowcase(modal));
            if (newSearchInput) newSearchInput.addEventListener('input', () => this.refreshSkinShowcase(modal));
        }, 100);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // GAME STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    showMenu() {
        this.gameState = 'menu';
        this.running = false;
        this.canvas.style.display = 'block';
        leekAudio?.modalOpen();
    }

    startGame() {
        this.gameState = 'playing';
        this.running = true;
        this.score = 0;
        this.combo = 1;
        this.distance = 0;
        this.gameSpeed = 2;

        // Initialize player
        this.player = new Player(100, 400);

        // Clear entities
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.powerups = [];

        // Create initial platforms
        for (let i = 0; i < 10; i++) {
            this.platforms.push(new Platform(
                Math.random() * 300,
                500 - i * 60,
                80
            ));
        }

        leekAudio?.success();
    }

    pauseGame() {
        this.paused = !this.paused;
    }

    gameOver() {
        this.gameState = 'gameover';
        this.running = false;

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('leekJumpHighScore', this.highScore);
        }

        // Save to total earnings
        const totalEarnings = parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0;
        localStorage.setItem('leekJumpTotalEarnings', totalEarnings + this.score);

        leekAudio?.modalClose();
    }

    restartGame() {
        this.startGame();
    }

    closeGame() {
        this.running = false;
        this.gameState = 'menu';
        this.canvas.style.display = 'none';
        leekAudio?.modalClose();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLLISION DETECTION
    // ═══════════════════════════════════════════════════════════════════════════════

    checkCollisions() {
        // Player vs Platforms
        this.player.grounded = false;
        this.platforms.forEach(platform => {
            if (this.player.checkPlatformCollision(platform)) {
                this.player.grounded = true;
                this.player.y = platform.y - this.player.height;
                this.player.velY = 0;

                // If on moving platform, add platform velocity to player
                if (platform.type === 'moving') {
                    this.player.onMovingPlatform = true;
                    this.player.platformVelX = platform.speed * platform.direction;
                    // Move player with platform
                    this.player.x += this.player.platformVelX;
                }

                // Bounce
                if (this.player.velY > 0) {
                    this.player.velY = -this.player.velY * 0.3;
                }
            }
        });

        // Player vs Coins
        this.coins = this.coins.filter(coin => {
            if (this.player.checkCollision(coin)) {
                const value = coin.value * this.combo;
                this.score += value;
                this.combo = Math.min(this.combo + 0.1, 5);
                leekAudio?.click();
                return false; // Remove coin
            }
            return true;
        });

        // Player vs Enemies
        this.enemies = this.enemies.filter(enemy => {
            if (this.player.checkCollision(enemy)) {
                if (this.player.invincible) {
                    return false; // Destroy enemy
                } else {
                    this.gameOver();
                    return true;
                }
            }
            return true;
        });

        // Player vs Powerups
        this.powerups = this.powerups.filter(powerup => {
            if (this.player.checkCollision(powerup)) {
                this.activatePowerup(powerup);
                leekAudio?.success();
                return false;
            }
            return true;
        });
    }

    activatePowerup(powerup) {
        switch (powerup.type) {
            case 'rocket':
                this.player.activateRocket();
                break;
            case 'shield':
                this.player.activateShield();
                break;
            case 'turbo':
                this.gameSpeed *= 2;
                setTimeout(() => { this.gameSpeed /= 2; }, 5000);
                break;
            case 'box':
                const bonus = Math.floor(Math.random() * 450) + 50;
                this.score += bonus;
                break;
            case 'gem':
                this.combo = 3;
                setTimeout(() => { this.combo = 1; }, 10000);
                break;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ENTITY SPAWNING
    // ═══════════════════════════════════════════════════════════════════════════════

    spawnEntities() {
        // Spawn platforms
        while (this.platforms.length < 10) {
            const lastPlatform = this.platforms[this.platforms.length - 1];
            const newY = lastPlatform.y - 50 - Math.random() * 30;
            const newX = Math.random() * (this.canvas.width - 80);

            this.platforms.push(new Platform(newX, newY, 60 + Math.random() * 40));

            // Spawn coins above platform
            if (Math.random() < 0.6) {
                const coinX = newX + 20 + Math.random() * 20;
                const coinY = newY - 30 - Math.random() * 20;

                if (Math.random() < 0.15) {
                    // Rare coin
                    this.coins.push(new Coin(coinX, coinY, 50));
                } else {
                    // Normal coin
                    this.coins.push(new Coin(coinX, coinY, 10));
                }
            }

            // Spawn enemies
            if (Math.random() < 0.2) {
                this.enemies.push(new Enemy(
                    newX + Math.random() * 40,
                    newY - 20
                ));
            }

            // Spawn powerups
            if (Math.random() < 0.05) {
                const types = ['rocket', 'shield', 'turbo', 'box', 'gem'];
                const type = types[Math.floor(Math.random() * types.length)];
                this.powerups.push(new Powerup(
                    newX + 20,
                    newY - 50,
                    type
                ));
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RENDERING HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    drawPixelGrid() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        const gridSize = this.pixelSize * 2;
        const startY = Math.floor(this.cameraY / gridSize) * gridSize;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            for (let y = startY; y < this.cameraY + this.canvas.height; y += gridSize) {
                this.ctx.fillRect(x, y - this.cameraY, this.pixelSize, this.pixelSize);
            }
        }
    }

    drawHUD() {
        // Score
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 20px "Pixelify Sans", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`💰 $${this.score}`, 20, 35);

        // Combo
        if (this.combo > 1) {
            this.ctx.fillStyle = '#FFA500';
            this.ctx.fillText(`🔥 x${this.combo.toFixed(1)}`, 20, 60);
        }

        // Height
        const height = Math.max(0, Math.floor((600 - this.player.y) / 10));
        this.ctx.fillStyle = '#9945FF';
        this.ctx.font = '14px "Pixelify Sans", monospace';
        this.ctx.fillText(`📏 ${height}m`, 20, 85);

        // High score
        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px "Pixelify Sans", monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Best: $${this.highScore}`, this.canvas.width - 20, 35);
    }

    renderMenu() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawPixelGrid();

        // Draw Skins Button
        this.drawButton(this.skinsButtonArea, '🎨 SKINS', '#FF6B6B', '#FF4444');

        // Title
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 32px "Pixelify Sans", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🧢 LEEK JUMP', this.canvas.width / 2, 150);

        this.ctx.fillStyle = '#9945FF';
        this.ctx.font = 'bold 16px "Pixelify Sans", monospace';
        this.ctx.fillText('"THANKS CRYPTO" EDITION', this.canvas.width / 2, 180);

        // High score
        this.ctx.fillStyle = '#FFA500';
        this.ctx.font = '14px "Pixelify Sans", monospace';
        this.ctx.fillText(`🏆 High Score: $${this.highScore}`, this.canvas.width / 2, 230);

        // Instructions
        this.ctx.fillStyle = '#888';
        this.ctx.font = '12px "Pixelify Sans", monospace';
        this.ctx.fillText('⬅️➡️ or A/D to Move', this.canvas.width / 2, 270);
        this.ctx.fillText('Space or Click to Jump', this.canvas.width / 2, 290);
        this.ctx.fillText('Collect 💰 +$10', this.canvas.width / 2, 315);
        this.ctx.fillText('Collect 💎 +$50 (Rare)', this.canvas.width / 2, 335);
        this.ctx.fillText('Avoid 🔴 FUD Monsters', this.canvas.width / 2, 355);
        this.ctx.fillText('Stand on blue platforms for a ride!', this.canvas.width / 2, 375);

        // Start prompt
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 16px "Pixelify Sans", monospace';

        // Blink effect
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            this.ctx.fillText('▶ PRESS TO START', this.canvas.width / 2, 420);
        }

        // SF90 progress
        const totalEarnings = parseFloat(localStorage.getItem('leekJumpTotalEarnings')) || 0;
        const progress = (totalEarnings / 600000 * 100).toFixed(2);

        this.ctx.fillStyle = '#666';
        this.ctx.font = '10px "Pixelify Sans", monospace';
        this.ctx.fillText(`🏎️ Road to SF90: ${progress}%`, this.canvas.width / 2, 500);
        this.ctx.fillText(`($${totalEarnings.toLocaleString()} / $600,000)`, this.canvas.width / 2, 515);
    }

    drawButton(buttonArea, text, bgColor, hoverColor) {
        // Button background
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height);

        // Button border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height);

        // Button text
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 11px "Pixelify Sans", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, buttonArea.x + buttonArea.width / 2, buttonArea.y + buttonArea.height / 2);
        this.ctx.textBaseline = 'alphabetic';
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME ENTITIES
// ═══════════════════════════════════════════════════════════════════════════════

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.velX = 0;
        this.velY = 0;
        this.grounded = false;
        this.invincible = false;
        this.rocketActive = false;
        this.shieldActive = false;
        this.facingRight = true;
        this.onMovingPlatform = false;
        this.platformVelX = 0;
        this.moveLeft = false;
        this.moveRight = false;
    }

    update(deltaTime) {
        // Apply gravity
        if (!this.rocketActive) {
            this.velY += 0.5;
        } else {
            this.velY = -8; // Rocket power
        }

        // Horizontal movement
        const acceleration = 0.5; // Reduced from 0.8 for better control
        const maxSpeed = 3.5; // Reduced from 5 for less sensitivity
        const friction = this.grounded ? 0.85 : 0.95; // Slightly more ground friction

        if (this.moveLeft) {
            this.velX -= acceleration;
            this.facingRight = false;
        }
        if (this.moveRight) {
            this.velX += acceleration;
            this.facingRight = true;
        }

        // Apply friction
        if (!this.moveLeft && !this.moveRight) {
            this.velX *= friction;
        }

        // Clamp velocity
        if (this.velX > maxSpeed) this.velX = maxSpeed;
        if (this.velX < -maxSpeed) this.velX = -maxSpeed;

        // Stop very small movements
        if (Math.abs(this.velX) < 0.1) this.velX = 0;

        // Add platform velocity if on moving platform
        if (this.onMovingPlatform && this.grounded) {
            this.velX += this.platformVelX;
        }

        // Update position
        this.x += this.velX;
        this.y += this.velY;

        // Keep player on screen horizontally
        if (this.x < 0) {
            this.x = 0;
            this.velX = 0;
        }
        if (this.x + this.width > 400) {
            this.x = 400 - this.width;
            this.velX = 0;
        }

        // Reset platform velocity
        this.platformVelX = 0;
        this.onMovingPlatform = false;
    }

    jump() {
        this.velY = -10;
        this.grounded = false;
    }

    activateRocket() {
        this.rocketActive = true;
        this.invincible = true;
        setTimeout(() => {
            this.rocketActive = false;
            this.invincible = false;
        }, 3000);
    }

    activateShield() {
        this.invincible = true;
        this.shieldActive = true;
        setTimeout(() => {
            this.invincible = false;
            this.shieldActive = false;
        }, 5000);
    }

    checkCollision(entity) {
        return (
            this.x < entity.x + entity.width &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y
        );
    }

    checkPlatformCollision(platform) {
        return (
            this.velY > 0 &&
            this.x + this.width > platform.x + 5 &&
            this.x < platform.x + platform.width - 5 &&
            this.y + this.height > platform.y &&
            this.y + this.height < platform.y + platform.height + 10
        );
    }

    render(ctx) {
        ctx.save();

        // Flip if facing left
        if (!this.facingRight) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
            ctx.translate(-this.x, -this.y);
        }

        // Shield effect
        if (this.shieldActive) {
            ctx.fillStyle = 'rgba(153, 69, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 24, 0, Math.PI * 2);
            ctx.fill();
        }

        // Rocket trail
        if (this.rocketActive) {
            ctx.fillStyle = '#FF6B6B';
            ctx.fillRect(this.x + 12, this.y + this.height, 8, 20);
        }

        // Draw pixel pet (cap)
        this.drawPixelPet(ctx);

        ctx.restore();
    }

    drawPixelPet(ctx) {
        const x = this.x;
        const y = this.y;

        // 🌿 Leek body (long green stem)
        ctx.fillStyle = '#228B22'; // Forest green
        // Main stem
        ctx.fillRect(x + 12, y + 4, 8, 24);
        // Leaves on top
        ctx.fillRect(x + 8, y + 2, 4, 8);
        ctx.fillRect(x + 20, y + 2, 4, 8);
        ctx.fillRect(x + 6, y + 4, 3, 6);
        ctx.fillRect(x + 23, y + 4, 3, 6);

        // White bottom part (leek characteristic)
        ctx.fillStyle = '#F5F5DC'; // Beige/white
        ctx.fillRect(x + 12, y + 20, 8, 10);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 10, y + 10, 4, 4);
        ctx.fillRect(x + 18, y + 10, 4, 4);

        // Eye highlights (cute effect)
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x + 11, y + 11, 2, 2);
        ctx.fillRect(x + 19, y + 11, 2, 2);

        // Smile
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 12, y + 16, 8, 2);

        // Leaf highlights
        ctx.fillStyle = 'rgba(144, 238, 144, 0.5)'; // Light green
        ctx.fillRect(x + 9, y + 3, 2, 6);
        ctx.fillRect(x + 21, y + 3, 2, 6);

        // Root lines at bottom
        ctx.fillStyle = '#DAA520'; // Golden root color
        ctx.fillRect(x + 13, y + 28, 2, 3);
        ctx.fillRect(x + 17, y + 28, 2, 3);
    }
}

class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 12;
        this.type = Math.random() < 0.1 ? 'moving' : 'static';
        this.direction = 1;
        this.speed = 1;
    }

    update(deltaTime, gameSpeed) {
        if (this.type === 'moving') {
            this.x += this.speed * this.direction;
            if (this.x <= 0 || this.x + this.width >= 400) {
                this.direction *= -1;
            }
        }
    }

    render(ctx) {
        // Platform body
        ctx.fillStyle = this.type === 'moving' ? '#4a9eff' : '#2a2a4a';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Platform top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(this.x, this.y, this.width, 2);

        // Pixel pattern
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 0; i < this.width; i += 8) {
            ctx.fillRect(this.x + i, this.y + 4, 4, 4);
        }
    }
}

class Coin {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.value = value;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update(deltaTime, gameSpeed) {
        this.bobOffset += deltaTime * 3;
    }

    render(ctx) {
        const bob = Math.sin(this.bobOffset) * 3;

        // Coin glow
        if (this.value > 10) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x + 8, this.y + 8 + bob, 12, 0, Math.PI * 2);
            ctx.fill();
        }

        // Coin body
        ctx.fillStyle = this.value > 10 ? '#FFD700' : '#FFA500';
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 8 + bob, 6, 0, Math.PI * 2);
        ctx.fill();

        // Coin shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y + 6 + bob, 2, 0, Math.PI * 2);
        ctx.fill();

        // Value label
        if (this.value > 10) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 10px "Pixelify Sans", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`$${this.value}`, this.x + 8, this.y - 5 + bob);
        }
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.patrolStart = x;
        this.patrolRange = 50;
        this.direction = 1;
        this.speed = 1.5;
    }

    update(deltaTime, gameSpeed) {
        this.x += this.speed * this.direction;

        if (this.x > this.patrolStart + this.patrolRange) {
            this.direction = -1;
        } else if (this.x < this.patrolStart - this.patrolRange) {
            this.direction = 1;
        }
    }

    render(ctx) {
        // FUD Monster body (red spiky)
        ctx.fillStyle = '#FF4444';

        // Spikes
        ctx.beginPath();
        ctx.moveTo(this.x + 12, this.y);
        ctx.lineTo(this.x + 8, this.y + 8);
        ctx.lineTo(this.x + 4, this.y);
        ctx.lineTo(this.x + 8, this.y + 8);
        ctx.lineTo(this.x, this.y + 12);
        ctx.lineTo(this.x + 8, this.y + 16);
        ctx.lineTo(this.x + 4, this.y + 24);
        ctx.lineTo(this.x + 12, this.y + 16);
        ctx.lineTo(this.x + 20, this.y + 24);
        ctx.lineTo(this.x + 16, this.y + 16);
        ctx.lineTo(this.x + 24, this.y + 12);
        ctx.lineTo(this.x + 16, this.y + 8);
        ctx.lineTo(this.x + 20, this.y);
        ctx.lineTo(this.x + 12, this.y + 8);
        ctx.fill();

        // Evil eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 8, this.y + 8, 3, 3);
        ctx.fillRect(this.x + 14, this.y + 8, 3, 3);

        // Angry mouth
        ctx.fillRect(this.x + 9, this.y + 14, 6, 2);
    }
}

class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.type = type;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update(deltaTime, gameSpeed) {
        this.bobOffset += deltaTime * 2;
    }

    render(ctx) {
        const bob = Math.sin(this.bobOffset) * 3;

        // Glow
        const colors = {
            rocket: '#FF6B6B',
            shield: '#9945FF',
            turbo: '#00BFFF',
            box: '#FFD700',
            gem: '#FF69B4'
        };

        ctx.fillStyle = colors[this.type] + '40';
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y + 12 + bob, 16, 0, Math.PI * 2);
        ctx.fill();

        // Icon
        const icons = {
            rocket: '🚀',
            shield: '🛡️',
            turbo: '⚡',
            box: '🎁',
            gem: '💎'
        };

        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(icons[this.type], this.x + 12, this.y + 16 + bob);
    }
}

console.log('✅ Leek Jump Game Engine Loaded');
