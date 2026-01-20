<div align="center">
  <img src="icon.jpeg" width="600px" alt="Leek Vision Banner">
  </div>
# 🧢 Degen Vision

A satirical Chrome Extension that converts boring Fiat prices on websites into Crypto/Meme coin prices. No keys, just vibes.

## Features

- **Real-time Price Conversion**: Automatically detects prices on Amazon and converts them to your favorite cryptocurrency
- **Multiple Coin Support**: Switch between Solana (SOL), Dogecoin (DOGE), and Bitcoin (BTC)
- **Visual Badges**: Purple pill-shaped badges appear next to prices with the converted amount
- **Lightweight**: Minimal impact on page performance

## How It Works

1. The content script scans Amazon product pages for price elements
2. It extracts the USD price from Amazon's price structure
3. It converts the price using mock exchange rates:
   - 1 SOL = $150
   - 1 DOGE = $0.15
   - 1 BTC = $45,000
4. A purple badge appears next to the price showing the crypto equivalent

## Installation

### Step 1: Create Icon Files

The extension needs icon files. Create simple PNG icons in the `degen-vision` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

For a quick test, you can use any PNG files as placeholders (or use the emoji 🧢 as inspiration).

### Step 2: Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click the "Load unpacked" button
4. Select the `degen-vision` folder
5. The extension should now appear in your extensions list!

### Step 3: Test It Out

1. Visit any Amazon product page (e.g., https://www.amazon.com)
2. You should see purple badges next to prices showing the crypto equivalent
3. Click the extension icon to change the base coin (SOL/DOGE/BTC)

## Project Structure

```
degen-vision/
├── manifest.json       # Extension configuration (Manifest V3)
├── content.js          # Content script that runs on Amazon pages
├── popup.html          # Popup UI for settings
├── popup.js            # Popup logic
├── popup.css           # Popup styling
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension icon (128x128)
└── README.md           # This file
```

## Development Notes

### Mock Rates

Currently using hardcoded conversion rates for simplicity. Future improvements:
- Fetch real-time prices from a price API (CoinGecko, CoinMarketCap)
- Allow users to set custom conversion rates
- Support more cryptocurrencies

### Target Sites

Currently only supports Amazon.com. The extension can be extended to:
- Other e-commerce sites (eBay, Walmart, etc.)
- News sites showing financial data
- Any website with price information

### Content Script Logic

The extension targets Amazon's specific price structure:
- `.a-price-whole` - The whole dollar amount
- `.a-price-fraction` - The cents
- `.a-price-symbol` - The currency symbol

The badge is appended next to the price using inline styles to ensure it works on any page.

## Troubleshooting

**Badges not appearing?**
- Make sure you're on amazon.com (not another country's Amazon)
- Refresh the page after installing
- Check the browser console for errors

**Coin selection not saving?**
- Check that the extension has "storage" permission
- Try reloading the extension from chrome://extensions/

## Future Enhancements

- [ ] Add real-time price API integration
- [ ] Support for more e-commerce sites
- [ ] Custom coin options
- [ ] Price history charts
- [ ] Multi-currency support (EUR, GBP, etc.)
- [ ] Humor mode (convert to bananas, hours worked, etc.)

## License

MIT License - Feel free to modify and distribute!

## Credits

Built with ❤️ and 🧢 by degens, for degens.
