'use strict';
/* Heart in Order (Act Fast): the steps of hands-only CPR, practiced in a first aid class on Manny, a practice
   manikin. No one is hurt and no one collapses: Nurse Lea asks the class to pretend Manny fell down.
   Easy: check, call, push (the Check, Call, Compress of Kids Save Lives, for younger players).
   Difficult: look around first (water near a plugged-in fan), tap and shout, call 911 and send Mika for the AED,
   check breathing, push hard and fast, use the AED, and keep going until help takes over. Calling before or after
   checking breathing are both accepted, since first aid courses teach both.
   The engine around this is games/shared/core.js; the room is games/shared/aidroom.js; the 3D helpers are
   games/shared/kit3d.js. */
(function () {
  const { PI, clamp, lerp, sstep } = Kit3D;
  const AR = window.AidRoom;
  const RATE = 110 / 60; // pushes every second (100 to 120 a minute)

  /* ---------------- the steps ---------------- */
  const svg = (s) => '<svg viewBox="0 0 64 64" aria-hidden="true"><rect class="tile" x="2" y="2" width="60" height="60" rx="14"/>' + s + '</svg>';
  const LYING = '<path class="thin" d="M6 55 H58"/><circle class="hd" cx="14" cy="47" r="6"/><rect class="fa" x="21" y="43" width="31" height="9" rx="4.5"/>';
  const CHEST = '<path class="thin" d="M6 55 H58"/><rect class="fa" x="10" y="42" width="44" height="11" rx="5.5"/>';
  const HANDS = '<path class="ln" d="M27 11 L 30 33 M37 11 L 34 33"/><rect class="hd" x="24" y="32" width="16" height="9" rx="4"/>';
  const EYE = (x, y) => '<path class="ln" d="M' + (x - 11) + ' ' + y + ' C ' + (x - 6) + ' ' + (y - 7) + ', ' + (x + 6) + ' ' + (y - 7) + ', ' + (x + 11) + ' ' + y + ' C ' + (x + 6) + ' ' + (y + 7) + ', ' + (x - 6) + ' ' + (y + 7) + ', ' + (x - 11) + ' ' + y + ' Z"/><circle class="acf" cx="' + x + '" cy="' + y + '" r="3.6"/>';
  const PHONE = '<rect class="fb" x="20" y="8" width="24" height="46" rx="5"/><rect class="wh" x="24" y="14" width="16" height="28" rx="2"/><text class="tx" x="32" y="32.5" text-anchor="middle" style="fill:#16303f">911</text><circle class="wh" cx="32" cy="48" r="2.4"/><path class="ac" d="M50 20 C 54 24, 54 32, 50 36 M55 15 C 61 22, 61 34, 55 41"/>';
  const ICON = {
    safe: svg('<path class="ln" d="M9 25 C 18 12, 46 12, 55 25 C 46 38, 18 38, 9 25 Z"/><circle class="acf" cx="32" cy="25" r="6.5"/><path class="fb" d="M17 41 C 13 47, 12 53, 17 55 C 22 57, 25 51, 17 41 Z"/><rect class="fa" x="34" y="46" width="15" height="9" rx="2"/><path class="ln" d="M38 46 V40 M45 46 V40"/><path class="thin" d="M49 50.5 H58"/>'),
    tap: svg(LYING + '<path class="ln" d="M29 20 L 25 38"/><path class="ac" d="M17 32 L13 29 M17 38 H12"/><rect class="fb" x="36" y="7" width="20" height="17" rx="6"/><path class="wt" d="M42.5 12.5 C 43 9.5, 49.5 9.5, 49.5 13 C 49.5 15.5, 46 15.5, 46 18"/><circle class="wh" cx="46" cy="21" r="1.6"/>'),
    breath: svg(LYING + EYE(35, 20) + '<path class="ac" d="M30 37 V 33 M36 39 V 33 M42 37 V 33"/>'),
    call: svg(PHONE),
    help: svg(PHONE),
    push: svg(CHEST + HANDS + '<path class="ac" d="M50 12 V 30 M50 30 L45 25 M50 30 L55 25"/>'),
    aed: svg('<rect class="fg" x="10" y="12" width="44" height="40" rx="7"/><path class="wh" d="M32 45 C 18 36, 19 24, 26 23 C 29 22.5, 31 25, 32 26.5 C 33 25, 35 22.5, 38 23 C 45 24, 46 36, 32 45 Z"/><path class="fg" d="M33.5 27 L 28.5 35 H 32 L 30 41 L 36.5 32.5 H 33 L 35.5 27 Z"/>'),
    keep: svg(CHEST + HANDS + '<path class="ac" d="M50 9 A 8 8 0 1 1 43 22"/><path class="ac" d="M50 9 L 45 7 M50 9 L 48 14"/>'),
    check: svg(LYING + '<path class="ln" d="M25 21 L 22 38"/><path class="ac" d="M14 32 L10 29 M14 38 H9"/>' + EYE(45, 21)),
    manny: svg('<rect class="fb" x="6" y="46" width="52" height="8" rx="3"/><circle class="hd" cx="15" cy="40" r="6"/><rect class="fa" x="22" y="35" width="32" height="10" rx="5"/><circle class="acf" cx="32" cy="39" r="2.2"/><rect class="fg" x="40" y="9" width="16" height="16" rx="3"/><path class="wh" d="M46 12 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z"/>')
  };
  const STEPS = {
    // Easy (Check, Call, Compress)
    check: { t: 'Check', d: 'Tap his shoulders and shout, "Are you okay?" Is he breathing normally?', short: 'Check',
      why: 'If he answers or breathes normally, he doesn\'t need CPR. If not, he needs help fast.' },
    help: { t: 'Call 911', d: 'Call 911 on speaker, or shout for a grown-up to call.', short: 'Call',
      why: 'Calling early gets help on the way, and the phone on speaker keeps your hands free.' },
    // both levels
    push: { t: 'Push hard and fast', d: 'Hands in the middle of the chest. Push hard and fast, 100 to 120 times a minute.', short: 'Push',
      why: 'Pushing on the chest keeps blood moving to the brain until help comes.' },
    // Difficult
    safe: { t: 'Look around first', d: 'Make sure it\'s safe to go near. Look for danger like water, wires or traffic.', short: 'Safe',
      why: 'You can only help if you stay safe too. Look around before you go near.' },
    tap: { t: 'Tap and shout', d: 'Tap his shoulders and shout, "Are you okay?"', short: 'Tap',
      why: 'If he wakes up or answers, he doesn\'t need CPR.' },
    call: { t: 'Call 911', d: 'Call 911 on speaker, and send someone to get the AED.', short: 'Call',
      why: 'Help starts coming sooner, and someone brings the AED while you push. (Checking breathing first is also fine.)' },
    breath: { t: 'Check breathing', d: 'Look at his chest for up to 10 seconds. Is he breathing normally?', short: 'Breath',
      why: 'No breathing, or only gasping, means he needs CPR now.' },
    aed: { t: 'Use the AED', d: 'Turn it on and do what it says. Stand clear when it tells you to.', short: 'AED',
      why: 'An AED can get the heart beating right again. Use it as soon as it comes.' },
    keep: { t: 'Keep going', d: 'Don\'t stop pushing until help takes over or he wakes up.', short: 'Keep',
      why: 'Every push counts. When you stop, the blood stops moving.' }
  };

  /* ---------------- where things are ---------------- */
  // the mat and Manny (lying along x, head to the left); you kneel on the far side, facing the camera
  const MANNY = { x: 0, z: 0.35 }, CHEST_X = -0.45;
  const SPOT = {
    ready: { x: 0.25, z: -1.05, f: -0.35 }, half: { x: -0.05, z: -0.78, f: -0.6 },
    chest: { x: CHEST_X, z: 0.13, f: 0 }, head: { x: -0.74, z: 0.12, f: 0 }, look: { x: -0.93, z: 0.12, f: 0 },
    turn: { x: -1.5, z: -1.45, f: PI }, socket: { x: -1.75, z: -2.06, f: PI }, aside: { x: -1.05, z: -0.72, f: 0.55 }
  };
  const KNEELING = { kneel: 1, compress: 1, tap: 1, look: 1, kphone: 1, clear: 1, kreach: 1 };
  const AED_DROP = { x: -1.42, z: 0.02, ry: 0.3 }, PHONE_FLOOR = { x: -0.05, z: -0.06 };
  const NURSE_TAKE = { x: CHEST_X + 0.02, z: -0.03, f: 0 };
  const FAN = { x: 0.55, z: -0.5, f: -1.05 }, PUDDLE = { x: -0.35, z: -0.5 };

  /* ---------------- the simulation rules ----------------
     State: what you have done so far (tapped, breathed, called, started pushing, used the AED, kept going), whether
     the fan is still plugged in (Difficult), and where you are. Each step returns a grade (ok | warn | bad), a
     message, and the keyframes the 3D scene plays. st.clock is the time on the timeline when the step starts. */
  function rules(level, S) {
    const { mv, hold, cam, ev, key, done } = S;
    const now = (s, st) => st.clock + s.t;
    const say = (s, who, text, dur, t) => ev(s, 'say', { who, text, dur: dur || 1.6, t: t === undefined ? s.t : t });
    const kneeling = (st) => !!KNEELING[st.kid.pose];
    function phoneDown(s, st) { if (st.phone === 'hand') { ev(s, 'phone', { at: 'floor' }); st.phone = 'floor'; } }
    function standUp(s, st) {
      if (st.kid.pose !== 'stand') mv(s, st, 0.4, 'stand');
      st.pumping = false;
    }
    function walkTo(s, st, spot) {
      const p = SPOT[spot], d = Math.hypot(p.x - st.kid.x, p.z - st.kid.z);
      if (d > 0.02) mv(s, st, clamp(d / 1.6, 0.3, 1.6), 'stand', { x: p.x, z: p.z, f: Math.atan2(p.x - st.kid.x, p.z - st.kid.z) }, { walk: true });
    }
    // to Manny's side, kneeling at a spot (chest, head or look), in a pose
    function toManny(s, st, spot, pose, flags) {
      const p = SPOT[spot];
      if (st.where !== 'manny') {
        standUp(s, st);
        if (st.where === 'socket') walkTo(s, st, 'turn');
        const d = Math.hypot(p.x - st.kid.x, p.z - 0.32 - st.kid.z);
        mv(s, st, clamp(d / 1.6, 0.3, 1.6), 'stand', { x: p.x, z: p.z - 0.32, f: Math.atan2(p.x - st.kid.x, p.z - 0.32 - st.kid.z) }, { walk: true });
        mv(s, st, 0.35, 'stand', { x: p.x, z: p.z - 0.3, f: 0 });
        mv(s, st, 0.45, 'kneel', spot);
        st.where = 'manny';
      } else if (st.kid.x !== p.x || st.kid.z !== p.z || !kneeling(st)) mv(s, st, 0.4, 'kneel', spot);
      phoneDown(s, st);
      mv(s, st, 0.35, pose, spot, { flags });
    }
    function pump(s, st, dt) {
      // pushing to the beat (the scene adds the up and down)
      if (!st.pumping) { ev(s, 'pushStart'); st.pumping = true; }
      hold(s, st, dt);
    }
    // Nurse Lea stops the practice and unplugs the fan, when someone goes near before looking around
    function nurseFix(s, st) {
      const t0 = s.t, N = st.nurse;
      say(s, 'nurse', 'Stop! Look around first.', 1.8, t0 + 0.2);
      key(s, 'nurse', Object.assign({}, N), t0);
      key(s, 'nurse', { pose: 'stand', x: 0.9, z: -1.35, f: -2.6, walk: true }, t0 + 0.65);
      key(s, 'nurse', { pose: 'stand', x: -1.5, z: -1.42, f: -1.6, walk: true }, t0 + 2.0);
      key(s, 'nurse', { pose: 'stand', x: -1.75, z: -2.02, f: PI, walk: true }, t0 + 2.4);
      key(s, 'nurse', { pose: 'reach', x: -1.75, z: -2.02, f: PI }, t0 + 2.7);
      ev(s, 'unplug', { t: t0 + 2.85, by: 'nurse' });
      say(s, 'nurse', 'Water and a plugged-in fan! Now it\'s safe.', 2.0, t0 + 2.9);
      key(s, 'nurse', { pose: 'stand', x: -1.75, z: -2.02, f: PI }, t0 + 3.1);
      key(s, 'nurse', { pose: 'stand', x: -1.5, z: -1.42, f: 0.3, walk: true }, t0 + 3.55);
      key(s, 'nurse', { pose: 'stand', x: 0.9, z: -1.35, f: 1.6, walk: true }, t0 + 4.9);
      key(s, 'nurse', Object.assign({ walk: true }, N), t0 + 5.55);
      st.hazard = false; st.unplugged = true; st.nurseFree = st.clock + t0 + 5.6;
    }
    // the first hands-on step: if no one looked around, Nurse Lea stops it; then the camera goes to the step's view
    function start(s, st, view) {
      if (!st.hazard) { cam(s, view); return; }
      s.grade = 'bad';
      s.msg = 'You went near without looking around. There was water next to a plugged-in fan! Nurse Lea stopped the practice to unplug it.';
      cam(s, 'wide');
      standUp(s, st);
      if (st.where !== 'manny') walkTo(s, st, 'half');
      nurseFix(s, st);
      hold(s, st, 3.0);
      cam(s, view);
    }
    // Mika gets the AED from its cabinet and puts it down beside Manny's head
    function fetchAed(s, st, t0) {
      const k = (dt, x) => key(s, 'mika', x, t0 + dt);
      const M = AR.SEATS.mates[0];
      k(0, { pose: 'sit', x: M.x, z: M.z, f: M.f });
      k(0.45, { pose: 'stand', x: M.x, z: -1.5, f: -2.3 });
      k(0.9, { pose: 'stand', x: -1.95, z: -1.5, f: -2.1, run: true });
      k(1.25, { pose: 'stand', x: -2.45, z: -2.0, f: PI, run: true });
      k(1.55, { pose: 'reach', x: -2.45, z: -2.0, f: PI });
      ev(s, 'aedTake', { t: t0 + 1.6 });
      k(1.8, { pose: 'carry', x: -2.45, z: -2.0, f: 0.5 });
      k(2.25, { pose: 'carry', x: -1.95, z: -1.45, f: 0.45, walk: true });
      k(3.0, { pose: 'carry', x: -1.52, z: -0.3, f: 0.3, walk: true });
      k(3.35, { pose: 'crouch', x: -1.52, z: -0.3, f: 0.3 });
      ev(s, 'aedDrop', { t: t0 + 3.4 });
      say(s, 'mika', 'Here\'s the AED!', 1.4, t0 + 3.3);
      k(3.75, { pose: 'stand', x: -1.52, z: -0.3, f: 0.3 });
      k(4.3, { pose: 'stand', x: -1.95, z: -0.75, f: 0.75, walk: true });
      return t0 + 3.4;
    }
    // help arrives: Nurse Lea plays the ambulance crew and takes over the pushing
    function helpArrives(s, st) {
      const wait = (st.nurseFree || 0) - (st.clock + s.t);
      if (wait > 0) { if (st.pumping) pump(s, st, wait); else hold(s, st, wait); }
      const t0 = s.t, N = st.nurse;
      ev(s, 'help'); say(s, 'nurse', 'Help is here! I\'ll take over.', 2.0, t0);
      key(s, 'nurse', Object.assign({}, N), t0);
      key(s, 'nurse', { pose: 'stand', x: 0.55, z: -0.62, f: -1.9, walk: true }, t0 + 0.75);
      key(s, 'nurse', { pose: 'stand', x: NURSE_TAKE.x + 0.3, z: NURSE_TAKE.z - 0.35, f: -1.2, walk: true }, t0 + 1.25);
      // you stand up and step aside
      if (st.where === 'manny') { mv(s, st, 0.4, 'stand'); phoneDown(s, st); }
      st.pumping = false;
      walkTo(s, st, 'aside'); mv(s, st, 0.3, 'stand', 'aside');
      st.where = 'floor';
      const tk = Math.max(t0 + 1.35, s.t);
      key(s, 'nurse', { pose: 'kneel', x: NURSE_TAKE.x, z: NURSE_TAKE.z, f: 0 }, tk + 0.4);
      key(s, 'nurse', { pose: 'acompress', x: NURSE_TAKE.x, z: NURSE_TAKE.z, f: 0, pump: true }, tk + 0.75);
      ev(s, 'nursePush', { t: tk + 0.75 });
      if (s.t < tk + 1.5) hold(s, st, tk + 1.5 - s.t);
      st.helpHere = true; st.nurse = { pose: 'acompress', x: NURSE_TAKE.x, z: NURSE_TAKE.z, f: 0, pump: true };
    }

    const B = {
      safe(st) {
        const s = S.seg(st, 'safe');
        cam(s, 'socket');
        if (!st.hazard) {
          s.grade = 'warn'; s.msg = 'Nurse Lea had already unplugged the fan. Look around first, before you go near.';
          if (kneeling(st)) hold(s, st, 0.2); else { standUp(s, st); mv(s, st, 0.45, 'lookL'); mv(s, st, 0.55, 'lookR'); mv(s, st, 0.3, 'stand'); }
          ev(s, 'lookAround', { t: 0 }); hold(s, st, 1.0);
          return done(s);
        }
        if (st.anyStep) { s.grade = 'warn'; s.msg = 'Look around first, before anything else, so you know it\'s safe to help.'; }
        else s.msg = 'You looked around first and saw water near a plugged-in fan. You unplugged it, so it\'s safe to go near.';
        standUp(s, st);
        mv(s, st, 0.45, 'lookL'); ev(s, 'spot'); mv(s, st, 0.55, 'lookR'); mv(s, st, 0.3, 'stand');
        say(s, 'kid', 'Water near a plugged-in fan!', 1.5);
        walkTo(s, st, 'turn'); walkTo(s, st, 'socket'); mv(s, st, 0.15, 'stand', 'socket');
        mv(s, st, 0.3, 'reach', 'socket'); ev(s, 'unplug', { by: 'kid' }); say(s, 'kid', 'Unplugged!', 1.2);
        mv(s, st, 0.35, 'stand', 'socket'); hold(s, st, 0.4);
        st.where = 'socket'; st.hazard = false; st.unplugged = true;
        return done(s);
      },
      tap(st) {
        const s = S.seg(st, 'tap');
        start(s, st, 'head');
        if (s.grade !== 'ok') { /* stopped */ }
        else if (st.pumping) { s.grade = 'warn'; s.msg = 'You stopped pushing to tap him. Tap and shout before you start pushing.'; }
        else if (st.started) { s.grade = 'warn'; s.msg = 'You had already started pushing. Tap and shout before you start.'; }
        else s.msg = 'You tapped his shoulders and shouted, "Are you okay?" No answer, so he needs help.';
        toManny(s, st, 'head', 'tap', { tapping: true });
        say(s, 'kid', 'Are you okay?', 1.3); hold(s, st, 1.1);
        mv(s, st, 0.3, 'kneel', 'head'); say(s, 'manny', 'No answer', 1.2); hold(s, st, 0.6);
        st.tapped = true;
        return done(s);
      },
      breath(st) {
        const s = S.seg(st, 'breath');
        start(s, st, 'head');
        if (s.grade !== 'ok') { /* stopped */ }
        else if (st.pumping) { s.grade = 'warn'; s.msg = 'You stopped pushing to check his breathing. Check before you start pushing.'; }
        else if (st.started) { s.grade = 'warn'; s.msg = 'You had already started pushing. Check his breathing before you start.'; }
        else if (!st.tapped) { s.grade = 'warn'; s.msg = 'Tap and shout first. If he answers, he doesn\'t need CPR.'; }
        else s.msg = 'You looked at his chest for up to 10 seconds. No normal breathing, so he needs CPR.';
        toManny(s, st, 'look', 'look');
        ev(s, 'count10'); hold(s, st, 1.7);
        mv(s, st, 0.35, 'kneel', 'look'); say(s, 'kid', 'He\'s not breathing!', 1.4); hold(s, st, 0.5);
        st.breathed = true;
        return done(s);
      },
      // Easy: tap and shout, and look for breathing, in one step
      check(st) {
        const s = S.seg(st, 'check');
        cam(s, 'head');
        if (st.pumping) { s.grade = 'warn'; s.msg = 'You stopped pushing to check. Check first, then push and don\'t stop.'; }
        else if (st.started) { s.grade = 'warn'; s.msg = 'You had already started pushing. Check first, then push.'; }
        else s.msg = 'You tapped his shoulders and shouted, "Are you okay?" No answer, and he isn\'t breathing normally.';
        toManny(s, st, 'head', 'tap', { tapping: true });
        say(s, 'kid', 'Are you okay?', 1.1); hold(s, st, 0.9);
        mv(s, st, 0.4, 'look', 'look'); ev(s, 'count10'); hold(s, st, 1.0);
        mv(s, st, 0.3, 'kneel', 'look'); say(s, 'kid', 'He\'s not breathing!', 1.2); hold(s, st, 0.35);
        st.tapped = true; st.breathed = true;
        return done(s);
      },
      call(st) { return callStep(st, 'call'); },
      help(st) { return callStep(st, 'help'); },
      push(st) {
        const s = S.seg(st, 'push');
        start(s, st, 'mat');
        if (s.grade !== 'ok') { /* stopped */ }
        else if (level === 'easy' ? !st.tapped : (!st.tapped || !st.breathed)) {
          s.grade = 'warn';
          s.msg = level === 'easy' ? 'Check first. If he answers, he doesn\'t need you to push.' : 'You started pushing before checking. Tap and shout, and check his breathing, before you push.';
        } else s.msg = level === 'easy' ? 'You pushed hard and fast in the middle of his chest.' : 'You pushed hard and fast in the middle of his chest, 100 to 120 times a minute.';
        toManny(s, st, 'chest', 'compress', { pump: true });
        pump(s, st, 2.2);
        st.started = true;
        return done(s);
      },
      aed(st) {
        const s = S.seg(st, 'aed');
        start(s, st, 'aed');
        if (!st.called) {
          if (s.grade === 'ok') { s.grade = 'warn'; s.msg = 'There was no AED here yet. No one had been sent to get it. Call 911 and send someone for the AED first.'; }
          if (st.pumping) pump(s, st, 0.4); else if (st.where !== 'manny') { standUp(s, st); }
          say(s, 'kid', 'Where\'s the AED?', 1.5); hold(s, st, 1.5);
          return done(s);
        }
        if (st.helpHere) {
          s.grade = 'warn'; s.msg = 'Help had already taken over. Use the AED as soon as it comes, before help arrives.';
          hold(s, st, 1.4); return done(s);
        }
        if (s.grade === 'ok') {
          if (!st.started) { s.grade = 'warn'; s.msg = 'You waited for the AED before pushing. Start pushing right away, and use the AED as soon as it comes.'; }
          else s.msg = 'You turned on the AED and did what it said: pads on, stand clear, press the button. Then you went back to pushing.';
        }
        // wait for the AED to get here (pushing, if you had started)
        if (st.where !== 'manny') toManny(s, st, 'chest', 'kneel');
        const wait = st.aedAt - now(s, st);
        if (wait > 0) { if (st.started) { mv(s, st, 0.3, 'compress', 'chest', { flags: { pump: true } }); pump(s, st, wait); } else { say(s, 'kid', 'Hurry, Mika!', 1.3); hold(s, st, wait); } }
        st.pumping = false;
        mv(s, st, 0.35, 'kreach', 'chest'); ev(s, 'aedOpen'); say(s, 'aed', 'Put the pads on his chest.', 1.5);
        hold(s, st, 0.6); mv(s, st, 0.35, 'tap', 'chest'); ev(s, 'pads'); hold(s, st, 0.4);
        mv(s, st, 0.35, 'clear', 'chest'); say(s, 'aed', 'Checking. Don\'t touch him!', 1.5); hold(s, st, 1.3);
        say(s, 'aed', 'Press the orange button!', 1.2); mv(s, st, 0.35, 'kreach', 'chest'); ev(s, 'shock'); hold(s, st, 0.35);
        say(s, 'aed', 'Start pushing.', 1.3); mv(s, st, 0.35, 'compress', 'chest', { flags: { pump: true } }); pump(s, st, 1.0);
        st.aedUsed = true; st.started = true;
        return done(s);
      },
      keep(st) {
        const s = S.seg(st, 'keep');
        start(s, st, 'mat');
        if (!st.called) {
          s.grade = 'bad';
          if (s.msg) s.msg += ' And no one had called 911, so help wasn\'t coming.';
          else s.msg = 'You kept pushing, but no one had called 911, so help wasn\'t coming. Call 911 right after you check.';
          if (!st.pumping) toManny(s, st, 'chest', 'compress', { pump: true });
          pump(s, st, 1.6); say(s, 'kid', 'I\'m so tired… Is help coming?', 1.8); pump(s, st, 1.4);
          st.started = true; st.kept = true;
          return done(s);
        }
        if (s.grade === 'ok') {
          if (!st.started) { s.grade = 'warn'; s.msg = 'Keep going means keep pushing. Start pushing first, then keep going.'; }
          else s.msg = 'You kept pushing until help came and took over. Great job!';
        }
        if (!st.pumping) toManny(s, st, 'chest', 'compress', { pump: true });
        pump(s, st, 1.5);
        cam(s, 'wide');
        helpArrives(s, st);
        st.started = true; st.kept = true;
        return done(s);
      },
      // Easy: after the three steps, keep pushing until help comes
      autoKeep(st) {
        const s = S.seg(st, null); s.auto = true; cam(s, 'mat');
        s.cap = '<b>Keep going.</b> You kept pushing until help came.';
        if (!st.pumping) toManny(s, st, 'chest', 'compress', { pump: true });
        pump(s, st, 1.0);
        cam(s, 'wide');
        helpArrives(s, st);
        return done(s, 0.3);
      },
      helpArrives
    };
    function callStep(st, id) {
      const s = S.seg(st, id);
      cam(s, 'wide');
      if (st.kept) { s.grade = 'warn'; s.msg = 'You called very late. Call 911 right after you check, so help can come.'; }
      else if (st.pumping) { s.grade = 'warn'; s.msg = 'You stopped pushing to make the call. Call before you start, or put the phone on speaker beside you.'; }
      else if (st.started) { s.grade = 'warn'; s.msg = 'You called late. Call 911 before you start pushing, so help comes sooner.'; }
      else if (!st.tapped) { s.grade = 'warn'; s.msg = level === 'easy' ? 'Check first: tap and shout. Then call 911.' : 'Check first: tap and shout. Then you can tell 911 what\'s wrong.'; }
      else s.msg = level === 'easy' ? 'You called 911 on speaker. Help is on the way.' : 'You called 911 on speaker and sent Mika to get the AED. Help is on the way.';
      st.pumping = false;
      if (st.where === 'manny') mv(s, st, 0.4, 'kphone');
      else { standUp(s, st); mv(s, st, 0.35, 'phone'); }
      ev(s, 'phone', { at: 'hand' }); st.phone = 'hand';
      if (level === 'hard') { say(s, 'kid', 'Mika, get the AED!', 1.4, s.t + 0.1); st.aedAt = st.clock + fetchAed(s, st, s.t + 0.3); }
      ev(s, 'called');
      say(s, 'phone', '911: Help is on the way!', 1.8, s.t + (level === 'hard' ? 1.3 : 0.3));
      hold(s, st, level === 'hard' ? 2.4 : 1.6);
      if (st.where === 'manny') phoneDown(s, st);
      st.called = true;
      return done(s);
    }
    return B;
  }

  function simulate(ord, level) {
    level = level === 'easy' ? 'easy' : 'hard';
    const S = Kit3D.seq(SPOT), B = rules(level, S);
    const st = { level, hazard: level === 'hard', where: 'floor', kid: Object.assign({ pose: 'stand' }, SPOT.ready), clock: 0,
      nurse: { pose: 'stand', x: AR.NURSE.x, z: AR.NURSE.z, f: AR.NURSE.f }, anyStep: false, tapped: false, breathed: false, called: false,
      started: false, pumping: false, aedUsed: false, kept: false, helpHere: false, unplugged: false, aedAt: 1e9, phone: null };
    const segs = [];
    const add = (s) => { segs.push(s); st.clock += s.dur; };
    const pre = S.seg(st, null); pre.pre = true; S.cam(pre, 'wide', 0);
    S.ev(pre, 'say', { who: 'nurse', text: 'Pretend Manny fell down. What do you do?', dur: 1.7, t: 0.05 });
    S.hold(pre, st, 1.5); S.done(pre, 0);
    add(pre);
    for (const id of ord) {
      const s = B[id](st);
      st.anyStep = true;
      add(s);
    }
    if (level === 'easy') add(B.autoKeep(st));
    const end = S.seg(st, null); end.end = true;
    if (st.called && !st.helpHere) { S.cam(end, 'wide'); B.helpArrives(end, st); }
    S.hold(end, st, 1.0); S.done(end, 0.2);
    add(end);
    const J = S.join(segs);
    const abs = (k) => Object.assign({}, k, { t: k.T });
    const callE = J.evs.find((e) => e.e === 'called'), helpE = J.evs.find((e) => e.e === 'help');
    return Object.assign(J, {
      level, nurseKeys: (J.tracks.nurse || []).map(abs), mikaKeys: (J.tracks.mika || []).map(abs),
      callT: callE ? callE.T : 1e9, helpT: helpE ? helpE.T : 1e9
    });
  }

  /* ---------------- 3D scene ---------------- */
  const PAL = {
    lively: { mat: 0x3d8fd6, matEdge: 0x2f6fae, plastic: 0xf0c8a0, plastic2: 0xf7d9b8, lightOff: 0x8a8f94, phone: 0x2b2f36, screen: 0x9fd8f7,
      pad: 0x8fb1cc, fan: 0xf4f4f4, fanBlade: 0x9fd3ef, water: 0x8fcdf0, bottle: 0x7cc4ef, ink2: 0x5a4636 },
    minimal: { mat: 0x8f969c, matEdge: 0x737a80, plastic: 0xe6d3c0, plastic2: 0xefe1d2, lightOff: 0x8a8f94, phone: 0x2b2f36, screen: 0xd4e2e8,
      pad: 0x9aa7b0, fan: 0xf4f4f4, fanBlade: 0xc9d3d8, water: 0xb9d6e6, bottle: 0xb9d6e6, ink2: 0x5c574f }
  };
  const POSES = Object.assign({}, AR.POSES, {
    // an adult pushing: leans further, since the arms are longer
    acompress: { hy: 0.4, tp: 0.72, nk: 0.5, sh: [[-0.78, -0.34], [-0.78, 0.34]], el: [0, 0], hp: [-0.2, -0.2], kn: [1.75, 1.75] }
  });
  const CAMS = {
    intro: { p: [2.0, 2.3, 3.6], t: [-0.45, 0.45, -0.45], pp: [2.3, 3.4, 5.3], pt: [-0.5, 0.45, -0.5] },
    wide: { p: [2.1, 2.5, 3.9], t: [-0.55, 0.45, -0.45], pp: [2.3, 3.5, 5.5], pt: [-0.6, 0.4, -0.5] },
    mat: { p: [0.9, 2.1, 2.2], t: [-0.5, 0.25, 0.15], pp: [1.05, 2.9, 3.1], pt: [-0.55, 0.25, 0.1] },
    head: { p: [0.55, 2.0, 2.15], t: [-0.85, 0.25, 0.2], pp: [0.7, 2.8, 3.0], pt: [-0.85, 0.25, 0.15] },
    socket: { p: [1.4, 2.65, 2.2], t: [-1.1, 0.45, -1.3], pp: [1.55, 3.5, 3.2], pt: [-1.0, 0.4, -1.25] },
    aed: { p: [0.5, 2.3, 2.1], t: [-1.0, 0.25, 0.1], pp: [0.65, 3.1, 3.0], pt: [-1.0, 0.25, 0.05] }
  };
  const G = {};
  function drawPoster(g, w, h) {
    g.fillStyle = '#fff7e8'; AR.rr(g, 4, 4, w - 8, h - 8, 22); g.fill();
    g.strokeStyle = '#f2760c'; g.lineWidth = 8; g.stroke();
    g.fillStyle = '#e94b4b'; AR.heart(g, w / 2, h * 0.3, w * 0.42); g.fill();
    g.fillStyle = '#16303f'; g.textAlign = 'center';
    g.font = '900 54px sans-serif'; g.fillText('CPR', w / 2, h * 0.58);
    g.font = '800 34px sans-serif'; g.fillText('PUSH HARD', w / 2, h * 0.71); g.fillText('PUSH FAST', w / 2, h * 0.8);
    g.font = '700 25px sans-serif'; g.fillStyle = '#4f6572'; g.fillText('100 to 120 a minute', w / 2, h * 0.9);
  }
  function tube(K, pts, r, role, par) {
    const THREE = window.THREE, curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 6, false), K.mat(role)); (par || K.scene).add(m); return m;
  }
  function build(K) {
    const THREE = window.THREE, sc = K.scene;
    AR.build(K, G, { poster: drawPoster });
    // the mat, and Manny lying on it (head to the left)
    K.box(2.3, 0.04, 1.2, 'mat', -0.35, 0.02, MANNY.z);
    K.box(2.3, 0.006, 0.04, 'matEdge', -0.35, 0.042, MANNY.z - 0.58); K.box(2.3, 0.006, 0.04, 'matEdge', -0.35, 0.042, MANNY.z + 0.58);
    const man = new THREE.Group(); man.position.set(MANNY.x, 0.04, MANNY.z); sc.add(man); G.manny = man;
    const body = K.cyl(0.23, 0.23, 1.02, 'plastic', -0.37, 0.105, 0, man, 20); body.rotation.z = PI / 2; body.scale.set(0.46, 1, 1);
    const sh = K.sph(0.23, 'plastic', -0.87, 0.105, 0, man); sh.scale.set(0.35, 0.46, 1);
    const hip = K.sph(0.23, 'plastic', 0.14, 0.105, 0, man); hip.scale.set(0.3, 0.46, 1);
    const neck = K.cyl(0.055, 0.06, 0.14, 'plastic', -0.98, 0.1, 0, man); neck.rotation.z = PI / 2;
    K.sph(0.13, 'plastic', -1.12, 0.13, 0, man);
    for (const z of [-0.045, 0.045]) K.box(0.012, 0.008, 0.04, 'ink2', -1.15, 0.255, z, man);
    K.sph(0.02, 'plastic2', -1.09, 0.262, 0, man); K.box(0.012, 0.008, 0.05, 'ink2', -1.04, 0.245, 0, man);
    const chest = new THREE.Group(); chest.position.set(CHEST_X, 0.2, 0); man.add(chest); G.chest = chest;
    K.box(0.4, 0.035, 0.32, 'plastic2', 0.03, 0, 0, chest);
    G.lightMat = new THREE.MeshBasicMaterial({ color: K.color('lightOff') });
    const light = new THREE.Mesh(new THREE.CircleGeometry(0.035, 18), G.lightMat); light.rotation.x = -PI / 2; light.position.set(0, 0.019, 0); chest.add(light);
    // the AED pads and their wires (shown when the pads go on)
    G.pads = new THREE.Group(); sc.add(G.pads);
    const P1 = [MANNY.x - 0.66, 0.25, MANNY.z - 0.1], P2 = [MANNY.x - 0.27, 0.24, MANNY.z + 0.17];
    for (const [x, y, z] of [P1, P2]) K.box(0.13, 0.008, 0.1, 'pad', x, y, z, G.pads);
    tube(K, [[AED_DROP.x + 0.12, 0.08, AED_DROP.z + 0.05], [-1.0, 0.1, 0.1], [P1[0], P1[1] + 0.01, P1[2]]], 0.006, 'ink', G.pads);
    tube(K, [[AED_DROP.x + 0.12, 0.08, AED_DROP.z + 0.07], [-0.7, 0.09, 0.62], [P2[0], P2[1] + 0.01, P2[2]]], 0.006, 'ink', G.pads);
    // the phone (in your hand, then on the mat on speaker)
    const ph = new THREE.Group(); sc.add(ph); G.phone = ph;
    K.box(0.075, 0.014, 0.14, 'phone', 0, 0, 0, ph); K.box(0.064, 0.003, 0.12, 'screen', 0, 0.008, 0, ph);
    // Difficult: a pretend hazard, water spilled near a plugged-in fan
    const hz = new THREE.Group(); sc.add(hz); G.hazard = hz;
    const pud = new THREE.Mesh(new THREE.CircleGeometry(0.34, 28), new THREE.MeshLambertMaterial({ color: K.color('water'), transparent: true, opacity: 0.72 }));
    pud.rotation.x = -PI / 2; pud.scale.set(1.3, 0.85, 1); pud.position.set(PUDDLE.x, 0.004, PUDDLE.z); hz.add(pud); G.puddleMat = pud.material;
    const bot = K.cyl(0.04, 0.04, 0.24, 'bottle', -0.02, 0.04, -0.86, hz); bot.rotation.set(0, 0, PI / 2 - 0.2); bot.rotation.y = 0.6;
    const fan = new THREE.Group(); fan.position.set(FAN.x, 0, FAN.z); fan.rotation.y = FAN.f; hz.add(fan);
    K.cyl(0.17, 0.19, 0.04, 'fan', 0, 0.02, 0, fan); K.cyl(0.02, 0.02, 0.8, 'fan', 0, 0.42, 0, fan);
    const head = new THREE.Group(); head.position.set(0, 0.86, 0.02); fan.add(head);
    const mot = K.cyl(0.07, 0.07, 0.14, 'fan', 0, 0, -0.05, head); mot.rotation.x = PI / 2;
    const cage = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 6, 28), K.mat('fan')); cage.position.z = 0.06; head.add(cage);
    G.blades = new THREE.Group(); G.blades.position.z = 0.06; head.add(G.blades);
    for (let i = 0; i < 3; i++) { const b = K.box(0.06, 0.17, 0.008, 'fanBlade', 0, 0.09, 0, G.blades); const g2 = new THREE.Group(); g2.rotation.z = i * 2 * PI / 3; g2.add(b); G.blades.add(g2); }
    tube(K, [[AR.SOCKET.x, AR.SOCKET.y, AR.BW + 0.09], [AR.SOCKET.x, 0.02, AR.BW + 0.15], [-1.45, 0.012, -1.55], [-0.8, 0.012, -0.85], [PUDDLE.x, 0.012, PUDDLE.z],
      [0.15, 0.012, -0.42], [FAN.x - 0.12, 0.02, FAN.z + 0.05]], 0.012, 'cord', hz);
    return true;
  }
  function onRecolor(K) { if (G.lightMat) G.lightMat.color.setHex(K.color('lightOff')); if (G.puddleMat) G.puddleMat.color.setHex(K.color('water')); }
  function reset(K, level) {
    const hard = level !== 'easy';
    G.hazard.visible = hard; G.plug.visible = hard;
    G.plug.position.copy(G.plug.userData.home); G.plug.rotation.set(0, 0, 0);
    G.aed.position.set(G.aedHome.x, G.aedHome.y, G.aedHome.z); G.aed.rotation.set(0, 0, 0); G.aedLid.rotation.x = 0;
    G.aed.visible = true; G.pads.visible = false; G.phone.visible = false;
    G.chest.position.y = 0.2; G.lightMat.color.setHex(K.color('lightOff'));
  }

  // the intro: the class on the bench, Nurse Lea beside Manny
  function idle(K, T, level) {
    reset(K, level);
    AR.seatClass(K, G, T, 'point');
    K.applyPose(G.kid, K.POSE.stand, null, 0, T); K.place(G.kid, SPOT.ready.x, SPOT.ready.z, SPOT.ready.f); K.show(G.kid, true);
    if (G.blades) G.blades.rotation.z = T * 14;
    const c = K.camView('intro'), a = Math.sin(T * 0.25) * 0.4;
    K.camera.position.set(c.p.x + a, c.p.y, c.p.z - a * 0.3); K.camera.lookAt(c.t);
    K.showTag('you', 'You', '', SPOT.ready.x, 1.6, SPOT.ready.z);
    K.showTag('manny', 'Manny, the practice manikin', 'name', MANNY.x - 0.9, 0.62, MANNY.z);
    K.showTag('nname', 'Nurse Lea', 'name', AR.NURSE.x, 2.3, AR.NURSE.z);
    for (const t of ['ksay', 'nsay', 'msay', 'psay', 'asay', 'count', 'hz']) K.hideTag(t);
  }

  const ev1 = (ctx, e, T) => ctx.hits(e, T).pop();
  function pumpAt(T, start) { const ph = (T - start) * RATE; return { k: 0.5 - 0.5 * Math.cos(ph * 2 * PI), n: Math.floor(ph) + 1 }; }

  // the first aid room at time T of the simulation
  function frame(K, T, SIM, ctx) {
    const seg = ctx.segAt(T), tau = T - seg.T0, hard = SIM.level !== 'easy';
    // the fan spins until someone unplugs it
    const un = ev1(ctx, 'unplug', T);
    if (hard) {
      if (!un) G.blades.rotation.z = T * 14;
      else { const d = Math.min(T - un.T, 1.2); G.blades.rotation.z = un.T * 14 + 14 * d - 14 * d * d / 2.4; }
      const h = G.plug.userData.home;
      if (un) { const k = sstep((T - un.T) / 0.35); G.plug.position.set(h.x + 0.05 * k, lerp(h.y, 0.03, sstep((T - un.T - 0.25) / 0.4)), h.z + 0.18 * k); G.plug.rotation.x = 1.2 * k; }
      else { G.plug.position.copy(h); G.plug.rotation.set(0, 0, 0); }
    }
    // you
    const r = K.evalTrack(seg.kid, tau);
    K.applyPose(G.kid, r.p, r.gait, r.gk, T);
    const pumping = r.key && r.key.pump && r.prev && r.prev.pump;
    const ps = ev1(ctx, 'pushStart', T);
    let chestK = 0, count = 0, countAt = null;
    if (pumping && ps) {
      const P = pumpAt(T, ps.T); chestK = P.k; count = P.n;
      G.kid.hips.position.y -= 0.03 * P.k * G.kid.s; G.kid.torso.rotation.x += 0.07 * P.k;
      countAt = { x: CHEST_X, y: 0.95, z: MANNY.z - 0.05 };
    }
    if (r.key && r.key.tapping && r.prev && r.prev.tapping) for (let i = 0; i < 2; i++) G.kid.arms[i].sh.rotation.x += 0.09 * Math.sin(T * 17 + i * 1.6);
    const look = ev1(ctx, 'lookAround', T);
    if (look && T - look.T < 1.3 && seg.step === 'safe') G.kid.neck.rotation.y = 0.8 * Math.sin((T - look.T) * 5);
    K.place(G.kid, r.x, r.z, r.f);
    // the class on the bench, and Mika getting the AED
    AR.seatClass(K, G, T, 'stand');
    const mk = SIM.mikaKeys.length ? AR.follow(K, G.mates[0], SIM.mikaKeys, T, { pose: 'sit', x: AR.SEATS.mates[0].x, z: AR.SEATS.mates[0].z, f: 0 }) : null;
    void mk;
    // Nurse Lea: stands by, stops the practice if needed, and takes over when help comes
    const nr = AR.follow(K, G.nurse, SIM.nurseKeys, T, { pose: 'stand', x: AR.NURSE.x, z: AR.NURSE.z, f: AR.NURSE.f });
    const np = ev1(ctx, 'nursePush', T);
    if (np && nr && nr.key && nr.key.pump && (!nr.prev || nr.prev.pump || T >= nr.key.t)) {
      const P = pumpAt(T, np.T); chestK = P.k; count = P.n;
      G.nurse.hips.position.y -= 0.03 * P.k * G.nurse.s; G.nurse.torso.rotation.x += 0.06 * P.k;
      countAt = { x: CHEST_X, y: 1.05, z: MANNY.z - 0.1 };
    }
    // Manny's chest goes down with each push, and its light shows a good push
    G.chest.position.y = 0.2 - 0.03 * chestK;
    G.lightMat.color.setHex(chestK > 0.55 ? 0x22d36b : K.color('lightOff'));
    // the AED: in its cabinet, carried by Mika, then beside Manny; the lid opens, the pads go on
    const take = ev1(ctx, 'aedTake', T), drop = ev1(ctx, 'aedDrop', T);
    if (drop) { G.aed.position.set(AED_DROP.x, 0, AED_DROP.z); G.aed.rotation.set(0, AED_DROP.ry, 0); }
    else if (take) {
      const a = AR.handPos(G.mates[0], 0), b = AR.handPos(G.mates[0], 1);
      G.aed.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 - 0.08, (a.z + b.z) / 2); G.aed.rotation.set(0, G.mates[0].root.rotation.y, 0);
    } else { G.aed.position.set(G.aedHome.x, G.aedHome.y, G.aedHome.z); G.aed.rotation.set(0, 0, 0); }
    const op = ev1(ctx, 'aedOpen', T); G.aedLid.rotation.x = op ? -1.9 * sstep((T - op.T) / 0.4) : 0;
    G.pads.visible = !!ev1(ctx, 'pads', T);
    // the phone
    const pe = ev1(ctx, 'phone', T);
    if (!pe) G.phone.visible = false;
    else if (pe.at === 'hand') { const h = AR.handPos(G.kid, 0); G.phone.visible = true; G.phone.position.set(h.x, h.y + 0.03, h.z); G.phone.rotation.set(-0.9, G.kid.root.rotation.y, 0); }
    else { G.phone.visible = true; G.phone.position.set(PHONE_FLOOR.x, 0.05, PHONE_FLOOR.z); G.phone.rotation.set(0, 0.4, 0); }

    // the camera
    K.camFollow(T, SIM.camKeys, 0);

    // labels
    const head = (F, extra) => { const p = new window.THREE.Vector3(); F.neck.getWorldPosition(p); return [p.x, p.y + 0.3 * F.s + (extra || 0), p.z]; };
    const [yx, yy, yz] = head(G.kid, 0.12);
    K.showTag('you', 'You', '', yx, yy, yz);
    K.hideTag('manny'); K.hideTag('nname');
    const says = SIM.evs.filter((e) => e.e === 'say' && T >= e.T && T < e.T + e.dur);
    const shown = {};
    for (const s of says) {
      if (s.who === 'kid') { const h = head(G.kid, 0.42); K.showTag('ksay', s.text, 'say', h[0], h[1], h[2]); shown.ksay = 1; }
      if (s.who === 'nurse') { const h = head(G.nurse, 0.2); K.showTag('nsay', s.text, 'say', h[0], h[1], h[2]); shown.nsay = 1; }
      if (s.who === 'mika') { const h = head(G.mates[0], 0.2); K.showTag('msay', s.text, 'say', h[0], h[1], h[2]); shown.msay = 1; }
      if (s.who === 'manny') { K.showTag('msay', s.text, 'say', MANNY.x - 1.12, 0.55, MANNY.z); shown.msay = 1; }
      if (s.who === 'phone') { const p = G.phone.position; K.showTag('psay', s.text, 'dev', p.x, p.y + 0.3, p.z); shown.psay = 1; }
      if (s.who === 'aed') { const p = G.aed.position; K.showTag('asay', 'AED: ' + s.text, 'dev', p.x, p.y + 0.45, p.z); shown.asay = 1; }
    }
    for (const t of ['ksay', 'nsay', 'msay', 'psay', 'asay']) if (!shown[t]) K.hideTag(t);
    const c10 = ev1(ctx, 'count10', T);
    if (count && countAt) K.showTag('count', String(count), 'count', countAt.x, countAt.y, countAt.z);
    else if (c10 && T - c10.T < 1.7 && seg.step === 'breath') K.showTag('count', String(1 + Math.floor((T - c10.T) * 5.4)), 'count', MANNY.x - 0.7, 0.75, MANNY.z);
    else K.hideTag('count');
    const sp = ev1(ctx, 'spot', T);
    if (hard && sp && T - sp.T < 1.6) K.showTag('hz', 'Danger!', 'stuck', PUDDLE.x, 0.35, PUDDLE.z); else K.hideTag('hz');
  }

  function status(T, SIM) {
    if (T >= SIM.helpT) return { cls: 'calm', text: 'Help is here' };
    if (T >= SIM.callT) return { cls: 'warn', text: 'Help is on the way' };
    return { cls: 'info', text: 'Pretend: Manny fell down' };
  }
  // with no 3D: the drawing for the moment, and what people say
  function flat(T, SIM, ctx, seg) {
    const icon = seg.pre ? 'manny' : seg.end || seg.auto ? 'keep' : seg.step;
    const says = SIM.evs.filter((e) => e.e === 'say' && T >= e.T && T < e.T + e.dur);
    const s = says[says.length - 1];
    const who = s ? { kid: 'You', nurse: 'Nurse Lea', mika: 'Mika', phone: 'Phone', aed: 'AED', manny: 'Manny' }[s.who] : '';
    return { icon, say: s ? (s.who === 'manny' ? '(' + s.text + ')' : who + ': ' + s.text) : '' };
  }

  /* ---------------- practice: push to the beat ---------------- */
  const practice = {
    icon: ICON.push, title: 'Practice the beat', button: 'Try it',
    text: 'Tap the big button like you are pushing on a chest: steady and fast, about 2 times every second.',
    run(el, api) {
      el.innerHTML = '<div class="pbox"><h3>Push to the beat</h3><p>Tap the button 30 times, about 2 taps every second (100 to 120 a minute). The ring blinks the beat if you want help.</p>' +
        '<div class="pring" id="pring"><button class="pbig" id="pbtn" aria-label="Push">PUSH</button></div>' +
        '<div class="pread" id="pread" aria-live="polite">Tap to start</div><div class="pbar"><i id="pbar"></i></div>' +
        '<div class="prow"><button class="cta ghost" id="pbeat" aria-pressed="true">Beat helper: on</button><button class="cta ghost" id="pagain">Start over</button></div>' +
        '<button class="cta" id="pdone">Done</button></div>';
      const $p = (id) => el.querySelector('#' + id);
      let taps = [], helper = true, timer = null, ac = null, over = false;
      function click() {
        if (!api.sound) return;
        try {
          ac = ac || new (window.AudioContext || window.webkitAudioContext)();
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
          o.frequency.value = 880; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
          o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.07);
        } catch (e) { /* no sound here */ }
      }
      function beat() { const b = $p('pring'); b.classList.remove('tick'); void b.offsetWidth; b.classList.add('tick'); click(); }
      function setHelper(on) {
        helper = on; clearInterval(timer); timer = on && !over && !api.rm ? setInterval(beat, 60000 / 110) : null;
        $p('pbeat').textContent = 'Beat helper: ' + (on ? 'on' : 'off'); $p('pbeat').setAttribute('aria-pressed', String(on));
      }
      const rate = (a, b) => 60000 / ((taps[b] - taps[a]) / (b - a));
      function restart() { taps = []; over = false; $p('pbar').style.width = '0%'; $p('pread').textContent = 'Tap to start'; $p('pread').className = 'pread'; setHelper(helper); }
      $p('pbtn').addEventListener('pointerdown', (e) => {
        e.preventDefault(); if (over) return;
        const b = $p('pbtn'); b.classList.remove('beat'); void b.offsetWidth; b.classList.add('beat');
        taps.push(performance.now());
        const n = taps.length, R = $p('pread');
        $p('pbar').style.width = Math.min(100, n / 30 * 100) + '%';
        if (n < 5) { R.textContent = n + ' …'; R.className = 'pread'; }
        else {
          const r = Math.round(rate(Math.max(0, n - 7), n - 1));
          R.textContent = n + ': ' + (r < 100 ? 'faster!' : r > 120 ? 'a little slower' : 'just right!') + ' (' + r + ' a minute)';
          R.className = 'pread ' + (r >= 100 && r <= 120 ? 'ok' : 'warn');
        }
        if (n >= 30) {
          over = true; setHelper(helper);
          const r = Math.round(rate(0, n - 1)), good = r >= 100 && r <= 120;
          R.textContent = good ? 'Great! 30 pushes at about ' + r + ' a minute. That\'s the CPR beat.' : 'Done! About ' + r + ' a minute. Try ' + (r < 100 ? 'a little faster' : 'a little slower') + ': 100 to 120 a minute.';
          R.className = 'pread ' + (good ? 'ok' : 'warn');
          api.say(R.textContent);
        }
      });
      $p('pbeat').addEventListener('click', () => setHelper(!helper));
      $p('pagain').addEventListener('click', restart);
      $p('pdone').addEventListener('click', () => api.close());
      setHelper(true);
      return () => { clearInterval(timer); try { if (ac) ac.close(); } catch (e) { /* already closed */ } };
    }
  };

  OrderGame.run({
    id: 'cpr', slug: 'heart-in-order', title: 'Heart in Order', chips: ['Act Fast', 'First aid', 'CPR'],
    levels: {
      easy: { label: 'Easy', sub: 'Check, call, push', right: ['check', 'help', 'push'] },
      hard: { label: 'Difficult', sub: 'The full CPR steps', right: ['safe', 'tap', 'call', 'breath', 'push', 'aed', 'keep'] }
    },
    startLevel: 'easy', embedLevel: 'hard',
    story(level) {
      const p = 'It\'s first aid class. Nurse Lea points to Manny, the practice manikin on the mat. "Pretend Manny fell down and isn\'t moving. What do you do?"';
      const n = level === 'easy' ? 3 : 7;
      return {
        h2: 'First aid class: help Manny!', p,
        mission: 'Put the ' + n + ' steps in the right order. Then tap Simulate to see what happens.',
        bubble: 'It\'s first aid class, and Manny is a <b>practice manikin</b>. Nurse Lea says, "Pretend Manny fell down and isn\'t moving." <b>Put the ' + n + ' steps in order</b>, then tap Simulate to see what happens.'
      };
    },
    STEPS, ICON, flatIntro: 'manny',
    simulate, pal: { lively: Object.assign({}, AR.PAL.lively, PAL.lively), minimal: Object.assign({}, AR.PAL.minimal, PAL.minimal) },
    poses: POSES, cams: CAMS, build, onRecolor, reset, idle, frame, status, flat, practice,
    preCaption: () => '<b>Pretend Manny fell down.</b> What do you do?',
    verdict(worst, demo, level) {
      if (worst === 'ok') return demo
        ? { title: 'The right way', text: level === 'easy' ? 'Check, call 911, then push hard and fast until help comes.' : 'Look around, tap and shout, call 911, check breathing, push, use the AED, and keep going.' }
        : { title: 'Great job!', text: 'You did every step at the right time.' };
      if (worst === 'warn') return { title: 'Almost there', text: 'You helped, but some steps could be better. See what happened below.' };
      return { title: 'Not safe yet', text: 'Some steps were not safe. See what happened, then try again.' };
    },
    note(level, worst, demo) {
      if (level === 'easy') {
        return '<b>Kids can help too.</b> Even young kids can check and call 911 or get a grown-up. Pushing hard enough takes strong arms, and kids around 10 to 12 years old can learn to do it well.' +
          (worst === 'ok' && !demo ? '<br><br><b>Ready for more?</b> Try Difficult: it adds looking around first, checking breathing, and the AED.' : '');
      }
      return '<b>Two ways are right.</b> Some first aid classes check breathing before calling 911, and some call first. Both are fine, as long as you call fast and start pushing.';
    },
    about: '<p>The steps follow hands-only CPR as first aid classes teach it: make sure it\'s safe, check, call 911, push hard and fast in the middle of the chest (100 to 120 times a minute), use an AED as soon as it comes, and keep going until help takes over.</p>' +
      '<p>Easy has three steps: check, call and push, the "Check, Call, Compress" of Kids Save Lives. Difficult has all seven.</p>' +
      '<p>It all happens in a first aid class, on Manny, a practice manikin. Learn real CPR from a trained teacher.</p><p class="note">Part of the BAYANIHanda Game Library, under Act Fast.</p>'
  });
})();
