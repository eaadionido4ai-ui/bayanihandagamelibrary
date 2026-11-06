// Lusot sa Usok, a school fire escape test game, copied unchanged from its own project into games/lusot-sa-usok/.
// 1. The rules (games/lusot-sa-usok/engine.js): the two floors, the 911 call (one question on Easy, three on
//    Difficult), and the test player (lusot-sa-usok-bot.cjs) getting everyone out on Easy and most Difficult missions.
// 2. The library's copy (?embed=1, in a frame): it opens at the briefing, the level comes from the library's intro,
//    the library reads Bayani's lines and the 911 dispatcher aloud (say and hush), a whole Easy mission plays to the
//    end with the test player, the results offer Play again and Back to the library, nothing is kept on the device,
//    and Back tells the library the player left (exit).
// 3. The single file opens at its About page, with a level picker on the briefing.
// The pages run in a simulated browser (jsdom) with no canvas, so the pictures are skipped. Run with:
// npm run test:games (it builds the pages).
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');
const { makeBot, play } = require('./lusot-sa-usok-bot.cjs');

const ROOT = path.join(__dirname, '..', '..');
const ENGINE = path.join(ROOT, 'games', 'lusot-sa-usok', 'engine.js');
const LIB = path.join(ROOT, 'public', 'games', 'lusot-sa-usok.html');
const SOLO = path.join(ROOT, 'games', 'standalone', 'Lusot-sa-Usok.html');
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
function rules() { const box = { window: {} }; vm.runInNewContext(fs.readFileSync(ENGINE, 'utf8'), box, { filename: ENGINE }); return box.window.LusotSaUsok; }

// seed: a mission's fire starts from the clock, so a fixed clock makes the same fire every time
async function open(file, query, framed, seed) {
  const sent = [], errors = [];
  const parent = { postMessage: (m) => sent.push(m) };
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { if (!/Not implemented/.test(e.message)) errors.push(e.message); });
  vc.on('error', (m) => errors.push(String(m)));
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    url: 'https://example.org/games/' + path.basename(file) + (query || ''),
    beforeParse(w) {
      if (framed) Object.defineProperty(w, 'parent', { get: () => parent, configurable: true });
      if (seed) w.Date.now = () => 100000 * 7 + seed - 1;
    },
  });
  const w = dom.window, d = w.document;
  for (let i = 0; i < 100 && !w.__lusot; i++) await wait(20);
  if (!w.__lusot) throw new Error('the game did not start: ' + errors.join('; '));
  const q = (s) => d.querySelector(s), qa = (s) => [...d.querySelectorAll(s)];
  const tap = (s) => { const el = q(s); if (!el) throw new Error('nothing to tap: ' + s); el.click(); };
  const msgs = (t) => sent.filter((m) => m && m.source === 'bayani-game' && m.game === 'lusot' && m.type === t);
  return { w, d, q, qa, tap, A: w.__lusot, L: w.LusotSaUsok, sent, msgs, errors, close: () => w.close() };
}
// plays the mission on the page with the test player: it moves with the stick, sprays, and taps the action button;
// on the 911 call it taps the right answers, and when a fire is too big it finds another way
function playOn(g, t) {
  const s = g.A.S.run, think = makeBot(g.L, s);
  let called = false;
  for (let i = 0; i < 30 * 300 && s.phase === 'play'; i++) {
    const ov = g.A.S.overlay;
    if (ov === 'call') {
      if (g.A.S.call.done) { g.tap('#ov [data-act="hangup"]'); called = true; continue; }
      const q = g.L.questions(s)[g.A.S.call.i];
      g.tap('#ov [data-act="answer"][data-id="' + q.a.findIndex((a) => a[1]) + '"]');
      continue;
    }
    if (ov === 'toobig') { g.tap('#ov [data-act="choose"][data-id="away"]'); continue; }
    if (ov) { t.ok(false, 'library: a sheet got in the way: ' + ov); break; }
    const inp = think(1 / 30);
    if (inp.act) { g.A.act.act(); continue; }
    g.A.S.joy = inp.mx || inp.my ? { id: 9, dx: inp.mx || 0, dy: inp.my || 0 } : null;
    g.A.S.spray = !!inp.spray;
    g.A.advance(1 / 30);
  }
  g.A.S.joy = null; g.A.S.spray = false;
  g.A.advance(1.2);
  return { s, called };
}

