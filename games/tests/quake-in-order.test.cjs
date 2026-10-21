// Checks Quake in Order the way the library shows it (?embed=1, in a frame) and on its own, plus its rules.
// It runs in a simulated browser (jsdom) with no WebGL, so the game plays with drawings in place of the
// 3D classroom, which is also what a phone without 3D sees.
// Run with: npm run test:games (it builds the pages first).
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const here = __dirname;
const LIB = path.join(here, '..', '..', 'public', 'games', 'quake-in-order.html');
const SOLO = path.join(here, '..', 'standalone', 'Quake-in-Order.html');
const SRC = path.join(here, '..', 'quake-in-order');

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('FAIL:', msg); } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(file, query, framed) {
  const sent = [], errors = [];
  const parent = { postMessage: (m) => sent.push(m) };
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { if (!/Not implemented/.test(e.message)) errors.push(e.message); });
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    url: 'https://example.org/games/quake-in-order.html' + query,
    beforeParse(w) {
      if (framed) Object.defineProperty(w, 'parent', { get: () => parent, configurable: true });
      w.SpeechSynthesisUtterance = function (t) { this.text = t; };
      w.speechSynthesis = { spoken: [], cancel() {}, speak(u) { this.spoken.push(u.text); } };
    },
  });
  const w = dom.window, d = w.document;
  for (let i = 0; i < 100 && !w.__quake; i++) await wait(20); // the game starts once the page has loaded
  if (!w.__quake) throw new Error('the game did not start: ' + errors.join('; '));
  return { w, d, q: (s) => d.querySelector(s), game: w.__quake, sent, errors, close: () => w.close() };
}

