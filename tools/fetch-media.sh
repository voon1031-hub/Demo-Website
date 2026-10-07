#!/usr/bin/env bash
# Downloads every "<name> <url>" line in tools/media.txt and prepares it for the site.
#   images (.png/.jpg/.webp)  -> assets/media/<name>.jpg  (fits in 1920x1400)
#   videos (.mp4)             -> assets/media/<name>.mp4  (1280px, H.264, no audio)
#   clip-* videos             -> the same, played forward then backward so the
#                                loop has no jump (fits in 1280x1280)
#   hero-* videos             -> full-screen backgrounds: looped the same way, up to
#                                1600px wide (HERO_SMALL=1 adds <name>-sm.mp4, 720px)
#   build-1, build-2 … videos -> the hero construction timelapse, joined in order and
#                                cut into assets/build/NNN.webp frames, plus
#                                assets/build/frames.js, start.jpg and end.jpg
# A later line with the same name replaces an earlier one.
# Another site can reuse this script with MEDIA_LIST=<list> MEDIA_DIR=<output dir>;
# POSTERS=1 also saves the first frame of each hero-*/clip-* video as <name>.jpg.
# Needs: curl, ffmpeg, ffprobe. Run from the repository root.
set -uo pipefail
FRAMES=${FRAMES:-120}     # frames in the hero sequence
FRAME_W=${FRAME_W:-1600}  # frame width in px
LIST=${MEDIA_LIST:-tools/media.txt}
OUT=${MEDIA_DIR:-assets/media}
POSTERS=${POSTERS:-0}
HERO_SMALL=${HERO_SMALL:-0}
# Forward then backward (minus the repeated turn-around frame), so the loop has no jump.
PINGPONG="split[f][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[f][r]concat=n=2:v=1:a=0,format=yuv420p[v]"
src=.media-src
rm -rf "$src"; mkdir -p "$src" "$OUT"
failed=0

while read -r name url _; do
  [ -z "${name:-}" ] && continue
  case "$name" in \#*) continue ;; esac
  ext="${url##*.}"; ext="${ext%%\?*}"; ext="${ext,,}"
  file="$src/$name.$ext"
  if ! curl -fsSL --retry 4 --retry-all-errors --retry-delay 3 -A "Mozilla/5.0" -o "$file" "$url"; then
    echo "FAILED: $name $url"; failed=$((failed+1)); continue
  fi
  case "$name:$ext" in
    build-*:mp4) echo "build segment: $name" ;;  # used below, not published on its own
    hero-*:mp4)
      ffmpeg -nostdin -loglevel error -y -i "$file" -an -filter_complex \
        "[0:v]scale='min(1600,iw)':-2,$PINGPONG" \
        -map "[v]" -c:v libx264 -preset slow -crf 25 -maxrate 5M -bufsize 10M -movflags +faststart "$OUT/$name.mp4"
      echo "hero loop: $name $(du -h "$OUT/$name.mp4" | cut -f1)"
      if [ "$HERO_SMALL" = 1 ]; then
        ffmpeg -nostdin -loglevel error -y -i "$OUT/$name.mp4" -an -vf "scale=720:-2" \
          -c:v libx264 -preset slow -crf 28 -maxrate 1500k -bufsize 3M -pix_fmt yuv420p -movflags +faststart "$OUT/$name-sm.mp4"
        echo "hero loop (small): $name $(du -h "$OUT/$name-sm.mp4" | cut -f1)"
      fi ;;
    clip-*:mp4)
      ffmpeg -nostdin -loglevel error -y -i "$file" -an -filter_complex \
        "[0:v]scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2,$PINGPONG" \
        -map "[v]" -c:v libx264 -preset slow -crf 26 -maxrate 3M -bufsize 6M -movflags +faststart "$OUT/$name.mp4"
      echo "loop clip: $name $(du -h "$OUT/$name.mp4" | cut -f1)" ;;
    *:mp4|*:mov|*:webm)
      ffmpeg -nostdin -loglevel error -y -i "$file" -an -vf "scale=1280:-2" \
        -c:v libx264 -preset slow -crf 24 -maxrate 4M -bufsize 8M -pix_fmt yuv420p \
        -movflags +faststart "$OUT/$name.mp4"
      echo "video: $name $(du -h "$OUT/$name.mp4" | cut -f1)" ;;
    *)
      ffmpeg -nostdin -loglevel error -y -i "$file" \
        -vf "scale='min(1920,iw)':'min(1400,ih)':force_original_aspect_ratio=decrease" -q:v 4 "$OUT/$name.jpg"
      echo "image: $name $(du -h "$OUT/$name.jpg" | cut -f1)" ;;
  esac
  case "$POSTERS:$name:$ext" in
    1:hero-*:mp4|1:clip-*:mp4)
      ffmpeg -nostdin -loglevel error -y -i "$OUT/$name.mp4" -frames:v 1 -q:v 3 "$OUT/$name.jpg" &&
        echo "poster: $name $(du -h "$OUT/$name.jpg" | cut -f1)" ;;
  esac
