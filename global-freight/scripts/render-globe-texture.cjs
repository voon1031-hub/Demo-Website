// Renders public/media/globe-land.webp from src/lib/landMap.ts, the same
// painter the globe falls back to. Run from global-freight/:
//   node scripts/render-globe-texture.cjs
// Needs Playwright with a Chromium build (NODE_PATH=$(npm root -g) if global).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

(async () => {
  const root = path.join(__dirname, '..');
  const bundle = path.join(os.tmpdir(), `landmap-${process.pid}.js`);
  execFileSync(path.join(root, 'node_modules/.bin/rolldown'), ['src/lib/landMap.ts', '--format', 'iife', '--name', 'LandMap', '--file', bundle], { cwd: root, stdio: 'inherit' });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addScriptTag({ content: fs.readFileSync(bundle, 'utf8') });
  const dataUrl = await page.evaluate(() => {
    const c = document.createElement('canvas');
    window.LandMap.paintLandMap(c);
    return c.toDataURL('image/webp', 0.9);
  });
  fs.writeFileSync(path.join(root, 'public/media/globe-land.webp'), Buffer.from(dataUrl.split(',')[1], 'base64'));
  fs.rmSync(bundle);
  await browser.close();
  console.log('wrote public/media/globe-land.webp');
})();
