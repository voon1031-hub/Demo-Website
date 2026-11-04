"""Build a trackpad-like scroll timeline.

usage: python3 timeline.py <fps> <frames> <out.json> <t1:dy1> <t2:dy2> ...

Each tN:dyN is a two-finger swipe that starts at tN seconds and scrolls the
page by dyN pixels. A swipe pushes the page with an eased start and then
glides to a stop the way macOS momentum scrolling does.
"""
import json
import math
import sys

fps = float(sys.argv[1])
frames = int(sys.argv[2])
out = sys.argv[3]
swipes = [tuple(map(float, a.split(":"))) for a in sys.argv[4:]]
TAU = 0.42      # momentum decay (s)
RAMP = 0.14     # finger contact before release (s)


def progress(dt):
    """0 -> 1 share of a swipe's distance covered dt seconds after it starts."""
    if dt <= 0:
        return 0.0
    # ease in while the fingers move, then exponential glide
    ramp = min(dt / RAMP, 1.0)
    eased = ramp * ramp * (3 - 2 * ramp) * (RAMP / (RAMP + TAU))
    glide = 0.0 if dt <= RAMP else (1 - math.exp(-(dt - RAMP) / TAU)) * (TAU / (RAMP + TAU))
    return min(1.0, eased + glide)


ys = []
for i in range(frames):
    t = i / fps
    ys.append(round(sum(dy * progress(t - t0) for t0, dy in swipes), 2))
json.dump(ys, open(out, "w"))
print(f"{frames} frames, final scroll {ys[-1]:.0f}px")