done < "$LIST"

mapfile -t segs < <(ls "$src"/build-*.mp4 2>/dev/null | sort -V)
if [ "${#segs[@]}" -gt 0 ]; then
  # Each segment after the first starts on the previous segment's last frame,
  # so drop that duplicate frame when joining.
  inputs=(); graph=""; labels=""
  for i in "${!segs[@]}"; do
    inputs+=(-i "${segs[$i]}")
    trim=""; [ "$i" -gt 0 ] && trim="trim=start_frame=1,setpts=PTS-STARTPTS,"
    graph+="[$i:v]fps=24,${trim}scale=${FRAME_W}:-2:flags=lanczos,setsar=1,format=yuv420p[v$i];"
    labels+="[v$i]"
  done
  graph+="${labels}concat=n=${#segs[@]}:v=1:a=0[out]"
  ffmpeg -nostdin -loglevel error -y "${inputs[@]}" -filter_complex "$graph" -map "[out]" \
    -c:v libx264 -preset fast -crf 10 "$src/joined.mp4" || { echo "FAILED: joining build segments"; exit 1; }

  total=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$src/joined.mp4")
  [ "$FRAMES" -gt "$total" ] && FRAMES=$total
  # FRAMES evenly spaced frames, always including the first and the last one.
  pick=""
  for ((k = 0; k < FRAMES; k++)); do
    n=$(( (k * (total - 1) * 2 + (FRAMES - 1)) / ((FRAMES - 1) * 2) ))
    pick+="${pick:++}eq(n\\,$n)"
  done

  rm -rf assets/build; mkdir -p assets/build
  ext=webp
  if ! ffmpeg -nostdin -loglevel error -y -i "$src/joined.mp4" -vf "select='$pick'" -fps_mode passthrough \
      -c:v libwebp -quality 70 -compression_level 6 -start_number 0 assets/build/%03d.webp; then
    echo "WebP encoding failed, using JPEG frames"
    rm -f assets/build/*.webp; ext=jpg
    ffmpeg -nostdin -loglevel error -y -i "$src/joined.mp4" -vf "select='$pick'" -fps_mode passthrough \
      -q:v 4 -start_number 0 assets/build/%03d.jpg || { echo "FAILED: extracting frames"; exit 1; }
  fi
  count=$(ls assets/build/*."$ext" | wc -l)
  size=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$src/joined.mp4")
  ffmpeg -nostdin -loglevel error -y -i "$src/joined.mp4" -frames:v 1 -q:v 2 assets/build/start.jpg
  ffmpeg -nostdin -loglevel error -y -sseof -0.1 -i "$src/joined.mp4" -update 1 -q:v 2 assets/build/end.jpg
  printf '// Generated by tools/fetch-media.sh: the hero construction frames.\nwindow.BUILD_FRAMES = { count: %d, ext: "%s", width: %d, height: %d };\n' \
    "$count" "$ext" "${size%x*}" "${size#*x}" > assets/build/frames.js
  echo "frames: $count x $size $ext, $(du -sh assets/build | cut -f1) total (from $total joined frames)"
fi

rm -rf "$src"
[ "$failed" -eq 0 ] || { echo "$failed download(s) failed"; exit 1; }
