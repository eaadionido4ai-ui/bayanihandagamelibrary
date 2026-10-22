// Takes the story pictures for the Handaventures card's carousel on Home and Games:
//   public/stories/peek/<story>-<stop>.webp   one picture for each stop (before, during, after) of four stories,
//                                            640 x 360, in the stories' own cartoon style
// It plays each standalone story along its hero path in cartoon style and saves the scene at a chosen line,
// without the scene's corner labels and frame (the card adds its own). Lockdown at School stays out of the carousel:
// it is a story to play with a grown-up first, so it should not turn up by itself on Home.
// Needs Playwright's Chromium (npm i -D playwright && npx playwright install chromium) and the standalone stories.
// From the repository root:
//   node scripts/build-stories.mjs --standalone      (or npm run test:stories)
//   node design/handaventures/peeks.cjs
// Run it again after a story's scenes change. The order the pictures appear in is HV_PEEKS in src/data.js.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'stories', 'peek');
const STORIES = path.join(ROOT, 'stories', 'standalone');

// For each story: the hero path (the choice to make in each scene, as in stories/tests) and, for each stop,
// [scene title, 'choose' or 'feedback', how many lines in] for the picture.
const SHOTS = [
  {
    art: 'kulog', file: 'bagyong-kulog.html', hero: 'ate',
    plan: { 'News on the radio': 'Help Mama', 'Pack the Go Bag': ['flashlight', 'water', 'firstaid', 'whistle'], 'The wind picks up': 'plant pots',
      'Brownout!': 'flashlight from the Go Bag', 'BANG!': 'small room', 'Suddenly, quiet': 'Stay inside', 'The morning after': 'Stay far away' },
    at: { before: ['News on the radio', 'feedback', 1], during: ['Brownout!', 'feedback', 0], after: ['The morning after', 'feedback', 1] },
  },
  {
    art: 'agos', file: 'bagyong-agos.html', hero: 'ate',
    plan: { 'Rain, rain, rain': 'Stay inside', 'Move things up': 'Help carry', 'Pack the Go Bag': ['papers', 'medicine', 'flashlight', 'water'], 'Time to go': 'Help Lola',
      'The way to the school': 'Wait for the rescue', 'At the evacuation center': 'Stay at the center', 'Going home': 'Wait outside', 'The scratch': 'Tell Mama' },
    at: { before: ['Move things up', 'feedback', 0], during: ['At the evacuation center', 'feedback', 1], after: ['Going home', 'choose', 2] },
  },
  {
    art: 'shake', file: 'big-shake.html', hero: 'kuya',
    plan: { 'Look around the room': 'Point at', 'The ground shakes!': 'Duck under', 'When the shaking stops': 'Line up', 'On the school field': 'Stay in the open',
      'Another shake!': 'Drop down', 'Where is Migo?': 'Stay with your class', 'Going home': 'Ask' },
    at: { before: ['Look around the room', 'feedback', 1], during: ['The ground shakes!', 'feedback', 0], after: ['On the school field', 'feedback', 0] },
  },
  {
    art: 'smoke', file: 'smoke-at-night.html', hero: 'kuya',
    plan: { 'Too many plugs': 'Tell Papa', 'Beep! Beep!': 'Wake Migo', 'The closed door': 'Touch the door', 'Out of the house': 'Go to the meeting',
      'Call for help': 'Call 911', 'The firefighters arrive': 'Stay back', 'The next morning': 'Tell Lola' },
    at: { before: ['Too many plugs', 'feedback', 1], during: ['Beep! Beep!', 'feedback', 0], after: ['The next morning', 'feedback', 1] },
  },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const shooter = await browser.newPage();
  const save = async (png, name) => {
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
      return cv.toDataURL('image/webp', 0.84);
    }, png.toString('base64'));
    const file = path.join(OUT, name + '.webp');
    fs.writeFileSync(file, Buffer.from(webp.split(',')[1], 'base64'));
    console.log('wrote ' + path.relative(ROOT, file));
  };

  for (const s of SHOTS) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
    page.on('pageerror', (e) => console.log(s.art + ': page error: ' + e.message));
    await page.goto('file://' + path.join(STORIES, s.file));
    // no corner labels, and no frame or rounded corners (the card draws its own)
    await page.addStyleTag({ content: '#scene .chip{visibility:hidden !important} #scene{border:0 !important;border-radius:0 !important;box-shadow:none !important}' });
    await page.click('.mode[data-mode="vn"]');
    await page.click('.pick[data-hero="' + s.hero + '"]');
    await page.waitForTimeout(900);
    const want = {};
    for (const [stop, [title, phase, n]] of Object.entries(s.at)) want[title + '|' + phase + '|' + n] = stop;
    const title = () => page.evaluate(() => { const t = document.querySelector('#chipTime'); return t ? t.textContent.trim() : ''; });
    for (let step = 0; step < 30; step++) {
      if (await page.$('#card .end-top')) break;
      const t = await title();
      const scene = Object.keys(s.plan).find((k) => t.includes(k));
      if (!scene) { console.log(s.art + ': unknown scene ' + t); break; }
      for (const phase of ['choose', 'feedback']) {
        // reveal the lines one at a time, saving the picture at the chosen line
        for (let n = 0; n < 8; n++) {
          await page.waitForTimeout(650);
          const stop = want[scene + '|' + phase + '|' + n];
          if (stop) await save(await page.locator('#scene').screenshot({ type: 'png' }), s.art + '-' + stop);
          const more = await page.evaluate(() => document.querySelector('#scene').getAttribute('data-act') === 'more');
          if (!more) break;
          await page.click('#scene');
        }
        if (phase === 'choose') {
          const pick = s.plan[scene];
          if (await page.$('.bag-grid')) {
            for (const id of pick) await page.click('.item[data-id="' + id + '"]');
            await page.click('[data-act="zip"]');
          } else {
            const choices = await page.$$('.choice');
            let done = false;
            for (const ch of choices) if (!done && (await ch.textContent()).toLowerCase().includes(pick.toLowerCase())) { await ch.click(); done = true; }
            if (!done) { console.log(s.art + ': no choice "' + pick + '" in ' + scene); break; }
          }
          await page.waitForTimeout(300);
        }
      }
      let next = await page.$('[data-act="next"]');
      if (!next) { const skip = await page.$('[data-act="skip"]'); if (skip) await skip.click(); next = await page.$('[data-act="next"]'); }
      await next.click();
      await page.waitForTimeout(500);
    }
    await page.close();
  }
  await browser.close();
})();
