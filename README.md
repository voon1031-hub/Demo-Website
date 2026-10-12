# Demo-Website

## The Little Store – café menu and flowers

A two-page site for The Little Store on Woodside Road, a café and flower shop.
The café page is built for three ways people read a menu: on a phone at the
table after scanning a QR code, while checking it before a visit, and when
ordering online (the order buttons open the shop's Toast page). The flowers
page lists the wrapped bouquet, the four vase sizes and the two subscriptions.

- `content.js` – everything that changes: shop details (address, phone,
  emails, hours, order links), the café menu and the flowers list. Both pages
  are built from it, so a new price or a new dish is a one-line change there.
  The comment at the top of the file explains each field.
- `index.html` – the café menu: All day (eggs, toast, bowls), Sandwiches,
  Salads, Coffee (espresso, brewed, seasonal) and Tea. On phones a bar of
  section buttons stays at the top while scrolling; on wide screens the
  sections are listed in a column on the left. The "Open now" line follows the
  hours in `content.js` in Woodside time, and the marigold beside it folds into
  a bud while the shop is closed.
- `flowers.html` – bouquet, vase arrangements and subscriptions, each linking
  to the shop's flower ordering page.
- `assets/site.css`, `assets/site.js` – shared styles, and the script that
  builds both pages from `content.js`.
- `assets/flowers/` – product photos, cropped from screenshots of the current
  flowers page, so they are only 428 px square. Swap in the original photo
  files (same names) for sharper pictures.
- `assets/fonts/` – Fraunces (soft serif: headings, dish names) and Karla
  (descriptions, buttons), SIL Open Font License, self-hosted and trimmed to
  Latin characters.

Open `index.html` in a browser, or serve the folder with any static server,
for example `python3 -m http.server`.

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
