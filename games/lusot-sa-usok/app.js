// Lusot sa Usok: the screens. The About page is the home page; Start opens the briefing, and the briefing starts a
// mission. The rules live in engine.js (window.LusotSaUsok) and the pictures in draw.js (window.LusotDraw).
// Best stars are kept only on this device. No names, no accounts, nothing sent anywhere. Inside the BAYANIHanda
// library (?embed=1, in a frame) it opens at the briefing instead (see below). Plain ES5.
(function () {
  'use strict';
  var L = window.LusotSaUsok, D = window.LusotDraw, VW = 844, VH = 390;
  var VERSION = '0.1.0', KEY = 'lusot-sa-usok:v1', BREAK_AFTER = 20 * 60; // the build checks VERSION against package.json
  var EA = ['Edward Andrew A. Dionido', 'Science Research Specialist II', 'UPRI'];
  var stage = document.getElementById('stage');
  var SCALE = 1;

  /* ===== Inside the BAYANIHanda library (?embed=1, in a frame) =====
     The library opens the game at the level picked on its intro (&level=easy|hard), with its sound and voice settings
     (&sound=0|1, &voice=0|1). It has already asked for a grown-up when the player is younger than the level's age
     label, so the game shows the level instead of a picker. The library reads Bayani's lines aloud (postMessage
     'say', and 'hush' to stop), since a frame has had no tap of its own yet. The game opens at the briefing, ends with
     Play again and Back to the library, tells the library when the player leaves ('exit'), and keeps nothing on the
     device: best stars last until the game is closed. */
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
    msg.source = 'bayani-game'; msg.game = 'lusot';
    try { window.parent.postMessage(msg, '*'); } catch (e) { /* not in a frame */ }
  }
  // how a line should sound when read aloud: 9 1 1, and words in capitals read as words
  function spoken(t) { return String(t).replace(/\b911\b/g, '9 1 1').replace(/\b[A-Z]{3,}\b/g, function (w) { return w.toLowerCase(); }); }
  // the library reads a line aloud when Bayani's voice is on (the library checks its own settings too)
  function speak(text, force) {
    if (!EMBED || !text || !SAVE.sound || (!VOICE && !force)) return;
    post({ type: 'say', text: spoken(text).slice(0, 400), force: !!force });
  }
  function read(text) { S.sayText = text; speak(text); }
  function hush() { post({ type: 'hush' }); }

  /* ===== Saved on this device ===== */
  function fresh() { return { best: { easy: 0, hard: 0 }, sound: true, day: '', secs: 0 }; }
  function load() {
    var d = fresh(), raw, o, k;
    if (EMBED) return d; // in the library: nothing kept on the device
    try { raw = window.localStorage.getItem(KEY); if (raw) { o = JSON.parse(raw); for (k in d) if (o && Object.prototype.hasOwnProperty.call(o, k)) d[k] = o[k]; } } catch (e) { d = fresh(); }
    if (!d.best || typeof d.best !== 'object') d.best = { easy: 0, hard: 0 };
    return d;
  }
  function save() { if (EMBED) return; try { window.localStorage.setItem(KEY, JSON.stringify(SAVE)); } catch (e) { /* storage off: play goes on */ } }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  var SAVE = load();
  if (SAVE.day !== today()) { SAVE.day = today(); SAVE.secs = 0; }
  if (EMBED) SAVE.sound = ARGS.sound !== '0';

  var S = {
    screen: EMBED ? 'brief' : 'home', level: EMBED && ARGS.level === 'hard' ? 'hard' : 'easy', run: null, overlay: null,
    paused: false, clock: 0, lastT: 0, session: 0, saveTick: 0, joy: null, keys: {}, spray: false, sprayId: null, dodge: false,
    walk: 0, tip: '', tipUntil: 0, tipHot: false, radarT: 0, hudKey: '', toEnd: 0, alarmT: 0, call: null, turnOk: false,
    kbd: false, sayText: ''
  };

  /* ===== Helpers ===== */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  var ICON = {
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    people: '<circle cx="9" cy="7" r="3.5"/><path d="M2.5 21v-1.5A4.5 4.5 0 0 1 7 15h4a4.5 4.5 0 0 1 4.5 4.5V21"/><path d="M16 3.5a3.5 3.5 0 0 1 0 7"/><path d="M21.5 21v-1.5a4.5 4.5 0 0 0-3-4.2"/>',
    exit: '<path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/>',
    ext: '<path d="M9 8h6v12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/><path d="M12 8V5"/><path d="M10 5h5l3-2"/><path d="M9 11h6"/>',
    hose: '<circle cx="10" cy="12" r="7"/><circle cx="10" cy="12" r="3"/><path d="M17 12h3l2-2"/>',
    cloth: '<path d="M3 8c2-1.5 4 1.5 6 0s4 1.5 6 0v10c-2 1.5-4-1.5-6 0s-4-1.5-6 0z"/><path d="M19 3c1.2 1.6 2 2.7 2 3.6a2 2 0 0 1-4 0c0-.9.8-2 2-3.6z"/>',
    food: '<path d="M4 13a8 5 0 0 1 16 0v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 10.5c.5 1 .5 2 0 3M12 10c.5 1.2.5 2.4 0 3.6M15 10.5c.5 1 .5 2 0 3"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.7z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    fire: '<path d="M12 22c4 0 7-2.7 7-6.8 0-3.6-2.4-6-4-8.2-.4 2.2-1.6 3.4-2.8 3.9.4-2.9-.9-5.9-3.2-7.9-.2 3.4-1.7 5.3-3.2 7.2C4.5 12 5 13.6 5 15.2 5 19.3 8 22 12 22z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    tap: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7" opacity=".6"/><circle cx="12" cy="12" r="10.5" opacity=".3"/>',
    book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
    sound: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    mute: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/>',
    restart: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    radio: '<rect x="7" y="6" width="10" height="16" rx="2"/><path d="M14 6V2"/><path d="M10 11h4M10 14h4"/>',
    down2: '<path d="M7 7l5 5 5-5"/><path d="M7 13l5 5 5-5"/>',
    dodge: '<path d="M4 17c3-6 8-9 15-9"/><path d="M15 4l4 4-4 4"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>'
  };
  function ico(name, size, color, width) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + (color || 'currentColor') + '" stroke-width="'
      + (width || 2.2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICON[name] + '</svg>';
  }
  var KIT = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="15" rx="3" fill="#1a8f4c"/><path d="M12 9v7M8.5 12.5h7" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/></svg>';
  function star(on, size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="'
      + (on ? '#ffc53d' : '#ffffff') + '" stroke="' + (on ? '#e0a400' : '#b9c7cf') + '" stroke-width="' + (on ? 1.2 : 1.6) + '" stroke-linejoin="round"/></svg>';
  }
  // stars on the dark briefing: the empty ones as outlines
  function darkStars(n) {
    var h = '<span class="estar" role="img" aria-label="' + n + ' of 3 stars">';
    for (var i = 0; i < 3; i++) h += '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="' + (i < n ? '#ffc53d' : 'none') + '" stroke="' + (i < n ? '#e0a400' : '#6c8293') + '" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    return h + '</span>';
  }
  function stars(n, size, cls) { var h = '<span class="' + (cls || 'bigstars') + '" role="img" aria-label="' + n + ' of 3 stars">'; for (var i = 0; i < 3; i++) h += star(i < n, size); return h + '</span>'; }
  // Bayani, the BAYANIHanda guide (the library's mascot), whole or just the head
  var MASCOT = '<path d="M24 36 L48 36 L52 70 L20 70 Z" fill="#f2760c" opacity="0.92"/><rect x="24" y="37" width="24" height="26" rx="8" fill="#1f6f8b"/><polygon points="36,41 38.2,46 43.6,46.4 39.4,49.9 40.8,55.2 36,52.2 31.2,55.2 32.6,49.9 28.4,46.4 33.8,46" fill="#ffd24d"/><rect x="18" y="39" width="7" height="18" rx="3.5" fill="#e8ab70"/><rect x="47" y="39" width="7" height="18" rx="3.5" fill="#e8ab70"/><rect x="28" y="61" width="7" height="14" rx="3" fill="#35506b"/><rect x="37" y="61" width="7" height="14" rx="3" fill="#35506b"/><circle cx="36" cy="24" r="13" fill="#e8ab70"/><path d="M23 23 a13 13 0 0 1 26 0 v-3 a13 13 0 0 0 -26 0 Z" fill="#3a2a22"/><path d="M21 18 a15 10 0 0 1 30 0 Z" fill="#ffc53d"/><rect x="19" y="16" width="34" height="4.5" rx="2.25" fill="#eaa100"/><circle cx="31" cy="25" r="1.9" fill="#2a2320"/><circle cx="41" cy="25" r="1.9" fill="#2a2320"/><circle cx="27.5" cy="29" r="2.1" fill="#f29a7a" opacity="0.55"/><circle cx="44.5" cy="29" r="2.1" fill="#f29a7a" opacity="0.55"/><path d="M31 30 q5 4 10 0" stroke="#2a2320" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  function bayani(size, head) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="' + (head ? '16 4 40 40' : '4 2 64 76') + '" aria-hidden="true" focusable="false"' + (head ? ' style="background:#ffe58a;border-radius:50%"' : '') + '>' + MASCOT + '</svg>';
  }
  var BLUEPRINT = '<svg class="bp" width="844" height="390" viewBox="0 0 844 390" aria-hidden="true" focusable="false"><path d="M20 40H380V170H20Z M20 170H380 M140 40V170 M260 40V170 M20 230H380V360H20Z M120 230V360 M250 230V360" fill="none" stroke="#7fb3d5" stroke-width="2"/><path d="M60 300h30M300 90h40" fill="none" stroke="#7fb3d5" stroke-width="2" stroke-dasharray="4 6"/></svg>';
  function chips() { return '<div class="chips"><span class="chip pillar">ACT FAST</span><span class="chip age">Ages 10 to 15</span><span class="chip wt">Working title</span></div>'; }
  function credits() {
    var aI = window.affIcon ? window.affIcon(EA[0], 'aff-ea') : '', aM = window.affMore ? window.affMore(EA[0], 'aff-ea') : '';
    return '<div class="credits"><span class="validate">' + ico('info', 14, '#7a5400', 2.4) + 'Subject for code and content validation</span>'
      + '<span class="cr-lab">Conceptualized and developed with AI assistance by</span>'
      + '<span class="cr-name">' + esc(EA[0]) + aI + '</span><span class="cr-role">' + esc(EA[1]) + '</span><span class="cr-org">' + esc(EA[2]) + '</span>' + aM + '</div>';
  }

  /* ===== Sound: short tones made on the spot (no sound files) ===== */
  var AC = null;
  function audio() {
    if (!SAVE.sound) return null;
    try { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = AC || new C(); if (AC.state === 'suspended' && AC.resume) AC.resume(); return AC; } catch (e) { return null; }
  }
  function tone(f, dur, type, vol, f2, delay) {
    var a = audio(); if (!a) return;
    try {
      var t0 = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      g.gain.setValueAtTime(vol || 0.05, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.03);
    } catch (e) { /* no sound */ }
  }
  var SFX = {
    good: function () { tone(660, 0.1, 'sine', 0.06); tone(990, 0.16, 'sine', 0.06, 0, 0.09); },
    bad: function () { tone(220, 0.25, 'sawtooth', 0.05, 110); },
    bell: function () { tone(1320, 0.12, 'square', 0.025); tone(1320, 0.12, 'square', 0.025, 0, 0.16); },
    door: function () { tone(180, 0.12, 'triangle', 0.06, 120); },
    whoosh: function () { tone(400, 0.18, 'triangle', 0.03, 900); },
    win: function () { tone(523, 0.14, 'sine', 0.07); tone(659, 0.14, 'sine', 0.07, 0, 0.13); tone(784, 0.14, 'sine', 0.07, 0, 0.26); tone(1047, 0.3, 'sine', 0.07, 0, 0.39); }
  };
  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* none */ } }

  /* ===== Fitting the 844 by 390 stage to the screen ===== */
  function fit() {
    var box = $('app'), r = box && box.getBoundingClientRect ? box.getBoundingClientRect() : null;
    var vw = (r && r.width) || window.innerWidth || VW, vh = (r && r.height) || window.innerHeight || VH;
    SCALE = Math.min(vw / VW, vh / VH) || 1;
    stage.style.transform = 'scale(' + SCALE + ')';
    var turn = $('turn'); if (turn) turn.hidden = !(vh > vw * 1.15 && !S.turnOk);
    sizeCanvas();
  }
  // a point on the screen, in stage pixels
  function toStage(e) { var r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) / SCALE, y: (e.clientY - r.top) / SCALE }; }

  /* ===== Screens ===== */
  function render() {
    stopSlides();
    var html = S.screen === 'home' ? homeHtml() : S.screen === 'brief' ? briefHtml() : playHtml();
    stage.innerHTML = html + '<div id="ov" class="overlay" hidden></div>';
    S.overlay = null;
    if (S.screen === 'play') setupPlay();
    focusIn(stage, '[data-focus]');
  }
  function focusIn(root, sel) {
    var f = root.querySelector(sel); if (!S.kbd || !f || !f.focus) return;
    try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
  }
  function go(screen) { if (S.screen === 'play') leavePlay(); S.screen = screen; render(); }

  function homeHtml() {
    var mins = Math.round(SAVE.secs / 60);
    return '<section class="screen" aria-label="About Lusot sa Usok">' + BLUEPRINT + '<div class="two"><div class="left">' + chips()
      + '<div><h1 class="h1">Lusot sa Usok</h1><p class="sub">Building Escape · Slip through the smoke</p></div>'
      + '<p class="story">A fire breaks out at school. Find a safe way through the smoke, sound the alarm, call for help, and lead everyone out.</p>'
      + '<div class="btnrow" style="margin-top:auto"><button class="cta" data-act="start" data-focus>Start ' + ico('arrow', 18, '#ffffff', 2.8) + '</button>'
      + '<button class="line" data-act="walk">' + ico('tap', 17, '#ffffff') + 'How to play</button><button class="line" data-act="manual">' + ico('book', 17, '#ffffff') + 'User manual</button></div></div>'
      + '<div class="right"><h2 class="h2">About the game</h2>'
      + '<p>Lusot sa Usok is a top-down escape game for learners ages 10 to 15. A fire breaks out in a school, and the player, an older student on the school\'s safety team, has to find a safe way out of one smoky floor. To finish well, players sound the fire alarm, call 911 and say what, where and who, lead every person they find, and reach an exit.</p>'
      + '<p>Real fire safety habits are built into the play: crawl low under smoke, feel a door before opening it and skip a hot one, close doors behind you, use an extinguisher only on a small fire in short bursts at its base, never put water on an electrical fire, stop, drop and roll if your clothes catch fire, and once you are out, stay out. The game belongs to the Act Fast pillar of the BAYANIHanda family.</p>'
      + '<h2 class="h2" style="margin-top:4px">For grown-ups</h2><ul class="notes">'
      + '<li>' + ico('info', 16, '#a84f08') + '<span>In real life, children get out first and tell a grown-up. The player\'s role here is a trained student on the school safety team; the game says so at the start and at the end.</span></li>'
      + '<li>' + ico('people', 16, '#a84f08') + '<span>For ages 10 to 15. Easy is gentler; Difficult has an electrical fire, more people to lead and a three-part 911 call.</span></li>'
      + '<li>' + ico('clock', 16, '#a84f08') + '<span>A mission takes 2 to 5 minutes. The game suggests a break after 20 minutes of play. Played today: ' + mins + ' minute' + (mins === 1 ? '' : 's') + '.</span></li>'
      + '<li>' + ico('shield', 16, '#a84f08') + '<span>No sign-up and no personal data. Best stars are saved only on this device. It works without internet.</span></li>'
      + '<li>' + ico('fire', 16, '#a84f08') + '<span>The school and the barangay are made up. In an emergency, call 911.</span></li></ul>'
      + '<button class="line dark" data-act="sound" aria-pressed="' + (SAVE.sound ? 'true' : 'false') + '">' + ico(SAVE.sound ? 'sound' : 'mute', 17, '#16303f') + 'Sound: ' + (SAVE.sound ? 'On' : 'Off') + '</button>'
      + '<button class="line dark" data-act="askclear">' + ico('trash', 16, '#16303f') + 'Clear saved stars on this device</button>'
      + credits()
      + '<p class="fine">Lusot sa Usok is a working title; the name has not yet been checked against other programs. Version ' + esc(VERSION) + '. Fonts: Baloo 2 and Nunito (SIL Open Font License).</p>'
      + '</div></div></section>';
  }

  function briefHtml() {
    var spec = L.layout(S.level), lv = S.level;
    var story = lv === 'hard'
      ? 'An overloaded outlet started a fire in the computer room on the second floor. As the floor\'s student fire safety officer, find a safe way through, help everyone you meet, and get out.'
      : 'Fire broke out in the school canteen. As the floor\'s student fire safety officer, find a safe way through, help everyone you meet, and get out.';
    return '<section class="screen" aria-label="Mission briefing">' + BLUEPRINT
      + '<div class="two"><div class="left" style="padding-top:22px">'
      + (EMBED ? '<button class="back" style="left:0;top:-12px" data-act="leave" aria-label="Back to the library">' + ico('back', 14, '#ffffff', 2.6) + 'Library</button>'
        : '<button class="back" style="left:0;top:-12px" data-act="home">' + ico('back', 14, '#ffffff', 2.6) + 'Home</button>') + chips()
      + '<div><h1 class="h1">Lusot sa Usok</h1><p class="sub">' + esc(spec.floorName) + ' · ' + esc(spec.school) + '</p></div>'
      + '<p class="story">' + esc(story) + '</p>'
      + '<div style="display:flex;gap:10px;align-items:center"><span style="font-size:12px;font-weight:800;color:#b9c8d3">Level</span>'
      + (EMBED ? '<span class="lvtag">' + (lv === 'hard' ? 'Difficult' : 'Easy') + '</span>'
        : '<div class="seg" role="group" aria-label="Level"><button data-act="level" data-id="easy" aria-pressed="' + (lv === 'easy') + '">Easy</button><button data-act="level" data-id="hard" aria-pressed="' + (lv === 'hard') + '">Difficult</button></div>')
      + '<span style="font-size:11px;font-weight:800;color:#b9c8d3;display:flex;align-items:center;gap:4px">Best ' + darkStars(SAVE.best[lv] || 0) + '</span></div>'
      + '<div class="btnrow" style="margin-top:auto"><button class="cta" data-act="go" data-focus>Start the mission</button><button class="line" data-act="walk">How to play</button></div></div>'
      + '<div class="right"><h2 class="h2">Your missions</h2><div class="grid2">'
      + '<div class="mission"><span class="mi" style="background:#fde3cf;color:#a84f08">' + ico('bell', 17, '#a84f08', 2.3) + '</span>Sound the fire alarm</div>'
      + '<div class="mission"><span class="mi" style="background:#d6e8fb;color:#1b5fa8">' + ico('phone', 17, '#1b5fa8', 2.3) + '</span>Call 911 for help</div>'
      + '<div class="mission"><span class="mi" style="background:#e7defc;color:#5b3cc4">' + ico('people', 17, '#5b3cc4', 2.3) + '</span>Lead everyone you find</div>'
      + '<div class="mission"><span class="mi" style="background:#d3f0de;color:#146c3a">' + ico('exit', 17, '#146c3a', 2.3) + '</span>Reach an exit</div></div>'
      + '<h2 class="h2" style="margin-top:2px">Your gear</h2><div class="grid4">'
      + '<div class="gear">' + ico('ext', 22, '#c0322b') + '<b>Extinguisher</b><span>Short bursts at the base. Watch the gauge.</span></div>'
      + '<div class="gear">' + ico('hose', 22, '#1b5fa8') + '<b>Fire hose</b><span>Lots of water, short reach. No water on electric fires.</span></div>'
      + '<div class="gear">' + ico('cloth', 22, '#0f7a8a') + '<b>Wet hanky</b><span>Wet it at a sink. Less smoke damage.</span></div>'
      + '<div class="gear">' + KIT + '<b>First aid, food</b><span>Bring your health back up.</span></div></div>'
      + '<p class="note" style="margin-top:auto">' + ico('info', 14, '#4f6572', 2.4) + '<span>In real life, kids get out first and tell a grown-up. In this game you play a student trained for the school\'s fire safety team.</span></p>'
      + '</div></div></section>';
  }

  function playHtml() {
    return '<section class="screen play" id="play" aria-label="Mission">'
      + '<canvas class="map" id="cv" role="img" aria-label="The school floor seen from above"></canvas>'
      + '<div class="panel status" id="status">'
      + '<div class="bar">' + '<svg width="15" height="15" viewBox="0 0 24 24" fill="#ff5a5f" stroke="#ff5a5f" stroke-width="2" stroke-linejoin="round" aria-hidden="true">' + ICON.heart + '</svg>'
      + '<div class="track"><div class="fill" id="b-hp" style="background:#ff5a5f"></div></div><b id="t-hp">100</b></div>'
      + '<div class="bar" id="r-ag">' + ico('ext', 15, '#ffb3ae', 2.4) + '<div class="track"><div class="fill" id="b-ag" style="background:#3ee39b"></div></div><b id="t-ag">100</b></div>'
      + '<div class="bar" id="r-cl" hidden>' + ico('cloth', 15, '#3ad6c8', 2.4) + '<div class="track"><div class="fill" id="b-cl" style="background:#3ad6c8"></div></div><b id="t-cl" style="color:#b9efe9">0</b></div>'
      + '<small id="t-st">Find the fire alarm.</small></div>'
      + '<div class="goals" id="goals"></div>'
      + '<div class="tipbox" id="tip" style="opacity:0">' + bayani(30, true) + '<span id="tip-t"></span></div>'
      + '<span class="eta" id="eta" hidden>' + ico('phone', 13, '#ffffff', 2.6) + '<span id="eta-t"></span></span>'
      + '<button class="pausebtn" data-act="pause" aria-label="Pause"><svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></button>'
      + '<div class="radar" role="img" aria-label="Radar: the whole floor, with fire, smoke, people and exits"><canvas id="rd" width="142" height="96"></canvas><span>RADAR</span></div>'
      + '<div class="stick" id="stick" aria-hidden="true"><div class="base"><div class="knob" id="knob"></div></div><span class="lab">Move</span></div>'
      + '<div class="panel items" role="group" aria-label="Your things">'
      + '<button class="slot" id="s-cl" data-act="cloth" aria-label="Wet hanky">' + ico('cloth', 22, '#3ad6c8') + '</button>'
      + '<button class="slot" id="s-kit" data-act="kit" aria-label="First aid kit">' + KIT + '<span class="n" id="n-kit">0</span></button>'
      + '<button class="slot" id="s-food" data-act="food" aria-label="Food">' + ico('food', 22, '#ffcf7a') + '<span class="n" id="n-food">0</span></button>'
      + '<button class="slot empty" id="s-hose" data-act="hoseslot" aria-label="Fire hose, use it at a hose cabinet">' + ico('hose', 22, '#7d93a5') + '</button></div>'
      + '<button class="actbtn" id="actbtn" data-act="act" hidden></button>'
      + '<button class="round crawl" id="crawl" data-act="crawl" aria-pressed="false" aria-label="Crawl low">' + ico('down2', 18, 'currentColor', 2.6) + '<span>CRAWL</span></button>'
      + '<button class="round dodge" data-act="dodge" aria-label="Dodge">' + ico('dodge', 18, '#ffffff', 2.6) + '<span>DODGE</span></button>'
      + '<div class="panel gauge"><svg width="80" height="46" viewBox="0 0 80 48" role="img" aria-label="Extinguisher pressure gauge"><path d="M10 44A30 30 0 0 1 18.8 22.8" fill="none" stroke="#ff5a5f" stroke-width="7"/><path d="M18.8 22.8A30 30 0 0 1 70 44" fill="none" stroke="#3ee39b" stroke-width="7"/><path id="needle" d="M40 44L40 19" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/><circle cx="40" cy="44" r="4" fill="#ffffff"/></svg><span id="g-t" style="color:#7ee2a8">Gauge OK</span></div>'
      + '<button class="spray" id="spray" aria-label="Spray: hold to use the extinguisher">' + ico('ext', 26, '#ffffff') + '<b id="spray-b">SPRAY</b><small id="spray-s">Hold</small></button>'
      + '<button class="rollbtn" id="rollbtn" data-act="act" hidden>Stop, drop and roll!</button>'
      + '<div id="toasts"></div></section>';
  }

  /* ===== Sheets ===== */
  function overlay(kind, html) {
    var ov = $('ov'); if (!ov) return;
    S.overlay = kind; S.spray = false; S.joy = null; knob(0, 0);
    ov.innerHTML = html; ov.hidden = false;
    focusIn(ov, ov.querySelector('[data-focus]') ? '[data-focus]' : 'button');
    if (kind === 'walk') startSlides();
  }
  function closeOverlay() {
    var ov = $('ov'); stopSlides();
    if (ov) { ov.hidden = true; ov.innerHTML = ''; }
    if (S.overlay && S.sayText) { S.sayText = ''; hush(); }
    S.overlay = null;
  }
  function tooBigSheet() {
    var s = S.run;
    overlay('toobig', '<div class="banner" role="alert">' + ico('fire', 20, '#ffffff', 2.4) + '<b>Too big for an extinguisher</b></div>'
      + '<div class="sheet" role="dialog" aria-modal="true" aria-label="The fire is too big. What is your move?"><div class="who"><div class="face">' + bayani(78) + '</div><div class="name">' + ico('radio', 12, '#ffd873', 2.6) + 'BAYANI</div></div>'
      + '<div class="say"><p>That fire is bigger than you. An extinguisher won\'t stop it, so don\'t waste it. <em>What\'s your move?</em></p><div class="choices">'
      + choice('call', 'phone', '#d6e8fb', '#1b5fa8', 'Call firefighters', s.call < 0 ? 'Phone in the Faculty Room' : 'Already called: meet them at the exit')
      + choice('hose', 'hose', '#d6e8fb', '#1b5fa8', 'Use the fire hose', 'Blue cabinet. Never on electrical fires.')
      + choice('away', 'exit', '#d3f0de', '#146c3a', 'Find another way', 'Take the back stairs')
      + '</div></div></div>');
    read('That fire is bigger than you. An extinguisher won\'t stop it, so don\'t waste it. What\'s your move? Call the firefighters, use the fire hose, or find another way.');
  }
  function choice(id, icon, bg, fg, title, sub) {
    return '<button class="choice" data-act="choose" data-id="' + id + '"' + (id === 'call' ? ' data-focus' : '') + '><span class="ci" style="background:' + bg + '">' + ico(icon, 17, fg, 2.4) + '</span><span><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></span></button>';
  }
  function callSheet() {
    var c = S.call, qs = L.questions(S.run), q = qs[c.i];
    if (c.done) {
      overlay('call', '<div class="card" role="dialog" aria-modal="true" aria-labelledby="c-h"><span class="tag blue">' + ico('phone', 12, '#1b5fa8', 2.6) + ' CALL ENDED</span>'
        + '<h1 class="h1" id="c-h">Firefighters are on the way</h1><p>You said what is happening, where, and who is inside. That is everything the dispatcher needs.' + (c.wrong ? ' They had to ask again ' + c.wrong + ' time' + (c.wrong === 1 ? '' : 's') + ', so they will take a little longer.' : '') + '</p>'
        + '<div class="hint">' + ico('info', 16, '#7a5400', 2.4) + '<span>Keep going: get everyone out, and once you are out, stay out.</span></div>'
        + '<div class="row"><button class="cta" data-act="hangup" data-focus>Hang up</button></div></div>');
      read('Firefighters are on the way. Keep going: get everyone out, and once you are out, stay out.');
      return;
    }
    var a = q.a, h = '';
    for (var k = 0; k < a.length; k++) h += '<button data-act="answer" data-id="' + k + '"' + (c.bad.indexOf(k) >= 0 ? ' class="wrong" aria-disabled="true"' : '') + (k === 0 ? ' data-focus' : '') + '>' + esc(a[k][0]) + '</button>';
    overlay('call', '<div class="card" role="dialog" aria-modal="true" aria-labelledby="c-h"><span class="tag blue">' + ico('phone', 12, '#1b5fa8', 2.6) + ' CALLING 911' + (qs.length > 1 ? ' · QUESTION ' + (c.i + 1) + ' OF ' + qs.length : '') + '</span>'
      + '<div class="call-q"><span class="ci" style="flex:none;width:38px;height:38px;border-radius:50%;background:#1b5fa8;display:flex;align-items:center;justify-content:center">' + ico('phone', 19, '#ffffff', 2.4) + '</span><div class="bubble" id="c-h">' + esc(q.q) + '</div></div>'
      + (c.hint ? '<div class="hint" role="status">' + ico('info', 16, '#7a5400', 2.4) + '<span>' + esc(c.hint) + '</span></div>' : '')
      + '<div class="answers">' + h + '</div></div>');
    read((c.hint ? c.hint + ' ' : '') + q.q);
  }
  function pauseSheet() {
    overlay('pause', '<div class="card" role="dialog" aria-modal="true" aria-labelledby="p-h" style="width:420px"><span class="tag blue">PAUSED</span><h1 class="h1" id="p-h">Pahinga sandali</h1>'
      + '<button class="cta" data-act="resume" data-focus>Keep going</button>'
      + '<div class="row"><button class="line dark" style="flex:1" data-act="again">' + ico('restart', 16, '#16303f') + 'Start over</button>'
      + (EMBED ? '<button class="line dark" style="flex:1" data-act="brief">Briefing</button>' : '<button class="line dark" style="flex:1" data-act="home">Home</button>') + '</div>'
      + '<button class="line dark" data-act="sound" aria-pressed="' + (SAVE.sound ? 'true' : 'false') + '">' + ico(SAVE.sound ? 'sound' : 'mute', 17, '#16303f') + 'Sound: ' + (SAVE.sound ? 'On' : 'Off') + '</button></div>');
  }
  function breakSheet() {
    overlay('break', '<div class="card" role="dialog" aria-modal="true" aria-labelledby="b-h" style="width:440px"><span class="tag">BREAK TIME</span><h1 class="h1" id="b-h">Pahinga muna!</h1>'
      + '<p>You have played for 20 minutes. Rest your eyes: look at something far away, stretch, and drink some water.</p>'
      + '<div class="row"><button class="cta" data-act="breakhome" data-focus>Take a break</button><button class="line dark" style="flex:1" data-act="breakmore">5 more minutes</button></div></div>');
    read('Pahinga muna! You have played for 20 minutes. Rest your eyes, stretch, and drink some water.');
  }
  var SLIDES = [
    ['Move and crawl', 'Drag on the left side of the screen to move, or use the arrow keys. In smoke, tap CRAWL: the air is cleaner near the floor.'],
    ['Your missions', 'Pull the red fire alarm, call 911 from the phone, walk up to each person to lead them, and reach a green exit.'],
    ['Short bursts', 'Hold SPRAY for a short burst at the base of a small fire, then let go and look. Spraying at nothing wastes it. Swap an empty one at a red cabinet.'],
    ['Too big?', 'A fire bigger than you is not for an extinguisher. Call the firefighters, use a fire hose (never on electrical fires), or find another way out.'],
    ['Doors', 'Feel a door before you open it. A hot door means fire behind it, so use another way. Close doors behind you to slow the fire.'],
    ['Stay safe', 'Wet your hanky at a sink for less smoke damage. First aid kits and food bring health back. If your clothes catch fire: stop, drop and roll.']
  ];
  function walkSheet() {
    var i = S.walk, sl = SLIDES[i], dots = '';
    for (var k = 0; k < SLIDES.length; k++) dots += '<i class="' + (k === i ? 'on' : '') + '"></i>';
    overlay('walk', '<div class="walk" role="dialog" aria-modal="true" aria-labelledby="w-h"><canvas id="slide" data-slide="' + i + '" width="330" height="200" role="img" aria-label="' + esc(sl[0]) + '"></canvas>'
      + '<div class="wt"><span class="tag blue">HOW TO PLAY · ' + (i + 1) + ' OF ' + SLIDES.length + '</span><h1 class="h1" id="w-h">' + esc(sl[0]) + '</h1><p>' + esc(sl[1]) + '</p>'
      + '<div class="dots" aria-hidden="true">' + dots + '</div><div class="row" style="margin-top:auto">'
      + (i ? '<button class="line dark" style="flex:1" data-act="wprev">Back</button>' : '<button class="line dark" style="flex:1" data-act="close">Skip</button>')
      + (i < SLIDES.length - 1 ? '<button class="cta" data-act="wnext" data-focus>Next</button>' : '<button class="cta" data-act="wdone" data-focus>Got it</button>') + '</div></div></div>');
    read(sl[0] + '. ' + sl[1]);
  }
  function manualSheet() {
    overlay('manual', '<div class="card" role="dialog" aria-modal="true" aria-labelledby="m-h"><span class="tag gray">COMING SOON</span><h1 class="h1" id="m-h">User manual</h1>'
      + '<p>The full user manual is still being written. It will cover:</p><ul class="mlist"><li>Getting started, the controls and the keyboard keys</li><li>The missions, the gear and the two floors</li>'
      + '<li>The fire safety habits in the game and where each one comes from</li><li>Ideas for teachers, with questions to talk about after playing</li><li>Privacy, saved stars and fixing common problems</li></ul>'
      + '<p>For now, How to play gives a quick walkthrough.</p><div class="row"><button class="cta" data-act="close" data-focus>Close</button></div></div>');
  }
  function clearSheet() {
    overlay('clear', '<div class="card" role="dialog" aria-modal="true" aria-labelledby="x-h" style="width:420px"><span class="tag gray">ON THIS DEVICE</span><h1 class="h1" id="x-h">Clear saved stars?</h1>'
      + '<p>This removes the best stars saved on this device. It cannot be undone.</p><div class="row"><button class="cta" data-act="clear">Clear them</button><button class="line dark" style="flex:1" data-act="close" data-focus>Keep them</button></div></div>');
  }
  function clock(sec) { var m = Math.floor(sec / 60), s = Math.floor(sec % 60); return m + ':' + (s < 10 ? '0' : '') + s; }
  function resultSheet() {
    var s = S.run, r = L.result(s), out = r.out, all = r.led === r.total, i, good = '', miss = '';
    for (i = 0; i < r.good.length; i++) good += '<i>' + ico('check', 13, '#7ee2a8', 3) + esc(r.good[i]) + '</i>';
    for (i = 0; i < r.miss.length; i++) miss += '<i>' + ico('arrow', 13, '#ffb38a', 3) + esc(r.miss[i]) + '</i>';
    if (out && r.stars > (SAVE.best[s.level] || 0)) { SAVE.best[s.level] = r.stars; save(); }
    var title = out ? (all ? 'Nakalabas kayo!' : 'Nakalabas ka!') : 'Kailangan mo ng tulong';
    var line = out ? (all ? 'You and everyone you found are safe at the assembly area.' : 'You are safe at the assembly area. ' + (r.total - r.led) + ' still inside: firefighters will look for them. Never go back in.')
      : 'The smoke and heat were too much, so firefighters carried you out. In real life, get out early and stay low.';
    var html = '<div class="results" role="dialog" aria-modal="true" aria-labelledby="r-h"><div class="rleft">'
      + '<span class="tag' + (out ? '' : ' red') + '">' + (out ? 'MISSION COMPLETE' : 'MISSION OVER') + '</span><h1 class="h1" id="r-h">' + title + '</h1><p>' + esc(line) + '</p>' + stars(r.stars, 40)
      + '<div class="rule">' + ico('shield', 22, '#3b2a00', 2.4) + '<span><strong>Real-life rule:</strong> once you\'re out, stay out. Never go back inside a burning building.</span></div>'
      + '<div class="row" style="margin-top:auto">' + (EMBED ? '<button class="cta" data-act="again" data-focus>Play again</button><button class="line dark" style="flex:1" data-act="leave">Back to the library</button>'
        : out && s.level === 'easy' ? '<button class="cta" data-act="nextfloor" data-focus>Next floor</button><button class="line dark" style="flex:1" data-act="again">Play again</button>'
        : '<button class="cta" data-act="again" data-focus>Play again</button><button class="line dark" style="flex:1" data-act="home">Home</button>') + '</div></div>'
      + '<div class="rright"><div class="stats">'
      + stat('people', '#5b3cc4', 'People led out', r.led + ' of ' + r.total)
      + stat('bell', '#a84f08', 'Fire alarm', r.alarm >= 0 ? 'Sounded' : 'Missed')
      + stat('phone', '#1b5fa8', 'Called 911', r.call >= 0 ? 'At ' + clock(r.call) : 'Missed')
      + stat('ext', '#b3261e', 'Spray on target', r.aim >= 0 ? r.aim + '%' : 'No spray')
      + stat('heart', '#b0234f', 'Health left', String(r.health))
      + stat('clock', '#3d5361', 'Time', clock(r.time)) + '</div>'
      + (good ? '<div class="habits"><span>WHAT YOU DID RIGHT</span><div>' + good + '</div></div>' : '')
      + (miss ? '<div class="habits try"><span>TRY NEXT TIME</span><div>' + miss + '</div></div>' : '')
      + '<p class="note" style="color:#c4d2dc">' + ico('info', 14, '#c4d2dc', 2.4) + '<span>In real life, kids get out first and tell a grown-up. Only a trained person should use an extinguisher, and only on a small fire with the exit behind them.</span></p>'
      + '</div></div>';
    overlay('done', html);
    read(title + ' ' + line + ' Remember: once you are out, stay out.');
  }
  function stat(icon, color, label, value) {
    return '<div class="stat"><span style="color:' + color + '">' + (icon === 'heart' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + color + '" stroke="' + color + '" stroke-width="2" aria-hidden="true">' + ICON.heart + '</svg>' : ico(icon, 14, color, 2.6)) + esc(label) + '</span><b>' + esc(value) + '</b></div>';
  }

  // How to play pictures move while the sheet is open
  var slideRaf = 0;
  function prep(cv, w, h) {
    var ctx = cv.getContext ? cv.getContext('2d') : null, k = Math.min(3, (window.devicePixelRatio || 1) * SCALE);
    if (!ctx) return null;
    cv.width = Math.round(w * k); cv.height = Math.round(h * k); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    ctx.setTransform(k, 0, 0, k, 0, 0); return ctx;
  }
  function startSlides() {
    var cv = $('slide'); if (!cv) return;
    var ctx = prep(cv, 330, 200), n = +cv.getAttribute('data-slide'), t0 = Date.now();
    if (!ctx) return;
    (function frame() { try { D.slide(ctx, n, (Date.now() - t0) / 1000); } catch (e) { return; } slideRaf = window.requestAnimationFrame(frame); })();
  }
  function stopSlides() { if (slideRaf) window.cancelAnimationFrame(slideRaf); slideRaf = 0; }

  /* ===== A mission ===== */
  var cv = null, ctx = null, rd = null, rctx = null;
  function setupPlay() {
    S.run = L.create(S.level, (Date.now() % 100000) + 1);
    S.paused = false; S.hudKey = ''; S.toEnd = 0; S.joy = null; S.spray = false; S.tip = ''; S.tipUntil = 0; S.alarmT = 0; S.call = null;
    cv = $('cv'); ctx = cv && cv.getContext ? cv.getContext('2d') : null;
    rd = $('rd'); rctx = rd && rd.getContext ? rd.getContext('2d') : null;
    sizeCanvas();
    var spec = S.run.spec;
    say(S.level === 'hard' ? 'Electrical fire in the computer room! Pull the alarm, then call 911. No water on it.' : 'Fire in the canteen! Pull the red alarm in the corridor, then call 911.', 6);
    hud(); draw();
  }
  function sizeCanvas() {
    var k = Math.min(3, (window.devicePixelRatio || 1) * SCALE);
    if (cv && ctx) { cv.width = Math.round(VW * k); cv.height = Math.round(VH * k); ctx.setTransform(k, 0, 0, k, 0, 0); }
    if (rd && rctx) { rd.width = Math.round(142 * k); rd.height = Math.round(96 * k); rctx.setTransform(k, 0, 0, k, 0, 0); }
  }
  function leavePlay() { saveTime(); S.run = null; cv = ctx = rd = rctx = null; }
  // where the yellow arrow points: on Easy, the next mission; on both levels, the place picked in the too-big choice
  function goalOf(s) {
    if (s.goal) return s.goal;
    if (s.level !== 'easy') return null;
    var a;
    if (s.alarm < 0) { a = L.stations(s, 'A')[0]; return a ? { x: a.x, y: a.y } : null; }
    if (s.call < 0) { a = L.stations(s, 'P')[0]; return a ? { x: a.x, y: a.y } : null; }
    var p = s.player, best = null, bd = 1e9, i, q, d;
    for (i = 0; i < s.people.length; i++) { q = s.people[i]; if (q.state !== 'wait' && q.state !== 'panic') continue; d = Math.abs(q.x - p.x) + Math.abs(q.y - p.y); if (d < bd) { bd = d; best = { x: Math.floor(q.x / L.T), y: Math.floor(q.y / L.T) }; } }
    if (best) return best;
    return null;
  }
  function draw() {
    if (!S.run) return;
    if (ctx) try { D.scene(ctx, S.run, S.clock, { goal: goalOf(S.run) }); } catch (e) { /* keep playing */ }
    if (rctx && S.clock - S.radarT > 0.18) { S.radarT = S.clock; try { D.radar(rctx, S.run, 142, 96, S.clock); } catch (e) { /* none */ } }
  }
  function say(msg, sec, hot) {
    S.tip = msg; S.tipUntil = S.clock + (sec || 4); S.tipHot = !!hot;
    var t = $('tip-t'), b = $('tip'); if (t) t.textContent = msg; if (b) { b.style.opacity = '1'; b.className = 'tipbox' + (hot ? ' hot' : ''); }
    speak(msg);
  }
  var TIPS = {
    crawl: 'Smoke rises. Tap CRAWL to breathe cleaner air near the floor!',
    waste: 'Short bursts at the base of the fire. Don\'t spray at nothing!',
    low: 'Gauge low: swap it at a red extinguisher cabinet.',
    empty: 'Your extinguisher is empty. Find a red cabinet for a fresh one.',
    health: 'Your health is low. Use a first aid kit or eat something.',
    alarm: 'Find the red ALARM on the corridor wall and pull it.',
    call: 'Now call 911. There is a phone in the Faculty Room.',
    onfire: 'Your clothes are on fire! Stop, drop and roll!',
    run: 'Don\'t run! Stop, drop and roll.',
    line: 'Keep the people with you away from fire and thick smoke!',
    behind: 'Someone is stuck behind a closed door. Open it for them.',
    reach: 'The hose only reaches so far from its cabinet.'
  };
  function toast(msg, cls) {
    var box = $('toasts'); if (!box) return;
    while (box.children.length > 1) box.removeChild(box.firstChild);
    var el = document.createElement('span'); el.className = 'toast' + (cls ? ' ' + cls : ''); el.textContent = msg; el.setAttribute('role', 'status');
    box.appendChild(el); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1700);
  }
  function onEvents(ev) {
    var s = S.run, i, e;
    for (i = 0; i < ev.length; i++) {
      e = ev[i];
      switch (e.type) {
        case 'tip': if (TIPS[e.id]) say(TIPS[e.id], 4, e.id === 'onfire' || e.id === 'run'); break;
        case 'join': toast(e.name + ' is with you!'); SFX.good(); break;
        case 'calm': toast(e.name + ' is with you again.'); SFX.good(); break;
        case 'panic': toast(e.name + ' stopped. Too much fire or smoke!', 'red'); SFX.bad(); break;
        case 'left': toast(e.name + ' is stuck behind a closed door!', 'red'); break;
        case 'rescue': toast('Firefighters will look for ' + e.name + '.', 'blue'); break;
        case 'pickup': toast(e.kind === 'kit' ? 'First aid kit' : 'Food: a quick snack', 'blue'); SFX.good(); break;
        case 'alarm': toast('The fire alarm is ringing!'); say('Alarm on! Everyone can hear it. Now call 911.', 4); S.alarmT = 0; break;
        case 'call': S.call = { i: 0, wrong: 0, bad: [], hint: '', done: false }; callSheet(); break;
        case 'swap': toast('A fresh extinguisher', 'blue'); SFX.good(); break;
        case 'wet': toast('Wet hanky on: less smoke damage', 'blue'); SFX.good(); break;
        case 'feel': if (e.hot) { toast('Hot door! Fire is behind it.', 'red'); say('Hot door! Fire is behind it. Find another way.', 4, true); SFX.bad(); } else { toast('Cool door. You can open it.'); } break;
        case 'open': SFX.door(); break;
        case 'close': toast('Door closed: it slows the fire'); SFX.door(); break;
        case 'flare': toast('The fire burst through the door!', 'red'); SFX.bad(); buzz(200); break;
        case 'onfire': SFX.bad(); buzz(150); break;
        case 'rolled': toast('Fire out. Well done!'); SFX.good(); break;
        case 'shock': toast('Water on an electrical fire! Never do that.', 'red'); say('Electrical fire: no water! Use the extinguisher instead.', 5, true); SFX.bad(); buzz(150); break;
        case 'toobig': tooBigSheet(); break;
        case 'newfire': say('A small fire started! Short bursts at its base can put it out.', 4); break;
        case 'trucks': toast('Firefighters are here!', 'blue'); say('Firefighters are here! Let them handle the big fire.', 4); SFX.good(); break;
        case 'hose': toast('Hose ready: lots of water, short reach', 'blue'); break;
        case 'heal': toast(e.kind === 'kit' ? 'First aid: +40 health' : 'Food: +15 health'); SFX.good(); break;
        case 'dodge': SFX.whoosh(); break;
        case 'out': case 'down': S.toEnd = 0.7; if (e.type === 'out') SFX.win(); else SFX.bad(); break;
      }
    }
  }
  function hud() {
    var s = S.run; if (!s) return;
    var p = s.player, el, a = L.actionFor(s), with_ = 0, total = s.people.length, k;
    for (k = 0; k < s.people.length; k++) if (s.people[k].state === 'follow') with_++;
    el = $('b-hp'); if (el) el.style.width = p.health + '%';
    el = $('t-hp'); if (el) el.textContent = Math.round(p.health);
    var hose = !!p.hose;
    el = $('b-ag'); if (el) { el.style.width = (hose ? 100 : p.agent) + '%'; el.style.background = hose ? '#5fb0ff' : p.agent < 25 ? '#ff5a5f' : '#3ee39b'; }
    el = $('t-ag'); if (el) el.textContent = hose ? 'H2O' : Math.round(p.agent);
    el = $('r-cl'); if (el) el.hidden = p.cloth < 0;
    el = $('b-cl'); if (el) el.style.width = Math.max(0, p.cloth) + '%';
    el = $('t-cl'); if (el) el.textContent = Math.round(Math.max(0, p.cloth));
    el = $('needle'); if (el) el.setAttribute('transform', 'rotate(' + (-90 + (hose ? 100 : p.agent) * 1.8) + ' 40 44)');
    var gl = hose ? 'Hose: water' : p.agent <= 0 ? 'Empty' : p.agent < 25 ? 'Refill soon' : 'Gauge OK';
    var key = [s.alarm >= 0, s.call >= 0, with_, total, a ? a.id + a.label : '', p.crawl, p.kits, p.food, p.cloth >= 0, p.clothOn, hose, p.onFire, gl, Math.round(p.health / 10), s.trucks > 0 ? Math.ceil(s.trucks - s.t) : -1].join('|');
    if (S.tip && S.clock > S.tipUntil) { S.tip = ''; el = $('tip'); if (el) el.style.opacity = '0'; }
    if (key === S.hudKey) return;
    S.hudKey = key;
    el = $('g-t'); if (el) { el.textContent = gl; el.style.color = hose ? '#9cc9f5' : p.agent < 25 ? '#ff9a94' : '#7ee2a8'; }
    el = $('goals');
    if (el) el.innerHTML = goal('bell', '#ffb38a', 'Alarm', s.alarm >= 0) + goal('phone', '#9cc9f5', 'Call 911', s.call >= 0)
      + '<span class="goal people"><span class="gi" style="background:#fff;border:0">' + ico('people', 12, '#5b3cc4', 2.8) + '</span>' + with_ + ' of ' + total + ' with you</span>' + goal('exit', '#7ee2a8', 'Exit', false);
    el = $('t-st');
    if (el) {
      var st = p.onFire ? 'On fire: stop, drop and roll!' : p.health < 35 ? 'Health low: first aid or food' : hose ? 'Hose: lots of water, short reach' : p.agent < 25 ? 'Gauge low: swap it at a red cabinet' : p.clothOn && p.cloth > 0 ? 'Wet hanky on: less smoke damage' : p.crawl ? 'Crawling: cleaner air, slower' : s.alarm < 0 ? 'Find the fire alarm.' : s.call < 0 ? 'Call 911 from the phone.' : 'Lead everyone to an exit.';
      el.textContent = st; el.className = (p.onFire || p.health < 35 || (!hose && p.agent < 25)) ? 'warn' : '';
    }
    el = $('actbtn');
    if (el) {
      if (a && a.id !== 'roll') { el.hidden = false; el.textContent = a.label; el.className = 'actbtn' + (a.tone === 'danger' ? ' danger' : ''); el.setAttribute('aria-label', a.label + ' (E)'); }
      else el.hidden = true;
    }
    el = $('rollbtn'); if (el) el.hidden = !p.onFire || p.roll > 0;
    el = $('crawl'); if (el) el.setAttribute('aria-pressed', p.crawl ? 'true' : 'false');
    el = $('n-kit'); if (el) el.textContent = p.kits;
    el = $('n-food'); if (el) el.textContent = p.food;
    el = $('s-kit'); if (el) { el.disabled = p.kits <= 0; el.setAttribute('aria-label', 'First aid kit, ' + p.kits + ' left'); }
    el = $('s-food'); if (el) { el.disabled = p.food <= 0; el.setAttribute('aria-label', 'Food, ' + p.food + ' left'); }
    el = $('s-cl'); if (el) { el.disabled = p.cloth < 0; el.className = 'slot' + (p.clothOn && p.cloth > 0 ? ' on' : ''); el.setAttribute('aria-label', p.cloth < 0 ? 'Wet hanky: wet it at a sink first' : 'Wet hanky, ' + (p.clothOn ? 'on' : 'off')); }
    el = $('s-hose'); if (el) el.className = 'slot' + (hose ? ' hoseon' : ' empty');
    el = $('spray'); if (el) { el.className = 'spray' + (hose ? ' hose' : '') + (S.spray ? ' down' : ''); el.setAttribute('aria-label', hose ? 'Spray water: hold' : 'Spray: hold to use the extinguisher'); }
    el = $('spray-s'); if (el) el.textContent = hose ? 'Water' : (s.stats.spray > 0 ? Math.round(100 * s.stats.onTarget / s.stats.spray) + '% on target' : 'Hold');
    el = $('eta');
    if (el) { el.hidden = !(s.trucks > 0 && !s.ff); var et = $('eta-t'); if (et) et.textContent = 'Firefighters in ' + clock(Math.max(0, s.trucks - s.t)); }
  }
  function goal(icon, color, label, done) {
    return '<span class="goal' + (done ? ' done' : '') + '"><span class="gi" style="border-color:' + color + (done ? ';background:' + color : '') + '">' + (done ? ico('check', 12, '#0d1821', 3.2) : ico(icon, 11, color, 2.8)) + '</span>' + label + '</span>';
  }

  // the stick (or the arrow keys) as a direction
  function input() {
    var mx = 0, my = 0, k = S.keys;
    if (S.joy) { mx = S.joy.dx; my = S.joy.dy; }
    if (k.left) mx -= 1; if (k.right) mx += 1; if (k.up) my -= 1; if (k.down) my += 1;
    var d = S.dodge; S.dodge = false;
    return { mx: mx, my: my, spray: S.spray || !!k.spray, dodge: d };
  }
  function knob(dx, dy) { var el = $('knob'); if (el) el.style.transform = 'translate(' + (dx * 25) + 'px,' + (dy * 25) + 'px)'; }
  function saveTime() { if (S.saveTick > 0) { SAVE.secs += S.saveTick; S.saveTick = 0; save(); } }
  function advance(dt) {
    var s = S.run; if (!s) return;
    if (S.toEnd > 0) { S.toEnd -= dt; if (S.toEnd <= 0) { S.toEnd = 0; saveTime(); resultSheet(); } return; }
    if (S.paused || S.overlay) return;
    onEvents(L.step(s, dt, input()));
    if (s.alarm >= 0 && s.phase === 'play') { S.alarmT -= dt; if (S.alarmT <= 0) { S.alarmT = 1.3; SFX.bell(); } }
    if (s.phase === 'play') {
      S.session += dt; S.saveTick += dt;
      if (S.saveTick > 15) saveTime();
      if (S.session >= BREAK_AFTER) { S.paused = true; saveTime(); breakSheet(); }
    }
  }
  function loop(now) {
    window.requestAnimationFrame(loop);
    var t = (now || Date.now()) / 1000, dt = S.lastT ? Math.min(0.05, Math.max(0, t - S.lastT)) : 0;
    S.lastT = t; S.clock += dt;
    if (S.screen !== 'play' || !S.run) return;
    advance(dt); draw(); hud();
  }
  function doAct() { if (!S.run || S.overlay || S.paused) return; audio(); onEvents(L.act(S.run)); hud(); }
  function pause() { if (!S.run || S.overlay || S.toEnd > 0 || S.run.phase !== 'play') return; S.paused = true; saveTime(); pauseSheet(); }
  // back to the library (in a frame only)
  function leave() { S.sayText = ''; hush(); if (S.screen !== 'brief') go('brief'); post({ type: 'exit' }); }

  /* ===== What the buttons do ===== */
  var ACT = {
    start: function () { go('brief'); },
    home: function () { closeOverlay(); go('home'); },
    walk: function () { S.walk = 0; walkSheet(); },
    wnext: function () { S.walk = Math.min(SLIDES.length - 1, S.walk + 1); walkSheet(); },
    wprev: function () { S.walk = Math.max(0, S.walk - 1); walkSheet(); },
    wdone: function () { closeOverlay(); if (S.screen === 'home') go('brief'); },
    manual: function () { manualSheet(); },
    close: function () { closeOverlay(); },
    sound: function (b) {
      SAVE.sound = !SAVE.sound; save();
      if (S.overlay === 'pause') pauseSheet();
      else if (b) { b.setAttribute('aria-pressed', SAVE.sound ? 'true' : 'false'); b.innerHTML = ico(SAVE.sound ? 'sound' : 'mute', 17, '#16303f') + 'Sound: ' + (SAVE.sound ? 'On' : 'Off'); }
    },
    askclear: function () { clearSheet(); },
    clear: function () { var keep = SAVE.sound; SAVE = fresh(); SAVE.sound = keep; SAVE.day = today(); save(); closeOverlay(); render(); },
    level: function (b) { S.level = b.getAttribute('data-id'); render(); },
    go: function () { audio(); S.screen = 'play'; render(); },
    pause: function () { pause(); },
    resume: function () { S.paused = false; closeOverlay(); },
    again: function () { closeOverlay(); audio(); S.screen = 'play'; render(); },
    nextfloor: function () { closeOverlay(); S.level = 'hard'; S.screen = 'brief'; render(); },
    act: function () { doAct(); },
    crawl: function () { if (S.run) { L.crawl(S.run); hud(); } },
    dodge: function () { S.dodge = true; },
    cloth: function () { if (S.run) { onEvents(L.use(S.run, 'cloth')); hud(); } },
    kit: function () { if (S.run) { onEvents(L.use(S.run, 'kit')); hud(); } },
    food: function () { if (S.run) { onEvents(L.use(S.run, 'food')); hud(); } },
    hoseslot: function () {
      var a = S.run && L.actionFor(S.run);
      if (a && (a.id === 'hose' || a.id === 'hoseback')) doAct();
      else say('Find a blue FIRE HOSE cabinet to use the hose.', 3);
    },
    choose: function (b) { L.choose(S.run, b.getAttribute('data-id')); closeOverlay(); say(b.getAttribute('data-id') === 'call' ? (S.run.call < 0 ? 'Go to the phone and call 911. Follow the yellow arrow.' : 'Meet the firefighters at the exit when it is safe.') : b.getAttribute('data-id') === 'hose' ? 'Get the fire hose from the blue cabinet. Follow the yellow arrow.' : 'Take the back stairs. Follow the yellow arrow.', 5); },
    answer: function (b) {
      if (!S.call || S.call.done) return;
      var c = S.call, q = L.questions(S.run)[c.i], k = +b.getAttribute('data-id'), a = q.a[k];
      if (c.bad.indexOf(k) >= 0) return;
      if (a[1]) { c.i++; c.hint = ''; c.bad = []; if (c.i >= L.questions(S.run).length) c.done = true; SFX.good(); }
      else { c.wrong++; c.bad.push(k); c.hint = a[2]; SFX.bad(); }
      callSheet();
    },
    hangup: function () { if (!S.call) return; L.called(S.run, S.call.wrong); S.call = null; closeOverlay(); toast('Firefighters are on the way', 'blue'); hud(); },
    breakhome: function () { S.session = 0; closeOverlay(); if (EMBED) leave(); else go('home'); },
    brief: function () { closeOverlay(); go('brief'); },
    leave: function () { closeOverlay(); leave(); },
    breakmore: function () { S.session = BREAK_AFTER - 5 * 60; S.paused = false; closeOverlay(); }
  };

  /* ===== Taps, the stick, the spray button and keys ===== */
  stage.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
    var f = ACT[b.getAttribute('data-act')];
    if (f) { e.preventDefault(); f(b); }
  });
  function down(e) {
    S.kbd = false;
    if (S.screen !== 'play' || S.overlay) return;
    var t = e.target;
    if (t && t.closest && t.closest('#spray')) { S.spray = true; S.sprayId = e.pointerId; audio(); if (e.cancelable) e.preventDefault(); hud(); return; }
    if (t && t.closest && (t.closest('button') || t.closest('.overlay'))) return;
    var pt = toStage(e);
    if (pt.x < 420) { S.joy = { id: e.pointerId, ox: pt.x, oy: pt.y, dx: 0, dy: 0 }; var st = $('stick'); if (st) { st.style.left = (pt.x - 44) + 'px'; st.style.top = (pt.y - 44) + 'px'; st.style.bottom = 'auto'; } if (e.cancelable) e.preventDefault(); }
  }
  function move(e) {
    if (!S.joy || e.pointerId !== S.joy.id) return;
    var pt = toStage(e), dx = (pt.x - S.joy.ox) / 36, dy = (pt.y - S.joy.oy) / 36, d = Math.sqrt(dx * dx + dy * dy);
    if (d > 1) { dx /= d; dy /= d; }
    S.joy.dx = dx; S.joy.dy = dy; knob(dx, dy);
    if (e.cancelable) e.preventDefault();
  }
  function up(e) {
    if (S.joy && e.pointerId === S.joy.id) { S.joy = null; knob(0, 0); var st = $('stick'); if (st) { st.style.left = ''; st.style.top = ''; st.style.bottom = ''; } }
    if (S.spray && (e.pointerId === S.sprayId || e.type === 'pointercancel')) { S.spray = false; S.sprayId = null; hud(); }
  }
  if (window.PointerEvent) {
    stage.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  } else {
    // older browsers: the mouse only
    stage.addEventListener('mousedown', function (e) { e.pointerId = 1; down(e); });
    window.addEventListener('mousemove', function (e) { e.pointerId = 1; move(e); });
    window.addEventListener('mouseup', function (e) { e.pointerId = 1; up(e); });
  }
  var KEYS = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ' ': 'spray' };
  document.addEventListener('keydown', function (e) {
    var k = e.key || '';
    if (k === 'Tab' || k === 'Enter') S.kbd = true;
    if (S.screen === 'play' && !S.overlay && S.run) {
      if (KEYS[k]) { S.keys[KEYS[k]] = true; e.preventDefault(); return; }
      if (k === 'c' || k === 'C') { ACT.crawl(); e.preventDefault(); return; }
      if (k === 'Shift') { S.dodge = true; return; }
      if (k === 'e' || k === 'E' || k === 'Enter') { doAct(); e.preventDefault(); return; }
      if (k === '1') { ACT.cloth(); return; } if (k === '2') { ACT.kit(); return; } if (k === '3') { ACT.food(); return; }
      if (k === 'h' || k === 'H') { ACT.hoseslot(); return; }
    }
    if (S.screen === 'play' && (k === 'Escape' || k === 'p' || k === 'P')) { if (S.overlay === 'pause') ACT.resume(); else pause(); e.preventDefault(); return; }
    if (k === 'Escape' && S.overlay && (S.overlay === 'walk' || S.overlay === 'manual' || S.overlay === 'clear')) closeOverlay();
  });
  document.addEventListener('keyup', function (e) { if (KEYS[e.key]) S.keys[KEYS[e.key]] = false; });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { saveTime(); S.keys = {}; S.spray = false; S.joy = null; if (S.screen === 'play' && S.run && !S.overlay) pause(); } });
  window.addEventListener('resize', fit); window.addEventListener('orientationchange', fit); window.addEventListener('pagehide', saveTime);
  var turnOk = $('turn-ok'); if (turnOk) turnOk.addEventListener('click', function () { S.turnOk = true; fit(); });

  /* ===== Start ===== */
  fit(); render(); window.requestAnimationFrame(loop);

  // for the tests: look inside, press buttons, and move a mission on without waiting
  window.__lusot = {
    S: S, act: ACT, saved: function () { return SAVE; }, embed: EMBED, input: function (o) { S.keys = o.keys || {}; S.spray = !!o.spray; },
    advance: function (sec) { var n = Math.round(sec * 30); for (var i = 0; i < n; i++) advance(1 / 30); hud(); }
  };
})();
