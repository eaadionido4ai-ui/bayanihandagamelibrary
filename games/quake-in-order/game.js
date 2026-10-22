'use strict';
/* Quake in Order (Act Fast): the steps of Duck, Cover, and Hold in a classroom when the ground shakes.
   Easy: duck, cover and hold. Tonton sits nearest the door, so he opens it, and the game says that is the job of
   whoever sits nearest the door. Difficult: the full drill. Your seat is next to the door, so you open it first,
   then duck, cover, hold, wait until the shaking stops, walk out with your class and line up at the open field.
   The engine around this (screens, ordering, results) is games/shared/core.js; the 3D helpers are games/shared/kit3d.js. */
(function () {
  const { PI, clamp, lerp, sstep, angLerp } = Kit3D;

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

  /* ---------------- the classroom: whose desk is where ---------------- */
  const DESKS = { door: [-2.3, 1.25], front: [-0.6, 1.25], backL: [-2.3, -0.65], backR: [-0.6, -0.65] };
  // Easy: you sit in the front row and Tonton (the second classmate) sits at the desk by the door. Difficult: the desk by the door is yours.
  const ROOM = { easy: { kid: 'front', mates: ['backL', 'door', 'backR'] }, hard: { kid: 'door', mates: ['front', 'backL', 'backR'] } };
  const OPENER = 'Tonton', OPENER_I = 1;
  function spots(level) {
    const d = DESKS[ROOM[level].kid], ox = d[0] + 2.3, oz = d[1] - 1.25;
    const at = (x, z, f) => ({ x: x + ox, z: z + oz, f });
    return {
      seat: at(-2.3, 1.86, PI), stand: at(-2.3, 2.12, PI), duckDesk: at(-3.02, 1.5, PI / 2), under: at(-2.46, 1.25, PI / 2), beside: at(-3.08, 1.22, PI / 2),
      doorIn: { x: -3.08, z: 2.2, f: -PI / 2 }, doorLow: { x: -2.98, z: 2.32, f: PI / 2 }, out: { x: -4.4, z: 2.2, f: -PI / 2 },
      line: { x: -8.3, z: 2.55, f: PI }, alone: { x: -6.7, z: 4.3, f: -PI / 2 }
    };
  }
  // Easy: Tonton, at the desk by the door, gets up, opens the door, then ducks, covers and holds under his desk
  const OPEN_TRACK = [
    { t: 0, pose: 'sit', x: -2.3, z: 1.86, f: PI }, { t: 0.5, pose: 'stand', x: -2.3, z: 2.12, f: PI },
    { t: 1.15, pose: 'stand', x: -3.08, z: 2.2, f: -PI / 2, walk: true }, { t: 1.45, pose: 'reach', x: -3.08, z: 2.2, f: -PI / 2 },
    { t: 2.0, pose: 'reach', x: -3.08, z: 2.2, f: -PI / 2 }, { t: 2.25, pose: 'stand', x: -3.08, z: 2.2, f: -PI / 2 },
    { t: 2.75, pose: 'duck', x: -3.02, z: 1.5, f: PI / 2 }, { t: 3.5, pose: 'cover', x: -2.46, z: 1.25, f: PI / 2, crawl: true },
    { t: 3.9, pose: 'hold', x: -2.46, z: 1.25, f: PI / 2 }
  ];
  const OPEN_DOOR = [{ T: 0, a: 0 }, { T: 1.5, a: 0 }, { T: 2.05, a: -1.38 }];

  /* ---------------- the simulation rules ----------------
     State: shaking, door (closed | open | jammed), where (desk | door | out | line | alone), the player's pose and spot.
     Each step returns a grade (ok | warn | bad), a message, and the keyframes the 3D scene plays. */
  const MSG = {
    jam: 'The shaking bent the door frame, so the door got stuck. Your class was trapped until your teacher forced it open. If you sit next to the door, open it as soon as the shaking starts.'
  };
  const inside = (st) => st.where === 'desk' || st.where === 'door';
  const covered = (st) => st.pose === 'cover' || st.pose === 'hold';

  function rules(level, S, SPOT) {
    const DCAM = level === 'easy' ? 'easy' : 'desk';
    const seg = (st, step) => { const s = S.seg(st, step); s.shaking0 = st.shaking; return s; };
    const { mv, hold, cam, ev, done } = S;
    function getUp(s, st) {
      // from wherever the player is inside, get back on their feet
      if (st.pose === 'cover' || st.pose === 'hold') { mv(s, st, 0.55, 'duck', 'duckDesk', { crawl: true }); mv(s, st, 0.4, 'stand'); }
      else if (st.pose === 'holdOut') { mv(s, st, 0.4, 'stand', 'duckDesk'); }
      else if (st.pose === 'duck') mv(s, st, 0.4, 'stand');
      else if (st.pose === 'sit') mv(s, st, 0.45, 'stand', 'stand');
    }
    function toDoor(s, st, run, wobble) {
      getUp(s, st);
      if (st.where !== 'door' || st.kid.x !== SPOT.doorIn.x) mv(s, st, run ? 0.6 : 0.85, 'stand', 'doorIn', { walk: !run, run: !!run, wobble: !!wobble });
      st.where = 'door';
    }
    function openDoor(s, st) {
      mv(s, st, 0.3, 'reach', 'doorIn');
      S.key(s, 'door', { a: 0 }); s.t += 0.55; S.key(s, 'door', { a: -1.38 }); s.kid.push(Object.assign({ t: s.t }, st.kid));
      st.door = 'open';
      mv(s, st, 0.25, 'stand');
    }
    function forceJammed(s, st) {
      // the player pulls, the door won't move; the teacher comes and forces it open
      mv(s, st, 0.3, 'pull', 'doorIn');
      ev(s, 'jamOn');
      const t0 = s.t; hold(s, st, 2.6);
      const T0 = st.teacher, door = { x: -2.98, z: 2.86, f: -PI / 2 + 0.25 };
      S.key(s, 'teacher', Object.assign({}, T0), t0);
      S.key(s, 'teacher', Object.assign({ walk: true }, { pose: 'stand', x: door.x, z: door.z, f: door.f }), t0 + 1.7);
      S.key(s, 'teacher', { pose: 'pull', x: door.x, z: door.z, f: door.f }, t0 + 2.0);
      ev(s, 'say', { who: 'teacher', text: 'It\'s stuck! Let me help.', dur: 1.8, t: t0 + 0.9 });
      ev(s, 'jamOff');
      S.key(s, 'door', { a: 0 }); s.t += 0.6; S.key(s, 'door', { a: -1.38 }); s.kid.push(Object.assign({ t: s.t }, st.kid));
      S.key(s, 'teacher', { pose: 'stand', x: door.x, z: door.z, f: door.f });
      st.teacher = { pose: 'stand', x: door.x, z: door.z, f: door.f };
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
    return {
      door(st) {
        const s = seg(st, 'door');
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
        const s = seg(st, 'duck');
        if (!inside(st)) {
          cam(s, 'out');
          if (st.shaking) { s.grade = 'warn'; s.msg = 'You were outside while it shook. Out in the open, stay low and away from buildings until it stops.'; }
          else { s.grade = 'warn'; s.msg = 'The shaking had already stopped, so ducking out here didn\'t help.'; }
          mv(s, st, 0.6, 'duck'); return done(s);
        }
        cam(s, st.where === 'door' ? 'door' : DCAM);
        if (covered(st)) { s.grade = 'ok'; s.msg = 'You were already down low, under your desk.'; hold(s, st, 1.0); return done(s); }
        if (st.shaking) s.msg = 'You dropped down low, so the shaking can\'t knock you over.';
        else { s.grade = 'warn'; s.msg = 'The shaking had already stopped. Duck the moment it starts.'; }
        mv(s, st, 0.65, 'duck', st.where === 'door' ? 'doorLow' : 'duckDesk');
        return done(s);
      },
      cover(st) {
        const s = seg(st, 'cover');
        if (!inside(st)) {
          cam(s, 'out'); s.grade = 'warn';
          s.msg = st.shaking ? 'There\'s no desk out here. Out in the open, stay low and away from buildings until it stops.' : 'The shaking had already stopped, and there\'s no desk out here.';
          mv(s, st, 0.6, 'duck'); return done(s);
        }
        cam(s, DCAM);
        if (covered(st)) { s.grade = 'ok'; s.msg = 'You were already under your desk.'; hold(s, st, 1.0); return done(s); }
        if (!st.shaking) { s.grade = 'warn'; s.msg = 'The shaking had already stopped, so hiding now doesn\'t help. Take cover while it shakes.'; }
        else if (st.pose === 'duck' || st.pose === 'holdOut') s.msg = 'You crawled under your sturdy desk and covered your head and neck.';
        else { s.grade = 'warn'; s.msg = 'Drop down first, then crawl under, so you don\'t fall on the way.'; }
        if (st.pose !== 'duck') mv(s, st, 0.45, 'duck', st.where === 'door' ? 'doorLow' : 'duckDesk');
        mv(s, st, 0.95, 'cover', 'under', { crawl: true });
        st.where = 'desk';
        return done(s);
      },
      hold(st) {
        const s = seg(st, 'hold');
        if (!inside(st)) { cam(s, 'out'); s.grade = 'warn'; s.msg = st.shaking ? 'There\'s nothing to hold out here. Out in the open, stay low until it stops.' : 'The shaking had already stopped.'; hold(s, st, 1.2); return done(s); }
        cam(s, DCAM);
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
        const s = seg(st, 'wait');
        cam(s, inside(st) ? (st.where === 'door' ? 'door' : DCAM) : 'out');
        if (!inside(st)) { s.grade = 'warn'; s.msg = 'You were outside while it shook. Out in the open, stay low and away from buildings until it stops.'; if (st.pose !== 'duck') mv(s, st, 0.5, 'duck'); }
        else if (st.pose === 'hold') s.msg = 'You stayed under your desk, holding on, until the shaking stopped.';
        else if (st.pose === 'cover') { s.grade = 'warn'; s.msg = 'You stayed under, but you didn\'t hold on, so your desk slid away from you. Hold on to a leg.'; ev(s, 'slide', { dx: 0.32, t: 0.9 }); }
        else { s.grade = 'bad'; s.msg = 'You waited out in the open. Things can fall on you while it shakes. Duck, cover and hold first.'; if (!st.pictureFell) { ev(s, 'picture', { t: 0.8 }); st.pictureFell = true; } }
        hold(s, st, 1.9);
        s.fadeAt = s.t; hold(s, st, 1.0);
        st.shaking = false; s.stopAt = s.t;
        if (st.door === 'closed') { st.door = 'jammed'; s.jammed = true; }
        if (!inside(st) && !st.classOut) { ev(s, 'classOut', { t: s.t + 0.3 }); st.classOut = true; }
        return done(s, 0.6);
      },
      walk(st) {
        const s = seg(st, 'walk');
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
        const s = seg(st, 'field');
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
      },
      seg
    };
  }

  function simulate(ord, level) {
    level = level === 'easy' ? 'easy' : 'hard';
    const SPOT = spots(level), S = Kit3D.seq(SPOT), B = rules(level, S, SPOT);
    const st = { shaking: true, door: level === 'easy' ? 'open' : 'closed', where: 'desk', kid: Object.assign({ pose: 'sit' }, SPOT.seat),
      teacher: { pose: 'stand', x: 1.6, z: -0.7, f: 0.4 }, classOut: false, pictureFell: false };
    Object.defineProperty(st, 'pose', { get() { return st.kid.pose; } });
    const pre = B.seg(st, null); pre.pre = true; pre.dur = 1.1; S.cam(pre, level === 'easy' ? 'easy' : 'wide', 0);
    if (level === 'easy') S.ev(pre, 'opener', { t: 1.0, dur: 1.7 });
    const segs = [pre];
    for (const id of ord) segs.push(B[id](st));
    if (level === 'easy') {
      // no Wait card in Easy: the shaking goes on a little, then stops
      const w = B.seg(st, null); w.auto = true; S.cam(w, 'easy');
      if (st.pose === 'hold') w.cap = '<b>Wait.</b> You held on under your desk until the shaking stopped.';
      else if (st.pose === 'cover') { w.cap = '<b>Wait.</b> You stayed under, but you didn\'t hold on, so your desk slid away from you.'; S.ev(w, 'slide', { dx: 0.32, t: 0.9 }); }
      else w.cap = '<b>Wait.</b> You were not under your desk while things shook.';
      S.hold(w, st, 1.6); w.fadeAt = w.t; S.hold(w, st, 1.0); st.shaking = false; S.done(w, 0.4);
      segs.push(w);
    }
    const end = B.seg(st, null); end.end = true; end.dur = level === 'easy' ? 1.6 : 1.4;
    segs.push(end);
    const J = S.join(segs);
    let tStop = null, jammed = false;
    for (const s of segs) if (s.fadeAt !== undefined) { tStop = s.T0 + s.fadeAt + 1.0; if (s.jammed) jammed = true; }
    const co = J.evs.find((e) => e.e === 'classOut');
    return Object.assign(J, {
      level, tStop: tStop === null ? 1e9 : tStop, classOut: co ? co.T : 1e9, jammed,
      doorKeys: level === 'easy' ? OPEN_DOOR : [{ T: 0, a: 0 }].concat(J.tracks.door || []), teacherKeys: J.tracks.teacher || []
    });
  }

  /* ---------------- 3D scene ---------------- */
  const PAL = {
    lively: { bg: 0xcfe9f5, floor: 0xe6cfa6, floorLine: 0xd2b98d, wall: 0xfff0cc, wallOut: 0xf0d4a0, trim: 0xc98f55, board: 0x2f6b4f, boardFrame: 0xa86d3c,
      glass: 0xa8d8f0, winFrame: 0x8a5a2a, desk: 0xdba664, leg: 0x7d5532, chair: 0x3d8fd6, shelf: 0xa86d3c, book1: 0xe94b4b, book2: 0x3d8fd6, book3: 0xf2c12e,
      lamp: 0xf1d24a, cord: 0x555a5f, door: 0x2f8f86, frame: 0x7d5532, knob: 0xe8c040, path: 0xd9cdb5, grass: 0x8fd16a, grass2: 0x6fb653, pole: 0x9aa0a6, flag: 0xf2760c,
      crack: 0x4a3a2c, pic: 0x7cc0e8, picFrame: 0x8a5a2a, clock: 0xffffff, tree: 0x3f9b55, trunk: 0x7a5230 },
    minimal: { bg: 0xeef0f0, floor: 0xe4e1db, floorLine: 0xd8d4cc, wall: 0xf7f6f3, wallOut: 0xe8e6e1, trim: 0xc9c4ba, board: 0x56625d, boardFrame: 0xb7b0a4,
      glass: 0xd4e2e8, winFrame: 0x9d978d, desk: 0xd2c6b4, leg: 0x8e877c, chair: 0xb9b3a9, shelf: 0xbdb3a3, book1: 0xa5a19a, book2: 0x8f969c, book3: 0xc2bcb1,
      lamp: 0xdedad2, cord: 0x6b6b6b, door: 0xa8a39a, frame: 0x8e877c, knob: 0x6b6b6b, path: 0xdedad2, grass: 0xd3dacb, grass2: 0xc3cbb9, pole: 0x9a968e, flag: 0x1c2226,
      crack: 0x5c574f, pic: 0xc9d3d8, picFrame: 0x8e877c, clock: 0xffffff, tree: 0xaeb8a6, trunk: 0x8e877c }
  };
  const POSES = {
    duck: { hy: 0.27, tp: 1.0, nk: 0.45, sh: [[-2.75, 0.35], [-2.75, -0.35]], el: [-1.75, -1.75], hp: [-0.95, -0.95], kn: [2.45, 2.45] },
    cover: { hy: 0.26, tp: 1.3, nk: 0.35, sh: [[-2.95, 0.42], [-2.95, -0.42]], el: [-1.95, -1.95], hp: [-1.1, -1.1], kn: [2.5, 2.5] },
    hold: { hy: 0.26, tp: 1.3, nk: 0.35, sh: [[-1.5, 0.28], [-2.95, -0.42]], el: [-0.15, -1.95], hp: [-1.1, -1.1], kn: [2.5, 2.5] },
    holdOut: { hy: 0.27, tp: 0.85, nk: 0.25, sh: [[-1.35, 0.22], [-2.75, -0.35]], el: [-0.25, -1.75], hp: [-0.95, -0.95], kn: [2.45, 2.45] },
    pull: { hy: 0.6, tp: -0.2, nk: 0.05, sh: [[-1.3, 0.12], [-1.3, -0.12]], el: [-0.35, -0.35], hp: [-0.28, 0.28], kn: [0.28, 0.08] }
  };
  const CAMS = {
    wide: { p: [1.9, 3.9, 7.2], t: [-1.6, 0.5, 0.75] },
    desk: { p: [1.15, 3.25, 5.05], t: [-2.45, 0.32, 1.4] },
    deskF: { p: [2.85, 3.25, 5.05], t: [-0.75, 0.32, 1.4] },
    easy: { p: [0.9, 3.5, 5.9], t: [-1.95, 0.45, 1.55], pp: [1.9, 3.8, 4.4], pt: [-2.0, 0.45, 1.7] }, // Easy: your desk and the door (Tonton) in one view
    door: { p: [1.55, 3.55, 5.95], t: [-2.75, 0.7, 1.95] },
    out: { p: [-4.3, 2.75, 7.7], t: [-7.25, 0.55, 1.7] },
    intro: { p: [1.6, 3.5, 6.9], t: [-1.65, 0.55, 0.85] }
  };
  const G = {};
  const boardTex = (K) => K.textTex('3 + 4 = 7', 512, 216, K.hex('board'), 'rgba(255,255,255,.92)', 'bold 78px sans-serif');
  function desk(K, x, z) {
    const THREE = window.THREE, g = new THREE.Group(); g.position.set(x, 0, z); K.scene.add(g);
    K.box(1.0, 0.05, 0.6, 'desk', 0, 0.705, 0, g);
    K.box(0.9, 0.12, 0.5, 'desk', 0, 0.6, -0.02, g);
    for (const [lx, lz] of [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]]) K.box(0.05, 0.68, 0.05, 'leg', lx, 0.34, lz, g);
    K.blob(0.55, g).scale.set(1.0, 0.65, 1);
    g.userData.home = g.position.clone();
    return g;
  }
  function chair(K, x, z) {
    const THREE = window.THREE, g = new THREE.Group(); g.position.set(x, 0, z); K.scene.add(g);
    K.box(0.4, 0.04, 0.38, 'chair', 0, 0.39, 0, g);
    for (const [lx, lz] of [[-0.17, -0.16], [0.17, -0.16], [-0.17, 0.16], [0.17, 0.16]]) K.box(0.035, 0.38, 0.035, 'leg', lx, 0.19, lz, g);
    K.box(0.4, 0.34, 0.035, 'chair', 0, 0.62, 0.18, g);
    for (const lx of [-0.17, 0.17]) K.box(0.035, 0.36, 0.035, 'leg', lx, 0.58, 0.18, g);
    return g;
  }
  function setWarp(k) {
    const p = G.doorFrame.userData.pos;
    G.doorFrame.matrix.set(1, 0, 0, p.x, 0, 1, 0, p.y, 0, k, 1, p.z, 0, 0, 0, 1);
    G.doorFrame.matrixWorldNeedsUpdate = true;
  }
  function build(K) {
    const THREE = window.THREE, sc = K.scene;
    // outside: grass, the path to the field, a flag, trees
    K.box(34, 0.06, 26, 'grass', -3, -0.08, 1);
    K.box(4.6, 0.03, 1.15, 'path', -5.9, -0.035, 2.2);
    K.box(1.4, 0.03, 4.6, 'grass2', -8.3, -0.035, 0.75);
    K.cyl(0.045, 0.06, 4.4, 'pole', -9.9, 2.2, -1.8);
    K.box(0.85, 0.5, 0.03, 'flag', -9.45, 4.05, -1.8);
    for (const [x, z, s2] of [[-11.5, 3.6, 1.1], [-12.2, -0.5, 1.3], [-11.0, 6.4, 0.9], [-10.8, -3.6, 1.0]]) {
      K.cyl(0.1 * s2, 0.14 * s2, 1.3 * s2, 'trunk', x, 0.65 * s2, z); K.sph(0.75 * s2, 'tree', x, 1.75 * s2, z); K.sph(0.55 * s2, 'tree', x + 0.4 * s2, 1.5 * s2, z + 0.2);
    }
    // the classroom: floor, back wall, left wall with the doorway
    K.box(7.2, 0.1, 6.1, 'floor', 0, -0.05, -0.02);
    for (let i = -3; i <= 3; i++) K.box(0.02, 0.005, 6.1, 'floorLine', i, 0.001, -0.02);
    K.box(7.2, 3, 0.12, 'wall', 0, 1.5, -3.06);
    K.box(7.2, 0.12, 0.04, 'trim', 0, 0.06, -2.99);
    const LW = -3.56;
    K.box(0.12, 3, 4.75, 'wall', LW, 1.5, -0.625); K.box(0.12, 0.9, 0.9, 'wall', LW, 2.55, 2.2); K.box(0.12, 3, 0.35, 'wall', LW, 1.5, 2.825);
    K.box(0.03, 3, 4.75, 'wallOut', LW - 0.075, 1.5, -0.625); K.box(0.03, 0.9, 0.9, 'wallOut', LW - 0.075, 2.55, 2.2); K.box(0.03, 3, 0.35, 'wallOut', LW - 0.075, 1.5, 2.825);
    K.box(0.04, 0.12, 4.75, 'trim', LW + 0.07, 0.06, -0.625);
    // blackboard with today's sum, a clock, a window
    K.box(2.7, 1.25, 0.05, 'boardFrame', 0.4, 1.6, -2.98);
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.05), new THREE.MeshBasicMaterial({ map: boardTex(K) }));
    bd.position.set(0.4, 1.6, -2.95); sc.add(bd); G.boardMesh = bd;
    const clk = K.cyl(0.22, 0.22, 0.04, 'clock', -1.7, 2.35, -2.97); clk.rotation.x = PI / 2;
    K.box(0.02, 0.15, 0.01, 'cord', -1.7, 2.41, -2.94); K.box(0.11, 0.02, 0.01, 'cord', -1.66, 2.35, -2.94);
    K.box(1.25, 1.15, 0.06, 'winFrame', 2.6, 1.75, -2.98);
    G.glass = K.box(1.05, 0.95, 0.04, 'glass', 2.6, 1.75, -2.95);
    K.box(0.04, 0.95, 0.05, 'winFrame', 2.6, 1.75, -2.93);
    // the bookshelf in the corner, books on top
    K.box(0.62, 1.7, 0.36, 'shelf', -3.15, 0.85, -2.6);
    for (const y of [0.45, 0.9, 1.3]) K.box(0.56, 0.03, 0.32, 'floorLine', -3.15, y, -2.58);
    G.books = [['book1', -3.33], ['book2', -3.16], ['book3', -2.99]].map(([c, x]) => { const b = K.box(0.12, 0.28, 0.22, c, x, 1.85, -2.6); b.userData.home = b.position.clone(); return b; });
    // a framed picture near the door (it can fall)
    const pic = new THREE.Group(); pic.position.set(LW + 0.09, 1.85, 1.0); sc.add(pic);
    K.box(0.04, 0.48, 0.6, 'picFrame', 0, 0, 0, pic); K.box(0.045, 0.38, 0.5, 'pic', 0.004, 0, 0, pic); K.box(0.05, 0.12, 0.5, 'grass', 0.006, -0.13, 0, pic);
    G.pic = pic; pic.userData.home = pic.position.clone();
    // the hanging lamp
    const lamp = new THREE.Group(); lamp.position.set(-1.45, 3.3, 0.3); sc.add(lamp);
    K.cyl(0.012, 0.012, 0.9, 'cord', 0, -0.45, 0, lamp, 6);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.24, 16, 1, true), K.mat('lamp')); shade.material.side = THREE.DoubleSide; shade.position.y = -0.98; lamp.add(shade);
    K.sph(0.07, 'clock', 0, -1.05, 0, lamp);
    G.lamp = lamp;
    // the door: a frame that can warp, a leaf on a hinge that opens outward
    const df = new THREE.Group(); df.matrixAutoUpdate = false; df.userData.pos = new THREE.Vector3(LW, 0, 2.2); sc.add(df);
    K.box(0.17, 2.14, 0.07, 'frame', 0, 1.07, -0.475, df); K.box(0.17, 2.14, 0.07, 'frame', 0, 1.07, 0.475, df); K.box(0.17, 0.08, 1.02, 'frame', 0, 2.14, 0, df);
    const hinge = new THREE.Group(); hinge.position.set(0, 0, -0.44); df.add(hinge);
    K.box(0.05, 2.05, 0.86, 'door', 0, 1.03, 0.43, hinge);
    K.sph(0.035, 'knob', 0.05, 1.0, 0.78, hinge); K.sph(0.035, 'knob', -0.05, 1.0, 0.78, hinge);
    G.doorFrame = df; G.hinge = hinge; setWarp(0);
    const ex = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.22), new THREE.MeshBasicMaterial({ map: K.textTex('EXIT', 256, 90, '#1e9c5a', '#ffffff', 'bold 62px sans-serif') }));
    ex.position.set(LW + 0.07, 2.42, 2.2); ex.rotation.y = PI / 2; sc.add(ex);
    // a crack that shows when the shaking bends the frame
    const crack = new THREE.Group(); crack.position.set(LW + 0.065, 2.2, 2.45); sc.add(crack);
    let cx = 0, cy = 0; for (const [dx, dy] of [[0.12, 0.16], [-0.05, 0.13], [0.1, 0.17], [-0.06, 0.12]]) { const L = Math.hypot(dx, dy); const seg = K.box(0.01, L, 0.022, 'crack', 0, cy + dy / 2, cx + dx / 2, crack); seg.rotation.x = -Math.atan2(dx, dy); cx += dx; cy += dy; }
    crack.visible = false; G.crack = crack;
    // four desks and chairs; whose is whose depends on the level
    G.desks = {};
    for (const k in DESKS) { G.desks[k] = desk(K, DESKS[k][0], DESKS[k][1]); chair(K, DESKS[k][0], DESKS[k][1] + 0.61); }
    const tt = new THREE.Group(); tt.position.set(1.85, 0, -1.55); sc.add(tt);
    K.box(1.3, 0.06, 0.7, 'desk', 0, 0.76, 0, tt); for (const [lx, lz] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) K.box(0.06, 0.74, 0.06, 'leg', lx, 0.37, lz, tt);
    K.blob(0.75, tt).scale.set(1, 0.6, 1);
    // people: you, three classmates, the teacher; the class again at the field
    G.kid = K.figure({ top: 'uniform', bottom: 'pants', skin: 'skin', hair: 'hair', cap: 'cap', s: 1 });
    const mates = [
      { top: 'uniform', bottom: 'skirt', skirt: 'skirt', skin: 'skin2', hair: 'hair', longHair: true },
      { top: 'uniform', bottom: 'pants', skin: 'skin', hair: 'hair' }, // Tonton in Easy
      { top: 'uniform', bottom: 'skirt', skirt: 'skirt', skin: 'skin', hair: 'hair', longHair: true }
    ];
    G.mates = mates.map((o, i) => K.figure(Object.assign({ s: 0.98 - i * 0.02 }, o)));
    G.teacher = K.figure({ top: 'teacher', bottom: 'teacher', skirt: 'teacher', long: true, skin: 'skin2', hair: 'hair', longHair: true, s: 1.32, legs: 'skin2' });
    G.fclass = [];
    [-0.25, 0.3, 0.85, 1.4, 1.95].forEach((z, i) => { const o = mates[i % 3]; const F = K.figure(Object.assign({ s: 0.97 + (i % 2) * 0.03 }, o)); F.spot = { x: -8.3, z, f: PI }; G.fclass.push(F); });
    G.fteacher = K.figure({ top: 'teacher', bottom: 'teacher', skirt: 'teacher', long: true, skin: 'skin2', hair: 'hair', longHair: true, s: 1.32, legs: 'skin2' });
    return true;
  }
  function onRecolor(K) { G.boardMesh.material.map.dispose(); G.boardMesh.material.map = boardTex(K); G.boardMesh.material.needsUpdate = true; }
  function reset() {
    G.hinge.rotation.y = 0; setWarp(0); G.crack.visible = false;
    G.pic.position.copy(G.pic.userData.home); G.pic.rotation.set(0, 0, 0);
    G.books.forEach((b) => { b.position.copy(b.userData.home); b.rotation.set(0, 0, 0); });
    for (const k in G.desks) G.desks[k].position.copy(G.desks[k].userData.home);
  }

  function shakeAt(T, SIM, ctx) {
    const seg = ctx.segAt(T); if (!seg) return 0;
    const tau = T - seg.T0;
    if (seg.pre) return sstep(tau / 0.7);
    if (seg.fadeAt !== undefined) return tau < seg.fadeAt ? 1 : 1 - sstep((tau - seg.fadeAt) / 1.0);
    return seg.shaking0 ? 1 : 0;
  }
  const countLine = (dt) => { const n = Math.min(16, 10 + Math.floor(dt * 6)); return n < 16 ? n + '…' : '…15, 16! Everyone is here.'; };
  const jammedAt = (T, ctx) => ctx.hits('jamOn', T).length > ctx.hits('jamOff', T).length;

  // the intro: the classroom on a calm day, everyone in their seats
  function idle(K, T, level) {
    const room = ROOM[level], kd = DESKS[room.kid];
    const k = G.kid; K.applyPose(k, K.POSE.sit, null, 0, T); K.place(k, kd[0], kd[1] + 0.61, PI);
    G.mates.forEach((F, i) => { const d = DESKS[room.mates[i]]; K.applyPose(F, K.POSE.sit, null, 0, T); K.place(F, d[0], d[1] + 0.61, PI); K.show(F, true); });
    K.applyPose(G.teacher, K.POSE.stand, null, 0, T); K.place(G.teacher, 1.0, -2.15, 0.15); K.show(G.teacher, true);
    G.fclass.forEach((F) => K.show(F, false)); K.show(G.fteacher, false);
    const c = K.camView('intro'), a = Math.sin(T * 0.25) * 0.5;
    K.camera.position.set(c.p.x + a, c.p.y, c.p.z - a * 0.3); K.camera.lookAt(c.t);
    G.lamp.rotation.set(0, 0, 0); reset();
    K.showTag('you', 'You', '', kd[0], 1.55, kd[1] + 0.61);
    if (level === 'easy') K.showTag('opener', OPENER + ': nearest the door', 'say', DESKS.door[0], 1.62, DESKS.door[1] + 0.61);
    else K.hideTag('opener');
    for (const t of ['stuck', 'tsay', 'fsay', 'count']) K.hideTag(t);
  }

  // the classroom at time T of the simulation
  function frame(K, T, SIM, ctx) {
    const level = SIM.level, room = ROOM[level];
    const amp = shakeAt(T, SIM, ctx), seg = ctx.segAt(T), tau = T - seg.T0;
    const tStop = SIM.tStop, out = SIM.classOut;
    // the shaking: the lamp, the books, the window, the frame
    G.lamp.rotation.z = 0.32 * amp * Math.sin(T * 5.3); G.lamp.rotation.x = 0.18 * amp * Math.sin(T * 4.1 + 1);
    G.glass.position.x = 2.6 + 0.008 * amp * Math.sin(T * 41);
    let i = 0;
    for (const k in G.desks) {
      if (k === room.kid) continue;
      const d = G.desks[k]; d.position.x = d.userData.home.x + 0.02 * amp * Math.sin(T * 23 + i); d.position.z = d.userData.home.z + 0.015 * amp * Math.sin(T * 19 + i * 2); i++;
    }
    G.boardMesh.position.x = 0.4 + 0.006 * amp * Math.sin(T * 31);
    const wk = Math.min(1, sstep((T - 0.5) / Math.max(1, (Math.min(tStop, 60) - 0.5))));
    setWarp(0.09 * wk);
    G.crack.visible = wk > 0.55;
    // books fall early in the shaking
    const bt = T - 2.0;
    G.books.forEach((b, j) => {
      const t = bt - j * 0.18, h = b.userData.home;
      if (t <= 0) { b.position.copy(h); b.position.x += 0.01 * amp * Math.sin(T * 30 + j); b.rotation.set(0, 0, 0); return; }
      const k = Math.min(1, t / 0.55);
      b.position.set(h.x + 0.1 * k * (j - 1), lerp(h.y, 0.06, k * k), h.z + 0.55 * k + 0.1 * j * k); b.rotation.set(1.4 * k, 0.3 * j, 1.57 * k * (j % 2 ? 1 : -1));
    });
    // the picture by the door falls when someone is out in the open near it
    const pe = ctx.hits('picture', T)[0];
    if (pe) { const k = Math.min(1, (T - pe.T) / 0.6), h = G.pic.userData.home; G.pic.position.set(h.x + 0.35 * k, lerp(h.y, 0.05, k * k), h.z + 0.15 * k); G.pic.rotation.set(0, 0, -1.45 * k); }
    else { G.pic.position.copy(G.pic.userData.home); G.pic.rotation.set(0, 0, 0.03 * amp * Math.sin(T * 17)); }
    // your desk slides if no one holds it
    let slide = 0; for (const e of ctx.hits('slide', T)) slide = Math.max(slide, e.dx * sstep((T - e.T) / 0.7));
    const myDesk = G.desks[room.kid], mh = myDesk.userData.home; myDesk.position.set(mh.x + slide + 0.02 * amp * Math.sin(T * 21), 0, mh.z + 0.015 * amp * Math.sin(T * 17));

    // the door: opened by keys, rattling when stuck
    let da = ctx.evalKeys(SIM.doorKeys, T, 'a');
    const jamOn = jammedAt(T, ctx);
    if (jamOn) da += 0.025 * Math.sin(T * 38);
    G.hinge.rotation.y = da;

    // you
    const r = K.evalTrack(seg.kid, tau);
    K.applyPose(G.kid, r.p, r.gait, r.gk, T);
    const upright = r.p.hy > 0.5, roll = (amp > 0.05 && upright) ? 0.07 * amp * Math.sin(T * 8.5) + (r.wobble ? 0.06 * Math.sin(T * 5) : 0) : 0;
    K.place(G.kid, r.x, r.z, r.f, roll);

    // classmates and the teacher in the room: duck, cover and hold while it shakes, then stand and wait
    const shakeOn = T > 0.75 && T < tStop;
    G.mates.forEach((F, i) => {
      const vis = T < out; K.show(F, vis); if (!vis) return;
      const [dx, dz] = DESKS[room.mates[i]];
      const seat = { x: dx, z: dz + 0.61, f: PI }, under = { x: dx - 0.16, z: dz, f: PI / 2 }, up = { x: dx - 0.72, z: dz + 0.32, f: -PI / 2 };
      let p, x, z, f;
      if (level === 'easy' && i === OPENER_I && T < tStop + 0.3) {
        // Tonton, nearest the door, opens it first
        const o = K.evalTrack(OPEN_TRACK, T);
        K.applyPose(F, o.p, o.gait, o.gk, T); K.place(F, o.x, o.z, o.f, (shakeOn && o.p.hy > 0.5) ? 0.05 * Math.sin(T * 8 + i) : 0);
        const ev = ctx.hits('opener', T).pop();
        if (ev && T < ev.T + ev.dur) K.showTag('opener', OPENER + ' opens the door!', 'say', o.x, 2.15, o.z); else K.hideTag('opener');
        return;
      }
      const tIn = 0.85 + i * 0.12;
      if (T < tIn) { p = K.POSE.sit; x = seat.x; z = seat.z; f = seat.f; }
      else if (T < tStop + 0.3) { const k = sstep((T - tIn) / 0.7); p = K.blendPose(K.POSE.sit, K.POSE.hold, k); x = lerp(seat.x, under.x, k); z = lerp(seat.z, under.z, k); f = angLerp(seat.f, under.f, k); }
      else { const k = sstep((T - tStop - 0.3) / 0.8); p = K.blendPose(K.POSE.hold, K.POSE.stand, k); x = lerp(under.x, up.x, k); z = lerp(under.z, up.z, k); f = angLerp(under.f, up.f, k); }
      if (level === 'easy' && i === OPENER_I) K.hideTag('opener');
      K.applyPose(F, p, null, 0, T); K.place(F, x, z, f, (shakeOn && p.hy > 0.5) ? 0.05 * Math.sin(T * 8 + i) : 0);
    });
    {
      const F = G.teacher, vis = T < out; K.show(F, vis);
      if (vis) {
        const tk = SIM.teacherKeys;
        if (tk.length && T >= tk[0].T) {
          let i = 0; while (i < tk.length - 1 && T >= tk[i + 1].T) i++;
          const a = tk[i], b = tk[Math.min(i + 1, tk.length - 1)], u = b === a ? 1 : clamp((T - a.T) / Math.max(1e-6, b.T - a.T), 0, 1);
          K.applyPose(F, K.blendPose(K.POSE[a.pose], K.POSE[b.pose], sstep(u)), b.walk && u < 1 ? 'walk' : null, b.walk && u < 1 ? 1 : 0, T);
          K.place(F, lerp(a.x, b.x, u), lerp(a.z, b.z, u), angLerp(a.f, b.f, Math.min(1, u * 2)));
        } else {
          const st = { x: 1.0, z: -2.15, f: 0.15 }, un = { x: 1.95, z: -1.32, f: PI }, up = { x: 1.6, z: -0.7, f: 0.4 };
          let p, x, z, f;
          if (T < 0.95) { p = K.POSE.stand; x = st.x; z = st.z; f = st.f; }
          else if (T < tStop + 0.3) { const k = sstep((T - 0.95) / 0.9); p = K.blendPose(K.POSE.stand, K.POSE.cover, k); x = lerp(st.x, un.x, k); z = lerp(st.z, un.z, k); f = angLerp(st.f, un.f, k); }
          else { const k = sstep((T - tStop - 0.3) / 0.8); p = K.blendPose(K.POSE.cover, K.POSE.stand, k); x = lerp(un.x, up.x, k); z = lerp(un.z, up.z, k); f = angLerp(un.f, up.f, k); }
          K.applyPose(F, p, null, 0, T); K.place(F, x, z, f);
        }
      }
    }
    // the class at the field, after they walk out
    const fk = sstep((T - out) / 0.6), countE = ctx.hits('count', T)[0];
    G.fclass.forEach((F, i) => {
      const vis = T >= out; K.show(F, vis); if (!vis) return;
      K.applyPose(F, K.POSE.stand, null, 0, T); K.place(F, F.spot.x, F.spot.z + (1 - fk) * 1.2, F.spot.f, 0.02 * Math.sin(T * 1.3 + i));
    });
    {
      const F = G.fteacher, vis = T >= out; K.show(F, vis);
      if (vis) { const ck = countE ? sstep((T - countE.T) / 0.4) : 0; K.applyPose(F, K.blendPose(K.POSE.stand, K.POSE.count, ck), null, 0, T); K.place(F, -8.3, -1.05 + (1 - fk) * 0.8, 0); }
    }

    // the camera: ease between framings, shake while the ground shakes
    K.camFollow(T, SIM.camKeys, ctx.rm ? 0 : amp);

    // labels over the scene
    K.showTag('you', 'You', '', r.x, (r.p.hy + 0.72) + 0.2, r.z);
    if (jamOn) K.showTag('stuck', 'Stuck!', 'stuck', -3.5, 2.45, 2.2); else K.hideTag('stuck');
    const says = SIM.evs.filter((e) => e.e === 'say' && T >= e.T && T < e.T + e.dur);
    K.hideTag('tsay'); K.hideTag('fsay');
    for (const s of says) {
      if (s.who === 'teacher' && G.teacher.root.visible) { const p = G.teacher.root.position; K.showTag('tsay', s.text, 'say', p.x, 2.15, p.z); }
      if (s.who === 'fteacher' && G.fteacher.root.visible) { const p = G.fteacher.root.position; K.showTag('fsay', s.text, 'say', p.x, 2.2, p.z); }
    }
    if (countE && T < countE.T + 3.2 && G.fteacher.root.visible) { const p = G.fteacher.root.position; K.showTag('count', countLine(T - countE.T), 'say', p.x, 2.25, p.z); }
    else K.hideTag('count');
  }

  function status(T, SIM, ctx) {
    const amp = shakeAt(T, SIM, ctx);
    if (amp > 0.06) return { cls: 'on', text: 'Shaking!' };
    if (T > SIM.tStop) return { cls: 'calm', text: 'The shaking stopped' };
    return null;
  }
  // with no 3D: the drawing for the moment, and what people say
  function flat(T, SIM, ctx, seg) {
    const icon = seg.pre ? 'quake' : seg.end ? (SIM.level === 'easy' ? 'hold' : 'field') : seg.auto ? 'wait' : seg.step;
    const says = SIM.evs.filter((e) => e.e === 'say' && T >= e.T && T < e.T + e.dur), countE = ctx.hits('count', T)[0], op = ctx.hits('opener', T).pop();
    let line = says.length ? 'Teacher: ' + says[says.length - 1].text : jammedAt(T, ctx) ? 'Stuck!' : '';
    if (countE && T < countE.T + 3.2) line = 'Teacher: ' + countLine(T - countE.T);
    if (op && T < op.T + op.dur) line = OPENER + ' opens the door!';
    return { icon, say: line };
  }

  OrderGame.run({
    id: 'quake', slug: 'quake-in-order', title: 'Quake in Order', chips: ['Act Fast', 'Earthquake'],
    levels: {
      easy: { label: 'Easy', sub: 'Duck, cover, hold', right: ['duck', 'cover', 'hold'] },
      hard: { label: 'Difficult', sub: 'The full drill', right: ['door', 'duck', 'cover', 'hold', 'wait', 'walk', 'field'] }
    },
    startLevel: 'easy', embedLevel: 'hard',
    story(level) {
      if (level === 'easy') {
        return {
          h2: 'The ground starts to shake!',
          p: 'It\'s math class. Tonton sits right next to the classroom door, so when the ground shakes, his job is to open it. Your seat is in the front row.',
          mission: 'Put the 3 steps in the right order. Then tap Simulate to see what happens.',
          bubble: 'It\'s math class. <b>Tonton sits nearest the door</b>, so he opens it when the ground shakes. Suddenly, the ground starts to shake! <b>Put the 3 steps in order</b>, then tap Simulate to see what happens.'
        };
      }
      return {
        h2: 'The ground starts to shake!',
        p: 'It\'s math class. Your seat is right next to the classroom door. Suddenly, the ground starts to shake.',
        mission: 'Put the 7 steps in the right order. Then tap Simulate to see what happens.',
        bubble: 'It\'s math class. Your seat is <b>right next to the door</b>. Suddenly, the ground starts to shake! <b>Put the 7 steps in order</b>, then tap Simulate to see what happens.'
      };
    },
    STEPS, ICON, flatIntro: 'door',
    shuffleOk: (o, level) => level !== 'hard' || o[0] !== 'door',
    simulate, pal: PAL, poses: POSES, cams: CAMS, build, onRecolor, reset, idle, frame, status, flat,
    preCaption: (level) => level === 'easy' ? '<b>The ground starts to shake!</b> Tonton sits nearest the door, so he opens it.' : '<b>The ground starts to shake!</b>',
    verdict(worst, demo, level) {
      if (worst === 'ok') return demo
        ? { title: 'The right way: safe!', text: level === 'easy' ? 'Duck, cover and hold, then stay put until the shaking stops.' : 'Open the door, duck, cover, hold, wait, then walk out together.' }
        : { title: 'Safe! Great job.', text: 'You did every step at the right time.' };
      if (worst === 'warn') return { title: 'Almost safe', text: 'You stayed safe, but some steps could be better. See what happened below.' };
      return { title: 'Not safe yet', text: 'Some steps put you in danger. See what happened, then try again.' };
    },
    note(level, worst, demo) {
      if (level !== 'easy') return null;
      return '<b>&#128682; Nearest the door? Open it first.</b> Tonton sat nearest the door, so he opened it right away. Whoever sits nearest the door opens it first, so a door frame bent by the shaking can\'t trap the class.' +
        (worst === 'ok' && !demo ? '<br><br><b>Ready for more?</b> Try Difficult: your seat is next to the door, and the whole drill is up to you.' : '');
    },
    about: '<p>The steps follow Duck, Cover, and Hold. Whoever sits nearest the door opens it first, so a door frame bent by the shaking can\'t trap the class.</p>' +
      '<p>Easy has three steps: duck, cover and hold. Difficult is the full drill, from the door to the open field.</p><p class="note">Part of the BAYANIHanda Game Library, under Act Fast.</p>'
  });
})();
