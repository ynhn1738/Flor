// Flơr image worker — Cloudflare Workers AI, FLUX.1 [schnell].
// Free plan: 10,000 neurons/day (enough for a few hundred bouquet images/day).
// Deploy: see README.md in this folder.

const MODEL = "@cf/black-forest-labs/flux-1-schnell";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "*").split(",").map((s) => s.trim());
    const allowOrigin = allowed.includes("*") ? "*" : allowed.includes(origin) ? origin : "";
    const cors = {
      "Access-Control-Allow-Origin": allowOrigin || "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response("POST only", { status: 405, headers: cors });
    if (!allowOrigin) return new Response("Origin not allowed", { status: 403, headers: cors });

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad JSON", { status: 400, headers: cors });
    }
    const prompt = String(body.prompt || "").slice(0, 2000);
    if (!prompt) return new Response("Missing prompt", { status: 400, headers: cors });

    try {
      const out = await env.AI.run(MODEL, {
        prompt,
        steps: 8, // schnell max; best quality
        seed: Number.isFinite(body.seed) ? Math.abs(Math.floor(body.seed)) % 2147483647 : undefined,
      });
      const bytes = Uint8Array.from(atob(out.image), (c) => c.charCodeAt(0));
      return new Response(bytes, { headers: { ...cors, "Content-Type": "image/jpeg", "Cache-Control": "no-store" } });
    } catch (e) {
      return new Response("Generation failed: " + e.message, { status: 502, headers: cors });
    }
  },
};
