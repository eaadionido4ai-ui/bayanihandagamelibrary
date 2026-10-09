// Renders the TANGHALAN mockups into design/tanghalan/out/ and the previews used by the
// app's TANGHALAN placeholder into public/tanghalan/ (WebP).
// Needs Playwright's Chromium (npm i -D playwright && npx playwright install chromium).
// Run from the repository root after npm install:  node design/tanghalan/render.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const OUT = path.join(HERE, 'out');
const PUB = path.join(HERE, '..', '..', 'public', 'tanghalan');
// software WebGL, so it also runs on machines without a GPU
const GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

async function open(browser, page, w, h, scale) {
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  p.on('pageerror', (e) => console.log(page + ': ' + e.message));
  await p.goto('file://' + path.join(HERE, page));
  await p.waitForFunction(() => window.__ready, null, { timeout: 300000, polling: 500 });
  return p;
}

// PNG -> WebP (optionally resized), encoded by Chromium's canvas
async function webp(p, png, file, w, h, quality) {
  const url = await p.evaluate(async ([src, w, h, q]) => {
    const img = new Image(); img.src = src; await img.decode();
    const cv = document.createElement('canvas'); cv.width = w || img.width; cv.height = h || img.height;
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/webp', q);
  }, ['data:image/png;base64,' + png.toString('base64'), w, h, quality]);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote ' + path.relative(process.cwd(), file));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(PUB, { recursive: true });
  const browser = await chromium.launch({ args: GL });

  let p = await open(browser, 'screens.html', 2160, 1200, 2);
  await p.screenshot({ path: path.join(OUT, 'TANGHALAN-screens.png'), fullPage: true });
  await p.close();
  p = await open(browser, 'overview.html', 1920, 1080, 2);
  await p.screenshot({ path: path.join(OUT, 'TANGHALAN-overview.png') });
  await p.close();
  console.log('wrote the mockups to ' + path.relative(process.cwd(), OUT));

  p = await open(browser, 'preview.html', 1040, 1260, 1.5);
  await webp(p, await p.locator('#walk').screenshot(), path.join(PUB, 'walk.webp'), 0, 0, 0.8);
  await webp(p, await p.locator('#stand').screenshot(), path.join(PUB, 'stand.webp'), 1200, 675, 0.8);
  for (const [name, w, h] of [['bayanihan', 800, 600], ['baha', 320, 240], ['gobag', 240, 320]]) {
    const data = await p.evaluate((n) => KidArt.draw(n).toDataURL('image/png'), name);
    await webp(p, Buffer.from(data.split(',')[1], 'base64'), path.join(PUB, 'art-' + name + '.webp'), w, h, 0.82);
  }
  await browser.close();
})();
