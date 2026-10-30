// Shared checks for the order games (Quake in Order and the first aid games). Each game's test file checks its own
// rules, then runs flows(): the game the way the library shows it (?embed=1, in a frame) and on its own.
// The pages run in a simulated browser (jsdom) with no WebGL, so they play with drawings in place of the 3D scene,
// which is also what a phone without 3D sees. Run all with: npm run test:games (it builds the pages first).
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');
const lib = (id) => path.join(ROOT, 'public', 'games', id + '.html');
const solo = (name) => path.join(ROOT, 'games', 'standalone', name);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function counter(name) {
  let pass = 0, fail = 0;
  return {
    name,
    ok(cond, msg) { if (cond) pass++; else { fail++; console.log('FAIL [' + name + ']: ' + msg); } },
    get pass() { return pass; }, get fail() { return fail; }
  };
}

async function open(file, query, framed) {
  const sent = [], errors = [];
  const parent = { postMessage: (m) => sent.push(m) };
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { if (!/Not implemented/.test(e.message)) errors.push(e.message); });
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    url: 'https://example.org/games/' + path.basename(file) + (query || ''),
    beforeParse(w) {
      if (framed) Object.defineProperty(w, 'parent', { get: () => parent, configurable: true });
      w.SpeechSynthesisUtterance = function (t) { this.text = t; };
      w.speechSynthesis = { spoken: [], cancel() {}, speak(u) { this.spoken.push(u.text); } };
    },
  });
  const w = dom.window, d = w.document;
  for (let i = 0; i < 100 && !w.__order; i++) await wait(20); // the game starts once the page has loaded
  if (!w.__order) throw new Error('the game did not start: ' + errors.join('; '));
  return { w, d, q: (s) => d.querySelector(s), game: w.__order, sent, errors, close: () => w.close() };
}

// every order of a list of steps
const perms = (a) => (a.length <= 1 ? [a.slice()] : a.flatMap((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).map((p) => [x].concat(p))));
const worstOf = (results) => (results.some((r) => r.grade === 'bad') ? 'bad' : results.some((r) => r.grade === 'warn') ? 'warn' : 'ok');
const grades = (game, o, l) => game.simulate(o, l).results.map((r) => r.id + ':' + r.grade);

// Every order plays to the end, and only the accepted orders are safe at every step.
function allOrders(t, game, level, accepted) {
  const R = game.rightOf(level), bad = [], safe = [];
  let n = 0;
  for (const o of perms(R)) {
    n++;
    try {
      const s = game.simulate(o, level);
      if (!(s.total > 3) || s.results.length !== R.length || s.results.some((r, i) => r.id !== o[i] || !r.msg)) bad.push(o.join());
      if (worstOf(s.results) === 'ok') safe.push(o.join());
    } catch (e) { bad.push(o.join() + ' ' + e.message); }
  }
  t.ok(!bad.length, level + ': all ' + n + ' orders play to the end with a message for every step: ' + bad.slice(0, 3).join(' | '));
  const want = (accepted || [R]).map((o) => o.join()).sort();
  t.ok(JSON.stringify(safe.sort()) === JSON.stringify(want), level + ': only the accepted orders are safe at every step (safe: ' + safe.slice(0, 6).join(' | ') + ')');
  return n;
}

/* The game inside the library and on its own. G: { id (the library's game id), file (the library copy), solo (the
   single file), slug, levels: { easy: n, hard: m } (steps per level), wrong: { level, order } (a not safe order),
   practice (true when the results offer a hands-on practice) } */
