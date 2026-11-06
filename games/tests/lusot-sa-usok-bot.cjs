// Copied unchanged from the Lusot sa Usok project (tests/bot.cjs), for games/tests/lusot-sa-usok.test.cjs.
// A simple player for the tests and the balance check. It walks tile paths (found with a breadth-first search that
// keeps away from fire), crawls in smoke, feels doors and skips hot ones, puts out small fires in its way, and does
// the missions in a sensible order: the people nearby, the alarm, the people further on, the 911 call, the exit.
function makeBot(L, s, opts) {
  opts = opts || {};
  const T = L.T, W = s.w, H = s.h;
  const avoid = new Set();               // doors found hot
  let plan = null, target = null, stuckT = 0, lastPos = null;
  const tileOf = (e) => [Math.floor(e.x / T), Math.floor(e.y / T)];
  const passable = (x, y) => { const c = L.tileAt(s, x, y); return (!L.SOLID[c] || c === 'D') && !avoid.has(x + ',' + y); };
  const danger = (x, y) => { const i = y * W + x; return s.fire[i] > 0.2; };
  // shortest path to any tile in goals (as "x,y" keys), staying off burning tiles
  function path(goals) {
    const [sx, sy] = tileOf(s.player), start = sx + ',' + sy, prev = new Map([[start, null]]), q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift(), k = x + ',' + y;
      if (goals.has(k)) { const out = []; let c = k; while (c) { out.unshift(c.split(',').map(Number)); c = prev.get(c); } return out; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, nk = nx + ',' + ny;
        if (prev.has(nk) || !passable(nx, ny)) continue;
        if (danger(nx, ny) && !goals.has(nk)) continue;
        prev.set(nk, k); q.push([nx, ny]);
      }
    }
    return null;
  }
  const around = (st) => { const g = new Set(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = st.x + dx, y = st.y + dy; if (!L.SOLID[L.tileAt(s, x, y)]) g.add(x + ',' + y); } return g; };
  function nextGoal() {
    const p = s.player, waiting = s.people.filter((q) => q.state === 'wait' || q.state === 'panic');
    const near = (q) => Math.abs(q.x - p.x) + Math.abs(q.y - p.y);
    const person = (maxD) => {
      waiting.sort((a, b) => near(a) - near(b));
      for (const q of waiting) { if (near(q) > maxD) continue; const g = new Set([Math.floor(q.x / T) + ',' + Math.floor(q.y / T)]); const pa = path(g); if (pa) return { id: 'person', path: pa }; }
      return null;
    };
    let pp = person(8 * T); if (pp) return pp;
    if (s.alarm < 0) { const pa = path(around(L.stations(s, 'A')[0])); if (pa) return { id: 'alarm', path: pa }; }
    pp = person(60 * T); if (pp) return pp;
    if (s.call < 0) { const pa = path(around(L.stations(s, 'P')[0])); if (pa) return { id: 'call', path: pa }; }
    const exits = new Set(); for (const ch of ['E', 'S']) L.stations(s, ch).forEach((e) => exits.add(e.x + ',' + e.y));
    const pa = path(exits);
    return pa ? { id: 'exit', path: pa } : null;
  }
  // one step of input
  return function think(dt) {
    const p = s.player, ev = [];
    const a = L.actionFor(s);
    if (a && a.id === 'roll') return { act: true };
    // missions at hand
    if (a && (a.id === 'alarm' || (a.id === 'call' && opts.call !== false))) return { act: true };
    if (a && a.id === 'feel') return { act: true };
    if (a && a.id === 'open') {
      if (a.tone === 'danger') { avoid.add(a.at.x + ',' + a.at.y); plan = null; }
      else return { act: true };
    }
    if (a && a.id === 'swap' && p.agent < 40) return { act: true };
    if (a && a.id === 'wet' && opts.cloth !== false) return { act: true };
    // crawl in smoke
    const [tx, ty] = tileOf(p), here = ty * W + tx;
    L.crawl(s, s.smoke[here] > 0.3);
    if (p.health < 50 && p.kits > 0) L.use(s, 'kit');
    else if (p.health < 70 && p.food > 0) L.use(s, 'food');
    // a small fire close by and in front: a short burst
    let spray = false;
    for (let dy = -2; dy <= 2 && !spray; dy++) for (let dx = -2; dx <= 2 && !spray; dx++) {
      const i = (ty + dy) * W + tx + dx;
      if (i >= 0 && i < W * H && s.fire[i] > 0.05 && !L.isBig(s, i) && p.agent > 0 && !p.hose) spray = true;
    }
    // follow the plan
    if (!plan || !plan.path || !plan.path.length || stuckT > 1.5) { plan = nextGoal(); stuckT = 0; }
    if (!plan) return { spray };
    while (plan.path.length > 1 && plan.path[0][0] === tx && plan.path[0][1] === ty) plan.path.shift();
    const [nx, ny] = plan.path[0];
    if (danger(nx, ny) && plan.path.length > 1) { plan = null; return { spray }; }
    const gx = (nx + 0.5) * T - p.x, gy = (ny + 0.5) * T - p.y, d = Math.sqrt(gx * gx + gy * gy);
    if (lastPos && Math.abs(lastPos.x - p.x) + Math.abs(lastPos.y - p.y) < 0.2) stuckT += dt; else stuckT = 0;
    lastPos = { x: p.x, y: p.y };
    if (plan.path.length === 1 && d < 4) { plan = null; return { spray }; }
    return { mx: gx / (d || 1), my: gy / (d || 1), spray: spray && d < 40 };
  };
}
// plays a whole game; answers the 911 call right (or wrong first when asked)
function play(L, level, seed, opts) {
  opts = opts || {};
  const s = L.create(level, seed), think = makeBot(L, s, opts), events = [];
  for (let t = 0; t < (opts.limit || 300) && s.phase === 'play'; t += 1 / 30) {
    const inp = think(1 / 30);
    if (inp.act) {
      const ev = L.act(s); events.push(...ev);
      if (ev.some((e) => e.type === 'call')) {
        const qs = L.questions(s);
        L.called(s, opts.wrongFirst ? 1 : 0);
      }
      if (ev.some((e) => e.type === 'toobig')) L.choose(s, 'away');
    }
    events.push(...L.step(s, 1 / 30, inp));
  }
  return { s, events, r: L.result(s) };
}
module.exports = { makeBot, play };
