// Press On (bleeding control): its rules at both levels, then the shared checks inside the library and on its own (harness.cjs).
// Run with: npm run test:games (it builds the pages first), or node games/tests/press-on.test.cjs after a build.
const H = require('./harness.cjs');

async function test() {
  const t = H.counter('press-on');
  const FILE = H.lib('press-on'), SOLO = H.solo('Press-On.html');

  // 1. The rules
  {
    const { game, close } = await H.open(FILE, '', false);
    const g = (o, l) => H.grades(game, o, l);
    const R = game.rightOf('hard');
    t.ok(R.join() === 'safe,call,gloves,find,cover,press,keep', 'Difficult has the 7 steps, from looking around to keeping the pressure on');
    t.ok(g(R, 'hard').every((x) => x.endsWith(':ok')), 'Difficult: the right order is safe at every step');
    t.ok(g(['safe', 'gloves', 'call', 'find', 'cover', 'press', 'keep'], 'hard').every((x) => x.endsWith(':ok')), 'Difficult: gloves before the call is also right');
    H.allOrders(t, game, 'hard', [R, ['safe', 'gloves', 'call', 'find', 'cover', 'press', 'keep']]);
    const stop = game.simulate(['find', 'safe', 'call', 'gloves', 'cover', 'press', 'keep'], 'hard');
    t.ok(stop.results[0].grade === 'bad' && stop.results[1].grade === 'warn' && stop.evs.some((e) => e.e === 'sweep'),
      'Difficult: going near before looking around is not safe, and Nurse Lea sweeps up the glass');
    t.ok(g(['safe', 'call', 'find', 'gloves', 'cover', 'press', 'keep'], 'hard')[2] === 'find:warn', 'Difficult: touching before putting on gloves is a warning');
    t.ok(g(['safe', 'call', 'find', 'gloves', 'cover', 'press', 'keep'], 'hard').filter((x) => x.endsWith(':warn')).length === 1, 'Difficult: no gloves is counted once, not on every step');
    t.ok(g(['safe', 'gloves', 'find', 'call', 'cover', 'press', 'keep'], 'hard')[3] === 'call:warn', 'Difficult: calling after finding the cut is a warning');
    t.ok(g(['safe', 'call', 'gloves', 'cover', 'find', 'press', 'keep'], 'hard')[3] === 'cover:warn', 'Difficult: covering before finding the cut is a warning');
    t.ok(g(['safe', 'call', 'gloves', 'find', 'press', 'cover', 'keep'], 'hard')[4] === 'press:warn', 'Difficult: pressing before covering is a warning');
    const late = g(['safe', 'gloves', 'find', 'cover', 'press', 'keep', 'call'], 'hard');
    t.ok(late[5] === 'keep:bad' && late[6] === 'call:warn', 'Difficult: with no call, no help is coming');
    const right = game.simulate(R, 'hard');
    t.ok(['gloves', 'sleeveUp', 'gauze', 'pressOn', 'gauze2', 'help', 'stopped'].every((e) => right.evs.some((x) => x.e === e)),
      'Difficult: gloves on, sleeve up, gauze on, pressing, more gauze on top, then help takes over and the bleeding stops');
    let ends = true;
    for (const o of H.perms(R)) { const s = game.simulate(o, 'hard'); if (!(s.helpT < s.total && s.stoppedT < s.total)) { ends = false; break; } }
    t.ok(ends, 'Difficult: in every order, help arrives and the bleeding stops before the end');

    t.ok(game.rightOf('easy').join() === 'alert,find,compress', 'Easy has the 3 steps: get help, find the cut, cover and press');
    t.ok(g(['alert', 'find', 'compress'], 'easy').every((x) => x.endsWith(':ok')), 'Easy: the right order is safe at every step');
    t.ok(g(['find', 'alert', 'compress'], 'easy')[1] === 'alert:warn', 'Easy: getting help late is a warning');
    t.ok(g(['alert', 'compress', 'find'], 'easy')[1] === 'compress:warn', 'Easy: pressing before finding the cut is a warning');
    t.ok(H.perms(game.rightOf('easy')).every((o) => H.worstOf(game.simulate(o, 'easy').results) !== 'bad'), 'Easy: no order is graded not safe (a gentle start)');
    t.ok(H.perms(game.rightOf('easy')).every((o) => { const s = game.simulate(o, 'easy'); return s.stoppedT < s.total && !s.evs.some((e) => e.e === 'sweep' || e.e === 'gloves'); }),
      'Easy: the bleeding always stops by the end, with no glass and no gloves to handle');
    H.allOrders(t, game, 'easy');
    close();
  }

  // 2. What the status says
  {
    const { q, game, close } = await H.open(FILE, '?embed=1&level=hard', true);
    q('#go').click(); game.setOrder(game.right); q('#simulate').click();
    game.seek(0.5); await H.wait(60);
    t.ok(/Bleeding: fast/.test(q('#shake').textContent) && /Nurse Lea/.test(q('#fsay').textContent), 'it starts with the practice arm "bleeding" fast and Nurse Lea asking the class to pretend');
    const on = game.SIM.evs.find((e) => e.e === 'pressOn');
    game.seek(on.T + 0.3); await H.wait(60);
    t.ok(/slowing/.test(q('#shake').textContent), 'pressing slows the bleeding');
    game.seek(game.SIM.stoppedT + 0.2); await H.wait(60);
    t.ok(/stopped/.test(q('#shake').textContent), 'the status says when the bleeding has stopped');
    q('#skip').click();
    t.ok(!q('#rnote').hidden && /Two ways are right/.test(q('#rnote').textContent), 'Difficult: the results say gloves can come before or after the call');
    close();
  }

  // 3. Inside the library and on its own, at both levels
  await H.flows(t, {
    id: 'bleed', slug: 'press-on', file: FILE, solo: SOLO, levels: { easy: 3, hard: 7 },
    wrong: { level: 'hard', order: ['find', 'safe', 'call', 'gloves', 'cover', 'press', 'keep'] }, practice: true
  });
  H.noDashes(t, 'press-on');
  return t;
}

module.exports = test;
if (require.main === module) H.main(test);
