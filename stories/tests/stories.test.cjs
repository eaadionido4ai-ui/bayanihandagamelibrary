// Generic playthrough test for BAYANIHanda story games.
// Usage: node BAYANIHanda-Story-Games-test.js <game.html> <specs.js> <flood|quake|fire|lockdown>
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const [file, specPath, specName] = process.argv.slice(2);
const specMod = require(path.resolve(specPath));
const spec = specName ? specMod[specName] : specMod;
const html = fs.readFileSync(file, 'utf8');

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('FAIL:', msg); } };

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.org/',
  beforeParse(w){ w.HTMLElement.prototype.scrollIntoView = function(){}; }
});
const w = dom.window, d = w.document;
const errors = [];
w.addEventListener('error', e => errors.push(e.message));

const q = s => d.querySelector(s);
const qa = s => [...d.querySelectorAll(s)];
const click = el => { if (!el) throw new Error('missing element'); el.click(); };
const sceneEl = () => q('#scene');
const title = () => {
  const h = q('#card h2');
  if (h && !q('#card .end-top') && !q('#card').hidden) return h.textContent.trim();
  return q('#chipTime').textContent.trim();
};
const sceneOf = () => spec.titles.find(t => title().includes(t));
const visibleText = () => [q('#card'), q('#vnbox')].filter(e => !e.hidden).map(e => e.textContent).join(' ');
const FX_EL = {flood1:'.water', flood2:'.water', flood3:'.water', mud:'.mud', waterline:'.waterline', truck:'.rescue', neighbor:'.neighbor', smoke:'.plume', fireglow:'.fire', firetruck:'.firetruck', soot:'.soot', students:'.students', tents:'.tents', evac:'.evac-banner', police:'.police', cracks:'.cracks', pots:'.pots', dark:'.room-dark', smoke1:'.smoke-a', smoke2:'.smoke-b', alarm:'.alarm-led', blinds:'.blinds', boxfallen:'.box-floor', boxmoved:'.box-moved', fallen:'.fallen', octopus:'.octo-glow', spark:'.octo-spark', shake:'.shaker', kite:'.kite', debris:'.debris', wiredown:'.wire-down', dog:'.dog', rain:'.rain', wind:'.wind'};
const ROOM_EL = {class:'.prop-class', bedroom:'.prop-bed', living:'.prop-living'};
const setsSeen = new Set();
let spritesSeen = 0, burstsSeen = 0, bagOverfillTested = false;

