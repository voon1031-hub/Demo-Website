# Demo-Website

## OWN TONE 本色 – "Made to disappear"

A single-page site for a foundation brand with 40 shades. The page itself is a
shade card: its background is one of the 40 foundation shades, moving from the
lightest (100C) at the top to the deepest (590C) at the bottom as the visitor
scrolls. Picking a shade (the 40 dots under the headline, the "All 40" wall or
the shade finder) holds the whole page in that skin tone until "恢复色阶" is
pressed. Text and surfaces switch between dark and light ink so every shade
keeps readable contrast.

Headlines and navigation are in English, set in an original typeface; the
explanations and product copy are in Chinese.

**Opening film.** On the first visit in a session a short film plays full
screen: a drop of foundation falls onto white, spreads and floods the screen
in porcelain, then fades into the page as the headline rises. Click, Skip,
Escape or Enter skip it. It never plays with reduced motion turned on or when
the page is opened at an anchor.

**Scroll film.** The first screen stays pinned while the visitor scrolls, and
the scroll plays a product film frame by frame: the pump presses, a drop
falls, and the drop is spread into a swatch (scrolling back plays it
backwards). The film is shot on white and drawn with multiply, so the white
takes on whatever shade the page is in. Phones show a crop around the bottle
and load every other frame. With reduced motion the film is replaced by its
last frame.

- `index.html` – the whole site. The brand details (currency, contact email,
  Instagram, free-shipping threshold and the footer note about AI images) are
  in the config block at the top. The six products are plain HTML cards in the
  "Shop" section, each carrying its price, category, finish and search
  keywords. The 40 shades are mixed from the six colours in `SHADE_STOPS` in
  the script at the bottom of the file.
- `assets/fonts/owntone-display.woff2` – **OWN TONE Display**, the headline
  face drawn for this site: wide, heavy geometric capitals, figures and
  punctuation, plus the brand characters 本 and 色. Every dot (. : ; ! ? ·) is
  a true circle, the zero is a pill like the buttons, and lowercase letters set
  as capitals.
- `tools/font/build-display.py` – draws that face from geometry and writes the
  WOFF2 (and `tools/font/owntone-display.otf` for installing on a computer).
  To change a letter, edit its function and run
  `python3 tools/font/build-display.py` (needs
  `pip install fonttools skia-pathops brotli`).
- `assets/fonts/albert-sans-var.woff2` – Albert Sans (SIL Open Font License,
  see `OFL-AlbertSans.txt`), subset to Latin, for English body text. Chinese
  body text uses the visitor's system font (PingFang, Microsoft YaHei, Noto
  Sans SC).
- `assets/film/` – the scroll film as 150 WebP frames (`000.webp` to
  `149.webp`, 1.7 MB in all), `end.jpg` (the last frame, used as the still)
  and `frames.js`, which lists the frame count and, for each frame, how far
  into the scroll it sits: frames where a lot changes get more scrolling.
- `assets/media/intro.webm` and `intro.mp4` – the opening film.
- `assets/media/cut-*.webp` – the product images with transparent backgrounds,
  so they sit straight on the page colour: liquid foundation, the six-shade
  line-up, cushion, stick, skin tint, concealer, setting powder and a texture
  swatch. `share.jpg` is the link preview image, `assets/favicon.svg` the tab
  icon.

The product images were generated with Higgsfield (GPT Image 2.5); the
opening film and the three film segments with FLUX 3 Video, each segment
starting on the previous segment's last keyframe so the joins are seamless.
Products,
prices, ingredients and figures are samples. The sample sign-up form and the
checkout button do not send anything. Replace the pictures and data before
the site goes live, then set `imageNote` in the config block to `""` to
remove the footer note.

Serve the folder with any static server (for example `python3 -m http.server`)
and open `index.html`; browsers block web fonts on pages opened straight from
the disk.

### Regenerating images and films

The cloud dev environment can't download from the media host, so a GitHub
Actions workflow (`.github/workflows/fetch-media.yml`) does it: it runs
`tools/fetch-media.sh` on pushes that change `tools/media.txt` (on the branch
named in the workflow; it can also be started by hand from the Actions tab),
then commits the results back to the branch.

`tools/media.txt` lists one `name url` per line:

- `cut-*` images keep their transparent background, are trimmed to the
  product and become `assets/media/<name>.webp`;
- other images become `assets/media/<name>.jpg`;
- `film-1`, `film-2`, `film-3` are the scroll film segments, joined in order
  and cut into the frames in `assets/film/` (with the near-white backdrop
  lifted to pure white);
- other videos become `assets/media/<name>.mp4` and `.webm`.

Files that are already in `assets/` are skipped, and the film is only cut
again when its `film-*` lines change; start the script with `FORCE=1` to fetch
everything again.
