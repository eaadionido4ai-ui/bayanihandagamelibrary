// Bayanihan Mode, Handa vs. Hazard for 2 to 4 players on one device: the rules, kept apart from the screens, so the
// page (page.html, where the build puts this file), the tests (games/tests/bayanihan-mode.test.cjs) and the balance
// check (balance.cjs) all run the same code. Everything is seeded: the same seed deals the same game.
// Plain ES5, so it runs on older phones too.
(function (root) {
  'use strict';

  /* ===== The cards (the same as the solo game) =====
     Hazards (Filipino name first). Easy uses plain words for the levels; Difficult uses the real scales where there
     is one: PAGASA's wind signals, PAGASA's rainfall warnings, and the PHIVOLCS Earthquake Intensity Scale. */
  var HZ = {
    typhoon: { name: 'Bagyo', en: 'Typhoon', easy: ['Strong winds', 'Very strong winds', 'Even stronger winds'], hard: ['Signal No. 1', 'Signal No. 2', 'Signal No. 3'] },
    flood: { name: 'Baha', en: 'Flood', easy: ['Yellow rain warning', 'Orange rain warning', 'Red rain warning'], hard: ['Yellow warning: 7.5 to 15 mm of rain an hour', 'Orange warning: 15 to 30 mm an hour', 'Red warning: over 30 mm an hour'] },
    quake: { name: 'Lindol', en: 'Earthquake', easy: ['Strong shaking', 'Very strong shaking', 'Destructive shaking'], hard: ['Intensity V: Strong', 'Intensity VI: Very Strong', 'Intensity VII: Destructive'] },
    fire: { name: 'Sunog', en: 'Fire', easy: ['Small fire', 'Spreading fire', 'Big fire'], hard: ['Small fire', 'Spreading fire', 'Big fire'] },
    slide: { name: 'Guho', en: 'Landslide', easy: ['Cracks on the slope', 'Rocks falling', 'Big landslide'], hard: ['Cracks on the slope', 'Rocks falling', 'Big landslide'] },
    surge: { name: 'Daluyong', en: 'Storm surge', easy: ['High waves', 'Water at the shore', 'Big storm surge'], hard: ['High waves', 'Water at the shore', 'Big storm surge'] }
  };
  var ACTIONS = {
    typhoon: {
      b: [['Bring loose things inside', '📥'], ['Charge the radio and power bank', '🔋'], ['Listen to PAGASA updates', '📻']],
      d: [['Stay inside, away from windows', '🏠'], ['Go to the evacuation center when told', '🏫'], ['Keep your go bag close', '🎒']],
      a: [['Stay away from fallen wires', '⚡'], ['Wait for the all-clear before going out', '✅'], ['Help clean up with a grown-up', '🧹']]
    },
    flood: {
      b: [['Move important things up high', '📦'], ['Put papers in a plastic pouch', '📄'], ['Know your evacuation route', '🗺️']],
      d: [['Go to higher ground early', '⛰️'], ['Never walk or play in floodwater', '🚫'], ['Stay away from rivers and canals', '🚷']],
      a: [['Wash hands with clean water', '💧'], ['Throw away food that touched floodwater', '🗑️'], ['Get scratches checked', '🏥']]
    },
    quake: {
      b: [['Tie tall cabinets to the wall', '🗄️'], ['Know the safe spots in each room', '🔍'], ['Join the earthquake drill', '🔔']],
      d: [['Duck, cover and hold', '🙇'], ['Stay away from windows and shelves', '📚'], ['Outside? Move to an open space', '🏞️']],
      a: [['Walk out calmly when the shaking stops', '🚶'], ['Stay in the open during aftershocks', '⚠️'], ['Check for injuries and tell a grown-up', '🗣️']]
    },
    fire: {
      b: [['Don’t overload outlets', '🔌'], ['Test the smoke alarm', '🚨'], ['Plan two ways out', '🚪']],
      d: [['Get down low under the smoke', '⬇️'], ['Get out and stay out', '🏃'], ['Call 911 or shout for help', '📞']],
      a: [['Never go back inside', '⛔'], ['Meet at your meeting place', '📍'], ['Talk about how you feel', '💬']]
    },
    slide: {
      b: [['Watch for cracks on slopes', '👀'], ['Plant trees and grass on slopes', '🌱'], ['Learn the warning signs', '📋']],
      d: [['Move away from the slope’s path', '🏃'], ['Listen for rumbling sounds', '👂'], ['Go to the evacuation center early', '🏫']],
      a: [['Stay away from the slide area', '⛔'], ['Report broken roads and pipes', '📞'], ['Wait for the all-clear', '✅']]
    },
    surge: {
      b: [['Know if your home is near the shore', '🗺️'], ['Leave the coast early when warned', '🚗'], ['Pack the go bag', '🎒']],
      d: [['Stay at the evacuation center inland', '🏫'], ['Stay far from the shore', '🚫'], ['Listen to PAGASA warnings', '📻']],
      a: [['Wait for the all-clear before going home', '✅'], ['Watch out for debris', '⚠️'], ['Help your neighbors', '🤝']]
    }
  };
  // Easy: four hazards, two cards for the coming hazard in the supplies, glowing hints. Difficult: six hazards, one
  // card for it in the supplies, no hints. Both turn over two storm cards a round (tuned with balance.cjs: careful
  // players keep every home safe in about 95% of Easy seasons and 65 to 80% of Difficult ones).
  var LV = {
    easy: { hz: ['typhoon', 'flood', 'quake', 'fire'], flips: 2, grow: 0.35, wild: 0.12, hints: true, label: 'Ages 6 to 10', age: 'young' },
    hard: { hz: ['typhoon', 'flood', 'quake', 'fire', 'slide', 'surge'], flips: 2, grow: 0.4, wild: 0.08, hints: false, label: 'Ages 10 to 15', age: 'older' }
  };
  // The group game. rounds: a season; start: cards each player starts with; draw: cards each player draws at the start
  // of a round; handMax: cards a hand keeps between rounds; homes: homes per side (together: the barangay's,
  // teams: each team's). A side needs Handa of (level x players on that side / 2, rounded up) to match the hazard.
  var SET = { rounds: 4, start: 3, draw: 1, handMax: 6, homes: { together: 6, teams: 3 }, cap: 3, flipsPerPlayer: false };
  var TEAMS = [{ id: 'agila', name: 'Team Agila', short: 'Agila', icon: '🦅' }, { id: 'kalabaw', name: 'Team Kalabaw', short: 'Kalabaw', icon: '🐃' }];
  var PH = { b: 'Before', d: 'During', a: 'After' };
  var STEP_PH = { before: 'b', during: 'd', after: 'a' };

  /* ===== Seeded numbers (xorshift); the state is a plain number, so a game can be saved and picked up again ===== */
  function rand(G) {
    var x = G.rs >>> 0 || 1;
    x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    G.rs = x;
    return x / 4294967296;
  }
  function rint(G, a, b) { return a + Math.floor(rand(G) * (b - a + 1)); }
  function pickOf(G, a) { return a[Math.floor(rand(G) * a.length)]; }
  function shuffle(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand(G) * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ===== Cards ===== */
  function card(G, hz, ph, i) { var a = ACTIONS[hz][ph][i]; return { id: 'c' + (++G.uid), hz: hz, ph: ph, text: a[0], pic: a[1] }; }
  function anyCard(G, hz, ph) { return card(G, hz, ph, rint(G, 0, ACTIONS[hz][ph].length - 1)); }
  function wild(G) { return { id: 'c' + (++G.uid), wild: true, text: 'Neighbors help each other. +1 for any hazard, any time.', pic: '🤝' }; }
  function randCard(G) { var L = LV[G.level]; return rand(G) < L.wild ? wild(G) : anyCard(G, pickOf(G, L.hz), pickOf(G, ['b', 'd', 'a'])); }
  function hazardDeck(G) { var d = []; LV[G.level].hz.forEach(function (h) { for (var i = 0; i < 4; i++) d.push(h); }); return shuffle(G, d); }
  function fromDeck(G) { if (!G.deck.length) G.deck = hazardDeck(G); return G.deck.shift(); }
  function lvName(G, hz, n) { return HZ[hz][G.level][Math.max(1, Math.min(3, n)) - 1]; }

  /* ===== Players and sides ===== */
  function player(G, id) { for (var i = 0; i < G.players.length; i++) if (G.players[i].id === id) return G.players[i]; return null; }
  function side(G, id) { for (var i = 0; i < G.sides.length; i++) if (G.sides[i].id === id) return G.sides[i]; return null; }
  function sideOf(G, p) { return side(G, p.side); }
  function need(G, s) { return Math.ceil(G.R.level * s.members.length / 2); }
  function handa(G, s) { var pl = G.R.played[s.id]; return pl.b.length + pl.d.length; }
  function now(G) { var R = G.R; return R && R.order ? player(G, R.order[R.turn]) : null; }

  function create(o) {
    var n = (o.players || []).length;
    if (n < 2 || n > 4) throw new Error('2 to 4 players');
    if (o.style === 'teams' && n === 3) throw new Error('teams need 2 or 4 players');
    var G = { v: 1, style: o.style === 'teams' ? 'teams' : 'together', level: o.level === 'hard' ? 'hard' : 'easy', rs: (o.seed >>> 0) || 1, uid: 0,
      round: 0, rounds: SET.rounds, deck: [], queue: [], players: [], sides: [], R: null, over: false, faced: [] };
    G.deck = hazardDeck(G);
    if (G.style === 'teams') {
      TEAMS.forEach(function (t) { G.sides.push({ id: t.id, name: t.name, short: t.short, icon: t.icon, homes: fill(SET.homes.teams), stars: 0, members: [] }); });
    } else {
      G.sides.push({ id: 'all', name: 'Barangay Handa', short: 'Barangay', icon: '🏘️', homes: fill(SET.homes.together), stars: 0, members: [] });
    }
    o.players.forEach(function (q, i) {
      var s = G.style === 'teams' ? G.sides[i % 2] : G.sides[0];
      var p = { id: 'p' + i, name: q.name, av: q.av, side: s.id, hand: [], st: { b: 0, d: 0, a: 0, given: 0, fixed: 0, rival: 0 } };
      for (var k = 0; k < SET.start; k++) p.hand.push(randCard(G));
      s.members.push(p.id);
      G.players.push(p);
    });
    nextRound(G);
    return G;
  }
  function fill(n) { var a = []; for (var i = 0; i < n; i++) a.push(true); return a; }

  // A round: a hazard arrives at level 1 (from the early warning first). Before turns (each player takes 1 supply
  // card), a storm update that can stack the hazard, During turns, the hazard hits, then After turns.
  function nextRound(G) {
    G.round++;
    if (G.round > G.rounds) { G.over = true; G.R = null; return; }
    var hz = G.queue.length ? G.queue.shift() : fromDeck(G);
    var n = G.players.length, first = (G.round - 1) % n, order = [];
    for (var i = 0; i < n; i++) order.push(G.players[(first + i) % n].id);
    var played = {};
    G.sides.forEach(function (s) { played[s.id] = { b: [], d: [], a: [] }; });
    G.R = { hz: hz, level: 1, step: 'arrive', order: order, turn: 0, t: null, supply: [], reveals: [], played: played, hit: null };
    if (G.faced.indexOf(hz) < 0) G.faced.push(hz);
    if (G.round > 1) G.players.forEach(function (p) { for (var k = 0; k < SET.draw; k++) p.hand.push(randCard(G)); });
    G.R.supply = makeSupply(G, hz, n + 1);
  }
  // Supplies for the round: one more card than there are players. Easy always has a Before and a During card for the
  // coming hazard; Difficult has one card for it. There is often one for the hazard in the early warning.
  function makeSupply(G, hz, size) {
    var s = [];
    if (G.level === 'easy') { s.push(anyCard(G, hz, 'b')); s.push(anyCard(G, hz, 'd')); }
    else s.push(anyCard(G, hz, pickOf(G, ['b', 'd'])));
    if (G.queue.length) s.push(anyCard(G, G.queue[0], pickOf(G, ['b', 'd', 'a'])));
    while (s.length < size) s.push(randCard(G));
    return shuffle(G, s.slice(0, size));
  }
  function fits(G, c) { var R = G.R, ph = R && STEP_PH[R.step]; return !!ph && (!!c.wild || (c.hz === R.hz && c.ph === ph)); }

  /* ===== Actions. Each returns { ok: true, ... } or { ok: false, why: '...' } and changes G only when ok ===== */
  function bad(why) { return { ok: false, why: why }; }
  function startTurn(G) { G.R.t = { took: false, gave: false, played: false, seen: false }; }
  // The shared screens move on: arrive -> before turns, update -> during turns, hit -> after turns
  function proceed(G) {
    var R = G.R;
    if (!R) return bad('over');
    if (R.step === 'arrive') { R.step = 'before'; R.turn = 0; startTurn(G); return { ok: true }; }
    if (R.step === 'update') { R.step = 'during'; R.turn = 0; startTurn(G); return { ok: true }; }
    if (R.step === 'hit') { R.step = 'after'; R.turn = 0; startTurn(G); return { ok: true }; }
    return bad('not a shared screen');
  }
  // The player holding the phone says it is them, and their hand shows
  function reveal(G) { var t = G.R && G.R.t; if (!t) return bad('no turn'); t.seen = true; return { ok: true }; }
  function take(G, id) {
    var R = G.R, t = R && R.t, p = now(G);
    if (!p || R.step !== 'before') return bad('supplies come on Before turns');
    if (t.took) return bad('one supply card a turn');
    var i = indexOf(R.supply, id);
    if (i < 0) return bad('no such card');
    var c = R.supply.splice(i, 1)[0];
    p.hand.push(c); t.took = true;
    return { ok: true, card: c };
  }
  function give(G, id, to) {
    var R = G.R, t = R && R.t, p = now(G), q = player(G, to);
    if (!p || !t || !STEP_PH[R.step]) return bad('not a turn');
    if (t.gave) return bad('one gift a turn');
    if (!q || q.id === p.id) return bad('give to someone else');
    var i = indexOf(p.hand, id);
    if (i < 0) return bad('no such card');
    var c = p.hand.splice(i, 1)[0];
    q.hand.push(c); t.gave = true; p.st.given++;
    var rival = G.style === 'teams' && q.side !== p.side;
    if (rival) { sideOf(G, p).stars++; p.st.rival++; }
    return { ok: true, card: c, rival: rival };
  }
  function play(G, id) {
    var R = G.R, t = R && R.t, p = now(G), ph = R && STEP_PH[R.step];
    if (!p || !t || !ph) return bad('not a turn');
    if (t.played) return bad('one card a turn');
    var i = indexOf(p.hand, id);
    if (i < 0) return bad('no such card');
    var c = p.hand[i];
    if (!fits(G, c)) return bad(c.hz !== R.hz && !c.wild ? 'other hazard' : 'other step');
    p.hand.splice(i, 1); t.played = true;
    var s = sideOf(G, p), out = { ok: true, card: c, ph: ph };
    R.played[s.id][ph].push({ card: c, by: p.id });
    if (ph === 'b') p.st.b++;
    else if (ph === 'd') p.st.d++;
    else {
      p.st.a++;
      var k = s.homes.indexOf(false);
      if (k >= 0) { s.homes[k] = true; p.st.fixed++; out.fixed = true; }
      else { s.stars++; out.star = true; }
    }
    return out;
  }
  // Ends the turn of the player holding the phone. A Before turn needs its supply card first, while any are left.
  function done(G) {
    var R = G.R, t = R && R.t;
    if (!t || !STEP_PH[R.step]) return bad('not a turn');
    if (R.step === 'before' && !t.took && R.supply.length) return bad('take a supply card first');
    if (R.turn < R.order.length - 1) { R.turn++; startTurn(G); return { ok: true, next: now(G).id }; }
    R.t = null;
    if (R.step === 'before') { R.step = 'update'; stormUpdate(G); return { ok: true, shared: 'update' }; }
    if (R.step === 'during') { R.step = 'hit'; hit(G); return { ok: true, shared: 'hit' }; }
    endRound(G);
    return { ok: true, shared: G.over ? 'end' : 'arrive' };
  }
  // The storm update: another card of the same hazard stacks it one level (3 at most); a different hazard goes to the
  // early warning (2 at most) and comes next.
  function stormUpdate(G) {
    var R = G.R, L = LV[G.level], n = SET.flipsPerPlayer ? G.players.length : L.flips, out = [];
    R.supply = [];
    for (var i = 0; i < n; i++) {
      var hz = rand(G) < L.grow ? R.hz : fromDeck(G);
      if (hz === R.hz && R.level < SET.cap) { R.level++; out.push({ hz: hz, kind: 'up' }); }
      else if (hz === R.hz) out.push({ hz: hz, kind: 'max' });
      else if (G.queue.length < 2) { G.queue.push(hz); out.push({ hz: hz, kind: 'next' }); }
      else { G.deck.push(hz); out.push({ hz: hz, kind: 'back' }); }
    }
    R.reveals = out;
  }
  // The hazard hits every side at once. A side that is short loses that many homes (at most the hazard's level).
  function hit(G) {
    var R = G.R;
    R.hit = {};
    G.sides.forEach(function (s) {
      var nd = need(G, s), h = handa(G, s), short = Math.max(0, nd - h), dmg = Math.min(short, R.level), done = 0;
      for (var i = 0; i < s.homes.length && done < dmg; i++) if (s.homes[i]) { s.homes[i] = false; done++; }
      if (!short) s.stars++;
      R.hit[s.id] = { need: nd, handa: h, damage: done, safe: !short };
    });
  }
  function endRound(G) {
    G.players.forEach(function (p) { var drop = Math.max(0, p.hand.length - SET.handMax); if (drop) p.hand.splice(0, drop); });
    nextRound(G);
  }
  function indexOf(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return i; return -1; }

  /* ===== The end of the season ===== */
  function result(G) {
    var sides = G.sides.map(function (s) { return { id: s.id, name: s.name, safe: s.homes.filter(Boolean).length, homes: s.homes.length, stars: s.stars }; });
    var out = { sides: sides, winner: null, badge: null, helpers: helpers(G) };
    if (G.style === 'teams') {
      var a = sides[0], b = sides[1];
      out.winner = a.safe !== b.safe ? (a.safe > b.safe ? a.id : b.id) : a.stars !== b.stars ? (a.stars > b.stars ? a.id : b.id) : 'both';
    } else {
      var s = sides[0];
      out.badge = s.safe === s.homes ? 'hero' : s.safe >= Math.ceil(s.homes * 2 / 3) ? 'ready' : 'practice';
    }
    return out;
  }
  // Every player gets a helper badge for the part they did best compared with the others: giving cards, fixing homes,
  // During cards or Before cards (the rarer ones win a tie, so badges vary).
  var HELP = [['given', 'Best Helper', '🤝', 'gave', 'card', 'to friends'], ['fixed', 'Fixer', '🔧', 'fixed', 'home', ''],
    ['d', 'Quick Responder', '⚡', 'played', 'During card', ''], ['b', 'Early Bird', '🐣', 'played', 'Before card', '']];
  function helpers(G) {
    var top = {};
    HELP.forEach(function (h) { top[h[0]] = Math.max.apply(null, G.players.map(function (p) { return p.st[h[0]]; })); });
    return G.players.map(function (p) {
      var best = null, score = 0;
      HELP.forEach(function (h) { var v = p.st[h[0]], r = top[h[0]] ? v / top[h[0]] : 0; if (v > 0 && r > score) { best = h; score = r; } });
      if (!best) return { id: p.id, badge: 'Team Player', icon: '⭐', why: 'played every turn with the group' };
      var v = p.st[best[0]];
      return { id: p.id, badge: best[1], icon: best[2], why: best[3] + ' ' + v + ' ' + best[4] + (v === 1 ? '' : 's') + (best[5] ? ' ' + best[5] : '') };
    });
  }

  root.HvHGroup = {
    HZ: HZ, ACTIONS: ACTIONS, LV: LV, SET: SET, TEAMS: TEAMS, PH: PH, STEP_PH: STEP_PH,
    create: create, proceed: proceed, reveal: reveal, take: take, give: give, play: play, done: done,
    fits: fits, need: need, handa: handa, now: now, player: player, side: side, sideOf: sideOf, lvName: lvName, result: result
  };
})(typeof window !== 'undefined' ? window : module.exports);
