// Renders the site frame by frame along a scroll timeline.
// usage: node capture.js <timeline.json> <outdir> [dpr] [width] [height]
// timeline.json: [scrollY, scrollY, ...] one entry per output frame
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [,, timelinePath, outDir, dprArg, wArg, hArg] = process.argv;
  const ys = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +(wArg || 1440), height: +(hArg || 900) }, deviceScaleFactor: +(dprArg || 1.5) });
  await page.goto('http://127.0.0.1:8082/index.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; });
  });
  await page.waitForFunction(() => window.__framesReady && window.__framesReady(), null, { timeout: 60000 });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 60000 });
  await page.waitForTimeout(1800);                       // let the headline finish rising
  const twoFrames = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  for (let i = 0; i < ys.length; i++) {
    await page.evaluate((y) => { window.scrollTo(0, y); window.__render(); }, ys[i]);
    await twoFrames();
    await page.screenshot({ path: `${outDir}/f${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 95 });
    if (i % 60 === 0) console.log('frame', i, '/', ys.length);
  }
  await browser.close();
})();
