# Demo-Website

## The Little Store – cover, café menu and flowers

A three-page site for The Little Store on Woodside Road, a café and flower
shop. The cover tells the shop's story around a looping video and sends
guests to the menu. The café page is built for three ways people read a
menu: on a phone at the table after scanning a QR code, while checking it
before a visit, and when ordering online (the order buttons open the shop's
Toast page). The flowers page lists the wrapped bouquet, the four vase sizes
and the two subscriptions.

- `content.js` – everything that changes: shop details (address, phone,
  emails, hours, order links), the café menu, the cover's headline and story,
  and the flowers list. Every page is built from it, so a new price or a new
  dish is a one-line change there. The comment at the top of the file
  explains each field.
- `index.html` – the cover. A looping video sits in an arch with the shop's
  name drifting over it, next to the headline, the open-now line and a
  "See the menu and order" button that opens the menu page; the story from
  the About page follows. The video pauses with its button, stops off screen,
  and stays still for anyone whose device asks for reduced motion.
- `assets/cover/` – the cover video as `store.webm` and `store.mp4` (the same
  16-second loop in two formats, so every browser can play one) and its first
  frame `store.jpg`. It is made from the interior photo on the current About
  page with a slow push towards the flowers. When there is footage of the
  shop, replace all three files under the same names.
- `menu.html` – the café menu: All day (eggs, toast, bowls), Sandwiches,
  Salads, Coffee (espresso, brewed, seasonal) and Tea. On phones a bar of
  section buttons stays at the top while scrolling; on wide screens the
  sections are listed in a column on the left. The "Open now" line follows the
  hours in `content.js` in Woodside time, and the marigold beside it folds into
  a bud while the shop is closed.
  Two tools sit on top of the menu:
  - **Your list** – a + beside every dish and extra keeps it on a list. A
    bar at the bottom shows how many and the menu total; tapping it opens the
    list, where quantities can be changed. The list is kept in the visitor's
    own browser only, and dishes later taken off the menu drop out of it.
  - **Search** – the magnifier in the section bar (on wide screens, the box
    above the sections, or the `/` key) narrows the menu to dishes and
    extras that mention a word, with or without accents ("gruyere" finds
    Gruyère).
- `flowers.html` – bouquet, vase arrangements and subscriptions, each linking
  to the shop's flower ordering page.
- `assets/site.css`, `assets/site.js` – shared styles, and the script that
  builds every page from `content.js`. Section titles rise and their marigold
  opens as they scroll into view, and flower photos bloom in; anyone whose
  device asks for reduced motion gets the page without these.
- `assets/picks.js` – the list and the search on the café menu.
- `assets/flowers/` – product photos, cropped from screenshots of the current
  flowers page, so they are only 428 px square. Swap in the original photo
  files (same names) for sharper pictures.
- `assets/fonts/` – Fraunces (soft serif: headings, dish names) and Karla
  (descriptions, buttons), SIL Open Font License, self-hosted and trimmed to
  Latin characters.

Open `index.html` in a browser, or serve the folder with any static server,
for example `python3 -m http.server`.

QR codes on the tables should open `menu.html` directly rather than the
cover, so guests land on the menu. A code can also open one section, for
example `menu.html#coffee` or `menu.html#tea`.

### Before going live

These came from the old site or from search results rather than from the
shop, so check them in `content.js`:

- the Toast ordering link (`orderFood`) and the flower ordering link
  (`orderFlowers`, which still points at the old flowers page);
- the phone number, both email addresses and the Instagram handle;
- the burrito's "salsa macha" (the old menu said "salsa, matcha");
- the soft-boiled egg add-on, which is 2 under All day and 4 under Salads.

### Design skills for Claude Code

`.claude/skills/` holds the skills Claude Code uses when working on the site.
Besides `frontend-design`, it has the seven skills from
[ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
v2.13.0 (MIT, see `.claude/skills/LICENSE-ui-ux-pro-max.txt`): `ui-ux-pro-max`,
`ui-styling`, `design`, `design-system`, `brand`, `banner-design` and `slides`.
They load automatically in any Claude Code session opened on this repo. To
update them, copy the newer `.claude/skills/` folders from that repository
over these ones.
