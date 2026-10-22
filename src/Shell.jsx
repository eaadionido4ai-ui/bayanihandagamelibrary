import { useEffect, useReducer, useRef, useState } from 'react';
import { engine } from './engine/bridge.js';
import { AV, AGE, LIVE, TIPS, TRIVIA, MAX_PLAYERS, av, game, rankOf, nextRank, howTo, isStory, ageOf, needsGrownUp } from './data.js';
import { CONSENT_VERSION, ageOn, complete, draftCheck, forgetProfile, lastGrownUp, profileOf, saveProfile, today } from './profiles.js';
import { StoryShelf, StoryIntro, StoryPlay } from './screens/Stories.jsx';
import { GamePlay } from './screens/GameFrame.jsx';
import { forgetStories, loadStoryPrefs, saveEnding, saveStoryPrefs } from './stories.js';
import { Splash, Welcome, AddPlayer, Players } from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import { Games, Intro } from './screens/Games.jsx';
import Result from './screens/Result.jsx';
import ChampionId, { IdCard } from './screens/ChampionId.jsx';
import Settings from './screens/Settings.jsx';
import { TeacherCorner, BuildWithUs } from './screens/GrownUps.jsx';
import { Tanghalan } from './screens/Tanghalan.jsx';
import { TourPlay, welcomeLine } from './screens/Tour.jsx';
import { cardOffer, forgetTour, loadTour, quietOffer, saveTour } from './tour.js';
import { forgetProgress } from './museum/store.js';
import { NavBar, NavRail } from './Nav.jsx';
import { AskSheet, Sheet, Snack } from './Overlays.jsx';

const PREFS_KEY = 'bayanihanda_settings_v1';
const PAD_PHONE = 'calc(env(safe-area-inset-top, 0px) + 22px) 18px 28px';
const PAD_TABLET = 'calc(env(safe-area-inset-top, 0px) + 28px) 36px 36px';
const TAB_OF = { home: 'home', games: 'games', intro: 'games', story: 'games', id: 'id', players: 'players' };

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY));
    if (p) return { sound: p.sound !== false, voice: p.voice !== false };
  } catch (e) { /* first run */ }
  return { sound: true, voice: true };
}

function useMedia(query) {
  const [m, setM] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const f = () => setM(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [query]);
  return m;
}

const countOf = (earned) => LIVE.filter((g) => earned[g.id]).length;

// A new player's page starts with the grown-up from the player saved last (a teacher setting up a class).
// cfor: whose consent the box was ticked as ('grownup' for a child, 'self' for a player 18 or older).
function blankDraft() {
  const g = lastGrownUp() || {};
  return { nick: '', av: 'turtle', id: null, by: '', bm: '', bd: '', role: g.role || 'parent', gname: g.name || '', school: g.school || '', consent: false, cfor: null, had: false, back: null };
}