async function flows(t, G) {
  // 1. Inside the library
  for (const level of Object.keys(G.levels)) {
    const { w, d, q, game, sent, errors, close } = await open(G.file, '?embed=1&level=' + level, true);
    const tag = 'library, ' + level + ': ';
    t.ok(game.embed && game.level === level, tag + 'knows it is inside the library and opens at the level the library picked');
    t.ok(d.body.classList.contains('embed') && d.body.dataset.look === 'lively', tag + 'wears the Engaging look, with the look switch hidden');
    t.ok(q('#levels').children.length === 0, tag + 'shows no level picker (the library picks the level)');
    t.ok(q('#back').style.visibility === 'visible' && !q('#done').hidden, tag + 'shows a back button and a Done button');
    t.ok(game.flat && !!q('#hero .flatpic'), tag + 'with no 3D, shows a drawing in place of the scene');
    t.ok(sent.some((m) => m.source === 'bayani-game' && m.game === G.id && m.type === 'say' && !m.force), tag + 'asks the library to read the story aloud (only when the voice is on)');
    q('#spk').click();
    t.ok(sent.some((m) => m.type === 'say' && m.force), tag + 'the speaker button reads the story aloud');
    q('#go').click();
    const n = G.levels[level];
    t.ok(game.screen === 'order' && d.querySelectorAll('#list .step').length === n, tag + 'shows the ' + n + ' steps to put in order');
    t.ok(game.order.join() !== game.right.join(), tag + 'the steps start mixed up');
    const before = game.order;
    q('#list .step:nth-child(2) [data-up]').click();
    t.ok(game.order[0] === before[1] && game.order[1] === before[0], tag + 'an arrow moves a step up');

    // the right order, played with drawings
    game.setOrder(game.right);
    q('#simulate').click();
    t.ok(game.screen === 'sim', tag + 'Simulate plays the order');
    const second = game.SIM.segs.filter((s) => s.step)[1];
    game.seek(second.T0 + 0.2); await wait(80);
    t.ok(q('#fico') && q('#fico').dataset.k === second.step, tag + 'the drawing follows the step being acted out');
    t.ok(/Step 2/.test(q('#capt').textContent), tag + 'the caption tells which step is being acted out');
    t.ok(q('#strip').children.length === n, tag + 'the strip shows the ' + n + ' steps');
    q('#skip').click();
    t.ok(game.screen === 'res' && q('#verdict .big').textContent === '✓', tag + 'the right order is safe');
    let r = sent.filter((m) => m.type === 'result').pop();
    t.ok(r && r.safe === true && r.demo === false && r.stars === 3 && r.grade === 'ok' && r.level === level && r.order.join() === game.right.join(), tag + 'tells the library the round was safe, with the level (this earns the badge)');
    t.ok(sent.some((m) => m.type === 'say' && m.text && m.text.length > 5 && !m.force), tag + 'asks the library to read the result aloud');
    t.ok(d.querySelectorAll('#right li').length === n, tag + 'explains the right order, step by step');
    if (G.practice) t.ok(!q('#practice').hidden && !!q('#ptry'), tag + 'offers the hands-on practice');

    // a not safe order
    if (G.wrong && G.wrong.level === level) {
      q('#again').click();
      game.setOrder(G.wrong.order);
      q('#simulate').click(); q('#skip').click();
      r = sent.filter((m) => m.type === 'result').pop();
      t.ok(r && r.safe === false && r.grade === 'bad' && q('#verdict .big').textContent === '✗', tag + 'a not safe order is graded not safe');
      t.ok(d.querySelectorAll('#rlist .rrow').length === n, tag + 'the results go through every step');
    }
    q('#demo').click(); q('#skip').click();
    r = sent.filter((m) => m.type === 'result').pop();
    t.ok(r && r.demo === true && r.safe === true, tag + 'See it done right is marked, so it earns no badge');

    // leaving
    const k = sent.length;
    q('#done').click();
    t.ok(sent.slice(k).some((m) => m.type === 'exit'), tag + 'Done goes back to the library');
    game.show('order'); q('#back').click(); q('#back').click();
    t.ok(sent.filter((m) => m.type === 'exit').length === 2, tag + 'Back from the first screen goes back to the library');
    t.ok(w.localStorage.length === 0, tag + 'keeps nothing on the device by itself');
    t.ok(!errors.length, tag + 'no script errors: ' + errors.join('; '));
    close();
  }
  const libHtml = fs.readFileSync(G.file, 'utf8');
  t.ok(!/https?:\/\/(?!www\.w3\.org)/.test(libHtml), 'library copy names no web address (works offline)');
  t.ok(/src="\.\.\/engine\/three\.min\.js"/.test(libHtml), 'library copy uses the library\'s own three.js');

  // 2. On its own (the single file to share)
  {
    const { w, d, q, game, errors, close } = await open(G.solo, '', false);
    t.ok(!game.embed && !d.body.classList.contains('embed'), 'on its own: runs on its own');
    t.ok(game.flat, 'on its own: falls back to drawings when the device has no WebGL');
    t.ok(q('#back').style.visibility === 'hidden' && q('#done').hidden, 'on its own: no back or Done button where there is nothing to go back to');
    const levels = Object.keys(G.levels);
    t.ok(d.querySelectorAll('#levels [data-level]').length === levels.length, 'on its own: shows the level picker');
    for (const level of levels) {
      q('#levels [data-level="' + level + '"]').click();
      t.ok(game.level === level && q('#go').textContent.indexOf(String(G.levels[level])) >= 0 && q('#levels [data-level="' + level + '"]').classList.contains('on'), 'on its own: the level picker switches to ' + level);
      q('#go').click();
      t.ok(d.querySelectorAll('#list .step').length === G.levels[level], 'on its own: ' + level + ' has ' + G.levels[level] + ' steps');
      q('#simulate').click(); q('#skip').click();
      t.ok(game.screen === 'res', 'on its own: plays a round of ' + level + ' to the results');
      q('#back').click(); q('#back').click();
    }
    q('.seg button[data-look="minimal"]').click();
    t.ok(d.body.dataset.look === 'minimal' && w.localStorage.getItem(G.slug + '-look') === 'minimal', 'on its own: the look switch works and is remembered');
    q('#spk').click();
    t.ok(w.speechSynthesis.spoken.length === 1, 'on its own: the speaker button reads the story aloud');
    q('#info').click();
    t.ok(q('#sheet').classList.contains('on') && /Edward Andrew A\. Dionido/.test(q('#sheet').textContent) && q('#about').textContent.length > 40, 'on its own: the About sheet has the credit and what the game teaches');
    const cap = q('#sheet .aff-btn'), aff = cap && d.getElementById(cap.getAttribute('aria-controls'));
    t.ok(!!aff && aff.hidden && cap.getAttribute('aria-expanded') === 'false', 'on its own: a small cap icon beside the developer\'s name, his other affiliation hidden');
    if (cap) cap.click();
    t.ok(!!aff && !aff.hidden && cap.getAttribute('aria-expanded') === 'true' && /MS Environmental Science \(Ongoing\)/.test(aff.textContent)
      && /College of Professional and Graduate Studies, De La Salle University Dasmariñas/.test(aff.textContent) && q('#sheet').classList.contains('on'),
      'on its own: tapping the cap icon shows his other affiliation and keeps the sheet open');
    q('#close').click();
    if (G.practice) {
      q('#go').click(); q('#simulate').click(); q('#skip').click();
      q('#ptry').click();
      t.ok(q('#psheet').classList.contains('on') && q('#pin').children.length > 0, 'on its own: the practice opens');
      game.closePractice();
      t.ok(!q('#psheet').classList.contains('on'), 'on its own: the practice closes');
    }
    t.ok(!/fonts\.googleapis|https?:\/\/cdn/.test(fs.readFileSync(G.solo, 'utf8')), 'on its own: needs no internet');
    t.ok(!errors.length, 'on its own: no script errors: ' + errors.join('; '));
    close();
  }
}

// The words: no long dashes anywhere in what the game says (house style).
function noDashes(t, slug) {
  const shared = ['core.js', 'kit3d.js', 'aidroom.js', 'template.html', 'core.css'].map((f) => path.join(ROOT, 'games', 'shared', f));
  const files = [path.join(ROOT, 'games', slug, 'game.js')].concat(shared);
  for (const f of files) t.ok(!/[–—]/.test(fs.readFileSync(f, 'utf8')), path.relative(ROOT, f) + ' has no en or em dashes');
}

// run one game's tests on their own: node games/tests/<game>.test.cjs
function main(fn) {
  fn().then((t) => { console.log(t.name + ': ' + t.pass + ' passed, ' + t.fail + ' failed'); process.exit(t.fail ? 1 : 0); })
    .catch((e) => { console.log('FAIL: ' + (e && e.stack || e)); process.exit(1); });
}

module.exports = { ROOT, lib, solo, wait, counter, open, perms, worstOf, grades, allOrders, flows, noDashes, main };
