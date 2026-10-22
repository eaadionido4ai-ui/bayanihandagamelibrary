'use strict';
/* Press On (Act Fast): the steps of bleeding control, practiced in a first aid class on a practice arm. No one is
   hurt and there is no blood: the practice arm has a pretend cut and a light that shows how the "bleeding" is doing.
   Easy: get help, find the cut, cover it and press hard (Alert, Bleeding, Compress).
   Difficult: look around first (broken glass), call 911, put on gloves, find the cut, cover it with gauze, press hard
   with both hands, and keep pressing until help takes over. Gloves before or after the call are both accepted.
   The engine around this is games/shared/core.js; the room is games/shared/aidroom.js; the 3D helpers are
   games/shared/kit3d.js. */
(function () {
  const { PI, clamp, lerp, sstep } = Kit3D;
  const AR = window.AidRoom;

  /* ---------------- the steps ---------------- */
  const svg = (s) => '<svg viewBox="0 0 64 64" aria-hidden="true"><rect class="tile" x="2" y="2" width="60" height="60" rx="14"/>' + s + '</svg>';
  const ARM = '<path class="thin" d="M6 55 H58"/><rect class="hd" x="7" y="42" width="46" height="9" rx="4.5"/><circle class="hd" cx="54" cy="46.5" r="5"/>';
  const CUT = '<path class="ln" d="M28 46.5 L 36 45" style="stroke-width:2.6"/>';
  const PHONE = '<rect class="fb" x="20" y="8" width="24" height="46" rx="5"/><rect class="wh" x="24" y="14" width="16" height="28" rx="2"/><text class="tx" x="32" y="32.5" text-anchor="middle" style="fill:#16303f">911</text><circle class="wh" cx="32" cy="48" r="2.4"/><path class="ac" d="M50 20 C 54 24, 54 32, 50 36 M55 15 C 61 22, 61 34, 55 41"/>';
  const GLOVE = (x, y) => '<path class="fb" d="M' + x + ' ' + (y + 26) + ' V ' + (y + 8) + ' C ' + x + ' ' + (y + 4) + ', ' + (x + 5) + ' ' + (y + 4) + ', ' + (x + 5) + ' ' + (y + 8) + ' V ' + y + ' C ' + (x + 5) + ' ' + (y - 4) + ', ' + (x + 10) + ' ' + (y - 4) + ', ' + (x + 10) + ' ' + y +
    ' V ' + (y + 1) + ' C ' + (x + 10) + ' ' + (y - 3) + ', ' + (x + 15) + ' ' + (y - 3) + ', ' + (x + 15) + ' ' + (y + 1) + ' V ' + (y + 5) + ' C ' + (x + 15) + ' ' + (y + 1) + ', ' + (x + 20) + ' ' + (y + 1) + ', ' + (x + 20) + ' ' + (y + 5) + ' V ' + (y + 26) + ' Z"/>';
  const PRESS = '<path class="ln" d="M27 9 L 30 31 M37 9 L 34 31"/><rect class="hd" x="24" y="30" width="16" height="9" rx="4"/>';
  const ICON = {
    safe: svg('<path class="ln" d="M9 25 C 18 12, 46 12, 55 25 C 46 38, 18 38, 9 25 Z"/><circle class="acf" cx="32" cy="25" r="6.5"/><path class="fb" d="M12 55 L 18 44 L 22 52 Z M26 56 L 31 46 L 35 55 Z M40 55 L 47 45 L 50 54 Z"/>'),
    call: svg(PHONE), alert: svg(PHONE),
    gloves: svg(GLOVE(12, 20) + GLOVE(33, 26) + '<rect class="fg" x="44" y="6" width="14" height="14" rx="3"/><path class="wh" d="M49.5 8.5 h3 v3.5 h3.5 v3 h-3.5 v3.5 h-3 v-3.5 h-3.5 v-3 h3.5 z"/>'),
    find: svg(ARM + CUT + '<circle class="ln" cx="32" cy="27" r="9"/><path class="ln" d="M38.5 33.5 L 45 40"/><path class="ac" d="M20 30 L 26 24"/>'),
    cover: svg(ARM + '<rect class="wh" x="24" y="38" width="17" height="11" rx="2" style="stroke:#16303f;stroke-width:2.5"/><path class="ac" d="M32 10 V 30 M32 30 L27 25 M32 30 L37 25"/>'),
    press: svg(ARM + '<rect class="wh" x="24" y="38" width="17" height="11" rx="2" style="stroke:#16303f;stroke-width:2.5"/>' + PRESS + '<path class="ac" d="M50 10 V 26 M50 26 L45 21 M50 26 L55 21"/>'),
    compress: svg(ARM + '<rect class="wh" x="24" y="38" width="17" height="11" rx="2" style="stroke:#16303f;stroke-width:2.5"/>' + PRESS + '<path class="ac" d="M50 10 V 26 M50 26 L45 21 M50 26 L55 21"/>'),
    keep: svg(ARM + '<rect class="wh" x="24" y="38" width="17" height="11" rx="2" style="stroke:#16303f;stroke-width:2.5"/>' + PRESS + '<path class="ac" d="M50 9 A 8 8 0 1 1 43 22"/><path class="ac" d="M50 9 L 45 7 M50 9 L 48 14"/>'),
    arm: svg('<rect class="fb" x="5" y="46" width="54" height="8" rx="3"/>' + '<rect class="hd" x="10" y="36" width="40" height="9" rx="4.5"/><circle class="hd" cx="51" cy="40.5" r="5"/><rect class="fg" x="40" y="9" width="16" height="16" rx="3"/><path class="wh" d="M46 12 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z"/>')
  };
  const STEPS = {
    // Easy (Alert, Bleeding, Compress)
    alert: { t: 'Get help', d: 'Call 911 on speaker, or shout for a grown-up.', short: 'Help',
      why: 'Help starts coming right away, and a grown-up can help you.' },
    compress: { t: 'Cover and press', d: 'Put gauze or a clean cloth on the cut. Press hard with both hands.', short: 'Press',
      why: 'Pressing hard on the cut is what slows the bleeding down.' },
    // both levels
    find: { t: 'Find the cut', d: 'Find where the bleeding is coming from. Move clothes out of the way.', short: 'Find',
      why: 'You need to press right on the spot, so find it first.' },
    // Difficult
    safe: { t: 'Look around first', d: 'Make sure it\'s safe to go near. Look for danger like broken glass.', short: 'Safe',
      why: 'You can only help if you stay safe too. Look around before you go near.' },
    call: { t: 'Call 911', d: 'Call 911 on speaker, or have someone call.', short: 'Call',
      why: 'Help starts coming sooner. (Putting on gloves first is also fine.)' },
    gloves: { t: 'Put on gloves', d: 'Put on gloves from the first aid kit, if there are some.', short: 'Gloves',
      why: 'Gloves protect you both. If there are none, don\'t wait: press with a clean cloth.' },
    cover: { t: 'Cover it', d: 'Cover the cut with gauze or a clean cloth.', short: 'Cover',
      why: 'Gauze helps the bleeding slow down and keeps the cut clean.' },
    press: { t: 'Press hard', d: 'Push down hard on it with both hands.', short: 'Press',
      why: 'Hard, steady pressing is what slows the bleeding down.' },
    keep: { t: 'Keep pressing', d: 'Don\'t let go until help takes over. If it soaks through, add more gauze on top.', short: 'Keep',
      why: 'If you let go, it can start again. Never lift the first gauze: add more on top.' }
  };

  /* ---------------- where things are ---------------- */
  // a small mat with the practice arm lying on it (shoulder to the left); you kneel on the far side, facing the camera
  const ARMZ = 0.38, CUT_X = -0.2;
  const SPOT = {
    ready: { x: 0.25, z: -1.05, f: -0.35 }, half: { x: -0.05, z: -0.78, f: -0.6 },
    cut: { x: CUT_X, z: 0.06, f: 0 }, sleeve: { x: -0.32, z: 0.04, f: 0 }, kit: { x: 0.32, z: -0.12, f: 0.1 },
    look: { x: 0.1, z: -1.0, f: -0.47 }, aside: { x: -1.0, z: -0.7, f: 0.55 }
  };
  const KNEELING = { kneel: 1, kpress: 1, kplace: 1, kgrab: 1, kphone: 1 };
  const KIT = { x: 0.38, z: 0.22 }, GLASS = { x: -0.42, z: 0.02 }, PHONE_FLOOR = { x: 0.02, z: -0.2 };
  const NURSE_TAKE = { x: CUT_X + 0.04, z: -0.05, f: 0 };

  /* ---------------- the simulation rules ----------------
     State: what you have done so far (called, gloves on, found the cut, covered it, pressing now, pressed at all,
     kept pressing), whether the broken glass is still there (Difficult), and where you are. Each step returns a grade
     (ok | warn | bad), a message, and the keyframes the 3D scene plays. st.clock is the time on the timeline when the
     step starts. */
  function rules(level, S) {
    const { mv, hold, cam, ev, key, done } = S;
    const say = (s, who, text, dur, t) => ev(s, 'say', { who, text, dur: dur || 1.6, t: t === undefined ? s.t : t });
    const kneeling = (st) => !!KNEELING[st.kid.pose];
    function phoneDown(s, st) { if (st.phone === 'hand') { ev(s, 'phone', { at: 'floor' }); st.phone = 'floor'; } }
    function letGo(s, st) { if (st.pressing) { ev(s, 'pressOff'); st.pressing = false; } }
    function standUp(s, st) { letGo(s, st); if (st.kid.pose !== 'stand') mv(s, st, 0.4, 'stand'); }
    function walkTo(s, st, p) {
      const d = Math.hypot(p.x - st.kid.x, p.z - st.kid.z);
      if (d > 0.02) mv(s, st, clamp(d / 1.6, 0.3, 1.6), 'stand', { x: p.x, z: p.z, f: Math.atan2(p.x - st.kid.x, p.z - st.kid.z) }, { walk: true });
    }
    // to the practice arm, kneeling at a spot, in a pose
    function toArm(s, st, spot, pose, flags) {
      const p = SPOT[spot];
      if (st.where !== 'arm') {
        standUp(s, st);
        walkTo(s, st, { x: p.x, z: p.z - 0.32 });
        mv(s, st, 0.3, 'stand', { x: p.x, z: p.z - 0.3, f: 0 });
        mv(s, st, 0.45, 'kneel', spot);
        st.where = 'arm';
      } else if (st.kid.x !== p.x || st.kid.z !== p.z || !kneeling(st)) { letGo(s, st); mv(s, st, 0.4, 'kneel', spot); }
      phoneDown(s, st);
      mv(s, st, 0.35, pose, spot, { flags });
    }
    function pressOn(s, st, dt) {
      if (!st.pressing) { ev(s, 'pressOn'); st.pressing = true; st.pressed = true; }
      hold(s, st, dt);
    }
    // Nurse Lea sweeps up the broken glass
    function nurseSweep(s, st, t0, stop) {
      const N = st.nurse;
      if (stop) say(s, 'nurse', 'Stop! Broken glass!', 1.6, t0 + 0.1);
      key(s, 'nurse', Object.assign({}, N), t0);
      key(s, 'nurse', { pose: 'stand', x: 0.55, z: -0.62, f: -1.9, walk: true }, t0 + 0.7);
      key(s, 'nurse', { pose: 'stand', x: GLASS.x + 0.35, z: GLASS.z - 0.42, f: -0.7, walk: true }, t0 + 1.3);
      key(s, 'nurse', { pose: 'crouch', x: GLASS.x + 0.35, z: GLASS.z - 0.42, f: -0.7 }, t0 + 1.65);
      ev(s, 'sweep', { t: t0 + 1.9 });
      key(s, 'nurse', { pose: 'crouch', x: GLASS.x + 0.35, z: GLASS.z - 0.42, f: -0.7, sweeping: true }, t0 + 2.35);
      say(s, 'nurse', 'All clean. Now it\'s safe.', 1.6, t0 + 2.4);
      key(s, 'nurse', { pose: 'stand', x: GLASS.x + 0.35, z: GLASS.z - 0.42, f: 1.6 }, t0 + 2.7);
      key(s, 'nurse', { pose: 'stand', x: 0.55, z: -0.62, f: 1.2, walk: true }, t0 + 3.3);
      key(s, 'nurse', Object.assign({ walk: true }, N), t0 + 3.95);
      st.hazard = false; st.nurseFree = st.clock + t0 + 4.0;
    }
    // the first step that touches the arm: if no one looked around, Nurse Lea stops it; then the step's own view
    function start(s, st, view) {
      if (!st.hazard) { cam(s, view); return; }
      s.grade = 'bad';
      s.msg = 'You went near without looking around. There was broken glass right next to the arm! Nurse Lea stopped the practice to sweep it up.';
      cam(s, 'wide');
      standUp(s, st);
      if (st.where !== 'arm') walkTo(s, st, SPOT.half);
      else { mv(s, st, 0.4, 'stand'); walkTo(s, st, SPOT.look); st.where = 'floor'; }
      nurseSweep(s, st, s.t, true);
      hold(s, st, 2.9);
      cam(s, view);
    }
    // no gloves on the first touch (Difficult)
    function bare(s, st) {
      if (level !== 'hard' || st.gloves || st.bareSaid) return;
      st.bareSaid = true;
      if (s.grade === 'ok') { s.grade = 'warn'; s.msg = 'You touched it without gloves. Put on gloves first, if there are some, to protect you both.'; }
    }
    // help arrives: Nurse Lea plays the ambulance crew and takes over the pressing
    function helpArrives(s, st) {
      const wait = (st.nurseFree || 0) - (st.clock + s.t);
      if (wait > 0) { if (st.pressing) pressOn(s, st, wait); else hold(s, st, wait); }
      const t0 = s.t, N = st.nurse;
      ev(s, 'help'); say(s, 'nurse', 'Help is here! I\'ll take over.', 2.0, t0);
      key(s, 'nurse', Object.assign({}, N), t0);
      key(s, 'nurse', { pose: 'stand', x: 0.55, z: -0.62, f: -1.9, walk: true }, t0 + 0.75);
      key(s, 'nurse', { pose: 'stand', x: NURSE_TAKE.x + 0.3, z: NURSE_TAKE.z - 0.35, f: -1.2, walk: true }, t0 + 1.25);
      if (st.where === 'arm') { letGo(s, st); mv(s, st, 0.4, 'stand'); phoneDown(s, st); }
      walkTo(s, st, SPOT.aside); mv(s, st, 0.3, 'stand', 'aside');
      st.where = 'floor';
      const tk = Math.max(t0 + 1.35, s.t);
      key(s, 'nurse', { pose: 'kneel', x: NURSE_TAKE.x, z: NURSE_TAKE.z, f: 0 }, tk + 0.4);
      key(s, 'nurse', { pose: 'apress', x: NURSE_TAKE.x, z: NURSE_TAKE.z, f: 0 }, tk + 0.75);
      ev(s, 'nursePress', { t: tk + 0.75 }); ev(s, 'stopped', { t: tk + 1.6 });
      if (s.t < tk + 1.7) hold(s, st, tk + 1.7 - s.t);
      st.helpHere = true; st.nurse = { pose: 'apress', x: NURSE_TAKE.x, z: NURSE_TAKE.z, f: 0 };
    }
    // the call (Get help in Easy, Call 911 in Difficult)
    function callStep(st, id) {
      const s = S.seg(st, id);
      cam(s, 'wide');
      if (st.kept) { s.grade = 'warn'; s.msg = 'You called very late. Call 911 first, so help can come.'; }
      else if (st.pressing) { s.grade = 'warn'; s.msg = 'You let go to make the call. Call first, or have someone call while you press.'; }
      else if (st.found || st.covered) { s.grade = 'warn'; s.msg = level === 'easy' ? 'Get help first, as soon as you see bad bleeding.' : 'Call 911 as soon as you see bad bleeding, before you start, so help comes sooner.'; }
      else s.msg = level === 'easy' ? 'You called 911 on speaker. Help is on the way.' : 'You called 911 on speaker. Help is on the way.';
      letGo(s, st);
      if (st.where === 'arm') mv(s, st, 0.4, 'kphone'); else { standUp(s, st); mv(s, st, 0.35, 'phone'); }
      ev(s, 'phone', { at: 'hand' }); st.phone = 'hand'; ev(s, 'called');
      say(s, 'kid', 'Help! Someone is bleeding!', 1.3, s.t + 0.1);
      say(s, 'phone', '911: Help is on the way!', 1.7, s.t + 1.1);
      hold(s, st, 2.2);
      if (st.where === 'arm') phoneDown(s, st);
      st.called = true;
      return done(s);
    }

    const B = {
      safe(st) {
        const s = S.seg(st, 'safe');
        cam(s, 'glass');
        if (!st.hazard) {
          s.grade = 'warn'; s.msg = 'Nurse Lea had already swept up the glass. Look around first, before you go near.';
          if (kneeling(st)) hold(s, st, 0.2); else { standUp(s, st); mv(s, st, 0.45, 'lookL'); mv(s, st, 0.55, 'lookR'); mv(s, st, 0.3, 'stand'); }
          ev(s, 'lookAround', { t: 0 }); hold(s, st, 1.0);
          return done(s);
        }
        if (st.anyStep) { s.grade = 'warn'; s.msg = 'Look around first, before anything else, so you know it\'s safe to help.'; }
        else s.msg = 'You looked around first and saw broken glass by the arm. You told Nurse Lea, and she swept it up.';
        letGo(s, st);
        if (st.where === 'arm') { mv(s, st, 0.4, 'stand'); walkTo(s, st, SPOT.look); st.where = 'floor'; }
        else { standUp(s, st); walkTo(s, st, SPOT.look); }
        mv(s, st, 0.45, 'lookL'); ev(s, 'spot'); mv(s, st, 0.5, 'lookR'); mv(s, st, 0.3, 'point', 'look');
        say(s, 'kid', 'Nurse Lea, broken glass!', 1.5);
        nurseSweep(s, st, s.t + 0.1, false);
        hold(s, st, 0.5); mv(s, st, 0.35, 'stand', 'look'); hold(s, st, 2.1);
        return done(s);
      },
      call(st) { return callStep(st, 'call'); },
      alert(st) { return callStep(st, 'alert'); },
      gloves(st) {
        const s = S.seg(st, 'gloves');
        cam(s, 'mat');
        if (st.pressing) { s.grade = 'warn'; s.msg = 'You let go to put on gloves. Put them on before you touch the cut.'; }
        else s.msg = 'You put on gloves from the first aid kit, to protect you both.';
        letGo(s, st);
        if (st.where === 'arm') { mv(s, st, 0.4, 'kneel', 'kit'); mv(s, st, 0.3, 'kgrab', 'kit'); }
        else { standUp(s, st); walkTo(s, st, { x: SPOT.kit.x, z: SPOT.kit.z - 0.3 }); mv(s, st, 0.45, 'kneel', 'kit'); mv(s, st, 0.35, 'kgrab', 'kit'); st.where = 'arm'; }
        ev(s, 'kitOpen'); hold(s, st, 0.35); mv(s, st, 0.35, 'kphone', 'kit'); ev(s, 'gloves'); say(s, 'kid', 'Gloves on!', 1.2); hold(s, st, 0.7);
        mv(s, st, 0.3, 'kneel', 'kit');
        st.gloves = true;
        return done(s);
      },
      find(st) {
        const s = S.seg(st, 'find');
        start(s, st, 'mat');
        if (s.grade !== 'ok') { /* stopped */ }
        else if (st.pressing) { s.grade = 'warn'; s.msg = 'You let go to look for the cut. Find it first, then press.'; }
        else if (st.covered) s.msg = 'You lifted the gauze and found the cut.';
        else s.msg = level === 'easy' ? 'You found where the bleeding was coming from.' : 'You pushed up the sleeve and found the cut on the forearm.';
        bare(s, st);
        letGo(s, st);
        toArm(s, st, 'sleeve', 'kgrab'); ev(s, 'sleeveUp'); hold(s, st, 0.45);
        mv(s, st, 0.35, 'kplace', 'cut'); say(s, 'kid', 'Here it is!', 1.2); hold(s, st, 0.8);
        st.found = true;
        return done(s);
      },
      cover(st) {
        const s = S.seg(st, 'cover');
        start(s, st, 'mat');
        if (s.grade !== 'ok') { /* stopped */ }
        else if (st.pressing) { s.grade = 'warn'; s.msg = 'You let go to cover it. Cover it first, then press.'; }
        else if (!st.found) { s.grade = 'warn'; s.msg = 'You covered it before finding the cut, so you might miss the spot. Find it first.'; }
        else s.msg = 'You covered the cut with gauze from the first aid kit.';
        bare(s, st);
        letGo(s, st);
        toArm(s, st, 'kit', 'kgrab'); ev(s, 'kitOpen'); hold(s, st, 0.3);
        mv(s, st, 0.4, 'kplace', 'cut'); ev(s, 'gauze'); hold(s, st, 0.6);
        st.covered = true;
        return done(s);
      },
      press(st) {
        const s = S.seg(st, 'press');
        start(s, st, 'mat');
        if (s.grade !== 'ok') { /* stopped */ }
        else if (!st.found) { s.grade = 'warn'; s.msg = 'You pressed before finding the cut, so you might miss the spot.'; }
        else if (!st.covered) { s.grade = 'warn'; s.msg = 'Cover the cut with gauze first, then press on it.'; }
        else s.msg = 'You pressed down hard with both hands, right on the cut.';
        bare(s, st);
        toArm(s, st, 'cut', 'kpress', { press: true });
        pressOn(s, st, 2.3);
        return done(s);
      },
      // Easy: cover it with a clean cloth and press hard
      compress(st) {
        const s = S.seg(st, 'compress');
        cam(s, 'mat');
        if (!st.found) { s.grade = 'warn'; s.msg = 'Find the cut first, so you press on the right spot.'; }
        else s.msg = 'You covered the cut with a clean cloth and pressed hard with both hands.';
        if (!st.covered) { toArm(s, st, 'kit', 'kgrab'); ev(s, 'kitOpen'); hold(s, st, 0.3); mv(s, st, 0.4, 'kplace', 'cut'); ev(s, 'gauze'); hold(s, st, 0.3); st.covered = true; }
        toArm(s, st, 'cut', 'kpress', { press: true });
        pressOn(s, st, 2.0);
        return done(s);
      },
      keep(st) {
        const s = S.seg(st, 'keep');
        start(s, st, 'mat');
        if (!st.called) {
          s.grade = 'bad';
          if (s.msg) s.msg += ' And no one had called 911, so help wasn\'t coming.';
          else s.msg = 'You kept pressing, but no one had called 911, so help wasn\'t coming. Call 911 first.';
          bare(s, st);
          if (!st.pressing) toArm(s, st, 'cut', 'kpress', { press: true });
          pressOn(s, st, 1.5); say(s, 'kid', 'My arms are tired… Is help coming?', 1.8); pressOn(s, st, 1.4);
          st.kept = true;
          return done(s);
        }
        if (s.grade === 'ok') {
          if (!st.pressed) { s.grade = 'warn'; s.msg = 'Keep pressing means pressing first. Press hard on the cut, then keep going.'; }
          else s.msg = 'You kept pressing hard until help came and took over. When it soaked through, you added more gauze on top.';
        }
        bare(s, st);
        if (!st.pressing) toArm(s, st, 'cut', 'kpress', { press: true });
        pressOn(s, st, 0.8);
        say(s, 'nurse', 'It soaked through! Add more gauze on top.', 1.8);
        letGo(s, st); mv(s, st, 0.35, 'kplace', 'cut'); ev(s, 'gauze2'); mv(s, st, 0.35, 'kpress', 'cut', { flags: { press: true } });
        pressOn(s, st, 0.9);
        cam(s, 'wide');
        helpArrives(s, st);
        st.kept = true;
        return done(s);
      },
      // Easy: after the three steps, keep pressing until help comes
      autoKeep(st) {
        const s = S.seg(st, null); s.auto = true; cam(s, 'mat');
        s.cap = '<b>Keep pressing.</b> You kept pressing until help came.';
        if (!st.pressing) toArm(s, st, 'cut', 'kpress', { press: true });
        pressOn(s, st, 1.0);
        cam(s, 'wide');
        helpArrives(s, st);
        return done(s, 0.3);
      },
      helpArrives
    };
    return B;
  }

  function simulate(ord, level) {
    level = level === 'easy' ? 'easy' : 'hard';
    const S = Kit3D.seq(SPOT), B = rules(level, S);
    const st = { level, hazard: level === 'hard', where: 'floor', kid: Object.assign({ pose: 'stand' }, SPOT.ready), clock: 0,
      nurse: { pose: 'stand', x: AR.NURSE.x, z: AR.NURSE.z, f: AR.NURSE.f }, anyStep: false, called: false, gloves: false, found: false,
      covered: false, pressing: false, pressed: false, kept: false, helpHere: false, bareSaid: false, phone: null };
    const segs = [];
    const add = (s) => { segs.push(s); st.clock += s.dur; };
    const pre = S.seg(st, null); pre.pre = true; S.cam(pre, 'wide', 0);
    S.ev(pre, 'say', { who: 'nurse', text: 'Pretend this arm is bleeding a lot. What do you do?', dur: 1.8, t: 0.05 });
    S.hold(pre, st, 1.6); S.done(pre, 0);
    add(pre);
    for (const id of ord) { add(B[id](st)); st.anyStep = true; }
    if (level === 'easy') add(B.autoKeep(st));
    const end = S.seg(st, null); end.end = true;
    if (st.called && !st.helpHere) { S.cam(end, 'wide'); B.helpArrives(end, st); }
    S.hold(end, st, 1.0); S.done(end, 0.2);
    add(end);
    const J = S.join(segs);
    const abs = (k) => Object.assign({}, k, { t: k.T });
    const first = (e) => { const x = J.evs.find((v) => v.e === e); return x ? x.T : 1e9; };
    return Object.assign(J, {
      level, nurseKeys: (J.tracks.nurse || []).map(abs), callT: first('called'), helpT: first('help'), stoppedT: first('stopped'),
      press: J.evs.filter((e) => e.e === 'pressOn' || e.e === 'pressOff').map((e) => ({ T: e.T, on: e.e === 'pressOn' }))
    });
  }
  // the bleeding at time T: fast, slowing (someone is pressing) or stopped (help took over)
  function bleeding(T, SIM, ctx) {
    if (T >= SIM.stoppedT) return 'stopped';
    let on = false; for (const p of SIM.press) if (T >= p.T) on = p.on;
    const np = ctx.hits('nursePress', T)[0];
    return on || np ? 'slowing' : 'fast';
  }

  /* ---------------- 3D scene ---------------- */
  const PAL = {
    lively: { mat: 0x3d8fd6, matEdge: 0x2f6fae, plastic: 0xf0c8a0, plastic2: 0xf7d9b8, sleeve: 0x6f8fb0, trainer: 0x3a3f45, phone: 0x2b2f36, screen: 0x9fd8f7,
      glove: 0x4f8fe0, gauze: 0xffffff, kit: 0x1e9c5a, shard: 0xc6ecf7, ink2: 0x5a4636 },
    minimal: { mat: 0x8f969c, matEdge: 0x737a80, plastic: 0xe6d3c0, plastic2: 0xefe1d2, sleeve: 0x8f969c, trainer: 0x4a4a4a, phone: 0x2b2f36, screen: 0xd4e2e8,
      glove: 0x7f9bb8, gauze: 0xffffff, kit: 0x1e9c5a, shard: 0xd4e2e8, ink2: 0x5c574f }
  };
  // the practice arm lies low on the mat, so kneeling poses lean further than for a manikin's chest
  const POSES = Object.assign({}, AR.POSES, {
    kpress: { hy: 0.37, tp: 0.9, nk: 0.55, sh: [[-0.92, -0.36], [-0.92, 0.36]], el: [0, 0], hp: [-0.35, -0.35], kn: [1.9, 1.9] },
    kplace: { hy: 0.37, tp: 0.8, nk: 0.5, sh: [[-1.0, -0.2], [-1.0, 0.2]], el: [-0.3, -0.3], hp: [-0.3, -0.3], kn: [1.85, 1.85] },
    kgrab: { hy: 0.37, tp: 0.85, nk: 0.45, sh: [[-1.05, 0.15], [-0.3, -0.1]], el: [-0.15, -0.5], hp: [-0.3, -0.3], kn: [1.85, 1.85] },
    apress: { hy: 0.4, tp: 1.05, nk: 0.6, sh: [[-1.05, -0.34], [-1.05, 0.34]], el: [0, 0], hp: [-0.35, -0.35], kn: [1.9, 1.9] }
  });
  const CAMS = {
    intro: { p: [2.0, 2.3, 3.6], t: [-0.45, 0.45, -0.45], pp: [2.3, 3.4, 5.3], pt: [-0.5, 0.45, -0.5] },
    wide: { p: [2.1, 2.5, 3.9], t: [-0.55, 0.45, -0.45], pp: [2.3, 3.5, 5.5], pt: [-0.6, 0.4, -0.5] },
    mat: { p: [1.25, 1.3, 1.6], t: [-0.35, 0.25, 0.25], pp: [1.55, 2.2, 2.7], pt: [-0.4, 0.25, 0.2] },
    glass: { p: [1.2, 2.3, 1.9], t: [-0.5, 0.35, -0.3], pp: [1.4, 3.2, 2.9], pt: [-0.5, 0.3, -0.35] }
  };
  const G = {};
  function drawPoster(g, w, h) {
    g.fillStyle = '#fff7e8'; AR.rr(g, 4, 4, w - 8, h - 8, 22); g.fill();
    g.strokeStyle = '#f2760c'; g.lineWidth = 8; g.stroke();
    // two hands pressing on a pad
    g.fillStyle = '#ffffff'; g.strokeStyle = '#16303f'; g.lineWidth = 6; AR.rr(g, w * 0.3, h * 0.33, w * 0.4, h * 0.1, 10); g.fill(); g.stroke();
    g.fillStyle = '#e0a066'; AR.rr(g, w * 0.36, h * 0.12, w * 0.28, h * 0.2, 18); g.fill(); g.stroke();
    g.strokeStyle = '#f2760c'; g.lineWidth = 9; g.beginPath(); g.moveTo(w * 0.82, h * 0.1); g.lineTo(w * 0.82, h * 0.34); g.moveTo(w * 0.76, h * 0.27); g.lineTo(w * 0.82, h * 0.34); g.lineTo(w * 0.88, h * 0.27); g.stroke();
    g.fillStyle = '#16303f'; g.textAlign = 'center';
    g.font = '900 46px sans-serif'; g.fillText('PRESS HARD', w / 2, h * 0.58);
    g.font = '800 30px sans-serif'; g.fillText('Cover the cut.', w / 2, h * 0.7); g.fillText('Press. Don\'t let go.', w / 2, h * 0.79);
    g.font = '700 25px sans-serif'; g.fillStyle = '#4f6572'; g.fillText('Call 911', w / 2, h * 0.9);
  }
  function build(K) {
    const THREE = window.THREE, sc = K.scene;
    AR.build(K, G, { poster: drawPoster });
    // the mat and the practice arm lying on it (shoulder to the left, palm up)
    K.box(1.7, 0.04, 1.0, 'mat', -0.4, 0.02, ARMZ);
    K.box(1.7, 0.006, 0.04, 'matEdge', -0.4, 0.042, ARMZ - 0.48); K.box(1.7, 0.006, 0.04, 'matEdge', -0.4, 0.042, ARMZ + 0.48);
    const arm = new THREE.Group(); arm.position.set(0, 0.04, ARMZ); sc.add(arm); G.arm = arm;
    const along = (r1, r2, len, role, x) => { const m = K.cyl(r1, r2, len, role, x, 0.065, 0, arm); m.rotation.z = PI / 2; return m; };
    along(0.07, 0.065, 0.5, 'plastic', -0.69);
    K.sph(0.066, 'plastic', -0.43, 0.065, 0, arm);
    along(0.06, 0.047, 0.46, 'plastic', -0.2);
    const hand = K.box(0.15, 0.045, 0.1, 'plastic', 0.12, 0.05, 0, arm); hand.rotation.y = 0.05;
    K.box(0.07, 0.035, 0.03, 'plastic', 0.07, 0.05, 0.065, arm);
    K.box(0.07, 0.004, 0.012, 'ink2', CUT_X, 0.113, 0, arm).rotation.y = 0.2; // the pretend cut
    // the trainer's box at the shoulder, with its light
    K.box(0.14, 0.12, 0.2, 'trainer', -1.0, 0.06, 0, arm);
    G.lightMat = new THREE.MeshBasicMaterial({ color: 0xe94b4b });
    const light = new THREE.Mesh(new THREE.CircleGeometry(0.035, 18), G.lightMat); light.rotation.x = -PI / 2; light.position.set(-1.0, 0.122, 0); arm.add(light);
    // the sleeve over the arm (pushed up to find the cut)
    G.sleeve = new THREE.Group(); G.sleeve.position.set(-0.94, 0.065, 0); arm.add(G.sleeve);
    const sl = K.cyl(0.078, 0.07, 1, 'sleeve', 0.5, 0, 0, G.sleeve); sl.rotation.z = PI / 2;
    G.sleeveLen = { down: 0.95, up: 0.46 };
    // gauze pads
    G.gauze1 = K.box(0.13, 0.025, 0.11, 'gauze', CUT_X, 0.122, 0, arm);
    G.gauze2 = K.box(0.13, 0.025, 0.11, 'gauze', CUT_X + 0.01, 0.147, 0.005, arm);
    // the first aid kit: a green box with the white first aid cross
    const kit = new THREE.Group(); kit.position.set(KIT.x, 0.04, KIT.z); kit.rotation.y = 0.3; sc.add(kit); G.kit = kit;
    K.box(0.32, 0.12, 0.22, 'kit', 0, 0.06, 0, kit);
    G.kitLid = new THREE.Group(); G.kitLid.position.set(0, 0.12, -0.11); kit.add(G.kitLid);
    K.box(0.32, 0.025, 0.22, 'kit', 0, 0.012, 0.11, G.kitLid);
    K.sign(AR.drawFirstAid, 128, 128, 0.12, 0.12, 0, 0.026, 0.11, 0, G.kitLid).rotation.x = -PI / 2;
    // Difficult: broken glass on the mat, right where you'd kneel
    const gl = new THREE.Group(); gl.position.set(GLASS.x, 0.045, GLASS.z); sc.add(gl); G.glass = gl;
    const glassMat = new THREE.MeshLambertMaterial({ color: K.color('shard'), transparent: true, opacity: 0.85 }); G.glassMat = glassMat;
    const shards = [[0, 0, 0.06, 0.3], [0.08, 0.05, 0.05, 1.1], [-0.07, 0.04, 0.045, 2.0], [0.04, -0.06, 0.04, 2.6], [-0.1, -0.05, 0.035, 0.9], [0.13, -0.02, 0.03, 1.8]];
    for (const [x, z, s2, r] of shards) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(s2, 0.012, 3), glassMat); m.position.set(x, 0.006, z); m.rotation.set(0, r, 0); gl.add(m);
    }
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.05, 14, 1, true), glassMat); base.material.side = THREE.DoubleSide; base.position.set(-0.02, 0.025, 0.01); gl.add(base);
    // the phone
    const ph = new THREE.Group(); sc.add(ph); G.phone = ph;
    K.box(0.075, 0.014, 0.14, 'phone', 0, 0, 0, ph); K.box(0.064, 0.003, 0.12, 'screen', 0, 0.008, 0, ph);
    return true;
  }
  function onRecolor(K) { if (G.glassMat) G.glassMat.color.setHex(K.color('shard')); }
  function setSleeve(k) { const L = lerp(G.sleeveLen.down, G.sleeveLen.up, k); G.sleeve.scale.set(L, 1, 1); }
  function gloves(K, on) { const m = on ? K.mat('glove') : K.mat('skin'); G.kid.hands.forEach((h) => { h.material = m; }); }
  function reset(K, level) {
    G.glass.visible = level !== 'easy'; G.glass.scale.set(1, 1, 1);
    setSleeve(0); G.gauze1.visible = false; G.gauze2.visible = false; G.kitLid.rotation.x = 0; G.phone.visible = false;
    gloves(K, false); G.lightMat.color.setHex(0xe94b4b);
  }

  // the intro: the class on the bench, Nurse Lea beside the practice arm
  function idle(K, T, level) {
    reset(K, level);
    AR.seatClass(K, G, T, 'point');
    K.applyPose(G.kid, K.POSE.stand, null, 0, T); K.place(G.kid, SPOT.ready.x, SPOT.ready.z, SPOT.ready.f); K.show(G.kid, true);
    G.lightMat.color.setHex(Math.sin(T * 9) > 0 ? 0xe94b4b : 0x7a2a24);
    const c = K.camView('intro'), a = Math.sin(T * 0.25) * 0.4;
    K.camera.position.set(c.p.x + a, c.p.y, c.p.z - a * 0.3); K.camera.lookAt(c.t);
    K.showTag('you', 'You', '', SPOT.ready.x, 1.6, SPOT.ready.z);
    K.showTag('arm', 'The practice arm', 'name', -0.55, 0.45, ARMZ);
    K.showTag('nname', 'Nurse Lea', 'name', AR.NURSE.x, 2.3, AR.NURSE.z);
    for (const t of ['ksay', 'nsay', 'psay', 'hz']) K.hideTag(t);
  }

  const ev1 = (ctx, e, T) => ctx.hits(e, T).pop();
  // the first aid room at time T of the simulation
  function frame(K, T, SIM, ctx) {
    const seg = ctx.segAt(T), tau = T - seg.T0, hard = SIM.level !== 'easy';
    // the broken glass, until Nurse Lea sweeps it up
    if (hard) { const sw = ev1(ctx, 'sweep', T); const k = sw ? sstep((T - sw.T) / 0.45) : 0; G.glass.visible = k < 1; G.glass.scale.set(1 - 0.7 * k, 1, 1 - 0.7 * k); G.glass.position.x = GLASS.x + 0.3 * k; }
    // you
    const r = K.evalTrack(seg.kid, tau);
    K.applyPose(G.kid, r.p, r.gait, r.gk, T);
    const pressing = r.key && r.key.press && r.prev && r.prev.press;
    if (pressing) { G.kid.torso.rotation.x += 0.05; G.kid.hips.position.y -= 0.012 * G.kid.s; }
    const look = ev1(ctx, 'lookAround', T);
    if (look && T - look.T < 1.3 && seg.step === 'safe') G.kid.neck.rotation.y = 0.8 * Math.sin((T - look.T) * 5);
    K.place(G.kid, r.x, r.z, r.f);
    gloves(K, !!ev1(ctx, 'gloves', T));
    // the class on the bench; Nurse Lea sweeps the glass and takes over when help comes
    AR.seatClass(K, G, T, 'stand');
    const nr = AR.follow(K, G.nurse, SIM.nurseKeys, T, { pose: 'stand', x: AR.NURSE.x, z: AR.NURSE.z, f: AR.NURSE.f });
    if (nr && nr.key && nr.key.sweeping && nr.prev && !nr.prev.sweeping) for (let i = 0; i < 2; i++) G.nurse.arms[i].sh.rotation.z += 0.35 * Math.sin(T * 14 + i);
    // the props: the sleeve, the kit, the gauze, the phone
    const up = ev1(ctx, 'sleeveUp', T); setSleeve(up ? sstep((T - up.T) / 0.4) : 0);
    const ko = ev1(ctx, 'kitOpen', T); G.kitLid.rotation.x = ko ? -1.6 * sstep((T - ko.T) / 0.35) : 0;
    G.gauze1.visible = !!ev1(ctx, 'gauze', T); G.gauze2.visible = !!ev1(ctx, 'gauze2', T);
    const pe = ev1(ctx, 'phone', T);
    if (!pe) G.phone.visible = false;
    else if (pe.at === 'hand') { const h = AR.handPos(G.kid, 0); G.phone.visible = true; G.phone.position.set(h.x, h.y + 0.03, h.z); G.phone.rotation.set(-0.9, G.kid.root.rotation.y, 0); }
    else { G.phone.visible = true; G.phone.position.set(PHONE_FLOOR.x, 0.05, PHONE_FLOOR.z); G.phone.rotation.set(0, 0.4, 0); }
    // the trainer's light: red and blinking fast while it "bleeds", amber while someone presses, green when it stops
    const b = bleeding(T, SIM, ctx);
    G.lightMat.color.setHex(b === 'stopped' ? 0x22d36b : b === 'slowing' ? (Math.sin(T * 4) > -0.2 ? 0xf2a51c : 0x8a5a10) : (Math.sin(T * 11) > 0 ? 0xe94b4b : 0x7a2a24));

    K.camFollow(T, SIM.camKeys, 0);

    // labels
    const head = (F, extra) => { const p = new window.THREE.Vector3(); F.neck.getWorldPosition(p); return [p.x, p.y + 0.3 * F.s + (extra || 0), p.z]; };
    const [yx, yy, yz] = head(G.kid, 0.12);
    K.showTag('you', 'You', '', yx, yy, yz);
    K.hideTag('arm'); K.hideTag('nname');
    const says = SIM.evs.filter((e) => e.e === 'say' && T >= e.T && T < e.T + e.dur);
    const shown = {};
    for (const s of says) {
      if (s.who === 'kid') { const h = head(G.kid, 0.42); K.showTag('ksay', s.text, 'say', h[0], h[1], h[2]); shown.ksay = 1; }
      if (s.who === 'nurse') { const h = head(G.nurse, 0.2); K.showTag('nsay', s.text, 'say', h[0], h[1], h[2]); shown.nsay = 1; }
      if (s.who === 'phone') { const p = G.phone.position; K.showTag('psay', s.text, 'dev', p.x, p.y + 0.3, p.z); shown.psay = 1; }
    }
    for (const t of ['ksay', 'nsay', 'psay']) if (!shown[t]) K.hideTag(t);
    const sp = ev1(ctx, 'spot', T);
    if (hard && sp && T - sp.T < 1.6) K.showTag('hz', 'Danger!', 'stuck', GLASS.x, 0.35, GLASS.z); else K.hideTag('hz');
  }

  function status(T, SIM, ctx) {
    const b = bleeding(T, SIM, ctx);
    if (b === 'stopped') return { cls: 'calm', text: 'Bleeding: stopped' };
    if (b === 'slowing') return { cls: 'warn', text: 'Bleeding: slowing down' };
    return { cls: 'on', text: 'Bleeding: fast' };
  }
  // with no 3D: the drawing for the moment, and what people say
  function flat(T, SIM, ctx, seg) {
    const icon = seg.pre ? 'arm' : seg.end || seg.auto ? 'keep' : seg.step;
    const says = SIM.evs.filter((e) => e.e === 'say' && T >= e.T && T < e.T + e.dur);
    const s = says[says.length - 1];
    const who = s ? { kid: 'You', nurse: 'Nurse Lea', phone: 'Phone' }[s.who] : '';
    return { icon, say: s ? who + ': ' + s.text : '' };
  }

  /* ---------------- practice: press and hold ---------------- */
  const HOLD = 10; // seconds
  const practice = {
    icon: ICON.press, title: 'Practice: press and hold', button: 'Try it',
    text: 'Press the big button and hold it down for 10 seconds without letting go, like pressing on a cut.',
    run(el, api) {
      el.innerHTML = '<div class="pbox"><h3>Press and hold</h3><p>Press the button and don\'t let go for 10 seconds. In real life, you keep pressing until help takes over.</p>' +
        '<button class="pbig" id="pbtn" aria-label="Press and hold">PRESS</button>' +
        '<div class="pread" id="pread" aria-live="polite">Press and hold</div><div class="pbar"><i id="pbar"></i></div>' +
        '<div class="prow"><button class="cta ghost" id="pagain">Start over</button><button class="cta" id="pdone">Done</button></div></div>';
      const $p = (id) => el.querySelector('#' + id);
      let t0 = 0, raf = 0, over = false, down = false;
      function tick() {
        if (!down || over) return;
        const s = (performance.now() - t0) / 1000;
        $p('pbar').style.width = Math.min(100, s / HOLD * 100) + '%';
        $p('pread').textContent = 'Keep pressing… ' + Math.max(0, Math.ceil(HOLD - s));
        $p('pread').className = 'pread';
        if (s >= HOLD) {
          over = true; down = false; $p('pbtn').classList.remove('press');
          $p('pread').textContent = 'Great! You held it for 10 seconds without letting go.'; $p('pread').className = 'pread ok';
          api.say($p('pread').textContent);
          return;
        }
        raf = requestAnimationFrame(tick);
      }
      function press(e) {
        e.preventDefault(); if (over) return;
        down = true; t0 = performance.now(); $p('pbtn').classList.add('press');
        try { $p('pbtn').setPointerCapture(e.pointerId); } catch (er) { /* older browser */ }
        cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
      }
      function release() {
        if (!down || over) return;
        down = false; cancelAnimationFrame(raf); $p('pbtn').classList.remove('press');
        $p('pbar').style.width = '0%'; $p('pread').textContent = 'You let go! Press again and hold for 10 seconds.'; $p('pread').className = 'pread warn';
      }
      $p('pbtn').addEventListener('pointerdown', press);
      $p('pbtn').addEventListener('pointerup', release); $p('pbtn').addEventListener('pointercancel', release); $p('pbtn').addEventListener('lostpointercapture', release);
      $p('pagain').addEventListener('click', () => { over = false; down = false; cancelAnimationFrame(raf); $p('pbar').style.width = '0%'; $p('pread').textContent = 'Press and hold'; $p('pread').className = 'pread'; });
      $p('pdone').addEventListener('click', () => api.close());
      return () => { cancelAnimationFrame(raf); };
    }
  };

  OrderGame.run({
    id: 'bleed', slug: 'press-on', title: 'Press On', chips: ['Act Fast', 'First aid', 'Bleeding'],
    levels: {
      easy: { label: 'Easy', sub: 'Help, find, press', right: ['alert', 'find', 'compress'] },
      hard: { label: 'Difficult', sub: 'The full steps', right: ['safe', 'call', 'gloves', 'find', 'cover', 'press', 'keep'] }
    },
    startLevel: 'easy', embedLevel: 'hard',
    story(level) {
      const n = level === 'easy' ? 3 : 7;
      return {
        h2: 'First aid class: stop the bleeding!',
        p: 'It\'s first aid class. Nurse Lea points to the practice arm on the mat. It has a pretend cut and a light that blinks while it "bleeds". "Pretend this arm is bleeding a lot. What do you do?"',
        mission: 'Put the ' + n + ' steps in the right order. Then tap Simulate to see what happens.',
        bubble: 'It\'s first aid class, with a <b>practice arm</b> and a pretend cut. Nurse Lea says, "Pretend this arm is bleeding a lot." <b>Put the ' + n + ' steps in order</b>, then tap Simulate to see what happens.'
      };
    },
    STEPS, ICON, flatIntro: 'arm',
    simulate, pal: { lively: Object.assign({}, AR.PAL.lively, PAL.lively), minimal: Object.assign({}, AR.PAL.minimal, PAL.minimal) },
    poses: POSES, cams: CAMS, build, onRecolor, reset, idle, frame, status, flat, practice,
    preCaption: () => '<b>Pretend this arm is bleeding a lot.</b> What do you do?',
    verdict(worst, demo, level) {
      if (worst === 'ok') return demo
        ? { title: 'The right way', text: level === 'easy' ? 'Get help, find the cut, then cover it and press hard until help comes.' : 'Look around, call 911, put on gloves, find the cut, cover it, press hard, and keep pressing.' }
        : { title: 'Great job!', text: 'You did every step at the right time.' };
      if (worst === 'warn') return { title: 'Almost there', text: 'You helped, but some steps could be better. See what happened below.' };
      return { title: 'Not safe yet', text: 'Some steps were not safe, or help wasn\'t coming. See what happened, then try again.' };
    },
    note(level, worst, demo) {
      if (level === 'easy') {
        return '<b>Even little kids can help.</b> If someone is bleeding a lot, call 911 or get a grown-up right away. Bigger kids can learn to press hard on the cut.' +
          (worst === 'ok' && !demo ? '<br><br><b>Ready for more?</b> Try Difficult: it adds looking around first, gloves, and covering the cut before you press.' : '');
      }
      return '<b>Two ways are right.</b> You can put on gloves before or after you call 911. Either way, call fast, press hard, and never lift the first gauze: if it soaks through, add more on top.';
    },
    about: '<p>The steps follow bleeding control as first aid classes teach it: make sure it\'s safe, call 911, put on gloves if there are some, find where the bleeding is coming from, cover it with gauze or a clean cloth, press hard with both hands, and keep pressing until help takes over. If it soaks through, add more on top and don\'t lift the first one.</p>' +
      '<p>Easy has three steps: get help, find the cut, and cover it and press hard. Difficult has all seven.</p>' +
      '<p>It all happens in a first aid class, on a practice arm, so no one is hurt. For very bad bleeding on an arm or leg, trained grown-ups may also use a tourniquet. Learn first aid from a trained teacher.</p><p class="note">Part of the BAYANIHanda Game Library, under Act Fast.</p>'
  });
})();
