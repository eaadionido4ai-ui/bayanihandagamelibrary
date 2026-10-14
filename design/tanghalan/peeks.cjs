// Takes the 3D pictures of TANGHALAN's rooms for the museum card on Home and Games:
//   public/tanghalan/peek/<room>.webp   one view per room in PEEK_ROOMS (src/museum/content.js), 640 x 360
// It opens the built app, walks into the museum, jumps to each room with the museum map, hides the
// buttons, and saves what the camera sees. Every work is marked as seen first, so no bubbles show.
// Needs Playwright's Chromium (npm i -D playwright && npx playwright install chromium) and the app
// running. From the repository root:
//   npm run build && npx vite preview --port 4173
//   node design/tanghalan/peeks.cjs                       (or give another address as the argument)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const BASE = process.argv[2] || 'http://localhost:4173/';
const OUT = path.join(__dirname, '..', '..', 'public', 'tanghalan', 'peek');
// software WebGL, so it also runs on machines without a GPU
const GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const HIDE = "[data-screen-label='TANGHALAN'] > :not(canvas){visibility:hidden !important}";

(async () => {
  const { ROOMS, WORKS, PEEK_ROOMS } = await import(pathToFileURL(path.join(__dirname, '..', '..', 'src', 'museum', 'content.js')).href);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: GL });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.log('page error: ' + e.message));

  // a player who has seen every work, so the museum shows no welcome and no "not seen yet" bubbles
  await page.goto(BASE);
  await page.evaluate((ids) => {
    localStorage.setItem('bayanihanda_players_v1', JSON.stringify({ active: 'peek', list: [{ id: 'peek', nick: 'Peek', avatar: 'turtle' }] }));
    localStorage.setItem('bayanihanda_museum_v1::peek', JSON.stringify({ seen: Object.fromEntries(ids.map((id) => [id, 1])), rooms: {}, stickers: {}, intro: true }));
  }, WORKS.map((w) => w.id));
  await page.goto(BASE);
  await page.getByRole('button', { name: 'Peek' }).first().click({ timeout: 20000 });
  await page.getByRole('button', { name: /Enter the museum|Go back in/ }).first().click();
  await page.getByRole('button', { name: 'Museum map' }).waitFor({ timeout: 60000 });
  await page.waitForTimeout(4000);

  const shooter = await browser.newPage();
  for (const id of PEEK_ROOMS) {
    const name = ROOMS.find((r) => r.id === id).name;
    await page.getByRole('button', { name: 'Museum map' }).click();
    await page.waitForTimeout(600);
    const went = await page.evaluate((name) => {
      const b = [...document.querySelectorAll('b')].find((x) => x.textContent.trim() === name);
      let row = b && b.parentElement;
      while (row && !row.querySelector('button')) row = row.parentElement;
      const go = row && [...row.querySelectorAll('button')].find((x) => /Go/.test(x.textContent));
      if (go) go.click();
      return !!go;
    }, name);
    if (!went) { console.log('could not go to ' + name); continue; }
    await page.waitForTimeout(1600);
    const hide = await page.addStyleTag({ content: HIDE });
    await page.waitForTimeout(500);
    const png = await page.screenshot({ type: 'png' });
    await hide.evaluate((el) => el.remove());
    // shrink to 640 x 360 and save as WebP, using the browser's canvas
    const webp = await shooter.evaluate(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = 640; cv.height = 360;
      const g = cv.getContext('2d');
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, 0, 0, 640, 360);
      return cv.toDataURL('image/webp', 0.82);
    }, png.toString('base64'));
    const file = path.join(OUT, id + '.webp');
    fs.writeFileSync(file, Buffer.from(webp.split(',')[1], 'base64'));
    console.log('wrote ' + path.relative(process.cwd(), file));
  }
  await browser.close();
})();
