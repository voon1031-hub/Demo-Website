# Demo-Website

## Shang Hai Restaurant – "Pull up a chair"

A single-page site for Shang Hai Restaurant, an old-school Chinese American
restaurant on Clearwater Ave in Kennewick, WA, open since 2001. It is written
for local diners who may be new to Chinese food. The page opens on a wok
tossing fried rice over a roaring flame ("The breath of the wok"). Below it, the
restaurant's own dishes sit on a slowly turning lazy susan ("Pull up a chair.").
Every dish shows its Chinese name, and many have a short story behind them.
Guests build an order list on the page and then call it in.

The look is 1930s Shanghai Art Deco: the jade green of the Bund's copper roofs,
gold line work, a cream paper menu card and a cinnabar seal.

- `index.html` – the page. The phone number, address, opening hours and the
  optional online-ordering link are in the config block at the top.
- `menu.js` – the whole menu: 20 sections and 158 dishes. Each dish has its
  price, photo, Chinese name with pinyin and story, plus the choices it comes
  with (rice, soup, size, the items on a pick-your-own plate). The file also
  lists which dishes sit on the turning table and in House favorites. Prices
  are from the old site's January 2024 menu.
- `assets/menu/` – the restaurant's own dish photos with the background removed,
  in two sizes each (`<dish>.webp` and `<dish>-sm.webp`).
- `assets/media/` – the wok loop at the top of the page and the three
  house-favorite loops (MP4, WebM for browsers without H.264, and a JPEG poster
  each), and `share.jpg` for link previews.
- `assets/fonts/` – Limelight (headings), Jost (text) and a subset of ZCOOL
  XiaoWei for the Chinese characters. All three are under the SIL Open Font
  License and self-hosted.

Open `index.html` in a browser, or serve the folder with any static server.

### How ordering works

The restaurant takes orders by phone. Guests tap + next to a dish, or open the
dish to choose a size, rice or soup and how many. The list is saved in the
browser on that device. "Your order" shows the list with an estimated total
before tax and a "Call (509) 783-8998 to order" button. Guests read the list
out when the restaurant picks up. If the restaurant starts taking orders online,
put that page's address in `orderLink` in the config block, and an "Order
online" button appears next to the call button.

Dishes without a photo show the Chinese character for their main ingredient
(鸡 chicken, 牛 beef, 虾 shrimp …). The "Read the plate" box on the page
teaches the six most common ones.

### Editing the menu

- Change a price or a name: edit that dish's line in `menu.js`.
- Add or replace a photo: `python3 tools/prepare-photo.py photo.png dish-name`
  (best with the background removed), then set `photo: "dish-name"` on the dish.
- After adding or changing Chinese text, run `python3 tools/subset-cjk-font.py`
  so the Chinese font includes the new characters (needs
  `pip install fonttools brotli`).

### Pictures

The dish photos come from the restaurant's old website. The three house-favorite
loops are AI-generated from those photos. GPT Image 2.5 placed each dish on a
lacquered table, and Kling 3.0 added the steam; the first and last frames match,
so they loop smoothly. The wok scene is entirely AI-generated. The footer says
so (`imageNote` in the config block).

Before the site goes live, check these with the owner:

- prices, which date from January 2024;
- the opening hours, copied from the old site;
- the Chinese dish names;
- which dishes to feature on the turning table and in House favorites (they were
  picked for the page, not from sales);
- that the owner is happy with the AI loops.

While it's a demo, the page asks search engines not to index it, so it isn't
taken for the restaurant's official site. When it becomes the real site, delete
the `<meta name="robots">` line near the top of `index.html`. Also change the
two `https://voon1031-hub.github.io/Demo-Website/` addresses in the `og:` tags
to the new address, so links shared on Instagram, Facebook or iMessage keep
their preview picture.

### Regenerating media

The cloud dev environment can't download from the media host, so a GitHub
Actions workflow (`.github/workflows/fetch-media.yml`) does it. It runs
`tools/fetch-media.sh` whenever a push changes `tools/media.txt` on the branch
named in the workflow, and can also be started by hand from the Actions tab.
It then commits the results to `assets/media/`. `tools/media.txt` lists one
`name url` per line: images become `<name>.jpg`, videos become `<name>.mp4`
(silent, H.264, at most 1280px) plus `<name>.webm` (VP9).

### Copying the old site

The old Weebly site can't be reached from the cloud dev environment either.
`tools/scrape-site.mjs` and `tools/scrape-images.py`, run by
`.github/workflows/scrape-site.yml` (started by hand from the Actions tab),
render it in Chromium on a GitHub runner and commit a copy to `scrape/`. The copy includes every page's text, the store's
categories and dishes, screenshots and photos. The menu in `menu.js` was built
from that copy; the copy itself was removed afterwards and stays in the git
history.

### Design skills for Claude Code

`.claude/skills/` holds the skills Claude Code uses when working on the site.
Besides `frontend-design`, it has the seven skills from
[ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
v2.13.0 (MIT, see `.claude/skills/LICENSE-ui-ux-pro-max.txt`): `ui-ux-pro-max`,
`ui-styling`, `design`, `design-system`, `brand`, `banner-design` and `slides`.
They load automatically in any Claude Code session opened on this repo. To
update them, copy the newer `.claude/skills/` folders from that repository
over these ones.
