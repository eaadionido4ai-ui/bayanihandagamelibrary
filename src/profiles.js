// What a grown-up adds when making a player (October 2026): the child's date of birth, the parent, guardian or
// teacher who looks after the child's play (and the teacher's school), and the grown-up's privacy consent.
// It is kept on this device only, in bayanihanda_profiles_v1, and is never sent anywhere (RA 10173, the Data
// Privacy Act of 2012). Removing a player deletes it. The date of birth tells the library which games and
// levels fit the child's age, and when to ask for a grown-up (see AGE in data.js).
//
// A profile: { born: 'YYYY-MM-DD', grownUp: { role: 'parent' | 'teacher', name, school }, consent: { on, v },
//              asked: true once an older player has been asked to fill it in, saved: when it was last saved }

const KEY = 'bayanihanda_profiles_v1';
export const CONSENT_VERSION = 1;

function all() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
}
function put(o) {
  try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* storage full or blocked */ }
}

export function profileOf(pid) {
  return (pid && all()[pid]) || null;
}
export function saveProfile(pid, p) {
  if (!pid) return;
  const o = all();
  o[pid] = { ...(o[pid] || {}), ...p, saved: Date.now() };
  put(o);
}
export function forgetProfile(pid) {
  const o = all();
  if (o[pid]) { delete o[pid]; put(o); }
}

// The grown-up from the player saved last, so a teacher setting up a class does not type it each time.
// Removing that player removes this too, since it is read from the players' own details.
export function lastGrownUp() {
  let best = null;
  Object.values(all()).forEach((p) => { if (p && p.grownUp && p.grownUp.name && (!best || (p.saved || 0) > (best.saved || 0))) best = p; });
  return best ? best.grownUp : null;
}

// Everything the player page asks for is there: the date of birth, the grown-up (and the school, for a
// teacher) and the consent.
export function complete(p) {
  const g = p && p.grownUp;
  return !!(p && validDate(p.born) && g && g.name && (g.role !== 'teacher' || g.school) && p.consent);
}

export function validDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return false;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3];
}

// Age in whole years on a given day (today by default); null without a valid date of birth.
export function ageOn(born, today = new Date()) {
  if (!validDate(born)) return null;
  const [y, m, d] = born.split('-').map(Number);
  let a = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) a--;
  return a;
}

const pad = (n) => String(n).padStart(2, '0');
export const daysIn = (y, m) => (m ? new Date(+y || 2000, +m, 0).getDate() : 31);

// The player page's draft: { nick, av, id, by, bm, bd (the birthday's year, month and day), role, gname, school,
// consent, had (an older player's details were already complete) }. What is still missing, and whether the
// grown-up part is untouched (an older player may be saved without it, and be asked again later).
export function draftCheck(d) {
  const born = d.by && d.bm && d.bd ? d.by + '-' + pad(d.bm) + '-' + pad(d.bd) : '';
  const name = (d.gname || '').trim(), school = (d.school || '').trim();
  const missing = [];
  if (!(d.nick || '').trim()) missing.push('a nickname');
  if (!validDate(born)) missing.push('the birthday');
  if (!name) missing.push('the grown-up\'s name');
  if (d.role === 'teacher' && !school) missing.push('the school');
  if (!d.consent) missing.push('the consent');
  const empty = !d.by && !d.bm && !d.bd && !name && !school && !d.consent;
  return { born, name, school, missing, ok: !missing.length, empty };
}

export const today = () => {
  const t = new Date();
  return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
};
