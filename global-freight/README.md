# Global freight: brand site

Single-page, scroll-driven brand site for a global air, ocean and land freight company.
Vite + React + TypeScript + Tailwind CSS v4, GSAP ScrollTrigger and Lenis.

**Status:** all sections built: Hero (container doors), About, Air (globe →
descent → plane), Ocean, Land (drone sweep), Network, How it works, Why us,
Contact (quote form) and footer.

## Run locally

Requires Node 20+.

```bash
cd global-freight
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build at http://localhost:4173
```

## Where to change things

| What | File |
|---|---|
| Company name, short name, slogan, logo, email, WhatsApp, headline numbers | `src/config/brand.ts` |
| Every video/image slot (files, alt text, recommended size, shot brief) | `src/config/media.ts` |
| All other copy (English) | `src/content/en.ts` |
| Colours, fonts, type scale, shared photo grade | `src/styles/index.css` |
| Network hubs and lanes | `src/sections/Network.tsx` (`HUBS`, `LANES`) |
| Air globe routes and hubs | `src/lib/globe.ts` |

### Replace the logo

The logo mark is `public/media/logo-mark.svg` (the favicon is `public/favicon.svg`).
It was generated with Higgsfield (Recraft vector); the three original candidates are in
`design/logo-options/`. The company name is typed next to the mark in the site font, so it
follows `brand.name`. To use another mark, replace the SVG or change `logo.mark` in
`src/config/brand.ts`; set `logo.showName: false` if your file already contains the name.

### Replace footage

Every media slot is a short muted loop plus a poster image (first frame), listed in
`src/config/media.ts`. The current clips were generated with Higgsfield in the night
light-trails style. Open the site with `?media` to see each slot's id and size on the page.

To swap one, drop `name.mp4` + `name.jpg` into `public/media/` and point the slot at
`clip('name')`. Keep clips short (4–6 s), H.264, no audio, long edge about 1280 px.
Videos load only when their section comes near the screen; with reduced motion or
data saver on, the poster shows instead.

**Fetching new Higgsfield output:** the cloud dev environment can't reach Higgsfield's
media host, so `.github/workflows/fetch-global-freight-media.yml` does it on a GitHub
runner. Add a line to `media/manifest.txt` (`video <path> <url>`, `image …`, or `file …`)
and push to `claude/global-freight-site`; the runner downloads it, turns videos into
seamless loops with posters (`scripts/fetch-media.sh`), and commits the result.

### Add a language

1. Copy `src/content/en.ts` to `src/content/zh.ts`, rename the export to `zh`, and translate.
   TypeScript reports any missing string.
2. Register it in `src/content/index.ts` (`const locales = { en, zh }`).
3. Set `locale` in `src/config/brand.ts`, or wire a language switcher to `useContent(locale)`.

### The quote form

There is no backend. The two send buttons are real links: one opens WhatsApp, the
other the visitor's email app, with the request already written out, addressed to
the WhatsApp number and email in `src/config/brand.ts`. To send submissions to a
server or a form service instead, replace the links in `src/sections/Contact.tsx`.

### Maps

`src/assets/world-land.ts` (land outline used by the Network map and the globe) is
generated: `npm run build:world`. The globe loads a pre-rendered texture,
`public/media/globe-land.webp`; after changing the outline or map colours, run
`node scripts/render-globe-texture.cjs` (needs Playwright).

### Air hand-off frame

The globe zooms to a fixed frame and swaps to `media/air-descent.mp4`, whose first
frame is `design/handoff/air-handoff.png`. If you change the globe's camera path or
`HANDOFF` in `src/lib/globe.ts`, re-render that frame and regenerate the clip with it
as the start image, or the swap will show.

## Motion and accessibility

- All scroll and ambient animation is gated behind `prefers-reduced-motion: no-preference`.
  With reduced motion turned on, smooth scrolling and pinning are off, the Ocean section
  stacks vertically, and the hero shows a static frame.
- Animations use transform, opacity and clip-path only.
- Keyboard: a skip link comes first, nav links move focus to their section, and the
  mobile menu closes with Esc.
