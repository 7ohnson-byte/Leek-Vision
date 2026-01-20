// Degen Vision Popup Logic

document.addEventListener('DOMContentLoaded', () => {
  const coinSelect = document.getElementById('coin-select');

  // Load saved coin preference
  chrome.storage.sync.get(['selectedCoin'], (result) => {
    if (result.selectedCoin) {
      coinSelect.value = result.selectedCoin;
    }
  });

  // Save coin preference when changed
  coinSelect.addEventListener('change', () => {
    const selectedCoin = coinSelect.value;

    chrome.storage.sync.set({ selectedCoin }, () => {
      console.log('Coin preference saved:', selectedCoin);

      // Show a brief confirmation
      const confirmation = document.createElement('div');
      confirmation.className = 'confirmation';
      confirmation.textContent = `✓ Switched to ${selectedCoin}`;
      document.querySelector('.container').appendChild(confirmation);

      setTimeout(() => {
        confirmation.remove();
      }, 2000);
    });
  });
});
