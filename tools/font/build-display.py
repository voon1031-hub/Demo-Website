#!/usr/bin/env python3
"""Builds OWN TONE Display, the site's headline face, from plain geometry.

A wide, heavy geometric sans: capitals, figures and the punctuation the site
uses. Every round part is a true circle or ellipse, and the dots of . : ; ! ?
are perfect circles so a page can colour them like shade swatches. The zero
is a pill, the same shape as the buttons. Lowercase letters map to the
capitals, so the face always sets in caps.

    python3 tools/font/build-display.py
        -> assets/fonts/owntone-display.woff2 (and .otf next to this script)

Needs: pip install fonttools skia-pathops brotli
"""
import math
from pathlib import Path

import pathops
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
OUT_WOFF2 = ROOT / "assets/fonts/owntone-display.woff2"
OUT_OTF = Path(__file__).resolve().parent / "owntone-display.otf"

UPM = 1000
CAP = 720            # cap height
OV = 14              # overshoot of round shapes above CAP and below 0
V = 184              # vertical stem
H = 156              # horizontal bar
T = 172              # diagonal stroke, measured square to the stroke
DOT = 106            # radius of every dot
K = 0.5522847498     # circle-to-cubic constant


# ---------------------------------------------------------------- primitives

def ellipse(cx, cy, rx, ry):
    p = pathops.Path()
    p.moveTo(cx + rx, cy)
    p.cubicTo(cx + rx, cy + ry * K, cx + rx * K, cy + ry, cx, cy + ry)
    p.cubicTo(cx - rx * K, cy + ry, cx - rx, cy + ry * K, cx - rx, cy)
    p.cubicTo(cx - rx, cy - ry * K, cx - rx * K, cy - ry, cx, cy - ry)
    p.cubicTo(cx + rx * K, cy - ry, cx + rx, cy - ry * K, cx + rx, cy)
    p.close()
    return p


def circle(cx, cy, r):
    return ellipse(cx, cy, r, r)


def poly(*pts):
    p = pathops.Path()
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    p.close()
    return p


def rect(x0, y0, x1, y1):
    return poly((x0, y0), (x1, y0), (x1, y1), (x0, y1))


def union(*paths):
    out = paths[0]
    for p in paths[1:]:
        out = pathops.op(out, p, pathops.PathOp.UNION)
    return out


def minus(a, *paths):
    for p in paths:
        a = pathops.op(a, p, pathops.PathOp.DIFFERENCE)
    return a


def clip(a, b):
    return pathops.op(a, b, pathops.PathOp.INTERSECTION)


def wedge(cx, cy, a0, a1, far=4000):
    """Pie slice from angle a0 to a1 (degrees, counter-clockwise)."""
    steps = max(2, int(abs(a1 - a0) / 20) + 2)
    pts = [(cx, cy)]
    for i in range(steps + 1):
        a = math.radians(a0 + (a1 - a0) * i / steps)
        pts.append((cx + far * math.cos(a), cy + far * math.sin(a)))
    return poly(*pts)


def ering(cx, cy, rx, ry, tx, ty):
    """Elliptical ring: tx is the side thickness, ty the top/bottom thickness."""
    return minus(ellipse(cx, cy, rx, ry), ellipse(cx, cy, rx - tx, ry - ty))


def arc(cx, cy, rx, ry, tx, ty, a0, a1):
    return clip(ering(cx, cy, rx, ry, tx, ty), wedge(cx, cy, a0, a1))


def diag(x0, y0, x1, y1, t=T):
    """Straight stroke with level ends; (x0,y0)-(x1,y1) is its centre line."""
    dx, dy = x1 - x0, y1 - y0
    w = t * math.hypot(dx, dy) / abs(dy) / 2
    return poly((x0 - w, y0), (x0 + w, y0), (x1 + w, y1), (x1 - w, y1))


def band(x0, y0, x1, y1, t=T, extend=0):
    """Straight stroke with square ends, t thick, centre line (x0,y0)-(x1,y1),
    optionally extended past both ends (for strokes that are clipped later)."""
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy)
    ux, uy = dx / n, dy / n
    x0, y0, x1, y1 = x0 - ux * extend, y0 - uy * extend, x1 + ux * extend, y1 + uy * extend
    nx, ny = -uy * t / 2, ux * t / 2
    return poly((x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny))


