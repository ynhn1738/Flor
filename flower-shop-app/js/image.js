// Flơr — image providers. Returns a blob: URL so the order card can be exported as PNG.
window.FLOR_IMAGE = (() => {
  const C = window.FLOR_CONFIG;

  async function fetchWithTimeout(url, opts = {}, ms = 120000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) throw new Error("Not an image");
      return URL.createObjectURL(blob);
    } finally {
      clearTimeout(t);
    }
  }

  function pollinations(prompt, seed) {
    const p = C.pollinations;
    const q = new URLSearchParams({ width: C.imageWidth, height: C.imageHeight, seed, model: p.model, nologo: "true", enhance: "false" });
    if (p.key) {
      q.set("key", p.key);
      return fetchWithTimeout(`https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?${q}`);
    }
    return fetchWithTimeout(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${q}`);
  }

  function worker(prompt, seed, ref) {
    return fetchWithTimeout(C.workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, seed, ref, width: C.imageWidth, height: C.imageHeight }),
    });
  }

  // ref: portfolio photo path under assets/, sent to the server as a style reference (FLUX.2).
  async function generate(prompt, seed, ref) {
    const useWorker = C.imageProvider === "worker" && C.workerUrl;
    try {
      return await (useWorker ? worker(prompt, seed, ref) : pollinations(prompt, seed));
    } catch (e) {
      if (e.status === 429) throw e; // daily quota used up: retrying cannot help
      // One retry with a fresh seed; providers occasionally time out under load.
      console.warn("[Flor] image failed, retrying", e);
      const s2 = seed + 1;
      return useWorker ? worker(prompt, s2, ref) : pollinations(prompt, s2);
    }
  }

  return { generate };
})();
