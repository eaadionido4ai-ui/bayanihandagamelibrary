// Connects the original game engine (public/engine/games.js) to the new app shell.
//
// The engine was written as one page that switched <section class="screen">
// elements with App.show(id). Here only the in-game screens stay in the page
// (#game-layer). Everything else is the React shell, so App.show is replaced:
//
//   game screen    -> show it in #game-layer and tell the shell a game is playing
//   result screen  -> read the stars, lines and badge note the game wrote, and
//                     hand them to the shell's Results screen
//   anything else  -> the player quit (hub, level list, how-to): back to the intro
//
// Players and badges keep using the engine's own localStorage keys, so progress
// from the web app carries over.

import screensHtml from './screens.html?raw';

const GAME_SCREENS = {
  'screen-fire': 'fire', 'screen-gobag': 'gobag', 'screen-trace': 'path', 'screen-safepath': 'path', 'screen-high': 'path',
  'screen-quake': 'quake', 'screen-hazard': 'hazard', 'screen-sapa': 'sapa', 'screen-cleanup': 'cleanup', 'screen-cares': 'cares',
  'screen-cpr': 'cpr', 'screen-bleed': 'bleed',
};
const RESULT_SCREENS = {
  'screen-fire-win': 'fire', 'screen-gobag-result': 'gobag', 'screen-trace-result': 'path', 'screen-safepath-result': 'path',
  'screen-high-result': 'path', 'screen-quake-result': 'quake', 'screen-hazard-result': 'hazard', 'screen-sapa-result': 'sapa',
  'screen-clean-result': 'cleanup', 'screen-cares-result': 'cares', 'screen-cpr-result': 'cpr', 'screen-bleed-result': 'bleed',
};
// App.activeGame -> the game object exposed on window
const RUNNERS = {
  fire: 'FireGame', gobag: 'GoBag', trace: 'TraceGame', safepath: 'SafePath', high: 'HighGround', quake: 'QuakeGame',
  hazard: 'HazardHunt', sapa: 'Sapa', cleanup: 'Cleanup', cares: 'CARES', cpr: 'CPRGame', bleed: 'BleedGame',
};
const PATH_LEVEL = { 'screen-trace': 0, 'screen-safepath': 1, 'screen-high': 2, trace: 0, safepath: 1, high: 2 };
const GOBAG_MODES = ['table', 'pile', 'room'];
// Games whose HUD has no legend button get a how-to button that opens the shell's sheet.
const NEEDS_HOWTO = ['screen-fire', 'screen-gobag', 'screen-quake', 'screen-cleanup'];

const listeners = new Set();
const emit = (type, data) => listeners.forEach((fn) => fn(type, data || {}));

let App = null;
let layer = null;
let activeScreen = null;
const prefs = { sound: true, voice: true };

const w = () => window;
const $ = (id) => document.getElementById(id);

function say(text, force) {
  if (!text || !prefs.sound || (!force && !prefs.voice)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) { /* no speech on this device */ }
}

function currentMode(gameId) {
  const W = w();
  switch (gameId) {
    case 'fire': return App.fireDifficulty === 'hard' ? 1 : 0;
    case 'gobag': return Math.max(0, GOBAG_MODES.indexOf(W.GoBag.mode));
    case 'path': return PATH_LEVEL[activeScreen] ?? PATH_LEVEL[App.activeGame] ?? 0;
    case 'hazard': return W.HazardHunt.scene || 0;
    case 'sapa': return W.Sapa.level || 0;
    case 'cleanup': return W.Cleanup.scenario === 'typhoon' ? 1 : 0;
    case 'cares': return W.CARES.mapIndex || 0;
    default: return 0;
  }
}

function readReview() {
  const box = $('gb-review');
  if (!box) return null;
  const perfect = box.querySelector('.perfect');
  const groups = [...box.querySelectorAll('.review')].map((r) => ({
    kind: r.classList.contains('warn') ? 'warn' : 'miss',
    title: (r.querySelector('h3') || {}).textContent || '',
    items: [...r.querySelectorAll('.rrow')].map((row) => ({
      icon: (row.querySelector('.ic') || {}).textContent || '',
      name: (row.querySelector('b') || {}).textContent || '',
      info: (row.querySelector('small') || {}).textContent || '',
    })),
  }));
  return { perfect: perfect ? perfect.textContent : '', groups };
}