def below_line(x0, y0, x1, y1, far=4000):
    """Everything below the infinite line through (x0,y0) and (x1,y1)."""
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy)
    ux, uy = dx / n, dy / n
    a = (x0 - ux * far, y0 - uy * far)
    b = (x0 + ux * far, y0 + uy * far)
    lo = min(a[1], b[1]) - far
    return poly(a, b, (b[0], lo), (a[0], lo))


def vee(xc, y_point, y_open, half_open, bottom, t=T):
    """Two legs meeting in a flat vertex `bottom` wide at y_point, spreading to
    +-half_open at y_open. Used for V, Y and (upside down) A."""
    dx = half_open - bottom / 2
    dy = abs(y_open - y_point)
    w = t * math.hypot(dx, dy) / dy
    left = poly((xc - bottom / 2, y_point), (xc - bottom / 2 + w, y_point),
                (xc - half_open + w, y_open), (xc - half_open, y_open))
    right = poly((xc + bottom / 2 - w, y_point), (xc + bottom / 2, y_point),
                 (xc + half_open, y_open), (xc + half_open - w, y_open))
    hull = poly((xc - bottom / 2, y_point), (xc + bottom / 2, y_point),
                (xc + half_open, y_open), (xc - half_open, y_open))
    return clip(union(left, right), hull)


def bowl(x_right, y0, y1, k=1.25, stem_left=0):
    """D-shaped bowl attached to a stem: flat on the left, round on the right.
    k stretches the round side so the counter stays open at this weight."""
    r = (y1 - y0) / 2
    rx = r * k
    cy = (y0 + y1) / 2
    cx = x_right - rx
    outer = union(rect(stem_left, y0, cx, y1), ellipse(cx, cy, rx, r))
    inner = union(rect(stem_left + V, y0 + H, cx, y1 - H), ellipse(cx, cy, rx - V, r - H))
    return minus(outer, inner)


def vpill(x0, y0, x1, y1):
    r = (x1 - x0) / 2
    return union(rect(x0, y0 + r, x1, y1 - r), circle(x0 + r, y0 + r, r), circle(x0 + r, y1 - r, r))


def moved(p, dx=0, dy=0):
    return p.transform(1, 0, 0, 1, dx, dy)


def turned(p, w, h=CAP):
    """Rotate 180 degrees inside a w x h box."""
    return p.transform(-1, 0, 0, -1, w, h)


# ---------------------------------------------------------------- glyphs
# Each entry: name -> (unicode values, builder, left bearing, right bearing).
# Builders draw with the shape's left edge at x = 0.

GLYPHS = {}


def glyph(name, codes, lsb=44, rsb=44):
    def register(fn):
        GLYPHS[name] = (codes, fn, lsb, rsb)
        return fn
    return register


R_O = (CAP + 2 * OV) / 2          # 374: radius of O
RING = 190                        # stroke of the round letters


def letter_O():
    return ering(R_O, CAP / 2, R_O, R_O, RING, RING)


@glyph("A", [0x41], 14, 14)
def _A():
    w = 840
    legs = turned(vee(w / 2, 0, CAP, w / 2, 250), w)
    hull = poly((0, 0), (w / 2 - 125, CAP), (w / 2 + 125, CAP), (w, 0))
    bar = clip(rect(0, 176, w, 176 + H), hull)
    return union(legs, bar)


@glyph("B", [0x42])
def _B():
    return union(rect(0, 0, V, CAP), bowl(612, 294, CAP), bowl(668, 0, 294 + H))


@glyph("C", [0x43], 28, 10)
def _C():
    return minus(letter_O(), wedge(R_O, CAP / 2, -42, 42))


@glyph("D", [0x44], 44, 28)
def _D():
    return union(rect(0, 0, V, CAP), bowl(780, 0, CAP, 1.06))


