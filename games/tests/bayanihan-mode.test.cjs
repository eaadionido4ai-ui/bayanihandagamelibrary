// Bayanihan Mode, Handa vs. Hazard for 2 to 4 players: a test game.
// 1. The rules (games/bayanihan-mode/engine.js) over hundreds of seeded seasons: turns, supplies, gifts, the storm
//    update, how much Handa a side needs, damage, After cards, four rounds, and the end of the season.
// 2. The library's copy (?embed=1, in a frame): the player's nickname is the first player, the level comes from the
//    library's intro with no second grown-up question, the library reads Bayani's lines aloud, and Back and "Back to
//    the library" tell the library the players left. Whole games play to the end all together and in teams.
// 3. The single file opens at its own setup with a level picker, and asks a grown-up before the Difficult level.
// The pages run in a simulated browser (jsdom) with a pretend voice. Run with: npm run test:games (it builds the pages).
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');
const ENGINE = path.join(ROOT, 'games', 'bayanihan-mode', 'engine.js');
const LIB = path.join(ROOT, 'public', 'games', 'bayanihan-mode.html');
const SOLO = path.join(ROOT, 'games', 'standalone', 'Bayanihan-Mode.html');
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
function rules() { const box = { window: {} }; vm.runInNewContext(fs.readFileSync(ENGINE, 'utf8'), box, { filename: ENGINE }); return box.window.HvHGroup; }
const P = (n) => Array.from({ length: n }, (_, i) => ({ name: 'P' + i, av: i }));
const throws = (f) => { try { f(); return false; } catch (e) { return true; } };