function readResult(id) {
  const sec = $(id);
  const q = (s) => sec.querySelector(s);
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const stars = [...text(q('.stars'))].filter((c) => c === '★').length;
  const note = q('.badge-note');
  const next = q('button[id$="-next"]');
  const gameId = RESULT_SCREENS[id];
  return {
    screen: id,
    gameId,
    mode: currentMode(gameId),
    stars,
    title: text(q('h2')),
    line: [...sec.querySelectorAll('.rline')].map(text).filter(Boolean).join(' '),
    newBadge: !!note && note.style.display !== 'none',
    hasNext: !!next && next.style.display !== 'none',
    nextLabel: text(next),
    review: id === 'screen-gobag-result' ? readReview() : null,
  };
}

function show(id) {
  layer.querySelectorAll(':scope > .screen').forEach((s) => s.classList.remove('active'));
  if (GAME_SCREENS[id]) {
    $(id).classList.add('active');
    layer.hidden = false;
    activeScreen = id;
    emit('play', { gameId: GAME_SCREENS[id], mode: currentMode(GAME_SCREENS[id]) });
    return;
  }
  const was = activeScreen;
  layer.hidden = true;
  activeScreen = null;
  if (RESULT_SCREENS[id]) { emit('result', readResult(id)); return; }
  if (was) emit('exit', { gameId: GAME_SCREENS[was] });
}

// Fixes for bugs in the original engine, applied at runtime so games.js stays
// exactly as extracted.
function applyEngineFixes() {
  const W = w();
  // Duck, Cover, and Hold calls this._label("EXIT") but never defines _label, so
  // in the web app it always fell back to "3D view is not available on this
  // device". Hazard Hunt's sign-label helper is self-contained; share it.
  if (W.QuakeGame && !W.QuakeGame._label && W.HazardHunt && W.HazardHunt._label) {
    W.QuakeGame._label = W.HazardHunt._label;
  }
  // The extinguisher mist never showed: its particles start parked at y = -100,
  // so three.js measures the spray's bounds there once and culls it every frame
  // after. Always draw it.
  if (W.FireGame && W.FireGame._buildSpray && !W.FireGame._buildSpray.fixed) {
    const build = W.FireGame._buildSpray;
    W.FireGame._buildSpray = function () {
      const r = build.apply(this, arguments);
      if (this.spray) this.spray.frustumCulled = false;
      return r;
    };
    W.FireGame._buildSpray.fixed = true;
  }
}

function addHowtoButtons() {
  NEEDS_HOWTO.forEach((sid) => {
    const tr = document.querySelector('#' + sid + ' .hud .tr');
    if (!tr) return;
    const b = document.createElement('button');
    b.className = 'icon-btn';
    b.setAttribute('aria-label', 'How to play');
    b.textContent = 'ⓘ';
    b.addEventListener('click', () => emit('howto', { gameId: GAME_SCREENS[sid] }));
    tr.insertBefore(b, tr.firstChild);
  });
  // Legend buttons use the same info glyph as the how-to buttons.
  layer.querySelectorAll('.hud .tr button[id$="-legend"]').forEach((b) => { b.textContent = '\u24D8'; });
  // Design placement: go bag top view joins the zoom buttons; the cleanup tools
  // box becomes a labelled button at the bottom right.
  const tv = $('btn-topview'), side = document.querySelector('#screen-gobag .sp-side');
  if (tv && side) { tv.className = 'sp-mini'; tv.textContent = '⬍'; side.appendChild(tv); }
  const tools = $('btn-clean-tools'), hud = document.querySelector('#screen-cleanup .hud');
  if (tools && hud) { tools.className = 'tools-btn'; tools.textContent = '🧰 Tools box'; hud.appendChild(tools); }
}