@glyph("E", [0x45], 44, 30)
def _E():
    return union(rect(0, 0, V, CAP), rect(0, CAP - H, 616, CAP),
                 rect(0, 368 - H / 2, 580, 368 + H / 2), rect(0, 0, 632, H))


@glyph("F", [0x46], 44, 24)
def _F():
    return union(rect(0, 0, V, CAP), rect(0, CAP - H, 612, CAP),
                 rect(0, 350 - H / 2, 566, 350 + H / 2))


@glyph("G", [0x47], 28, 34)
def _G():
    ring = minus(letter_O(), wedge(R_O, CAP / 2, 2, 50))
    bar = clip(rect(R_O + 6, 290, 2 * R_O, 290 + H), circle(R_O, CAP / 2, R_O))
    return union(ring, bar)


@glyph("H", [0x48])
def _H():
    w = 780
    return union(rect(0, 0, V, CAP), rect(w - V, 0, w, CAP), rect(0, 372 - H / 2, w, 372 + H / 2))


@glyph("I", [0x49])
def _I():
    return rect(0, 0, V, CAP)


@glyph("J", [0x4A], 18, 44)
def _J():
    w, r = 620, 310
    cy = r - OV
    hook = clip(ering(w - r, cy, r, r, V, H), rect(-10, -100, w + 10, cy))
    return union(rect(w - V, cy, w, CAP), hook)


@glyph("K", [0x4B], 44, 8)
def _K():
    w = 770
    top = (w - 104, CAP)
    foot = (40, 96)
    arm = clip(diag(foot[0], foot[1], top[0], top[1], T), rect(0, 0, w, CAP))
    # upper edge of the arm, used to bury the top of the leg inside the arm
    dx, dy = top[0] - foot[0], top[1] - foot[1]
    half = T * math.hypot(dx, dy) / dy / 2
    edge = below_line(foot[0] - half, foot[1], top[0] - half, top[1])
    leg = clip(diag(352, 560, w - 108, 0, 184), edge)
    return union(rect(0, 0, V, CAP), arm, clip(leg, rect(0, 0, w, CAP)))


@glyph("L", [0x4C], 44, 16)
def _L():
    return union(rect(0, 0, V, CAP), rect(0, 0, 590, H))


@glyph("M", [0x4D])
def _M():
    w = 960
    left = diag(110, CAP, w / 2, 0, 166)
    right = diag(w - 110, CAP, w / 2, 0, 166)
    return union(rect(0, 0, V, CAP), rect(w - V, 0, w, CAP), clip(union(left, right), rect(0, 0, w, CAP)))


@glyph("N", [0x4E])
def _N():
    w = 800
    d = diag(V / 2 + 40, CAP, w - V / 2 - 40, 0, 184)
    return union(rect(0, 0, V, CAP), rect(w - V, 0, w, CAP), clip(d, rect(0, 0, w, CAP)))


@glyph("O", [0x4F], 28, 28)
def _O():
    return letter_O()


@glyph("P", [0x50], 44, 24)
def _P():
    return union(rect(0, 0, V, CAP), bowl(690, 262, CAP))


@glyph("Q", [0x51], 28, 14)
def _Q():
    tail = diag(R_O + 120, 150, R_O + 340, -160, 184)
    return union(letter_O(), tail)


@glyph("R", [0x52], 44, 8)
def _R():
    leg = diag(390, 300, 672, 0, 186)
    return union(rect(0, 0, V, CAP), bowl(690, 262, CAP), leg)


@glyph("S", [0x53], 24, 24)
def _S():
    cx = 346
    ryT, ryB = 220, 232
    cyT, cyB = CAP + OV - ryT, -OV + ryB
    top = arc(cx, cyT, 326, ryT, RING, H, 26, 274)
    bottom = arc(cx, cyB, 346, ryB, RING, H, -154, 94)
    return union(top, bottom)


@glyph("T", [0x54], 12, 12)
def _T():
    w = 700
    return union(rect(0, CAP - H, w, CAP), rect(w / 2 - V / 2, 0, w / 2 + V / 2, CAP))


@glyph("U", [0x55])
def _U():
    w, r = 770, 385
    cy = r - OV
    bowl_ = clip(minus(circle(w / 2, cy, r), ellipse(w / 2, cy, r - V, r - H)), rect(-10, -100, w + 10, cy))
    return union(rect(0, cy, V, CAP), rect(w - V, cy, w, CAP), bowl_)


