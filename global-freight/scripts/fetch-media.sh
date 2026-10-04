#!/usr/bin/env bash
# Downloads the Higgsfield-generated media listed in media/manifest.txt and
# prepares it for the web. Runs on a GitHub runner (see
# .github/workflows/fetch-global-freight-media.yml) because the cloud dev
# environment can't reach the media host.
#
# Manifest line format:  <kind> <output path> <source url>
#   file   saved as-is (SVG logos)
#   image  JPG, at most 1920 px wide (style frames, posters)
#   video  seamless-loop H.264 MP4, long edge 1280 px, no audio,
#          plus a poster JPG next to it (<name>.jpg)
#   scrub  H.264 MP4 for scroll-controlled playback: no loop, a keyframe
#          every 4 frames so seeking stays smooth, plus a poster JPG.
#          Several comma-separated URLs are joined end to end first.
# Entries whose output already exists are skipped, so the script is safe to re-run.
# Needs: curl, ffmpeg, ffprobe. Run from global-freight/: bash scripts/fetch-media.sh
set -uo pipefail
cd "$(dirname "$0")/.."

FADE=1 # seconds of crossfade that hide the loop point
tmp=$(mktemp -d)
failed=()

get() { curl -fsSL --retry 4 --retry-all-errors --retry-delay 3 -A "Mozilla/5.0" -o "$1" "$2"; }

loop_video() { # <src> <dest.mp4>
  local src=$1 dest=$2 dur offset
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
  offset=$(awk -v d="$dur" -v f="$FADE" 'BEGIN { printf "%.3f", d - 2 * f }')
  # Output = clip[FADE..end] with its last FADE seconds dissolving into clip[0..FADE],
  # so the final frame matches the first and the loop has no visible cut.
  ffmpeg -nostdin -loglevel error -y -i "$src" -an -filter_complex \
    "[0:v]split[a][b];[a]trim=start=${FADE},setpts=PTS-STARTPTS[main];[b]trim=0:${FADE},setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=${FADE}:offset=${offset},scale='if(gte(iw,ih),1280,-2)':'if(gte(iw,ih),-2,1280)',format=yuv420p[v]" \
    -map "[v]" -c:v libx264 -preset slow -crf 27 -maxrate 3M -bufsize 6M -g 48 \
    -movflags +faststart "$dest" &&
    ffmpeg -nostdin -loglevel error -y -i "$dest" -frames:v 1 -q:v 4 "${dest%.mp4}.jpg"
}

scrub_video() { # <src> <dest.mp4>
  ffmpeg -nostdin -loglevel error -y -i "$1" -an \
    -vf "scale='if(gte(iw,ih),1280,-2)':'if(gte(iw,ih),-2,1280)',format=yuv420p" \
    -c:v libx264 -preset slow -crf 26 -g 4 -keyint_min 4 -sc_threshold 0 \
    -movflags +faststart "$2" &&
    ffmpeg -nostdin -loglevel error -y -i "$2" -frames:v 1 -q:v 4 "${2%.mp4}.jpg"
}

while read -r kind dest url; do
  [[ -z "${kind:-}" || "$kind" == \#* ]] && continue
  [[ -e "$dest" ]] && continue
  mkdir -p "$(dirname "$dest")"
  ok=1
  case "$kind" in
    file) get "$dest" "$url" || ok=0 ;;
    image)
      get "$tmp/src" "$url" &&
        ffmpeg -nostdin -loglevel error -y -i "$tmp/src" -vf "scale='min(1920,iw)':-2" -q:v 3 "$dest" || ok=0 ;;
    video) get "$tmp/src.mp4" "$url" && loop_video "$tmp/src.mp4" "$dest" || ok=0 ;;
    scrub)
      parts=()
      IFS=',' read -ra urls <<<"$url"
      for i in "${!urls[@]}"; do get "$tmp/part$i.mp4" "${urls[$i]}" && parts+=("$tmp/part$i.mp4") || ok=0; done
      if ((ok)) && ((${#parts[@]} > 1)); then
        inputs=(); filter=""
        for i in "${!parts[@]}"; do inputs+=(-i "${parts[$i]}"); filter+="[$i:v]"; done
        ffmpeg -nostdin -loglevel error -y "${inputs[@]}" -filter_complex "${filter}concat=n=${#parts[@]}:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 16 "$tmp/src.mp4" || ok=0
      elif ((ok)); then mv "${parts[0]}" "$tmp/src.mp4"; fi
      ((ok)) && scrub_video "$tmp/src.mp4" "$dest" || ok=0 ;;
    *) echo "unknown kind: $kind"; ok=0 ;;
  esac
  if ((ok)); then echo "done: $dest ($(du -h "$dest" | cut -f1))"; else failed+=("$dest"); rm -f "$dest"; fi
done < media/manifest.txt

rm -rf "$tmp"
if ((${#failed[@]})); then printf 'FAILED: %s\n' "${failed[@]}"; exit 1; fi
