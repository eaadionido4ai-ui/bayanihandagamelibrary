// Lusot sa Usok: the pictures. The floor, the fire and smoke, the people and the player are drawn here on a canvas,
// in page pixels of the 844 by 390 stage, seen from above as in the Engaging mockup. The screens (app.js) say what
// to draw and where. Plain ES5.
(function (root) {
  'use strict';
  var L = root.LusotSaUsok, T = L.T, VW = 844, VH = 390;
  var REDUCED = false;
  try { REDUCED = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { REDUCED = false; }
  var CACHE = {};
  function path(d) { if (!CACHE[d]) CACHE[d] = new root.Path2D(d); return CACHE[d]; }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function circle(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
  function text(ctx, s, x, y, size, color, align) {
    ctx.font = '900 ' + size + "px 'Nunito', sans-serif"; ctx.fillStyle = color; ctx.textAlign = align || 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
  }
  function pill(ctx, s, x, y, bg, fg, size) {
    size = size || 9; ctx.font = '900 ' + size + "px 'Nunito', sans-serif";
    var w = ctx.measureText(s).width + 14;
    rr(ctx, x - w / 2, y - size - 3, w, size + 8, (size + 8) / 2); ctx.fillStyle = bg; ctx.fill();
    text(ctx, s, x, y + 1.5, size, fg);
  }
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* ===== Icons (24 by 24 line drawings from the mockup) ===== */
  var ICON = {
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
    phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
    ext: 'M9 8h6v12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zM12 8V5M10 5h5l3-2M9 11h6',
    hose: 'M3 12a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M7 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M17 12h3l2-2',
    food: 'M4 13a8 5 0 0 1 16 0v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM9 10.5c.5 1 .5 2 0 3M12 10c.5 1.2.5 2.4 0 3.6M15 10.5c.5 1 .5 2 0 3',
    cloth: 'M3 8c2-1.5 4 1.5 6 0s4 1.5 6 0v10c-2 1.5-4-1.5-6 0s-4-1.5-6 0zM19 3c1.2 1.6 2 2.7 2 3.6a2 2 0 0 1-4 0c0-.9.8-2 2-3.6z',
    drop: 'M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z'
  };
  function icon(ctx, name, x, y, size, color, width) {
    var k = size / 24;
    ctx.save(); ctx.translate(x - size / 2, y - size / 2); ctx.scale(k, k);
    if (name === 'kit') {
      rr(ctx, 3, 5, 18, 15, 3); ctx.fillStyle = '#1a8f4c'; ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(12, 9); ctx.lineTo(12, 16); ctx.moveTo(8.5, 12.5); ctx.lineTo(15.5, 12.5); ctx.stroke();
    } else {
      ctx.strokeStyle = color; ctx.lineWidth = width || 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(path(ICON[name]));
    }
    ctx.restore();
  }
  function badge(ctx, name, x, y, ring, color) {
    ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.strokeStyle = ring; ctx.lineWidth = 2.5; ctx.stroke();
    icon(ctx, name, x, y, 16, color || ring, 2.6);
  }

  /* ===== Sprites made once: a smoke puff, a fire glow, flames ===== */
  var SPR = null;
  function sprites() {
    if (SPR) return SPR;
    var doc = root.document, mk = function (w, h) { var c = doc.createElement('canvas'); c.width = w; c.height = h; return c; };
    var smoke = mk(96, 96), g = smoke.getContext('2d'), gr = g.createRadialGradient(48, 48, 4, 48, 48, 48);
    gr.addColorStop(0, 'rgba(96,106,114,0.9)'); gr.addColorStop(0.6, 'rgba(96,106,114,0.45)'); gr.addColorStop(1, 'rgba(96,106,114,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 96, 96);
    var glow = mk(128, 128); g = glow.getContext('2d'); gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,179,71,0.85)'); gr.addColorStop(0.55, 'rgba(255,106,0,0.32)'); gr.addColorStop(1, 'rgba(255,106,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    var flames = [], k;
    for (k = 0; k < 3; k++) {
      var f = mk(64, 80); g = f.getContext('2d');
      g.translate(32, 74); g.scale(1.55 + k * 0.12, 1.65 - k * 0.12);
      g.fillStyle = '#ff7a1a'; g.fill(new root.Path2D('M0 2C-12 2-15-8-10-17C-6-24 0-26-1-36C6-30 10-23 9-15C12-17 13-21 12-25C17-18 16-6 11-1C8 1 4 2 0 2Z'));
      g.fillStyle = '#ffc53d'; g.fill(new root.Path2D('M0 0C-7 0-9-6-6-11C-4-15-1-16-1-22C4-18 6-13 5-8C7-9 8-12 7-14C10-9 9-3 6-1C4 0 2 0 0 0Z'));
      g.fillStyle = '#fff1a8'; g.fill(new root.Path2D('M0-1C-3-1-4-4-2-7C-1-9 0-10 0-13C2-10 3-7 2-5C3-6 3-7 3-8C5-5 4-2 2-1Z'));
      flames.push(f);
    }
    SPR = { smoke: smoke, glow: glow, flames: flames };
    return SPR;
  }

  /* ===== The floor plan ===== */
  var FLOOR = { '.': '#d5dbe0', c: '#e9dfca', l: '#e2c99c', k: '#ead3c3', m: '#d9dee8', n: '#d8eee3', f: '#d6e6f2', w: '#d3e6ee', s: '#cdd3d9', r: '#e6dccb' };
  var LINE = { '.': '#c6ced5', c: '#d8cbb0', l: '#cfb281', k: '#dcc2b0', m: '#c8cfdb', n: '#c3e0d0', f: '#c3d7e6', w: '#bcd7e3', s: '#bcc3ca', r: '#d6c9b3' };
  function floorTile(ctx, ch, x, y, tx, ty) {
    ctx.fillStyle = FLOOR[ch] || '#d5dbe0'; ctx.fillRect(x, y, T, T);
    ctx.fillStyle = LINE[ch] || '#c6ced5';
    if (ch === 'l') { ctx.fillRect(x, y + 10, T, 1); ctx.fillRect(x, y + 21, T, 1); ctx.fillRect(x + ((tx * 13 + ty * 7) % 3) * 10 + 6, y, 1, 10); }
    else { ctx.fillRect(x, y, T, 1); ctx.fillRect(x, y, 1, T); }
  }
  function furniture(ctx, ch, x, y, s, tx, ty) {
    if (ch === 't') {
      var elec = s.elec[ty * s.w + tx];
      rr(ctx, x + 2, y + 6, T - 4, T - 12, 3); ctx.fillStyle = elec ? '#9aa6b2' : '#c99b6d'; ctx.fill();
      if (elec) { rr(ctx, x + 8, y + 9, 16, 10, 2); ctx.fillStyle = '#2f3b46'; ctx.fill(); ctx.fillStyle = '#5fd0ff'; ctx.fillRect(x + 10, y + 11, 12, 6); }
      else { ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x + 4, y + 8, T - 8, 3); }
    } else if (ch === 'b') {
      ctx.fillStyle = '#7a4f2a'; ctx.fillRect(x, y + 3, T, T - 6);
      var cols = ['#c0322b', '#2f6f8f', '#e0a400', '#1a8f4c', '#6b4f9a'];
      for (var k = 0; k < 6; k++) { ctx.fillStyle = cols[(tx + k) % 5]; ctx.fillRect(x + 2 + k * 5, y + 6, 4, T - 12); }
    } else if (ch === '=') {
      ctx.fillStyle = s.elec[ty * s.w + tx] ? '#9aa6b2' : '#9aa3ab'; ctx.fillRect(x, y + 4, T, T - 8);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(x, y + 4, T, 3);
    } else if (ch === 'z') {
      rr(ctx, x + 1, y + 3, T - 2, T - 6, 5); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#b9c7cf'; ctx.lineWidth = 2; ctx.stroke();
      rr(ctx, x + 4, y + 7, 9, T - 14, 3); ctx.fillStyle = '#dbe8f2'; ctx.fill();
    } else if (ch === 'u') {
      rr(ctx, x + 3, y + 5, T - 6, T - 10, 6); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#9fb6c6'; ctx.lineWidth = 2; ctx.stroke();
      circle(ctx, x + T / 2, y + T / 2 + 1, 6, '#bfe3f5');
    }
  }
  function clutter(ctx, x, y, tx) {
    for (var k = 0; k < 3; k++) { rr(ctx, x + 4 + k * 3, y + 4 + k * 4, 18, 14, 3); ctx.fillStyle = ['#2f6f8f', '#3c80a3', '#4c90b3'][k]; ctx.fill(); }
  }
  // which way a door's wall runs, from the tiles beside it
  function across(s, tx, ty) { return L.solid(s, tx - 1, ty) && L.solid(s, tx + 1, ty); }
  function door(ctx, s, ch, x, y, tx, ty, t) {
    var horiz = across(s, tx, ty), d = s.doors[ty * s.w + tx];
    ctx.fillStyle = FLOOR[s.floorOf[ty * s.w + tx]] || '#d5dbe0'; ctx.fillRect(x, y, T, T);
    if (ch === 'D') {
      ctx.fillStyle = d && d.felt && d.hot ? '#b04a2a' : '#8a5a2b';
      if (horiz) ctx.fillRect(x, y + 11, T, 10); else ctx.fillRect(x + 11, y, 10, T);
      ctx.fillStyle = '#ffd873';
      if (horiz) circle(ctx, x + T - 8, y + 16, 2.2, '#ffd873'); else circle(ctx, x + 16, y + T - 8, 2.2, '#ffd873');
      if (d && d.felt && d.hot) {
        ctx.save(); ctx.globalAlpha = REDUCED ? 0.4 : 0.3 + 0.2 * Math.sin(t * 6); rr(ctx, x - 6, y - 6, T + 12, T + 12, 10); ctx.fillStyle = '#ff3b1f'; ctx.fill(); ctx.restore();
        pill(ctx, 'HOT DOOR', x + T / 2, y - 6, '#ffffff', '#b3261e', 9.5);
      }
    } else {
      ctx.fillStyle = '#8a5a2b';
      if (horiz) ctx.fillRect(x - 1, y + 2, 7, T - 4); else ctx.fillRect(x + 2, y - 1, T - 4, 7);
    }
  }
  function stationArt(ctx, ch, x, y, s, tx, ty) {
    // a station faces the corridor where there is one, otherwise the open side
    var up = s.floorOf[(ty - 1) * s.w + tx], dn = s.floorOf[(ty + 1) * s.w + tx];
    var cx = x + T / 2, cy = y + T / 2, below = dn === '.' ? true : up === '.' ? false : !L.solid(s, tx, ty + 1), lab = below ? y + T + 16 : y - 6;
    if (ch === 'A') { ctx.fillStyle = '#e2382b'; rr(ctx, x + 6, y + (below ? 18 : 4), 20, 10, 2); ctx.fill(); badge(ctx, 'bell', cx, below ? y + T + 2 : y - 2, '#e2382b', '#c0322b'); pill(ctx, s.alarm >= 0 ? 'RINGING' : 'ALARM', cx, below ? y + T + 30 : y - 20, '#e2382b', '#ffffff', 9.5); }
    else if (ch === 'X') { badge(ctx, 'ext', cx, below ? y + T + 2 : y - 2, '#c0322b', '#c0322b'); pill(ctx, 'EXTINGUISHER', cx, below ? y + T + 28 : y - 18, '#22303d', '#ffffff', 8.5); }
    else if (ch === 'H') { badge(ctx, 'hose', cx, below ? y + T + 2 : y - 2, '#1b5fa8', '#1b5fa8'); pill(ctx, 'FIRE HOSE', cx, below ? y + T + 28 : y - 18, '#1b5fa8', '#ffffff', 8.5); }
    else if (ch === 'P') { rr(ctx, x + 2, y + 4, T - 4, T - 8, 3); ctx.fillStyle = '#c99b6d'; ctx.fill(); badge(ctx, 'phone', cx, cy, '#1b5fa8', '#1b5fa8'); pill(ctx, s.call >= 0 ? 'CALLED' : '911', cx, y + T + 12, '#22303d', '#ffffff', 8.5); }
    return lab;
  }
  function exitSign(ctx, ch, x, y, s, tx, ty) {
    ctx.fillStyle = '#1a8f4c'; ctx.fillRect(x, y, T, T);
    var label = ch === 'E' ? 'EXIT' : 'STAIRS', bx = x + T / 2, by = y + T / 2;
    if (tx >= s.w - 1) bx = x - 6; else if (tx <= 0) bx = x + T + 6; else if (ty >= s.h - 1) by = y - 8; else by = y + T + 8;
    ctx.font = "900 10.5px 'Nunito', sans-serif";
    var w = ctx.measureText(label).width + 26;
    rr(ctx, bx - w / 2, by - 9, w, 18, 5); ctx.fillStyle = '#1a8f4c'; ctx.fill();
    text(ctx, label, bx - 5, by + 4, 10.5, '#ffffff');
    ctx.beginPath(); ctx.moveTo(bx + w / 2 - 12, by - 4); ctx.lineTo(bx + w / 2 - 7, by); ctx.lineTo(bx + w / 2 - 12, by + 4);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }

  /* ===== People ===== */
  var SHIRT = ['#8e6cf0', '#2fb879', '#4aa3df', '#e98bbd', '#ffb347', '#5bc0be'];
  function person(ctx, x, y, k, crawl, t) {
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); ctx.ellipse(2, 4, 12, 9, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fill();
    if (crawl) { ctx.beginPath(); ctx.ellipse(0, 0, 12, 7.5, 0, 0, Math.PI * 2); ctx.fillStyle = SHIRT[k % 6]; ctx.fill(); circle(ctx, 8, 0, 5, '#2b1d16'); }
    else { circle(ctx, 0, 0, 10, SHIRT[k % 6]); circle(ctx, 0, 0, 5.5, '#2b1d16'); }
    ctx.restore();
  }
  function bubble(ctx, s, x, y, warn) {
    ctx.font = "900 11px 'Nunito', sans-serif";
    var w = ctx.measureText(s).width + 16;
    rr(ctx, x - w / 2, y - 12, w, 20, 8); ctx.fillStyle = warn ? '#ffd34d' : '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 4, y + 8); ctx.lineTo(x, y + 14); ctx.lineTo(x + 4, y + 8); ctx.fill();
    text(ctx, s, x, y + 2.5, 11, '#16303f');
  }
  function hero(ctx, p, t) {
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.beginPath(); ctx.ellipse(2, 5, 16, 12, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fill();
    var a = p.face;
    if (p.roll > 0) a += (1.2 - p.roll) * 14;
    ctx.rotate(a);
    if (p.crawl) ctx.scale(1.18, 0.78);
    circle(ctx, 0, 0, 13, '#f2760c');
    ctx.fillStyle = '#ffe066'; ctx.fillRect(-11, -6.5, 22, 3);
    if (!p.hose) { rr(ctx, 9, 3, 15, 9, 3); ctx.fillStyle = '#c0322b'; ctx.fill(); }
    else { rr(ctx, 9, 3, 14, 7, 3); ctx.fillStyle = '#1b5fa8'; ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 0, 7.5, 0, Math.PI * 2); ctx.fillStyle = '#ffc53d'; ctx.fill(); ctx.strokeStyle = '#eaa100'; ctx.lineWidth = 2; ctx.stroke();
    if (p.clothOn && p.cloth > 0) { ctx.fillStyle = '#3ad6c8'; ctx.fillRect(4, -5, 5, 10); }
    ctx.restore();
    if (p.onFire && p.roll <= 0) {
      var sp = sprites();
      for (var k = 0; k < 3; k++) ctx.drawImage(sp.flames[k], p.x - 16 + k * 10, p.y - 30 + (REDUCED ? 0 : Math.sin(t * 12 + k) * 3), 22, 28);
    }
  }
  function firefighter(ctx, x, y, a) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    circle(ctx, 0, 0, 12, '#3d3a38'); ctx.fillStyle = '#ffe066'; ctx.fillRect(-10, -5, 20, 3); ctx.fillRect(-10, 3, 20, 3);
    circle(ctx, 0, 0, 7.5, '#c0322b'); ctx.restore();
  }

  /* ===== One frame of play ===== */
  // where the camera looks: the player in the middle, kept inside the map
  function camera(s) {
    var p = s.player, mw = s.w * T, mh = s.h * T;
    return { x: Math.max(-40, Math.min(mw - VW + 40, p.x - VW / 2)), y: Math.max(-40, Math.min(mh - VH + 40, p.y - VH / 2)) };
  }
  function scene(ctx, s, t, o) {
    o = o || {};
    var cam = camera(s), sp = sprites(), w = s.w, x0 = Math.max(0, Math.floor(cam.x / T)), x1 = Math.min(w - 1, Math.floor((cam.x + VW) / T));
    var y0 = Math.max(0, Math.floor(cam.y / T)), y1 = Math.min(s.h - 1, Math.floor((cam.y + VH) / T)), tx, ty, i, ch, X, Y, f, k;
    ctx.save();
    ctx.fillStyle = '#1a2834'; ctx.fillRect(0, 0, VW, VH);
    ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
    var later = [];
    for (ty = y0; ty <= y1; ty++) for (tx = x0; tx <= x1; tx++) {
      i = ty * w + tx; ch = s.grid[ty][tx]; X = tx * T; Y = ty * T;
      if (ch === '#') { ctx.fillStyle = '#22303d'; ctx.fillRect(X, Y, T, T); continue; }
      if (ch === 'D' || ch === 'd') { if (s.doors[i]) { door(ctx, s, ch, X, Y, tx, ty, t); continue; } }
      if (ch === 'E' || ch === 'S') { later.push([ch, X, Y, tx, ty, 'exit']); continue; }
      if (ch === 'A' || ch === 'X' || ch === 'H') { ctx.fillStyle = '#22303d'; ctx.fillRect(X, Y, T, T); later.push([ch, X, Y, tx, ty, 'station']); continue; }
      floorTile(ctx, s.floorOf[i], X, Y, tx, ty);
      if (s.burnt[i]) { ctx.fillStyle = 'rgba(45,32,25,.55)'; ctx.fillRect(X, Y, T, T); }
      if (s.clutter[i] && !s.burnt[i]) clutter(ctx, X, Y, tx);
      if (ch === 'P') later.push([ch, X, Y, tx, ty, 'station']);
      else if (ch !== '.' && !L.FLOOR[ch]) furniture(ctx, ch, X, Y, s, tx, ty);
    }
    // room names
    var rooms = s.spec.rooms;
    for (k = 0; k < rooms.length; k++) {
      var rm = rooms[k]; if (!rm[5]) continue;
      var rx = Math.min(rm[1], rm[3]) * T + 8, ry = Math.max(rm[2], rm[4]) * T + T - 8;
      if (rx > cam.x - 200 && rx < cam.x + VW && ry > cam.y && ry < cam.y + VH + 20) {
        ctx.font = "900 9px 'Nunito', sans-serif"; ctx.fillStyle = 'rgba(60,50,35,.75)'; ctx.textAlign = 'left'; ctx.fillText(rm[5], rx, ry);
      }
    }
    // things to pick up
    for (k = 0; k < s.items.length; k++) { var it = s.items[k]; if (!it.got) badge(ctx, it.kind === 'kit' ? 'kit' : 'food', (it.x + 0.5) * T, (it.y + 0.5) * T, it.kind === 'kit' ? '#1a8f4c' : '#b07a2a', '#8a5a14'); }
    // fire: the glow first, then the flames
    var fx = [];
    for (ty = y0; ty <= y1; ty++) for (tx = x0; tx <= x1; tx++) { i = ty * w + tx; f = s.fire[i]; if (f > 0.03) fx.push(i); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (k = 0; k < fx.length; k++) { i = fx[k]; f = s.fire[i]; X = (i % w) * T + T / 2; Y = Math.floor(i / w) * T + T / 2; var gs = 40 + f * 60; ctx.globalAlpha = 0.35 + f * 0.4; ctx.drawImage(sp.glow, X - gs / 2, Y - gs / 2, gs, gs); }
    ctx.restore();
    for (k = 0; k < fx.length; k++) {
      i = fx[k]; f = s.fire[i]; X = (i % w) * T + T / 2; Y = Math.floor(i / w) * T + T / 2;
      var fl = REDUCED ? 0 : Math.sin(t * 11 + i * 1.7) * 0.08, sz = 14 + f * 30 * (1 + fl);
      ctx.drawImage(sp.flames[(i + Math.floor(t * 6)) % 3], X - sz * 0.42, Y + 8 - sz, sz * 0.84, sz * 1.05);
      if (s.elec[i] && f > 0.1 && (REDUCED || Math.floor(t * 8 + i) % 3 === 0)) {
        ctx.beginPath(); ctx.moveTo(X - 6, Y - 10); ctx.lineTo(X, Y - 4); ctx.lineTo(X - 3, Y); ctx.lineTo(X + 5, Y + 6);
        ctx.strokeStyle = '#7fd3ff'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.stroke();
      }
    }
    // stations, exits and labels go above the floor and the fire
    for (k = 0; k < later.length; k++) {
      var L2 = later[k];
      if (L2[5] === 'exit') exitSign(ctx, L2[0], L2[1], L2[2], s, L2[3], L2[4]);
      else stationArt(ctx, L2[0], L2[1], L2[2], s, L2[3], L2[4]);
    }
    // smoke
    for (ty = y0; ty <= y1; ty++) for (tx = x0; tx <= x1; tx++) {
      i = ty * w + tx; f = s.smoke[i]; if (f < 0.06) continue;
      ctx.globalAlpha = Math.min(0.85, f * 0.9); ctx.drawImage(sp.smoke, tx * T + T / 2 - 34 + (REDUCED ? 0 : Math.sin(t * 0.8 + i) * 4), ty * T + T / 2 - 34, 68, 68);
    }
    ctx.globalAlpha = 1;
    // the hose from its cabinet
    var p = s.player;
    if (p.hose) {
      ctx.beginPath(); ctx.moveTo(p.hose.x, p.hose.y); ctx.quadraticCurveTo((p.hose.x + p.x) / 2, Math.max(p.hose.y, p.y) + 18, p.x, p.y);
      ctx.strokeStyle = '#d7d2c4'; ctx.lineWidth = 4; ctx.stroke();
      ctx.beginPath(); ctx.arc(p.hose.x, p.hose.y, L.LEVELS[s.level].hoseReach * T, 0, Math.PI * 2);
      ctx.setLineDash([7, 7]); ctx.strokeStyle = 'rgba(156,201,245,.8)'; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
    }
    // the people
    for (k = 0; k < s.people.length; k++) {
      var q = s.people[k];
      if (q.state === 'out' || q.state === 'rescue') continue;
      person(ctx, q.x, q.y, q.id, q.crawl, t);
      if (q.state === 'wait' && q.calling) bubble(ctx, 'Tulong!', q.x, q.y - 26, false);
      else if (q.state === 'panic') bubble(ctx, 'Takot ako!', q.x, q.y - 26, true);
    }
    // the spray
    if (p.spraying) {
      var range = (p.hose ? 4.3 : 3.2) * T, cone = p.hose ? 0.6 : 0.5, ca = Math.cos(p.face), sa = Math.sin(p.face);
      var nx = p.x + ca * 22 - sa * 6, ny = p.y + sa * 22 + ca * 6;
      ctx.beginPath(); ctx.moveTo(nx, ny);
      ctx.lineTo(nx + Math.cos(p.face - cone * 0.5) * range * 0.8, ny + Math.sin(p.face - cone * 0.5) * range * 0.8);
      ctx.lineTo(nx + Math.cos(p.face + cone * 0.5) * range * 0.8, ny + Math.sin(p.face + cone * 0.5) * range * 0.8);
      ctx.closePath(); ctx.fillStyle = p.hose ? 'rgba(95,176,255,.45)' : 'rgba(207,233,255,.75)'; ctx.fill();
      for (k = 0; k < 10; k++) {
        var r1 = hash(k + Math.floor(t * 20)), r2 = hash(k * 3 + Math.floor(t * 20)), dd = 10 + r1 * range * 0.85, aa = p.face + (r2 - 0.5) * cone;
        circle(ctx, nx + Math.cos(aa) * dd, ny + Math.sin(aa) * dd, 2 + r2 * 2.5, p.hose ? 'rgba(220,240,255,.9)' : 'rgba(255,255,255,.9)');
      }
    }
    hero(ctx, p, t);
    // the firefighters
    if (s.ff) {
      var ex = (s.ff.x + 0.5) * T, ey = (s.ff.y + 0.5) * T, dir = s.ff.x <= 0 ? 0 : Math.PI;
      firefighter(ctx, ex + Math.cos(dir) * 26, ey - 14, dir); firefighter(ctx, ex + Math.cos(dir) * 30, ey + 16, dir);
      ctx.beginPath(); ctx.moveTo(ex + Math.cos(dir) * 40, ey); ctx.lineTo(ex + Math.cos(dir) * (40 + Math.min(220, s.ff.r * T)), ey + (REDUCED ? 0 : Math.sin(t * 3) * 10));
      ctx.strokeStyle = 'rgba(95,176,255,.6)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.restore();
    // where to go next: a ring when it is on screen, an arrow at the edge when it is not
    if (o.goal) pointer(ctx, o.goal, cam, t);
    if (p.health < 30 && s.phase === 'play') {
      var v = ctx.createRadialGradient(VW / 2, VH / 2, 150, VW / 2, VH / 2, 470);
      v.addColorStop(0, 'rgba(192,50,43,0)'); v.addColorStop(1, 'rgba(192,50,43,' + (0.25 + (REDUCED ? 0 : 0.12 * Math.sin(t * 5))) + ')');
      ctx.fillStyle = v; ctx.fillRect(0, 0, VW, VH);
    }
  }
  function pointer(ctx, g, cam, t) {
    var gx = (g.x + 0.5) * T - cam.x, gy = (g.y + 0.5) * T - cam.y, pad = 54;
    if (gx > 30 && gx < VW - 30 && gy > 30 && gy < VH - 30) {
      ctx.beginPath(); ctx.arc(gx, gy, 20 + (REDUCED ? 0 : Math.sin(t * 5) * 4), 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd873'; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]);
      return;
    }
    var cx = VW / 2, cy = VH / 2, a = Math.atan2(gy - cy, gx - cx), ex = cx + Math.cos(a) * 1000, ey = cy + Math.sin(a) * 1000;
    var k = Math.min(Math.abs((VW / 2 - pad) / (ex - cx || 1e-6)), Math.abs((VH / 2 - pad) / (ey - cy || 1e-6)));
    var px = cx + (ex - cx) * k, py = cy + (ey - cy) * k;
    ctx.save(); ctx.translate(px, py); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-8, -12); ctx.lineTo(-3, 0); ctx.lineTo(-8, 12); ctx.closePath();
    ctx.fillStyle = '#ffd873'; ctx.fill(); ctx.strokeStyle = '#3b2a00'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  /* ===== The radar ===== */
  function radar(ctx, s, W, H, t) {
    var k = Math.min((W - 8) / (s.w * T), (H - 8) / (s.h * T)), ox = (W - s.w * T * k) / 2, oy = (H - s.h * T * k) / 2, tx, ty, i, c = T * k;
    ctx.fillStyle = 'rgba(6,28,21,1)'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(62,227,155,.18)'; ctx.lineWidth = 1; ctx.beginPath();
    for (var g = 0; g < W; g += W / 4) { ctx.moveTo(g, 0); ctx.lineTo(g, H); }
    for (g = 0; g < H; g += H / 4) { ctx.moveTo(0, g); ctx.lineTo(W, g); }
    ctx.stroke();
    for (ty = 0; ty < s.h; ty++) for (tx = 0; tx < s.w; tx++) {
      i = ty * s.w + tx; var ch = s.grid[ty][tx];
      if (ch === '#') { ctx.fillStyle = 'rgba(127,232,184,.55)'; ctx.fillRect(ox + tx * c, oy + ty * c, c, c); }
      else if (ch === 'E' || ch === 'S') { ctx.fillStyle = '#7ee2a8'; ctx.fillRect(ox + tx * c - 1, oy + ty * c - 1, c + 2, c + 2); }
      if (s.fire[i] > 0.1) { ctx.fillStyle = 'rgba(255,90,60,' + (0.4 + s.fire[i] * 0.6) + ')'; ctx.fillRect(ox + tx * c, oy + ty * c, c, c); }
      else if (s.smoke[i] > 0.3) { ctx.fillStyle = 'rgba(154,167,176,' + (s.smoke[i] * 0.5) + ')'; ctx.fillRect(ox + tx * c, oy + ty * c, c, c); }
    }
    var p = s.player;
    for (i = 0; i < s.people.length; i++) {
      var q = s.people[i];
      if (q.state === 'out' || q.state === 'rescue') continue;
      var seen = q.state !== 'wait' || s.alarm >= 0 || Math.abs(q.x - p.x) + Math.abs(q.y - p.y) < 10 * T;
      if (!seen) continue;
      circle(ctx, ox + q.x * k, oy + q.y * k, q.state === 'follow' ? 2.2 : 2.6, q.state === 'follow' ? '#7ee2a8' : '#ffd34d');
    }
    circle(ctx, ox + p.x * k, oy + p.y * k, 3.4, '#5fd0ff');
    ctx.beginPath(); ctx.arc(ox + p.x * k, oy + p.y * k, 3.4, 0, Math.PI * 2); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke();
  }

  /* ===== How to play: small pictures (330 by 200) ===== */
  function slide(ctx, n, t) {
    var W = 330, H = 200, sp = sprites(), k;
    ctx.save();
    ctx.fillStyle = '#e9dfca'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#d8cbb0'; for (k = 0; k < W; k += 22) ctx.fillRect(k, 0, 1, H); for (k = 0; k < H; k += 22) ctx.fillRect(0, k, W, 1);
    function wall(x, y, w, h) { ctx.fillStyle = '#22303d'; ctx.fillRect(x, y, w, h); }
    function smokeAt(x, y, a) { ctx.globalAlpha = a; ctx.drawImage(sp.smoke, x - 40, y - 40, 80, 80); ctx.globalAlpha = 1; }
    function flame(x, y, sz) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(sp.glow, x - sz, y - sz, sz * 2, sz * 2); ctx.restore(); ctx.drawImage(sp.flames[Math.floor(t * 6) % 3], x - sz * 0.42, y + 8 - sz, sz * 0.84, sz * 1.05); }
    var P = { x: 0, y: 0, face: 0, crawl: false, roll: 0, hose: null, clothOn: false, cloth: 0, onFire: false };
    if (n === 0) {
      smokeAt(220, 50, 0.8); smokeAt(270, 60, 0.8); smokeAt(170, 40, 0.6);
      P.x = 60 + ((t * 40) % 220); P.y = 140; P.crawl = Math.floor(t / 2) % 2 === 1;
      hero(ctx, P, t);
      text(ctx, P.crawl ? 'Crawling: cleaner air near the floor' : 'Walking', W / 2, 190, 11, '#16303f');
    } else if (n === 1) {
      badge(ctx, 'bell', 70, 60, '#e2382b', '#c0322b'); pill(ctx, 'ALARM', 70, 92, '#e2382b', '#ffffff', 9);
      badge(ctx, 'phone', 160, 60, '#1b5fa8', '#1b5fa8'); pill(ctx, '911', 160, 92, '#22303d', '#ffffff', 9);
      person(ctx, 230, 140, 0, false, t); person(ctx, 255, 140, 1, false, t); P.x = 205; P.y = 140; hero(ctx, P, t);
      ctx.fillStyle = '#1a8f4c'; ctx.fillRect(296, 44, 30, 34); text(ctx, 'EXIT', 311, 66, 10, '#ffffff');
    } else if (n === 2) {
      flame(230, 110, 26); P.x = 120; P.y = 110; P.face = 0;
      var on = Math.floor(t * 1.6) % 2 === 0;
      if (on) { ctx.beginPath(); ctx.moveTo(142, 116); ctx.lineTo(225, 96); ctx.lineTo(225, 132); ctx.closePath(); ctx.fillStyle = 'rgba(207,233,255,.8)'; ctx.fill(); }
      hero(ctx, P, t);
      text(ctx, on ? 'Short burst at the base' : 'Then stop and look', W / 2, 186, 11, '#16303f');
    } else if (n === 3) {
      for (k = 0; k < 6; k++) flame(170 + (k % 3) * 40, 70 + Math.floor(k / 3) * 50, 30);
      badge(ctx, 'hose', 60, 50, '#1b5fa8', '#1b5fa8'); badge(ctx, 'phone', 60, 100, '#1b5fa8', '#1b5fa8');
      ctx.fillStyle = '#1a8f4c'; ctx.fillRect(48, 136, 24, 24);
      text(ctx, 'Too big? Hose, firefighters or another way', W / 2, 190, 11, '#16303f');
    } else if (n === 4) {
      wall(150, 0, 30, 200); ctx.fillStyle = '#b04a2a'; ctx.fillRect(160, 80, 10, 40);
      flame(250, 100, 30); smokeAt(240, 60, 0.7);
      P.x = 120; P.y = 100; hero(ctx, P, t);
      pill(ctx, 'HOT DOOR', 165, 70, '#ffffff', '#b3261e', 9.5);
      text(ctx, 'Feel it first. Hot means find another way.', W / 2, 190, 11, '#16303f');
    } else {
      P.x = 165; P.y = 100; P.roll = 1.2 - ((t * 0.8) % 1.2); hero(ctx, P, t);
      badge(ctx, 'kit', 60, 60, '#1a8f4c', '#1a8f4c'); badge(ctx, 'cloth', 60, 140, '#0f7a8a', '#0f7a8a'); badge(ctx, 'food', 270, 60, '#b07a2a', '#8a5a14');
      text(ctx, 'Clothes on fire? Stop, drop and roll.', W / 2, 190, 11, '#16303f');
    }
    ctx.restore();
  }

  root.LusotDraw = { scene: scene, radar: radar, slide: slide, camera: camera, reduced: REDUCED };
})(window);
