#!/usr/bin/env bash
# Downloads every "<name> <url>" line in tools/media.txt and prepares it for the site.
#   cut-* images              -> assets/media/<name>.webp, transparent background kept,
#                                empty margins trimmed (fits in 1600x1600)
#   images (.png/.jpg/.webp)  -> assets/media/<name>.jpg  (fits in 1920x1400)
#   videos (.mp4)             -> assets/media/<name>.mp4 and .webm (1280px, H.264 and
#                                VP9, no audio)
#   clip-* videos             -> the same, played forward then backward so the
#                                loop has no jump (fits in 1280x1280)
#   film-1, film-2 … videos   -> the scroll-driven hero film, joined in order and
#                                cut into assets/film/NNN.webp frames, plus
#                                assets/film/frames.js, start.jpg and end.jpg
# A later line with the same name replaces an earlier one. Files that are already
# in assets/ are skipped, and the film is only cut again when its film-* lines
# change; run with FORCE=1 to fetch everything again.
# Needs: curl, ffmpeg, ffprobe, ImageMagick (convert). Run from the repository root.
set -uo pipefail
FRAMES=${FRAMES:-150}     # frames in the hero film
FRAME_W=${FRAME_W:-1600}  # frame width in px
src=.media-src
rm -rf "$src"; mkdir -p "$src" assets/media
failed=0
film_list=$(grep -E '^film-' tools/media.txt || true)
film_same=""
[ -z "${FORCE:-}" ] && [ -f assets/film/source.txt ] && [ "$film_list" = "$(cat assets/film/source.txt)" ] && film_same=1

out_for() {
  case "$1:$2" in
    film-*:mp4) echo "" ;;
    cut-*:png|cut-*:webp) echo "assets/media/$1.webp" ;;
    *:mp4|*:mov|*:webm) echo "assets/media/$1.mp4" ;;
    *) echo "assets/media/$1.jpg" ;;
  esac
}

while read -r name url _; do
  [ -z "${name:-}" ] && continue
  case "$name" in \#*) continue ;; esac
  ext="${url##*.}"; ext="${ext%%\?*}"; ext="${ext,,}"
  file="$src/$name.$ext"
  out=$(out_for "$name" "$ext")
  if [ -z "${FORCE:-}" ] && [ -n "$out" ] && [ -e "$out" ]; then echo "skip: $name (already $out)"; continue; fi
  if [ -n "$film_same" ] && [[ "$name" == film-* ]]; then echo "skip: $name (film unchanged)"; continue; fi
  if ! curl -fsSL --retry 4 --retry-all-errors --retry-delay 3 -A "Mozilla/5.0" -o "$file" "$url"; then
    echo "FAILED: $name $url"; failed=$((failed+1)); continue
  fi
  case "$name:$ext" in
    film-*:mp4) echo "film segment: $name" ;;  # used below, not published on its own
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
      ffmpeg -nostdin -loglevel error -y -i "$file" -an -vf "scale=1280:-2" \
        -c:v libx264 -preset slow -crf 24 -maxrate 4M -bufsize 8M -pix_fmt yuv420p \
        -movflags +faststart "assets/media/$name.mp4"
      # WebM too: some browsers (and Chromium builds without H.264) only play this one
      ffmpeg -nostdin -loglevel error -y -i "$file" -an -vf "scale=1280:-2" \
        -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -pix_fmt yuv420p "assets/media/$name.webm"
      echo "video: $name $(du -h "assets/media/$name.mp4" | cut -f1) mp4, $(du -h "assets/media/$name.webm" | cut -f1) webm" ;;
    *)
      ffmpeg -nostdin -loglevel error -y -i "$file" \
        -vf "scale='min(1920,iw)':'min(1400,ih)':force_original_aspect_ratio=decrease" -q:v 4 "assets/media/$name.jpg"
      echo "image: $name $(du -h "assets/media/$name.jpg" | cut -f1)" ;;
  esac
done < tools/media.txt

mapfile -t segs < <(ls "$src"/film-*.mp4 2>/dev/null | sort -V)
if [ "${#segs[@]}" -gt 0 ]; then
  # Each segment after the first starts on the previous segment's last frame,
  # so drop that duplicate frame when joining.
  inputs=(); graph=""; labels=""
  for i in "${!segs[@]}"; do
    inputs+=(-i "${segs[$i]}")
    trim=""; [ "$i" -gt 0 ] && trim="trim=start_frame=1,setpts=PTS-STARTPTS,"
    graph+="[$i:v]fps=24,${trim}scale=${FRAME_W}:-2:flags=lanczos,setsar=1,colorlevels=rimax=0.96:gimax=0.96:bimax=0.96,format=yuv420p[v$i];"
    labels+="[v$i]"
  done
  graph+="${labels}concat=n=${#segs[@]}:v=1:a=0[out]"
  ffmpeg -nostdin -loglevel error -y "${inputs[@]}" -filter_complex "$graph" -map "[out]" \
    -c:v libx264 -preset fast -crf 10 "$src/joined.mp4" || { echo "FAILED: joining film segments"; exit 1; }

  total=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$src/joined.mp4")
  [ "$FRAMES" -gt "$total" ] && FRAMES=$total
  # FRAMES evenly spaced frames, always including the first and the last one.
  pick=""
  for ((k = 0; k < FRAMES; k++)); do
    n=$(( (k * (total - 1) * 2 + (FRAMES - 1)) / ((FRAMES - 1) * 2) ))
    pick+="${pick:++}eq(n\\,$n)"
  done

  rm -rf assets/film; mkdir -p assets/film
  ext=webp
  if ! ffmpeg -nostdin -loglevel error -y -i "$src/joined.mp4" -vf "select='$pick'" -fps_mode passthrough \
      -c:v libwebp -quality 70 -compression_level 6 -start_number 0 assets/film/%03d.webp; then
    echo "WebP encoding failed, using JPEG frames"
    rm -f assets/film/*.webp; ext=jpg
    ffmpeg -nostdin -loglevel error -y -i "$src/joined.mp4" -vf "select='$pick'" -fps_mode passthrough \
      -q:v 4 -start_number 0 assets/film/%03d.jpg || { echo "FAILED: extracting frames"; exit 1; }
  fi
  count=$(ls assets/film/*."$ext" | wc -l)
  size=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$src/joined.mp4")
  ffmpeg -nostdin -loglevel error -y -i "$src/joined.mp4" -frames:v 1 -q:v 2 assets/film/start.jpg
  ffmpeg -nostdin -loglevel error -y -sseof -0.1 -i "$src/joined.mp4" -update 1 -q:v 2 assets/film/end.jpg
  printf '// Generated by tools/fetch-media.sh: the frames of the hero film.\nwindow.FILM_FRAMES = { count: %d, ext: "%s", width: %d, height: %d };\n' \
    "$count" "$ext" "${size%x*}" "${size#*x}" > assets/film/frames.js
  printf '%s\n' "$film_list" > assets/film/source.txt
  echo "frames: $count x $size $ext, $(du -sh assets/film | cut -f1) total (from $total joined frames)"
fi

rm -rf "$src"
[ "$failed" -eq 0 ] || { echo "$failed download(s) failed"; exit 1; }