// One season played straight on the rules, choosing moves at random, checking every step
function ruleSeason(E, opts) {
  const G = E.create(opts), bad = [], firsts = [];
  const check = (c, m) => { if (!c && bad.length < 5) bad.push('round ' + G.round + ': ' + m); };
  for (let guard = 0; !G.over && guard < 1000; guard++) {
    const R = G.R;
    if (R.step === 'arrive') {
      firsts.push(R.order[0]);
      check(R.level === 1 && R.supply.length === G.players.length + 1, 'a hazard arrives at level 1, with one more supply card than players');
      check(G.players.every((p) => p.hand.length <= E.SET.handMax + E.SET.draw), 'hands stay small');
      E.proceed(G); continue;
    }
    if (R.step === 'update') {
      const ups = R.reveals.filter((r) => r.kind === 'up').length;
      check(R.reveals.length === E.LV[G.level].flips && R.level === 1 + ups && R.level <= 3, 'each matching storm card stacks 1 level, up to 3');
      check(G.queue.length <= 2, 'the early warning holds 2 at most');
      E.proceed(G); continue;
    }
    if (R.step === 'hit') {
      G.sides.forEach((s) => {
        const h = R.hit[s.id], short = Math.max(0, h.need - h.handa);
        check(h.need === Math.ceil(R.level * s.members.length / 2), 'a side needs level x its players / 2, rounded up');
        check(h.damage <= Math.min(short, R.level) && h.safe === (short === 0), 'damage is the shortfall, at most the level');
      });
      E.proceed(G); continue;
    }
    E.reveal(G);
    const p = E.now(G), s = E.sideOf(G, p), ph = E.STEP_PH[R.step];
    if (R.step === 'before' && R.supply.length) E.take(G, R.supply[Math.floor(Math.random() * R.supply.length)].id);
    if (Math.random() < 0.3 && p.hand.length) E.give(G, p.hand[0].id, G.players.find((x) => x.id !== p.id).id);
    const fit = p.hand.find((c) => E.fits(G, c));
    if (fit && Math.random() < 0.85) {
      const homes0 = s.homes.filter(Boolean).length, stars0 = s.stars, h0 = ph === 'a' ? 0 : E.handa(G, s);
      check(E.play(G, fit.id).ok, 'a fitting card plays');
      if (ph === 'a') check(homes0 < s.homes.length ? s.homes.filter(Boolean).length === homes0 + 1 : s.stars === stars0 + 1, 'an After card fixes a home, or adds a star when none is damaged');
      else check(E.handa(G, s) === h0 + 1, 'Before and During cards add 1');
    }
    check(E.done(G).ok, 'Done works after the supply card');
  }
  check(G.over && G.round === G.rounds + 1, 'a season is 4 rounds');
  check(firsts.every((id, i) => id === G.players[i % G.players.length].id), 'the first player moves along each round');
  return { G, bad };
}

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
      if (seed) { let x = seed; w.Math.random = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
      w.SpeechSynthesisUtterance = function (t) { this.text = t; };
      w.speechSynthesis = { spoken: [], cancel() {}, speak(u) { this.spoken.push(u.text); } };
    },
  });
  const w = dom.window, d = w.document;
  for (let i = 0; i < 100 && !(w.__group && d.querySelector('#app').children.length); i++) await wait(20);
  if (!w.__group) throw new Error('the game did not start: ' + errors.join('; '));
  const q = (s) => d.querySelector(s);
  const tap = (k) => { const el = q('[data-k="' + k + '"]'); if (!el) throw new Error('nothing to tap: ' + k); el.click(); };
  const type = (i, v) => { const el = q('#name-' + i); el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const msgs = (t) => sent.filter((m) => m && m.source === 'bayani-game' && m.game === 'bayanihan' && m.type === t);
  return { w, d, q, tap, type, st: () => w.__group.state(), H: w.HvHGroup, sent, msgs, errors, spoken: w.speechSynthesis.spoken, close: () => w.close() };
}
// Plays a whole season by tapping, the way players would: the best supply card, one card that fits, and one gift
function playByTaps(g, t, tag) {
  let gave = false, turns = 0;
  for (let guard = 0; guard < 600; guard++) {
    const { S, G } = g.st();
    if (S.screen === 'end') break;
    const R = G.R;
    if (R.step === 'arrive' || R.step === 'update' || R.step === 'hit') {
      const nd = g.H.need(G, G.sides[0]), line = g.q('.needline');
      if (R.step !== 'hit' && line && line.textContent.indexOf(String(nd)) < 0) t.ok(false, tag + ': the board shows the Handa the hazard needs (' + nd + ')');
      g.tap('cta'); continue;
    }
    if (!R.t.seen) { g.tap('cta'); continue; }
    turns++;
    const p = g.H.now(G);
    if (R.step === 'before' && !R.t.took) {
      const sc = (c) => (c.wild ? 3 : c.hz === R.hz ? (c.ph === 'b' ? 5 : 4) : 0);
      g.tap('card-' + R.supply.slice().sort((a, b) => sc(b) - sc(a))[0].id);
    }
    if (!gave && p.hand.length >= 3) {
      const to = G.players.find((x) => x.id !== p.id), c = p.hand[p.hand.length - 1], n0 = to.hand.length;
      g.tap('give'); g.tap('gcard-' + c.id); g.tap('gto-' + to.id);
      t.ok(to.hand.length === n0 + 1 && to.hand.some((x) => x.id === c.id) && /Bayanihan/.test(g.st().SAY.lead), tag + ': a gift moves the card and Bayani cheers');
      gave = true;
    }
    const fit = p.hand.find((c) => g.H.fits(G, c));
    if (fit) g.tap('card-' + fit.id);
    g.tap('cta');
  }
  return turns;
}

