// Flơr — app settings. Edit this file to switch image provider or tune pricing.
window.FLOR_CONFIG = {
  // "worker"       → POST to workerUrl. Use "/api/image" with server.py locally (proxies Pollinations),
  //                  or your Cloudflare Workers AI URL (FLUX.1 schnell) once deployed. Recommended.
  // "pollinations" → browser calls Pollinations directly. Only works with a key: anonymous browser
  //                  requests are rejected ("Missing Turnstile token").
  imageProvider: "worker",

  // "/api/image" (server.py) or e.g. "https://flor-image.yourname.workers.dev"
  workerUrl: "/api/image",

  pollinations: {
    model: "flux",
    // Optional key from https://enter.pollinations.ai — unlocks FLUX without watermark (uses gen.pollinations.ai).
    key: "",
  },

  imageWidth: 768,
  imageHeight: 1024,

  // Selling price formula derived from the Product portfolio sheet:
  //   normal season: price ≈ flower cost × 1.8 + 30.000đ (wrap, ribbon, labour)
  //   high season:   price = flower cost × 3 + 50.000đ (market prices triple around holidays)
  pricing: {
    normal: { mult: 1.8, add: 30000 },
    high: { mult: 3, add: 50000 },
  },

  budgetMin: 150000,
  budgetMax: 1500000,
  budgetDefault: 300000,
};
