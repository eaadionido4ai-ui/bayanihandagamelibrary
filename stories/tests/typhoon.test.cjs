// Smoke test for the Bagyong Kulog game: plays every ending in both story styles inside jsdom.
const fs = require('fs');
const { JSDOM } = require('jsdom');
const file = process.argv[2];
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
const title = () => {
  const h = q('#card h2');
  if (h && !q('#card .end-top')) return h.textContent.trim();
  return q('#chipTime').textContent.trim();
};
const TITLES = ['News on the radio','Gray skies','Kite trouble','Pack the Go Bag','Hurry with the Go Bag','The wind picks up','Brownout!','BANG!','Suddenly, quiet','The morning after'];
const sceneOf = () => TITLES.find(t => title().includes(t));
const visibleText = () => [q('#card'), q('#vnbox')].filter(e => !e.hidden).map(e => e.textContent).join(' ');

function checkFrame(where){
  const t = visibleText();
  ok(!/\{sib\}|undefined|NaN/.test(t), `no placeholder text at ${where}`);
  ok(!/[\u2013\u2014]/.test(t), `no em or en dash shown at ${where}`);
  const story = !q('#card .end-top') && !q('.mode-grid');
  ok((q('#top').dataset.pin === 'chat') === (q('#scene').dataset.mode === 'chat' && story), `scene pinned only in chat style during the story at ${where}`);
}

function play(mode, hero, plan){
  click(q('[data-act="restart"]') && !q('#topRight').hidden ? q('[data-act="restart"]') : null || q('[data-act="mode"][data-mode="' + mode + '"]'));
  if (q('#topRight') && !q('#topRight').hidden) click(q('[data-act="restart"]'));
  click(q(`.mode[data-mode="${mode}"]`));
  click(q(`.pick[data-hero="${hero}"]`));
  ok(q('#scene').dataset.mode === mode, `${mode}: scene uses ${mode} style`);
  const seen = [], texts = [];
  for (let step = 0; step < 40; step++){
    if (q('#card .end-top')) break;
    const sc = sceneOf();
    ok(!!sc, `${mode}: known scene at step ${step} (${title()})`);
    seen.push(sc);
    if (mode === 'vn') ok(!q('#vnbox').hidden, `${mode}: dialogue box shows in ${sc}`);
    const sk = q('[data-act="skip"]'); if (sk) click(sk);
    checkFrame(`${mode}/${sc}`);
    texts.push(visibleText());
    const want = plan[sc];
    if (q('.bag-grid')){
      want.forEach(id => click(q(`.item[data-id="${id}"]`)));
      ok(!q('[data-act="zip"]').disabled, `${mode}: zip enabled after packing in ${sc}`);
      click(q('[data-act="zip"]'));
    } else {
      const choices = qa('.choice');
      ok(choices.length >= 2, `${mode}: choices shown in ${sc}`);
      const pick = choices.find(c => c.textContent.toLowerCase().includes(want.toLowerCase()));
      ok(!!pick, `${mode}: choice "${want}" available in ${sc}`);
      click(pick);
    }
    const sk2 = q('[data-act="skip"]'); if (sk2) click(sk2);
    ok(!!q('.feedback'), `${mode}: feedback shows in ${sc}`);
    checkFrame(`${mode}/${sc} feedback`);
    click(q('[data-act="next"]'));
  }
  ok(!!q('#card .end-top'), `${mode}: reached an ending`);
  ok(!q('#top').dataset.pin, `${mode}: scene not pinned on the ending page`);
  return { ending: q('#card .end-top h2').textContent.trim(), stars: q('.stars-row').getAttribute('aria-label'), seen, text: texts.join(' ') };
}

// start screen
ok(q('h1').textContent.includes('Bagyong Kulog'), 'start screen title');
ok(qa('.mode').length === 2, 'two story styles offered');
ok(qa('.pick').length === 2, 'two characters offered');
ok(!!q('#stage > #scene'), 'scene sits inside the stage that pins it');
ok(!q('#top').dataset.pin, 'scene not pinned on the start screen');