module.exports = async function () {
  const t = counter('Lusot sa Usok');

  // 1. The rules
  {
    const L = rules();
    const e = L.create('easy', 1), h = L.create('hard', 1);
    t.ok(e.people.length === 4 && h.people.length === 6, 'rules: 4 people to lead on Easy, 6 on Difficult');
    t.ok(L.questions(e).length === 1 && L.questions(h).length === 3, 'rules: the 911 call asks one question on Easy and three on Difficult');
    t.ok(L.stations(e, 'A').length >= 1 && L.stations(e, 'P').length >= 1 && L.stations(e, 'E').length + L.stations(e, 'S').length >= 2, 'rules: a fire alarm, a phone and two exits');
    let easy = 0, hard = 0;
    for (let seed = 1; seed <= 8; seed++) {
      if (play(L, 'easy', seed).r.stars === 3) easy++;
      if (play(L, 'hard', seed).r.out) hard++;
    }
    t.ok(easy === 8, 'rules: the test player gets everyone out on Easy (' + easy + ' of 8)');
    t.ok(hard >= 6, 'rules: the test player gets out of most Difficult missions (' + hard + ' of 8)');
  }

  // 2. The library's copy: Easy, with sound and Bayani's voice on
  {
    const g = await open(LIB, '?embed=1&level=easy&sound=1&voice=1', true, 3);
    t.ok(g.A.embed && g.A.S.screen === 'brief' && !/About the game/.test(g.q('#stage').textContent), 'library: opens at the briefing, past the About page');
    t.ok(g.A.S.level === 'easy' && /Easy/.test(g.q('.lvtag').textContent) && !g.q('[data-act="level"]'), 'library: the level comes from the intro, with no level picker');
    t.ok(/ACT FAST/.test(g.q('#stage').textContent) && /Ages 10 to 15/.test(g.q('#stage').textContent) && /canteen/.test(g.q('#stage').textContent), 'library: the Act Fast and age chips, and the canteen fire');
    t.ok(g.q('.back').getAttribute('aria-label') === 'Back to the library', 'library: the back button says where it goes');
    g.tap('[data-act="go"]');
    t.ok(g.A.S.screen === 'play' && /Fire in the canteen/.test(g.msgs('say').pop().text), 'library: Start the mission, and Bayani\'s first line is read aloud');
    const r = playOn(g, t);
    const said = g.msgs('say').map((m) => m.text).join(' | ');
    t.ok(r.called && /9 1 1, what is your emergency/.test(said), 'library: the 911 call happens, and the dispatcher is read aloud');
    t.ok(r.s.phase === 'out' && g.A.S.overlay === 'done' && /Nakalabas kayo!/.test(g.q('#ov').textContent), 'library: the test player gets everyone out');
    t.ok(/4 of 4/.test(g.q('#ov').textContent) && g.q('#ov .bigstars').getAttribute('aria-label') === '3 of 3 stars', 'library: three stars, everyone led out');
    t.ok(g.q('#ov [data-act="again"]') && /Back to the library/.test(g.q('#ov [data-act="leave"]').textContent) && !g.q('#ov [data-act="nextfloor"]'), 'library: the results offer Play again and Back to the library');
    t.ok(!g.sent.some((m) => m.type === 'result'), 'library: a test game sends no result, so it earns no badge');
    t.ok(g.w.localStorage.length === 0, 'library: nothing is kept on the device');
    g.tap('#ov [data-act="leave"]');
    t.ok(g.msgs('exit').length === 1 && g.msgs('hush').length >= 1, 'library: Back to the library hushes the voice and tells the library the player left');
    t.ok(g.sent.every((m) => m.source === 'bayani-game' && m.game === 'lusot'), 'library: every message names the game');
    t.ok(!g.errors.length, 'library: no errors: ' + g.errors.join('; '));
    g.close();
  }

  // the library's copy: Difficult, Bayani's voice off
  {
    const g = await open(LIB, '?embed=1&level=hard&sound=1&voice=0', true, 5);
    t.ok(g.A.S.level === 'hard' && /Difficult/.test(g.q('.lvtag').textContent) && /computer room/.test(g.q('#stage').textContent), 'library Difficult: the electrical fire in the computer room');
    g.tap('[data-act="go"]'); g.A.advance(0.5);
    t.ok(g.A.S.screen === 'play' && /computer room/.test(g.q('#tip-t').textContent) && g.msgs('say').length === 0, 'library Difficult: with the voice off, Bayani\'s lines are shown but not read');
    g.tap('[data-act="pause"]');
    g.tap('#ov [data-act="brief"]');
    t.ok(g.A.S.screen === 'brief', 'library Difficult: the pause sheet goes back to the briefing');
    g.tap('[data-act="leave"]');
    t.ok(g.msgs('exit').length === 1, 'library Difficult: the back button tells the library the player left');
    g.close();
  }

  // 3. The single file
  {
    const g = await open(SOLO, '', false);
    t.ok(!g.A.embed && /About the game/.test(g.q('#stage').textContent) && /Subject for code and content validation/.test(g.q('#stage').textContent), 'single file: opens at its About page, with the credits');
    g.tap('[data-act="start"]');
    t.ok(g.A.S.screen === 'brief' && g.q('[data-act="level"][data-id="hard"]') && /Home/.test(g.q('.back').textContent), 'single file: the briefing has a level picker and goes back home');
    g.close();
  }
  return t;
};
