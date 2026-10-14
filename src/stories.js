// Handaventures progress, kept per player on this device: the endings each player has found
// in each story. The Hero badge itself goes into the engine's badge store with the other badges.
// Story style (chat or cartoon) and character (Ate or Kuya) are remembered per device.

const KEY = 'bayanihanda_stories_v1';
const PREFS = 'bayanihanda_story_prefs_v1';
const keyOf = (pid) => KEY + '::' + (pid || 'guest');

export function loadStories(pid) {
  try { return JSON.parse(localStorage.getItem(keyOf(pid))) || {}; } catch (e) { return {}; }
}

export function foundIn(pid, storyId) {
  const s = loadStories(pid)[storyId];
  return s && Array.isArray(s.found) ? s.found : [];
}

export function saveEnding(pid, storyId, ending) {
  const all = loadStories(pid);
  const s = all[storyId] && Array.isArray(all[storyId].found) ? all[storyId] : { found: [] };
  if (s.found.indexOf(ending) < 0) s.found.push(ending);
  all[storyId] = s;
  try { localStorage.setItem(keyOf(pid), JSON.stringify(all)); } catch (e) { /* private mode */ }
  return all;
}

export function forgetStories(pid) {
  try { localStorage.removeItem(keyOf(pid)); } catch (e) { /* private mode */ }
}

export function loadStoryPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS)) || {};
    return { storyMode: p.mode === 'vn' ? 'vn' : 'chat', storyHero: p.hero === 'kuya' ? 'kuya' : 'ate' };
  } catch (e) { return { storyMode: 'chat', storyHero: 'ate' }; }
}

export function saveStoryPrefs(mode, hero) {
  try { localStorage.setItem(PREFS, JSON.stringify({ mode, hero })); } catch (e) { /* private mode */ }
}
