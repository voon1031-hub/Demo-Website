#!/usr/bin/env bash
# Downloads the generated Fornello cover images and background videos
# into images/ and videos/, then compresses them for mobile.
# Needs: curl, ffmpeg. Run from the repository root: bash tools/fetch-media.sh
set -euo pipefail
B=https://d8j0ntlcm91z4.cloudfront.net/user_3K59eeAhTYrmns8lc7vJvaiOx1X
mkdir -p images videos .media-src

# name  image file  video file
while read -r name img vid; do
  curl -fsSL -o ".media-src/$name.png" "$B/$img"
  curl -fsSL -o ".media-src/$name.mp4" "$B/$vid"
  # Poster: 1080px wide JPG
  ffmpeg -loglevel error -y -i ".media-src/$name.png" -vf "scale=1080:-2" -q:v 4 "images/$name.jpg"
  # Video: 720x1280, H.264, no audio, web-optimized, kept under ~3 MB
  ffmpeg -loglevel error -y -i ".media-src/$name.mp4" -an -vf "scale=720:-2" \
    -c:v libx264 -preset slow -crf 26 -maxrate 4M -bufsize 8M -pix_fmt yuv420p \
    -movflags +faststart "videos/$name.mp4"
  echo "done: $name  $(du -h "videos/$name.mp4" | cut -f1)"
done <<'LIST'
01-fire        hf_20261002_152927_4f50eedf-a3d8-4d32-a6c6-e057475984d5.png hf_20261002_153306_ae035633-135d-433d-aa34-e0c0a00b5d5f.mp4
02-dough       hf_20261002_153049_ec4633de-d6e5-49a1-b348-aa0602281715.png hf_20261002_153324_67488ef1-efcc-4045-922a-ebd04ac6d5e2.mp4
03-ingredients hf_20261002_152927_83101f16-adf3-489c-80c8-fab0c0cbce98.png hf_20261002_153306_87531192-b642-4e74-bb06-abe8cde0e15b.mp4
04-oven        hf_20261002_152927_4da134b5-8d1b-4f5f-a2b4-6c6d9e595b7d.png hf_20261002_153306_c9e5fd43-d6c5-466b-ab9b-dda0ea3245e1.mp4
05-signature   hf_20261002_152927_78d8fff5-08b0-4adb-8f8b-d17139cc4fb3.png hf_20261002_153306_8ee0c9d3-3816-4ad7-86f7-8091ace0984d.mp4
06-ambience    hf_20261002_152927_a69e7a26-eeca-4a54-9fd1-25c181b14134.png hf_20261002_153321_c835326f-b639-49b0-b056-1a9b790e93ab.mp4
07-visit       hf_20261002_152928_331a0848-5bbd-4d2e-afb0-f03c45cc53be.png hf_20261002_153321_5c15842e-ad53-4536-95b6-d83af55a6e17.mp4
LIST
rm -rf .media-src
