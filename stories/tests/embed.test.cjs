// Checks a story the way the library shows it: inside the app (?embed=1), in the library look,
// with the player's style, character and endings passed in, and nothing kept by the story itself.
// Usage: node embed.test.cjs <built story.html> <story id>
const fs = require('fs');
const { JSDOM } = require('jsdom');
const [file, id] = process.argv.slice(2);
const html = fs.readFileSync(file, 'utf8');

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('FAIL:', msg); } };

function open(query) {
  const sent = [];
  const parent = { postMessage: (m) => sent.push(m) };
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.org/stories/x.html' + query,
    beforeParse(w) {
      w.HTMLElement.prototype.scrollIntoView = function () {};
      Object.defineProperty(w, 'parent', { get: () => parent, configurable: true });
    },
  });
  const errors = [];
  dom.window.addEventListener('error', (e) => errors.push(e.message));
  return { w: dom.window, d: dom.window.document, sent, errors };
}

// 1. Opened from the library: no start screen, library look, chosen style and character.
{
  const { w, d, sent, errors } = open('?embed=1&mode=vn&hero=kuya&found=hero,safe');
  const q = (s) => d.querySelector(s);
  ok(d.documentElement.dataset.skin === 'bh', 'wears the library look');
  ok(d.documentElement.dataset.theme === 'light', 'uses the light theme');
  ok(!q('.mode-grid'), 'skips the start screen');
  ok(q('#scene').dataset.mode === 'vn', 'starts in the style the player picked');
  ok(q('#backBtn') && !q('#backBtn').hidden, 'shows the back button');
  ok(!/fonts\.googleapis/.test(html), 'needs no web fonts (works offline)');

  // Plays to an ending: skip talk, take the first choice, pack the first items in a bag.
  let guard = 0;
  while (!q('#card .end-top') && guard++ < 80) {
    const skip = q('[data-act="skip"]');
    if (skip) { skip.click(); continue; }
    if (q('[data-act="zip"]')) {
      for (let n = 0; q('[data-act="zip"]').disabled && n < 20; n++) {
        const free = q('.item[aria-pressed="false"]');
        if (!free) break;
        free.click();
      }
      q('[data-act="zip"]').click();
      continue;
    }
    const choice = q('.choice:not([disabled])');
    if (choice) { choice.click(); continue; }
    const more = q('[data-act="more"]') || q('[data-act="next"]');
    if (more) { more.click(); continue; }
    break;
  }
  ok(!!q('#card .end-top'), 'reaches an ending');
  const end = sent.find((m) => m.type === 'end');
  ok(end && end.source === 'handaventures' && end.story === id && typeof end.ending === 'string', 'tells the library which ending was found');
  ok(end && Number.isFinite(end.stars) && Number.isFinite(end.scored), 'tells the library the stars');
  ok(w.localStorage.length === 0, 'keeps nothing on the device by itself');
  ok(!!q('#card [data-act="exit"]'), 'the ending has a Back to the stories button');
  q('#card [data-act="exit"]').click();
  ok(sent.some((m) => m.type === 'exit' && m.story === id), 'Back to the stories tells the library');
  ok(!errors.length, 'no script errors: ' + errors.join('; '));
}

// 2. Switching style mid-story is reported, so the library remembers it.
{
  const { d, sent } = open('?embed=1&mode=chat&hero=ate');
  ok(d.querySelector('#scene').dataset.mode === 'chat', 'starts in chat style');
  d.querySelector('#segVn').click();
  ok(sent.some((m) => m.type === 'mode' && m.mode === 'vn'), 'reports the style switch');
}

// 3. Opened on its own: start screen as before, nothing sent anywhere.
{
  const { d, sent } = open('');
  ok(!!d.querySelector('.mode-grid'), 'standalone page keeps its start screen');
  ok(d.documentElement.dataset.skin !== 'bh', 'standalone page keeps its own look');
  ok(sent.length === 0, 'standalone page sends nothing');
}

console.log(`${file.split('/').pop()} (in the library): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
