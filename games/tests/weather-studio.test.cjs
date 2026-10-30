// Weather Studio, a test game. The library's copy opens inside the library (?embed=1, in a frame) at the level, the
// nickname and the sound settings the library passes; the flood map's colors and its right answers come from the same
// numbers; both levels play through to the end; Back and "Back to the library" tell the library the player left.
// The single file opens at its own title screen and asks a grown-up before the Difficult level.
// The page runs in a simulated browser (jsdom): no speech, no microphone, which is also what some phones see.
// Run with: npm run test:games (it builds the pages first).
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');
const LIB = path.join(ROOT, 'public', 'games', 'weather-studio.html');
const SOLO = path.join(ROOT, 'games', 'standalone', 'Weather-Studio.html');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function counter(name) {
  let pass = 0, fail = 0;
  return {
    name,
    ok(cond, msg) { if (cond) pass++; else { fail++; console.log('FAIL [' + name + ']: ' + msg); } },
    get pass() { return pass; }, get fail() { return fail; },
  };
}

async function open(file, query, framed) {
  const sent = [], errors = [], warns = [];
  const parent = { postMessage: (m) => sent.push(m) };
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { if (!/Not implemented/.test(e.message)) errors.push(e.message); });
  vc.on('error', (m) => errors.push(String(m)));
  vc.on('warn', (m) => warns.push(String(m)));
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    url: 'https://example.org/games/' + path.basename(file) + (query || ''),
    beforeParse(w) { if (framed) Object.defineProperty(w, 'parent', { get: () => parent, configurable: true }); },
  });
  const w = dom.window, d = w.document;
  for (let i = 0; i < 100 && !w.__weather; i++) await wait(20); // the game starts once the page has loaded
  if (!w.__weather) throw new Error('the game did not start: ' + errors.join('; '));
  const q = (s) => d.querySelector(s);
  // SVG pins and road tags have no click() of their own, so every tap is a click event
  const tap = (k) => { const el = q('[data-k="' + k + '"]'); if (!el) throw new Error('nothing to tap: ' + k); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
  return { w, d, q, tap, W: w.__weather, S: () => w.__weather.state(), sent, errors, warns, close: () => w.close() };
}

const exits = (sent) => sent.filter((m) => m && m.source === 'bayani-game' && m.game === 'weather' && m.type === 'exit').length;

