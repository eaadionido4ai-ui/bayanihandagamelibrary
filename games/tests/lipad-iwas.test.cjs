// Lipad-Iwas, a tap-to-fly test game, copied unchanged from its own project into games/lipad-iwas/.
// 1. The rules (games/lipad-iwas/engine.js): four worlds and twelve Hazard Cards, three a world, before, during and
//    after; the autopilot (lipad-iwas-pilot.cjs) finishes every world on both levels.
// 2. The library's copy (?embed=1, in a frame): it opens at the worlds with every world open, the level comes from the
//    library's intro with no second grown-up question, the library reads the mission and the Hazard Cards aloud
//    (say and hush), a whole world plays to the end, nothing is kept on the device, and Back tells the library the
//    player left (exit).
// 3. The single file opens at its About page, with a level picker that asks a grown-up before Difficult.
// The pages run in a simulated browser (jsdom) with no canvas, so the pictures are skipped. Run with:
// npm run test:games (it builds the pages).
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');
const { pilot, fly } = require('./lipad-iwas-pilot.cjs');

const ROOT = path.join(__dirname, '..', '..');
const ENGINE = path.join(ROOT, 'games', 'lipad-iwas', 'engine.js');
const LIB = path.join(ROOT, 'public', 'games', 'lipad-iwas.html');
const SOLO = path.join(ROOT, 'games', 'standalone', 'Lipad-Iwas.html');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function counter(name) {
  let pass = 0, fail = 0;
  return {
    name,
    ok(cond, msg) { if (cond) pass++; else { fail++; console.log('FAIL [' + name + ']: ' + msg); } },
    get pass() { return pass; }, get fail() { return fail; },
  };
}
// engine.js is a page script, so it runs here with a window of its own
function rules() { const box = { window: {} }; vm.runInNewContext(fs.readFileSync(ENGINE, 'utf8'), box, { filename: ENGINE }); return box.window.LipadIwas; }

async function open(file, query, framed) {
  const sent = [], errors = [];
  const parent = { postMessage: (m) => sent.push(m) };
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { if (!/Not implemented/.test(e.message)) errors.push(e.message); });
  vc.on('error', (m) => errors.push(String(m)));
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    url: 'https://example.org/games/' + path.basename(file) + (query || ''),
    beforeParse(w) { if (framed) Object.defineProperty(w, 'parent', { get: () => parent, configurable: true }); },
  });
  const w = dom.window, d = w.document;
  for (let i = 0; i < 100 && !w.__lipad; i++) await wait(20);
  if (!w.__lipad) throw new Error('the game did not start: ' + errors.join('; '));
  const q = (s) => d.querySelector(s), qa = (s) => [...d.querySelectorAll(s)];
  const tap = (s) => { const el = q(s); if (!el) throw new Error('nothing to tap: ' + s); el.click(); };
  const msgs = (t) => sent.filter((m) => m && m.source === 'bayani-game' && m.game === 'lipad' && m.type === t);
  return { w, d, q, qa, tap, L: w.__lipad, LI: w.LipadIwas, sent, msgs, errors, close: () => w.close() };
}
// flies the rest of a world with the autopilot, tapping Keep flying after each bump
function flyOn(g) {
  const s = g.L.S.run;
  for (let i = 0; i < 60 * 240 && s.phase !== 'done' && s.phase !== 'over'; i++) {
    if (g.L.S.overlay === 'bump') g.tap('#ov [data-act="keep"]');
    if (s.phase === 'ready') g.L.flap();
    pilot(g.LI, s, true);
    g.L.advance(1 / 60);
  }
  g.L.advance(1.2);
  return s;
}

