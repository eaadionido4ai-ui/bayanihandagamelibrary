import { useEffect, useRef, useState } from 'react';
import { sx, pr } from '../ui/sx.js';
import { Mascot } from '../ui/art.jsx';
import { SLIDE, useReel, Reel, ReelDots } from '../ui/reel.jsx';
import { HV, HV_PEEKS, HV_PILLAR, JOURNEY, STORIES, game } from '../data.js';
import { foundIn, loadStories } from '../stories.js';

// Handaventures, the story series (design option B, the storybook shelf). It has a place of its own, like
// TANGHALAN: the storybook card on Home (below the four pillars) and on Games (More to explore), the shelf of
// five stories, a story's intro, and the frame the story plays in. Each story shows what it covers before,
// during and after its hazard, and each pillar on Games has a card for the part of the stories that belongs
// to it. The stories themselves are built from stories/.

const BG = 'radial-gradient(120% 70% at 50% -10%,#eef6fa,#cfe6ef)';
const GREEN = 'linear-gradient(135deg,#1e9c66,#0c5c3a)';
const ART = 'stories/art/';
const BACK = 'width:48px;height:48px;border-radius:16px;background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center;flex:none';
const PILL = 'background:#fff;border:2px solid #d5e3ea;border-radius:999px;padding:7px 12px;font-weight:800;font-size:13px;color:#3d5563;white-space:nowrap';
const TAG = 'display:inline-block;font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;background:rgba(0,0,0,.24);border-radius:999px;padding:4px 10px;white-space:nowrap';
const H2 = "font:800 21px/1 'Baloo 2',sans-serif;margin-top:4px";
const PEEK = 'stories/peek/';
const SCHIP = 'position:absolute;left:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;font-weight:900;border-radius:999px;padding:4px 9px';
const NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

export function HvName({ accent = '#ffd873' }) {
  return <><span style={{ color: accent }}>HANDA</span>ventures</>;
}

function progressOf(pid) {
  const all = loadStories(pid);
  let found = 0, total = 0;
  STORIES.forEach((st) => { total += st.endings.length; found += ((all[st.id] && all[st.id].found) || []).length; });
  return { found, total };
}

// Before, during and after: the stops a story covers, in the colors of the pillars they belong to
// (getting ready, acting fast, bouncing back). A stop with no scene yet is dashed.
const STOP = { before: ['#0c5c3a', '#e5f6ee'], during: ['#a84d04', '#fff1e3'], after: ['#5a3a9e', '#f1ebfd'] };
const has = (st, k) => !!(st.journey && st.journey[k]);
const covers = (st) => {
  const yes = JOURNEY.filter(([k]) => has(st, k)).map(([, l]) => l.toLowerCase());
  const no = JOURNEY.filter(([k]) => !has(st, k)).map(([, l]) => l.toLowerCase());
  return 'Covers ' + yes.join(', ').replace(/, ([^,]*)$/, ' and $1') + (no.length ? '. Coming soon: ' + no.join(', ') : '');
};

export function JourneyChips({ st }) {
  return (
    <span role="img" aria-label={covers(st)} style={sx('display:flex;gap:4px;flex-wrap:wrap')}>
      {JOURNEY.map(([k, label]) => (has(st, k)
        ? <span key={k} style={{ ...sx('font-size:10.5px;font-weight:900;border-radius:999px;padding:2px 7px'), color: STOP[k][0], background: STOP[k][1] }}>{label}</span>
        : <span key={k} style={sx('font-size:10.5px;font-weight:900;border-radius:999px;padding:1px 6px;border:1.5px dashed #b9ccd8;color:#6d8592')}>{label}</span>))}
    </span>
  );
}

