// Handa vs. Hazard, a test game. The library's copy opens inside the library (?embed=1, in a frame) at the level and
// with the sound and voice settings the library passes, and whole seasons play through at both levels: a hazard
// stacks up to level 3 at most, a hazard stronger than the player's Handa damages as many homes as it is short by, and
// After cards fix them. In the library, the library reads Bayani's lines aloud (the frame has had no tap of its own).
// Back and "Back to the library" tell the library the player left. The single file opens at its own title screen and
// asks a grown-up before the Difficult level.
// The page runs in a simulated browser (jsdom) with a pretend voice, so the tests can hear what Bayani says.
// The games draw cards at random, so each season here uses a fixed list of "random" numbers (a seed): a season that
// fails can be played again exactly.
// Run with: npm run test:games (it builds the pages first).
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');
const LIB = path.join(ROOT, 'public', 'games', 'handa-vs-hazard.html');
const SOLO = path.join(ROOT, 'games', 'standalone', 'Handa-vs-Hazard.html');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const RULES = {
  easy: { rounds: 5, updates: 1, hz: ['typhoon', 'flood', 'quake', 'fire'], age: 'Ages 6 to 10' },
  hard: { rounds: 6, updates: 2, hz: ['typhoon', 'flood', 'quake', 'fire', 'slide', 'surge'], age: 'Ages 10 to 15' },
};
// On Difficult the levels use the real scales: PAGASA's wind signals and rainfall warnings, and the PHIVOLCS scale
const HARD_NAMES = {
  typhoon: ['Signal No. 1', 'Signal No. 2', 'Signal No. 3'],
  flood: ['Yellow warning: 7.5 to 15 mm of rain an hour', 'Orange warning: 15 to 30 mm an hour', 'Red warning: over 30 mm an hour'],
  quake: ['Intensity V: Strong', 'Intensity VI: Very Strong', 'Intensity VII: Destructive'],
};
const PH = { before: 'b', during: 'd', after: 'a' };

function counter(name) {
  let pass = 0, fail = 0;
  return {
    name,
    ok(cond, msg) { if (cond) pass++; else { fail++; console.log('FAIL [' + name + ']: ' + msg); } },
    get pass() { return pass; }, get fail() { return fail; },
  };
}

// xorshift: the same seed gives the same cards every time
function seeded(seed) {
  let x = seed >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
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
      if (seed) w.Math.random = seeded(seed);
      w.SpeechSynthesisUtterance = function (t) { this.text = t; };
      w.speechSynthesis = { spoken: [], cancel() {}, speak(u) { this.spoken.push(u.text); } };
    },
  });
  const w = dom.window, d = w.document;
  for (let i = 0; i < 100 && !w.__cards; i++) await wait(20); // the game starts once the page has loaded
  if (!w.__cards) throw new Error('the game did not start: ' + errors.join('; '));
  const q = (s) => d.querySelector(s);
  const tap = (k) => { const el = q('[data-k="' + k + '"]'); if (!el) throw new Error('nothing to tap: ' + k); el.click(); };
  const st = () => w.__cards.state();
  const msgs = (type) => sent.filter((m) => m && m.source === 'bayani-game' && m.game === 'cards' && m.type === type);
  return { w, d, q, tap, st, sent, msgs, errors, spoken: w.speechSynthesis.spoken, embed: w.__cards.embed, close: () => w.close() };
}

const fits = (R, c) => { const ph = PH[R.step]; return !!ph && (!!c.wild || (c.hz === R.hz && c.ph === ph)); };
const safeHomes = (G) => G.homes.filter(Boolean).length;
// Play every card in the hand that fits this step
function playAll(g) {
  const ids = g.st().G.hand.filter((c) => fits(g.st().G.R, c)).map((c) => c.id);
  ids.forEach((id) => g.tap('card-' + id));
  return ids.length;
}

