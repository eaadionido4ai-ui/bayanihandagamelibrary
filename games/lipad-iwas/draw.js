// Lipad-Iwas: the pictures. Everything in a flight is drawn here on a canvas, in page pixels of the 390 by 844 stage,
// so the screens (app.js) only say what to draw and where. The shapes follow the Engaging mockup: Maya the brown
// sparrow with her rolled-up warning, the hazards of each world, homes with a yellow "!" until they are warned.
// Plain ES5.
(function (root) {
  'use strict';
  var LI = root.LipadIwas, W = LI.W, H = LI.H, BX = LI.BIRD_X;
  var REDUCED = false;
  try { REDUCED = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { REDUCED = false; }

  var CACHE = {};
  function path(d) { if (!CACHE[d]) CACHE[d] = new root.Path2D(d); return CACHE[d]; }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function circle(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
  function ellipse(ctx, x, y, rx, ry, fill) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
  function line(ctx, x0, y0, x1, y1, color, w) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke(); }
  function text(ctx, s, x, y, size, color, align, weight) {
    ctx.font = (weight || 900) + ' ' + size + "px 'Nunito', sans-serif"; ctx.fillStyle = color; ctx.textAlign = align || 'center';
    ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
  }
  // a number from 0 to 1 that stays the same for the same place, for small differences that do not flicker
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* ===== Colors of the four worlds ===== */
  var PAL = {
    bagyo: { sky: '#4f6b82', sky2: '#6f8ba2', cloud: '#33475a', far: '#3b5d55', rain: 'rgba(214,228,238,.55)', edge: '#3d566b' },
    baha: { sky: '#58728b', sky2: '#7c95ab', cloud: '#3a4f62', far: '#4a6458', rain: 'rgba(214,228,238,.6)', edge: '#40576c' },
    lindol: { sky: '#86c6e6', sky2: '#c4e7f6', cloud: '#ffffff', far: '#78a978', edge: '#6eb3d6' },
    bulkan: { sky: '#bf9673', sky2: '#e2c19f', cloud: '#7a716b', far: '#6b5548', edge: '#a07a58' }
  };

  /* ===== Maya =====
     The same shapes as the mockup (a 150 by 120 drawing), scaled down, with the middle of her body at x, y.
     o: scale, wingDown, dizzy, shield, alpha */
  var MAYA = {
    tail: 'M24 64L2 54L8 70L2 84L28 74Z',
    wingUp: 'M50 62C38 30 58 10 88 14C76 30 74 46 70 64Z',
    wingDown: 'M48 66C38 96 58 116 86 110C74 96 72 84 70 70Z',
    lines: 'M58 42C66 36 74 33 81 31M56 52C64 46 72 43 79 41',
    cheek: 'M90 50C94 64 112 70 126 58C122 72 106 76 96 70C90 66 88 58 90 50Z',
    beak: 'M126 44L142 49L126 54Z',
    dizzy: 'M108 37l9 9M117 37l-9 9'
  };
  function maya(ctx, x, y, tilt, o) {
    o = o || {};
    var sc = o.scale || 0.46;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.translate(x, y); ctx.rotate(tilt || 0); ctx.scale(sc, sc); ctx.translate(-66, -70);
    ctx.fillStyle = '#7a4a24'; ctx.fill(path(MAYA.tail));
    ellipse(ctx, 66, 70, 44, 34, '#a8743f');
    ellipse(ctx, 74, 82, 30, 20, '#f0dcb8');
    ctx.fillStyle = '#7a4a24'; ctx.fill(path(o.wingDown ? MAYA.wingDown : MAYA.wingUp));
    if (!o.wingDown) { ctx.strokeStyle = '#5b3518'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke(path(MAYA.lines)); }
    circle(ctx, 104, 46, 24, '#8a5a30');
    ctx.fillStyle = '#f4ead8'; ctx.fill(path(MAYA.cheek));
    circle(ctx, 108, 59, 4.5, '#2a2320');
    if (o.dizzy) { ctx.strokeStyle = '#1b1410'; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.stroke(path(MAYA.dizzy)); }
    else { circle(ctx, 112, 42, 5, '#1b1410'); circle(ctx, 113.6, 40.4, 1.6, '#ffffff'); }
    ctx.fillStyle = '#3d3a38'; ctx.fill(path(MAYA.beak));
    ctx.save(); ctx.translate(70, 110); ctx.rotate(-0.1);
    rr(ctx, -18, -7, 36, 14, 7); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#d14a24'; ctx.lineWidth = 2.5; ctx.stroke();
    text(ctx, '!', 0, 4, 10, '#b33a1a');
    ctx.restore();
    ctx.restore();
    if (o.shield) {
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, 34 * sc / 0.46, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(95,208,255,.16)'; ctx.fill(); ctx.strokeStyle = 'rgba(95,208,255,.95)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    }
    if (o.dizzy) dizzyStars(ctx, x + 18 * sc / 0.46, y - 34 * sc / 0.46, o.t || 0, sc / 0.46);
  }
  function star(ctx, x, y, r, fill) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = '#e0a400'; ctx.lineWidth = 1; ctx.stroke();
  }
  function dizzyStars(ctx, x, y, t, k) {
    for (var i = 0; i < 3; i++) {
      var a = t * 3 + i * 2.1;
      star(ctx, x + Math.cos(a) * 20 * k, y + Math.sin(a) * 6 * k, 6 * k, '#ffc53d');
    }
  }

  /* ===== Go bag items (24 by 24 line drawings, the first aid kit filled in) ===== */
  var ITEM_PATH = {
    whistle: 'M4 14a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M13 11h8v4h-5',
    flashlight: 'M8 3h8v4l-2 3v11h-4V10L8 7zM12 13v2',
    water: 'M10 2h4v3l2 3v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8l2-3zM8 12h8',
    radio: 'M3 9h18v11H3zM7 9l9-5M7 14.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M15 13h3M15 16h3',
    food: 'M6 5a6 2 0 1 0 12 0a6 2 0 1 0 -12 0M6 5v14a6 2 0 0 0 12 0V5M6 10h12',
    batteries: 'M7 5h10v16H7zM10 2h4v3M10 11h4M12 9v4',
    clothes: 'M8 3L3 6l2 4 3-1v12h8V9l3 1 2-4-5-3c-1 2-2.4 3-4 3s-3-1-4-3z'
  };
  function itemIcon(ctx, kind, x, y, size) {
    var k = size / 24;
    ctx.save(); ctx.translate(x - size / 2, y - size / 2); ctx.scale(k, k);
    if (kind === 'kit') {
      rr(ctx, 3, 5, 18, 15, 3); ctx.fillStyle = '#1a8f4c'; ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(12, 9); ctx.lineTo(12, 16); ctx.moveTo(8.5, 12.5); ctx.lineTo(15.5, 12.5); ctx.stroke();
    } else {
      ctx.strokeStyle = '#16303f'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.stroke(path(ITEM_PATH[kind] || ITEM_PATH.whistle));
    }
    ctx.restore();
  }
  function bubble(ctx, x, y, kind, t) {
    var bob = REDUCED ? 0 : Math.sin(t * 3 + x * 0.05) * 3;
    ctx.beginPath(); ctx.arc(x, y + bob, 19, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fill(); ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 3; ctx.stroke();
    itemIcon(ctx, kind, x, y + bob, 24);
  }

  /* ===== The hazards that stand in Maya's way =====
     A top hazard hangs down to y (the top of the gap); a bottom one stands from the ground gy up to y. */
  function billboard(ctx, x, y) {
    ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x - 7, -10, 14, y - 20);
    ctx.save(); ctx.translate(x, y - 30); ctx.rotate(-0.22);
    rr(ctx, -50, -27, 100, 54, 4); ctx.fillStyle = '#e9e2cf'; ctx.fill(); ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, -27); ctx.lineTo(-4, -3); ctx.lineTo(-15, 27); ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 3; ctx.stroke();
    line(ctx, -40, -13, -24, -13, '#b9ae93', 5); line(ctx, -40, -1, -30, -1, '#b9ae93', 5); line(ctx, 8, 11, 40, 11, '#b9ae93', 5);
    ctx.restore();
  }
  function branch(ctx, x, y) {
    ctx.fillStyle = '#5b4632';
    ctx.beginPath(); ctx.moveTo(x - 14, -10); ctx.lineTo(x + 14, -10); ctx.lineTo(x + 9, y - 24); ctx.lineTo(x - 9, y - 30); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 6, y - 96); ctx.lineTo(x + 36, y - 74); ctx.lineTo(x + 32, y - 66); ctx.lineTo(x + 4, y - 82); ctx.closePath(); ctx.fill();
    circle(ctx, x - 13, y - 26, 22, '#3e7d4a'); circle(ctx, x + 15, y - 22, 20, '#3e7d4a'); circle(ctx, x, y - 12, 15, '#3e7d4a');
    circle(ctx, x + 36, y - 70, 12, '#3e7d4a');
    circle(ctx, x - 18, y - 32, 9, '#4f9a5c'); circle(ctx, x + 10, y - 28, 8, '#4f9a5c');
  }
  function post(ctx, x, y, gy, t) {
    var h = gy - y + 8;
    ctx.save(); ctx.translate(x, gy + 4); ctx.rotate(-0.07);
    ctx.fillStyle = '#6b5a48'; ctx.fillRect(-7, -h, 14, h); ctx.fillRect(-30, -h + 6, 60, 8);
    ctx.fillStyle = '#d7e2e8'; ctx.fillRect(-28, -h, 4, 7); ctx.fillRect(24, -h, 4, 7);
    ctx.strokeStyle = '#1f1f1f'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-26, -h + 12); ctx.bezierCurveTo(-42, -h + 60, -52, -h + 100, -66, -h + 150); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(26, -h + 12); ctx.bezierCurveTo(44, -h + 40, 64, -h + 56, 94, -h + 72); ctx.stroke();
    if (REDUCED || Math.floor(t * 6) % 2) {
      ctx.beginPath(); ctx.moveTo(-58, -h + 128); ctx.lineTo(-50, -h + 134); ctx.lineTo(-55, -h + 137); ctx.lineTo(-46, -h + 145);
      ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
    }
    ctx.restore();
  }
  function wires(ctx, x, y) {
    ctx.fillStyle = '#6b5a48'; ctx.fillRect(x - 7, -10, 14, y - 14); ctx.fillRect(x - 32, y - 36, 64, 8);
    ctx.fillStyle = '#d7e2e8'; ctx.fillRect(x - 28, y - 42, 4, 7); ctx.fillRect(x + 24, y - 42, 4, 7);
    rr(ctx, x + 7, y - 100, 18, 28, 3); ctx.fillStyle = '#7d8b94'; ctx.fill();
    ctx.strokeStyle = '#1f1f1f'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x - 27, y - 32); ctx.quadraticCurveTo(x - 60, y + 6, x - 112, y - 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 27, y - 32); ctx.quadraticCurveTo(x + 60, y + 6, x + 112, y - 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 16, y - 30); ctx.quadraticCurveTo(x + 24, y - 12, x + 12, y - 3); ctx.stroke();
  }
  function pile(ctx, x, y, gy) {
    rr(ctx, x - 30, y + 10, 60, gy - y + 10, 8); ctx.fillStyle = '#6e5536'; ctx.fill();
    for (var yy = y + 34, i = 0; yy < gy - 10; yy += 46, i++) {
      if (i % 3 === 0) { rr(ctx, x - 22, yy, 30, 36, 5); ctx.fillStyle = '#b5562f'; ctx.fill(); line(ctx, x - 22, yy + 12, x + 8, yy + 12, '#8a3f20', 2); line(ctx, x - 22, yy + 24, x + 8, yy + 24, '#8a3f20', 2); }
      else if (i % 3 === 1) { rr(ctx, x - 10, yy + 4, 34, 28, 3); ctx.fillStyle = '#c9a679'; ctx.fill(); line(ctx, x - 10, yy + 4, x + 24, yy + 32, '#8f6f45', 2); }
      else { ctx.save(); ctx.translate(x, yy + 18); ctx.rotate(0.25); rr(ctx, -30, -6, 60, 12, 4); ctx.fillStyle = '#9c7a52'; ctx.fill(); ctx.restore(); }
    }
    rr(ctx, x - 38, y, 76, 20, 10); ctx.fillStyle = '#8a6239'; ctx.fill();
    circle(ctx, x + 30, y + 10, 8, '#c9a67a'); circle(ctx, x + 30, y + 10, 4, '#8a6239');
  }
  function beam(ctx, x, y) {
    ctx.fillStyle = '#a3a7ab'; ctx.fillRect(x - 24, -10, 48, y - 8);
    ctx.fillStyle = '#8b8f93'; ctx.fillRect(x + 12, -10, 12, y - 8);
    ctx.beginPath(); ctx.moveTo(x - 24, y - 20); ctx.lineTo(x - 24, y - 12); ctx.lineTo(x - 12, y); ctx.lineTo(x - 2, y - 10); ctx.lineTo(x + 10, y - 2);
    ctx.lineTo(x + 24, y - 13); ctx.lineTo(x + 24, y - 20); ctx.closePath(); ctx.fillStyle = '#a3a7ab'; ctx.fill();
    line(ctx, x - 14, y - 8, x - 18, y + 4, '#7a4a2a', 3); line(ctx, x + 6, y - 6, x + 10, y + 5, '#7a4a2a', 3);
    ctx.beginPath(); ctx.moveTo(x - 6, y - 120); ctx.lineTo(x + 4, y - 96); ctx.lineTo(x - 8, y - 70); ctx.lineTo(x + 2, y - 44);
    ctx.strokeStyle = '#6f7377'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x - 24, -10, 6, y - 20);
  }
  function rubble(ctx, x, y, gy) {
    ctx.beginPath(); ctx.moveTo(x - 28, gy + 6); ctx.lineTo(x - 28, y + 14); ctx.lineTo(x - 18, y + 2); ctx.lineTo(x - 6, y + 11); ctx.lineTo(x + 6, y);
    ctx.lineTo(x + 18, y + 9); ctx.lineTo(x + 28, y + 4); ctx.lineTo(x + 28, gy + 6); ctx.closePath(); ctx.fillStyle = '#c9b49a'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(110,80,50,.35)'; ctx.lineWidth = 1.5;
    for (var yy = y + 14, r = 0; yy < gy; yy += 14, r++) {
      line(ctx, x - 28, yy, x + 28, yy, 'rgba(110,80,50,.35)', 1.5);
      for (var xx = x - 28 + (r % 2 ? 10 : 0); xx < x + 28; xx += 20) line(ctx, xx, yy, xx, yy + 14, 'rgba(110,80,50,.35)', 1.5);
    }
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(x + 4, y + 6); ctx.lineTo(x - 4, y + 40); ctx.lineTo(x + 8, y + 70); ctx.lineTo(x - 2, y + 110);
    ctx.strokeStyle = '#5e4a36'; ctx.lineWidth = 2.6; ctx.stroke();
    circle(ctx, x - 34, gy - 4, 8, '#9a9086'); circle(ctx, x + 36, gy - 3, 6, '#9a9086');
  }
  function ash(ctx, x, y, t) {
    var yy, k;
    for (yy = -20, k = 0; yy < y - 26; yy += 30, k++) {
      circle(ctx, x - 9 + Math.sin(k * 1.7) * 6, yy, 27, '#58524f');
      circle(ctx, x + 12, yy + 14, 23, '#66605c');
    }
    circle(ctx, x - 14, y - 24, 22, '#6f6965'); circle(ctx, x + 13, y - 20, 20, '#6f6965'); circle(ctx, x, y - 13, 15, '#7a7470');
    circle(ctx, x - 6, y - 34, 10, '#857e79');
  }
  function rock(ctx, x, y, r, spin, fill, edge) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin || 0);
    ctx.beginPath();
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, rad = r * (0.82 + hash(i + r) * 0.3); ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
    ctx.closePath(); ctx.fillStyle = fill || '#8b8178'; ctx.fill(); ctx.strokeStyle = edge || '#5e554d'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  function boulder(ctx, x, y, gy) {
    for (var yy = gy - 18, i = 0; yy > y + 22; yy -= 38, i++) {
      rock(ctx, x + (i % 2 ? 6 : -6), yy, 27, i * 0.7, '#4d4440', '#352e2b');
      line(ctx, x - 8 + (i % 2 ? 6 : -6), yy - 6, x + 6 + (i % 2 ? 6 : -6), yy + 8, 'rgba(255,122,26,.75)', 2);
    }
    rock(ctx, x, y + 22, 26, 0.3, '#5a504b', '#352e2b');
    line(ctx, x - 10, y + 16, x + 4, y + 28, 'rgba(255,122,26,.85)', 2.4);
  }
  var TOP = { billboard: billboard, branch: branch, wires: wires, beam: beam, ash: ash };
  var BOTTOM = { post: post, pile: pile, rubble: rubble, boulder: boulder };

  /* ===== Moving hazards ===== */
  var SHEET = 'M-32 -14Q-24 -20 -16 -14T0 -14T16 -14T32 -14V14Q24 8 16 14T0 14T-16 14T-32 14Z';
  function sheet(ctx, x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(spin) * 0.6);
    ctx.fillStyle = '#a9b4bc'; ctx.fill(path(SHEET)); ctx.strokeStyle = '#6f7b84'; ctx.lineWidth = 2; ctx.stroke(path(SHEET));
    line(ctx, -16, -14, -16, 14, '#8e9aa3', 1.6); line(ctx, 0, -14, 0, 14, '#8e9aa3', 1.6); line(ctx, 16, -14, 16, 14, '#8e9aa3', 1.6);
    ctx.restore();
    line(ctx, x + 40, y - 10, x + 68, y - 10, 'rgba(255,255,255,.75)', 2.4); line(ctx, x + 44, y + 4, x + 66, y + 4, 'rgba(255,255,255,.75)', 2.4);
  }
  function fallingRock(ctx, x, y, spin) {
    line(ctx, x, y - 24, x, y - 46, 'rgba(255,255,255,.55)', 2.4); line(ctx, x - 9, y - 20, x - 9, y - 36, 'rgba(255,255,255,.4)', 2);
    rock(ctx, x, y, 16, spin, '#8b8178', '#5e554d');
  }
  function bomb(ctx, x, y, spin) {
    for (var i = 1; i <= 4; i++) circle(ctx, x + i * 9, y - i * 30, 6 + i * 2.5, 'rgba(110,104,100,' + (0.5 - i * 0.1) + ')');
    var g = ctx.createRadialGradient(x, y, 2, x, y, 24);
    g.addColorStop(0, 'rgba(255,170,60,.9)'); g.addColorStop(1, 'rgba(255,106,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill();
    rock(ctx, x, y, 15, spin, '#3b3330', '#221c1a');
    line(ctx, x - 5, y - 4, x + 4, y + 5, '#ff8a3d', 2.2);
  }
  function warnMark(ctx, x, y, t) {
    ctx.save(); ctx.globalAlpha = REDUCED ? 1 : 0.65 + 0.35 * Math.sin(t * 12);
    ctx.beginPath(); ctx.moveTo(x, y - 13); ctx.lineTo(x + 13, y + 10); ctx.lineTo(x - 13, y + 10); ctx.closePath();
    ctx.fillStyle = '#ffd34d'; ctx.fill(); ctx.strokeStyle = '#3b2a00'; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.stroke();
    text(ctx, '!', x, y + 7, 13, '#3b2a00');
    ctx.restore();
  }

  /* ===== Homes, the ground, the sky ===== */
  var WALL = ['#e8d8b8', '#f1e3c9', '#e8e2d6', '#dbe8d4'], ROOF = ['#8a5a2b', '#c0322b', '#2f6f8f', '#6b4f9a'];
  function home(ctx, x, gy, look, warned, t, sink) {
    var by = gy + (sink || 0);
    ctx.fillStyle = WALL[look % 4]; ctx.fillRect(x - 26, by - 34, 52, 34);
    ctx.beginPath(); ctx.moveTo(x - 32, by - 32); ctx.lineTo(x, by - 56); ctx.lineTo(x + 32, by - 32); ctx.closePath(); ctx.fillStyle = ROOF[look % 4]; ctx.fill();
    ctx.fillStyle = '#5b3518'; ctx.fillRect(x - 5, by - 20, 10, 20);
    ctx.fillStyle = '#9cc9f5'; ctx.fillRect(x + 10, by - 26, 10, 9); ctx.fillRect(x - 20, by - 26, 10, 9);
    if (warned) {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 23, by - 96, 3, 64);
      ctx.fillStyle = '#1a8f4c'; ctx.fillRect(x - 20, by - 94, 22, 15);
      ctx.beginPath(); ctx.moveTo(x - 16, by - 87); ctx.lineTo(x - 12, by - 83); ctx.lineTo(x - 5, by - 91);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    } else {
      var bob = REDUCED ? 0 : Math.sin(t * 4 + x * 0.02) * 3;
      ctx.beginPath(); ctx.arc(x, by - 78 + bob, 12, 0, Math.PI * 2); ctx.fillStyle = '#ffd34d'; ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.stroke();
      text(ctx, '!', x, by - 73 + bob, 14, '#3b2a00');
    }
  }
  // the warning zone over a home that Maya still has to warn: a light column with a down arrow at its top
  function zone(ctx, x, gy, z, first, t) {
    var top = gy - z, bottom = gy - 96;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.fillRect(x - 32, top, 64, bottom - top);
    ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 32, top); ctx.lineTo(x - 32, bottom); ctx.moveTo(x + 32, top); ctx.lineTo(x + 32, bottom); ctx.stroke();
    ctx.setLineDash([]);
    var a = REDUCED ? 0 : (t * 18) % 12;
    ctx.beginPath(); ctx.moveTo(x - 10, top + 2 + a); ctx.lineTo(x, top + 12 + a); ctx.lineTo(x + 10, top + 2 + a);
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    if (first) {
      rr(ctx, x - 34, top - 30, 68, 22, 11); ctx.fillStyle = '#16303f'; ctx.fill();
      text(ctx, 'Fly low!', x, top - 14, 12, '#ffffff');
    }
    ctx.restore();
  }
  function evac(ctx, x, gy) {
    if (x < -220 || x > W + 20) return;
    ctx.fillStyle = '#f4f1e8'; ctx.fillRect(x, gy - 96, 172, 96);
    ctx.strokeStyle = '#c9c2b0'; ctx.lineWidth = 2; ctx.strokeRect(x, gy - 96, 172, 96);
    ctx.fillStyle = '#1a8f4c'; ctx.fillRect(x - 8, gy - 110, 188, 16);
    rr(ctx, x + 18, gy - 86, 136, 22, 6); ctx.fillStyle = '#1a8f4c'; ctx.fill();
    text(ctx, 'EVACUATION CENTER', x + 86, gy - 70, 10.5, '#ffffff');
    ctx.fillStyle = '#9cc9f5';
    for (var i = 0; i < 4; i++) ctx.fillRect(x + 16 + i * 40, gy - 54, 22, 16);
    ctx.fillStyle = '#5b3518'; ctx.fillRect(x + 76, gy - 32, 20, 32);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 186, gy - 150, 3, 150);
    ctx.fillStyle = '#ffd34d'; ctx.fillRect(x + 189, gy - 148, 26, 17);
  }
  function sky(ctx, w, t) {
    var p = PAL[w], g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p.sky); g.addColorStop(1, p.sky2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function far(ctx, w, cam, gy, t) {
    var p = PAL[w], i, x, off;
    if (w === 'lindol') {
      circle(ctx, 318, 170, 30, '#fff3b0');
      off = -(cam * 0.08) % 260;
      for (i = -1; i < 3; i++) { x = off + i * 260; ellipse(ctx, x + 90, 120, 50, 16, 'rgba(255,255,255,.8)'); ellipse(ctx, x + 120, 110, 30, 14, 'rgba(255,255,255,.8)'); }
      ctx.fillStyle = '#2f86c4'; ctx.fillRect(0, gy - 92, W, 92);
      ctx.fillStyle = '#5aa7d8'; ctx.fillRect(0, gy - 92, W, 6);
      off = -(cam * 0.3) % 120;
      for (i = -1; i < 5; i++) line(ctx, off + i * 120 + 20, gy - 60, off + i * 120 + 60, gy - 60, 'rgba(255,255,255,.35)', 2);
      ctx.fillStyle = '#e6cf98'; ctx.fillRect(0, gy - 26, W, 26);
      return;
    }
    if (w === 'bulkan') {
      off = -(cam * 0.05) % 900;
      x = off + 520; if (x < -200) x += 900;
      ctx.beginPath(); ctx.moveTo(x - 260, gy - 30); ctx.lineTo(x - 40, gy - 330); ctx.lineTo(x + 40, gy - 330); ctx.lineTo(x + 260, gy - 30); ctx.closePath();
      ctx.fillStyle = p.far; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 40, gy - 330); ctx.lineTo(x - 18, gy - 312); ctx.lineTo(x + 20, gy - 314); ctx.lineTo(x + 40, gy - 330); ctx.closePath(); ctx.fillStyle = '#4d3c33'; ctx.fill();
      for (i = 0; i < 6; i++) circle(ctx, x + Math.sin(i * 1.3 + t * 0.3) * 18 - i * 8, gy - 350 - i * 34, 26 + i * 6, 'rgba(110,104,100,' + (0.75 - i * 0.08) + ')');
      off = -(cam * 0.25) % 200;
      for (i = -1; i < 4; i++) ellipse(ctx, off + i * 200 + 100, gy - 4, 130, 34, '#9b8676');
      return;
    }
    off = -(cam * 0.12) % 300;
    for (i = -1; i < 3; i++) { x = off + i * 300; ellipse(ctx, x + 60, 40, 110, 60, p.cloud); ellipse(ctx, x + 230, 26, 150, 56, p.cloud); }
    off = -(cam * 0.3) % 160;
    for (i = -1; i < 4; i++) { x = off + i * 160; ellipse(ctx, x + 80, gy - 2, 100, 40, p.far); circle(ctx, x + 30, gy - 34, 22, p.far); circle(ctx, x + 120, gy - 40, 26, p.far); }
  }
  function ground(ctx, w, gy, cam, t) {
    var i, x, off;
    if (w === 'baha') {
      ctx.fillStyle = '#7d6446'; ctx.fillRect(0, gy - 4, W, H - gy + 4);
      off = -((cam + t * 20) % 44);
      ctx.strokeStyle = '#a3865e'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      for (var row = 0; row < 3; row++) {
        ctx.beginPath();
        for (x = off - 44 + row * 14; x < W + 44; x += 44) { ctx.moveTo(x, gy + 6 + row * 26); ctx.quadraticCurveTo(x + 11, gy + 1 + row * 26, x + 22, gy + 6 + row * 26); }
        ctx.stroke();
      }
      off = -(cam % 230);
      for (i = -1; i < 3; i++) { x = off + i * 230 + 60; rr(ctx, x, gy + 40, 34, 9, 4); ctx.fillStyle = '#9c7a52'; ctx.fill(); }
      return;
    }
    if (w === 'lindol') {
      ctx.fillStyle = '#d9c089'; ctx.fillRect(0, gy, W, H - gy);
      ctx.fillStyle = '#b9a06c'; ctx.fillRect(0, gy + 26, W, 14);
      off = -(cam % 180);
      for (i = -1; i < 4; i++) {
        x = off + i * 180 + 40;
        ctx.beginPath(); ctx.moveTo(x, gy + 6); ctx.lineTo(x + 12, gy + 18); ctx.lineTo(x + 6, gy + 30); ctx.lineTo(x + 20, gy + 46);
        ctx.strokeStyle = '#7d6a48'; ctx.lineWidth = 2; ctx.stroke();
      }
      return;
    }
    if (w === 'bulkan') {
      ctx.fillStyle = '#8f8a84'; ctx.fillRect(0, gy, W, H - gy);
      ctx.fillStyle = '#7d6c58'; ctx.fillRect(0, gy + 22, W, 22);
      off = -((cam + t * 30) % 40);
      for (x = off; x < W + 40; x += 40) line(ctx, x, gy + 33, x + 16, gy + 33, 'rgba(60,45,30,.45)', 2.4);
      return;
    }
    ctx.fillStyle = '#3f7a4f'; ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = '#5d6a72'; ctx.fillRect(0, gy + 24, W, 16);
    off = -(cam % 200);
    for (i = -1; i < 3; i++) { ellipse(ctx, off + i * 200 + 96, gy + 14, 22, 5, 'rgba(92,135,166,.8)'); }
    for (i = -1; i < 4; i++) line(ctx, off + i * 100 + 10, gy + 32, off + i * 100 + 40, gy + 32, '#e8e2d6', 2);
  }
  function weather(ctx, w, t) {
    var i, x, y, n;
    if (w === 'bagyo' || w === 'baha') {
      n = REDUCED ? 14 : (w === 'baha' ? 56 : 42);
      ctx.strokeStyle = PAL[w].rain; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath();
      for (i = 0; i < n; i++) {
        x = (hash(i) * (W + 60) - (REDUCED ? 0 : t * 60)) % (W + 60); if (x < -30) x += W + 60;
        y = (hash(i + 99) * H + (REDUCED ? 0 : t * 560)) % H;
        ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 22);
      }
      ctx.stroke();
    } else if (w === 'bulkan') {
      n = REDUCED ? 12 : 34;
      for (i = 0; i < n; i++) {
        x = (hash(i) * W - (REDUCED ? 0 : t * 18)) % W; if (x < 0) x += W;
        y = (hash(i + 50) * H + (REDUCED ? 0 : t * 60)) % H;
        circle(ctx, x, y, 1.6 + hash(i + 7) * 1.4, 'rgba(70,64,60,.45)');
      }
    }
  }
  function gusts(ctx, s, cam, t) {
    for (var i = 0; i < s.twists.length; i++) {
      var tw = s.twists[i];
      if (tw.kind !== 'gust') continue;
      var x0 = tw.x0 - cam, x1 = tw.x1 - cam;
      if (x1 < -20 || x0 > W + 20) continue;
      ctx.save();
      for (var k = 0; k < 6; k++) {
        var y = 190 + k * 86 + (REDUCED ? 0 : (tw.dir * t * 140) % 86);
        ctx.beginPath(); ctx.moveTo(x0 + 6, y); ctx.bezierCurveTo(x0 + 50, y + tw.dir * 26, x1 - 50, y + tw.dir * 26, x1 - 6, y + tw.dir * 44);
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
      }
      rr(ctx, x0 + 10, 150, 78, 26, 13); ctx.fillStyle = '#16303f'; ctx.fill();
      text(ctx, s.world === 'bulkan' ? 'Ash wind' : 'Gust!', x0 + 42, 168, 12.5, '#ffffff');
      ctx.beginPath(); var ax = x0 + 76, ay = 163;
      if (tw.dir > 0) { ctx.moveTo(ax - 5, ay - 4); ctx.lineTo(ax, ay + 3); ctx.lineTo(ax + 5, ay - 4); }
      else { ctx.moveTo(ax - 5, ay + 3); ctx.lineTo(ax, ay - 4); ctx.lineTo(ax + 5, ay + 3); }
      ctx.strokeStyle = '#9cc9f5'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.stroke();
      ctx.restore();
    }
  }

  /* ===== A whole flight, one frame ===== */
  function scene(ctx, s, t) {
    var cam = s.x - BX, gy = s.groundY, i, x, c, top, bot, m, lv = s.lv, firstOpen = -1;
    ctx.save();
    if (s.shake > 0 && !REDUCED) ctx.translate((hash(t * 60) - 0.5) * 12 * s.shake, (hash(t * 60 + 3) - 0.5) * 8 * s.shake);
    sky(ctx, s.world, t);
    far(ctx, s.world, cam, gy, t);
    evac(ctx, s.end + 60 - cam, gy);
    for (i = 0; i < s.houses.length; i++) {
      var h = s.houses[i];
      x = h.x - cam;
      if (x < -60 || x > W + 60) continue;
      if (!h.warned && firstOpen < 0) firstOpen = i;
      if (!h.warned && x > BX - 40) zone(ctx, x, gy, lv.zone, s.warned === 0 && i === firstOpen && i < 2, t);
      home(ctx, x, gy, h.look, h.warned, t, s.world === 'baha' ? 10 : 0);
    }
    ground(ctx, s.world, gy, cam, t);
    gusts(ctx, s, cam, t);
    for (i = 0; i < s.cols.length; i++) {
      c = s.cols[i]; x = c.x - cam;
      if (x < -130 || x > W + 130) continue;
      top = c.c - lv.gap / 2; bot = c.c + lv.gap / 2;
      (TOP[c.top] || billboard)(ctx, x, top, t);
      (BOTTOM[c.bottom] || post)(ctx, x, bot, gy, t);
    }
    for (i = 0; i < s.bubbles.length; i++) {
      var b = s.bubbles[i];
      x = b.x - cam;
      if (!b.got && x > -30 && x < W + 30) bubble(ctx, x, b.y, b.kind, t);
    }
    for (i = 0; i < s.movers.length; i++) {
      m = s.movers[i];
      if (m.done) continue;
      x = m.x - cam;
      if (!m.active) {
        if (s.x > m.trigger - lv.speed * 1.1) {
          if (m.type === 'sheet') warnMark(ctx, W - 22, m.y0, t);
          else warnMark(ctx, Math.min(W - 20, Math.max(20, x)), 136, t);
        }
        continue;
      }
      if (m.type === 'sheet') { if (x > W + 6) warnMark(ctx, W - 22, m.y, t); else sheet(ctx, x, m.y, m.spin); }
      else if (m.type === 'bomb') bomb(ctx, x, m.y, m.spin);
      else fallingRock(ctx, x, m.y, m.spin);
      if (m.type !== 'sheet' && m.y < 110 && x > 0 && x < W) warnMark(ctx, x, 136, t);
    }
    var blink = s.invuln > 0 && s.phase === 'fly' && !REDUCED && Math.floor(t * 10) % 2 === 0;
    var flapping = s.phase === 'ready' ? Math.floor(t * 4) % 2 === 0 : s.flapT > 0.1;
    maya(ctx, BX, s.y, s.tilt, { wingDown: flapping, shield: s.shield, alpha: blink ? 0.45 : 1, dizzy: s.phase === 'bumped' || s.phase === 'over', t: t });
    weather(ctx, s.world, t);
    ctx.restore();
  }

  /* ===== Hazard Card pictures (354 by 196) ===== */
  function cardArt(ctx, id, t) {
    var w = 354, h = 196;
    ctx.save();
    ctx.fillStyle = '#ffe9d6'; ctx.fillRect(0, 0, w, h);
    var k = id.split('-')[0];
    function gnd(color) { ctx.fillStyle = color; ctx.fillRect(0, 170, w, 26); }
    switch (id) {
      case 'bagyo-debris':
        line(ctx, 40, 60, 90, 60, '#f2a56b', 4); line(ctx, 30, 80, 70, 80, '#f2a56b', 4); line(ctx, 48, 100, 84, 100, '#f2a56b', 4);
        ctx.save(); ctx.translate(150, 90); ctx.scale(1.8, 1.8); ctx.rotate(0.28); ctx.fillStyle = '#a9b4bc'; ctx.fill(path(SHEET)); ctx.strokeStyle = '#6f7b84'; ctx.lineWidth = 1.6; ctx.stroke(path(SHEET)); ctx.restore();
        break;
      case 'bagyo-signs': ctx.save(); ctx.translate(30, -20); billboard(ctx, 110, 170); ctx.restore(); branch(ctx, 50, 110); break;
      case 'bagyo-wires': gnd('#3f7a4f'); ctx.save(); ctx.translate(150, 0); ctx.scale(0.9, 0.9); post(ctx, 0, 60, 196, t); ctx.restore(); break;
      case 'baha-water':
        home(ctx, 120, 150, 1, false, t, 0);
        ctx.fillStyle = 'rgba(125,100,70,.92)'; ctx.fillRect(0, 128, w, 70);
        ctx.strokeStyle = '#a3865e'; ctx.lineWidth = 3; ctx.beginPath();
        for (var x = 0; x < w; x += 40) { ctx.moveTo(x, 134); ctx.quadraticCurveTo(x + 10, 126, x + 20, 134); }
        ctx.stroke();
        line(ctx, 30, 160, 80, 160, '#c9ad85', 3); line(ctx, 160, 176, 220, 176, '#c9ad85', 3);
        break;
      case 'baha-wires': ctx.fillStyle = '#7d6446'; ctx.fillRect(0, 150, w, 46); wires(ctx, 140, 120); break;
      case 'baha-debris': ctx.fillStyle = '#7d6446'; ctx.fillRect(0, 160, w, 36); pile(ctx, 140, 70, 190); break;
      case 'lindol-falling': gnd('#d9c089'); beam(ctx, 110, 110); fallingRock(ctx, 190, 70, 0.4); fallingRock(ctx, 60, 140, 1.1); break;
      case 'lindol-tsunami':
        ctx.fillStyle = '#2f86c4'; ctx.fillRect(0, 110, 200, 86);
        ctx.fillStyle = '#e6cf98'; ctx.fillRect(160, 120, w - 160, 76);
        ctx.beginPath(); ctx.moveTo(0, 110); ctx.quadraticCurveTo(60, 50, 120, 92); ctx.quadraticCurveTo(90, 86, 100, 110); ctx.closePath(); ctx.fillStyle = '#5aa7d8'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(280, 122); ctx.lineTo(330, 40); ctx.lineTo(354, 40); ctx.lineTo(354, 122); ctx.closePath(); ctx.fillStyle = '#78a978'; ctx.fill();
        line(ctx, 176, 178, 238, 156, '#1a8f4c', 4); line(ctx, 238, 156, 226, 152, '#1a8f4c', 4); line(ctx, 238, 156, 230, 166, '#1a8f4c', 4);
        break;
      case 'lindol-aftershock': gnd('#d9c089'); rubble(ctx, 120, 50, 176); rubble(ctx, 180, 90, 176); break;
      case 'bulkan-zone':
        ctx.beginPath(); ctx.moveTo(0, 196); ctx.lineTo(90, 70); ctx.lineTo(130, 70); ctx.lineTo(220, 196); ctx.closePath(); ctx.fillStyle = '#6b5548'; ctx.fill();
        circle(ctx, 110, 50, 22, 'rgba(110,104,100,.7)'); circle(ctx, 96, 26, 18, 'rgba(110,104,100,.6)');
        bomb(ctx, 190, 70, 0.5);
        break;
      case 'bulkan-ash': ash(ctx, 140, 140, t); ash(ctx, 60, 90, t); break;
      case 'bulkan-lahar':
        gnd('#8f8a84');
        ctx.beginPath(); ctx.moveTo(0, 130); ctx.quadraticCurveTo(120, 110, 240, 150); ctx.lineTo(240, 196); ctx.lineTo(0, 196); ctx.closePath(); ctx.fillStyle = '#7d6c58'; ctx.fill();
        rock(ctx, 60, 150, 10, 0.3, '#5a504b', '#352e2b'); rock(ctx, 150, 168, 13, 1, '#5a504b', '#352e2b');
        line(ctx, 20, 160, 60, 158, 'rgba(60,45,30,.55)', 3); line(ctx, 110, 176, 170, 178, 'rgba(60,45,30,.55)', 3);
        break;
    }
    maya(ctx, 272, 96, 0, { scale: 0.62, dizzy: true, t: t });
    ctx.restore();
    return k;
  }

  /* ===== How to play: small moving pictures (300 by 190) ===== */
  function slideArt(ctx, n, t) {
    var w = 300, h = 190;
    ctx.save();
    var g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8fd3f6'); g.addColorStop(1, '#c9ecfb');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#7cc47a'; ctx.fillRect(0, 164, w, 26);
    var y, up = Math.floor(t * 2) % 2 === 0;
    if (n === 0) {
      y = 96 + Math.sin(t * 4) * 22;
      maya(ctx, 120, y, Math.cos(t * 4) * 0.3, { scale: 0.62, wingDown: Math.cos(t * 4) < 0 });
      var r = (t * 40) % 40;
      ctx.beginPath(); ctx.arc(226, 104, 10 + r, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(22,48,63,' + (1 - r / 40) + ')'; ctx.lineWidth = 3; ctx.stroke();
      circle(ctx, 226, 104, 9, '#16303f');
    } else if (n === 1) {
      ctx.save(); ctx.scale(0.6, 0.6); billboard(ctx, 230, 120); post(ctx, 230, 210, 274, t); ctx.restore();
      var px = 40 + ((t * 50) % 220);
      maya(ctx, px, 100 + Math.sin(px * 0.03) * 8, 0, { scale: 0.42, wingDown: up });
    } else if (n === 2) {
      home(ctx, 150, 164, 1, t % 3 > 1.5, t, 0);
      var py = 40 + Math.min(1, (t % 3) / 1.5) * 50;
      maya(ctx, 150, py, 0.3, { scale: 0.42, wingDown: up });
    } else if (n === 3) {
      bubble(ctx, 80, 90, 'flashlight', t); bubble(ctx, 150, 70, 'water', t); bubble(ctx, 220, 90, 'kit', t);
      maya(ctx, 150, 140, 0, { scale: 0.42, shield: true, wingDown: up });
    } else {
      rr(ctx, 70, 24, 160, 140, 16); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.save(); ctx.beginPath(); rr(ctx, 70, 24, 160, 70, 16); ctx.clip(); ctx.fillStyle = '#ffe9d6'; ctx.fillRect(70, 24, 160, 70); ctx.restore();
      maya(ctx, 150, 62, 0, { scale: 0.34, dizzy: true, t: t });
      rr(ctx, 84, 104, 92, 10, 5); ctx.fillStyle = '#f2760c'; ctx.fill();
      rr(ctx, 84, 122, 130, 8, 4); ctx.fillStyle = '#c5d2db'; ctx.fill(); rr(ctx, 84, 138, 110, 8, 4); ctx.fill();
    }
    ctx.restore();
  }

  root.LipadDraw = { PAL: PAL, scene: scene, cardArt: cardArt, slideArt: slideArt, maya: maya, itemIcon: itemIcon, reduced: REDUCED };
})(window);
