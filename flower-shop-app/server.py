"""Flơr local server: serves the app and proxies image generation.

Pollinations blocks anonymous requests coming straight from a browser
("Missing Turnstile token"), so the browser calls /api/image here and this
server fetches the image server-side.

Run:  python server.py          then open http://localhost:8080
Optional env:
  CF_ACCOUNT_ID + CF_API_TOKEN  → Cloudflare Workers AI (free). Preferred. Uses FLUX.2 [dev] with the
                                  closest real Flơr photo as style reference; falls back to FLUX.1 schnell.
  CF_IMAGE_MODEL                → override model, e.g. @cf/black-forest-labs/flux-1-schnell
  POLLINATIONS_KEY=sk_...       → Pollinations FLUX without watermark.
  (none)                        → anonymous Pollinations: lighter model + watermark.
  PORT=8080
"""

import base64
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))

# Settings from flower-shop-app/.env (KEY=value per line); real environment variables win.
_env_file = os.path.join(ROOT, ".env")
if os.path.exists(_env_file):
    with open(_env_file, encoding="utf-8") as f:
        for line in f:
            name, sep, value = line.strip().partition("=")
            if sep and not name.startswith("#"):
                os.environ.setdefault(name.strip(), value.strip().strip('"'))

PORT = int(os.environ.get("PORT", "8080"))
KEY = os.environ.get("POLLINATIONS_KEY", "").strip()
CF_ACCOUNT = os.environ.get("CF_ACCOUNT_ID", "").strip()
CF_TOKEN = os.environ.get("CF_API_TOKEN", "").strip()


CF_MODEL = os.environ.get("CF_IMAGE_MODEL", "@cf/black-forest-labs/flux-2-dev").strip()
REF_PREFIX = (
    "Image 0 is a real bouquet made by our flower shop. Copy only its wrapping style, paper folding, ribbon, "
    "bouquet shape, framing and photo look. Do not copy its flowers or colors. Create a new bouquet: "
)


def _cf_call(model, data, content_type):
    url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT}/ai/run/{model}"
    req = urllib.request.Request(url, data=data, headers={"Authorization": f"Bearer {CF_TOKEN}", "Content-Type": content_type})
    try:
        with urllib.request.urlopen(req, timeout=150) as res:
            out = json.loads(res.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:500]
        print(f"[Cloudflare {e.code} {model}] {detail}")
        raise RuntimeError(f"Cloudflare {e.code}: {detail}") from None
    return base64.b64decode(out["result"]["image"]), "image/jpeg"


def _reference_jpeg(ref):
    """Load a portfolio photo from assets/ and shrink it under 512px, as FLUX.2 requires."""
    path = os.path.realpath(os.path.join(ROOT, "assets", ref or ""))
    if not ref or not path.startswith(os.path.realpath(os.path.join(ROOT, "assets"))) or not os.path.isfile(path):
        return None
    try:
        from io import BytesIO
        from PIL import Image
    except ImportError:
        return None
    im = Image.open(path).convert("RGB")
    im.thumbnail((511, 511))
    buf = BytesIO()
    im.save(buf, "JPEG", quality=88)
    return buf.getvalue()


def _multipart(fields, files):
    boundary = "----flor" + os.urandom(8).hex()
    out = b""
    for k, v in fields.items():
        out += f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    for k, (name, data) in files.items():
        out += f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"; filename="{name}"\r\nContent-Type: image/jpeg\r\n\r\n'.encode()
        out += data + b"\r\n"
    return out + f"--{boundary}--\r\n".encode(), f"multipart/form-data; boundary={boundary}"


def cloudflare(prompt, ref=None, width=768, height=1024):
    if "flux-2" in CF_MODEL:
        try:
            ref_img = _reference_jpeg(ref)
            fields = {"prompt": ((REF_PREFIX + prompt) if ref_img else prompt)[:2048], "width": width, "height": height}
            files = {"input_image_0": ("reference.jpg", ref_img)} if ref_img else {}
            return _cf_call(CF_MODEL, *_multipart(fields, files))
        except RuntimeError as e:
            print(f"[Cloudflare] {CF_MODEL} failed, falling back to FLUX.1 schnell: {e}")
    # FLUX.1 schnell: prompt + steps (max 8) only; square output.
    return _cf_call("@cf/black-forest-labs/flux-1-schnell", json.dumps({"prompt": prompt[:2048], "steps": 8}).encode(), "application/json")


def pollinations(prompt, seed, width, height):
    params = {"width": width, "height": height, "seed": seed, "model": "flux", "nologo": "true", "enhance": "false"}
    if KEY:
        params["key"] = KEY
        base = "https://gen.pollinations.ai/image/"
    else:
        base = "https://image.pollinations.ai/prompt/"
    url = base + urllib.parse.quote(prompt, safe="") + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "Flor-bouquet-app/1.0"})
    with urllib.request.urlopen(req, timeout=150) as res:
        return res.read(), res.headers.get("Content-Type", "image/jpeg")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_POST(self):
        if self.path != "/api/image":
            self.send_error(404)
            return
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
            prompt = str(body.get("prompt", ""))[:2000]
            if not prompt:
                raise ValueError("Missing prompt")
            seed = int(body.get("seed", 1))
            if CF_ACCOUNT and CF_TOKEN:
                data, ctype = cloudflare(prompt, body.get("ref"), int(body.get("width", 768)), int(body.get("height", 1024)))
            else:
                data, ctype = pollinations(prompt, seed, int(body.get("width", 768)), int(body.get("height", 1024)))
            if not ctype.startswith("image/"):
                raise ValueError("Provider returned " + ctype)
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:  # report provider errors to the browser console
            msg = f"Image generation failed: {e}".encode()
            # 429 = Cloudflare daily free allowance used up; the page shows a friendly message for it
            self.send_response(429 if "Cloudflare 429" in str(e) else 502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)


if __name__ == "__main__":
    provider = f"Cloudflare {CF_MODEL.rsplit('/', 1)[-1]}" if CF_ACCOUNT and CF_TOKEN else f"Pollinations {'with key' if KEY else 'anonymous (lower quality)'}"
    print(f"Flơr running at http://localhost:{PORT}  · images: {provider}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