// The journey in a story's intro: what happens before, during and after, so a teacher sees it at a glance.
function Journey({ st, wide }) {
  return (
    <div style={sx('display:grid;grid-template-columns:' + (wide ? 'repeat(3,minmax(0,1fr))' : '1fr') + ';gap:10px')}>
      {JOURNEY.map(([k, label], i) => (has(st, k) ? (
        <div key={k} style={{ ...sx('background:#fff;border-radius:18px;padding:12px 14px;box-shadow:0 4px 0 rgba(20,48,66,.08);display:flex;gap:10px;align-items:flex-start'), borderLeft: '5px solid ' + STOP[k][0] }}>
          <span style={{ ...sx("width:30px;height:30px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font:800 16px/1 'Baloo 2',sans-serif;padding-top:2px"), background: STOP[k][0] }}>{i + 1}</span>
          <span style={sx('min-width:0')}>
            <b style={{ ...sx('display:block;font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase'), color: STOP[k][0] }}>{label}</b>
            <span style={sx('display:block;font-size:14px;font-weight:700;line-height:1.4;color:#25404e;margin-top:2px')}>{st.journey[k]}</span>
          </span>
        </div>
      ) : (
        <div key={k} style={sx('border:2px dashed #b9ccd8;background:rgba(255,255,255,.55);border-radius:18px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start')}>
          <span style={sx("width:30px;height:30px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;color:#6d8592;border:2px dashed #b9ccd8;font:800 16px/1 'Baloo 2',sans-serif;padding-top:2px;box-sizing:border-box")}>{i + 1}</span>
          <span style={sx('min-width:0')}>
            <b style={sx('display:block;font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#4f6572')}>{label}</b>
            <span style={sx('display:block;font-size:14px;font-weight:700;line-height:1.4;color:#4f6572;margin-top:2px')}>Coming soon: a scene for this part of the story.</span>
          </span>
        </div>
      )))}
    </div>
  );
}

function Dots({ n, of }) {
  return (
    <span style={sx('display:flex;gap:4px')} aria-label={n + ' of ' + of + ' endings found'}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} style={sx('width:12px;height:12px;border-radius:50%;box-sizing:border-box;' + (i < n ? 'background:#ffc53d;border:2px solid #eaa100' : 'border:2px solid #c8d9e2'))} />
      ))}
    </span>
  );
}

// Five story pictures for the day, from HV_PEEKS: any five in a row cover before, during and after.
export function peeksOf(day) {
  return Array.from({ length: 5 }, (_, i) => HV_PEEKS[(day * 5 + i) % HV_PEEKS.length]);
}
const stopName = (k) => JOURNEY.find(([key]) => key === k)[1];

// One picture in the carousel: a scene from a story, with the stop it shows (before, during or after) and the
// story's name. Tapping it opens that story's intro.
function Peek({ id, stop, onPick }) {
  const st = game(id), label = stopName(stop);
  return (
    <button onClick={() => onPick(st.id)} aria-label={st.name + ', ' + label.toLowerCase() + ' the ' + st.hazard.toLowerCase() + ': ' + st.journey[stop] + ' Open the story.'}
      style={sx(SLIDE + ';background:#0c5c3a;box-shadow:0 6px 14px rgba(0,0,0,.3)')}>
      <img src={PEEK + st.art + '-' + stop + '.webp'} alt="" draggable="false" style={sx('display:block;width:100%;height:100%;object-fit:cover')} />
      <span style={{ ...sx(SCHIP + ';top:8px;letter-spacing:.5px;text-transform:uppercase;box-shadow:0 2px 0 rgba(0,0,0,.15)'), color: STOP[stop][0], background: STOP[stop][1] }}>{label}</span>
      <span style={sx(SCHIP + ';bottom:8px;max-width:calc(100% - 16px);box-sizing:border-box;color:#fff;background:rgba(14,34,51,.82)')}>{st.icon} {st.name}</span>
    </button>
  );
}

