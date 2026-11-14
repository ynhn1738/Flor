// Flơr image endpoint for Cloudflare Pages: POST /api/image → FLUX.1 [schnell] on Workers AI.
// The page calls the same address it uses locally with server.py, so js/config.js needs no change.
// Needs a Workers AI binding named "AI": Pages project → Settings → Bindings → Add → Workers AI.

const MODEL = "@cf/black-forest-labs/flux-1-schnell";

export async function onRequestPost({ request, env }) {
  if (!env.AI) return text("Workers AI binding \"AI\" is not set up for this Pages project", 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return text("Bad JSON", 400);
  }
  const prompt = String(body.prompt || "").slice(0, 2000);
  if (!prompt) return text("Missing prompt", 400);

  try {
    const out = await env.AI.run(MODEL, {
      prompt,
      steps: 8, // schnell max; best quality
      seed: Number.isFinite(body.seed) ? Math.abs(Math.floor(body.seed)) % 2147483647 : undefined,
    });
    const bytes = Uint8Array.from(atob(out.image), (c) => c.charCodeAt(0));
    return new Response(bytes, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" } });
  } catch (e) {
    const msg = String(e && e.message);
    // 429 tells the page the free daily allowance is used up, so it shows its friendly message
    return text("Image generation failed: " + msg, /429|limit|quota|neuron/i.test(msg) ? 429 : 502);
  }
}

function text(msg, status) {
  return new Response(msg, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
