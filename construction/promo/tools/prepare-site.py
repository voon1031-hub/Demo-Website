"""Copy the construction site into <out-dir>, ready for frame-exact capture.

usage: python3 prepare-site.py <construction-dir> <out-dir>

Two changes to the copy's index.html: scrolling is instant (the capture
timeline supplies the smoothness), and window.__render / window.__framesReady
let capture.js draw the hero for the current scroll position on demand.
"""
import pathlib
import shutil
import sys

src, out = map(pathlib.Path, sys.argv[1:3])
if out.exists():
    shutil.rmtree(out)
shutil.copytree(src, out, ignore=shutil.ignore_patterns("promo"))

page = out / "index.html"
html = page.read_text(encoding="utf-8")
ease = """    if (reduce.matches || Math.abs(d) < 0.0004) cur = target;
    else cur += d * 0.18;"""
request = "  function request() { if (!raf) raf = requestAnimationFrame(tick); }"
if ease not in html or request not in html:
    sys.exit("index.html no longer matches; update prepare-site.py")
html = html.replace(ease, "    cur = target;")
html = html.replace(request, request + """
  window.__render = () => { measure(); cur = target; draw(); gauge(cur); };
  window.__framesReady = () => count > 0 && Array.prototype.every.call(ok, Boolean);""")
page.write_text(html, encoding="utf-8")
print("prepared", out)
