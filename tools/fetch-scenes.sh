#!/usr/bin/env bash
# Downloads every "<name> <url>" line in tools/scenes.txt into assets/scenes/.
# Images (.png/.jpg/.webp) -> <name>.jpg, 1920px wide.
# Videos (.mp4)            -> <name>.mp4, 1280px, H.264, no audio, web-optimised.
# Needs: curl, ffmpeg. Run from the repository root.
set -uo pipefail
mkdir -p assets/scenes .media-src
failed=0
while read -r name url; do
  [ -z "${name:-}" ] && continue
  case "$name" in \#*) continue ;; esac
  ext="${url##*.}"; ext="${ext%%\?*}"
  src=".media-src/$name.$ext"
  if ! curl -fsSL --retry 4 --retry-all-errors --retry-delay 3 -A "Mozilla/5.0" -o "$src" "$url"; then
    echo "FAILED: $name $url"; failed=$((failed+1)); continue
  fi
  if [ "$ext" = "mp4" ]; then
    ffmpeg -nostdin -loglevel error -y -i "$src" -an -vf "scale=1280:-2" \
      -c:v libx264 -preset slow -crf 25 -maxrate 4M -bufsize 8M -pix_fmt yuv420p \
      -movflags +faststart "assets/scenes/$name.mp4"
    echo "video: $name $(du -h "assets/scenes/$name.mp4" | cut -f1)"
  else
    ffmpeg -nostdin -loglevel error -y -i "$src" -vf "scale='min(1920,iw)':-2" -q:v 3 "assets/scenes/$name.jpg"
    echo "image: $name $(du -h "assets/scenes/$name.jpg" | cut -f1)"
  fi
done < tools/scenes.txt
rm -rf .media-src
[ "$failed" -eq 0 ] || { echo "$failed download(s) failed"; exit 1; }
