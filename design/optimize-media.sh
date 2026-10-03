#!/usr/bin/env bash
# Compress the generated MY FIZZ media for the web.
#
#   design/optimize-media.sh <src-dir> <out-dir>
#
# <src-dir> holds the originals under these names (the Higgsfield file for each is listed in design/assets.json):
#   coin.mp4 purple.mp4 orange.mp4 green.mp4          the four 10s clips (1912x1080, one keyframe per clip)
#   k1.png k2.png tube.png lineup.png                 stills
#   fruit_<f>.png can_<f>.png end_<f>.png tray_<f>.png   with <f> = purple | orange | green
#
# Writes <name>_d.mp4 (desktop) and <name>_m.mp4 (phone) for each clip, WebP stills, and og.jpg.
# Needs ffmpeg with libx264, and python3 with Pillow (pip install pillow).
set -euo pipefail

SRC=${1:?usage: optimize-media.sh <src-dir> <out-dir>}
OUT=${2:?usage: optimize-media.sh <src-dir> <out-dir>}
mkdir -p "$OUT"

TAGS="-colorspace bt709 -color_primaries bt709 -color_trc bt709"

# The page scrubs these clips with the scrollbar, so every seek has to be cheap:
#   keyint 8 (phones 6) + no B-frames  ->  a seek decodes at most 7 (5) frames instead of up to 240.
# Phones get the centre 9:16 crop at 540x960, because a portrait screen only shows the middle of the 16:9 frame.
encode_desktop() { # name
  ffmpeg -v error -y -i "$SRC/$1.mp4" -an -vf "scale=1280:720:flags=lanczos,format=yuv420p" \
    -c:v libx264 -profile:v high -level 4.0 -preset medium -crf 25 -maxrate 4500k -bufsize 9000k \
    -x264-params "keyint=8:min-keyint=8:scenecut=0:bframes=0:ref=2" $TAGS -movflags +faststart "$OUT/$1_d.mp4"
}
encode_phone() { # name
  ffmpeg -v error -y -i "$SRC/$1.mp4" -an -vf "crop=608:1080,scale=540:960:flags=lanczos,format=yuv420p" \
    -c:v libx264 -profile:v high -level 3.1 -preset medium -crf 26 -maxrate 2600k -bufsize 5200k \
    -x264-params "keyint=6:min-keyint=6:scenecut=0:bframes=0:ref=2" $TAGS -movflags +faststart "$OUT/$1_m.mp4"
}

for clip in coin purple orange green; do
  encode_desktop "$clip" &
  encode_phone "$clip" &
  wait
done

# Stills: WebP (with alpha for the cut-outs), sized for how big they are shown.
SRC="$SRC" OUT="$OUT" python3 - <<'PY'
import os
from PIL import Image

src, out = os.environ["SRC"], os.environ["OUT"]
flavors = ("purple", "orange", "green")
jobs = [("k1", (1600, 900), 80), ("k2", (1600, 900), 80), ("tube", (1280, 724), 82)]
jobs += [(f"fruit_{f}", (1100, 1100), 82) for f in flavors]
jobs += [(f"can_{f}", (800, 1414), 84) for f in flavors]
jobs += [(f"end_{f}", (1280, 724), 80) for f in flavors]
jobs += [(f"tray_{f}", (1280, 724), 80) for f in flavors]

for name, box, quality in jobs:
    im = Image.open(f"{src}/{name}.png")
    im.load()
    im.thumbnail(box, Image.LANCZOS)
    im.save(f"{out}/{name}.webp", "WEBP", quality=quality, method=6, alpha_quality=92)

og = Image.open(f"{src}/lineup.png").convert("RGB")
og.thumbnail((1600, 900), Image.LANCZOS)
og.save(f"{out}/og.jpg", "JPEG", quality=85, optimize=True, progressive=True)
PY

echo "Done. Output:"
ls -lh "$OUT" | awk 'NR>1 {print $5, $9}'
