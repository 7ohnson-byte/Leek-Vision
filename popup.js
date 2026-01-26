// =====================================================
//   LEEK VISION - 韭菜眼镜
//   Scanner Settings Only
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  // =====================================================
  // UI ELEMENTS
  // =====================================================

  const enableExtension = document.getElementById('enable-extension');
  const showCents = document.getElementById('show-cents');
  const coinSelect = document.getElementById('coin-select');
  // NEW: 获取模式选择的单选按钮组
  const modeRadios = document.getElementsByName('op-mode');

  // =====================================================
  // LOAD SETTINGS
  // =====================================================
  
  // 加载时同时读取 'opMode'
  chrome.storage.sync.get(['extensionEnabled', 'showCents', 'selectedCoin', 'opMode'], (result) => {
    if (result.extensionEnabled !== undefined) {
      enableExtension.checked = result.extensionEnabled;
    }
    if (result.showCents !== undefined) {
      showCents.checked = result.showCents;
    }
    if (result.selectedCoin) {
      coinSelect.value = result.selectedCoin;
    }
    
    // NEW: 根据保存的设置选中对应的模式按钮
    if (result.opMode) {
      for (const radio of modeRadios) {
        if (radio.value === result.opMode) {
          radio.checked = true;
        }
      }
    }
  });

  // =====================================================
  // EVENT LISTENERS
  // =====================================================

  // NEW: 监听模式切换并保存
  modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        chrome.storage.sync.set({ opMode: radio.value }, () => {
          console.log('Mode switched:', radio.value);
          // 这里的提示稍微改了一下，让用户感知更强
          const modeName = radio.value === 'pro' ? 'PRO AGENT' : 'CASUAL';
          showConfirmation(`✓ MODE: ${modeName}`);
        });
      }
    });
  });

  // Save settings when changed
  enableExtension.addEventListener('change', () => {
    chrome.storage.sync.set({ extensionEnabled: enableExtension.checked }, () => {
      console.log('Extension enabled:', enableExtension.checked);
      showConfirmation(enableExtension.checked ? '✓ Extension Enabled' : '✓ Extension Disabled');
    });
  });

  showCents.addEventListener('change', () => {
    chrome.storage.sync.set({ showCents: showCents.checked }, () => {
      console.log('Show cents:', showCents.checked);
      showConfirmation('✓ Cents Setting Saved');
    });
  });

  coinSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ selectedCoin: coinSelect.value }, () => {
      console.log('Coin selected:', coinSelect.value);
      showConfirmation(`✓ Switched to ${coinSelect.value}`);
    });
  });

  // =====================================================
  // HELPER
  // =====================================================

  function showConfirmation(message) {
    const confirmation = document.createElement('div');
    confirmation.className = 'confirmation';
    confirmation.textContent = message;
    confirmation.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
      color: #0f0c29;
      padding: 12px 24px;
      border-radius: 0;
      font-size: 12px;
      font-weight: 900;
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
      letter-spacing: 2px;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
      animation: slideUp 0.3s ease;
      z-index: 10000;
    `;

    document.querySelector('.container').appendChild(confirmation);

    setTimeout(() => {
      confirmation.remove();
    }, 2000);
  }
});