// One season. how: 'best' picks supplies for the coming hazard and plays every card that fits; 'idle' picks supplies
// and plays nothing, so the hazards hit; 'late' plays only After cards, so hazards hit and After cards fix homes.
// Returns what the season showed, and the first rules it broke.
function season(g, lv, how) {
  const L = RULES[lv], out = { rounds: 0, maxLevel: 0, hit: 0, safe: 0, fixed: 0, stacked: 0, wrongTried: false, hints: true, names: true, bad: [] };
  const bad = (m) => { if (out.bad.length < 5) out.bad.push(lv + ' ' + how + ', round ' + g.st().G.round + ': ' + m); };
  for (let guard = 0; g.st().S.screen === 'play' && guard < 20; guard++) {
    let G = g.st().G, R = G.R;
    out.rounds++;
    // Supplies
    if (R.step !== 'supply' || R.picked !== 0 || R.level !== 1) bad('a round starts with supplies, the hazard at level 1');
    if (G.hand.length > 8) bad('a hand holds 8 cards at most when a round starts, got ' + G.hand.length);
    if (L.hz.indexOf(R.hz) < 0) bad('a hazard of this level, got ' + R.hz);
    const mine = R.supply.filter((c) => !c.wild && c.hz === R.hz);
    if (lv === 'easy' && !(mine.some((c) => c.ph === 'b') && mine.some((c) => c.ph === 'd'))) bad('Easy supplies have a Before and a During card for the coming hazard');
    if (lv === 'hard' && !mine.length) bad('Difficult supplies have a card for the coming hazard');
    const pickOrder = R.supply.slice().sort((a, b) => (how === 'idle' ? 0 : fitsLater(R, b) - fitsLater(R, a)));
    pickOrder.slice(0, 2).forEach((c) => g.tap('card-' + c.id));
    R = g.st().G.R;
    if (R.step !== 'before' || R.picked !== 2 || R.supply.length !== 2) bad('two supply picks lead to Before');
    // Before: on Easy the cards that fit glow and the rest are dimmed; Difficult has no hints
    g.st().G.hand.forEach((c) => {
      const el = g.q('[data-k="card-' + c.id + '"]'), f = fits(R, c);
      if (!el) { bad('every card in the hand is shown'); return; }
      const glow = el.classList.contains('glow'), dim = el.classList.contains('dim');
      if (lv === 'easy' ? glow !== f || dim === f : glow || dim) out.hints = false;
    });
    // Once a season: a card that does not fit stays in the hand, with a note on why
    const odd = g.st().G.hand.find((c) => !fits(R, c));
    if (odd && !out.wrongTried) {
      const n = g.st().G.hand.length, w0 = g.st().G.wrong;
      g.tap('card-' + odd.id);
      const G2 = g.st().G;
      if (G2.hand.length !== n || G2.wrong !== w0 + 1 || G2.say.tone !== 'nope' || !g.q('[data-k="card-' + odd.id + '"]').classList.contains('shake')) bad('a card that does not fit stays in the hand and shakes');
      out.wrongTried = true;
    }
    if (how === 'best') playAll(g);
    R = g.st().G.R;
    const prep = R.prep;
    if (prep !== R.played.b.length) bad('each Before card adds 1');
    g.tap('cta'); // Ready! Storm update
    R = g.st().G.R;
    if (R.step !== 'update') bad('Ready shows the storm update');
    if (R.reveals.length !== L.updates) bad(L.updates + ' storm update card(s) a round, got ' + R.reveals.length);
    const ups = R.reveals.filter((r) => r.kind === 'up').length;
    if (R.level !== 1 + ups || R.level > 3) bad('each matching hazard card stacks the hazard 1 level, up to 3: level ' + R.level + ' after ' + ups + ' stack(s)');
    if (R.reveals.some((r) => r.kind === 'max') && R.level !== 3) bad('"already at its strongest" only at level 3');
    if (g.st().G.queue.length > 2) bad('the early warning holds 2 hazards at most');
    if (ups) out.stacked++;
    out.maxLevel = Math.max(out.maxLevel, R.level);
    if (g.q('.stack').children.length !== R.level) bad('the board shows one hazard card per level');
    if (lv === 'hard' && HARD_NAMES[R.hz] && g.q('.lvname').textContent !== HARD_NAMES[R.hz][R.level - 1]) out.names = false;
    g.tap('cta'); // Brace
    if (g.st().G.R.step !== 'during') bad('Brace leads to During');
    if (how === 'best') playAll(g);
    R = g.st().G.R;
    const total = R.prep + R.act, level = R.level, before = safeHomes(g.st().G);
    if (R.act !== R.played.d.length || R.prep !== prep) bad('each During card adds 1, and Before cards still count');
    g.tap('cta'); // Face it
    G = g.st().G; R = G.R;
    const short = Math.max(0, level - total);
    if (R.step !== 'after') bad('Face it leads to After');
    if ((total >= level) !== (R.result === 'safe')) bad('safe when the Handa matches the hazard: ' + total + ' against ' + level + ', got ' + R.result);
    if (R.damage !== Math.min(short, before)) bad('damage is how much the Handa is short by (' + short + '), got ' + R.damage);
    if (before - safeHomes(G) !== R.damage) bad('the homes damaged are the ones shown');
    if (R.result === 'safe') out.safe++; else out.hit++;
    // After: each card fixes a damaged home, or adds a star when none is damaged
    if (how !== 'idle') {
      G.hand.filter((c) => fits(R, c)).map((c) => c.id).forEach((id) => {
        const h0 = safeHomes(g.st().G), s0 = g.st().G.stars;
        g.tap('card-' + id);
        const h1 = safeHomes(g.st().G), s1 = g.st().G.stars;
        if (h0 < 6 ? h1 !== h0 + 1 || s1 !== s0 : s1 !== s0 + 1 || h1 !== h0) bad('an After card fixes a home, or adds a star when none is damaged');
        if (h0 < 6) out.fixed++;
      });
    }
    const last = g.st().G.round >= L.rounds;
    if (!/See how you did|Next round/.test(g.q('[data-k="cta"]').textContent) || /See how you did/.test(g.q('[data-k="cta"]').textContent) !== last) bad('the last round ends with See how you did');
    g.tap('cta'); // Next round, or the end of the season
  }
  return out;
}
// Cards worth taking: for the coming hazard first, then Bayanihan cards, then the rest
function fitsLater(R, c) { return c.wild ? 1 : c.hz === R.hz ? 2 : 0; }