@glyph("V", [0x56], 8, 8)
def _V():
    w = 840
    return vee(w / 2, 0, CAP, w / 2, 250)


@glyph("W", [0x57], 8, 8)
def _W():
    w = 1200
    v1, v2 = 326, w - 326
    s = [diag(92, CAP, v1, 0, 164), diag(w / 2, CAP, v1, 0, 164),
         diag(w / 2, CAP, v2, 0, 164), diag(w - 92, CAP, v2, 0, 164)]
    return clip(union(*s), rect(0, 0, w, CAP))


@glyph("X", [0x58], 8, 8)
def _X():
    w = 820
    a = diag(110, CAP, w - 110, 0, 176)
    b = diag(w - 110, CAP, 110, 0, 176)
    return clip(union(a, b), rect(0, 0, w, CAP))


@glyph("Y", [0x59], 8, 8)
def _Y():
    w = 830
    arms = vee(w / 2, 310, CAP, w / 2, V)
    return union(arms, rect(w / 2 - V / 2, 0, w / 2 + V / 2, 330))


@glyph("Z", [0x5A], 24, 24)
def _Z():
    w = 680
    right, t = w - 10, 180
    # place the diagonal so its corners land exactly on the bar ends
    half = 120
    for _ in range(8):
        dx = right - 2 * half
        half = t * math.hypot(dx, CAP - 2 * H) / (CAP - 2 * H) / 2
    d = diag(right - half, CAP - H, half, H, t)
    return union(rect(16, CAP - H, right, CAP), rect(0, 0, w, H), d)


# ------------------------------------------------------------------ figures

@glyph("zero", [0x30], 32, 32)
def _zero():
    w = 610
    return minus(vpill(0, -OV, w, CAP + OV), vpill(V, -OV + H, w - V, CAP + OV - H))


@glyph("one", [0x31], 24, 44)
def _one():
    x = 180
    flag = poly((x, CAP), (x, CAP - 200), (0, CAP - 335), (0, CAP - 135))
    return union(rect(x, 0, x + V, CAP), flag)


@glyph("two", [0x32], 24, 24)
def _two():
    w = 640
    cx, rx, ry = w / 2, w / 2, 268
    cy = CAP + OV - ry
    a0 = -50
    top = arc(cx, cy, rx, ry, RING, H, a0, 168)
    # The diagonal starts on the bowl's cut and runs along the bowl's tangent,
    # so the stroke flows out of the curve without a step.
    a = math.radians(a0)
    po = (cx + rx * math.cos(a), cy + ry * math.sin(a))
    pi_ = (cx + (rx - RING) * math.cos(a), cy + (ry - H) * math.sin(a))
    tx, ty = rx * math.sin(a), -ry * math.cos(a)
    n = math.hypot(tx, ty)
    tx, ty = tx / n, ty / n
    def to_floor(p):
        t = (p[1] - H / 2) / -ty
        return (p[0] + tx * t, H / 2)
    d = poly(po, pi_, to_floor(pi_), to_floor(po))
    return union(top, clip(d, rect(0, 0, w, CAP)), rect(0, 0, w, H))


@glyph("three", [0x33], 24, 24)
def _three():
    w = 640
    ryT, ryB = 216, 236
    cyT, cyB = CAP + OV - ryT, -OV + ryB
    # both bowls share a centre line, so their cuts at the middle coincide
    top = arc(w / 2, cyT, w / 2 - 30, ryT, RING - 8, H, -90, 158)
    bottom = arc(w / 2, cyB, w / 2, ryB, RING, H, -158, 90)
    return union(top, bottom)


@glyph("four", [0x34], 16, 32)
def _four():
    w = 700
    sx = w - 104 - V
    d = diag(sx + V / 2 - 16, CAP, 104, 150 + H, 180)
    d = clip(d, rect(0, 150, sx + V, CAP))
    return union(rect(sx, 0, sx + V, CAP), rect(0, 150, w, 150 + H), d)


