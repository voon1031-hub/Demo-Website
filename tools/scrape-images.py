"""Downloads every photo the scraped pages used, shrinks it, and saves it next to them.

    python3 tools/scrape-images.py [scrape-dir]

Reads the *.json files tools/scrape-site.mjs wrote, takes each <img> (the largest
srcset candidate too) and CSS background image, and saves it as WebP of at most
1400px in <scrape-dir>/img/, keeping transparency. <scrape-dir>/images.json maps
each original URL to its file, size and whether it has a transparent background.
"""
import hashlib
import io
import json
import pathlib
import sys
import urllib.parse
import urllib.request

from PIL import Image

out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "scrape")
(out / "img").mkdir(parents=True, exist_ok=True)
MAX_SIDE = 1400

urls = {}  # url -> where it was seen
for f in sorted(list(out.glob("*.json")) + list((out / "products").glob("*.json"))):
    if f.name in ("pages.json", "images.json"):
        continue
    page = json.loads(f.read_text())
    base = page.get("url", "")
    for img in page.get("imgs", []):
        if img.get("src"):
            urls.setdefault(img["src"], f.name)
        candidates = []
        for part in (img.get("srcset") or "").split(","):
            bits = part.strip().split()
            if not bits:
                continue
            size = 0
            if len(bits) > 1 and bits[1][:-1].replace(".", "").isdigit():
                size = float(bits[1][:-1])
            candidates.append((size, urllib.parse.urljoin(base, bits[0])))
        if candidates:
            urls.setdefault(max(candidates)[1], f.name)
    for bg in page.get("bgs", []):
        urls.setdefault(bg, f.name)

saved = {}
for url, seen_in in sorted(urls.items()):
    if not url.startswith("http") or url.endswith(".svg"):
        continue
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        data = urllib.request.urlopen(req, timeout=40).read()
        im = Image.open(io.BytesIO(data))
        im.load()
    except Exception as e:  # not an image, gone, or blocked
        saved[url] = {"error": str(e)[:200], "seen_in": seen_in}
        continue
    if im.width * im.height < 64 * 64:  # tracking pixels and icons
        continue
    orig = (im.width, im.height)
    alpha = im.mode in ("RGBA", "LA", "PA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if alpha else "RGB")
    if alpha:
        lo, _ = im.getchannel("A").getextrema()
        alpha = lo < 250  # an alpha channel that is fully opaque doesn't count
    im.thumbnail((MAX_SIDE, MAX_SIDE))
    name = hashlib.sha1(url.encode()).hexdigest()[:12] + ".webp"
    im.save(out / "img" / name, "WEBP", quality=84, method=6)
    saved[url] = {
        "file": f"img/{name}",
        "size": [im.width, im.height],
        "original": list(orig),
        "transparent": alpha,
        "seen_in": seen_in,
    }
    print(f"{name} {orig[0]}x{orig[1]} {'alpha' if alpha else ''} {url[:120]}")

(out / "images.json").write_text(json.dumps(saved, indent=1))
ok = sum(1 for v in saved.values() if "file" in v)
print(f"saved {ok} images, {len(saved) - ok} failed")