module.exports = async function () {
  const t = counter('Weather Studio');
  const ZONES = { homes: 'high', market: 'high', court: 'med', health: 'low', hall: 'low', school: 'none' };

  // 1. Inside the library, Easy, sound off, with a nickname
  {
    const g = await open(LIB, '?embed=1&level=easy&sound=0&voice=1&name=ana', true);
    const s = g.S();
    t.ok(g.W.embed && s.screen === 'watch', 'library: opens at Watch, not at its own title screen');
    t.ok(s.level === 'easy' && s.sound === false && s.voice === true, 'library: takes the level and the sound and voice settings it is given');
    t.ok(s.name === 'Ana', 'library: puts the player\'s nickname on the cue card (got ' + s.name + ')');
    t.ok(!s.watch.playing, 'library: the forecast waits for Play, since the frame has had no tap yet');
    t.ok(!g.warns.some((m) => /Map check/.test(m)), 'the map\'s places sit in the zones their answers expect');
    t.ok(Object.keys(ZONES).every((id) => g.W.zone(id) === ZONES[id]), 'every place is in its planned flood zone: ' + Object.keys(ZONES).map((id) => id + '=' + g.W.zone(id)).join(', '));
    g.tap('wplay');
    t.ok(g.S().watch.playing, 'Play starts Bayani\'s forecast');
    g.tap('wplay');
    g.tap('cta');
    t.ok(g.S().screen === 'build', 'Make your own forecast opens Build');
    g.tap('stk-sun');
    t.ok(g.S().build.tried.sun && !g.S().build.placed.sun, 'a sticker that does not match the news stays off the wall');
    ['heavy', 'storm', 'wind'].forEach((k) => g.tap('stk-' + k));
    t.ok(g.S().build.part === 1, 'the three matching stickers finish the weather wall');
    g.tap('sig-1');
    t.ok(g.S().build.part === 1 && g.S().build.sigTried[1], 'Signal No. 1 is not the answer for very strong winds');
    g.tap('sig-2'); g.tap('rain-yellow'); g.tap('rain-orange');
    t.ok(g.S().build.part === 3 && g.S().build.rain === 'orange', 'Signal No. 2 and the orange rain warning finish the forecast');
    g.tap('cta');
    t.ok(g.S().screen === 'map', 'Next opens the flood map');
    g.tap('q-legend-red');
    ['homes', 'court', 'health'].forEach((k) => g.tap('pin-' + k));
    t.ok(/Yellow/.test(g.q('.pininfo').textContent), 'tapping the health center shows it in the yellow area');
    g.tap('q-first-red');
    g.tap('pin-court');
    t.ok(g.S().map.part === 2, 'the covered court, in orange, is not the safe place');
    g.tap('pin-school');
    t.ok(g.S().map.part === 3 && g.S().map.evac && !!g.q('.donecard'), 'the school on the hill is the safe place, and the map is done');
    g.tap('cta');
    g.tap('tip-kite');
    t.ok(g.S().advise.wrong.kite, 'flying a kite is not a good tip');
    ['loose', 'radio', 'river'].forEach((k) => g.tap('tip-' + k));
    g.tap('cta');
    t.ok(g.S().screen === 'present' && /Ana/.test(g.q('.cue').textContent) && /school on the hill/.test(g.q('.cue').textContent), 'the cue card has the nickname and the flood map tip');
    g.tap('rec');
    t.ok(g.S().present.mode === 'nomic' && !!g.q('.nomic'), 'with no microphone, Present offers practice or a clip instead');
    g.tap('practice'); g.tap('nextline'); g.tap('nextline');
    t.ok(g.S().present.line === 2, 'Next line moves down the cue card');
    g.tap('finish');
    t.ok(g.S().screen === 'wrap' && !!g.q('.badges') && !!g.q('[data-k="leave"]'), 'the wrap shows the badges and a Back to the library button');
    g.tap('leave');
    t.ok(exits(g.sent) === 1, 'Back to the library tells the library the player left');
    t.ok(!g.errors.length, 'library, Easy: no errors: ' + g.errors.slice(0, 3).join(' | '));
    g.close();
  }

  // 2. Inside the library, Difficult (the library has already asked for a grown-up when needed)
  {
    const g = await open(LIB, '?embed=1&level=hard&sound=0&voice=0&name=Leo', true);
    t.ok(g.S().level === 'hard' && !g.S().sheet && g.S().screen === 'watch', 'library, Difficult: no second grown-up check inside the game');
    g.tap('back');
    t.ok(exits(g.sent) === 1, 'library, Difficult: Back from Watch returns to the library');
    g.tap('cta');
    ['heavy', 'storm', 'wind'].forEach((k) => g.tap('stk-' + k));
    g.tap('guide');
    t.ok(!!g.q('table.guide') && g.q('table.guide').textContent.indexOf('62 to 88 km/h') >= 0, 'the signal guide lists the wind speeds');
    g.tap('sig-3');
    t.ok(g.S().build.part === 1, 'Signal No. 3 is too high for 62 to 88 km/h');
    g.tap('sig-2'); g.tap('rain-red'); g.tap('rain-orange'); g.tap('cta');
    g.tap('q-rain100-once');
    t.ok(g.S().map.part === 0, '"exactly once every 100 years" is not right');
    g.tap('q-rain100-chance');
    g.tap('pin-market');
    t.ok(/Read the color/.test(g.q('.pininfo').textContent), 'while sorting, tapping a place does not give its color away');
    g.tap('sort-high');
    g.tap('sort-low');
    t.ok(g.S().map.sortIdx === 1, 'the covered court is not low hazard');
    g.tap('sort-med'); g.tap('sort-low'); g.tap('sort-none');
    t.ok(g.S().map.part === 2 && !!g.q('[data-k="rtag-A"]'), 'after sorting, the three roads show on the map');
    g.tap('road-B');
    t.ok(g.S().map.part === 2, 'Center Street, the shortest, is not the safest');
    g.tap('rtag-C');
    t.ok(g.S().map.route === 'C', 'Burol Road is the safest');
    g.tap('q-why-low');
    t.ok(g.S().map.part === 4 && !!g.q('.donecard .side'), 'the map is done, with the side view');
    g.tap('cta');
    ['loose', 'radio', 'river', 'road'].forEach((k) => g.tap('tip-' + k));
    g.tap('cta');
    t.ok(/20 millimeters/.test(g.q('.cue').textContent) && /Burol Road/.test(g.q('.cue').textContent), 'the Difficult cue card has the rain amount and the road');
    g.tap('practice'); g.tap('finish');
    t.ok(/62 to 88/.test(g.q('.badges').textContent), 'the Difficult wrap names what the player read');
    t.ok(!g.errors.length, 'library, Difficult: no errors: ' + g.errors.slice(0, 3).join(' | '));
    g.close();
  }

  // 3. On its own: the title screen, and a grown-up before the Difficult level
  if (fs.existsSync(SOLO)) {
    const g = await open(SOLO, '', false);
    t.ok(!g.W.embed && g.S().screen === 'title', 'on its own: opens at the title screen');
    g.tap('about');
    const cap = g.q('#sheet .aff-btn'), aff = cap && g.q('#' + cap.getAttribute('aria-controls'));
    t.ok(/Edward Andrew A\. Dionido/.test(g.q('#sheet').textContent) && !!aff && aff.hidden, 'on its own: the About credits have a small cap icon beside the developer\'s name');
    if (cap) cap.dispatchEvent(new g.w.MouseEvent('click', { bubbles: true }));
    t.ok(!!aff && !aff.hidden && /MS Environmental Science \(Ongoing\)/.test(aff.textContent) && /De La Salle University Dasmariñas/.test(aff.textContent)
      && g.S().sheet && g.S().sheet.kind === 'about', 'on its own: tapping the cap icon shows his other affiliation and keeps the sheet open');
    g.tap('a-close');
    g.tap('lv-hard'); g.tap('start');
    const sh = g.S().sheet;
    t.ok(sh && sh.kind === 'gate' && sh.reason === 'hard', 'on its own: Difficult asks a grown-up first');
    String(sh.a * sh.b).split('').forEach((n) => g.tap('key-' + n));
    g.tap('key-ok');
    t.ok(g.S().screen === 'watch' && g.S().level === 'hard', 'on its own: the right answer starts the Difficult level');
    t.ok(!g.errors.length, 'on its own: no errors: ' + g.errors.slice(0, 3).join(' | '));
    g.close();
  } else {
    t.ok(false, 'the single file was not built (run npm run test:games)');
  }
  return t;
};
