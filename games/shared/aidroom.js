'use strict';
/* AidRoom: the first aid classroom shared by the first aid order games (Heart in Order for CPR and the bleeding
   control game). A school clinic room in a cutaway, like the Quake in Order classroom: a bench where the class sits,
   Nurse Lea, the green first aid sign (a white cross on green, never a red cross: RA 10530 protects the red cross),
   an AED cabinet with the AED sign, a poster, a clock, a door and a window. Each game adds its own practice props
   (a manikin on a mat, a practice arm on a table) and its own steps. Uses Kit3D (games/shared/kit3d.js). */
(function () {
  const PI = Math.PI;
  const BW = -2.5, LW = -3.4; // the back wall and the left wall

  const PAL = {
    lively: { bg: 0xd9eef6, floor: 0xe8d3ad, floorLine: 0xd6bd92, wall: 0xf4f8f3, wallOut: 0xdfe8e0, trim: 0x7fb7a8, stripe: 0xbfe0d6,
      door: 0x4f9fd1, frame: 0x7d5532, knob: 0xe8c040, glass: 0xbfe3f2, winFrame: 0xffffff, bench: 0xc98f55, benchLeg: 0x7d5532,
      nurse: 0x2fa39a, nurse2: 0x1f7f78, cab: 0xffffff, cabEdge: 0x1e9c5a, clock: 0xffffff, ink: 0x2b2b30,
      aed: 0xf5c518, aedDark: 0x3a3f45, aedBtn: 0xf2760c, socket: 0xffffff, cord: 0x4a4f55 },
    minimal: { bg: 0xeef0f0, floor: 0xe4e1db, floorLine: 0xd8d4cc, wall: 0xf7f6f3, wallOut: 0xe8e6e1, trim: 0xc9c4ba, stripe: 0xe2ded6,
      door: 0xa8a39a, frame: 0x8e877c, knob: 0x6b6b6b, glass: 0xd4e2e8, winFrame: 0xffffff, bench: 0xbdb3a3, benchLeg: 0x8e877c,
      nurse: 0x7f9da0, nurse2: 0x5f7a7d, cab: 0xffffff, cabEdge: 0x8e877c, clock: 0xffffff, ink: 0x2b2b30,
      aed: 0xd9cf9a, aedDark: 0x4a4a4a, aedBtn: 0x1c2226, socket: 0xffffff, cord: 0x5a5a5a }
  };

  // first aid poses: kneeling beside a manikin, pushing, tapping, looking, a phone on speaker, standing clear,
  // carrying, crouching, looking around, and pressing down on a table
  const POSES = {
    kneel: { hy: 0.39, tp: 0.1, nk: 0.15, sh: [[0.1, 0.12], [0.1, -0.12]], el: [-0.3, -0.3], hp: [0, 0], kn: [1.57, 1.57] },
    compress: { hy: 0.4, tp: 0.5, nk: 0.45, sh: [[-0.55, -0.36], [-0.55, 0.36]], el: [0, 0], hp: [-0.12, -0.12], kn: [1.69, 1.69] },
    tap: { hy: 0.4, tp: 0.42, nk: 0.35, sh: [[-0.8, -0.05], [-0.8, 0.05]], el: [-0.25, -0.25], hp: [-0.1, -0.1], kn: [1.67, 1.67] },
    look: { hy: 0.35, tp: 0.85, nk: 0.05, ny: 0.9, sh: [[-0.55, 0.12], [-0.55, -0.12]], el: [-1.0, -1.0], hp: [-0.4, -0.4], kn: [1.95, 1.95] },
    kphone: { hy: 0.39, tp: 0.12, nk: 0.4, sh: [[-1.0, -0.15], [0.1, -0.12]], el: [-1.2, -0.3], hp: [0, 0], kn: [1.57, 1.57] },
    phone: { hy: 0.62, tp: 0.04, nk: 0.4, sh: [[-1.0, -0.15], [0.06, -0.1]], el: [-1.2, -0.15], hp: [0, 0], kn: [0, 0] },
    clear: { hy: 0.39, tp: -0.08, nk: 0.1, sh: [[-0.3, 0.8], [-0.3, -0.8]], el: [-1.6, -1.6], hp: [0, 0], kn: [1.57, 1.57] },
    kreach: { hy: 0.4, tp: 0.45, nk: 0.35, sh: [[-1.0, 0.25], [-0.2, -0.1]], el: [-0.1, -0.3], hp: [-0.15, -0.15], kn: [1.72, 1.72] },
    carry: { hy: 0.62, tp: 0.05, nk: 0.1, sh: [[-0.75, -0.3], [-0.75, 0.3]], el: [-0.85, -0.85], hp: [0, 0], kn: [0, 0] },
    crouch: { hy: 0.36, tp: 0.6, nk: 0.25, sh: [[-1.0, -0.2], [-1.0, 0.2]], el: [-0.3, -0.3], hp: [-1.3, -1.3], kn: [2.25, 2.25] },
    lookL: { hy: 0.62, tp: 0.02, nk: 0.05, ny: 0.85, sh: [[0.06, 0.1], [0.06, -0.1]], el: [-0.15, -0.15], hp: [0, 0], kn: [0, 0] },
    lookR: { hy: 0.62, tp: 0.02, nk: 0.05, ny: -0.85, sh: [[0.06, 0.1], [0.06, -0.1]], el: [-0.15, -0.15], hp: [0, 0], kn: [0, 0] },
    point: { hy: 0.62, tp: 0.02, nk: 0.05, sh: [[-1.45, -0.05], [0.06, -0.1]], el: [-0.05, -0.15], hp: [0, 0], kn: [0, 0] },
    press: { hy: 0.6, tp: 0.42, nk: 0.4, sh: [[-0.75, -0.32], [-0.75, 0.32]], el: [-0.1, -0.1], hp: [-0.25, -0.25], kn: [0.12, 0.12] },
    hands: { hy: 0.6, tp: 0.3, nk: 0.45, sh: [[-0.9, -0.25], [-0.9, 0.25]], el: [-0.7, -0.7], hp: [-0.15, -0.15], kn: [0.08, 0.08] }
  };

  // where people are: the class sits on the bench by the back wall; Nurse Lea stands to the right of the practice spot
  const SEATS = { you: { x: 0.3, z: -1.9, f: 0 }, mates: [{ x: -1.05, z: -1.9, f: 0 }, { x: -0.42, z: -1.9, f: 0 }, { x: 1.0, z: -1.9, f: 0 }] };
  const NURSE = { x: 1.45, z: -0.45, f: -1.14 };
  const SOCKET = { x: -1.75, y: 0.32, z: BW + 0.07 };
  const CABINET = { x: -2.45, y: 1.15, z: BW + 0.16 };

  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  // the first aid sign: a white cross on a green square (ISO 7010 E003)
  const drawFirstAid = (g, w, h) => {
    g.fillStyle = '#1e9c5a'; rr(g, 2, 2, w - 4, h - 4, w * 0.08); g.fill();
    g.fillStyle = '#fff'; const a = w * 0.2;
    g.fillRect(w / 2 - a / 2, h * 0.2, a, h * 0.6); g.fillRect(w * 0.2, h / 2 - a / 2, w * 0.6, a);
  };
  // the AED sign: a white heart with a lightning bolt on green, and a small white cross
  const heart = (g, cx, cy, s) => {
    g.beginPath(); g.moveTo(cx, cy + 0.36 * s);
    g.bezierCurveTo(cx - 0.62 * s, cy - 0.02 * s, cx - 0.42 * s, cy - 0.5 * s, cx - 0.17 * s, cy - 0.46 * s);
    g.bezierCurveTo(cx - 0.05 * s, cy - 0.44 * s, cx, cy - 0.32 * s, cx, cy - 0.3 * s);
    g.bezierCurveTo(cx, cy - 0.32 * s, cx + 0.05 * s, cy - 0.44 * s, cx + 0.17 * s, cy - 0.46 * s);
    g.bezierCurveTo(cx + 0.42 * s, cy - 0.5 * s, cx + 0.62 * s, cy - 0.02 * s, cx, cy + 0.36 * s); g.closePath();
  };
  const bolt = (g, cx, cy, s) => {
    const P = [[0.06, -0.34], [-0.13, 0.02], [0.0, 0.02], [-0.07, 0.3], [0.14, -0.06], [0.01, -0.06], [0.1, -0.34]];
    g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(cx + x * s, cy + y * s) : g.moveTo(cx + x * s, cy + y * s))); g.closePath();
  };
  const drawAedSign = (g, w, h) => {
    g.fillStyle = '#1e9c5a'; rr(g, 2, 2, w - 4, h - 4, w * 0.08); g.fill();
    g.fillStyle = '#fff'; heart(g, w * 0.47, h * 0.55, w * 0.78); g.fill();
    g.fillStyle = '#1e9c5a'; bolt(g, w * 0.47, h * 0.5, w * 0.78); g.fill();
    g.fillStyle = '#fff'; const a = w * 0.06; g.fillRect(w * 0.8 - a / 2, h * 0.1, a, h * 0.2); g.fillRect(w * 0.7, h * 0.2 - a / 2, w * 0.2, a);
    g.font = 'bold ' + Math.round(h * 0.13) + 'px sans-serif'; g.textAlign = 'center'; g.fillText('AED', w * 0.47, h * 0.93);
  };

  function figureMate(K, i) {
    const looks = [
      { top: 'uniform', bottom: 'skirt', skirt: 'skirt', skin: 'skin2', hair: 'hair', longHair: true },
      { top: 'uniform', bottom: 'pants', skin: 'skin', hair: 'hair' },
      { top: 'uniform', bottom: 'skirt', skirt: 'skirt', skin: 'skin', hair: 'hair', longHair: true }
    ];
    return K.figure(Object.assign({ s: 0.98 - i * 0.02 }, looks[i % 3]));
  }

  /* Builds the room into the scene. opt.poster draws the poster on the back wall (a canvas function). Returns the
     room's parts in G: kid (you), mates (three classmates on the bench, the first is Mika), nurse, aed (in its
     cabinet), aedLid, plug and socket. */
  function build(K, G, opt) {
    const THREE = window.THREE, sc = K.scene;
    opt = opt || {};
    // the floor and the walls (a cutaway: the back wall and the left wall)
    K.box(7.6, 0.1, 6.2, 'floor', 0, -0.05, 0.4);
    for (let i = -3; i <= 3; i++) K.box(0.02, 0.005, 6.2, 'floorLine', i, 0.001, 0.4);
    K.box(7.6, 3, 0.12, 'wall', 0, 1.5, BW - 0.06);
    K.box(7.6, 0.14, 0.04, 'trim', 0, 0.07, BW + 0.02);
    K.box(7.6, 0.07, 0.03, 'stripe', 0, 0.95, BW + 0.015);
    // the left wall, with a door and a window
    const segs = [[-2.5, 0.85], [1.75, 3.5]];
    for (const [a, b] of segs) { K.box(0.12, 3, b - a, 'wall', LW, 1.5, (a + b) / 2); K.box(0.03, 3, b - a, 'wallOut', LW - 0.075, 1.5, (a + b) / 2); }
    K.box(0.12, 0.92, 0.9, 'wall', LW, 2.54, 1.3); K.box(0.03, 0.92, 0.9, 'wallOut', LW - 0.075, 2.54, 1.3);
    K.box(0.04, 0.14, 6.0, 'trim', LW + 0.07, 0.07, 0.5);
    K.box(0.17, 2.14, 0.07, 'frame', LW, 1.07, 0.82); K.box(0.17, 2.14, 0.07, 'frame', LW, 1.07, 1.78); K.box(0.17, 0.08, 1.02, 'frame', LW, 2.12, 1.3);
    K.box(0.05, 2.05, 0.88, 'door', LW + 0.03, 1.03, 1.3); K.sph(0.035, 'knob', LW + 0.09, 1.0, 1.66);
    K.box(0.06, 1.0, 1.25, 'winFrame', LW + 0.07, 1.75, -1.15); K.box(0.04, 0.86, 1.1, 'glass', LW + 0.1, 1.75, -1.15); K.box(0.05, 0.86, 0.04, 'winFrame', LW + 0.11, 1.75, -1.15);

    // on the back wall: the first aid sign, the game's poster, a clock, the AED cabinet with its sign, a wall socket
    K.sign(drawFirstAid, 256, 256, 0.5, 0.5, 1.3, 1.95, BW + 0.012);
    if (opt.poster) K.sign(opt.poster, 360, 440, 0.9, 1.1, 0.15, 1.65, BW + 0.012);
    const clk = K.cyl(0.21, 0.21, 0.04, 'clock', -0.85, 2.35, BW + 0.03); clk.rotation.x = PI / 2;
    K.box(0.02, 0.14, 0.01, 'ink', -0.85, 2.41, BW + 0.055); K.box(0.1, 0.02, 0.01, 'ink', -0.81, 2.35, BW + 0.055);
    const cab = new THREE.Group(); cab.position.set(CABINET.x, CABINET.y, CABINET.z); sc.add(cab);
    K.box(0.62, 0.62, 0.02, 'cabEdge', 0, 0, -0.1, cab); K.box(0.62, 0.04, 0.2, 'cabEdge', 0, 0.29, 0, cab); K.box(0.62, 0.04, 0.2, 'cabEdge', 0, -0.29, 0, cab);
    K.box(0.04, 0.62, 0.2, 'cabEdge', -0.29, 0, 0, cab); K.box(0.04, 0.62, 0.2, 'cabEdge', 0.29, 0, 0, cab); K.box(0.54, 0.54, 0.02, 'cab', 0, 0, -0.09, cab);
    K.sign(drawAedSign, 256, 256, 0.42, 0.42, CABINET.x, CABINET.y + 0.62, BW + 0.012);
    // the AED: a yellow case with a handle and an orange button under the lid
    const aed = new THREE.Group(); sc.add(aed); G.aed = aed;
    K.box(0.34, 0.1, 0.26, 'aed', 0, 0.05, 0, aed);
    const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.13); aed.add(lid); G.aedLid = lid;
    K.box(0.34, 0.025, 0.26, 'aed', 0, 0.012, 0.13, lid);
    K.sign(drawAedSign, 128, 128, 0.12, 0.12, 0, 0.026, 0.13, 0, lid).rotation.x = -PI / 2;
    K.box(0.18, 0.025, 0.035, 'aedDark', 0, 0.035, 0.24, lid);
    K.cyl(0.03, 0.03, 0.02, 'aedBtn', 0.09, 0.105, 0.05, aed); K.box(0.1, 0.012, 0.07, 'aedDark', -0.06, 0.101, 0.03, aed);
    G.aedHome = { x: CABINET.x, y: CABINET.y - 0.27, z: CABINET.z - 0.02, ry: 0 };
    aed.position.set(G.aedHome.x, G.aedHome.y, G.aedHome.z);
    // the wall socket and the plug in it (a game can run a cord from it)
    K.box(0.12, 0.16, 0.02, 'socket', SOCKET.x, SOCKET.y, BW + 0.01);
    G.plug = K.box(0.06, 0.07, 0.07, 'cord', SOCKET.x, SOCKET.y, BW + 0.05);
    G.plug.userData.home = G.plug.position.clone();

    // the bench, and the class on it
    K.box(3.1, 0.05, 0.42, 'bench', 0.1, 0.385, -1.95);
    for (const x of [-1.3, 0.1, 1.5]) for (const z of [-2.1, -1.8]) K.box(0.05, 0.36, 0.05, 'benchLeg', x, 0.18, z);
    G.kid = K.figure({ top: 'uniform', bottom: 'pants', skin: 'skin', hair: 'hair', cap: 'cap', s: 1 });
    G.mates = [0, 1, 2].map((i) => figureMate(K, i));
    G.nurse = K.figure({ top: 'nurse', bottom: 'nurse2', skin: 'skin2', hair: 'hair', longHair: true, s: 1.32, legs: 'nurse2' });
    return G;
  }

  // everyone in their places: the class on the bench, Nurse Lea beside the practice spot
  function seatClass(K, G, T, nursePose) {
    G.mates.forEach((F, i) => { const p = SEATS.mates[i]; K.applyPose(F, K.POSE.sit, null, 0, T); K.place(F, p.x, p.z, p.f, 0); K.show(F, true); });
    K.applyPose(G.nurse, K.POSE[nursePose || 'stand'], null, 0, T); K.place(G.nurse, NURSE.x, NURSE.z, NURSE.f); K.show(G.nurse, true);
  }
  // a figure following absolute-time keys (t is the time on the timeline), or standing at its home spot
  function follow(K, F, keys, T, home) {
    if (!keys || !keys.length || T < keys[0].t) {
      K.applyPose(F, K.POSE[home.pose || 'stand'], null, 0, T); K.place(F, home.x, home.z, home.f); return home;
    }
    const r = K.evalTrack(keys, T);
    K.applyPose(F, r.p, r.gait, r.gk, T); K.place(F, r.x, r.z, r.f);
    return r;
  }
  // a world point at a figure's hand
  function handPos(F, i) { const v = new window.THREE.Vector3(); F.hands[i].getWorldPosition(v); return v; }

  window.AidRoom = { PAL, POSES, SEATS, NURSE, SOCKET, CABINET, BW, LW, build, seatClass, follow, handPos, rr, drawFirstAid, drawAedSign, heart, bolt };
})();