@glyph("five", [0x35], 24, 24)
def _five():
    w = 640
    rx, ry = 320, 250
    cx, cy = w / 2, ry - OV
    bowl_ = arc(cx, cy, rx, ry, RING, H, -150, 180)
    stem = minus(rect(0, cy, V, CAP), ellipse(cx, cy, rx - RING, ry - H))
    return union(bowl_, rect(0, CAP - H, w - 20, CAP), stem)


@glyph("six", [0x36], 24, 24)
def _six():
    w = 650
    rx, ry = 325, 280
    cx, cy = w / 2, ry - OV
    ring = ering(cx, cy, rx, ry, RING, H)
    # a straight stroke rises from the left of the ring to the top right
    s = diag(104, cy, 474, CAP, 178)
    s = minus(s, ellipse(cx, cy, rx - RING, ry - H))
    s = clip(s, rect(0, cy, w, CAP))
    return union(ring, s)


@glyph("seven", [0x37], 16, 16)
def _seven():
    w = 640
    d = diag(w - 124, CAP - H / 2, 196, 0, 184)
    d = clip(d, rect(0, 0, w, CAP - H / 2))
    return union(rect(0, CAP - H, w, CAP), clip(d, rect(0, 0, w, CAP)))


@glyph("eight", [0x38], 24, 24)
def _eight():
    w = 640
    ryT, ryB = 216, 236
    cyT, cyB = CAP + OV - ryT, -OV + ryB
    return union(ering(w / 2, cyT, 276, ryT, RING - 8, H), ering(w / 2, cyB, w / 2, ryB, RING, H))


@glyph("nine", [0x39], 30, 30)
def _nine():
    return turned(_six(), 650)


# -------------------------------------------------------------- punctuation

@glyph("period", [0x2E], 40, 40)
def _period():
    return circle(DOT, DOT, DOT)


def _comma_shape():
    tail = poly((2 * DOT - 4, DOT - 6), (2 * DOT - 52, -176), (30, -176), (DOT + 14, 14))
    return union(circle(DOT, DOT, DOT), tail)


@glyph("comma", [0x2C], 40, 30)
def _comma():
    return _comma_shape()


@glyph("colon", [0x3A], 40, 40)
def _colon():
    return union(circle(DOT, DOT, DOT), circle(DOT, 470, DOT))


@glyph("semicolon", [0x3B], 40, 30)
def _semicolon():
    return union(_comma_shape(), circle(DOT, 470, DOT))


@glyph("exclam", [0x21], 40, 40)
def _exclam():
    return union(circle(DOT, DOT, DOT), rect(DOT - V / 2, 296, DOT + V / 2, CAP))


@glyph("question", [0x3F], 24, 30)
def _question():
    w = 540
    rx, ry = w / 2, 222
    cx, cy = w / 2, CAP + OV - ry
    top = arc(cx, cy, rx, ry, RING, H, -112, 170)
    stem = rect(cx - V / 2, 296, cx + V / 2, cy - ry + H)
    return union(top, stem, circle(cx, DOT, DOT))


@glyph("periodcentered", [0xB7], 40, 40)
def _middot():
    return circle(DOT, 360, DOT)


@glyph("hyphen", [0x2D, 0x2010, 0x2011], 30, 30)
def _hyphen():
    return rect(0, 292, 340, 292 + H)


@glyph("endash", [0x2013], 20, 20)
def _endash():
    return rect(0, 292, 560, 292 + H)


@glyph("emdash", [0x2014], 20, 20)
def _emdash():
    return rect(0, 292, 960, 292 + H)


@glyph("slash", [0x2F], 10, 10)
def _slash():
    return clip(diag(90, -60, 430, 780, 164), rect(0, -60, 520, 780))


@glyph("quotesingle", [0x27], 40, 40)
def _quotesingle():
    return rect(0, 450, 132, CAP)


@glyph("quotedbl", [0x22], 40, 40)
def _quotedbl():
    return union(rect(0, 450, 132, CAP), rect(212, 450, 344, CAP))


def _raised_comma():
    return moved(_comma_shape(), 0, CAP - 2 * DOT)


