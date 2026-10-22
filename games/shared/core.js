'use strict';
/* OrderGame, the shared engine of the order games in the BAYANIHanda library (Quake in Order and the first aid games).
   The player puts the steps of a response in order, taps Simulate, and a 3D scene acts out exactly that order and grades
   each step: safe (ok), could be better (warn) or not safe (bad). The results explain what happened, show the right order
   and why, and offer a retry. Each game has an Easy and a Difficult level, each with its own right order.

   A game (games/<game>/game.js) supplies its words, steps, rules, scene and pictures; this file is everything around them:
   the screens, putting the cards in order, playing the simulation, the results, a hands-on practice, and the link to the
   library. Inside the library (?embed=1, in a frame, with &level=easy or hard) it wears the library's Engaging look, keeps
   nothing on the device, and tells the library when a round ends, what Bayani should read aloud and when the player
   leaves (postMessage, source 'bayani-game'). With no WebGL it still plays, with drawings in place of the 3D scene. */
(function () {
  const $ = (id) => document.getElementById(id);
  const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);
  const EMBED = params.get('embed') === '1' && window.parent !== window;
  const ctx2d = (c) => { try { return c.getContext('2d'); } catch (e) { return null; } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const GRADE = { ok: ['✓', 'var(--ok)'], warn: ['!', 'var(--warn)'], bad: ['✗', 'var(--bad)'] };

  function run(GAME) {
    /* ---------------- the library link ---------------- */
    function post(msg) {
      if (!EMBED) return;
      try { window.parent.postMessage(Object.assign({ source: 'bayani-game', game: GAME.id }, msg), '*'); } catch (e) { /* not in a frame */ }
    }
    // Bayani reads aloud. In the library the app speaks, since it knows the sound and voice settings; on its own, only when asked.
    function say(text, force) {
      if (EMBED) { post({ type: 'say', text, force: !!force }); return; }
      if (!force) return;
      try { const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 1.1; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { /* no speech here */ }
    }
    function hush() {
      if (EMBED) { post({ type: 'hush' }); return; }
      try { speechSynthesis.cancel(); } catch (e) { /* no speech here */ }
    }
    const soundOn = () => (EMBED ? params.get('sound') !== '0' : true);

    /* ---------------- level and look ---------------- */
    const LEVELS = Object.keys(GAME.levels);
    let level = LEVELS.indexOf(params.get('level')) >= 0 ? params.get('level') : (EMBED ? GAME.embedLevel : GAME.startLevel) || LEVELS[0];
    const right = () => GAME.levels[level].right;
    // Two looks for review on its own (Engaging and Minimalist); in the library it is always Engaging.
    const LOOK_KEY = GAME.slug + '-look';
    let look = 'lively';
    if (!EMBED) { try { const s = localStorage.getItem(LOOK_KEY); if (s === 'minimal' || s === 'lively') look = s; } catch (e) { /* private mode */ } }
    function setLook(l) {
      if (EMBED) l = 'lively';
      look = l; document.body.dataset.look = l;
      document.querySelectorAll('.seg button[data-look]').forEach((b) => b.classList.toggle('on', b.dataset.look === l));
      if (!EMBED) { try { localStorage.setItem(LOOK_KEY, l); } catch (e) { /* private mode */ } }
      if (K.ready) { K.recolor(); if (GAME.onRecolor) GAME.onRecolor(K); }
    }

    /* ---------------- 3D, or drawings ---------------- */
    const K = Kit3D.create({ pal: GAME.pal, poses: GAME.poses, cams: GAME.cams, look: () => look });
    let flat = false;
    function mountCanvas(host, mode) {
      if (!K.ready && !flat) {
        const c = document.createElement('canvas'); c.className = 'stage';
        let ok = false;
        try { ok = K.init(c) && GAME.build(K) !== false; } catch (e) { ok = false; }
        if (ok) K.ready = true; else flat = true;
      }
      if (flat) { mountFlat(host, mode); return; }
      K.mount(host, $('olay'));
    }
    // No 3D: a drawing of the step being acted out, and what people say, in place of the scene.
    function mountFlat(host, mode) {
      let fp = host.querySelector('.flatpic');
      if (!fp) { fp = document.createElement('div'); fp.className = 'flatpic'; host.insertBefore(fp, host.firstChild); }
      fp.innerHTML = mode === 'intro'
        ? '<div class="ico">' + GAME.ICON[GAME.flatIntro || right()[0]] + '</div><div class="note">This device can\'t show the 3D scene, so you will see drawings instead.</div>'
        : '<div class="ico" id="fico"></div><div class="say" id="fsay" hidden></div>';
    }
    window.addEventListener('resize', () => { if (K.ready) K.resize(); });

    /* ---------------- screens ---------------- */
    let screen = 'intro';
    function show(id) {
      screen = id;
      stopConfetti();
      document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('on', s.id === 's-' + id));
      $('back').style.visibility = id === 'intro' && !EMBED ? 'hidden' : 'visible';
      $('ttl').textContent = id === 'order' ? 'Put the steps in order' : id === 'res' ? 'How did it go?' : GAME.title;
      if (id === 'intro') mountCanvas($('hero'), 'intro');
      if (id === 'sim') mountCanvas($('simview'), 'sim');
    }
    function renderIntro() {
      const st = GAME.story(level);
      $('chips').innerHTML = GAME.chips.map((c) => '<span class="chip">' + esc(c) + '</span>').join('');
      $('bubt').innerHTML = st.bubble;
      $('sth').textContent = st.h2; $('stp').textContent = st.p; $('stm').textContent = st.mission;
      $('go').textContent = 'Put the ' + right().length + ' steps in order';
      $('ohint').textContent = GAME.hint || 'Drag the cards, or use the arrows. The first step goes at the top.';
      // the level picker, when the game runs on its own (in the library, the library's intro picks the level)
      $('levels').innerHTML = EMBED ? '' : '<div class="seg lv" role="group" aria-label="Level">' + LEVELS.map((l) => '<button data-level="' + l + '" class="' + (l === level ? 'on' : '') + '">' +
        esc(GAME.levels[l].label) + '<small>' + esc(GAME.levels[l].sub) + '</small></button>').join('') + '</div>';
    }
    function setLevel(l) {
      if (LEVELS.indexOf(l) < 0) return;
      level = l; order = shuffled(); renderList(); renderIntro();
    }

    /* ---------------- putting the steps in order ---------------- */
    let order = [];
    function shuffled() {
      const R = right();
      let o, n = 0;
      do { o = R.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } n++; }
      while (n < 200 && (o.join() === R.join() || (GAME.shuffleOk && !GAME.shuffleOk(o, level))));
      return o;
    }
    function renderList() {
      $('list').innerHTML = order.map((id, i) => '<div class="step" data-i="' + i + '"><div class="grip"></div><div class="num">' + (i + 1) + '</div><div class="ico">' + GAME.ICON[id] +
        '</div><div class="txt"><div class="t">' + esc(GAME.STEPS[id].t) + '</div><div class="d">' + esc(GAME.STEPS[id].d) + '</div></div>' +
        '<div class="mv"><button data-up="' + i + '" aria-label="Move ' + esc(GAME.STEPS[id].t) + ' up">&#9650;</button><button data-dn="' + i + '" aria-label="Move ' + esc(GAME.STEPS[id].t) + ' down">&#9660;</button></div></div>').join('');
    }
    function moveStep(i, j) { if (j < 0 || j >= order.length) return; const [m] = order.splice(i, 1); order.splice(j, 0, m); renderList(); }
    function setupDrag() {
      const L = $('list');
      L.addEventListener('click', (e) => {
        const up = e.target.closest('[data-up]'), dn = e.target.closest('[data-dn]');
        if (up) moveStep(+up.dataset.up, +up.dataset.up - 1);
        if (dn) moveStep(+dn.dataset.dn, +dn.dataset.dn + 1);
      });
      L.addEventListener('pointerdown', (e) => {
        const card = e.target.closest('.step'); if (!card || e.target.closest('.mv')) return;
        const cards = Array.from(L.children), idx = +card.dataset.i, rects = cards.map((c) => c.getBoundingClientRect());
        const startY = e.clientY, gap = rects.length > 1 ? rects[1].top - rects[0].bottom : 8;
        let dragging = false, target = idx;
        try { card.setPointerCapture(e.pointerId); } catch (er) { /* older browser */ }
        const move = (ev) => {
          const dy = ev.clientY - startY;
          if (!dragging && Math.abs(dy) > 6) { dragging = true; card.classList.add('drag'); }
          if (!dragging) return;
          ev.preventDefault();
          card.style.transform = 'translateY(' + dy + 'px)';
          const cy = rects[idx].top + rects[idx].height / 2 + dy;
          target = 0; for (let k = 0; k < rects.length; k++) if (k !== idx && rects[k].top + rects[k].height / 2 < cy) target++;
          const h = rects[idx].height + gap;
          cards.forEach((c, k) => {
            if (k === idx) return;
            let sh = 0;
            if (idx < target && k > idx && k <= target) sh = -h;
            if (idx > target && k < idx && k >= target) sh = h;
            c.style.transform = sh ? 'translateY(' + sh + 'px)' : '';
          });
        };
        const up = () => {
          card.removeEventListener('pointermove', move); card.removeEventListener('pointerup', up); card.removeEventListener('pointercancel', up);
          if (dragging) { const [m] = order.splice(idx, 1); order.splice(target, 0, m); }
          renderList();
        };
        card.addEventListener('pointermove', move); card.addEventListener('pointerup', up); card.addEventListener('pointercancel', up);
      });
    }

    /* ---------------- playing the simulation ---------------- */
    let SIM = null, T = 0, playing = false, demo = false, last = 0, stepSegs = [];
    const segAt = (T) => { if (!SIM) return null; let s = SIM.segs[0]; for (const x of SIM.segs) if (T >= x.T0) s = x; return s; };
    const hits = (e, T) => SIM.evs.filter((x) => x.e === e && T >= x.T);
    const ctx = { segAt, hits, evalKeys: Kit3D.evalKeys, get demo() { return demo; }, get level() { return level; }, rm: RM };
    function startSim(ord, isDemo) {
      SIM = GAME.simulate(ord, level); demo = !!isDemo; T = 0; playing = true; capKey = '';
      stepSegs = SIM.segs.filter((s) => s.step);
      if (K.ready) { K.clearTags(); if (GAME.reset) GAME.reset(K, level); }
      $('strip').innerHTML = stepSegs.map((s, i) => '<div class="s" data-k="' + i + '"><div class="n">' + (i + 1) + '</div>' + esc(GAME.STEPS[s.step].short) + '</div>').join('');
      show('sim');
      $('skip').textContent = 'Skip to results';
    }
    let capKey = '';
    function setCap(g, cls, html) {
      const key = g + cls + html; if (key === capKey) return; capKey = key;
      const ge = $('capg'); ge.textContent = g; ge.className = 'g ' + cls; ge.style.visibility = g ? 'visible' : 'hidden'; $('capt').innerHTML = html;
    }
    // The words around the scene at time T: the status chip, the caption and the step strip (and the drawings, with no 3D).
    function hud(T) {
      const seg = segAt(T), tau = T - seg.T0, idx = stepSegs.indexOf(seg);
      const st = GAME.status ? GAME.status(T, SIM, ctx) : null, chip = $('shake');
      if (st) { chip.className = 'shake ' + (st.cls || 'on'); chip.textContent = st.text; } else chip.className = 'shake';
      if (seg.pre) setCap('!', 'warn', GAME.preCaption(level));
      else if (seg.end) setCap('', '', demo ? '<b>That\'s the right way.</b>' : '<b>Let\'s see how it went…</b>');
      else if (seg.auto) setCap('', '', seg.cap);
      else {
        const s = GAME.STEPS[seg.step], showG = tau > Math.min(1.0, seg.dur * 0.45);
        if (showG) setCap(GRADE[seg.grade][0], seg.grade, '<b>' + esc(s.t) + '.</b> ' + seg.msg);
        else setCap(String(idx + 1), '', '<b>Step ' + (idx + 1) + ': ' + esc(s.t) + '</b>');
      }
      document.querySelectorAll('#strip .s').forEach((el, k) => {
        const sg = stepSegs[k], doneK = T >= sg.T0 + Math.min(1.0, sg.dur * 0.45);
        el.classList.toggle('now', k === idx);
        el.classList.toggle('ok', doneK && sg.grade === 'ok'); el.classList.toggle('warn', doneK && sg.grade === 'warn'); el.classList.toggle('bad', doneK && sg.grade === 'bad');
      });
      if (flat) {
        const f = GAME.flat(T, SIM, ctx, seg), fi = $('fico'), fs = $('fsay');
        if (fi && fi.dataset.k !== f.icon) { fi.dataset.k = f.icon; fi.innerHTML = GAME.ICON[f.icon] || ''; }
        if (fs) { fs.hidden = !f.say; if (fs.textContent !== (f.say || '')) fs.textContent = f.say || ''; }
      }
    }
    function loop(now) {
      requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
      if (screen === 'sim' && SIM) {
        if (playing) { T += dt; if (T >= SIM.total) { T = SIM.total; playing = false; setTimeout(showResults, 250); } }
        hud(T);
        if (K.ready) { GAME.frame(K, T, SIM, ctx); K.render(); }
      } else if (screen === 'intro' && K.ready) { GAME.idle(K, now / 1000, level); K.render(); }
    }

    /* ---------------- results ---------------- */
    function showResults() {
      if (!SIM || screen !== 'sim') return;
      playing = false;
      const R = SIM.results, worst = R.some((r) => r.grade === 'bad') ? 'bad' : R.some((r) => r.grade === 'warn') ? 'warn' : 'ok';
      const V = GAME.verdict(worst, demo, level), stars = worst === 'ok' ? 3 : worst === 'warn' ? 2 : 1;
      $('verdict').innerHTML = '<div class="big" style="background:' + GRADE[worst][1] + '">' + GRADE[worst][0] + '</div><div><h2>' + esc(V.title) + '</h2><p>' + esc(V.text) +
        '</p><div class="stars">' + '★'.repeat(stars) + '<i>' + '★'.repeat(3 - stars) + '</i></div></div>';
      const note = GAME.note ? GAME.note(level, worst, demo) : null;
      $('rnote').hidden = !note; $('rnote').innerHTML = note || '';
      $('rlist').innerHTML = R.map((r, i) => '<div class="card rrow"><div class="ico">' + GAME.ICON[r.id] + '</div><div style="flex:1;min-width:0"><div class="t">' + (i + 1) + '. ' + esc(GAME.STEPS[r.id].t) +
        '</div><div class="m">' + r.msg + '</div></div><div class="g ' + r.grade + '" style="background:' + GRADE[r.grade][1] + '">' + GRADE[r.grade][0] + '</div></div>').join('');
      $('right').innerHTML = right().map((id) => '<li><b>' + esc(GAME.STEPS[id].t) + '.</b> ' + esc(GAME.STEPS[id].why) + '</li>').join('');
      const P = GAME.practice;
      $('practice').hidden = !P;
      if (P) $('practice').innerHTML = '<div class="pi ico">' + P.icon + '</div><div style="flex:1;min-width:0"><h3>' + esc(P.title) + '</h3><p>' + esc(P.text) + '</p><button class="cta ghost" id="ptry">' + esc(P.button) + '</button></div>';
      $('again').textContent = demo ? 'Try it yourself' : 'Change my order';
      show('res');
      if (worst === 'ok' && look === 'lively' && !RM) confetti();
      // Tell the library how it went: a round where every step is safe, with the player's own order, earns the badge.
      post({ type: 'result', safe: worst === 'ok', grade: worst, stars, demo, level, order: R.map((r) => r.id) });
      say(V.title + ' ' + V.text);
    }

    /* ---------------- a hands-on practice, in a sheet ---------------- */
    let practiceEnd = null;
    function openPractice() {
      const P = GAME.practice; if (!P) return;
      const box = $('pin');
      box.innerHTML = '';
      $('psheet').classList.add('on');
      practiceEnd = P.run(box, { close: closePractice, say, sound: soundOn(), rm: RM });
    }
    function closePractice() {
      if (practiceEnd) { try { practiceEnd(); } catch (e) { /* already stopped */ } practiceEnd = null; }
      $('psheet').classList.remove('on');
    }

    let confettiOn = false;
    function stopConfetti() {
      confettiOn = false;
      const c = $('confetti'), g = ctx2d(c);
      if (g) g.clearRect(0, 0, c.width, c.height);
    }
    function confetti() {
      const c = $('confetti'), g = ctx2d(c);
      if (!g) return;
      confettiOn = true;
      const W = c.width = innerWidth, H = c.height = innerHeight;
      const cols = ['#f2760c', '#ffc53d', '#1e9c5a', '#3d8fd6', '#e94b4b'], P = [];
      for (let i = 0; i < 90; i++) P.push({ x: Math.random() * W, y: -20 - Math.random() * H * 0.5, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, c: cols[i % 5], a: Math.random() * 6 });
      const t0 = performance.now();
      (function f(now) {
        const t = (now - t0) / 1000; g.clearRect(0, 0, W, H); if (t > 2.6 || !confettiOn) return;
        for (const p of P) { p.x += p.vx; p.y += p.vy; p.a += 0.1; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.globalAlpha = Math.min(1, 2.6 - t); g.fillRect(-4, -2.5, 8, 5); g.restore(); }
        requestAnimationFrame(f);
      })(t0);
    }

    /* ---------------- wiring ---------------- */
    function leave() { hush(); post({ type: 'exit' }); }
    function init() {
      if (EMBED) { document.body.classList.add('embed'); $('done').hidden = false; }
      $('about').innerHTML = GAME.about;
      setLook(look);
      order = shuffled(); renderList(); renderIntro(); setupDrag();
      document.querySelectorAll('.seg button[data-look]').forEach((b) => b.addEventListener('click', () => setLook(b.dataset.look)));
      $('levels').addEventListener('click', (e) => { const b = e.target.closest('[data-level]'); if (b) setLevel(b.dataset.level); });
      $('spk').addEventListener('click', () => say($('bubt').textContent, true));
      $('go').addEventListener('click', () => show('order'));
      $('simulate').addEventListener('click', () => startSim(order.slice(), false));
      $('skip').addEventListener('click', () => { if (SIM && screen === 'sim') { T = SIM.total; showResults(); } });
      $('again').addEventListener('click', () => show('order'));
      $('replay').addEventListener('click', () => startSim(SIM && demo ? right().slice() : order.slice(), demo));
      $('demo').addEventListener('click', () => startSim(right().slice(), true));
      $('done').addEventListener('click', leave);
      $('practice').addEventListener('click', (e) => { if (e.target.closest('#ptry')) openPractice(); });
      $('back').addEventListener('click', () => {
        if (screen === 'intro') leave();
        else if (screen === 'order') show('intro');
        else if (screen === 'sim') { playing = false; show('order'); }
        else if (screen === 'res') show('order');
      });
      $('info').addEventListener('click', () => $('sheet').classList.add('on'));
      $('close').addEventListener('click', () => $('sheet').classList.remove('on'));
      $('sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') $('sheet').classList.remove('on'); });
      $('psheet').addEventListener('click', (e) => { if (e.target.id === 'psheet') closePractice(); });
      show('intro');
      if (EMBED) say($('bubt').textContent); // read aloud when the voice is on in the library
      requestAnimationFrame(loop);
      // for the tests
      window.__order = {
        game: GAME.id, embed: EMBED, levels: LEVELS, STEPS: GAME.STEPS,
        get flat() { return flat; }, get level() { return level; }, setLevel, get right() { return right().slice(); }, rightOf: (l) => GAME.levels[l].right.slice(),
        simulate: (o, l) => GAME.simulate(o, l || level), start: (o, d) => startSim(o, d), seek: (t) => { T = t; playing = false; },
        get T() { return T; }, get SIM() { return SIM; }, setOrder: (o) => { order = o.slice(); renderList(); }, get order() { return order.slice(); },
        get screen() { return screen; }, show, setLook, openPractice, closePractice
      };
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }

  window.OrderGame = { run, EMBED };
})();
