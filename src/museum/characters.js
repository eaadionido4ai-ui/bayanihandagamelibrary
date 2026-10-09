// Low-poly children for TANGHALAN, in the games' style: the player and Bayani.
// Each faces +z; legs and arms hang from pivots so they can swing while walking.

export function makeKid(T, o) {
  const g = new T.Group();
  const body = new T.Group();
  g.add(body);
  const skin = o.skin || 0xd69a63;
  const mat = (color, extra) => new T.MeshLambertMaterial(Object.assign({ color }, extra || {}));
  const add = (parent, geo, color, x, y, z, extra) => { const m = new T.Mesh(geo, mat(color, extra)); m.position.set(x || 0, y || 0, z || 0); parent.add(m); return m; };

  const legs = [-1, 1].map((s) => {
    const hip = new T.Group(); hip.position.set(0.09 * s, 0.48, 0); body.add(hip);
    add(hip, new T.CylinderGeometry(0.065, 0.06, 0.42, 10), skin, 0, -0.21, 0);
    add(hip, new T.BoxGeometry(0.13, 0.08, 0.2), 0x2b2b2b, 0, -0.43, 0.03);
    return hip;
  });
  add(body, new T.CylinderGeometry(0.17, 0.18, 0.2, 16), o.pants || 0x35506b, 0, 0.5, 0);
  add(body, new T.CylinderGeometry(0.16, 0.185, 0.42, 16), o.shirt, 0, 0.78, 0);
  const arms = [-1, 1].map((s) => {
    const shoulder = new T.Group(); shoulder.position.set(0.235 * s, 0.98, 0); body.add(shoulder);
    const arm = add(shoulder, new T.CylinderGeometry(0.055, 0.05, 0.42, 10), skin, 0, -0.2, 0);
    arm.rotation.z = 0.12 * s; arm.position.x = 0.02 * s;
    return shoulder;
  });
  add(body, new T.SphereGeometry(0.2, 20, 16), skin, 0, 1.18, 0);
  if (o.face) {
    add(body, new T.SphereGeometry(0.025, 8, 6), 0x2a2320, -0.07, 1.2, 0.185);
    add(body, new T.SphereGeometry(0.025, 8, 6), 0x2a2320, 0.07, 1.2, 0.185);
    add(body, new T.SphereGeometry(0.03, 8, 6), 0xf29a7a, -0.12, 1.13, 0.16);
    add(body, new T.SphereGeometry(0.03, 8, 6), 0xf29a7a, 0.12, 1.13, 0.16);
    const smile = add(body, new T.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), 0x2a2320, 0, 1.135, 0.19); smile.rotation.z = Math.PI;
  }
  if (o.hat) {
    add(body, new T.SphereGeometry(0.215, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), 0xffc53d, 0, 1.24, 0);
    add(body, new T.CylinderGeometry(0.27, 0.27, 0.03, 24), 0xeaa100, 0, 1.25, 0.02);
  } else {
    const hair = add(body, new T.SphereGeometry(0.215, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), o.hair || 0x2b1d16, 0, 1.2, -0.015);
    hair.rotation.x = -0.35;
  }
  if (o.bag) { // a go bag on the back
    add(body, new T.BoxGeometry(0.3, 0.34, 0.14), o.bag, 0, 0.84, -0.22);
    add(body, new T.BoxGeometry(0.26, 0.12, 0.05), 0x1b8a4a, 0, 0.74, -0.31);
    add(body, new T.BoxGeometry(0.05, 0.36, 0.03), 0x0c5c3a, -0.1, 0.84, -0.155);
    add(body, new T.BoxGeometry(0.05, 0.36, 0.03), 0x0c5c3a, 0.1, 0.84, -0.155);
  }
  if (o.cape) add(body, new T.CylinderGeometry(0.2, 0.3, 0.6, 16, 1, true, Math.PI * 0.6, Math.PI * 0.8), 0xf2760c, 0, 0.72, 0.01, { side: T.DoubleSide });
  if (o.star) {
    const s = new T.Shape();
    for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.035 : 0.085; if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    add(body, new T.ShapeGeometry(s), 0xffd24d, 0, 0.82, 0.18);
  }
  // a soft shadow on the floor
  const shadow = new T.Mesh(new T.CircleGeometry(0.34, 24), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.026; shadow.renderOrder = 1; g.add(shadow);

  return {
    group: g,
    // phase advances with distance walked; amount 0..1 blends from standing to a full stride
    pose(phase, amount, t) {
      const swing = Math.sin(phase) * 0.6 * amount;
      legs[0].rotation.x = swing; legs[1].rotation.x = -swing;
      arms[0].rotation.x = -swing * 0.9; arms[1].rotation.x = swing * 0.9;
      body.position.y = Math.abs(Math.cos(phase)) * 0.04 * amount;
      if (o.wave && amount < 0.05) { // Bayani waves while standing
        arms[1].rotation.z = 2.4 + Math.sin(t * 6) * 0.25; arms[1].rotation.x = 0;
      } else arms[1].rotation.z = 0;
    },
  };
}
