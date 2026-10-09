// Renders the pictures for TANGHALAN:
//   public/tanghalan/works/   every work in src/museum/content.js (WebP), and the open books on the story stands
//   design/tanghalan/out/     the concept mockups (screens.html, overview.html), for presentations
// Needs Playwright's Chromium (npm i -D playwright && npx playwright install chromium).
// Run from the repository root after npm install:  node design/tanghalan/render.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const HERE = __dirname;
const OUT = path.join(HERE, 'out');
const WORKS_DIR = path.join(HERE, '..', '..', 'public', 'tanghalan', 'works');
// software WebGL, so it also runs on machines without a GPU
const GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

async function open(browser, page, w, h, scale) {
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  p.on('pageerror', (e) => console.log(page + ': ' + e.message));
  await p.goto(pathToFileURL(path.join(HERE, page)).href);
  await p.waitForFunction(() => window.__ready, null, { timeout: 300000, polling: 500 });
  return p;
}

// draws on a canvas in the page, saves it as WebP
async function save(p, fn, args, file) {
  const url = await p.evaluate(([fn, args]) => window.KidArt[fn](...args).toDataURL('image/webp', 0.8), [fn, args]);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote ' + path.relative(process.cwd(), file));
}

(async () => {
  const { WORKS } = await import(pathToFileURL(path.join(HERE, '..', '..', 'src', 'museum', 'content.js')).href);
  fs.mkdirSync(WORKS_DIR, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: GL });

  const p = await open(browser, 'works.html', 800, 600, 1);
  for (const w of WORKS) {
    if (w.stand) await save(p, 'book', [w.title, w.pages.fil[0], w.illus], path.join(WORKS_DIR, 'book-' + w.id + '.webp'));
    else await save(p, 'draw', [w.id], path.join(WORKS_DIR, w.id + '.webp'));
  }
  await p.close();

  if (!process.argv.includes('--works-only')) {
    let m = await open(browser, 'screens.html', 2160, 1200, 2);
    await m.screenshot({ path: path.join(OUT, 'TANGHALAN-screens.png'), fullPage: true });
    await m.close();
    m = await open(browser, 'overview.html', 1920, 1080, 2);
    await m.screenshot({ path: path.join(OUT, 'TANGHALAN-overview.png') });
    await m.close();
    console.log('wrote the mockups to ' + path.relative(process.cwd(), OUT));
  }
  await browser.close();
})();
