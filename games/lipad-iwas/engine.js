// Lipad-Iwas: the rules of the game, kept apart from the screens, so the page (page.html, where the build puts this
// file) and the tests (tests/engine.test.cjs) run the same code. Everything is seeded: the same seed flies the same
// course. Plain ES5, so it runs on older phones too.
//
// Maya the messenger bird flies to the right on her own. A tap makes her flap up. Hazards stand in her way like the
// pipes of a flappy game, with a gap to fly through. Homes sit on the ground between them: flying low over a home
// warns it. Bubbles hold go bag items, and every third item fills the bag, which gives her a shield for one bump.
// A bump costs a heart and opens the Hazard Card for what she bumped into. The course ends at the evacuation center.
(function (root) {
  'use strict';

  /* ===== The play area, in page pixels: a phone held upright ===== */
  var W = 390, H = 844, GROUND = 746, BIRD_X = 100, BIRD_R = 15, HW = 30, COLS = 13, CEIL = 24;

  /* ===== Levels =====
     Easy is for ages 6 to 10: slower, with wide gaps and a tall warning zone over each home. Difficult is for ages 10
     to 15 (younger players with a grown-up): faster, narrower gaps, more moving hazards and each world's own twist.
     gap: the opening to fly through. spacing: from one hazard to the next. step: how far one gap may move up or down
     from the one before. minC: the highest a gap's middle may sit. zone: how close to the ground Maya must fly over a
     home to warn it. */
  var LEVELS = {
    easy: { id: 'easy', name: 'Easy', ages: 'Ages 6 to 10', speed: 118, gap: 240, spacing: 300, step: 150, minC: 300,
      gravity: 950, flap: -320, zone: 300, movers: 3, twists: 0, hearts: 3 },
    hard: { id: 'hard', name: 'Difficult', ages: 'Ages 10 to 15', speed: 150, gap: 200, spacing: 270, step: 210, minC: 250,
      gravity: 1050, flap: -345, zone: 240, movers: 5, twists: 3, hearts: 3 }
  };

  /* ===== The four worlds =====
     top and bottom: the hazards that stand in Maya's way. ground: the card for touching the ground. mover: the hazard
     that moves (Baha has none; its twist is rising water). twist: what Difficult adds. signal: the warning in force,
     with PAGASA's wind signals and rainfall warnings, the PHIVOLCS Earthquake Intensity Scale and the PHIVOLCS
     volcano alert levels. */
  var WORLDS = [
    { id: 'bagyo', name: 'Bagyo', en: 'Typhoon', top: ['billboard', 'branch'], bottom: 'post', ground: 'bagyo-wires',
      mover: 'sheet', twist: 'gust', signal: { easy: 'Signal No. 2', hard: 'Signal No. 3' }, after: 'listen',
      mission: 'A typhoon is coming. Warn every home to get ready and go to the evacuation center.' },
    { id: 'baha', name: 'Baha', en: 'Flood', top: ['wires'], bottom: 'pile', ground: 'baha-water',
      mover: null, twist: 'rise', signal: { easy: 'Orange rainfall warning', hard: 'Red rainfall warning' }, after: 'listen',
      mission: 'Heavy rain is filling the river. Warn every home to move to higher ground early.' },
    { id: 'lindol', name: 'Lindol', en: 'Earthquake', top: ['beam'], bottom: 'rubble', ground: 'lindol-tsunami',
      mover: 'rock', twist: 'shake', signal: { easy: 'Strong shaking felt', hard: 'Intensity VI: Very strong' }, after: 'phivolcs',
      mission: 'A strong quake just shook the coast, and a tsunami may follow. Warn every home to go to high ground now.' },
    { id: 'bulkan', name: 'Bulkan', en: 'Volcano', top: ['ash'], bottom: 'boulder', ground: 'bulkan-lahar',
      mover: 'bomb', twist: 'gust', signal: { easy: 'Alert Level 3', hard: 'Alert Level 4' }, after: 'phivolcs',
      mission: 'The volcano is restless. Warn every home in the danger zone to leave now.' }
  ];

  /* ===== Hazard Cards: three a world, one each for before, during and after =====
     what: what the hazard does. when and act: what to do about it. */
  var CARDS = [
    { id: 'bagyo-debris', world: 'bagyo', title: 'Flying debris', when: 'Before the storm',
      what: 'In a typhoon, strong winds can turn loose things like roof sheets into flying debris. Stay indoors and away from windows until the storm passes.',
      act: 'Tie down or bring in loose things around the house.' },
    { id: 'bagyo-signs', world: 'bagyo', title: 'Falling signs and branches', when: 'During the storm',
      what: 'Strong winds can knock down billboards, signs and tree branches.',
      act: 'Stay inside a sturdy house until the grown-ups say it is safe to go out.' },
    { id: 'bagyo-wires', world: 'bagyo', title: 'Fallen power lines', when: 'After the storm',
      what: 'Wires that fall in a storm may still carry electricity, even when they look dead.',
      act: 'Stay far away from fallen wires and tell a grown-up to report them.' },
    { id: 'baha-water', world: 'baha', title: 'Moving floodwater', when: 'Before the flood',
      what: 'Even shallow moving water can knock you down and sweep you away.',
      act: 'Move to higher ground early, before the water reaches you.' },
    { id: 'baha-wires', world: 'baha', title: 'Wires near the water', when: 'During the flood',
      what: 'Floodwater near fallen or sagging wires can carry electricity.',
      act: 'Stay out of the water and away from posts and wires.' },
    { id: 'baha-debris', world: 'baha', title: 'Hidden debris', when: 'After the flood',
      what: 'Floodwater hides logs, trash and sharp things you cannot see.',
      act: 'Never play in floodwater. If you touched it, wash with soap and clean water.' },
    { id: 'lindol-falling', world: 'lindol', title: 'Falling objects', when: 'Before the quake',
      what: 'When the ground shakes, shelves, glass, signs and rocks can fall.',
      act: 'Practice Duck, Cover, and Hold, and ask a grown-up to fasten heavy furniture to the wall.' },
    { id: 'lindol-tsunami', world: 'lindol', title: 'Signs of a tsunami', when: 'Right after the quake',
      what: 'A strong quake near the sea can cause a tsunami. The sea may suddenly pull back or roar.',
      act: 'Go to high ground right away. Do not wait for an official warning.' },
    { id: 'lindol-aftershock', world: 'lindol', title: 'Aftershocks', when: 'After the quake',
      what: 'Smaller quakes can follow a big one and make cracked walls fall.',
      act: 'Stay away from damaged buildings until grown-ups say they are safe.' },
    { id: 'bulkan-zone', world: 'bulkan', title: 'The danger zone', when: 'Before an eruption',
      what: 'Rocks and hot gases can shoot out from the crater.',
      act: 'Know your area\'s danger zone, and leave right away when you are told to evacuate.' },
    { id: 'bulkan-ash', world: 'bulkan', title: 'Ashfall', when: 'During an eruption',
      what: 'Volcanic ash can hurt your eyes, nose and lungs.',
      act: 'Stay indoors with the windows closed. Wear a mask if you must go out.' },
    { id: 'bulkan-lahar', world: 'bulkan', title: 'Lahar', when: 'After an eruption',
      what: 'Rain can turn ash into lahar, a fast flow of mud and rocks down rivers.',
      act: 'Stay away from rivers and streams near the volcano when it rains.' }
  ];

  // which card a bump opens
  var HIT_CARD = {
    billboard: 'bagyo-signs', branch: 'bagyo-signs', post: 'bagyo-wires', sheet: 'bagyo-debris',
    wires: 'baha-wires', pile: 'baha-debris',
    beam: 'lindol-falling', rubble: 'lindol-aftershock', rock: 'lindol-falling',
    ash: 'bulkan-ash', boulder: 'bulkan-zone', bomb: 'bulkan-zone'
  };

  /* ===== Go bag items, in the bubbles ===== */
  var ITEMS = [
    { id: 'whistle', name: 'Whistle' }, { id: 'flashlight', name: 'Flashlight' }, { id: 'water', name: 'Drinking water' },
    { id: 'radio', name: 'Radio' }, { id: 'kit', name: 'First aid kit' }, { id: 'food', name: 'Canned food' },
    { id: 'batteries', name: 'Batteries' }, { id: 'clothes', name: 'Extra clothes' }
  ];

  /* ===== Helpers ===== */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  // a small seeded random number maker (a linear congruential generator; exact in double precision)
  function rng(seed) {
    var a = (Math.abs(Math.floor(seed || 1)) % 4294967296) || 1;
    return function () { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296; };
  }
  function world(id) { for (var i = 0; i < WORLDS.length; i++) if (WORLDS[i].id === id) return WORLDS[i]; return WORLDS[0]; }
  function card(id) { for (var i = 0; i < CARDS.length; i++) if (CARDS[i].id === id) return CARDS[i]; return null; }
  function cardsOf(worldId) { var out = []; for (var i = 0; i < CARDS.length; i++) if (CARDS[i].world === worldId) out.push(CARDS[i].id); return out; }
  function item(id) { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i]; return null; }
  function shuffled(list, r) {
    var a = list.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ===== A new run ===== */
  function create(worldId, levelId, seed) {
    var wd = world(worldId), lv = LEVELS[levelId] || LEVELS.easy, r = rng(seed), i, x, c, k = 0;
    var maxC = GROUND - 80 - lv.gap / 2;
    var s = {
      world: wd.id, level: lv.id, wd: wd, lv: lv, seed: seed || 1, t: 0, phase: 'ready', hoverT: 0, readyY: 380,
      x: 0, y: 380, vy: 0, tilt: 0, flapT: 0, hearts: lv.hearts, shield: false, invuln: 0, items: 0, bag: 0, got: [],
      warned: 0, bumps: 0, hits: [], last: null, groundY: GROUND, gust: null, shake: 0,
      cols: [], houses: [], bubbles: [], movers: [], twists: [], end: 0
    };
    // the hazards, each with a gap to fly through
    x = 560; c = 400;
    for (i = 0; i < COLS; i++) {
      if (i) c = clamp(c + (r() * 2 - 1) * lv.step, lv.minC, maxC);
      else c = clamp(c, lv.minC, maxC);
      s.cols.push({ i: i, x: x, c: Math.round(c), top: wd.top[Math.floor(r() * wd.top.length)], bottom: wd.bottom, passed: false });
      x += lv.spacing + Math.round((r() * 2 - 1) * 20);
    }
    // a home between each pair of hazards
    for (i = 0; i < COLS - 1; i++) s.houses.push({ i: i, x: Math.round((s.cols[i].x + s.cols[i + 1].x) / 2), warned: false, look: Math.floor(r() * 4) });
    s.end = s.cols[COLS - 1].x + 360;
    // bubbles: in about half the gaps, and low over three homes (a reward for flying low)
    var kinds = shuffled(ITEMS.map(function (it) { return it.id; }), r);
    for (i = 0; i < COLS; i++) if (i === 1 || r() < 0.5) s.bubbles.push({ x: s.cols[i].x, y: s.cols[i].c, kind: kinds[k++ % kinds.length], got: false });
    var low = shuffled([1, 3, 5, 7, 9, 10], r).slice(0, 3);
    for (i = 0; i < low.length; i++) s.bubbles.push({ x: s.houses[low[i]].x + 46, y: GROUND - 130, kind: kinds[k++ % kinds.length], got: false });
    s.bubbles.sort(function (a, b) { return a.x - b.x; });
    // moving hazards, between the hazards from the third one on
    if (wd.mover) {
      var spots = shuffled([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], r).slice(0, lv.movers).sort(function (a, b) { return a - b; });
      for (i = 0; i < spots.length; i++) s.movers.push(mover(wd.mover, s, spots[i], r));
    }
    // the twist on Difficult: gusts of wind (Bagyo, Bulkan), aftershocks (Lindol); Baha's water rises instead
    if (lv.twists && wd.twist !== 'rise') {
      var tw = shuffled([2, 4, 6, 8, 10], r).slice(0, lv.twists).sort(function (a, b) { return a - b; });
      for (i = 0; i < tw.length; i++) {
        x = s.cols[tw[i]].x + HW + 24;
        s.twists.push({ kind: wd.twist, x0: x, x1: x + 150, dir: r() < 0.5 ? -1 : 1, power: 400, seen: false });
        if (wd.twist === 'shake') s.movers.push(mover('rock', s, tw[i], r));
      }
    }
    return s;
  }

  // A moving hazard in the open space after hazard number i, timed so that it crosses Maya's path there and never
  // inside a gap. A roof sheet (Bagyo) blows in from the right at one height; a rock (Lindol) falls from the sky; a
  // volcanic rock (Bulkan) falls on a slant. Each one is set going when Maya comes within reach, so it is always on
  // screen for a good while before it reaches her.
  function mover(type, s, i, r) {
    var col = s.cols[i], next = s.cols[i + 1] || col, mid = (col.x + next.x) / 2, sp = s.lv.speed, D, T, y, v, vx, fx, yc;
    if (type === 'sheet') {
      D = 420; y = Math.round(240 + r() * 300);
      return { type: type, x: mid + 95 * D / sp, y: y, y0: y, vx: -95, vy: 0, r: 19, trigger: mid - D, active: false, done: false, spin: 0 };
    }
    v = s.lv.id === 'hard' ? 230 : 180; vx = type === 'bomb' ? -60 : 0;
    yc = 250 + r() * 300;                       // how high it is when Maya passes under or over it
    fx = mid + Math.round((r() * 2 - 1) * 40);  // where she passes it
    T = (yc + 40) / v;                          // seconds from the start of its fall to that moment
    return { type: type, x: fx - vx * T, y: -40, vx: vx, vy: v, r: type === 'bomb' ? 15 : 16, trigger: fx - sp * T,
      active: false, done: false, spin: 0 };
  }

  /* ===== Playing ===== */
  // A tap. Before the first tap (and after a bump) Maya hovers and waits.
  function flap(s) {
    if (s.phase === 'ready') s.phase = 'fly';
    if (s.phase !== 'fly') return false;
    s.vy = s.lv.flap; s.flapT = 0.24;
    return true;
  }

  function progress(s) { return clamp(s.x / s.end, 0, 1); }

  function twistAt(s) {
    for (var i = 0; i < s.twists.length; i++) { var t = s.twists[i]; if (s.x >= t.x0 && s.x <= t.x1) return t; }
    return null;
  }

  // does a circle touch a box?
  function touches(cx, cy, cr, x0, y0, x1, y1) {
    var nx = clamp(cx, x0, x1), ny = clamp(cy, y0, y1), dx = cx - nx, dy = cy - ny;
    return dx * dx + dy * dy < cr * cr;
  }

  // Moves the game on by dt seconds and returns what happened, for the screen to show and sound.
  function step(s, dt) {
    var ev = [], n, i;
    dt = Math.min(Math.max(dt, 0), 0.1);
    n = Math.max(1, Math.ceil(dt * 120));
    for (i = 0; i < n && (s.phase === 'fly' || s.phase === 'ready'); i++) tick(s, dt / n, ev);
    return ev;
  }

  function tick(s, dt, ev) {
    var lv = s.lv, i, h, b, m, c, top, bot, tw, r = BIRD_R - 3;
    s.t += dt;
    if (s.shake > 0) s.shake = Math.max(0, s.shake - dt);
    if (s.phase === 'ready') {
      s.hoverT += dt; s.y = s.readyY + Math.sin(s.hoverT * 4) * 6; s.vy = 0; s.tilt = 0;
      return;
    }
    // wind and water
    var ay = lv.gravity;
    tw = twistAt(s);
    if (tw && tw.kind === 'gust') ay += tw.dir * tw.power;
    if (tw && !tw.seen) { tw.seen = true; ev.push({ type: tw.kind, dir: tw.dir }); if (tw.kind === 'shake') s.shake = 1.3; }
    s.gust = tw && tw.kind === 'gust' ? tw : null;
    if (s.wd.twist === 'rise' && lv.twists) s.groundY = GROUND - Math.round(50 * progress(s));
    s.vy = Math.min(s.vy + ay * dt, 640);
    s.y += s.vy * dt;
    s.x += lv.speed * dt;
    if (s.y < CEIL) { s.y = CEIL; if (s.vy < 0) s.vy = 0; }
    if (s.invuln > 0) s.invuln = Math.max(0, s.invuln - dt);
    if (s.flapT > 0) s.flapT = Math.max(0, s.flapT - dt);
    s.tilt = clamp(s.vy / 640, -0.45, 0.85);

    // homes: flying low over one warns it
    for (i = 0; i < s.houses.length; i++) {
      h = s.houses[i];
      if (!h.warned && Math.abs(s.x - h.x) <= 34 && s.y >= s.groundY - lv.zone) {
        h.warned = true; s.warned++;
        ev.push({ type: 'warn', house: h.i, n: s.warned, of: s.houses.length });
      }
    }
    // go bag bubbles
    for (i = 0; i < s.bubbles.length; i++) {
      b = s.bubbles[i];
      if (!b.got && Math.abs(s.x - b.x) < 40 && Math.pow(s.x - b.x, 2) + Math.pow(s.y - b.y, 2) < Math.pow(BIRD_R + 19, 2)) {
        b.got = true; s.items++; s.got.push(b.kind); s.bag = Math.min(3, s.bag + 1);
        ev.push({ type: 'item', kind: b.kind, n: s.items });
        if (s.bag >= 3 && !s.shield) { s.shield = true; s.bag = 0; ev.push({ type: 'shield' }); }
      }
    }
    // moving hazards
    for (i = 0; i < s.movers.length; i++) {
      m = s.movers[i];
      if (m.done) continue;
      if (!m.active) { if (s.x >= m.trigger) m.active = true; else continue; }
      m.x += m.vx * dt; m.y += m.vy * dt; m.spin += dt * (m.type === 'sheet' ? 5 : 3);
      if (m.type === 'sheet') m.y = m.y0 + Math.sin(m.spin * 0.7) * 26;
      if (m.y > s.groundY + 30 || m.x < s.x - 260) { m.done = true; continue; }
      if (Math.pow(s.x - m.x, 2) + Math.pow(s.y - m.y, 2) < Math.pow(BIRD_R + m.r - 6, 2)) {
        if (bump(s, m.type, ev)) { m.done = true; return; }
      }
    }
    // the hazards with gaps
    for (i = 0; i < s.cols.length; i++) {
      c = s.cols[i];
      if (c.x + HW < s.x - BIRD_R) { if (!c.passed) { c.passed = true; ev.push({ type: 'pass', col: c.i }); } continue; }
      if (c.x - HW > s.x + BIRD_R) break;
      top = c.c - lv.gap / 2; bot = c.c + lv.gap / 2;
      if (touches(s.x, s.y, r, c.x - HW, -100, c.x + HW, top)) { if (bump(s, c.top, ev, c)) return; }
      else if (touches(s.x, s.y, r, c.x - HW, bot, c.x + HW, s.groundY + 100)) { if (bump(s, c.bottom, ev, c)) return; }
    }
    // the ground
    if (s.y + BIRD_R > s.groundY) {
      if (bump(s, 'ground', ev)) return;
      s.y = s.groundY - BIRD_R; if (s.vy > 0) s.vy = s.lv.flap * 0.7;
    }
    // the evacuation center
    if (s.x >= s.end) { s.phase = 'done'; ev.push({ type: 'done', stars: stars(s), warned: s.warned }); }
  }

  // A bump. A shield takes it; otherwise it costs a heart and opens a Hazard Card. Returns true when play stops.
  function bump(s, kind, ev, col) {
    if (s.invuln > 0) return false;
    if (s.shield) {
      s.shield = false; s.invuln = 1.4;
      if (s.bag >= 3) { s.shield = true; s.bag = 0; }
      s.vy = kind === 'ground' || (col && kind === col.bottom) ? s.lv.flap * 0.85 : 160;
      ev.push({ type: 'shielded', kind: kind });
      return false;
    }
    var id = kind === 'ground' ? s.wd.ground : HIT_CARD[kind];
    s.hearts--; s.bumps++; s.hits.push(id);
    s.last = { kind: kind, card: id, col: col ? col.i : -1, x: s.x, y: s.y };
    s.phase = s.hearts > 0 ? 'bumped' : 'over';
    ev.push({ type: 'bump', kind: kind, card: id, hearts: s.hearts });
    if (s.phase === 'over') ev.push({ type: 'over' });
    return true;
  }

  // After a bump, Maya waits in the next gap, safe for a moment, until the next tap.
  function resume(s) {
    if (s.phase !== 'bumped') return false;
    var i, c, next = null;
    for (i = 0; i < s.cols.length; i++) { c = s.cols[i]; if (c.x + HW + BIRD_R > s.x) { next = c; break; } }
    s.readyY = next ? next.c : 380; s.y = s.readyY; s.vy = 0; s.hoverT = 0; s.invuln = 1.6; s.phase = 'ready';
    for (i = 0; i < s.movers.length; i++) if (!s.movers[i].done && Math.abs(s.movers[i].x - s.x) < 220) s.movers[i].done = true;
    return true;
  }

  // Stars: getting to the evacuation center is one; warning three in four homes is two; warning every home is three.
  function stars(s) {
    if (s.phase !== 'done') return 0;
    var n = s.houses.length;
    return s.warned >= n ? 3 : s.warned >= Math.ceil(n * 0.75) ? 2 : 1;
  }

  // The worlds open one after another: a world opens once the one before it has been finished on any level.
  function opened(best, all) {
    var out = {}, i, prev = true;
    for (i = 0; i < WORLDS.length; i++) {
      out[WORLDS[i].id] = all || prev;
      var b = best && best[WORLDS[i].id];
      prev = !!(b && ((b.easy || 0) > 0 || (b.hard || 0) > 0));
    }
    return out;
  }

  root.LipadIwas = {
    W: W, H: H, GROUND: GROUND, BIRD_X: BIRD_X, BIRD_R: BIRD_R, HW: HW,
    LEVELS: LEVELS, WORLDS: WORLDS, CARDS: CARDS, ITEMS: ITEMS, HIT_CARD: HIT_CARD,
    world: world, card: card, cardsOf: cardsOf, item: item, rng: rng,
    create: create, flap: flap, step: step, resume: resume, stars: stars, progress: progress, opened: opened, twistAt: twistAt
  };
})(typeof window !== 'undefined' ? window : module.exports);
