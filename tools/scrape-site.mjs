// Renders the old Weebly site in Chromium and saves what the new site needs from it:
// page text, rendered HTML, screenshots, links, images, and any JSON the pages load
// (the store's product data). Store product pages get a lighter pass (text, images,
// options) so combo choices and per-dish order links come along too.
//
//   node tools/scrape-site.mjs <start-url> [out-dir]
//
// Runs on a GitHub runner (see .github/workflows/scrape-site.yml), because the cloud
// dev environment can't reach weebly.com.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [start, out = 'scrape'] = process.argv.slice(2);
if (!start) throw new Error('usage: node tools/scrape-site.mjs <start-url> [out-dir]');
const origin = new URL(start).origin;
const MAX_PAGES = 40;     // ordinary pages (home, menu, store categories …)
const MAX_PRODUCTS = 160; // store product pages
fs.mkdirSync(path.join(out, 'products'), { recursive: true });

const isProduct = (u) => /\/store\/p\d+|\/product\//i.test(u.pathname);
const isAsset = (u) => /\.(jpe?g|png|gif|webp|svg|pdf|mp4|css|js)$/i.test(u.pathname);
const isCart = (u) => /\/store\/(checkout|cart)/i.test(u.pathname);
const clean = (href) => { const u = new URL(href); u.hash = ''; return u; };
const slugFor = (u) =>
  (u.pathname.replace(/^\/|\.html?$/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home').slice(0, 80);

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1400, height: 1000 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36',
});

async function render(url, { full }) {
  const page = await context.newPage();
  const xhr = [];
  page.on('response', async (res) => {
    if (!(res.headers()['content-type'] || '').includes('json')) return;
    try { xhr.push({ url: res.url(), status: res.status(), body: await res.text() }); } catch {}
  });
  try {
    await page.goto(url, { waitUntil: full ? 'networkidle' : 'load', timeout: full ? 90_000 : 45_000 });
  } catch (e) {
    console.log('slow or failed load:', url, e.message.split('\n')[0]);
  }
  if (full) {
    // Scroll to the bottom so lazy-loaded products and photos show up.
    let lastHeight = 0;
    for (let i = 0; i < 250; i++) {
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(150);
      const { y, h } = await page.evaluate(() => ({ y: scrollY + innerHeight, h: document.documentElement.scrollHeight }));
      if (y >= h - 4) {
        if (h === lastHeight) break;
        lastHeight = h;
        await page.waitForTimeout(1000);
      }
    }
    await page.evaluate(() => scrollTo(0, 0));
  }
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(full ? 1500 : 600);

  const dom = await page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return u; } };
    const text = (el) => (el ? el.innerText.trim().replace(/\s+/g, ' ') : '');
    const imgs = [...document.images].map((img) => ({
      src: img.currentSrc || img.src,
      srcset: img.getAttribute('srcset') || '',
      alt: img.alt,
      w: img.naturalWidth,
      h: img.naturalHeight,
      // the nearest link and the text around the image, to tie photos to dishes
      href: img.closest('a') ? img.closest('a').href : '',
      around: text(img.closest('a, li, article, figure, [class*="product"], [class*="item"]')).slice(0, 300),
    }));
    const bgs = new Set();
    for (const el of document.querySelectorAll('*')) {
      const bg = getComputedStyle(el).backgroundImage;
      for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) bgs.add(abs(m[1]));
    }
    const links = [...document.querySelectorAll('a[href]')].map((a) => ({ text: text(a).slice(0, 200), href: a.href }));
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,.wsite-content-title,[class*="title"]')]
      .map((h) => ({ tag: h.tagName, cls: h.className && String(h.className).slice(0, 80), text: text(h).slice(0, 200) }))
      .filter((h) => h.text);
    const selects = [...document.querySelectorAll('select')].map((s) => ({
      name: s.name || s.id || s.getAttribute('aria-label') || '',
      label: text(s.closest('label, div, fieldset')).slice(0, 200),
      options: [...s.options].map((o) => o.text.trim()),
    }));
    const choices = [...document.querySelectorAll('input[type=radio], input[type=checkbox]')].map((i) => ({
      name: i.name,
      label: text(i.closest('label') || i.parentElement).slice(0, 200),
    }));
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent);
    const meta = [...document.querySelectorAll('meta[name], meta[property]')].map((m) => ({
      k: m.getAttribute('name') || m.getAttribute('property'),
      v: m.getAttribute('content'),
    }));
    return { title: document.title, imgs, bgs: [...bgs], links, headings, selects, choices, ld, meta };
  });
  let bodyText = await page.innerText('body').catch(() => '');
  // Embedded stores and maps can live in iframes; keep their text and photos too.
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue;
    const inner = await frame
      .evaluate(() => ({
        text: document.body ? document.body.innerText : '',
        imgs: [...document.images].map((img) => ({ src: img.currentSrc || img.src, alt: img.alt, w: img.naturalWidth, h: img.naturalHeight })),
      }))
      .catch(() => null);
    if (!inner) continue;
    bodyText += `\n\n[iframe ${frame.url()}]\n${inner.text}`;
    dom.imgs.push(...inner.imgs.map((i) => ({ ...i, frame: frame.url() })));
  }
  const html = full ? await page.content() : '';

  const shots = [];
  if (full) {
    // Screenshots in 4000px slices; one huge full-page capture can fail on long menus.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, i = 0; y < height && i < 12; y += 4000, i++) {
      shots.push({ y, h: Math.min(4000, height - y) });
    }
  }
  return { page, dom, bodyText, html, xhr, shots };
}

