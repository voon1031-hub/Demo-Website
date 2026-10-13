"""Cuts the Chinese display font down to the characters the site uses.

    python3 tools/subset-cjk-font.py

ZCOOL XiaoWei has about 7,000 characters (6 MB). The site only shows a few dozen,
so this keeps just the Chinese characters found in index.html and menu.js and
writes assets/fonts/zcool-xiaowei.woff2 (about 50 KB). Run it again after adding
or changing Chinese text, such as a dish's Chinese name in the menu data. Needs fonttools and
brotli (pip install fonttools brotli); the full font is downloaded from the Google
Fonts repository the first time and cached in tools/.cache/.
"""
import pathlib
import re
import urllib.request

from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = "https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolxiaowei/ZCOOLXiaoWei-Regular.ttf"
cache = ROOT / "tools" / ".cache" / "ZCOOLXiaoWei-Regular.ttf"
out = ROOT / "assets" / "fonts" / "zcool-xiaowei.woff2"

if not cache.exists():
    cache.parent.mkdir(parents=True, exist_ok=True)
    print("downloading", SOURCE)
    urllib.request.urlretrieve(SOURCE, cache)

text = "".join((ROOT / f).read_text(encoding="utf-8") for f in ("index.html", "menu.js"))
chars = sorted(set(re.findall(r"[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uff01-\uff5e]", text)))

options = subset.Options()
options.flavor = "woff2"
options.layout_features = ["*"]
options.name_IDs = ["*"]
options.notdef_outline = True
font = subset.load_font(str(cache), options)
subsetter = subset.Subsetter(options)
subsetter.populate(text="".join(chars))
subsetter.subset(font)
subset.save_font(font, str(out), options)
print(f"{len(chars)} characters -> {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
print("".join(chars))
