// Quake in Order: its rules at both levels, then the shared checks inside the library and on its own (harness.cjs).
// Run with: npm run test:games (it builds the pages first), or node games/tests/quake-in-order.test.cjs after a build.
const H = require('./harness.cjs');

async function test() {
  const t = H.counter('quake-in-order');
  const FILE = H.lib('quake-in-order'), SOLO = H.solo('Quake-in-Order.html');

  // 1. The rules: the right order is safe, and each kind of mistake gets the grade it should.
  {
    const { game, close } = await H.open(FILE, '', false);
    const g = (o, l) => H.grades(game, o, l);
    // Difficult: the full drill, with the door
    t.ok(game.rightOf('hard').join() === 'door,duck,cover,hold,wait,walk,field', 'Difficult has the 7 steps of the drill, starting with the door');
    t.ok(g(game.rightOf('hard'), 'hard').every((x) => x.endsWith(':ok')), 'Difficult: the right order is safe at every step');
    t.ok(g(['duck', 'cover', 'hold', 'wait', 'door', 'walk', 'field'], 'hard').includes('door:bad'), 'Difficult: opening the door after the shaking finds it jammed');
    t.ok(game.simulate(['duck', 'cover', 'hold', 'wait', 'door', 'walk', 'field'], 'hard').jammed, 'Difficult: a door left shut until the shaking stops is jammed');
    t.ok(g(['walk', 'duck', 'cover', 'hold', 'wait', 'door', 'field'], 'hard')[0] === 'walk:bad', 'Difficult: walking out while it shakes is not safe');
    t.ok(g(['door', 'duck', 'cover', 'wait', 'hold', 'walk', 'field'], 'hard').includes('wait:warn'), 'Difficult: waiting without holding on lets the desk slide');
    t.ok(g(['door', 'duck', 'cover', 'hold', 'wait', 'field', 'walk'], 'hard').includes('field:warn'), 'Difficult: rushing to the field alone is a warning');
    t.ok(g(['door', 'cover', 'duck', 'hold', 'wait', 'walk', 'field'], 'hard')[1] === 'cover:warn', 'Difficult: covering before ducking is a warning');
    t.ok(g(['wait', 'door', 'duck', 'cover', 'hold', 'walk', 'field'], 'hard')[0] === 'wait:bad', 'Difficult: waiting out in the open is not safe');
    t.ok(g(['door', 'duck', 'hold', 'cover', 'wait', 'walk', 'field'], 'hard').join() === 'door:ok,duck:ok,hold:warn,cover:ok,wait:warn,walk:ok,field:ok',
      'Difficult: holding from outside the desk is a warning, and crawling under from there is fine');
    H.allOrders(t, game, 'hard');

    // Easy: duck, cover and hold; Tonton, nearest the door, opens it
    t.ok(game.rightOf('easy').join() === 'duck,cover,hold', 'Easy has the 3 steps: duck, cover, hold');
    const E = game.simulate(['duck', 'cover', 'hold'], 'easy');
    t.ok(E.results.every((r) => r.grade === 'ok'), 'Easy: the right order is safe at every step');
    t.ok(E.evs.some((e) => e.e === 'opener') && E.doorKeys[E.doorKeys.length - 1].a < -1 && !E.jammed, 'Easy: Tonton, nearest the door, opens it, so it never jams');
    t.ok(E.segs.some((s) => s.auto && /held on/.test(s.cap)), 'Easy: the class waits under the desks until the shaking stops');
    t.ok(g(['cover', 'duck', 'hold'], 'easy')[0] === 'cover:warn', 'Easy: covering before ducking is a warning');
    t.ok(g(['hold', 'duck', 'cover'], 'easy')[0] === 'hold:warn', 'Easy: holding before getting under is a warning');
    const easyOrders = H.perms(game.rightOf('easy')).map((o) => game.simulate(o, 'easy'));
    t.ok(easyOrders.every((s) => H.worstOf(s.results) !== 'bad'), 'Easy: no order is graded not safe (a gentle start)');
    H.allOrders(t, game, 'easy');
    close();
  }

  // 2. The door getting stuck, as the drawings show it
  {
    const { q, game, close } = await H.open(FILE, '?embed=1&level=hard', true);
    q('#go').click();
    game.setOrder(['duck', 'cover', 'hold', 'wait', 'door', 'walk', 'field']);
    q('#simulate').click();
    const jam = game.SIM.evs.find((e) => e.e === 'jamOn');
    game.seek(jam.T + 0.3); await H.wait(80);
    t.ok(q('#fsay') && !q('#fsay').hidden && /stuck|Stuck/.test(q('#fsay').textContent), 'shows the door getting stuck');
    q('#skip').click();
    t.ok(/Not safe yet/.test(q('#verdict').textContent), 'a jammed door is not safe');
    close();
  }
  // 3. Easy reminds the class who opens the door
  {
    const { q, d, game, close } = await H.open(FILE, '?embed=1&level=easy', true);
    t.ok(/Tonton sits nearest the door/.test(q('#bubt').textContent), 'Easy: the story says Tonton sits nearest the door and opens it');
    q('#go').click(); game.setOrder(['duck', 'cover', 'hold']); q('#simulate').click();
    game.seek(1.3); await H.wait(80);
    t.ok(/Tonton opens the door/.test(q('#fsay').textContent), 'Easy: the drawings show Tonton opening the door');
    q('#skip').click();
    t.ok(!q('#rnote').hidden && /nearest the door opens it first/.test(q('#rnote').textContent) && /Try Difficult/.test(q('#rnote').textContent),
      'Easy: the results repeat that whoever sits nearest the door opens it, and suggest Difficult');
    t.ok(d.querySelectorAll('#right li').length === 3, 'Easy: the right order lists the 3 steps');
    close();
  }

  // 4. Inside the library and on its own, at both levels
  await H.flows(t, {
    id: 'quake', slug: 'quake-in-order', file: FILE, solo: SOLO, levels: { easy: 3, hard: 7 },
    wrong: { level: 'hard', order: ['duck', 'cover', 'hold', 'wait', 'door', 'walk', 'field'] }, practice: false
  });
  H.noDashes(t, 'quake-in-order');
  return t;
}

module.exports = test;
if (require.main === module) H.main(test);