module.exports = async function () {
  const t = counter('Bayanihan Mode');

  // 1. The rules
  {
    const E = rules();
    t.ok(throws(() => E.create({ players: P(1) })) && throws(() => E.create({ players: P(5) })) && throws(() => E.create({ players: P(3), style: 'teams' })), 'rules: 2 to 4 players, and teams need 2 or 4');
    const G = E.create({ players: P(3), style: 'together', level: 'easy', seed: 42 });
    const mine = G.R.supply.filter((c) => !c.wild && c.hz === G.R.hz);
    t.ok(G.players.every((p) => p.hand.length === 3) && G.sides[0].homes.length === 6 && E.need(G, G.sides[0]) === 2, 'rules: 3 cards each, 6 homes, and 3 players need Handa 2 at level 1');
    t.ok(mine.some((c) => c.ph === 'b') && mine.some((c) => c.ph === 'd'), 'rules: Easy supplies have a Before and a During card for the coming hazard');
    E.proceed(G);
    t.ok(!E.done(G).ok, 'rules: Done waits for a supply card');
    E.take(G, G.R.supply[0].id);
    t.ok(!E.take(G, G.R.supply[0].id).ok, 'rules: one supply card a turn');
    const p = E.now(G);
    t.ok(!E.give(G, p.hand[0].id, p.id).ok && E.give(G, p.hand[0].id, G.players[1].id).ok && !E.give(G, p.hand[0].id, G.players[1].id).ok, 'rules: one gift a turn, never to yourself');
    const T = E.create({ players: P(4), style: 'teams', seed: 7 });
    E.proceed(T); E.take(T, T.R.supply[0].id);
    const tp = E.now(T), stars0 = E.sideOf(T, tp).stars;
    const rival = T.players.find((x) => x.side !== tp.side);
    t.ok(E.give(T, tp.hand[0].id, rival.id).rival && E.sideOf(T, tp).stars === stars0 + 1, 'rules: a gift to the other team earns your team a star');
    let broken = [];
    for (const level of ['easy', 'hard']) for (const [n, style] of [[2, 'together'], [3, 'together'], [4, 'together'], [2, 'teams'], [4, 'teams']]) {
      for (let seed = 1; seed <= 40; seed++) {
        const r = ruleSeason(E, { players: P(n), style, level, seed: seed * 977 });
        broken = broken.concat(r.bad.map((b) => level + ' ' + style + ' ' + n + ' seed ' + seed + ': ' + b));
        const res = E.result(r.G);
        if (style === 'teams' ? ['agila', 'kalabaw', 'both'].indexOf(res.winner) < 0 : ['hero', 'ready', 'practice'].indexOf(res.badge) < 0) broken.push('no result');
        if (res.helpers.length !== n) broken.push('a helper badge for every player');
      }
    }
    t.ok(!broken.length, 'rules: 400 seasons follow the rules: ' + broken.slice(0, 4).join(' | '));
    const deal = (s) => { const x = E.create({ players: P(3), level: 'hard', seed: s }); return JSON.stringify([x.R.hz, x.R.supply.map((c) => c.text), x.players.map((q) => q.hand.map((c) => c.text))]); };
    t.ok(deal(31337) === deal(31337), 'rules: the same seed deals the same cards');
  }

  // 2. Inside the library, Easy, sound and voice on, all together
  {
    const g = await open(LIB, '?embed=1&level=easy&sound=1&voice=1&name=Ana', true, 11);
    const { S } = g.st();
    t.ok(g.w.__group.embed && S.screen === 'setup' && S.names[0] === 'Ana', 'library: opens at the setup with the player\'s nickname as the first player');
    t.ok(S.level === 'easy' && S.okHard && !g.q('[data-k="level-hard"]') && !g.q('.hero'), 'library: the level comes from the library\'s intro, with no level picker or banner');
    t.ok(g.q('[data-k="leave"]').getAttribute('aria-label') === 'Back to the library' && /Test game/i.test(g.q('.chips').textContent), 'library: a Back to the library button and the Test Game label');
    g.tap('add'); g.type(1, 'Ben'); g.type(2, 'Mika');
    g.tap('start');
    t.ok(g.st().S.screen === 'play' && g.st().G.players.map((p) => p.name).join(',') === 'Ana,Ben,Mika', 'library: the game starts with Ana, Ben and Mika');
    const say1 = g.msgs('say')[0];
    t.ok(say1 && /is coming!/.test(say1.text) && !g.spoken.length, 'library: the library reads the first line, and the frame stays quiet');
    t.ok(!!say1 && !/[\uD83C-\uDBFF][\uDC00-\uDFFF]/.test(say1.text), 'library: no emoji in the lines read aloud');
    const turns = playByTaps(g, t, 'together');
    const { S: S2, G } = g.st();
    t.ok(S2.screen === 'end' && turns === 4 * 3 * 3, 'library: a season of 4 rounds, 3 turns each for 3 players, ends (' + turns + ' turns)');
    t.ok(!!g.q('.badge .bt') && g.q('.helpers').children.length === 3, 'library: the end shows the barangay badge and 3 helper badges');
    const res = g.H.result(G), safe = res.sides[0].safe;
    t.ok(g.q('.badge .bt').textContent === (safe === 6 ? 'Handa Hero' : safe >= 4 ? 'Ready Barangay' : 'Keep Practicing'), 'library: the badge matches the homes kept safe (' + safe + ')');
    g.tap('about-end');
    const about = g.q('#sheet').textContent;
    t.ok(/Concept by/.test(about) && /Celine Tatco/.test(about) && /Developed with AI assistance by/.test(about) && /Subject for code and content validation/.test(about), 'About: the validation notice and the credits');
    t.ok(g.q('#sheet').querySelectorAll('a[href^="https://"]').length === 3, 'About: three sources, each a link');
    g.tap('a-close');
    g.tap('leave-end');
    t.ok(g.msgs('exit').length === 1, 'library: Back to the library tells the library the players left');
    t.ok(!g.errors.length, 'library, together: no errors: ' + g.errors.slice(0, 3).join(' | '));
    g.close();
  }

  // 3. Inside the library, Difficult, 4 players in teams, voice off
  {
    const g = await open(LIB, '?embed=1&level=hard&sound=1&voice=0&name=Leo', true, 23);
    g.tap('add'); g.tap('add');
    g.type(1, 'Ben'); g.type(2, 'Mika'); g.type(3, 'Ana');
    g.tap('style-teams');
    t.ok(g.st().S.style === 'teams' && g.q('.prow .chip.agila') && g.q('.prow .chip.kalabaw'), 'teams: 4 players split into Team Agila and Team Kalabaw');
    g.tap('start');
    t.ok(g.st().S.screen === 'play' && !g.st().S.sheet && g.st().G.level === 'hard', 'library, Difficult: no second grown-up question inside the game');
    t.ok(!g.msgs('say').length, 'voice off: Bayani does not read by himself');
    g.tap('hear');
    t.ok(g.msgs('say').length === 1 && g.msgs('say')[0].force, 'voice off: the speaker button still reads the line');
    playByTaps(g, t, 'teams');
    const res = g.H.result(g.st().G);
    t.ok(g.st().S.screen === 'end' && ['agila', 'kalabaw', 'both'].indexOf(res.winner) >= 0 && !!g.q('.win'), 'teams: the season ends with a winner or both teams');
    g.tap('again');
    t.ok(g.st().S.screen === 'play' && g.st().G.round === 1, 'Play again starts a new season with the same players');
    g.tap('back'); g.tap('q-end');
    t.ok(g.st().S.screen === 'setup' && g.st().S.names[3] === 'Ana', 'End game returns to the setup, names kept');
    g.tap('leave');
    t.ok(g.msgs('exit').length === 1, 'Back from the setup returns to the library');
    t.ok(!g.errors.length, 'library, teams: no errors: ' + g.errors.slice(0, 3).join(' | '));
    g.close();
  }

  // 4. With 3 players, teams are off
  {
    const g = await open(LIB, '?embed=1&level=easy&sound=0', true, 5);
    g.tap('add'); g.tap('style-teams');
    t.ok(g.st().S.style === 'together' && g.q('[data-k="style-teams"]').getAttribute('aria-disabled') === 'true', 'teams need 2 or 4 players');
    g.close();
  }

  // 5. On its own: the setup with a level picker, its own voice, and a grown-up before Difficult
  if (fs.existsSync(SOLO)) {
    const g = await open(SOLO, '', false, 9);
    t.ok(!g.w.__group.embed && !!g.q('.hero') && !!g.q('[data-k="level-hard"]') && !g.q('[data-k="leave"]'), 'on its own: the banner, a level picker, and no library button');
    g.tap('level-hard'); g.tap('start');
    const sh = g.st().S.sheet;
    t.ok(sh && sh.kind === 'gate' && g.st().S.screen === 'setup', 'on its own: Difficult asks a grown-up first');
    g.tap('key-1'); g.tap('key-ok');
    t.ok(g.st().S.sheet.wrong && g.st().S.screen === 'setup', 'on its own: a wrong answer does not start the game');
    String(g.st().S.sheet.a * g.st().S.sheet.b).split('').forEach((n) => g.tap('key-' + n));
    g.tap('key-ok');
    t.ok(g.st().S.screen === 'play' && g.st().G.level === 'hard' && g.st().G.players[0].name === 'Player 1', 'on its own: the right answer starts Difficult, with Player 1 for an empty name');
    t.ok(g.spoken.some((x) => /is coming!/.test(x)), 'on its own: Bayani reads with the device\'s voice');
    t.ok(!g.sent.length, 'on its own: nothing is sent anywhere');
    t.ok(!g.errors.length, 'on its own: no errors: ' + g.errors.slice(0, 3).join(' | '));
    g.close();
  } else {
    t.ok(false, 'the single file was not built (run npm run test:games)');
  }
  return t;
};
