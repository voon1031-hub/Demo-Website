#!/usr/bin/env bash
# Downloads every "<name> <url> [filter]" line in tools/media.txt and prepares it
# for the site.
#   cut-* images              -> assets/media/<name>.webp, transparent background kept,
#                                empty margins trimmed (fits in 1600x1600)
#   images (.png/.jpg/.webp)  -> assets/media/<name>.jpg  (fits in 1920x1400)
#   videos (.mp4)             -> assets/media/<name>.mp4 and .webm (1280px, H.264 and
#                                VP9, no audio) and <name>-poster.jpg, the first frame
#   clip-* videos             -> the same, played forward then backward so the
#                                loop has no jump (fits in 1280x1280)
# A video line may end with an ffmpeg filter applied before scaling, for example
# crop=iw:ih*0.46 to keep only the band a page shows.
# A later line with the same name replaces an earlier one. Files that are already
# in assets/ are skipped; run with FORCE=1 to fetch everything again.
# Needs: curl, ffmpeg, ImageMagick (convert). Run from the repository root.
set -uo pipefail
src=.media-src
rm -rf "$src"; mkdir -p "$src" assets/media
failed=0

out_for() {
  case "$1:$2" in
    cut-*:png|cut-*:webp) echo "assets/media/$1.webp" ;;
    *:mp4|*:mov|*:webm) echo "assets/media/$1.mp4" ;;
    *) echo "assets/media/$1.jpg" ;;
  esac
}

while read -r name url filter _; do
  [ -z "${name:-}" ] && continue
  case "$name" in \#*) continue ;; esac
  ext="${url##*.}"; ext="${ext%%\?*}"; ext="${ext,,}"
  file="$src/$name.$ext"
  out=$(out_for "$name" "$ext")
  if [ -z "${FORCE:-}" ] && [ -n "$out" ] && [ -e "$out" ]; then echo "skip: $name (already $out)"; continue; fi
  if ! curl -fsSL --retry 4 --retry-all-errors --retry-delay 3 -A "Mozilla/5.0" -o "$file" "$url"; then
    echo "FAILED: $name $url"; failed=$((failed+1)); continue
  fi
  case "$name:$ext" in
    cut-*:png|cut-*:webp)
      # Product cutouts sit straight on the page colour, so keep the alpha channel.
      convert "$file" -fuzz 3% -trim +repage -bordercolor none -border 12 -resize '1600x1600>' "PNG32:$src/$name.trim.png" &&
      ffmpeg -nostdin -loglevel error -y -i "$src/$name.trim.png" -c:v libwebp -pix_fmt yuva420p \
        -quality 88 -compression_level 6 "assets/media/$name.webp" ||
        { echo "FAILED: cutout $name"; failed=$((failed+1)); continue; }
      echo "cutout: $name $(du -h "assets/media/$name.webp" | cut -f1)" ;;
    clip-*:mp4)
      ffmpeg -nostdin -loglevel error -y -i "$file" -an -filter_complex \
        "[0:v]scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2,split[f][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[f][r]concat=n=2:v=1:a=0,format=yuv420p[v]" \
        -map "[v]" -c:v libx264 -preset slow -crf 26 -maxrate 3M -bufsize 6M -movflags +faststart "assets/media/$name.mp4"
      echo "loop clip: $name $(du -h "assets/media/$name.mp4" | cut -f1)" ;;
    *:mp4|*:mov|*:webm)
      vf="${filter:+$filter,}scale=1280:-2"
      ffmpeg -nostdin -loglevel error -y -i "$file" -an -vf "$vf" \
        -c:v libx264 -preset slow -crf 24 -maxrate 4M -bufsize 8M -pix_fmt yuv420p \
        -movflags +faststart "assets/media/$name.mp4"
      # WebM too: some browsers (and Chromium builds without H.264) only play this one
      ffmpeg -nostdin -loglevel error -y -i "$file" -an -vf "$vf" \
        -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -pix_fmt yuv420p "assets/media/$name.webm"
      ffmpeg -nostdin -loglevel error -y -i "$file" -vf "$vf" -frames:v 1 -q:v 3 "assets/media/$name-poster.jpg"
      echo "video: $name $(du -h "assets/media/$name.mp4" | cut -f1) mp4, $(du -h "assets/media/$name.webm" | cut -f1) webm" ;;
    *)
      ffmpeg -nostdin -loglevel error -y -i "$file" \
        -vf "scale='min(1920,iw)':'min(1400,ih)':force_original_aspect_ratio=decrease" -q:v 4 "assets/media/$name.jpg"
      echo "image: $name $(du -h "assets/media/$name.jpg" | cut -f1)" ;;
  esac
done < tools/media.txt

rm -rf "$src"
[ "$failed" -eq 0 ] || { echo "$failed download(s) failed"; exit 1; }
