# Kaido House × MINI GT: 1:64 pre-order showcase

A promotional website for five Kaido House × MINI GT 1:64 diecast models, open for pre-order in August and September 2026. Plain HTML, CSS and JavaScript: no framework, no build step.

Status: style D (Premiere) picked; the opening sequence is being prototyped in `mockups/` before the full site is built.

This folder lives inside the Demo-Website repo and is self-contained: every path in it is relative, so it doesn't touch the Fornello site at the repo root.

## Preview locally

The pages read `data/products.json` with `fetch`, so open them through a local web server instead of double-clicking the file:

```sh
cd minigt
npx serve .
# or
python3 -m http.server 8000
```

Then open the address it prints, for example http://localhost:3000.

## What's in this folder

| Path | Contents |
| --- | --- |
| `data/products.json` | The five cars: product code, names, brand, category, pre-order month, race number, livery colours, description, features and image list |
| `assets/products/<code>/` | Cut-out WebP images for each view (`side`, `front`, `open`, `rear`, `top`) at full size plus an `-800` version, and the official pre-order sheet (`sheet.webp`) |
| `assets/source/` | The original pre-order sheets the cut-outs were made from |
| `mockups/` | Style directions: A (Sticker Bomb), B (Kaido Night) and C (Fresh on the Pegs), then the cinematic set D (Premiere), E (Studio Reveal) and F (Midnight Tokyo), with screenshots in `mockups/previews/` |

## Credits

Unofficial concept site, made as a portfolio piece. Kaido House, MINI GT, Nissan, Chevrolet and Gulf are trademarks of their respective owners. Product photos are preproduction samples from the official pre-order sheets. The full MINI GT catalogue is at https://minigt.tsm-models.com/.
