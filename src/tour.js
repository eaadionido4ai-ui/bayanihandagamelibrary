// Bayani's island tour, kept per player on this device:
//   offered  Bayani has offered the tour (the welcome sheet on the player's first visit)
//   done     the player finished the tour, skipped it, or left it to try something
// After the first offer, Bayani's greeting card on Home offers the tour again each time the app is opened,
// until the tour is done. "Later" (or the welcome sheet itself) quiets that offer until the app is opened again,
// so it is kept in memory only.

const KEY = 'bayanihanda_tour_v1';
const keyOf = (pid) => KEY + '::' + (pid || 'guest');
const quiet = new Set();

export function loadTour(pid) {
  try { return JSON.parse(localStorage.getItem(keyOf(pid))) || {}; } catch (e) { return {}; }
}

export function saveTour(pid, patch) {
  const t = { ...loadTour(pid), ...patch };
  try { localStorage.setItem(keyOf(pid), JSON.stringify(t)); } catch (e) { /* private mode */ }
  return t;
}

export function forgetTour(pid) {
  try { localStorage.removeItem(keyOf(pid)); } catch (e) { /* private mode */ }
  quiet.delete(pid || 'guest');
}

export const quietOffer = (pid) => { quiet.add(pid || 'guest'); };
export const offerQuiet = (pid) => quiet.has(pid || 'guest');

// Bayani offers the tour in his greeting card: offered once already, not done yet, and not put off this time.
export function cardOffer(pid) {
  const t = loadTour(pid);
  return !!t.offered && !t.done && !offerQuiet(pid);
}
