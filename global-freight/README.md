# Global freight: brand site

Single-page, scroll-driven brand site for a global air, ocean and land freight company.
Vite + React + TypeScript + Tailwind CSS v4, GSAP ScrollTrigger and Lenis.

**Status:** round 1 (style sample). Built so far: Nav, Hero, Ocean.
The other sections show as dashed placeholders until the style is approved.

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
| Company name, short name, slogan, logo, contact details, headline numbers | `src/config/brand.ts` |
| Every image on the page (source, alt text, recommended size, shot brief) | `src/config/media.ts` |
| All other copy (English) | `src/content/en.ts` |
| Colours, fonts, type scale, shared photo grade | `src/styles/index.css` |
| Hero map routes and hub cities | `src/sections/heroRoutes.ts` |

### Replace the logo

Put the file in `public/media/` (SVG preferred), then in `src/config/brand.ts` set
`logo.src` to `'/media/your-logo.svg'` and adjust `width`/`height`.
With `src` empty, a placeholder mark plus `brand.name` is shown.

### Replace images

1. Open the site with `?media` at the end of the URL (e.g. `http://localhost:5173/?media`).
   Each image shows an orange tag with its slot id and the recommended size.
2. Export your photo at that size and save it in `public/media/`.
3. In `src/config/media.ts`, set that slot's `src` to `'/media/<file>'` and rewrite `alt`
   to describe your photo.

Every slot has a `brief` describing the shot (camera angle, subject), which you can hand
to a photographer or use as an image-generation prompt. When a slot has no image or the
image fails to load, the id and brief show in its place.

All images get the same grade in CSS (`.media-frame` in `src/styles/index.css`): slightly
muted colour, cool shadows, a dark falloff at the bottom and fine grain. Mixed sources
(stock, shoot, AI) end up matching. Tune it there, once, for the whole site.

The current Unsplash links are temporary placeholders. Replace them before launch.

### Add a language

1. Copy `src/content/en.ts` to `src/content/zh.ts`, rename the export to `zh`, and translate.
   TypeScript reports any missing string.
2. Register it in `src/content/index.ts` (`const locales = { en, zh }`).
3. Set `locale` in `src/config/brand.ts`, or wire a language switcher to `useContent(locale)`.

### Change the hero map

`src/assets/world-land.ts` is generated. To regenerate it (e.g. at a different
resolution), run `npm run build:world`. Routes and hubs are defined by longitude and
latitude in `src/sections/heroRoutes.ts`.

## Motion and accessibility

- All scroll and ambient animation is gated behind `prefers-reduced-motion: no-preference`.
  With reduced motion turned on, smooth scrolling and pinning are off, the Ocean section
  stacks vertically, and the hero shows a static frame.
- Animations use transform, opacity and clip-path only.
- Keyboard: a skip link comes first, nav links move focus to their section, and the
  mobile menu closes with Esc.
