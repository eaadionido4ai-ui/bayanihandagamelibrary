'use strict';
/* Quake in Order, a game in the BAYANIHanda Game Library (Act Fast).
   The player puts the steps of Duck, Cover, and Hold in order (plus opening the door first when you sit next to it),
   then a 3D classroom acts out exactly that order and shows what happens. Uses the global THREE (r128), like the library's games.
   Inside the library (?embed=1, in a frame) it wears the library's Engaging look, keeps nothing on the device, and tells the
   library when a round ends, what Bayani should read aloud and when the player leaves (postMessage, source 'bayani-game').
   With no WebGL it still plays, with drawings in place of the 3D classroom. */
(function () {
  const $ = (id) => document.getElementById(id);
  const PI = Math.PI;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
  const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- inside the library, or on its own ---------------- */
  const EMBED = new URLSearchParams(location.search).get('embed') === '1' && window.parent !== window;
  const GAME = 'quake'; // the library's id for this game: its card and its Quake Ready badge
  function post(msg) {
    if (!EMBED) return;
    try { window.parent.postMessage(Object.assign({ source: 'bayani-game', game: GAME }, msg), '*'); } catch (e) { /* not in a frame */ }
  }
  // Bayani reads aloud. In the library the app speaks, since it knows the sound and voice settings; on its own, only when asked.
  function say(text, force) {
    if (EMBED) { post({ type: 'say', text: text, force: !!force }); return; }
    if (!force) return;
    try { const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 1.1; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { /* no speech here */ }
  }
  function hush() {
    if (EMBED) { post({ type: 'hush' }); return; }
    try { speechSynthesis.cancel(); } catch (e) { /* no speech here */ }
  }
  const ctx2d = (c) => { try { return c.getContext('2d'); } catch (e) { return null; } };

  /* ---------------- the steps ---------------- */
  const svg = (s) => '<svg viewBox="0 0 64 64" aria-hidden="true"><rect class="tile" x="2" y="2" width="60" height="60" rx="14"/>' + s + '</svg>';
  const DESK = '<path class="thin" d="M6 55 H58"/><rect class="fa" x="8" y="22" width="48" height="6" rx="2"/><path class="ln" d="M12 28 V54 M52 28 V54"/>';
  const ICON = {
    door: svg('<path class="thin" d="M8 56 H56"/><path class="ln" d="M16 55 V12 H40 V55"/><path class="fb" d="M16 12 L29 17 V50 L16 55 Z"/><circle class="acf" cx="26" cy="34" r="2.2"/><path class="ac" d="M50 42 C 53 29, 47 20, 37 21"/><path class="ac" d="M37 21 L43 16 M37 21 L42 27"/>'),
    duck: svg('<path class="thin" d="M8 55 H56"/><path class="ac" d="M12 11 V27 M12 27 L7 22 M12 27 L17 22"/><path class="ln" d="M27 42 L33 54 L19 54"/><path class="ln" d="M27 42 L39 32"/><circle class="hd" cx="45" cy="30" r="6"/><path class="ln" d="M38 33 L47 22"/>'),
    cover: svg(DESK + '<path class="ln" d="M22 44 L28 54 L16 54"/><path class="ln" d="M22 44 L34 40"/><circle class="hd" cx="40" cy="41" r="5.5"/><path class="ln" d="M33 39 L42 33"/>'),
    hold: svg(DESK + '<path class="ln" d="M20 44 L26 54 L14 54"/><path class="ln" d="M20 44 L32 40"/><circle class="hd" cx="38" cy="41" r="5.5"/><path class="ln" d="M32 43 L48 45"/><circle class="acf" cx="51" cy="45" r="3.4"/>'),
    wait: svg(DESK + '<path class="ln" d="M22 44 L28 54 L16 54"/><path class="ln" d="M22 44 L34 40"/><circle class="hd" cx="40" cy="41" r="5.5"/><path class="ln" d="M33 39 L42 33"/><circle class="acf" cx="47" cy="12" r="8.5"/><path d="M47 7.5 V12 L50.5 14.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>'),
    walk: svg('<path class="ac" d="M8 57 H50" stroke-dasharray="3 5"/><path class="ac" d="M51 57 L45 53 M51 57 L45 61"/><circle class="hd" cx="42" cy="13" r="5.5"/><path class="ln" d="M42 19 V35 M42 35 L36 50 M42 35 L48 50 M42 23 L49 30 M42 23 L36 30"/><circle class="hd" cx="21" cy="24" r="4.5"/><path class="ln" d="M21 29 V40 M21 40 L17 51 M21 40 L25 51 M21 32 L26 37 M21 32 L16 37"/>'),
    quake: svg('<path class="thin" d="M6 55 H58"/><path class="ln" d="M14 55 V31 L32 16 L50 31 V55"/><path class="thin" d="M31 55 L34 47 L29 41 L33 34"/><path class="ac" d="M8 24 L3 28 M56 24 L61 28 M8 37 L3 39 M56 37 L61 39"/>'),
    field: svg('<rect class="gr" x="2" y="46" width="60" height="16" rx="0"/><path class="ln" d="M50 47 V10"/><path class="acf" d="M50 10 L61 14 L50 18 Z"/><circle class="hd" cx="16" cy="28" r="4"/><circle class="hd" cx="27" cy="28" r="4"/><circle class="hd" cx="38" cy="28" r="4"/><path class="ln" d="M16 33 V41 M16 41 L13 47 M16 41 L19 47 M27 33 V41 M27 41 L24 47 M27 41 L30 47 M38 33 V41 M38 41 L35 47 M38 41 L41 47"/><circle class="acf" cx="13" cy="13" r="7"/><path d="M9.5 13 L12 15.6 L16.8 10.6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>')
  };
  const STEPS = {
    door: { t: 'Open the door', d: 'Your seat is next to it. Open it right away so the shaking can\'t jam it shut.', short: 'Door',
      why: 'A strong quake can bend the door frame and jam the door shut. If you sit next to it, open it before you take cover.' },
    duck: { t: 'Duck', d: 'Drop down low, on your knees, so you won\'t fall.', short: 'Duck', why: 'Getting low keeps the shaking from knocking you over.' },
    cover: { t: 'Cover', d: 'Crawl under your sturdy desk. Cover your head and neck.', short: 'Cover', why: 'The desk shields you from falling things, and your arms protect your head and neck.' },
    hold: { t: 'Hold', d: 'Hold on to a desk leg so the desk stays over you.', short: 'Hold', why: 'Desks slide when the ground shakes. Holding a leg keeps yours over you.' },
    wait: { t: 'Wait', d: 'Stay under your desk until the shaking stops.', short: 'Wait', why: 'Moving while it shakes is how many people get hurt.' },
    walk: { t: 'Walk out', d: 'Walk out calmly with your class. Follow your teacher. No running, no pushing.', short: 'Walk',
      why: 'Walking out together keeps the class safe in the halls, and your teacher knows where everyone is.' },
    field: { t: 'Go to the open field', d: 'Line up away from buildings, trees and posts, so your teacher can count everyone.', short: 'Field',
      why: 'Nothing can fall on you in the open, and the head count shows that no one is left behind.' }
  };
  const RIGHT = ['door', 'duck', 'cover', 'hold', 'wait', 'walk', 'field'];

  /* ---------------- look, screens ---------------- */
  // Two looks for review on its own (Engaging and Minimalist); in the library it is always Engaging.
  const LOOK_KEY = 'quake-in-order-look';
  let look = 'lively';
  if (!EMBED) { try { const s = localStorage.getItem(LOOK_KEY); if (s === 'minimal' || s === 'lively') look = s; } catch (e) { /* private mode */ } }
  function setLook(l) {
    if (EMBED) l = 'lively';
    look = l; document.body.dataset.look = l;
    document.querySelectorAll('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.look === l));
    if (!EMBED) { try { localStorage.setItem(LOOK_KEY, l); } catch (e) { /* private mode */ } }
    if (G.ready) recolor();
  }
  let screen = 'intro';
  function show(id) {
    screen = id;
    stopConfetti();
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('on', s.id === 's-' + id));
    $('back').style.visibility = id === 'intro' && !EMBED ? 'hidden' : 'visible';
    $('ttl').textContent = id === 'order' ? 'Put the steps in order' : id === 'res' ? 'How did it go?' : 'Quake in Order';
    if (id === 'intro') mountCanvas($('hero'), 'intro');
    if (id === 'sim') mountCanvas($('simview'), 'sim');
  }

  /* ---------------- ordering the steps ---------------- */
  let order = shuffled();
  function shuffled() {
    let o;
    do { o = RIGHT.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } }
    while (o.join() === RIGHT.join() || o[0] === 'door');
    return o;
  }
  function renderList() {
    const L = $('list');
    L.innerHTML = order.map((id, i) => '<div class="step" data-i="' + i + '"><div class="grip"></div><div class="num">' + (i + 1) + '</div><div class="ico">' + ICON[id] +
      '</div><div class="txt"><div class="t">' + STEPS[id].t + '</div><div class="d">' + STEPS[id].d + '</div></div>' +
      '<div class="mv"><button data-up="' + i + '" aria-label="Move ' + STEPS[id].t + ' up">&#9650;</button><button data-dn="' + i + '" aria-label="Move ' + STEPS[id].t + ' down">&#9660;</button></div></div>').join('');
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
      try { card.setPointerCapture(e.pointerId); } catch (er) {}
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

  /* ---------------- the simulation rules ----------------
     State: shaking, door (closed | open | jammed), where (desk | door | out | line | alone), kid pose and spot.
     Each step returns a grade (ok | warn | bad), a message, and the keyframes the 3D scene plays. */
  const SPOT = {
    seat: { x: -2.3, z: 1.86, f: PI },
    stand: { x: -2.3, z: 2.12, f: PI },
    duckDesk: { x: -3.02, z: 1.5, f: PI / 2 },
    under: { x: -2.46, z: 1.25, f: PI / 2 },
    beside: { x: -3.08, z: 1.22, f: PI / 2 },
    doorIn: { x: -3.08, z: 2.2, f: -PI / 2 },
    doorLow: { x: -2.98, z: 2.32, f: PI / 2 },
    out: { x: -4.4, z: 2.2, f: -PI / 2 },
    line: { x: -8.3, z: 2.55, f: PI },
    alone: { x: -6.7, z: 4.3, f: -PI / 2 }
  };
  const MSG = {
    jam: 'The shaking bent the door frame, so the door got stuck. Your class was trapped until your teacher forced it open. If you sit next to the door, open it as soon as the shaking starts.'
  };
  const inside = (st) => st.where === 'desk' || st.where === 'door';
  const covered = (st) => st.pose === 'cover' || st.pose === 'hold';

  function newSeg(st, step) {
    return { step, grade: 'ok', msg: '', t: 0, dur: 0, kid: [Object.assign({ t: 0 }, st.kid)], door: [], teacher: null, events: [], cams: [], shaking0: st.shaking };
  }
  function mv(s, st, dt, pose, spot, o) {
    o = o || {};
    s.t += dt;
    const p = spot ? SPOT[spot] : st.kid;
    st.kid = { pose, x: p.x, z: p.z, f: o.f !== undefined ? o.f : p.f };
    s.kid.push(Object.assign({ t: s.t, walk: !!o.walk, run: !!o.run, crawl: !!o.crawl, wobble: !!o.wobble }, st.kid));
  }
  function hold(s, st, dt) { s.t += dt; s.kid.push(Object.assign({ t: s.t }, st.kid)); }
  function cam(s, v, t) { s.cams.push({ t: t === undefined ? s.t : t, v }); }
  function ev(s, e, x) { s.events.push(Object.assign({ t: s.t, e }, x || {})); }
  function done(s, tail) { s.dur = s.t + (tail === undefined ? 0.45 : tail); return s; }

  function getUp(s, st, run) {
    // from wherever the kid is inside, get back on their feet
    if (st.pose === 'cover' || st.pose === 'hold') { mv(s, st, 0.55, 'duck', 'duckDesk', { crawl: true }); mv(s, st, 0.4, 'stand'); }
    else if (st.pose === 'holdOut') { mv(s, st, 0.4, 'stand', 'duckDesk'); }
    else if (st.pose === 'duck') mv(s, st, 0.4, 'stand');
    else if (st.pose === 'sit') mv(s, st, 0.45, 'stand', 'stand');
  }
  function toDoor(s, st, run, wobble) {
    getUp(s, st, run);
    if (st.where !== 'door' || st.kid.x !== SPOT.doorIn.x) mv(s, st, run ? 0.6 : 0.85, 'stand', 'doorIn', { walk: !run, run: !!run, wobble: !!wobble });
    st.where = 'door';
  }
  function openDoor(s, st) {
    mv(s, st, 0.3, 'reach', 'doorIn');
    s.door.push({ t: s.t, a: 0 }); s.t += 0.55; s.door.push({ t: s.t, a: -1.38 }); s.kid.push(Object.assign({ t: s.t }, st.kid));
    st.door = 'open';
    mv(s, st, 0.25, 'stand');
  }
  function forceJammed(s, st) {
    // the kid pulls, the door won't move; the teacher comes and forces it open
    mv(s, st, 0.3, 'pull', 'doorIn');
    ev(s, 'jamOn');
    const t0 = s.t; hold(s, st, 2.6);
    const T = st.teacher, door = { x: -2.98, z: 2.86, f: -PI / 2 + 0.25 };
    s.teacher = [Object.assign({ t: t0 }, T), Object.assign({ t: t0 + 1.7, walk: true }, { pose: 'stand', x: door.x, z: door.z, f: door.f }), { t: t0 + 2.0, pose: 'pull', x: door.x, z: door.z, f: door.f }];
    ev(s, 'say', { who: 'teacher', text: 'It\'s stuck! Let me help.', dur: 1.8, t: t0 + 0.9 });
    ev(s, 'jamOff');
    s.door.push({ t: s.t, a: 0 }); s.t += 0.6; s.door.push({ t: s.t, a: -1.38 }); s.kid.push(Object.assign({ t: s.t }, st.kid));
    s.teacher.push({ t: s.t, pose: 'stand', x: door.x, z: door.z, f: door.f });
    st.teacher = { pose: 'stand', x: door.x, z: door.z, f: door.f }; st.teacherMoved = true;
    st.door = 'open';
    mv(s, st, 0.2, 'stand');
  }
  function exitTo(s, st, run, wobble) {
    // through the doorway and out onto the path
    cam(s, 'out', s.t + 0.25);
    mv(s, st, run ? 0.6 : 0.95, 'stand', 'out', { walk: !run, run: !!run, wobble: !!wobble });
    st.where = 'out';
    if (!st.shaking && !st.classOut) { ev(s, 'classOut'); st.classOut = true; }
  }

  const BUILD = {
    door(st) {
      const s = newSeg(st, 'door');
      if (!inside(st)) { cam(s, 'out'); s.grade = 'warn'; s.msg = 'You were already outside, so the door no longer mattered. If you sit next to it, open it at the very start.'; hold(s, st, 1.6); return done(s); }
      cam(s, 'door');
      if (st.shaking) {
        if (covered(st) || st.pose === 'holdOut') {
          s.grade = 'warn'; s.msg = 'You left your cover while it was still shaking to open the door. Open it first, then duck, cover and hold.';
          if (!st.pictureFell) { ev(s, 'picture', { t: 0.7 }); st.pictureFell = true; }
        } else { s.grade = 'ok'; s.msg = 'You opened the door right away, so the shaking can\'t jam it shut.'; }
        toDoor(s, st, false, false); openDoor(s, st);
      } else if (st.door === 'jammed') {
        s.grade = 'bad'; s.msg = MSG.jam; toDoor(s, st); forceJammed(s, st);
      } else { s.grade = 'ok'; s.msg = 'The door was already open.'; hold(s, st, 1.2); }
      return done(s);
    },
    duck(st) {
      const s = newSeg(st, 'duck');
      if (!inside(st)) {
        cam(s, 'out');
        if (st.shaking) { s.grade = 'warn'; s.msg = 'You were outside while it shook. Out in the open, stay low and away from buildings until it stops.'; }
        else { s.grade = 'warn'; s.msg = 'The shaking had already stopped, so ducking out here didn\'t help.'; }
        mv(s, st, 0.6, 'duck'); return done(s);
      }
      cam(s, st.where === 'door' ? 'door' : 'desk');
      if (covered(st)) { s.grade = 'ok'; s.msg = 'You were already down low, under your desk.'; hold(s, st, 1.0); return done(s); }
      if (st.shaking) s.msg = 'You dropped down low, so the shaking can\'t knock you over.';
      else { s.grade = 'warn'; s.msg = 'The shaking had already stopped. Duck the moment it starts.'; }
      mv(s, st, 0.65, 'duck', st.where === 'door' ? 'doorLow' : 'duckDesk');
      return done(s);
    },
    cover(st) {
      const s = newSeg(st, 'cover');
      if (!inside(st)) {
        cam(s, 'out'); s.grade = 'warn';
        s.msg = st.shaking ? 'There\'s no desk out here. Out in the open, stay low and away from buildings until it stops.' : 'The shaking had already stopped, and there\'s no desk out here.';
        mv(s, st, 0.6, 'duck'); return done(s);
      }
      cam(s, 'desk');
      if (covered(st)) { s.grade = 'ok'; s.msg = 'You were already under your desk.'; hold(s, st, 1.0); return done(s); }
      if (!st.shaking) { s.grade = 'warn'; s.msg = 'The shaking had already stopped, so hiding now doesn\'t help. Take cover while it shakes.'; }
      else if (st.pose === 'duck') s.msg = 'You crawled under your sturdy desk and covered your head and neck.';
      else { s.grade = 'warn'; s.msg = 'Drop down first, then crawl under, so you don\'t fall on the way.'; }
      if (st.pose !== 'duck') mv(s, st, 0.45, 'duck', st.where === 'door' ? 'doorLow' : 'duckDesk');
      mv(s, st, 0.95, 'cover', 'under', { crawl: true });
      st.where = 'desk';
      return done(s);
    },
    hold(st) {
      const s = newSeg(st, 'hold');
      if (!inside(st)) { cam(s, 'out'); s.grade = 'warn'; s.msg = st.shaking ? 'There\'s nothing to hold out here. Out in the open, stay low until it stops.' : 'The shaking had already stopped.'; hold(s, st, 1.2); return done(s); }
      cam(s, 'desk');
      if (st.pose === 'hold') { s.grade = 'ok'; s.msg = 'You were already holding on.'; hold(s, st, 1.0); return done(s); }
      if (st.pose === 'cover') {
        if (st.shaking) s.msg = 'You held on to a desk leg, so your desk stayed over you.';
        else { s.grade = 'warn'; s.msg = 'The shaking had already stopped. Hold on while it shakes.'; }
        mv(s, st, 0.6, 'hold'); return done(s);
      }
      s.grade = 'warn';
      s.msg = st.shaking ? 'You held the desk from outside it. Get under first, then hold on, or the desk can slide away from you.' : 'The shaking had already stopped, and you were not under your desk.';
      if (st.pose !== 'duck' || st.where === 'door') mv(s, st, 0.45, 'duck', 'duckDesk');
      mv(s, st, 0.5, 'holdOut', 'beside');
      if (st.shaking) ev(s, 'slide', { dx: 0.26, t: s.t + 0.1 });
      st.where = 'desk';
      return done(s);
    },
    wait(st) {
      const s = newSeg(st, 'wait');
      cam(s, inside(st) ? (st.where === 'door' ? 'door' : 'desk') : 'out');
      if (!inside(st)) { s.grade = 'warn'; s.msg = 'You were outside while it shook. Out in the open, stay low and away from buildings until it stops.'; if (st.pose !== 'duck') mv(s, st, 0.5, 'duck'); }
      else if (st.pose === 'hold') s.msg = 'You stayed under your desk, holding on, until the shaking stopped.';
      else if (st.pose === 'cover') { s.grade = 'warn'; s.msg = 'You stayed under, but you didn\'t hold on, so your desk slid away from you. Hold on to a leg.'; ev(s, 'slide', { dx: 0.32, t: 0.9 }); }
      else { s.grade = 'bad'; s.msg = 'You waited out in the open. Things can fall on you while it shakes. Duck, cover and hold first.'; if (!st.pictureFell) { ev(s, 'picture', { t: 0.8 }); st.pictureFell = true; } }
      hold(s, st, 1.9);
      s.fadeAt = s.t; hold(s, st, 1.0);
      st.shaking = false; s.stopAt = s.t;
      if (st.door === 'closed') { st.door = 'jammed'; s.jammed = true; }
      if (!inside(st) && !st.classOut) { ev(s, 'classOut', { t: s.t + 0.3 }); st.classOut = true; }
      if (inside(st) && st.pose !== 'stand') { /* stays put */ }
      return done(s, 0.6);
    },
    walk(st) {
      const s = newSeg(st, 'walk');
      if (!inside(st)) {
        cam(s, 'out');
        if (st.where === 'alone') { s.grade = 'warn'; s.msg = 'You were already out on your own. Walk out with your class, following your teacher.'; }
        else { s.grade = 'ok'; s.msg = 'You were already outside.'; }
        hold(s, st, 1.2); return done(s);
      }
      cam(s, 'door');
      if (st.shaking) {
        s.grade = 'bad'; s.msg = 'Walking while the ground shakes can make you fall or get hit by falling things. Wait until it stops.';
        if (!st.pictureFell) { ev(s, 'picture', { t: 0.6 }); st.pictureFell = true; }
        toDoor(s, st, false, true); if (st.door !== 'open') openDoor(s, st); exitTo(s, st, false, true);
      } else if (st.door === 'jammed') {
        s.grade = 'bad'; s.msg = MSG.jam; toDoor(s, st); forceJammed(s, st); exitTo(s, st);
      } else {
        s.msg = 'You walked out calmly with your class, following your teacher.';
        toDoor(s, st); exitTo(s, st);
      }
      return done(s);
    },
    field(st) {
      const s = newSeg(st, 'field');
      if (st.where === 'line') { cam(s, 'out'); s.msg = 'You were already in line.'; hold(s, st, 1.0); return done(s); }
      if (st.shaking) {
        s.grade = 'bad'; s.msg = 'Running outside while it still shakes is dangerous. Wait until the shaking stops, then walk out with your class.';
        if (inside(st)) { cam(s, 'door'); toDoor(s, st, true, true); if (st.door !== 'open') openDoor(s, st); exitTo(s, st, true, true); }
        else cam(s, 'out');
        mv(s, st, 1.0, 'stand', 'alone', { run: true, wobble: true }); st.where = 'alone';
        return done(s);
      }
      if (inside(st)) {
        cam(s, 'door');
        if (st.door === 'jammed') {
          s.grade = 'bad'; s.msg = MSG.jam; toDoor(s, st); forceJammed(s, st); exitTo(s, st);
          mv(s, st, 1.5, 'stand', 'line', { walk: true }); st.where = 'line';
          ev(s, 'count'); hold(s, st, 1.4); return done(s);
        }
        s.grade = 'warn'; s.msg = 'You rushed out to the field on your own. Walk out with your class, so your teacher knows where you are.';
        toDoor(s, st, true); exitTo(s, st, true);
        mv(s, st, 0.9, 'stand', 'alone', { run: true }); st.where = 'alone';
        ev(s, 'say', { who: 'fteacher', text: 'Come and stay with the class!', dur: 2.2 });
        hold(s, st, 1.0); return done(s);
      }
      cam(s, 'out');
      if (st.where === 'alone') { s.grade = 'warn'; s.msg = 'You went off on your own instead of lining up with your class.'; hold(s, st, 1.0); return done(s); }
      s.msg = 'At the open field, away from buildings, your teacher counted everyone. All safe!';
      mv(s, st, 1.5, 'stand', 'line', { walk: true }); st.where = 'line';
      ev(s, 'count'); hold(s, st, 1.6);
      return done(s);
    }
  };

  function simulate(ord) {
    const st = { shaking: true, door: 'closed', where: 'desk', pose: 'sit', kid: Object.assign({ pose: 'sit' }, SPOT.seat),
      teacher: { pose: 'stand', x: 1.6, z: -0.7, f: 0.4 }, classOut: false, pictureFell: false };
    Object.defineProperty(st, 'pose', { get() { return st.kid.pose; } });
    const segs = [];
    const pre = { step: null, t: 0, dur: 1.1, kid: [Object.assign({ t: 0 }, st.kid)], door: [], events: [], cams: [{ t: 0, v: 'wide' }], shaking0: true, pre: true };
    segs.push(pre);
    for (const id of ord) segs.push(BUILD[id](st));
    const end = { step: null, t: 0, dur: 1.4, kid: [Object.assign({ t: 0 }, st.kid)], door: [], events: [], cams: [], shaking0: st.shaking, end: true };
    segs.push(end);
    let T = 0, tStop = null, classOut = null, jammed = false;
    const doorKeys = [{ T: 0, a: 0 }], teacherKeys = [], evs = [], camKeys = [];
    for (const s of segs) {
      s.T0 = T;
      if (s.fadeAt !== undefined) { tStop = T + s.fadeAt + 1.0; if (s.jammed) jammed = true; }
      for (const d of s.door) doorKeys.push({ T: T + d.t, a: d.a });
      if (s.teacher) for (const k of s.teacher) teacherKeys.push(Object.assign({}, k, { T: T + k.t }));
      for (const e of s.events) { evs.push(Object.assign({}, e, { T: T + e.t })); if (e.e === 'classOut' && classOut === null) classOut = T + e.t; }
      for (const c of s.cams) camKeys.push({ T: T + c.t, v: c.v });
      T += s.dur;
    }
    const results = segs.filter((s) => s.step).map((s) => ({ id: s.step, grade: s.grade, msg: s.msg }));
    return { segs, total: T, tStop: tStop === null ? 1e9 : tStop, classOut: classOut === null ? 1e9 : classOut, jammed, doorKeys, teacherKeys, evs, camKeys, results };
  }

  /* ---------------- 3D scene ---------------- */
  const PAL = {
    lively: { bg: 0xcfe9f5, floor: 0xe6cfa6, floorLine: 0xd2b98d, wall: 0xfff0cc, wallOut: 0xf0d4a0, trim: 0xc98f55, board: 0x2f6b4f, boardFrame: 0xa86d3c,
      glass: 0xa8d8f0, winFrame: 0x8a5a2a, desk: 0xdba664, leg: 0x7d5532, chair: 0x3d8fd6, shelf: 0xa86d3c, book1: 0xe94b4b, book2: 0x3d8fd6, book3: 0xf2c12e,
      lamp: 0xf1d24a, cord: 0x555a5f, door: 0x2f8f86, frame: 0x7d5532, knob: 0xe8c040, path: 0xd9cdb5, grass: 0x8fd16a, grass2: 0x6fb653, pole: 0x9aa0a6, flag: 0xf2760c,
      exit: 0x1e9c5a, crack: 0x4a3a2c, pic: 0x7cc0e8, picFrame: 0x8a5a2a, clock: 0xffffff, skin: 0xe0a066, skin2: 0xc98a55, hair: 0x2b2220, uniform: 0xffffff,
      pants: 0x2f4f8f, skirt: 0x2f4f8f, cap: 0xffc53d, teacher: 0xd65a7a, shoe: 0x2b2b30, tree: 0x3f9b55, trunk: 0x7a5230, eye: 0x1e1a18 },
    minimal: { bg: 0xeef0f0, floor: 0xe4e1db, floorLine: 0xd8d4cc, wall: 0xf7f6f3, wallOut: 0xe8e6e1, trim: 0xc9c4ba, board: 0x56625d, boardFrame: 0xb7b0a4,
      glass: 0xd4e2e8, winFrame: 0x9d978d, desk: 0xd2c6b4, leg: 0x8e877c, chair: 0xb9b3a9, shelf: 0xbdb3a3, book1: 0xa5a19a, book2: 0x8f969c, book3: 0xc2bcb1,
      lamp: 0xdedad2, cord: 0x6b6b6b, door: 0xa8a39a, frame: 0x8e877c, knob: 0x6b6b6b, path: 0xdedad2, grass: 0xd3dacb, grass2: 0xc3cbb9, pole: 0x9a968e, flag: 0x1c2226,
      exit: 0x4f7a62, crack: 0x5c574f, pic: 0xc9d3d8, picFrame: 0x8e877c, clock: 0xffffff, skin: 0xd8b08c, skin2: 0xc7a07c, hair: 0x2f2b29, uniform: 0xffffff,
      pants: 0x4a5566, skirt: 0x4a5566, cap: 0xf2760c, teacher: 0x8796a4, shoe: 0x3a3a3a, tree: 0xaeb8a6, trunk: 0x8e877c, eye: 0x1e1a18 }
  };
  const G = { ready: false, flat: false };
  const MATS = {};
  function mat(role) { if (!MATS[role]) MATS[role] = new THREE.MeshLambertMaterial({ color: PAL[look][role] }); return MATS[role]; }
  function recolor() { for (const r in MATS) MATS[r].color.setHex(PAL[look][r]); G.scene.background.setHex(PAL[look].bg); if (G.boardMesh) { G.boardMesh.material.map.dispose(); G.boardMesh.material.map = boardTex(); G.boardMesh.material.needsUpdate = true; } }
  function boardTex() { return textTex('3 + 4 = 7', 512, 216, '#' + PAL[look].board.toString(16).padStart(6, '0'), 'rgba(255,255,255,.92)', 'bold 78px sans-serif'); }
  function box(w, h, d, role, x, y, z, par) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(role)); m.position.set(x, y, z); (par || G.scene).add(m); return m; }
  function cyl(rt, rb, h, role, x, y, z, par, seg) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 14), mat(role)); m.position.set(x, y, z); (par || G.scene).add(m); return m; }
  function sph(r, role, x, y, z, par) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat(role)); m.position.set(x, y, z); (par || G.scene).add(m); return m; }
  const SHADOW = () => new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16, depthWrite: false });
  function blob(r, par) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 24), SHADOW()); m.rotation.x = -PI / 2; m.position.y = 0.012; (par || G.scene).add(m); return m; }
  function textTex(text, w, h, bg, fg, font) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 2);
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  }

  function desk(x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); G.scene.add(g);
    box(1.0, 0.05, 0.6, 'desk', 0, 0.705, 0, g);
    box(0.9, 0.12, 0.5, 'desk', 0, 0.6, -0.02, g);
    for (const [lx, lz] of [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]]) box(0.05, 0.68, 0.05, 'leg', lx, 0.34, lz, g);
    blob(0.55, g).scale.set(1.0, 0.65, 1);
    return g;
  }
  function chair(x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); G.scene.add(g);
    box(0.4, 0.04, 0.38, 'chair', 0, 0.39, 0, g);
    for (const [lx, lz] of [[-0.17, -0.16], [0.17, -0.16], [-0.17, 0.16], [0.17, 0.16]]) box(0.035, 0.38, 0.035, 'leg', lx, 0.19, lz, g);
    box(0.4, 0.34, 0.035, 'chair', 0, 0.62, 0.18, g);
    for (const lx of [-0.17, 0.17]) box(0.035, 0.36, 0.035, 'leg', lx, 0.58, 0.18, g);
    return g;
  }

  /* a simple poseable figure: hips, torso, neck, two arms (shoulder, elbow), two legs (hip, knee) */
  function figure(o) {
    const s = o.s || 1, root = new THREE.Group(), hips = new THREE.Group(); root.add(hips);
    cyl(0.135 * s, 0.13 * s, 0.13 * s, o.bottom, 0, -0.02 * s, 0, hips);
    if (o.skirt) cyl(0.14 * s, 0.22 * s, (o.long ? 0.5 : 0.24) * s, o.skirt, 0, -(o.long ? 0.24 : 0.11) * s, 0, hips);
    const torso = new THREE.Group(); hips.add(torso);
    cyl(0.152 * s, 0.137 * s, 0.4 * s, o.top, 0, 0.2 * s, 0, torso);
    const shc = sph(0.152 * s, o.top, 0, 0.39 * s, 0, torso); shc.scale.set(1, 0.42, 0.85);
    const neck = new THREE.Group(); neck.position.y = 0.42 * s; torso.add(neck);
    cyl(0.05 * s, 0.055 * s, 0.08 * s, o.skin, 0, 0.03 * s, 0, neck);
    sph(0.155 * s, o.skin, 0, 0.17 * s, 0, neck);
    const hair = sph(0.163 * s, o.hair, 0, 0.205 * s, -0.03 * s, neck); hair.scale.set(1, o.longHair ? 1.0 : 0.82, 1);
    if (o.longHair) { const h2 = sph(0.15 * s, o.hair, 0, 0.1 * s, -0.07 * s, neck); h2.scale.set(1.02, 1.25, 0.8); }
    for (const sd of [1, -1]) sph(0.019 * s, 'eye', 0.055 * s * sd, 0.18 * s, 0.142 * s, neck);
    if (o.cap) { const dome = new THREE.Mesh(new THREE.SphereGeometry(0.172 * s, 18, 10, 0, PI * 2, 0, PI * 0.5), mat(o.cap)); dome.position.set(0, 0.205 * s, -0.005 * s); neck.add(dome); const brim = box(0.22 * s, 0.022 * s, 0.14 * s, o.cap, 0, 0.215 * s, 0.17 * s, neck); brim.rotation.x = 0.12; }
    const arms = [], legs = [];
    for (const sd of [1, -1]) {
      const sh = new THREE.Group(); sh.position.set(0.19 * s * sd, 0.37 * s, 0); torso.add(sh);
      cyl(0.058 * s, 0.054 * s, 0.11 * s, o.top, 0, -0.04 * s, 0, sh);
      cyl(0.044 * s, 0.04 * s, 0.22 * s, o.skin, 0, -0.12 * s, 0, sh);
      const el = new THREE.Group(); el.position.y = -0.225 * s; sh.add(el);
      cyl(0.039 * s, 0.035 * s, 0.2 * s, o.skin, 0, -0.1 * s, 0, el);
      sph(0.046 * s, o.skin, 0, -0.215 * s, 0, el);
      arms.push({ sh, el });
      const hp = new THREE.Group(); hp.position.set(0.074 * s * sd, -0.04 * s, 0); hips.add(hp);
      cyl(0.064 * s, 0.058 * s, 0.17 * s, o.bottom, 0, -0.07 * s, 0, hp);
      cyl(0.052 * s, 0.046 * s, 0.3 * s, o.legs || o.skin, 0, -0.17 * s, 0, hp);
      const kn = new THREE.Group(); kn.position.y = -0.3 * s; hp.add(kn);
      cyl(0.047 * s, 0.042 * s, 0.28 * s, o.legs || o.skin, 0, -0.14 * s, 0, kn);
      box(0.09 * s, 0.06 * s, 0.17 * s, 'shoe', 0, -0.285 * s, 0.035 * s, kn);
      legs.push({ hp, kn });
    }
    const shadow = blob(0.3 * s); G.scene.add(root);
    return { root, hips, torso, neck, arms, legs, s, shadow, pose: null };
  }
  const POSE = {
    stand: { hy: 0.62, tp: 0.02, nk: 0, sh: [[0.06, 0.1], [0.06, -0.1]], el: [-0.15, -0.15], hp: [0, 0], kn: [0, 0] },
    sit: { hy: 0.43, tp: 0.08, nk: 0.18, sh: [[-0.8, 0.12], [-0.8, -0.12]], el: [-0.95, -0.95], hp: [-1.45, -1.45], kn: [1.45, 1.45] },
    duck: { hy: 0.27, tp: 1.0, nk: 0.45, sh: [[-2.75, 0.35], [-2.75, -0.35]], el: [-1.75, -1.75], hp: [-0.95, -0.95], kn: [2.45, 2.45] },
    cover: { hy: 0.26, tp: 1.3, nk: 0.35, sh: [[-2.95, 0.42], [-2.95, -0.42]], el: [-1.95, -1.95], hp: [-1.1, -1.1], kn: [2.5, 2.5] },
    hold: { hy: 0.26, tp: 1.3, nk: 0.35, sh: [[-1.5, 0.28], [-2.95, -0.42]], el: [-0.15, -1.95], hp: [-1.1, -1.1], kn: [2.5, 2.5] },
    holdOut: { hy: 0.27, tp: 0.85, nk: 0.25, sh: [[-1.35, 0.22], [-2.75, -0.35]], el: [-0.25, -1.75], hp: [-0.95, -0.95], kn: [2.45, 2.45] },
    reach: { hy: 0.62, tp: 0.12, nk: 0.05, sh: [[-1.35, 0.06], [0.08, -0.1]], el: [-0.2, -0.15], hp: [0.12, -0.12], kn: [0.05, 0.05] },
    pull: { hy: 0.6, tp: -0.2, nk: 0.05, sh: [[-1.3, 0.12], [-1.3, -0.12]], el: [-0.35, -0.35], hp: [-0.28, 0.28], kn: [0.28, 0.08] },
    count: { hy: 0.62, tp: 0, nk: -0.05, sh: [[-2.4, 0.25], [0.06, -0.1]], el: [-0.2, -0.15], hp: [0, 0], kn: [0, 0] }
  };
  function blendPose(a, b, k) {
    const r = { hy: lerp(a.hy, b.hy, k), tp: lerp(a.tp, b.tp, k), nk: lerp(a.nk, b.nk, k), sh: [], el: [], hp: [], kn: [] };
    for (let i = 0; i < 2; i++) {
      r.sh.push([lerp(a.sh[i][0], b.sh[i][0], k), lerp(a.sh[i][1], b.sh[i][1], k)]);
      r.el.push(lerp(a.el[i], b.el[i], k)); r.hp.push(lerp(a.hp[i], b.hp[i], k)); r.kn.push(lerp(a.kn[i], b.kn[i], k));
    }
    return r;
  }
  function applyPose(F, p, gait, gaitK, T) {
    const s = F.s;
    let hy = p.hy, tp = p.tp;
    const sh = p.sh.map((v) => v.slice()), el = p.el.slice(), hp = p.hp.slice(), kn = p.kn.slice();
    if (gait && gaitK > 0) {
      const run = gait === 'run', sp = run ? 13 : 8.5, ph = T * sp, A = (run ? 0.75 : 0.48) * gaitK;
      if (gait === 'crawl') { hy += 0.025 * Math.abs(Math.sin(ph)) * gaitK; sh[0][0] += 0.25 * Math.sin(ph) * gaitK; sh[1][0] -= 0.25 * Math.sin(ph) * gaitK; }
      else {
        hp[0] += A * Math.sin(ph); hp[1] -= A * Math.sin(ph);
        kn[0] += (run ? 0.9 : 0.55) * gaitK * Math.max(0, Math.sin(ph + 1.3)); kn[1] += (run ? 0.9 : 0.55) * gaitK * Math.max(0, Math.sin(ph + 1.3 + PI));
        sh[0][0] -= A * 0.9 * Math.sin(ph); sh[1][0] += A * 0.9 * Math.sin(ph);
        if (run) { el[0] -= 0.9 * gaitK; el[1] -= 0.9 * gaitK; tp += 0.22 * gaitK; }
        hy -= 0.018 * Math.abs(Math.sin(ph)) * gaitK;
      }
    }
    F.hips.position.y = hy * s; F.torso.rotation.x = tp; F.neck.rotation.x = p.nk;
    for (let i = 0; i < 2; i++) {
      F.arms[i].sh.rotation.set(sh[i][0], 0, sh[i][1]); F.arms[i].el.rotation.x = el[i];
      F.legs[i].hp.rotation.x = hp[i]; F.legs[i].kn.rotation.x = kn[i];
    }
  }
  function place(F, x, z, f, roll) {
    F.root.position.set(x, 0, z); F.root.rotation.set(0, f, roll || 0);
    F.shadow.position.set(x, 0.012, z);
  }
  const angLerp = (a, b, k) => { let d = b - a; while (d > PI) d -= 2 * PI; while (d < -PI) d += 2 * PI; return a + d * k; };
  function evalTrack(keys, tau) {
    // returns {pose, x, z, f, gait, gk}
    if (!keys.length) return null;
    if (tau <= keys[0].t) return { p: POSE[keys[0].pose], x: keys[0].x, z: keys[0].z, f: keys[0].f, gait: null, gk: 0 };
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (tau < b.t) {
        const u = (tau - a.t) / Math.max(1e-6, b.t - a.t), k = sstep(u), moving = (a.x !== b.x || a.z !== b.z);
        const gait = b.run ? 'run' : b.walk ? 'walk' : b.crawl ? 'crawl' : null;
        const lin = gait ? u : k;
        return { p: blendPose(POSE[a.pose], POSE[b.pose], k), x: lerp(a.x, b.x, lin), z: lerp(a.z, b.z, lin), f: angLerp(a.f, b.f, Math.min(1, k * 1.6)),
          gait: moving ? gait : null, gk: moving ? Math.sin(PI * clamp(u, 0, 1)) * 0.6 + 0.4 : 0, wobble: b.wobble };
      }
    }
    const l = keys[keys.length - 1];
    return { p: POSE[l.pose], x: l.x, z: l.z, f: l.f, gait: null, gk: 0 };
  }

  // Builds the classroom. Returns false when this device has no WebGL, and the game plays with drawings instead.
  function buildScene(canvas) {
    let r = null;
    try { if (window.THREE) r = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch (e) { r = null; }
    if (!r) return false;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    G.renderer = r;
    const sc = new THREE.Scene(); G.scene = sc; sc.background = new THREE.Color(PAL[look].bg);
    G.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 80);
    sc.add(new THREE.HemisphereLight(0xffffff, 0x8f8676, 0.92));
    const dl = new THREE.DirectionalLight(0xffffff, 0.58); dl.position.set(4, 9, 6); sc.add(dl);
    const fl = new THREE.DirectionalLight(0xffffff, 0.2); fl.position.set(-7, 4, 3); sc.add(fl);

    // outside: grass, the path to the field, a flag, trees
    box(34, 0.06, 26, 'grass', -3, -0.08, 1, sc);
    box(4.6, 0.03, 1.15, 'path', -5.9, -0.035, 2.2, sc);
    box(1.4, 0.03, 4.6, 'path', -8.3, -0.035, 0.75, sc).material = mat('grass2');
    cyl(0.045, 0.06, 4.4, 'pole', -9.9, 2.2, -1.8, sc);
    const flag = box(0.85, 0.5, 0.03, 'flag', -9.45, 4.05, -1.8, sc); G.flag = flag;
    for (const [x, z, s2] of [[-11.5, 3.6, 1.1], [-12.2, -0.5, 1.3], [-11.0, 6.4, 0.9], [-10.8, -3.6, 1.0]]) {
      cyl(0.1 * s2, 0.14 * s2, 1.3 * s2, 'trunk', x, 0.65 * s2, z, sc); sph(0.75 * s2, 'tree', x, 1.75 * s2, z, sc); sph(0.55 * s2, 'tree', x + 0.4 * s2, 1.5 * s2, z + 0.2, sc);
    }

    // the classroom: floor, back wall, left wall with the doorway
    box(7.2, 0.1, 6.1, 'floor', 0, -0.05, -0.02, sc);
    for (let i = -3; i <= 3; i++) box(0.02, 0.005, 6.1, 'floorLine', i, 0.001, -0.02, sc);
    box(7.2, 3, 0.12, 'wall', 0, 1.5, -3.06, sc);
    box(7.2, 0.12, 0.04, 'trim', 0, 0.06, -2.99, sc);
    const LW = -3.56;
    box(0.12, 3, 4.75, 'wall', LW, 1.5, -0.625, sc); box(0.12, 0.9, 0.9, 'wall', LW, 2.55, 2.2, sc); box(0.12, 3, 0.35, 'wall', LW, 1.5, 2.825, sc);
    box(0.03, 3, 4.75, 'wallOut', LW - 0.075, 1.5, -0.625, sc); box(0.03, 0.9, 0.9, 'wallOut', LW - 0.075, 2.55, 2.2, sc); box(0.03, 3, 0.35, 'wallOut', LW - 0.075, 1.5, 2.825, sc);
    box(0.04, 0.12, 4.75, 'trim', LW + 0.07, 0.06, -0.625, sc);
    // blackboard with today's sum, a clock, a window
    box(2.7, 1.25, 0.05, 'boardFrame', 0.4, 1.6, -2.98, sc);
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.05), new THREE.MeshBasicMaterial({ map: boardTex() }));
    bd.position.set(0.4, 1.6, -2.95); sc.add(bd); G.boardMesh = bd;
    const clk = cyl(0.22, 0.22, 0.04, 'clock', -1.7, 2.35, -2.97, sc); clk.rotation.x = PI / 2;
    box(0.02, 0.15, 0.01, 'cord', -1.7, 2.41, -2.94, sc); box(0.11, 0.02, 0.01, 'cord', -1.66, 2.35, -2.94, sc);
    box(1.25, 1.15, 0.06, 'winFrame', 2.6, 1.75, -2.98, sc);
    G.glass = box(1.05, 0.95, 0.04, 'glass', 2.6, 1.75, -2.95, sc);
    box(0.04, 0.95, 0.05, 'winFrame', 2.6, 1.75, -2.93, sc);
    // the bookshelf in the corner, books on top
    box(0.62, 1.7, 0.36, 'shelf', -3.15, 0.85, -2.6, sc);
    for (const y of [0.45, 0.9, 1.3]) box(0.56, 0.03, 0.32, 'floorLine', -3.15, y, -2.58, sc);
    G.books = [['book1', -3.33], ['book2', -3.16], ['book3', -2.99]].map(([c, x]) => { const b = box(0.12, 0.28, 0.22, c, x, 1.85, -2.6, sc); b.userData.home = b.position.clone(); return b; });
    // a framed picture near the door (it can fall)
    const pic = new THREE.Group(); pic.position.set(LW + 0.09, 1.85, 1.0); sc.add(pic);
    box(0.04, 0.48, 0.6, 'picFrame', 0, 0, 0, pic); box(0.045, 0.38, 0.5, 'pic', 0.004, 0, 0, pic); box(0.05, 0.12, 0.5, 'grass', 0.006, -0.13, 0, pic);
    G.pic = pic; pic.userData.home = pic.position.clone();
    // the hanging lamp
    const lamp = new THREE.Group(); lamp.position.set(-1.45, 3.3, 0.3); sc.add(lamp);
    cyl(0.012, 0.012, 0.9, 'cord', 0, -0.45, 0, lamp, 6);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.24, 16, 1, true), mat('lamp')); shade.material.side = THREE.DoubleSide; shade.position.y = -0.98; lamp.add(shade);
    sph(0.07, 'clock', 0, -1.05, 0, lamp);
    G.lamp = lamp;
    // the door: a frame that can warp, a leaf on a hinge that opens outward
    const df = new THREE.Group(); df.matrixAutoUpdate = false; df.userData.pos = new THREE.Vector3(LW, 0, 2.2); sc.add(df);
    box(0.17, 2.14, 0.07, 'frame', 0, 1.07, -0.475, df); box(0.17, 2.14, 0.07, 'frame', 0, 1.07, 0.475, df); box(0.17, 0.08, 1.02, 'frame', 0, 2.14, 0, df);
    const hinge = new THREE.Group(); hinge.position.set(0, 0, -0.44); df.add(hinge);
    box(0.05, 2.05, 0.86, 'door', 0, 1.03, 0.43, hinge);
    sph(0.035, 'knob', 0.05, 1.0, 0.78, hinge); sph(0.035, 'knob', -0.05, 1.0, 0.78, hinge);
    G.doorFrame = df; G.hinge = hinge; setWarp(0);
    const ex = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.22), new THREE.MeshBasicMaterial({ map: textTex('EXIT', 256, 90, '#1e9c5a', '#ffffff', 'bold 62px sans-serif') }));
    ex.position.set(LW + 0.07, 2.42, 2.2); ex.rotation.y = PI / 2; sc.add(ex);
    // a crack that shows when the shaking bends the frame
    const crack = new THREE.Group(); crack.position.set(LW + 0.065, 2.2, 2.45); sc.add(crack);
    let cx = 0, cy = 0; for (const [dx, dy] of [[0.12, 0.16], [-0.05, 0.13], [0.1, 0.17], [-0.06, 0.12]]) { const L = Math.hypot(dx, dy); const seg = box(0.01, L, 0.022, 'crack', 0, cy + dy / 2, cx + dx / 2, crack); seg.rotation.x = -Math.atan2(dx, dy); cx += dx; cy += dy; }
    crack.visible = false; G.crack = crack;
    // desks and chairs (ours is the one next to the door)
    G.myDesk = desk(-2.3, 1.25); G.myDesk.userData.home = G.myDesk.position.clone(); chair(-2.3, 1.86);
    const others = [[-0.6, 1.25], [-2.3, -0.65], [-0.6, -0.65]];
    G.otherDesks = others.map(([x, z]) => { const d = desk(x, z); d.userData.home = d.position.clone(); chair(x, z + 0.61); return d; });
    const tt = new THREE.Group(); tt.position.set(1.85, 0, -1.55); sc.add(tt);
    box(1.3, 0.06, 0.7, 'desk', 0, 0.76, 0, tt); for (const [lx, lz] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) box(0.06, 0.74, 0.06, 'leg', lx, 0.37, lz, tt);
    blob(0.75, tt).scale.set(1, 0.6, 1); G.tdesk = tt;

    // people: you, three classmates, the teacher; the class again at the field
    G.kid = figure({ top: 'uniform', bottom: 'pants', skin: 'skin', hair: 'hair', cap: 'cap', s: 1 });
    const mates = [
      { top: 'uniform', bottom: 'skirt', skirt: 'skirt', skin: 'skin2', hair: 'hair', longHair: true },
      { top: 'uniform', bottom: 'pants', skin: 'skin', hair: 'hair' },
      { top: 'uniform', bottom: 'skirt', skirt: 'skirt', skin: 'skin', hair: 'hair', longHair: true }
    ];
    G.mates = mates.map((o, i) => { const F = figure(Object.assign({ s: 0.98 - i * 0.02 }, o)); F.desk = others[i]; return F; });
    G.teacher = figure({ top: 'teacher', bottom: 'teacher', skirt: 'teacher', long: true, skin: 'skin2', hair: 'hair', longHair: true, s: 1.32, legs: 'skin2' });
    G.fclass = [];
    const fz = [-0.25, 0.3, 0.85, 1.4, 1.95];
    fz.forEach((z, i) => { const o = mates[i % 3]; const F = figure(Object.assign({ s: 0.97 + (i % 2) * 0.03 }, o)); F.spot = { x: -8.3, z, f: PI }; G.fclass.push(F); });
    G.fteacher = figure({ top: 'teacher', bottom: 'teacher', skirt: 'teacher', long: true, skin: 'skin2', hair: 'hair', longHair: true, s: 1.32, legs: 'skin2' });
    G.ready = true;
    return true;
  }
  function setWarp(k) {
    const p = G.doorFrame.userData.pos;
    G.doorFrame.matrix.set(1, 0, 0, p.x, 0, 1, 0, p.y, 0, k, 1, p.z, 0, 0, 0, 1);
    G.doorFrame.matrixWorldNeedsUpdate = true;
  }
  const CAMS = {
    wide: { p: [1.9, 3.9, 7.2], t: [-1.6, 0.5, 0.75] },
    desk: { p: [1.15, 3.25, 5.05], t: [-2.45, 0.32, 1.4] },
    door: { p: [1.55, 3.55, 5.95], t: [-2.75, 0.7, 1.95] },
    out: { p: [-4.3, 2.75, 7.7], t: [-7.25, 0.55, 1.7] },
    intro: { p: [1.6, 3.5, 6.9], t: [-1.65, 0.55, 0.85] }
  };
  function camView(v) { const c = CAMS[v] || CAMS.wide; return { p: new THREE.Vector3(...c.p), t: new THREE.Vector3(...c.t) }; }

  /* ---------------- playback ---------------- */
  let SIM = null, T = 0, playing = false, mode = 'intro', demo = false, last = 0;
  const OL = { you: null, tags: {} };
  function mountCanvas(host, m) {
    mode = m;
    if (!G.canvas && !G.flat) {
      const c = document.createElement('canvas'); c.className = 'stage';
      if (buildScene(c)) G.canvas = c; else G.flat = true;
    }
    if (G.flat) { mountFlat(host, m); return; }
    let wrap = host.querySelector('.stagewrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'stagewrap'; host.insertBefore(wrap, host.firstChild); }
    wrap.appendChild(G.canvas);
    const ol = $('olay'); if (ol.parentNode !== host) host.insertBefore(ol, wrap.nextSibling);
    G.host = host;
    resize();
  }
  // No 3D: a drawing of the step being acted out, and what the teacher says, in place of the classroom.
  function mountFlat(host, m) {
    G.host = host;
    let fp = host.querySelector('.flatpic');
    if (!fp) { fp = document.createElement('div'); fp.className = 'flatpic'; host.insertBefore(fp, host.firstChild); }
    fp.innerHTML = m === 'intro'
      ? '<div class="ico">' + ICON.door + '</div><div class="note">This device can\'t show the 3D classroom, so you will see drawings instead.</div>'
      : '<div class="ico" id="fico"></div><div class="say" id="fsay" hidden></div>';
  }
  function resize() {
    if (!G.canvas || !G.host || !G.renderer) return;
    const w = G.host.clientWidth || 300, h = G.host.clientHeight || 300;
    G.renderer.setSize(w, h, false); G.camera.aspect = w / h;
    // keep the scene framed on tall, narrow screens
    G.camera.fov = w / h < 0.75 ? 56 : w / h < 1 ? 50 : 44;
    G.camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  function tag(key, text, cls) {
    let el = OL.tags[key];
    if (!el) { el = document.createElement('div'); el.className = 'tag ' + (cls || ''); $('olay').appendChild(el); OL.tags[key] = el; }
    if (el.textContent !== text) el.textContent = text;
    return el;
  }
  function placeTag(el, pos) {
    const v = pos.clone().project(G.camera), host = G.host;
    if (v.z > 1 || !host) { el.style.display = 'none'; return; }
    el.style.display = 'block'; el.style.left = ((v.x + 1) / 2 * host.clientWidth) + 'px'; el.style.top = ((1 - v.y) / 2 * host.clientHeight) + 'px';
  }
  function clearTags() { for (const k in OL.tags) OL.tags[k].remove(); OL.tags = {}; }

  function resetWorld() {
    G.hinge.rotation.y = 0; setWarp(0); G.crack.visible = false;
    G.pic.position.copy(G.pic.userData.home); G.pic.rotation.set(0, 0, 0);
    G.books.forEach((b) => { b.position.copy(b.userData.home); b.rotation.set(0, 0, 0); });
    G.myDesk.position.copy(G.myDesk.userData.home);
  }
  function startSim(ord, isDemo) {
    SIM = simulate(ord); demo = !!isDemo; T = 0; playing = true; capKey = ''; clearTags();
    if (G.ready) resetWorld();
    const strip = $('strip');
    strip.innerHTML = ord.map((id, i) => '<div class="s" data-k="' + i + '"><div class="n">' + (i + 1) + '</div>' + STEPS[id].short + '</div>').join('');
    show('sim');
    $('skip').textContent = 'Skip to results';
  }
  function evalKeys(keys, T, key) {
    if (!keys.length) return 0;
    if (T <= keys[0].T) return keys[0][key];
    for (let i = 0; i < keys.length - 1; i++) if (T < keys[i + 1].T) { const a = keys[i], b = keys[i + 1]; return lerp(a[key], b[key], sstep((T - a.T) / Math.max(1e-6, b.T - a.T))); }
    return keys[keys.length - 1][key];
  }
  function shakeAt(T) {
    if (!SIM) return 0;
    const seg = segAt(T); if (!seg) return 0;
    const tau = T - seg.T0;
    if (seg.pre) return sstep(tau / 0.7);
    if (seg.fadeAt !== undefined) return tau < seg.fadeAt ? 1 : 1 - sstep((tau - seg.fadeAt) / 1.0);
    return seg.shaking0 ? 1 : 0;
  }
  function segAt(T) { if (!SIM) return null; let s = SIM.segs[0]; for (const x of SIM.segs) if (T >= x.T0) s = x; return s; }
  function hits(e, T) { return SIM.evs.filter((x) => x.e === e && T >= x.T); }

  function applyIdle(T) {
    // the intro: the classroom on a calm day, the kids in their seats
    const k = G.kid; applyPose(k, POSE.sit, null, 0, T); place(k, SPOT.seat.x, SPOT.seat.z, SPOT.seat.f);
    G.mates.forEach((F) => { applyPose(F, POSE.sit, null, 0, T); place(F, F.desk[0], F.desk[1] + 0.61, PI); F.root.visible = true; F.shadow.visible = true; });
    applyPose(G.teacher, POSE.stand, null, 0, T); place(G.teacher, 1.0, -2.15, 0.15); G.teacher.root.visible = true;
    G.fclass.forEach((F) => { F.root.visible = false; F.shadow.visible = false; }); G.fteacher.root.visible = false; G.fteacher.shadow.visible = false;
    const c = camView('intro'); const a = Math.sin(T * 0.25) * 0.5;
    G.camera.position.set(c.p.x + a, c.p.y, c.p.z - a * 0.3); G.camera.lookAt(c.t);
    G.lamp.rotation.set(0, 0, 0);
    placeTag(tag('you', 'You'), new THREE.Vector3(SPOT.seat.x, 1.55, SPOT.seat.z));
    for (const k of ['stuck', 'tsay', 'fsay', 'count']) if (OL.tags[k]) OL.tags[k].style.display = 'none';
  }

  const countLine = (dt) => { const n = Math.min(16, 10 + Math.floor(dt * 6)); return n < 16 ? n + '…' : '…15, 16! Everyone is here.'; };
  const jammedAt = (T) => hits('jamOn', T).length > hits('jamOff', T).length;

  // The 3D classroom at time T of the simulation.
  function apply3D(T) {
    const amp = shakeAt(T), seg = segAt(T), tau = T - seg.T0;
    const tStop = SIM.tStop, out = SIM.classOut;
    // the shaking: the lamp, the books, the window, the frame
    G.lamp.rotation.z = 0.32 * amp * Math.sin(T * 5.3); G.lamp.rotation.x = 0.18 * amp * Math.sin(T * 4.1 + 1);
    G.glass.position.x = 2.6 + 0.008 * amp * Math.sin(T * 41);
    G.otherDesks.forEach((d, i) => { d.position.x = d.userData.home.x + 0.02 * amp * Math.sin(T * 23 + i); d.position.z = d.userData.home.z + 0.015 * amp * Math.sin(T * 19 + i * 2); });
    G.boardMesh.position.x = 0.4 + 0.006 * amp * Math.sin(T * 31);
    const wk = Math.min(1, sstep((T - 0.5) / Math.max(1, (Math.min(tStop, 60) - 0.5))));
    setWarp(0.09 * wk);
    G.crack.visible = wk > 0.55;
    // books fall early in the shaking
    const bt = T - 2.0;
    G.books.forEach((b, i) => {
      const t = bt - i * 0.18, h = b.userData.home;
      if (t <= 0) { b.position.copy(h); b.position.x += 0.01 * amp * Math.sin(T * 30 + i); b.rotation.set(0, 0, 0); return; }
      const k = Math.min(1, t / 0.55);
      b.position.set(h.x + 0.1 * k * (i - 1), lerp(h.y, 0.06, k * k), h.z + 0.55 * k + 0.1 * i * k); b.rotation.set(1.4 * k, 0.3 * i, 1.57 * k * (i % 2 ? 1 : -1));
    });
    // the picture by the door falls when someone is out in the open near it
    const pe = hits('picture', T)[0];
    if (pe) { const k = Math.min(1, (T - pe.T) / 0.6), h = G.pic.userData.home; G.pic.position.set(h.x + 0.35 * k, lerp(h.y, 0.05, k * k), h.z + 0.15 * k); G.pic.rotation.set(0, 0, -1.45 * k); }
    else { G.pic.position.copy(G.pic.userData.home); G.pic.rotation.set(0, 0, 0.03 * amp * Math.sin(T * 17)); }
    // our desk slides if no one holds it
    let slide = 0; for (const e of hits('slide', T)) slide = Math.max(slide, e.dx * sstep((T - e.T) / 0.7));
    const mh = G.myDesk.userData.home; G.myDesk.position.set(mh.x + slide + 0.02 * amp * Math.sin(T * 21), 0, mh.z + 0.015 * amp * Math.sin(T * 17));

    // the door: opened by keys, rattling when stuck
    let da = evalKeys(SIM.doorKeys, T, 'a');
    const jamOn = jammedAt(T);
    if (jamOn) da += 0.025 * Math.sin(T * 38);
    G.hinge.rotation.y = da;

    // you
    const r = evalTrack(seg.kid, tau);
    applyPose(G.kid, r.p, r.gait, r.gk, T);
    const upright = r.p.hy > 0.5, roll = (amp > 0.05 && upright) ? 0.07 * amp * Math.sin(T * 8.5) + (r.wobble ? 0.06 * Math.sin(T * 5) : 0) : 0;
    place(G.kid, r.x, r.z, r.f, roll);

    // classmates and the teacher in the room: duck, cover and hold while it shakes, then stand and wait
    const shakeOn = T > 0.75 && T < tStop;
    G.mates.forEach((F, i) => {
      const vis = T < out; F.root.visible = vis; F.shadow.visible = vis; if (!vis) return;
      const [dx, dz] = F.desk;
      const seat = { x: dx, z: dz + 0.61, f: PI }, under = { x: dx - 0.16, z: dz, f: PI / 2 }, up = { x: dx - 0.72, z: dz + 0.32, f: -PI / 2 };
      const tIn = 0.85 + i * 0.12;
      let p, x, z, f;
      if (T < tIn) { p = POSE.sit; x = seat.x; z = seat.z; f = seat.f; }
      else if (T < tStop + 0.3) { const k = sstep((T - tIn) / 0.7); p = blendPose(POSE.sit, POSE.hold, k); x = lerp(seat.x, under.x, k); z = lerp(seat.z, under.z, k); f = angLerp(seat.f, under.f, k); }
      else { const k = sstep((T - tStop - 0.3) / 0.8); p = blendPose(POSE.hold, POSE.stand, k); x = lerp(under.x, up.x, k); z = lerp(under.z, up.z, k); f = angLerp(under.f, up.f, k); }
      applyPose(F, p, null, 0, T); place(F, x, z, f, (shakeOn && p.hy > 0.5) ? 0.05 * Math.sin(T * 8 + i) : 0);
    });
    {
      const F = G.teacher, vis = T < out; F.root.visible = vis; F.shadow.visible = vis;
      if (vis) {
        const tk = SIM.teacherKeys;
        if (tk.length && T >= tk[0].T) {
          let i = 0; while (i < tk.length - 1 && T >= tk[i + 1].T) i++;
          const a = tk[i], b = tk[Math.min(i + 1, tk.length - 1)], u = b === a ? 1 : clamp((T - a.T) / Math.max(1e-6, b.T - a.T), 0, 1);
          applyPose(F, blendPose(POSE[a.pose], POSE[b.pose], sstep(u)), b.walk && u < 1 ? 'walk' : null, b.walk && u < 1 ? 1 : 0, T);
          place(F, lerp(a.x, b.x, u), lerp(a.z, b.z, u), angLerp(a.f, b.f, Math.min(1, u * 2)));
        } else {
          const st = { x: 1.0, z: -2.15, f: 0.15 }, un = { x: 1.95, z: -1.32, f: PI }, up = { x: 1.6, z: -0.7, f: 0.4 };
          let p, x, z, f;
          if (T < 0.95) { p = POSE.stand; x = st.x; z = st.z; f = st.f; }
          else if (T < tStop + 0.3) { const k = sstep((T - 0.95) / 0.9); p = blendPose(POSE.stand, POSE.cover, k); x = lerp(st.x, un.x, k); z = lerp(st.z, un.z, k); f = angLerp(st.f, un.f, k); }
          else { const k = sstep((T - tStop - 0.3) / 0.8); p = blendPose(POSE.cover, POSE.stand, k); x = lerp(un.x, up.x, k); z = lerp(un.z, up.z, k); f = angLerp(un.f, up.f, k); }
          applyPose(F, p, null, 0, T); place(F, x, z, f);
        }
      }
    }
    // the class at the field, after they walk out
    const fk = sstep((T - out) / 0.6), countE = hits('count', T)[0];
    G.fclass.forEach((F, i) => {
      const vis = T >= out; F.root.visible = vis; F.shadow.visible = vis; if (!vis) return;
      applyPose(F, POSE.stand, null, 0, T); place(F, F.spot.x, F.spot.z + (1 - fk) * 1.2, F.spot.f, 0.02 * Math.sin(T * 1.3 + i));
    });
    {
      const F = G.fteacher, vis = T >= out; F.root.visible = vis; F.shadow.visible = vis;
      if (vis) { const ck = countE ? sstep((T - countE.T) / 0.4) : 0; applyPose(F, blendPose(POSE.stand, POSE.count, ck), null, 0, T); place(F, -8.3, -1.05 + (1 - fk) * 0.8, 0); }
    }

    // the camera: ease between framings, shake while the ground shakes
    let ci = -1; for (let i = 0; i < SIM.camKeys.length; i++) if (T >= SIM.camKeys[i].T) ci = i;
    const cur = ci >= 0 ? SIM.camKeys[ci] : { T: 0, v: 'wide' }, prev = ci > 0 ? SIM.camKeys[ci - 1] : { T: 0, v: 'wide' };
    const A = camView(prev.v), B = camView(cur.v), ck = sstep((T - cur.T) / 0.9);
    const cp = A.p.clone().lerp(B.p, ck), ct = A.t.clone().lerp(B.t, ck);
    if (!RM) { cp.x += 0.035 * amp * Math.sin(T * 37); cp.y += 0.03 * amp * Math.sin(T * 43 + 1); }
    G.camera.position.copy(cp); G.camera.lookAt(ct);

    // labels over the scene
    placeTag(tag('you', 'You'), new THREE.Vector3(r.x, (r.p.hy + 0.72) * 1 + 0.2, r.z));
    const stuck = tag('stuck', 'Stuck!', 'stuck'); if (jamOn) placeTag(stuck, new THREE.Vector3(-3.5, 2.45, 2.2)); else stuck.style.display = 'none';
    const says = SIM.evs.filter((e) => e.e === 'say' && T >= e.T && T < e.T + e.dur);
    const tSay = tag('tsay', '', 'say'), fSay = tag('fsay', '', 'say');
    tSay.style.display = 'none'; fSay.style.display = 'none';
    for (const s of says) {
      if (s.who === 'teacher' && G.teacher.root.visible) { tSay.textContent = s.text; placeTag(tSay, G.teacher.root.position.clone().add(new THREE.Vector3(0, 2.15, 0))); }
      if (s.who === 'fteacher' && G.fteacher.root.visible) { fSay.textContent = s.text; placeTag(fSay, G.fteacher.root.position.clone().add(new THREE.Vector3(0, 2.2, 0))); }
    }
    const cnt = tag('count', '', 'say');
    if (countE && T < countE.T + 3.2 && G.fteacher.root.visible) {
      cnt.textContent = countLine(T - countE.T);
      placeTag(cnt, G.fteacher.root.position.clone().add(new THREE.Vector3(0, 2.25, 0)));
    } else cnt.style.display = 'none';
  }

  // The words around the scene at time T: the shaking chip, the caption and the step strip (and the drawings, with no 3D).
  function applyHud(T) {
    const amp = shakeAt(T), seg = segAt(T), tau = T - seg.T0, tStop = SIM.tStop;
    const sh = $('shake');
    if (amp > 0.06) { sh.className = 'shake on'; sh.textContent = 'Shaking!'; }
    else if (T > tStop) { sh.className = 'shake calm'; sh.textContent = 'The shaking stopped'; }
    else sh.className = 'shake';
    const idx = SIM.segs.indexOf(seg) - 1;
    if (seg.pre) setCap('!', 'warn', '<b>The ground starts to shake!</b>');
    else if (seg.end) setCap('', '', demo ? '<b>That\'s the right way.</b>' : '<b>Let\'s see how it went…</b>');
    else {
      const st = STEPS[seg.step], showG = tau > Math.min(1.0, seg.dur * 0.45);
      if (showG) setCap(seg.grade === 'ok' ? '✓' : seg.grade === 'bad' ? '✗' : '!', seg.grade === 'ok' ? 'ok' : seg.grade === 'bad' ? 'bad' : 'warn', '<b>' + st.t + '.</b> ' + seg.msg);
      else setCap(String(idx + 1), '', '<b>Step ' + (idx + 1) + ': ' + st.t + '</b>');
    }
    document.querySelectorAll('#strip .s').forEach((el, k) => {
      el.classList.toggle('now', k === idx);
      const sg = SIM.segs[k + 1], doneK = T >= sg.T0 + Math.min(1.0, sg.dur * 0.45);
      el.classList.toggle('ok', doneK && sg.grade === 'ok'); el.classList.toggle('warn', doneK && sg.grade === 'warn'); el.classList.toggle('bad', doneK && sg.grade === 'bad');
    });
    if (G.flat) {
      const k = seg.pre ? 'quake' : seg.end ? 'field' : seg.step, fi = $('fico');
      if (fi && fi.dataset.k !== k) { fi.dataset.k = k; fi.innerHTML = ICON[k]; }
      const says = SIM.evs.filter((e) => e.e === 'say' && T >= e.T && T < e.T + e.dur), countE = hits('count', T)[0];
      let line = says.length ? 'Teacher: ' + says[says.length - 1].text : jammedAt(T) ? 'Stuck!' : '';
      if (countE && T < countE.T + 3.2) line = 'Teacher: ' + countLine(T - countE.T);
      const fs = $('fsay');
      if (fs) { fs.hidden = !line; if (fs.textContent !== line) fs.textContent = line; }
    }
  }
  let capKey = '';
  function setCap(g, cls, html) {
    const key = g + cls + html; if (key === capKey) return; capKey = key;
    const ge = $('capg'); ge.textContent = g; ge.className = 'g ' + cls; ge.style.visibility = g ? 'visible' : 'hidden'; $('capt').innerHTML = html;
  }

  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    if (screen === 'sim' && SIM) {
      if (playing) { T += dt; if (T >= SIM.total) { T = SIM.total; playing = false; setTimeout(showResults, 250); } }
      applyHud(T);
      if (G.ready) apply3D(T);
    } else if (screen === 'intro' && G.ready) applyIdle(now / 1000);
    else return;
    if (G.ready) G.renderer.render(G.scene, G.camera);
  }

  /* ---------------- results ---------------- */
  function showResults() {
    if (!SIM || screen !== 'sim') return;
    playing = false;
    const R = SIM.results, worst = R.some((r) => r.grade === 'bad') ? 'bad' : R.some((r) => r.grade === 'warn') ? 'warn' : 'ok';
    const V = {
      ok: ['✓', 'var(--ok)', demo ? 'The right way: safe!' : 'Safe! Great job.', demo ? 'Open the door, duck, cover, hold, wait, then walk out together.' : 'You did every step at the right time.', 3],
      warn: ['!', 'var(--warn)', 'Almost safe', 'You stayed safe, but some steps could be better. See what happened below.', 2],
      bad: ['✗', 'var(--bad)', 'Not safe yet', 'Some steps put you in danger. See what happened, then try again.', 1]
    }[worst];
    $('verdict').innerHTML = '<div class="big" style="background:' + V[1] + '">' + V[0] + '</div><div><h2>' + V[2] + '</h2><p>' + V[3] + '</p><div class="stars">' + '★'.repeat(V[4]) + '<i>' + '★'.repeat(3 - V[4]) + '</i></div></div>';
    const ord = R.map((r) => r.id);
    $('rlist').innerHTML = R.map((r, i) => '<div class="card rrow"><div class="ico">' + ICON[r.id] + '</div><div style="flex:1;min-width:0"><div class="t">' + (i + 1) + '. ' + STEPS[r.id].t + '</div><div class="m">' + r.msg + '</div></div><div class="g ' + (r.grade === 'ok' ? 'ok' : r.grade === 'bad' ? 'bad' : 'warn') + '" style="background:' + (r.grade === 'ok' ? 'var(--ok)' : r.grade === 'bad' ? 'var(--bad)' : 'var(--warn)') + '">' + (r.grade === 'ok' ? '✓' : r.grade === 'bad' ? '✗' : '!') + '</div></div>').join('');
    $('right').innerHTML = RIGHT.map((id) => '<li><b>' + STEPS[id].t + '.</b> ' + STEPS[id].why + '</li>').join('');
    $('again').textContent = demo ? 'Try it yourself' : 'Change my order';
    show('res');
    if (worst === 'ok' && look === 'lively' && !RM) confetti();
    // Tell the library how it went: a safe round with the player's own order earns the Quake Ready badge.
    post({ type: 'result', safe: worst === 'ok', grade: worst, stars: V[4], demo: demo, order: ord });
    say(V[2] + ' ' + V[3]);
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
    for (let i = 0; i < 90; i++) P.push({ x: Math.random() * W, y: -20 - Math.random() * H * 0.5, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, r: Math.random() * 6, c: cols[i % 5], a: Math.random() * 6 });
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
    setLook(look);
    renderList(); setupDrag();
    document.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => setLook(b.dataset.look)));
    $('spk').addEventListener('click', () => say($('bubt').textContent, true));
    $('go').addEventListener('click', () => show('order'));
    $('simulate').addEventListener('click', () => startSim(order.slice(), false));
    $('skip').addEventListener('click', () => { if (SIM && screen === 'sim') { T = SIM.total; showResults(); } });
    $('again').addEventListener('click', () => show('order'));
    $('replay').addEventListener('click', () => startSim(SIM && demo ? RIGHT.slice() : order.slice(), demo));
    $('demo').addEventListener('click', () => startSim(RIGHT.slice(), true));
    $('done').addEventListener('click', leave);
    $('back').addEventListener('click', () => {
      if (screen === 'intro') leave();
      else if (screen === 'order') show('intro');
      else if (screen === 'sim') { playing = false; show('order'); }
      else if (screen === 'res') show('order');
    });
    $('info').addEventListener('click', () => $('sheet').classList.add('on'));
    $('close').addEventListener('click', () => $('sheet').classList.remove('on'));
    $('sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') $('sheet').classList.remove('on'); });
    show('intro');
    if (EMBED) say($('bubt').textContent); // read aloud when the voice is on in the library
    requestAnimationFrame(loop);
    // for the tests
    window.__quake = { simulate, RIGHT, STEPS, embed: EMBED, get flat() { return G.flat; }, start: (o, d) => startSim(o, d), seek: (t) => { T = t; playing = false; }, get T() { return T; }, get SIM() { return SIM; }, setOrder: (o) => { order = o.slice(); renderList(); }, get order() { return order.slice(); }, get screen() { return screen; }, show, setLook };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