export const engine = {
  ready: false,

  // Must run before DOMContentLoaded, when the engine boots and wires its buttons.
  install() {
    layer = $('game-layer');
    layer.innerHTML = screensHtml;
    App = w().BYANI && w().BYANI.App;
    if (!App || typeof w().THREE === 'undefined') return false;
    App.show = show;
    const openModal = App.openModal.bind(App);
    App.openModal = (id) => (id === 'modal-settings' ? emit('settings') : openModal(id));
    App.syncSettings = () => {};
    // Hints always stay on screen; whether they are read aloud is the voice setting.
    App.settings.hints = true;
    App.speak = function (text, once) {
      if (once) { if (this._spoke[text]) return; this._spoke[text] = true; }
      say(text);
    };
    applyEngineFixes();
    addHowtoButtons();
    App.players.load();
    App.badges.load();
    this.ready = true;
    return true;
  },

  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  setPrefs(p) {
    Object.assign(prefs, p);
    if (App) { App.settings.sound = prefs.sound; if (!prefs.sound) App._stopNoise(); }
    if (!prefs.sound || !prefs.voice) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  },
  say,

  start(gameId, mode) {
    const W = w();
    mode = mode || 0;
    switch (gameId) {
      case 'fire': App.fireDifficulty = mode === 1 ? 'hard' : 'easy'; App.startFire(); break;
      case 'gobag': W.GoBag.mode = GOBAG_MODES[mode] || 'table'; App.startGoBag(); break;
      case 'path':
        if (mode === 0) App.startTrace();
        else if (mode === 1) { W.SafePath.level = 0; App.startSafePath(); }
        else App.startHigh();
        break;
      case 'quake': App.startQuake(); break;
      case 'hazard': W.HazardHunt.scene = mode; App.startHazard(); break;
      case 'sapa': W.Sapa.level = mode; App.startSapa(); break;
      case 'cleanup': W.Cleanup.scenario = mode === 1 ? 'typhoon' : 'flood'; App.startCleanup(); break;
      case 'cares': W.BYANI.Logic.cares.useMap(mode); W.CARES.mapIndex = mode; App.startCares(); break;
      case 'cpr': App.startCPR(); break;
      case 'bleed': App.startBleed(); break;
      default: break;
    }
  },

  // Leave a game from the shell (Android back button), as the quit buttons do.
  stop() {
    if (!App || !activeScreen) return;
    const runner = w()[RUNNERS[App.activeGame]];
    try { if (runner && runner.stop) runner.stop(); } catch (e) { /* already stopped */ }
    App._stopNoise();
    try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    layer.querySelectorAll(':scope > .screen').forEach((s) => s.classList.remove('active'));
    layer.hidden = true;
    activeScreen = null;
  },

  playing() { return !!activeScreen; },

  // Close any card or legend the game has open. Returns true if one was open.
  closeGamePopup() {
    const open = layer.querySelector('.screen.active .legend-pop.open, .modal.open');
    if (!open) return false;
    const btn = open.querySelector('[id$="-close"], [id$="-back"], #btn-info-leave, .btn.ghost');
    if (btn) btn.click(); else open.classList.remove('open');
    return true;
  },

  // Buttons on the hidden result screen, so replays use the game's own logic.
  retry(resultScreen) {
    const b = $(resultScreen) && $(resultScreen).querySelector('button[id$="-retry"], button[id$="-replay"]');
    if (b) b.click();
  },
  next(resultScreen) {
    const b = $(resultScreen) && $(resultScreen).querySelector('button[id$="-next"]');
    if (b) b.click();
  },

  // Players and badges, stored exactly as the web app stored them.
  players() { return App.players.all(); },
  activeId() { return App.players.activeId(); },
  addPlayer(nick, avatar) { const id = App.players.add(nick, avatar); App.badges.load(); return id; },
  updatePlayer(id, nick, avatar) { App.players.update(id, nick, avatar); },
  removePlayer(id) { App.players.remove(id); App.badges.load(); },
  selectPlayer(id) { App.players.setActive(id); App.badges.load(); },
  earned(pid) {
    if (!pid || pid === App.players.activeId()) return Object.assign({}, App.badges.earned);
    try { return JSON.parse(localStorage.getItem('bayanihanda_badges_v1::' + pid)) || {}; } catch (e) { return {}; }
  },
  resetBadges() { App.badges.reset(); },
};
