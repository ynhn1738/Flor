# Flơr — AI bouquet designer

Customers describe the receiver (occasion, budget, delivery date, gender, age, date of birth → zodiac, MBTI, favourite colours and flowers, flowers to avoid, wrapping paper, card message). The app then:

1. Builds a bouquet recipe using only flowers Flơr buys at Chợ Đầm Sen / Chợ Hồ Thị Kỷ, sized to the budget with the shop's own pricing formula (normal season ≈ flower cost × 1.8 + 30k; high season = flower cost × 3 + 50k).
2. Explains why the bouquet fits: occasion, zodiac, MBTI and preferences.
3. Generates a realistic AI photo of that exact recipe.
4. Exports an order card (PNG) with logo, recipe, reference price, nearest catalog model (F101–F305) and shop contacts. Customers save it or share it, then send it to Flơr on Zalo.

## Run locally

No build step. Start the bundled server; it serves the app and generates images at `/api/image`:

```
cd flower-shop-app
python server.py
```

Open http://localhost:8080. Do not use a plain static server: Pollinations rejects image requests sent straight from a browser (`Missing Turnstile token`), so images must go through `server.py` or the Cloudflare worker.

### Open it on your phone

With the phone on the same Wi-Fi as the computer, start the server with `HOST=0.0.0.0`:

```
HOST=0.0.0.0 ./start.command
```

It prints an address like `http://192.168.1.20:8080`; open that in Safari on the phone. The first time, macOS may ask whether to allow incoming connections for Python: choose Allow. Anyone on the same Wi-Fi can open the app while it runs this way. Saving the order card works; the Zalo "Share" button still needs the HTTPS site.

For realistic FLUX images, give the server free Cloudflare credentials (PowerShell):

```
$env:CF_ACCOUNT_ID = "your-account-id"
$env:CF_API_TOKEN  = "your-api-token"
python server.py
```

To get them: sign up free at dash.cloudflare.com → Workers AI → "Use REST API". Copy the Account ID and create an API token with the "Workers AI" permission. Without them, the server uses anonymous Pollinations: lower quality and a small watermark. Mobile "Share" (sending the card straight to Zalo) needs HTTPS, so it only appears once the site is deployed.

## Files

| File | Purpose |
|---|---|
| `js/config.js` | Image provider, worker URL, pricing formula, budget range |
| `js/data.js` | Flowers + unit costs, colours, wrapping papers, occasions, high-season dates, zodiac, MBTI, catalog, shop contacts |
| `js/engine.js` | Recipe composer and image prompt builder |
| `js/image.js` | Image providers (Pollinations or Cloudflare worker) |
| `js/app.js` | Wizard, result card, PNG export and share |
| `worker/` | Free Cloudflare Workers AI backend (FLUX.1 schnell) |

When market prices change, edit `unit` in `FLOWERS` and `GREENS` in `data.js`. When the catalog changes, edit `CATALOG`.

## Image AI options (all free)

| Option | Quality | Setup | Free limit |
|---|---|---|---|
| **Cloudflare Workers AI, FLUX.1 [schnell]** (recommended) | Good, realistic | Free Cloudflare account + deploy the worker (5 min) | 10,000 neurons/day, a few hundred images/day |
| Pollinations without a key (current default) | Fair; uses a lighter model and adds a small watermark | None | Rate limited |
| Pollinations with a key from enter.pollinations.ai | Good (FLUX) | Sign up, paste the key into `config.js` | Small free allowance |
| Hugging Face Inference, FLUX.1 schnell | Good | Free token, needs your own backend to hide it | Small monthly credits |

### Deploy the Cloudflare worker

```
npm install -g wrangler
cd flower-shop-app/worker
wrangler login
wrangler deploy
```

Copy the printed URL (e.g. `https://flor-image.<you>.workers.dev`) into `js/config.js`:

```js
imageProvider: "worker",
workerUrl: "https://flor-image.<you>.workers.dev",
```

After you publish the site, set `ALLOWED_ORIGINS` in `wrangler.toml` to your domain so other sites cannot use your quota.

### Host the site for free (Cloudflare Pages)

Cloudflare Pages hosts the site and, through `functions/api/image.js`, generates images with Workers AI at the same `/api/image` address, so `js/config.js` needs no change and no separate worker.

1. dash.cloudflare.com → Workers & Pages → Create → Pages → Import an existing Git repository → pick `Flor`.
2. Framework preset: None. Build command: empty. Build output directory: `.`. Root directory: `flower-shop-app`.
3. After the first deploy: Settings → Bindings → Add → Workers AI, variable name `AI`. Then Deployments → Retry deployment.

Every push to `main` redeploys the site. Pages uses FLUX.1 schnell; the FLUX.2 reference-photo mode only runs in `server.py`.

## Real bouquet photos (main image)

The results page shows the 3 real Flơr bouquets closest to the recipe, taken from `js/portfolio.js` (Instagram @florinsaigon export + catalog photos). The AI sketch is optional (the "Bản phác AI" tile).

To add a new bouquet: save the photo into `assets/instagram/`, then add one line to `js/portfolio.js` with its flowers, colours, wrap and occasions (ids from `js/data.js`). Strip location data first: Instagram exports include GPS coordinates in photo metadata.