async function main() {
  // 1. The rules: the right order is safe, and each kind of mistake gets the grade it should.
  {
    const { game, close } = await open(LIB, '', false);
    const g = (o) => game.simulate(o).results.map((r) => r.id + ':' + r.grade);
    ok(g(game.RIGHT).every((x) => x.endsWith(':ok')), 'the right order is safe at every step');
    ok(g(['duck', 'cover', 'hold', 'wait', 'door', 'walk', 'field']).includes('door:bad'), 'opening the door after the shaking finds it jammed');
    ok(g(['walk', 'duck', 'cover', 'hold', 'wait', 'door', 'field'])[0] === 'walk:bad', 'walking out while it shakes is not safe');
    ok(g(['door', 'duck', 'cover', 'wait', 'hold', 'walk', 'field']).includes('wait:warn'), 'waiting without holding on lets the desk slide');
    ok(g(['door', 'duck', 'cover', 'hold', 'wait', 'field', 'walk']).includes('field:warn'), 'rushing to the field alone is a warning');
    ok(g(['door', 'cover', 'duck', 'hold', 'wait', 'walk', 'field'])[1] === 'cover:warn', 'covering before ducking is a warning');
    ok(g(['wait', 'door', 'duck', 'cover', 'hold', 'walk', 'field'])[0] === 'wait:bad', 'waiting out in the open is not safe');
    // every one of the 5,040 orders plays to the end
    const ids = game.RIGHT.slice(), bad = [];
    let n = 0;
    const perm = (a, k) => {
      if (k === a.length) {
        n++;
        try { const s = game.simulate(a); if (!(s.total > 5) || s.results.length !== 7) bad.push(a.join()); } catch (e) { bad.push(a.join() + ' ' + e.message); }
        return;
      }
      for (let i = k; i < a.length; i++) { [a[k], a[i]] = [a[i], a[k]]; perm(a, k + 1); [a[k], a[i]] = [a[i], a[k]]; }
    };
    perm(ids, 0);
    ok(n === 5040 && !bad.length, 'all 5,040 orders play to the end: ' + bad.slice(0, 3).join(' | '));
    close();
  }

  // 2. Inside the library: Engaging look, back leaves the game, rounds and the badge reported, nothing kept.
  {
    const { w, d, q, game, sent, errors, close } = await open(LIB, '?embed=1', true);
    ok(game.embed, 'knows it is inside the library');
    ok(d.body.classList.contains('embed') && d.body.dataset.look === 'lively', 'wears the Engaging look, with the look switch hidden');
    ok(q('#back').style.visibility === 'visible', 'shows a back button on the first screen');
    ok(!q('#done').hidden, 'has a Done button on the results');
    ok(game.flat && !!q('#hero .flatpic'), 'with no 3D, shows a drawing in place of the classroom');
    ok(!/https?:\/\/(?!www\.w3\.org)/.test(fs.readFileSync(LIB, 'utf8')), 'names no web address (works offline)');
    ok(/src="\.\.\/engine\/three\.min\.js"/.test(fs.readFileSync(LIB, 'utf8')), 'uses the library\'s own three.js');
    ok(sent.some((m) => m.source === 'bayani-game' && m.game === 'quake' && m.type === 'say' && !m.force), 'asks the library to read the story aloud (only when the voice is on)');

    q('#spk').click();
    ok(sent.some((m) => m.type === 'say' && m.force), 'the speaker button reads the story aloud');
    q('#go').click();
    ok(game.screen === 'order' && d.querySelectorAll('#list .step').length === 7, 'shows the 7 steps to put in order');
    ok(game.order.join() !== game.RIGHT.join() && game.order[0] !== 'door', 'the steps start mixed up');
    const before = game.order;
    q('#list .step:nth-child(2) [data-up]').click();
    ok(game.order[0] === before[1] && game.order[1] === before[0], 'an arrow moves a step up');

    // the right order, played with drawings
    game.setOrder(game.RIGHT);
    q('#simulate').click();
    ok(game.screen === 'sim', 'Simulate plays the order');
    game.seek(4.0); await wait(80);
    ok(q('#fico') && q('#fico').dataset.k === 'duck', 'the drawing follows the step being acted out');
    ok(/Step|\./.test(q('#capt').textContent), 'the caption tells what happens');
    ok(q('#strip').children.length === 7, 'the strip shows the 7 steps');
    q('#skip').click();
    ok(game.screen === 'res' && /Safe!/.test(q('#verdict').textContent), 'the right order is safe');
    let r = sent.filter((m) => m.type === 'result').pop();
    ok(r && r.safe === true && r.demo === false && r.stars === 3 && r.grade === 'ok', 'tells the library the round was safe (this earns the badge)');
    ok(sent.some((m) => m.type === 'say' && /Safe!/.test(m.text)), 'asks the library to read the result aloud');

    // a wrong order
    q('#again').click();
    game.setOrder(['duck', 'cover', 'hold', 'wait', 'door', 'walk', 'field']);
    q('#simulate').click();
    game.seek(12.5); await wait(80);
    ok(q('#fsay') && !q('#fsay').hidden && /stuck|Stuck/.test(q('#fsay').textContent), 'shows the door getting stuck');
    q('#skip').click();
    ok(/Not safe yet/.test(q('#verdict').textContent), 'a jammed door is not safe');
    r = sent.filter((m) => m.type === 'result').pop();
    ok(r && r.safe === false && r.grade === 'bad', 'tells the library the round was not safe');
    ok(d.querySelectorAll('#rlist .rrow').length === 7, 'the results go through every step');
    q('#demo').click();
    q('#skip').click();
    r = sent.filter((m) => m.type === 'result').pop();
    ok(r && r.demo === true, 'See it done right is marked, so it earns no badge');

    // leaving
    const n = sent.length;
    q('#done').click();
    ok(sent.slice(n).some((m) => m.type === 'exit'), 'Done goes back to the library');
    game.show('order'); q('#back').click(); q('#back').click();
    ok(sent.filter((m) => m.type === 'exit').length === 2, 'Back from the first screen goes back to the library');
    ok(w.localStorage.length === 0, 'keeps nothing on the device by itself');
    ok(!errors.length, 'no script errors: ' + errors.join('; '));
    close();
  }

  // 3. On its own (the single file to share): both looks, no back button on the first screen, nothing sent anywhere.
  {
    const { w, d, q, game, errors, close } = await open(SOLO, '', false);
    ok(!game.embed && !d.body.classList.contains('embed'), 'runs on its own');
    ok(game.flat, 'falls back to drawings when the device has no WebGL');
    ok(q('#back').style.visibility === 'hidden' && q('#done').hidden, 'no back or Done button where there is nothing to go back to');
    q('.seg button[data-look="minimal"]').click();
    ok(d.body.dataset.look === 'minimal' && w.localStorage.getItem('quake-in-order-look') === 'minimal', 'the look switch works and is remembered');
    q('#spk').click();
    ok(w.speechSynthesis.spoken.length === 1, 'the speaker button reads the story aloud');
    q('#go').click(); q('#simulate').click(); q('#skip').click();
    ok(game.screen === 'res', 'plays a round to the results');
    ok(!/fonts\.googleapis|https?:\/\/cdn/.test(fs.readFileSync(SOLO, 'utf8')), 'needs no internet');
    ok(!errors.length, 'no script errors: ' + errors.join('; '));
    close();
  }

  // 4. The words: no long dashes in what the game says (house style).
  for (const f of ['app.js', 'template.html']) ok(!/[\u2013\u2014]/.test(fs.readFileSync(path.join(SRC, f), 'utf8')), f + ' has no en or em dashes');

  console.log('quake-in-order.html: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.log('FAIL: ' + (e && e.stack || e)); process.exit(1); });