export default function Shell() {
  const tablet = useMedia('(min-width: 900px)');
  const [s, setS] = useState(() => ({
    screen: 'splash', ws: 0, editMode: false, draft: blankDraft(), supervised: {},
    filter: 'all', gameId: 'fire', mode: 0, modes: {}, from: 'games', museumFrom: 'home', result: null,
    ask: false, askKind: 'tip', askN: 0, homeN: 0, jump: 0, sheet: null, sd: null, snack: null,
    names: {}, photos: {}, aboutMore: false, ...loadPrefs(),
    storyId: 'hv-kulog', storyFrom: 'hv', hvFrom: 'games', ...loadStoryPrefs(),
  }));
  const [, refresh] = useReducer((x) => x + 1, 0);
  const patch = (p) => setS((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) }));
  const sRef = useRef(s);
  sRef.current = s;
  const snackT = useRef(null);

  // Players and badges live in the engine's storage, read fresh every render.
  const ready = engine.ready;
  const players = ready ? engine.players() : [];
  const activeId = ready ? engine.activeId() : null;
  const me = players.find((p) => p.id === activeId) || null;
  const myAv = me ? av(me.avatar) : AV[0];
  // the player's details: the age decides when a grown-up plays along (null until a grown-up adds the birthday)
  const profile = me ? profileOf(me.id) : null;
  const age = profile ? ageOn(profile.born) : null;
  const supervised = !!(activeId && s.supervised[activeId]);
  const nick = me ? me.nick : 'Player';
  const mine = ready ? engine.earned() : {};
  const count = countOf(mine);
  const rank = rankOf(count);
  const next = nextRank(count);

  const speak = (t, force) => engine.say(t, force);
  const snackShow = (t) => {
    clearTimeout(snackT.current);
    patch({ snack: t });
    snackT.current = setTimeout(() => patch({ snack: null }), 2600);
  };

  function go(screen, extra) {
    if (engine.playing() && screen !== 'play') engine.stop();
    patch({ screen, ask: false, sheet: null, ...(extra || {}) });
  }
  function afterSplash() {
    if (engine.ready && engine.players().length) go('players');
    else go('welcome', { ws: 0 });
  }

  // players: a nickname and an avatar, and the details added for them (src/profiles.js): the birthday, and for a
  // child the parent, guardian or teacher (and the teacher's school) with their privacy consent, or for a player
  // 18 or older their own consent; all kept on this device.
  const newPlayer = () => go('addPlayer', { draft: blankDraft() });
  // back: 'home' when a grown-up fills in an older player's details from Home
  function editPlayer(p, back) {
    const pf = profileOf(p.id) || {}, g = pf.grownUp || (back === 'home' ? lastGrownUp() : null) || {};
    const [by, bm, bd] = (pf.born || '').split('-');
    go('addPlayer', { draft: {
      nick: p.nick, av: p.avatar, id: p.id, by: by || '', bm: bm ? String(+bm) : '', bd: bd ? String(+bd) : '',
      role: g.role || 'parent', gname: g.name || '', school: g.school || '', consent: !!pf.consent,
      cfor: pf.consent ? (pf.consent.by === 'self' ? 'self' : 'grownup') : null, had: complete(pf), back: back || null,
    } });
  }
  function savePlayer() {
    const d = s.draft, name = d.nick.trim(), chk = draftCheck(d);
    // a new player needs everything; an older player may be saved with the grown-up part left for later
    if (!name || !(chk.ok || (d.id && !d.had && chk.empty))) return;
    const before = d.id ? profileOf(d.id) : null;
    // the consent keeps the day it was first given, as long as it was given by the same kind of person
    const kept = before && before.consent && (before.consent.by === 'self') === chk.adult ? before.consent : null;
    const details = !chk.ok ? null : chk.adult ? {
      // a player 18 or older: their own consent, and no grown-up's details kept
      born: chk.born, grownUp: null, consent: kept || { on: today(), v: CONSENT_VERSION, by: 'self' },
    } : {
      born: chk.born, grownUp: d.role === 'teacher' ? { role: 'teacher', name: chk.name, school: chk.school } : { role: 'parent', name: chk.name },
      consent: kept || { on: today(), v: CONSENT_VERSION, by: 'grownup' },
    };
    if (d.id) {
      engine.updatePlayer(d.id, name, d.av);
      if (details) saveProfile(d.id, details);
      refresh();
      go(d.back === 'home' ? 'home' : 'players'); snackShow('Player saved');
      return;
    }
    if (players.length >= MAX_PLAYERS) return;
    const id = engine.addPlayer(name, d.av);
    saveProfile(id, details);
    refresh();
    go('home', { homeN: 0, jump: s.jump + 1, editMode: false });
    snackShow('Welcome, ' + name + '!');
    speak('Hi, ' + name + '! Ready to learn and be a hero today?');
  }
  function pickPlayer(p) {
    if (s.editMode) return editPlayer(p);
    engine.selectPlayer(p.id); refresh();
    // A player made before birthdays were asked: ask a grown-up once to fill in the details ("Later" is fine).
    const pf = profileOf(p.id), ask = !complete(pf) && !(pf && pf.asked);
    if (ask) saveProfile(p.id, { asked: true });
    go('home', { homeN: 0, jump: s.jump + 1, ...(ask ? { sheet: 'finish', sd: { id: p.id } } : {}) });
    speak('Hi, ' + p.nick + '!' + (!ask && cardOffer(p.id) ? ' Want me to show you around? Tap Show me!' : ''));
  }
  function removePlayer(id) {
    engine.removePlayer(id); forgetProgress(id); forgetStories(id); forgetTour(id); forgetProfile(id); refresh();
    const left = engine.players();
    if (!left.length) go('addPlayer', { draft: blankDraft(), editMode: false });
    else go('players');
    snackShow('Player removed');
  }

  // A player younger than a level's age label (AGE in data.js) plays it with a grown-up: before it starts, a
  // grown-up answers a quick question. That holds for this player until the app is closed.
  function grownUpOk(band, then) {
    if (!needsGrownUp(age, band) || supervised) return true;
    const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7);
    patch({ sheet: 'supervise', sd: { ...then, band: band.id, a, b } });
    return false;
  }
  function grownUpHere() {
    const sd = s.sd || {};
    setS((p) => ({ ...p, sheet: null, supervised: { ...p.supervised, [activeId]: true } }));
    if (sd.kind === 'story') startStory(true);
    else startGame(sd.id, sd.mode, true);
  }
  // From the grown-up check: play the Easy level, which fits the player's age, instead.
  function easyInstead() {
    const sd = s.sd || {};
    patch((p) => ({ sheet: null, mode: 0, modes: { ...p.modes, [sd.id]: 0 } }));
    startGame(sd.id, 0);
  }

  // games
  function openGame(id) {
    const g = game(id);
    // A story opened from the Handaventures card on Home or Games goes back there; from anywhere else, to the shelf.
    if (isStory(g)) { go('story', { storyId: id, storyFrom: s.screen === 'home' || s.screen === 'games' ? s.screen : 'hv' }); return; }
    if (g.soon) { snackShow('Coming soon! Bayani is still building this game.'); return; }
    const from = ['home', 'games', 'id', 'players', 'museum'].indexOf(s.screen) >= 0 ? s.screen : 'games';
    go('intro', { gameId: id, mode: s.modes[id] || 0, from });
  }
  // ok: a grown-up has just passed the check
  function startGame(id, mode, ok) {
    const g = game(id || s.gameId), m = mode == null ? s.mode : mode;
    if (ok !== true && !grownUpOk(ageOf(g, m), { kind: 'game', id: g.id, mode: m })) return;
    // A game that is a page of its own (the order games) plays in a frame instead of the 3D engine.
    if (g.frame) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ }
      go('gameframe', { gameId: g.id, mode: m });
      return;
    }
    if (!engine.ready) { snackShow('The 3D games could not start on this device.'); return; }
    try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ }
    engine.start(g.id, m);
  }

  // A game in a frame finished a round. A safe round, played with the player's own order, earns its badge.
  function gameEnded(g, d) {
    if (!g || !d || d.demo || !d.safe) return;
    if (engine.ready && engine.earn(g.id)) snackShow('🏅 New badge: ' + g.badge[0] + '!');
    refresh();
  }

  // Handaventures: the shelf, a story, and what happens when a story reaches an ending.
  // The shelf opens from its card on Home or its tile on Games, and Back returns there.
  const openStories = (from) => go('hv', { hvFrom: from === 'home' ? 'home' : 'games' });
  function startStory(ok) {
    if (ok !== true && !grownUpOk(AGE.young, { kind: 'story', id: s.storyId })) return;
    saveStoryPrefs(s.storyMode, s.storyHero);
    try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ }
    go('storyplay');
  }
  function storyEnded(st, d) {
    if (!st || !d || !st.endings.some((e) => e[0] === d.ending)) return;
    saveEnding(engine.ready ? engine.activeId() : null, st.id, d.ending);
    if (d.ending === 'hero' && engine.ready && engine.earn(st.id)) snackShow('🏅 New badge: ' + st.badge[0] + '!');
    refresh();
  }

  // Bayani's island tour: offered once with the welcome sheet, then in Bayani's card on Home until it is done,
  // and always in Ask Bayani. It opens full screen and returns to where it was opened.
  const TOUR_BACK = ['home', 'games', 'id', 'players', 'settings', 'hv', 'story', 'intro', 'result'];
  function openTour(from) {
    const pid = engine.ready ? engine.activeId() : null;
    saveTour(pid, { offered: true }); quietOffer(pid);
    try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ }
    const back = from || s.screen;
    go('tour', { tourFrom: TOUR_BACK.indexOf(back) >= 0 ? back : 'home' });
  }
  function tourDone() { saveTour(engine.ready ? engine.activeId() : null, { offered: true, done: true }); }
  // reason: skip, try (a Try it button) or end; to: where Try it or Start playing leads
  function closeTour(reason, to) {
    if (reason === 'skip' || reason === 'try' || reason === 'end') tourDone();
    const gid = typeof to === 'string' && to.indexOf('game:') === 0 ? to.slice(5) : null;
    if (to === 'games') go('games', { filter: 'all' });
    else if (to === 'stories') openStories('home');
    else if (to === 'museum') go('museum', { museumFrom: 'home', museumRoom: null });
    else if (to === 'id') go('id');
    else if (gid && LIVE.some((g) => g.id === gid)) openGame(gid);
    else go(s.tourFrom || 'home');
  }

  // engine events: games starting, finishing, quitting, and their HUD buttons
  useEffect(() => engine.on((type, d) => {
    if (type === 'play') setS((p) => ({ ...p, screen: 'play', gameId: d.gameId, mode: d.mode, modes: { ...p.modes, [d.gameId]: d.mode }, sheet: null, ask: false }));
    else if (type === 'result') { refresh(); setS((p) => ({ ...p, screen: 'result', result: d, gameId: d.gameId, mode: d.mode, jump: p.jump + 1, sheet: null, ask: false })); }
    else if (type === 'exit') setS((p) => ({ ...p, screen: 'intro', sheet: null, ask: false }));
    else if (type === 'settings') setS((p) => ({ ...p, sheet: 'sound' }));
    else if (type === 'howto') setS((p) => ({ ...p, sheet: 'howto' }));
  }), []);

  useEffect(() => {
    engine.setPrefs({ sound: s.sound, voice: s.voice });
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ sound: s.sound, voice: s.voice })); } catch (e) { /* private mode */ }
  }, [s.sound, s.voice]);

  useEffect(() => {
    if (s.screen !== 'splash') return undefined;
    const t = setTimeout(() => { if (sRef.current.screen === 'splash') afterSplash(); }, 2600);
    return () => clearTimeout(t);
  }, [s.screen]);

  // A player's first visit to Home: once Home is in view, Bayani offers the tour with the welcome sheet.
  useEffect(() => {
    if (s.screen !== 'home' || s.ask || s.sheet || !activeId || loadTour(activeId).offered) return undefined;
    const t = setTimeout(() => {
      const cur = sRef.current;
      if (cur.screen !== 'home' || cur.ask || cur.sheet || !engine.ready || engine.activeId() !== activeId) return;
      saveTour(activeId, { offered: true }); quietOffer(activeId);
      patch({ sheet: 'tour' });
      speak(welcomeLine(nick));
    }, 1100);
    return () => clearTimeout(t);
  }, [s.screen, s.ask, s.sheet, activeId]);

  // Ask Bayani: a tip for the screen you are on, or a fun fact.
  function askItem(st = s) {
    if (st.askKind === 'trivia') { const t = TRIVIA[st.askN % TRIVIA.length]; return { kind: '❓ DID YOU KNOW?', text: t[0], game: t[1] }; }
    const list = [];
    if (['intro', 'play', 'result', 'gameframe'].indexOf(st.screen) >= 0) { const g = game(st.gameId); list.push(['💡 TIP FOR ' + g.name.toUpperCase(), howTo(g, st.mode).tip, g.id]); }
    if (st.screen === 'story') { const g = game(st.storyId); list.push(['💡 TIP FOR ' + g.name.toUpperCase(), g.tip, g.id]); }
    if (st.screen === 'id') list.push(['🏆 CHAMPION TIP', next ? 'You have ' + count + ' badge' + (count === 1 ? '' : 's') + '. Earn ' + next.need + ' more to become ' + next.name + '!' : 'You are a Master DRRM Champion! Keep playing to stay sharp.', null]);
    let tips = TIPS;
    if (st.screen === 'games' && st.filter !== 'all') tips = TIPS.filter((t) => game(t[1]).p === st.filter).concat(TIPS.filter((t) => game(t[1]).p !== st.filter));
    tips.forEach((t) => list.push(['💡 SAFETY TIP', t[0], t[1]]));
    const it = list[st.askN % list.length];
    return { kind: it[0], text: it[1], game: it[2] };
  }
  function openAsk() {
    patch({ ask: true, askKind: 'tip', askN: 0, jump: s.jump + 1 });
    const it = askItem({ ...s, askKind: 'tip', askN: 0 });
    setTimeout(() => speak(it.text), 0);
  }

  // Android back button: the WebView goes back in history, so keep one history
  // entry while away from Home and turn a "back" into the in-app back action.
  const guard = useRef(false);
  const ignorePop = useRef(false);
  const backRef = useRef(null);
  const backHook = useRef(null); // a screen's own back step, such as closing the museum's sheets
  backRef.current = () => {
    const c = sRef.current;
    if (c.sheet) return patch({ sheet: null }); // a sheet can sit over Ask Bayani (the tour's credits)
    if (c.ask) return patch({ ask: false });
    if (backHook.current && backHook.current()) return undefined;
    switch (c.screen) {
      case 'play': if (!engine.closeGamePopup()) { engine.stop(); patch({ screen: 'intro' }); } break;
      case 'intro': go(c.from || 'games'); break;
      case 'result': go('intro'); break;
      case 'welcome': if (c.ws > 0) patch({ ws: c.ws - 1 }); break;
      case 'addPlayer': go(c.draft && c.draft.back === 'home' ? 'home' : engine.players().length ? 'players' : 'welcome', { ws: 2 }); break;
      case 'players': if (engine.activeId()) go('home'); break;
      case 'teacher': case 'contribute': go('settings'); break;
      case 'museum': go(c.museumFrom || 'home'); break;
      case 'hv': go(c.hvFrom || 'games'); break;
      case 'story': go(c.storyFrom || 'hv'); break;
      case 'storyplay': go('story'); break;
      case 'gameframe': go('intro'); break;
      case 'tour': go(c.tourFrom || 'home'); break;
      default: if (engine.activeId()) go('home'); break;
    }
  };
  const atRoot = !s.ask && !s.sheet && (s.screen === 'home' || s.screen === 'splash' || (s.screen === 'welcome' && s.ws === 0) || (s.screen === 'players' && !activeId));
  useEffect(() => {
    if (!atRoot && !guard.current) { window.history.pushState({ bh: 1 }, ''); guard.current = true; }
    else if (atRoot && guard.current) { guard.current = false; ignorePop.current = true; window.history.back(); }
  });
  useEffect(() => {
    const onPop = () => {
      if (ignorePop.current) { ignorePop.current = false; return; }
      guard.current = false;
      backRef.current();
      refresh();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const scr = s.screen;
  const isTab = ['home', 'games', 'id', 'players'].indexOf(scr) >= 0;
  const c = {
    s, patch, tablet, pad: tablet ? PAD_TABLET : PAD_PHONE, ready,
    players, me, myAv, nick, mine, count, rank, next, countOf: (pid) => countOf(engine.earned(pid)), profile, age, supervised,
    go, refresh, speak, snackShow, afterSplash, newPlayer, editPlayer, savePlayer, pickPlayer, removePlayer, grownUpHere, easyInstead,
    resetBadges: () => { engine.resetBadges(); refresh(); },
    openGame, startGame, gameEnded, askItem, openAsk, openStories, startStory, storyEnded,
    openTour, closeTour, tourDone, tourOffer: !!activeId && cardOffer(activeId),
    setBack: (fn) => { backHook.current = fn; },
    tabOf: scr === 'museum' ? s.museumFrom : scr === 'hv' || (scr === 'story' && s.storyFrom === 'hv') ? s.hvFrom || 'games' : scr === 'story' && s.storyFrom === 'home' ? 'home' : TAB_OF[scr],
  };

  let body = null;
  if (scr === 'splash') body = <Splash c={c} />;
  else if (scr === 'welcome') body = <Welcome c={c} />;
  else if (scr === 'addPlayer') body = <AddPlayer c={c} />;
  else if (scr === 'players') body = <Players c={c} />;
  else if (scr === 'home') body = <Home c={c} />;
  else if (scr === 'games') body = <Games c={c} />;
  else if (scr === 'intro') body = <Intro c={c} />;
  else if (scr === 'result') body = <Result c={c} />;
  else if (scr === 'id') body = <ChampionId c={c} />;
  else if (scr === 'settings') body = <Settings c={c} />;
  else if (scr === 'teacher') body = <TeacherCorner c={c} />;
  else if (scr === 'contribute') body = <BuildWithUs c={c} />;
  else if (scr === 'museum') body = <Tanghalan c={c} />;
  else if (scr === 'hv') body = <StoryShelf c={c} />;
  else if (scr === 'story') body = <StoryIntro c={c} />;
  else if (scr === 'storyplay') body = <StoryPlay c={c} />;
  else if (scr === 'gameframe') body = <GamePlay c={c} />;
  else if (scr === 'tour') body = <TourPlay c={c} />;
  else if (scr === 'play') body = <div data-screen-label="Gameplay" style={{ position: 'absolute', inset: 0, background: '#0e2233' }} />;

  const rail = tablet && (isTab || ['intro', 'settings', 'teacher', 'contribute', 'hv', 'story'].indexOf(scr) >= 0);
  const bottom = (isTab || scr === 'hv') && !tablet;
  const idName = (s.names[activeId] != null ? s.names[activeId] : nick) || 'Champion';

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: tablet ? 'row' : 'column', background: '#eef6fa', fontFamily: 'Nunito,system-ui,sans-serif', color: '#16303f' }}>
        {rail && <NavRail c={c} />}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, position: 'relative', overflow: 'hidden' }}>{body}</div>
        {bottom && <NavBar c={c} />}
      </div>
      {s.ask && <AskSheet c={c} />}
      {s.sheet && <Sheet c={c} />}
      {s.snack && <Snack text={s.snack} bottom={bottom ? 110 : 34} />}
      <div className="print-only">{me && <IdCard name={idName} photo={s.photos[activeId]} av={myAv} rank={rank[1]} count={count} mine={mine} printing />}</div>
    </>
  );
}
