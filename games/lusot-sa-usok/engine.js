// Lusot sa Usok: the rules of the game, kept apart from the screens, so the page (page.html, where the build puts
// this file) and the tests (tests/engine.test.cjs) run the same code. Everything is seeded: the same seed burns the
// same way. Plain ES5, so it runs on older phones too.
//
// A fire breaks out in a school. The player, an older student on the school's safety team, moves through one floor
// seen from above. To win: sound the fire alarm, call 911, lead everyone found, and get out by an exit. Fire spreads
// from tile to tile and makes smoke. The extinguisher works on small fires only, in short bursts aimed at the base,
// and its gauge runs down; red cabinets hold fresh ones. A fire hose puts out more but only reaches so far from its
// cabinet, and never goes on an electrical fire. Firefighters come some time after the 911 call. Smoke hurts less
// while crawling and with a wet hanky. Doors: feel first, skip a hot one, close them behind you.
(function (root) {
  'use strict';

  var T = 32; // a tile, in page pixels

  /* ===== Levels =====
     Easy and Difficult are both for ages 10 to 15; Easy is gentler. spread: how fast fire jumps to the next tile.
     grow: how fast a burning tile gets hotter. smoke: how much smoke a fire makes. hurt: smoke damage a second in
     thick smoke while standing. agentUse: how much of the extinguisher a second of spraying uses. bigAt: how many
     tiles make a fire too big for an extinguisher. trucks: seconds from the 911 call to the firefighters arriving. */
  var LEVELS = {
    easy: { id: 'easy', name: 'Easy', walk: 118, crawl: 62, spread: 0.55, grow: 0.22, burn: 0.022, smoke: 0.55, hurt: 10, heat: 9,
      agentUse: 8.5, agentPower: 1.55, hosePower: 3.6, hoseReach: 6, bigAt: 10, trucks: 45, wrongCall: 6, quiz: 1 },
    hard: { id: 'hard', name: 'Difficult', walk: 118, crawl: 60, spread: 0.8, grow: 0.28, burn: 0.022, smoke: 0.75, hurt: 13, heat: 11,
      agentUse: 10, agentPower: 1.35, hosePower: 3.4, hoseReach: 6, bigAt: 8, trucks: 65, wrongCall: 10, quiz: 3 }
  };

  /* ===== Tiles =====
     Floors: . corridor, c classroom, l library, k canteen, m computer room, n clinic, f faculty room, w wash area,
     s stairs, r supply room. Furniture (blocks the way, burns): t table or desk, b bookshelf, = counter, z bed.
     u sink (wet a hanky). D closed door, d open door. E exit, S back stairs exit. Stations on the walls: A fire alarm,
     P phone, X extinguisher cabinet, H fire hose cabinet. # wall. */
  var FUEL = { '.': 0.12, c: 0.5, l: 0.75, k: 0.6, m: 0.55, n: 0.35, f: 0.5, w: 0.05, s: 0.05, r: 0.85,
    t: 0.85, b: 0.95, '=': 0.5, z: 0.6, d: 0.4, D: 0.4 };
  var SOLID = { '#': 1, t: 1, b: 1, '=': 1, z: 1, u: 1, D: 1, A: 1, P: 1, X: 1, H: 1 };
  var FLOOR = { '.': 1, c: 1, l: 1, k: 1, m: 1, n: 1, f: 1, w: 1, s: 1, r: 1, d: 1, E: 1, S: 1 };

  /* ===== The two floors =====
     Rooms are boxes of floor; furniture, doors, exits and stations go on top. people: who is waiting to be led out.
     fires: where the fire starts. later: fires that start after some seconds ([x, y, heat, seconds]). The Difficult
     floor is the same school one floor up, the other way around, with its own fires. */
  var EASY = {
    id: 'easy', w: 44, h: 22, floorName: 'Ground floor', school: 'Handa Elementary School',
    story: 'Fire broke out in the school canteen. You are on the school\'s safety team. Find a safe way through, help everyone you meet, and get out.',
    origin: 'the canteen',
    rooms: [
      ['c', 1, 1, 12, 8, 'CLASSROOM 6-A'], ['l', 14, 1, 26, 8, 'LIBRARY'], ['k', 28, 1, 42, 8, 'CANTEEN'], ['.', 1, 10, 42, 12, ''],
      ['s', 1, 14, 5, 20, 'STAIRS'], ['n', 7, 14, 14, 20, 'CLINIC'], ['f', 16, 14, 25, 20, 'FACULTY ROOM'], ['w', 27, 14, 33, 20, 'WASH AREA'],
      ['r', 35, 14, 42, 20, 'SUPPLY ROOM']
    ],
    furniture: [
      ['t', 2, 3, 3, 3], ['t', 5, 3, 6, 3], ['t', 8, 3, 9, 3], ['t', 2, 5, 3, 5], ['t', 5, 5, 6, 5], ['t', 8, 5, 9, 5],
      ['t', 2, 7, 3, 7], ['t', 8, 7, 9, 7], ['t', 11, 2, 12, 2],
      ['b', 15, 2, 18, 2], ['b', 21, 2, 25, 2], ['b', 15, 4, 18, 4], ['b', 21, 4, 25, 4], ['t', 16, 7, 17, 7], ['t', 21, 7, 22, 7],
      ['=', 29, 2, 35, 2], ['t', 30, 5, 31, 5], ['t', 34, 5, 35, 5], ['t', 38, 5, 39, 5], ['t', 30, 7, 31, 7], ['t', 38, 7, 39, 7],
      ['z', 12, 15, 13, 15], ['z', 12, 18, 13, 18],
      ['t', 17, 16, 18, 16], ['t', 21, 16, 22, 16], ['t', 17, 18, 18, 18], ['t', 21, 18, 22, 18],
      ['b', 36, 16, 41, 16], ['b', 36, 18, 41, 18]
    ],
    doors: [[4, 9, 1], [10, 9, 0], [16, 9, 0], [24, 9, 0], [27, 5, 1], [31, 9, 1], [39, 9, 1], [3, 13, 0], [10, 13, 0], [20, 13, 0], [30, 13, 1], [38, 13, 0]],
    exits: [['E', 43, 11, 'EXIT'], ['S', 3, 21, 'BACK STAIRS']],
    stations: [['A', 13, 9], ['X', 8, 13], ['X', 22, 9], ['H', 34, 13], ['P', 25, 15], ['u', 28, 20], ['u', 30, 20], ['u', 32, 20]],
    items: [['kit', 9, 16], ['kit', 24, 19], ['food', 2, 1], ['food', 16, 19]],
    people: [['Ana', 7, 6], ['Jun', 19, 6], ['Lia', 20, 5], ['Bea', 31, 17]],
    start: [6, 6],
    fires: [[40, 2, 0.6], [41, 3, 0.5], [40, 3, 0.45]],
    later: [[19, 11, 0.45, 8]],
    clutter: [[38, 10, 42, 10], [41, 12, 42, 12]],
    electric: ''
  };
  var HARD = {
    id: 'hard', w: 44, h: 22, floorName: 'Second floor', school: 'Handa Elementary School',
    story: 'An overloaded outlet started a fire in the computer room. You are on the school\'s safety team. Find a safe way through, help everyone you meet, and get out.',
    origin: 'the computer room', mirror: true,
    rename: { 'CLASSROOM 6-A': 'CLASSROOM 7-B', CANTEEN: 'COMPUTER ROOM', STAIRS: 'STAIRS' },
    retype: { k: 'm' },
    extraPeople: [['Carlo', 10, 17], ['Dan', 40, 15]],
    fires: [[40, 2, 0.6], [41, 3, 0.55], [39, 2, 0.45]],
    later: [[19, 11, 0.45, 10], [38, 17, 0.5, 30], [39, 17, 0.4, 30]],
    electric: 'm'  // desks in the computer room carry electricity: no water on them
  };

  /* ===== The 911 call =====
     Easy asks one question; Difficult asks three. A good answer says what is happening, where, and who is inside. */
  var CALL = {
    easy: [
      { q: '911, what is your emergency?', a: [
        ['There is a fire in the canteen of Handa Elementary School in Barangay Masigla. Some students are still inside.', 1],
        ['Help! There is a fire!', 0, 'They need to know where the fire is. Say the school and the place.'],
        ['I think I see some smoke.', 0, 'Say clearly what is happening, where, and who is still inside.']] }
    ],
    hard: [
      { q: '911, what is your emergency?', a: [['There is a fire in the computer room of our school.', 1], ['Something is wrong at school.', 0, 'Say clearly that there is a fire.'], ['I am not sure.', 0, 'Say what you see: a fire.']] },
      { q: 'Where are you?', a: [['Handa Elementary School, second floor, Barangay Masigla.', 1], ['At school.', 0, 'Give the school\'s name, the floor and the barangay.'], ['Near the stairs.', 0, 'They need the name of the school and the barangay.']] },
      { q: 'Is anyone still inside?', a: [['Yes, some students are still on the second floor.', 1], ['I will check later.', 0, 'Never go back in to check. Tell them who you know is still inside.'], ['No one, I think.', 0, 'If you are not sure, say so. Students may still be inside.']] }
    ]
  };

  /* ===== Helpers ===== */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rng(seed) {
    var a = (Math.abs(Math.floor(seed || 1)) % 4294967296) || 1;
    return function () { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296; };
  }
  function sgn(v) { return v > 0 ? 1 : v < 0 ? -1 : 0; }
  function angleDiff(a, b) { var d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }

  // the spec of a floor, laid out: the Difficult floor is the Easy one turned around, with its own fires and people
  function layout(levelId) {
    var spec = levelId === 'hard' ? HARD : EASY, base = EASY, w = base.w, mx;
    if (!spec.mirror) return spec;
    mx = function (x) { return w - 1 - x; };
    var out = {
      id: spec.id, w: w, h: base.h, floorName: spec.floorName, school: spec.school, story: spec.story, origin: spec.origin,
      rooms: base.rooms.map(function (r) { var t = (spec.retype && spec.retype[r[0]]) || r[0]; return [t, mx(r[3]), r[2], mx(r[1]), r[4], (spec.rename && spec.rename[r[5]]) || r[5]]; }),
      furniture: base.furniture.map(function (f) { return [f[0], mx(f[3]), f[2], mx(f[1]), f[4]]; }),
      doors: base.doors.map(function (d) { return [mx(d[0]), d[1], d[2]]; }),
      exits: base.exits.map(function (e) { return [e[0], mx(e[1]), e[2], e[3]]; }),
      stations: base.stations.map(function (st) { return [st[0], mx(st[1]), st[2]]; }),
      items: base.items.map(function (it) { return [it[0], mx(it[1]), it[2]]; }),
      people: base.people.concat(spec.extraPeople || []).map(function (p) { return [p[0], mx(p[1]), p[2]]; }),
      start: [mx(base.start[0]), base.start[1]],
      fires: spec.fires.map(function (f) { return [mx(f[0]), f[1], f[2]]; }),
      later: spec.later.map(function (f) { return [mx(f[0]), f[1], f[2], f[3]]; }),
      clutter: base.clutter.map(function (c) { return [mx(c[2]), c[1], mx(c[0]), c[3]]; }),
      electric: spec.electric
    };
    return out;
  }

  /* ===== A new game ===== */
  function create(levelId, seed) {
    var lv = LEVELS[levelId] || LEVELS.easy, spec = layout(lv.id), w = spec.w, h = spec.h, n = w * h, x, y, i, g = [];
    for (y = 0; y < h; y++) { g.push([]); for (x = 0; x < w; x++) g[y].push('#'); }
    function box(t, x0, y0, x1, y1) { for (y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) g[y][x] = t; }
    spec.rooms.forEach(function (r) { box(r[0], r[1], r[2], r[3], r[4]); });
    var roomAt = [];
    for (i = 0; i < n; i++) roomAt.push(-1);
    spec.rooms.forEach(function (r, k) {
      for (y = Math.min(r[2], r[4]); y <= Math.max(r[2], r[4]); y++) for (x = Math.min(r[1], r[3]); x <= Math.max(r[1], r[3]); x++) roomAt[y * w + x] = k;
    });
    var floorOf = [];
    for (i = 0; i < n; i++) floorOf.push(g[Math.floor(i / w)][i % w]);
    spec.furniture.forEach(function (f) { box(f[0], f[1], f[2], f[3], f[4]); });
    var doors = {};
    spec.doors.forEach(function (d) { g[d[1]][d[0]] = d[2] ? 'd' : 'D'; doors[d[1] * w + d[0]] = { x: d[0], y: d[1], hp: 1, felt: false, hot: false, skipped: false }; });
    spec.exits.forEach(function (e) { g[e[2]][e[1]] = e[0]; });
    spec.stations.forEach(function (st) { g[st[2]][st[1]] = st[0]; });
    var s = {
      level: lv.id, lv: lv, spec: spec, w: w, h: h, seed: seed || 1, r: rng(seed), t: 0, phase: 'play', fireClock: 0,
      grid: g, floorOf: floorOf, roomAt: roomAt, doors: doors,
      fire: new Float32Array(n), fuel: new Float32Array(n), smoke: new Float32Array(n), wet: new Float32Array(n),
      burnt: new Uint8Array(n), elec: new Uint8Array(n), region: new Int16Array(n), regionSize: [0], anyFire: false,
      player: null, people: [], items: [], trail: [], later: spec.later.map(function (f) { return f.slice(); }),
      alarm: -1, call: -1, callTries: 0, trucks: -1, ff: null, goal: null, bigSeen: false, exitBy: null,
      habits: {}, bad: {}, tipT: {}, hotSeen: [], stats: { spray: 0, onTarget: 0, wasted: 0, crawlSmoke: 0, hurt: 0, flare: 0, waterShock: 0 }
    };
    for (i = 0; i < n; i++) {
      var ch = g[Math.floor(i / w)][i % w];
      s.fuel[i] = FUEL[ch] != null ? FUEL[ch] : (FUEL[floorOf[i]] || 0);
      if (ch === '#' || ch === 'A' || ch === 'P' || ch === 'X' || ch === 'H' || ch === 'u' || ch === 'E' || ch === 'S') s.fuel[i] = 0;
      if (spec.electric && floorOf[i] === spec.electric && (ch === 't' || ch === '=')) s.elec[i] = 1;
    }
    if (spec.electric) spec.fires.forEach(function (f) { s.elec[f[1] * w + f[0]] = 1; });
    // stacked chairs and boxes by the main exit: they burn hard once the fire reaches them
    s.clutter = new Uint8Array(n);
    (spec.clutter || []).forEach(function (c) { for (y = Math.min(c[1], c[3]); y <= Math.max(c[1], c[3]); y++) for (x = Math.min(c[0], c[2]); x <= Math.max(c[0], c[2]); x++) { s.clutter[y * w + x] = 1; s.fuel[y * w + x] = 0.9; } });
    var st = spec.start;
    s.player = { x: (st[0] + 0.5) * T, y: (st[1] + 0.5) * T, r: 10, face: -Math.PI / 2, crawl: false, dodge: 0, dodgeCd: 0, roll: 0,
      health: 100, onFire: false, fireT: 0, agent: 100, hose: null, cloth: -1, clothOn: false, kits: 0, food: 0, moving: false,
      spraying: false, sprayHit: false, shockCd: 0 };
    spec.people.forEach(function (p, k) { s.people.push({ id: k, name: p[0], x: (p[1] + 0.5) * T, y: (p[2] + 0.5) * T, state: 'wait', order: -1, crawl: false, danger: 0, calling: false }); });
    spec.items.forEach(function (it) { s.items.push({ kind: it[0], x: it[1], y: it[2], got: false }); });
    spec.fires.forEach(function (f) { ignite(s, f[1] * w + f[0], f[2]); });
    s.trail.push({ x: s.player.x, y: s.player.y, c: false });
    fireTick(s, 0.0001);
    return s;
  }

  /* ===== The map ===== */
  function idx(s, tx, ty) { return tx < 0 || ty < 0 || tx >= s.w || ty >= s.h ? -1 : ty * s.w + tx; }
  function tileAt(s, tx, ty) { return tx < 0 || ty < 0 || tx >= s.w || ty >= s.h ? '#' : s.grid[ty][tx]; }
  function solid(s, tx, ty) { return !!SOLID[tileAt(s, tx, ty)]; }
  function blocksFire(ch) { return ch === '#' || ch === 'D' || ch === 'A' || ch === 'P' || ch === 'X' || ch === 'H' || ch === 'E' || ch === 'S'; }
  function blocksSmoke(ch) { return ch === '#' || ch === 'A' || ch === 'P' || ch === 'X' || ch === 'H'; }
  function center(i, w) { return { x: (i % w + 0.5) * T, y: (Math.floor(i / w) + 0.5) * T }; }
  // the stations of one kind, as tiles
  function stations(s, ch) {
    var out = [], x, y;
    for (y = 0; y < s.h; y++) for (x = 0; x < s.w; x++) if (s.grid[y][x] === ch) out.push({ x: x, y: y });
    return out;
  }
  function roomName(s, i) { var k = s.roomAt[i]; return k >= 0 ? s.spec.rooms[k][5] : ''; }

  /* ===== Fire and smoke ===== */
  function ignite(s, i, heat) {
    if (i < 0 || s.fuel[i] <= 0.01 || s.wet[i] > 0) return false;
    if (s.fire[i] <= 0) { s.fire[i] = heat || 0.15; return true; }
    return false;
  }
  var N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // fire and smoke move on 15 times a second, whatever the frame rate
  function fireTick(s, dt) {
    var lv = s.lv, w = s.w, h = s.h, n = w * h, i, f, k, j, tx, ty, ch, nch, d, any = false;
    var add = new Float32Array(n);
    for (i = 0; i < n; i++) {
      if (s.wet[i] > 0) s.wet[i] = Math.max(0, s.wet[i] - dt);
      f = s.fire[i];
      if (f <= 0) continue;
      any = true;
      tx = i % w; ty = (i - tx) / w;
      if (s.fuel[i] > 0) {
        s.fire[i] = Math.min(1, f + lv.grow * dt * (0.4 + s.fuel[i]));
        s.fuel[i] = Math.max(0, s.fuel[i] - lv.burn * dt * f);
      } else {
        s.fire[i] = Math.max(0, f - 0.1 * dt);
        if (s.fire[i] <= 0) s.burnt[i] = 1;
      }
      add[i] += lv.smoke * f * dt;
      if (f < 0.42) continue;
      for (k = 0; k < 4; k++) {
        j = idx(s, tx + N4[k][0], ty + N4[k][1]);
        if (j < 0) continue;
        nch = s.grid[ty + N4[k][1]][tx + N4[k][0]];
        if (nch === 'D') { d = s.doors[j]; if (d) { d.hp -= dt * f * 0.03; if (d.hp <= 0) { s.grid[d.y][d.x] = 'd'; ignite(s, j, 0.4); } } continue; }
        if (blocksFire(nch) || s.fire[j] > 0) continue;
        if (s.r() < lv.spread * dt * f * Math.max(0, s.fuel[j] - 0.08) * 2) ignite(s, j, 0.15);
      }
    }
    s.anyFire = any;
    // smoke: made by fire, spreads to open neighbors (a closed door lets a little through), clears slowly and at exits
    var sm = s.smoke, next = new Float32Array(n), rate = 1.6 * dt, flow, open;
    for (i = 0; i < n; i++) {
      ch = s.grid[Math.floor(i / w)][i % w];
      if (blocksSmoke(ch)) { next[i] = 0; continue; }
      tx = i % w; ty = (i - tx) / w;
      flow = 0;
      for (k = 0; k < 4; k++) {
        j = idx(s, tx + N4[k][0], ty + N4[k][1]);
        if (j < 0) continue;
        nch = s.grid[ty + N4[k][1]][tx + N4[k][0]];
        if (blocksSmoke(nch)) continue;
        open = (nch === 'D' || ch === 'D') ? 0.08 : 1;
        flow += (sm[j] - sm[i]) * open;
      }
      next[i] = clamp(sm[i] + flow * rate + add[i] - 0.012 * dt - (ch === 'E' || ch === 'S' ? 0.6 * dt : 0), 0, 1);
    }
    s.smoke = next;
    regions(s);
  }
  // groups of touching burning tiles, to tell a small fire from one too big for an extinguisher
  function regions(s) {
    var w = s.w, n = w * s.h, i, k, j, q, id = 0, size;
    for (i = 0; i < n; i++) s.region[i] = 0;
    s.regionSize = [0];
    for (i = 0; i < n; i++) {
      if (s.fire[i] < 0.1 || s.region[i]) continue;
      id++; size = 0; q = [i]; s.region[i] = id;
      while (q.length) {
        var c = q.pop(), cx = c % w, cy = (c - cx) / w; size++;
        for (k = 0; k < 4; k++) {
          j = idx(s, cx + N4[k][0], cy + N4[k][1]);
          if (j >= 0 && !s.region[j] && s.fire[j] >= 0.1) { s.region[j] = id; q.push(j); }
        }
      }
      s.regionSize.push(size);
    }
  }
  function isBig(s, i) { return s.region[i] > 0 && s.regionSize[s.region[i]] >= s.lv.bigAt; }
  function bigFireCount(s) { var c = 0; for (var k = 1; k < s.regionSize.length; k++) if (s.regionSize[k] >= s.lv.bigAt) c++; return c; }

  /* ===== Moving ===== */
  function blockedAt(s, x, y, r) {
    var x0 = Math.floor((x - r) / T), x1 = Math.floor((x + r) / T), y0 = Math.floor((y - r) / T), y1 = Math.floor((y + r) / T), tx, ty;
    for (ty = y0; ty <= y1; ty++) for (tx = x0; tx <= x1; tx++) if (solid(s, tx, ty)) return true;
    return false;
  }
  function slide(s, e, dx, dy) {
    if (dx && !blockedAt(s, e.x + dx, e.y, e.r)) e.x += dx;
    if (dy && !blockedAt(s, e.x, e.y + dy, e.r)) e.y += dy;
  }

  /* ===== One step of play =====
     inp: mx, my (where to move, -1 to 1), spray (held), dodge (pressed this step). Returns what happened. */
  function step(s, dt, inp) {
    var ev = [];
    if (s.phase !== 'play') return ev;
    dt = Math.min(Math.max(dt, 0), 0.1);
    inp = inp || {};
    var n = Math.max(1, Math.ceil(dt * 60)), k;
    for (k = 0; k < n && s.phase === 'play'; k++) tick(s, dt / n, inp, ev, k === 0);
    return ev;
  }

  function tick(s, dt, inp, ev, first) {
    var lv = s.lv, p = s.player, i, j, tx, ty;
    s.t += dt;
    // fires that start later
    for (i = 0; i < s.later.length; i++) {
      var L = s.later[i];
      if (L && s.t >= L[3]) { j = L[1] * s.w + L[0]; s.fuel[j] = Math.max(s.fuel[j], 0.8); s.bin = s.bin || []; s.bin.push(j); ignite(s, j, L[2]); s.later[i] = null; ev.push({ type: 'newfire', x: L[0], y: L[1] }); }
    }
    s.fireClock += dt;
    while (s.fireClock >= 1 / 15) { s.fireClock -= 1 / 15; fireTick(s, 1 / 15); firefighters(s, 1 / 15, ev); }

    // stop, drop and roll takes a moment and stops everything else
    if (p.roll > 0) {
      p.roll -= dt;
      if (p.roll <= 0) { p.roll = 0; p.onFire = false; p.fireT = 0; ev.push({ type: 'rolled' }); s.habits.roll = true; }
      hurt(s, dt, ev, idx(s, Math.floor(p.x / T), Math.floor(p.y / T)));
      return;
    }
    // moving
    var mx = inp.mx || 0, my = inp.my || 0, len = Math.sqrt(mx * mx + my * my), sp = p.crawl ? lv.crawl : lv.walk, vx = 0, vy = 0;
    if (p.dodgeCd > 0) p.dodgeCd = Math.max(0, p.dodgeCd - dt);
    if (inp.dodge && first && p.dodgeCd <= 0 && !p.hose) {
      p.dodge = 0.24; p.dodgeCd = 1.1; p.crawl = false;
      if (len > 0.2) p.face = Math.atan2(my, mx);
      ev.push({ type: 'dodge' });
    }
    if (p.dodge > 0) {
      p.dodge = Math.max(0, p.dodge - dt);
      vx = Math.cos(p.face) * 300; vy = Math.sin(p.face) * 300;
    } else if (len > 0.15) {
      if (len > 1) { mx /= len; my /= len; }
      vx = mx * sp; vy = my * sp;
      if (!inp.spray) p.face = Math.atan2(my, mx);
    }
    p.moving = vx !== 0 || vy !== 0;
    if (p.moving) {
      slide(s, p, vx * dt, vy * dt);
      if (p.hose) {
        var hx = p.x - p.hose.x, hy = p.y - p.hose.y, hd = Math.sqrt(hx * hx + hy * hy), reach = lv.hoseReach * T;
        if (hd > reach) { p.x = p.hose.x + hx / hd * reach; p.y = p.hose.y + hy / hd * reach; if (s.t - (s.tipT.reach || -9) > 4) { s.tipT.reach = s.t; ev.push({ type: 'tip', id: 'reach' }); } }
      }
      var last = s.trail[s.trail.length - 1];
      if (Math.abs(last.x - p.x) + Math.abs(last.y - p.y) > 6) { s.trail.push({ x: p.x, y: p.y, c: p.crawl }); if (s.trail.length > 600) s.trail.shift(); }
    }
    tx = Math.floor(p.x / T); ty = Math.floor(p.y / T);
    var here = idx(s, tx, ty), ch = tileAt(s, tx, ty);

    // picking things up
    for (i = 0; i < s.items.length; i++) {
      var it = s.items[i];
      if (!it.got && it.x === tx && it.y === ty) { it.got = true; if (it.kind === 'kit') p.kits++; else p.food++; ev.push({ type: 'pickup', kind: it.kind }); }
    }
    // spraying
    p.spraying = !!inp.spray && (p.hose || p.agent > 0) && !p.onFire;
    if (p.spraying) spray(s, dt, ev);
    else if (inp.spray && !p.hose && p.agent <= 0 && s.t - (s.tipT.empty || -9) > 3) { s.tipT.empty = s.t; ev.push({ type: 'tip', id: 'empty' }); }
    // the hanky dries
    if (p.clothOn && p.cloth > 0) p.cloth = Math.max(0, p.cloth - (s.smoke[here] > 0.1 ? 1.6 : 0.5) * dt);

    hurt(s, dt, ev, here);
    people(s, dt, ev);
    tips(s, ev, here);
    if (s.phase !== 'play') return;

    // out of the building
    if (ch === 'E' || ch === 'S') {
      s.phase = 'out'; s.exitBy = ch;
      for (i = 0; i < s.people.length; i++) if (s.people[i].state === 'follow' || s.people[i].state === 'panic' && dist(s.people[i], p) < 2.2 * T) s.people[i].state = 'out';
      ev.push({ type: 'out', by: ch });
    }
  }
  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }

  // smoke, heat and flames
  function hurt(s, dt, ev, here) {
    var lv = s.lv, p = s.player, sm = here >= 0 ? s.smoke[here] : 0, f = here >= 0 ? s.fire[here] : 0, dmg = 0, k, tx = Math.floor(p.x / T), ty = Math.floor(p.y / T), hot = 0, j;
    var air = (p.crawl ? 0.3 : 1) * (p.clothOn && p.cloth > 0 ? 0.5 : 1);
    if (sm > 0.15) { dmg += (sm - 0.1) * lv.hurt * air; if (p.crawl) s.stats.crawlSmoke += dt; }
    for (k = 0; k < 4; k++) { j = idx(s, tx + N4[k][0], ty + N4[k][1]); if (j >= 0 && s.fire[j] > hot) hot = s.fire[j]; }
    if (hot > 0.5 && p.dodge <= 0) dmg += (hot - 0.5) * lv.heat;
    if (f > 0.35 && p.dodge <= 0 && p.roll <= 0) {
      dmg += f * 26;
      p.fireT += dt;
      if (!p.onFire && p.fireT > 0.45) { p.onFire = true; ev.push({ type: 'onfire' }); }
    } else if (!p.onFire) p.fireT = Math.max(0, p.fireT - dt);
    if (p.onFire && p.roll <= 0) {
      dmg += p.moving ? 20 : 12;
      if (p.moving && s.t - (s.tipT.run || -9) > 2.5) { s.tipT.run = s.t; ev.push({ type: 'tip', id: 'run' }); s.bad.ran = true; }
    }
    if (p.shockCd > 0) p.shockCd = Math.max(0, p.shockCd - dt);
    if (dmg > 0) { p.health = Math.max(0, p.health - dmg * dt); s.stats.hurt += dmg * dt; }
    if (p.health <= 0 && s.phase === 'play') { s.phase = 'down'; ev.push({ type: 'down' }); }
  }

  // The extinguisher (or the hose): a cone in front of the player. It turns to the nearest fire in front, so a short
  // burst lands on the base of the flames. Spraying where there is no fire wastes it.
  function spray(s, dt, ev) {
    var lv = s.lv, p = s.player, hose = !!p.hose, range = (hose ? 4.3 : 3.2) * T, cone = hose ? 0.6 : 0.5;
    var w = s.w, x0 = Math.max(0, Math.floor((p.x - range) / T)), x1 = Math.min(w - 1, Math.floor((p.x + range) / T));
    var y0 = Math.max(0, Math.floor((p.y - range) / T)), y1 = Math.min(s.h - 1, Math.floor((p.y + range) / T));
    var tx, ty, i, c, dx, dy, d, a, best = null, bestD = 1e9, hit = 0, big = false, shock = false;
    for (ty = y0; ty <= y1; ty++) for (tx = x0; tx <= x1; tx++) {
      i = ty * w + tx; if (s.fire[i] <= 0.02) continue;
      c = center(i, w); dx = c.x - p.x; dy = c.y - p.y; d = Math.sqrt(dx * dx + dy * dy);
      if (d > range || d < 1) continue;
      a = Math.atan2(dy, dx);
      if (Math.abs(angleDiff(a, p.face)) < 1.1 && d < bestD && clearLine(s, p.x, p.y, c.x, c.y)) { bestD = d; best = a; }
    }
    if (best !== null) p.face = best;
    for (ty = y0; ty <= y1; ty++) for (tx = x0; tx <= x1; tx++) {
      i = ty * w + tx; if (s.fire[i] <= 0.02) continue;
      c = center(i, w); dx = c.x - p.x; dy = c.y - p.y; d = Math.sqrt(dx * dx + dy * dy);
      if (d > range || Math.abs(angleDiff(Math.atan2(dy, dx), p.face)) > cone || !clearLine(s, p.x, p.y, c.x, c.y)) continue;
      hit++;
      if (hose && s.elec[i]) { shock = true; s.fire[i] = Math.min(1, s.fire[i] + 0.5 * dt); continue; }
      var bigHere = isBig(s, i);
      if (bigHere) big = true;
      s.fire[i] = Math.max(0, s.fire[i] - (hose ? lv.hosePower : lv.agentPower) * dt * (bigHere && !hose ? 0.1 : 1));
      if (s.fire[i] < 0.03) { s.fire[i] = 0; s.wet[i] = hose ? 8 : 5; }
    }
    if (!hose) p.agent = Math.max(0, p.agent - lv.agentUse * dt);
    p.sprayHit = hit > 0;
    s.stats.spray += dt; if (hit) s.stats.onTarget += dt; else s.stats.wasted += dt;
    if (!hit && s.t - (s.tipT.waste || -9) > 3) { s.tipT.waste = s.t; ev.push({ type: 'tip', id: 'waste' }); }
    if (hose && hit && big) s.habits.hoseBig = true;
    if (!hose && hit && !big) s.habits.smallFire = true;
    if (big && !hose && !s.bigSeen) { s.bigSeen = true; ev.push({ type: 'toobig' }); }
    if (shock && p.shockCd <= 0) {
      p.shockCd = 1.5; p.health = Math.max(0, p.health - 12); s.stats.waterShock++; s.bad.water = true;
      ev.push({ type: 'shock' });
    }
  }
  // nothing solid between two points (so the spray does not go through walls)
  function clearLine(s, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, d = Math.sqrt(dx * dx + dy * dy), n = Math.ceil(d / 10), k, x, y, ch;
    for (k = 1; k < n; k++) {
      x = x0 + dx * k / n; y = y0 + dy * k / n;
      ch = tileAt(s, Math.floor(x / T), Math.floor(y / T));
      if (ch === '#' || ch === 'D' || ch === 'A' || ch === 'P' || ch === 'X' || ch === 'H' || ch === 'b') return false;
    }
    return true;
  }

  // the people: they wait, then follow your trail once you reach them; fire or thick smoke near them makes them
  // stop in fear until you come back for them
  function people(s, dt, ev) {
    var p = s.player, i, q, k = 0, tr = s.trail, at, tile, near, line = [];
    for (i = 0; i < s.people.length; i++) if (s.people[i].state === 'follow') line.push(s.people[i]);
    line.sort(function (a, b) { return a.order - b.order; });
    for (i = 0; i < s.people.length; i++) {
      q = s.people[i];
      if (q.state === 'out' || q.state === 'rescue') continue;
      tile = idx(s, Math.floor(q.x / T), Math.floor(q.y / T));
      near = dist(q, p) < 1.7 * T;
      if (q.state === 'wait') {
        q.calling = s.alarm >= 0 || dist(q, p) < 7 * T;
        if (near && !p.onFire) { q.state = 'follow'; q.order = s.t; ev.push({ type: 'join', id: q.id, name: q.name }); }
        else if (s.fire[tile] > 0.6) { q.danger += dt; if (q.danger > 6) { q.state = 'rescue'; ev.push({ type: 'rescue', id: q.id, name: q.name }); } }
        continue;
      }
      if (q.state === 'panic') {
        q.calling = true;
        if (near && s.fire[tile] < 0.3 && !p.onFire) { q.state = 'follow'; q.order = s.t; ev.push({ type: 'calm', id: q.id, name: q.name }); }
        else if (s.fire[tile] > 0.6) { q.danger += dt; if (q.danger > 6) { q.state = 'rescue'; ev.push({ type: 'rescue', id: q.id, name: q.name }); } }
      }
    }
    // the line walks your trail, a few steps apart; a closed door stops it until it is opened again
    for (k = 0; k < line.length; k++) {
      q = line[k];
      at = tr[Math.max(0, tr.length - 1 - (k + 1) * 4)];
      var dx = at.x - q.x, dy = at.y - q.y, d = Math.sqrt(dx * dx + dy * dy), sp = (p.crawl ? s.lv.crawl : s.lv.walk) * 1.35;
      if (d > 1) {
        var m = Math.min(d, sp * dt), nx = q.x + dx / d * m, ny = q.y + dy / d * m;
        if (tileAt(s, Math.floor(nx / T), Math.floor(ny / T)) === 'D') {
          q.wait = (q.wait || 0) + dt;
          if (q.wait > 2.5) { q.state = 'wait'; q.wait = 0; ev.push({ type: 'left', id: q.id, name: q.name }); if (s.t - (s.tipT.door || -9) > 4) { s.tipT.door = s.t; ev.push({ type: 'tip', id: 'behind' }); } }
          continue;
        }
        q.wait = 0; q.x = nx; q.y = ny;
      }
      q.crawl = at.c;
      tile = idx(s, Math.floor(q.x / T), Math.floor(q.y / T));
      if (s.fire[tile] > 0.35 || (s.smoke[tile] > 0.8 && !q.crawl)) {
        q.state = 'panic'; q.danger = 0; ev.push({ type: 'panic', id: q.id, name: q.name });
        if (s.t - (s.tipT.line || -9) > 4) { s.tipT.line = s.t; ev.push({ type: 'tip', id: 'line' }); }
        s.bad.line = true;
      }
    }
  }

  // Bayani's tips, each at most once every few seconds
  function tips(s, ev, here) {
    var p = s.player, t = s.t;
    function tip(id, gap) { if (t - (s.tipT[id] == null ? -99 : s.tipT[id]) > (gap || 6)) { s.tipT[id] = t; ev.push({ type: 'tip', id: id }); } }
    if (p.onFire) { tip('onfire', 3); return; }
    if (s.smoke[here] > 0.35 && !p.crawl) tip('crawl', 8);
    if (p.agent < 25 && p.agent > 0 && !p.hose) tip('low', 10);
    if (p.health < 35) tip('health', 10);
    if (s.alarm < 0 && t > 6) tip('alarm', 20);
    if (s.alarm >= 0 && s.call < 0 && t - s.alarm > 6) tip('call', 20);
  }

  // the firefighters arrive at the main exit some time after the call and push the fire back from there
  function firefighters(s, dt, ev) {
    if (s.trucks < 0) return;
    if (!s.ff) {
      if (s.t < s.trucks) return;
      var e = stations(s, 'E')[0];
      s.ff = { x: e.x, y: e.y, r: 0 };
      ev.push({ type: 'trucks' });
    }
    s.ff.r = Math.min(30, s.ff.r + 0.8 * dt);
    var w = s.w, i, tx, ty, d;
    for (i = 0; i < w * s.h; i++) {
      if (s.fire[i] <= 0) continue;
      tx = i % w; ty = (i - tx) / w; d = Math.abs(tx - s.ff.x) + Math.abs(ty - s.ff.y);
      if (d <= s.ff.r) { s.fire[i] = Math.max(0, s.fire[i] - 2.4 * dt); if (s.fire[i] < 0.03) { s.fire[i] = 0; s.wet[i] = 30; } }
    }
  }

  /* ===== The action button: what can be done right here ===== */
  function near(s, ch) {
    var p = s.player, tx = Math.floor(p.x / T), ty = Math.floor(p.y / T), dx, dy, best = null, bd = 9, d;
    for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
      if (tileAt(s, tx + dx, ty + dy) !== ch) continue;
      d = Math.abs(dx) + Math.abs(dy) - (Math.abs(angleDiff(Math.atan2(dy, dx), p.face)) < 0.8 ? 0.5 : 0);
      if (d < bd) { bd = d; best = { x: tx + dx, y: ty + dy, i: (ty + dy) * s.w + tx + dx }; }
    }
    return best;
  }
  // A door is hot when fire is close behind it, on the side away from whoever feels it (or a fire has started to
  // burn through it). fx, fy: the tile of whoever feels the door; with none given, either side counts.
  function doorHot(s, d, fx, fy) {
    var across = SOLID[tileAt(s, d.x - 1, d.y)] && SOLID[tileAt(s, d.x + 1, d.y)]; // a door in a wall that runs left and right
    var sides = across ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]], k, a, b, j, sx, sy;
    if (d.hp < 1) return true;
    for (k = 0; k < 2; k++) {
      sx = sides[k][0]; sy = sides[k][1];
      if (fx != null && ((sx && sgn(fx - d.x) === sx) || (sy && sgn(fy - d.y) === sy))) continue; // the near side
      for (a = 1; a <= 2; a++) for (b = -1; b <= 1; b++) {
        j = idx(s, d.x + sx * a + (sy ? b : 0), d.y + sy * a + (sx ? b : 0));
        if (j >= 0 && s.fire[j] > 0.25) return true;
      }
    }
    return false;
  }
  function actionFor(s) {
    var p = s.player, a;
    if (s.phase !== 'play' || p.roll > 0) return null;
    if (p.onFire) return { id: 'roll', label: 'Stop, drop and roll!', tone: 'danger' };
    if ((a = near(s, 'A')) && s.alarm < 0) return { id: 'alarm', label: 'Pull the alarm', at: a };
    if ((a = near(s, 'P')) && s.call < 0) return { id: 'call', label: 'Call 911', at: a };
    if ((a = near(s, 'H'))) return p.hose ? { id: 'hoseback', label: 'Put the hose back', at: a } : { id: 'hose', label: 'Use the fire hose', at: a };
    if ((a = near(s, 'X')) && p.agent < 95 && !p.hose) return { id: 'swap', label: 'Take a fresh extinguisher', at: a };
    if ((a = near(s, 'u')) && p.cloth < 90) return { id: 'wet', label: p.cloth < 0 ? 'Wet your hanky' : 'Wet your hanky again', at: a };
    if ((a = near(s, 'D'))) {
      var d = s.doors[a.i];
      if (!d.felt) return { id: 'feel', label: 'Feel the door', at: a };
      return d.hot ? { id: 'open', label: 'Open anyway', tone: 'danger', at: a } : { id: 'open', label: 'Open the door', at: a };
    }
    if ((a = near(s, 'd')) && s.doors[a.i] && s.fire[a.i] < 0.1 && !someoneOn(s, a)) return { id: 'close', label: 'Close the door', at: a };
    return null;
  }
  function someoneOn(s, a) {
    var p = s.player, i, q;
    if (Math.floor(p.x / T) === a.x && Math.floor(p.y / T) === a.y) return true;
    for (i = 0; i < s.people.length; i++) { q = s.people[i]; if ((q.state === 'follow' || q.state === 'wait' || q.state === 'panic') && Math.floor(q.x / T) === a.x && Math.floor(q.y / T) === a.y) return true; }
    return false;
  }
  // does what the action button shows; returns what happened
  function act(s) {
    var a = actionFor(s), ev = [], p = s.player, d;
    if (!a) return ev;
    if (a.id === 'roll') { p.roll = 1.2; p.crawl = false; ev.push({ type: 'roll' }); }
    else if (a.id === 'alarm') { s.alarm = s.t; s.habits.alarm = true; ev.push({ type: 'alarm' }); if (s.goal && s.goal.id === 'alarm') s.goal = null; }
    else if (a.id === 'call') ev.push({ type: 'call' });
    else if (a.id === 'hose') { p.hose = { x: (a.at.x + 0.5) * T, y: (a.at.y + 0.5) * T }; p.crawl = false; ev.push({ type: 'hose' }); }
    else if (a.id === 'hoseback') { p.hose = null; ev.push({ type: 'hoseback' }); }
    else if (a.id === 'swap') { p.agent = 100; s.habits.swap = true; ev.push({ type: 'swap' }); }
    else if (a.id === 'wet') { p.cloth = 100; p.clothOn = true; s.habits.cloth = true; ev.push({ type: 'wet' }); }
    else if (a.id === 'feel') {
      d = s.doors[a.at.i]; d.felt = true; d.hot = doorHot(s, d, Math.floor(p.x / T), Math.floor(p.y / T));
      if (d.hot && s.hotSeen.indexOf(a.at.i) < 0) s.hotSeen.push(a.at.i);
      ev.push({ type: 'feel', hot: d.hot });
    } else if (a.id === 'open') {
      d = s.doors[a.at.i];
      s.grid[a.at.y][a.at.x] = 'd';
      if (doorHot(s, d, Math.floor(p.x / T), Math.floor(p.y / T))) {
        s.bad.hotDoor = true; s.stats.flare++;
        ignite(s, a.at.i, 0.9); s.fire[a.at.i] = Math.max(s.fire[a.at.i], 0.9);
        var tx = Math.floor(p.x / T), ty = Math.floor(p.y / T);
        ignite(s, idx(s, tx, ty), 0.5);
        p.health = Math.max(0, p.health - 22);
        ev.push({ type: 'flare' });
        if (p.health <= 0) { s.phase = 'down'; ev.push({ type: 'down' }); }
      } else {
        if (d.felt) s.habits.felt = true; else s.bad.unfelt = true;
        ev.push({ type: 'open' });
      }
    } else if (a.id === 'close') {
      s.grid[a.at.y][a.at.x] = 'D';
      var dd = s.doors[a.at.i]; if (dd) { dd.felt = false; }
      if (s.anyFire) s.habits.closed = true;
      ev.push({ type: 'close' });
    }
    return ev;
  }
  // the hanky on or off, first aid, food
  function use(s, kind) {
    var p = s.player, ev = [];
    if (s.phase !== 'play' || p.onFire || p.roll > 0) return ev;
    if (kind === 'cloth' && p.cloth >= 0) { p.clothOn = !p.clothOn; ev.push({ type: p.clothOn ? 'clothon' : 'clothoff' }); }
    else if (kind === 'kit' && p.kits > 0 && p.health < 100) { p.kits--; p.health = Math.min(100, p.health + 40); s.habits.healed = true; ev.push({ type: 'heal', kind: 'kit' }); }
    else if (kind === 'food' && p.food > 0 && p.health < 100) { p.food--; p.health = Math.min(100, p.health + 15); ev.push({ type: 'heal', kind: 'food' }); }
    return ev;
  }
  function crawl(s, on) { if (s.phase === 'play' && !s.player.hose) s.player.crawl = on == null ? !s.player.crawl : !!on; return s.player.crawl; }

  /* ===== The 911 call ===== */
  function questions(s) { return CALL[s.level]; }
  // The call is done once every question has a good answer. Each unclear answer along the way makes the
  // firefighters a little later, because the dispatcher had to ask again.
  function called(s, wrong) {
    s.callTries = 1 + (wrong || 0);
    s.call = s.t; s.trucks = s.t + s.lv.trucks + (wrong || 0) * s.lv.wrongCall;
    s.habits.call = true;
    if (s.t < 75) s.habits.callEarly = true;
    if (s.goal && s.goal.id === 'call') s.goal = null;
    return true;
  }

  /* ===== When a fire is too big: the three choices set where to go ===== */
  function choose(s, what) {
    var p = s.player, list, best = null, bd = 1e9, i, d, c;
    if (what === 'call') list = s.call < 0 ? stations(s, 'P') : stations(s, 'E');
    else if (what === 'hose') list = stations(s, 'H');
    else list = stations(s, 'S');
    for (i = 0; i < list.length; i++) { c = list[i]; d = Math.abs((c.x + 0.5) * T - p.x) + Math.abs((c.y + 0.5) * T - p.y); if (d < bd) { bd = d; best = c; } }
    s.goal = best ? { id: what, x: best.x, y: best.y } : null;
    s.choice = what;
    return s.goal;
  }

  /* ===== The end ===== */
  function result(s) {
    var p = s.player, out = s.phase === 'out', led = 0, rescue = 0, i, total = s.people.length;
    for (i = 0; i < s.people.length; i++) { if (s.people[i].state === 'out') led++; if (s.people[i].state === 'rescue') rescue++; }
    var stars = 0;
    if (out) { stars = 1; if (s.alarm >= 0 && s.call >= 0) { stars = 2; if (led === total) stars = 3; } }
    var aim = s.stats.spray > 0 ? Math.round(100 * s.stats.onTarget / s.stats.spray) : -1;
    var good = [], miss = [];
    if (s.habits.alarm) good.push('Sounded the fire alarm'); else miss.push('Pull the fire alarm so everyone knows');
    if (s.habits.callEarly) good.push('Called for help early'); else if (s.habits.call) good.push('Called 911'); else miss.push('Call 911 and say what, where and who');
    if (s.stats.crawlSmoke > 2) good.push('Crawled low in smoke'); else miss.push('Crawl low under smoke');
    if (s.hotSeen.length && !s.bad.hotDoor) good.push('Skipped the hot door');
    if (s.habits.felt) good.push('Felt the door before opening it');
    if (s.bad.hotDoor) miss.push('Never open a hot door');
    if (s.habits.closed) good.push('Closed a door behind you');
    if (s.habits.hoseBig) good.push('Used the hose, not the extinguisher, on the big fire');
    if (s.habits.smallFire && aim >= 70) good.push('Short bursts on a small fire');
    else if (aim >= 0 && aim < 50) miss.push('Aim at the base of the fire; do not spray at nothing');
    if (s.habits.cloth) good.push('Covered nose and mouth with a wet hanky');
    if (s.habits.roll) good.push('Stopped, dropped and rolled');
    if (s.bad.ran) miss.push('If your clothes catch fire, do not run: stop, drop and roll');
    if (s.bad.water) miss.push('Never use water on an electrical fire');
    if (s.bad.line) miss.push('Keep the people with you away from fire and thick smoke');
    if (led < total && out) miss.push('Lead everyone you find');
    return {
      out: out, by: s.exitBy, stars: stars, led: led, total: total, rescue: rescue, alarm: s.alarm, call: s.call,
      aim: aim, health: Math.round(p.health), time: s.t, good: good, miss: miss
    };
  }

  root.LusotSaUsok = {
    T: T, LEVELS: LEVELS, FUEL: FUEL, SOLID: SOLID, FLOOR: FLOOR, CALL: CALL, EASY: EASY, HARD: HARD,
    layout: layout, create: create, step: step, act: act, actionFor: actionFor, use: use, crawl: crawl, choose: choose,
    questions: questions, called: called, result: result, stations: stations, tileAt: tileAt, idx: idx, roomName: roomName,
    isBig: isBig, bigFireCount: bigFireCount, solid: solid, doorHot: doorHot
  };
})(typeof window !== 'undefined' ? window : module.exports);
