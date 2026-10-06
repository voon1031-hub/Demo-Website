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
- `assets/media/cut-*.webp` – the product images with transparent backgrounds,
  so they sit straight on the page colour: liquid foundation, the six-shade
  line-up, cushion, stick, skin tint, concealer, setting powder and a texture
  swatch. `share.jpg` is the link preview image, `assets/favicon.svg` the tab
  icon.

The product images were generated with Higgsfield (GPT Image 2.5). Products,
prices, ingredients and figures are samples. The sample sign-up form and the
checkout button do not send anything. Replace the pictures and data before
the site goes live, then set `imageNote` in the config block to `""` to
remove the footer note.

Serve the folder with any static server (for example `python3 -m http.server`)
and open `index.html`; browsers block web fonts on pages opened straight from
the disk.

### Regenerating product images

The cloud dev environment can't download from the media host, so a GitHub
Actions workflow (`.github/workflows/fetch-media.yml`) does it: it runs
`tools/fetch-media.sh` on pushes that change `tools/media.txt` (on the branch
named in the workflow; it can also be started by hand from the Actions tab),
then commits the results back to the branch.

`tools/media.txt` lists one `name url` per line:

- `cut-*` images keep their transparent background, are trimmed to the
  product and become `assets/media/<name>.webp`;
- other images become `assets/media/<name>.jpg`;
- videos become `assets/media/<name>.mp4`.
