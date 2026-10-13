"""Prepares a dish photo for the menu.

    python3 tools/prepare-photo.py <photo> <name>

Takes a photo of a plate (best with the background removed, as a PNG with
transparency), trims the empty edges, and writes two WebP files:
  assets/menu/<name>.webp     up to 640px wide, for the dish's close-up
  assets/menu/<name>-sm.webp  192x192 square, for the menu list
Then set  photo: "<name>"  on the dish in menu.js. Needs Pillow (pip install pillow).
"""
import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent


def prepare(src, name):
    out = ROOT / "assets" / "menu"
    out.mkdir(parents=True, exist_ok=True)
    im = Image.open(src)
    im = im.convert("RGBA")
    alpha = im.getchannel("A")
    box = alpha.point(lambda v: 255 if v > 16 else 0).getbbox() or (0, 0, im.width, im.height)
    pad = 6
    box = (max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad))
    im = im.crop(box)

    big = im.copy()
    big.thumbnail((640, 640), Image.LANCZOS)
    big.save(out / f"{name}.webp", "WEBP", quality=82, method=6)

    small = im.copy()
    small.thumbnail((184, 184), Image.LANCZOS)
    square = Image.new("RGBA", (192, 192), (0, 0, 0, 0))
    square.paste(small, ((192 - small.width) // 2, (192 - small.height) // 2), small)
    square.save(out / f"{name}-sm.webp", "WEBP", quality=80, method=6)
    return big.size


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    w, h = prepare(sys.argv[1], sys.argv[2])
    print(f"assets/menu/{sys.argv[2]}.webp {w}x{h} and -sm.webp")
