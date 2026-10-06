import { useEffect, useReducer, useRef, useState } from 'react';
import { engine } from './engine/bridge.js';
import { AV, LIVE, TIPS, TRIVIA, MAX_PLAYERS, av, game, rankOf, nextRank, howTo } from './data.js';
import { Splash, Welcome, AddPlayer, Players } from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import { Games, Intro } from './screens/Games.jsx';
import Result from './screens/Result.jsx';
import ChampionId, { IdCard } from './screens/ChampionId.jsx';
import Settings from './screens/Settings.jsx';
import { TeacherCorner, BuildWithUs } from './screens/GrownUps.jsx';
import { NavBar, NavRail } from './Nav.jsx';
import { AskSheet, Sheet, Snack } from './Overlays.jsx';

const PREFS_KEY = 'bayanihanda_settings_v1';
const PAD_PHONE = 'calc(env(safe-area-inset-top, 0px) + 22px) 18px 28px';
const PAD_TABLET = 'calc(env(safe-area-inset-top, 0px) + 28px) 36px 36px';
const TAB_OF = { home: 'home', games: 'games', intro: 'games', id: 'id', players: 'players' };

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

export default function Shell() {
  const tablet = useMedia('(min-width: 900px)');
  const [s, setS] = useState(() => ({
    screen: 'splash', ws: 0, editMode: false, draft: { nick: '', av: 'turtle', id: null },
    filter: 'all', gameId: 'fire', mode: 0, modes: {}, from: 'games', result: null,
    ask: false, askKind: 'tip', askN: 0, homeN: 0, jump: 0, sheet: null, sd: null, snack: null,
    names: {}, photos: {}, aboutMore: false, ...loadPrefs(),
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

  // players
  const newPlayer = () => go('addPlayer', { draft: { nick: '', av: 'turtle', id: null } });
  const editPlayer = (p) => go('addPlayer', { draft: { nick: p.nick, av: p.avatar, id: p.id } });
  function savePlayer() {
    const d = s.draft, name = d.nick.trim();
    if (!name) return;
    if (d.id) {
      engine.updatePlayer(d.id, name, d.av); refresh();
      go('players'); snackShow('Player saved');
      return;
    }
    if (players.length >= MAX_PLAYERS) return;
    engine.addPlayer(name, d.av); refresh();
    go('home', { homeN: 0, jump: s.jump + 1, editMode: false });
    snackShow('Welcome, ' + name + '!');
    speak('Hi, ' + name + '! Ready to learn and be a hero today?');
  }
  function pickPlayer(p) {
    if (s.editMode) return editPlayer(p);
    engine.selectPlayer(p.id); refresh();
    go('home', { homeN: 0, jump: s.jump + 1 });
    speak('Hi, ' + p.nick + '!');
  }
  function removePlayer(id) {
    engine.removePlayer(id); refresh();
    const left = engine.players();
    if (!left.length) go('addPlayer', { draft: { nick: '', av: 'turtle', id: null }, editMode: false });
    else go('players');
    snackShow('Player removed');
  }

  // games
  function openGame(id) {
    const g = game(id);
    if (g.soon) { snackShow('Coming soon! Bayani is still building this game.'); return; }
    const from = ['home', 'games', 'id', 'players'].indexOf(s.screen) >= 0 ? s.screen : 'games';
    go('intro', { gameId: id, mode: s.modes[id] || 0, from });
  }
  function startGame(id, mode) {
    if (!engine.ready) { snackShow('The 3D games could not start on this device.'); return; }
    try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ }
    engine.start(id || s.gameId, mode == null ? s.mode : mode);
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

  // Ask Bayani: a tip for the screen you are on, or a fun fact.
  function askItem(st = s) {
    if (st.askKind === 'trivia') { const t = TRIVIA[st.askN % TRIVIA.length]; return { kind: '❓ DID YOU KNOW?', text: t[0], game: t[1] }; }
    const list = [];
    if (['intro', 'play', 'result'].indexOf(st.screen) >= 0) { const g = game(st.gameId); list.push(['💡 TIP FOR ' + g.name.toUpperCase(), howTo(g, st.mode).tip, g.id]); }
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
  backRef.current = () => {
    const c = sRef.current;
    if (c.ask) return patch({ ask: false });
    if (c.sheet) return patch({ sheet: null });
    switch (c.screen) {
      case 'play': if (!engine.closeGamePopup()) { engine.stop(); patch({ screen: 'intro' }); } break;
      case 'intro': go(c.from || 'games'); break;
      case 'result': go('intro'); break;
      case 'welcome': if (c.ws > 0) patch({ ws: c.ws - 1 }); break;
      case 'addPlayer': go(engine.players().length ? 'players' : 'welcome', { ws: 2 }); break;
      case 'players': if (engine.activeId()) go('home'); break;
      case 'teacher': case 'contribute': go('settings'); break;
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
    players, me, myAv, nick, mine, count, rank, next, countOf: (pid) => countOf(engine.earned(pid)),
    go, refresh, speak, snackShow, afterSplash, newPlayer, editPlayer, savePlayer, pickPlayer, removePlayer,
    resetBadges: () => { engine.resetBadges(); refresh(); },
    openGame, startGame, askItem, openAsk,
    tabOf: TAB_OF[scr],
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
  else if (scr === 'play') body = <div data-screen-label="Gameplay" style={{ position: 'absolute', inset: 0, background: '#0e2233' }} />;

  const rail = tablet && (isTab || ['intro', 'settings', 'teacher', 'contribute'].indexOf(scr) >= 0);
  const bottom = isTab && !tablet;
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