module.exports = async function () {
  const t = counter('Handa vs. Hazard');

  // 1. Inside the library, Easy, sound and voice on: the library reads the lines aloud
  {
    const g = await open(LIB, '?embed=1&level=easy&sound=1&voice=1', true, 11);
    const { S, G } = g.st();
    t.ok(g.embed && S.screen === 'play' && G.round === 1 && G.R.step === 'supply', 'library: opens at round 1 (supplies), not at its own title screen');
    t.ok(S.level === 'easy' && S.sound === true && S.voice === true, 'library: takes the level and the sound and voice settings it is given');
    t.ok(g.q('.top .age').textContent === RULES.easy.age, 'library, Easy: the age label says ' + RULES.easy.age);
    t.ok(g.q('[data-k="back"]').getAttribute('aria-label') === 'Back to the library', 'library: Back says it goes back to the library');
    const deck = G.deck.concat([G.R.hz]);
    t.ok(deck.length === 16 && RULES.easy.hz.every((h) => deck.filter((x) => x === h).length === 4), 'Easy: 4 cards each of typhoon, flood, earthquake and fire');
    const say1 = g.msgs('say')[0];
    t.ok(say1 && /is coming!/.test(say1.text) && !say1.force, 'library: the first line goes to the library to read aloud (got ' + (say1 && say1.text) + ')');
    t.ok(!g.spoken.length, 'library: the frame does not speak by itself');
    t.ok(g.msgs('say').every((m) => !/[\uD83C-\uDBFF][\uDC00-\uDFFF]/.test(m.text)), 'library: no emoji in the lines read aloud');
    g.tap('hear');
    t.ok(g.msgs('say').slice(-1)[0].force === true, 'the speaker button asks the library to read the line again');
    g.tap('sound');
    const n = g.msgs('say').length;
    t.ok(g.st().S.sound === false && g.msgs('hush').length >= 1, 'muting in the game asks the library to stop reading');
    const s = season(g, 'easy', 'best');
    t.ok(g.msgs('say').length === n, 'once muted, no more lines are sent to read aloud');
    t.ok(!s.bad.length, 'Easy season (best play) follows the rules: ' + s.bad.join(' | '));
    t.ok(s.rounds === RULES.easy.rounds && g.st().S.screen === 'end', 'Easy: a season is 5 rounds, then the end screen (played ' + s.rounds + ')');
    t.ok(s.hints, 'Easy: the cards that fit glow and the others are dimmed');
    t.ok(s.maxLevel <= 2, 'Easy: one storm update a round, so a hazard reaches level 2 at most');
    t.ok(s.wrongTried, 'a card that does not fit was tried');
    const homes = safeHomes(g.st().G), badge = g.q('.badge b').textContent;
    t.ok(badge === (homes === 6 ? 'Handa Hero' : homes >= 4 ? 'Ready Barangay' : 'Keep Practicing'), 'the end badge matches the homes kept safe (' + homes + ', ' + badge + ')');
    t.ok(g.q('[data-k="change"]').textContent === 'Back to the library', 'the end screen has a Back to the library button');
    g.tap('about-end');
    const about = g.q('#sheet').textContent;
    t.ok(/Concept by/i.test(about) && /Celine Tatco/.test(about) && /Developed with AI assistance by/i.test(about) && /Edward Andrew A\. Dionido/.test(about) && /Subject for code and content validation/.test(about), 'About: the validation notice, the concept and the developer credits');
    t.ok(g.q('#sheet').querySelectorAll('a[href^="https://"]').length === 3, 'About: three sources, each a link');
    g.tap('a-close');
    g.tap('change');
    t.ok(g.msgs('exit').length === 1, 'Back to the library tells the library the player left');
    t.ok(!g.errors.length, 'library, Easy: no errors: ' + g.errors.slice(0, 3).join(' | '));
    g.close();
  }

  // 2. Inside the library, Difficult, voice off (the library has already asked for a grown-up when needed)
  {
    const g = await open(LIB, '?embed=1&level=hard&sound=1&voice=0', true, 23);
    const { S, G } = g.st();
    t.ok(S.level === 'hard' && !S.sheet && S.screen === 'play', 'library, Difficult: no second grown-up check inside the game');
    t.ok(g.q('.top .age').textContent === RULES.hard.age, 'library, Difficult: the age label says ' + RULES.hard.age);
    const deck = G.deck.concat([G.R.hz]);
    t.ok(deck.length === 24 && RULES.hard.hz.every((h) => deck.filter((x) => x === h).length === 4), 'Difficult: 4 cards each of six hazards, with landslides and storm surges');
    t.ok(!g.msgs('say').length, 'voice off: Bayani does not read his lines by himself');
    g.tap('hear');
    const heard = g.msgs('say');
    t.ok(heard.length === 1 && heard[0].force === true, 'voice off: the speaker button still reads the line');
    t.ok(heard.length && !/No\. \d|\d mm\b|\+1/.test(heard[0].text), 'lines read aloud say "Number", "millimeters" and "plus one" in full');
    const s = season(g, 'hard', 'best');
    t.ok(!s.bad.length, 'Difficult season (best play) follows the rules: ' + s.bad.join(' | '));
    t.ok(s.rounds === RULES.hard.rounds && g.st().S.screen === 'end', 'Difficult: a season is 6 rounds (played ' + s.rounds + ')');
    t.ok(s.hints, 'Difficult: no glowing hints');
    t.ok(s.names, 'Difficult: typhoon, flood and earthquake levels use PAGASA\'s and PHIVOLCS\'s names');
    g.tap('again');
    t.ok(g.st().S.screen === 'play' && g.st().G.round === 1 && g.st().G.R.step === 'supply', 'Play again starts a new season');
    g.tap('back');
    t.ok(g.msgs('exit').length === 1, 'Back during a round returns to the library');
    t.ok(!g.errors.length, 'library, Difficult: no errors: ' + g.errors.slice(0, 3).join(' | '));
    g.close();
  }

  // 3. Many seasons, both ways of playing: the rules hold every round, and every part of the game shows up
  {
    const seen = { easy: {}, hard: {} };
    let broken = [];
    for (const lv of ['easy', 'hard']) {
      for (const how of ['best', 'idle', 'late']) {
        for (let seed = 101; seed <= 106; seed++) {
          const g = await open(LIB, '?embed=1&level=' + lv + '&sound=0&voice=0', true, seed);
          const s = season(g, lv, how);
          broken = broken.concat(s.bad);
          if (g.st().S.screen !== 'end' || s.rounds !== RULES[lv].rounds) broken.push(lv + ' ' + how + ' seed ' + seed + ': the season did not reach the end');
          if (g.errors.length) broken.push(lv + ' ' + how + ' seed ' + seed + ': ' + g.errors[0]);
          if (g.msgs('say').length) broken.push(lv + ' ' + how + ' seed ' + seed + ': sound off, yet lines were sent to read aloud');
          const k = seen[lv];
          k.hit = (k.hit || 0) + s.hit; k.safe = (k.safe || 0) + s.safe; k.fixed = (k.fixed || 0) + s.fixed; k.stacked = (k.stacked || 0) + s.stacked;
          k.max = Math.max(k.max || 0, s.maxLevel);
          if (how === 'idle') k.idleHomes = Math.min(k.idleHomes == null ? 6 : k.idleHomes, safeHomes(g.st().G));
          g.close();
        }
      }
    }
    t.ok(!broken.length, '36 seasons follow the rules: ' + broken.slice(0, 5).join(' | '));
    t.ok(seen.easy.hit && seen.easy.safe && seen.hard.hit && seen.hard.safe, 'hazards were both matched and missed at both levels');
    t.ok(seen.easy.fixed && seen.hard.fixed, 'After cards fixed damaged homes at both levels');
    t.ok(seen.easy.stacked && seen.hard.stacked && seen.hard.max === 3, 'hazards stacked, and on Difficult reached level 3 (Easy max ' + seen.easy.max + ', Difficult max ' + seen.hard.max + ')');
    t.ok(seen.easy.idleHomes < 6 && seen.hard.idleHomes < 6, 'playing no cards lets the hazards damage homes');
  }

  // 4. The same seed deals the same cards (so a failing season can be played again)
  {
    const a = await open(LIB, '?embed=1&level=easy&sound=0', true, 7), b = await open(LIB, '?embed=1&level=easy&sound=0', true, 7);
    const deal = (g) => JSON.stringify([g.st().G.R.hz, g.st().G.R.supply.map((c) => c.text), g.st().G.hand.map((c) => c.text)]);
    t.ok(deal(a) === deal(b), 'the same seed deals the same cards');
    a.close(); b.close();
  }

  // 5. On its own: the title screen, its own voice, and a grown-up before the Difficult level
  if (fs.existsSync(SOLO)) {
    const g = await open(SOLO, '', false, 5);
    t.ok(!g.embed && g.st().S.screen === 'title', 'on its own: opens at the title screen');
    t.ok(!g.q('.fan button'), 'on its own: the cards on the title screen are a picture, not buttons');
    g.tap('lv-hard'); g.tap('start');
    const sh = g.st().S.sheet;
    t.ok(sh && sh.kind === 'gate', 'on its own: Difficult asks a grown-up first');
    g.tap('key-0'); g.tap('key-ok');
    t.ok(g.st().S.sheet && g.st().S.sheet.wrong && g.st().S.screen === 'title', 'on its own: a wrong answer does not start the game');
    const sh2 = g.st().S.sheet;
    String(sh2.a * sh2.b).split('').forEach((n) => g.tap('key-' + n));
    g.tap('key-ok');
    t.ok(g.st().S.screen === 'play' && g.st().S.level === 'hard', 'on its own: the right answer starts the Difficult level');
    t.ok(g.spoken.some((x) => /is coming!/.test(x)), 'on its own: Bayani reads his lines with the device\'s voice');
    t.ok(g.q('[data-k="back"]').getAttribute('aria-label') === 'Back to the start', 'on its own: Back goes to the title screen');
    g.tap('back');
    t.ok(g.st().S.screen === 'title' && !g.sent.length, 'on its own: Back returns to the title screen and sends nothing');
    t.ok(!g.errors.length, 'on its own: no errors: ' + g.errors.slice(0, 3).join(' | '));
    g.close();
  } else {
    t.ok(false, 'the single file was not built (run npm run test:games)');
  }
  return t;
};
