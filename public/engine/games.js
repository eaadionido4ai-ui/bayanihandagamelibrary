/* BYANI-Handa Games - prototype v0.2 (3D)
   Lead developer: Edward Andrew A. Dionido, UP Resilience Institute, assisted by AI.
   One offline file, no personal data. Two 3D games sharing one Three.js runtime.
   Sections: Logic (pure, testable) / App (screens+audio) / AimController /
             FireGame (enhanced 3D) / GoBag (3D). */

(function () {
  "use strict";

  /* =====================================================================
     ITEM DATA for the go bag game
     ===================================================================== */
  var ITEMS = [
    { id: "water", name: "Water bottle", icon: "\uD83D\uDCA7", good: true, weight: 3, info: "Clean water keeps you going. Try to pack enough for three days." },
    { id: "food", name: "Ready to eat food", icon: "\uD83E\uDD6B", good: true, weight: 2, info: "Canned goods or crackers give you energy and do not spoil quickly." },
    { id: "flashlight", name: "Flashlight", icon: "\uD83D\uDD26", good: true, weight: 1, info: "A flashlight helps you see when the power goes out." },
    { id: "batteries", name: "Spare batteries", icon: "\uD83D\uDD0B", good: true, weight: 1, info: "Extra batteries keep your flashlight and radio working." },
    { id: "firstaid", name: "First aid kit", icon: "\uD83E\uDE79", good: true, weight: 2, info: "A first aid kit helps you clean and cover small cuts and scrapes." },
    { id: "whistle", name: "Whistle", icon: "\uD83C\uDFBA", good: true, weight: 1, info: "A whistle lets you call for help without shouting. Rescuers can hear it far away." },
    { id: "radio", name: "Small radio", icon: "\uD83D\uDCFB", good: true, weight: 2, info: "A small radio brings you news and warnings even with no internet." },
    { id: "powerbank", name: "Power bank", icon: "\uD83D\uDD0C", good: true, weight: 1, info: "A power bank charges your phone so you can reach your family." },
    { id: "documents", name: "Copies of IDs", icon: "\uD83D\uDCC4", good: true, weight: 1, info: "Copies of your IDs and papers, kept dry, help you prove who you are." },
    { id: "meds", name: "Medicine", icon: "\uD83D\uDC8A", good: true, weight: 1, info: "Any medicine you take every day should come with you." },
    { id: "mask", name: "Face mask", icon: "\uD83D\uDE37", good: true, weight: 1, info: "A face mask protects you from dust, smoke, and germs." },
    { id: "cash", name: "Some cash", icon: "\uD83D\uDCB5", good: true, weight: 1, info: "A little cash helps when card machines are down." },
    { id: "clothes", name: "Dry clothes", icon: "\uD83D\uDC55", good: true, weight: 2, info: "A dry change of clothes keeps you warm and comfortable." },
    { id: "toy", name: "Small comfort toy", icon: "\uD83E\uDDF8", good: true, weight: 1, info: "One small toy can help you feel calm and brave. Choose a little one." },
    { id: "contacts", name: "Family phone list", icon: "\uD83D\uDCDD", good: true, weight: 1, info: "A written list of family numbers helps if your phone dies." },
    { id: "console", name: "Game console", icon: "\uD83C\uDFAE", good: false, weight: 3, info: "Fun, but it is heavy and needs power you may not have." },
    { id: "soda", name: "Soda", icon: "\uD83E\uDD64", good: false, weight: 2, info: "Sweet drinks make you thirstier. Plain water is better." },
    { id: "icecream", name: "Ice cream", icon: "\uD83C\uDF66", good: false, weight: 2, info: "It melts fast and makes a mess. Leave it in the freezer." },
    { id: "tv", name: "Television", icon: "\uD83D\uDCFA", good: false, weight: 3, info: "Far too big and heavy to carry." },
    { id: "bricks", name: "Bricks", icon: "\uD83E\uDDF1", good: false, weight: 3, info: "Heavy and will only tire you out." },
    { id: "books", name: "Stack of books", icon: "\uD83D\uDCDA", good: false, weight: 3, info: "A big stack of books is too heavy for a go bag." },
    { id: "hairdryer", name: "Hair dryer", icon: "\uD83D\uDCA8", good: false, weight: 2, info: "It needs a wall plug and is not needed in an emergency." },
    { id: "balloon", name: "Balloons", icon: "\uD83C\uDF88", good: false, weight: 1, info: "Fun, but they will not help you stay safe." },
    { id: "beachball", name: "Beach ball", icon: "\uD83C\uDFD0", good: false, weight: 2, info: "It takes up space you need for real supplies." }
  ];
  var CAPACITY = 14, ESS = 9, DIS = 5;

  // Champion ID badges (one per game; only playable games can be earned so far)
  var BADGE_DEFS = [
    { id: "hazard", name: "Hazard Hunt", icon: "\uD83D\uDDFA", earnable: true },
    { id: "gobag", name: "Go Bag", icon: "\uD83C\uDF92", earnable: true },
    { id: "fire", name: "Fire Out", icon: "\uD83E\uDDEF", earnable: true },
    { id: "nobody", name: "No One Left", icon: "\uD83D\uDEAA", earnable: false },
    { id: "bleed", name: "Stop Bleed", icon: "\uD83E\uDE79", earnable: true },
    { id: "cpr", name: "CPR Hero", icon: "\u2764", earnable: true },
    { id: "quake", name: "Quake Ready", icon: "\uD83C\uDFD7", earnable: true },
    { id: "path", name: "Safe Path", icon: "\uD83E\uDDED", earnable: true },
    { id: "cares", name: "Community Builder", icon: "\uD83C\uDFD8", earnable: true },
    { id: "cleanup", name: "Cleanup Crew", icon: "\uD83E\uDDF9", earnable: true },
    { id: "sapa", name: "Water Warden", icon: "\uD83D\uDCA7", earnable: true }
  ];

  /* =====================================================================
     1) LOGIC  (pure, testable)
     ===================================================================== */
  var Logic = {
    clamp: function (v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); },

    fire: {
      // multiplier for how fast fire drops given technique
      extinguishRate: function (s) {
        if (!s || !s.pinPulled) return 0;
        if ((s.agentLeft != null) && s.agentLeft <= 0) return 0;
        var rate = s.aimAtBase ? 1.0 : 0.25;
        rate *= s.sweeping ? 1.5 : 0.7;
        var d = typeof s.distance === "number" ? s.distance : 3;
        var df = 1.0;
        if (d < 1.0) df = 0.4;        // too close
        else if (d > 5) df = 0.25;    // too far to reach
        else if (d > 4) df = 0.7;
        return rate * df;
      },
      // fire grows back when it is not being fought well (teaches: do not stop early)
      growth: function (s) {
        if (!s) return 0;
        var fighting = s.pinPulled && s.spraying && s.aimAtBase && (s.agentLeft == null || s.agentLeft > 0);
        return fighting ? 0 : 2.2;   // intensity per second regrowth when unattended
      },
      nextHint: function (s) {
        s = s || {};
        if (!s.pinPulled) return "Pull the safety pin first.";
        if (s.agentLeft != null && s.agentLeft <= 0) return "The extinguisher is empty. Press restart.";
        if (s.distance != null && s.distance > 4.2) return "Step a little closer.";
        if (s.distance != null && s.distance < 1.0) return "Not too close. Step back a step.";
        if (!s.spraying) return "Hold the green Spray button.";
        if (!s.aimAtBase) return "Aim low, at the base of the fire.";
        if (!s.sweeping) return "Sweep from side to side.";
        return "Great, keep sweeping the base!";
      },
      rateStars: function (r) {
        r = r || {};
        var s = 3;
        if (!r.easy && (r.timeSec || 0) > 22) s -= 1;
        if ((typeof r.aimAccuracy === "number" ? r.aimAccuracy : 1) < 0.7) s -= 1;
        return Math.max(1, s);
      }
    },

    gobag: {
      ITEMS: ITEMS, CAPACITY: CAPACITY,
      byId: function (id) { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i]; return null; },
      shuffle: function (arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
      },
      buildRound: function (essCount, disCount) {
        var good = ITEMS.filter(function (x) { return x.good; });
        var bad = ITEMS.filter(function (x) { return !x.good; });
        var ne = essCount == null ? ESS : Math.min(essCount, good.length);
        var nd = disCount == null ? DIS : Math.min(disCount, bad.length);
        var picks = this.shuffle(good).slice(0, ne).concat(this.shuffle(bad).slice(0, nd));
        return this.shuffle(picks);
      },
      bagWeight: function (items) { var w = 0; for (var i = 0; i < items.length; i++) w += items[i].weight || 0; return w; },
      isOverCapacity: function (items, cap) { return this.bagWeight(items) > (cap || CAPACITY); },
      scoreRound: function (tray, packedIds) {
        var totalGood = 0, packedGood = 0, wrongPacks = 0, missedGood = 0;
        for (var i = 0; i < tray.length; i++) {
          var it = tray[i], packed = packedIds.indexOf(it.id) !== -1;
          if (it.good) { totalGood++; if (packed) packedGood++; else missedGood++; }
          else if (packed) wrongPacks++;
        }
        return { totalGood: totalGood, packedGood: packedGood, missedGood: missedGood, wrongPacks: wrongPacks };
      },
      rateStars: function (r) {
        var ratio = r.totalGood > 0 ? r.packedGood / r.totalGood : 0;
        var s = ratio >= 0.9 ? 3 : (ratio >= 0.6 ? 2 : 1);
        if (r.wrongPacks >= 3) s = Math.max(1, s - 1);
        return s;
      }
    },

    safepath: {
      OBSTACLE: { T: 1, B: 1, P: 1, W: 1 },
      FACES: ["clear", "clear", "clear", "clear", "quake", "typhoon"],
      LEVELS: [
        ["W.......",
         "W..T....",
         "W.......",
         "W....B.E",
         "W.......",
         "W.P.....",
         "W......S"],
        ["W....B..S",
         "W....B...",
         "W........",
         "W..TT....",
         "W........",
         "WWW......",
         "W......E."],
        ["W........",
         "W.T..B.T.",
         "W........",
         "W..P...B.",
         "W........",
         "W.B..T...",
         "W........",
         "..S.....E"]
      ],
      TRACE: [
        "S.......",
        ".TT..B..",
        "........",
        ".B...T..",
        "....B...",
        "..T.....",
        "......TE"
      ],
      parse: function (rows) {
        var h = rows.length, w = rows[0].length, cells = [], start = -1, evac = -1, y, x;
        for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
          var ch = rows[y][x], i = y * w + x, obst = !!this.OBSTACLE[ch];
          if (ch === "S") start = i; if (ch === "E") evac = i;
          cells.push({ x: x, y: y, ch: ch, walkable: !obst, source: obst });
        }
        return { w: w, h: h, cells: cells, start: start, evac: evac };
      },
      at: function (g, x, y) { return (x < 0 || y < 0 || x >= g.w || y >= g.h) ? null : g.cells[y * g.w + x]; },
      neighbors4: function (g, i) {
        var c = g.cells[i], r = [], d = [[1, 0], [-1, 0], [0, 1], [0, -1]], k, n;
        for (k = 0; k < 4; k++) { n = this.at(g, c.x + d[k][0], c.y + d[k][1]); if (n && n.walkable) r.push(n.y * g.w + n.x); }
        return r;
      },
      isRisky: function (g, i) {
        var c = g.cells[i]; if (!c.walkable) return false;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue; var n = this.at(g, c.x + dx, c.y + dy);
          if (n && n.source) return true;
        }
        return false;
      },
      nearestSourceType: function (g, i) {
        var c = g.cells[i], diag = null, dx, dy, n;
        for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue; n = this.at(g, c.x + dx, c.y + dy);
          if (n && n.source) { if (Math.abs(dx) + Math.abs(dy) === 1) return n.ch; diag = n.ch; }
        }
        return diag;
      },
      bfs: function (g, from, to, avoidRisky) {
        if (from < 0 || to < 0) return -1;
        var q = [from], dist = {}, i; dist[from] = 0;
        while (q.length) {
          var cur = q.shift(), ns = this.neighbors4(g, cur);
          for (i = 0; i < ns.length; i++) {
            var nx = ns[i];
            if (avoidRisky && nx !== to && this.isRisky(g, nx)) continue;
            if (dist[nx] == null) { dist[nx] = dist[cur] + 1; if (nx === to) return dist[nx]; q.push(nx); }
          }
        }
        return dist[to] == null ? -1 : dist[to];
      },
      bfsPath: function (g, from, to, avoidRisky) {
        if (from < 0 || to < 0) return null;
        var q = [from], prev = {}, seen = {}, i; seen[from] = 1;
        while (q.length) {
          var cur = q.shift();
          if (cur === to) { var path = [to], p = to; while (p !== from) { p = prev[p]; path.unshift(p); } return path; }
          var ns = this.neighbors4(g, cur);
          for (i = 0; i < ns.length; i++) { var nx = ns[i]; if (avoidRisky && nx !== to && this.isRisky(g, nx)) continue; if (!seen[nx]) { seen[nx] = 1; prev[nx] = cur; q.push(nx); } }
        }
        return null;
      },
      rollDie: function (rng) { var r = rng ? rng() : Math.random(); return this.FACES[Math.min(this.FACES.length - 1, Math.floor(r * this.FACES.length))]; },
      catches: function (face, risky) { return face !== "clear" && !!risky; },
      hazardName: function (face) { return face === "quake" ? "Earthquake" : face === "typhoon" ? "Typhoon" : "All clear"; },
      message: function (face, sourceCh) {
        if (face === "quake") {
          if (sourceCh === "W") return "An earthquake struck while you were near the coastline. A tsunami can follow, so move to higher ground away from the sea.";
          if (sourceCh === "B") return "An earthquake struck next to a building. Falling glass and debris are dangerous, so keep away from buildings during a quake.";
          if (sourceCh === "P") return "An earthquake struck next to an electricity pole. It can topple and wires can spark, so stay clear of poles.";
          if (sourceCh === "T") return "An earthquake struck near a tree. Branches can fall, so move to open, clear ground.";
          return "An earthquake struck. Move to open ground away from anything that can fall.";
        }
        if (face === "typhoon") {
          if (sourceCh === "T") return "A typhoon hit while you stood by a tree. Branches and trunks can fall in strong wind, so keep your distance.";
          if (sourceCh === "P") return "A typhoon hit next to an electricity pole. Wires can snap and spark, so stay well away.";
          if (sourceCh === "W") return "A typhoon hit near the coastline. A storm surge can flood the shore, so move inland to higher ground.";
          if (sourceCh === "B") return "A typhoon hit near a building. Roofs and signs can fly off, so move to a safer open area.";
          return "A typhoon hit. Move away from anything that can be blown loose.";
        }
        return "All clear. This is a safe spot.";
      },
      rateStars: function (r) {
        var eff = r.shortest > 0 ? r.shortest / Math.max(r.steps, 1) : 1;
        if (r.heartsLost === 0 && eff >= 0.8) return 3;
        if (r.heartsLost <= 1 && eff >= 0.55) return 2;
        return 1;
      },

      LEVEL3: {
        feat: [
          "...E.....",
          "..T....B.",
          ".........",
          "......T..",
          ".....P...",
          "..T....B.",
          ".........",
          "....S....",
          "WWWWWWWWW"
        ],
        elev: [
          "555555555",
          "444444444",
          "344444444",
          "232222222",
          "222222222",
          "222222222",
          "222222222",
          "111111111",
          "000000000"
        ]
      },
      LOW3: 1, HIGH3: 4,
      HAZARDS3: ["clear", "tsunami", "surge", "typhoon", "thunderstorm", "landslide"],
      parse3: function (feat, elev) {
        var g = this.parse(feat); g.elev = [];
        for (var i = 0; i < g.cells.length; i++) {
          var y = Math.floor(i / g.w), x = i % g.w, e = parseInt(elev[y][x], 10);
          if (isNaN(e)) e = 0; if (g.cells[i].ch === "W") e = 0;
          g.cells[i].elev = e; g.elev.push(e);
        }
        return g;
      },
      elevAt: function (g, i) { return (g.elev && g.elev[i] != null) ? g.elev[i] : 0; },
      maxSlope: function (g, i) {
        var c = g.cells[i], m = 0, d = [[1, 0], [-1, 0], [0, 1], [0, -1]], k, n, e = this.elevAt(g, i);
        for (k = 0; k < 4; k++) { n = this.at(g, c.x + d[k][0], c.y + d[k][1]); if (n) { var diff = Math.abs(e - this.elevAt(g, n.y * g.w + n.x)); if (diff > m) m = diff; } }
        return m;
      },
      nearAny: function (g, i, chs) {
        var c = g.cells[i], dx, dy, n;
        for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; n = this.at(g, c.x + dx, c.y + dy); if (n && chs.indexOf(n.ch) !== -1) return true; }
        return false;
      },
      dangerAt: function (g, i, hz) {
        if (!g.cells[i].walkable || i === g.evac) return false;
        var e = this.elevAt(g, i);
        if (hz === "tsunami" || hz === "surge") return e <= this.LOW3 || this.nearAny(g, i, ["W"]);
        if (hz === "typhoon") return e <= this.LOW3 || this.nearAny(g, i, ["T", "P", "B"]);
        if (hz === "thunderstorm") return e >= this.HIGH3 || this.nearAny(g, i, ["T", "P"]);
        if (hz === "landslide" || hz === "mudslide") return this.maxSlope(g, i) >= 2;
        return false;
      },
      rollHazard3: function (rng) {
        var pool = ["clear", "clear", "tsunami", "surge", "typhoon", "thunderstorm", "landslide"];
        var r = rng ? rng() : Math.random();
        return pool[Math.min(pool.length - 1, Math.floor(r * pool.length))];
      },
      cascade3: function (hz, rng) {
        if (hz === "typhoon" || hz === "thunderstorm") { var r = rng ? rng() : Math.random(); if (r < 0.4) return "landslide"; }
        return null;
      },
      hazardTitle3: function (hz) {
        return hz === "tsunami" ? "Tsunami" : hz === "surge" ? "Storm surge" : hz === "typhoon" ? "Typhoon" : hz === "thunderstorm" ? "Thunderstorm" : (hz === "landslide" || hz === "mudslide") ? "Landslide" : "All clear";
      },
      advice3: function (hz) {
        if (hz === "tsunami") return "Tsunami warning. Leave the low coast and climb to higher ground.";
        if (hz === "surge") return "Storm surge warning. The sea will rise over low ground. Move uphill, away from the water.";
        if (hz === "typhoon") return "Typhoon warning. Keep away from trees, poles, houses, and the coast.";
        if (hz === "thunderstorm") return "Thunderstorm warning. Do not stand under trees or poles, and stay off the highest open ground.";
        if (hz === "landslide") return "Landslide warning. Steep slopes can give way. Keep off steep ground.";
        return "All clear. Choose any next step toward the tent.";
      },
      message3: function (hz, g, i) {
        if (hz === "tsunami") return "The tsunami swept over this low ground near the sea. Head uphill, away from the water.";
        if (hz === "surge") return "The storm surge flooded this low ground. Move to higher ground, away from the coast.";
        if (hz === "typhoon") { if (this.nearAny(g, i, ["T"])) return "A tree came down beside you in the typhoon. Stay clear of trees in strong wind."; if (this.nearAny(g, i, ["P"])) return "A power line snapped nearby in the typhoon. Keep away from poles."; if (this.nearAny(g, i, ["B"])) return "Flying debris from a house struck near you. Keep your distance in a typhoon."; return "The surge reached this low ground. Move uphill, away from the coast."; }
        if (hz === "thunderstorm") { if (this.nearAny(g, i, ["T", "P"])) return "Lightning struck a tall tree or pole beside you. Never shelter under them in a storm."; return "You were the tallest thing on high open ground when lightning struck. Move lower and off the peak."; }
        if (hz === "landslide" || hz === "mudslide") return "The steep slope gave way beneath you. Keep off steep ground during heavy rain.";
        return "All clear.";
      }
    },

    cleanup: {
      ACTIONS: ["keep", "toss", "hazard"],
      actionLabel: { keep: "Clean and keep", toss: "Throw away", hazard: "Do not touch, tell an adult" },
      BINS: ["bio", "recycle", "special"],
      binLabel: { bio: "Biodegradable", recycle: "Recyclable", special: "Hazardous or special" },
      SCENARIOS: {
        flood: {
          key: "flood", title: "Flood cleanup", place: "inside the house",
          intro: "The floodwater has gone down. Clean up safely. Wear boots and gloves, and never touch anything electrical that is wet.",
          items: [
            { id: "food", icon: "\uD83C\uDF5A", name: "Spoiled rice and food", desc: "Food touched by floodwater is not safe to eat.", action: "toss", bin: "bio", why: "Spoiled food is biodegradable waste." },
            { id: "meds", icon: "\uD83D\uDC8A", name: "Wet medicines", desc: "Medicines soaked in floodwater can be unsafe.", action: "toss", bin: "special", why: "Wet medicine is special waste. Never pour it down the drain." },
            { id: "can", icon: "\uD83E\uDD6B", name: "Muddy tin can", desc: "A rinsed metal can can be recycled.", action: "toss", bin: "recycle", why: "Rinse the can and put it in the recyclable bin." },
            { id: "plates", icon: "\uD83C\uDF7D", name: "Muddy plates and spoons", desc: "Sturdy dishes can be washed and disinfected.", action: "keep", why: "Wash and disinfect sturdy dishes, then keep them." },
            { id: "photos", icon: "\uD83D\uDDBC", name: "Wet family photos", desc: "Important papers and photos can be dried and saved.", action: "keep", why: "Dry photos and papers carefully to save them." },
            { id: "outlet", icon: "\uD83D\uDD0C", name: "Wet electrical outlet", desc: "Water and electricity together are deadly.", action: "hazard", why: "Keep away. Have an adult switch off the main power first." },
            { id: "water", icon: "\uD83E\uDDA0", name: "Dirty floodwater puddle", desc: "Floodwater carries germs that cause leptospirosis.", action: "hazard", why: "Do not wade in it. Let an adult handle it with boots and gloves." }
          ]
        },
        typhoon: {
          key: "typhoon", title: "Typhoon cleanup", place: "outside the house",
          intro: "The typhoon has passed. Clear the yard safely. Watch for sharp debris and never go near fallen wires.",
          items: [
            { id: "branches", icon: "\uD83E\uDEB5", name: "Fallen branches and leaves", desc: "Plant debris breaks down naturally.", action: "toss", bin: "bio", why: "Branches and leaves are biodegradable." },
            { id: "wrapper", icon: "\uD83E\uDD64", name: "Blown-in plastic cup", desc: "Rinsed plastic can be recycled.", action: "toss", bin: "recycle", why: "Rinse plastic and put it in the recyclable bin." },
            { id: "battery", icon: "\uD83D\uDD0B", name: "Old battery", desc: "Batteries leak harmful chemicals.", action: "toss", bin: "special", why: "Batteries are special waste, never regular trash." },
            { id: "plant", icon: "\uD83E\uDEB4", name: "Tipped potted plant", desc: "The pot is fine, just knocked over.", action: "keep", why: "Stand the pot back up and keep the plant." },
            { id: "wire", icon: "\u26A1", name: "Fallen power line", desc: "A downed line can still be live.", action: "hazard", why: "Never go near it. Tell an adult and report it to the power company." },
            { id: "roof", icon: "\uD83E\uDE9A", name: "Sharp roofing sheet", desc: "The metal edge is sharp and heavy.", action: "hazard", why: "Do not drag it yourself. Ask an adult to move it." },
            { id: "glass", icon: "\uD83E\uDD5B", name: "Broken glass", desc: "Broken glass can cut deeply.", action: "hazard", why: "Do not touch it. Ask an adult to clear it safely." }
          ]
        }
      },
      check: function (item, action, bin) {
        if (action !== item.action) return { ok: false, needBin: false };
        if (action === "toss") { if (!bin) return { ok: false, needBin: true, correctBin: item.bin }; return { ok: bin === item.bin, needBin: false, correctBin: item.bin }; }
        return { ok: true, needBin: false };
      },
      explain: function (item) {
        if (item.action === "keep") return item.name + " can be cleaned and kept. " + item.why;
        if (item.action === "hazard") return item.name + " is dangerous. Do not touch it, and tell an adult. " + item.why;
        return item.name + " should be thrown away. " + item.why;
      },
      rateStars: function (mistakes) { return mistakes <= 1 ? 3 : (mistakes <= 3 ? 2 : 1); }
    },
    sapa: {
      // channel-routing puzzles inspired by the Ang Sapa series (Dr. Mahar Lagmay, Project NOAH)
      // chars: S source (creek head), E sea, H house, X rock, G silt (clear first), . ground, C channel
      LEVELS: [
        {
          name: "Clear the creek",
          blurb: "Clear the silt and route the creek past the rock to the sea.",
          rows: ["..S...", "......", "..G...", ".HXH..", "..G...", "......", "..E..."]
        },
        {
          name: "Around the barangay",
          blurb: "A whole barangay sits in the way. Guide the water safely around it.",
          rows: ["S.....", "......", ".HHHH.", "....G.", ".HHHH.", "......", ".....E"]
        },
        {
          name: "The blocked culvert",
          blurb: "The waterway is plugged with silt. Clear it so the creek can flow.",
          rows: ["..S...", "..G...", "XX.XX.", "..G...", "XXGXX.", "..G...", ".H.H..", "..E..."]
        }
      ],
      parse: function (rows) {
        var h = rows.length, w = rows[0].length, cells = [], src = null, sea = null;
        for (var r = 0; r < h; r++) for (var c = 0; c < w; c++) {
          var ch = rows[r].charAt(c); cells.push(ch);
          if (ch === "S") src = { r: r, c: c };
          if (ch === "E") sea = { r: r, c: c };
        }
        return { w: w, h: h, cells: cells, source: src, sea: sea };
      },
      at: function (g, r, c) { if (r < 0 || c < 0 || r >= g.h || c >= g.w) return null; return g.cells[r * g.w + c]; },
      set: function (g, r, c, ch) { g.cells[r * g.w + c] = ch; },
      // tap a cell: clear silt, place a channel, or remove a channel. returns the action or null.
      tap: function (g, r, c) {
        var ch = this.at(g, r, c);
        if (ch === "G") { this.set(g, r, c, "."); return "clear"; }
        if (ch === ".") { this.set(g, r, c, "C"); return "build"; }
        if (ch === "C") { this.set(g, r, c, "."); return "remove"; }
        return null;
      },
      _key: function (r, c) { return r + "," + c; },
      _D: [[1, 0], [-1, 0], [0, 1], [0, -1]],
      // cells the water reaches from the source, flowing only through channels
      waterReach: function (g) {
        var seen = {}, q = [{ r: g.source.r, c: g.source.c }], out = [];
        seen[this._key(g.source.r, g.source.c)] = true;
        while (q.length) {
          var cur = q.shift(); out.push(cur);
          for (var i = 0; i < 4; i++) {
            var nr = cur.r + this._D[i][0], nc = cur.c + this._D[i][1], ch = this.at(g, nr, nc), k = this._key(nr, nc);
            if (ch === null || seen[k]) continue;
            if (ch === "C") { seen[k] = true; q.push({ r: nr, c: nc }); }
          }
        }
        return out;
      },
      // complete when the water reaches a cell next to the sea
      isComplete: function (g) {
        var water = this.waterReach(g);
        for (var i = 0; i < water.length; i++) for (var j = 0; j < 4; j++) {
          if (this.at(g, water[i].r + this._D[j][0], water[i].c + this._D[j][1]) === "E") return true;
        }
        return false;
      },
      // houses next to the water: flooding risk when the channel is not finished
      housesTouchingWater: function (g) {
        var water = this.waterReach(g), out = [], seen = {};
        for (var i = 0; i < water.length; i++) for (var j = 0; j < 4; j++) {
          var nr = water[i].r + this._D[j][0], nc = water[i].c + this._D[j][1], k = this._key(nr, nc);
          if (this.at(g, nr, nc) === "H" && !seen[k]) { seen[k] = true; out.push({ r: nr, c: nc }); }
        }
        return out;
      },
      countChannels: function (g) { var n = 0; for (var i = 0; i < g.cells.length; i++) if (g.cells[i] === "C") n++; return n; },
      // fewest channel pieces needed from source to sea, over ground and silt
      shortestPieces: function (rows) {
        var g = this.parse(rows), self = this;
        function pass(ch) { return ch === "." || ch === "G" || ch === "S" || ch === "E"; }
        var q = [{ r: g.source.r, c: g.source.c, n: 0 }], seen = {};
        seen[this._key(g.source.r, g.source.c)] = true;
        while (q.length) {
          var cur = q.shift();
          if (cur.r === g.sea.r && cur.c === g.sea.c) return Math.max(0, cur.n - 1);
          for (var i = 0; i < 4; i++) {
            var nr = cur.r + this._D[i][0], nc = cur.c + this._D[i][1], ch = this.at(g, nr, nc), k = this._key(nr, nc);
            if (ch === null || seen[k] || !pass(ch)) continue;
            seen[k] = true; q.push({ r: nr, c: nc, n: cur.n + 1 });
          }
        }
        return Infinity;
      },
      rateStars: function (used, optimal, heartsLost) {
        if (heartsLost === 0 && used <= optimal + 1) return 3;
        if (heartsLost <= 1 && used <= optimal + 4) return 2;
        return 1;
      }
    },
    hazard: {
      // spot-the-hazard game (Prevention and Mitigation). Find what turns dangerous in a quake or typhoon.
      SCENES: [
        {
          key: "home", name: "At home", place: "living room",
          blurb: "Find the things at home that become dangerous in an earthquake or a typhoon.",
          items: [
            { id: "cabinet", kind: "cabinet", name: "Tall cabinet", x: -2.4, z: -2.8, hazard: true, event: "earthquake", why: "A tall cabinet that is not fixed to the wall can topple over during shaking.", fix: "Anchor it to the wall with brackets or straps." },
            { id: "shelf", kind: "shelf", name: "Heavy things up high", x: -0.7, z: -2.85, hazard: true, event: "earthquake", why: "Heavy items on high shelves can fall on people when the ground shakes.", fix: "Keep heavy things on low shelves." },
            { id: "tv", kind: "tv", name: "TV on a stand", x: 0.9, z: -2.8, hazard: true, event: "earthquake", why: "An unsecured TV can slide off and fall.", fix: "Strap the TV to the stand or the wall." },
            { id: "outlet", kind: "outlet", name: "Overloaded outlet", x: -3.08, z: -0.6, ry: 1.5708, hazard: true, event: "fire", why: "Too many plugs in one outlet can overheat and start a fire.", fix: "Unplug extra devices and avoid octopus wiring." },
            { id: "window", kind: "window", name: "Window with no shutter", x: 2.3, z: -3.02, hazard: true, event: "typhoon", why: "In a typhoon, strong wind can shatter an unprotected window.", fix: "Add storm shutters or board it up, and stay away during the storm." },
            { id: "clutter", kind: "clutter", name: "Boxes blocking the door", x: -1.3, z: 2.5, hazard: true, event: "both", why: "Clutter in the doorway blocks your way out in an emergency.", fix: "Keep exits clear so everyone can leave quickly." },
            { id: "gobag", kind: "gobag", name: "Ready go bag", x: -2.4, z: 2.3, hazard: false, why: "A packed go bag by the door is smart preparation. Well spotted." },
            { id: "extinguisher", kind: "extinguisher", name: "Fire extinguisher", x: -2.9, z: 0.9, hazard: false, why: "A fire extinguisher within reach is a good thing to have." },
            { id: "table", kind: "table", name: "Sturdy low table", x: 0.4, z: 0.6, hazard: false, why: "A strong low table is safe. You can duck under it during shaking." },
            { id: "plant", kind: "plant", name: "Potted plant on the floor", x: 2.5, z: 1.6, hazard: false, why: "On the floor, a small plant is not a hazard." }
          ]
        },
        {
          key: "school", name: "At school", place: "classroom",
          blurb: "Find the classroom things that become dangerous in an earthquake or a typhoon.",
          items: [
            { id: "bookshelf", kind: "cabinet", name: "Tall bookshelf", x: -2.4, z: -2.8, hazard: true, event: "earthquake", why: "A tall bookshelf that is not fixed can fall over during shaking.", fix: "Bolt it to the wall." },
            { id: "tvcart", kind: "tv", name: "TV on a rolling cart", x: 0.9, z: -2.8, hazard: true, event: "earthquake", why: "A TV on wheels can roll and topple over.", fix: "Lock the wheels and strap the TV down." },
            { id: "pots", kind: "pots", name: "Pots on the window ledge", x: 2.3, z: -3.0, hazard: true, event: "both", why: "Pots on a high ledge can fall in strong wind or shaking.", fix: "Move them down to the floor." },
            { id: "fan", kind: "fan", name: "Loose ceiling fan", x: -0.7, z: -1.3, y: 1.4, hazard: true, event: "earthquake", why: "A poorly fixed fan or light can drop during shaking.", fix: "Have fixtures checked and properly secured." },
            { id: "chairs", kind: "clutter", name: "Chairs blocking the exit", x: -1.3, z: 2.5, hazard: true, event: "both", why: "Stacked chairs in the doorway block the escape route.", fix: "Keep the exit clear at all times." },
            { id: "cwindow", kind: "window", name: "Window with no film", x: -3.06, z: -0.4, ry: 1.5708, hazard: true, event: "typhoon", why: "Plain glass can shatter into sharp pieces in a storm.", fix: "Add safety film or shutters." },
            { id: "desk", kind: "desk", name: "Sturdy desk", x: 0.5, z: 0.7, hazard: false, why: "A strong desk is safe. Duck under it during an earthquake." },
            { id: "firstaid", kind: "firstaid", name: "First aid kit", x: 2.5, z: 0.9, hazard: false, why: "A stocked first aid kit is good to have ready." },
            { id: "evacmap", kind: "board", name: "Evacuation map", x: -3.06, z: 1.6, ry: 1.5708, hazard: false, why: "Knowing the evacuation route is good preparation." },
            { id: "cext", kind: "extinguisher", name: "Fire extinguisher", x: 2.4, z: 1.9, hazard: false, why: "A fire extinguisher within reach is a good thing." }
          ]
        },
        {
          key: "street", name: "On the street", place: "street", outdoor: true,
          blurb: "See how the same street changes when the hazard changes. The same thing can be a helpful asset one day and a risk the next.",
          scenarios: [{ key: "typhoon", name: "Typhoon" }, { key: "flood", name: "Flood" }],
          items: [
            { id: "tree", kind: "tree", name: "Big old tree", x: -2.4, z: -2.2, asset: "On a calm day this tree gives welcome shade and cools the street.", risk: { typhoon: { why: "In a strong typhoon its big branches, or the whole trunk, can snap and fall on the road, homes, or power lines.", fix: "Trim weak branches before storm season, and never shelter under it during a typhoon." } } },
            { id: "billboard", kind: "billboard", name: "Large billboard", x: 2.6, z: -2.5, asset: "Most days it is just an advertising sign.", risk: { typhoon: { why: "Its wide surface catches strong wind, and the whole frame can be blown down onto the street.", fix: "Report old or weak billboards so the local government can secure or remove them." } } },
            { id: "post", kind: "post", name: "Electric post and lines", x: 0.2, z: -2.2, asset: "It carries the electricity the neighborhood needs every day.", risk: { typhoon: { why: "Strong wind can snap the lines or topple the post, cutting power and dropping live wires.", fix: "Stay well away from posts and hanging wires during a storm." }, flood: { why: "If a line falls into floodwater, the water can carry a deadly electric shock.", fix: "Never wade through floodwater near fallen wires. Report them and switch off power if it is safe." } } },
            { id: "lowroad", kind: "lowroad", name: "Low creek crossing", x: 2.9, z: 0, asset: "On a dry day it is just a low part of the road beside the creek.", risk: { flood: { why: "It floods first when the creek rises, and fast water here can sweep away people and vehicles.", fix: "Do not cross when it is flooded. Turn around and reach higher ground." } } },
            { id: "car", kind: "car", name: "Parked car", x: 1.0, z: 1.9, asset: "Parked on a normal day it is no problem at all.", risk: { flood: { why: "Floodwater can lift and carry a car, and it can block the road and the drainage.", fix: "Move vehicles to higher ground before floods, and never drive into rising water." } } },
            { id: "garbage", kind: "garbage", name: "Garbage by the canal", x: -1.8, z: 2.0, asset: "This is uncollected garbage piled beside the canal.", risk: { flood: { why: "Piled garbage clogs the canal so water cannot drain, and the flood rises faster and higher.", fix: "Keep canals clear and never throw garbage into waterways." } } },
            { id: "evaccenter", kind: "evaccenter", name: "Covered evacuation center", x: -3.1, z: -2.9, asset: "This strong covered court is a safe place to gather and evacuate to in any hazard.", risk: {} },
            { id: "building", kind: "building", name: "Sturdy concrete house", x: 3.3, z: -2.9, asset: "A well-built house on higher ground is a safe shelter.", risk: {} }
          ]
        }
      ],
      hazardCount: function (scene) { var n = 0; for (var i = 0; i < scene.items.length; i++) if (scene.items[i].hazard) n++; return n; },
      riskCount: function (scene, scKey) { var n = 0; for (var i = 0; i < scene.items.length; i++) { var it = scene.items[i]; if (it.risk && it.risk[scKey]) n++; } return n; },
      isRiskIn: function (item, scKey) { return !!(item.risk && item.risk[scKey]); },
      item: function (scene, id) { for (var i = 0; i < scene.items.length; i++) if (scene.items[i].id === id) return scene.items[i]; return null; },
      isHazard: function (scene, id) { var it = this.item(scene, id); return !!(it && it.hazard); },
      eventWord: function (ev) { return ev === "typhoon" ? "a typhoon" : ev === "fire" ? "a fire" : ev === "both" ? "an earthquake or a typhoon" : "an earthquake"; },
      rateStars: function (wrongTaps) { return wrongTaps === 0 ? 3 : (wrongTaps <= 3 ? 2 : 1); }
    },
    cares: {
      // Community And Resilience: build a community on a topographic map with a stream,
      // reach a population goal, then simulate a hazard. Water settles by gravity, so low ground floods first.
      GOAL: 60, PER: 10, W: 7, H: 7,
      ELEV: [
        5, 5, 5, 5, 5, 5, 5,
        4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 3, 4, 4, 4,
        3, 3, 3, 3, 3, 3, 3,
        2, 2, 2, 2, 2, 2, 2,
        1, 1, 1, 1, 1, 1, 1,
        2, 2, 2, 2, 2, 2, 2
      ],
      STREAM: [35, 36, 37, 38, 39, 40, 41],
      MAPS: [
        { name: "River in the lowlands", blurb: "A river runs along the low ground. Build up on the high ground and keep back from the water.", stream: [35, 36, 37, 38, 39, 40, 41] },
        { name: "River on one side", blurb: "The river runs down the west side. The safe high ground is across to the east.", stream: [0, 7, 14, 21, 28, 35, 42] },
        { name: "Valley in the middle", blurb: "A stream cuts a valley down the middle. High ground rises on both sides.", stream: [3, 10, 17, 24, 31, 38, 45] },
        { name: "The river bend", blurb: "The river bends around a corner. The safe high ground is the far side, away from the bend.", stream: [0, 7, 14, 21, 28, 29, 30, 31] }
      ],
      mapIndex: 0,
      SCEN: { flood: { name: "Flood", base: 2.5 }, storm: { name: "Storm", base: 3.5 } },
      RED: { R: 0.6, M: 0.5, T: 0.3, C: 0.3, P: 0.5 },
      CAP: 2.0,
      // build tools: gray = dike, canal, pump; green = mangrove, pond, trees
      TOOLS: [
        { key: "H", name: "House", group: "home", desc: "Adds ten residents. Build these on high ground away from the stream." },
        { key: "D", name: "Dike", group: "gray", desc: "Gray infrastructure. A floodwall that keeps its cell and the cells beside it dry." },
        { key: "C", name: "Canal", group: "gray", desc: "Gray infrastructure. Drainage that carries water away and lowers the flood." },
        { key: "P", name: "Pump", group: "gray", desc: "Gray infrastructure. A pumping station that pushes floodwater out." },
        { key: "M", name: "Mangrove", group: "green", desc: "Green infrastructure. Plants beside the stream that slow and soak up water. Works next to the stream." },
        { key: "R", name: "Retention pond", group: "green", desc: "Green infrastructure. A pond that stores rainwater so it does not rush downstream." },
        { key: "T", name: "Trees", group: "green", desc: "Green infrastructure. Trees on the slopes that soak up rain and slow runoff. Plant them on higher ground." }
      ],
      idx: function (r, c) { return r * this.W + c; },
      rc: function (i) { return { r: Math.floor(i / this.W), c: i % this.W }; },
      isStream: function (i) { return this.STREAM.indexOf(i) !== -1; },
      neighbors4: function (i) {
        var p = this.rc(i), out = [];
        if (p.r > 0) out.push(i - this.W); if (p.r < this.H - 1) out.push(i + this.W);
        if (p.c > 0) out.push(i - 1); if (p.c < this.W - 1) out.push(i + 1);
        return out;
      },
      adjStream: function (i) { var n = this.neighbors4(i); for (var k = 0; k < n.length; k++) if (this.isStream(n[k])) return true; return false; },
      empty: function () { var a = []; for (var i = 0; i < this.W * this.H; i++) a.push(""); return a; },
      useMap: function (i) {
        var m = this.MAPS[i] || this.MAPS[0]; this.mapIndex = this.MAPS[i] ? i : 0;
        this.mapName = m.name; this.mapBlurb = m.blurb; this.STREAM = m.stream.slice();
        var N = this.W * this.H, dist = new Array(N), q = [], k;
        for (k = 0; k < N; k++) dist[k] = 999;
        for (k = 0; k < this.STREAM.length; k++) { dist[this.STREAM[k]] = 0; q.push(this.STREAM[k]); }
        while (q.length) { var cur = q.shift(), nb = this.neighbors4(cur); for (var j = 0; j < nb.length; j++) if (dist[nb[j]] > dist[cur] + 1) { dist[nb[j]] = dist[cur] + 1; q.push(nb[j]); } }
        var elev = new Array(N); for (k = 0; k < N; k++) elev[k] = Math.max(1, Math.min(5, 1 + dist[k]));
        this.ELEV = elev; return this;
      },
      highGroundCell: function () { var hi = 0; for (var h = 1; h < this.W * this.H; h++) if (this.ELEV[h] > this.ELEV[hi]) hi = h; return hi; },
      canBuild: function (i) { return !this.isStream(i); },
      population: function (tiles) { var n = 0; for (var i = 0; i < tiles.length; i++) if (tiles[i] === "H") n += this.PER; return n; },
      reduction: function (tiles) {
        var sum = 0;
        for (var i = 0; i < tiles.length; i++) {
          var t = tiles[i];
          if (t === "R") sum += this.RED.R;
          else if (t === "C") sum += this.RED.C;
          else if (t === "P") sum += this.RED.P;
          else if (t === "M" && this.adjStream(i)) sum += this.RED.M;
          else if (t === "T" && this.ELEV[i] >= 3) sum += this.RED.T;
        }
        return Math.min(this.CAP, sum);
      },
      floodLevel: function (tiles, scKey) { return Math.max(0, (this.SCEN[scKey].base) - this.reduction(tiles)); },
      protected: function (tiles, i) {
        if (tiles[i] === "D") return true;
        var n = this.neighbors4(i);
        for (var k = 0; k < n.length; k++) if (tiles[n[k]] === "D") return true;
        return false;
      },
      isFloodedCell: function (tiles, i, level) { return this.ELEV[i] < level; },
      simulate: function (tiles, scKey) {
        var level = this.floodLevel(tiles, scKey), flooded = [], total = 0, safe = 0, houseFlooded = [];
        for (var i = 0; i < tiles.length; i++) {
          if (this.isFloodedCell(tiles, i, level)) flooded.push(i);
          if (tiles[i] === "H") {
            total += this.PER;
            var wet = this.ELEV[i] < level && !this.protected(tiles, i);
            if (wet) houseFlooded.push(i); else safe += this.PER;
          }
        }
        var pop = total, pct = total > 0 ? safe / total : 0, goalMet = pop >= this.GOAL;
        return { level: level, flooded: flooded, houseFlooded: houseFlooded, population: pop, safe: safe, pct: pct, goalMet: goalMet, reduction: this.reduction(tiles) };
      },
      rateStars: function (res) {
        if (!res.goalMet) return 1;
        if (res.pct >= 0.9) return 3;
        if (res.pct >= 0.7) return 2;
        return 1;
      },
      verdict: function (res) {
        if (!res.goalMet) return "Your community is too small. Add more houses to reach the goal, then keep them safe.";
        if (res.pct >= 0.9) return "A resilient community. Almost everyone stays safe because you built high, kept the stream clear, and used green and gray protection together.";
        if (res.pct >= 0.7) return "Fairly resilient, but some homes still flood. Move low houses to higher ground or add more protection.";
        return "Many homes flooded. Water settles in the lowest ground first, so build on higher ground and add green and gray infrastructure to hold the water back.";
      }
    },
    quake: {
      // Duck, Cover, and Hold: a watch-and-copy imitation drill.
      // The coach shows the moves, then the player repeats them in order.
      SEQUENCE: ["drop", "cover", "hold", "evacuate"],
      actionLabel: function (a) { return a === "drop" ? "Drop" : a === "cover" ? "Cover" : a === "hold" ? "Hold on" : a === "evacuate" ? "Walk out" : a; },
      actionTip: function (a) {
        return a === "drop" ? "Drop to your hands and knees so the shaking cannot knock you down."
          : a === "cover" ? "Get under the sturdy table and cover your head and neck."
          : a === "hold" ? "Hold on to the table leg until the shaking stops."
          : a === "evacuate" ? "Once the shaking stops, walk calmly to the exit."
          : "";
      },
      // length of the sequence to show and copy in a given round (1-indexed)
      roundLength: function (round) { return Math.max(1, Math.min(round, this.SEQUENCE.length)); },
      totalRounds: function () { return this.SEQUENCE.length; },
      rateImitation: function (mistakes) { return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1; },
      // legacy helpers kept for compatibility
      STEPS: ["drop", "cover", "hold"],
      isSafeCover: function (kind) { return kind === "table"; }
    },
    cpr: {
      // Hands-only CPR rhythm game: push hard and fast, about twice a second
      BPM: 110, GOAL: 30, GOOD_MS: 130, OK_MS: 240,
      interval: function () { return 60000 / this.BPM; },
      judge: function (deltaMs) { var a = Math.abs(deltaMs); return a <= this.GOOD_MS ? "good" : a <= this.OK_MS ? "ok" : "off"; },
      nearestDelta: function (nowMs, startMs) { var iv = this.interval(); var n = Math.round((nowMs - startMs) / iv); return nowMs - (startMs + n * iv); },
      hint: function (delta) { return delta < -this.GOOD_MS ? "A little early" : delta > this.GOOD_MS ? "A little late" : "Good rhythm"; },
      rateStars: function (good, ok, total) {
        var score = (good + ok * 0.5) / Math.max(1, total);
        if (score >= 0.8) return 3; if (score >= 0.55) return 2; return 1;
      }
    },
    bleed: {
      // Stop the Bleed: gloves, cover with a clean cloth, then press hard until controlled
      CONTROL_MS: 7000,
      STEPS: ["gloves", "cover", "press"],
      label: function (s) { return s === "gloves" ? "Put on gloves" : s === "cover" ? "Cover the wound" : s === "press" ? "Press hard" : s; },
      tip: function (s) {
        return s === "gloves" ? "Put on gloves first to keep yourself safe from blood."
          : s === "cover" ? "Cover the wound with a clean cloth or gauze."
          : s === "press" ? "Press down hard on the wound and keep pressing until the bleeding stops."
          : "Bleeding is controlled. Keep the person calm until help arrives.";
      },
      next: function (doneCount) { return this.STEPS[doneCount] || "done"; },
      rateStars: function (mistakes, controlled, slow) {
        if (!controlled) return 1;
        if (mistakes === 0 && !slow) return 3;
        if (mistakes <= 1) return 2;
        return 1;
      }
    }
  };

  /* =====================================================================
     2) APP  (screens, audio, wiring)
     ===================================================================== */
  var App = {
    settings: { sound: true, hints: true },
    activeGame: null,
    fireDifficulty: "easy",
    _spoke: {},
    $: function (id) { return document.getElementById(id); },
    show: function (id) {
      var s = document.querySelectorAll(".screen"), i;
      for (i = 0; i < s.length; i++) s[i].classList.remove("active");
      var el = this.$(id); if (el) el.classList.add("active");
      if (id === "screen-hub") { try { document.body.removeAttribute("data-pillar"); } catch (e) {} this.refreshSwitchChip(); this.personalizeGreeting(); this.updatePillarRings(); }
    },
    PILLAR_BADGES: { mit: ["sapa", "hazard"], prep: ["gobag"], resp: ["fire", "quake", "path"], rec: ["cleanup", "cares"] },
    updatePillarRings: function () {
      var C = 2 * Math.PI * 15, self = this;
      for (var k in this.PILLAR_BADGES) {
        var ids = this.PILLAR_BADGES[k], tot = ids.length, done = 0;
        for (var i = 0; i < ids.length; i++) if (self.badges && self.badges.has(ids[i])) done++;
        var ring = document.querySelector('.pring[data-pillar="' + k + '"]'); if (!ring) continue;
        var arc = ring.querySelector(".pring-arc"), lab = ring.querySelector(".pring-lab");
        var frac = tot ? done / tot : 0;
        if (arc) arc.style.strokeDashoffset = (C * (1 - frac)).toFixed(2);
        if (lab) lab.textContent = done + "/" + tot;
        ring.classList.toggle("done", tot > 0 && done === tot);
      }
    },
    openModal: function (id) { var m = this.$(id); if (m) m.classList.add("open"); },
    openCredit: function (key) {
      var c = this.CREDITS && this.CREDITS[key]; if (!c) return;
      var tt = this.$("credit-title"), ld = this.$("credit-lead"), nt = this.$("credit-note");
      if (tt) tt.textContent = c.name;
      if (ld) ld.textContent = "Developed by " + c.lead;
      if (nt) { if (c.note) { nt.textContent = c.note; nt.style.display = ""; } else { nt.style.display = "none"; } }
      this.openModal("modal-credit");
    },
    closeModal: function (id) { var m = this.$(id); if (m) m.classList.remove("open"); },
    syncSettings: function () {
      var ts = this.$("toggle-sound"); if (ts) this.settings.sound = !!ts.checked;
      var th = this.$("toggle-hints"); if (th) this.settings.hints = !!th.checked;
    },
    speak: function (t, once) {
      if (!this.settings.sound) return;
      if (once) { if (this._spoke[t]) return; this._spoke[t] = true; }
      try {
        if (window.speechSynthesis) {
          var u = new window.SpeechSynthesisUtterance(t); u.rate = 1.0; u.pitch = 1.05;
          window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
        }
      } catch (e) {}
    },
    resetSpoken: function () { this._spoke = {}; },

    // --- Champion ID badges (progress only; no personal data) ---
    badges: {
      base: "bayanihanda_badges_v1", earned: {},
      key: function () { try { var a = App.players && App.players.activeId ? App.players.activeId() : null; return a ? this.base + "::" + a : this.base; } catch (e) { return this.base; } },
      load: function () { try { var s = window.localStorage.getItem(this.key()); this.earned = s ? JSON.parse(s) : {}; } catch (e) { this.earned = {}; } },
      save: function () { try { window.localStorage.setItem(this.key(), JSON.stringify(this.earned)); } catch (e) {} },
      earn: function (id) { if (this.earned[id]) return false; this.earned[id] = true; this.save(); return true; },
      has: function (id) { return !!this.earned[id]; },
      count: function () { var n = 0, k; for (k in this.earned) if (this.earned[k]) n++; return n; },
      reset: function () { this.earned = {}; this.save(); }
    },
    rank: function (c) { return c >= 6 ? "Master DRRM Champion" : c >= 4 ? "DRRM Champion" : c >= 2 ? "Junior Champion" : c >= 1 ? "Rising Champion" : "Getting Ready"; },
    MAX_PLAYERS: 10,
    AVATARS: [
      { id: "turtle", e: "🐢", bg: "#cdebe0" },
      { id: "eagle", e: "🦅", bg: "#ffe1c4" },
      { id: "dragon", e: "🐉", bg: "#d9ccf6" },
      { id: "butterfly", e: "🦋", bg: "#ffd9df" },
      { id: "whale", e: "🐋", bg: "#d6ecff" },
      { id: "frog", e: "🐸", bg: "#e4f0c4" },
      { id: "cat", e: "🐱", bg: "#ffe9b8" },
      { id: "fox", e: "🦊", bg: "#ffd9c4" }
    ],
    avatarById: function (aid) { for (var i = 0; i < this.AVATARS.length; i++) if (this.AVATARS[i].id === aid) return this.AVATARS[i]; return this.AVATARS[0]; },
    players: {
      KEY: "bayanihanda_players_v1",
      state: { active: null, list: [] },
      _mkid: function () { return "p" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); },
      load: function () {
        try { var s = window.localStorage.getItem(this.KEY); if (s) this.state = JSON.parse(s); } catch (e) {}
        if (!this.state || !this.state.list) this.state = { active: null, list: [] };
        if (this.state.list.length === 0) {
          var legacy = null; try { legacy = window.localStorage.getItem("bayanihanda_badges_v1"); } catch (e) {}
          if (legacy) {
            var id = this._mkid();
            this.state.list.push({ id: id, nick: "Player 1", avatar: "turtle" });
            this.state.active = id;
            try { window.localStorage.setItem("bayanihanda_badges_v1::" + id, legacy); } catch (e) {}
            this.save();
          }
        }
        if (this.state.active && !this.get(this.state.active)) this.state.active = this.state.list.length ? this.state.list[0].id : null;
        return this;
      },
      save: function () { try { window.localStorage.setItem(this.KEY, JSON.stringify(this.state)); } catch (e) {} },
      all: function () { return this.state.list.slice(); },
      count: function () { return this.state.list.length; },
      atLimit: function () { return this.state.list.length >= App.MAX_PLAYERS; },
      get: function (id) { for (var i = 0; i < this.state.list.length; i++) if (this.state.list[i].id === id) return this.state.list[i]; return null; },
      activeId: function () { return this.state.active; },
      active: function () { return this.get(this.state.active); },
      setActive: function (id) { if (this.get(id)) { this.state.active = id; this.save(); } },
      add: function (nick, avatar) {
        if (this.atLimit()) return null;
        nick = (nick || "").replace(/[<>]/g, "").trim().slice(0, 14) || ("Player " + (this.state.list.length + 1));
        var id = this._mkid(); this.state.list.push({ id: id, nick: nick, avatar: avatar || "turtle" }); this.state.active = id; this.save(); return id;
      },
      update: function (id, nick, avatar) {
        var p = this.get(id); if (!p) return;
        nick = (nick || "").replace(/[<>]/g, "").trim().slice(0, 14);
        if (nick) p.nick = nick; if (avatar) p.avatar = avatar; this.save();
      },
      remove: function (id) {
        this.state.list = this.state.list.filter(function (p) { return p.id !== id; });
        try { window.localStorage.removeItem("bayanihanda_badges_v1::" + id); } catch (e) {}
        if (this.state.active === id) this.state.active = this.state.list.length ? this.state.list[0].id : null;
        this.save();
      }
    },
    _badgeCountFor: function (id) {
      try { var s = window.localStorage.getItem("bayanihanda_badges_v1::" + id); var o = s ? JSON.parse(s) : {}; var n = 0, k; for (k in o) if (o[k]) n++; return n; } catch (e) { return 0; }
    },
    startFromPlayers: function () {
      var n = this.players.count();
      if (n === 1) { this.badges.load(); this.show("screen-hub"); }
      else { this.renderPlayers(); this.show("screen-players"); }
    },
    renderPlayers: function () {
      var grid = this.$("players-grid"); if (!grid) return; var self = this;
      grid.innerHTML = ""; var list = this.players.all();
      for (var i = 0; i < list.length; i++) {
        (function (p) {
          var av = self.avatarById(p.avatar), n = self._badgeCountFor(p.id);
          var card = document.createElement("button"); card.className = "pcard" + (self._editPlayers ? " editing" : "");
          card.innerHTML = '<span class="av" style="background:' + av.bg + '">' + av.e + '</span>' +
            '<span class="pn"></span><span class="pmeta">' + n + ' badge' + (n === 1 ? "" : "s") + '</span>' +
            '<span class="pedit" aria-hidden="true">&#9998;</span>';
          card.querySelector(".pn").textContent = p.nick;
          card.addEventListener("click", function () {
            if (self._editPlayers) { self.openEditPlayer(p.id); return; }
            self.selectPlayer(p.id);
          });
          grid.appendChild(card);
        })(list[i]);
      }
      var add = document.createElement("button"); add.className = "pcard add"; var limit = this.players.atLimit();
      add.innerHTML = '<span class="av">+</span><span class="pn">Add player</span><span class="pmeta">' + (limit ? "Limit reached" : "New hero") + '</span>';
      if (limit) add.setAttribute("disabled", "disabled");
      add.addEventListener("click", function () { if (self.players.atLimit()) return; self.openAddPlayer(); });
      grid.appendChild(add);
      var note = this.$("players-note");
      if (note) note.textContent = this._editPlayers ? "Tap a player to rename, change the avatar, or remove them." : ("You can have up to " + this.MAX_PLAYERS + " players on this device for now.");
    },
    toggleEditPlayers: function () { this._editPlayers = !this._editPlayers; var b = this.$("btn-players-edit"); if (b) b.textContent = this._editPlayers ? "Done" : "Edit players"; this.renderPlayers(); },
    renderAddAvatars: function (selId) {
      var row = this.$("addplayer-avatars"); if (!row) return; var self = this; row.innerHTML = "";
      var sel = selId || this.AVATARS[0].id; this._newAvatar = sel;
      for (var i = 0; i < this.AVATARS.length; i++) {
        (function (a) {
          var el = document.createElement("button"); el.className = "avpick" + (a.id === sel ? " sel" : ""); el.style.background = a.bg; el.textContent = a.e;
          el.addEventListener("click", function () { self._newAvatar = a.id; var all = row.querySelectorAll(".avpick"); for (var j = 0; j < all.length; j++) all[j].classList.remove("sel"); el.classList.add("sel"); });
          row.appendChild(el);
        })(this.AVATARS[i]);
      }
    },
    openAddPlayer: function () {
      this._addMode = "add"; this._editingId = null;
      var t = this.$("addplayer-title"); if (t) t.textContent = "New player";
      var s = this.$("btn-addplayer-save"); if (s) s.textContent = "Let's play";
      var rm = this.$("btn-addplayer-remove"); if (rm) rm.style.display = "none";
      this.renderAddAvatars(); var nick = this.$("addplayer-nick"); if (nick) nick.value = "";
      this.show("screen-player-add");
    },
    openEditPlayer: function (id) {
      var p = this.players.get(id); if (!p) return;
      this._addMode = "edit"; this._editingId = id;
      var t = this.$("addplayer-title"); if (t) t.textContent = "Edit player";
      var s = this.$("btn-addplayer-save"); if (s) s.textContent = "Save";
      var rm = this.$("btn-addplayer-remove"); if (rm) rm.style.display = "";
      this.renderAddAvatars(p.avatar); var nick = this.$("addplayer-nick"); if (nick) nick.value = p.nick;
      this.show("screen-player-add");
    },
    confirmAddPlayer: function () {
      var nick = this.$("addplayer-nick"); var v = nick ? nick.value : "";
      if (this._addMode === "edit" && this._editingId) {
        this.players.update(this._editingId, v, this._newAvatar || "turtle"); this.openPlayers();
      } else {
        this.players.add(v, this._newAvatar || "turtle"); this.badges.load(); this.goHome();
      }
    },
    removeCurrentPlayer: function () {
      var id = this._editingId; if (!id) return; var p = this.players.get(id);
      if (!window.confirm("Remove " + (p ? p.nick : "this player") + "? Their badges on this device will be erased.")) return;
      this.players.remove(id); this.openPlayers();
    },
    selectPlayer: function (id) { this.players.setActive(id); this.badges.load(); this.goHome(); },
    goHome: function () { this._editPlayers = false; this.show("screen-hub"); },
    openPlayers: function () { this._editPlayers = false; var b = this.$("btn-players-edit"); if (b) b.textContent = "Edit players"; this.renderPlayers(); this.show("screen-players"); },
    refreshSwitchChip: function () {
      var p = this.players.active(); var av = this.$("switch-av"), nk = this.$("switch-nick");
      if (p) { var a = this.avatarById(p.avatar); if (av) { av.textContent = a.e; av.style.background = a.bg; } if (nk) nk.textContent = p.nick; }
      else { if (av) { av.textContent = "🐢"; } if (nk) nk.textContent = "Player"; }
    },
    personalizeGreeting: function () {
      var g = document.querySelector(".greet .ghi"); if (!g) return; var p = this.players.active();
      g.textContent = p ? ("Hi, " + p.nick + "!") : "Hi, young bayani!";
    },
    renderScorecard: function () {
      var grid = this.$("champ-bgrid");
      if (grid) {
        grid.innerHTML = "";
        for (var i = 0; i < BADGE_DEFS.length; i++) {
          var b = BADGE_DEFS[i], got = this.badges.has(b.id);
          var el = document.createElement("div");
          el.className = "badge" + (got ? " earned" : "");
          var state = got ? "EARNED" : (b.earnable ? "Play to earn" : "Coming soon");
          el.innerHTML = '<div class="bic">' + b.icon + '</div><div class="bnm">' + b.name + '</div><div class="bstate">' + state + '</div>';
          grid.appendChild(el);
        }
      }
      var rk = this.$("champ-rank"); if (rk) rk.textContent = this.rank(this.badges.count());
    },
    _setDiff: function () {
      var e = this.$("diff-easy"), h = this.$("diff-hard"), d = this.$("diff-desc");
      if (e) e.classList.toggle("active", this.fireDifficulty === "easy");
      if (h) h.classList.toggle("active", this.fireDifficulty === "hard");
      if (d) d.textContent = this.fireDifficulty === "hard"
        ? "Difficult: watch your extinguisher and beat the clock."
        : "Easy: take your time, and you will never run out of spray.";
    },

    // shared white-noise whoosh for spraying
    _actx: null, _noise: null,
    noise: function (on) {
      if (!this.settings.sound) { this._stopNoise(); return; }
      try {
        if (!this._actx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this._actx = new AC(); }
        if (on && !this._noise) {
          var ctx = this._actx, buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate), dta = buf.getChannelData(0);
          for (var i = 0; i < dta.length; i++) dta[i] = (Math.random() * 2 - 1) * 0.5;
          var src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
          var flt = ctx.createBiquadFilter(); flt.type = "highpass"; flt.frequency.value = 900;
          var g = ctx.createGain(); g.gain.value = 0.12;
          src.connect(flt); flt.connect(g); g.connect(ctx.destination); src.start();
          this._noise = src;
        } else if (!on) this._stopNoise();
      } catch (e) {}
    },
    _stopNoise: function () { try { if (this._noise) { this._noise.stop(); this._noise.disconnect(); } } catch (e) {} this._noise = null; },

    startFire: function () { this.activeGame = "fire"; this.resetSpoken(); this.syncSettings(); this.show("screen-fire"); try { FireGame.start(this); } catch (e) { this._fail("hint-fire"); } },
    startGoBag: function () { this.activeGame = "gobag"; this.resetSpoken(); this.syncSettings(); this.show("screen-gobag"); try { GoBag.start(this); } catch (e) { this._fail("hint-gobag"); } },
    startSafePath: function () { this.activeGame = "safepath"; this.resetSpoken(); this.syncSettings(); this.show("screen-safepath"); try { SafePath.start(this); } catch (e) { var t = this.$("sp-toast"); if (t) { t.textContent = "3D view is not available on this device."; t.className = "sp-toast show bad"; } } },
    startTrace: function () { this.activeGame = "trace"; this.resetSpoken(); this.syncSettings(); this.show("screen-trace"); try { TraceGame.start(this); } catch (e) { var t = this.$("tr-toast"); if (t) { t.textContent = "3D view is not available on this device."; t.className = "sp-toast show bad"; } } },
    startHigh: function () { this.activeGame = "high"; this.resetSpoken(); this.syncSettings(); this.show("screen-high"); try { HighGround.start(this); } catch (e) { var t = this.$("hg-toast"); if (t) { t.textContent = "3D view is not available on this device."; t.className = "sp-toast show bad"; } } },
    startCleanup: function () { this.activeGame = "cleanup"; this.resetSpoken(); this.syncSettings(); this.show("screen-cleanup"); try { Cleanup.start(this); } catch (e) { var t = this.$("clean-toast"); if (t) { t.textContent = "3D view is not available on this device."; t.className = "sp-toast show bad"; } } },
    startSapa: function () { this.activeGame = "sapa"; this.resetSpoken(); this.syncSettings(); this.show("screen-sapa"); try { Sapa.start(this); } catch (e) { var t = this.$("sapa-toast"); if (t) { t.textContent = "3D view is not available on this device."; t.className = "sp-toast show bad"; } } },
    startHazard: function () { this.activeGame = "hazard"; this.resetSpoken(); this.syncSettings(); this.show("screen-hazard"); try { HazardHunt.start(this); } catch (e) { var t = this.$("hazard-toast"); if (t) { t.textContent = "3D view is not available on this device."; t.className = "sp-toast show bad"; } } },
    startCares: function () { this.activeGame = "cares"; this.resetSpoken(); this.syncSettings(); this.show("screen-cares"); try { CARES.start(this); } catch (e) { var t = this.$("cares-toast"); if (t) { t.textContent = "3D view is not available on this device."; t.className = "sp-toast show bad"; } } },
    startQuake: function () { this.activeGame = "quake"; this.resetSpoken(); this.syncSettings(); this.show("screen-quake"); try { QuakeGame.start(this); } catch (e) { var t = this.$("quake-toast"); if (t) { t.textContent = "3D view is not available on this device."; t.className = "sp-toast show bad"; } } },
    startCPR: function () { this.activeGame = "cpr"; this.resetSpoken(); this.syncSettings(); this.show("screen-cpr"); try { CPRGame.start(this); } catch (e) {} },
    startBleed: function () { this.activeGame = "bleed"; this.resetSpoken(); this.syncSettings(); this.show("screen-bleed"); try { BleedGame.start(this); } catch (e) {} },
    _fail: function (hintId) { var h = this.$(hintId); if (h) h.textContent = "3D view is not available on this device."; },

    wire: function () {
      var self = this;
      function on(id, ev, fn) { var el = self.$(id); if (el) el.addEventListener(ev, fn); }

      // hub
      on("card-fire", "click", function () { self._setDiff(); self.show("screen-fire-howto"); });
      on("card-gobag", "click", function () { self.show("screen-gobag-modes"); });
      on("btn-gobagmodes-back", "click", function () { self.show("screen-hub"); });
      on("mode-gobag-table", "click", function () { GoBag.mode = "table"; self.show("screen-gobag-howto"); });
      on("mode-gobag-pile", "click", function () { GoBag.mode = "pile"; self.show("screen-gobag-howto"); });
      on("mode-gobag-room", "click", function () { GoBag.mode = "room"; self.show("screen-gobag-howto"); });
      ["mit", "prep", "resp", "rec"].forEach(function (k) {
        on("tile-" + k, "click", function () { try { document.body.setAttribute("data-pillar", k); } catch (e) {} self.show("screen-pillar-" + k); });
        on("btn-pback-" + k, "click", function () { self.show("screen-hub"); });
      });

      // player profiles (Who is playing?)
      on("switch-chip", "click", function () { self.openPlayers(); });
      on("btn-players-edit", "click", function () { self.toggleEditPlayers(); });
      on("btn-addplayer-back", "click", function () { self.openPlayers(); });
      on("btn-addplayer-save", "click", function () { self.confirmAddPlayer(); });
      on("btn-addplayer-remove", "click", function () { self.removeCurrentPlayer(); });

      // "What is this app?" see more / see less
      on("btn-about-more", "click", function () {
        var box = self.$("about-more"), btn = this; if (!box) return;
        var open = box.classList.toggle("hidden") === false;
        btn.textContent = open ? "See less" : "See more"; btn.setAttribute("aria-expanded", open ? "true" : "false");
      });

      // discreet per-game credit dots (who developed each game)
      var LEAD = "Edward Andrew A. Dionido, Lead Science Research Specialist II, UP Resilience Institute. Built with the assistance of AI.";
      self.CREDITS = {
        sapa: { name: "Guide the Stream", lead: LEAD, note: "Inspired by the Ang Sapa series of Dr. Alfredo Mahar Lagmay (Project NOAH, UP Resilience Institute)." },
        hazard: { name: "Hazard Hunt", lead: LEAD },
        gobag: { name: "Go Bag Packing", lead: LEAD },
        fire: { name: "Fire Extinguisher", lead: LEAD },
        quake: { name: "Duck, Cover, and Hold", lead: LEAD },
        path: { name: "Safe Path", lead: LEAD },
        cleanup: { name: "House Cleanup", lead: LEAD },
        cares: { name: "CARES: Community and Resilience", lead: LEAD }
      };
      var dots = document.querySelectorAll(".credit-dot");
      for (var di = 0; di < dots.length; di++) {
        (function (dot) {
          function openIt(e) { if (e) { e.stopPropagation(); e.preventDefault(); } self.openCredit(dot.getAttribute("data-credit")); }
          dot.addEventListener("click", openIt);
          dot.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") openIt(e); });
        })(dots[di]);
      }
      on("btn-credit-close", "click", function () { self.closeModal("modal-credit"); });
      on("btn-credit-ok", "click", function () { self.closeModal("modal-credit"); });
      on("card-sapa", "click", function () { self.show("screen-sapa-levels"); });
      on("card-hazard", "click", function () { self.show("screen-hazard-scenes"); });
      on("card-cares", "click", function () { self.show("screen-cares-maps"); });
      on("btn-caresmaps-back", "click", function () { self.show("screen-hub"); });
      [0, 1, 2, 3].forEach(function (mi) {
        on("map-cares-" + mi, "click", function () { Logic.cares.useMap(mi); CARES.mapIndex = mi; self.show("screen-cares-howto"); });
      });
      on("card-quake", "click", function () { self.show("screen-quake-howto"); });
      on("card-cpr", "click", function () { self.show("screen-cpr-howto"); });
      on("btn-cpr-howto-back", "click", function () { self.show("screen-hub"); });
      on("btn-cpr-go", "click", function () { self.startCPR(); });
      on("btn-cpr-quit", "click", function () { CPRGame.stop(); self.show("screen-hub"); });
      on("btn-cpr-restart", "click", function () { CPRGame.stop(); self.startCPR(); });
      on("btn-cpr-call", "click", function () { CPRGame._callDone(); });
      on("btn-cpr-retry", "click", function () { self.startCPR(); });
      on("btn-cpr-home", "click", function () { self.show("screen-hub"); });
      on("card-bleed", "click", function () { self.show("screen-bleed-howto"); });
      on("btn-bleed-howto-back", "click", function () { self.show("screen-hub"); });
      on("btn-bleed-go", "click", function () { self.startBleed(); });
      on("btn-bleed-quit", "click", function () { BleedGame.stop(); self.show("screen-hub"); });
      on("btn-bleed-restart", "click", function () { BleedGame.stop(); self.startBleed(); });
      on("btn-bleed-gloves", "click", function () { BleedGame._gloves(); });
      on("btn-bleed-cover", "click", function () { BleedGame._cover(); });
      on("btn-bleed-retry", "click", function () { self.startBleed(); });
      on("btn-bleed-home", "click", function () { self.show("screen-hub"); });
      on("btn-quake-howto-back", "click", function () { self.show("screen-hub"); });
      on("btn-quake-go", "click", function () { self.startQuake(); });
      on("btn-quake-quit", "click", function () { QuakeGame.stop(); self.show("screen-hub"); });
      on("btn-quake-restart", "click", function () { QuakeGame.stop(); self.startQuake(); });
      on("btn-quake-settings", "click", function () { self.openModal("modal-settings"); });
      on("btn-quake-drop", "click", function () { QuakeGame._tapAction("drop"); });
      on("btn-quake-cover", "click", function () { QuakeGame._tapAction("cover"); });
      on("btn-quake-hold", "click", function () { QuakeGame._tapAction("hold"); });
      on("btn-quake-evac", "click", function () { QuakeGame._tapAction("evacuate"); });
      on("btn-quake-retry", "click", function () { self.startQuake(); });
      on("btn-quake-home", "click", function () { self.show("screen-hub"); });
      on("btn-cares-howto-back", "click", function () { self.show("screen-cares-maps"); });
      on("btn-cares-go", "click", function () { self.startCares(); });
      on("btn-cares-quit", "click", function () { CARES.stop(); self.show("screen-hub"); });
      on("btn-cares-restart", "click", function () { CARES.stop(); self.startCares(); });
      on("btn-cares-legend", "click", function () { var e = self.$("cares-legend"); if (e) e.classList.add("open"); });
      on("btn-cares-legend-close", "click", function () { var e = self.$("cares-legend"); if (e) e.classList.remove("open"); });
      on("btn-cares-zin", "click", function () { CARES.zoom(-1); });
      on("btn-cares-zout", "click", function () { CARES.zoom(1); });
      on("btn-cares-settings", "click", function () { self.openModal("modal-settings"); });
      on("btn-cares-retry", "click", function () { self.startCares(); });
      on("btn-cares-home", "click", function () { self.show("screen-hub"); });
      on("btn-about", "click", function () { self.openModal("modal-about"); });
      on("btn-about-close", "click", function () { self.closeModal("modal-about"); });
      on("btn-close-about", "click", function () { self.closeModal("modal-about"); });
      on("btn-settings", "click", function () { self.openModal("modal-settings"); });

      // how to
      on("btn-fire-howto-back", "click", function () { self.show("screen-hub"); });
      on("btn-fire-go", "click", function () { self.startFire(); });
      on("diff-easy", "click", function () { self.fireDifficulty = "easy"; self._setDiff(); });
      on("diff-hard", "click", function () { self.fireDifficulty = "hard"; self._setDiff(); });
      on("btn-gobag-howto-back", "click", function () { self.show("screen-gobag-modes"); });
      on("btn-gobag-go", "click", function () { self.startGoBag(); });
      on("btn-sapa-howto-back", "click", function () { self.show("screen-sapa-levels"); });
      on("btn-sapa-go", "click", function () { self.startSapa(); });
      on("btn-sapalevels-back", "click", function () { self.show("screen-hub"); });
      on("lvl-sapa-0", "click", function () { Sapa.level = 0; self.show("screen-sapa-howto"); });
      on("lvl-sapa-1", "click", function () { Sapa.level = 1; self.show("screen-sapa-howto"); });
      on("lvl-sapa-2", "click", function () { Sapa.level = 2; self.show("screen-sapa-howto"); });
      on("btn-sapa-quit", "click", function () { Sapa.stop(); self.show("screen-sapa-levels"); });
      on("btn-sapa-restart", "click", function () { Sapa.stop(); self.startSapa(); });
      on("btn-sapa-legend", "click", function () { var e = self.$("sapa-legend"); if (e) e.classList.add("open"); });
      on("btn-sapa-legend-close", "click", function () { var e = self.$("sapa-legend"); if (e) e.classList.remove("open"); });
      on("btn-sapa-zin", "click", function () { Sapa.zoom(-1); });
      on("btn-sapa-zout", "click", function () { Sapa.zoom(1); });
      on("btn-sapa-settings", "click", function () { self.openModal("modal-settings"); });
      on("btn-sapa-retry", "click", function () { self.startSapa(); });
      on("btn-sapa-next", "click", function () { if (Sapa.level < Sapa.SP.LEVELS.length - 1) Sapa.level++; self.startSapa(); });
      on("btn-sapa-home", "click", function () { self.show("screen-sapa-levels"); });

      on("btn-hazscenes-back", "click", function () { self.show("screen-hub"); });
      on("scene-hazard-0", "click", function () { HazardHunt.scene = 0; self.show("screen-hazard-howto"); });
      on("scene-hazard-1", "click", function () { HazardHunt.scene = 1; self.show("screen-hazard-howto"); });
      on("scene-hazard-2", "click", function () { HazardHunt.scene = 2; self.show("screen-hazard-howto"); });
      on("btn-hazard-howto-back", "click", function () { self.show("screen-hazard-scenes"); });
      on("btn-hazard-go", "click", function () { self.startHazard(); });
      on("btn-hazard-quit", "click", function () { HazardHunt.stop(); self.show("screen-hazard-scenes"); });
      on("btn-hazard-restart", "click", function () { HazardHunt.stop(); self.startHazard(); });
      on("btn-hazard-legend", "click", function () { var e = self.$("hazard-legend"); if (e) e.classList.add("open"); });
      on("btn-hazard-legend-close", "click", function () { var e = self.$("hazard-legend"); if (e) e.classList.remove("open"); });
      on("btn-hazard-zin", "click", function () { HazardHunt.zoom(-1); });
      on("btn-hazard-zout", "click", function () { HazardHunt.zoom(1); });
      on("btn-hazard-settings", "click", function () { self.openModal("modal-settings"); });
      on("btn-hazard-modal-close", "click", function () { HazardHunt._closeInspect(); });
      on("btn-hazard-retry", "click", function () { self.startHazard(); });
      on("btn-hazard-next", "click", function () { if (HazardHunt.scene < HazardHunt.HZ.SCENES.length - 1) HazardHunt.scene++; self.startHazard(); });
      on("btn-hazard-home", "click", function () { self.show("screen-hazard-scenes"); });

      // fire in-game
      on("btn-fire-quit", "click", function () { FireGame.stop(); self.show("screen-hub"); });
      on("btn-fire-restart", "click", function () { FireGame.stop(); self.startFire(); });
      on("btn-fire-settings", "click", function () { self.openModal("modal-settings"); });
      on("btn-fire-replay", "click", function () { self.startFire(); });
      on("btn-fire-hub", "click", function () { self.show("screen-hub"); });

      // gobag in-game
      on("btn-gobag-quit", "click", function () { GoBag.stop(); self.show("screen-hub"); });
      on("btn-gobag-new", "click", function () { GoBag.stop(); self.startGoBag(); });
      on("btn-gobag-settings", "click", function () { self.openModal("modal-settings"); });
      on("btn-zip", "click", function () { GoBag.finish(); });
      on("btn-gobag-replay", "click", function () { self.startGoBag(); });
      on("btn-gobag-hub", "click", function () { self.show("screen-hub"); });

      // safe path
      on("card-path", "click", function () { self.show("screen-safepath-levels"); });
      on("btn-splevels-back", "click", function () { self.show("screen-hub"); });
      on("lvl-trace", "click", function () { self.show("screen-trace-howto"); });
      on("lvl-tiles", "click", function () { self.show("screen-safepath-howto"); });

      // level 1: trace
      on("btn-trace-howto-back", "click", function () { self.show("screen-safepath-levels"); });
      on("btn-trace-go", "click", function () { self.startTrace(); });
      on("btn-trace-quit", "click", function () { TraceGame.stop(); self.show("screen-safepath-levels"); });
      on("btn-trace-restart", "click", function () { TraceGame.stop(); self.startTrace(); });
      on("btn-trace-clear", "click", function () { TraceGame.clearPath(); });
      on("btn-trace-settings", "click", function () { self.openModal("modal-settings"); });
      on("btn-tr-zin", "click", function () { TraceGame.zoom(-1); });
      on("btn-tr-zout", "click", function () { TraceGame.zoom(1); });
      on("btn-tr-retry", "click", function () { self.startTrace(); });
      on("btn-tr-levels", "click", function () { self.show("screen-safepath-levels"); });
      on("btn-tr-home", "click", function () { self.show("screen-hub"); });

      // level 2: tiles
      on("btn-safepath-howto-back", "click", function () { self.show("screen-safepath-levels"); });
      on("btn-safepath-go", "click", function () { SafePath.level = 0; self.startSafePath(); });
      on("btn-safepath-quit", "click", function () { SafePath.stop(); self.show("screen-safepath-levels"); });
      on("btn-safepath-restart", "click", function () { SafePath.stop(); self.startSafePath(); });
      on("btn-safepath-settings", "click", function () { self.openModal("modal-settings"); });
      on("btn-sp-zin", "click", function () { SafePath.zoom(-1); });
      on("btn-sp-zout", "click", function () { SafePath.zoom(1); });
      on("btn-sp-hint", "click", function () { SafePath.showRoute(); });
      on("btn-sp-retry", "click", function () { self.startSafePath(); });
      on("btn-sp-next", "click", function () { SafePath.level = SafePath.level + 1; self.startSafePath(); });
      on("btn-sp-home", "click", function () { self.show("screen-safepath-levels"); });

      // legends
      on("btn-sp-legend", "click", function () { var e = self.$("sp-legend"); if (e) e.classList.add("open"); });
      on("btn-sp-legend-close", "click", function () { var e = self.$("sp-legend"); if (e) e.classList.remove("open"); });
      on("btn-tr-legend", "click", function () { var e = self.$("tr-legend"); if (e) e.classList.add("open"); });
      on("btn-tr-legend-close", "click", function () { var e = self.$("tr-legend"); if (e) e.classList.remove("open"); });

      // level 3: high ground
      on("lvl-high", "click", function () { self.show("screen-high-howto"); });
      on("btn-high-howto-back", "click", function () { self.show("screen-safepath-levels"); });
      on("btn-high-go", "click", function () { self.startHigh(); });
      on("btn-high-quit", "click", function () { HighGround.stop(); self.show("screen-safepath-levels"); });
      on("btn-high-restart", "click", function () { HighGround.stop(); self.startHigh(); });
      on("btn-high-settings", "click", function () { self.openModal("modal-settings"); });
      on("btn-hg-zin", "click", function () { HighGround.zoom(-1); });
      on("btn-hg-zout", "click", function () { HighGround.zoom(1); });
      on("btn-hg-hint", "click", function () { HighGround.showRoute(); });
      on("btn-hg-legend", "click", function () { var e = self.$("hg-legend"); if (e) e.classList.add("open"); });
      on("btn-hg-legend-close", "click", function () { var e = self.$("hg-legend"); if (e) e.classList.remove("open"); });
      on("btn-hg-retry", "click", function () { self.startHigh(); });
      on("btn-hg-levels", "click", function () { self.show("screen-safepath-levels"); });
      on("btn-hg-home", "click", function () { self.show("screen-hub"); });

      // house cleanup
      on("card-cleanup", "click", function () { self.show("screen-cleanup-pick"); });
      on("btn-cleanpick-back", "click", function () { self.show("screen-hub"); });
      on("btn-clean-flood", "click", function () { Cleanup.scenario = "flood"; self.show("screen-cleanup-howto"); });
      on("btn-clean-typhoon", "click", function () { Cleanup.scenario = "typhoon"; self.show("screen-cleanup-howto"); });
      on("btn-clean-howto-back", "click", function () { self.show("screen-cleanup-pick"); });
      on("btn-clean-go", "click", function () { self.startCleanup(); });
      on("btn-clean-quit", "click", function () { Cleanup.stop(); self.show("screen-cleanup-pick"); });
      on("btn-clean-restart", "click", function () { Cleanup.stop(); self.startCleanup(); });
      on("btn-clean-settings", "click", function () { self.openModal("modal-settings"); });
      on("btn-clean-tools", "click", function () { var e = self.$("clean-tools"); if (e) e.classList.add("open"); });
      on("btn-clean-gear", "click", function () { Cleanup.equipGear(); });
      on("btn-clean-zin", "click", function () { Cleanup.zoom(-1); });
      on("btn-clean-zout", "click", function () { Cleanup.zoom(1); });
      on("btn-clean-keep", "click", function () { Cleanup.act("keep"); });
      on("btn-clean-toss", "click", function () { Cleanup.act("toss"); });
      on("btn-clean-hazard", "click", function () { Cleanup.act("hazard"); });
      on("btn-clean-modal-close", "click", function () { Cleanup.closeItem(); });
      on("btn-bin-bio", "click", function () { Cleanup.bin("bio"); });
      on("btn-bin-recycle", "click", function () { Cleanup.bin("recycle"); });
      on("btn-bin-special", "click", function () { Cleanup.bin("special"); });
      on("btn-bin-back", "click", function () { Cleanup.binBack(); });
      on("btn-clean-retry", "click", function () { self.startCleanup(); });
      on("btn-clean-pick", "click", function () { self.show("screen-cleanup-pick"); });
      on("btn-clean-home", "click", function () { self.show("screen-hub"); });

      // shared info modal (used by gobag)
      on("btn-info-pack", "click", function () { if (GoBag.confirmInfo) GoBag.confirmInfo(); });
      on("btn-info-leave", "click", function () { self.closeModal("modal-info"); });
      on("btn-info-close", "click", function () { self.closeModal("modal-info"); });

      // settings + modals
      on("toggle-sound", "change", function (e) { self.settings.sound = !!e.target.checked; if (!self.settings.sound) self._stopNoise(); });
      on("toggle-hints", "change", function (e) { self.settings.hints = !!e.target.checked; });
      on("btn-close-settings", "click", function () { self.closeModal("modal-settings"); });

      // Champion ID scorecard
      on("btn-scorecard", "click", function () { self.renderScorecard(); self.show("screen-scorecard"); });
      on("btn-score-back", "click", function () { self.show("screen-hub"); });
      on("btn-print-id", "click", function () { try { window.print(); } catch (e) {} });
      on("btn-reset-badges", "click", function () { self.badges.reset(); self.renderScorecard(); });
      on("btn-add-photo", "click", function () { var inp = self.$("champ-photo-input"); if (inp) inp.click(); });
      on("champ-photo", "click", function () { var inp = self.$("champ-photo-input"); if (inp) inp.click(); });
      on("champ-photo-input", "change", function (e) {
        var f = e.target.files && e.target.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function (ev) { var box = self.$("champ-photo"); if (box) box.innerHTML = '<img alt="champion" src="' + ev.target.result + '">'; };
        r.readAsDataURL(f);
      });
    }
  };
  if (typeof window !== "undefined") window.BYANI = { Logic: Logic, App: App, BADGE_DEFS: BADGE_DEFS };

  /* =====================================================================
     3) AIM CONTROLLER  (shared free-look; drag to aim, tap callback, keys)
     ===================================================================== */
  function AimController(camera, camPos, canvas, opts) {
    opts = opts || {};
    this.camera = camera; this.camPos = camPos; this.canvas = canvas;
    this.yaw = opts.yaw || 0; this.pitch = opts.pitch != null ? opts.pitch : -0.1;
    this.minPitch = opts.minPitch != null ? opts.minPitch : -0.9;
    this.maxPitch = opts.maxPitch != null ? opts.maxPitch : 0.5;
    this.onTap = opts.onTap || null;
    var self = this, dragging = false, moved = false, lx = 0, ly = 0, sx = 0, sy = 0;
    this._suspend = false;
    function pt(e) { if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY }; }
    this._down = function (e) { if (e.touches && e.touches.length >= 2) return; dragging = true; moved = false; var p = pt(e); lx = sx = p.x; ly = sy = p.y; };
    this._move = function (e) {
      if (!dragging || self._suspend) return; var p = pt(e);
      if (Math.hypot(p.x - sx, p.y - sy) > 6) moved = true;
      self.yaw -= (p.x - lx) * 0.0045; self.pitch -= (p.y - ly) * 0.0045;
      self.pitch = Logic.clamp(self.pitch, self.minPitch, self.maxPitch);
      lx = p.x; ly = p.y; if (e.cancelable) e.preventDefault();
    };
    this._up = function (e) {
      if (!dragging) return; dragging = false;
      if (!moved && self.onTap) { var p = pt(e); self.onTap(p.x, p.y); }
    };
    this._key = function (e) {
      if (e.code === "ArrowLeft") self.yaw += 0.05;
      else if (e.code === "ArrowRight") self.yaw -= 0.05;
      else if (e.code === "ArrowUp") self.pitch = Logic.clamp(self.pitch - 0.04, self.minPitch, self.maxPitch);
      else if (e.code === "ArrowDown") self.pitch = Logic.clamp(self.pitch + 0.04, self.minPitch, self.maxPitch);
    };
    canvas.addEventListener("pointerdown", this._down);
    window.addEventListener("pointermove", this._move, { passive: false });
    window.addEventListener("pointerup", this._up);
    window.addEventListener("keydown", this._key);
  }
  AimController.prototype.euler = function () { return new THREE.Euler(this.pitch, this.yaw, 0, "YXZ"); };
  AimController.prototype.apply = function () { this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ"); };
  AimController.prototype.forward = function () { return new THREE.Vector3(0, 0, -1).applyEuler(this.euler()).normalize(); };
  AimController.prototype.destroy = function () {
    this.canvas.removeEventListener("pointerdown", this._down);
    window.removeEventListener("pointermove", this._move);
    window.removeEventListener("pointerup", this._up);
    window.removeEventListener("keydown", this._key);
  };

  /* =====================================================================
     4) FIRE GAME  (enhanced, more realistic 3D)
     ===================================================================== */
  var FireGame = {
    running: false, _raf: null,
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this.app = app;
      var oldCanvas = document.getElementById("canvas-fire");
      var canvas = oldCanvas.cloneNode(false);
      oldCanvas.parentNode.replaceChild(canvas, oldCanvas);
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0d1f2d);
      this.scene.fog = new THREE.Fog(0x0d1f2d, 7, 18);
      this.camera = new THREE.PerspectiveCamera(70, w / h, 0.1, 100);
      this.camZ = 1.0; this.camPos = new THREE.Vector3(0, 1.5, this.camZ);
      this.camera.position.copy(this.camPos);
      this.fireBase = new THREE.Vector3(0, 0.78, -3.2);

      this.aim = new AimController(this.camera, this.camPos, canvas, { yaw: 0, pitch: -0.12 });

      this._buildRoom(); this._buildExtinguisher(); this._buildFire(); this._buildSpray();

      this.state = { pinPulled: false, spraying: false, aimAtBase: false, aimAtFire: false, sweeping: false, distance: 4, intensity: 100, agentLeft: 100 };
      this.time0 = null; this._prev = null; this.sprayFrames = 0; this.baseFrames = 0;
      this.lastYaw = this.aim.yaw; this.sweep = 0; this.won = false; this.ignited = 0;
      this.easy = this.app.fireDifficulty !== "hard";

      this._resetHud(); this._bindButtons();
      var self = this; this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize);
      this._onResize();
      this.running = true; this._loop(performance.now());
    },
    stop: function () {
      this.running = false;
      if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      if (this.aim) this.aim.destroy();
      if (this._resize) window.removeEventListener("resize", this._resize);
      this._unbindButtons();
      if (this.app) this.app._stopNoise();
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },

    _resetHud: function () {
      ["pull", "aim", "squeeze", "sweep"].forEach(function (k) { var c = document.getElementById("chip-" + k); if (c) c.classList.remove("done"); });
      var pull = document.getElementById("btn-pull"); if (pull) { pull.style.display = ""; pull.classList.add("pulse"); }
      var spray = document.getElementById("btn-spray"); if (spray) spray.classList.remove("pulse");
      this._meter("fire-fill", 100); this._meter("agent-fill", 100);
      var am = document.getElementById("agent-meter"); if (am) am.style.display = this.easy ? "none" : "";
      this._hint(Logic.fire.nextHint({ pinPulled: false }));
    },
    _hint: function (t) { var h = document.getElementById("hint-fire"); if (h) { h.style.display = this.app.settings.hints ? "" : "none"; h.textContent = t; } },
    _meter: function (id, pct) { var f = document.getElementById(id); if (f) f.style.width = Logic.clamp(pct, 0, 100) + "%"; },

    _buildRoom: function () {
      var s = this.scene;
      s.add(new THREE.HemisphereLight(0xdfeaf2, 0x40484f, 0.9));
      var dir = new THREE.DirectionalLight(0xffffff, 0.45); dir.position.set(3, 7, 4); s.add(dir);
      var floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshStandardMaterial({ color: 0x8a949b }));
      floor.rotation.x = -Math.PI / 2; s.add(floor);
      var ceil = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshStandardMaterial({ color: 0xeef3f6 }));
      ceil.rotation.x = Math.PI / 2; ceil.position.y = 3.4; s.add(ceil);
      var wallMat = new THREE.MeshStandardMaterial({ color: 0xcdd9df });
      var back = new THREE.Mesh(new THREE.PlaneGeometry(24, 8), wallMat); back.position.set(0, 4, -8); s.add(back);
      var left = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), wallMat); left.rotation.y = Math.PI / 2; left.position.set(-7, 4, 0); s.add(left);
      var right = left.clone(); right.rotation.y = -Math.PI / 2; right.position.set(7, 4, 0); s.add(right);
      // whiteboard
      var wb = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2), new THREE.MeshStandardMaterial({ color: 0xffffff })); wb.position.set(-2, 2.6, -7.95); s.add(wb);
      var wbf = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 2.3), new THREE.MeshStandardMaterial({ color: 0xb0bcc4 })); wbf.position.set(-2, 2.6, -7.97); s.add(wbf);
      // windows (glowy)
      var winMat = new THREE.MeshStandardMaterial({ color: 0xa9dcff, emissive: 0x6fb7e8, emissiveIntensity: 0.5 });
      for (var wI = 0; wI < 2; wI++) { var win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4), winMat); win.rotation.y = -Math.PI / 2; win.position.set(6.98, 2.3, -1.5 + wI * 3); s.add(win); }
      // exit sign (green) to reinforce "know your exit"
      var exit = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.4), new THREE.MeshStandardMaterial({ color: 0x0f8f52, emissive: 0x0b6b3d, emissiveIntensity: 0.6 }));
      exit.position.set(3.2, 3.0, -7.94); s.add(exit);
      // desks and chairs
      var deskMat = new THREE.MeshStandardMaterial({ color: 0xcaa06a });
      var legMat = new THREE.MeshStandardMaterial({ color: 0x8a8f94 });
      for (var k = -1; k <= 1; k++) {
        var top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.7), deskMat); top.position.set(k * 2.4, 0.74, -3.2); s.add(top);
        var offs = [[-0.55, -0.28], [0.55, -0.28], [-0.55, 0.28], [0.55, 0.28]];
        for (var j = 0; j < 4; j++) { var leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.74, 0.08), legMat); leg.position.set(k * 2.4 + offs[j][0], 0.37, -3.2 + offs[j][1]); s.add(leg); }
        var seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), new THREE.MeshStandardMaterial({ color: 0x4f6b8a })); seat.position.set(k * 2.4, 0.5, -2.4); s.add(seat);
      }
      // burning trash bin (charred base under the fire)
      var bin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.52, 18), new THREE.MeshStandardMaterial({ color: 0x39424a })); bin.position.set(0, 0.26, -3.2); s.add(bin);
      var char = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshStandardMaterial({ color: 0x1c1c1c })); char.rotation.x = -Math.PI / 2; char.position.set(0, 0.79, -3.2); s.add(char);
    },

    _buildExtinguisher: function () {
      var g = new THREE.Group();
      var red = new THREE.MeshStandardMaterial({ color: 0xd21f1f, metalness: 0.3, roughness: 0.5 });
      var black = new THREE.MeshStandardMaterial({ color: 0x141414 });
      var body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.32, 22), red); g.add(body);
      var dome = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), red); dome.position.y = 0.16; g.add(dome);
      var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.07, 14), black); neck.position.y = 0.24; g.add(neck);
      var handle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.05), black); handle.position.set(0.02, 0.3, 0); g.add(handle);
      var lever = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.02, 0.04), new THREE.MeshStandardMaterial({ color: 0x444444 })); lever.position.set(0.03, 0.27, 0); this.lever = lever; g.add(lever);
      // pressure gauge
      var gauge = new THREE.Mesh(new THREE.CircleGeometry(0.035, 18), new THREE.MeshStandardMaterial({ color: 0xf2f2f2 })); gauge.position.set(0.06, 0.22, 0.05); gauge.rotation.x = -0.2; g.add(gauge);
      var needle = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.03, 0.002), new THREE.MeshStandardMaterial({ color: 0x1aae63 })); needle.position.set(0.06, 0.225, 0.052); needle.rotation.z = 0.6; g.add(needle);
      // long flexible hose that arcs from the valve out to a horn in front of the player
      var hosePts = [
        new THREE.Vector3(0.02, 0.26, 0.04),
        new THREE.Vector3(0.16, 0.26, -0.02),
        new THREE.Vector3(0.24, 0.18, -0.20),
        new THREE.Vector3(0.18, 0.10, -0.42),
        new THREE.Vector3(0.04, 0.05, -0.64),
        new THREE.Vector3(-0.04, 0.03, -0.86)
      ];
      var curve = new THREE.CatmullRomCurve3(hosePts);
      var rubber = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85 });
      var hose = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.02, 10, false), rubber); g.add(hose);
      // metal coupling where the hose leaves the valve
      var coupling = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 14), new THREE.MeshStandardMaterial({ color: 0xb8bcc0, metalness: 0.6, roughness: 0.35 }));
      coupling.rotation.z = Math.PI / 2; coupling.position.set(0.03, 0.26, 0.02); g.add(coupling);
      // flared horn nozzle at the hose end, opening forward (two tone for a friendly look)
      var horn = new THREE.Group();
      var hornOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.022, 0.17, 20, 1, true), rubber);
      hornOuter.rotation.x = Math.PI / 2; hornOuter.position.z = -0.085; horn.add(hornOuter);
      var hornInner = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.02, 0.16, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0xe23a2b, side: THREE.DoubleSide }));
      hornInner.rotation.x = Math.PI / 2; hornInner.position.z = -0.082; horn.add(hornInner);
      var hornLip = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 10, 22), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      hornLip.position.z = -0.17; horn.add(hornLip);
      var grip = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 14), new THREE.MeshStandardMaterial({ color: 0xffc53d }));
      grip.rotation.x = Math.PI / 2; grip.position.z = 0.02; horn.add(grip);
      horn.position.set(-0.04, 0.03, -0.86); g.add(horn); this.horn = horn;
      // marker at the very tip so the spray starts from the horn
      var tip = new THREE.Object3D(); tip.position.set(-0.04, 0.02, -1.02); g.add(tip); this.hornTipObj = tip;
      // safety pin
      var pin = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 16), new THREE.MeshStandardMaterial({ color: 0xffc53d, emissive: 0x8a6a00 })); pin.position.set(-0.04, 0.3, 0.02); this.pin = pin; g.add(pin);

      g.position.set(0.26, -0.34, -0.6); g.rotation.set(0.14, -0.2, 0);
      this.extinguisher = g;
      this.camera.add(g); this.scene.add(this.camera);
    },

    _buildFire: function () {
      var fb = this.fireBase, N = 300;
      var geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
      this.fL = new Float32Array(N); this.fS = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) this._seedFire(i, pos, col, true);
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      this.fire = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }));
      this.fireN = N; this.scene.add(this.fire);
      // embers
      var E = 60, eg = new THREE.BufferGeometry(), ep = new Float32Array(E * 3);
      this.eL = new Float32Array(E); this.eS = new Float32Array(E * 3);
      for (var e = 0; e < E; e++) this._seedEmber(e, ep, true);
      eg.setAttribute("position", new THREE.BufferAttribute(ep, 3));
      this.embers = new THREE.Points(eg, new THREE.PointsMaterial({ size: 0.05, color: 0xffb347, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
      this.emberN = E; this.scene.add(this.embers);
      // smoke
      var M = 130, sg = new THREE.BufferGeometry(), sp = new Float32Array(M * 3);
      this.sL = new Float32Array(M); this.sS = new Float32Array(M * 3);
      for (var m = 0; m < M; m++) this._seedSmoke(m, sp, true);
      sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
      this.smoke = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.4, color: 0x4a5157, transparent: true, opacity: 0.35, depthWrite: false }));
      this.smokeN = M; this.scene.add(this.smoke);
      this.fireLight = new THREE.PointLight(0xff7a1a, 1.6, 9); this.fireLight.position.copy(fb).add(new THREE.Vector3(0, 0.4, 0)); this.scene.add(this.fireLight);
    },
    _seedFire: function (i, pos, col, init) {
      var r = 0.17 * Math.sqrt(Math.random()), a = Math.random() * Math.PI * 2, fb = this.fireBase;
      this.fS[i * 3] = Math.cos(a) * r; this.fS[i * 3 + 1] = 0.6 + Math.random() * 1.0; this.fS[i * 3 + 2] = Math.sin(a) * r;
      this.fL[i] = init ? Math.random() : 0;
      pos[i * 3] = fb.x + this.fS[i * 3]; pos[i * 3 + 1] = fb.y; pos[i * 3 + 2] = fb.z + this.fS[i * 3 + 2];
      col[i * 3] = 1; col[i * 3 + 1] = 0.5; col[i * 3 + 2] = 0.05;
    },
    _seedEmber: function (e, ep, init) {
      var r = 0.15 * Math.random(), a = Math.random() * Math.PI * 2, fb = this.fireBase;
      this.eS[e * 3] = Math.cos(a) * r + (Math.random() - 0.5) * 0.2; this.eS[e * 3 + 1] = 1.0 + Math.random() * 1.4; this.eS[e * 3 + 2] = Math.sin(a) * r;
      this.eL[e] = init ? Math.random() : 0;
      ep[e * 3] = fb.x; ep[e * 3 + 1] = fb.y; ep[e * 3 + 2] = fb.z;
    },
    _seedSmoke: function (m, sp, init) {
      var r = 0.2 * Math.random(), a = Math.random() * Math.PI * 2, fb = this.fireBase;
      this.sS[m * 3] = Math.cos(a) * r; this.sS[m * 3 + 1] = 1.4 + Math.random() * 1.4; this.sS[m * 3 + 2] = Math.sin(a) * r;
      this.sL[m] = init ? Math.random() : 0;
      sp[m * 3] = fb.x; sp[m * 3 + 1] = fb.y + 0.4; sp[m * 3 + 2] = fb.z;
    },
    _buildSpray: function () {
      var N = 640, geo = new THREE.BufferGeometry();
      var pos = new Float32Array(N * 3), size = new Float32Array(N), alpha = new Float32Array(N), color = new Float32Array(N * 3);
      this.spL = new Float32Array(N); this.spV = new Float32Array(N * 3); this.spSize = size; this.spAlpha = alpha; this.spColor = color; this.spMax = new Float32Array(N);
      for (var i = 0; i < N; i++) { pos[i * 3 + 1] = -100; this.spL[i] = 0; }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
      geo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
      var c = document.getElementById("canvas-fire"); var hh = (c && c.clientHeight) ? c.clientHeight : 720;
      // big soft round puffs, per particle size, color and fade (no texture, works offline)
      this.sprayMat = new THREE.ShaderMaterial({
        uniforms: { uScale: { value: hh * 0.5 } },
        transparent: true, depthWrite: false, blending: THREE.NormalBlending,
        vertexShader: [
          "attribute float aSize;", "attribute float aAlpha;", "attribute vec3 aColor;", "uniform float uScale;",
          "varying float vAlpha;", "varying vec3 vColor;",
          "void main(){",
          "  vAlpha = aAlpha; vColor = aColor;",
          "  vec4 mv = modelViewMatrix * vec4(position,1.0);",
          "  gl_PointSize = aSize * uScale / max(0.001, -mv.z);",
          "  gl_Position = projectionMatrix * mv;",
          "}"
        ].join("\n"),
        fragmentShader: [
          "varying float vAlpha;", "varying vec3 vColor;",
          "void main(){",
          "  float d = distance(gl_PointCoord, vec2(0.5));",
          "  float edge = smoothstep(0.5, 0.14, d);",
          "  float core = smoothstep(0.30, 0.0, d);",
          "  float a = edge * vAlpha;",
          "  if(a <= 0.01) discard;",
          "  vec3 col = mix(vColor, vec3(1.0), core * 0.6);",
          "  gl_FragColor = vec4(col, a);",
          "}"
        ].join("\n")
      });
      this.spray = new THREE.Points(geo, this.sprayMat);
      this.sprayN = N; this.sprayHead = 0; this.scene.add(this.spray);
    },

    _bindButtons: function () {
      var self = this;
      var pull = document.getElementById("btn-pull"); this._pull = function () { self._pullPin(); }; if (pull) pull.addEventListener("click", this._pull);
      var spray = document.getElementById("btn-spray");
      this._sd = function (e) { self._setSpray(true); if (e.cancelable) e.preventDefault(); };
      this._su = function () { self._setSpray(false); };
      if (spray) { spray.addEventListener("pointerdown", this._sd); spray.addEventListener("pointerup", this._su); spray.addEventListener("pointerleave", this._su); spray.addEventListener("pointercancel", this._su); }
      var fwd = document.getElementById("btn-fwd"), bk = document.getElementById("btn-back");
      this._fwd = function () { self.camZ = Logic.clamp(self.camZ - 0.4, -0.3, 2.2); self.camPos.z = self.camZ; self.camera.position.z = self.camZ; };
      this._bk = function () { self.camZ = Logic.clamp(self.camZ + 0.4, -0.3, 2.2); self.camPos.z = self.camZ; self.camera.position.z = self.camZ; };
      if (fwd) fwd.addEventListener("click", this._fwd); if (bk) bk.addEventListener("click", this._bk);
      this._kd = function (e) { if (e.code === "Space") { self._setSpray(true); e.preventDefault(); } else if (e.code === "Enter") self._pullPin(); else if (e.code === "KeyW") self._fwd(); else if (e.code === "KeyS") self._bk(); };
      this._ku = function (e) { if (e.code === "Space") self._setSpray(false); };
      window.addEventListener("keydown", this._kd); window.addEventListener("keyup", this._ku);
      // desktop: press and hold the mouse on the 3D view to spray; moving the mouse sweeps (aims)
      var stage = document.getElementById("canvas-fire");
      this._mdown = function (e) { if (e.pointerType === "mouse" && e.button === 0) self._setSpray(true); };
      this._mup = function (e) { if (e.pointerType === "mouse") self._setSpray(false); };
      if (stage) stage.addEventListener("pointerdown", this._mdown);
      window.addEventListener("pointerup", this._mup);
      window.addEventListener("pointercancel", this._mup);
    },
    _unbindButtons: function () {
      var pull = document.getElementById("btn-pull"); if (pull && this._pull) pull.removeEventListener("click", this._pull);
      var spray = document.getElementById("btn-spray");
      if (spray && this._sd) { spray.removeEventListener("pointerdown", this._sd); spray.removeEventListener("pointerup", this._su); spray.removeEventListener("pointerleave", this._su); spray.removeEventListener("pointercancel", this._su); }
      var fwd = document.getElementById("btn-fwd"), bk = document.getElementById("btn-back");
      if (fwd && this._fwd) fwd.removeEventListener("click", this._fwd); if (bk && this._bk) bk.removeEventListener("click", this._bk);
      if (this._kd) window.removeEventListener("keydown", this._kd); if (this._ku) window.removeEventListener("keyup", this._ku);
      var stage = document.getElementById("canvas-fire");
      if (stage && this._mdown) stage.removeEventListener("pointerdown", this._mdown);
      if (this._mup) { window.removeEventListener("pointerup", this._mup); window.removeEventListener("pointercancel", this._mup); }
    },

    _pullPin: function () {
      if (this.state.pinPulled) return;
      this.state.pinPulled = true; if (this.pin) this.pin.visible = false;
      var pull = document.getElementById("btn-pull"); if (pull) { pull.style.display = "none"; pull.classList.remove("pulse"); }
      var chip = document.getElementById("chip-pull"); if (chip) chip.classList.add("done");
      var spray = document.getElementById("btn-spray"); if (spray) spray.classList.add("pulse");
      if (this.app) this.app.speak("Pin pulled. Now aim at the base.");
    },
    _setSpray: function (on) {
      if (on && !this.state.pinPulled) { if (this.app) this.app.speak("Pull the pin first.", true); return; }
      if (on && this.state.agentLeft <= 0) return;
      this.state.spraying = on; if (this.app) this.app.noise(on);
      if (this.lever) this.lever.rotation.z = on ? -0.25 : 0;
      var chip = document.getElementById("chip-squeeze"); if (chip && on) chip.classList.add("done");
    },

    _onResize: function () {
      var c = document.getElementById("canvas-fire"); if (!c) return;
      var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight;
      this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false);
      if (this.sprayMat) this.sprayMat.uniforms.uScale.value = h * 0.5;
    },
    _aimSolve: function () {
      var fwd = this.aim.forward(); this._fwd3 = fwd;
      var Rp = this.camPos, fx = this.fireBase.x, fz = this.fireBase.z;
      var rx = Rp.x - fx, ry = Rp.y, rz = Rp.z - fz;
      var b = fwd.y, d = fwd.x * rx + fwd.y * ry + fwd.z * rz, eDot = ry, denom = 1 - b * b;
      var t = Math.abs(denom) < 1e-6 ? 0 : (b * eDot - d) / denom; if (t < 0) t = 0;
      var px = Rp.x + fwd.x * t, py = Rp.y + fwd.y * t, pz = Rp.z + fwd.z * t;
      return { horiz: Math.hypot(px - fx, pz - fz), aimY: py };
    },

    _loop: function (now) {
      if (!this.running) return; var self = this;
      this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      if (this.time0 === null) this.time0 = now;
      var dt = Math.min(0.05, (now - (this._prev || now)) / 1000); this._prev = now;
      this.ignited += dt;

      this.aim.apply();
      var a = this._aimSolve(), st = this.state;
      st.aimAtFire = a.horiz < 0.9 && a.aimY >= 0.3 && a.aimY <= 1.8;
      st.aimAtBase = a.horiz < 0.55 && a.aimY >= 0.58 && a.aimY <= 1.1;
      st.distance = this.camPos.distanceTo(this.fireBase);

      var yawRate = Math.abs(this.aim.yaw - this.lastYaw) / (dt || 0.016); this.lastYaw = this.aim.yaw;
      this.sweep = this.sweep * 0.85 + yawRate * 0.15; st.sweeping = this.sweep > 0.25;

      // apply extinguish or growth
      if (st.spraying && st.pinPulled && st.agentLeft > 0) {
        this.sprayFrames++; if (st.aimAtBase) this.baseFrames++;
        if (!this.easy) st.agentLeft = Logic.clamp(st.agentLeft - dt * 6, 0, 100);
        var rate = Logic.fire.extinguishRate(st);
        st.intensity = Logic.clamp(st.intensity - rate * 8 * dt, 0, 100);
        if (st.aimAtBase) { var ac = document.getElementById("chip-aim"); if (ac) ac.classList.add("done"); }
        if (st.sweeping) { var sc = document.getElementById("chip-sweep"); if (sc) sc.classList.add("done"); }
      }
      var grow = this.easy ? 0 : Logic.fire.growth(st);
      if (grow && st.intensity > 0) st.intensity = Logic.clamp(st.intensity + grow * dt, 0, 100);
      if (st.agentLeft <= 0 && st.spraying) this._setSpray(false);

      this._hint(Logic.fire.nextHint(st));
      this._meter("fire-fill", st.intensity); this._meter("agent-fill", st.agentLeft);
      this._updateFire(dt); this._updateEmbers(dt); this._updateSmoke(dt); this._updateSpray(dt);
      if (this.extinguisher) {
        if (st.spraying && st.pinPulled && st.agentLeft > 0) {
          this.extinguisher.position.x = 0.26 + (Math.random() - 0.5) * 0.008;
          this.extinguisher.position.y = -0.34 + (Math.random() - 0.5) * 0.008;
        } else { this.extinguisher.position.x = 0.26; this.extinguisher.position.y = -0.34; }
      }

      if (!this.won && st.intensity <= 0.5) {
        this.won = true; this.state.spraying = false; if (this.app) this.app.noise(false);
        var timeSec = (now - this.time0) / 1000, acc = this.sprayFrames > 0 ? this.baseFrames / this.sprayFrames : 1;
        this.running = false; var app = this.app;
        setTimeout(function () { FireGame._win({ timeSec: timeSec, aimAccuracy: acc, easy: self.easy }, app); }, 500);
      }
      this.renderer.render(this.scene, this.camera);
    },
    _win: function (res, app) {
      var stars = Logic.fire.rateStars(res), starEl = document.getElementById("fire-stars");
      if (starEl) { var str = "", f = "\u2605", em = "\u2606"; for (var i = 0; i < 3; i++) str += (i < stars ? f : em); starEl.textContent = str; }
      var t = document.getElementById("fire-time"); if (t) t.textContent = "Time: " + (Math.round(res.timeSec * 10) / 10) + "s";
      var earned = (stars >= 3 && app && app.badges) ? app.badges.earn("fire") : false;
      var note = document.getElementById("fire-badge-note"); if (note) note.style.display = earned ? "" : "none";
      if (app) { app.show("screen-fire-win"); app.speak(earned ? "Great job. You earned a champion badge." : "Great job. You put out the fire."); }
    },

    _updateFire: function (dt) {
      var att = this.fire.geometry.attributes, pos = att.position.array, col = att.color.array;
      var scale = Logic.clamp(this.state.intensity / 100, 0, 1), fb = this.fireBase, active = Math.floor(this.fireN * (0.12 + 0.88 * scale));
      for (var i = 0; i < this.fireN; i++) {
        if (i > active) { pos[i * 3 + 1] = -100; continue; }
        this.fL[i] += dt * (0.8 + Math.random() * 0.7); if (this.fL[i] > 1) this._seedFire(i, pos, col, false);
        var life = this.fL[i], h = this.fS[i * 3 + 1] * scale;
        pos[i * 3] = fb.x + this.fS[i * 3] * (1 - life * 0.5); pos[i * 3 + 1] = fb.y + life * h; pos[i * 3 + 2] = fb.z + this.fS[i * 3 + 2] * (1 - life * 0.5);
        col[i * 3] = 1; col[i * 3 + 1] = 0.32 + life * 0.5; col[i * 3 + 2] = life * 0.12;
      }
      att.position.needsUpdate = true; att.color.needsUpdate = true;
      this.fire.material.opacity = 0.3 + 0.65 * scale; this.fire.material.size = 0.1 + 0.1 * scale;
      if (this.fireLight) this.fireLight.intensity = (0.35 + 1.5 * scale) * (0.85 + Math.random() * 0.3);
    },
    _updateEmbers: function (dt) {
      var att = this.embers.geometry.attributes.position, pos = att.array, fb = this.fireBase, scale = Logic.clamp(this.state.intensity / 100, 0, 1);
      var active = Math.floor(this.emberN * scale);
      for (var e = 0; e < this.emberN; e++) {
        if (e > active) { pos[e * 3 + 1] = -100; continue; }
        this.eL[e] += dt * (0.5 + Math.random() * 0.4); if (this.eL[e] > 1) this._seedEmber(e, pos, false);
        var life = this.eL[e];
        pos[e * 3] = fb.x + this.eS[e * 3] + Math.sin(life * 8 + e) * 0.06; pos[e * 3 + 1] = fb.y + life * this.eS[e * 3 + 1]; pos[e * 3 + 2] = fb.z + this.eS[e * 3 + 2];
      }
      att.needsUpdate = true; this.embers.material.opacity = 0.8 * scale;
    },
    _updateSmoke: function (dt) {
      var att = this.smoke.geometry.attributes.position, pos = att.array, fb = this.fireBase, scale = Logic.clamp(this.state.intensity / 100, 0, 1);
      var thick = Logic.clamp(this.ignited / 8, 0, 1), active = Math.floor(this.smokeN * (0.1 + 0.9 * scale));
      for (var m = 0; m < this.smokeN; m++) {
        if (m > active) { pos[m * 3 + 1] = -100; continue; }
        this.sL[m] += dt * 0.32; if (this.sL[m] > 1) this._seedSmoke(m, pos, false);
        var life = this.sL[m];
        pos[m * 3] = fb.x + this.sS[m * 3] + Math.sin(life * 3 + m) * 0.18; pos[m * 3 + 1] = fb.y + 0.4 + life * this.sS[m * 3 + 1]; pos[m * 3 + 2] = fb.z + this.sS[m * 3 + 2];
      }
      att.needsUpdate = true; this.smoke.material.opacity = (0.06 + 0.32 * scale) * (0.5 + 0.5 * thick);
    },
    _updateSpray: function (dt) {
      var att = this.spray.geometry.attributes, pos = att.position.array, size = this.spSize, alpha = this.spAlpha, color = this.spColor, fb = this.fireBase;
      if (this.state.spraying && this.state.pinPulled && this.state.agentLeft > 0) {
        this.camera.updateMatrixWorld(true);
        var origin = this.hornTipObj.getWorldPosition(new THREE.Vector3()), fwd = this._fwd3 || new THREE.Vector3(0, 0, -1);
        var right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
        var upv = new THREE.Vector3().crossVectors(right, fwd).normalize();
        for (var k = 0; k < 20; k++) {
          var idx = this.sprayHead % this.sprayN; this.sprayHead++;
          this.spL[idx] = 1;
          var big = k < 5; // a few big soft puffs at the nozzle for a friendly poof
          var ang = Math.random() * Math.PI * 2, rad = (big ? 0.03 : 0.07) * Math.random(), ox = Math.cos(ang) * rad, oy = Math.sin(ang) * rad;
          pos[idx * 3] = origin.x + right.x * ox + upv.x * oy;
          pos[idx * 3 + 1] = origin.y + right.y * ox + upv.y * oy;
          pos[idx * 3 + 2] = origin.z + right.z * ox + upv.z * oy;
          var speed = (big ? 3.4 : 5.2) + Math.random() * 1.6, jl = 4.4;
          this.spV[idx * 3] = fwd.x * speed + right.x * ox * jl + (Math.random() - 0.5) * 0.5;
          this.spV[idx * 3 + 1] = fwd.y * speed + upv.y * oy * jl + (Math.random() - 0.5) * 0.5 - 0.3;
          this.spV[idx * 3 + 2] = fwd.z * speed + right.z * ox * jl + (Math.random() - 0.5) * 0.5;
          this.spMax[idx] = big ? 0.98 : 0.72;
          size[idx] = 0.05; alpha[idx] = 0;
          var bl = 0.82 + Math.random() * 0.18;
          color[idx * 3] = bl; color[idx * 3 + 1] = 0.9 + Math.random() * 0.1; color[idx * 3 + 2] = 1.0;
        }
      }
      var drag = Math.max(0, 1 - 2.5 * dt);
      for (var i = 0; i < this.sprayN; i++) {
        if (this.spL[i] <= 0) continue;
        this.spL[i] -= dt * 0.8;
        this.spV[i * 3] = this.spV[i * 3] * drag + (Math.random() - 0.5) * 1.5 * dt;
        this.spV[i * 3 + 1] = this.spV[i * 3 + 1] * drag + (Math.random() - 0.5) * 1.2 * dt + 0.18 * dt;
        this.spV[i * 3 + 2] = this.spV[i * 3 + 2] * drag + (Math.random() - 0.5) * 1.5 * dt;
        pos[i * 3] += this.spV[i * 3] * dt; pos[i * 3 + 1] += this.spV[i * 3 + 1] * dt; pos[i * 3 + 2] += this.spV[i * 3 + 2] * dt;
        if (pos[i * 3 + 1] < fb.y + 0.05) {
          pos[i * 3 + 1] = fb.y + 0.05;
          var dx = pos[i * 3] - fb.x, dz = pos[i * 3 + 2] - fb.z, dl = Math.hypot(dx, dz) || 1;
          this.spV[i * 3] += (dx / dl) * 2.4 * dt; this.spV[i * 3 + 2] += (dz / dl) * 2.4 * dt;
          if (this.spV[i * 3 + 1] < 0) this.spV[i * 3 + 1] = 0;
        }
        var age = 1 - Math.max(0, this.spL[i]);
        size[i] = 0.05 + age * this.spMax[i];
        var a = (age < 0.14 ? age / 0.14 : 1) * Math.max(0, this.spL[i]);
        alpha[i] = a * 0.9;
        if (this.spL[i] <= 0) { pos[i * 3 + 1] = -100; size[i] = 0; alpha[i] = 0; }
      }
      att.position.needsUpdate = true; att.aSize.needsUpdate = true; att.aAlpha.needsUpdate = true; att.aColor.needsUpdate = true;
    }
  };
  if (typeof window !== "undefined") window.FireGame = FireGame;

  /* =====================================================================
     5) GO BAG GAME  (3D: look around, tap items, pack into the bag)
     ===================================================================== */
  var GoBag = {
    running: false, _raf: null,
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this.app = app;
      var oldCanvas = document.getElementById("canvas-gobag");
      var canvas = oldCanvas.cloneNode(false);
      oldCanvas.parentNode.replaceChild(canvas, oldCanvas);
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x14304a);
      this.camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 100);
      this.camPos = new THREE.Vector3(0, 1.5, 1.4); this.camera.position.copy(this.camPos);
      this.raycaster = new THREE.Raycaster();

      var self = this;
      this.aim = new AimController(this.camera, this.camPos, canvas, {
        yaw: 0, pitch: -0.2, minPitch: -1.45, maxPitch: 0.25,
        onTap: function (x, y) { self._tap(x, y); }
      });

      // zoom (field of view): wheel, pinch, and the on-screen buttons
      this._fov = 65;
      this._wheel = function (e) { self.zoom(e.deltaY > 0 ? 1 : -1); if (e.cancelable) e.preventDefault(); };
      canvas.addEventListener("wheel", this._wheel, { passive: false });
      var pd = 0;
      function d2(e) { var a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
      this._ts = function (e) { if (e.touches.length === 2) { self.aim._suspend = true; pd = d2(e); } };
      this._tm = function (e) { if (e.touches.length === 2) { self.aim._suspend = true; var d = d2(e); if (pd > 0 && d > 0) { self._fov = Logic.clamp(self._fov * (pd / d), 36, 80); self.camera.fov = self._fov; self.camera.updateProjectionMatrix(); } pd = d; if (e.cancelable) e.preventDefault(); } };
      this._te = function (e) { if (e.touches.length < 2) { self.aim._suspend = false; pd = 0; } };
      canvas.addEventListener("touchstart", this._ts, { passive: false });
      canvas.addEventListener("touchmove", this._tm, { passive: false });
      canvas.addEventListener("touchend", this._te);
      var zin = document.getElementById("btn-gobag-zin"), zout = document.getElementById("btn-gobag-zout");
      this._zin = function () { self.zoom(-1); }; this._zout = function () { self.zoom(1); };
      if (zin) zin.addEventListener("click", this._zin); if (zout) zout.addEventListener("click", this._zout);
      var tv = document.getElementById("btn-topview");
      this._tv = function () { self.aim.pitch = (self.aim.pitch < -0.9) ? -0.2 : -1.4; };
      if (tv) tv.addEventListener("click", this._tv);

      this.mode = this.mode || "table"; this.furniture = []; this.containers = []; this._openables = [];
      this._buildRoom(); this._buildBag();
      if (this.mode === "pile") this._buildItemsPile();
      else if (this.mode === "room") this._buildItemsRoom();
      else this._buildItems();
      this.packed = []; this._anim = [];
      if (this.mode === "pile") this.aim.pitch = -0.55;
      else if (this.mode === "room") this.aim.pitch = -0.05;
      this._updateCap();
      this._hint("Tap an item to learn about it.");
      this._stick = { x: 0, y: 0 }; this._setupStick();
      this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize); this._onResize();
      this.running = true; this._loop(performance.now());
    },
    _setupStick: function () {
      var base = document.getElementById("gobag-stick"), knob = document.getElementById("gobag-stick-knob");
      if (!base) return;
      var show = this.mode === "room"; base.style.display = show ? "block" : "none";
      if (!show) return;
      var self = this, active = false, cx = 0, cy = 0, R = 44;
      function set(dx, dy) { var m = Math.hypot(dx, dy); if (m > R) { dx = dx / m * R; dy = dy / m * R; } self._stick.x = dx / R; self._stick.y = dy / R; if (knob) knob.style.transform = "translate(" + dx + "px," + dy + "px)"; }
      this._stickDown = function (e) { active = true; var r = base.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; var p = e.touches ? e.touches[0] : e; set(p.clientX - cx, p.clientY - cy); if (e.cancelable) e.preventDefault(); };
      this._stickMove = function (e) { if (!active) return; var p = e.touches ? e.touches[0] : e; set(p.clientX - cx, p.clientY - cy); if (e.cancelable) e.preventDefault(); };
      this._stickUp = function () { active = false; self._stick.x = 0; self._stick.y = 0; if (knob) knob.style.transform = "translate(0px,0px)"; };
      base.addEventListener("pointerdown", this._stickDown);
      window.addEventListener("pointermove", this._stickMove, { passive: false });
      window.addEventListener("pointerup", this._stickUp);
      base.addEventListener("touchstart", this._stickDown, { passive: false });
      window.addEventListener("touchmove", this._stickMove, { passive: false });
      window.addEventListener("touchend", this._stickUp);
    },
    stop: function () {
      this.running = false; if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      if (this.aim) this.aim.destroy(); if (this._resize) window.removeEventListener("resize", this._resize);
      var c = document.getElementById("canvas-gobag");
      if (c) { if (this._wheel) c.removeEventListener("wheel", this._wheel); if (this._ts) c.removeEventListener("touchstart", this._ts); if (this._tm) c.removeEventListener("touchmove", this._tm); if (this._te) c.removeEventListener("touchend", this._te); }
      var tv = document.getElementById("btn-topview"); if (tv && this._tv) tv.removeEventListener("click", this._tv);
      var zin = document.getElementById("btn-gobag-zin"); if (zin && this._zin) zin.removeEventListener("click", this._zin);
      var zout = document.getElementById("btn-gobag-zout"); if (zout && this._zout) zout.removeEventListener("click", this._zout);
      var stk = document.getElementById("gobag-stick");
      if (stk && this._stickDown) { stk.removeEventListener("pointerdown", this._stickDown); stk.removeEventListener("touchstart", this._stickDown); }
      if (this._stickMove) { window.removeEventListener("pointermove", this._stickMove); window.removeEventListener("touchmove", this._stickMove); }
      if (this._stickUp) { window.removeEventListener("pointerup", this._stickUp); window.removeEventListener("touchend", this._stickUp); }
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },
    zoom: function (dir) { this._fov = Logic.clamp((this._fov || 65) + dir * 7, 36, 80); if (this.camera) { this.camera.fov = this._fov; this.camera.updateProjectionMatrix(); } },
    _hint: function (t) { var h = document.getElementById("hint-gobag"); if (h) { h.style.display = this.app.settings.hints ? "" : "none"; h.textContent = t; } },

    _buildRoom: function () {
      var s = this.scene;
      if (this.mode === "pile") { this._buildLivingRoom(); return; }
      if (this.mode === "room") { this._buildKitchenShell(); return; }
      s.add(new THREE.HemisphereLight(0xf0f4f8, 0x40484f, 1.0));
      var dir = new THREE.DirectionalLight(0xffffff, 0.4); dir.position.set(2, 6, 3); s.add(dir);
      var floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshStandardMaterial({ color: 0x9a8f7d })); floor.rotation.x = -Math.PI / 2; s.add(floor);
      var wall = new THREE.MeshStandardMaterial({ color: 0xd8cfc0 });
      var back = new THREE.Mesh(new THREE.PlaneGeometry(24, 8), wall); back.position.set(0, 4, -6); s.add(back);
      this.tableTop = 0.82;
      var table = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.12, 1.9), new THREE.MeshStandardMaterial({ color: 0xc79a63 }));
      table.position.set(0, this.tableTop, -2.7); s.add(table);
      var lm = new THREE.MeshStandardMaterial({ color: 0x8a6a45 });
      [[-2.4, -1.95], [2.4, -1.95], [-2.4, -3.45], [2.4, -3.45]].forEach(function (o) { var leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.82, 0.12), lm); leg.position.set(o[0], 0.41, o[1]); s.add(leg); });
    },
    _light: function (warm) {
      var s = this.scene;
      s.add(new THREE.HemisphereLight(warm ? 0xfff2df : 0xeaf3f8, 0x3b3a37, 1.0));
      var dir = new THREE.DirectionalLight(0xffffff, 0.5); dir.position.set(3, 7, 4); s.add(dir);
    },
    _mk: function (geo, color, x, y, z, ry) { var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 })); m.position.set(x || 0, y || 0, z || 0); if (ry) m.rotation.y = ry; this.scene.add(m); return m; },
    _win: function (x, y, z, w, h, ry) {
      var frame = this._mk(new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.1), 0xf3efe6, x, y, z, ry);
      var glass = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), new THREE.MeshStandardMaterial({ color: 0xbfe3f7, emissive: 0x8ec6ec, emissiveIntensity: 0.55 }));
      glass.position.set(x, y, z + 0.04); if (ry) { glass.rotation.y = ry; glass.position.set(x + Math.sin(ry) * 0.04, y, z); } this.scene.add(glass);
      this._mk(new THREE.BoxGeometry(w, 0.05, 0.05), 0xf3efe6, x, y, z + 0.05, ry);
      this._mk(new THREE.BoxGeometry(0.05, h, 0.05), 0xf3efe6, x, y, z + 0.05, ry);
    },

    _buildLivingRoom: function () {
      var s = this.scene; this._light(true);
      this._mk(new THREE.PlaneGeometry(24, 24), 0xcaa877, 0, 0, 0).rotation.x = -Math.PI / 2;
      // warm walls
      var back = this._mk(new THREE.PlaneGeometry(24, 8), 0x9cc0bf, 0, 4, -6);
      var left = this._mk(new THREE.PlaneGeometry(16, 8), 0x8fb6b5, -7, 4, 0, Math.PI / 2);
      var right = this._mk(new THREE.PlaneGeometry(16, 8), 0x8fb6b5, 7, 4, 0, -Math.PI / 2);
      // wainscot + baseboards
      this._mk(new THREE.BoxGeometry(14, 1.0, 0.06), 0xe7efe9, 0, 0.5, -5.95);
      this._mk(new THREE.BoxGeometry(14, 0.18, 0.08), 0x6a4f36, 0, 0.09, -5.9);
      // rug is added by the pile builder. Add a sofa on the left, facing the pile
      var sofa = new THREE.Group();
      sofa.add(this._boxAt(2.2, 0.5, 0.95, 0x3f6f8a, 0, 0.32, 0));
      sofa.add(this._boxAt(2.2, 0.6, 0.22, 0x35617a, 0, 0.62, -0.36));
      sofa.add(this._boxAt(0.26, 0.6, 0.95, 0x35617a, -1.0, 0.5, 0));
      sofa.add(this._boxAt(0.26, 0.6, 0.95, 0x35617a, 1.0, 0.5, 0));
      sofa.add(this._boxAt(0.9, 0.16, 0.9, 0xdfe6ea, -0.5, 0.44, 0.02));
      sofa.add(this._boxAt(0.9, 0.16, 0.9, 0xdfe6ea, 0.5, 0.44, 0.02));
      sofa.position.set(-3.6, 0, -1.4); sofa.rotation.y = Math.PI / 2; s.add(sofa);
      // TV on a console against the back wall
      this._mk(new THREE.BoxGeometry(2.4, 0.5, 0.5, 1), 0x6a4a2f, 0, 0.25, -5.6);
      var tv = this._mk(new THREE.BoxGeometry(2.0, 1.1, 0.08), 0x14161b, 0, 1.25, -5.7);
      this._mk(new THREE.BoxGeometry(1.8, 0.94, 0.02), 0x2a4a66, 0, 1.25, -5.64).material.emissive = new THREE.Color(0x1a3450);
      // framed pictures
      this._mk(new THREE.BoxGeometry(0.9, 0.66, 0.04), 0x8a6a45, -2.3, 2.2, -5.95);
      this._mk(new THREE.BoxGeometry(0.74, 0.5, 0.02), 0xf2d9a8, -2.3, 2.2, -5.92);
      this._mk(new THREE.BoxGeometry(0.66, 0.9, 0.04), 0x8a6a45, 2.3, 2.1, -5.95);
      this._mk(new THREE.BoxGeometry(0.5, 0.74, 0.02), 0xa9d3c9, 2.3, 2.1, -5.92);
      // window with sky on the right wall
      this._win(6.95, 2.2, -2.2, 1.8, 1.5, -Math.PI / 2);
      // floor lamp by the sofa
      this._mk(new THREE.CylinderGeometry(0.04, 0.05, 1.6, 10), 0x8a9096, -2.4, 0.8, -0.4);
      this._mk(new THREE.ConeGeometry(0.34, 0.4, 16), 0xffe6b0, -2.4, 1.75, -0.4).material.emissive = new THREE.Color(0xffcf87);
      // potted plant in the corner
      this._mk(new THREE.CylinderGeometry(0.24, 0.3, 0.44, 12), 0xb7623a, 3.2, 0.22, -2.4);
      this._mk(new THREE.SphereGeometry(0.5, 12, 10), 0x2f8a45, 3.2, 0.85, -2.4);
      this._mk(new THREE.SphereGeometry(0.34, 10, 8), 0x38a052, 3.5, 1.1, -2.2);
      // coffee table pushed to the side
      this._mk(new THREE.BoxGeometry(1.2, 0.08, 0.7), 0xb98a52, 2.6, 0.42, -0.6);
    },
    _boxAt: function (w, h, d, color, x, y, z) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 })); m.position.set(x, y, z); return m; },
    _buildKitchenShell: function () {
      var s = this.scene; this._light(false);
      this._mk(new THREE.PlaneGeometry(24, 24), 0xdad3c5, 0, 0, 0).rotation.x = -Math.PI / 2;
      for (var gx = -5; gx <= 5; gx++) for (var gz = -5; gz <= 4; gz++) { if ((gx + gz) % 2 === 0) continue; var t = this._mk(new THREE.PlaneGeometry(0.98, 0.98), 0xc6beac, gx, 0.006, gz); t.rotation.x = -Math.PI / 2; }
      this._mk(new THREE.PlaneGeometry(24, 8), 0xeef0ec, 0, 4, -6);
      this._mk(new THREE.PlaneGeometry(16, 8), 0xe7e9e5, -7, 4, 0, Math.PI / 2);
      this._mk(new THREE.PlaneGeometry(16, 8), 0xe7e9e5, 7, 4, 0, -Math.PI / 2);
      // tiled backsplash strip behind the counter
      this._mk(new THREE.BoxGeometry(9, 0.8, 0.04), 0xcfe3ee, -0.7, 1.35, -5.94);
      // window above the sink with a bright outside
      this._win(0.4, 1.95, -5.9, 1.7, 1.1, 0);
      // a hanging light over the middle of the room
      this._mk(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8), 0x8a9096, 0, 3.1, -2.5);
      this._mk(new THREE.ConeGeometry(0.32, 0.3, 18), 0xfff0cf, 0, 2.75, -2.5).material.emissive = new THREE.Color(0xffe4a6);
    },
    _buildBag: function () {
      var g = new THREE.Group();
      var main = this._M(0xe86f24, 0.85), dark = this._M(0xc65a12, 0.85), strap = this._M(0x7c4212, 0.9), buck = this._M(0x2a2a2a, 0.5, 0.35);
      var body = this._box(0.62, 0.8, 0.42, main); body.position.y = 0.42; g.add(body);
      var lid = this._box(0.66, 0.24, 0.46, dark); lid.position.set(0, 0.74, 0); g.add(lid);
      var pocket = this._box(0.5, 0.38, 0.14, dark); pocket.position.set(0, 0.3, 0.24); g.add(pocket);
      var pflap = this._box(0.52, 0.1, 0.16, main); pflap.position.set(0, 0.5, 0.25); g.add(pflap);
      var handle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 8, 16, Math.PI), dark); handle.position.set(0, 0.86, 0); g.add(handle);
      var sL = this._box(0.07, 0.6, 0.05, strap); sL.position.set(-0.15, 0.45, -0.22); g.add(sL);
      var sR = this._box(0.07, 0.6, 0.05, strap); sR.position.set(0.15, 0.45, -0.22); g.add(sR);
      var t1 = this._box(0.54, 0.05, 0.02, strap); t1.position.set(0, 0.52, 0.22); g.add(t1);
      var t2 = this._box(0.54, 0.05, 0.02, strap); t2.position.set(0, 0.24, 0.32); g.add(t2);
      var bk1 = this._box(0.08, 0.06, 0.03, buck); bk1.position.set(0, 0.52, 0.235); g.add(bk1);
      var bk2 = this._box(0.08, 0.06, 0.03, buck); bk2.position.set(0, 0.24, 0.335); g.add(bk2);
      var zip = this._box(0.5, 0.014, 0.014, buck); zip.position.set(0, 0.62, 0.215); g.add(zip);
      g.position.set(-2.2, this.tableTop + 0.04, -2.55);
      this.scene.add(g); this.bag = g;
      this.bagTarget = new THREE.Vector3(-2.2, this.tableTop + 0.62, -2.55);
    },
    _M: function (c, r, m) { return new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? 0.6 : r, metalness: m || 0 }); },
    _EM: function (c, e, i) { return new THREE.MeshStandardMaterial({ color: c, emissive: e, emissiveIntensity: i == null ? 0.7 : i }); },
    _box: function (w, h, d, m) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); },
    _cyl: function (a, b, h, m, s) { return new THREE.Mesh(new THREE.CylinderGeometry(a, b, h, s || 18), m); },
    _sph: function (r, m) { return new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), m); },
    _cone: function (r, h, m) { return new THREE.Mesh(new THREE.ConeGeometry(r, h, 18), m); },
    _tor: function (r, t, m) { return new THREE.Mesh(new THREE.TorusGeometry(r, t, 10, 20), m); },

    // build a small recognizable 3D model per item, base sitting at y = 0
    _make: function (id) {
      var g = new THREE.Group(), self = this;
      function add(mesh, x, y, z, rx, ry, rz) { mesh.position.set(x || 0, y || 0, z || 0); if (rx) mesh.rotation.x = rx; if (ry) mesh.rotation.y = ry; if (rz) mesh.rotation.z = rz; g.add(mesh); return mesh; }
      var M = function (c, r, m) { return self._M(c, r, m); }, box = self._box.bind(self), cyl = self._cyl.bind(self), sph = self._sph.bind(self), cone = self._cone.bind(self), tor = self._tor.bind(self);
      var glass = function (c, o) { var m = self._M(c, 0.12, 0.05); m.transparent = true; m.opacity = o == null ? 0.55 : o; return m; };
      var PI = Math.PI, i, j;
      switch (id) {
        case "water":
          add(cyl(0.052, 0.062, 0.15, glass(0xa8ddf5, 0.5)), 0, 0.1);
          add(cyl(0.05, 0.058, 0.09, M(0x3aa0d8, 0.2, 0.15)), 0, 0.06);
          add(cyl(0.03, 0.052, 0.045, glass(0xa8ddf5, 0.5)), 0, 0.19);
          add(cyl(0.026, 0.026, 0.05, M(0x2a6fb0)), 0, 0.225);
          add(cyl(0.03, 0.03, 0.035, M(0x1f5f95)), 0, 0.255);
          add(cyl(0.063, 0.063, 0.045, M(0xf4f7f9, 0.8)), 0, 0.09); break;
        case "food":
          add(cyl(0.07, 0.07, 0.13, M(0xb8bcc0, 0.3, 0.75)), 0, 0.065);
          add(cyl(0.072, 0.072, 0.09, M(0xcf3b3b, 0.6)), 0, 0.062);
          add(cyl(0.073, 0.073, 0.018, M(0xf0e2c0, 0.6)), 0, 0.062);
          add(tor(0.069, 0.007, M(0x9aa0a5, 0.3, 0.8)), 0, 0.128, 0, PI / 2);
          add(tor(0.069, 0.007, M(0x9aa0a5, 0.3, 0.8)), 0, 0.004, 0, PI / 2); break;
        case "flashlight":
          add(cyl(0.033, 0.036, 0.17, M(0x222528, 0.5)), 0, 0.085);
          add(cyl(0.04, 0.04, 0.02, M(0x111214)), 0, 0.02);
          add(cyl(0.055, 0.04, 0.05, M(0x4a4f54, 0.4, 0.6)), 0, 0.195);
          add(cyl(0.05, 0.05, 0.012, M(0xbfc4c8, 0.3, 0.9)), 0, 0.222);
          add(cyl(0.044, 0.044, 0.01, self._EM(0xfff6c0, 0xffe066, 1.0)), 0, 0.227);
          add(box(0.02, 0.03, 0.012, M(0xd23b3b)), 0, 0.11, 0.036);
          add(tor(0.037, 0.006, M(0x111)), 0, 0.13, 0, PI / 2); break;
        case "batteries":
          add(cyl(0.02, 0.02, 0.12, M(0x2aa84a, 0.5)), -0.026, 0.06);
          add(cyl(0.02, 0.02, 0.12, M(0x2aa84a, 0.5)), 0.026, 0.06);
          add(cyl(0.021, 0.021, 0.03, M(0x111)), -0.026, 0.02);
          add(cyl(0.021, 0.021, 0.03, M(0x111)), 0.026, 0.02);
          add(cyl(0.009, 0.009, 0.018, M(0xd4af37, 0.3, 0.8)), -0.026, 0.129);
          add(cyl(0.009, 0.009, 0.018, M(0xd4af37, 0.3, 0.8)), 0.026, 0.129); break;
        case "firstaid":
          add(box(0.2, 0.13, 0.13, M(0xf0f0f0, 0.6)), 0, 0.065);
          add(box(0.2, 0.035, 0.13, M(0xd23b3b, 0.6)), 0, 0.13);
          add(box(0.062, 0.016, 0.02, M(0xffffff)), 0, 0.15);
          add(box(0.02, 0.016, 0.062, M(0xffffff)), 0, 0.15);
          add(box(0.05, 0.02, 0.006, M(0xc0c4c8, 0.4, 0.6)), 0, 0.07, 0.067);
          add(box(0.07, 0.02, 0.025, M(0x333)), 0, 0.15, 0, 0, 0, 0); break;
        case "whistle":
          add(box(0.09, 0.05, 0.05, M(0xd94444, 0.5)), 0, 0.03);
          add(box(0.05, 0.036, 0.05, M(0xd94444, 0.5)), 0.06, 0.03);
          add(cyl(0.02, 0.02, 0.05, M(0xb03636)), 0.005, 0.058, 0, 0, 0, PI / 2);
          add(tor(0.014, 0.005, M(0x888c90, 0.3, 0.7)), -0.052, 0.05, 0, PI / 2); break;
        case "radio":
          add(box(0.16, 0.12, 0.06, M(0x2b2f33, 0.6)), 0, 0.06);
          add(box(0.075, 0.09, 0.006, M(0x14161a)), -0.035, 0.065, 0.031);
          for (i = -1; i <= 1; i++) for (j = -1; j <= 1; j++) add(cyl(0.006, 0.006, 0.006, M(0x050505)), -0.035 + i * 0.02, 0.065 + j * 0.024, 0.033, PI / 2);
          add(box(0.05, 0.022, 0.006, self._EM(0x1aae63, 0x0a5a30, 0.6)), 0.04, 0.095, 0.031);
          add(cyl(0.014, 0.014, 0.012, M(0xd0d3d6, 0.4, 0.6)), 0.03, 0.04, 0.031, 0, 0, PI / 2);
          add(cyl(0.014, 0.014, 0.012, M(0xd0d3d6, 0.4, 0.6)), 0.065, 0.04, 0.031, 0, 0, PI / 2);
          add(cyl(0.004, 0.004, 0.17, M(0x9aa0a5, 0.3, 0.7)), 0.07, 0.19, 0, 0, 0, -0.28);
          add(sph(0.008, M(0x9aa0a5)), 0.115, 0.27); break;
        case "powerbank":
          add(box(0.14, 0.04, 0.075, M(0x1c1c22, 0.5)), 0, 0.05);
          add(box(0.14, 0.008, 0.075, M(0x2a2a32)), 0, 0.074);
          add(box(0.02, 0.008, 0.012, M(0x111)), -0.05, 0.05, 0.04);
          add(box(0.01, 0.005, 0.006, self._EM(0x3ee39b, 0x1aa46a, 0.9)), 0.03, 0.074, 0.02);
          add(box(0.01, 0.005, 0.006, self._EM(0x3ee39b, 0x1aa46a, 0.9)), 0.045, 0.074, 0.02); break;
        case "documents":
          add(box(0.15, 0.02, 0.11, M(0xe8b34a, 0.7)), 0, 0.02);
          add(box(0.14, 0.012, 0.1, M(0xffffff)), 0.006, 0.04, 0.004, 0, -0.03);
          add(box(0.14, 0.012, 0.1, M(0xf3f3ee)), -0.004, 0.055, -0.004, 0, 0.04);
          add(box(0.05, 0.01, 0.032, M(0x9aa7b0)), 0.03, 0.066, 0.02, 0, 0.04);
          add(box(0.018, 0.006, 0.02, M(0x3f6fb0)), 0.018, 0.072, 0.02, 0, 0.04); break;
        case "meds":
          add(cyl(0.045, 0.05, 0.1, M(0xc98a3a, 0.35)), 0, 0.055);
          add(cyl(0.052, 0.052, 0.028, M(0xffffff)), 0, 0.12);
          add(box(0.06, 0.055, 0.002, M(0xffffff)), 0, 0.055, 0.05);
          add(box(0.03, 0.008, 0.001, M(0xd23b3b)), 0, 0.065, 0.051); break;
        case "mask":
          var mshell = sph(0.09, M(0xeef4f8, 0.7)); mshell.scale.set(1, 0.6, 0.5); add(mshell, 0, 0.075);
          add(box(0.16, 0.004, 0.02, M(0xdbe6ee)), 0, 0.088, -0.006);
          add(box(0.16, 0.004, 0.02, M(0xdbe6ee)), 0, 0.075, -0.008);
          add(box(0.16, 0.004, 0.02, M(0xdbe6ee)), 0, 0.062, -0.006);
          add(cyl(0.02, 0.008, 0.006, M(0xb0b8be)), 0, 0.105, 0.028);
          add(tor(0.05, 0.005, M(0xcfd8de)), 0.088, 0.075, 0, 0, PI / 2);
          add(tor(0.05, 0.005, M(0xcfd8de)), -0.088, 0.075, 0, 0, PI / 2); break;
        case "cash":
          add(box(0.16, 0.008, 0.075, M(0x3a9d5a, 0.7)), 0, 0.02);
          add(box(0.16, 0.008, 0.075, M(0x41a866, 0.7)), 0.004, 0.03, 0.003);
          add(box(0.16, 0.008, 0.075, M(0x3a9d5a, 0.7)), -0.003, 0.04, -0.003);
          add(box(0.02, 0.03, 0.078, M(0xe8b84a)), 0, 0.03);
          add(cyl(0.03, 0.03, 0.01, M(0xd4af37, 0.3, 0.8)), 0.095, 0.01, 0.03, 0, 0, PI / 2); break;
        case "clothes":
          add(box(0.16, 0.05, 0.12, M(0x4f8fd0, 0.9)), 0, 0.03);
          add(box(0.14, 0.04, 0.1, M(0x5a9bd8, 0.9)), 0.006, 0.07);
          add(box(0.16, 0.008, 0.12, M(0x3d78b8, 0.9)), 0, 0.056);
          add(box(0.04, 0.05, 0.12, M(0x4f8fd0, 0.9)), -0.062, 0.05); break;
        case "toy":
          add(sph(0.075, M(0x9a6a34, 0.9)), 0, 0.085);
          add(sph(0.05, M(0x9a6a34, 0.9)), 0, 0.185);
          add(sph(0.02, M(0x8a5a2b)), -0.038, 0.225); add(sph(0.02, M(0x8a5a2b)), 0.038, 0.225);
          add(sph(0.026, M(0xd7b183)), 0, 0.17, 0.042);
          add(sph(0.008, M(0x2b1d10)), -0.02, 0.2, 0.045); add(sph(0.008, M(0x2b1d10)), 0.02, 0.2, 0.045);
          add(sph(0.009, M(0x2b1d10)), 0, 0.165, 0.062);
          add(sph(0.026, M(0x8a5a2b)), -0.072, 0.095, 0.02); add(sph(0.026, M(0x8a5a2b)), 0.072, 0.095, 0.02);
          add(sph(0.03, M(0x8a5a2b)), -0.04, 0.03, 0.03); add(sph(0.03, M(0x8a5a2b)), 0.04, 0.03, 0.03); break;
        case "contacts":
          add(box(0.11, 0.02, 0.15, M(0x3f6fb0, 0.7)), 0, 0.02);
          add(box(0.1, 0.016, 0.14, M(0xffffff)), 0, 0.036);
          for (i = -1; i <= 1; i++) add(box(0.07, 0.002, 0.003, M(0xbcc4cc)), 0.005, 0.045, i * 0.028);
          add(cyl(0.004, 0.004, 0.15, M(0x9aa0a5, 0.3, 0.7)), -0.05, 0.03, 0, PI / 2); break;
        case "console":
          add(box(0.19, 0.045, 0.09, M(0x2a2a30, 0.5)), 0, 0.045);
          add(box(0.06, 0.03, 0.06, self._EM(0x24384a, 0x0a1a2a, 0.4)), 0, 0.05, 0);
          add(sph(0.016, M(0x151519)), -0.06, 0.075); add(sph(0.016, M(0x151519)), 0.06, 0.075);
          add(box(0.01, 0.006, 0.03, M(0x151519)), -0.085, 0.072); add(box(0.03, 0.006, 0.01, M(0x151519)), -0.085, 0.072);
          add(sph(0.008, M(0xd23b3b)), 0.09, 0.072, 0.01); add(sph(0.008, M(0x2e7d32)), 0.075, 0.072, 0.02); break;
        case "soda":
          add(cyl(0.058, 0.058, 0.13, M(0xcf2030, 0.3, 0.5)), 0, 0.065);
          add(cyl(0.06, 0.06, 0.05, M(0xf4f4f4, 0.5)), 0, 0.07);
          add(cyl(0.056, 0.058, 0.02, M(0xd7d7d7, 0.3, 0.8)), 0, 0.009);
          add(cyl(0.05, 0.056, 0.02, M(0xd7d7d7, 0.3, 0.8)), 0, 0.132);
          add(box(0.024, 0.006, 0.02, M(0x9a9a9a, 0.3, 0.8)), 0, 0.142, 0.015); break;
        case "icecream":
          add(cone(0.05, 0.13, M(0xd8a86a, 0.9)), 0, 0.07, 0, PI);
          add(sph(0.058, M(0xff9ec1)), 0, 0.15);
          add(sph(0.045, M(0xfff0b0)), 0.035, 0.17);
          add(sph(0.018, M(0xd21f3c)), 0, 0.205);
          add(cyl(0.003, 0.003, 0.03, M(0x5a3a1a)), 0, 0.225); break;
        case "tv":
          add(box(0.24, 0.15, 0.028, M(0x14161b, 0.5)), 0, 0.13);
          add(box(0.2, 0.12, 0.006, self._EM(0x2a4a66, 0x0a1a2a, 0.5)), 0, 0.13, 0.017);
          add(box(0.11, 0.02, 0.05, M(0x2a2a30)), 0, 0.02);
          add(box(0.02, 0.05, 0.03, M(0x2a2a30)), 0, 0.05); break;
        case "bricks":
          add(box(0.18, 0.06, 0.09, M(0xa6522d, 0.95)), 0, 0.03);
          add(box(0.18, 0.06, 0.09, M(0x9c4a27, 0.95)), 0.025, 0.09);
          add(box(0.18, 0.008, 0.092, M(0xcbb89a)), 0, 0.061);
          add(box(0.18, 0.008, 0.092, M(0xcbb89a)), 0.025, 0.121); break;
        case "books":
          add(box(0.17, 0.035, 0.12, M(0xc0392b, 0.85)), 0, 0.02, 0, 0, 0.04);
          add(box(0.15, 0.03, 0.1, M(0xf3f0e6)), 0.012, 0.02, 0, 0, 0.04);
          add(box(0.17, 0.035, 0.12, M(0x2e7d32, 0.85)), 0.006, 0.056, 0, 0, -0.05);
          add(box(0.17, 0.035, 0.12, M(0x2c4a8a, 0.85)), -0.004, 0.092, 0, 0, 0.03); break;
        case "hairdryer":
          add(cyl(0.045, 0.048, 0.13, M(0xe0679a, 0.6)), 0, 0.13, 0, 0, 0, PI / 2);
          add(cyl(0.05, 0.03, 0.03, M(0xcf4f86)), 0.085, 0.13, 0, 0, 0, PI / 2);
          add(cyl(0.046, 0.046, 0.012, M(0x333)), -0.075, 0.13, 0, 0, 0, PI / 2);
          add(box(0.045, 0.1, 0.045, M(0xe0679a, 0.6)), -0.02, 0.05);
          add(box(0.03, 0.014, 0.02, M(0x222)), -0.02, 0.09, 0.026); break;
        case "balloon":
          var bmat = M(0xe23a2b, 0.25, 0.05); bmat.transparent = true; bmat.opacity = 0.9;
          add(sph(0.085, bmat), 0, 0.18);
          add(cone(0.018, 0.03, M(0xc02a1e)), 0, 0.095, 0, PI);
          add(cyl(0.003, 0.003, 0.12, M(0x999)), 0, 0.06);
          add(sph(0.02, self._EM(0xffffff, 0xffffff, 0.15)), -0.03, 0.21, 0.05); break;
        case "beachball":
          add(sph(0.1, M(0xffffff, 0.5)), 0, 0.1);
          add(tor(0.1, 0.02, M(0xe23a2b)), 0, 0.1, 0, 0, 0, 0.5);
          add(tor(0.1, 0.02, M(0x2aa7d6)), 0, 0.1, 0, PI / 2, 0, 0.5);
          add(tor(0.1, 0.02, M(0xffd23d)), 0, 0.1, PI / 2, 0, 0, 0.5); break;
        default:
          add(box(0.12, 0.12, 0.12, M(0x9aa7b0)), 0, 0.06);
      }
      return g;
    },

    _buildItems: function () {
      this.tray = Logic.gobag.buildRound();
      this.tokens = [];
      var cols = 5, gapX = 0.82, gapZ = 0.6, x0 = -1.35, z0 = -2.1;
      for (var i = 0; i < this.tray.length; i++) {
        var item = this.tray[i], col = i % cols, row = Math.floor(i / cols);
        var px = x0 + col * gapX, pz = z0 - row * gapZ;
        var ped = this._cyl(0.17, 0.17, 0.012, this._M(0x586773, 0.85)); ped.position.set(px, this.tableTop + 0.006, pz); this.scene.add(ped);
        var g = this._make(item.id);
        g.position.set(px, this.tableTop + 0.012, pz);
        g.rotation.y = (Math.random() - 0.5) * 0.5;
        g.userData = { id: item.id, base: g.position.clone(), t: Math.random() * Math.PI * 2, ped: ped };
        (function (grp, id) { grp.traverse(function (o) { o.userData.id = id; }); })(g, item.id);
        this.scene.add(g); this.tokens.push(g);
      }
    },

    _onResize: function () { var c = document.getElementById("canvas-gobag"); if (!c) return; var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); },

    _buildItemsPile: function () {
      this.tray = Logic.gobag.buildRound(14, 8);
      this.tokens = [];
      var cx = 0, cz = -1.6, rad = 1.5, self = this, n = this.tray.length;
      // a rug and a low tarp rim so the heap reads as a real pile on the floor
      var mat = new THREE.Mesh(new THREE.CircleGeometry(rad + 0.45, 36), this._M(0x6b6152, 0.98)); mat.rotation.x = -Math.PI / 2; mat.position.set(cx, 0.012, cz); this.scene.add(mat);
      var rim = new THREE.Mesh(new THREE.TorusGeometry(rad + 0.42, 0.05, 8, 40), this._M(0x554d40, 0.95)); rim.rotation.x = Math.PI / 2; rim.position.set(cx, 0.05, cz); this.scene.add(rim);
      var base = Math.ceil(n * 0.62);
      for (var i = 0; i < n; i++) {
        var item = this.tray[i], topLayer = i >= base;
        var maxr = topLayer ? rad * 0.6 : rad;
        var ang = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * maxr;
        var px = cx + Math.cos(ang) * rr, pz = cz + Math.sin(ang) * rr;
        var py = topLayer ? 0.13 + Math.random() * 0.05 : 0.02;
        var g = this._make(item.id);
        g.position.set(px, py, pz);
        // keep items upright so they rest naturally, with only a small lean
        g.rotation.set((Math.random() - 0.5) * 0.5, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.5);
        g.userData = { id: item.id, base: g.position.clone(), t: Math.random() * Math.PI * 2, still: true };
        (function (grp, id) { grp.traverse(function (o) { o.userData.id = id; }); })(g, item.id);
        this.scene.add(g); this.tokens.push(g);
      }
      this._hint("Dig through the pile. Tap an item to look at it.");
    },

    _buildItemsRoom: function () {
      this.tray = Logic.gobag.buildRound();
      this.tokens = [];
      var s = this.scene;
      // base counter run along the back wall
      this._mk(new THREE.BoxGeometry(6.9, 0.9, 0.66), 0xbca17a, -0.8, 0.45, -5.55);
      this._mk(new THREE.BoxGeometry(7.1, 0.07, 0.72), 0x5c5148, -0.8, 0.93, -5.53);
      // upper cabinet shells
      this._mk(new THREE.BoxGeometry(2.0, 0.8, 0.4), 0xcbb392, -3.0, 2.0, -5.78);
      this._mk(new THREE.BoxGeometry(2.0, 0.8, 0.4), 0xcbb392, 1.4, 2.0, -5.78);
      // stove cooktop + hood, sink + faucet
      this._mk(new THREE.BoxGeometry(0.78, 0.06, 0.6), 0x2a2c2f, 1.7, 0.97, -5.5);
      var self = this;[[-0.18, -5.62], [0.18, -5.62], [-0.18, -5.38], [0.18, -5.38]].forEach(function (o) { self._mk(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 16), 0x14161a, 1.7 + o[0], 1.0, o[1]); });
      this._mk(new THREE.BoxGeometry(0.9, 0.4, 0.5), 0xd7dbde, 1.7, 2.05, -5.6);
      this._mk(new THREE.BoxGeometry(0.6, 0.08, 0.42), 0x9fb0bd, 0.4, 0.9, -5.5); // sink rim
      this._mk(new THREE.BoxGeometry(0.5, 0.02, 0.32), 0x6d7d8a, 0.4, 0.9, -5.5); // basin
      this._mk(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), 0xb9c0c6, 0.4, 1.05, -5.62);
      this._mk(new THREE.BoxGeometry(0.02, 0.02, 0.16, 1), 0xb9c0c6, 0.4, 1.19, -5.55);

      var defs = [
        { key: "drawers", x: -2.7, revealPos: [-2.7, 1.06, -4.95] },
        { key: "base", x: -0.9, revealPos: [-0.9, 1.06, -4.95] },
        { key: "oven", x: 1.7, revealPos: [1.7, 1.06, -4.95] },
        { key: "fridge", x: 3.7, revealPos: [3.7, 1.12, -4.6] },
        { key: "upper", x: -3.0, revealPos: [-3.0, 1.55, -4.9] }
      ];
      var buckets = [[], [], [], [], []];
      for (var i = 0; i < this.tray.length; i++) buckets[i % defs.length].push(this.tray[i]);

      for (var d = 0; d < defs.length; d++) {
        var def = defs[d], ops = [];
        if (def.key === "drawers") { ops.push(this._kDrawer(d, def.x, 0.35, -5.22, 1.0, 0.3)); ops.push(this._kDrawer(d, def.x, 0.68, -5.22, 1.0, 0.3)); }
        else if (def.key === "base") { ops.push(this._kDoor(d, def.x - 0.55, 0.45, -5.22, 0.52, 0.72, 0xcbb392, 1)); ops.push(this._kDoor(d, def.x + 0.55, 0.45, -5.22, 0.52, 0.72, 0xcbb392, -1)); }
        else if (def.key === "oven") { ops.push(this._kDoor(d, def.x - 0.42, 0.42, -5.22, 0.84, 0.66, 0x3a3d42, 1)); }
        else if (def.key === "fridge") { var body = this._mk(new THREE.BoxGeometry(1.0, 2.1, 0.7), 0xdfe3e6, def.x, 1.05, -5.5); body.userData.container = d; this.furniture.push(body); ops.push(this._kDoor(d, def.x - 0.5, 1.05, -5.13, 0.96, 1.9, 0xeef1f3, 1)); }
        else if (def.key === "upper") { ops.push(this._kDoor(d, def.x - 0.5, 2.0, -5.57, 0.98, 0.74, 0xcbb392, 1)); }
        this.containers.push({ def: def, openables: ops, items: this._stashItems(d, buckets[d], def), open: false });
      }
      // start the player a few steps back so they can walk up to the counters
      this._pos = new THREE.Vector3(0, 1.5, 2.6);
      this._hint("Walk with the joystick. Tap a cabinet, drawer, or the fridge to open it.");
    },
    _kDoor: function (idx, hingeX, cy, z, w, h, color, hingeSign) {
      var pivot = new THREE.Group(); pivot.position.set(hingeX, cy, z);
      pivot.add(this._boxAt(w, h, 0.05, color, hingeSign * (w / 2), 0, 0));
      pivot.add(this._boxAt(0.04, Math.min(0.22, h * 0.4), 0.04, 0x2b2b2b, hingeSign * (w - 0.09), 0, 0.05));
      this.scene.add(pivot);
      pivot.traverse(function (o) { if (o.isMesh) o.userData.container = idx; });
      this.furniture.push(pivot);
      var op = { kind: "door", pivot: pivot, closedVal: 0, openVal: hingeSign > 0 ? 1.2 : -1.2, target: 0 };
      this._openables.push(op); return op;
    },
    _kDrawer: function (idx, x, cy, zFront, w, h) {
      var grp = new THREE.Group();
      grp.add(this._boxAt(w, h, 0.06, 0xcbb392, x, cy, zFront));
      grp.add(this._boxAt(0.26, 0.05, 0.05, 0x2b2b2b, x, cy, zFront + 0.05));
      this.scene.add(grp);
      grp.traverse(function (o) { if (o.isMesh) o.userData.container = idx; });
      this.furniture.push(grp);
      var op = { kind: "drawer", mesh: grp, closedVal: 0, openVal: 0.42, target: 0 };
      this._openables.push(op); return op;
    },
    _stashItems: function (idx, items, def) {
      var toks = [];
      for (var k = 0; k < items.length; k++) {
        var g = this._make(items[k].id); g.visible = false; g.position.set(def.x, 0.5, -5.4);
        g.userData = { id: items[k].id, base: g.position.clone(), t: 0, still: true };
        (function (grp, id) { grp.traverse(function (o) { o.userData.id = id; }); })(g, items[k].id);
        this.scene.add(g); this.tokens.push(g); toks.push(g);
      }
      return toks;
    },
    _openContainer: function (idx) {
      var c = this.containers[idx]; if (!c) return;
      c.open = !c.open;
      for (var o = 0; o < c.openables.length; o++) c.openables[o].target = c.open ? c.openables[o].openVal : c.openables[o].closedVal;
      var n = c.items.length, rp = c.def.revealPos;
      for (var k = 0; k < n; k++) {
        var tk = c.items[k]; if (this.isPacked(tk.userData.id)) continue;
        tk.visible = c.open;
        if (c.open) { tk.position.set(rp[0] + (k - (n - 1) / 2) * 0.32, rp[1], rp[2]); tk.userData.base = tk.position.clone(); }
      }
      this._hint(c.open ? (n ? "You found " + n + " item" + (n === 1 ? "" : "s") + ". Tap one to look at it." : "This one is empty. Keep searching.") : "Closed it up.");
    },

    _tapDummy: function () {},

    _tap: function (clientX, clientY) {
      var c = document.getElementById("canvas-gobag"); if (!c) return;
      var r = c.getBoundingClientRect();
      var nd = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(nd, this.camera);
      var vis = this.tokens.filter(function (t) { return t.visible; });
      if (this.mode === "room" && this.furniture && this.furniture.length) {
        var fh = this.raycaster.intersectObjects(this.furniture, true);
        var ih = this.raycaster.intersectObjects(vis, true);
        var fd = fh.length ? fh[0].distance : Infinity, idd = ih.length ? ih[0].distance : Infinity;
        if (idd <= fd && ih.length) { var iid = ih[0].object.userData.id; if (iid) this.openInfo(iid); return; }
        if (fh.length) { var ci = fh[0].object.userData.container; if (ci !== undefined && ci !== null) this._openContainer(ci); return; }
        return;
      }
      var hits = this.raycaster.intersectObjects(vis, true);
      if (hits.length) { var id = hits[0].object.userData && hits[0].object.userData.id; if (id) this.openInfo(id); }
    },

    openInfo: function (id) {
      var it = Logic.gobag.byId(id); if (!it) return; this._infoId = id;
      document.getElementById("info-ic").textContent = it.icon;
      document.getElementById("info-name").textContent = it.name;
      document.getElementById("info-text").textContent = it.info;
      var packed = this.isPacked(id), pk = document.getElementById("btn-info-pack"), lv = document.getElementById("btn-info-leave");
      if (packed) { pk.textContent = "Take it out"; pk.className = "btn ghost"; lv.textContent = "Keep it"; }
      else { pk.textContent = "Pack it"; pk.className = "btn"; lv.textContent = "Leave it"; }
      this.app.openModal("modal-info");
      if (this.app.settings.hints) this.app.speak(it.name + ". " + it.info);
    },
    isPacked: function (id) { return this.packed.indexOf(id) !== -1; },
    confirmInfo: function () {
      var id = this._infoId; if (!id) return;
      if (this.isPacked(id)) this._unpack(id); else this._pack(id);
      this.app.closeModal("modal-info");
    },
    _pack: function (id) {
      if (this.isPacked(id)) return; this.packed.push(id);
      var tok = this._tokenById(id);
      if (tok) { tok.userData.flying = true; this._anim.push(tok); }
      var items = this.packed.map(function (x) { return Logic.gobag.byId(x); });
      if (Logic.gobag.isOverCapacity(items, Logic.gobag.CAPACITY)) this._hint("Your bag is getting heavy. Pick what matters most.");
      this._updateCap();
    },
    _unpack: function (id) {
      this.packed = this.packed.filter(function (x) { return x !== id; });
      var tok = this._tokenById(id);
      if (tok) { tok.visible = true; tok.userData.flying = false; tok.position.copy(tok.userData.base); tok.scale.set(1, 1, 1); }
      this._updateCap();
    },
    _tokenById: function (id) { for (var i = 0; i < this.tokens.length; i++) if (this.tokens[i].userData.id === id) return this.tokens[i]; return null; },
    _updateCap: function () {
      var items = this.packed.map(function (x) { return Logic.gobag.byId(x); }), w = Logic.gobag.bagWeight(items);
      var fill = document.getElementById("cap-fill");
      if (fill) { fill.style.width = Math.min(100, (w / Logic.gobag.CAPACITY) * 100) + "%"; fill.style.background = w > Logic.gobag.CAPACITY ? "linear-gradient(90deg,#f2760c,#e2382b)" : "linear-gradient(90deg,#3ee39b,#1aa46a)"; }
      var cnt = document.getElementById("bag-count"); if (cnt) cnt.textContent = this.packed.length + " item" + (this.packed.length === 1 ? "" : "s");
    },

    finish: function () {
      var res = Logic.gobag.scoreRound(this.tray, this.packed), stars = Logic.gobag.rateStars(res);
      var starEl = document.getElementById("gb-stars");
      if (starEl) { var str = "", f = "\u2605", em = "\u2606"; for (var i = 0; i < 3; i++) str += (i < stars ? f : em); starEl.textContent = str; }
      var earnedB = (stars >= 3 && this.app && this.app.badges) ? this.app.badges.earn("gobag") : false;
      var gbNote = document.getElementById("gb-badge-note"); if (gbNote) gbNote.style.display = earnedB ? "" : "none";
      document.getElementById("gb-line").textContent = "You packed " + res.packedGood + " of " + res.totalGood + " useful items" + (res.wrongPacks > 0 ? ", and " + res.wrongPacks + " that could stay home." : ".");
      var packed = this.packed, tray = this.tray;
      var missed = tray.filter(function (t) { return t.good && packed.indexOf(t.id) === -1; });
      var wrong = tray.filter(function (t) { return !t.good && packed.indexOf(t.id) !== -1; });
      var rv = document.getElementById("gb-review"); rv.innerHTML = "";
      if (missed.length) rv.appendChild(this._reviewBlock("Handy things you missed", missed, "miss"));
      if (wrong.length) rv.appendChild(this._reviewBlock("Better left at home", wrong, "warn"));
      if (!missed.length && !wrong.length) { var p = document.createElement("p"); p.className = "perfect"; p.textContent = "Perfect pack. You brought the essentials and left the extras behind."; rv.appendChild(p); }
      this.stop(); this.app.show("screen-gobag-result"); this.app.speak("Nice work. " + document.getElementById("gb-line").textContent);
    },
    _reviewBlock: function (title, items, kind) {
      var box = document.createElement("div"); box.className = "review " + kind;
      var h = document.createElement("h3"); h.textContent = title; box.appendChild(h);
      for (var i = 0; i < items.length; i++) {
        var row = document.createElement("div"); row.className = "rrow";
        row.innerHTML = '<span class="ic">' + items[i].icon + '</span><span><b>' + items[i].name + '</b><br><small>' + items[i].info + '</small></span>';
        box.appendChild(row);
      }
      return box;
    },

    _loop: function (now) {
      if (!this.running) return; var self = this;
      this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      var dt = Math.min(0.05, (now - (this._prev || now)) / 1000); this._prev = now;
      this.aim.apply();
      if (this.mode === "room") {
        // walk with the joystick, relative to where the player is looking
        if (this._stick && this._pos) {
          var yaw = this.aim.yaw, sp = 0.05;
          var fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
          var mvx = fx * (-this._stick.y) + rx * this._stick.x, mvz = fz * (-this._stick.y) + rz * this._stick.x;
          this._pos.x = Logic.clamp(this._pos.x + mvx * sp, -4.3, 4.3);
          this._pos.z = Logic.clamp(this._pos.z + mvz * sp, -4.0, 3.4);
        }
        this.camera.position.copy(this._pos);
      } else {
        var tt = this.mode === "table" ? Logic.clamp((-this.aim.pitch - 0.15) / 1.25, 0, 1) : 0;
        this.camera.position.set(0, 1.5 + tt * 3.4, this.camPos.z - tt * 1.2);
      }
      var thint = document.getElementById("tap-hint");
      if (thint) thint.textContent = this.mode === "room" ? "Move with the joystick. Tap a cabinet or drawer, then tap an item." : this.mode === "pile" ? "Tap an item in the pile to look at it." : (tt > 0.5 ? "Top view. Tap an item to pick it." : "Drag to look. Pinch or use plus and minus to zoom.");
      // open and close furniture smoothly
      if (this._openables) for (var oi = 0; oi < this._openables.length; oi++) {
        var op = this._openables[oi];
        if (op.kind === "door") op.pivot.rotation.y += (op.target - op.pivot.rotation.y) * 0.2;
        else { var dz = op.target - op.mesh.position.z; op.mesh.position.z += dz * 0.2; if (op.handle) op.handle.position.z += dz * 0.2; }
      }
      // idle bob + face the camera a touch
      for (var i = 0; i < this.tokens.length; i++) {
        var tk = this.tokens[i]; if (!tk.visible || tk.userData.flying || tk.userData.still) continue;
        tk.userData.t += dt; tk.position.y = tk.userData.base.y + Math.sin(tk.userData.t * 1.5) * 0.015;
      }
      // packing animation
      for (var a = this._anim.length - 1; a >= 0; a--) {
        var t2 = this._anim[a]; t2.position.lerp(this.bagTarget, Math.min(1, dt * 4));
        t2.scale.multiplyScalar(1 - dt * 2.2);
        if (t2.position.distanceTo(this.bagTarget) < 0.15 || t2.scale.x < 0.1) { t2.visible = false; this._anim.splice(a, 1); }
      }
      this.renderer.render(this.scene, this.camera);
    }
  };
  if (typeof window !== "undefined") window.GoBag = GoBag;

  /* =====================================================================
     5b) SAFE PATH  (3D tile puzzle: reach the evacuation area safely)
     ===================================================================== */
  var SafePath = {
    running: false, _raf: null, level: 0, SP: Logic.safepath,
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this.app = app;
      var oldCanvas = document.getElementById("canvas-safepath");
      var canvas = oldCanvas.cloneNode(false); oldCanvas.parentNode.replaceChild(canvas, oldCanvas);
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x0d1f2d);
      this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
      this.raycaster = new THREE.Raycaster();

      var rows = this.SP.LEVELS[this.level % this.SP.LEVELS.length];
      this.grid = this.SP.parse(rows);
      this.player = this.grid.start; this.steps = 0; this.hearts = 3; this.heartsLost = 0;
      this.phase = "move"; this.rolling = false;
      this.shortest = this.SP.bfs(this.grid, this.grid.start, this.grid.evac, false);
      this.center = new THREE.Vector3(0, 0, 0);
      this.orbitYaw = 0; this.orbitPitch = 0.98;
      this.radius = Math.max(this.grid.w, this.grid.h) * 0.95 + 3;
      this._minR = Math.max(this.grid.w, this.grid.h) * 0.5 + 2;
      this._maxR = Math.max(this.grid.w, this.grid.h) * 1.7 + 6;

      this.scene.add(new THREE.HemisphereLight(0xeaf2f8, 0x30363c, 1.0));
      var dir = new THREE.DirectionalLight(0xffffff, 0.5); dir.position.set(4, 8, 5); this.scene.add(dir);

      this._tiles = []; this._props = []; this._highlights = []; this._anim = null;
      this._buildBoard(); this._buildPlayer(); this._updateCamera();

      this._syncHud(); this._highlightMoves(); this._die("clear");
      this._toast("Tap a tile next to you to move. Stay away from the coast, trees, poles, and buildings.", "info", 4200);

      var self = this;
      this._bindInput(canvas);
      this._roll = function () { self._rollDie(); };
      var rb = document.getElementById("btn-sp-roll"); if (rb) rb.addEventListener("click", this._roll);
      this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize);
      this.running = true; this._loop(performance.now());
    },
    stop: function () {
      this.running = false; if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      if (this._resize) window.removeEventListener("resize", this._resize);
      if (this._unbind) this._unbind();
      var rb = document.getElementById("btn-sp-roll"); if (rb && this._roll) rb.removeEventListener("click", this._roll);
      if (this._dieTimer) { clearInterval(this._dieTimer); this._dieTimer = null; }
      if (this._routeT) { clearTimeout(this._routeT); this._routeT = null; }
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },

    _wpos: function (i) { var c = this.grid.cells[i]; return new THREE.Vector3(c.x - (this.grid.w - 1) / 2, 0, c.y - (this.grid.h - 1) / 2); },

    _buildBoard: function () {
      var s = this.scene, g = this.grid, SP = this.SP;
      var matGround = new THREE.MeshStandardMaterial({ color: 0x9ccc65 }),
          matRisk = new THREE.MeshStandardMaterial({ color: 0xbcd08a }),
          matWater = new THREE.MeshStandardMaterial({ color: 0x3d9bd6, roughness: 0.4 }),
          matEvac = new THREE.MeshStandardMaterial({ color: 0x49c96a, emissive: 0x1c7a3c, emissiveIntensity: 0.4 }),
          matStart = new THREE.MeshStandardMaterial({ color: 0xf2c14e });
      for (var i = 0; i < g.cells.length; i++) {
        var c = g.cells[i], p = this._wpos(i), tile;
        if (c.ch === "W") {
          tile = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.16, 0.98), matWater); tile.position.set(p.x, -0.06, p.z);
        } else {
          var risky = SP.isRisky(g, i);
          var m = c.ch === "E" ? matEvac : c.ch === "S" ? matStart : (risky ? matRisk : matGround);
          tile = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.2, 0.94), m); tile.position.set(p.x, 0, p.z);
          if (risky) { // small warning marker hovering over risky ground
            var warn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), new THREE.MeshStandardMaterial({ color: 0xf2760c, emissive: 0x7a3a00, emissiveIntensity: 0.5 }));
            warn.position.set(p.x, 0.34, p.z); warn.rotation.y = Math.PI / 4; s.add(warn); this._props.push(warn);
          }
        }
        tile.userData = { idx: i }; s.add(tile); this._tiles[i] = tile;
        if (c.source && c.ch !== "W") this._buildProp(c.ch, p);
        if (c.ch === "E") { this._buildEvac(p); this._addLabel("Evac", p); }
        if (c.ch === "S") this._addLabel("Start", p);
      }
      // ground base under the board
      var base = new THREE.Mesh(new THREE.BoxGeometry(g.w + 0.4, 0.1, g.h + 0.4), new THREE.MeshStandardMaterial({ color: 0x6b7d55 }));
      base.position.set(0, -0.16, 0); s.add(base);
    },
    _buildProp: function (ch, p) {
      var s = this.scene, grp = new THREE.Group();
      if (ch === "T") {
        grp.add(this._m(new THREE.CylinderGeometry(0.06, 0.08, 0.34, 8), 0x8a5a2b, 0, 0.27, 0));
        grp.add(this._m(new THREE.ConeGeometry(0.26, 0.42, 10), 0x2e7d32, 0, 0.58, 0));
        grp.add(this._m(new THREE.ConeGeometry(0.2, 0.34, 10), 0x349140, 0, 0.8, 0));
      } else if (ch === "B") {
        grp.add(this._m(new THREE.BoxGeometry(0.62, 0.6, 0.62), 0xcbb48f, 0, 0.4, 0));
        grp.add(this._m(new THREE.BoxGeometry(0.7, 0.12, 0.7), 0x8a6a45, 0, 0.76, 0));
        grp.add(this._m(new THREE.BoxGeometry(0.12, 0.16, 0.02), 0x5a7a9a, 0, 0.42, 0.32));
      } else if (ch === "P") {
        grp.add(this._m(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 8), 0x6a6f74, 0, 0.55, 0));
        grp.add(this._m(new THREE.BoxGeometry(0.44, 0.05, 0.05), 0x4a4f54, 0, 0.86, 0));
        grp.add(this._m(new THREE.BoxGeometry(0.05, 0.05, 0.44), 0x4a4f54, 0, 0.78, 0));
      }
      grp.position.set(p.x, 0.1, p.z); s.add(grp); this._props.push(grp);
    },
    _buildEvac: function (p) {
      var s = this.scene, grp = new THREE.Group();
      // simple tent
      grp.add(this._m(new THREE.ConeGeometry(0.4, 0.5, 4), 0x2e9c53, 0, 0.35, 0, Math.PI / 4));
      grp.add(this._m(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 6), 0xbfc7cd, 0.28, 0.45, -0.2));
      var flag = this._m(new THREE.BoxGeometry(0.22, 0.14, 0.01), 0xf2c14e, 0.4, 0.66, -0.2); grp.add(flag);
      grp.position.set(p.x, 0.12, p.z); s.add(grp); this._props.push(grp);
    },
    _m: function (geo, color, x, y, z, ry) { var mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color })); mesh.position.set(x || 0, y || 0, z || 0); if (ry) mesh.rotation.y = ry; return mesh; },
    _label: function (text) {
      var cv = document.createElement("canvas"); cv.width = 256; cv.height = 80;
      var x = cv.getContext("2d");
      x.fillStyle = "rgba(14,34,51,0.9)"; x.fillRect(8, 16, 240, 48);
      x.fillStyle = "#ffffff"; x.font = "bold 34px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText(text, 128, 42);
      var tex = new THREE.CanvasTexture(cv);
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
      sp.scale.set(1.5, 0.47, 1); return sp;
    },
    _addLabel: function (text, p) { var l = this._label(text); l.position.set(p.x, 1.5, p.z); this.scene.add(l); this._props.push(l); },

    _buildPlayer: function () {
      var g = new THREE.Group();
      g.add(this._m(new THREE.CylinderGeometry(0.14, 0.16, 0.34, 12), 0x2b6cb0, 0, 0.28, 0));
      g.add(this._m(new THREE.SphereGeometry(0.14, 14, 12), 0xffd7a8, 0, 0.54, 0));
      var cape = this._m(new THREE.BoxGeometry(0.28, 0.32, 0.03), 0xe23a2b, 0, 0.3, -0.12); g.add(cape);
      var p = this._wpos(this.player); g.position.set(p.x, 0.2, p.z);
      this.scene.add(g); this.token = g;
    },

    _highlightMoves: function () {
      var i; for (i = 0; i < this._highlights.length; i++) this.scene.remove(this._highlights[i]);
      this._highlights = [];
      if (this.phase !== "move") return;
      var ns = this.SP.neighbors4(this.grid, this.player);
      for (i = 0; i < ns.length; i++) {
        var p = this._wpos(ns[i]);
        var ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 8, 20), new THREE.MeshStandardMaterial({ color: 0x3ee39b, emissive: 0x1aa46a, emissiveIntensity: 0.6, transparent: true, opacity: 0.9 }));
        ring.rotation.x = Math.PI / 2; ring.position.set(p.x, 0.22, p.z); ring.userData = { idx: ns[i] };
        this.scene.add(ring); this._highlights.push(ring);
      }
    },

    _bindInput: function (canvas) {
      var self = this, dragging = false, moved = false, sx = 0, sy = 0, lx = 0, ly = 0, pd = 0;
      function pt(e) { if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY }; }
      function dist2(e) { var a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
      this._down = function (e) { if (e.touches && e.touches.length >= 2) return; dragging = true; moved = false; var p = pt(e); sx = lx = p.x; sy = ly = p.y; };
      this._move = function (e) {
        if (self._pinching || !dragging) return; var p = pt(e);
        if (Math.hypot(p.x - sx, p.y - sy) > 6) moved = true;
        self.orbitYaw -= (p.x - lx) * 0.006; self.orbitPitch = Logic.clamp(self.orbitPitch + (p.y - ly) * 0.005, 0.55, 1.35);
        lx = p.x; ly = p.y; if (e.cancelable) e.preventDefault();
      };
      this._up = function (e) { if (!dragging) return; dragging = false; if (!moved && !self._pinching) self._tap(pt(e)); };
      this._wheel = function (e) { self.radius = Logic.clamp(self.radius + (e.deltaY > 0 ? 1 : -1) * (self._maxR - self._minR) * 0.08, self._minR, self._maxR); if (e.cancelable) e.preventDefault(); };
      this._tstart = function (e) { if (e.touches.length === 2) { self._pinching = true; pd = dist2(e); } };
      this._tmove = function (e) { if (e.touches.length === 2) { self._pinching = true; var d = dist2(e); if (pd > 0 && d > 0) self.radius = Logic.clamp(self.radius * (pd / d), self._minR, self._maxR); pd = d; if (e.cancelable) e.preventDefault(); } };
      this._tend = function (e) { if (e.touches.length < 2) { self._pinching = false; pd = 0; } };
      canvas.addEventListener("pointerdown", this._down);
      window.addEventListener("pointermove", this._move, { passive: false });
      window.addEventListener("pointerup", this._up);
      canvas.addEventListener("wheel", this._wheel, { passive: false });
      canvas.addEventListener("touchstart", this._tstart, { passive: false });
      canvas.addEventListener("touchmove", this._tmove, { passive: false });
      canvas.addEventListener("touchend", this._tend);
      this._unbind = function () { canvas.removeEventListener("pointerdown", self._down); window.removeEventListener("pointermove", self._move); window.removeEventListener("pointerup", self._up); };
    },
    zoom: function (dir) { if (!this.running) return; this.radius = Logic.clamp(this.radius + dir * (this._maxR - this._minR) * 0.14, this._minR, this._maxR); },
    showRoute: function () {
      if (!this.running) return;
      if (this._route) { for (var j = 0; j < this._route.length; j++) this.scene.remove(this._route[j]); this._route = null; }
      var path = this.SP.bfsPath(this.grid, this.player, this.grid.evac, true) || this.SP.bfsPath(this.grid, this.player, this.grid.evac, false);
      if (!path) { this._toast("No clear route from here. Step back toward safer ground.", "info", 2600); return; }
      this._route = [];
      for (var k = 1; k < path.length; k++) {
        var p = this._wpos(path[k]);
        var dot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshStandardMaterial({ color: 0x7ad0ff, emissive: 0x2a86c0, emissiveIntensity: 0.7 }));
        dot.position.set(p.x, p.y + 0.5, p.z); this.scene.add(dot); this._route.push(dot);
      }
      this._toast("Follow the blue markers to the tent along safer ground.", "good", 3000);
      var self = this; clearTimeout(this._routeT);
      this._routeT = setTimeout(function () { if (self._route) { for (var i = 0; i < self._route.length; i++) self.scene.remove(self._route[i]); self._route = null; } }, 3600);
    },
    _tap: function (pt) {
      if (this.phase !== "move" || this._anim) return;
      var c = document.getElementById("canvas-safepath"); if (!c) return;
      var r = c.getBoundingClientRect();
      var nd = new THREE.Vector2(((pt.x - r.left) / r.width) * 2 - 1, -((pt.y - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(nd, this.camera);
      var hits = this.raycaster.intersectObjects(this._tiles.filter(Boolean), false);
      if (!hits.length) return;
      var idx = hits[0].object.userData.idx, pc = this.grid.cells[this.player], tc = this.grid.cells[idx];
      if (!tc.walkable) return;
      if (Math.abs(pc.x - tc.x) + Math.abs(pc.y - tc.y) !== 1) return;
      this._moveTo(idx);
    },
    _moveTo: function (idx) {
      var from = this._wpos(this.player), to = this._wpos(idx);
      this._anim = { from: from, to: to, t: 0, idx: idx };
      this.phase = "busy"; this._highlightMoves();
    },
    _arrive: function (idx) {
      this.player = idx; this.steps++; this._syncHud();
      if (idx === this.grid.evac) { this._win(); return; }
      this.phase = "roll"; this._pulseRoll(true);
      this._toast("Roll the die. If a hazard strikes while you are in danger, you lose a heart.", "info", 2600);
    },

    _pulseRoll: function (on) { var rb = document.getElementById("btn-sp-roll"); if (rb) { rb.disabled = !on; rb.classList.toggle("pulse", on); } },
    _die: function (face) {
      var el = document.getElementById("sp-die-face"); if (!el) return;
      var map = { clear: "\u2705", quake: "\uD83C\uDFDA", typhoon: "\uD83C\uDF00" };
      var lab = { clear: "Clear", quake: "Quake", typhoon: "Typhoon" };
      el.innerHTML = '<span class="dico">' + (map[face] || "\u2753") + '</span><span class="dlab">' + (lab[face] || "") + '</span>';
    },
    _rollDie: function () {
      if (this.phase !== "roll" || this.rolling) return;
      this.rolling = true; this._pulseRoll(false); this.phase = "busy";
      var self = this, faces = ["clear", "quake", "typhoon"], n = 0;
      var d = document.getElementById("sp-die"); if (d) d.classList.add("shake");
      this._dieTimer = setInterval(function () { self._die(faces[n % 3]); n++; }, 90);
      setTimeout(function () {
        clearInterval(self._dieTimer); self._dieTimer = null;
        if (d) d.classList.remove("shake");
        var face = self.SP.rollDie(); self._die(face); self._resolve(face);
      }, 750);
    },
    _resolve: function (face) {
      this.rolling = false;
      var risky = this.SP.isRisky(this.grid, this.player);
      if (this.SP.catches(face, risky)) {
        this.hearts--; this.heartsLost++; this._syncHud();
        var src = this.SP.nearestSourceType(this.grid, this.player);
        this._toast(this.SP.message(face, src), "bad", 5200);
        if (this.app) this.app.speak(this.SP.hazardName(face) + ". Be careful.");
        if (this.hearts <= 0) { this._lose(); return; }
      } else if (face === "clear") {
        this._toast("All clear. Keep going to the evacuation tent.", "good", 1800);
      } else {
        this._toast("A " + this.SP.hazardName(face).toLowerCase() + " struck, but you were on safe ground. Well done.", "good", 2600);
      }
      this.phase = "move"; this._highlightMoves();
    },

    _syncHud: function () {
      var hs = document.getElementById("sp-hearts");
      if (hs) { var str = "", full = "\u2764", em = "\u2661"; for (var i = 0; i < 3; i++) str += (i < this.hearts ? full : em); hs.textContent = str; }
      var st = document.getElementById("sp-steps"); if (st) st.textContent = "Steps: " + this.steps;
      var lv = document.getElementById("sp-level"); if (lv) lv.textContent = "Map " + ((this.level % this.SP.LEVELS.length) + 1) + " of " + this.SP.LEVELS.length;
    },
    _toast: function (msg, kind, ms) {
      var el = document.getElementById("sp-toast"); if (!el) return;
      el.textContent = msg; el.className = "sp-toast show " + (kind || "info");
      var self = this; clearTimeout(this._toastT);
      this._toastT = setTimeout(function () { el.className = "sp-toast " + (kind || "info"); }, ms || 2600);
    },

    _win: function () {
      var stars = this.SP.rateStars({ heartsLost: this.heartsLost, steps: this.steps, shortest: this.shortest });
      this._finish(true, stars);
    },
    _lose: function () { this._finish(false, 0); },
    _finish: function (reached, stars) {
      this.stop();
      var starEl = document.getElementById("sp-stars");
      if (starEl) { var str = "", f = "\u2605", em = "\u2606"; for (var i = 0; i < 3; i++) str += (i < stars ? f : em); starEl.textContent = str; }
      var title = document.getElementById("sp-result-title"), msg = document.getElementById("sp-result-msg");
      if (reached) {
        if (title) title.textContent = "You reached safety!";
        if (msg) msg.textContent = this.heartsLost === 0
          ? "You found a safe and short way to the evacuation area. Great routing!"
          : "You made it to the evacuation area. Next time, try to keep even further from the coast, trees, poles, and buildings.";
      } else {
        if (title) title.textContent = "That route was too risky";
        if (msg) msg.textContent = "The hazards caught you. Keep away from the coast, trees, poles, and buildings, and reach the tent safely.";
      }
      var earned = (reached && stars >= 3 && this.app && this.app.badges) ? this.app.badges.earn("path") : false;
      var note = document.getElementById("sp-badge-note"); if (note) note.style.display = earned ? "" : "none";
      var next = document.getElementById("btn-sp-next"); if (next) next.style.display = (reached && this.level < this.SP.LEVELS.length - 1) ? "" : "none";
      if (this.app) { this.app.show("screen-safepath-result"); this.app.speak(reached ? "You reached safety." : "Try again, stay away from danger."); }
    },

    _onResize: function () { var c = document.getElementById("canvas-safepath"); if (!c) return; var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); },
    _updateCamera: function () {
      var cp = Math.cos(this.orbitPitch), sp = Math.sin(this.orbitPitch);
      this.camera.position.set(this.center.x + this.radius * cp * Math.sin(this.orbitYaw), this.center.y + this.radius * sp, this.center.z + this.radius * cp * Math.cos(this.orbitYaw));
      this.camera.lookAt(this.center);
    },
    _loop: function (now) {
      if (!this.running) return; var self = this;
      this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      var dt = Math.min(0.05, (now - (this._prev || now)) / 1000); this._prev = now;
      if (this._anim) {
        this._anim.t = Math.min(1, this._anim.t + dt * 4.5);
        var e = this._anim.t, p = new THREE.Vector3().lerpVectors(this._anim.from, this._anim.to, e);
        var hop = Math.sin(e * Math.PI) * 0.22;
        this.token.position.set(p.x, 0.2 + hop, p.z);
        if (this._anim.t >= 1) { var idx = this._anim.idx; this._anim = null; this._arrive(idx); }
      }
      for (var i = 0; i < this._highlights.length; i++) this._highlights[i].position.y = 0.22 + Math.sin(now * 0.005 + i) * 0.03;
      this._updateCamera();
      this.renderer.render(this.scene, this.camera);
    }
  };
  if (typeof window !== "undefined") window.SafePath = SafePath;

  /* =====================================================================
     5b2) GUIDE THE STREAM  (Prevention: route the water to the sea)
     Inspired by the "Ang Sapa" series by Dr. Mahar Lagmay, Project NOAH.
     ===================================================================== */
  var Sapa = {
    running: false, _raf: null, level: 0, SP: Logic.sapa,
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this.app = app;
      var oldCanvas = document.getElementById("canvas-sapa");
      var canvas = oldCanvas.cloneNode(false); oldCanvas.parentNode.replaceChild(canvas, oldCanvas);
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x0d1f2d);
      this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
      this.raycaster = new THREE.Raycaster();

      var lvl = this.SP.LEVELS[this.level % this.SP.LEVELS.length];
      this.grid = this.SP.parse(lvl.rows);
      this.optimal = this.SP.shortestPieces(lvl.rows);
      this.hearts = 3; this.heartsLost = 0; this._raining = false;
      this.center = new THREE.Vector3(0, 0, 0);
      this.orbitYaw = 0; this.orbitPitch = 1.02;
      this.radius = Math.max(this.grid.w, this.grid.h) * 0.95 + 3;
      this._minR = Math.max(this.grid.w, this.grid.h) * 0.5 + 2;
      this._maxR = Math.max(this.grid.w, this.grid.h) * 1.7 + 6;

      this.scene.add(new THREE.HemisphereLight(0xeaf2f8, 0x30363c, 1.0));
      var dl = new THREE.DirectionalLight(0xffffff, 0.5); dl.position.set(4, 8, 5); this.scene.add(dl);

      this._tiles = []; this._props = []; this._chan = {}; this._silt = {}; this._house = {}; this._drops = [];
      this._buildBoard(); this._updateCamera();
      this._syncHud();
      this._toast("Tap silt to clear it, then tap ground to lay the channel from the creek to the sea.", "info", 4600);

      var self = this;
      this._bindInput(canvas);
      this._rain = function () { self.releaseRain(); };
      var rb = document.getElementById("btn-sapa-rain"); if (rb) rb.addEventListener("click", this._rain);
      this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize);
      this.running = true; this._loop(performance.now());
    },
    stop: function () {
      this.running = false; if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      if (this._resize) window.removeEventListener("resize", this._resize);
      if (this._unbind) this._unbind();
      var rb = document.getElementById("btn-sapa-rain"); if (rb && this._rain) rb.removeEventListener("click", this._rain);
      if (this._toastT) clearTimeout(this._toastT);
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },

    _wpos: function (r, c) { return new THREE.Vector3(c - (this.grid.w - 1) / 2, 0, r - (this.grid.h - 1) / 2); },
    _m: function (geo, color, x, y, z, ry) { var mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color })); mesh.position.set(x || 0, y || 0, z || 0); if (ry) mesh.rotation.y = ry; return mesh; },

    _buildBoard: function () {
      var s = this.scene, g = this.grid;
      var matGround = new THREE.MeshStandardMaterial({ color: 0x9ccc65 }),
          matSea = new THREE.MeshStandardMaterial({ color: 0x2a80c4, roughness: 0.4, emissive: 0x11405f, emissiveIntensity: 0.3 }),
          matSrc = new THREE.MeshStandardMaterial({ color: 0x7fc9e6 });
      for (var r = 0; r < g.h; r++) for (var c = 0; c < g.w; c++) {
        var idx = r * g.w + c, ch = g.cells[idx], p = this._wpos(r, c), tile;
        if (ch === "E") {
          tile = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.16, 0.98), matSea); tile.position.set(p.x, -0.04, p.z);
        } else {
          tile = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.2, 0.94), ch === "S" ? matSrc : matGround); tile.position.set(p.x, 0, p.z);
        }
        tile.userData = { r: r, c: c, idx: idx }; s.add(tile); this._tiles[idx] = tile;
        if (ch === "S") { this._buildSpring(p); this._addLabel("Creek", p); }
        if (ch === "E") this._addLabel("Sea", p);
        if (ch === "H") this._house[idx] = this._buildHouse(p);
        if (ch === "X") this._buildRock(p);
        if (ch === "G") this._silt[idx] = this._buildSilt(p);
      }
      var base = new THREE.Mesh(new THREE.BoxGeometry(g.w + 0.4, 0.1, g.h + 0.4), new THREE.MeshStandardMaterial({ color: 0x6b7d55 }));
      base.position.set(0, -0.16, 0); s.add(base);
    },
    _buildSpring: function (p) {
      var grp = new THREE.Group();
      grp.add(this._m(new THREE.CylinderGeometry(0.28, 0.32, 0.14, 16), 0x6a5033, 0, 0.14, 0));
      grp.add(this._m(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16), 0x4aa3d0, 0, 0.2, 0));
      grp.position.set(p.x, 0.04, p.z); this.scene.add(grp); this._props.push(grp);
    },
    _buildHouse: function (p) {
      var grp = new THREE.Group();
      grp.add(this._m(new THREE.BoxGeometry(0.58, 0.44, 0.58), 0xe4d3a8, 0, 0.32, 0));
      grp.add(this._m(new THREE.ConeGeometry(0.5, 0.3, 4), 0xb15a3a, 0, 0.66, 0, Math.PI / 4));
      grp.add(this._m(new THREE.BoxGeometry(0.14, 0.2, 0.02), 0x7a5a3a, 0, 0.2, 0.3));
      grp.position.set(p.x, 0.1, p.z); this.scene.add(grp); this._props.push(grp); return grp;
    },
    _buildRock: function (p) {
      var grp = new THREE.Group();
      var b = this._m(new THREE.SphereGeometry(0.32, 10, 8), 0x8a9196, 0, 0.24, 0); b.scale.set(1, 0.7, 1); grp.add(b);
      grp.add(this._m(new THREE.SphereGeometry(0.18, 8, 6), 0x767c81, 0.2, 0.16, 0.14));
      grp.position.set(p.x, 0.1, p.z); this.scene.add(grp); this._props.push(grp);
    },
    _buildSilt: function (p) {
      var grp = new THREE.Group();
      var mound = this._m(new THREE.SphereGeometry(0.34, 12, 8), 0x9a7b45, 0, 0.14, 0); mound.scale.set(1, 0.55, 1); grp.add(mound);
      grp.add(this._m(new THREE.SphereGeometry(0.12, 8, 6), 0x6f8a4a, 0.16, 0.2, 0.1));
      grp.add(this._m(new THREE.BoxGeometry(0.1, 0.1, 0.1), 0xcfd3d6, -0.14, 0.2, -0.06));
      grp.position.set(p.x, 0.12, p.z); this.scene.add(grp); this._props.push(grp); return grp;
    },
    _addChannel: function (idx, r, c) {
      var p = this._wpos(r, c);
      var mesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.9), new THREE.MeshStandardMaterial({ color: 0x3d9bd6, roughness: 0.35, emissive: 0x0e3a55, emissiveIntensity: 0.25 }));
      mesh.position.set(p.x, 0.06, p.z); this.scene.add(mesh); this._chan[idx] = mesh;
    },
    _removeChannel: function (idx) { if (this._chan[idx]) { this.scene.remove(this._chan[idx]); delete this._chan[idx]; } },

    _label: function (text) {
      var cv = document.createElement("canvas"); cv.width = 256; cv.height = 80;
      var x = cv.getContext("2d");
      x.fillStyle = "rgba(14,34,51,0.9)"; x.fillRect(8, 16, 240, 48);
      x.fillStyle = "#ffffff"; x.font = "bold 34px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText(text, 128, 42);
      var tex = new THREE.CanvasTexture(cv);
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
      sp.scale.set(1.5, 0.47, 1); return sp;
    },
    _addLabel: function (text, p) { var l = this._label(text); l.position.set(p.x, 1.4, p.z); this.scene.add(l); this._props.push(l); },

    _bindInput: function (canvas) {
      var self = this, dragging = false, moved = false, sx = 0, sy = 0, lx = 0, ly = 0, pd = 0;
      function pt(e) { if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY }; }
      function dist2(e) { var a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
      this._down = function (e) { if (e.touches && e.touches.length >= 2) return; dragging = true; moved = false; var p = pt(e); sx = lx = p.x; sy = ly = p.y; };
      this._move = function (e) {
        if (self._pinching || !dragging) return; var p = pt(e);
        if (Math.hypot(p.x - sx, p.y - sy) > 6) moved = true;
        self.orbitYaw -= (p.x - lx) * 0.006; self.orbitPitch = Logic.clamp(self.orbitPitch + (p.y - ly) * 0.005, 0.55, 1.4);
        lx = p.x; ly = p.y; if (e.cancelable) e.preventDefault();
      };
      this._up = function (e) { if (!dragging) return; dragging = false; if (!moved && !self._pinching) self._tap(pt(e)); };
      this._wheel = function (e) { self.radius = Logic.clamp(self.radius + (e.deltaY > 0 ? 1 : -1) * (self._maxR - self._minR) * 0.08, self._minR, self._maxR); if (e.cancelable) e.preventDefault(); };
      this._tstart = function (e) { if (e.touches.length === 2) { self._pinching = true; pd = dist2(e); } };
      this._tmove = function (e) { if (e.touches.length === 2) { self._pinching = true; var d = dist2(e); if (pd > 0 && d > 0) self.radius = Logic.clamp(self.radius * (pd / d), self._minR, self._maxR); pd = d; if (e.cancelable) e.preventDefault(); } };
      this._tend = function (e) { if (e.touches.length < 2) { self._pinching = false; pd = 0; } };
      canvas.addEventListener("pointerdown", this._down);
      window.addEventListener("pointermove", this._move, { passive: false });
      window.addEventListener("pointerup", this._up);
      canvas.addEventListener("wheel", this._wheel, { passive: false });
      canvas.addEventListener("touchstart", this._tstart, { passive: false });
      canvas.addEventListener("touchmove", this._tmove, { passive: false });
      canvas.addEventListener("touchend", this._tend);
      this._unbind = function () { canvas.removeEventListener("pointerdown", self._down); window.removeEventListener("pointermove", self._move); window.removeEventListener("pointerup", self._up); };
    },
    zoom: function (dir) { if (!this.running) return; this.radius = Logic.clamp(this.radius + dir * (this._maxR - this._minR) * 0.14, this._minR, this._maxR); },

    _tap: function (pt) {
      if (!this.running || this._raining) return;
      var c = document.getElementById("canvas-sapa"); if (!c) return;
      var r = c.getBoundingClientRect();
      var nd = new THREE.Vector2(((pt.x - r.left) / r.width) * 2 - 1, -((pt.y - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(nd, this.camera);
      var hits = this.raycaster.intersectObjects(this._tiles.filter(Boolean), false);
      if (!hits.length) return;
      var u = hits[0].object.userData, act = this.SP.tap(this.grid, u.r, u.c);
      if (act === "clear") { if (this._silt[u.idx]) { this.scene.remove(this._silt[u.idx]); delete this._silt[u.idx]; } this._toast("Silt cleared. Now the water can pass.", "good", 1600); }
      else if (act === "build") { this._addChannel(u.idx, u.r, u.c); }
      else if (act === "remove") { this._removeChannel(u.idx); }
      else return;
      this._syncHud();
    },

    releaseRain: function () {
      if (!this.running || this._raining) return;
      var complete = this.SP.isComplete(this.grid);
      this._raining = true; this._rainT = 0;
      var rb = document.getElementById("btn-sapa-rain"); if (rb) rb.disabled = true;
      // spawn a few rain drops above the source for feedback
      var sp = this._wpos(this.grid.source.r, this.grid.source.c);
      for (var i = 0; i < 10; i++) {
        var d = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), new THREE.MeshStandardMaterial({ color: 0x8fd0f0, emissive: 0x2a86c0, emissiveIntensity: 0.6 }));
        d.position.set(sp.x + (Math.random() - 0.5) * 3, 2.4 + Math.random() * 1.5, sp.z + (Math.random() - 0.5) * 3);
        this.scene.add(d); this._drops.push(d);
      }
      var self = this;
      this._pendResult = function () { self._resolveRain(complete); };
      this._rainTimer = setTimeout(this._pendResult, 1100);
    },
    _resolveRain: function (complete) {
      for (var i = 0; i < this._drops.length; i++) this.scene.remove(this._drops[i]);
      this._drops = []; this._raining = false;
      var rb = document.getElementById("btn-sapa-rain"); if (rb) rb.disabled = false;
      if (complete) {
        var used = this.SP.countChannels(this.grid);
        var stars = this.SP.rateStars(used, this.optimal, this.heartsLost);
        this._finish(true, stars);
        return;
      }
      var flooded = this.SP.housesTouchingWater(this.grid);
      for (var j = 0; j < this.grid.cells.length; j++) {
        if (this.grid.cells[j] === "H" && this._house[j]) { this._house[j].traverse(function (o) { if (o.material && o.material.color) o.material.color.setHex(0x6f8fb0); }); }
      }
      this.hearts--; this.heartsLost++; this._syncHud();
      if (flooded.length) this._toast("The rain overflowed into homes. Connect the channel all the way to the sea.", "bad", 4200);
      else this._toast("The channel does not reach the sea yet. Keep building toward the blue water.", "bad", 4200);
      if (this.app) this.app.speak("The water overflowed. Guide it to the sea.");
      if (this.hearts <= 0) { var used2 = this.SP.countChannels(this.grid); this._finish(false, 0); }
    },

    _syncHud: function () {
      var hs = document.getElementById("sapa-hearts");
      if (hs) { var str = "", full = "\u2764", em = "\u2661"; for (var i = 0; i < 3; i++) str += (i < this.hearts ? full : em); hs.textContent = str; }
      var pc = document.getElementById("sapa-pieces"); if (pc) pc.textContent = "Channel: " + this.SP.countChannels(this.grid);
      var stx = document.getElementById("sapa-status");
      if (stx) { var done = this.SP.isComplete(this.grid); stx.textContent = done ? "Reaches the sea" : "Not yet connected"; stx.className = "sapa-chip " + (done ? "on" : ""); }
      var lv = document.getElementById("sapa-level"); if (lv) lv.textContent = "Puzzle " + ((this.level % this.SP.LEVELS.length) + 1) + " of " + this.SP.LEVELS.length;
    },
    _toast: function (msg, kind, ms) {
      var el = document.getElementById("sapa-toast"); if (!el) return;
      el.textContent = msg; el.className = "sp-toast show " + (kind || "info");
      var self = this; clearTimeout(this._toastT);
      this._toastT = setTimeout(function () { el.className = "sp-toast " + (kind || "info"); }, ms || 2600);
    },

    _finish: function (won, stars) {
      this.stop();
      var starEl = document.getElementById("sapa-stars");
      if (starEl) { var str = "", f = "\u2605", em = "\u2606"; for (var i = 0; i < 3; i++) str += (i < stars ? f : em); starEl.textContent = str; }
      var title = document.getElementById("sapa-result-title"), msg = document.getElementById("sapa-result-msg");
      if (won) {
        if (title) title.textContent = "The barangay stays dry!";
        if (msg) msg.textContent = this.heartsLost === 0
          ? "You kept the waterway open and guided the creek safely to the sea. That is how we stop floods before they start."
          : "You guided the water to the sea in the end. Keeping creeks clear and open protects homes from flooding.";
      } else {
        if (title) title.textContent = "The homes flooded";
        if (msg) msg.textContent = "The water had nowhere safe to go. Clear the silt, route around the houses, and connect the channel all the way to the sea.";
      }
      var earned = (won && stars >= 3 && this.app && this.app.badges) ? this.app.badges.earn("sapa") : false;
      var note = document.getElementById("sapa-badge-note"); if (note) note.style.display = earned ? "" : "none";
      var next = document.getElementById("btn-sapa-next"); if (next) next.style.display = (won && this.level < this.SP.LEVELS.length - 1) ? "" : "none";
      if (this.app) { this.app.show("screen-sapa-result"); this.app.speak(won ? "The barangay stays dry." : "Try again and guide the water to the sea."); }
    },

    _onResize: function () { var c = document.getElementById("canvas-sapa"); if (!c) return; var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); },
    _updateCamera: function () {
      var cp = Math.cos(this.orbitPitch), sp = Math.sin(this.orbitPitch);
      this.camera.position.set(this.center.x + this.radius * cp * Math.sin(this.orbitYaw), this.center.y + this.radius * sp, this.center.z + this.radius * cp * Math.cos(this.orbitYaw));
      this.camera.lookAt(this.center);
    },
    _loop: function (now) {
      if (!this.running) return; var self = this;
      this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      var dt = Math.min(0.05, (now - (this._prev || now)) / 1000); this._prev = now;
      // ripple the placed channels and the sea a touch
      var k = 0; for (var key in this._chan) { if (this._chan.hasOwnProperty(key)) { this._chan[key].position.y = 0.06 + Math.sin(now * 0.004 + k) * 0.012; k++; } }
      for (var i = 0; i < this._drops.length; i++) { var d = this._drops[i]; d.position.y -= dt * 4; if (d.position.y < 0.1) d.position.y = 2.6 + Math.random(); }
      this._updateCamera();
      this.renderer.render(this.scene, this.camera);
    }
  };
  if (typeof window !== "undefined") window.Sapa = Sapa;

  /* =====================================================================
     5b3) HAZARD HUNT  (Prevention: spot the hazards, then fix them)
     ===================================================================== */
  var HazardHunt = {
    running: false, _raf: null, scene: 0, HZ: Logic.hazard,
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this.app = app;
      var oldCanvas = document.getElementById("canvas-hazard");
      var canvas = oldCanvas.cloneNode(false); oldCanvas.parentNode.replaceChild(canvas, oldCanvas);
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      this.scene3 = new THREE.Scene(); this.scene3.background = new THREE.Color(0x101c26);
      this.camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 100);
      this.raycaster = new THREE.Raycaster();

      this.data = this.HZ.SCENES[this.scene % this.HZ.SCENES.length];
      this.scenarioMode = !!this.data.scenarios;
      this.total = this.scenarioMode ? 0 : this.HZ.hazardCount(this.data);
      this.foundN = 0; this._found = {}; this.wrongTaps = 0; this._done = false;
      this._foundBy = {}; this._doneBy = {};
      if (this.scenarioMode) { for (var si = 0; si < this.data.scenarios.length; si++) { this._foundBy[this.data.scenarios[si].key] = {}; this._doneBy[this.data.scenarios[si].key] = false; } this.scKey = this.data.scenarios[0].key; }
      this.center = new THREE.Vector3(0, 0.55, 0);
      this.orbitYaw = 0.5; this.orbitPitch = this.data.outdoor ? 0.72 : 0.86;
      this.radius = this.data.outdoor ? 11 : 9; this._minR = this.data.outdoor ? 6.5 : 5.5; this._maxR = this.data.outdoor ? 17 : 14;

      this.scene3.add(new THREE.HemisphereLight(0xf3f6f8, 0x2a2f34, 1.05));
      var dl = new THREE.DirectionalLight(0xffffff, 0.5); dl.position.set(5, 9, 6); this.scene3.add(dl);

      this._props = []; this._items = {}; this._marks = {}; this._meshes = [];
      if (this.data.outdoor) this._buildStreet(); else this._buildRoom();
      this._buildItems(); this._updateCamera();
      this._buildScenarioBar();
      this._applySky();
      this._syncHud();
      if (this.scenarioMode) this._toast("Pick a scenario at the top, then find what turns risky. Switch scenarios to see the same street change.", "info", 5200);
      else this._toast("Look around and tap anything that could be dangerous in an earthquake or a typhoon.", "info", 4600);

      var self = this;
      this._bindInput(canvas);
      this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize);
      this.running = true; this._loop(performance.now());
    },
    stop: function () {
      this.running = false; if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      if (this._resize) window.removeEventListener("resize", this._resize);
      if (this._unbind) this._unbind();
      if (this._toastT) clearTimeout(this._toastT);
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },

    _buildRoom: function () {
      var s = this.scene3, key = this.data.key;
      function mk(geo, color, rough) { return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color, roughness: rough == null ? 0.9 : rough })); }
      function put(m, x, y, z, ry) { m.position.set(x, y, z); if (ry) m.rotation.y = ry; s.add(m); return m; }
      put(mk(new THREE.BoxGeometry(6.8, 0.12, 6.8), 0xc9a877), 0, -0.06, 0);
      put(mk(new THREE.BoxGeometry(3.6, 0.02, 3.2), key === "school" ? 0x9fb0bd : 0x8f6f8a), 0.3, 0.01, 0.7);
      var wall = 0xe9edf0;
      put(mk(new THREE.BoxGeometry(6.8, 3, 0.14), wall), 0, 1.5, -3.27);
      put(mk(new THREE.BoxGeometry(0.14, 3, 6.8), wall), -3.27, 1.5, 0);
      put(mk(new THREE.BoxGeometry(6.8, 0.9, 0.02), 0xd7dde2), 0, 0.5, -3.19);
      put(mk(new THREE.BoxGeometry(0.02, 0.9, 6.8), 0xd7dde2), -3.19, 0.5, 0);
      put(mk(new THREE.BoxGeometry(6.8, 0.16, 0.05), 0x8a6a45), 0, 0.08, -3.18);
      put(mk(new THREE.BoxGeometry(0.05, 0.16, 6.8), 0x8a6a45), -3.18, 0.08, 0);
      put(mk(new THREE.BoxGeometry(6.9, 0.12, 0.12), 0xcfd5da), 0, 2.9, -3.2);
      put(mk(new THREE.BoxGeometry(0.12, 0.12, 6.9), 0xcfd5da), -3.2, 2.9, 0);
      put(mk(new THREE.BoxGeometry(0.06, 2.1, 1.0), 0x7a5230), -3.16, 1.05, 2.3);
      put(mk(new THREE.BoxGeometry(0.09, 2.2, 0.08), 0x5a3a1f), -3.17, 1.1, 1.76);
      put(mk(new THREE.BoxGeometry(0.09, 2.2, 0.08), 0x5a3a1f), -3.17, 1.1, 2.84);
      put(mk(new THREE.BoxGeometry(0.09, 0.09, 1.16), 0x5a3a1f), -3.17, 2.18, 2.3);
      put(mk(new THREE.SphereGeometry(0.05, 10, 8), 0xd4af37), -3.09, 1.05, 1.98);
      put(mk(new THREE.BoxGeometry(0.14, 0.1, 0.14), 0x9099a0), key === "school" ? -0.7 : 0.2, 2.86, key === "school" ? -1.3 : -1.2);
      if (key === "home") {
        var sofa = new THREE.Group();
        var seat = mk(new THREE.BoxGeometry(1.7, 0.4, 0.72), 0x4a7a9a); seat.position.y = 0.3; sofa.add(seat);
        var back = mk(new THREE.BoxGeometry(1.7, 0.52, 0.18), 0x3f6f8a); back.position.set(0, 0.56, -0.28); sofa.add(back);
        var aL = mk(new THREE.BoxGeometry(0.2, 0.46, 0.72), 0x3f6f8a); aL.position.set(-0.75, 0.46, 0); sofa.add(aL);
        var aR = mk(new THREE.BoxGeometry(0.2, 0.46, 0.72), 0x3f6f8a); aR.position.set(0.75, 0.46, 0); sofa.add(aR);
        sofa.position.set(0.5, 0, 1.9); sofa.rotation.y = Math.PI; s.add(sofa);
        put(mk(new THREE.BoxGeometry(0.7, 0.5, 0.04), 0x8a6a45), -1.6, 1.95, -3.17);
        put(mk(new THREE.BoxGeometry(0.58, 0.4, 0.02), 0x9fc0d8), -1.6, 1.95, -3.16);
      } else {
        put(mk(new THREE.BoxGeometry(2.6, 1.0, 0.05), 0x2f5a3f), 0.4, 2.1, -3.17);
        put(mk(new THREE.BoxGeometry(2.74, 1.14, 0.03), 0x8a6a45), 0.4, 2.1, -3.19);
        var clk = mk(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 18), 0xf4f4f4); clk.rotation.z = Math.PI / 2; put(clk, -3.16, 2.2, -1.1);
      }
    },
    _prop: function (kind) {
      var g = new THREE.Group();
      function M(c, r, m) { return new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? 0.7 : r, metalness: m || 0 }); }
      function EM(c, e, i) { var mm = M(c, 0.5, 0); mm.emissive = new THREE.Color(e); mm.emissiveIntensity = i == null ? 0.6 : i; return mm; }
      function glass(c, o) { var mm = M(c, 0.1, 0); mm.transparent = true; mm.opacity = o == null ? 0.45 : o; return mm; }
      function box(x, y, z, mat) { return new THREE.Mesh(new THREE.BoxGeometry(x, y, z), mat); }
      function cyl(rt, rb, hh, mat) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, hh, 16), mat); }
      function sph(r, mat) { return new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), mat); }
      function cone(r, hh, mat) { return new THREE.Mesh(new THREE.ConeGeometry(r, hh, 14), mat); }
      function add(mesh, x, y, z, rx, ry, rz) { mesh.position.set(x || 0, y || 0, z || 0); if (rx) mesh.rotation.x = rx; if (ry) mesh.rotation.y = ry; if (rz) mesh.rotation.z = rz; g.add(mesh); return mesh; }
      var PI = Math.PI, i;
      switch (kind) {
        case "cabinet":
          add(box(0.8, 1.6, 0.5, M(0x9c6b3f)), 0, 0.8, 0);
          add(box(0.84, 0.06, 0.54, M(0x7a5230)), 0, 1.61, 0);
          add(box(0.03, 0.24, 0.03, M(0x3a2a1a)), 0.18, 0.9, 0.26); add(box(0.03, 0.24, 0.03, M(0x3a2a1a)), -0.18, 0.9, 0.26); break;
        case "shelf":
          add(box(0.9, 1.2, 0.32, M(0xb98a52)), 0, 0.6, 0);
          add(box(0.86, 0.03, 0.3, M(0x8a6a3a)), 0, 0.42, 0); add(box(0.86, 0.03, 0.3, M(0x8a6a3a)), 0, 0.86, 0);
          add(box(0.18, 0.22, 0.16, M(0xd23b3b)), -0.2, 1.32, 0); add(cyl(0.09, 0.11, 0.22, M(0x3d9bd6)), 0.2, 1.32, 0); break;
        case "tv":
          add(box(0.74, 0.5, 0.34, M(0x6a4a2f)), 0, 0.25, 0);
          add(box(0.68, 0.44, 0.05, M(0x14161b)), 0, 0.74, 0.04);
          add(box(0.6, 0.36, 0.02, EM(0x2a4a66, 0x0a1a2a, 0.5)), 0, 0.74, 0.07); break;
        case "outlet":
          add(box(0.44, 0.6, 0.1, M(0xd8d8d8)), 0, 0.6, 0);
          add(box(0.2, 0.22, 0.06, M(0xf2f2f2)), 0, 0.62, 0.08);
          add(box(0.06, 0.1, 0.16, M(0x2a2a2a)), -0.06, 0.66, 0.12); add(box(0.06, 0.1, 0.16, M(0x2a2a2a)), 0.06, 0.58, 0.12);
          add(cyl(0.012, 0.012, 0.4, M(0xd23b3b)), 0.12, 0.42, 0.16, 0, 0, 1.1);
          add(cyl(0.012, 0.012, 0.4, M(0x2a2a2a)), -0.12, 0.4, 0.16, 0, 0, -1.0); break;
        case "window":
          add(box(1, 1, 0.08, M(0x8a6a45)), 0, 1, 0);
          add(box(0.84, 0.84, 0.02, glass(0xbfe0f0, 0.4)), 0, 1, 0.04);
          add(box(0.86, 0.05, 0.05, M(0x8a6a45)), 0, 1, 0.05); add(box(0.05, 0.86, 0.05, M(0x8a6a45)), 0, 1, 0.05); break;
        case "clutter":
          add(box(0.5, 0.42, 0.5, M(0xc9a15a)), 0, 0.21, 0);
          add(box(0.42, 0.36, 0.42, M(0xb8904a)), 0.06, 0.6, 0.04);
          add(box(0.36, 0.3, 0.36, M(0xd8b76a)), -0.05, 0.92, -0.03); break;
        case "pots":
          add(box(0.8, 0.12, 0.3, M(0x9a8a6a)), 0, 0.95, 0);
          add(cyl(0.08, 0.1, 0.16, M(0xc86b3a)), -0.2, 1.09, 0); add(sph(0.13, M(0x2e9c53)), -0.2, 1.24, 0);
          add(cyl(0.08, 0.1, 0.16, M(0xc86b3a)), 0.2, 1.09, 0); add(sph(0.13, M(0x349140)), 0.2, 1.24, 0); break;
        case "fan":
          add(cyl(0.02, 0.02, 0.5, M(0x8a9095)), 0, 1.55, 0);
          add(cyl(0.09, 0.09, 0.1, M(0x55595d)), 0, 1.28, 0);
          add(box(0.62, 0.02, 0.1, M(0x9a7b45)), 0, 1.24, 0); add(box(0.1, 0.02, 0.62, M(0x9a7b45)), 0, 1.24, 0); break;
        case "gobag":
          add(box(0.36, 0.46, 0.26, M(0xe86f24)), 0, 0.3, 0);
          add(box(0.3, 0.2, 0.08, M(0xc65a12)), 0, 0.22, 0.16);
          add(box(0.05, 0.32, 0.03, M(0x7c4212)), -0.1, 0.34, -0.14); add(box(0.05, 0.32, 0.03, M(0x7c4212)), 0.1, 0.34, -0.14); break;
        case "extinguisher":
          add(cyl(0.12, 0.13, 0.5, M(0xd21f1f)), 0, 0.3, 0);
          add(cyl(0.05, 0.05, 0.1, M(0x2a2a2a)), 0, 0.58, 0);
          add(box(0.06, 0.05, 0.13, M(0x111)), 0, 0.63, 0.08);
          add(cyl(0.012, 0.012, 0.3, M(0x1a1a1a)), 0.12, 0.35, 0.05, 0, 0, 0.7); break;
        case "table":
          add(box(0.95, 0.06, 0.62, M(0xb98a52)), 0, 0.5, 0);
          add(box(0.06, 0.5, 0.06, M(0x8a6a3a)), 0.4, 0.25, 0.24); add(box(0.06, 0.5, 0.06, M(0x8a6a3a)), -0.4, 0.25, 0.24);
          add(box(0.06, 0.5, 0.06, M(0x8a6a3a)), 0.4, 0.25, -0.24); add(box(0.06, 0.5, 0.06, M(0x8a6a3a)), -0.4, 0.25, -0.24); break;
        case "plant":
          add(cyl(0.13, 0.17, 0.26, M(0xc86b3a)), 0, 0.13, 0);
          add(sph(0.26, M(0x2e9c53)), 0, 0.45, 0); add(sph(0.16, M(0x349140)), 0.1, 0.6, 0.05); break;
        case "desk":
          add(box(0.85, 0.05, 0.52, M(0xd8b878)), 0, 0.56, 0);
          add(box(0.05, 0.56, 0.05, M(0x9a7b45)), 0.37, 0.28, 0.2); add(box(0.05, 0.56, 0.05, M(0x9a7b45)), -0.37, 0.28, 0.2);
          add(box(0.05, 0.56, 0.05, M(0x9a7b45)), 0.37, 0.28, -0.2); add(box(0.05, 0.56, 0.05, M(0x9a7b45)), -0.37, 0.28, -0.2);
          add(box(0.4, 0.4, 0.03, M(0xcaa868)), 0, 0.32, -0.24); break;
        case "firstaid":
          add(box(0.42, 0.32, 0.26, M(0xf0f0f0)), 0, 0.32, 0);
          add(box(0.14, 0.05, 0.02, M(0xd23b3b)), 0, 0.44, 0.14); add(box(0.05, 0.14, 0.02, M(0xd23b3b)), 0, 0.44, 0.14); break;
        case "board":
          add(box(0.98, 0.66, 0.04, M(0x8a6a45)), 0, 1, 0);
          add(box(0.88, 0.56, 0.02, M(0xf4f4ee)), 0, 1, 0.03);
          add(box(0.5, 0.36, 0.01, M(0x9ccc65)), -0.12, 1, 0.05); add(box(0.02, 0.36, 0.01, M(0x3d9bd6)), 0.16, 1, 0.05); break;
        case "tree":
          add(cyl(0.16, 0.22, 1.1, M(0x7a5230)), 0, 0.55, 0);
          add(sph(0.62, M(0x2e8c43)), 0, 1.4, 0); add(sph(0.44, M(0x349140)), 0.32, 1.2, 0.16); add(sph(0.4, M(0x267a3a)), -0.3, 1.25, -0.12); break;
        case "billboard":
          add(cyl(0.08, 0.08, 1.9, M(0x555a5f)), -0.5, 0.95, 0); add(cyl(0.08, 0.08, 1.9, M(0x555a5f)), 0.5, 0.95, 0);
          add(box(1.5, 0.8, 0.08, M(0xf0f0f0)), 0, 1.9, 0);
          add(box(1.3, 0.6, 0.02, M(0x3d9bd6)), 0, 1.9, 0.06); add(box(0.7, 0.16, 0.02, M(0xe23a2b)), -0.2, 2.02, 0.07); break;
        case "post":
          add(cyl(0.09, 0.11, 2.3, M(0x8a7a5a)), 0, 1.15, 0);
          add(box(0.9, 0.08, 0.08, M(0x6a5a3a)), 0, 2.1, 0); add(box(0.9, 0.08, 0.08, M(0x6a5a3a)), 0, 1.85, 0);
          add(cyl(0.03, 0.03, 0.12, M(0x2a2a2a)), -0.35, 2.2, 0); add(cyl(0.03, 0.03, 0.12, M(0x2a2a2a)), 0.35, 2.2, 0);
          add(cyl(0.012, 0.012, 2.6, M(0x1a1a1a)), 1.3, 2.1, 0, 0, 0, PI / 2 - 0.06); break;
        case "lowroad":
          add(box(1.3, 0.06, 1.4, M(0x3a3d42)), 0, 0.03, 0);
          add(box(1.3, 0.12, 0.14, M(0x9aa0a6)), 0, 0.1, 0.6); add(box(1.3, 0.12, 0.14, M(0x9aa0a6)), 0, 0.1, -0.6);
          add(box(1.1, 0.03, 1.0, glass(0x3a7fa0, 0.6)), 0, 0.03, 0); break;
        case "car":
          add(box(0.9, 0.26, 0.5, M(0xd23b3b)), 0, 0.28, 0);
          add(box(0.5, 0.24, 0.46, M(0xb83030)), -0.02, 0.5, 0);
          add(box(0.42, 0.18, 0.44, glass(0xbfe0f0, 0.5)), -0.02, 0.5, 0);
          add(cyl(0.12, 0.12, 0.1, M(0x1a1a1a)), 0.28, 0.14, 0.24, PI / 2, 0, 0); add(cyl(0.12, 0.12, 0.1, M(0x1a1a1a)), -0.28, 0.14, 0.24, PI / 2, 0, 0);
          add(cyl(0.12, 0.12, 0.1, M(0x1a1a1a)), 0.28, 0.14, -0.24, PI / 2, 0, 0); add(cyl(0.12, 0.12, 0.1, M(0x1a1a1a)), -0.28, 0.14, -0.24, PI / 2, 0, 0); break;
        case "garbage":
          add(box(0.8, 0.4, 0.6, M(0x6f7a3a)), 0, 0.2, 0);
          add(sph(0.2, M(0x9a8a45)), 0.22, 0.42, 0.1); add(sph(0.16, M(0x8a5a2b)), -0.2, 0.4, -0.08);
          add(box(0.14, 0.14, 0.14, M(0xcfd3d6)), 0.04, 0.5, 0.14); add(cyl(0.1, 0.11, 0.28, M(0x2a6f88)), -0.24, 0.14, 0.2); break;
        case "evaccenter":
          add(box(1.7, 0.9, 1.2, M(0xe4e0d2)), 0, 0.45, 0);
          add(box(1.9, 0.16, 1.4, M(0x7a9ab0)), 0, 0.98, 0);
          add(cone(1.1, 0.5, M(0x5a7a90), 4), 0, 1.3, 0, 0, PI / 4, 0);
          add(box(0.3, 0.4, 0.02, M(0x3a5a3a)), 0, 0.4, 0.61);
          add(box(0.5, 0.2, 0.02, M(0xffffff)), 0, 0.8, 0.61); break;
        case "building":
          add(box(1.3, 1.5, 1.1, M(0xcfc3a8)), 0, 0.75, 0);
          add(box(1.4, 0.16, 1.2, M(0x9a5a3a)), 0, 1.55, 0);
          add(box(0.3, 0.5, 0.02, M(0x6a4a2a)), 0, 0.25, 0.56);
          add(box(0.28, 0.28, 0.02, glass(0xbfe0f0, 0.5)), -0.35, 0.9, 0.56); add(box(0.28, 0.28, 0.02, glass(0xbfe0f0, 0.5)), 0.35, 0.9, 0.56); break;
        default:
          add(box(0.5, 0.5, 0.5, M(0x9aa7b0)), 0, 0.25, 0);
      }
      return g;
    },
    _buildItems: function () {
      var self = this, s = this.scene3, items = this.data.items;
      for (var i = 0; i < items.length; i++) {
        var it = items[i], grp = this._prop(it.kind);
        grp.position.set(it.x, it.y || 0, it.z);
        if (it.ry) grp.rotation.y = it.ry;
        (function (id) { grp.traverse(function (o) { if (o.isMesh) { o.userData.id = id; self._meshes.push(o); } }); })(it.id);
        s.add(grp); this._items[it.id] = grp;
      }
    },
    _mark: function (id) {
      var grp = this._items[id]; if (!grp || this._marks[id]) return;
      var m = new THREE.Group();
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 22), new THREE.MeshStandardMaterial({ color: 0xf2760c, emissive: 0x7a3a00, emissiveIntensity: 0.6 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.1; m.add(ring);
      var cone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0xf2760c, emissive: 0x7a3a00, emissiveIntensity: 0.6 }));
      cone.rotation.y = Math.PI / 4; cone.position.y = 2; m.add(cone);
      m.position.set(grp.position.x, 0, grp.position.z); this.scene3.add(m); this._marks[id] = m;
      grp.traverse(function (o) { if (o.isMesh && o.material) { try { o.material.emissive = new THREE.Color(0x4a1500); o.material.emissiveIntensity = 0.28; } catch (e) {} } });
    },

    _label: function (text) {
      var cv = document.createElement("canvas"); cv.width = 256; cv.height = 80;
      var x = cv.getContext("2d");
      x.fillStyle = "rgba(14,34,51,0.9)"; x.fillRect(8, 16, 240, 48);
      x.fillStyle = "#ffffff"; x.font = "bold 34px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 128, 42);
      var tex = new THREE.CanvasTexture(cv);
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
      sp.scale.set(1.5, 0.47, 1); return sp;
    },

    _bindInput: function (canvas) {
      var self = this, dragging = false, moved = false, sx = 0, sy = 0, lx = 0, ly = 0, pd = 0;
      function pt(e) { if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY }; }
      function dist2(e) { var a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
      this._down = function (e) { if (e.touches && e.touches.length >= 2) return; dragging = true; moved = false; var p = pt(e); sx = lx = p.x; sy = ly = p.y; };
      this._move = function (e) {
        if (self._pinching || !dragging) return; var p = pt(e);
        if (Math.hypot(p.x - sx, p.y - sy) > 6) moved = true;
        self.orbitYaw -= (p.x - lx) * 0.006; self.orbitPitch = Logic.clamp(self.orbitPitch + (p.y - ly) * 0.005, 0.45, 1.35);
        lx = p.x; ly = p.y; if (e.cancelable) e.preventDefault();
      };
      this._up = function (e) { if (!dragging) return; dragging = false; if (!moved && !self._pinching) self._tap(pt(e)); };
      this._wheel = function (e) { self.radius = Logic.clamp(self.radius + (e.deltaY > 0 ? 1 : -1) * (self._maxR - self._minR) * 0.08, self._minR, self._maxR); if (e.cancelable) e.preventDefault(); };
      this._tstart = function (e) { if (e.touches.length === 2) { self._pinching = true; pd = dist2(e); } };
      this._tmove = function (e) { if (e.touches.length === 2) { self._pinching = true; var d = dist2(e); if (pd > 0 && d > 0) self.radius = Logic.clamp(self.radius * (pd / d), self._minR, self._maxR); pd = d; if (e.cancelable) e.preventDefault(); } };
      this._tend = function (e) { if (e.touches.length < 2) { self._pinching = false; pd = 0; } };
      canvas.addEventListener("pointerdown", this._down);
      window.addEventListener("pointermove", this._move, { passive: false });
      window.addEventListener("pointerup", this._up);
      canvas.addEventListener("wheel", this._wheel, { passive: false });
      canvas.addEventListener("touchstart", this._tstart, { passive: false });
      canvas.addEventListener("touchmove", this._tmove, { passive: false });
      canvas.addEventListener("touchend", this._tend);
      this._unbind = function () { canvas.removeEventListener("pointerdown", self._down); window.removeEventListener("pointermove", self._move); window.removeEventListener("pointerup", self._up); };
    },
    zoom: function (dir) { if (!this.running) return; this.radius = Logic.clamp(this.radius + dir * (this._maxR - this._minR) * 0.14, this._minR, this._maxR); },

    _tap: function (pt) {
      if (!this.running || this._modalOpen) return;
      var c = document.getElementById("canvas-hazard"); if (!c) return;
      var r = c.getBoundingClientRect();
      var nd = new THREE.Vector2(((pt.x - r.left) / r.width) * 2 - 1, -((pt.y - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(nd, this.camera);
      var hits = this.raycaster.intersectObjects(this._meshes, false);
      if (!hits.length) return;
      var id = hits[0].object.userData.id; if (!id) return;
      var it = this.HZ.item(this.data, id); if (!it) return;
      if (this.scenarioMode) { this._tapScenario(it); return; }
      if (it.hazard) {
        if (!this._found[id]) { this._found[id] = true; this.foundN++; this._mark(id); this._syncHud(); if (this.foundN >= this.total) this._done = true; }
        this._openModal("bad", "Hazard spotted", it.name, "This becomes dangerous in " + this.HZ.eventWord(it.event) + ". " + it.why, "What to do: " + it.fix);
      } else {
        this.wrongTaps++;
        this._openModal("good", "This looks safe", it.name, it.why, "");
      }
    },
    _tapScenario: function (it) {
      var sc = this._scenarioName(this.scKey);
      if (this.HZ.isRiskIn(it, this.scKey)) {
        var r = it.risk[this.scKey];
        if (!this._foundBy[this.scKey][it.id]) {
          this._foundBy[this.scKey][it.id] = true; this._mark(it.id); this._syncHud();
          var need = this.HZ.riskCount(this.data, this.scKey), have = this._countFound(this.scKey);
          if (have >= need) { this._doneBy[this.scKey] = true; if (this._allScenariosDone()) this._done = true; else this._promptSwitch(); }
        }
        this._openModal("bad", "Risk in a " + sc.toLowerCase(), it.name, r.why, "What to do: " + r.fix);
      } else {
        this.wrongTaps++;
        var other = this._otherRiskNote(it);
        this._openModal("good", "Safe in a " + sc.toLowerCase(), it.name, (it.asset || "") + (other ? "  " + other : ""), "");
      }
    },
    _countFound: function (key) { var n = 0, f = this._foundBy[key] || {}; for (var k in f) if (f[k]) n++; return n; },
    _allScenariosDone: function () { for (var i = 0; i < this.data.scenarios.length; i++) if (!this._doneBy[this.data.scenarios[i].key]) return false; return true; },
    _scenarioName: function (key) { for (var i = 0; i < this.data.scenarios.length; i++) if (this.data.scenarios[i].key === key) return this.data.scenarios[i].name; return key; },
    _otherRiskNote: function (it) {
      if (!it.risk) return "";
      for (var i = 0; i < this.data.scenarios.length; i++) { var k = this.data.scenarios[i].key; if (k !== this.scKey && it.risk[k]) return "In a " + this.data.scenarios[i].name.toLowerCase() + ", though, it becomes a risk: " + it.risk[k].why; }
      return "";
    },
    _promptSwitch: function () {
      for (var i = 0; i < this.data.scenarios.length; i++) { var k = this.data.scenarios[i].key; if (!this._doneBy[k]) { this._toast("You found every " + this._scenarioName(this.scKey).toLowerCase() + " risk. Now tap " + this.data.scenarios[i].name + " to see how the same street changes.", "good", 4200); return; } }
    },
    _openModal: function (kind, head, name, why, fix) {
      var mh = document.getElementById("hazard-modal-head"), nm = document.getElementById("hazard-modal-name"),
          wy = document.getElementById("hazard-modal-why"), fx = document.getElementById("hazard-modal-fix"),
          ic = document.getElementById("hazard-modal-ic"), mo = document.getElementById("hazard-modal");
      if (mh) mh.textContent = head; if (nm) nm.textContent = name; if (wy) wy.textContent = why;
      if (ic) ic.textContent = kind === "bad" ? "\u26A0" : "\u2705";
      if (fx) { fx.textContent = fix; fx.style.display = fix ? "" : "none"; }
      if (mo) mo.classList.add("open");
      this._modalOpen = true;
      if (this.app) this.app.speak(kind === "bad" ? "Hazard spotted. " + name : name + " looks safe.");
    },
    _closeInspect: function () {
      var mo = document.getElementById("hazard-modal"); if (mo) mo.classList.remove("open");
      this._modalOpen = false;
      if (this._done) this._finish();
    },

    _syncHud: function () {
      var f = document.getElementById("hazard-found");
      if (this.scenarioMode) {
        var need = this.HZ.riskCount(this.data, this.scKey), have = this._countFound(this.scKey);
        if (f) f.textContent = "Risks: " + have + " of " + need;
        var sc = document.getElementById("hazard-scene"); if (sc) sc.textContent = this.data.name + ", " + this._scenarioName(this.scKey);
        this._updateScenarioButtons();
      } else {
        if (f) f.textContent = "Hazards: " + this.foundN + " of " + this.total;
        var sc2 = document.getElementById("hazard-scene"); if (sc2) sc2.textContent = this.data.name;
      }
    },

    _buildScenarioBar: function () {
      var bar = document.getElementById("hazard-scenarios"); if (!bar) return;
      bar.innerHTML = "";
      if (!this.scenarioMode) { bar.style.display = "none"; return; }
      bar.style.display = "flex"; var self = this;
      for (var i = 0; i < this.data.scenarios.length; i++) {
        (function (s) {
          var b = document.createElement("button"); b.textContent = s.name; b.setAttribute("data-key", s.key);
          b.addEventListener("click", function () { self._setScenario(s.key); });
          bar.appendChild(b);
        })(this.data.scenarios[i]);
      }
      this._updateScenarioButtons();
    },
    _updateScenarioButtons: function () {
      var bar = document.getElementById("hazard-scenarios"); if (!bar || !this.scenarioMode) return;
      var btns = bar.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) {
        var k = btns[i].getAttribute("data-key");
        btns[i].className = (k === this.scKey ? "on" : "") + (this._doneBy[k] ? " done" : "");
      }
    },
    _setScenario: function (key) {
      if (!this.scenarioMode || key === this.scKey || this._modalOpen) return;
      this.scKey = key;
      for (var id in this._marks) { if (this._marks[id]) this.scene3.remove(this._marks[id]); }
      this._marks = {};
      this._clearTints();
      var f = this._foundBy[key] || {};
      for (var fid in f) { if (f[fid]) this._mark(fid); }
      this._applySky(); this._syncHud();
      if (this.app) this.app.speak(this._scenarioName(key));
    },
    _clearTints: function () {
      for (var id in this._items) {
        if (!this._items[id]) continue;
        this._items[id].traverse(function (o) { if (o.isMesh && o.material && o.material.emissive) { try { o.material.emissiveIntensity = 0; } catch (e) {} } });
      }
    },
    _applySky: function () {
      var c = this.scenarioMode ? (this.scKey === "flood" ? 0x5f6b74 : 0x565e66) : 0x101c26;
      if (this.data.outdoor && !this.scenarioMode) c = 0x8fb0c8;
      if (this.scene3) this.scene3.background = new THREE.Color(c);
    },
    _buildStreet: function () {
      var s = this.scene3;
      function mk(geo, color, rough) { return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color, roughness: rough == null ? 0.95 : rough })); }
      function put(m, x, y, z, ry) { m.position.set(x, y, z); if (ry) m.rotation.y = ry; s.add(m); return m; }
      put(mk(new THREE.BoxGeometry(15, 0.1, 11), 0x7fa060), 0, -0.05, 0);
      put(mk(new THREE.BoxGeometry(15, 0.06, 2.0), 0x44474b), 0, 0.02, 0);
      for (var x = -6.5; x <= 6.5; x += 1.6) put(mk(new THREE.BoxGeometry(0.6, 0.07, 0.1), 0xf1d23a), x, 0.05, 0);
      put(mk(new THREE.BoxGeometry(15, 0.12, 0.5), 0xb9bcc0), 0, 0.06, 1.3);
      put(mk(new THREE.BoxGeometry(15, 0.12, 0.5), 0xb9bcc0), 0, 0.06, -1.3);
      put(mk(new THREE.BoxGeometry(15, 0.05, 0.7), 0x3a6f88), 0, 0.0, 2.7);
      put(mk(new THREE.BoxGeometry(15, 0.16, 0.08), 0x8a8f94), 0, 0.09, 2.32);
    },
    _toast: function (msg, kind, ms) {
      var el = document.getElementById("hazard-toast"); if (!el) return;
      el.textContent = msg; el.className = "sp-toast show " + (kind || "info");
      var self = this; clearTimeout(this._toastT);
      this._toastT = setTimeout(function () { el.className = "sp-toast " + (kind || "info"); }, ms || 2600);
    },

    _finish: function () {
      var stars = this.HZ.rateStars(this.wrongTaps);
      this.stop();
      var starEl = document.getElementById("hazard-stars");
      if (starEl) { var str = "", f = "\u2605", em = "\u2606"; for (var i = 0; i < 3; i++) str += (i < stars ? f : em); starEl.textContent = str; }
      var title = document.getElementById("hazard-result-title"), msg = document.getElementById("hazard-result-msg");
      if (this.scenarioMode) {
        if (title) title.textContent = "You read the whole street!";
        if (msg) msg.textContent = "Nicely done. The same street changed with the hazard: a shady tree becomes a risk in a typhoon, a low road becomes a risk in a flood. Knowing what turns risky, and when, is how communities stay safe.";
      } else {
        if (title) title.textContent = "You spotted every hazard!";
        if (msg) msg.textContent = this.wrongTaps === 0
          ? "Sharp eyes. Finding and fixing hazards before a disaster is how we keep families safe."
          : "You found all the hazards. Spotting them early, and fixing them, keeps everyone safer when a disaster comes.";
      }
      var earned = (stars >= 3 && this.app && this.app.badges) ? this.app.badges.earn("hazard") : false;
      var note = document.getElementById("hazard-badge-note"); if (note) note.style.display = earned ? "" : "none";
      var next = document.getElementById("btn-hazard-next"); if (next) next.style.display = (this.scene < this.HZ.SCENES.length - 1) ? "" : "none";
      if (this.app) { this.app.show("screen-hazard-result"); this.app.speak("You spotted every hazard."); }
    },

    _onResize: function () { var c = document.getElementById("canvas-hazard"); if (!c) return; var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); },
    _updateCamera: function () {
      var cp = Math.cos(this.orbitPitch), sp = Math.sin(this.orbitPitch);
      this.camera.position.set(this.center.x + this.radius * cp * Math.sin(this.orbitYaw), this.center.y + this.radius * sp, this.center.z + this.radius * cp * Math.cos(this.orbitYaw));
      this.camera.lookAt(this.center);
    },
    _loop: function (now) {
      if (!this.running) return; var self = this;
      this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      var k = 0; for (var id in this._marks) { if (this._marks[id]) { var m = this._marks[id]; m.children[1].position.y = 2 + Math.sin(now * 0.005 + k) * 0.08; m.rotation.y = now * 0.001; k++; } }
      this._updateCamera();
      this.renderer.render(this.scene3, this.camera);
    }
  };
  if (typeof window !== "undefined") window.HazardHunt = HazardHunt;

  /* =====================================================================
     5g) CARES  (Recovery: Community And Resilience)
     Build a community on a topographic map with a stream, reach a
     population goal, choose a hazard, then simulate. Water flows to the
     lowest ground by gravity. Learn gray and green infrastructure.
     ===================================================================== */
  var CARES = {
    running: false, _raf: null, CA: Logic.cares,
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this.app = app;
      var oldCanvas = document.getElementById("canvas-cares");
      var canvas = oldCanvas.cloneNode(false); oldCanvas.parentNode.replaceChild(canvas, oldCanvas);
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      this.scene3 = new THREE.Scene(); this.scene3.background = new THREE.Color(0x9fc0d8);
      this.camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 100);
      this.raycaster = new THREE.Raycaster();

      this.tiles = this.CA.empty(); this.tool = "H"; this.scKey = "flood"; this._simDone = false;
      this.stepH = 0.34;
      this.center = new THREE.Vector3(0, 0.6, 0);
      this.orbitYaw = 0.6; this.orbitPitch = 0.82; this.radius = this.CA.W * 1.5 + 3; this._minR = this.CA.W; this._maxR = this.CA.W * 2.4;

      this.scene3.add(new THREE.HemisphereLight(0xf3f6f8, 0x384048, 1.05));
      var dl = new THREE.DirectionalLight(0xffffff, 0.5); dl.position.set(5, 9, 6); this.scene3.add(dl);

      this._cells = []; this._props = {}; this._meshes = []; this._water = null;
      this._buildBoard(); this._updateCamera();
      this._buildPalette(); this._buildScenBar(); this._syncHud();
      this._toast("Build homes on high ground, add green and gray protection, then press Simulate.", "info", 5000);

      var self = this;
      this._bindInput(canvas);
      this._sim = function () { self.simulate(); };
      var sb = document.getElementById("btn-cares-sim"); if (sb) sb.addEventListener("click", this._sim);
      this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize);
      this.running = true; this._loop(performance.now());
    },
    stop: function () {
      this.running = false; if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      if (this._resize) window.removeEventListener("resize", this._resize);
      if (this._unbind) this._unbind();
      var sb = document.getElementById("btn-cares-sim"); if (sb && this._sim) sb.removeEventListener("click", this._sim);
      if (this._toastT) clearTimeout(this._toastT);
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },

    _cellXZ: function (i) { var p = this.CA.rc(i); return { x: p.c - (this.CA.W - 1) / 2, z: p.r - (this.CA.H - 1) / 2 }; },
    _elevColor: function (e) { return e >= 5 ? 0x8a9a52 : e >= 4 ? 0x9cb45f : e >= 3 ? 0xc7b56a : e >= 2 ? 0xd9c98a : 0x8fd0e6; },
    _cellTop: function (i) { return this.CA.ELEV[i] * this.stepH; },
    _buildBoard: function () {
      var s = this.scene3, CA = this.CA;
      for (var i = 0; i < CA.W * CA.H; i++) {
        var pos = this._cellXZ(i), e = CA.ELEV[i], hgt = e * this.stepH, stream = CA.isStream(i);
        var col = new THREE.Mesh(new THREE.BoxGeometry(0.96, hgt, 0.96), new THREE.MeshStandardMaterial({ color: stream ? 0x3f86b0 : this._elevColor(e) }));
        col.position.set(pos.x, hgt / 2, pos.z); col.userData = { idx: i }; s.add(col); this._cells[i] = col; this._meshes.push(col);
        if (stream) { var wtr = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.06, 0.98), new THREE.MeshStandardMaterial({ color: 0x4aa3d0, transparent: true, opacity: 0.85 })); wtr.position.set(pos.x, hgt + 0.02, pos.z); s.add(wtr); }
      }
      var sMid = CA.STREAM[Math.floor(CA.STREAM.length / 2)];
      this._addLabel("Stream", this._cellXZ(sMid), this._cellTop(sMid) + 0.5);
      var hi = CA.highGroundCell();
      this._addLabel("High ground", this._cellXZ(hi), this._cellTop(hi) + 0.5);
    },
    _prop: function (kind) {
      var g = new THREE.Group();
      function M(c, r) { return new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? 0.8 : r }); }
      function box(x, y, z, m) { return new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m); }
      function cyl(a, b, hh, m) { return new THREE.Mesh(new THREE.CylinderGeometry(a, b, hh, 14), m); }
      function sph(r, m) { return new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), m); }
      function cone(r, hh, m) { return new THREE.Mesh(new THREE.ConeGeometry(r, hh, 14), m); }
      function add(mesh, x, y, z, ry) { mesh.position.set(x || 0, y || 0, z || 0); if (ry) mesh.rotation.y = ry; g.add(mesh); return mesh; }
      switch (kind) {
        case "H": add(box(0.5, 0.36, 0.5, M(0xe4d3a8)), 0, 0.18, 0); add(cone(0.42, 0.28, M(0xb15a3a)), 0, 0.5, 0, Math.PI / 4); add(box(0.12, 0.16, 0.02, M(0x7a5a3a)), 0, 0.12, 0.25); break;
        case "D": add(box(0.86, 0.34, 0.2, M(0x9299a0)), 0, 0.17, 0); add(box(0.86, 0.06, 0.24, M(0x7a828a)), 0, 0.34, 0); break;
        case "C": add(box(0.7, 0.1, 0.28, M(0x6b7278)), 0, 0.05, 0); add(box(0.6, 0.06, 0.18, new THREE.MeshStandardMaterial({ color: 0x4aa3d0, transparent: true, opacity: 0.85 })), 0, 0.06, 0); break;
        case "P": add(box(0.4, 0.3, 0.4, M(0x8a9098)), 0, 0.15, 0); add(cyl(0.06, 0.06, 0.3, M(0x5a616a)), 0.16, 0.32, 0, 0); add(box(0.16, 0.1, 0.16, M(0xd23b3b)), -0.1, 0.34, 0); break;
        case "M": add(cyl(0.04, 0.05, 0.24, M(0x7a5230)), -0.16, 0.12, 0.1); add(cyl(0.04, 0.05, 0.24, M(0x7a5230)), 0.16, 0.12, -0.1); add(sph(0.2, M(0x2f7a3a)), -0.12, 0.32, 0.08); add(sph(0.22, M(0x349140)), 0.14, 0.34, -0.06); add(sph(0.16, M(0x267a3a)), 0, 0.3, 0.16); break;
        case "R": add(cyl(0.42, 0.46, 0.14, M(0x6b7a55)), 0, 0.07, 0); add(cyl(0.34, 0.34, 0.1, new THREE.MeshStandardMaterial({ color: 0x3f86b0, transparent: true, opacity: 0.85 })), 0, 0.1, 0); break;
        case "T": add(cyl(0.05, 0.06, 0.26, M(0x7a5230)), -0.14, 0.13, 0.06); add(sph(0.2, M(0x2e8c43)), -0.14, 0.34, 0.06); add(cyl(0.05, 0.06, 0.3, M(0x7a5230)), 0.16, 0.15, -0.08); add(sph(0.22, M(0x349140)), 0.16, 0.38, -0.08); break;
        default: add(box(0.4, 0.4, 0.4, M(0x9aa7b0)), 0, 0.2, 0);
      }
      return g;
    },
    _placeTile: function (i) {
      if (this._props[i]) { this.scene3.remove(this._props[i]); delete this._props[i]; }
      var t = this.tiles[i]; if (!t) return;
      var grp = this._prop(t), pos = this._cellXZ(i);
      grp.position.set(pos.x, this._cellTop(i), pos.z); this.scene3.add(grp); this._props[i] = grp;
    },

    _addLabel: function (text, pos, y) {
      var cv = document.createElement("canvas"); cv.width = 256; cv.height = 72;
      var x = cv.getContext("2d"); x.fillStyle = "rgba(14,34,51,0.85)"; x.fillRect(6, 14, 244, 44);
      x.fillStyle = "#fff"; x.font = "bold 30px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 128, 38);
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false, depthWrite: false }));
      sp.scale.set(1.4, 0.4, 1); sp.position.set(pos.x, y, pos.z); this.scene3.add(sp);
    },

    _bindInput: function (canvas) {
      var self = this, dragging = false, moved = false, sx = 0, sy = 0, lx = 0, ly = 0, pd = 0;
      function pt(e) { if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY }; }
      function dist2(e) { var a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
      this._down = function (e) { if (e.touches && e.touches.length >= 2) return; dragging = true; moved = false; var p = pt(e); sx = lx = p.x; sy = ly = p.y; };
      this._move = function (e) {
        if (self._pinching || !dragging) return; var p = pt(e);
        if (Math.hypot(p.x - sx, p.y - sy) > 6) moved = true;
        self.orbitYaw -= (p.x - lx) * 0.006; self.orbitPitch = Logic.clamp(self.orbitPitch + (p.y - ly) * 0.005, 0.5, 1.32);
        lx = p.x; ly = p.y; if (e.cancelable) e.preventDefault();
      };
      this._up = function (e) { if (!dragging) return; dragging = false; if (!moved && !self._pinching) self._tap(pt(e)); };
      this._wheel = function (e) { self.radius = Logic.clamp(self.radius + (e.deltaY > 0 ? 1 : -1) * (self._maxR - self._minR) * 0.08, self._minR, self._maxR); if (e.cancelable) e.preventDefault(); };
      this._tstart = function (e) { if (e.touches.length === 2) { self._pinching = true; pd = dist2(e); } };
      this._tmove = function (e) { if (e.touches.length === 2) { self._pinching = true; var d = dist2(e); if (pd > 0 && d > 0) self.radius = Logic.clamp(self.radius * (pd / d), self._minR, self._maxR); pd = d; if (e.cancelable) e.preventDefault(); } };
      this._tend = function (e) { if (e.touches.length < 2) { self._pinching = false; pd = 0; } };
      canvas.addEventListener("pointerdown", this._down);
      window.addEventListener("pointermove", this._move, { passive: false });
      window.addEventListener("pointerup", this._up);
      canvas.addEventListener("wheel", this._wheel, { passive: false });
      canvas.addEventListener("touchstart", this._tstart, { passive: false });
      canvas.addEventListener("touchmove", this._tmove, { passive: false });
      canvas.addEventListener("touchend", this._tend);
      this._unbind = function () { canvas.removeEventListener("pointerdown", self._down); window.removeEventListener("pointermove", self._move); window.removeEventListener("pointerup", self._up); };
    },
    zoom: function (dir) { if (!this.running) return; this.radius = Logic.clamp(this.radius + dir * (this._maxR - this._minR) * 0.14, this._minR, this._maxR); },

    _tap: function (pt) {
      if (!this.running || this._simDone) return;
      var c = document.getElementById("canvas-cares"); if (!c) return;
      var r = c.getBoundingClientRect();
      var nd = new THREE.Vector2(((pt.x - r.left) / r.width) * 2 - 1, -((pt.y - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(nd, this.camera);
      var hits = this.raycaster.intersectObjects(this._meshes, false);
      if (!hits.length) return;
      var i = hits[0].object.userData.idx; if (i === undefined) return;
      if (!this.CA.canBuild(i)) { this._toast("You cannot build on the stream. Keep the waterway clear.", "bad", 2200); return; }
      if (this.tool === "erase") { this.tiles[i] = ""; this._placeTile(i); }
      else {
        this.tiles[i] = this.tool; this._placeTile(i);
        if (this.tool === "H" && this.CA.ELEV[i] <= 2) this._toast("That house is on low ground near the stream. It may flood.", "info", 2400);
        if (this.tool === "M" && !this.CA.adjStream(i)) this._toast("Mangroves work best right next to the stream.", "info", 2400);
      }
      this._syncHud();
    },

    _buildPalette: function () {
      var bar = document.getElementById("cares-palette"); if (!bar) return;
      bar.innerHTML = ""; var self = this;
      var tools = this.CA.TOOLS.concat([{ key: "erase", name: "Erase", group: "erase", desc: "Remove what is on a cell." }]);
      for (var i = 0; i < tools.length; i++) {
        (function (tl) {
          var b = document.createElement("button"); b.setAttribute("data-key", tl.key); b.className = "cares-tool g-" + tl.group;
          b.innerHTML = "<span class='ct-ic'>" + self._toolIcon(tl.key) + "</span><span class='ct-nm'>" + tl.name + "</span>";
          b.addEventListener("click", function () { self.tool = tl.key; self._toast(tl.desc, tl.group === "green" ? "good" : "info", 3200); self._syncPalette(); });
          bar.appendChild(b);
        })(tools[i]);
      }
      this._syncPalette();
    },
    _toolIcon: function (k) { return { H: "\uD83C\uDFE0", D: "\uD83E\uDDF1", C: "\uD83D\uDEB0", P: "\u2699", M: "\uD83C\uDF3F", R: "\uD83D\uDCA7", T: "\uD83C\uDF33", erase: "\u2715" }[k] || "?"; },
    _syncPalette: function () {
      var bar = document.getElementById("cares-palette"); if (!bar) return;
      var btns = bar.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) btns[i].classList.toggle("on", btns[i].getAttribute("data-key") === this.tool);
      var tl = document.getElementById("cares-tool"); if (tl) { var t = this._toolName(this.tool); tl.textContent = "Placing: " + t; }
    },
    _toolName: function (k) { if (k === "erase") return "Erase"; for (var i = 0; i < this.CA.TOOLS.length; i++) if (this.CA.TOOLS[i].key === k) return this.CA.TOOLS[i].name; return k; },
    _buildScenBar: function () {
      var bar = document.getElementById("cares-scen"); if (!bar) return;
      bar.innerHTML = ""; var self = this, keys = ["flood", "storm"];
      for (var i = 0; i < keys.length; i++) {
        (function (k) {
          var b = document.createElement("button"); b.setAttribute("data-key", k); b.textContent = self.CA.SCEN[k].name;
          b.addEventListener("click", function () { self.scKey = k; self._syncScen(); self._toast(k === "storm" ? "A severe storm brings much more water." : "A moderate flood from heavy rain.", "info", 2600); });
          bar.appendChild(b);
        })(keys[i]);
      }
      this._syncScen();
    },
    _syncScen: function () { var bar = document.getElementById("cares-scen"); if (!bar) return; var b = bar.querySelectorAll("button"); for (var i = 0; i < b.length; i++) b[i].classList.toggle("on", b[i].getAttribute("data-key") === this.scKey); },
    _syncHud: function () {
      var p = document.getElementById("cares-pop"); if (p) { var pop = this.CA.population(this.tiles); p.textContent = "People: " + pop + " of " + this.CA.GOAL; p.className = "sapa-chip " + (pop >= this.CA.GOAL ? "on" : ""); }
    },
    _toast: function (msg, kind, ms) {
      var el = document.getElementById("cares-toast"); if (!el) return;
      el.textContent = msg; el.className = "sp-toast show " + (kind || "info");
      var self = this; clearTimeout(this._toastT); this._toastT = setTimeout(function () { el.className = "sp-toast " + (kind || "info"); }, ms || 2800);
    },

    simulate: function () {
      if (!this.running || this._simDone) return;
      var res = this.CA.simulate(this.tiles, this.scKey);
      this._simDone = true;
      var sb = document.getElementById("btn-cares-sim"); if (sb) sb.disabled = true;
      // rising water box up to the flood level
      var lvlY = res.level * this.stepH;
      if (this._water) this.scene3.remove(this._water);
      this._water = new THREE.Mesh(new THREE.BoxGeometry(this.CA.W + 0.2, Math.max(0.02, lvlY), this.CA.H + 0.2), new THREE.MeshStandardMaterial({ color: 0x3f86b0, transparent: true, opacity: 0.5 }));
      this._water.position.set(0, 0.001, 0); this._water.scale.y = 0.01; this.scene3.add(this._water);
      // mark flooded houses
      for (var k = 0; k < res.houseFlooded.length; k++) { var g = this._props[res.houseFlooded[k]]; if (g) g.traverse(function (o) { if (o.isMesh && o.material) { o.material.color = new THREE.Color(0x8a4a4a); } }); }
      var self = this, t0 = performance.now();
      this._rising = function (now) {
        var k2 = Math.min(1, (now - t0) / 1100); self._water.scale.y = Math.max(0.01, k2); self._water.position.y = (lvlY * k2) / 2;
        if (k2 < 1) self._raf2 = requestAnimationFrame(self._rising); else self._finish(res);
      };
      this._raf2 = requestAnimationFrame(this._rising);
      if (this.app) this.app.speak(res.pct >= 0.7 && res.goalMet ? "The community holds." : "Some homes flooded.");
    },
    _finish: function (res) {
      var stars = this.CA.rateStars(res);
      this.stop();
      var starEl = document.getElementById("cares-stars");
      if (starEl) { var str = "", f = "\u2605", em = "\u2606"; for (var i = 0; i < 3; i++) str += (i < stars ? f : em); starEl.textContent = str; }
      var title = document.getElementById("cares-result-title"), msg = document.getElementById("cares-result-msg");
      var pct = Math.round(res.pct * 100);
      if (title) title.textContent = !res.goalMet ? "Keep building" : (res.pct >= 0.9 ? "A resilient community!" : res.pct >= 0.7 ? "Almost there" : "The community flooded");
      if (msg) msg.textContent = (res.goalMet ? pct + " out of 100 residents stayed safe. " : "") + this.CA.verdict(res);
      var earned = (stars >= 3 && this.app && this.app.badges) ? this.app.badges.earn("cares") : false;
      var note = document.getElementById("cares-badge-note"); if (note) note.style.display = earned ? "" : "none";
      if (this.app) { this.app.show("screen-cares-result"); this.app.speak(res.goalMet && res.pct >= 0.9 ? "A resilient community." : "Try again to protect more homes."); }
    },

    _onResize: function () { var c = document.getElementById("canvas-cares"); if (!c) return; var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); },
    _updateCamera: function () {
      var cp = Math.cos(this.orbitPitch), sp = Math.sin(this.orbitPitch);
      this.camera.position.set(this.center.x + this.radius * cp * Math.sin(this.orbitYaw), this.center.y + this.radius * sp, this.center.z + this.radius * cp * Math.cos(this.orbitYaw));
      this.camera.lookAt(this.center);
    },
    _loop: function (now) {
      if (!this.running) return; var self = this;
      this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      this._updateCamera();
      this.renderer.render(this.scene3, this.camera);
    }
  };
  if (typeof window !== "undefined") window.CARES = CARES;

  /* =====================================================================
     5h) DUCK, COVER, AND HOLD  (Response: earthquake drill)
     The room shakes. Drop, take cover under the sturdy table, hold on
     until it stops, then evacuate calmly.
     ===================================================================== */
  var QuakeGame = {
    running: false, _raf: null, QK: Logic.quake,
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this.app = app;
      var oldC = document.getElementById("canvas-quake");
      var canvas = oldC.cloneNode(false); oldC.parentNode.replaceChild(canvas, oldC);
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      this.scene3 = new THREE.Scene(); this.scene3.background = new THREE.Color(0x14212b);
      this.camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 100);
      this.raycaster = new THREE.Raycaster();
      this.camBase = new THREE.Vector3(4.5, 4.2, 6.2);

      this.phase = "intro"; this.round = 1; this.copyIndex = 0; this.mistakes = 0;
      this._watchT = []; this._seqTok = 0;

      this.scene3.add(new THREE.HemisphereLight(0xeef3f6, 0x33393f, 1.05));
      var dl = new THREE.DirectionalLight(0xffffff, 0.55); dl.position.set(5, 9, 6); this.scene3.add(dl);

      this._hazMeshes = [];
      this._buildRoom(); this._buildKid(); this._setPose("stand");
      this.camera.position.copy(this.camBase); this.camera.lookAt(0.3, 0.6, 0.4);
      this._setButtons(false); this._syncRound();
      this._say("Watch the coach, then copy the moves in the same order.");

      var self = this;
      this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize);
      this.running = true;
      this._watchT.push(setTimeout(function () { self._beginRound(); }, 1600));
      this._loop(performance.now());
    },
    stop: function () {
      this.running = false; if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      this._seqTok++; this._clearWatch(); if (this._toastT) clearTimeout(this._toastT);
      if (this._resize) window.removeEventListener("resize", this._resize);
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },
    _clearWatch: function () { if (this._watchT) { for (var i = 0; i < this._watchT.length; i++) clearTimeout(this._watchT[i]); this._watchT = []; } },

    _m: function (geo, color, x, y, z, ry) { var mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color })); mesh.position.set(x || 0, y || 0, z || 0); if (ry) mesh.rotation.y = ry; return mesh; },
    _buildRoom: function () {
      var s = this.scene3;
      s.add(this._m(new THREE.BoxGeometry(7, 0.2, 6.5), 0xd7c39a, 0, -0.1, 0));
      s.add(this._m(new THREE.BoxGeometry(7, 3.2, 0.16), 0xe6ebee, 0, 1.5, -3.25));
      s.add(this._m(new THREE.BoxGeometry(0.16, 3.2, 6.5), 0xdde3e7, -3.5, 1.5, 0));
      // sturdy table (the safe cover)
      var t = new THREE.Group();
      t.add(this._m(new THREE.BoxGeometry(1.9, 0.12, 1.3), 0xb9803f, 0, 0.86, 0));
      var lp = [[-0.85, -0.55], [0.85, -0.55], [-0.85, 0.55], [0.85, 0.55]];
      for (var i = 0; i < 4; i++) t.add(this._m(new THREE.BoxGeometry(0.14, 0.86, 0.14), 0x8a5a2a, lp[i][0], 0.43, lp[i][1]));
      t.position.set(0.6, 0, 0.4); s.add(t); this._table = t; this._tablePos = new THREE.Vector3(0.6, 0, 0.4);
      var top = t.children[0]; top.userData = { haz: "table" }; this._hazMeshes.push(top);
      // window (hazard)
      var win = new THREE.Group();
      win.add(this._m(new THREE.BoxGeometry(1.3, 1.3, 0.08), 0x7a93a5, 0, 0, 0));
      var glass = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.03), new THREE.MeshStandardMaterial({ color: 0xbfe0f0, transparent: true, opacity: 0.5 }));
      glass.position.z = 0.04; win.add(glass); win.position.set(2.1, 1.5, -3.16); s.add(win);
      glass.userData = { haz: "window" }; this._hazMeshes.push(glass);
      // tall shelf with books (hazard)
      var sh = new THREE.Group();
      sh.add(this._m(new THREE.BoxGeometry(0.9, 2.2, 0.4), 0x9c6b3f, 0, 1.1, 0));
      var books = this._m(new THREE.BoxGeometry(0.7, 0.3, 0.3), 0xcf3b3b, 0, 2.0, 0.05); sh.add(books);
      sh.position.set(-3.0, 0, -1.6); s.add(sh); this._shelf = sh; this._shelfBooks = books;
      var shHit = sh.children[0]; shHit.userData = { haz: "shelf" }; this._hazMeshes.push(shHit);
      // hanging lamp (swings)
      var lamp = new THREE.Group();
      lamp.add(this._m(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8), 0x555a5f, 0, 2.55, 0));
      lamp.add(this._m(new THREE.ConeGeometry(0.24, 0.24, 12), 0xf1d24a, 0, 2.15, 0));
      lamp.position.set(-0.6, 0, -0.8); s.add(lamp); this._lamp = lamp;
      // door (exit)
      s.add(this._m(new THREE.BoxGeometry(0.1, 2.0, 1.0), 0x6a4a2a, -3.44, 1.0, 2.2));
      this._exit = new THREE.Vector3(-3.0, 0, 2.2);
      var sign = this._label("EXIT"); sign.position.set(-3.0, 2.2, 2.2); s.add(sign);
    },
    _buildKid: function () {
      var k = new THREE.Group();
      var skin = 0xe0a066, shirt = 0x2f7fc1, pants = 0x35506b;
      this._torso = this._m(new THREE.CylinderGeometry(0.17, 0.2, 0.5, 12), shirt, 0, 0.72, 0); k.add(this._torso);
      this._head = this._m(new THREE.SphereGeometry(0.17, 14, 12), skin, 0, 1.05, 0); k.add(this._head);
      this._armL = this._m(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 8), skin, -0.22, 0.74, 0); k.add(this._armL);
      this._armR = this._m(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 8), skin, 0.22, 0.74, 0); k.add(this._armR);
      this._legL = this._m(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), pants, -0.09, 0.25, 0); k.add(this._legL);
      this._legR = this._m(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), pants, 0.09, 0.25, 0); k.add(this._legR);
      k.position.set(-1.8, 0, 1.6); this.scene3.add(k); this._kid = k; this._kidHome = k.position.clone();
    },
    _setPose: function (pose) {
      var k = this._kid; if (!k) return;
      if (pose === "stand") {
        k.rotation.set(0, 0.5, 0); k.scale.set(1, 1, 1);
        this._armL.position.set(-0.22, 0.74, 0); this._armL.rotation.set(0, 0, 0);
        this._armR.position.set(0.22, 0.74, 0); this._armR.rotation.set(0, 0, 0);
      } else if (pose === "drop") {
        k.rotation.set(0.9, 0.5, 0); k.scale.set(1, 1, 1); k.position.y = 0.0;
      } else if (pose === "cover" || pose === "hold") {
        k.position.set(this._tablePos.x - 0.1, 0, this._tablePos.z + 0.1); k.rotation.set(0.9, 2.2, 0); k.scale.set(1, 0.72, 1);
        // hands over head
        this._armL.position.set(-0.12, 1.12, 0.06); this._armL.rotation.set(0, 0, 1.4);
        this._armR.position.set(0.12, 1.12, 0.06); this._armR.rotation.set(0, 0, -1.4);
      } else if (pose === "evacuate") {
        k.position.set(this._tablePos.x - 0.9, 0, this._tablePos.z + 1.1); k.rotation.set(0, 1.1, 0); k.scale.set(1, 1, 1);
        this._armL.position.set(-0.22, 0.74, 0); this._armL.rotation.set(0.9, 0, 0);
        this._armR.position.set(0.22, 0.78, 0.12); this._armR.rotation.set(1.4, 0, 0);
      }
      this._pose = pose;
    },

    _say: function (msg) { var el = document.getElementById("quake-say"); if (el) el.textContent = msg; },
    _setButtons: function (on) {
      ["drop", "cover", "hold", "evacuate"].forEach(function (a) {
        var b = document.getElementById("btn-quake-" + (a === "evacuate" ? "evac" : a)); if (!b) return;
        b.disabled = !on; b.classList.toggle("armed", on); b.classList.remove("bad");
      });
    },
    _flash: function (a, cls) {
      var b = document.getElementById("btn-quake-" + (a === "evacuate" ? "evac" : a)); if (!b) return;
      b.classList.add(cls); var self = this; setTimeout(function () { b.classList.remove(cls); }, 420);
    },
    _syncRound: function () {
      var rc = document.getElementById("quake-round"); if (rc) rc.textContent = "Round " + this.round + " of " + this.QK.totalRounds();
      var dots = document.getElementById("quake-dots"); if (!dots) return;
      var len = this.QK.roundLength(this.round), html = "";
      for (var i = 0; i < len; i++) html += '<span class="qdot' + (this.phase === "copy" && i < this.copyIndex ? " on" : "") + '"></span>';
      dots.innerHTML = html;
    },
    _beginRound: function () {
      if (!this.running) return;
      this.phase = "watch"; this.copyIndex = 0; this._setButtons(false); this._syncRound();
      this._say("Watch the coach.");
      var self = this, len = this.QK.roundLength(this.round), stepMs = Math.max(700, 1050 - this.round * 70);
      var tok = ++this._seqTok; this._clearWatch();
      var t = 400;
      for (var i = 0; i < len; i++) {
        (function (k) {
          self._watchT.push(setTimeout(function () { if (tok !== self._seqTok) return; self._setPose("stand"); }, t));
          self._watchT.push(setTimeout(function () { if (tok !== self._seqTok) return; var a = self.QK.SEQUENCE[k]; self._setPose(a); self._say(self.QK.actionLabel(a)); self._flash(a, "cue"); if (self.app) self.app.speak(self.QK.actionLabel(a)); }, t + 180));
        })(i);
        t += stepMs;
      }
      this._watchT.push(setTimeout(function () { if (tok !== self._seqTok) return; self._setPose("stand"); self._startCopy(); }, t + 300));
    },
    _startCopy: function () {
      if (!this.running) return;
      this.phase = "copy"; this.copyIndex = 0; this._setButtons(true); this._syncRound();
      this._say("Now you do it. Tap the moves in the same order.");
      if (this.app) this.app.speak("Now you do it.");
    },
    _tapAction: function (a) {
      if (this.phase !== "copy") return;
      var expected = this.QK.SEQUENCE[this.copyIndex];
      if (a !== expected) {
        this.mistakes++; this._flash(a, "bad");
        this._say("That was " + this.QK.actionLabel(a) + ". The next move is " + this.QK.actionLabel(expected) + ".");
        return;
      }
      this._setPose(a); this._flash(a, "cue"); this.copyIndex++; this._syncRound();
      if (this.copyIndex >= this.QK.roundLength(this.round)) {
        this._setButtons(false);
        var self = this;
        if (this.round >= this.QK.totalRounds()) { this._say("Great, you did the whole drill!"); this._watchT.push(setTimeout(function () { self._finish(); }, 900)); }
        else { this._say("Nice. Here comes one more move."); this.round++; this._watchT.push(setTimeout(function () { self._beginRound(); }, 1100)); }
      } else {
        this._say("Good. Next move.");
      }
    },
    _finish: function () {
      var stars = this.QK.rateImitation(this.mistakes);
      this.stop();
      var starEl = document.getElementById("quake-stars");
      if (starEl) { var str = "", f = "\u2605", em = "\u2606"; for (var i = 0; i < 3; i++) str += (i < stars ? f : em); starEl.textContent = str; }
      var title = document.getElementById("quake-result-title"), msg = document.getElementById("quake-result-msg");
      if (title) title.textContent = this.mistakes === 0 ? "Perfect copy!" : "Drill complete";
      if (msg) msg.textContent = "You copied the whole drill: drop, take cover under the sturdy table, hold on until the shaking stops, then walk out calmly. Never run outside while the ground is still shaking.";
      var earned = (stars >= 2 && this.app && this.app.badges) ? this.app.badges.earn("quake") : false;
      var note = document.getElementById("quake-badge-note"); if (note) note.style.display = earned ? "" : "none";
      if (this.app) { this.app.show("screen-quake-result"); this.app.speak("Drill complete."); }
    },

    _onResize: function () { var c = document.getElementById("canvas-quake"); if (!c) return; var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); },
    _loop: function (now) {
      if (!this.running) return; var self = this; this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      if (this._lamp) this._lamp.rotation.z = Math.sin(now * 0.004) * 0.12;
      this.renderer.render(this.scene3, this.camera);
    }
  };
  if (typeof window !== "undefined") window.QuakeGame = QuakeGame;

  /* =====================================================================
     5i) HANDS-ONLY CPR  (Response: tap the beat, push hard and fast)
     ===================================================================== */
  var CPRGame = {
    running: false, _raf: null, CP: Logic.cpr,
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this.app = app;
      var oldC = document.getElementById("canvas-cpr");
      var canvas = oldC.cloneNode(false); oldC.parentNode.replaceChild(canvas, oldC);
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      this.scene3 = new THREE.Scene(); this.scene3.background = new THREE.Color(0x14212b);
      this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
      this.camera.position.set(0, 3.6, 4.6); this.camera.lookAt(0, 0.3, 0);

      this.phase = "call"; this.count = 0; this.good = 0; this.ok = 0; this._beatStart = 0; this._push = 0;
      this.scene3.add(new THREE.HemisphereLight(0xeef3f6, 0x33393f, 1.1));
      var dl = new THREE.DirectionalLight(0xffffff, 0.5); dl.position.set(3, 8, 5); this.scene3.add(dl);
      this._build();
      this._say("Someone collapsed. First, call for help.");
      this._setPhaseUi();

      var self = this;
      var pb = document.getElementById("btn-cpr-push");
      this._push1 = function (e) { self._tap(); if (e && e.cancelable) e.preventDefault(); };
      if (pb) { pb.addEventListener("pointerdown", this._push1); }
      this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize);
      this.running = true; this._loop(performance.now());
    },
    stop: function () {
      this.running = false; if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      if (this._resize) window.removeEventListener("resize", this._resize);
      var pb = document.getElementById("btn-cpr-push"); if (pb && this._push1) pb.removeEventListener("pointerdown", this._push1);
      if (this._toastT) clearTimeout(this._toastT);
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },
    _m: function (geo, color, x, y, z, rx) { var mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color })); mesh.position.set(x || 0, y || 0, z || 0); if (rx) mesh.rotation.x = rx; return mesh; },
    _build: function () {
      var s = this.scene3;
      s.add(this._m(new THREE.BoxGeometry(6, 0.2, 4), 0xc9d2d6, 0, -0.1, 0));
      // person lying down (along x)
      var p = new THREE.Group();
      p.add(this._m(new THREE.CylinderGeometry(0.34, 0.34, 1.7, 16), 0x2f7fc1, 0, 0.34, 0, Math.PI / 2));
      p.add(this._m(new THREE.SphereGeometry(0.28, 16, 12), 0xe0a066, -1.1, 0.3, 0));
      p.add(this._m(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 10), 0x35506b, 0.95, 0.22, -0.18, Math.PI / 2));
      p.add(this._m(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 10), 0x35506b, 0.95, 0.22, 0.18, Math.PI / 2));
      s.add(p); this._person = p;
      // rescuer hands stacked on the chest (center)
      var hands = new THREE.Group();
      hands.add(this._m(new THREE.BoxGeometry(0.34, 0.14, 0.26), 0xe0a066, 0, 0, 0));
      hands.add(this._m(new THREE.BoxGeometry(0.3, 0.12, 0.22), 0xd0925a, 0, 0.12, 0));
      hands.position.set(-0.2, 0.72, 0); s.add(hands); this._hands = hands; this._handY = 0.72;
      // beat ring above the chest
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 10, 30), new THREE.MeshStandardMaterial({ color: 0xf2760c, emissive: 0x7a3a00, emissiveIntensity: 0.5 }));
      ring.position.set(-0.2, 1.7, 0); ring.rotation.x = Math.PI / 2; s.add(ring); this._ring = ring;
    },
    _say: function (m) { var el = document.getElementById("cpr-say"); if (el) el.textContent = m; },
    _setPhaseUi: function () {
      var call = document.getElementById("btn-cpr-call"), push = document.getElementById("btn-cpr-push");
      if (call) call.style.display = this.phase === "call" ? "" : "none";
      if (push) push.style.display = this.phase === "cpr" ? "" : "none";
      this._syncHud();
    },
    _callDone: function () { if (this.phase !== "call") return; this.phase = "cpr"; this._beatStart = performance.now(); this._say("Now push hard and fast in the center of the chest, in time with the beat."); this._setPhaseUi(); if (this.app) this.app.speak("Now push hard and fast, in time with the beat."); },
    _tap: function () {
      if (this.phase !== "cpr") return;
      var now = performance.now(), delta = this.CP.nearestDelta(now, this._beatStart), j = this.CP.judge(delta);
      this.count++; if (j === "good") this.good++; else if (j === "ok") this.ok++;
      this._push = 1; this._say(this.CP.hint(delta));
      if (this.count >= this.CP.GOAL) this._finish();
      this._syncHud();
    },
    _syncHud: function () {
      var c = document.getElementById("cpr-count"); if (c) c.textContent = "Compressions: " + this.count + " of " + this.CP.GOAL;
    },
    _finish: function () {
      var stars = this.CP.rateStars(this.good, this.ok, this.count);
      this.stop();
      var st = document.getElementById("cpr-stars"); if (st) { var s = "", f = "\u2605", e = "\u2606"; for (var i = 0; i < 3; i++) s += (i < stars ? f : e); st.textContent = s; }
      var tt = document.getElementById("cpr-result-title"), mg = document.getElementById("cpr-result-msg");
      if (tt) tt.textContent = stars >= 3 ? "Great rhythm!" : "Good effort";
      if (mg) mg.textContent = "You called for help, then gave " + this.count + " chest compressions. Push hard and fast, about twice every second, and do not stop until help arrives.";
      var earned = (stars >= 3 && this.app && this.app.badges) ? this.app.badges.earn("cpr") : false;
      var note = document.getElementById("cpr-badge-note"); if (note) note.style.display = earned ? "" : "none";
      if (this.app) { this.app.show("screen-cpr-result"); this.app.speak("Well done."); }
    },
    _onResize: function () { var c = document.getElementById("canvas-cpr"); if (!c) return; var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); },
    _loop: function (now) {
      if (!this.running) return; var self = this; this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      if (this.phase === "cpr") {
        var iv = this.CP.interval(), phase = ((now - this._beatStart) % iv) / iv; // 0..1
        var pulse = 1 - Math.abs(0.5 - phase) * 2; // peak at mid-beat
        if (this._ring) { var sc = 1.35 - pulse * 0.55; this._ring.scale.set(sc, sc, sc); this._ring.material.emissiveIntensity = 0.3 + pulse * 0.6; }
        var pb = document.getElementById("btn-cpr-push"); if (pb) pb.style.transform = "scale(" + (1 + pulse * 0.08) + ")";
      }
      this._push *= 0.82;
      if (this._hands) this._hands.position.y = this._handY - this._push * 0.18;
      if (this._person) { var top = this._person.children[0]; top.scale.y = 1 - this._push * 0.28; }
      this.renderer.render(this.scene3, this.camera);
    }
  };
  if (typeof window !== "undefined") window.CPRGame = CPRGame;

  /* =====================================================================
     5j) STOP THE BLEED  (Response: gloves, cover, press and hold)
     ===================================================================== */
  var BleedGame = {
    running: false, _raf: null, BL: Logic.bleed,
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this.app = app;
      var oldC = document.getElementById("canvas-bleed");
      var canvas = oldC.cloneNode(false); oldC.parentNode.replaceChild(canvas, oldC);
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      this.scene3 = new THREE.Scene(); this.scene3.background = new THREE.Color(0x14212b);
      this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
      this.camera.position.set(0, 3.4, 4.4); this.camera.lookAt(0, 0.4, 0);

      this.doneCount = 0; this.mistakes = 0; this.controlled = false; this.pressMs = 0; this.holding = false;
      this.blood = 0; this._startMs = performance.now();
      this.scene3.add(new THREE.HemisphereLight(0xeef3f6, 0x33393f, 1.1));
      var dl = new THREE.DirectionalLight(0xffffff, 0.5); dl.position.set(3, 8, 5); this.scene3.add(dl);
      this._build();
      this._say(this.BL.tip("gloves"));
      this._setStepUi();

      var self = this;
      var press = document.getElementById("btn-bleed-press");
      this._pd = function (e) { self._pressDown(); if (e && e.cancelable) e.preventDefault(); };
      this._pu = function () { self._pressUp(); };
      if (press) { press.addEventListener("pointerdown", this._pd); press.addEventListener("pointerup", this._pu); press.addEventListener("pointerleave", this._pu); press.addEventListener("touchend", this._pu); }
      this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize);
      this.running = true; this._loop(performance.now());
    },
    stop: function () {
      this.running = false; if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      if (this._resize) window.removeEventListener("resize", this._resize);
      var press = document.getElementById("btn-bleed-press");
      if (press) { if (this._pd) press.removeEventListener("pointerdown", this._pd); if (this._pu) { press.removeEventListener("pointerup", this._pu); press.removeEventListener("pointerleave", this._pu); press.removeEventListener("touchend", this._pu); } }
      if (this._toastT) clearTimeout(this._toastT);
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },
    _m: function (geo, color, x, y, z, rx) { var mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color })); mesh.position.set(x || 0, y || 0, z || 0); if (rx) mesh.rotation.x = rx; return mesh; },
    _build: function () {
      var s = this.scene3;
      s.add(this._m(new THREE.BoxGeometry(6, 0.2, 4), 0xc9d2d6, 0, -0.1, 0));
      var p = new THREE.Group();
      p.add(this._m(new THREE.CylinderGeometry(0.34, 0.34, 1.5, 16), 0x2f9c6a, 0.1, 0.34, 0, Math.PI / 2));
      p.add(this._m(new THREE.SphereGeometry(0.28, 16, 12), 0xe0a066, 1.0, 0.3, 0));
      // hurt arm extending toward camera
      var arm = this._m(new THREE.CylinderGeometry(0.11, 0.11, 1.2, 10), 0xe0a066, -0.7, 0.28, 0.5, Math.PI / 2); p.add(arm);
      s.add(p); this._person = p;
      // wound (red patch) on the arm
      var wound = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 14), new THREE.MeshStandardMaterial({ color: 0xc0201f, emissive: 0x600, emissiveIntensity: 0.3 }));
      wound.position.set(-1.0, 0.4, 0.5); s.add(wound); this._wound = wound;
      // cloth (hidden until placed)
      var cloth = this._m(new THREE.BoxGeometry(0.42, 0.05, 0.42), 0xf3f3ee, -1.0, 0.44, 0.5); cloth.visible = false; s.add(cloth); this._cloth = cloth;
      // hands (hidden until pressing)
      var hands = this._m(new THREE.BoxGeometry(0.34, 0.14, 0.3), 0xe0a066, -1.0, 0.6, 0.5); hands.visible = false; s.add(hands); this._hands = hands;
    },
    _say: function (m) { var el = document.getElementById("bleed-say"); if (el) el.textContent = m; },
    _setStepUi: function () {
      var step = this.BL.next(this.doneCount);
      var g = document.getElementById("btn-bleed-gloves"), c = document.getElementById("btn-bleed-cover"), p = document.getElementById("btn-bleed-press");
      if (g) g.style.display = step === "gloves" ? "" : "none";
      if (c) c.style.display = step === "cover" ? "" : "none";
      if (p) p.style.display = step === "press" ? "" : "none";
    },
    _gloves: function () { if (this.BL.next(this.doneCount) !== "gloves") return; this.doneCount = 1; this._say(this.BL.tip("cover")); this._setStepUi(); },
    _cover: function () { if (this.BL.next(this.doneCount) !== "cover") return; this.doneCount = 2; if (this._cloth) this._cloth.visible = true; this._say(this.BL.tip("press")); this._setStepUi(); },
    _pressDown: function () { if (this.BL.next(this.doneCount) === "press") { this.doneCount = 3; } if (this.doneCount >= 3) { this.holding = true; if (this._hands) this._hands.visible = true; } },
    _pressUp: function () { if (this.holding && !this.controlled) { this.mistakes++; this._say("Keep pressing hard. Do not let go until the bleeding stops."); } this.holding = false; },
    _syncHud: function () {
      var b = document.getElementById("bleed-fill"); if (b) b.style.width = (100 * Math.min(1, this.blood)) + "%";
      var pr = document.getElementById("bleed-press-fill"); if (pr) pr.style.width = (100 * Math.min(1, this.pressMs / this.BL.CONTROL_MS)) + "%";
    },
    _finish: function () {
      var slow = (performance.now() - this._startMs) > 16000 || this.blood >= 1;
      var stars = this.BL.rateStars(this.mistakes, this.controlled, slow);
      this.stop();
      var st = document.getElementById("bleed-stars"); if (st) { var s = "", f = "\u2605", e = "\u2606"; for (var i = 0; i < 3; i++) s += (i < stars ? f : e); st.textContent = s; }
      var tt = document.getElementById("bleed-result-title"), mg = document.getElementById("bleed-result-msg");
      if (tt) tt.textContent = this.controlled ? "Bleeding stopped!" : "Keep practicing";
      if (mg) mg.textContent = (this.controlled ? "You put on gloves, covered the wound with a clean cloth, and pressed hard until the bleeding stopped. " : "") + "Firm, steady pressure is what stops bleeding. Keep pressing and get help fast.";
      var earned = (stars >= 3 && this.controlled && this.app && this.app.badges) ? this.app.badges.earn("bleed") : false;
      var note = document.getElementById("bleed-badge-note"); if (note) note.style.display = earned ? "" : "none";
      if (this.app) { this.app.show("screen-bleed-result"); this.app.speak(this.controlled ? "The bleeding stopped." : "Keep pressing next time."); }
    },
    _onResize: function () { var c = document.getElementById("canvas-bleed"); if (!c) return; var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); },
    _loop: function (now) {
      if (!this.running) return; var self = this; this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      var dt = Math.min(0.05, (now - (this._prev || now)) / 1000); this._prev = now;
      if (!this.controlled) {
        if (this.holding && this.doneCount >= 3) {
          this.pressMs += dt * 1000;
          if (this._hands) this._hands.position.y = 0.56 + Math.sin(now * 0.02) * 0.02;
          if (this._wound) this._wound.material.emissiveIntensity = 0.3 * (1 - this.pressMs / this.BL.CONTROL_MS);
          if (this.pressMs >= this.BL.CONTROL_MS) { this.controlled = true; this._say("The bleeding is controlled. Well done."); this._finishSoon = now + 900; }
        } else {
          this.blood = Math.min(1.2, this.blood + dt * (this.doneCount >= 2 ? 0.02 : 0.07));
          if (this._wound) { var sc = 1 + this.blood * 0.4; this._wound.scale.set(sc, 1, sc); }
        }
      }
      if (this._finishSoon && now >= this._finishSoon) { this._finishSoon = 0; this._finish(); }
      this._syncHud();
      this.renderer.render(this.scene3, this.camera);
    }
  };
  if (typeof window !== "undefined") window.BleedGame = BleedGame;

  /* =====================================================================
     5c) TRACE GAME  (Level 1: draw a safe route from home to the tent)
     ===================================================================== */
  var TraceGame = {
    running: false, _raf: null, SP: Logic.safepath,
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this.app = app;
      var oldC = document.getElementById("canvas-trace"); var c = oldC.cloneNode(false); oldC.parentNode.replaceChild(c, oldC);
      var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); this.renderer.setSize(w, h, false);
      this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x0d1f2d);
      this.camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 100); this.raycaster = new THREE.Raycaster();
      this.grid = this.SP.parse(this.SP.TRACE);
      this.path = [this.grid.start]; this.shortest = this.SP.bfs(this.grid, this.grid.start, this.grid.evac, false);
      this.center = new THREE.Vector3(0, 0, 0); this.yaw = 0.62; this.pitch = 1.02;
      this.radius = Math.max(this.grid.w, this.grid.h) * 0.95 + 3;
      this._minR = Math.max(this.grid.w, this.grid.h) * 0.5 + 2; this._maxR = Math.max(this.grid.w, this.grid.h) * 1.7 + 6;
      this.scene.add(new THREE.HemisphereLight(0xeaf2f8, 0x30363c, 1.0));
      var dir = new THREE.DirectionalLight(0xffffff, 0.5); dir.position.set(4, 8, 5); this.scene.add(dir);
      this._tiles = []; this._props = []; this._trail = [];
      this._buildBoard(); this._buildToken(); this._tokTarget = this._wpos(this.grid.start); this._renderTrail();
      this._updateCamera(); this._steps();
      this._toast("Drag from your home to the evacuation tent. Move around houses, trees, and water.", "info", 4600);
      var self = this; this._bind(c);
      this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize);
      this.running = true; this._loop(performance.now());
    },
    stop: function () {
      this.running = false; if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      if (this._resize) window.removeEventListener("resize", this._resize);
      if (this._unbind) this._unbind();
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },
    _wpos: function (i) { var c = this.grid.cells[i]; return new THREE.Vector3(c.x - (this.grid.w - 1) / 2, 0, c.y - (this.grid.h - 1) / 2); },
    _m: function (geo, color, x, y, z, ry) { var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color })); m.position.set(x || 0, y || 0, z || 0); if (ry) m.rotation.y = ry; return m; },
    _label: function (text) {
      var cv = document.createElement("canvas"); cv.width = 256; cv.height = 80;
      var x = cv.getContext("2d");
      x.fillStyle = "rgba(14,34,51,0.9)"; x.fillRect(8, 16, 240, 48);
      x.fillStyle = "#ffffff"; x.font = "bold 34px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText(text, 128, 42);
      var tex = new THREE.CanvasTexture(cv);
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
      sp.scale.set(1.5, 0.47, 1); return sp;
    },
    _addLabel: function (text, p) { var l = this._label(text); l.position.set(p.x, 1.5, p.z); this.scene.add(l); this._props.push(l); },
    _buildBoard: function () {
      var s = this.scene, g = this.grid;
      var matGround = new THREE.MeshStandardMaterial({ color: 0x9ccc65 }),
          matWater = new THREE.MeshStandardMaterial({ color: 0x3d9bd6, roughness: 0.4 }),
          matEvac = new THREE.MeshStandardMaterial({ color: 0x49c96a, emissive: 0x1c7a3c, emissiveIntensity: 0.4 }),
          matHome = new THREE.MeshStandardMaterial({ color: 0xf2c14e });
      for (var i = 0; i < g.cells.length; i++) {
        var cc = g.cells[i], p = this._wpos(i), tile;
        if (cc.ch === "W") { tile = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.16, 0.98), matWater); tile.position.set(p.x, -0.06, p.z); }
        else { var m = cc.ch === "E" ? matEvac : cc.ch === "S" ? matHome : matGround; tile = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.2, 0.94), m); tile.position.set(p.x, 0, p.z); }
        tile.userData = { idx: i }; s.add(tile); this._tiles[i] = tile;
        if (cc.ch === "T" || cc.ch === "B" || cc.ch === "P") this._buildProp(cc.ch, p);
        if (cc.ch === "E") { this._buildEvac(p); this._addLabel("Evac", p); }
        if (cc.ch === "S") { this._buildHome(p); this._addLabel("Home", p); }
      }
      var base = new THREE.Mesh(new THREE.BoxGeometry(g.w + 0.4, 0.1, g.h + 0.4), new THREE.MeshStandardMaterial({ color: 0x6b7d55 }));
      base.position.set(0, -0.16, 0); s.add(base);
    },
    _buildProp: function (ch, p) {
      var s = this.scene, grp = new THREE.Group();
      if (ch === "T") {
        grp.add(this._m(new THREE.CylinderGeometry(0.06, 0.08, 0.34, 8), 0x8a5a2b, 0, 0.27, 0));
        grp.add(this._m(new THREE.ConeGeometry(0.26, 0.42, 10), 0x2e7d32, 0, 0.58, 0));
        grp.add(this._m(new THREE.ConeGeometry(0.2, 0.34, 10), 0x349140, 0, 0.8, 0));
      } else if (ch === "B") {
        grp.add(this._m(new THREE.BoxGeometry(0.6, 0.5, 0.6), 0xd7c39a, 0, 0.35, 0));
        grp.add(this._m(new THREE.ConeGeometry(0.5, 0.32, 4), 0xb1533b, 0, 0.76, 0, Math.PI / 4));
      } else if (ch === "P") {
        grp.add(this._m(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 8), 0x6a6f74, 0, 0.55, 0));
        grp.add(this._m(new THREE.BoxGeometry(0.44, 0.05, 0.05), 0x4a4f54, 0, 0.86, 0));
      }
      grp.position.set(p.x, 0.1, p.z); s.add(grp); this._props.push(grp);
    },
    _buildHome: function (p) { var g = new THREE.Group(); g.add(this._m(new THREE.BoxGeometry(0.42, 0.36, 0.42), 0xefe2c0, 0, 0.28, 0)); g.add(this._m(new THREE.ConeGeometry(0.36, 0.26, 4), 0xdb7f3c, 0, 0.58, 0, Math.PI / 4)); g.position.set(p.x, 0.1, p.z); this.scene.add(g); this._props.push(g); },
    _buildEvac: function (p) {
      var g = new THREE.Group();
      g.add(this._m(new THREE.ConeGeometry(0.4, 0.5, 4), 0x2e9c53, 0, 0.35, 0, Math.PI / 4));
      g.add(this._m(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 6), 0xbfc7cd, 0.28, 0.45, -0.2));
      g.add(this._m(new THREE.BoxGeometry(0.22, 0.14, 0.01), 0xf2c14e, 0.4, 0.66, -0.2));
      g.position.set(p.x, 0.12, p.z); this.scene.add(g); this._props.push(g);
    },
    _buildToken: function () {
      var g = new THREE.Group();
      g.add(this._m(new THREE.CylinderGeometry(0.14, 0.16, 0.34, 12), 0x2b6cb0, 0, 0.28, 0));
      g.add(this._m(new THREE.SphereGeometry(0.14, 14, 12), 0xffd7a8, 0, 0.54, 0));
      g.add(this._m(new THREE.BoxGeometry(0.28, 0.32, 0.03), 0xe23a2b, 0, 0.3, -0.12));
      var p = this._wpos(this.grid.start); g.position.set(p.x, 0.2, p.z);
      this.scene.add(g); this.token = g;
    },
    _renderTrail: function () {
      var i; for (i = 0; i < this._trail.length; i++) this.scene.remove(this._trail[i]); this._trail = [];
      for (i = 1; i < this.path.length; i++) {
        var p = this._wpos(this.path[i]);
        var reached = this.path[i] === this.grid.evac;
        var disc = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 18), new THREE.MeshStandardMaterial({ color: reached ? 0x49c96a : 0x7ad0ff, emissive: reached ? 0x1c7a3c : 0x2a86c0, emissiveIntensity: 0.6, transparent: true, opacity: 0.9 }));
        disc.position.set(p.x, 0.16, p.z); this.scene.add(disc); this._trail.push(disc);
      }
      this._tokTarget = this._wpos(this.path[this.path.length - 1]);
      this._steps();
    },
    _steps: function () { var el = document.getElementById("tr-steps"); if (el) el.textContent = "Steps: " + (this.path.length - 1); },
    _toast: function (msg, kind, ms) {
      var el = document.getElementById("tr-toast"); if (!el) return;
      el.textContent = msg; el.className = "sp-toast show " + (kind || "info");
      var self = this; clearTimeout(this._toastT);
      this._toastT = setTimeout(function () { el.className = "sp-toast " + (kind || "info"); }, ms || 2600);
    },
    _tileAt: function (pt) {
      var c = document.getElementById("canvas-trace"); if (!c) return -1;
      var r = c.getBoundingClientRect();
      var nd = new THREE.Vector2(((pt.x - r.left) / r.width) * 2 - 1, -((pt.y - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(nd, this.camera);
      var hits = this.raycaster.intersectObjects(this._tiles.filter(Boolean), false);
      return hits.length ? hits[0].object.userData.idx : -1;
    },
    _traceAt: function (pt) {
      var idx = this._tileAt(pt); if (idx < 0) return;
      var head = this.path[this.path.length - 1]; if (idx === head) return;
      if (this.path.length >= 2 && idx === this.path[this.path.length - 2]) { this.path.pop(); this._renderTrail(); return; }
      var hc = this.grid.cells[head], tc = this.grid.cells[idx];
      if (!tc.walkable) { this._toast("That spot is blocked. Go around it.", "info", 1600); return; }
      if (Math.abs(hc.x - tc.x) + Math.abs(hc.y - tc.y) !== 1) return;
      if (this.path.indexOf(idx) !== -1) return;
      this.path.push(idx); this._renderTrail();
      if (idx === this.grid.evac) this._win();
    },
    clearPath: function () { if (!this.running) return; this.path = [this.grid.start]; this._renderTrail(); this._toast("Route cleared. Try again from your home.", "info", 1800); },
    zoom: function (dir) { if (!this.running) return; this.radius = Logic.clamp(this.radius + dir * (this._maxR - this._minR) * 0.14, this._minR, this._maxR); },
    _bind: function (canvas) {
      var self = this, tracing = false, pd = 0;
      function pt(e) { if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY }; }
      function dist2(e) { var a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
      this._down = function (e) { if (e.touches && e.touches.length >= 2) return; tracing = true; self._traceAt(pt(e)); if (e.cancelable) e.preventDefault(); };
      this._move = function (e) { if (!tracing || self._pinching) return; self._traceAt(pt(e)); if (e.cancelable) e.preventDefault(); };
      this._up = function () { tracing = false; };
      this._wheel = function (e) { self.radius = Logic.clamp(self.radius + (e.deltaY > 0 ? 1 : -1) * (self._maxR - self._minR) * 0.08, self._minR, self._maxR); if (e.cancelable) e.preventDefault(); };
      this._tstart = function (e) { if (e.touches.length === 2) { self._pinching = true; pd = dist2(e); } };
      this._tmove = function (e) { if (e.touches.length === 2) { self._pinching = true; var d = dist2(e); if (pd > 0 && d > 0) self.radius = Logic.clamp(self.radius * (pd / d), self._minR, self._maxR); pd = d; if (e.cancelable) e.preventDefault(); } };
      this._tend = function (e) { if (e.touches.length < 2) { self._pinching = false; pd = 0; } };
      canvas.addEventListener("pointerdown", this._down);
      window.addEventListener("pointermove", this._move, { passive: false });
      window.addEventListener("pointerup", this._up);
      canvas.addEventListener("wheel", this._wheel, { passive: false });
      canvas.addEventListener("touchstart", this._tstart, { passive: false });
      canvas.addEventListener("touchmove", this._tmove, { passive: false });
      canvas.addEventListener("touchend", this._tend);
      this._unbind = function () { canvas.removeEventListener("pointerdown", self._down); window.removeEventListener("pointermove", self._move); window.removeEventListener("pointerup", self._up); };
    },
    _win: function () {
      var stars = this.SP.rateStars({ heartsLost: 0, steps: this.path.length - 1, shortest: this.shortest });
      this.stop();
      var starEl = document.getElementById("tr-stars");
      if (starEl) { var str = "", f = "\u2605", em = "\u2606"; for (var i = 0; i < 3; i++) str += (i < stars ? f : em); starEl.textContent = str; }
      var msg = document.getElementById("tr-result-msg");
      if (msg) msg.textContent = stars >= 3 ? "A short, clear route to the evacuation tent. Excellent!" : "You reached the evacuation tent. Try a shorter, tidier route to earn three stars.";
      var earned = (stars >= 3 && this.app && this.app.badges) ? this.app.badges.earn("path") : false;
      var note = document.getElementById("tr-badge-note"); if (note) note.style.display = earned ? "" : "none";
      if (this.app) { this.app.show("screen-trace-result"); this.app.speak("You reached the evacuation area."); }
    },
    _onResize: function () { var c = document.getElementById("canvas-trace"); if (!c) return; var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); },
    _updateCamera: function () {
      var cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
      this.camera.position.set(this.center.x + this.radius * cp * Math.sin(this.yaw), this.center.y + this.radius * sp, this.center.z + this.radius * cp * Math.cos(this.yaw));
      this.camera.lookAt(this.center);
    },
    _loop: function (now) {
      if (!this.running) return; var self = this;
      this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      if (this.token && this._tokTarget) {
        this.token.position.x += (this._tokTarget.x - this.token.position.x) * 0.25;
        this.token.position.z += (this._tokTarget.z - this.token.position.z) * 0.25;
        this.token.position.y = 0.2 + Math.abs(Math.sin(now * 0.006)) * 0.04;
      }
      for (var i = 0; i < this._trail.length; i++) this._trail[i].position.y = 0.16 + Math.sin(now * 0.005 + i * 0.5) * 0.02;
      this._updateCamera();
      this.renderer.render(this.scene, this.camera);
    }
  };
  if (typeof window !== "undefined") window.TraceGame = TraceGame;

  /* =====================================================================
     5d) HIGH GROUND  (Level 3: roll the warning first, then move to safe,
         high ground on a topographic map; hazards cascade)
     ===================================================================== */
  var HighGround = {
    running: false, _raf: null, SP: Logic.safepath, _stepH: 0.16,
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this.app = app;
      var oldC = document.getElementById("canvas-high"); var c = oldC.cloneNode(false); oldC.parentNode.replaceChild(c, oldC);
      var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); this.renderer.setSize(w, h, false);
      this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x0c1b28);
      this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100); this.raycaster = new THREE.Raycaster();
      this.grid = this.SP.parse3(this.SP.LEVEL3.feat, this.SP.LEVEL3.elev);
      this.player = this.grid.start; this.steps = 0; this.hearts = 3; this.heartsLost = 0;
      this.phase = "warn"; this.rolling = false; this.hazard = "clear"; this.cascade = null;
      this.shortest = this.SP.bfs(this.grid, this.grid.start, this.grid.evac, false);
      this.center = new THREE.Vector3(0, this._stepH * 2.2, 0); this.orbitYaw = 0; this.orbitPitch = 0.92;
      this.radius = Math.max(this.grid.w, this.grid.h) * 1.05 + 3;
      this._minR = Math.max(this.grid.w, this.grid.h) * 0.55 + 2; this._maxR = Math.max(this.grid.w, this.grid.h) * 1.8 + 6;
      this.scene.add(new THREE.HemisphereLight(0xeaf2f8, 0x2c3238, 1.0));
      var dir = new THREE.DirectionalLight(0xffffff, 0.55); dir.position.set(5, 9, 4); this.scene.add(dir);
      this._tiles = []; this._props = []; this._highlights = []; this._anim = null;
      this._buildBoard(); this._buildToken(); this._updateCamera(); this._syncHud(); this._die("clear");
      this._toast("Roll to get the next early warning, then step to safe ground. Climb to the tent on high ground.", "info", 5200);
      this._pulseRoll(true);
      var self = this; this._bindInput(c);
      this._roll = function () { self._rollDie(); }; var rb = document.getElementById("btn-hg-roll"); if (rb) rb.addEventListener("click", this._roll);
      this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize);
      this.running = true; this._loop(performance.now());
    },
    stop: function () {
      this.running = false; if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      if (this._resize) window.removeEventListener("resize", this._resize);
      if (this._unbind) this._unbind();
      var rb = document.getElementById("btn-hg-roll"); if (rb && this._roll) rb.removeEventListener("click", this._roll);
      if (this._dieTimer) { clearInterval(this._dieTimer); this._dieTimer = null; }
      if (this._routeT) { clearTimeout(this._routeT); this._routeT = null; }
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },
    _topY: function (i) { return this.SP.elevAt(this.grid, i) * this._stepH; },
    _wpos: function (i) { var c = this.grid.cells[i]; return new THREE.Vector3(c.x - (this.grid.w - 1) / 2, this._topY(i), c.y - (this.grid.h - 1) / 2); },
    _m: function (geo, color, x, y, z, ry) { var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color })); m.position.set(x || 0, y || 0, z || 0); if (ry) m.rotation.y = ry; return m; },
    _elevColor: function (e) { var C = [0x2f7fc0, 0xe4d29a, 0xa9c76a, 0x7bb04f, 0xb79a44, 0x9c6b3b]; return C[Math.max(0, Math.min(5, e))]; },
    _label: function (text) {
      var cv = document.createElement("canvas"); cv.width = 256; cv.height = 80; var x = cv.getContext("2d");
      x.fillStyle = "rgba(14,34,51,0.9)"; x.fillRect(8, 16, 240, 48);
      x.fillStyle = "#ffffff"; x.font = "bold 34px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 128, 42);
      var tex = new THREE.CanvasTexture(cv);
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })); sp.scale.set(1.5, 0.47, 1); return sp;
    },
    _addLabel: function (text, i) { var l = this._label(text), p = this._wpos(i); l.position.set(p.x, p.y + 1.1, p.z); this.scene.add(l); this._props.push(l); },
    _buildBoard: function () {
      var s = this.scene, g = this.grid;
      for (var i = 0; i < g.cells.length; i++) {
        var c = g.cells[i], p = this._wpos(i), tile, top = this._topY(i);
        if (c.ch === "W") {
          tile = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.48, 0.98), new THREE.MeshStandardMaterial({ color: 0x3d9bd6, roughness: 0.4 }));
          tile.position.set(p.x, -0.28, p.z);
        } else {
          var e = this.SP.elevAt(g, i), col = c.ch === "E" ? 0x49c96a : c.ch === "S" ? 0xf2c14e : this._elevColor(e);
          var hgt = top + 0.5;
          tile = new THREE.Mesh(new THREE.BoxGeometry(0.96, hgt, 0.96), new THREE.MeshStandardMaterial({ color: col, emissive: c.ch === "E" ? 0x1c7a3c : 0x000000, emissiveIntensity: c.ch === "E" ? 0.35 : 0 }));
          tile.position.set(p.x, top - hgt / 2, p.z);
        }
        tile.userData = { idx: i }; s.add(tile); this._tiles[i] = tile;
        if (c.ch === "T" || c.ch === "B" || c.ch === "P") this._buildProp(c.ch, p, top);
        if (c.ch === "E") { this._buildEvac(p, top); this._addLabel("Evac", i); }
        if (c.ch === "S") this._addLabel("Start", i);
      }
    },
    _buildProp: function (ch, p, top) {
      var grp = new THREE.Group();
      if (ch === "T") { grp.add(this._m(new THREE.CylinderGeometry(0.06, 0.08, 0.34, 8), 0x8a5a2b, 0, 0.27, 0)); grp.add(this._m(new THREE.ConeGeometry(0.26, 0.42, 10), 0x2e7d32, 0, 0.58, 0)); grp.add(this._m(new THREE.ConeGeometry(0.2, 0.34, 10), 0x349140, 0, 0.8, 0)); }
      else if (ch === "B") { grp.add(this._m(new THREE.BoxGeometry(0.6, 0.5, 0.6), 0xd7c39a, 0, 0.35, 0)); grp.add(this._m(new THREE.ConeGeometry(0.5, 0.3, 4), 0xb1533b, 0, 0.75, 0, Math.PI / 4)); }
      else if (ch === "P") { grp.add(this._m(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 8), 0x6a6f74, 0, 0.55, 0)); grp.add(this._m(new THREE.BoxGeometry(0.44, 0.05, 0.05), 0x4a4f54, 0, 0.86, 0)); }
      grp.position.set(p.x, top, p.z); this.scene.add(grp); this._props.push(grp);
    },
    _buildEvac: function (p, top) {
      var grp = new THREE.Group();
      grp.add(this._m(new THREE.BoxGeometry(0.6, 0.42, 0.6), 0xf3f7f4, 0, 0.3, 0));
      grp.add(this._m(new THREE.ConeGeometry(0.5, 0.3, 4), 0x2e9c53, 0, 0.66, 0, Math.PI / 4));
      grp.add(this._m(new THREE.BoxGeometry(0.06, 0.22, 0.02), 0x2e9c53, 0, 0.34, 0.31)); grp.add(this._m(new THREE.BoxGeometry(0.22, 0.06, 0.02), 0x2e9c53, 0, 0.34, 0.31));
      grp.position.set(p.x, top, p.z); this.scene.add(grp); this._props.push(grp);
    },
    _buildToken: function () {
      var g = new THREE.Group();
      g.add(this._m(new THREE.CylinderGeometry(0.14, 0.16, 0.34, 12), 0x2b6cb0, 0, 0.28, 0));
      g.add(this._m(new THREE.SphereGeometry(0.14, 14, 12), 0xffd7a8, 0, 0.54, 0));
      g.add(this._m(new THREE.BoxGeometry(0.28, 0.32, 0.03), 0xe23a2b, 0, 0.3, -0.12));
      var p = this._wpos(this.player); g.position.set(p.x, p.y + 0.2, p.z); this.scene.add(g); this.token = g;
    },
    _danger: function (i) { return this.SP.dangerAt(this.grid, i, this.hazard) || (this.cascade && this.SP.dangerAt(this.grid, i, this.cascade)); },
    _highlightMoves: function () {
      var i; for (i = 0; i < this._highlights.length; i++) this.scene.remove(this._highlights[i]); this._highlights = [];
      if (this.phase !== "move") return;
      var ns = this.SP.neighbors4(this.grid, this.player);
      for (i = 0; i < ns.length; i++) {
        var p = this._wpos(ns[i]), bad = this._danger(ns[i]);
        var col = bad ? 0xff5b6e : 0x3ee39b, em = bad ? 0xa11f2c : 0x1aa46a;
        var ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 8, 20), new THREE.MeshStandardMaterial({ color: col, emissive: em, emissiveIntensity: 0.6, transparent: true, opacity: 0.92 }));
        ring.rotation.x = Math.PI / 2; ring.position.set(p.x, p.y + 0.22, p.z); ring.userData = { idx: ns[i] };
        this.scene.add(ring); this._highlights.push(ring);
      }
    },
    _bindInput: function (canvas) {
      var self = this, dragging = false, moved = false, sx = 0, sy = 0, lx = 0, ly = 0, pd = 0;
      function pt(e) { if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY }; }
      function dist2(e) { var a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
      this._down = function (e) { if (e.touches && e.touches.length >= 2) return; dragging = true; moved = false; var p = pt(e); sx = lx = p.x; sy = ly = p.y; };
      this._move = function (e) { if (self._pinching || !dragging) return; var p = pt(e); if (Math.hypot(p.x - sx, p.y - sy) > 6) moved = true; self.orbitYaw -= (p.x - lx) * 0.006; self.orbitPitch = Logic.clamp(self.orbitPitch + (p.y - ly) * 0.005, 0.5, 1.32); lx = p.x; ly = p.y; if (e.cancelable) e.preventDefault(); };
      this._up = function (e) { if (!dragging) return; dragging = false; if (!moved && !self._pinching) self._tap(pt(e)); };
      this._wheel = function (e) { self.radius = Logic.clamp(self.radius + (e.deltaY > 0 ? 1 : -1) * (self._maxR - self._minR) * 0.08, self._minR, self._maxR); if (e.cancelable) e.preventDefault(); };
      this._tstart = function (e) { if (e.touches.length === 2) { self._pinching = true; pd = dist2(e); } };
      this._tmove = function (e) { if (e.touches.length === 2) { self._pinching = true; var d = dist2(e); if (pd > 0 && d > 0) self.radius = Logic.clamp(self.radius * (pd / d), self._minR, self._maxR); pd = d; if (e.cancelable) e.preventDefault(); } };
      this._tend = function (e) { if (e.touches.length < 2) { self._pinching = false; pd = 0; } };
      canvas.addEventListener("pointerdown", this._down); window.addEventListener("pointermove", this._move, { passive: false }); window.addEventListener("pointerup", this._up);
      canvas.addEventListener("wheel", this._wheel, { passive: false });
      canvas.addEventListener("touchstart", this._tstart, { passive: false }); canvas.addEventListener("touchmove", this._tmove, { passive: false }); canvas.addEventListener("touchend", this._tend);
      this._unbind = function () { canvas.removeEventListener("pointerdown", self._down); window.removeEventListener("pointermove", self._move); window.removeEventListener("pointerup", self._up); };
    },
    zoom: function (dir) { if (!this.running) return; this.radius = Logic.clamp(this.radius + dir * (this._maxR - this._minR) * 0.14, this._minR, this._maxR); },
    showRoute: function () {
      if (!this.running) return;
      if (this._route) { for (var j = 0; j < this._route.length; j++) this.scene.remove(this._route[j]); this._route = null; }
      var path = this.SP.bfsPath(this.grid, this.player, this.grid.evac, false); if (!path) return;
      this._route = [];
      for (var k = 1; k < path.length; k++) { var p = this._wpos(path[k]); var dot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), new THREE.MeshStandardMaterial({ color: 0x7ad0ff, emissive: 0x2a86c0, emissiveIntensity: 0.7 })); dot.position.set(p.x, p.y + 0.55, p.z); this.scene.add(dot); this._route.push(dot); }
      this._toast("The blue markers point the way up to the evacuation tent.", "good", 3000);
      var self = this; clearTimeout(this._routeT); this._routeT = setTimeout(function () { if (self._route) { for (var i = 0; i < self._route.length; i++) self.scene.remove(self._route[i]); self._route = null; } }, 3600);
    },
    _tap: function (pt) {
      if (this.phase !== "move" || this._anim) return;
      var c = document.getElementById("canvas-high"); if (!c) return; var r = c.getBoundingClientRect();
      var nd = new THREE.Vector2(((pt.x - r.left) / r.width) * 2 - 1, -((pt.y - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(nd, this.camera);
      var hits = this.raycaster.intersectObjects(this._tiles.filter(Boolean), false); if (!hits.length) return;
      var idx = hits[0].object.userData.idx, pc = this.grid.cells[this.player], tc = this.grid.cells[idx];
      if (!tc.walkable || Math.abs(pc.x - tc.x) + Math.abs(pc.y - tc.y) !== 1) return;
      this._moveTo(idx);
    },
    _moveTo: function (idx) { this._anim = { from: this._wpos(this.player), to: this._wpos(idx), t: 0, idx: idx }; this.phase = "busy"; this._highlightMoves(); },
    _arrive: function (idx) {
      this.player = idx; this.steps++; this._syncHud();
      if (idx === this.grid.evac) { this._win(); return; }
      var caughtHz = this.SP.dangerAt(this.grid, idx, this.hazard) ? this.hazard : (this.cascade && this.SP.dangerAt(this.grid, idx, this.cascade) ? this.cascade : null);
      if (caughtHz) {
        this.hearts--; this.heartsLost++; this._syncHud();
        this._toast(this.SP.message3(caughtHz, this.grid, idx), "bad", 5200);
        if (this.app) this.app.speak(this.SP.hazardTitle3(caughtHz) + ". Be careful.");
        if (this.hearts <= 0) { this._lose(); return; }
      } else if (this.hazard !== "clear") {
        this._toast("Safe from the " + this.SP.hazardTitle3(this.hazard).toLowerCase() + ". Good choice.", "good", 1800);
      }
      this.hazard = "clear"; this.cascade = null; this.phase = "warn"; this._highlightMoves(); this._syncHud(); this._pulseRoll(true);
    },
    _pulseRoll: function (on) { var rb = document.getElementById("btn-hg-roll"); if (rb) { rb.disabled = !on; rb.classList.toggle("pulse", on); } },
    _die: function (hz) {
      var el = document.getElementById("hg-die-face"); if (!el) return;
      var map = { clear: "\u2705", tsunami: "\uD83C\uDF0A", surge: "\uD83C\uDF0A", typhoon: "\uD83C\uDF00", thunderstorm: "\u26C8", landslide: "\u26F0" };
      var lab = { clear: "Clear", tsunami: "Tsunami", surge: "Surge", typhoon: "Typhoon", thunderstorm: "Storm", landslide: "Landslide" };
      el.innerHTML = '<span class="dico">' + (map[hz] || "\u2753") + '</span><span class="dlab">' + (lab[hz] || "") + '</span>';
    },
    _rollDie: function () {
      if (this.phase !== "warn" || this.rolling) return;
      this.rolling = true; this._pulseRoll(false); this.phase = "rolling";
      var self = this, faces = ["tsunami", "typhoon", "thunderstorm", "landslide", "surge", "clear"], n = 0;
      var d = document.getElementById("hg-die"); if (d) d.classList.add("shake");
      this._dieTimer = setInterval(function () { self._die(faces[n % faces.length]); n++; }, 90);
      setTimeout(function () {
        clearInterval(self._dieTimer); self._dieTimer = null; if (d) d.classList.remove("shake");
        self.hazard = self.SP.rollHazard3(); self.cascade = self.SP.cascade3(self.hazard);
        self._die(self.hazard); self.rolling = false; self.phase = "move";
        var msg = self.SP.advice3(self.hazard); if (self.cascade) msg += " Heavy rain may also trigger a landslide on steep ground.";
        self._toast(msg, self.hazard === "clear" ? "good" : "warn", 4200);
        if (self.app) self.app.speak(self.SP.hazardTitle3(self.hazard) + (self.cascade ? " with landslide risk" : ""));
        self._syncHud(); self._highlightMoves();
      }, 800);
    },
    _syncHud: function () {
      var hs = document.getElementById("hg-hearts"); if (hs) { var str = "", full = "\u2764", em = "\u2661"; for (var i = 0; i < 3; i++) str += (i < this.hearts ? full : em); hs.textContent = str; }
      var st = document.getElementById("hg-steps"); if (st) st.textContent = "Steps: " + this.steps;
      var wn = document.getElementById("hg-warn");
      if (wn) {
        if (this.phase === "warn" || this.phase === "rolling") { wn.textContent = "Roll for the next warning"; wn.className = "hg-warn"; }
        else { wn.textContent = (this.hazard === "clear" ? "All clear" : this.SP.hazardTitle3(this.hazard) + (this.cascade ? " + landslide" : "")); wn.className = "hg-warn " + (this.hazard === "clear" ? "ok" : "bad"); }
      }
    },
    _toast: function (msg, kind, ms) {
      var el = document.getElementById("hg-toast"); if (!el) return; el.textContent = msg; el.className = "sp-toast show " + (kind || "info");
      var self = this; clearTimeout(this._toastT); this._toastT = setTimeout(function () { el.className = "sp-toast " + (kind || "info"); }, ms || 2600);
    },
    _win: function () { this._finish(true, this.SP.rateStars({ heartsLost: this.heartsLost, steps: this.steps, shortest: this.shortest })); },
    _lose: function () { this._finish(false, 0); },
    _finish: function (reached, stars) {
      this.stop();
      var starEl = document.getElementById("hg-stars"); if (starEl) { var str = "", f = "\u2605", em = "\u2606"; for (var i = 0; i < 3; i++) str += (i < stars ? f : em); starEl.textContent = str; }
      var title = document.getElementById("hg-result-title"), msg = document.getElementById("hg-result-msg");
      if (reached) { if (title) title.textContent = "You reached high ground!"; if (msg) msg.textContent = this.heartsLost === 0 ? "You read every warning and climbed to the shelter safely. Outstanding!" : "You made it to the shelter on high ground. Next time, read each warning and pick even safer ground."; }
      else { if (title) title.textContent = "The hazards caught up"; if (msg) msg.textContent = "Read each warning before you step. Climb away from the low coast, keep off steep slopes, and avoid trees and poles."; }
      var earned = (reached && stars >= 3 && this.app && this.app.badges) ? this.app.badges.earn("path") : false;
      var note = document.getElementById("hg-badge-note"); if (note) note.style.display = earned ? "" : "none";
      if (this.app) { this.app.show("screen-high-result"); this.app.speak(reached ? "You reached high ground." : "Try again. Read the warnings."); }
    },
    _onResize: function () { var c = document.getElementById("canvas-high"); if (!c) return; var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); },
    _updateCamera: function () { var cp = Math.cos(this.orbitPitch), sp = Math.sin(this.orbitPitch); this.camera.position.set(this.center.x + this.radius * cp * Math.sin(this.orbitYaw), this.center.y + this.radius * sp, this.center.z + this.radius * cp * Math.cos(this.orbitYaw)); this.camera.lookAt(this.center); },
    _loop: function (now) {
      if (!this.running) return; var self = this; this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      var dt = Math.min(0.05, (now - (this._prev || now)) / 1000); this._prev = now;
      if (this._anim) { this._anim.t = Math.min(1, this._anim.t + dt * 4.5); var e = this._anim.t, p = new THREE.Vector3().lerpVectors(this._anim.from, this._anim.to, e); var hop = Math.sin(e * Math.PI) * 0.22; this.token.position.set(p.x, p.y + 0.2 + hop, p.z); if (this._anim.t >= 1) { var idx = this._anim.idx; this._anim = null; this._arrive(idx); } }
      for (var i = 0; i < this._highlights.length; i++) this._highlights[i].position.y += Math.sin(now * 0.005 + i) * 0.001;
      this._updateCamera(); this.renderer.render(this.scene, this.camera);
    }
  };
  if (typeof window !== "undefined") window.HighGround = HighGround;

  /* =====================================================================
     5e) HOUSE CLEANUP  (Recovery: after a flood inside, or a typhoon
         outside; tap an item, choose the right action, sort the trash)
     ===================================================================== */
  var Cleanup = {
    running: false, _raf: null, CL: Logic.cleanup, scenario: "flood",
    _initState: function (app, scenario) {
      this.app = app; this.scenario = scenario || this.scenario;
      this.data = this.CL.SCENARIOS[this.scenario];
      this.items = this.data.items.slice();
      this.remaining = this.items.length; this.mistakes = 0; this.done = {}; this.current = null;
      this.powerOff = false; this.geared = false;
      this._items = this._items || {}; this._anims = this._anims || [];
      this._progress();
    },
    start: function (app) {
      if (typeof THREE === "undefined") throw new Error("no THREE");
      this._initState(app, this.scenario);
      var oldC = document.getElementById("canvas-clean"); var c = oldC.cloneNode(false); oldC.parentNode.replaceChild(c, oldC);
      var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); this.renderer.setSize(w, h, false);
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(this.scenario === "flood" ? 0x2a3a44 : 0x8fc7e8);
      this.camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 100); this.raycaster = new THREE.Raycaster();
      this.center = new THREE.Vector3(0, 0.5, 0); this.orbitYaw = 0; this.orbitPitch = 0.9; this.radius = 6;
      this._minR = 4; this._maxR = 9;
      this.scene.add(new THREE.HemisphereLight(0xffffff, 0x40454a, 1.05));
      var dir = new THREE.DirectionalLight(0xffffff, 0.5); dir.position.set(4, 8, 5); this.scene.add(dir);
      this._items = {}; this._meshes = []; this._anims = []; this._env = []; this._extra = [];
      this._buildEnv(); this._placeItems(); this._buildFuse(); this._updateCamera(); this._syncSafety();
      this._toast("Stay safe first. Switch off the main power at the fusebox, then open the tools box for your gloves and boots.", "info", 6000);
      var self = this; this._bind(c);
      this._resize = function () { self._onResize(); }; window.addEventListener("resize", this._resize);
      this.running = true; this._loop(performance.now());
    },
    stop: function () {
      this.running = false; if (this._raf) cancelAnimationFrame(this._raf), this._raf = null;
      if (this._resize) window.removeEventListener("resize", this._resize);
      if (this._unbind) this._unbind();
      try { if (this.renderer) this.renderer.dispose(); } catch (e) {}
    },
    _m: function (geo, color, x, y, z) { var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color })); m.position.set(x || 0, y || 0, z || 0); return m; },
    _buildEnv: function () {
      var s = this.scene;
      if (this.scenario === "flood") {
        s.add(this._m(new THREE.BoxGeometry(7, 0.2, 6), 0x9a8256, 0, -0.1, 0));
        var wet = this._m(new THREE.BoxGeometry(6.6, 0.03, 5.6), 0x3f6a80, 0, 0.03, 0); wet.material.transparent = true; wet.material.opacity = 0.4; s.add(wet);
        s.add(this._m(new THREE.BoxGeometry(7, 3, 0.16), 0xe4e8ec, 0, 1.4, -3));
        s.add(this._m(new THREE.BoxGeometry(0.16, 3, 6), 0xd7dde2, -3.42, 1.4, 0));
        s.add(this._m(new THREE.BoxGeometry(7, 0.16, 0.06), 0x8a6a45, 0, 0.1, -2.92));
        s.add(this._m(new THREE.BoxGeometry(0.06, 0.16, 6), 0x8a6a45, -3.34, 0.1, 0));
        var mud = this._m(new THREE.BoxGeometry(7, 0.5, 0.22), 0x6a5230, 0, 0.24, -2.86); mud.material.transparent = true; mud.material.opacity = 0.8; s.add(mud);
        var sofa = this._m(new THREE.BoxGeometry(1.6, 0.5, 0.7), 0x5a7a86, -2.2, 0.28, -2.3); s.add(sofa);
        s.add(this._m(new THREE.BoxGeometry(1.6, 0.5, 0.18), 0x4d6a75, -2.2, 0.6, -2.62));
        var tbl = this._m(new THREE.BoxGeometry(1.1, 0.08, 0.7), 0x8a6a45, 1.9, 0.55, -2.4); s.add(tbl);
        for (var mi = 0; mi < 7; mi++) { var mud = this._m(new THREE.CylinderGeometry(0.18 + Math.random() * 0.14, 0.2, 0.02, 10), 0x6a5636, -2.4 + Math.random() * 4.8, 0.02, -1.6 + Math.random() * 3.6); mud.material.transparent = true; mud.material.opacity = 0.7; s.add(mud); }
        var br = new THREE.Group(); br.add(this._m(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8), 0xb58a4a, 0, 0.75, 0)); br.add(this._m(new THREE.BoxGeometry(0.36, 0.16, 0.12), 0xd9b25a, 0, 0.06, 0)); br.position.set(-3.1, 0, -1.4); br.rotation.z = 0.34; s.add(br);
      } else {
        s.add(this._m(new THREE.BoxGeometry(7, 0.2, 6), 0x6faa4e, 0, -0.1, 0));
        var path = this._m(new THREE.BoxGeometry(1.4, 0.04, 6), 0xbfae86, 0.4, 0.02, 0); s.add(path);
        s.add(this._m(new THREE.BoxGeometry(7, 3, 0.18), 0xe6d7b8, 0, 1.4, -3));
        s.add(this._m(new THREE.BoxGeometry(2.0, 1.9, 0.1), 0xd8c39a, -1.8, 0.95, -2.9));
        s.add(this._m(new THREE.BoxGeometry(0.5, 0.9, 0.06), 0x7a5233, -1.8, 0.45, -2.83));
        s.add(this._m(new THREE.BoxGeometry(7, 0.3, 0.3), 0x9c6b3b, 0, 2.9, -3));
        for (var fx = -3; fx <= 3; fx += 0.9) { s.add(this._m(new THREE.BoxGeometry(0.08, 0.7, 0.08), 0xcfc3a0, fx, 0.35, 2.7)); }
        s.add(this._m(new THREE.BoxGeometry(7, 0.08, 0.08), 0xcfc3a0, 0, 0.6, 2.7));
        var trunk = this._m(new THREE.CylinderGeometry(0.16, 0.2, 1.6, 8), 0x7a4f28, 2.6, 0.6, -1.6); s.add(trunk);
        var leaf = this._m(new THREE.SphereGeometry(0.7, 10, 8), 0x3f8a3f, 2.6, 1.5, -1.6); s.add(leaf);
        for (var li = 0; li < 12; li++) { var lf = this._m(new THREE.SphereGeometry(0.07 + Math.random() * 0.05, 6, 5), (Math.random() < 0.5 ? 0x6f9a3f : 0xb08a3a), -3 + Math.random() * 5.8, 0.03, -1.8 + Math.random() * 4); lf.scale.y = 0.3; s.add(lf); }
        var brk = new THREE.Group(); brk.add(this._m(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8), 0xb58a4a, 0, 0.75, 0)); brk.add(this._m(new THREE.BoxGeometry(0.36, 0.16, 0.12), 0xd9b25a, 0, 0.06, 0)); brk.position.set(-3.0, 0, 2.0); brk.rotation.z = 0.34; s.add(brk);
      }
      this._buildBins();
    },
    _label: function (text) {
      var cv = document.createElement("canvas"); cv.width = 200; cv.height = 64; var x = cv.getContext("2d");
      x.fillStyle = "rgba(14,34,51,0.85)"; x.fillRect(6, 12, 188, 40);
      x.fillStyle = "#fff"; x.font = "bold 26px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 100, 34);
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false, depthWrite: false }));
      sp.scale.set(1.2, 0.38, 1); return sp;
    },
    _binModel: function (color, lid) {
      var g = new THREE.Group();
      g.add(this._m(new THREE.BoxGeometry(0.5, 0.62, 0.5), color, 0, 0.31, 0));
      g.add(this._m(new THREE.BoxGeometry(0.56, 0.08, 0.56), lid, 0, 0.66, 0));
      g.add(this._m(new THREE.BoxGeometry(0.52, 0.14, 0.02), 0xffffff, 0, 0.36, 0.26));
      return g;
    },
    _buildBins: function () {
      var self = this; this._binPos = {}; this._binGroups = {};
      var defs = [{ k: "bio", c: 0x3a9d4a, l: 0x2f7f3c, x: 1.3, name: "Bio" }, { k: "recycle", c: 0x2a7fd0, l: 0x2166ab, x: 2.1, name: "Recycle" }, { k: "special", c: 0xd23b3b, l: 0xa82c2c, x: 2.9, name: "Special" }];
      for (var i = 0; i < defs.length; i++) {
        var d = defs[i], g = this._binModel(d.c, d.l); g.position.set(d.x, 0, 2.4); this.scene.add(g);
        this._binPos[d.k] = { x: d.x, z: 2.4 }; this._binGroups[d.k] = g;
        var lb = this._label(d.name); lb.position.set(d.x, 1.0, 2.4); this.scene.add(lb);
      }
      var keep = new THREE.Group();
      keep.add(this._m(new THREE.BoxGeometry(0.7, 0.4, 0.5), 0xb08a52, 0, 0.2, 0));
      keep.add(this._m(new THREE.BoxGeometry(0.72, 0.06, 0.52), 0x8a6a3a, 0, 0.02, 0));
      keep.position.set(-2.7, 0, 2.4); this.scene.add(keep); this._keepGroup = keep;
      this._keepPos = { x: -2.7, z: 2.4 };
      var kl = this._label("Keep"); kl.position.set(-2.7, 0.9, 2.4); this.scene.add(kl);
    },
    _buildFuse: function () {
      var g = new THREE.Group();
      var body = this._m(new THREE.BoxGeometry(0.4, 0.5, 0.14), 0x9299a0, 0, 0, 0); g.add(body);
      g.add(this._m(new THREE.BoxGeometry(0.44, 0.06, 0.16), 0x7a828a, 0, 0.28, 0));
      g.add(this._m(new THREE.BoxGeometry(0.28, 0.34, 0.02), 0x2a2f34, 0, 0, 0.08));
      var lever = this._m(new THREE.BoxGeometry(0.08, 0.2, 0.06), 0xd23b3b, 0, 0.06, 0.11); g.add(lever);
      var lbl = this._label("Main switch"); lbl.position.set(0, 0.5, 0.1); g.add(lbl);
      var pos = this.scenario === "flood" ? { x: 2.5, y: 1.35, z: -2.84 } : { x: -1.8, y: 1.5, z: -2.78 };
      g.position.set(pos.x, pos.y, pos.z); this.scene.add(g);
      this._fuse = g; this._fuseLever = lever;
      var self = this; g.traverse(function (o) { if (o.isMesh) { o.userData.role = "fuse"; self._extra.push(o); } });
    },
    _toggleFuse: function () {
      if (this.powerOff) { this._toast("The main power is already off.", "info", 1800); return; }
      this.powerOff = true;
      if (this._fuseLever) { this._fuseLever.material.color = new THREE.Color(0x2fa84a); this._anims.push({ kind: "lever", obj: this._fuseLever, t: 0, dur: 0.35 }); }
      this._toast("Main power is off. Now wet outlets and puddles will not shock you. Get your gloves and boots next.", "good", 4200);
      this._syncSafety();
    },
    equipGear: function () {
      this._hide("clean-tools");
      if (this.geared) return;
      this.geared = true;
      this._toast("Gloves and boots on. " + (this.powerOff ? "You are ready. Start cleaning." : "Now switch off the main power at the fusebox."), "good", 4000);
      this._syncSafety();
    },
    _prepDone: function () { return this.powerOff && this.geared; },
    _syncSafety: function () {
      var el = document.getElementById("clean-safety"); if (!el) return;
      var msg = this._prepDone() ? "Safe to clean" : !this.powerOff && !this.geared ? "Safety first: switch off power, get gear" : !this.powerOff ? "Next: switch off the main power" : "Next: get your gloves and boots";
      el.textContent = msg; el.className = "sapa-chip " + (this._prepDone() ? "on" : "");
    },
    zoom: function (dir) { if (!this.running) return; this.radius = Logic.clamp(this.radius + dir * (this._maxR - this._minR) * 0.16, this._minR, this._maxR); },
    _itemProp: function (id) {
      var g = new THREE.Group(), self = this;
      function M(c, r) { return new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? 0.8 : r }); }
      function glass(c, o) { var m = M(c, 0.1); m.transparent = true; m.opacity = o == null ? 0.5 : o; return m; }
      function box(x, y, z, m) { return new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m); }
      function cyl(a, b, hh, m) { return new THREE.Mesh(new THREE.CylinderGeometry(a, b, hh, 14), m); }
      function sph(r, m) { return new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), m); }
      function cone(r, hh, m) { return new THREE.Mesh(new THREE.ConeGeometry(r, hh, 12), m); }
      function add(mesh, x, y, z, rx, ry, rz) { mesh.position.set(x || 0, y || 0, z || 0); if (rx) mesh.rotation.x = rx; if (ry) mesh.rotation.y = ry; if (rz) mesh.rotation.z = rz; g.add(mesh); return mesh; }
      var PI = Math.PI, i;
      switch (id) {
        case "food":
          add(cyl(0.24, 0.18, 0.16, M(0xe4e0d2)), 0, 0.1, 0); add(sph(0.2, M(0xcaa96a)), 0, 0.2, 0); add(sph(0.08, M(0x8a6a3a)), 0.1, 0.24, 0.06); break;
        case "meds":
          add(cyl(0.12, 0.13, 0.28, M(0xc98a3a, 0.4)), 0, 0.16, 0); add(cyl(0.13, 0.13, 0.07, M(0xffffff)), 0, 0.33, 0); add(cyl(0.05, 0.05, 0.03, M(0xd23b3b)), 0.18, 0.03, 0.1, PI / 2); break;
        case "can":
          add(cyl(0.16, 0.16, 0.34, M(0xb8bcc0, 0.4)), 0, 0.2, 0); add(cyl(0.162, 0.162, 0.16, M(0x7a5230, 0.7)), 0, 0.17, 0); add(cyl(0.14, 0.14, 0.02, M(0x9aa0a5)), 0, 0.38, 0); break;
        case "plates":
          add(cyl(0.28, 0.28, 0.04, M(0xf0ede6)), 0, 0.06, 0); add(cyl(0.26, 0.26, 0.04, M(0xe6e2d8)), 0, 0.12, 0); add(cyl(0.24, 0.24, 0.04, M(0xf0ede6)), 0, 0.18, 0); add(box(0.05, 0.02, 0.24, M(0xcfd3d6)), 0.34, 0.06, 0, 0, 0.4); break;
        case "photos":
          add(box(0.34, 0.02, 0.26, M(0xffffff)), 0, 0.06, 0, 0, 0.2, 0.06); add(box(0.32, 0.02, 0.24, M(0xf3efe6)), 0.03, 0.09, 0.02, 0, -0.15, -0.05); add(box(0.2, 0.015, 0.14, M(0x7fa0c0)), 0.02, 0.11, 0.01, 0, 0.1); break;
        case "outlet":
          add(box(0.34, 0.44, 0.12, M(0xf0f0f0)), 0, 0.32, 0); add(box(0.16, 0.2, 0.04, M(0xdadada)), 0, 0.36, 0.08);
          add(box(0.02, 0.06, 0.02, M(0x2a2a2a)), -0.04, 0.4, 0.1); add(box(0.02, 0.06, 0.02, M(0x2a2a2a)), 0.04, 0.4, 0.1);
          add(box(0.08, 0.1, 0.02, glass(0x9fd0e6, 0.5)), 0, 0.2, 0.08); break;
        case "water":
          add(cyl(0.36, 0.4, 0.06, M(0x5a6a58, 0.3)), 0, 0.05, 0); var pud = cyl(0.32, 0.32, 0.03, glass(0x4a6a5a, 0.7)); add(pud, 0, 0.08, 0); add(sph(0.05, M(0x3a4a3a)), 0.1, 0.1, 0.06); break;
        case "branches":
          add(cyl(0.04, 0.05, 0.7, M(0x7a4f28)), 0, 0.08, 0, 0, 0, PI / 2 - 0.2); add(cyl(0.03, 0.04, 0.6, M(0x8a5f38)), 0.05, 0.14, 0.05, 0, 0.7, PI / 2 + 0.3); add(sph(0.12, M(0x3f8a3f)), 0.24, 0.14, 0.04); add(sph(0.1, M(0x4f9a4f)), -0.2, 0.12, -0.06); break;
        case "wrapper":
          add(cyl(0.12, 0.09, 0.24, glass(0xcfe4f0, 0.5)), 0, 0.14, 0, 0.4, 0, 0.3); add(cyl(0.01, 0.01, 0.24, M(0xe23a2b)), 0.06, 0.2, 0.04, 0.4, 0, 0.2); break;
        case "battery":
          add(cyl(0.09, 0.09, 0.28, M(0x2aa84a, 0.5)), 0, 0.15, 0, 0, 0, PI / 2); add(cyl(0.09, 0.09, 0.08, M(0x111)), -0.1, 0.15, 0, 0, 0, PI / 2); add(cyl(0.03, 0.03, 0.04, M(0xd4af37)), 0.16, 0.15, 0, 0, 0, PI / 2); break;
        case "plant":
          add(cyl(0.16, 0.13, 0.28, M(0xc86b3a)), 0.1, 0.14, 0, 0, 0, PI / 2 - 0.5); add(sph(0.16, M(0x6a4a2a, 0.9)), -0.06, 0.06, 0); add(sph(0.18, M(0x3f8a3f)), -0.24, 0.14, 0.02); add(sph(0.12, M(0x4f9a4f)), -0.32, 0.22, -0.06); break;
        case "wire":
          add(cyl(0.03, 0.03, 0.9, M(0x1a1a1a)), 0, 0.06, 0, 0, 0.3, PI / 2 - 0.1); add(cyl(0.03, 0.03, 0.5, M(0x222)), 0.3, 0.1, 0.1, 0, 1.1, PI / 2 + 0.3); add(cyl(0.05, 0.05, 0.1, M(0x8a7a5a)), -0.4, 0.08, -0.05, 0, 0, PI / 2); add(sph(0.06, self._emes ? self._emes : new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffa000, emissiveIntensity: 0.8 })), 0.42, 0.12, 0.14); break;
        case "roof":
          var r1 = box(0.9, 0.04, 0.6, M(0x9aa0a6, 0.5)); add(r1, 0, 0.14, 0, 0.1, 0.3, 0.12); add(box(0.9, 0.05, 0.06, M(0x8a9096)), 0, 0.2, -0.2, 0.1, 0.3, 0.12); add(box(0.9, 0.05, 0.06, M(0x8a9096)), 0, 0.16, 0.2, 0.1, 0.3, 0.12); break;
        case "glass":
          add(cone(0.1, 0.24, glass(0xbfe0f0, 0.55)), -0.1, 0.12, 0, 0, 0, 0.5); add(cone(0.08, 0.2, glass(0xd0e8f4, 0.55)), 0.12, 0.1, 0.06, 0, 0, -0.6); add(cone(0.06, 0.16, glass(0xbfe0f0, 0.55)), 0.02, 0.08, -0.1, 0, 0, 0.2); break;
        default: add(box(0.3, 0.3, 0.3, M(0x9aa7b0)), 0, 0.15, 0);
      }
      return g;
    },
    _placeItems: function () {
      var slots = [[-1.9, -1.2], [0.1, -1.5], [1.7, -1.3], [-2.2, 0.1], [-0.6, -0.1], [1.0, 0.2], [-1.3, 1.3], [0.5, 1.4]];
      for (var i = 0; i < this.items.length; i++) {
        var it = this.items[i], sl = slots[i % slots.length];
        var grp = this._itemProp(it.id);
        if (it.id === "outlet") { grp.position.set(-0.9, 0.62, -2.84); sl = [-0.9, -2.84]; }
        else grp.position.set(sl[0], 0.06, sl[1]);
        (function (id, self) { grp.traverse(function (o) { if (o.isMesh) { o.userData.id = id; self._meshes.push(o); } }); })(it.id, this);
        this.scene.add(grp);
        this._items[it.id] = { group: grp, y0: grp.position.y, slot: sl, fixed: it.id === "outlet" };
      }
    },
    _bind: function (canvas) {
      var self = this, mode = null, moved = false, sx = 0, sy = 0, lx = 0, ly = 0, pd = 0;
      var plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);
      function pt(e) { if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY }; }
      function dist2(e) { var a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
      function pick(p) {
        var c = document.getElementById("canvas-clean"); if (!c) return null; var r = c.getBoundingClientRect();
        var nd = new THREE.Vector2(((p.x - r.left) / r.width) * 2 - 1, -((p.y - r.top) / r.height) * 2 + 1);
        self.raycaster.setFromCamera(nd, self.camera);
        var hits = self.raycaster.intersectObjects(self._meshes.concat(self._extra || []), false);
        return hits.length ? hits[0].object.userData : null;
      }
      function planePoint(p) {
        var c = document.getElementById("canvas-clean"); var r = c.getBoundingClientRect();
        var nd = new THREE.Vector2(((p.x - r.left) / r.width) * 2 - 1, -((p.y - r.top) / r.height) * 2 + 1);
        self.raycaster.setFromCamera(nd, self.camera);
        var out = new THREE.Vector3(); self.raycaster.ray.intersectPlane(plane, out); return out;
      }
      this._down = function (e) {
        if (e.touches && e.touches.length >= 2) return;
        var p = pt(e); sx = lx = p.x; sy = ly = p.y; moved = false;
        var u = pick(p);
        if (u && u.role === "fuse") { mode = "fuse"; }
        else if (u && u.id && !self.done[u.id]) {
          if (!self._prepDone()) { mode = "orbit"; self._toast(self.powerOff ? "Open the tools box and put on your gloves and boots first." : "Switch off the main power at the fusebox first, before you touch anything wet.", "info", 3400); }
          else { mode = "item"; self._dragId = u.id; }
        } else { mode = "orbit"; }
      };
      this._move = function (e) {
        if (!mode || self._pinching) return;
        var p = pt(e); if (!moved && Math.hypot(p.x - sx, p.y - sy) > 6) moved = true;
        if (mode === "item") {
          if (!moved) return; var rec = self._items[self._dragId]; if (!rec) return;
          var pp = planePoint(p); rec.group.position.set(Logic.clamp(pp.x, -3.2, 3.2), 0.5, Logic.clamp(pp.z, -2.8, 2.8));
        } else if (mode === "orbit") {
          self.orbitYaw -= (p.x - lx) * 0.006; self.orbitPitch = Logic.clamp(self.orbitPitch + (p.y - ly) * 0.005, 0.5, 1.25);
        }
        lx = p.x; ly = p.y; if (e.cancelable) e.preventDefault();
      };
      this._up = function () {
        if (self._pinching) { mode = null; return; }
        if (mode === "fuse" && !moved) self._toggleFuse();
        else if (mode === "item") { var id = self._dragId; self._dragId = null; if (!moved) self._tapItem(id); else self._resolveDrop(id); }
        mode = null;
      };
      this._wheel = function (e) { self.radius = Logic.clamp(self.radius + (e.deltaY > 0 ? 1 : -1) * (self._maxR - self._minR) * 0.1, self._minR, self._maxR); if (e.cancelable) e.preventDefault(); };
      this._ts = function (e) { if (e.touches.length === 2) { self._pinching = true; pd = dist2(e); } };
      this._tm = function (e) { if (e.touches.length === 2) { self._pinching = true; var d = dist2(e); if (pd > 0 && d > 0) self.radius = Logic.clamp(self.radius * (pd / d), self._minR, self._maxR); pd = d; if (e.cancelable) e.preventDefault(); } };
      this._te = function (e) { if (e.touches.length < 2) { self._pinching = false; pd = 0; } };
      canvas.addEventListener("pointerdown", this._down); window.addEventListener("pointermove", this._move, { passive: false }); window.addEventListener("pointerup", this._up);
      canvas.addEventListener("wheel", this._wheel, { passive: false });
      canvas.addEventListener("touchstart", this._ts, { passive: false }); canvas.addEventListener("touchmove", this._tm, { passive: false }); canvas.addEventListener("touchend", this._te);
      this._unbind = function () {
        canvas.removeEventListener("pointerdown", self._down); window.removeEventListener("pointermove", self._move); window.removeEventListener("pointerup", self._up);
        canvas.removeEventListener("wheel", self._wheel); canvas.removeEventListener("touchstart", self._ts); canvas.removeEventListener("touchmove", self._tm); canvas.removeEventListener("touchend", self._te);
      };
    },
    _dest: function (p) {
      var best = null, bd = 1.05;
      if (this._binPos) for (var k in this._binPos) { var b = this._binPos[k], d = Math.hypot(p.x - b.x, p.z - b.z); if (d < bd) { bd = d; best = { kind: "bin", key: k }; } }
      if (this._keepPos) { var d2 = Math.hypot(p.x - this._keepPos.x, p.z - this._keepPos.z); if (d2 < bd) { bd = d2; best = { kind: "keep" }; } }
      return best;
    },
    _tapItem: function (id) {
      var it = this._find(id); if (!it || this.done[id]) return;
      if (it.action === "hazard") { this.current = id; this._success(it); return; }
      var rec = this._items[id]; if (rec) rec.group.position.y = rec.y0;
      this._toast("Drag " + it.name.toLowerCase() + " to the right bin, or to the Keep box.", "info", 3000);
    },
    _resolveDrop: function (id) {
      var it = this._find(id); if (!it || this.done[id]) return;
      var rec = this._items[id]; var p = rec.group.position, dest = this._dest(p);
      if (it.action === "hazard") { this.mistakes++; this._toast("Never touch a hazard. Tap it to report it to an adult instead.", "bad", 4200); this._snapBack(id); return; }
      if (!dest) { this._toast("Drop it on a bin, or the Keep box.", "info", 2400); this._snapBack(id); return; }
      if (dest.kind === "keep") {
        if (it.action === "keep") { this.current = id; this._success(it); }
        else { this.mistakes++; this._toast("This is waste. Drop it in a bin instead.", "bad", 3600); this._snapBack(id); }
      } else {
        if (it.action !== "toss") { this.mistakes++; this._toast("You can clean and keep this. Use the Keep box.", "bad", 3800); this._snapBack(id); }
        else if (dest.key === it.bin) { this.current = id; this._success(it, this.CL.binLabel[dest.key], dest.key); }
        else { this.mistakes++; this._toast("Not the " + this.CL.binLabel[dest.key].toLowerCase() + " bin. " + it.why, "bad", 4200); this._snapBack(id); }
      }
    },
    _snapBack: function (id) {
      var rec = this._items[id]; if (!rec) return; var g = rec.group;
      this._anims.push({ kind: "return", obj: g, from: g.position.clone(), tx: rec.slot[0], ty: rec.y0, tz: rec.slot[1], t: 0, dur: 0.4 });
    },
    _tap: function (pt) {
      var cm = document.getElementById("clean-modal"), bm = document.getElementById("bin-modal");
      if ((cm && cm.classList.contains("open")) || (bm && bm.classList.contains("open"))) return;
      var c = document.getElementById("canvas-clean"); if (!c) return; var r = c.getBoundingClientRect();
      var nd = new THREE.Vector2(((pt.x - r.left) / r.width) * 2 - 1, -((pt.y - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(nd, this.camera);
      var hits = this.raycaster.intersectObjects(this._meshes, false); if (!hits.length) return;
      var id = hits[0].object.userData.id; if (id) this._openItem(id);
    },
    _find: function (id) { for (var i = 0; i < this.items.length; i++) if (this.items[i].id === id) return this.items[i]; return null; },
    _openItem: function (id) {
      var it = this._find(id); if (!it || this.done[id]) return; this.current = id;
      var ic = document.getElementById("clean-ic"), nm = document.getElementById("clean-name"), de = document.getElementById("clean-desc");
      if (ic) ic.textContent = it.icon; if (nm) nm.textContent = it.name; if (de) de.textContent = it.desc;
      this._show("clean-modal");
    },
    closeItem: function () { this._hide("clean-modal"); this.current = null; },
    act: function (action) {
      var it = this._find(this.current); if (!it) return;
      if (action !== it.action) { this.mistakes++; this._toast(this.CL.explain(it), "bad", 4600); this._hide("clean-modal"); return; }
      if (it.action === "toss") { this._hide("clean-modal"); this._openBin(it); }
      else { this._success(it); }
    },
    _openBin: function (it) {
      var ic = document.getElementById("bin-ic"), nm = document.getElementById("bin-name");
      if (ic) ic.textContent = it.icon; if (nm) nm.textContent = it.name;
      this._show("bin-modal");
    },
    binBack: function () { this._hide("bin-modal"); if (this.current) this._openItem(this.current); },
    bin: function (b) {
      var it = this._find(this.current); if (!it) return;
      if (b === it.bin) { this._hide("bin-modal"); this._success(it, this.CL.binLabel[b], b); }
      else { this.mistakes++; this._toast("Not the " + this.CL.binLabel[b].toLowerCase() + " bin. " + it.why, "bad", 4200); }
    },
    _success: function (it, binName, binKey) {
      if (this.done[it.id]) return; this.done[it.id] = 1; this.remaining--; this._progress();
      var msg = it.action === "keep" ? "Cleaned and kept. Nice work." : it.action === "hazard" ? "Left it alone and told an adult. Smart and safe." : "Sorted into the " + (binName || "right") + " bin. Well done.";
      this._toast(msg, "good", 2400); this._cleanAnim(it, binKey); this.current = null;
      if (this.remaining <= 0) { this._pendingFinish = true; if (!this._anims || this._anims.length === 0) { this._pendingFinish = false; this._finish(); } }
    },
    _cleanAnim: function (it, binKey) {
      var rec = this._items[it.id]; if (!rec) return; var grp = rec.group, self = this;
      if (it.action === "hazard") {
        var cone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 4), new THREE.MeshStandardMaterial({ color: 0xf2b01c }));
        cone.rotation.y = Math.PI / 4; cone.position.set(grp.position.x + 0.32, 2.3, grp.position.z + 0.2); this.scene.add(cone);
        var band = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 4), new THREE.MeshStandardMaterial({ color: 0x2a2a2a }));
        band.rotation.y = Math.PI / 4; band.position.set(cone.position.x, 2.12, cone.position.z); this.scene.add(band);
        grp.traverse(function (o) { if (o.isMesh && o.material) { o.material.transparent = true; o.material.opacity = 0.85; } });
        this._anims.push({ kind: "drop", obj: cone, y1: 2.3, y0: 0.21, t: 0, dur: 0.5 });
        this._anims.push({ kind: "drop", obj: band, y1: 2.12, y0: 0.06, t: 0, dur: 0.5 });
        return;
      }
      var isKeep = it.action === "keep", key = isKeep ? "keep" : (binKey || it.bin);
      var target = isKeep ? this._keepPos : (this._binPos[key] || this._keepPos);
      this._anims.push({ kind: "toss", obj: grp, from: grp.position.clone(), tx: target.x, tz: target.z, t: 0, dur: 0.85, onDone: function () { self.scene.remove(grp); self._bounceBin(key); } });
    },
    _bounceBin: function (key) {
      var g = key === "keep" ? this._keepGroup : (this._binGroups ? this._binGroups[key] : null); if (!g) return;
      this._anims.push({ kind: "bounce", obj: g, t: 0, dur: 0.35, base: g.scale.y });
    },
    _progress: function () { var el = document.getElementById("clean-progress"); if (el) el.textContent = (this.items.length - this.remaining) + " of " + this.items.length + " done"; },
    _show: function (id) { var e = document.getElementById(id); if (e) e.classList.add("open"); },
    _hide: function (id) { var e = document.getElementById(id); if (e) e.classList.remove("open"); },
    _toast: function (msg, kind, ms) { var el = document.getElementById("clean-toast"); if (!el) return; el.textContent = msg; el.className = "sp-toast show " + (kind || "info"); var self = this; clearTimeout(this._toastT); this._toastT = setTimeout(function () { el.className = "sp-toast " + (kind || "info"); }, ms || 2600); },
    _finish: function () {
      this.stop();
      var stars = this.CL.rateStars(this.mistakes);
      var starEl = document.getElementById("clean-stars"); if (starEl) { var str = "", f = "\u2605", em = "\u2606"; for (var i = 0; i < 3; i++) str += (i < stars ? f : em); starEl.textContent = str; }
      var title = document.getElementById("clean-result-title"), msg = document.getElementById("clean-result-msg");
      if (title) title.textContent = this.data.title + " done!";
      if (msg) msg.textContent = this.mistakes === 0 ? "You cleaned up safely and sorted every bit of waste correctly. Outstanding!" : "The home is clean again. Remember to keep away from hazards and sort waste into the right bin.";
      var earned = (stars >= 3 && this.app && this.app.badges) ? this.app.badges.earn("cleanup") : false;
      var note = document.getElementById("clean-badge-note"); if (note) note.style.display = earned ? "" : "none";
      if (this.app) { this.app.show("screen-clean-result"); this.app.speak("Cleanup complete."); }
    },
    _onResize: function () { var c = document.getElementById("canvas-clean"); if (!c) return; var w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); },
    _updateCamera: function () { var cp = Math.cos(this.orbitPitch), sp = Math.sin(this.orbitPitch); this.camera.position.set(this.center.x + this.radius * cp * Math.sin(this.orbitYaw), this.center.y + this.radius * sp, this.center.z + this.radius * cp * Math.cos(this.orbitYaw)); this.camera.lookAt(this.center); },
    _loop: function (now) {
      if (!this.running) return; var self = this; this._raf = requestAnimationFrame(function (t) { self._loop(t); });
      var dt = Math.min(0.05, (now - (this._prev || now)) / 1000); this._prev = now;
      for (var i = this._anims.length - 1; i >= 0; i--) {
        var a = this._anims[i]; a.t += dt; var p = Math.min(1, a.t / a.dur);
        if (a.kind === "toss") {
          var e = p, x = a.from.x + (a.tx - a.from.x) * e, z = a.from.z + (a.tz - a.from.z) * e;
          var y = a.from.y + (0.55 - a.from.y) * e + Math.sin(Math.PI * e) * 1.1;
          a.obj.position.set(x, y, z); var sc = 1 - 0.9 * e; a.obj.scale.set(sc, sc, sc); a.obj.rotation.y += 0.25;
        } else if (a.kind === "return") {
          var q = 1 - Math.pow(1 - p, 2);
          a.obj.position.set(a.from.x + (a.tx - a.from.x) * q, a.from.y + (a.ty - a.from.y) * q, a.from.z + (a.tz - a.from.z) * q);
        } else if (a.kind === "drop") {
          a.obj.position.y = a.y1 + (a.y0 - a.y1) * (1 - Math.pow(1 - p, 2));
        } else if (a.kind === "bounce") {
          a.obj.scale.y = a.base * (1 + Math.sin(Math.PI * p) * 0.25);
        } else if (a.kind === "lever") {
          a.obj.rotation.z = -0.95 * (1 - Math.pow(1 - p, 2));
        }
        if (p >= 1) { if (a.kind === "bounce") a.obj.scale.y = a.base; if (a.onDone) a.onDone(); this._anims.splice(i, 1); }
      }
      if (this._pendingFinish && this._anims.length === 0) { this._pendingFinish = false; this._finish(); }
      this._updateCamera(); this.renderer.render(this.scene, this.camera);
    }
  };
  if (typeof window !== "undefined") window.Cleanup = Cleanup;

  /* =====================================================================
     6) BOOTSTRAP
     ===================================================================== */
  function boot() { App.players.load(); App.wire(); App.renderAddAvatars(); App.startFromPlayers(); }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
})();
