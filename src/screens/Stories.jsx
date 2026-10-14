import { useEffect, useRef, useState } from 'react';
import { sx, pr } from '../ui/sx.js';
import { Mascot } from '../ui/art.jsx';
import { HV, STORIES, game } from '../data.js';
import { foundIn, loadStories } from '../stories.js';

// Handaventures, the story series under Get Ready (design option B, the storybook shelf):
// the storybook card on the Games screen, the shelf of five stories, a story's intro,
// and the frame the story plays in. The stories themselves are built from stories/.

const BG = 'radial-gradient(120% 70% at 50% -10%,#eef6fa,#cfe6ef)';
const GREEN = 'linear-gradient(135deg,#1e9c66,#0c5c3a)';
const ART = 'stories/art/';
const BACK = 'width:48px;height:48px;border-radius:16px;background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center;flex:none';
const PILL = 'background:#fff;border:2px solid #d5e3ea;border-radius:999px;padding:7px 12px;font-weight:800;font-size:13px;color:#3d5563;white-space:nowrap';
const TAG = 'display:inline-block;font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;background:rgba(0,0,0,.24);border-radius:999px;padding:4px 10px;white-space:nowrap';
const H2 = "font:800 21px/1 'Baloo 2',sans-serif;margin-top:4px";
const FAN = [[0, 25, -8, 1], [15.7, 11.5, -3, 2], [31.4, 3.8, 1, 5], [47.2, 11.5, 5, 2], [62.3, 25, 9, 1]];

export function HvName({ accent = '#ffd873' }) {
  return <><span style={{ color: accent }}>HANDA</span>ventures</>;
}

function progressOf(pid) {
  const all = loadStories(pid);
  let found = 0, total = 0;
  STORIES.forEach((st) => { total += st.endings.length; found += ((all[st.id] && all[st.id].found) || []).length; });
  return { found, total };
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

// The storybook card that stands for all five stories under Get Ready.
export function StoryShelfCard({ c }) {
  const p = progressOf(c.me ? c.me.id : null);
  const wide = !!c.tablet;
  const card = pr('display:flex;flex-direction:' + (wide ? 'row;align-items:center;gap:28px;padding:22px 26px' : 'column;gap:12px;padding:18px') + ';width:100%;text-align:left;border-radius:26px;color:#fff;overflow:hidden;box-shadow:0 6px 0 rgba(0,0,0,.14);background:' + GREEN,
    'transform:translateY(3px);box-shadow:0 3px 0 rgba(0,0,0,.14)');
  const head = (
    <span style={sx('display:block;padding-right:34px')}>
      <span style={sx(TAG)}>{p.found ? '📖 Story series' : '✨ New · Story series'}</span>
      <span style={sx("display:block;font:800 " + (wide ? 36 : 30) + "px/1 'Baloo 2',sans-serif;margin-top:10px;padding-top:4px")}><HvName /></span>
      <span style={sx('display:block;font-size:15px;font-weight:800;margin-top:4px')}>{HV.tagline}</span>
      {wide && <span style={sx('display:block;font-size:14.5px;font-weight:700;margin-top:6px;opacity:.92;line-height:1.4')}>{HV.short}</span>}
    </span>
  );
  const fan = (
    <span aria-hidden="true" style={sx('position:relative;display:block;width:100%;max-width:' + (wide ? 440 : 340) + 'px;align-self:center;aspect-ratio:318/104')}>
      {STORIES.map((st, i) => (
        <img key={st.id} src={ART + st.art + '.webp'} alt=""
          style={{ ...sx('position:absolute;width:37.7%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.28);box-sizing:border-box'), left: FAN[i][0] + '%', top: FAN[i][1] + '%', transform: 'rotate(' + FAN[i][2] + 'deg)', zIndex: FAN[i][3] }} />
      ))}
    </span>
  );
  const foot = (
    <span style={sx('display:flex;align-items:center;justify-content:' + (wide ? 'flex-start;gap:16px' : 'space-between;gap:10px') + ';flex-wrap:wrap')}>
      <span style={sx('font-size:13px;font-weight:900')}>{STORIES.length} stories · {p.found} of {p.total} endings</span>
      <span style={sx('display:flex;align-items:center;gap:6px;background:#fff;color:#0c5c3a;font-weight:900;font-size:14px;padding:8px 14px;border-radius:999px;box-shadow:0 3px 0 rgba(0,0,0,.2);white-space:nowrap')}>Open the stories ›</span>
    </span>
  );
  return (
    <div style={sx('position:relative;grid-column:1 / -1')}>
      <button onClick={c.openStories} className={card.className} style={card.style}>
        {wide
          ? <><span style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:16px')}>{head}{foot}</span><span style={sx('flex:0 0 46%;display:flex;justify-content:center;padding:6px 0')}>{fan}</span></>
          : <>{head}{fan}{foot}</>}
      </button>
      <button onClick={() => c.patch({ sheet: 'credit', sd: HV })} aria-label="Who made Handaventures"
        style={sx('position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(255,255,255,.7);color:#fff;font-size:13px;font-weight:900;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.18)')}>i</button>
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
          <button onClick={() => c.go('games')} aria-label="Back" style={sx(BACK)}>←</button>
          <div style={sx('flex:1')} />
          <button onClick={() => c.patch({ sheet: 'credit', sd: HV })} style={sx(PILL)}>ⓘ Credits</button>
        </div>

        <div style={{ ...sx('border-radius:28px;color:#fff;padding:20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 6px 0 rgba(0,0,0,.12)'), background: GREEN }}>
          <div>
            <span style={sx(TAG)}>🎒 Get Ready · Story series</span>
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
              <span style={sx(TAG)}>🎒 Get Ready · Handaventures</span>
              <h1 style={sx("margin:8px 0 0;font:800 28px/1.05 'Baloo 2',sans-serif")}>{st.name}</h1>
              <p style={sx('margin:6px 0 0;font-size:15px;font-weight:700;line-height:1.45;text-wrap:pretty')}>{st.desc}</p>
            </div>
          </div>

          {st.note && <p style={sx('margin:0;background:#fff1e3;border:2px solid #ffd9ad;border-radius:18px;padding:12px 14px;font-size:14.5px;font-weight:800;line-height:1.45;color:#7a3b00')}>👪 {st.note}</p>}

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
