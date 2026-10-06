#!/usr/bin/env bash
# Downloads every "<name> <url> [frames] [keep]" line in tools/media.txt and prepares it for the site.
#   key-NN images   -> assets/keys/key-NN.jpg    the film's keyframes (1600 px wide); the page
#                                                 shows them as stills when motion is reduced
#   packshot image  -> assets/media/packshot.jpg the watch shown inside the ring in the finale
#   other images    -> assets/media/<name>.jpg   (fits in 1920x1400)
#   review-NN videos-> assets/review/review-NN.jpg, a 4 × 3 contact sheet for checking
#                      a generated segment (not used by the page)
#   stills-NN videos-> assets/review/stills-NN/NN.jpg, "frames" (default 24) full-size
#                      stills for checking fine detail such as lettering
#   film-NN videos  -> the scroll film. Segments are taken in name order; each one starts on the
#                      previous one's last frame, so that duplicate frame is dropped. "frames"
#                      evenly spaced frames are kept from each segment (default 40) and written
#                      to assets/film/NNN.webp, plus assets/film/film.js, which tells the page
#                      how many frames there are, their size and where each segment starts.
#                      "keep" (0–1, default 1) uses only that leading share of a segment, for
#                      clips whose motion finishes early and then stands still.
# A later line with the same name replaces an earlier one.
# Needs: curl, ffmpeg, ffprobe. Run from the repository root.
set -uo pipefail
FRAME_W=${FRAME_W:-1600}  # film frame width in px
src=.media-src
rm -rf "$src"; mkdir -p "$src"
failed=0
declare -A frames_for keep_for

while read -r name url frames keep _; do
  [ -z "${name:-}" ] && continue
  case "$name" in \#*) continue ;; esac
  ext="${url##*.}"; ext="${ext%%\?*}"; ext="${ext,,}"
  file="$src/$name.$ext"
  if ! curl -fsSL --retry 4 --retry-all-errors --retry-delay 3 -A "Mozilla/5.0" -o "$file" "$url"; then
    echo "FAILED: $name $url"; failed=$((failed+1)); continue
  fi
  case "$name:$ext" in
    film-*:mp4|film-*:mov|film-*:webm)
      frames_for[$name]=${frames:-40}
      keep_for[$name]=${keep:-1}
      echo "film segment: $name (${frames_for[$name]} frames, keep ${keep_for[$name]})" ;;
    review-*:mp4)
      # A contact sheet for checking a segment before it goes into the film:
      # twelve evenly spaced frames in a 4 × 3 grid.
      mkdir -p assets/review
      n=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$file")
      pick=""
      for ((k = 0; k < 12; k++)); do pick+="${pick:++}eq(n\\,$(( k * (n - 1) / 11 )))"; done
      ffmpeg -nostdin -loglevel error -y -i "$file" -vf "select='$pick',scale=480:-2,tile=4x3:padding=4:color=black" \
        -fps_mode passthrough -frames:v 1 -q:v 3 "assets/review/$name.jpg" \
        && echo "contact sheet: $name" || { echo "FAILED: contact sheet $name"; failed=$((failed+1)); } ;;
    stills-*:mp4)
      # Full-size stills for checking fine detail, such as lettering: "frames"
      # evenly spaced frames (default 24) as assets/review/<name>/NN.jpg.
      want=${frames:-24}
      mkdir -p "assets/review/$name"
      n=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$file")
      pick=""
      for ((k = 0; k < want; k++)); do pick+="${pick:++}eq(n\\,$(( k * (n - 1) / (want - 1) )))"; done
      ffmpeg -nostdin -loglevel error -y -i "$file" -vf "select='$pick',scale='min(1600,iw)':-2" \
        -fps_mode passthrough -q:v 3 "assets/review/$name/%02d.jpg" \
        && echo "stills: $name" || { echo "FAILED: stills $name"; failed=$((failed+1)); } ;;
    key-*:*)
      mkdir -p assets/keys
      ffmpeg -nostdin -loglevel error -y -i "$file" -vf "scale='min(1600,iw)':-2" -q:v 3 "assets/keys/$name.jpg" \
        && echo "keyframe: $name" || { echo "FAILED: converting $name"; failed=$((failed+1)); } ;;
    packshot:*)
      mkdir -p assets/media
      ffmpeg -nostdin -loglevel error -y -i "$file" -vf "scale='min(1400,iw)':-2" -q:v 2 assets/media/packshot.jpg \
        && echo "packshot" || { echo "FAILED: converting packshot"; failed=$((failed+1)); } ;;
    *:png|*:jpg|*:jpeg|*:webp)
      mkdir -p assets/media
      ffmpeg -nostdin -loglevel error -y -i "$file" \
        -vf "scale='min(1920,iw)':'min(1400,ih)':force_original_aspect_ratio=decrease" -q:v 4 "assets/media/$name.jpg" \
        && echo "image: $name" || { echo "FAILED: converting $name"; failed=$((failed+1)); } ;;
    *) echo "skipped: $name ($ext)" ;;
  esac
