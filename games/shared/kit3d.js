'use strict';
/* Kit3D, the small 3D toolkit shared by the order games (Quake in Order and the first aid games).
   It uses the global THREE (r128), like the library's other 3D games. It gives a scene with materials by role in two
   palettes (lively and minimal), simple shapes, a poseable figure, smooth tracks for moving figures, a camera that eases
   between framings, labels that follow points in 3D, and a helper for building a simulation out of segments.
   With no WebGL, init() returns false and the game shows drawings instead. */
(function () {
  const PI = Math.PI;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
  const angLerp = (a, b, k) => { let d = b - a; while (d > PI) d -= 2 * PI; while (d < -PI) d += 2 * PI; return a + d * k; };

  // keyframes with absolute times T: the value of `key` at time T, eased between keys
  function evalKeys(keys, T, key) {
    if (!keys || !keys.length) return 0;
    if (T <= keys[0].T) return keys[0][key];
    for (let i = 0; i < keys.length - 1; i++) if (T < keys[i + 1].T) { const a = keys[i], b = keys[i + 1]; return lerp(a[key], b[key], sstep((T - a.T) / Math.max(1e-6, b.T - a.T))); }
    return keys[keys.length - 1][key];
  }

  // people in both looks; each game adds the roles of its own scene (and must give 'bg')
  const PEOPLE = {
    lively: { skin: 0xe0a066, skin2: 0xc98a55, hair: 0x2b2220, uniform: 0xffffff, pants: 0x2f4f8f, skirt: 0x2f4f8f, cap: 0xffc53d, teacher: 0xd65a7a, shoe: 0x2b2b30, eye: 0x1e1a18 },
    minimal: { skin: 0xd8b08c, skin2: 0xc7a07c, hair: 0x2f2b29, uniform: 0xffffff, pants: 0x4a5566, skirt: 0x4a5566, cap: 0xf2760c, teacher: 0x8796a4, shoe: 0x3a3a3a, eye: 0x1e1a18 }
  };
  // poses: hips height, torso pitch, neck pitch and turn, shoulders [pitch, roll] for each arm, elbows, hips, knees
  const POSE = {
    stand: { hy: 0.62, tp: 0.02, nk: 0, sh: [[0.06, 0.1], [0.06, -0.1]], el: [-0.15, -0.15], hp: [0, 0], kn: [0, 0] },
    sit: { hy: 0.43, tp: 0.08, nk: 0.18, sh: [[-0.8, 0.12], [-0.8, -0.12]], el: [-0.95, -0.95], hp: [-1.45, -1.45], kn: [1.45, 1.45] },
    reach: { hy: 0.62, tp: 0.12, nk: 0.05, sh: [[-1.35, 0.06], [0.08, -0.1]], el: [-0.2, -0.15], hp: [0.12, -0.12], kn: [0.05, 0.05] },
    count: { hy: 0.62, tp: 0, nk: -0.05, sh: [[-2.4, 0.25], [0.06, -0.1]], el: [-0.2, -0.15], hp: [0, 0], kn: [0, 0] }
  };

  function create(cfg) {
    const THREE = window.THREE;
    const K = { ready: false, PI, clamp, lerp, sstep, angLerp, evalKeys };
    const PAL = { lively: Object.assign({}, PEOPLE.lively, cfg.pal.lively), minimal: Object.assign({}, PEOPLE.minimal, cfg.pal.minimal) };
    K.POSE = Object.assign({}, POSE, cfg.poses || {});
    const mats = {};
    K.color = (role) => PAL[cfg.look()][role];
    K.hex = (role) => '#' + K.color(role).toString(16).padStart(6, '0');
    K.mat = (role) => {
      if (!mats[role]) {
        if (K.color(role) === undefined) console.error('Kit3D: no color for the role ' + role); // every role needs a color in both looks
        mats[role] = new THREE.MeshLambertMaterial({ color: K.color(role) });
      }
      return mats[role];
    };
    K.recolor = () => {
      for (const r in mats) { const c = K.color(r); if (c === undefined) console.error('Kit3D: no color for the role ' + r); else mats[r].color.setHex(c); }
      if (K.scene) K.scene.background.setHex(K.color('bg'));
    };

    K.init = (canvas) => {
      let r = null;
      try { if (THREE) r = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch (e) { r = null; }
      if (!r) return false;
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      K.renderer = r; K.canvas = canvas;
      const sc = new THREE.Scene(); K.scene = sc; sc.background = new THREE.Color(K.color('bg'));
      K.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 80);
      sc.add(new THREE.HemisphereLight(0xffffff, 0x8f8676, 0.92));
      const dl = new THREE.DirectionalLight(0xffffff, 0.58); dl.position.set(4, 9, 6); sc.add(dl);
      const fl = new THREE.DirectionalLight(0xffffff, 0.2); fl.position.set(-7, 4, 3); sc.add(fl);
      return true;
    };

    // shapes
    K.box = (w, h, d, role, x, y, z, par) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), K.mat(role)); m.position.set(x, y, z); (par || K.scene).add(m); return m; };
    K.cyl = (rt, rb, h, role, x, y, z, par, seg) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 14), K.mat(role)); m.position.set(x, y, z); (par || K.scene).add(m); return m; };
    K.sph = (r, role, x, y, z, par) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), K.mat(role)); m.position.set(x, y, z); (par || K.scene).add(m); return m; };
    K.blob = (r, par) => {
      const m = new THREE.Mesh(new THREE.CircleGeometry(r, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16, depthWrite: false }));
      m.rotation.x = -PI / 2; m.position.y = 0.012; (par || K.scene).add(m); return m;
    };
    K.textTex = (text, w, h, bg, fg, font) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
      if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
      g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 2);
      const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
    };
    // a flat sign facing +z (rotate it to face another way), drawn on a canvas
    K.sign = (draw, w, h, pw, ph, x, y, z, ry, par) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
      m.position.set(x, y, z); m.rotation.y = ry || 0; (par || K.scene).add(m); return m;
    };

    /* a simple poseable figure: hips, torso, neck, two arms (shoulder, elbow), two legs (hip, knee).
       o: roles for top, bottom, skin, hair (and legs, skirt, cap), size s, longHair, long (skirt) */
    K.figure = (o) => {
      const s = o.s || 1, root = new THREE.Group(), hips = new THREE.Group(); root.add(hips);
      K.cyl(0.135 * s, 0.13 * s, 0.13 * s, o.bottom, 0, -0.02 * s, 0, hips);
      if (o.skirt) K.cyl(0.14 * s, 0.22 * s, (o.long ? 0.5 : 0.24) * s, o.skirt, 0, -(o.long ? 0.24 : 0.11) * s, 0, hips);
      const torso = new THREE.Group(); hips.add(torso);
      K.cyl(0.152 * s, 0.137 * s, 0.4 * s, o.top, 0, 0.2 * s, 0, torso);
      const shc = K.sph(0.152 * s, o.top, 0, 0.39 * s, 0, torso); shc.scale.set(1, 0.42, 0.85);
      const neck = new THREE.Group(); neck.position.y = 0.42 * s; torso.add(neck);
      K.cyl(0.05 * s, 0.055 * s, 0.08 * s, o.skin, 0, 0.03 * s, 0, neck);
      K.sph(0.155 * s, o.skin, 0, 0.17 * s, 0, neck);
      const hair = K.sph(0.163 * s, o.hair, 0, 0.205 * s, -0.03 * s, neck); hair.scale.set(1, o.longHair ? 1.0 : 0.82, 1);
      if (o.longHair) { const h2 = K.sph(0.15 * s, o.hair, 0, 0.1 * s, -0.07 * s, neck); h2.scale.set(1.02, 1.25, 0.8); }
      for (const sd of [1, -1]) K.sph(0.019 * s, 'eye', 0.055 * s * sd, 0.18 * s, 0.142 * s, neck);
      if (o.cap) {
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.172 * s, 18, 10, 0, PI * 2, 0, PI * 0.5), K.mat(o.cap)); dome.position.set(0, 0.205 * s, -0.005 * s); neck.add(dome);
        const brim = K.box(0.22 * s, 0.022 * s, 0.14 * s, o.cap, 0, 0.215 * s, 0.17 * s, neck); brim.rotation.x = 0.12;
      }
      const arms = [], legs = [], hands = [];
      for (const sd of [1, -1]) {
        const sh = new THREE.Group(); sh.position.set(0.19 * s * sd, 0.37 * s, 0); torso.add(sh);
        K.cyl(0.058 * s, 0.054 * s, 0.11 * s, o.top, 0, -0.04 * s, 0, sh);
        K.cyl(0.044 * s, 0.04 * s, 0.22 * s, o.skin, 0, -0.12 * s, 0, sh);
        const el = new THREE.Group(); el.position.y = -0.225 * s; sh.add(el);
        K.cyl(0.039 * s, 0.035 * s, 0.2 * s, o.skin, 0, -0.1 * s, 0, el);
        hands.push(K.sph(0.046 * s, o.hands || o.skin, 0, -0.215 * s, 0, el));
        arms.push({ sh, el });
        const hp = new THREE.Group(); hp.position.set(0.074 * s * sd, -0.04 * s, 0); hips.add(hp);
        K.cyl(0.064 * s, 0.058 * s, 0.17 * s, o.bottom, 0, -0.07 * s, 0, hp);
        K.cyl(0.052 * s, 0.046 * s, 0.3 * s, o.legs || o.skin, 0, -0.17 * s, 0, hp);
        const kn = new THREE.Group(); kn.position.y = -0.3 * s; hp.add(kn);
        K.cyl(0.047 * s, 0.042 * s, 0.28 * s, o.legs || o.skin, 0, -0.14 * s, 0, kn);
        K.box(0.09 * s, 0.06 * s, 0.17 * s, 'shoe', 0, -0.285 * s, 0.035 * s, kn);
        legs.push({ hp, kn });
      }
      const shadow = K.blob(0.3 * s); K.scene.add(root);
      return { root, hips, torso, neck, arms, legs, hands, s, shadow };
    };
    K.show = (F, vis) => { F.root.visible = vis; F.shadow.visible = vis; };

    K.blendPose = (a, b, k) => {
      const r = { hy: lerp(a.hy, b.hy, k), tp: lerp(a.tp, b.tp, k), nk: lerp(a.nk, b.nk, k), ny: lerp(a.ny || 0, b.ny || 0, k), sh: [], el: [], hp: [], kn: [] };
      for (let i = 0; i < 2; i++) {
        r.sh.push([lerp(a.sh[i][0], b.sh[i][0], k), lerp(a.sh[i][1], b.sh[i][1], k)]);
        r.el.push(lerp(a.el[i], b.el[i], k)); r.hp.push(lerp(a.hp[i], b.hp[i], k)); r.kn.push(lerp(a.kn[i], b.kn[i], k));
      }
      return r;
    };
    // gait: walk, run or crawl, faded in by gaitK; T drives the swing
    K.applyPose = (F, p, gait, gaitK, T) => {
      const s = F.s;
      let hy = p.hy, tp = p.tp;
      const sh = p.sh.map((v) => v.slice()), el = p.el.slice(), hp = p.hp.slice(), kn = p.kn.slice();
      if (gait && gaitK > 0) {
        const run = gait === 'run', sp = run ? 13 : 8.5, ph = T * sp, A = (run ? 0.75 : 0.48) * gaitK;
        if (gait === 'crawl') { hy += 0.025 * Math.abs(Math.sin(ph)) * gaitK; sh[0][0] += 0.25 * Math.sin(ph) * gaitK; sh[1][0] -= 0.25 * Math.sin(ph) * gaitK; }
        else {
          hp[0] += A * Math.sin(ph); hp[1] -= A * Math.sin(ph);
          kn[0] += (run ? 0.9 : 0.55) * gaitK * Math.max(0, Math.sin(ph + 1.3)); kn[1] += (run ? 0.9 : 0.55) * gaitK * Math.max(0, Math.sin(ph + 1.3 + PI));
          sh[0][0] -= A * 0.9 * Math.sin(ph); sh[1][0] += A * 0.9 * Math.sin(ph);
          if (run) { el[0] -= 0.9 * gaitK; el[1] -= 0.9 * gaitK; tp += 0.22 * gaitK; }
          hy -= 0.018 * Math.abs(Math.sin(ph)) * gaitK;
        }
      }
      F.hips.position.y = hy * s; F.torso.rotation.x = tp; F.neck.rotation.set(p.nk, p.ny || 0, 0);
      for (let i = 0; i < 2; i++) {
        F.arms[i].sh.rotation.set(sh[i][0], 0, sh[i][1]); F.arms[i].el.rotation.x = el[i];
        F.legs[i].hp.rotation.x = hp[i]; F.legs[i].kn.rotation.x = kn[i];
      }
    };
    K.place = (F, x, z, f, roll) => { F.root.position.set(x, 0, z); F.root.rotation.set(0, f, roll || 0); F.shadow.position.set(x, 0.012, z); };
    // a figure's track (keys with t, pose, x, z, f and flags): where it is and how it stands at time tau
    K.evalTrack = (keys, tau) => {
      const P = K.POSE;
      if (!keys.length) return null;
      if (tau <= keys[0].t) return { p: P[keys[0].pose], x: keys[0].x, z: keys[0].z, f: keys[0].f, gait: null, gk: 0, key: keys[0] };
      for (let i = 0; i < keys.length - 1; i++) {
        const a = keys[i], b = keys[i + 1];
        if (tau < b.t) {
          const u = (tau - a.t) / Math.max(1e-6, b.t - a.t), k = sstep(u), moving = (a.x !== b.x || a.z !== b.z);
          const gait = b.run ? 'run' : b.walk ? 'walk' : b.crawl ? 'crawl' : null;
          const lin = gait ? u : k;
          return { p: K.blendPose(P[a.pose], P[b.pose], k), x: lerp(a.x, b.x, lin), z: lerp(a.z, b.z, lin), f: angLerp(a.f, b.f, Math.min(1, k * 1.6)),
            gait: moving ? gait : null, gk: moving ? Math.sin(PI * clamp(u, 0, 1)) * 0.6 + 0.4 : 0, wobble: b.wobble, key: b, prev: a, u };
        }
      }
      const l = keys[keys.length - 1];
      return { p: P[l.pose], x: l.x, z: l.z, f: l.f, gait: null, gk: 0, key: l, prev: l, u: 1 };
    };

    // the camera eases between framings (cfg.cams: name -> {p, t}, and optionally pp and pt for tall, narrow screens), with an optional shake
    K.camView = (v) => {
      const c = cfg.cams[v] || cfg.cams.wide, tall = c.pp && K.camera && K.camera.aspect < 0.75;
      const p = tall ? c.pp : c.p, t = tall ? (c.pt || c.t) : c.t;
      return { p: new THREE.Vector3(p[0], p[1], p[2]), t: new THREE.Vector3(t[0], t[1], t[2]) };
    };
    K.camFollow = (T, camKeys, shake) => {
      let ci = -1; for (let i = 0; i < camKeys.length; i++) if (T >= camKeys[i].T) ci = i;
      const cur = ci >= 0 ? camKeys[ci] : { T: 0, v: 'wide' }, prev = ci > 0 ? camKeys[ci - 1] : { T: 0, v: cur.v };
      const A = K.camView(prev.v), B = K.camView(cur.v), ck = sstep((T - cur.T) / 0.9);
      const cp = A.p.clone().lerp(B.p, ck), ct = A.t.clone().lerp(B.t, ck);
      if (shake) { cp.x += 0.035 * shake * Math.sin(T * 37); cp.y += 0.03 * shake * Math.sin(T * 43 + 1); }
      K.camera.position.copy(cp); K.camera.lookAt(ct);
    };

    // labels over the scene
    K.tags = {};
    K.tag = (key, text, cls) => {
      let el = K.tags[key];
      if (!el) { el = document.createElement('div'); el.className = 'tag ' + (cls || ''); K.olay.appendChild(el); K.tags[key] = el; }
      if (el.textContent !== text) el.textContent = text;
      return el;
    };
    // a label stays inside the view; its pointer still points at the spot
    K.placeTag = (el, x, y, z) => {
      const v = new THREE.Vector3(x, y, z).project(K.camera), host = K.host;
      if (v.z > 1 || !host) { el.style.display = 'none'; return; }
      el.style.display = 'block';
      const W = host.clientWidth, px = (v.x + 1) / 2 * W, half = el.offsetWidth / 2, m = 4;
      const cx = 2 * (half + m) < W ? clamp(px, half + m, W - half - m) : px;
      el.style.left = cx + 'px'; el.style.top = ((1 - v.y) / 2 * host.clientHeight) + 'px';
      el.style.setProperty('--ax', clamp(px - cx, -Math.max(0, half - 10), Math.max(0, half - 10)) + 'px');
    };
    K.showTag = (key, text, cls, x, y, z) => K.placeTag(K.tag(key, text, cls), x, y, z);
    K.hideTag = (key) => { if (K.tags[key]) K.tags[key].style.display = 'none'; };
    K.clearTags = () => { for (const k in K.tags) K.tags[k].remove(); K.tags = {}; };

    // mount the canvas in a host element (the intro's picture or the simulation view), with the label layer
    K.mount = (host, olay) => {
      let wrap = host.querySelector('.stagewrap');
      if (!wrap) { wrap = document.createElement('div'); wrap.className = 'stagewrap'; host.insertBefore(wrap, host.firstChild); }
      wrap.appendChild(K.canvas);
      if (olay.parentNode !== host) host.insertBefore(olay, wrap.nextSibling);
      K.olay = olay; K.host = host;
      K.resize();
    };
    K.resize = () => {
      if (!K.renderer || !K.host) return;
      const w = K.host.clientWidth || 300, h = K.host.clientHeight || 300;
      K.renderer.setSize(w, h, false); K.camera.aspect = w / h;
      // keep the scene framed on tall, narrow screens
      K.camera.fov = w / h < 0.75 ? 56 : w / h < 1 ? 50 : 44;
      K.camera.updateProjectionMatrix();
    };
    K.render = () => K.renderer.render(K.scene, K.camera);
    return K;
  }

  /* Building a simulation. Each step is a segment: the player's keyframes (t is within the segment), camera cuts,
     events (things that happen, like a book falling), and other tracks (like a door's angle). join() lays the segments
     end to end and turns their times into one timeline (T). */
  function seq(SPOT) {
    const S = {};
    S.seg = (st, step) => ({ step, grade: 'ok', msg: '', t: 0, dur: 0, kid: [Object.assign({ t: 0 }, st.kid)], events: [], cams: [], keys: {} });
    S.mv = (s, st, dt, pose, spot, o) => {
      o = o || {};
      s.t += dt;
      const p = spot ? (typeof spot === 'string' ? SPOT[spot] : spot) : st.kid;
      st.kid = Object.assign({ pose, x: p.x, z: p.z, f: o.f !== undefined ? o.f : p.f }, o.flags || {});
      s.kid.push(Object.assign({ t: s.t, walk: !!o.walk, run: !!o.run, crawl: !!o.crawl, wobble: !!o.wobble }, st.kid));
    };
    S.hold = (s, st, dt) => { s.t += dt; s.kid.push(Object.assign({ t: s.t }, st.kid)); };
    S.cam = (s, v, t) => { s.cams.push({ t: t === undefined ? s.t : t, v }); };
    S.ev = (s, e, x) => { s.events.push(Object.assign({ t: s.t, e }, x || {})); };
    S.key = (s, track, k, t) => { (s.keys[track] = s.keys[track] || []).push(Object.assign({ t: t === undefined ? s.t : t }, k)); };
    S.done = (s, tail) => { s.dur = s.t + (tail === undefined ? 0.45 : tail); return s; };
    S.join = (segs) => {
      let T = 0; const evs = [], camKeys = [], tracks = {};
      for (const s of segs) {
        s.T0 = T;
        for (const e of s.events) evs.push(Object.assign({}, e, { T: T + e.t }));
        for (const c of s.cams) camKeys.push({ T: T + c.t, v: c.v });
        for (const k in s.keys) for (const x of s.keys[k]) (tracks[k] = tracks[k] || []).push(Object.assign({}, x, { T: T + x.t }));
        T += s.dur;
      }
      for (const k in tracks) tracks[k].sort((a, b) => a.T - b.T);
      return { segs, total: T, evs, camKeys, tracks, results: segs.filter((s) => s.step).map((s) => ({ id: s.step, grade: s.grade, msg: s.msg })) };
    };
    return S;
  }

  window.Kit3D = { create, seq, evalKeys, PI, clamp, lerp, sstep, angLerp };
})();
