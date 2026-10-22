// What is added when making a player (October 2026): the date of birth, and for a child (under 18) the parent,
// guardian or teacher who looks after the child's play (and the teacher's school) with the grown-up's privacy
// consent. Grown-ups are welcome to play too: a player 18 or older (the age of majority in the Philippines) needs
// no parent, guardian or teacher and gives their own consent. It is kept on this device only, in
// bayanihanda_profiles_v1, and is never sent anywhere (RA 10173, the Data Privacy Act of 2012). Removing a player
// deletes it. The date of birth tells the library which games and levels fit the player's age, and when to ask for
// a grown-up (see AGE in data.js).
//
// A profile: { born: 'YYYY-MM-DD', grownUp: { role: 'parent' | 'teacher', name, school } (null for a grown-up
//              player), consent: { on, v, by: 'grownup' | 'self' } (consents from before 'by' are a grown-up's),
//              asked: true once an older player has been asked to fill it in, saved: when it was last saved }

const KEY = 'bayanihanda_profiles_v1';
export const CONSENT_VERSION = 1;
export const ADULT = 18;
export const FIRST_YEAR = 1900;
export const isAdult = (age) => age != null && age >= ADULT;

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

// Everything the player page asks for is there: the date of birth and the consent, and for a child the
// grown-up (and the school, for a teacher), whose consent it is.
export function complete(p) {
  if (!p || !validDate(p.born) || !p.consent) return false;
  if (isAdult(ageOn(p.born))) return true;
  const g = p.grownUp;
  return !!(g && g.name && (g.role !== 'teacher' || g.school) && p.consent.by !== 'self');
}

// A birthday the player page accepts: a real date, from FIRST_YEAR on, and not in the future.
export function bornOk(born, now = new Date()) {
  if (!validDate(born) || +born.slice(0, 4) < FIRST_YEAR) return false;
  return ageOn(born, now) >= 0;
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

// The player page's draft: { nick, av, id, by, bm, bd (the birthday's year, typed, and month and day), role, gname,
// school, consent, cfor (whose consent the box was ticked as: 'grownup' or 'self'), had (an older player's details
// were already complete) }. What is still missing, and whether the grown-up part is untouched (an older player may
// be saved without it, and be asked again later). A grown-up player (18 or older) needs no grown-up's name or
// school, and the consent counts only when it was given as the player's own (and for a child, as a grown-up's).
export function draftCheck(d) {
  const born = d.by && d.bm && d.bd ? d.by + '-' + pad(d.bm) + '-' + pad(d.bd) : '';
  const okBorn = bornOk(born), age = okBorn ? ageOn(born) : null, adult = isAdult(age);
  const who = adult ? 'self' : 'grownup';
  const gname = (d.gname || '').trim(), gschool = (d.school || '').trim();
  const name = adult ? '' : gname, school = adult ? '' : gschool;
  const consent = !!d.consent && (d.cfor || 'grownup') === who;
  const missing = [];
  if (!(d.nick || '').trim()) missing.push('a nickname');
  if (!okBorn) missing.push('the birthday');
  if (!adult && !name) missing.push('the grown-up\'s name');
  if (!adult && d.role === 'teacher' && !school) missing.push('the school');
  if (!consent) missing.push('the consent');
  const empty = !d.by && !d.bm && !d.bd && !gname && !gschool && !d.consent;
  return { born, name, school, missing, ok: !missing.length, empty, age, adult, who, consent };
}

export const today = () => {
  const t = new Date();
  return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
};