function checkFrame(where){
  const t = visibleText();
  ok(!/\{sib\}|undefined|NaN|\[object/.test(t), `no placeholder text at ${where}`);
  ok(!/[\u2013\u2014]/.test(t), `no em or en dash shown at ${where}`);
  const s = sceneEl();
  setsSeen.add(s.dataset.set);
  ok(!!q('.set-' + s.dataset.set), `scene set "${s.dataset.set}" is built into the file at ${where}`);
  (s.dataset.fx || '').split(/\s+/).filter(Boolean).forEach(tok => {
    if (FX_EL[tok]) ok(!!q(FX_EL[tok]), `scene effect "${tok}" has artwork at ${where}`);
  });
  if (s.dataset.set === 'room') ok(!!q(ROOM_EL[s.dataset.room]), `room "${s.dataset.room}" has props at ${where}`);
  const story = !q('#card .end-top') && !q('.mode-grid');
  ok((q('#top').dataset.pin === 'chat') === (s.dataset.mode === 'chat' && story), `scene pinned only in chat style during the story at ${where}`);
  if (s.dataset.mode === 'vn'){
    if (qa('.sprite.on').length) spritesSeen++;
    if (q('#sfxLayer .burst')) burstsSeen++;
  }
}

function startGame(mode, hero){
  if (!q('#topRight').hidden) click(q('#topRight [data-act="restart"]'));
  click(q(`.mode[data-mode="${mode}"]`));
  click(q(`.pick[data-hero="${hero}"]`));
}

function revealAllStepwise(){
  // In cartoon style, step through lines one at a time to exercise sprites and sound effects.
  let guard = 0;
  while (q('[data-act="more"].tapnext') && guard++ < 30){
    if (sceneEl().dataset.mode === 'vn') checkFrame(`${title()} line ${guard}`);
    click(q('.tapnext[data-act="more"]'));
  }
}

function play(run){
  startGame(run.mode, run.hero);
  ok(sceneEl().dataset.mode === run.mode, `${run.mode}: scene uses ${run.mode} style`);
  const seen = [], texts = [];
  for (let step = 0; step < 40; step++){
    if (q('#card .end-top')) break;
    const sc = sceneOf();
    ok(!!sc, `${run.mode}: known scene at step ${step} (${title()})`);
    seen.push(sc);
    ok(!q('#chipSig').hidden, `${run.mode}: status chip shows in ${sc}`);
    if (run.mode === 'vn') ok(!q('#vnbox').hidden, `${run.mode}: dialogue box shows in ${sc}`);
    if (run.mode === 'vn' && step < 3) revealAllStepwise();
    const sk = q('[data-act="skip"]'); if (sk) click(sk);
    checkFrame(`${run.mode}/${sc}`);
    texts.push(visibleText());
    if (run.fxExpect && run.fxExpect[sc]) ok((sceneEl().dataset.fx || '').split(' ').includes(run.fxExpect[sc]), `${run.mode}: ${sc} shows "${run.fxExpect[sc]}"`);
    const want = run.plan[sc];
    if (q('.bag-grid')){
      const pick = +q('.bag-status span').textContent.match(/of (\d+)/)[1];
      if (!bagOverfillTested){
        const items = qa('.item');
        items.slice(0, pick + 1).forEach(it => click(q(`.item[data-id="${it.dataset.id}"]`)));
        ok(!!q('.full-msg'), 'bag-full message shows when packing one too many');
        ok(qa('.item[aria-pressed="true"]').length === pick, `bag holds only ${pick} items`);
        qa('.item[aria-pressed="true"]').map(b => b.dataset.id).forEach(id => click(q(`.item[data-id="${id}"]`)));
        ok(qa('.item[aria-pressed="true"]').length === 0, 'tapping packed items takes them out');
        bagOverfillTested = true;
      }
      ok(Array.isArray(want) && want.length === pick, `${run.mode}: plan packs ${pick} items in ${sc}`);
      want.forEach(id => click(q(`.item[data-id="${id}"]`)));
      ok(!q('[data-act="zip"]').disabled, `${run.mode}: zip enabled after packing in ${sc}`);
      click(q('[data-act="zip"]'));
    } else {
      const choices = qa('.choice');
      ok(choices.length >= 2, `${run.mode}: choices shown in ${sc}`);
      const pick = choices.find(c => c.textContent.toLowerCase().includes(String(want).toLowerCase()));
      ok(!!pick, `${run.mode}: choice "${want}" available in ${sc}`);
      if (!pick) break;
      click(pick);
    }
    if (run.mode === 'vn') revealAllStepwise();
    const sk2 = q('[data-act="skip"]'); if (sk2) click(sk2);
    ok(!!q('.feedback'), `${run.mode}: feedback shows in ${sc}`);
    checkFrame(`${run.mode}/${sc} feedback`);
    texts.push(visibleText());
    click(q('[data-act="next"]'));
  }
  ok(!!q('#card .end-top'), `${run.mode}: reached an ending`);
  const ending = q('#card .end-top h2') ? q('#card .end-top h2').textContent.trim() : '';
  const stars = q('.stars-row') ? q('.stars-row').getAttribute('aria-label') : '';
  checkFrame(`${run.mode} ending`);
  return { ending, stars, seen, text: texts.join(' ') };
}

// start screen
ok(q('h1') && q('h1').textContent.trim() === spec.heading, `start screen title is "${spec.heading}"`);
ok(qa('.mode').length === 2, 'two story styles offered');
ok(qa('.pick').length === 2, 'two characters offered');
ok(!!q('.callout') === !!spec.contentNote, spec.contentNote ? 'grown-ups content note shows' : 'no content note needed');
ok(qa('.cast .avatar').length >= 4, 'cast row shows the people in the story');
ok(!!q('#stage > #scene'), 'scene sits inside the stage that pins it');
checkFrame('start screen');

const endings = new Set();
spec.runs.forEach((run, i) => {
  const r = play(run);
  endings.add(r.ending);
  ok(r.ending === run.expect, `run ${i + 1} (${run.mode}, ${run.hero}) ends in "${run.expect}" (got "${r.ending}")`);
  if (run.stars) ok(r.stars === run.stars, `run ${i + 1} gives ${run.stars} (got ${r.stars})`);
  (run.mustSee || []).forEach(t => ok(r.seen.includes(t), `run ${i + 1} visits "${t}"`));
  (run.mustNotSee || []).forEach(t => ok(!r.seen.includes(t), `run ${i + 1} skips "${t}"`));
  (run.textHas || []).forEach(t => ok(r.text.includes(t), `run ${i + 1} shows "${t}"`));
});
ok(d.body.textContent.includes(`Endings found: ${endings.size} of 4`), `endings collection shows ${endings.size} of 4`);
ok(endings.size === 4, 'all four endings reached across runs');
(spec.sets || []).forEach(s => ok(setsSeen.has(s), `scene set "${s}" appears during play`));
ok(spritesSeen > 0, 'cartoon style shows characters on the scene');
if (spec.hasSfx) ok(burstsSeen > 0, 'cartoon style shows sound-effect bursts on the scene');

// style switch mid-game keeps the scene
startGame('chat', 'ate');
const before = sceneOf();
click(q('[data-act="skip"]'));
click(q('#segVn'));
ok(sceneEl().dataset.mode === 'vn' && sceneOf() === before, 'switching to cartoon keeps the current scene');
ok(qa('.sprite.on').length >= 1 || q('.vnbox.caption, .vnbox.sfx'), 'cartoon style shows a character or narration box');
ok(!q('#top').dataset.pin, 'cartoon style does not pin the scene');
click(q('#segChat'));
ok(sceneEl().dataset.mode === 'chat' && sceneOf() === before && !!q('#card h2'), 'switching back to chat keeps the scene');
ok(q('#top').dataset.pin === 'chat', 'chat style pins the scene again');

ok(errors.length === 0, 'no script errors: ' + errors.join('; '));
console.log(`${path.basename(file)}: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