// The storybook card that stands for all five stories, on Home (from="home") and on Games (from="games").
// Like the TANGHALAN card, it has a carousel of pictures from the stories, a different five each day, and
// each picture opens its story; the rest of the card opens the shelf. Where there is room (a tablet, or a
// phone turned sideways) it sits beside the TANGHALAN card and fills the height of its cell, so the two cards
// line up; on a phone held upright they stack.
export function StoryShelfCard({ c, from }) {
  const p = progressOf(c.me ? c.me.id : null);
  const [peeks] = useState(() => peeksOf(Math.floor(Date.now() / 864e5)));
  const r = useReel(peeks.length);
  const open = () => c.openStories(from);
  const go = pr('display:flex;align-items:center;gap:6px;background:#fff;color:#0c5c3a;font-weight:900;font-size:14px;padding:8px 14px;border-radius:999px;box-shadow:0 3px 0 rgba(0,0,0,.2);white-space:nowrap',
    'transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.2)');
  const head = (
    <span style={sx('display:block;padding:0 52px 0 18px')}>
      <span style={sx(TAG)}>{p.found ? '📖 Story series' : '✨ New · Story series'}</span>
      <span style={sx("display:block;font:800 30px/1 'Baloo 2',sans-serif;margin-top:10px;padding-top:4px")}><HvName /></span>
      <span style={sx('display:block;font-size:15px;font-weight:800;margin-top:4px')}>{HV.tagline}</span>
      {c.tablet && <span style={sx('display:block;font-size:14.5px;font-weight:700;margin-top:6px;opacity:.92;line-height:1.4')}>{HV.short}</span>}
      <span aria-label="Before, during and after a hazard" style={sx('display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:10px')}>
        {JOURNEY.map(([k, label], i) => (
          <span key={k} style={sx('display:flex;align-items:center;gap:5px')}>
            {i > 0 && <span aria-hidden="true" style={sx('font-weight:900;opacity:.75')}>›</span>}
            <span style={sx('font-size:12px;font-weight:900;background:rgba(255,255,255,.2);border-radius:999px;padding:3px 10px')}>{label}</span>
          </span>
        ))}
      </span>
    </span>
  );
  const pictures = (
    <Reel r={r} label="Pictures from the Handaventures stories">
      {peeks.map(([id, stop], i) => <Peek key={i} id={id} stop={stop} onPick={c.openGame} />)}
    </Reel>
  );
  const foot = (
    <span style={sx('display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:0 18px;margin-top:auto')}>
      <span style={sx('font-size:13px;font-weight:900')}>{STORIES.length} stories · {p.found} of {p.total} endings</span>
      <button onClick={open} className={go.className} style={go.style}>Open the stories ›</button>
    </span>
  );
  return (
    <div style={sx('position:relative;height:100%')}>
      <div data-hv-card="" onClick={(e) => { if (!e.target.closest('button')) open(); }}
        style={sx('display:flex;flex-direction:column;gap:12px;padding:16px 0 14px;height:100%;box-sizing:border-box;cursor:pointer;border-radius:26px;color:#fff;overflow:hidden;box-shadow:0 6px 0 rgba(0,0,0,.14);background:' + GREEN)}>
        {head}{pictures}<ReelDots r={r} />{foot}
      </div>
      <button onClick={() => c.patch({ sheet: 'credit', sd: HV })} aria-label="Who made Handaventures"
        style={sx('position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(255,255,255,.7);color:#fff;font-size:13px;font-weight:900;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.18)')}>i</button>
    </div>
  );
}

