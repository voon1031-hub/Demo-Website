// Renders tools/image-sheet.html (made by build_site.py) into transparent PNGs in
// assets/img/: the logo in dark and light, and one image per coffee bag. The
// Elementor templates use these because WordPress doesn't accept SVG uploads.
//   npm install playwright && npx playwright install chromium
//   node coffee/tools/render-images.js
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

(async () => {
  const out = path.join(__dirname, "..", "assets", "img");
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.goto("file://" + path.join(__dirname, "image-sheet.html"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  for (const el of await page.$$("[data-shot]")) {
    const name = await el.getAttribute("data-shot");
    await el.screenshot({ path: path.join(out, name + ".png"), omitBackground: true });
    console.log("assets/img/" + name + ".png");
  }
  await browser.close();
})();
