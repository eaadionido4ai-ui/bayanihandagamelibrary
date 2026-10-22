// Heart in Order (CPR): its rules at both levels, then the shared checks inside the library and on its own (harness.cjs).
// Run with: npm run test:games (it builds the pages first), or node games/tests/heart-in-order.test.cjs after a build.
const H = require('./harness.cjs');

async function test() {
  const t = H.counter('heart-in-order');
  const FILE = H.lib('heart-in-order'), SOLO = H.solo('Heart-in-Order.html');

  // 1. The rules
  {
    const { game, close } = await H.open(FILE, '', false);
    const g = (o, l) => H.grades(game, o, l);
    const R = game.rightOf('hard');
    t.ok(R.join() === 'safe,tap,call,breath,push,aed,keep', 'Difficult has the 7 steps, from looking around to keeping going');
    t.ok(g(R, 'hard').every((x) => x.endsWith(':ok')), 'Difficult: the right order is safe at every step');
    t.ok(g(['safe', 'tap', 'breath', 'call', 'push', 'aed', 'keep'], 'hard').every((x) => x.endsWith(':ok')), 'Difficult: checking breathing before calling is also right');
    H.allOrders(t, game, 'hard', [R, ['safe', 'tap', 'breath', 'call', 'push', 'aed', 'keep']]);
    const stop = game.simulate(['tap', 'safe', 'call', 'breath', 'push', 'aed', 'keep'], 'hard');
    t.ok(stop.results[0].grade === 'bad' && stop.results[1].grade === 'warn' && stop.evs.some((e) => e.e === 'unplug' && e.by === 'nurse'),
      'Difficult: going near before looking around is not safe, and Nurse Lea unplugs the fan');
    t.ok(game.simulate(R, 'hard').evs.some((e) => e.e === 'unplug' && e.by === 'kid'), 'Difficult: looking around first, you unplug the fan yourself');
    t.ok(g(['safe', 'call', 'tap', 'breath', 'push', 'aed', 'keep'], 'hard')[1] === 'call:warn', 'Difficult: calling before tapping is a warning');
    const early = g(['safe', 'tap', 'call', 'push', 'breath', 'aed', 'keep'], 'hard');
    t.ok(early[3] === 'push:warn' && early[4] === 'breath:warn', 'Difficult: pushing before checking breathing is a warning');
    const late = g(['safe', 'tap', 'breath', 'push', 'aed', 'keep', 'call'], 'hard');
    t.ok(late[4] === 'aed:warn' && late[5] === 'keep:bad' && late[6] === 'call:warn', 'Difficult: with no call, there is no AED and no help coming');
    t.ok(g(['safe', 'tap', 'call', 'breath', 'aed', 'push', 'keep'], 'hard')[4] === 'aed:warn', 'Difficult: waiting for the AED before pushing is a warning');
    t.ok(g(['safe', 'tap', 'call', 'breath', 'push', 'keep', 'aed'], 'hard')[6] === 'aed:warn', 'Difficult: the AED after help took over is a warning');
    const right = game.simulate(R, 'hard');
    t.ok(right.evs.some((e) => e.e === 'aedDrop') && right.evs.some((e) => e.e === 'pads') && right.evs.some((e) => e.e === 'shock'), 'Difficult: Mika brings the AED, the pads go on, and you press the button');
    let helpOk = true;
    for (const o of H.perms(R)) { const s = game.simulate(o, 'hard'); if (!(s.helpT < s.total)) { helpOk = false; break; } }
    t.ok(helpOk, 'Difficult: in every order, help arrives before the end');

    t.ok(game.rightOf('easy').join() === 'check,help,push', 'Easy has the 3 steps: check, call, push');
    t.ok(g(['check', 'help', 'push'], 'easy').every((x) => x.endsWith(':ok')), 'Easy: the right order is safe at every step');
    t.ok(g(['help', 'check', 'push'], 'easy')[0] === 'help:warn', 'Easy: calling before checking is a warning');
    t.ok(g(['push', 'check', 'help'], 'easy')[0] === 'push:warn', 'Easy: pushing before checking is a warning');
    t.ok(g(['check', 'push', 'help'], 'easy')[2] === 'help:warn', 'Easy: stopping the pushes to call is a warning');
    t.ok(H.perms(game.rightOf('easy')).every((o) => H.worstOf(game.simulate(o, 'easy').results) !== 'bad'), 'Easy: no order is graded not safe (a gentle start)');
    t.ok(H.perms(game.rightOf('easy')).every((o) => { const s = game.simulate(o, 'easy'); return s.helpT < s.total && !s.evs.some((e) => e.e === 'aedDrop'); }),
      'Easy: help always comes, and there is no AED to handle');
    H.allOrders(t, game, 'easy');
    close();
  }

  // 2. What the drawings and the status say
  {
    const { q, game, close } = await H.open(FILE, '?embed=1&level=hard', true);
    q('#go').click(); game.setOrder(game.right); q('#simulate').click();
    game.seek(0.5); await H.wait(60);
    t.ok(/Pretend/.test(q('#shake').textContent) && /Nurse Lea/.test(q('#fsay').textContent), 'the practice starts with Nurse Lea asking the class to pretend');
    const call = game.SIM.evs.find((e) => e.e === 'say' && e.who === 'phone');
    game.seek(call.T + 0.2); await H.wait(60);
    t.ok(/911/.test(q('#fsay').textContent) && /on the way/.test(q('#shake').textContent), 'after the call, the drawings show 911 and the status says help is on the way');
    game.seek(game.SIM.helpT + 0.3); await H.wait(60);
    t.ok(/Help is here/.test(q('#shake').textContent), 'the status says when help is here');
    q('#skip').click();
    t.ok(!q('#rnote').hidden && /Two ways are right/.test(q('#rnote').textContent), 'Difficult: the results say both call orders are right');
    close();
  }

  // 3. Inside the library and on its own, at both levels
  await H.flows(t, {
    id: 'cpr', slug: 'heart-in-order', file: FILE, solo: SOLO, levels: { easy: 3, hard: 7 },
    wrong: { level: 'hard', order: ['tap', 'safe', 'call', 'breath', 'push', 'aed', 'keep'] }, practice: true
  });
  H.noDashes(t, 'heart-in-order');
  return t;
}

module.exports = test;
if (require.main === module) H.main(test);
