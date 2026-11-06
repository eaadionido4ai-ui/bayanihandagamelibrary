// Lipad-Iwas: the screens. The About page is the home page; from there, Start opens the worlds, and a world opens a
// flight. The rules live in engine.js (window.LipadIwas) and the pictures in draw.js (window.LipadDraw).
// Progress (stars and Hazard Cards) is kept only on this device. No names, no accounts, nothing sent anywhere.
// Inside the BAYANIHanda library (?embed=1, in a frame) it opens at the worlds instead (see below).
// Plain ES5, so it runs on older phones too.
(function () {
  'use strict';
  var LI = window.LipadIwas, D = window.LipadDraw, W = LI.W, H = LI.H;
  var VERSION = '0.1.0', KEY = 'lipad-iwas:v1', BREAK_AFTER = 20 * 60; // the build checks VERSION against package.json
  var EA = ['Edward Andrew A. Dionido', 'Science Research Specialist II', 'UPRI'];
  var stage = document.getElementById('stage');
  var SCALE = 1;

  /* ===== Inside the BAYANIHanda library (?embed=1, in a frame) =====
     The library opens the game at the level picked on its intro (&level=easy|hard), with its sound and voice settings
     (&sound=0|1, &voice=0|1). It has already asked for a grown-up when the player is younger than the level's age
     label, so the game skips its own question and shows the level instead of a picker. The library reads the game's
     lines aloud (postMessage 'say', and 'hush' to stop), since a frame has had no tap of its own yet. The game opens
     at the worlds with every world open, tells the library when the player leaves ('exit'), and keeps nothing on the
     device: stars and Hazard Cards last until the game is closed. */
  var ARGS = query(), EMBED = ARGS.embed === '1' && window.parent !== window;
  var VOICE = EMBED && ARGS.voice !== '0';
  function query() {
    var out = {}, q = String((window.location && window.location.search) || '').replace(/^\?/, '').split('&'), i, kv;
    for (i = 0; i < q.length; i++) {
      if (!q[i]) continue;
      kv = q[i].split('=');
      try { out[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')); } catch (e) { /* a broken part */ }
    }
    return out;
  }
  function post(msg) {
    if (!EMBED) return;
    msg.source = 'bayani-game'; msg.game = 'lipad';
    try { window.parent.postMessage(msg, '*'); } catch (e) { /* not in a frame */ }
  }
  // how a line should sound when read aloud
  function spoken(t) { return String(t).replace(/No\. (\d)/g, 'Number $1').replace(/\bVI\b/g, '6'); }
  // the library reads a line aloud: always with Bayani's voice on, and when asked (the speaker button) with it off
  function say(text, force) {
    if (!EMBED || !text || !SAVE.sound || (!VOICE && !force)) return;
    post({ type: 'say', text: spoken(text).slice(0, 400), force: !!force });
  }
  function read(text) { S.sayText = text; say(text); }
  function hush() { post({ type: 'hush' }); }

  /* ===== Saved on this device ===== */
  function fresh() { return { best: {}, cards: [], open: false, sound: true, day: '', secs: 0 }; }
  function load() {
    var d = fresh(), raw, o, k;
    if (EMBED) return d; // in the library: nothing kept on the device
    try {
      raw = window.localStorage.getItem(KEY);
      if (raw) { o = JSON.parse(raw); for (k in d) if (o && Object.prototype.hasOwnProperty.call(o, k)) d[k] = o[k]; }
    } catch (e) { d = fresh(); }
    if (!(d.cards instanceof Array)) d.cards = [];
    if (!d.best || typeof d.best !== 'object') d.best = {};
    return d;
  }
  function save() {
    if (EMBED) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(SAVE)); } catch (e) { /* private window or storage off: play goes on */ }
  }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  var SAVE = load();
  if (SAVE.day !== today()) { SAVE.day = today(); SAVE.secs = 0; }
  if (EMBED) { SAVE.open = true; SAVE.sound = ARGS.sound !== '0'; }

  var S = {
    screen: EMBED ? 'worlds' : 'home', world: 'bagyo', level: EMBED && ARGS.level === 'hard' ? 'hard' : 'easy',
    okHard: EMBED, run: null, overlay: null, paused: false, walk: 0, clock: 0, lastT: 0, session: 0, saveTick: 0,
    hudKey: '', fresh: [], toCard: 0, kbd: false, sayText: ''
  };

  /* ===== Small helpers ===== */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(sel) { return stage.querySelector(sel); }
  var ICON = {
    house: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    bag: '<path d="M6 8h12l1 13H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.7z"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    wind: '<path d="M3 8h10a3 3 0 1 0-3-3"/><path d="M3 12h15a3 3 0 1 1-3 3"/><path d="M3 16h7"/>',
    wave: '<path d="M2 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
    quake: '<path d="M2 12h4l2-5 3 10 3-8 2 3h6"/>',
    volcano: '<path d="M3 20l6-10h6l6 10z"/><path d="M10 6c0-1.5.8-2.5 2-3.5M14 6c0-1.5-.8-2.5-2-3.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    cards: '<rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v12"/>',
    tap: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7" opacity=".6"/><circle cx="12" cy="12" r="10.5" opacity=".3"/>',
    book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/>',
    clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    shieldok: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    people: '<circle cx="9" cy="7" r="3.5"/><path d="M2.5 21v-1.5A4.5 4.5 0 0 1 7 15h4a4.5 4.5 0 0 1 4.5 4.5V21"/><path d="M16 3.5a3.5 3.5 0 0 1 0 7"/><path d="M21.5 21v-1.5a4.5 4.5 0 0 0-3-4.2"/>',
    radio: '<rect x="7" y="6" width="10" height="16" rx="2"/><path d="M14 6V2"/><path d="M10 11h4M10 14h4"/>',
    sound: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    mute: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/>',
    restart: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>'
  };
  function ico(name, size, color, width) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + (color || 'currentColor') + '" stroke-width="'
      + (width || 2.2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICON[name] + '</svg>';
  }
  function heart(on, size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="' + (on ? '#ff5a5f' : 'none') + '" stroke="' + (on ? '#ff5a5f' : '#b9c7cf')
      + '" stroke-width="2" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICON.heart + '</svg>';
  }
  function star(on, size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="'
      + (on ? '#ffc53d' : '#ffffff') + '" stroke="' + (on ? '#e0a400' : '#b9c7cf') + '" stroke-width="' + (on ? 1.2 : 1.6) + '" stroke-linejoin="round"/></svg>';
  }
  function stars(n, size, cls) {
    var h = '<span class="' + (cls || 'stars') + '" role="img" aria-label="' + n + ' of 3 stars">';
    for (var i = 0; i < 3; i++) h += star(i < n, size);
    return h + '</span>';
  }
  var WUI = {
    bagyo: { icon: 'wind', color: '#2a8fd0' }, baha: { icon: 'wave', color: '#1b6fae' },
    lindol: { icon: 'quake', color: '#b06a1f' }, bulkan: { icon: 'volcano', color: '#b3261e' }
  };
  var REAL = {
    bagyo: 'When PAGASA raises a wind signal, get your go bag ready and leave early when your barangay tells you to evacuate.',
    baha: 'When a rainfall warning is up and the water is rising, move to higher ground early. Never walk or swim across floodwater.',
    lindol: 'After a strong quake near the sea, go to high ground right away. Do not wait for an official warning.',
    bulkan: 'Follow the PHIVOLCS alert level and your local officials, and evacuate as soon as you are told to.'
  };
  var FOOT = { listen: 'With a grown-up, listen for PAGASA updates.', phivolcs: 'With a grown-up, follow PHIVOLCS updates.' };
  function best(w, l) { return (SAVE.best[w] && SAVE.best[w][l]) || 0; }
  function bestAny(w) { return Math.max(best(w, 'easy'), best(w, 'hard')); }

  // Maya, as in the mockup, for the home and worlds screens
  function mayaSvg(w) {
    return '<svg class="maya" width="' + w + '" height="' + Math.round(w * 0.8) + '" viewBox="0 0 150 120" role="img" aria-label="Maya, a small brown sparrow, flying with a rolled-up warning message">'
      + '<path d="M24 64L2 54L8 70L2 84L28 74Z" fill="#7a4a24"/><ellipse cx="66" cy="70" rx="44" ry="34" fill="#a8743f"/><ellipse cx="74" cy="82" rx="30" ry="20" fill="#f0dcb8"/>'
      + '<path d="M50 62C38 30 58 10 88 14C76 30 74 46 70 64Z" fill="#7a4a24"/><path d="M58 42C66 36 74 33 81 31M56 52C64 46 72 43 79 41" stroke="#5b3518" stroke-width="3" fill="none" stroke-linecap="round"/>'
      + '<circle cx="104" cy="46" r="24" fill="#8a5a30"/><path d="M90 50C94 64 112 70 126 58C122 72 106 76 96 70C90 66 88 58 90 50Z" fill="#f4ead8"/>'
      + '<circle cx="108" cy="59" r="4.5" fill="#2a2320"/><circle cx="112" cy="42" r="5" fill="#1b1410"/><circle cx="113.6" cy="40.4" r="1.6" fill="#ffffff"/>'
      + '<path d="M126 44L142 49L126 54Z" fill="#3d3a38"/><path d="M62 102v8M76 102v8" stroke="#5b3518" stroke-width="3" stroke-linecap="round"/>'
      + '<g transform="translate(70 110) rotate(-6)"><rect x="-18" y="-7" width="36" height="14" rx="7" fill="#ffffff" stroke="#d14a24" stroke-width="2.5"/><text x="0" y="4" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="10" fill="#b33a1a">!</text></g></svg>';
  }
  function skyArt(h) {
    return '<svg class="bg" width="390" height="' + h + '" viewBox="0 0 390 ' + h + '" aria-hidden="true" focusable="false">'
      + '<rect width="390" height="' + h + '" fill="#8fd3f6"/><g fill="#ffffff" opacity="0.9"><ellipse cx="70" cy="110" rx="46" ry="18"/><ellipse cx="100" cy="98" rx="30" ry="18"/>'
      + '<ellipse cx="320" cy="70" rx="50" ry="18"/><ellipse cx="292" cy="58" rx="28" ry="16"/><ellipse cx="330" cy="250" rx="38" ry="14"/></g>'
      + '<path d="M0 ' + (h - 70) + 'C70 ' + (h - 110) + ' 140 ' + (h - 98) + ' 200 ' + (h - 78) + 'C260 ' + (h - 58) + ' 330 ' + (h - 90) + ' 390 ' + (h - 110) + 'V' + h + 'H0Z" fill="#7cc47a"/>'
      + '<path d="M0 ' + (h - 40) + 'C80 ' + (h - 70) + ' 170 ' + (h - 50) + ' 240 ' + (h - 38) + 'C300 ' + (h - 28) + ' 350 ' + (h - 50) + ' 390 ' + (h - 60) + 'V' + h + 'H0Z" fill="#5aa95a"/>'
      + '<g><rect x="40" y="' + (h - 72) + '" width="30" height="22" fill="#c98b4f"/><path d="M34 ' + (h - 70) + 'L55 ' + (h - 88) + 'L76 ' + (h - 70) + 'Z" fill="#8a5a2b"/>'
      + '<rect x="300" y="' + (h - 86) + '" width="34" height="24" fill="#e8e2d6"/><path d="M294 ' + (h - 84) + 'L317 ' + (h - 104) + 'L340 ' + (h - 84) + 'Z" fill="#c0322b"/>'
      + '<rect x="170" y="' + (h - 56) + '" width="28" height="20" fill="#c98b4f"/><path d="M165 ' + (h - 54) + 'L184 ' + (h - 70) + 'L203 ' + (h - 54) + 'Z" fill="#8a5a2b"/></g></svg>';
  }
  function chips(lv) {
    return '<div class="chips"><span class="chip pillar">GET READY</span><span class="chip age">Ages ' + (lv === 'hard' ? '10 to 15' : '6 to 10') + '</span>'
      + '<span class="chip wt">Working title</span></div>';
  }
  function credits() {
    var aI = window.affIcon ? window.affIcon(EA[0], 'aff-ea') : '', aM = window.affMore ? window.affMore(EA[0], 'aff-ea') : '';
    return '<div class="credits"><span class="validate">' + ico('info', 15, '#7a5400', 2.4) + 'Subject for code and content validation</span>'
      + '<span class="cr-lab">Conceptualized and developed with AI assistance by</span>'
      + '<span class="cr-name">' + esc(EA[0]) + aI + '</span><span class="cr-role">' + esc(EA[1]) + '</span><span class="cr-org">' + esc(EA[2]) + '</span>' + aM + '</div>';
  }

  /* ===== Sound: a few short tones made on the spot (no sound files) ===== */
  var AC = null;
  function audio() {
    if (!SAVE.sound) return null;
    try {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      AC = AC || new C();
      if (AC.state === 'suspended' && AC.resume) AC.resume();
      return AC;
    } catch (e) { return null; }
  }
  function tone(f, dur, type, vol, f2, delay) {
    var a = audio(); if (!a) return;
    try {
      var t0 = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      g.gain.setValueAtTime(vol || 0.06, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.03);
    } catch (e) { /* no sound */ }
  }
  var SFX = {
    flap: function () { tone(620, 0.07, 'triangle', 0.035, 820); },
    warn: function () { tone(880, 0.12, 'sine', 0.07); tone(1175, 0.18, 'sine', 0.07, 0, 0.11); },
    item: function () { tone(990, 0.08, 'sine', 0.06, 1480); },
    shield: function () { tone(660, 0.12, 'sine', 0.06); tone(990, 0.12, 'sine', 0.06, 0, 0.1); tone(1320, 0.2, 'sine', 0.06, 0, 0.2); },
    bump: function () { tone(180, 0.28, 'sawtooth', 0.06, 70); },
    gust: function () { tone(300, 0.4, 'triangle', 0.03, 520); },
    done: function () { tone(523, 0.14, 'sine', 0.07); tone(659, 0.14, 'sine', 0.07, 0, 0.13); tone(784, 0.14, 'sine', 0.07, 0, 0.26); tone(1047, 0.3, 'sine', 0.07, 0, 0.39); }
  };
  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* none */ } }

  /* ===== Fitting the 390 by 844 stage to the screen ===== */
  function fit() {
    // the space for the game: the screen less any notch or rounded corners (the #app box), or the window
    var box = document.getElementById('app'), r = box && box.getBoundingClientRect ? box.getBoundingClientRect() : null;
    var vw = (r && r.width) || window.innerWidth || W, vh = (r && r.height) || window.innerHeight || H;
    SCALE = Math.min(vw / W, vh / H) || 1;
    stage.style.transform = 'scale(' + SCALE + ')';
    sizeCanvas();
  }
  function edge(color) { document.body.style.setProperty('--edge', color); }

  /* ===== Screens ===== */
  function render() {
    stopSlides();
    var html = S.screen === 'home' ? homeHtml() : S.screen === 'worlds' ? worldsHtml() : S.screen === 'cards' ? cardsHtml() : playHtml();
    stage.innerHTML = html + '<div id="ov" class="overlay" hidden></div>';
    S.overlay = null;
    if (S.screen === 'play') setupPlay();
    edge(S.screen === 'play' ? D.PAL[S.world].edge : S.screen === 'cards' ? '#22313e' : '#8fd3f6');
    focusIn(stage, '[data-focus]');
  }
  // moves the keyboard focus to the main button of a new screen or sheet, for players using a keyboard
  function focusIn(root, sel) {
    var f = root.querySelector(sel) || (sel ? null : root.querySelector('button'));
    if (!S.kbd || !f || !f.focus) return;
    try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
  }
  function go(screen) { if (S.screen === 'play') leavePlay(); S.screen = screen; render(); }

  function homeHtml() {
    var mins = Math.round(SAVE.secs / 60), have = SAVE.cards.length;
    return '<section class="screen home" aria-label="About Lipad-Iwas"><div class="scroll">'
      + '<div class="hero">' + skyArt(470) + '<div style="position:relative;display:flex;flex-direction:column;align-items:center">' + chips() + mayaSvg(190)
      + '<h1 class="h1">Lipad-Iwas</h1><p class="tagline">Tap to fly. Dodge the hazards.<br>Warn every home in time.</p></div></div>'
      + '<div class="sheet">'
      + '<button class="cta" data-act="start" data-focus>Start playing ' + ico('arrow', 20, '#ffffff', 2.8) + '</button>'
      + '<div class="row2"><button class="ghost" data-act="walk">' + ico('tap', 18, '#16303f') + 'How to play</button>'
      + '<button class="ghost" data-act="manual">' + ico('book', 18, '#16303f') + 'User manual</button></div>'
      + '<button class="ghost" data-act="cards">' + ico('cards', 18, '#16303f') + 'Hazard Cards: ' + have + ' of ' + LI.CARDS.length + '</button>'
      + '<h2 class="h2">About the game</h2>'
      + '<p class="lead">Lipad-Iwas is a tap-to-fly game for children ages 6 to 10. Players guide Maya, a messenger bird, through four hazard worlds: a typhoon, a flood, an earthquake by the sea and a restless volcano. Along the way, Maya dodges the dangers each hazard brings and flies low over every home to warn the family inside in time. Each bump opens a Hazard Card with one simple safety tip, so even a mistake teaches something. Twelve cards cover what to do before, during and after each hazard.</p>'
      + '<p class="lead">The game belongs to the Get Ready pillar of the BAYANIHanda family. It turns early warning into play: hear the warning, act on it early, and help others act too.</p>'
      + '<h2 class="h2">For grown-ups</h2><ul class="notes">'
      + '<li>' + ico('people', 18, '#1a8f4c') + '<span>Easy is for ages 6 to 10. Difficult is for ages 10 to 15; younger players should play it with a grown-up.</span></li>'
      + '<li>' + ico('clock', 18, '#1a8f4c') + '<span>One flight takes about a minute. The game suggests a break after 20 minutes of play. Played today: ' + mins + ' minute' + (mins === 1 ? '' : 's') + '.</span></li>'
      + '<li>' + ico('shield', 18, '#1a8f4c') + '<span>No sign-up and no personal data. Stars and cards are saved only on this device. It works without internet.</span></li>'
      + '<li>' + ico('info', 18, '#1a8f4c') + '<span>The places and families are made up. For real warnings, listen to PAGASA, PHIVOLCS and your barangay.</span></li></ul>'
      + '<div class="switch-row"><span>Open all worlds<small>For teachers and parents who want to start anywhere</small></span>'
      + '<button class="switch" role="switch" aria-checked="' + (SAVE.open ? 'true' : 'false') + '" aria-label="Open all worlds" data-act="openall"></button></div>'
      + '<button class="ghost" data-act="askclear">' + ico('trash', 17, '#16303f') + 'Clear saved progress on this device</button>'
      + credits()
      + '<p class="fine">Lipad-Iwas is a working title; the name has not yet been checked against other programs. Version ' + esc(VERSION) + '. Fonts: Baloo 2 and Nunito (SIL Open Font License).</p>'
      + '</div></div></section>';
  }

  function worldsHtml() {
    var op = LI.opened(SAVE.best, SAVE.open), i, w, h = '', ui, n, lv = S.level;
    if (!op[S.world]) S.world = 'bagyo';
    for (i = 0; i < LI.WORLDS.length; i++) {
      w = LI.WORLDS[i]; ui = WUI[w.id];
      if (op[w.id]) {
        n = best(w.id, lv);
        h += '<button class="wbtn" data-act="world" data-id="' + w.id + '" aria-pressed="' + (S.world === w.id) + '">'
          + '<span style="display:flex;align-items:center;gap:8px;width:100%"><span class="wi" style="background:' + ui.color + '">' + ico(ui.icon, 18, '#ffffff', 2.4) + '</span>'
          + '<span style="display:flex;flex-direction:column"><span class="wn">' + w.name + '</span><span class="we">' + w.en + '</span></span></span>' + stars(n, 16) + '</button>';
      } else {
        h += '<button class="wbtn" disabled aria-label="' + w.name + ', ' + w.en + ': finish ' + LI.WORLDS[i - 1].name + ' to open">'
          + '<span style="display:flex;align-items:center;gap:8px;width:100%"><span class="wi" style="background:#c5d0d7">' + ico('lock', 16, '#ffffff', 2.6) + '</span>'
          + '<span style="display:flex;flex-direction:column"><span class="wn">' + w.name + '</span><span class="we">' + w.en + '</span></span></span>'
          + '<span class="lock">Finish ' + LI.WORLDS[i - 1].name + ' to open</span></button>';
      }
    }
    return '<section class="screen worlds" aria-label="Choose a world">' + skyArt(470)
      + (EMBED ? '<button class="back" data-act="leave" aria-label="Back to the library">' + ico('back', 16, '#16303f', 2.6) + 'Library</button>'
        : '<button class="back" data-act="home">' + ico('back', 16, '#16303f', 2.6) + 'Home</button>')
      + '<div class="wtop">' + chips(lv) + mayaSvg(150) + '<h1 class="h1">Lipad-Iwas</h1><p class="tagline">Tap to fly. Dodge the hazards.<br>Warn every home in time.</p></div>'
      + '<div class="sheet wsheet"><h2 class="h2">Choose a world</h2><div class="wgrid">' + h + '</div>'
      + (EMBED ? '<div class="lvrow"><b>Level</b><span class="lvtag">' + (lv === 'hard' ? 'Difficult' : 'Easy') + '</span></div>'
        : '<div class="lvrow"><b>Level</b><div class="seg" role="group" aria-label="Level">'
        + '<button data-act="level" data-id="easy" aria-pressed="' + (lv === 'easy') + '">Easy</button>'
        + '<button data-act="level" data-id="hard" aria-pressed="' + (lv === 'hard') + '">Difficult</button></div></div>')
      + '<button class="cta" data-act="fly" data-focus style="margin-top:auto">Lipad na! ' + ico('arrow', 20, '#ffffff', 2.8) + '</button>'
      + (EMBED ? '<div class="row2"><button class="ghost" data-act="walk">' + ico('tap', 18, '#16303f') + 'How to play</button>'
        + '<button class="ghost" data-act="cards">' + ico('cards', 18, '#16303f') + 'Cards: ' + SAVE.cards.length + ' of ' + LI.CARDS.length + '</button></div>'
        : '<button class="ghost" data-act="cards">' + ico('cards', 18, '#16303f') + 'Hazard Cards: ' + SAVE.cards.length + ' of ' + LI.CARDS.length + '</button>')
      + '</div></section>';
  }

  function cardsHtml() {
    var h = '', i, c, w, have;
    for (i = 0; i < LI.CARDS.length; i++) {
      c = LI.CARDS[i]; w = LI.world(c.world); have = SAVE.cards.indexOf(c.id) >= 0;
      if (have) h += '<button class="cbtn" data-act="card" data-id="' + c.id + '"><span class="stripe" style="background:' + WUI[w.id].color + '"></span>'
        + '<span class="cw">' + w.name + ' · ' + w.en + '</span><span class="ct">' + esc(c.title) + '</span><span class="cp">' + esc(c.when) + '</span></button>';
      else h += '<div class="cbtn locked" role="img" aria-label="A ' + w.name + ' card you have not found yet"><span class="stripe" style="background:#4a6072"></span>'
        + '<span class="cw">' + w.name + ' · ' + w.en + '</span><span class="qmark">?</span><span class="cp">Not found yet</span></div>';
    }
    return '<section class="screen cards-screen" aria-label="Hazard Cards"><button class="back" data-act="' + (S.from || 'worlds') + '" data-focus>' + ico('back', 16, '#16303f', 2.6) + 'Back</button>'
      + '<div class="scroll"><h1 class="h1">Hazard Cards</h1><p class="sub">' + SAVE.cards.length + ' of ' + LI.CARDS.length + ' found. A bump shows a card, and finishing a world adds all three of its cards.</p>'
      + '<div class="cgrid">' + h + '</div></div></section>';
  }

  function playHtml() {
    var w = LI.world(S.world), lv = LI.LEVELS[S.level];
    return '<section class="screen play" id="play" aria-label="' + w.name + ' flight">'
      + '<canvas id="cv" aria-label="Maya flying through the ' + w.en.toLowerCase() + ' world" role="img"></canvas>'
      + '<div class="hud"><span class="stat" id="h-homes">' + ico('house', 18, '#1a8f4c', 2.4) + '<span id="h-w">0 / 12</span> <small>warned</small></span><span class="sep"></span>'
      + '<span class="stat" id="h-items">' + ico('bag', 18, '#a84f08', 2.4) + '<span id="h-i">0</span><span class="bagdots" id="h-bag"><i></i><i></i><i></i></span><span id="h-sh"></span></span>'
      + '<span class="hearts" id="h-hearts" role="img" aria-label="3 of 3 hearts"></span>'
      + '<button class="iconbtn" data-act="pause" aria-label="Pause" style="width:34px;height:34px;background:#eef3f6;box-shadow:none"><svg width="14" height="14" viewBox="0 0 24 24" fill="#16303f" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></button></div>'
      + '<div class="prog"><div class="bar"><div class="fill" id="h-fill"></div><span class="dot" id="h-dot"></span></div><span class="lab">' + ico('flag', 14, '#ffffff', 2.4) + 'Evacuation center</span></div>'
      + '<span class="signal">' + ico(WUI[w.id].icon, 14, '#9cc9f5', 2.4) + esc(w.signal[lv.id]) + '</span>'
      + '<div class="mission" id="mission"><span class="wi" style="flex:none;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:' + WUI[w.id].color + '">' + ico(WUI[w.id].icon, 18, '#ffffff', 2.4) + '</span>'
      + '<div><b>' + w.name + ': ' + esc(w.signal[lv.id]) + '</b><p>' + esc(w.mission) + '</p></div></div>'
      + '<span class="taphint" id="taphint">' + ico('tap', 18, '#ffffff') + 'Tap anywhere to flap</span>'
      + '<div id="toasts"></div></section>';
  }

  /* ===== Sheets over the screens ===== */
  function overlay(kind, html) {
    var ov = document.getElementById('ov');
    if (!ov) return;
    S.overlay = kind;
    ov.innerHTML = html; ov.hidden = false;
    paintCanvases(ov);
    focusIn(ov, ov.querySelector('[data-focus]') ? '[data-focus]' : 'button');
    if (kind === 'walk') startSlides();
  }
  function closeOverlay() {
    var ov = document.getElementById('ov');
    stopSlides();
    if (ov) { ov.hidden = true; ov.innerHTML = ''; }
    if (S.overlay && S.sayText) { S.sayText = ''; hush(); }
    S.overlay = null;
  }
  function cardCanvas(id) {
    return '<canvas data-card="' + id + '" width="354" height="196" role="img" aria-label="Picture for the card ' + esc(LI.card(id).title) + '"></canvas>'
      + (EMBED && SAVE.sound ? '<button class="readbtn" data-act="read" aria-label="Read the card aloud">' + ico('sound', 20, '#16303f') + '</button>' : '');
  }
  function cardWords(c) { return c.title + '. ' + c.what + ' ' + c.when + ': ' + c.act; }
  function whenIcon(when) { return /^Before/.test(when) ? 'house' : /^During/.test(when) ? 'shield' : /^Right/.test(when) ? 'up' : 'check'; }
  function cardBody(c) {
    return '<h1 class="h1" id="ct">' + esc(c.title) + '</h1><p>' + esc(c.what) + '</p>'
      + '<div class="tip">' + ico(whenIcon(c.when), 22, '#1b6fae', 2.2) + '<span><strong>' + esc(c.when) + ':</strong> ' + esc(c.act) + '</span></div>';
  }
  function bumpSheet() {
    var s = S.run, c = LI.card(s.last.card), w = s.wd, out = s.hearts <= 0, n = SAVE.cards.indexOf(c.id) + 1;
    var pct = Math.round(100 * s.warned / s.houses.length);
    overlay('bump', '<div class="card" role="dialog" aria-modal="true" aria-labelledby="ct"><div class="art">' + cardCanvas(c.id) + '</div><div class="body">'
      + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' + (S.newCard ? '<span class="tag">NEW HAZARD CARD</span>' : '<span class="tag blue">HAZARD CARD</span>')
      + '<span style="font-weight:800;font-size:12px;color:#3d5361">' + n + ' of ' + LI.CARDS.length + '</span>'
      + (out ? '<span class="tag gray" style="margin-left:auto">OUT OF HEARTS</span>' : '<span style="margin-left:auto;display:flex;gap:2px" role="img" aria-label="' + s.hearts + ' hearts left">' + heart(s.hearts > 0, 16) + heart(s.hearts > 1, 16) + heart(s.hearts > 2, 16) + '</span>') + '</div>'
      + cardBody(c)
      + '<div class="meter"><span class="ml"><span>Homes you warned</span><span>' + s.warned + ' of ' + s.houses.length + '</span></span><div class="mt"><div class="mf" style="width:' + pct + '%"></div></div></div>'
      + (out ? '<p style="font-size:13.5px">Maya needs a rest. Every try teaches something new.</p>' : '')
      + '<div class="btns">' + (out ? '<button class="cta" data-act="again" data-focus>Try again</button><button class="ghost" data-act="quit">Worlds</button>'
        : '<button class="cta" data-act="keep" data-focus>Keep flying</button><button class="ghost" data-act="quit">Stop</button>') + '</div>'
      + '</div></div><p class="foot">' + ico('radio', 16, '#e3ecf2') + esc(FOOT[w.after]) + '</p>');
    read(cardWords(c));
  }
  function cardSheet(id) {
    var c = LI.card(id), w = LI.world(c.world), n = SAVE.cards.indexOf(id) + 1;
    overlay('card', '<div class="card" role="dialog" aria-modal="true" aria-labelledby="ct"><div class="art">' + cardCanvas(id) + '</div><div class="body">'
      + '<div style="display:flex;align-items:center;gap:8px"><span class="tag blue">' + esc(w.name.toUpperCase()) + ' · ' + esc(w.en.toUpperCase()) + '</span><span style="font-weight:800;font-size:12px;color:#3d5361">' + n + ' of ' + LI.CARDS.length + '</span></div>'
      + cardBody(c) + '<div class="btns"><button class="cta" data-act="close" data-focus>Got it</button></div></div></div>'
      + '<p class="foot">' + ico('radio', 16, '#e3ecf2') + esc(FOOT[w.after]) + '</p>');
    read(cardWords(c));
  }
  function resultSheet() {
    var s = S.run, n = LI.stars(s), w = s.wd, i = indexOfWorld(w.id), next = LI.WORLDS[i + 1], op = LI.opened(SAVE.best, SAVE.open);
    var learned = LI.cardsOf(w.id).map(function (id) {
      var isNew = S.fresh.indexOf(id) >= 0;
      return '<button data-act="card" data-id="' + id + '">' + ico('cards', 18, '#1b6fae') + '<span style="flex:1">' + esc(LI.card(id).title) + '</span>' + (isNew ? '<span class="tag" style="font-size:10px;padding:2px 8px">NEW</span>' : '') + '</button>';
    }).join('');
    overlay('done', '<div class="panel" role="dialog" aria-modal="true" aria-labelledby="rt"><span class="tag green">MISSION COMPLETE</span>'
      + '<h1 class="h1" id="rt">Nakarating si Maya!</h1>'
      + '<p>Maya reached the evacuation center and warned ' + s.warned + ' of ' + s.houses.length + ' homes' + (s.warned === s.houses.length ? '. Every family got the warning in time!' : '.') + '</p>'
      + stars(n, 46, 'bigstars')
      + '<div class="stats"><div class="stat-box"><span>Homes warned</span><b>' + s.warned + ' / ' + s.houses.length + '</b></div><div class="stat-box"><span>Go bag items</span><b>' + s.items + '</b></div><div class="stat-box"><span>Hearts left</span><b>' + s.hearts + '</b></div></div>'
      + '<div class="learned"><b style="font-size:13px;font-weight:900">Hazard Cards from ' + w.name + '</b>' + learned + '</div>'
      + '<div class="real">' + ico('shieldok', 24, '#3b2a00', 2.4) + '<span><strong>Real life:</strong> ' + esc(REAL[w.id]) + '</span></div>'
      + '<div class="btns">' + (next && op[next.id] ? '<button class="cta" data-act="next" data-focus>Next: ' + next.name + '</button>' : '<button class="cta" data-act="again" data-focus>Play again</button>')
      + (next && op[next.id] ? '<button class="ghost" data-act="again">Play again</button>' : '<button class="ghost" data-act="quit">Worlds</button>') + '</div>'
      + (next && op[next.id] ? '<button class="ghost" data-act="quit">Back to worlds</button>' : '')
      + (s.warned < s.houses.length ? '<p style="font-size:13px;text-align:center">Tip: fly low inside the light column over each home to warn it.</p>' : '')
      + '</div>');
    read('Nakarating si Maya! Maya warned ' + s.warned + ' of ' + s.houses.length + ' homes. Real life: ' + REAL[w.id]);
  }
  function pauseSheet() {
    var s = S.run;
    overlay('pause', '<div class="panel" role="dialog" aria-modal="true" aria-labelledby="pt"><span class="tag blue">PAUSED</span><h1 class="h1" id="pt">Pahinga sandali</h1>'
      + '<p>Homes warned so far: ' + s.warned + ' of ' + s.houses.length + '.</p>'
      + '<button class="cta" data-act="resume" data-focus>Keep flying</button>'
      + '<div class="row2"><button class="ghost" data-act="again">' + ico('restart', 17, '#16303f') + 'Start over</button><button class="ghost" data-act="quit">Worlds</button></div>'
      + '<button class="ghost" data-act="sound" aria-pressed="' + (SAVE.sound ? 'true' : 'false') + '">' + ico(SAVE.sound ? 'sound' : 'mute', 18, '#16303f') + 'Sound: ' + (SAVE.sound ? 'On' : 'Off') + '</button></div>');
  }
  function breakSheet() {
    overlay('break', '<div class="panel" role="dialog" aria-modal="true" aria-labelledby="bt"><span class="tag green">BREAK TIME</span><h1 class="h1" id="bt">Pahinga muna!</h1>'
      + '<p>You have played for 20 minutes. Rest your eyes: look at something far away, stretch, and drink some water.</p>'
      + '<div class="btns"><button class="cta" data-act="breakhome" data-focus>Take a break</button><button class="ghost" data-act="breakmore">5 more minutes</button></div></div>');
    read('Pahinga muna! You have played for 20 minutes. Rest your eyes, stretch, and drink some water.');
  }
  function gateSheet() {
    overlay('gate', '<div class="panel" role="dialog" aria-modal="true" aria-labelledby="gt"><span class="tag">DIFFICULT LEVEL</span><h1 class="h1" id="gt">Play with a grown-up</h1>'
      + '<p>The Difficult level is for ages 10 to 15. It is faster, the gaps are narrower, and each world adds a twist: gusts of wind, rising water or aftershocks. If you are younger, play it with a grown-up.</p>'
      + '<div class="btns"><button class="cta" data-act="gateyes" data-focus>We are ready</button><button class="ghost" data-act="gateno">Stay on Easy</button></div></div>');
  }
  var SLIDES = [
    ['Tap to flap', 'Tap anywhere on the screen, or press the space bar, to make Maya flap up. When you stop, she glides down.'],
    ['Dodge the hazards', 'Fly through the gaps. A yellow ! sign at the edge means something is about to blow in or fall.'],
    ['Fly low to warn a home', 'A home with a yellow ! still needs the warning. Fly low over it, inside its light column, and its flag turns green.'],
    ['Catch go bag bubbles', 'Each bubble holds something for a go bag. Three items fill the bag and give Maya a shield for one bump.'],
    ['Learn from every bump', 'A bump costs a heart and shows a Hazard Card with a safety tip. Reach the evacuation center to finish the world.']
  ];
  function walkSheet() {
    var i = S.walk, sl = SLIDES[i], dots = '';
    for (var k = 0; k < SLIDES.length; k++) dots += '<i class="' + (k === i ? 'on' : '') + '"></i>';
    overlay('walk', '<div class="panel" role="dialog" aria-modal="true" aria-labelledby="wt"><span class="tag blue">HOW TO PLAY · ' + (i + 1) + ' OF ' + SLIDES.length + '</span>'
      + '<div class="slides"><canvas class="pic" data-slide="' + i + '" width="300" height="190" role="img" aria-label="' + esc(sl[0]) + '"></canvas>'
      + '<h1 class="h1" id="wt" style="font-size:26px">' + esc(sl[0]) + '</h1><p>' + esc(sl[1]) + '</p><div class="dots" aria-hidden="true">' + dots + '</div></div>'
      + '<div class="btns">' + (i ? '<button class="ghost" data-act="wprev">Back</button>' : '<button class="ghost" data-act="close">Skip</button>')
      + (i < SLIDES.length - 1 ? '<button class="cta" data-act="wnext" data-focus>Next</button>' : '<button class="cta" data-act="wdone" data-focus>Let\'s fly!</button>') + '</div></div>');
    read(sl[0] + '. ' + sl[1]);
  }
  function manualSheet() {
    overlay('manual', '<div class="panel" role="dialog" aria-modal="true" aria-labelledby="mt"><span class="tag gray">COMING SOON</span><h1 class="h1" id="mt">User manual</h1>'
      + '<p>The full user manual is still being written. It will cover:</p>'
      + '<ul class="mlist"><li>Getting started and the controls</li><li>The four worlds and the two levels</li><li>The twelve Hazard Cards and what each one teaches</li>'
      + '<li>Ideas for teachers and parents, with questions to talk about after playing</li><li>Privacy, saved progress and how to clear it</li><li>Fixing common problems</li></ul>'
      + '<p>For now, tap How to play for a quick walkthrough.</p><button class="cta" data-act="close" data-focus>Close</button></div>');
  }
  function clearSheet() {
    overlay('clear', '<div class="panel" role="dialog" aria-modal="true" aria-labelledby="xt"><span class="tag gray">ON THIS DEVICE</span><h1 class="h1" id="xt">Clear saved progress?</h1>'
      + '<p>This removes the stars and Hazard Cards saved on this device. It cannot be undone.</p>'
      + '<div class="btns"><button class="cta" data-act="clear">Clear it</button><button class="ghost" data-act="close" data-focus>Keep it</button></div></div>');
  }

  // canvases inside a sheet: Hazard Card pictures and How to play pictures
  function prep(cv, w, h) {
    var ctx = cv.getContext ? cv.getContext('2d') : null, k = Math.min(3, (window.devicePixelRatio || 1) * SCALE);
    if (!ctx) return null;
    cv.width = Math.round(w * k); cv.height = Math.round(h * k); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    ctx.setTransform(k, 0, 0, k, 0, 0);
    return ctx;
  }
  function paintCanvases(root) {
    var list = root.querySelectorAll('canvas[data-card]'), i, ctx;
    for (i = 0; i < list.length; i++) { ctx = prep(list[i], 354, 196); if (ctx) try { D.cardArt(ctx, list[i].getAttribute('data-card'), S.clock); } catch (e) { /* no picture */ } }
  }
  var slideRaf = 0;
  function startSlides() {
    var cv = stage.querySelector('canvas[data-slide]'); if (!cv) return;
    var ctx = prep(cv, 300, 190), n = +cv.getAttribute('data-slide'), t0 = Date.now();
    if (!ctx) return;
    (function frame() {
      try { D.slideArt(ctx, n, (Date.now() - t0) / 1000); } catch (e) { return; }
      slideRaf = window.requestAnimationFrame(frame);
    })();
  }
  function stopSlides() { if (slideRaf) window.cancelAnimationFrame(slideRaf); slideRaf = 0; }

  /* ===== A flight ===== */
  var cv = null, ctx = null;
  function setupPlay() {
    S.run = LI.create(S.world, S.level, (Date.now() % 100000) + 1);
    S.hudKey = ''; S.paused = false; S.fresh = []; S.toCard = 0;
    var w = LI.world(S.world);
    say(w.name + ', ' + w.signal[S.level] + '. ' + w.mission);
    cv = document.getElementById('cv');
    ctx = cv && cv.getContext ? cv.getContext('2d') : null;
    sizeCanvas();
    hud();
    draw();
  }
  function sizeCanvas() {
    if (!cv || !ctx) return;
    var k = Math.min(3, (window.devicePixelRatio || 1) * SCALE);
    cv.width = Math.round(W * k); cv.height = Math.round(H * k);
    ctx.setTransform(k, 0, 0, k, 0, 0);
  }
  function leavePlay() { saveTime(); S.run = null; cv = null; ctx = null; }
  function draw() { if (ctx && S.run) try { D.scene(ctx, S.run, S.clock); } catch (e) { /* keep playing */ } }
  function hud() {
    var s = S.run; if (!s) return;
    var key = [s.warned, s.items, s.bag, s.shield, s.hearts, s.phase].join('|'), el;
    var p = LI.progress(s);
    el = document.getElementById('h-fill'); if (el) el.style.width = (p * 100).toFixed(1) + '%';
    el = document.getElementById('h-dot'); if (el) el.style.left = (p * 100).toFixed(1) + '%';
    var ready = s.phase === 'ready';
    el = document.getElementById('taphint'); if (el) el.style.opacity = ready ? '1' : '0';
    el = document.getElementById('mission'); if (el) el.style.opacity = ready && s.x < 1 ? '1' : '0';
    if (key === S.hudKey) return;
    S.hudKey = key;
    el = document.getElementById('h-w'); if (el) el.textContent = s.warned + ' / ' + s.houses.length;
    el = document.getElementById('h-i'); if (el) el.textContent = s.items;
    el = document.getElementById('h-bag');
    if (el) el.innerHTML = '<i class="' + (s.bag > 0 ? 'on' : '') + '"></i><i class="' + (s.bag > 1 ? 'on' : '') + '"></i><i class="' + (s.bag > 2 ? 'on' : '') + '"></i>';
    el = document.getElementById('h-sh'); if (el) el.innerHTML = s.shield ? '<span class="shieldon" title="Shield on" role="img" aria-label="Shield on">' + ico('shield', 16, '#1b6fae', 2.6) + '</span>' : '';
    el = document.getElementById('h-hearts');
    if (el) { el.innerHTML = heart(s.hearts > 0, 18) + heart(s.hearts > 1, 18) + heart(s.hearts > 2, 18); el.setAttribute('aria-label', s.hearts + ' of 3 hearts'); }
  }
  function toast(msg, x, y, cls) {
    var box = document.getElementById('toasts'); if (!box) return;
    var el = document.createElement('span');
    el.className = 'toast' + (cls ? ' ' + cls : ''); el.textContent = msg;
    el.style.left = Math.max(70, Math.min(W - 70, x)) + 'px'; el.style.top = Math.max(130, Math.min(H - 60, y)) + 'px';
    el.setAttribute('role', 'status');
    box.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1400);
  }
  function addCard(id) {
    if (SAVE.cards.indexOf(id) >= 0) return false;
    SAVE.cards.push(id); save(); return true;
  }
  function onEvents(ev) {
    var s = S.run, cam = s.x - LI.BIRD_X, i, e;
    for (i = 0; i < ev.length; i++) {
      e = ev[i];
      if (e.type === 'warn') { toast('+1 home warned!', s.houses[e.house].x - cam, s.groundY - 150); SFX.warn(); }
      else if (e.type === 'item') { toast(LI.item(e.kind).name + '!', LI.BIRD_X + 40, s.y - 50, 'orange'); SFX.item(); }
      else if (e.type === 'shield') { toast('Go bag full: shield on!', W / 2, 200, 'blue'); SFX.shield(); }
      else if (e.type === 'shielded') { toast('The shield saved you!', W / 2, 200, 'blue'); SFX.bump(); buzz(40); }
      else if (e.type === 'gust') { SFX.gust(); }
      else if (e.type === 'shake') { toast('Aftershock!', W / 2, 200, 'orange'); buzz(250); SFX.gust(); }
      else if (e.type === 'bump') {
        S.newCard = addCard(e.card); SFX.bump(); buzz(80);
        S.toCard = 0.6;
      } else if (e.type === 'done') {
        var b = SAVE.best[s.world] || (SAVE.best[s.world] = {});
        b[s.level] = Math.max(b[s.level] || 0, e.stars);
        S.fresh = LI.cardsOf(s.world).filter(function (id) { return addCard(id); });
        save(); SFX.done();
        S.toCard = 0.8;
      }
    }
  }
  function saveTime() { if (S.saveTick > 0) { SAVE.secs += S.saveTick; S.saveTick = 0; save(); } }
  function loop(now) {
    window.requestAnimationFrame(loop);
    var t = (now || Date.now()) / 1000, dt = S.lastT ? Math.min(0.05, Math.max(0, t - S.lastT)) : 0;
    S.lastT = t; S.clock += dt;
    if (S.screen !== 'play' || !S.run) return;
    advance(dt);
    draw(); hud();
  }
  // moves a flight on by dt seconds (also used by the tests)
  function advance(dt) {
    var s = S.run;
    if (!s) return;
    if (S.toCard > 0) {
      S.toCard -= dt;
      if (S.toCard <= 0) { S.toCard = 0; if (s.phase === 'done') resultSheet(); else if (s.phase === 'bumped' || s.phase === 'over') bumpSheet(); }
      return;
    }
    if (S.paused || S.overlay) return;
    onEvents(LI.step(s, dt));
    if (s.phase === 'fly') {
      S.session += dt; S.saveTick += dt;
      if (S.saveTick > 15) saveTime();
      if (S.session >= BREAK_AFTER) { S.paused = true; saveTime(); breakSheet(); }
    }
  }
  function flap() {
    var s = S.run;
    if (!s || S.paused || S.overlay || S.toCard > 0) return;
    if (LI.flap(s)) { SFX.flap(); hud(); }
  }
  function pause() { if (!S.run || S.overlay || S.toCard > 0 || S.run.phase === 'done') return; S.paused = true; saveTime(); pauseSheet(); }
  // back to the library (in a frame only)
  function leave() { S.sayText = ''; hush(); if (S.screen !== 'worlds') go('worlds'); post({ type: 'exit' }); }
  function startFlight() { audio(); S.screen = 'play'; render(); }
  function indexOfWorld(id) { for (var i = 0; i < LI.WORLDS.length; i++) if (LI.WORLDS[i].id === id) return i; return 0; }

  /* ===== What the buttons do ===== */
  var ACT = {
    start: function () { go('worlds'); },
    home: function () { go('home'); },
    worlds: function () { go('worlds'); },
    walk: function () { S.walk = 0; walkSheet(); },
    wnext: function () { S.walk = Math.min(SLIDES.length - 1, S.walk + 1); walkSheet(); },
    wprev: function () { S.walk = Math.max(0, S.walk - 1); walkSheet(); },
    wdone: function () { closeOverlay(); if (S.screen === 'home') go('worlds'); },
    manual: function () { manualSheet(); },
    cards: function () { S.from = S.screen === 'home' ? 'home' : 'worlds'; go('cards'); },
    card: function (b) { cardSheet(b.getAttribute('data-id')); },
    close: function () {
      if (S.overlay === 'card' && S.run && S.run.phase === 'done') { resultSheet(); return; }
      closeOverlay();
    },
    openall: function () { SAVE.open = !SAVE.open; save(); var b = stage.querySelector('[data-act="openall"]'); if (b) b.setAttribute('aria-checked', SAVE.open ? 'true' : 'false'); },
    askclear: function () { clearSheet(); },
    clear: function () { var keep = SAVE.sound; SAVE = fresh(); SAVE.sound = keep; SAVE.day = today(); save(); closeOverlay(); render(); },
    world: function (b) { S.world = b.getAttribute('data-id'); render(); },
    level: function (b) {
      var id = b.getAttribute('data-id');
      if (id === 'hard' && !S.okHard) { gateSheet(); return; }
      S.level = id; render();
    },
    gateyes: function () { S.okHard = true; S.level = 'hard'; closeOverlay(); render(); },
    gateno: function () { S.level = 'easy'; closeOverlay(); render(); },
    fly: function () { startFlight(); },
    pause: function () { pause(); },
    resume: function () { S.paused = false; closeOverlay(); },
    sound: function () { SAVE.sound = !SAVE.sound; save(); if (S.overlay === 'pause') pauseSheet(); },
    keep: function () { closeOverlay(); LI.resume(S.run); S.hudKey = ''; },
    again: function () { closeOverlay(); startFlight(); },
    next: function () { var i = indexOfWorld(S.world); if (LI.WORLDS[i + 1]) S.world = LI.WORLDS[i + 1].id; closeOverlay(); startFlight(); },
    quit: function () { closeOverlay(); go('worlds'); },
    breakhome: function () { S.session = 0; closeOverlay(); if (EMBED) leave(); else go('home'); },
    leave: function () { closeOverlay(); leave(); },
    read: function () { say(S.sayText, true); },
    breakmore: function () { S.session = BREAK_AFTER - 5 * 60; S.paused = false; closeOverlay(); }
  };

  /* ===== Taps, clicks and keys ===== */
  stage.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b || b.disabled) return;
    var f = ACT[b.getAttribute('data-act')];
    if (f) { e.preventDefault(); f(b); }
  });
  function tapStart(e) {
    S.kbd = false;
    if (S.screen !== 'play' || S.overlay) return;
    var t = e.target;
    if (t && t.closest && (t.closest('button') || t.closest('.overlay'))) return;
    if (e.cancelable) e.preventDefault();
    flap();
  }
  if (window.PointerEvent) stage.addEventListener('pointerdown', tapStart);
  else { stage.addEventListener('touchstart', tapStart, { passive: false }); stage.addEventListener('mousedown', tapStart); }
  document.addEventListener('keydown', function (e) {
    var k = e.key || '';
    if (k === 'Tab' || k === 'Enter' || k === ' ' || k.indexOf('Arrow') === 0) S.kbd = true;
    if (S.screen === 'play' && !S.overlay && (k === ' ' || k === 'Spacebar' || k === 'ArrowUp' || k === 'w' || k === 'W')) { e.preventDefault(); flap(); return; }
    if (S.screen === 'play' && (k === 'Escape' || k === 'p' || k === 'P')) {
      if (S.overlay === 'pause') ACT.resume(); else pause();
      e.preventDefault(); return;
    }
    if (k === 'Escape' && S.overlay && S.overlay !== 'bump' && S.overlay !== 'done' && S.overlay !== 'break') closeOverlay();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { saveTime(); if (S.screen === 'play' && S.run && S.run.phase === 'fly' && !S.overlay) pause(); }
  });
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  window.addEventListener('pagehide', saveTime);

  /* ===== Start ===== */
  fit();
  render();
  window.requestAnimationFrame(loop);

  // for the tests: look inside, press buttons, and move a flight on without waiting
  window.__lipad = {
    S: S, act: ACT, saved: function () { return SAVE; }, flap: flap, embed: EMBED,
    advance: function (sec) { var n = Math.round(sec * 60); for (var i = 0; i < n; i++) advance(1 / 60); hud(); }
  };
})();
