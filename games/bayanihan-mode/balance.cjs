// Balance check for Bayanihan Mode: plays thousands of seeded seasons with three kinds of players (careful, a young
// player who picks at random, and one who plays nothing) and prints how often the barangay, or each team, keeps its
// homes safe. Run it after changing the numbers in engine.js (LV and SET): node games/bayanihan-mode/balance.cjs
// engine.js is a page script (the build puts it inside page.html), so it runs here with a window of its own
const E = (() => { const box = { window: {} }; require('vm').runInNewContext(require('fs').readFileSync(require('path').join(__dirname, 'engine.js'), 'utf8'), box); return box.window.HvHGroup; })();

const later = (G, p) => { const R = G.R, i = R.order.indexOf(p.id); return R.order.slice(i + 1).map((id) => E.player(G, id)); };
// A careful player: takes the supply card that fits this hazard, shares extra cards with a teammate who has none,
// and plays what fits (During only while the side still needs Handa).
function good(G, gift = true) {
  const R = G.R, p = E.now(G), s = E.sideOf(G, p), ph = E.STEP_PH[R.step];
  if (R.step === 'before' && R.supply.length) {
    const score = (c) => (c.wild ? 3 : c.hz === R.hz ? (c.ph === 'b' ? 5 : c.ph === 'd' ? 4 : 2) : G.queue[0] === c.hz ? 1.5 : 0);
    E.take(G, R.supply.slice().sort((a, b) => score(b) - score(a))[0].id);
  }
  const useful = (c, steps) => c.wild || (c.hz === R.hz && steps.indexOf(c.ph) >= 0);
  if (gift && ph !== 'a') {
    const steps = ph === 'b' ? ['b', 'd'] : ['d'];
    const mine = p.hand.filter((c) => useful(c, steps));
    const mates = (ph === 'b' ? G.players.filter((q) => q.side === p.side && q.id !== p.id) : later(G, p).filter((q) => q.side === p.side));
    const needy = mates.find((q) => !q.hand.some((c) => useful(c, steps)));
    if (mine.length >= 2 && needy) {
      const give = mine.find((c) => c.ph === 'd' && !c.wild) || mine.find((c) => c.wild) || mine[1];
      E.give(G, give.id, needy.id);
    }
  }
  const fit = p.hand.filter((c) => E.fits(G, c));
  if (fit.length) {
    const c = fit.find((x) => !x.wild) || fit[0];
    if (ph === 'b') E.play(G, c.id);
    else if (ph === 'd') { if (E.handa(G, s) < E.need(G, s)) E.play(G, c.id); }
    else if (s.homes.indexOf(false) >= 0 || !c.wild) E.play(G, c.id);
  }
}
// A young player: takes any supply card, plays a card that fits most of the time, never gives.
function kid(G) {
  const R = G.R, p = E.now(G);
  if (R.step === 'before' && R.supply.length) E.take(G, R.supply[Math.floor(Math.random() * R.supply.length)].id);
  const fit = p.hand.filter((c) => E.fits(G, c));
  if (fit.length && Math.random() < 0.8) E.play(G, fit[0].id);
}
function idle(G) { const R = G.R; if (R.step === 'before' && R.supply.length) E.take(G, R.supply[0].id); }

function season(opts, strat) {
  const G = E.create(opts);
  const lv = [], sh = [];
  for (let guard = 0; !G.over && guard < 500; guard++) {
    const R = G.R;
    if (R.step === 'arrive' || R.step === 'update') { E.proceed(G); continue; }
    if (R.step === 'hit') { lv.push(R.level); G.sides.forEach((s) => sh.push(R.hit[s.id])); E.proceed(G); continue; }
    E.reveal(G); strat(G);
    const r = E.done(G);
    if (!r.ok) throw new Error('stuck: ' + r.why);
  }
  return { res: E.result(G), lv, sh };
}
function run(label, n, style, level, strat, games = 3000) {
  let safeFrac = 0, hero = 0, ready = 0, rounds = 0, roundsSafe = 0, lvSum = 0, ties = 0, gap = 0;
  for (let i = 0; i < games; i++) {
    const players = Array.from({ length: n }, (_, k) => ({ name: 'P' + k, av: '🐢' }));
    const { res, lv, sh } = season({ players, style, level, seed: 1000 + i * 7919 }, strat);
    res.sides.forEach((s) => { safeFrac += s.safe / s.homes / res.sides.length; });
    if (style === 'together') { if (res.badge === 'hero') hero++; if (res.badge !== 'practice') ready++; }
    else { if (res.winner === 'both') ties++; gap += Math.abs(res.sides[0].safe - res.sides[1].safe); }
    sh.forEach((h) => { rounds++; if (h.safe) roundsSafe++; });
    lv.forEach((l) => { lvSum += l; });
  }
  const pct = (x) => (100 * x / games).toFixed(0).padStart(3) + '%';
  console.log(label.padEnd(34), 'homes safe', (100 * safeFrac / games).toFixed(0).padStart(3) + '%',
    ' rounds matched', (100 * roundsSafe / rounds).toFixed(0).padStart(3) + '%',
    style === 'together' ? ' hero ' + pct(hero) + ' ready+ ' + pct(ready) : ' ties ' + pct(ties) + ' gap ' + (gap / games).toFixed(2),
    ' avg level', (lvSum / (games * 4)).toFixed(2));
}
function all(tag) {
  console.log('=== ' + tag + ' ===');
  for (const level of ['easy', 'hard']) {
    for (const n of [2, 3, 4]) run(level + ' together ' + n + ' good', n, 'together', level, good);
    for (const n of [2, 3, 4]) run(level + ' together ' + n + ' kid', n, 'together', level, kid);
    run(level + ' together 3 no gifts', 3, 'together', level, (G) => good(G, false));
    run(level + ' together 3 idle', 3, 'together', level, idle, 500);
    for (const n of [2, 4]) run(level + ' teams ' + n + ' good', n, 'teams', level, good);
    for (const n of [2, 4]) run(level + ' teams ' + n + ' kid', n, 'teams', level, kid);
  }
}
all('Bayanihan Mode, ' + JSON.stringify(E.SET) + ', flips ' + E.LV.easy.flips + ' and ' + E.LV.hard.flips);
