// TANGHALAN mockup: the walkable museum, built with the app's own three.js (r128) in the
// games' low-poly style. It is one connected space: the main hall opens through archways into
// a room for each pillar and through a doorway into the Kuwentuhan Corner. Artworks hang on the
// walls; stories, poems and letters sit on story stands and reading walls in every room.
(function () {
  'use strict';
  const T = THREE;
  const PILLAR = { prevent: 0x2a6b8f, ready: 0x128253, act: 0xf2760c, recover: 0x7a53c6, story: 0xeaa100 };
  const WALL = 0xf3ead9, WAINSCOT = 0xe4d3b5, NAVY = 0x16303f;
  const CEIL = 4.2, DOOR_H = 3.0;

  function mat(color, o) { return new T.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.9, metalness: 0 }, o || {})); }
  function mesh(geo, m, x, y, z) { const o = new T.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function box(w, h, d, color, x, y, z, o) { return mesh(new T.BoxGeometry(w, h, d), mat(color, o), x, y, z); }
  function cyl(rt, rb, h, color, x, y, z, seg) { return mesh(new T.CylinderGeometry(rt, rb, h, seg || 16), mat(color), x, y, z); }
  function ball(r, color, x, y, z) { return mesh(new T.SphereGeometry(r, 20, 16), mat(color), x, y, z); }
  function shadows(o, cast, recv) { o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv; } }); return o; }
  function rnd(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
  function hex(n) { return '#' + n.toString(16).padStart(6, '0'); }

  function floorCanvas() {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512; const c = cv.getContext('2d'), r = rnd(9);
    const cols = 6, cw = 512 / cols;
    for (let i = 0; i < cols; i++) {
      let y = -r() * 220;
      while (y < 512) {
        const len = 170 + r() * 220, k = 0.88 + r() * 0.2;
        c.fillStyle = 'rgb(' + Math.round(214 * k) + ',' + Math.round(170 * k) + ',' + Math.round(116 * k) + ')';
        c.fillRect(i * cw, y, cw, len);
        c.globalAlpha = 0.13; c.strokeStyle = '#7a5530'; c.lineWidth = 1.2;
        for (let g = 0; g < 5; g++) { const x = i * cw + 5 + r() * (cw - 10); c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 3, y + len * 0.3, x - 3, y + len * 0.6, x + 1, y + len); c.stroke(); }
        c.globalAlpha = 1; c.fillStyle = 'rgba(90,58,30,.5)'; c.fillRect(i * cw, y, cw, 2);
        y += len;
      }
      c.fillStyle = 'rgba(90,58,30,.55)'; c.fillRect(i * cw, 0, 2, 512);
    }
    return cv;
  }
  function textCanvas(w, h, paint) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; paint(cv.getContext('2d'), w, h); return cv; }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function drawLogo(c, x, y, s) { // the app icon (logo 1b, the Bayanihan house)
    c.save(); c.translate(x, y); c.scale(s / 100, s / 100);
    roundRect(c, 0, 0, 100, 100, 25); c.fillStyle = '#cfe6ef'; c.fill(); c.clip();
    c.fillStyle = '#16303f'; c.strokeStyle = '#16303f'; c.lineWidth = 6; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(50, 18); c.lineTo(77, 40); c.lineTo(23, 40); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff5df'; c.fillRect(30, 39, 40, 18);
    c.fillStyle = '#f2760c'; roundRect(c, 45, 44, 10, 13, 2); c.fill();
    c.fillStyle = '#eaa100'; roundRect(c, 18, 56, 64, 6, 3); c.fill();
    [[27, '#2a6b8f'], [42.3, '#128253'], [57.7, '#f2760c'], [73, '#7a53c6']].forEach(([px, col]) => {
      c.fillStyle = col; c.beginPath(); c.arc(px, 68.5, 4.6, 0, Math.PI * 2); c.fill(); roundRect(c, px - 5, 74.5, 10, 14, 5); c.fill();
    });
    c.restore();
  }
  function signCanvas(text, bg, fg) {
    return textCanvas(1200, 260, (c, w, h) => {
      c.fillStyle = bg; roundRect(c, 0, 0, w, h, 70); c.fill();
      c.fillStyle = fg || '#ffffff'; c.font = '800 128px "Baloo 2"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, h / 2 + 12);
    });
  }
  function bubbleCanvas(emoji, ring) {
    return textCanvas(256, 256, (c) => {
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(128, 120, 104, 0, Math.PI * 2); c.fill();
      c.lineWidth = 14; c.strokeStyle = ring; c.stroke();
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(100, 214); c.lineTo(128, 252); c.lineTo(156, 214); c.fill();
      c.font = '110px "Noto Color Emoji"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(emoji, 128, 126);
    });
  }
  // an open picture book for the story stands: text on the left page, a drawing on the right
  function bookCanvas(title, lines, art) {
    return textCanvas(1024, 640, (c, w, h) => {
      c.fillStyle = '#7a1f1a'; roundRect(c, 0, 0, w, h, 26); c.fill();
      c.fillStyle = '#fffaf0'; c.fillRect(22, 18, w / 2 - 26, h - 36); c.fillRect(w / 2 + 4, 18, w / 2 - 26, h - 36);
      c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(w / 2 - 10, 18, 20, h - 36);
      c.fillStyle = '#16303f'; c.font = '52px "Patrick Hand"'; c.fillText(title, 56, 96);
      c.fillStyle = '#2a3f8f'; c.font = '36px "Patrick Hand"'; lines.forEach((l, i) => c.fillText(l, 56, 170 + i * 52));
      c.drawImage(art, w / 2 + 36, 70, w / 2 - 90, (w / 2 - 90) * art.height / art.width);
    });
  }

  // ---------- pieces of the museum ----------
  function painting(name, w, frame, tex) {
    const [aw, ah] = KidArt.size(name), h = w * ah / aw, g = new T.Group();
    g.add(box(w + 0.2, h + 0.2, 0.07, frame, 0, 0, 0, { roughness: 0.55 }));
    g.add(box(w + 0.09, h + 0.09, 0.075, 0xfdfbf5, 0, 0, 0.003));
    g.add(mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: tex, roughness: 0.95 }), 0, 0, 0.042));
    g.userData.h = h; return g;
  }
  function placard(tex) {
    const g = new T.Group();
    g.add(box(0.36, 0.22, 0.02, 0xffffff, 0, 0, 0));
    g.add(mesh(new T.PlaneGeometry(0.34, 0.2), new T.MeshStandardMaterial({ map: tex, roughness: 1 }), 0, 0, 0.011));
    return g;
  }
  function placardCanvas(title, who, kind, color) {
    return textCanvas(340, 200, (c, w, h) => {
      c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
      c.fillStyle = color; c.fillRect(0, 0, 12, h);
      c.fillStyle = '#16303f'; c.font = '800 38px "Baloo 2"'; c.fillText(title, 30, 62);
      c.fillStyle = '#4f6572'; c.font = '800 28px Nunito'; c.fillText(who, 30, 110); c.fillText(kind, 30, 150);
    });
  }
  function storyStand(tex) { // a reading lectern with an open book; faces +z
    const g = new T.Group();
    g.add(box(0.12, 0.92, 0.12, 0x6e4826, 0, 0.46, 0));
    g.add(box(0.56, 0.05, 0.4, 0x6e4826, 0, 0.025, 0));
    const top = new T.Group(); top.position.set(0, 0.98, 0); top.rotation.x = 0.5;
    top.add(box(0.8, 0.05, 0.56, 0x9c6b3f, 0, 0, 0));
    const pages = mesh(new T.PlaneGeometry(0.74, 0.46), new T.MeshStandardMaterial({ map: tex, roughness: 0.95 }), 0, 0.032, 0); pages.rotation.x = -Math.PI / 2;
    top.add(pages); g.add(top);
    return shadows(g, true, true);
  }
  function kid(o) { // low-poly child, like the games' characters; faces +z
    const g = new T.Group(), skin = o.skin || 0xd69a63;
    const legL = cyl(0.065, 0.06, 0.42, skin, -0.09, 0.27, 0), legR = cyl(0.065, 0.06, 0.42, skin, 0.09, 0.27, 0);
    legL.rotation.x = o.stride || 0; legR.rotation.x = -(o.stride || 0);
    g.add(legL, legR);
    g.add(box(0.13, 0.08, 0.2, 0x2b2b2b, -0.09, 0.05, 0.03 + (o.stride || 0) * 0.2), box(0.13, 0.08, 0.2, 0x2b2b2b, 0.09, 0.05, 0.03 - (o.stride || 0) * 0.2));
    g.add(cyl(0.17, 0.18, 0.2, o.pants || 0x35506b, 0, 0.5, 0));
    g.add(cyl(0.16, 0.185, 0.42, o.shirt, 0, 0.78, 0));
    const armL = cyl(0.055, 0.05, 0.42, o.sleeve || skin, -0.235, 0.8, 0), armR = cyl(0.055, 0.05, 0.42, o.sleeve || skin, 0.235, 0.8, 0);
    armL.rotation.z = -0.12; armR.rotation.z = 0.12; armL.rotation.x = -(o.stride || 0) * 0.8; armR.rotation.x = (o.stride || 0) * 0.8;
    if (o.wave) { armR.rotation.z = 2.5; armR.position.set(0.3, 1.08, 0); }
    g.add(armL, armR);
    g.add(ball(0.2, skin, 0, 1.18, 0));
    if (o.face) {
      g.add(ball(0.025, 0x2a2320, -0.07, 1.2, 0.185), ball(0.025, 0x2a2320, 0.07, 1.2, 0.185));
      g.add(ball(0.03, 0xf29a7a, -0.12, 1.13, 0.16), ball(0.03, 0xf29a7a, 0.12, 1.13, 0.16));
      const smile = mesh(new T.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), mat(0x2a2320), 0, 1.135, 0.19); smile.rotation.z = Math.PI; g.add(smile);
    }
    if (o.hat) {
      g.add(mesh(new T.SphereGeometry(0.215, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xffc53d, { roughness: 0.5 }), 0, 1.24, 0));
      g.add(cyl(0.27, 0.27, 0.03, 0xeaa100, 0, 1.25, 0.02, 24));
    } else {
      const hair = mesh(new T.SphereGeometry(0.215, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), mat(o.hair || 0x2b1d16), 0, 1.2, -0.015);
      hair.rotation.x = -0.35; g.add(hair);
    }
    if (o.bag) { // go bag on the back
      g.add(box(0.3, 0.34, 0.14, o.bag, 0, 0.84, -0.22, { roughness: 0.7 }));
      g.add(box(0.26, 0.12, 0.05, 0x1b8a4a, 0, 0.74, -0.31));
      g.add(box(0.05, 0.36, 0.03, 0x0c5c3a, -0.1, 0.84, -0.155), box(0.05, 0.36, 0.03, 0x0c5c3a, 0.1, 0.84, -0.155));
    }
    if (o.cape) g.add(mesh(new T.CylinderGeometry(0.2, 0.3, 0.6, 16, 1, true, Math.PI * 0.6, Math.PI * 0.8), mat(0xf2760c, { side: T.DoubleSide }), 0, 0.72, 0.01));
    if (o.star) {
      const s = new T.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.035 : 0.085; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
      g.add(mesh(new T.ShapeGeometry(s), mat(0xffd24d, { roughness: 0.5 }), 0, 0.82, 0.18));
    }
    return shadows(g, true, false);
  }
  function kuboModel() {
    const g = new T.Group();
    [[-0.17, -0.12], [0.17, -0.12], [-0.17, 0.12], [0.17, 0.12]].forEach(([x, z]) => g.add(cyl(0.018, 0.018, 0.16, 0x7a5218, x, 0.08, z, 6)));
    g.add(box(0.42, 0.04, 0.32, 0xb98a3e, 0, 0.18, 0));
    g.add(box(0.36, 0.2, 0.26, 0xe3bf68, 0, 0.3, 0));
    g.add(box(0.08, 0.13, 0.01, 0x6b4a22, -0.06, 0.27, 0.131));
    const roof = mesh(new T.ConeGeometry(0.34, 0.3, 4), mat(0xc48a32), 0, 0.55, 0); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.85); g.add(roof);
    return shadows(g, true, true);
  }

  async function renderGallery(canvas, view) {
    await KidArt.ready();
    await Promise.all(['800 40px "Baloo 2"', '800 28px Nunito', '900 28px Nunito'].map(f => document.fonts.load(f)));
    const Wpx = canvas.clientWidth, Hpx = canvas.clientHeight;
    const renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(view.dpr || 2); renderer.setSize(Wpx, Hpx, false);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    const aniso = renderer.capabilities.getMaxAnisotropy();
    const tex = cv => { const t = new T.CanvasTexture(cv); t.anisotropy = aniso; return t; };

    const scene = new T.Scene(); scene.background = new T.Color(0xf3ead9);
    scene.add(new T.HemisphereLight(0xfffaf0, 0x9a8a72, 0.85));
    const sun = new T.DirectionalLight(0xffffff, 0.32); sun.position.set(-3, 9, 4); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 16, bottom: -16, near: 1, far: 40 }); sun.shadow.bias = -0.0005; sun.shadow.radius = 4;
    scene.add(sun);

    const ftex = tex(floorCanvas()); ftex.wrapS = ftex.wrapT = T.RepeatWrapping; ftex.repeat.set(7.8, 8.2);
    const floor = mesh(new T.PlaneGeometry(22, 23.5), new T.MeshStandardMaterial({ map: ftex, roughness: 0.55 }), 0, 0, -5.75); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const ceil = mesh(new T.PlaneGeometry(22, 23.5), mat(0xfbf8f2, { emissive: 0xcfc6b8, emissiveIntensity: 0.55 }), 0, CEIL, -5.75); ceil.rotation.x = Math.PI / 2; scene.add(ceil);

    const walls = new T.Group(); scene.add(walls);
    // walls along z (at x) or along x (at z), from a to b, with doorway gaps [from, to] in the same direction
    function wallZ(x, a, b, gaps, color) {
      let cur = a;
      gaps.concat([[b, b]]).forEach(([g0, g1]) => {
        if (cur - g0 > 0.01) walls.add(box(0.2, CEIL, cur - g0, color, x, CEIL / 2, (cur + g0) / 2));
        if (g0 - g1 > 0.01) walls.add(box(0.2, CEIL - DOOR_H, g0 - g1, color, x, (CEIL + DOOR_H) / 2, (g0 + g1) / 2));
        cur = g1;
      });
    }
    function wallX(z, a, b, gaps, color) {
      let cur = a;
      gaps.concat([[b, b]]).forEach(([g0, g1]) => {
        if (g0 - cur > 0.01) walls.add(box(g0 - cur, CEIL, 0.2, color, (cur + g0) / 2, CEIL / 2, z));
        if (g1 - g0 > 0.01) walls.add(box(g1 - g0, CEIL - DOOR_H, 0.2, color, (g0 + g1) / 2, (CEIL + DOOR_H) / 2, z));
        cur = g1;
      });
    }
    // a low wainscot with the four-pillar stripe, skipping doorways
    const pc = [PILLAR.prevent, PILLAR.ready, PILLAR.act, PILLAR.recover];
    function trimZ(x, a, b, gaps, sign) {
      let cur = a, k = 0;
      gaps.concat([[b, b]]).forEach(([g0, g1]) => {
        if (cur - g0 > 0.01) {
          walls.add(box(0.03, 0.55, cur - g0, WAINSCOT, x + sign * 0.015, 0.275, (cur + g0) / 2));
          for (let z = cur; z - 0.6 >= g0 - 0.001; z -= 0.6) walls.add(box(0.04, 0.08, 0.6, pc[k++ % 4], x + sign * 0.02, 0.59, z - 0.3));
        }
        cur = g1;
      });
    }
    function trimX(z, a, b, gaps, color) {
      let cur = a, k = 0;
      gaps.concat([[b, b]]).forEach(([g0, g1]) => {
        if (g0 - cur > 0.01) {
          walls.add(box(g0 - cur, 0.55, 0.03, WAINSCOT, (cur + g0) / 2, 0.275, z + 0.015));
          for (let x = cur; x + 0.56 <= g0 + 0.001; x += 0.56) walls.add(box(0.56, 0.08, 0.04, color != null ? color : pc[k++ % 4], x + 0.28, 0.59, z + 0.02));
        }
        cur = g1;
      });
    }
    function frameZ(x, z0, z1, color) { // coloured frame around a doorway in a wall along z
      walls.add(box(0.3, DOOR_H, 0.14, color, x, DOOR_H / 2, z0 + 0.07), box(0.3, DOOR_H, 0.14, color, x, DOOR_H / 2, z1 - 0.07), box(0.3, 0.14, z0 - z1 + 0.28, color, x, DOOR_H + 0.07, (z0 + z1) / 2));
    }
    function frameX(z, x0, x1, color) {
      walls.add(box(0.14, DOOR_H, 0.3, color, x0 - 0.07, DOOR_H / 2, z), box(0.14, DOOR_H, 0.3, color, x1 + 0.07, DOOR_H / 2, z), box(x1 - x0 + 0.28, 0.14, 0.3, color, (x0 + x1) / 2, DOOR_H + 0.07, z));
    }

    // main hall: x -4..4, z 5..-10; archways at z -2.7..-5.3 on both sides; doorway at x -1.2..1.2 at the far end
    const ARCH = [[-2.7, -5.3]], DOOR = [[-1.2, 1.2]];
    wallZ(-4.1, 5, -10.2, ARCH, WALL); wallZ(4.1, 5, -10.2, ARCH, WALL);
    wallX(-10.1, -4.2, 4.2, DOOR, WALL); walls.add(box(8.4, CEIL, 0.2, WALL, 0, CEIL / 2, 5.1));
    trimZ(-4.0, 5, -10, ARCH, 1); trimZ(4.0, 5, -10, ARCH, -1); trimX(-9.99, -4.0, 4.0, DOOR);
    frameZ(-4.0, -2.7, -5.3, PILLAR.prevent); frameZ(4.0, -2.7, -5.3, PILLAR.ready); frameX(-10.0, -1.2, 1.2, NAVY);
    // side rooms: Stop Hazards Early (left, blue) and Get Ready (right, green)
    [[-1, 0xdcebf3, PILLAR.prevent], [1, 0xdcf0e4, PILLAR.ready]].forEach(([s, tint, col]) => {
      const x0 = s < 0 ? -10.2 : 4.2, x1 = s < 0 ? -4.2 : 10.2;
      wallX(0.1, x0, x1, [], tint); wallX(-8.1, x0, x1, [], tint); wallZ(s * 10.1, 0.2, -8.2, [], tint);
      walls.add(box(5.8, 0.1, 0.04, col, s * 7.1, 0.6, -7.98), box(0.04, 0.1, 7.9, col, s * 9.98, 0.6, -4.0));
      const lamp = new T.PointLight(0xfff3dd, 0.55, 10, 1.2); lamp.position.set(s * 7, 3.6, -4); scene.add(lamp);
    });
    // Kuwentuhan Corner, through the far doorway
    const YEL = 0xffe2a0;
    wallZ(-4.1, -10.2, -16.8, [], YEL); wallZ(4.1, -10.2, -16.8, [], YEL); wallX(-16.9, -4.2, 4.2, [], YEL);
    walls.add(box(2.8, CEIL, 0.02, YEL, -2.6, CEIL / 2, -10.21), box(2.8, CEIL, 0.02, YEL, 2.6, CEIL / 2, -10.21));
    trimX(-16.79, -4.0, 4.0, [], PILLAR.story);
    shadows(walls, false, true);

    const room = new T.Group(); scene.add(room);
    const shelf = new T.Group(), r = rnd(5), bookCols = [0xe2382b, 0x2a6b8f, 0x128253, 0xf2760c, 0x7a53c6, 0xffc53d, 0xf07aa6, 0x1f8f8f];
    shelf.add(box(4.2, 2.4, 0.45, 0x9c6b3f, 0, 1.2, 0));
    for (let sI = 0; sI < 4; sI++) {
      shelf.add(box(4.0, 0.5, 0.3, 0x6e4826, 0, 0.36 + sI * 0.56, 0.1));
      let x = -1.95;
      while (x < 1.9) { const bw = 0.07 + r() * 0.07, bh = 0.32 + r() * 0.14; shelf.add(box(bw, bh, 0.26, bookCols[(r() * bookCols.length) | 0], x + bw / 2, 0.14 + sI * 0.56 + bh / 2, 0.14)); x += bw + 0.01; }
    }
    shelf.position.set(0, 0, -16.55); room.add(shelf);
    room.add(mesh(new T.PlaneGeometry(2.9, 0.63), new T.MeshStandardMaterial({ map: tex(signCanvas('📖 KUWENTUHAN', '#16303f', '#ffc53d')), transparent: true, roughness: 0.8 }), 0, 3.08, -16.78));
    room.add(cyl(1.7, 1.7, 0.02, 0xf2a33a, 0, 0.012, -13.6, 40), cyl(1.3, 1.3, 0.022, 0xffc53d, 0, 0.014, -13.6, 40));
    const bb1 = ball(0.5, PILLAR.recover, -1.15, 0.28, -15.0); bb1.scale.set(1, 0.62, 1); room.add(bb1);
    const bb2 = ball(0.5, PILLAR.prevent, 1.3, 0.28, -15.2); bb2.scale.set(1, 0.62, 1); room.add(bb2);
    shadows(room, true, true);
    const lamp = new T.PointLight(0xffe7b0, 0.9, 11, 1.2); lamp.position.set(0, 3.6, -13.4); scene.add(lamp);

    // signs: the museum banner over the far doorway, room names over the archways
    const banTex = tex(textCanvas(1600, 400, (c, w, h) => {
      c.fillStyle = '#16303f'; roundRect(c, 0, 0, w, h, 60); c.fill();
      drawLogo(c, 60, 60, 280);
      c.fillStyle = '#fff5df'; c.font = '800 200px "Baloo 2"'; c.textBaseline = 'alphabetic'; c.fillText('TANGHALAN', 390, 230);
      c.fillStyle = '#ffc53d'; c.font = '900 76px Nunito'; c.fillText('Bulwagan ng Bayanihan', 396, 330);
    }));
    scene.add(mesh(new T.PlaneGeometry(4.0, 1.0), new T.MeshStandardMaterial({ map: banTex, transparent: true, roughness: 0.8 }), 0, 3.62, -9.975));
    const signL = mesh(new T.PlaneGeometry(2.6, 0.56), new T.MeshStandardMaterial({ map: tex(signCanvas('🛡️ Stop Hazards Early', hex(PILLAR.prevent))), transparent: true, roughness: 0.8 }), -3.84, 3.62, -4.0); signL.rotation.y = Math.PI / 2; scene.add(signL);
    const signR = mesh(new T.PlaneGeometry(2.6, 0.56), new T.MeshStandardMaterial({ map: tex(signCanvas('🎒 Get Ready', hex(PILLAR.ready))), transparent: true, roughness: 0.8 }), 3.84, 3.62, -4.0); signR.rotation.y = -Math.PI / 2; scene.add(signR);

    // the works: [name, wall, along, width, centre height, frame, title, who, kind]
    // wall: L/R = main hall sides, F = main hall far wall, LB/RB = side rooms' back walls, KL/KR = Kuwentuhan sides
    const works = [
      ['baha', 'L', -7.6, 1.6, 1.5, PILLAR.act, 'Lumikas Agad!', 'Carlo, 11', 'Crayon on paper'],
      ['sunog', 'L', -0.7, 1.05, 1.55, PILLAR.act, 'Kapag May Sunog', 'Nico, 10', 'Crayon on paper'],
      ['bayanihan', 'R', -7.5, 2.0, 1.6, PILLAR.prevent, 'Bayanihan!', 'Ana, 10', 'Crayon on paper'],
      ['bahaghari', 'R', -0.7, 1.6, 1.5, PILLAR.recover, 'Babangon Tayo!', 'Paolo, 12', 'Crayon on paper'],
      ['kuwento', 'F', -2.65, 1.0, 1.65, PILLAR.story, 'Kuwento ni Ana', 'Ana, 10', 'Story'],
      ['tula', 'F', 2.65, 1.0, 1.65, PILLAR.story, 'Handa Kami', 'Paolo, 12', 'Poem'],
      ['tanim', 'LB', -6.3, 1.6, 1.5, PILLAR.prevent, 'Magtanim ng Puno', 'Mara, 9', 'Crayon on paper'],
      ['gobag', 'RB', 6.3, 1.05, 1.55, PILLAR.ready, 'Ang Go Bag Ko', 'Jun, Grade 3', 'Crayon on paper'],
      ['komiks', 'KL', -13.4, 1.6, 1.6, PILLAR.story, 'Si Bayani at ang Bagyo', 'Bea, 11', 'Comic'],
      ['liham', 'KR', -13.4, 1.0, 1.65, PILLAR.story, 'Liham kay Bayani', 'Jun, Grade 3', 'Letter']
    ];
    let featured = null;
    works.forEach(([name, wall, along, w, cy, frame, title, who, kind]) => {
      const g = painting(name, w, frame, tex(KidArt.draw(name))), h = g.userData.h;
      const pl = placard(tex(placardCanvas(title, who, kind, hex(frame))));
      const sp = new T.SpotLight(0xfff3dd, view.spot || 0.55, 0, 0.42, 0.75, 1), tgt = new T.Object3D();
      if (wall === 'L' || wall === 'KL') { g.rotation.y = pl.rotation.y = Math.PI / 2; g.position.set(-3.96, cy, along); pl.position.set(-3.98, 1.0, along + w / 2 + 0.38); sp.position.set(-2.5, 4.1, along); tgt.position.set(-4, cy, along); }
      else if (wall === 'R' || wall === 'KR') { g.rotation.y = pl.rotation.y = -Math.PI / 2; g.position.set(3.96, cy, along); pl.position.set(3.98, 1.0, along - w / 2 - 0.38); sp.position.set(2.5, 4.1, along); tgt.position.set(4, cy, along); }
      else { const z = wall === 'F' ? -9.96 : -7.96; g.position.set(along, cy, z); pl.position.set(along + (along < 0 ? 1 : -1) * (w / 2 + 0.38), 1.0, z - 0.02); sp.position.set(along, 4.1, z + 1.6); tgt.position.set(along, cy, z); }
      shadows(g, false, true); scene.add(g, pl);
      sp.target = tgt; scene.add(sp, tgt);
      scene.add(cyl(0.07, 0.1, 0.18, 0x2b3a44, sp.position.x, 4.1, sp.position.z, 10));
      if (name === 'bayanihan') featured = { x: 3.96, y: cy, z: along, h: h };
    });
    scene.add(box(0.06, 0.05, 14, 0x2b3a44, -2.5, 4.17, -3), box(0.06, 0.05, 14, 0x2b3a44, 2.5, 4.17, -3));

    // story stands with open books: one in the main hall, two in the Kuwentuhan Corner
    const bookA = tex(bookCanvas('Si Bayani at ang Baha', ['Umuulan nang malakas.', 'Tumataas ang tubig sa ilog.', '"Lumikas na tayo!" sabi', 'ni Bayani. Dala nila', 'ang go bag.'], KidArt.draw('baha')));
    const bookB = tex(bookCanvas('Ang Bahay sa Tabi ng Ilog', ['Tuwing may bagyo,', 'umaapaw ang ilog.', 'Nagtulong-tulong ang', 'barangay na ilipat', 'ang bahay.'], KidArt.draw('bayanihan')));
    const bookC = tex(bookCanvas('Handa Kami', ['Kapag dumilim ang langit,', 'hindi ako matatakot.', 'May flashlight sa aking bag,', 'may tubig, pito, at gamot.'], KidArt.draw('gobag')));
    const sa = view.standA || [-2.35, -2.0, 1.0];
    const standA = storyStand(bookA); standA.position.set(sa[0], 0, sa[1]); standA.rotation.y = sa[2]; scene.add(standA);
    const standB = storyStand(bookB); standB.position.set(-1.7, 0, -12.7); standB.rotation.y = 0.25; scene.add(standB);
    const standC = storyStand(bookC); standC.position.set(1.8, 0, -13.0); standC.rotation.y = -0.3; scene.add(standC);
    const readBub = new T.Sprite(new T.SpriteMaterial({ map: tex(bubbleCanvas('📖', '#eaa100')), transparent: true }));
    readBub.scale.set(0.5, 0.5, 1); readBub.position.set(sa[0], 1.78, sa[1]); scene.add(readBub);

    // bench, a clay bahay kubo on a plinth, plants
    const bench = new T.Group();
    bench.add(box(2.2, 0.1, 0.5, 0xb07a3c, 0, 0.45, 0, { roughness: 0.6 }), box(0.08, 0.42, 0.42, 0x3d3127, -0.95, 0.21, 0), box(0.08, 0.42, 0.42, 0x3d3127, 0.95, 0.21, 0));
    bench.position.set(0.1, 0, -5.6); shadows(bench, true, true); scene.add(bench);
    scene.add(shadows(box(0.7, 0.9, 0.7, 0xffffff, -2.5, 0.45, -8.4), true, true));
    const model = kuboModel(); model.scale.setScalar(1.2); model.position.set(-2.5, 0.9, -8.4); model.rotation.y = 0.5; scene.add(model);
    [[-3.5, -9.45], [3.5, -9.45]].forEach(([x, z]) => {
      const pot = new T.Group(); pot.add(cyl(0.2, 0.15, 0.38, 0xc2673a, 0, 0.19, 0)); pot.add(ball(0.36, 0x3f9a4a, 0, 0.7, 0)); pot.add(ball(0.26, 0x55b85e, 0.1, 0.96, 0.05));
      pot.position.set(x, 0, z); shadows(pot, true, true); scene.add(pot);
    });

    // the player (walking, go bag on the back) and Bayani, the guide
    const me = kid({ shirt: 0xf2760c, bag: 0x2fa84f, stride: 0.35, hair: 0x2b1d16 });
    me.position.set(view.me[0], 0, view.me[1]); me.rotation.y = view.me[2]; scene.add(me);
    const bp = view.bayani || [2.45, -6.3, -0.3];
    const bayani = kid({ shirt: 0x1f6f8b, hat: true, face: true, cape: true, star: true, wave: true, skin: 0xe8ab70, pants: 0x35506b });
    bayani.position.set(bp[0], 0, bp[1]); bayani.rotation.y = bp[2]; scene.add(bayani);
    if (featured) {
      const ring = mesh(new T.RingGeometry(0.46, 0.6, 48), new T.MeshBasicMaterial({ color: 0xffc53d, transparent: true, opacity: 0.95 }), 3.05, 0.015, featured.z); ring.rotation.x = -Math.PI / 2; scene.add(ring);
      const disc = mesh(new T.CircleGeometry(0.46, 48), new T.MeshBasicMaterial({ color: 0xffe58a, transparent: true, opacity: 0.35 }), 3.05, 0.014, featured.z); disc.rotation.x = -Math.PI / 2; scene.add(disc);
      const bub = new T.Sprite(new T.SpriteMaterial({ map: tex(bubbleCanvas('👀', '#f2760c')), transparent: true }));
      bub.scale.set(0.55, 0.55, 1); bub.position.set(featured.x - 0.35, featured.y + featured.h / 2 + 0.5, featured.z); scene.add(bub);
    }

    const cam = new T.PerspectiveCamera(view.fov, Wpx / Hpx, 0.05, 80);
    cam.position.set(view.cam[0], view.cam[1], view.cam[2]); cam.lookAt(view.look[0], view.look[1], view.look[2]);
    renderer.render(scene, cam);
    return renderer;
  }
  window.renderGallery = renderGallery;
})();
