// ═══════════════════════════════════════════════════════════════════════════════
// LEEK VISION - BACKGROUND SERVICE
// Role: Proxy requests to Cloudflare Worker & External APIs (Solves CORS & Hides Keys)
// ═══════════════════════════════════════════════════════════════════════════════

// 你的 Cloudflare Worker 地址
const CLOUDFLARE_WORKER_URL = "https://leek-vision-api.sausagevilleson.workers.dev/";

// 🟢 新增：币价 API 地址 (CoinGecko)
const PRICES_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum,binancecoin&vs_currencies=usd';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  // =========================================================
  // 🟢 任务 1: 获取实时币价 (解决跨域问题)
  // =========================================================
  if (request.action === "getPrices") {
    fetch(PRICES_API_URL)
      .then(response => {
        if (!response.ok) throw new Error('Price API Network Error');
        return response.json();
      })
      .then(data => {
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        console.error("Price Fetch Error:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持异步消息通道开启
  }

  // =========================================================
  // 🔵 任务 2: AI Agent 问答 (通过 Cloudflare)
  // =========================================================
  if (request.action === "askAgent") {
    console.log(`📡 Sending query to Cloudflare: "${request.query}"`);

    fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: request.query })
    })
    .then(response => {
      if (!response.ok) throw new Error(`Cloudflare Error: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log("✅ Agent replied:", data);
      
      let replyText = "Agent error: No content.";
      if (data.choices && data.choices[0] && data.choices[0].message) {
        replyText = data.choices[0].message.content;
      } else if (data.reply) { 
        replyText = data.reply;
      }

      sendResponse({ success: true, data: replyText });
    })
    .catch(error => {
      console.error("❌ Agent Failed:", error);
      sendResponse({ success: false, error: error.message });
    });

    return true; // 保持异步消息通道开启
  }
});