module.exports = async function () {
  const t = counter('Lipad-Iwas');

  // 1. The rules
  {
    const LI = rules();
    t.ok(LI.WORLDS.length === 4 && LI.CARDS.length === 12 && new Set(LI.CARDS.map((c) => c.id)).size === 12, 'rules: four worlds and twelve different Hazard Cards');
    for (const w of LI.WORLDS) {
      const whens = LI.cardsOf(w.id).map((id) => LI.card(id).when);
      t.ok(whens.length === 3 && whens.some((x) => /^Before/.test(x)) && whens.some((x) => /^(During|Right after)/.test(x)) && whens.some((x) => /^After/.test(x)),
        'rules: ' + w.name + ' has cards for before, during and after (' + whens.join(', ') + ')');
    }
    t.ok(LI.CARDS.every((c) => !/[\u2013\u2014]/.test(c.title + c.what + c.when + c.act)), 'rules: no em or en dashes on the cards');
    for (const lvl of ['easy', 'hard']) {
      for (const w of LI.WORLDS) {
        let done = 0;
        for (let seed = 1; seed <= 6; seed++) if (fly(LI, w.id, lvl, seed).s.phase === 'done') done++;
        t.ok(done === 6, 'rules: the autopilot finishes ' + w.name + ' on ' + lvl + ' (' + done + ' of 6 flights)');
      }
    }
    const a = fly(LI, 'bagyo', 'easy', 7), b = fly(LI, 'bagyo', 'easy', 7);
    t.ok(a.s.warned === b.s.warned && a.s.x === b.s.x, 'rules: the same seed flies the same course');
  }

  // 2. The library's copy: Easy, with sound and Bayani's voice on
  {
    const g = await open(LIB, '?embed=1&level=easy&sound=1&voice=1', true);
    t.ok(g.L.embed && g.L.S.screen === 'worlds' && !g.q('.home'), 'library: opens at the worlds, past the About page');
    t.ok(g.L.S.level === 'easy' && /Easy/.test(g.q('.lvtag').textContent) && !g.q('[data-act="level"]'), 'library: the level comes from the intro, with no level picker');
    t.ok(/Ages 6 to 10/.test(g.q('.wtop').textContent) && /Working title/.test(g.q('.wtop').textContent), 'library: the age and working-title chips');
    t.ok(g.qa('.wbtn').length === 4 && g.qa('.wbtn:disabled').length === 0, 'library: every world is open');
    t.ok(g.q('.back').getAttribute('aria-label') === 'Back to the library', 'library: the back button says where it goes');
    g.tap('[data-act="fly"]');
    const s = g.L.S.run;
    t.ok(g.L.S.screen === 'play' && !g.L.S.overlay && s.world === 'bagyo' && s.level === 'easy', 'library: Lipad na! starts Bagyo on Easy');
    const m = g.msgs('say').pop();
    t.ok(m && /Signal Number 2/.test(m.text) && /typhoon is coming/i.test(m.text), 'library: the library reads the mission aloud');
    g.L.flap(); g.L.advance(4);
    t.ok(g.L.S.overlay === 'bump' && /HAZARD CARD/.test(g.q('#ov').textContent) && g.q('#ov [data-act="read"]'), 'library: a bump shows a Hazard Card with a speaker button');
    const card = g.LI.card(s.last.card), c1 = g.msgs('say').pop();
    t.ok(c1 && c1.text.indexOf(card.title) === 0 && c1.text.indexOf(card.act) > 0, 'library: the card is read aloud');
    g.tap('#ov [data-act="read"]');
    t.ok(g.msgs('say').pop().force === true, 'library: the speaker button reads it again');
    const h0 = g.msgs('hush').length;
    g.tap('#ov [data-act="keep"]');
    t.ok(g.msgs('hush').length === h0 + 1 && !g.L.S.overlay, 'library: Keep flying hushes the voice');
    flyOn(g);
    t.ok(s.phase === 'done' && g.L.S.overlay === 'done' && /Nakarating si Maya!/.test(g.q('#ov').textContent), 'library: the autopilot reaches the evacuation center');
    t.ok(/Real life/.test(g.msgs('say').pop().text) && g.L.saved().best.bagyo.easy >= 1, 'library: the results are read aloud, with stars for this visit');
    t.ok(!g.sent.some((m) => m.type === 'result'), 'library: a test game sends no result, so it earns no badge');
    t.ok(g.w.localStorage.length === 0, 'library: nothing is kept on the device');
    g.tap('#ov [data-act="quit"]');
    g.tap('[data-act="leave"]');
    t.ok(g.msgs('exit').length === 1, 'library: Back tells the library the player left');
    t.ok(g.sent.every((m) => m.source === 'bayani-game' && m.game === 'lipad'), 'library: every message names the game');
    t.ok(!g.errors.length, 'library: no errors: ' + g.errors.join('; '));
    g.close();
  }

  // the library's copy: Difficult, Bayani's voice off
  {
    const g = await open(LIB, '?embed=1&level=hard&sound=1&voice=0', true);
    t.ok(g.L.S.level === 'hard' && /Difficult/.test(g.q('.lvtag').textContent) && /Ages 10 to 15/.test(g.q('.wtop').textContent), 'library Difficult: the level and its ages');
    g.tap('.wbtn[data-id="bulkan"]');
    g.tap('[data-act="fly"]');
    t.ok(g.L.S.screen === 'play' && !g.L.S.overlay && g.L.S.run.world === 'bulkan' && /Alert Level 4/.test(g.q('.signal').textContent), 'library Difficult: no second grown-up question, and the last world is open');
    g.L.flap(); g.L.advance(4);
    t.ok(g.L.S.overlay === 'bump' && g.msgs('say').length === 0, 'library Difficult: with the voice off nothing is read by itself');
    g.tap('#ov [data-act="read"]');
    t.ok(g.msgs('say').length === 1 && g.msgs('say')[0].force === true, 'library Difficult: the speaker button still reads the card');
    g.close();
  }

  // 3. The single file
  {
    const g = await open(SOLO, '', false);
    t.ok(!g.L.embed && g.q('.home') && /About the game/.test(g.q('#stage').textContent) && /Subject for code and content validation/.test(g.q('#stage').textContent), 'single file: opens at its About page, with the credits');
    g.tap('[data-act="start"]');
    t.ok(g.q('[data-act="level"][data-id="easy"]').getAttribute('aria-pressed') === 'true' && g.qa('.wbtn:disabled').length === 3, 'single file: a level picker, and the worlds open one by one');
    g.tap('[data-act="level"][data-id="hard"]');
    t.ok(/Play with a grown-up/.test(g.q('#ov').textContent), 'single file: Difficult asks for a grown-up first');
    g.tap('[data-act="gateyes"]');
    t.ok(g.L.S.level === 'hard' && !g.sent.length, 'single file: plays on its own and sends nothing');
    g.close();
  }
  return t;
};