// Handaventures in a pillar's list on Games, after its games: a card like a game's for the part of the stories
// that belongs to the pillar (HV_PILLAR in data.js), with what each story teaches in that part, hazard by
// hazard. It opens the shelf. It takes a whole row of the list, so a game card beside it never stretches to
// its height; where the row is wide, the hazards sit side by side.
export function HvPillarCard({ c, pid }) {
  const hp = HV_PILLAR[pid];
  if (!hp) return null;
  const k = hp.stop, label = stopName(k), n = hp.parts.length;
  const lead = 'In the ' + label + ' part of ' + (n === STORIES.length ? 'all ' : '') + (NUM[n] || n) + (n === 1 ? ' story, ' : ' stories, ') + hp.does + '.';
  const card = pr('display:flex;flex-direction:column;gap:12px;text-align:left;width:100%;height:100%;background:#fff;border-radius:22px;padding:14px;box-shadow:0 5px 0 rgba(20,48,66,.1)',
    'transform:translateY(3px);box-shadow:0 2px 0 rgba(20,48,66,.1)');
  const chip = 'font-size:11px;font-weight:900;letter-spacing:.5px;border-radius:999px;padding:3px 8px';
  return (
    <div data-hv-pillar={pid} style={sx('position:relative;grid-column:1 / -1')}>
      <button onClick={() => c.openStories('games')} className={card.className} style={card.style}>
        <span style={sx('display:flex;gap:14px;align-items:center')}>
          <span style={{ ...sx('width:66px;height:66px;border-radius:20px;flex:none;display:flex;align-items:center;justify-content:center;font-size:34px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.12)'), background: GREEN }}>{HV.icon}</span>
          <span style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px')}>
            <span style={sx("font:800 18.5px/1.1 'Baloo 2',sans-serif;padding:3px 30px 0 0")}><HvName accent="#128253" /></span>
            <span style={sx('font-size:13.5px;font-weight:700;color:#4f6572;line-height:1.35')}>{lead}</span>
            <span style={sx('display:flex;gap:6px;flex-wrap:wrap;margin-top:3px')}>
              <span style={sx(chip + ';background:#e6f3f9;color:#1f5675')}>📖 STORIES</span>
              <span style={{ ...sx(chip), color: STOP[k][0], background: STOP[k][1] }}>{label.toUpperCase()}</span>
            </span>
          </span>
        </span>
        <span style={{ ...sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:7px 18px;border-radius:16px;padding:10px 12px'), background: STOP[k][1] }}>
          {hp.parts.map(([id, text]) => {
            const st = game(id);
            return (
              <span key={id} style={sx('display:flex;gap:8px;align-items:flex-start;font-size:13px;font-weight:700;line-height:1.4;color:#25404e')}>
                <span aria-hidden="true" style={sx('flex:none;width:20px;text-align:center')}>{st.icon}</span>
                <span style={sx('min-width:0')}>
                  <b style={{ fontWeight: 900, color: STOP[k][0] }}>{st.hazard}:</b> {text}
                  {st.grownUp && <span style={sx('display:inline-block;margin-left:6px;font-size:10.5px;font-weight:900;letter-spacing:.3px;background:#fff;color:#a84d04;border-radius:999px;padding:1px 7px')}>👪 WITH A GROWN-UP</span>}
                </span>
              </span>
            );
          })}
        </span>
      </button>
      <button onClick={() => c.patch({ sheet: 'credit', sd: HV })} aria-label="Who made Handaventures"
        style={sx('position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;border:1.5px solid #d5e3ea;color:#4f6572;font-size:13px;font-weight:900;display:flex;align-items:center;justify-content:center;background:#fff')}>i</button>
    </div>
  );
}

// The shelf: the five stories as covers.
export function StoryShelf({ c }) {
  const pid = c.me ? c.me.id : null;
  const all = loadStories(pid);
  const p = progressOf(pid);
  const heroes = STORIES.filter((st) => c.mine[st.id]).length;
  const foundOf = (st) => ((all[st.id] && all[st.id].found) || []).length;
  const [first, ...rest] = STORIES;
  const wide = !!c.tablet;
  const big = pr('display:' + (wide ? 'flex;align-items:stretch' : 'block') + ';width:100%;text-align:left;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 5px 0 rgba(20,48,66,.1)', 'transform:translateY(3px);box-shadow:0 2px 0 rgba(20,48,66,.1)');
  const small = pr('display:flex;flex-direction:column;width:100%;height:100%;text-align:left;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 5px 0 rgba(20,48,66,.1)', 'transform:translateY(3px);box-shadow:0 2px 0 rgba(20,48,66,.1)');
  const chip = 'position:absolute;font-size:10.5px;font-weight:900;letter-spacing:.5px;border-radius:999px;padding:3px 8px';
  return (
    <div data-screen-label="Handaventures" className="scroll" style={{ ...sx('position:absolute;inset:0'), background: BG, padding: c.pad }}>
      <div style={sx('max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:16px')}>
        <div style={sx('display:flex;align-items:center;gap:10px')}>
          <button onClick={() => c.go(c.s.hvFrom || 'games')} aria-label="Back" style={sx(BACK)}>←</button>
          <div style={sx('flex:1')} />
          <button onClick={() => c.patch({ sheet: 'credit', sd: HV })} style={sx(PILL)}>ⓘ Credits</button>
        </div>

        <div style={{ ...sx('border-radius:28px;color:#fff;padding:20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 6px 0 rgba(0,0,0,.12)'), background: GREEN }}>
          <div>
            <span style={sx(TAG)}>📖 Story series · Before, during, after</span>
            <h1 style={sx("margin:10px 0 0;font:800 34px/1 'Baloo 2',sans-serif;padding-top:4px")}><HvName /></h1>
            <p style={sx('margin:4px 0 0;font-size:15px;font-weight:800')}>{HV.tagline} {HV.short}</p>
          </div>
          <div style={sx('display:flex;flex-direction:column;gap:6px')}>
            <span style={sx('display:block;height:12px;background:rgba(255,255,255,.25);border-radius:999px;overflow:hidden')}>
              <span style={{ ...sx('display:block;height:100%;background:#ffd873;border-radius:999px;transition:width .6s ease'), width: Math.round(p.found / p.total * 100) + '%' }} />
            </span>
            <span style={sx('font-size:13px;font-weight:900')}>🏁 {p.found} of {p.total} endings found · 🏅 {heroes} of {STORIES.length} hero badges</span>
          </div>
        </div>

        <div style={sx(H2)}>Pick a story</div>

        <button onClick={() => c.openGame(first.id)} className={big.className} style={big.style}>
          <span style={sx('display:block;position:relative' + (wide ? ';flex:0 0 58%' : ''))}>
            <img src={ART + first.art + '.webp'} alt="" style={sx('display:block;width:100%;aspect-ratio:16/9;object-fit:cover' + (wide ? ';height:100%' : ''))} />
            {foundOf(first) > 0 && <span style={sx(chip + ';top:10px;left:10px;background:#fff;color:#0c5c3a;box-shadow:0 2px 0 rgba(0,0,0,.15)')}>✓ {foundOf(first)} OF {first.endings.length} ENDINGS</span>}
            <span style={sx(chip + ';bottom:10px;left:10px;background:rgba(14,34,51,.72);color:#fff')}>{first.icon} {first.hazard.toUpperCase()}</span>
          </span>
          <span style={sx(wide ? 'flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:14px;padding:18px 20px' : 'display:flex;align-items:center;gap:12px;padding:12px 14px 14px')}>
            <span style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px' + (wide ? ';justify-content:center' : ''))}>
              <span style={sx("font:800 " + (wide ? 24 : 20) + "px/1.1 'Baloo 2',sans-serif;padding-top:3px")}>{first.name}</span>
              <span style={sx('font-size:' + (wide ? 14.5 : 13.5) + 'px;font-weight:700;color:#4f6572;line-height:1.35')}>{first.short}</span>
              <span style={sx('margin-top:4px')}><JourneyChips st={first} /></span>
              <span style={sx('margin-top:4px')}><Dots n={foundOf(first)} of={first.endings.length} /></span>
            </span>
            {wide
              ? <span style={sx('align-self:flex-start;display:flex;align-items:center;gap:8px;background:#d9650a;color:#fff;font-weight:900;font-size:15px;padding:10px 18px;border-radius:999px;box-shadow:0 4px 0 #a34a05')}>▶ Play</span>
              : <span style={sx('flex:none;display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:#d9650a;color:#fff;font-size:18px;box-shadow:0 4px 0 #a34a05')}>▶</span>}
          </span>
        </button>

        <div style={sx('display:grid;grid-template-columns:' + (wide ? 'repeat(4,minmax(0,1fr))' : 'repeat(auto-fill,minmax(min(100%,150px),1fr))') + ';gap:12px')}>
          {rest.map((st) => (
            <button key={st.id} onClick={() => c.openGame(st.id)} className={small.className} style={small.style}>
              <span style={sx('display:block;position:relative;width:100%')}>
                <img src={ART + st.art + '.webp'} alt="" style={sx('display:block;width:100%;aspect-ratio:16/9;object-fit:cover')} />
                <span style={sx(chip + ';bottom:7px;left:7px;background:rgba(14,34,51,.72);color:#fff')}>{st.icon} {st.hazard.toUpperCase()}</span>
                {st.grownUp && <span style={sx(chip + ';top:7px;right:7px;background:#fff1e3;color:#a84d04')}>👪 WITH A GROWN-UP</span>}
              </span>
              <span style={sx('display:flex;flex-direction:column;gap:6px;padding:10px 12px 12px')}>
                <span style={sx("font:800 16.5px/1.1 'Baloo 2',sans-serif;padding-top:2px")}>{st.name}</span>
                <JourneyChips st={st} />
                <Dots n={foundOf(st)} of={st.endings.length} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// A story's intro: how to see it, who to play as, how to play, and the endings found so far.
export function StoryIntro({ c }) {
  const { s, patch, mine } = c;
  const st = game(s.storyId);
  const found = foundIn(c.me ? c.me.id : null, st.id);
  const pick = (on) => ({ ...sx('background:#fff;border-radius:20px;box-shadow:0 4px 0 rgba(20,48,66,.08)'), border: '3px solid ' + (on ? '#128253' : '#d5e3ea') });
  const check = <span style={sx('width:28px;height:28px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;flex:none;background:#128253')}>✓</span>;
  const styles = [['chat', '💬', 'Chat style', 'Like messages in a group chat, with the picture pinned on top.'], ['vn', '🎬', 'Cartoon style', 'The characters act inside the scene, like a cartoon.']];
  const heroes = [['ate', 'Play as Ate', 'Migo\'s big sister'], ['kuya', 'Play as Kuya', 'Migo\'s big brother']];
  const steps = [['1', 'Read', 'Tap Next to see what happens.'], ['2', 'Choose', 'Pick what you would do.'], ['3', 'Learn', 'See what happens and read the safety tip.'], ['4', 'Find endings', 'Safe choices earn stars. Play again for new endings.']];
  const heroName = st.endings[0][1];
  return (
    <div data-screen-label="Story intro" style={{ ...sx('position:absolute;inset:0;display:flex;flex-direction:column'), background: BG }}>
      <div className="scroll" style={{ ...sx('flex:1;min-height:0'), padding: c.pad }}>
        <div style={sx('max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:16px')}>
          <div style={sx('display:flex;align-items:center;gap:10px')}>
            <button onClick={() => c.go(s.storyFrom || 'hv')} aria-label="Back" style={sx(BACK)}>←</button>
            <div style={sx('flex:1')} />
            {mine[st.id]
              ? <span style={sx('font-size:12px;font-weight:900;background:#e5f6ee;color:#0c5c3a;border-radius:999px;padding:6px 11px')}>✓ {st.badge[0]} badge</span>
              : found.length > 0 && <span style={sx('font-size:12px;font-weight:900;background:#e5f6ee;color:#0c5c3a;border-radius:999px;padding:6px 11px')}>✓ {found.length} of {st.endings.length} endings</span>}
            <button onClick={() => patch({ sheet: 'credit', sd: st })} style={sx(PILL)}>ⓘ Credits</button>
          </div>

          <div style={{ ...sx('border-radius:28px;color:#fff;padding:20px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;box-shadow:0 6px 0 rgba(0,0,0,.12)'), background: GREEN }}>
            <span style={sx('width:86px;height:86px;border-radius:26px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:48px;flex:none;box-shadow:0 4px 0 rgba(0,0,0,.15)')}>{st.icon}</span>
            <div style={sx('flex:1 1 200px;min-width:0')}>
              <span style={sx(TAG)}>📖 Handaventures · {st.hazard}</span>
              <h1 style={sx("margin:8px 0 0;font:800 28px/1.05 'Baloo 2',sans-serif")}>{st.name}</h1>
              <p style={sx('margin:6px 0 0;font-size:15px;font-weight:700;line-height:1.45;text-wrap:pretty')}>{st.desc}</p>
            </div>
          </div>

          {st.note && <p style={sx('margin:0;background:#fff1e3;border:2px solid #ffd9ad;border-radius:18px;padding:12px 14px;font-size:14.5px;font-weight:800;line-height:1.45;color:#7a3b00')}>👪 {st.note}</p>}

          <div style={sx(H2)}>Before, during and after</div>
          <Journey st={st} wide={!!c.tablet} />

          <div style={sx('display:flex;align-items:flex-end;gap:10px')}>
            <span style={sx('flex:none')}><Mascot size={56} bob /></span>
            <div style={sx('flex:1;min-width:0;background:#fff;border:2px solid #d5e3ea;border-radius:20px 20px 20px 6px;padding:12px 46px 12px 14px;position:relative')}>
              <div style={sx('font-size:11.5px;font-weight:900;letter-spacing:1px;color:#7a5400')}>💬 BAYANI'S TIP</div>
              <p style={sx('margin:3px 0 0;font-weight:700;font-size:15px;line-height:1.45;text-wrap:pretty')}>{st.tip}</p>
              <button onClick={() => c.speak(st.tip, true)} aria-label="Read aloud" style={sx('position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:50%;background:#eef6fa;font-size:14px;display:flex;align-items:center;justify-content:center')}>🔊</button>
            </div>
          </div>

          <div style={sx(H2)}>Pick how to see the story</div>
          <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:10px')}>
            {styles.map(([id, icon, name, text]) => (
              <button key={id} onClick={() => patch({ storyMode: id })} aria-pressed={s.storyMode === id} style={{ ...sx('display:flex;gap:12px;align-items:center;text-align:left;padding:12px'), ...pick(s.storyMode === id) }}>
                <span style={sx('width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;flex:none;background:#e5f6ee')}>{icon}</span>
                <span style={sx('flex:1;min-width:0')}>
                  <span style={sx("display:block;font:800 16.5px/1.15 'Baloo 2',sans-serif;padding-top:2px")}>{name}</span>
                  <span style={sx('display:block;font-size:13px;font-weight:700;color:#4f6572;line-height:1.35;margin-top:2px')}>{text}</span>
                </span>
                {s.storyMode === id && check}
              </button>
            ))}
          </div>

          <div style={sx(H2)}>Pick your character</div>
          <div style={sx('display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;max-width:520px')}>
            {heroes.map(([id, name, text]) => (
              <button key={id} onClick={() => patch({ storyHero: id })} aria-pressed={s.storyHero === id} style={{ ...sx('position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 10px 12px'), ...pick(s.storyHero === id) }}>
                <img src={ART + id + '.webp'} alt="" style={sx('width:76px;height:76px;border-radius:50%;display:block;background:#fff5df')} />
                <span style={sx("font:800 17px/1.1 'Baloo 2',sans-serif;padding-top:2px")}>{name}</span>
                <span style={sx('font-size:13px;font-weight:700;color:#4f6572')}>{text}</span>
                {s.storyHero === id && <span style={sx('position:absolute;top:8px;right:8px')}>{check}</span>}
              </button>
            ))}
          </div>

          <div style={sx(H2)}>How to play</div>
          <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:10px')}>
            {steps.map((x) => (
              <div key={x[0]} style={sx('background:#fff;border-radius:18px;padding:14px;box-shadow:0 4px 0 rgba(20,48,66,.08);display:flex;flex-direction:column;gap:6px')}>
                <span style={sx("width:40px;height:40px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font:800 19px/1 'Baloo 2',sans-serif;padding-top:3px;background:#128253")}>{x[0]}</span>
                <b style={sx('font-size:16px;font-weight:900')}>{x[1]}</b>
                <span style={sx('font-size:13.5px;font-weight:700;color:#4f6572;line-height:1.4')}>{x[2]}</span>
              </div>
            ))}
          </div>

          <div style={sx('background:#fff;border-radius:22px;padding:14px 12px;box-shadow:0 4px 0 rgba(20,48,66,.08);display:flex;flex-direction:column;gap:10px')}>
            <div style={sx('font-size:12px;font-weight:900;letter-spacing:1px;color:#4f6572;padding-left:4px')}>🏁 ENDINGS FOUND · {found.length} OF {st.endings.length}</div>
            <div style={sx('display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px')}>
              {st.endings.map(([key, name, icon]) => (found.indexOf(key) >= 0 ? (
                <div key={key} style={sx('display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center')}>
                  <span style={sx('width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#ffd76a,#f7a23a);box-shadow:0 3px 0 #c85e07;display:flex;align-items:center;justify-content:center;font-size:24px')}>{icon}</span>
                  <span style={sx('font-size:11.5px;font-weight:800;line-height:1.2')}>{name}</span>
                </div>
              ) : (
                <div key={key} style={sx('display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center')}>
                  <span style={sx("width:50px;height:50px;box-sizing:border-box;border-radius:50%;border:2px dashed #b9ccd8;background:rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;font:800 20px/1 'Baloo 2',sans-serif;color:#8fa3b0")}>?</span>
                  <span style={sx('font-size:11.5px;font-weight:800;line-height:1.2;color:#4f6572')}>???</span>
                </div>
              )))}
            </div>
            <p style={sx('margin:0;font-size:13px;font-weight:800;color:#3d5563;text-align:center')}>{mine[st.id] ? '🏅 You earned the ' + st.badge[0] + ' badge!' : '🏅 Reach "' + heroName + '" to earn the ' + st.badge[0] + ' badge.'}</p>
          </div>
        </div>
      </div>
      <div style={sx('flex:none;padding:12px 18px calc(env(safe-area-inset-bottom, 0px) + 22px);background:linear-gradient(rgba(207,230,239,0),#cfe6ef 35%);display:flex;justify-content:center')}>
        <button onClick={c.startStory} {...pr("width:100%;max-width:440px;background:#d9650a;color:#fff;font:800 22px 'Baloo 2',sans-serif;padding:14px 24px 11px;border-radius:999px;box-shadow:0 6px 0 #a34a05", 'transform:translateY(4px);box-shadow:0 2px 0 #a34a05')}>▶ Start the story</button>
      </div>
    </div>
  );
}

// The story itself, in a frame. It reports endings and leaving back to the library.
export function StoryPlay({ c }) {
  const st = game(c.s.storyId);
  const frame = useRef(null);
  const live = useRef(c);
  live.current = c;
  // Fixed at the start, so saving an ending never reloads the story.
  const [src] = useState(() => 'stories/' + st.file + '?embed=1&mode=' + c.s.storyMode + '&hero=' + c.s.storyHero
    + '&found=' + foundIn(c.me ? c.me.id : null, st.id).join(','));
  useEffect(() => {
    function onMessage(e) {
      const d = e.data;
      if (!frame.current || e.source !== frame.current.contentWindow || !d || d.source !== 'handaventures' || d.story !== st.sid) return;
      if (d.type === 'end') live.current.storyEnded(st, d);
      else if (d.type === 'exit') live.current.go('story');
      else if (d.type === 'mode' && (d.mode === 'chat' || d.mode === 'vn')) live.current.patch({ storyMode: d.mode });
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [st]);
  return (
    <div data-screen-label="Story" style={sx('position:absolute;inset:0;background:#e8f2f7;padding:env(safe-area-inset-top, 0px) 0 env(safe-area-inset-bottom, 0px);display:flex')}>
      <iframe ref={frame} src={src} title={st.name} style={sx('flex:1;width:100%;height:100%;border:0;display:block;background:#e8f2f7')} />
    </div>
  );
}