@glyph("quoteright", [0x2019], 40, 30)
def _quoteright():
    return _raised_comma()


@glyph("quoteleft", [0x2018], 30, 40)
def _quoteleft():
    p = _raised_comma()
    x0, y0, x1, y1 = p.bounds
    return p.transform(-1, 0, 0, -1, x0 + x1, y0 + y1)


@glyph("quotedblright", [0x201D], 40, 30)
def _quotedblright():
    p = _raised_comma()
    return union(p, moved(p, 2 * DOT + 50))


@glyph("quotedblleft", [0x201C], 30, 40)
def _quotedblleft():
    p = _quoteleft()
    return union(p, moved(p, 2 * DOT + 50))


@glyph("parenleft", [0x28], 36, 6)
def _parenleft():
    R = 600
    return arc(R, 360, R, R, 168, 168, 140, 220)


@glyph("parenright", [0x29], 6, 36)
def _parenright():
    p = _parenleft()
    x0, y0, x1, y1 = p.bounds
    return p.transform(-1, 0, 0, 1, x0 + x1, 0)


@glyph("plus", [0x2B], 40, 40)
def _plus():
    return union(rect(0, 292, 480, 292 + H), rect(240 - V / 2, 130, 240 + V / 2, 610))


@glyph("percent", [0x25], 30, 30)
def _percent():
    w = 760
    rings = union(ering(156, 564, 156, 156, 108, 108), ering(w - 156, 156, 156, 156, 108, 108))
    s = clip(diag(176, -20, w - 176, 740, 136), rect(0, -20, w, 740))
    return union(rings, s)


@glyph("ampersand", [0x26], 30, 20)
def _ampersand():
    # a small ring on top, a larger open bowl below, and a leg kicking out right
    top = ering(262, 548, 196, 186, 146, 134)
    low = arc(316, 232, 316, 246, RING, H, 64, 330)
    leg = diag(214, 470, 700, 0, 178)
    leg = minus(clip(leg, rect(0, 0, 760, 520)), ellipse(262, 548, 50, 52))
    return union(top, low, leg)


# ------------------------------------------------------- brand characters
# 本色, the brand name in Chinese, drawn with the same square-ended strokes.
# Only these two characters live in the face; other Chinese text uses the
# reader's system font.

CH = 118      # horizontal stroke in the Chinese characters
CV = 142      # vertical stroke
CT = 140      # diagonal stroke


@glyph("uni672C", [0x672C], 30, 30)
def _ben():
    w = 940
    xc = w / 2
    top = rect(0, 520, w, 520 + CH)
    stem = rect(xc - CV / 2, -60, xc + CV / 2, 820)
    left = clip(band(xc - 20, 520, 40, 40, CT, 60), rect(0, 40, xc, 520))
    right = clip(band(xc + 20, 520, w - 40, 40, CT, 60), rect(xc, 40, w, 520))
    low = rect(xc - 210, 120, xc + 210, 120 + CH)
    return union(top, stem, left, right, low)


@glyph("uni8272", [0x8272], 30, 30)
def _se():
    # top: a short falling stroke and a bar that turns down into the box
    pie = clip(band(420, 840, 160, 580, CT, 40), rect(0, 590, 940, 684 + CH))
    bar = rect(262, 684, 720, 684 + CH)
    turn = clip(band(700, 742, 548, 560, CT, 50), rect(0, 560, 720, 684 + CH))
    # 巴: a box split by a centre stroke, its left side running down and
    # round into a long base that hooks up at the end
    box_top = rect(190, 448, 812, 448 + CH)
    right = rect(812 - CV, 250, 812, 448 + CH)
    mid = rect(501 - CV / 2, 250, 501 + CV / 2, 448 + CH)
    box_low = rect(190, 250, 812, 250 + CH)
    r = 200
    corner = clip(ering(190 + r, -60 + r, r, r, CV, CH), rect(0, -100, 190 + r, -60 + r))
    left = rect(190, -60 + r, 190 + CV, 448 + CH)
    base = rect(190 + r, -60, 900, -60 + CH)
    hook = rect(900 - CV + 20, -60, 920, 150)
    return union(pie, bar, turn, box_top, right, mid, box_low, corner, left, base, hook)


