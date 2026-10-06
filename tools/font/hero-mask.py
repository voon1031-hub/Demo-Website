"""Draws the hero headline as outlines for the video that plays inside it.

Writes assets/hero-type.svg: "MADE TO" over "DISAPPEAR" in OWN TONE Display,
set the way the page sets the hero headline (kerning on, tracking -0.024em,
line height 0.82em), trimmed to the letters. The page uses it as a mask: the
video shows only inside the letters. The full stop is left out of the mask;
it is the red dot, and this script prints where it sits so the CSS can place it.

Run after changing the font:  python3 tools/font/hero-mask.py
Needs: pip install fonttools
"""
import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, "owntone-display.otf")
OUT = os.path.join(HERE, "..", "..", "assets", "hero-type.svg")
LINES = ["MADE TO", "DISAPPEAR."]
TRACKING = -0.024   # em, as .d-hero
LEADING = 0.82      # em, as .d-hero


def pair_kern(gpos, left, right):
    """X-advance adjustment for a glyph pair from the GPOS pair lookups."""
    for lookup in gpos.LookupList.Lookup:
        if lookup.LookupType != 2:
            continue
        for st in lookup.SubTable:
            glyphs = st.Coverage.glyphs
            if left not in glyphs:
                continue
            if st.Format == 1:
                for rec in st.PairSet[glyphs.index(left)].PairValueRecord:
                    if rec.SecondGlyph == right:
                        return getattr(rec.Value1, "XAdvance", 0) or 0
                continue          # not in this subtable: the next one may have it
            c1 = st.ClassDef1.classDefs.get(left, 0)
            c2 = st.ClassDef2.classDefs.get(right, 0)
            return getattr(st.Class1Record[c1].Class2Record[c2].Value1, "XAdvance", 0) or 0
    return 0


def main():
    font = TTFont(FONT)
    upm = font["head"].unitsPerEm
    cmap, hmtx, gs = font.getBestCmap(), font["hmtx"], font.getGlyphSet()
    gpos = font["GPOS"].table if "GPOS" in font else None
    track = TRACKING * upm
    placed = []      # (glyph name, x, baseline)
    for n, line in enumerate(LINES):
        names = [cmap[ord(ch)] for ch in line]
        x, base = 0.0, n * LEADING * upm
        for i, g in enumerate(names):
            placed.append((g, x, base))
            x += hmtx[g][0] + track
            if gpos and i + 1 < len(names):
                x += pair_kern(gpos, g, names[i + 1])

    # bounds of everything but spaces, in SVG coordinates (y down)
    boxes = []
    for g, x, base in placed:
        bp = BoundsPen(gs)
        gs[g].draw(bp)
        if bp.bounds:
            x0, y0, x1, y1 = bp.bounds
            boxes.append((g, x + x0, base - y1, x + x1, base - y0))
    left = min(b[1] for b in boxes)
    top = min(b[2] for b in boxes)
    right = max(b[3] for b in boxes)
    bottom = max(b[4] for b in boxes)
    w, h = right - left, bottom - top

    pen = SVGPathPen(gs)
    for g, x, base in placed:
        if g in ("space", "period"):
            continue
        gs[g].draw(TransformPen(pen, (1, 0, 0, -1, x - left, base - top)))
    d = pen.getCommands()
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d">'
           '<path d="%s"/></svg>\n') % (round(w), round(h), d)
    with open(OUT, "w") as f:
        f.write(svg)

    dot = [b for b in boxes if b[0] == "period"][-1]
    print("wrote %s (%d x %d units, %.1f KB)" % (os.path.relpath(OUT), w, h, len(svg) / 1024))
    print("aspect-ratio: %d / %d" % (round(w), round(h)))
    print("dot: left %.3f%%  top %.3f%%  width %.3f%%" % (
        100 * (dot[1] - left) / w, 100 * (dot[2] - top) / h, 100 * (dot[3] - dot[1]) / w))
    for g, x, base in placed:
        print("  %-7s x=%8.2f line=%d" % (g, x, round(base / (LEADING * upm))))


if __name__ == "__main__":
    main()
