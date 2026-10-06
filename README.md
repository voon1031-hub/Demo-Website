# Demo-Website

## OWN TONE 本色 – "Made to disappear"

A single-page site for a foundation brand with 40 shades. The page itself is a
shade card: as the visitor scrolls, its background runs through all 40
foundation shades, from the lightest (100C) at the top to the deepest (590C) at
the bottom, a little with every bit of scrolling. Each section's own shade is
reached where a link to that section lands. Picking a shade (the 40 dots under
the headline, the "All 40" wall or the shade finder) holds the whole page in
that skin tone until "恢复色阶" is pressed. Text switches between dark and light
ink, with a short fade, so every shade keeps readable contrast.

Headlines and navigation are in English, set in an original typeface; the
explanations and product copy are in Chinese.

**Opening film.** On the first visit in a session a short film plays full
screen for about four seconds: a drop of foundation falls onto white and
spreads. While the pool is still spreading, the picture dissolves into the page
colour and the page rises underneath, so there is no pause and no cut. Click,
Skip, Escape or Enter skip it. It never plays with reduced motion turned on or
when the page is opened at an anchor. If the film is replaced, set `WASH` and
`REVEAL` in the opening-film script: the seconds into the film where it starts
to dissolve and where the page appears.

**Headline film.** The headline is a window: inside the letters of MADE TO
DISAPPEAR. a film of foundation in several shades, marbled together, slowly
swirls. The letters are a mask drawn from the display face, so nothing else
crowds the headline. The film loops (its last second cross-fades into its
first), starts when the opening film ends, pauses while the headline is off
screen and stays on its first frame with reduced motion.

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
- `assets/hero-type.svg` – the hero headline as outlines, used as the mask the
  headline film plays through. `python3 tools/font/hero-mask.py` draws it from
  the font, set as the page sets the headline; run it after changing the font
  and copy the position of the red dot it prints into `.type-dot`.
- `assets/fonts/albert-sans-var.woff2` – Albert Sans (SIL Open Font License,
  see `OFL-AlbertSans.txt`), subset to Latin, for English body text. Chinese
  body text uses the visitor's system font (PingFang, Microsoft YaHei, Noto
  Sans SC).
- `assets/media/intro.webm` and `intro.mp4` – the opening film.
- `assets/media/type.webm`, `type.mp4` and `type-poster.jpg` – the headline
  film and its first frame.
- `assets/media/cut-*.webp` – the product images with transparent backgrounds,
  so they sit straight on the page colour: liquid foundation, the six-shade
  line-up, cushion, stick, skin tint, concealer, setting powder and a texture
  swatch. `share.jpg` is the link preview image, `assets/favicon.svg` the tab
  icon.

The product images and the keyframes were generated with Higgsfield (GPT Image
2.5); the opening film and the headline film with FLUX 3 Video.
Products, prices, ingredients and figures are samples. The sample sign-up
form and the checkout button do not send anything. Replace the pictures and
data before the site goes live, then set `imageNote` in the config block to
`""` to remove the footer note.

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
- videos become `assets/media/<name>.mp4` and `.webm`, plus
  `<name>-poster.jpg` (the first frame). An ffmpeg filter after the url runs
  first: the headline film cross-fades its last second into its first, so it
  loops, and keeps only its middle band (`crop=iw:ih*0.46`), because that is
  all the letters show.

Files that are already in `assets/` are skipped; start the script with
`FORCE=1` to fetch everything again.
