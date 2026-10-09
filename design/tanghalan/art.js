// Sample "learner artworks" for the TANGHALAN mockup, drawn in crayon style on canvas.
// Deterministic (seeded), so every render of the mockup shows the same pictures.
(function () {
  'use strict';

  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0; let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const C = {
    red: '#e2382b', orange: '#f2760c', yellow: '#ffc928', gold: '#f2a900', green: '#2f9e4f', lime: '#86c440',
    blue: '#2f74d0', sky: '#79c3ef', navy: '#27408b', purple: '#7a53c6', pink: '#f07aa6', brown: '#8a5a2b',
    tan: '#d9a35f', skin: '#c98b5a', skin2: '#dfa678', black: '#2b2b2b', gray: '#8d949a', lgray: '#c4c9cd',
    straw: '#c48a32', bamboo: '#e3bf68', white: '#ffffff', teal: '#1f8f8f', pencil: '#5b6066'
  };

  function Pad(canvas, seed) {
    this.cv = canvas; this.c = canvas.getContext('2d'); this.W = canvas.width; this.H = canvas.height; this.r = rng(seed);
  }
  const P = Pad.prototype;
  P.j = function (a) { return (this.r() - 0.5) * 2 * a; };

  P.paper = function (tint) {
    const c = this.c; c.fillStyle = tint || '#fbf8f0'; c.fillRect(0, 0, this.W, this.H);
    c.save(); c.globalAlpha = 0.05; c.fillStyle = '#8a7a5a';
    for (let i = 0; i < this.W * this.H / 140; i++) c.fillRect(this.r() * this.W, this.r() * this.H, 1 + this.r() * 2, 1);
    c.restore();
  };

  // wobbly crayon line: a few passes with jitter
  P.line = function (pts, color, w, o) {
    o = o || {}; const c = this.c, passes = o.passes || 3, jit = o.jit != null ? o.jit : Math.max(0.8, w * 0.2);
    c.save(); c.strokeStyle = color; c.lineCap = 'round'; c.lineJoin = 'round';
    for (let k = 0; k < passes; k++) {
      c.globalAlpha = o.alpha != null ? o.alpha : 0.62;
      c.lineWidth = w * (0.6 + this.r() * 0.5);
      c.beginPath();
      let started = false;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 9));
        for (let s = started ? 1 : 0; s <= n; s++) {
          const t = s / n, x = a[0] + (b[0] - a[0]) * t + this.j(jit), y = a[1] + (b[1] - a[1]) * t + this.j(jit);
          if (!started) { c.moveTo(x, y); started = true; } else c.lineTo(x, y);
        }
      }
      c.stroke();
    }
    c.restore();
  };

  // back-and-forth scribble fill, clipped to the shape
  P.fill = function (sh, color, o) {
    o = o || {}; const c = this.c, b = sh.box, gap = o.gap || 6, w = o.w || 9;
    const base = o.angle != null ? o.angle : -0.6 + this.j(0.25);
    c.save(); c.clip(sh.path); c.strokeStyle = color; c.lineCap = 'round'; c.lineJoin = 'round';
    const cx = b[0] + b[2] / 2, cy = b[1] + b[3] / 2, R = Math.hypot(b[2], b[3]) / 2 + w;
    const passes = o.passes || 2;
    for (let pass = 0; pass < passes; pass++) {
      const ang = base + pass * 0.45, ca = Math.cos(ang), sa = Math.sin(ang);
      c.globalAlpha = (o.alpha != null ? o.alpha : 0.72) * (pass ? 0.55 : 1);
      c.lineWidth = w;
      c.beginPath();
      let side = 1, first = true;
      for (let d = -R + this.r() * gap; d <= R; d += gap * (0.8 + this.r() * 0.5)) {
        const px = cx - sa * d, py = cy + ca * d, ex = R * (0.95 + this.r() * 0.1);
        const x0 = px - ca * ex * side + this.j(2), y0 = py - sa * ex * side + this.j(2);
        const x1 = px + ca * ex * side + this.j(2), y1 = py + sa * ex * side + this.j(2);
        if (first) { c.moveTo(x0, y0); first = false; } else c.lineTo(x0, y0);
        c.lineTo(x1, y1); side = -side;
      }
      c.stroke();
    }
    c.restore();
  };

  P.shape = function (pts) {
    const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach(q => { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); });
    return { path: p, pts: pts.concat([pts[0]]), box: [x0, y0, x1 - x0, y1 - y0] };
  };
  P.poly = function (pts, wob) { wob = wob == null ? 3 : wob; return this.shape(pts.map(q => [q[0] + this.j(wob), q[1] + this.j(wob)])); };
  P.rect = function (x, y, w, h, wob) { return this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], wob); };
  P.oval = function (cx, cy, rx, ry, wob, a0, a1) {
    wob = wob == null ? Math.min(rx, ry) * 0.05 + 0.6 : wob; a0 = a0 || 0; a1 = a1 == null ? Math.PI * 2 : a1;
    const full = a1 - a0 >= Math.PI * 2 - 1e-6, n = Math.max(14, Math.round((rx + ry) / 5)), q = [];
    for (let i = 0; i < (full ? n : n + 1); i++) {
      const a = a0 + (a1 - a0) * i / n; q.push([cx + Math.cos(a) * rx + this.j(wob), cy + Math.sin(a) * ry + this.j(wob)]);
    }
    return this.shape(q);
  };
  P.draw = function (sh, fill, stroke, o) {
    o = o || {}; if (fill) this.fill(sh, fill, o); if (stroke) this.line(sh.pts, stroke, o.lw || 5, { passes: o.lp || 2 }); return sh;
  };

  // kid handwriting, letter by letter; color may be an array (rainbow letters)
  P.text = function (str, x, y, size, color, o) {
    o = o || {}; const c = this.c;
    c.save(); c.font = size + 'px ' + (o.font || '"Gochi Hand"'); c.textBaseline = 'middle';
    if (o.rot) { c.translate(x, y); c.rotate(o.rot); x = 0; y = 0; }
    const total = c.measureText(str).width * (o.spread || 1);
    let cx = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2, i = 0;
    for (const ch of str) {
      const wch = c.measureText(ch).width * (o.spread || 1);
      c.fillStyle = Array.isArray(color) ? color[i % color.length] : color;
      c.save(); c.translate(cx, y + this.j(size * (o.bounce != null ? o.bounce : 0.05))); c.rotate(this.j(o.tilt != null ? o.tilt : 0.08));
      for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.4 : 0.9; c.fillText(ch, this.j(1.1), this.j(1.1)); }
      c.restore(); cx += wch; if (ch !== ' ') i++;
    }
    c.restore();
  };

  // wax texture: little streaks where the paper shows through
  P.grain = function (amt) {
    const c = this.c, img = c.getImageData(0, 0, this.W, this.H), d = img.data, W = this.W, r = this.r;
    amt = amt == null ? 0.05 : amt;
    for (let p = 0; p < W * this.H; p++) {
      if (r() < amt) {
        const k = 0.3 + r() * 0.45, run = 1 + (r() * 4 | 0);
        for (let q = 0; q < run && (p + q) % W !== 0; q++) {
          const i = (p + q) * 4; d[i] += (252 - d[i]) * k; d[i + 1] += (249 - d[i + 1]) * k; d[i + 2] += (240 - d[i + 2]) * k;
        }
      }
    }
    c.putImageData(img, 0, 0);
  };

  // ---------- things children draw ----------
  P.sun = function (x, y, r, face) {
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2 + 0.2;
      this.line([[x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25], [x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75]], C.orange, r * 0.12);
    }
    this.draw(this.oval(x, y, r, r), C.yellow, C.orange, { w: 10, gap: 6, lw: 5 });
    if (face) {
      this.draw(this.oval(x - r * 0.33, y - r * 0.15, r * 0.08, r * 0.1), C.black, null, { w: 4, gap: 2 });
      this.draw(this.oval(x + r * 0.33, y - r * 0.15, r * 0.08, r * 0.1), C.black, null, { w: 4, gap: 2 });
      this.line(arc(x, y + r * 0.05, r * 0.42, 0.5, Math.PI - 0.5), C.black, 4);
    }
  };
  P.cloud = function (x, y, s, fill, line) {
    const parts = [[0, 0, 0.55, 0.38], [-0.45, 0.12, 0.38, 0.28], [0.48, 0.1, 0.4, 0.3], [0.1, -0.22, 0.4, 0.3]];
    parts.forEach(q => this.draw(this.oval(x + q[0] * s, y + q[1] * s, q[2] * s, q[3] * s), fill || '#ffffff', null, { w: 10, gap: 6 }));
    parts.forEach(q => this.line(this.oval(x + q[0] * s, y + q[1] * s, q[2] * s, q[3] * s, 1, Math.PI * 0.95, Math.PI * 2.05).pts.slice(0, -1), line || C.sky, 4, { passes: 2 }));
  };
  P.bird = function (x, y, s) { this.line([[x - s, y], [x - s * 0.5, y - s * 0.45], [x, y], [x + s * 0.5, y - s * 0.45], [x + s, y]], C.black, 3, { passes: 2 }); };
  P.tree = function (x, y, s, leaf) {
    this.draw(this.rect(x - s * 0.08, y - s * 0.55, s * 0.16, s * 0.55), C.brown, C.brown, { w: 7, gap: 4, lw: 3 });
    this.draw(this.oval(x, y - s * 0.78, s * 0.36, s * 0.34), leaf || C.green, '#1f7a38', { w: 10, gap: 6, lw: 4 });
  };
  P.palm = function (x, y, s) {
    const top = [x + s * 0.22, y - s];
    this.line([[x, y], [x + s * 0.06, y - s * 0.4], [x + s * 0.14, y - s * 0.75], top], C.brown, s * 0.09);
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI + i * (Math.PI / 5) + this.j(0.15), L = s * (0.45 + this.r() * 0.15);
      const mid = [top[0] + Math.cos(a) * L * 0.55, top[1] + Math.sin(a) * L * 0.55 - s * 0.08], end = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * 0.6 + s * 0.12];
      this.line([top, mid, end], C.green, s * 0.07);
    }
    this.draw(this.oval(top[0] - s * 0.05, top[1] + s * 0.06, s * 0.05, s * 0.05), C.brown, null, { w: 5, gap: 3 });
    this.draw(this.oval(top[0] + s * 0.06, top[1] + s * 0.07, s * 0.05, s * 0.05), C.brown, null, { w: 5, gap: 3 });
  };
  P.grass = function (y, color) {
    this.draw(this.rect(-10, y, this.W + 20, this.H - y + 10, 4), color || C.lime, null, { w: 12, gap: 8 });
    for (let x = 6; x < this.W; x += 22 + this.r() * 18) this.line([[x, y + 6], [x + 4, y - 10 - this.r() * 8], [x + 9, y + 6]], C.green, 3, { passes: 1 });
  };
  P.water = function (x, y, w, h, deep) {
    this.draw(this.rect(x, y, w, h, 4), deep || C.blue, null, { w: 12, gap: 8, alpha: 0.6 });
    for (let yy = y + 12; yy < y + h - 6; yy += 26) {
      const pts = []; for (let xx = x + 6; xx < x + w; xx += 10) pts.push([xx, yy + Math.sin(xx / 18 + yy) * 5]);
      this.line(pts, '#1b4f9c', 3, { passes: 1 });
    }
  };
  P.rain = function (x0, y0, x1, y1, n) {
    for (let i = 0; i < n; i++) {
      const x = x0 + this.r() * (x1 - x0), y = y0 + this.r() * (y1 - y0);
      this.line([[x, y], [x - 7, y + 20]], C.blue, 3, { passes: 1 });
    }
  };
  P.kubo = function (x, y, w, h) { // bahay kubo: x,y = floor center
    const wall = this.rect(x - w / 2, y - h, w, h, 3);
    this.draw(wall, C.bamboo, C.brown, { w: 9, gap: 5, lw: 4 });
    this.c.save(); this.c.clip(wall.path);
    for (let k = -h; k < w + h; k += 14) { this.line([[x - w / 2 + k, y - h], [x - w / 2 + k - h, y]], '#a8742c', 2, { passes: 1, alpha: 0.5 }); this.line([[x - w / 2 + k - h, y - h], [x - w / 2 + k, y]], '#a8742c', 2, { passes: 1, alpha: 0.5 }); }
    this.c.restore();
    this.draw(this.rect(x + w * 0.12, y - h * 0.72, w * 0.24, h * 0.36, 2), '#6b4a22', C.brown, { w: 6, gap: 4, lw: 3 });
    this.draw(this.rect(x - w * 0.36, y - h * 0.62, w * 0.2, h * 0.62, 2), '#8a5a2b', C.brown, { w: 6, gap: 4, lw: 3 });
    const roof = this.poly([[x - w * 0.68, y - h], [x, y - h - w * 0.62], [x + w * 0.68, y - h]], 3);
    this.draw(roof, C.straw, '#7a5218', { w: 9, gap: 5, lw: 5 });
    for (let k = -0.55; k <= 0.56; k += 0.11) this.line([[x + w * k * 0.35, y - h - w * 0.5], [x + w * k, y - h - 2]], '#8a6022', 2.5, { passes: 1 });
  };
  P.house = function (x, y, w, h, wall, roof) { // block house with a red roof
    this.draw(this.rect(x - w / 2, y - h, w, h, 3), wall || '#f6d36b', C.brown, { w: 9, gap: 5, lw: 4 });
    this.draw(this.poly([[x - w * 0.62, y - h], [x, y - h - w * 0.5], [x + w * 0.62, y - h]], 3), roof || C.red, '#9a2318', { w: 9, gap: 5, lw: 4 });
    this.draw(this.rect(x - w * 0.12, y - h * 0.55, w * 0.24, h * 0.55, 2), C.brown, '#5a3a1a', { w: 6, gap: 4, lw: 3 });
    this.draw(this.rect(x + w * 0.2, y - h * 0.8, w * 0.2, h * 0.24, 2), C.sky, C.navy, { w: 6, gap: 4, lw: 3 });
  };
  // a child figure: x,y = feet, s = height
  P.kid = function (x, y, s, shirt, o) {
    o = o || {}; const skin = o.skin || C.skin, pants = o.pants || C.navy, lw = Math.max(3, s * 0.04);
    const hy = y - s * 0.83, hr = s * 0.135, sy = y - s * 0.66, hip = y - s * 0.34;
    this.line([[x - s * 0.05, hip], [x - s * 0.08, y - s * 0.02]], pants, lw * 1.3);
    this.line([[x + s * 0.05, hip], [x + s * 0.08, y - s * 0.02]], pants, lw * 1.3);
    this.draw(this.oval(x - s * 0.1, y, s * 0.055, s * 0.028), C.black, null, { w: 4, gap: 3 });
    this.draw(this.oval(x + s * 0.1, y, s * 0.055, s * 0.028), C.black, null, { w: 4, gap: 3 });
    const arms = o.arms || 'down', A = {
      down: [[-0.09, 0.03, -0.2, 0.26], [0.09, 0.03, 0.2, 0.26]],
      up: [[-0.09, 0.03, -0.15, -0.3], [0.09, 0.03, 0.15, -0.3]],
      wave: [[-0.09, 0.03, -0.2, 0.26], [0.09, 0.03, 0.27, -0.2]],
      side: [[-0.09, 0.03, -0.3, 0.06], [0.09, 0.03, 0.3, 0.06]],
      hold: [[-0.09, 0.03, 0.02, 0.18], [0.09, 0.03, 0.2, 0.15]]
    }[arms];
    A.forEach(a => {
      this.line([[x + s * a[0], sy + s * a[1]], [x + s * a[2], sy + s * a[3]]], skin, lw);
      this.draw(this.oval(x + s * a[2], sy + s * a[3], s * 0.035, s * 0.035), skin, null, { w: 4, gap: 3 });
    });
    if (o.dress) this.draw(this.poly([[x - s * 0.06, sy - s * 0.03], [x + s * 0.06, sy - s * 0.03], [x + s * 0.17, hip + s * 0.07], [x - s * 0.17, hip + s * 0.07]], 2), shirt, shirt, { w: 7, gap: 4, lw: 3 });
    else this.draw(this.rect(x - s * 0.1, sy - s * 0.03, s * 0.2, hip - sy + s * 0.06, 2), shirt, shirt, { w: 7, gap: 4, lw: 3 });
    if (o.vest) this.draw(this.rect(x - s * 0.1, sy - s * 0.01, s * 0.2, s * 0.2, 2), C.orange, '#b84f00', { w: 6, gap: 4, lw: 2 });
    this.draw(this.oval(x, hy, hr, hr * 1.04), skin, '#7a4a28', { w: 6, gap: 4, lw: 3 });
    const hair = o.hair || C.black;
    if (o.hat) {
      this.draw(this.oval(x, hy - hr * 0.35, hr * 1.05, hr * 0.75, 1, Math.PI, Math.PI * 2), o.hat, '#b07a00', { w: 6, gap: 4, lw: 3 });
      this.line([[x - hr * 1.35, hy - hr * 0.32], [x + hr * 1.35, hy - hr * 0.32]], '#b07a00', lw * 0.9);
    } else {
      this.draw(this.oval(x, hy - hr * 0.25, hr * 1.04, hr * 0.85, 1, Math.PI * 1.02, Math.PI * 1.98), hair, null, { w: 6, gap: 3 });
      if (o.long) { this.line([[x - hr, hy - hr * 0.2], [x - hr * 1.1, hy + hr * 1.3]], hair, lw * 1.6); this.line([[x + hr, hy - hr * 0.2], [x + hr * 1.1, hy + hr * 1.3]], hair, lw * 1.6); }
    }
    this.draw(this.oval(x - hr * 0.38, hy + hr * 0.05, hr * 0.1, hr * 0.13), C.black, null, { w: 3, gap: 2 });
    this.draw(this.oval(x + hr * 0.38, hy + hr * 0.05, hr * 0.1, hr * 0.13), C.black, null, { w: 3, gap: 2 });
    this.line(arc(x, hy + hr * 0.2, hr * 0.42, 0.45, Math.PI - 0.45), '#7a2a1a', Math.max(2, lw * 0.6), { passes: 2 });
  };
  P.arrow = function (pts, color, w) {
    this.line(pts, color, w);
    const a = pts[pts.length - 1], b = pts[pts.length - 2], ang = Math.atan2(a[1] - b[1], a[0] - b[0]), L = w * 4;
    this.line([[a[0] - Math.cos(ang - 0.5) * L, a[1] - Math.sin(ang - 0.5) * L], a, [a[0] - Math.cos(ang + 0.5) * L, a[1] - Math.sin(ang + 0.5) * L]], color, w);
  };
  P.signature = function (str, x, y) { this.text(str, x, y, Math.round(this.H * 0.036), C.pencil, { font: '"Patrick Hand"', align: 'right', tilt: 0.03, bounce: 0.02 }); };

  function arc(cx, cy, r, a0, a1) { const q = []; for (let i = 0; i <= 10; i++) { const a = a0 + (a1 - a0) * i / 10; q.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return q; }

  // ---------- the works ----------
  const WORKS = {
    // Bayanihan: neighbours carry a house away from the riverbank
    bayanihan: { w: 1024, h: 768, seed: 11, draw(p) {
      const W = p.W, H = p.H;
      p.draw(p.rect(-10, -10, W + 20, 175, 6), C.sky, null, { w: 14, gap: 9, alpha: 0.65 });
      p.sun(70, 64, 60, true);
      p.cloud(880, 72, 70); p.cloud(700, 205, 58);
      p.bird(250, 175, 15); p.bird(290, 155, 12); p.bird(820, 190, 13);
      // hill with a safe spot on the right
      p.grass(585, C.lime);
      p.draw(p.oval(900, 650, 260, 175, 4, Math.PI, Math.PI * 2), C.green, '#1f7a38', { w: 12, gap: 7, lw: 5 });
      p.palm(1000, 500, 160);
      p.line([[850, 488], [850, 430]], C.brown, 7);
      p.draw(p.rect(782, 372, 136, 60, 3), C.white, C.navy, { w: 8, gap: 5, lw: 4 });
      p.text('LIGTAS', 850, 402, 40, C.navy);
      // river on the left
      p.draw(p.poly([[-10, 600], [120, 610], [205, 690], [250, 780], [-10, 780]], 4), C.blue, '#1b4f9c', { w: 12, gap: 8, lw: 4, alpha: 0.65 });
      for (let i = 0; i < 4; i++) p.line([[10 + i * 30, 650 + i * 30], [40 + i * 30, 642 + i * 30], [70 + i * 30, 652 + i * 30]], '#e9f6ff', 3, { passes: 1 });
      // the house on bamboo poles
      p.kubo(490, 420, 225, 135);
      p.line([[292, 444], [700, 444]], '#7d6a2a', 10); p.line([[292, 466], [700, 466]], '#7d6a2a', 10);
      p.line([[355, 420], [355, 466]], C.brown, 5); p.line([[625, 420], [625, 466]], C.brown, 5);
      const people = [[310, C.red, {}], [385, C.blue, { dress: true, long: true }], [458, C.orange, {}], [530, C.purple, { dress: true }], [604, C.green, {}], [680, C.yellow, { long: true, dress: true }]];
      people.forEach((q, i) => p.kid(q[0], 648 + (i % 2) * 8, 205, q[1], Object.assign({ arms: 'up', skin: i % 2 ? C.skin2 : C.skin }, q[2])));
      p.arrow([[700, 330], [745, 318], [770, 345]], C.red, 6);
      p.text('BAYANIHAN!', 505, 70, 88, [C.red, C.orange, C.gold, C.green, C.blue, C.purple], { spread: 1.06 });
      p.signature('Ana, 10', W - 26, H - 30);
    } },
    // a go bag and what goes in it
    gobag: { w: 768, h: 1024, seed: 23, draw(p) {
      const W = p.W, H = p.H;
      p.text('ANG GO BAG KO', W / 2, 82, 84, [C.red, C.orange, C.green, C.blue, C.purple]);
      // bag
      p.draw(p.poly([[250, 360], [520, 360], [560, 820], [210, 820]], 5), C.red, '#9a2318', { w: 12, gap: 7, lw: 6 });
      p.draw(p.oval(385, 362, 135, 60, 3, Math.PI, Math.PI * 2), C.red, '#9a2318', { w: 12, gap: 7, lw: 6 });
      p.line([[300, 330], [330, 250], [440, 250], [470, 330]], '#9a2318', 12);
      p.draw(p.rect(270, 560, 230, 200, 4), '#b8261b', '#7a1a12', { w: 10, gap: 6, lw: 5 });
      p.line([[285, 600], [485, 600]], C.gold, 5);
      p.draw(p.oval(385, 650, 34, 34), C.yellow, C.gold, { w: 6, gap: 4, lw: 3 });
      // items around it with arrows
      // flashlight
      p.draw(p.rect(40, 230, 120, 44, 2), C.gray, C.black, { w: 8, gap: 5, lw: 3 });
      p.draw(p.poly([[160, 222], [190, 210], [190, 296], [160, 282]], 2), C.lgray, C.black, { w: 6, gap: 4, lw: 3 });
      p.draw(p.poly([[192, 214], [250, 180], [250, 326], [192, 292]], 2), C.yellow, null, { w: 8, gap: 6, alpha: 0.45 });
      p.text('flashlight', 110, 320, 38, C.pencil, { font: '"Patrick Hand"' });
      // water
      p.draw(p.rect(612, 210, 74, 150, 4), C.sky, C.blue, { w: 9, gap: 5, lw: 4 });
      p.draw(p.rect(630, 182, 38, 30, 2), C.blue, C.navy, { w: 6, gap: 4, lw: 3 });
      p.text('tubig', 650, 395, 40, C.pencil, { font: '"Patrick Hand"' });
      // whistle
      p.draw(p.oval(90, 520, 52, 34), C.orange, '#b84f00', { w: 8, gap: 5, lw: 4 });
      p.draw(p.rect(126, 500, 60, 26, 2), C.orange, '#b84f00', { w: 7, gap: 4, lw: 3 });
      p.text('pito', 100, 590, 40, C.pencil, { font: '"Patrick Hand"' });
      // first aid
      p.draw(p.rect(600, 500, 120, 96, 4), C.white, C.red, { w: 8, gap: 5, lw: 5 });
      p.draw(p.rect(648, 516, 24, 64, 1), C.red, null, { w: 6, gap: 3 });
      p.draw(p.rect(628, 536, 64, 24, 1), C.red, null, { w: 6, gap: 3 });
      p.text('gamot', 660, 632, 40, C.pencil, { font: '"Patrick Hand"' });
      // food can
      p.draw(p.rect(80, 760, 96, 110, 3), C.lgray, C.gray, { w: 8, gap: 5, lw: 4 });
      p.draw(p.rect(80, 790, 96, 48, 2), C.green, null, { w: 7, gap: 4 });
      p.text('pagkain', 128, 905, 40, C.pencil, { font: '"Patrick Hand"' });
      // radio
      p.draw(p.rect(590, 770, 140, 92, 4), C.black, C.black, { w: 8, gap: 5, lw: 3 });
      p.draw(p.oval(630, 816, 24, 24), C.lgray, null, { w: 5, gap: 3 });
      p.line([[700, 770], [740, 700]], C.black, 5);
      p.text('radyo', 660, 905, 40, C.pencil, { font: '"Patrick Hand"' });
      p.arrow([[200, 270], [262, 380]], C.navy, 5); p.arrow([[600, 300], [530, 395]], C.navy, 5);
      p.arrow([[190, 520], [240, 520]], C.navy, 5); p.arrow([[592, 548], [545, 548]], C.navy, 5);
      p.arrow([[185, 800], [222, 780]], C.navy, 5); p.arrow([[585, 810], [552, 795]], C.navy, 5);
      p.signature('Jun, Grade 3', W - 24, H - 34);
    } },
    // flood: evacuate early, rescuers in a boat
    baha: { w: 1024, h: 768, seed: 37, draw(p) {
      const W = p.W, H = p.H;
      p.draw(p.rect(-10, -10, W + 20, 240, 6), '#9fb2c2', null, { w: 14, gap: 9, alpha: 0.6 });
      p.cloud(170, 85, 120, '#7f8f9c', '#4b5966'); p.cloud(480, 70, 110, '#8e9eab', '#4b5966'); p.cloud(820, 90, 125, '#7f8f9c', '#4b5966');
      p.rain(0, 150, W, 470, 95);
      // evacuation centre on a hill
      p.draw(p.oval(870, 470, 230, 150, 4, Math.PI, Math.PI * 2), C.green, '#1f7a38', { w: 12, gap: 7, lw: 5 });
      p.draw(p.rect(790, 250, 170, 110, 3), '#f4f0e6', C.navy, { w: 9, gap: 5, lw: 4 });
      p.draw(p.poly([[775, 252], [875, 195], [975, 252]], 3), C.blue, C.navy, { w: 9, gap: 5, lw: 4 });
      p.text('EVAC', 875, 300, 44, C.red, { font: '"Gochi Hand"' });
      p.line([[960, 250], [960, 150]], C.brown, 5); p.draw(p.poly([[962, 152], [1012, 166], [962, 180]], 2), C.green, C.green, { w: 5, gap: 3, lw: 2 });
      // houses on stilts in the water
      [[150, 430, C.yellow], [380, 445, C.pink]].forEach(h => {
        p.line([[h[0] - 60, h[1]], [h[0] - 60, h[1] + 160]], C.brown, 7); p.line([[h[0] + 60, h[1]], [h[0] + 60, h[1] + 160]], C.brown, 7);
        p.house(h[0], h[1], 150, 105, h[2], C.red);
      });
      p.water(-10, 520, W + 20, 260);
      // boat with rescuers
      p.draw(p.poly([[470, 560], [760, 560], [720, 620], [510, 620]], 3), C.orange, '#a84d04', { w: 10, gap: 6, lw: 5 });
      p.kid(540, 562, 120, C.blue, { vest: true, arms: 'wave', hat: C.yellow });
      p.kid(615, 562, 105, C.purple, { vest: true, dress: true, long: true, skin: C.skin2 });
      p.kid(690, 562, 125, C.green, { vest: true, arms: 'side', hat: C.yellow });
      p.arrow([[770, 580], [840, 530]], C.red, 6);
      p.text('LUMIKAS AGAD!', 512, 215, 78, C.navy, { spread: 1.04 });
      p.signature('Carlo, 11', W - 26, H - 30);
    } },
    // earthquake: duck, cover, and hold
    dch: { w: 768, h: 1024, seed: 41, draw(p) {
      const W = p.W, H = p.H;
      p.text('DUCK  COVER  HOLD', W / 2, 80, 66, [C.blue, C.green, C.red]);
      p.draw(p.rect(-10, 690, W + 20, 350, 4), '#e8c896', null, { w: 12, gap: 8 });
      // tilted picture on the wall, lamp swinging
      p.draw(p.poly([[90, 190], [250, 168], [266, 285], [104, 306]], 2), C.sky, C.brown, { w: 8, gap: 5, lw: 6 });
      p.line([[560, 120], [610, 280]], C.black, 4);
      p.draw(p.poly([[565, 280], [655, 280], [630, 230], [590, 230]], 2), C.yellow, C.gold, { w: 7, gap: 4, lw: 3 });
      [[520, 210], [540, 250], [700, 210], [690, 260]].forEach(q => p.line([[q[0], q[1]], [q[0] + 14, q[1] - 10], [q[0] + 28, q[1]]], C.gray, 3, { passes: 1 }));
      for (let i = 0; i < 3; i++) { p.line([[30 + i * 14, 420], [22 + i * 14, 470], [34 + i * 14, 520], [24 + i * 14, 570]], C.gray, 3, { passes: 1 }); p.line([[W - 30 - i * 14, 420], [W - 22 - i * 14, 470], [W - 34 - i * 14, 520], [W - 24 - i * 14, 570]], C.gray, 3, { passes: 1 }); }
      // table
      p.draw(p.rect(130, 520, 520, 46, 3), C.brown, '#5a3a1a', { w: 10, gap: 6, lw: 5 });
      p.line([[160, 566], [160, 800]], '#5a3a1a', 18); p.line([[620, 566], [620, 800]], '#5a3a1a', 18);
      // child under the table, one hand on the leg, one over the head
      p.draw(p.oval(400, 735, 110, 62), C.orange, '#a84d04', { w: 10, gap: 6, lw: 4 });
      p.draw(p.oval(300, 700, 52, 50), C.skin, '#7a4a28', { w: 7, gap: 4, lw: 3 });
      p.draw(p.oval(300, 682, 54, 36, 1, Math.PI, Math.PI * 2), C.black, null, { w: 6, gap: 3 });
      p.line([[320, 700], [250, 655], [292, 640]], C.skin, 10);
      p.line([[470, 720], [560, 690], [610, 690]], C.skin, 10);
      p.draw(p.oval(612, 690, 14, 14), C.skin, null, { w: 5, gap: 3 });
      p.line([[460, 770], [560, 790]], C.navy, 14);
      p.draw(p.oval(282, 712, 5, 6), C.black, null, { w: 3, gap: 2 });
      p.text('Yuko, takip, kapit!', W / 2, 900, 54, C.navy, { font: '"Patrick Hand"' });
      p.signature('Lia, 8', W - 24, H - 34);
    } },
    // planting trees on the hills
    tanim: { w: 1024, h: 768, seed: 53, draw(p) {
      const W = p.W, H = p.H;
      p.draw(p.rect(-10, -10, W + 20, 160, 6), C.sky, null, { w: 14, gap: 9, alpha: 0.6 });
      p.sun(W - 90, 80, 58, true); p.cloud(250, 80, 80);
      p.bird(470, 110, 15); p.bird(520, 90, 12);
      p.draw(p.poly([[-20, 470], [180, 250], [380, 470]], 4), '#4f8f3a', '#2c5e20', { w: 12, gap: 7, lw: 5 });
      p.draw(p.poly([[240, 470], [520, 210], [800, 470]], 4), '#3f7f2e', '#2c5e20', { w: 12, gap: 7, lw: 5 });
      p.draw(p.poly([[640, 470], [860, 290], [1060, 470]], 4), '#4f8f3a', '#2c5e20', { w: 12, gap: 7, lw: 5 });
      p.grass(460, C.lime);
      [[90, 470, 120], [300, 420, 95], [470, 380, 80], [700, 430, 100], [930, 470, 120]].forEach(t => p.tree(t[0], t[1], t[2]));
      p.water(-10, 660, W + 20, 120, C.blue);
      p.draw(p.oval(260, 712, 30, 14), C.orange, null, { w: 6, gap: 3 }); p.draw(p.poly([[230, 712], [212, 700], [212, 724]], 1), C.orange, null, { w: 5, gap: 3 });
      p.draw(p.oval(760, 730, 26, 12), C.yellow, null, { w: 6, gap: 3 }); p.draw(p.poly([[786, 730], [804, 718], [804, 742]], 1), C.yellow, null, { w: 5, gap: 3 });
      // kids planting
      p.kid(400, 640, 160, C.red, { arms: 'hold' });
      p.line([[462, 640], [468, 590]], C.green, 6); p.draw(p.oval(476, 585, 14, 9), C.green, null, { w: 5, gap: 3 }); p.draw(p.oval(458, 588, 13, 8), C.green, null, { w: 5, gap: 3 });
      p.draw(p.oval(470, 648, 40, 10), C.brown, null, { w: 6, gap: 4 });
      p.kid(590, 640, 150, C.purple, { arms: 'wave', dress: true, long: true, skin: C.skin2 });
      p.kid(160, 640, 140, C.blue, { arms: 'down' });
      p.text('MAGTANIM NG PUNO', W / 2, 190, 74, C.green, { spread: 1.04 });
      p.signature('Mara, 9', W - 26, H - 30);
    } },
    // after the storm: rainbow and cleaning up together
    bahaghari: { w: 1024, h: 768, seed: 61, draw(p) {
      const W = p.W, H = p.H;
      p.draw(p.rect(-10, -10, W + 20, 520, 6), '#bfe4f7', null, { w: 14, gap: 10, alpha: 0.5 });
      const cols = [C.red, C.orange, C.yellow, C.green, C.blue, C.purple];
      cols.forEach((col, i) => p.line(arc(512, 560, 420 - i * 30, Math.PI, Math.PI * 2).concat([]), col, 26, { passes: 3, alpha: 0.6 }));
      p.cloud(110, 470, 110); p.cloud(920, 470, 110);
      p.sun(935, 112, 46, true);
      p.grass(560, C.lime);
      p.house(470, 600, 210, 140, '#a8d8f0', C.purple);
      p.kid(240, 690, 160, C.orange, { arms: 'hold' });
      p.line([[300, 610], [345, 720]], C.brown, 7); p.draw(p.poly([[330, 700], [370, 700], [380, 740], [320, 740]], 2), C.yellow, C.gold, { w: 6, gap: 3, lw: 3 });
      p.kid(700, 690, 170, C.green, { arms: 'side', dress: true, long: true, skin: C.skin2 });
      p.draw(p.poly([[760, 640], [810, 640], [826, 720], [748, 720]], 2), C.black, null, { w: 8, gap: 4 });
      p.kid(820, 700, 120, C.red, { arms: 'wave' });
      p.draw(p.oval(140, 735, 70, 16), C.sky, C.blue, { w: 6, gap: 4, lw: 3 });
      p.text('BABANGON TAYO!', 512, 75, 80, cols, { spread: 1.05 });
      p.signature('Paolo, 12', W - 26, H - 30);
    } },
    // fire: crawl low under the smoke
    sunog: { w: 768, h: 1024, seed: 71, draw(p) {
      const W = p.W, H = p.H;
      p.text('KAPAG MAY SUNOG', W / 2, 80, 70, C.red);
      p.draw(p.rect(-10, 120, W + 20, 300, 6), '#9da3a8', null, { w: 14, gap: 10, alpha: 0.55 });
      p.cloud(200, 190, 120, '#b7bcc0', '#6f767c'); p.cloud(520, 230, 130, '#b7bcc0', '#6f767c');
      p.draw(p.rect(-10, 760, W + 20, 280, 4), '#e8c896', null, { w: 12, gap: 8 });
      // flames
      [[90, 760, 120], [190, 760, 90]].forEach(f => {
        p.draw(p.poly([[f[0] - f[2] * 0.5, f[1]], [f[0] - f[2] * 0.4, f[1] - f[2] * 0.9], [f[0] - f[2] * 0.1, f[1] - f[2] * 0.6], [f[0], f[1] - f[2] * 1.4], [f[0] + f[2] * 0.2, f[1] - f[2] * 0.7], [f[0] + f[2] * 0.45, f[1] - f[2] * 1.0], [f[0] + f[2] * 0.5, f[1]]], 3), C.red, '#a3150b', { w: 10, gap: 6, lw: 4 });
        p.draw(p.poly([[f[0] - f[2] * 0.28, f[1]], [f[0] - f[2] * 0.15, f[1] - f[2] * 0.55], [f[0] + f[2] * 0.05, f[1] - f[2] * 0.85], [f[0] + f[2] * 0.25, f[1] - f[2] * 0.5], [f[0] + f[2] * 0.3, f[1]]], 2), C.yellow, null, { w: 8, gap: 5 });
      });
      // door with exit sign
      p.draw(p.rect(560, 470, 160, 290, 3), C.brown, '#5a3a1a', { w: 10, gap: 6, lw: 5 });
      p.draw(p.oval(690, 620, 9, 9), C.gold, null, { w: 4, gap: 2 });
      p.draw(p.rect(575, 420, 130, 42, 2), C.green, '#156b2f', { w: 8, gap: 5, lw: 3 });
      p.text('EXIT', 640, 442, 36, C.white, { font: '"Gochi Hand"' });
      // child crawling low
      p.draw(p.oval(380, 712, 86, 38), C.blue, C.navy, { w: 10, gap: 6, lw: 4 });
      p.draw(p.oval(482, 690, 40, 38), C.skin, '#7a4a28', { w: 7, gap: 4, lw: 3 });
      p.draw(p.oval(482, 676, 42, 26, 1, Math.PI, Math.PI * 2), C.black, null, { w: 6, gap: 3 });
      p.line([[440, 720], [470, 758]], C.skin, 11); p.line([[330, 725], [300, 758]], C.navy, 13); p.line([[300, 730], [250, 758]], C.navy, 13);
      p.draw(p.oval(496, 696, 4, 5), C.black, null, { w: 3, gap: 2 });
      p.arrow([[420, 640], [520, 610], [552, 612]], C.green, 6);
      p.text('Gumapang nang mababa!', W / 2, 860, 52, C.navy, { font: '"Patrick Hand"' });
      p.text('Tumawag sa 911', W / 2, 930, 46, C.red, { font: '"Patrick Hand"' });
      p.signature('Nico, 10', W - 24, H - 30);
    } },
    // cleaning the canal so the street does not flood
    kanal: { w: 1024, h: 768, seed: 113, draw(p) {
      const W = p.W, H = p.H;
      p.draw(p.rect(-10, -10, W + 20, 170, 6), C.sky, null, { w: 14, gap: 9, alpha: 0.6 });
      p.sun(W - 80, 70, 52, true);
      p.cloud(150, 90, 85, '#8e9eab', '#4b5966'); p.rain(80, 140, 230, 220, 10);
      p.grass(440, C.lime);
      // street, then the canal with its concrete edges
      p.draw(p.rect(-10, 455, W + 20, 80, 3), '#9aa1a6', null, { w: 12, gap: 8, alpha: 0.7 });
      for (let x = 30; x < W; x += 120) p.line([[x, 495], [x + 60, 495]], C.white, 6, { passes: 2 });
      p.draw(p.rect(-10, 590, W + 20, 110, 3), '#b9bec2', null, { w: 12, gap: 8, alpha: 0.7 });
      p.water(-10, 610, W + 20, 70, C.blue);
      p.line([[-10, 608], [W + 10, 608]], '#5f666b', 6); p.line([[-10, 684], [W + 10, 684]], '#5f666b', 6);
      [[150, C.red], [210, C.green], [690, C.yellow], [760, C.pink]].forEach(([x, col]) => p.draw(p.rect(x, 630, 30, 16, 1), col, C.black, { w: 5, gap: 3, lw: 2 }));
      p.arrow([[380, 650], [470, 640], [560, 650]], C.navy, 5);
      // kids with gloves and a sack, a trash bin, a sign
      p.kid(300, 590, 150, C.red, { arms: 'hold' });
      p.draw(p.poly([[330, 520], [395, 520], [405, 600], [322, 600]], 3), '#d9c79a', '#8a6a2a', { w: 8, gap: 5, lw: 3 });
      p.kid(470, 590, 140, C.blue, { arms: 'side', dress: true, long: true, skin: C.skin2 });
      p.line([[510, 520], [560, 615]], C.gray, 5);
      p.kid(620, 590, 130, C.purple, { arms: 'wave' });
      p.draw(p.rect(820, 470, 90, 120, 4), C.green, '#1f7a38', { w: 9, gap: 5, lw: 4 });
      p.draw(p.rect(808, 452, 114, 24, 3), '#1f7a38', null, { w: 7, gap: 4 });
      p.text('BASURA', 865, 530, 26, C.white);
      p.line([[60, 590], [60, 420]], C.brown, 7);
      p.draw(p.rect(-6, 330, 210, 96, 3), C.white, C.red, { w: 8, gap: 5, lw: 5 });
      p.text('BAWAL', 100, 360, 34, C.red); p.text('MAGTAPON', 100, 398, 30, C.red);
      p.text('LINISIN ANG KANAL!', 560, 215, 76, [C.blue, C.green, C.orange, C.purple], { spread: 1.04 });
      p.signature('Rico, 10', W - 26, H - 30);
    } },
    // the family's plan: the route, the meeting place and who to call
    plano: { w: 1024, h: 768, seed: 127, draw(p) {
      const W = p.W, H = p.H;
      p.text('PLANO NG PAMILYA', W / 2, 62, 74, C.navy, { spread: 1.04 });
      // river to avoid
      p.draw(p.poly([[-10, 150], [140, 170], [230, 260], [210, 380], [-10, 400]], 4), C.blue, '#1b4f9c', { w: 12, gap: 8, lw: 4, alpha: 0.6 });
      p.line([[60, 230], [150, 320]], C.red, 10); p.line([[150, 230], [60, 320]], C.red, 10);
      p.text('IWASAN', 105, 365, 36, C.red);
      // home, path, meeting tree, evacuation school
      p.house(170, 650, 170, 120, '#f6d36b', C.red);
      p.text('BAHAY', 170, 700, 36, C.navy);
      const path = [[260, 620], [380, 600], [470, 520], [560, 470], [680, 420], [780, 330]];
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i], b = path[i + 1];
        for (let t = 0; t < 1; t += 0.34) p.line([[a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], [a[0] + (b[0] - a[0]) * (t + 0.18), a[1] + (b[1] - a[1]) * (t + 0.18)]], C.orange, 7, { passes: 2 });
      }
      p.arrow([[740, 370], [790, 322]], C.orange, 7);
      p.tree(470, 470, 170, C.green);
      p.draw(p.poly([[470, 245], [480, 270], [507, 272], [486, 288], [494, 314], [470, 299], [446, 314], [454, 288], [433, 272], [460, 270]], 1), C.yellow, C.gold, { w: 5, gap: 3, lw: 2 });
      p.text('TAGPUAN', 470, 500, 36, C.green);
      p.draw(p.rect(780, 170, 200, 140, 3), '#f4f0e6', C.navy, { w: 9, gap: 5, lw: 4 });
      p.draw(p.poly([[766, 172], [880, 110], [994, 172]], 3), C.blue, C.navy, { w: 9, gap: 5, lw: 4 });
      p.text('PAARALAN', 880, 220, 32, C.navy); p.text('EVAC', 880, 270, 40, C.red);
      // the family walking, and who to call
      [[560, 600, C.red, {}], [610, 610, C.purple, { dress: true, long: true, skin: C.skin2 }], [655, 612, C.blue, {}], [695, 615, C.green, { dress: true }]].forEach(([x, y, col, o], i) => p.kid(x, y, 110 - i * 12, col, Object.assign({ arms: 'down' }, o)));
      p.draw(p.rect(800, 560, 190, 120, 4), C.white, C.navy, { w: 8, gap: 5, lw: 4 });
      p.text('☎ 911', 895, 600, 40, C.red); p.text('Barangay', 895, 648, 32, C.navy);
      p.signature('Lea, 11', W - 26, H - 26);
    } },
    // sharing relief goods at the barangay hall
    tulong: { w: 1024, h: 768, seed: 131, draw(p) {
      const W = p.W, H = p.H;
      p.draw(p.rect(-10, -10, W + 20, 200, 6), C.sky, null, { w: 14, gap: 9, alpha: 0.55 });
      p.sun(90, 80, 54, true); p.cloud(820, 90, 80);
      p.grass(560, C.lime);
      // barangay hall
      p.draw(p.rect(250, 260, 520, 300, 4), '#f4e2b8', C.brown, { w: 10, gap: 6, lw: 5 });
      p.draw(p.poly([[220, 262], [510, 160], [800, 262]], 3), C.red, '#9a2318', { w: 10, gap: 6, lw: 5 });
      p.draw(p.rect(330, 285, 360, 56, 3), C.white, C.navy, { w: 8, gap: 5, lw: 3 });
      p.text('BARANGAY HALL', 510, 313, 38, C.navy);
      p.draw(p.rect(460, 420, 100, 140, 3), C.brown, '#5a3a1a', { w: 8, gap: 5, lw: 3 });
      p.draw(p.rect(300, 380, 90, 70, 2), C.sky, C.navy, { w: 7, gap: 4, lw: 3 }); p.draw(p.rect(630, 380, 90, 70, 2), C.sky, C.navy, { w: 7, gap: 4, lw: 3 });
      // table with relief boxes and water
      p.draw(p.rect(330, 560, 360, 26, 3), C.brown, '#5a3a1a', { w: 8, gap: 5, lw: 3 });
      p.line([[350, 586], [350, 660]], '#5a3a1a', 9); p.line([[670, 586], [670, 660]], '#5a3a1a', 9);
      [[360, 500], [440, 500], [400, 455]].forEach(([x, y]) => { p.draw(p.rect(x, y, 76, 60, 2), '#d9a35f', '#8a5a2b', { w: 7, gap: 4, lw: 3 }); p.text('RELIEF', x + 38, y + 30, 20, '#8a5a2b'); });
      [[560, 520], [590, 520], [620, 520]].forEach(([x, y]) => p.draw(p.rect(x, y, 22, 40, 2), C.sky, C.blue, { w: 5, gap: 3, lw: 2 }));
      // neighbours giving and receiving
      p.kid(250, 690, 170, C.green, { arms: 'hold' });
      p.kid(760, 690, 160, C.orange, { arms: 'hold', dress: true, long: true, skin: C.skin2 });
      p.draw(p.rect(800, 590, 64, 50, 2), '#d9a35f', '#8a5a2b', { w: 6, gap: 4, lw: 3 });
      p.kid(880, 700, 130, C.purple, { arms: 'wave' });
      p.kid(140, 700, 120, C.blue, { arms: 'up' });
      [[150, 300], [880, 300], [930, 420]].forEach(([x, y]) => p.draw(p.poly([[x, y + 30], [x - 32, y], [x - 26, y - 22], [x - 8, y - 24], [x, y - 10], [x + 8, y - 24], [x + 26, y - 22], [x + 32, y]], 2), C.red, '#9a2318', { w: 6, gap: 4, lw: 3 }));
      p.text('TULONG-TULONG TAYO!', W / 2, 105, 70, [C.red, C.orange, C.green, C.blue, C.purple], { spread: 1.03 });
      p.signature('Joy, 9', W - 26, H - 30);
    } },
    // a poem on lined paper
    tula: { w: 768, h: 1024, seed: 83, lined: true, draw(p) {
      const W = p.W, H = p.H;
      lined(p);
      p.text('Handa Kami', W / 2 + 30, 120, 86, C.navy, { font: '"Patrick Hand"', tilt: 0.04, bounce: 0.02 });
      const lines = ['Kapag dumilim ang langit,', 'hindi ako matatakot.', 'May flashlight sa aking bag,', 'may tubig, pito, at gamot.', '', 'Kapag lumindol, yuyuko,', 'tatakpan, kakapit nang mahigpit.', 'Sama-sama kaming lalabas', 'kapag tumigil na ang yanig.'];
      lines.forEach((l, i) => { if (l) p.text(l, 120, 222 + i * 58, 44, '#2a3f8f', { font: '"Patrick Hand"', align: 'left', tilt: 0.02, bounce: 0.02 }); });
      // doodles
      p.sun(660, 880, 34, true);
      p.draw(p.rect(120, 840, 90, 34, 2), C.gray, C.black, { w: 6, gap: 4, lw: 3 });
      p.draw(p.poly([[212, 834], [280, 810], [280, 904], [212, 880]], 2), C.yellow, null, { w: 7, gap: 5, alpha: 0.5 });
      p.signature('ni Paolo, Grade 6', W - 24, H - 34);
    } },
    // a short story, written out by hand (goes with Ana's drawing)
    kuwento: { w: 768, h: 1024, seed: 89, lined: true, draw(p) {
      const W = p.W, H = p.H;
      lined(p);
      p.text('Ang Bahay sa Tabi ng Ilog', W / 2 + 30, 120, 62, C.navy, { font: '"Patrick Hand"', tilt: 0.03, bounce: 0.02 });
      const lines = ['Tuwing may bagyo, umaapaw', 'ang ilog sa tabi ng bahay namin.', 'Isang araw, nagpulong ang barangay.', '"Ilipat natin ang bahay sa mataas', 'na lugar," sabi ni Kapitan.', 'Nagtulong-tulong ang lahat.', 'Ngayon, ligtas na kami', 'kahit malakas ang ulan.'];
      lines.forEach((l, i) => p.text(l, 120, 222 + i * 58, 42, '#2a3f8f', { font: '"Patrick Hand"', align: 'left', tilt: 0.02, bounce: 0.02 }));
      p.kubo(600, 905, 110, 70);
      p.arrow([[440, 900], [500, 880]], C.red, 4);
      p.signature('ni Ana, 10', W - 24, H - 34);
    } },
    // a letter to Bayani
    liham: { w: 768, h: 1024, seed: 101, lined: true, draw(p) {
      const W = p.W, H = p.H;
      lined(p);
      p.text('Mahal kong Bayani,', 130, 130, 58, C.navy, { font: '"Patrick Hand"', align: 'left', tilt: 0.03, bounce: 0.02 });
      const lines = ['Salamat sa mga paalala mo.', 'Inayos namin ang go bag', 'ng buong pamilya: may tubig,', 'flashlight, pito, at gamot na.', 'Alam na rin namin ang daan', 'papunta sa evacuation center.', 'Handa na kami!'];
      lines.forEach((l, i) => p.text(l, 120, 222 + i * 58, 42, '#2a3f8f', { font: '"Patrick Hand"', align: 'left', tilt: 0.02, bounce: 0.02 }));
      p.text('Nagmamahal,', 420, 690, 42, '#2a3f8f', { font: '"Patrick Hand"', align: 'left' });
      p.text('Jun', 470, 748, 50, '#2a3f8f', { font: '"Patrick Hand"', align: 'left' });
      const hx = 200, hy = 860;
      p.draw(p.poly([[hx, hy + 60], [hx - 70, hy - 5], [hx - 55, hy - 50], [hx - 15, hy - 52], [hx, hy - 20], [hx + 15, hy - 52], [hx + 55, hy - 50], [hx + 70, hy - 5]], 2), C.red, '#9a2318', { w: 8, gap: 5, lw: 4 });
      p.signature('Jun, Grade 3', W - 24, H - 34);
    } },
    // a three-panel comic
    komiks: { w: 1024, h: 768, seed: 97, draw(p) {
      const W = p.W, H = p.H;
      p.text('SI BAYANI AT ANG BAGYO', W / 2, 62, 62, C.navy, { spread: 1.03 });
      const panels = [[24, 120], [355, 120], [686, 120]], pw = 314, ph = 600;
      panels.forEach(q => p.line(p.rect(q[0], q[1], pw, ph, 3).pts, C.black, 6));
      // 1: storm coming
      p.draw(p.rect(30, 126, 302, 220, 3), '#9fb2c2', null, { w: 12, gap: 8, alpha: 0.6 });
      p.cloud(120, 200, 70, '#7f8f9c', '#4b5966'); p.cloud(250, 220, 60, '#7f8f9c', '#4b5966');
      p.rain(40, 250, 320, 420, 26);
      p.kid(180, 690, 210, '#1f6f8b', { hat: C.yellow, arms: 'wave' });
      bubble(p, 175, 400, 'May bagyo!');
      // 2: pack the go bag
      p.draw(p.rect(395, 150, 230, 150, 3), '#9fb2c2', C.brown, { w: 10, gap: 7, lw: 6, alpha: 0.6 });
      p.line([[510, 150], [510, 300]], C.brown, 6); p.line([[395, 225], [625, 225]], C.brown, 6);
      p.rain(405, 160, 615, 290, 16);
      p.line([[640, 170], [672, 160]], C.gray, 3, { passes: 1 }); p.line([[640, 200], [680, 192]], C.gray, 3, { passes: 1 });
      p.kid(470, 690, 200, '#1f6f8b', { hat: C.yellow, arms: 'hold' });
      p.draw(p.poly([[520, 560], [610, 560], [622, 680], [508, 680]], 3), C.red, '#9a2318', { w: 10, gap: 6, lw: 4 });
      p.draw(p.rect(560, 520, 26, 46, 2), C.sky, C.blue, { w: 6, gap: 3, lw: 2 });
      bubble(p, 512, 385, 'Handa ang go bag!');
      // 3: safe at the evacuation centre
      p.draw(p.rect(700, 300, 286, 190, 3), '#f4f0e6', C.navy, { w: 9, gap: 5, lw: 4 });
      p.draw(p.poly([[690, 302], [843, 220], [996, 302]], 3), C.blue, C.navy, { w: 9, gap: 5, lw: 4 });
      p.text('EVAC', 843, 360, 40, C.red);
      p.kid(760, 690, 190, '#1f6f8b', { hat: C.yellow, arms: 'up' });
      p.kid(850, 690, 160, C.pink, { dress: true, long: true, skin: C.skin2 });
      p.kid(925, 690, 120, C.green, { arms: 'up' });
      bubble(p, 843, 175, 'Ligtas kami!');
      p.signature('Bea, 11', W - 26, H - 22);
    } }
  };
  function lined(p) {
    const c = p.c, W = p.W, H = p.H;
    p.paper('#fdfcf7');
    c.save(); c.strokeStyle = '#9cc3e6'; c.lineWidth = 2;
    for (let y = 190; y < H - 40; y += 58) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.strokeStyle = '#ef8a8a'; c.beginPath(); c.moveTo(96, 0); c.lineTo(96, H); c.stroke(); c.restore();
  }
  function bubble(p, x, y, txt) {
    const w = txt.length * 17 + 40;
    p.draw(p.oval(x, y, w / 2, 40), C.white, C.black, { w: 8, gap: 5, lw: 3 });
    p.line([[x - 10, y + 36], [x - 26, y + 70], [x + 10, y + 38]], C.black, 3);
    p.text(txt, x, y, 36, C.black, { font: '"Patrick Hand"' });
  }

  async function ready() {
    await Promise.all(['40px "Gochi Hand"', '40px "Patrick Hand"'].map(f => document.fonts.load(f)));
  }
  function draw(name, canvas) {
    const wk = WORKS[name]; canvas = canvas || document.createElement('canvas');
    canvas.width = wk.w; canvas.height = wk.h;
    const p = new Pad(canvas, wk.seed);
    if (!wk.lined) p.paper();
    wk.draw(p); p.grain(wk.lined ? 0.01 : 0.05);
    return canvas;
  }
  // An open picture book for a story stand: the story's first lines on the left, a drawing on the right.
  function book(title, lines, artName) {
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 640;
    const c = cv.getContext('2d'), W = 1024, H = 640, pw = W / 2 - 26;
    c.fillStyle = '#7a1f1a'; c.beginPath(); c.moveTo(26, 0); c.arcTo(W, 0, W, H, 26); c.arcTo(W, H, 0, H, 26); c.arcTo(0, H, 0, 0, 26); c.arcTo(0, 0, W, 0, 26); c.fill();
    c.fillStyle = '#fffaf0'; c.fillRect(22, 18, pw, H - 36); c.fillRect(W / 2 + 4, 18, pw, H - 36);
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(W / 2 - 10, 18, 20, H - 36);
    let size = 56; c.font = size + 'px "Patrick Hand"';
    while (c.measureText(title).width > pw - 70 && size > 30) { size -= 2; c.font = size + 'px "Patrick Hand"'; }
    c.fillStyle = '#16303f'; c.fillText(title, 56, 100);
    c.font = '38px "Patrick Hand"'; c.fillStyle = '#2a3f8f';
    let line = '', y = 176;
    for (const word of lines.join(' ').split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (c.measureText(t).width > pw - 70) { c.fillText(line, 56, y); y += 54; line = word; if (y > H - 50) { line = ''; break; } } else line = t;
    }
    if (line) c.fillText(line, 56, y);
    const art = draw(artName), k = Math.min((pw - 60) / art.width, (H - 110) / art.height), dw = art.width * k, dh = art.height * k;
    c.drawImage(art, W / 2 + 4 + (pw - dw) / 2, 18 + (H - 36 - dh) / 2, dw, dh);
    return cv;
  }
  window.KidArt = { ready, draw, book, names: Object.keys(WORKS), size: n => [WORKS[n].w, WORKS[n].h] };
})();
