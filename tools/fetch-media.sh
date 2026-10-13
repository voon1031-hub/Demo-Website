#!/usr/bin/env bash
# Downloads every "<name> <url>" line in tools/media.txt and prepares it for the site.
#   images (.png/.jpg/.webp) -> assets/media/<name>.jpg  (fits in 1600x1600)
#   videos (.mp4/.mov/.webm) -> assets/media/<name>.mp4  (fits in 1280x1280, H.264,
#                               no audio, starts playing before it has fully loaded)
# A later line with the same name replaces an earlier one.
# Needs: curl, ffmpeg. Run from the repository root.
set -uo pipefail
src=.media-src
rm -rf "$src"; mkdir -p "$src" assets/media
failed=0

while read -r name url _; do
  [ -z "${name:-}" ] && continue
  case "$name" in \#*) continue ;; esac
  ext="${url##*.}"; ext="${ext%%\?*}"; ext="${ext,,}"
  file="$src/$name.$ext"
  if ! curl -fsSL --retry 4 --retry-all-errors --retry-delay 3 -A "Mozilla/5.0" -o "$file" "$url"; then
    echo "FAILED: $name $url"; failed=$((failed+1)); continue
  fi
  case "$ext" in
    mp4|mov|webm)
      ffmpeg -nostdin -loglevel error -y -i "$file" -an \
        -vf "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2" \
        -c:v libx264 -preset slow -crf 25 -maxrate 3M -bufsize 6M -pix_fmt yuv420p \
        -movflags +faststart "assets/media/$name.mp4" || { echo "FAILED: encoding $name"; failed=$((failed+1)); continue; }
      echo "video: $name $(du -h "assets/media/$name.mp4" | cut -f1)" ;;
    *)
      ffmpeg -nostdin -loglevel error -y -i "$file" \
        -vf "scale='min(1600,iw)':'min(1600,ih)':force_original_aspect_ratio=decrease" -q:v 4 \
        "assets/media/$name.jpg" || { echo "FAILED: converting $name"; failed=$((failed+1)); continue; }
      echo "image: $name $(du -h "assets/media/$name.jpg" | cut -f1)" ;;
  esac
done < tools/media.txt

rm -rf "$src"
[ "$failed" -eq 0 ] || { echo "$failed file(s) failed"; exit 1; }
