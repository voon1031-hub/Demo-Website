# Demo-Website

## 叻山咖啡 Lat Hill Coffee – `coffee/`

A bilingual (中文 / English) site for an online-only Malaysian roaster of
Vietnamese coffee: four pages (home, about, coffee & services, contact), prices
in RM, ordering on WhatsApp. The home page opens on a full-screen looping video
of the Da Lat coffee hills; short clips of the harvest, roasting, phin drip and
pour-over play in the sections as they scroll into view, and a draggable roast
curve shows how flavour changes through the roast.

- Open `coffee/index.html` in a browser. The 中 / EN switch in the header
  changes the whole site and remembers the choice; `?lang=en` links straight to
  English.
- All text, in both languages, is in `coffee/tools/content.py` (also the
  WhatsApp number, email and roast days). After editing it, rebuild:
  `python3 coffee/tools/build_site.py` for the static pages and
  `python3 coffee/tools/build_elementor.py` for the WordPress templates.
- `coffee/elementor/` – Elementor templates (Chinese and English) for moving the
  site to WordPress, with a step-by-step guide in `coffee/elementor/README.md`.
- `coffee/assets/media/` – the videos and their poster frames, made by the
  "Fetch coffee site media" workflow from `coffee/tools/media.txt` (seamless
  loops: the hero plays forward and back, the clips crossfade their end into
  their start). `coffee/assets/img/` – logo and coffee-bag PNGs for the
  templates, rendered by `coffee/tools/render-images.js`.

This is a practice site: the videos are AI-generated placeholders, and the
names, testimonials and figures are samples. Orders go to WhatsApp
+65 9048 7168; the footer has no social media links until some are added to
`SOCIAL` in `content.py`.

## Plumbline Builders – "From the ground up"

A dark, cinematic single-page site for a design-and-build construction company.
The opening screen is a construction timelapse driven by scrolling: the page
opens on an unfinished concrete frame, and as the visitor scrolls the house is
built from the bottom up (slabs and roof, walls, windows and finishes) until
the lights come on. Scrolling back up takes the build back down.

- `index.html` – the whole site. The company name, phone, email, office hours
  and the four figures next to "One team from survey to keys" are in the config
  block at the top of the file. Services, projects and the five steps are plain
  text further down.
- `assets/build/` – the hero timelapse as 120 WebP frames (`000.webp` to
  `119.webp`), plus `frames.js`, which tells the page how many there are.
- `assets/media/` – photos and project clips: `house.jpg` (finished house,
  also the contact background and share image), `svc-*.jpg` (services),
  `prj-*.jpg` (project photos) and `clip-*.mp4` (short looping project videos
  that play while they are on screen).
- `assets/fonts/` – Archivo (variable width and weight, SIL Open Font License),
  self-hosted so headlines never fall back to a system font.

All pictures and videos are AI-generated placeholders, and the project names,
sizes and figures are samples. Replace them with real project photos and
numbers before the site goes live, then set `imageNote` in the config block to
`""` to remove the footer note about AI images.

Open `index.html` in a browser, or serve the folder with any static server.

### Regenerating media

The cloud dev environment can't download from the media host, so a GitHub
Actions workflow (`.github/workflows/fetch-media.yml`) does it: it runs
`tools/fetch-media.sh` on pushes that change `tools/media.txt` (on the branch
named in the workflow; it can also be started by hand from the Actions tab),
then commits the results back to the branch.

`tools/media.txt` lists one `name url` per line:

- images become `assets/media/<name>.jpg`;
- videos become `assets/media/<name>.mp4`; `clip-*` videos are played forward
  then backward so they loop without a jump;
- `build-1`, `build-2`, `build-3` are the timelapse segments, each starting on
  the previous one's last frame. They are joined in order and cut into the
  frames in `assets/build/`.
