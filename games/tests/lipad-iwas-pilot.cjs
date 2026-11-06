// Copied unchanged from the Lipad-Iwas project (tests/pilot.cjs), for games/tests/lipad-iwas.test.cjs.
// A simple autopilot for the tests and the balance check: it aims for the next gap, dips low over a home when it can
// climb back in time, and steps around moving hazards it can see. It is not perfect, which is the point: if it can
// finish a world, a child can too.
function pilot(LI, s, greedy) {
  const lv = s.lv, HW = LI.HW;
  const nextCol = s.cols.find((c) => c.x + HW + 10 > s.x);
  const prev = [...s.cols].reverse().find((c) => c.x - HW < s.x);
  const nextHouse = s.houses.find((h) => !h.warned && h.x + 30 > s.x);
  let target = nextCol ? nextCol.c + 8 : 400;
  if (greedy && nextHouse && (!nextCol || nextHouse.x < nextCol.x - HW) && (!prev || s.x > prev.x + HW + 4)) {
    const zoneTop = s.groundY - lv.zone + 40;
    const need = nextCol ? zoneTop - (nextCol.c + lv.gap / 2 - 30) : 0;
    const time = nextCol ? (nextCol.x - HW - nextHouse.x) / lv.speed : 9;
    if (need < time * 260) target = zoneTop;
  }
  for (const m of s.movers) {
    if (m.done || !m.active) continue;
    const dt = (m.x - s.x) / (lv.speed - m.vx);
    if (dt < -0.2 || dt > 1.0) continue;
    const my = m.y + m.vy * Math.max(dt, 0);
    if (Math.abs(my - target) < 60) target = my < 400 ? my + 80 : my - 80;
  }
  if (s.y > target && s.vy > -60) LI.flap(s);
}
// flies a whole run; after a bump it carries on like a player tapping "Keep flying"
function fly(LI, world, level, seed, greedy = true) {
  const s = LI.create(world, level, seed);
  LI.flap(s);
  const events = [];
  for (let t = 0; t < 240; t += 1 / 60) {
    pilot(LI, s, greedy);
    events.push(...LI.step(s, 1 / 60));
    if (s.phase === 'bumped') { LI.resume(s); LI.flap(s); }
    if (s.phase === 'done' || s.phase === 'over') break;
  }
  return { s, events };
}
module.exports = { pilot, fly };
