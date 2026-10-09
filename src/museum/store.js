// What each player has done in TANGHALAN on this device: works seen, rooms visited, stickers given.
const KEY = 'bayanihanda_museum_v1::';

export function loadProgress(pid) {
  try {
    const v = JSON.parse(localStorage.getItem(KEY + pid));
    if (v) return { seen: v.seen || {}, rooms: v.rooms || {}, stickers: v.stickers || {}, intro: !!v.intro };
  } catch (e) { /* first visit, or storage is off */ }
  return { seen: {}, rooms: {}, stickers: {}, intro: false };
}

export function saveProgress(pid, p) {
  try { localStorage.setItem(KEY + pid, JSON.stringify(p)); } catch (e) { /* private mode */ }
}

export function forgetProgress(pid) {
  try { localStorage.removeItem(KEY + pid); } catch (e) { /* private mode */ }
}