# ---------------------------------------------------------------- build

def build():
    order = [".notdef", "space"] + list(GLYPHS)
    cmap = {0x20: "space", 0xA0: "space"}
    charstrings, metrics = {}, {}

    nd = minus(rect(0, 0, 500, CAP), rect(70, 70, 430, CAP - 70))
    shapes = {".notdef": (nd, 60, 60)}
    for name, (codes, fn, lsb, rsb) in GLYPHS.items():
        shapes[name] = (fn(), lsb, rsb)
        for c in codes:
            cmap[c] = name
            if 0x41 <= c <= 0x5A:
                cmap[c + 0x20] = name          # lowercase sets as caps

    for name in order:
        if name == "space":
            pen = T2CharStringPen(260, None)
            charstrings[name] = pen.getCharString()
            metrics[name] = (260, 0)
            continue
        path, lsb, rsb = shapes[name]
        path = pathops.simplify(path, clockwise=False)
        x0, y0, x1, y1 = path.bounds
        path = moved(path, lsb - x0)
        adv = round(x1 - x0 + lsb + rsb)
        pen = T2CharStringPen(adv, None)
        path.draw(pen)
        charstrings[name] = pen.getCharString()
        metrics[name] = (adv, lsb)

    family, style = "OWN TONE Display", "Black"
    ps = "OWNTONEDisplay-Black"
    fb = FontBuilder(UPM, isTTF=False)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupCFF(ps, {"FullName": f"{family} {style}", "Weight": style}, charstrings, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=920, descent=-260)
    fb.setupNameTable({
        "familyName": family,
        "styleName": style,
        "uniqueFontIdentifier": f"{ps};1.000",
        "fullName": f"{family} {style}",
        "psName": ps,
        "version": "Version 1.000",
        "copyright": "OWN TONE Display. Original typeface drawn for the OWN TONE demo site.",
        "description": "Wide geometric display capitals with circular shade-dot punctuation.",
    })
    fb.setupOS2(sTypoAscender=920, sTypoDescender=-260, sTypoLineGap=0,
                usWinAscent=960, usWinDescent=280, sxHeight=CAP, sCapHeight=CAP,
                usWeightClass=900, achVendID="OWNT", fsType=0)
    fb.setupPost()
    fb.addOpenTypeFeatures(KERN)
    fb.save(str(OUT_OTF))

    font = TTFont(str(OUT_OTF))
    font.flavor = "woff2"
    OUT_WOFF2.parent.mkdir(parents=True, exist_ok=True)
    font.save(str(OUT_WOFF2))
    print(f"{len(order)} glyphs -> {OUT_WOFF2.relative_to(ROOT)} ({OUT_WOFF2.stat().st_size // 1024} KB)")


KERN = """
languagesystem DFLT dflt;
languagesystem latn dflt;
@ROUND_L = [C G O Q];
@ROUND_R = [D O Q];
@DIAG = [V W Y];
@STOP = [period comma];
feature kern {
  pos A [V Y] -90;  pos A W -60;  pos A T -80;  pos A @ROUND_L -24;  pos A [quoteright quotesingle quotedblright quotedbl] -90;
  pos [V Y] A -90;  pos W A -60;  pos T A -80;  pos @ROUND_R A -24;
  pos L T -110;  pos L [V Y] -110;  pos L W -70;  pos L @ROUND_L -30;  pos L [quoteright quotesingle quotedblright quotedbl] -120;
  pos T @ROUND_L -40;  pos @ROUND_R T -40;  pos T @STOP -100;  pos T [hyphen endash] -60;
  pos @DIAG @ROUND_L -40;  pos @ROUND_R @DIAG -40;  pos @DIAG @STOP -100;
  pos [F P] A -60;  pos [F P] @STOP -110;
  pos R [T V Y] -40;  pos R W -24;  pos K @ROUND_L -40;  pos X @ROUND_L -30;  pos @ROUND_R X -30;
  pos [one] [one] -40;  pos seven @STOP -80;  pos seven four -50;
} kern;
"""

if __name__ == "__main__":
    build()
