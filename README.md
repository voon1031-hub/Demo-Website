# Demo-Website

## Montciel Kairos – a film in one scroll

A single-page film for a fictional haute horlogerie maison, played by scrolling.
The camera starts above the clouds where the spire of Merdeka 118 breaks
through, descends over Kuala Lumpur, glides into a private salon in the
tower's crown, closes in on a platinum tourbillon watch on the desk, passes
through its dial into the movement, and rides the spinning tourbillon back up
into the sky at blue hour. The finale is drawn in code: sixty stars become the
seconds of a ring, the watch appears inside it, and the page tells visitors
how long their own journey took.

| Chapter | Scroll (vh) | What happens |
| --- | --- | --- |
| I The Sky | 0–280 | Above the clouds, down to Kuala Lumpur |
| II The Tower | 280–560 | Into the salon, onto the watch on the desk |
| III The Dial | 560–720 | The aventurine dial and the tourbillon aperture |
| IIII The Movement | 720–960 | Inside the movement |
| V Kairos | 960–1,400 | The whirlwind, the return to the sky, the ring |

100 vh is one screen of scrolling. Scrolling back plays everything in reverse.

### Files

- `index.html` – the page: stage, copy, interface, loader, private-viewing panel.
  All the words on the site are in this file.
- `css/style.css` – layout, type and motion curves.
- `js/config.js` – the film's timing: chapters, keyframe positions, when each
  piece of copy appears, the field-of-view gauge, light, and the sound mix.
  To change the brand name, edit `BRAND` here and the `MONTCIEL` text in
  `index.html`.
- `js/util.js` – shared helpers, including the house easing curves
  (`cubic-bezier(0.25, 1, 0.5, 1)` and two companions).
- `js/frames.js` – loads the film frames, the first chapter first, then the
  rest in the background, nearest to the viewer first.
- `js/renderer.js` – draws frames full screen like `object-fit: cover`. WebGL
  on desktop (frame crossfade, grain, vignette, fade to midnight), canvas 2D
  on phones, and placeholder frames when `assets/film/` is empty.
- `js/sound.js` – all sound is synthesised live with Web Audio: wind, the city,
  the room, the escapement at six beats a second, the whirlwind, a pad and the
  chime. Off until the visitor turns it on.
- `js/finale.js` – stars, the ring, the watch and the live counter.
- `js/main.js` – wires it together: Lenis smooth scrolling, GSAP ScrollTrigger,
  the copy timeline, snapping to resting points, and "Wind back".
- `js/vendor/` – GSAP 3.15 (ScrollTrigger, CustomEase) and Lenis 1.3, served
  from the site so it works offline and from any host.
- `assets/film/` – the film as WebP frames plus `film.js`, generated.
- `assets/keys/` – the twelve keyframe stills the film was generated from.
- `assets/media/packshot.jpg` – the watch shown in the finale.

Phones and touch screens get a lighter version: every second frame, no WebGL
effects. With "reduce motion" switched on, the film steps between keyframe
stills instead of moving.

### Viewing it

Serve the folder with any static server (for example `python3 -m http.server`)
and open `index.html`. Opening the file straight from disk also works, but some
browsers refuse WebGL textures from local files; the page then falls back to
the 2D renderer.

### Regenerating media

All images and video segments were generated with Higgsfield (keyframes with
GPT Image 2.5, segments with Kling 3.0 from a first and a last keyframe, so
each segment starts exactly where the previous one ends).

The cloud dev environment can't download from the media host, so a GitHub
Actions workflow (`.github/workflows/fetch-media.yml`) does it: it runs
`tools/fetch-media.sh` on pushes that change `tools/media.txt` (on the branch
named in the workflow; it can also be started by hand from the Actions tab),
then commits the results back to the branch.

`tools/media.txt` lists one `name url [frames]` per line:

- `key-NN` images become `assets/keys/key-NN.jpg`;
- `packshot` becomes `assets/media/packshot.jpg`;
- `film-NN` videos are the film's segments, taken in name order. Each one's
  first frame is dropped (it repeats the previous segment's last frame), then
  `frames` evenly spaced frames are kept and written to `assets/film/`, with
  `assets/film/film.js` listing where each segment starts.

Montciel and Kairos are fictional, and all imagery is AI-generated.
