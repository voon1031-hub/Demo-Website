# Demo-Website

## Kaido House × Mini GT – "The street, at 1:64"

A cinematic, single-page brand site for the 2026 Kaido House × Mini GT lineup
(KHMG309, KHMG313, KHMG315, KHMG317, KHMG319). Each car gets its own scene:
a short video of the 1:64 model in a miniature real-world set, plus studio
photos of the preproduction samples.

- `index.html` – the whole site. All links, car details and media paths live in
  the config block at the top of the file.
- `assets/products/` – studio photos, cropped from the official preorder sheets.
- `assets/audio/theme.mp3` – optional background track. Add the file and a sound
  button appears in the header (browsers never autoplay sound).
- `assets/scenes/` – the opening cover (`cover.jpg`, `cover.mp4`), generated scene stills (`<code>.jpg`, `<code>-angle.jpg`)
  and background clips (`<code>.mp4`). Missing files fall back to the studio photo.

Open `index.html` in a browser, or serve the folder with any static server.
