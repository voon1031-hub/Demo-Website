# Promo reel

`plumbline-reel.mp4` is a 12 s, 1080×1920 Instagram Reel. A hand swipes on a
laptop trackpad in warm amber light, and the house on the screen builds itself
as the page scrolls.

- `scene.mp4`: the laptop scene with no website on it yet, generated with
  Higgsfield (Kling 3.0, 24 fps, from the still `scene-start.png`, which was
  made with Nano Banana Pro using `site-start.jpg` as the screen reference).
- `quad.json`: the corners of the laptop display in `scene.mp4`, in pixels.
- `swipes.txt`: when each two-finger swipe starts and how far it scrolls the
  page, in `seconds:pixels` pairs measured from the hand in `scene.mp4`.

## Re-rendering after the site changes

The screen is a real recording of the site, so a new reel only needs a new
capture, with no new AI generation. You need Node with Playwright, Python 3
with OpenCV and NumPy, and ffmpeg. From this folder:

```sh
python3 tools/prepare-site.py .. /tmp/reel-site
npx http-server /tmp/reel-site -p 8082 &          # capture.js loads port 8082
python3 tools/timeline.py 24 289 /tmp/timeline.json $(cat swipes.txt)
node tools/capture.js /tmp/timeline.json /tmp/site-frames 1.5 1440 952
mkdir -p /tmp/scene && ffmpeg -i scene.mp4 -vsync 0 /tmp/scene/v%04d.png
python3 tools/composite.py /tmp/scene /tmp/site-frames quad.json plumbline-reel.mp4 --fps 24
```

`tools/analyze.py` is how the swipe timing and camera stability were measured,
if the scene video is ever regenerated.