done < tools/media.txt

mapfile -t segs < <(printf '%s\n' "${!frames_for[@]}" | grep . | sort -V)
if [ "${#segs[@]}" -gt 0 ]; then
  ext=webp
  encoders=$(ffmpeg -hide_banner -encoders 2>/dev/null)
  [[ $encoders == *libwebp* ]] || ext=jpg
  rm -rf assets/film; mkdir -p assets/film
  start=0; parts=""; size=""
  for i in "${!segs[@]}"; do
    name=${segs[$i]}; want=${frames_for[$name]}
    in=$(ls "$src/$name".* | head -1)
    norm="$src/$name.norm.mp4"
    if ! ffmpeg -nostdin -loglevel error -y -i "$in" -an \
        -vf "fps=24,scale=${FRAME_W}:-2:flags=lanczos,setsar=1,format=yuv420p" -c:v libx264 -preset fast -crf 10 "$norm"; then
      echo "FAILED: normalising $name"; exit 1
    fi
    total=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$norm")
    total=$(awk -v t="$total" -v k="${keep_for[$name]}" 'BEGIN { n = int(t * k + 0.5); print (n < 2 ? 2 : n) }')
    [ -z "$size" ] && size=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$norm")
    # The first segment keeps its first frame; later ones start where the previous one ended.
    first=0; [ "$i" -gt 0 ] && first=1
    avail=$(( total - first ))
    [ "$want" -gt "$avail" ] && want=$avail
    [ "$want" -lt 2 ] && want=2
    pick=""
    for ((k = 1; k <= want; k++)); do
      if [ "$first" -eq 0 ]; then  # want frames over [0, total-1], both ends included
        n=$(( ((k - 1) * (total - 1) * 2 + (want - 1)) / ((want - 1) * 2) ))
      else                         # want frames over (0, total-1], ending on the last one
        n=$(( (k * (total - 1) * 2 + want) / (want * 2) ))
      fi
      pick+="${pick:++}eq(n\\,$n)"
    done
    if [ "$ext" = webp ]; then
      enc=(-c:v libwebp -quality 72 -compression_level 6)
    else
      enc=(-q:v 4)
    fi
    if ! ffmpeg -nostdin -loglevel error -y -i "$norm" -vf "select='$pick'" -fps_mode passthrough \
        "${enc[@]}" -start_number "$start" "assets/film/%03d.$ext"; then
      echo "FAILED: extracting frames from $name"; exit 1
    fi
    got=$(( $(ls assets/film/*."$ext" | wc -l) - start ))
    parts+="${parts:+,}{\"name\":\"$name\",\"start\":$start,\"count\":$got}"
    echo "segment $name: $got of $total frames"
    start=$(( start + got ))
  done
  printf '// Generated by tools/fetch-media.sh: the scroll film'"'"'s frames.\nwindow.FILM = {"count":%d,"ext":"%s","width":%d,"height":%d,"segments":[%s]};\n' \
    "$start" "$ext" "${size%x*}" "${size#*x}" "$parts" > assets/film/film.js
  echo "film: $start frames, $size $ext, $(du -sh assets/film | cut -f1) total"
fi

rm -rf "$src"
[ "$failed" -eq 0 ] || { echo "$failed download(s) failed"; exit 1; }