// 1. Hero ending, chat style, playing as Ate
const allGood = {
  'News on the radio':'Help Mama', 'Pack the Go Bag':['flashlight','water','firstaid','whistle'],
  'The wind picks up':'plant pots', 'Brownout!':'flashlight from the Go Bag', 'BANG!':'small room',
  'Suddenly, quiet':'Stay inside', 'The morning after':'Stay far away'
};
let r = play('chat', 'ate', allGood);
ok(r.ending === 'Typhoon Ready Hero', `chat all-safe path gives Hero (got ${r.ending})`);
ok(r.stars === '7 of 7 safety stars', `chat all-safe path gives 7 of 7 (got ${r.stars})`);
ok(r.text.includes('Ate, I want to help too'), 'Migo says Ate when playing as Ate');

// 2. Eye ending, cartoon style, playing as Kuya
r = play('vn', 'kuya', Object.assign({}, allGood, {'Suddenly, quiet':'Run outside'}));
ok(r.ending === 'Caught in the Eye', `cartoon eye path gives Caught in the Eye (got ${r.ending})`);
ok(r.text.includes('Kuya'), 'Migo says Kuya when playing as Kuya');

// 3. Safe ending through the kite branch, cartoon style
r = play('vn', 'ate', {
  'News on the radio':'Play outside', 'Gray skies':'Fly the kite', 'Kite trouble':'Let go',
  'Hurry with the Go Bag':['flashlight','water'], 'Brownout!':'flashlight from the Go Bag',
  'BANG!':'small room', 'Suddenly, quiet':'Stay inside', 'The morning after':'Stay far away'
});
ok(r.seen.includes('Kite trouble') && !r.seen.includes('The wind picks up'), 'kite branch skips the yard scene');
ok(r.ending === 'Safe and Sound', `kite branch gives Safe and Sound (got ${r.ending})`);

// 4. Lucky ending, chat style, no flashlight packed
r = play('chat', 'kuya', {
  'News on the radio':'Play outside', 'Gray skies':'Fly the kite', 'Kite trouble':'Pull the string',
  'Hurry with the Go Bag':['candle','console'], 'Brownout!':'candle',
  'BANG!':'Peek', 'Suddenly, quiet':'Stay inside', 'The morning after':'long stick'
});
ok(r.ending === 'Lucky Night', `risky path gives Lucky Night (got ${r.ending})`);

// endings collection and bag limit
ok(d.body.textContent.includes('Endings found: 4 of 4'), 'all four endings recorded');
click(q('[data-act="restart"]'));
click(q('.mode[data-mode="chat"]'));
click(q('.pick[data-hero="ate"]'));
click(q('[data-act="skip"]')); click(q('.choice')); click(q('[data-act="next"]'));
click(q('[data-act="skip"]'));
['flashlight','water','firstaid','whistle','powerbank'].forEach(id => click(q(`.item[data-id="${id}"]`)));
ok(!!q('.full-msg'), 'bag-full message shows on a fifth item');
ok(qa('.item[aria-pressed="true"]').length === 4, 'bag holds only four items');

// style switch mid-game keeps the scene
click(q('#segVn'));
ok(q('#scene').dataset.mode === 'vn' && title().includes('Pack the Go Bag'), 'switching to cartoon keeps the current scene');
ok(qa('.sprite.on').length >= 1, 'cartoon style shows a character on the scene');
ok(!q('#top').dataset.pin, 'cartoon style does not pin the scene');
click(q('#segChat'));
ok(q('#scene').dataset.mode === 'chat' && !!q('.bag-grid'), 'switching back to chat keeps the Go Bag picks screen');
ok(q('#top').dataset.pin === 'chat', 'chat style pins the scene again');

ok(errors.length === 0, 'no script errors: ' + errors.join('; '));
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
