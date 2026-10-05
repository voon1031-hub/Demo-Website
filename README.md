# Demo-Website

Personal portfolio for Voon: a dark, single-page site built with Next.js,
Tailwind CSS, Motion and Lenis. It builds to plain static files, so it can be
hosted anywhere. GitHub Pages is set up in this repo.

The page opens on the name rising over a lit horizon line. Below it, a bento
grid of glass cards shows the work: two live sites hosted in this repo and two
small studies that run inside their cards. The page closes on a second horizon
at the contact section.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
npm start          # serves out/ at http://localhost:3000
npm run lint
npm run typecheck
```

## Make it yours

Everything the page says lives in `src/content/site.ts`: name, role, pitch,
availability, email, time zone, links, projects, the about text and the contact
copy. The email is a placeholder (`hello@example.com`), so replace it first.

Each project has a `size` in the grid (`feature`, `tall` or `small`) and a
cover. A cover is either a photo or one of the two live studies. A photo can
also have a `video` that plays while the card is hovered. To add a photo, put
it in `src/assets/work/` and import it at the top of `site.ts`. Paths that
start with `/` point into `public/`.

## Where things are

| Path | What it does |
| --- | --- |
| `src/app/globals.css` | Design tokens (colours, curves, type roles) and base styles |
| `src/app/layout.tsx` | Mona Sans (self-hosted variable font), metadata, providers, film grain |
| `src/components/providers.tsx` | Lenis smooth scrolling and `MotionConfig` for reduced motion |
| `src/components/hero.tsx` | Name fitted to the column, rising on springs and setting on scroll; the dawn glow |
| `src/components/ui/button.tsx` | Magnetic button, glass button, rolling labels |
| `src/components/work/` | Bento grid, glass project card (tilt, cursor light, slow cover zoom, hover video), the spring and type studies |
| `src/components/reveal.tsx` | Fade, un-blur and rise as blocks scroll in |
| `src/components/about.tsx` | Statement that lights up word by word as you scroll |
| `src/components/contact.tsx` | Contact section, copy-address button |
| `src/lib/motion.ts` | Spring settings and cubic-bezier curves, shared with the CSS tokens |
| `public/projects/` | The Kaido House × Mini GT and Fornello sites, unchanged |

## Design system

- **Colour:** night `#09090b` (background), chalk `#ececee` (text), ash `#a3a3ab` and
  smoke `#8b8b93` (secondary text). Dusk `#d3a27a` and haze `#7d8cb2` are only ever used as
  light: glows, the status dot, the hover light on buttons.
- **Type:** one family, Mona Sans, with its weight (200–900) and width (75–125%) axes doing the
  hierarchy. Licensed under the SIL Open Font License (`src/app/fonts/MonaSans-OFL.txt`).
- **Glass:** `backdrop-blur-md bg-white/[0.03] border border-white/[0.08]`. On hover the
  border brightens and a soft light follows the cursor across the card and along its edge.
- **Motion:** springs for anything physical (the name, card tilt, the magnet) and three
  curves for everything else: `ease-out-expo`, `ease-out-quint` and `ease-in-out-quart`.
  All of it respects `prefers-reduced-motion`, and the page is fully readable without JavaScript.

## Hosted projects

- `public/projects/kaido-house/` is the Kaido House × Mini GT launch site. Its links, car
  details and media paths live in the config block at the top of its `index.html`.
- `public/projects/fornello/` is the Fornello pizzeria site.

Both are plain HTML and are copied into the build as they are.

## Deploy

`.github/workflows/pages.yml` lints, type-checks and builds every pull request, and deploys
`main` to GitHub Pages. It needs one setting, made once: **Settings → Pages → Build and
deployment → Source: GitHub Actions**.

The site is then served at `https://voon1031-hub.github.io/Demo-Website/`, and the hosted
projects at `/projects/kaido-house/index.html` and `/projects/fornello/index.html`.
For another host, run `npm run build` and upload `out/`.