const queue = [clean(start), clean(new URL('/menu.html', origin).href)];
const seen = new Set();
const pages = [];
const products = [];

while (queue.length) {
  const u = queue.shift();
  const key = u.href;
  if (seen.has(key) || u.origin !== origin || isAsset(u) || isCart(u)) continue;
  const product = isProduct(u);
  if (product ? products.length >= MAX_PRODUCTS : pages.length >= MAX_PAGES) continue;
  seen.add(key);

  const { page, dom, bodyText, html, xhr, shots } = await render(key, { full: !product });
  if (product) {
    const slug = slugFor(u);
    fs.writeFileSync(path.join(out, 'products', `${slug}.json`), JSON.stringify({ url: key, text: bodyText, ...dom }, null, 1));
    products.push({ url: key, slug, title: dom.title });
    console.log('product', products.length, key);
  } else {
    const slug = slugFor(u);
    fs.writeFileSync(path.join(out, `${slug}.html`), html);
    fs.writeFileSync(path.join(out, `${slug}.txt`), bodyText);
    fs.writeFileSync(path.join(out, `${slug}.json`), JSON.stringify({ url: key, ...dom, xhr }, null, 1));
    for (const [i, s] of shots.entries()) {
      await page
        .screenshot({ path: path.join(out, `${slug}-${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 55, fullPage: true, clip: { x: 0, y: s.y, width: 1400, height: s.h } })
        .catch((e) => console.log('screenshot failed', slug, i, e.message.split('\n')[0]));
    }
    pages.push({ url: key, slug, title: dom.title });
    console.log('page', pages.length, key, `(${shots.length} screenshots)`);
  }
  await page.close();

  // Follow links on this site; product pages go to the back of the queue.
  for (const l of dom.links) {
    let next;
    try { next = clean(l.href); } catch { continue; }
    if (next.origin !== origin || seen.has(next.href) || isAsset(next)) continue;
    if (isProduct(next)) queue.push(next);
    else queue.unshift(next);
  }
}

fs.writeFileSync(path.join(out, 'pages.json'), JSON.stringify({ pages, products }, null, 1));
await browser.close();
console.log(`done: ${pages.length} pages, ${products.length} product pages`);
