<!-- vibegrow:auto:quick-readme-polish -->
## VibeGrow Auto Task (2026-04-06)
- Owner: @7ohnson-byte
- Focus: Polish the README opening section
- Action: Update README intro and setup commands
- Issue: N/A

<div align="center">
  <img src="images/icon.jpeg" alt="Leek Vision Logo" width="120" height="120">
  <h1>🧢 Leek Vision | 韭菜眼镜</h1>
  
  <p>
    <b>Web3 Native Browser Extension for Degens</b>
  </p>
  <p>
    Turn boring fiat prices into Crypto/Meme coins & Analyze projects with AI Agent.
    <br>
    戴上韭菜眼镜，万物皆可币本位。
  </p>

  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square">
  <img src="https://img.shields.io/badge/AI-Powered-purple?style=flat-square">
  <img src="https://img.shields.io/badge/Solana-Ready-green?style=flat-square">
</div>

<br>

## ✨ Features (功能亮点)

### 1. 🛒 Fiat to Crypto Converter (万物币本位)
Automatically scans shopping websites (Amazon, Taobao, eBay, etc.) and converts fiat prices (USD, CNY, etc.) into your favorite crypto assets.
* **Supported Assets:** SOL, BTC, ETH, BNB.
* **Real-time Prices:** Fetches live data via CoinGecko API.
* **Visual Modes:** Supports both "Ghost Mode" (floating tag) and "Flow Mode" (inline text) to adapt to different site layouts.

![Price Conversion Demo](screenshots/demo_price.png)
*(Replace with your screenshot showing price tags)*

### 2. 🧠 Leek Brain Agent (AI 研报助手)
A powerful AI agent powered by **Surf.ai** that provides instant, structured analysis for any crypto project.
* **One-Click Analysis:** Click the "Leek Pet" on your screen.
* **Deep Insights:** Generates "Mini-Reports" covering **Core Utility**, **Backers/Signals**, and **Risk Verdict**.
* **Smooth UI:** Features a resizable, cyberpunk-styled chat interface.

![AI Agent Demo](screenshots/demo_agent.png)
*(Replace with your screenshot: image_57058e.jpg)*

### 3. 👾 Interactive Leek Pet (电子宠物)
* A pixel-art companion that lives on your browser.
* Click to interact: In "Casual Mode" it runs away; in "Pro Mode" it summons the AI Agent.

---

## 🛠 Installation (安装指南)

Since this extension is in Developer Preview, you need to load it manually. It's safe and easy!

### 1. Download the Source Code
- Click the green **Code** button above and select **Download ZIP**.
- Unzip the file to a folder on your computer (e.g., `Leek-Vision-Main`).

### 2. Load into Browser

#### 🟢 For Google Chrome / Brave
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Toggle **Developer mode** (开发者模式) in the top right corner.
3.  Click **Load unpacked** (加载已解压的扩展程序).
4.  Select the folder you just unzipped.
5.  Done! The 🧢 icon should appear in your toolbar.

#### 🔵 For Microsoft Edge
1.  Open Edge and navigate to `edge://extensions/`.
2.  Toggle **Developer mode** in the left sidebar (or bottom left).
3.  Click **Load unpacked**.
4.  Select the folder.

---

## ⚙️ How to Use (使用说明)

1.  **Click the Extension Icon** to open the Settings Menu.
2.  **Select Mode:**
    * 🎮 **CASUAL:** Just for fun. The pet runs around.
    * 🧠 **PRO AGENT:** Enables the AI Chat features.
3.  **Select Base Coin:** Choose which crypto (e.g., SOL) you want to see prices in.
4.  **Browse:** Go to Amazon, Taobao, or Twitter. You will see price tags converted!
5.  **Analyze:** In Pro Mode, click the pet, type a project name (e.g., "Trends.fun"), and get an instant report.

---

## 💻 For Developers (Backend Setup)

> **Note:** The default extension uses a public Cloudflare Worker endpoint. For high-volume usage or personal customization, please deploy your own backend.

This project uses a **Cloudflare Worker** to securely proxy requests to Surf.ai (OpenAI compatible) and handle CORS.

### 1. Deploy Worker
Copy the code from `worker.js` (create this file in your repo if you want to share the worker code) to your Cloudflare Worker.

### 2. Set Environment Variables
In Cloudflare Dashboard > Settings > Variables:
* `SURF_API_KEY`: Your Surf.ai / OpenAI API Key.

### 3. Connect Extension
Update `background.js` in the extension:
```javascript
const CLOUDFLARE_WORKER_URL = "YOUR_WORKER_URL_HERE";