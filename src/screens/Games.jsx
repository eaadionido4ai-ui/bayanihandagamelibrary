import { sx, pr } from '../ui/sx.js';
import { Mascot } from '../ui/art.jsx';
import { P, PO, G, LIVE, howTo, pillarOf } from '../data.js';
import { MuseumTile } from './Tanghalan.jsx';

const BG = 'radial-gradient(120% 70% at 50% -10%,#eef6fa,#cfe6ef)';

export function Games({ c }) {
  const { s, patch, mine } = c;
  const chips = [{ id: 'all', icon: '✨', label: 'All', bg: '#16303f' }].concat(PO.map((pid) => ({ id: pid, icon: P[pid].icon, label: P[pid].name, bg: P[pid].text })));
  const banner = P[s.filter];
  const groups = s.filter === 'all' ? PO : [s.filter];
  return (
    <div data-screen-label="Games" className="scroll" style={{ ...sx('position:absolute;inset:0'), background: BG, padding: c.pad }}>
      <div style={sx('max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:14px')}>
        <div>
          <div style={sx("font:800 31px/1.05 'Baloo 2',sans-serif;padding-top:4px")}>Games</div>
          <div style={sx('font-size:14.5px;font-weight:700;color:#4f6572;margin-top:2px')}>{LIVE.length} games to play, {G.length - LIVE.length} coming soon</div>
        </div>
        <div className="hscroll" style={sx('display:flex;gap:8px;padding:2px 0 6px')}>
          {chips.map((ch) => (
            <button key={ch.id} onClick={() => patch({ filter: ch.id })} aria-pressed={s.filter === ch.id} style={sx('flex:none')}>
              {s.filter === ch.id
                ? <span style={{ ...sx('display:flex;align-items:center;gap:6px;padding:9px 14px;border-radius:999px;color:#fff;font-weight:900;font-size:14px;box-shadow:0 3px 0 rgba(0,0,0,.2);white-space:nowrap'), background: ch.bg }}>{ch.icon} {ch.label}</span>
                : <span style={sx('display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;background:#fff;border:2px solid #d5e3ea;font-weight:800;font-size:14px;white-space:nowrap')}>{ch.icon} {ch.label}</span>}
            </button>
          ))}
        </div>
        {banner && (() => {
          const live = G.filter((x) => x.p === banner.id && !x.soon);
          return (
            <div style={{ ...sx('border-radius:24px;color:#fff;padding:16px 18px;display:flex;gap:14px;align-items:center;box-shadow:0 5px 0 rgba(0,0,0,.12)'), background: banner.banner }}>
              <span style={sx('width:62px;height:62px;border-radius:20px;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:33px;flex:none')}>{banner.icon}</span>
              <div style={sx('flex:1;min-width:0')}>
                <span style={sx('display:inline-block;font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;background:rgba(0,0,0,.22);border-radius:999px;padding:3px 9px')}>{banner.sub} Pillar</span>
                <div style={sx("font:800 23px/1.1 'Baloo 2',sans-serif;margin-top:5px")}>{banner.name}</div>
                <p style={sx('margin:3px 0 0;font-size:14.5px;font-weight:700;line-height:1.4')}>{banner.lead}</p>
                <p style={sx('margin:6px 0 0;font-size:13px;font-weight:900')}>🏅 {live.filter((x) => mine[x.id]).length} of {live.length} badges earned</p>
              </div>
            </div>
          );
        })()}
        {groups.map((pid) => {
          const p = P[pid];
          return (
            <div key={pid} style={sx('display:flex;flex-direction:column;gap:12px;margin-top:4px')}>
              {s.filter === 'all' && (
                <div style={{ ...sx('display:flex;align-items:center;gap:10px;font-size:13px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase'), color: p.text }}>
                  <span>{p.icon} {p.name}</span><span style={sx('flex:1;height:2px;background:#c8d9e2;border-radius:2px')} />
                </div>
              )}
              <div style={sx('display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:12px')}>
                {G.filter((x) => x.p === pid).map((g) => (g.soon ? (
                  <div key={g.id} onClick={() => c.openGame(g.id)} style={sx('display:flex;gap:14px;align-items:center;background:rgba(255,255,255,.55);border:2px dashed #b9ccd8;border-radius:22px;padding:14px;cursor:pointer')}>
                    <span style={sx('width:66px;height:66px;border-radius:20px;flex:none;background:#b9c6cf;display:flex;align-items:center;justify-content:center;font-size:34px;filter:grayscale(.6)')}>{g.icon}</span>
                    <span style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px')}>
                      <span style={sx("font:800 18.5px/1.1 'Baloo 2',sans-serif;padding-top:3px;color:#3d5563")}>{g.name}</span>
                      <span style={sx('font-size:13.5px;font-weight:700;color:#4f6572;line-height:1.35')}>{g.short}</span>
                      <span style={sx('align-self:flex-start;font-size:11px;font-weight:900;letter-spacing:.5px;background:#eef2f4;color:#4f6572;border-radius:999px;padding:3px 8px;margin-top:3px')}>COMING SOON</span>
                    </span>
                  </div>
                ) : (
                  <div key={g.id} style={sx('position:relative')}>
                    <button onClick={() => c.openGame(g.id)} {...pr('display:flex;gap:14px;align-items:center;text-align:left;width:100%;height:100%;background:#fff;border-radius:22px;padding:14px;box-shadow:0 5px 0 rgba(20,48,66,.1)', 'transform:translateY(3px);box-shadow:0 2px 0 rgba(20,48,66,.1)')}>
                      <span style={{ ...sx('width:66px;height:66px;border-radius:20px;flex:none;display:flex;align-items:center;justify-content:center;font-size:34px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.12)'), background: p.grad }}>{g.icon}</span>
                      <span style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px')}>
                        <span style={sx("font:800 18.5px/1.1 'Baloo 2',sans-serif;padding:3px 30px 0 0")}>{g.name}</span>
                        <span style={sx('font-size:13.5px;font-weight:700;color:#4f6572;line-height:1.35')}>{g.short}</span>
                        <span style={sx('display:flex;gap:6px;flex-wrap:wrap;margin-top:3px')}>
                          <span style={sx('font-size:11px;font-weight:900;letter-spacing:.5px;background:#e6f3f9;color:#1f5675;border-radius:999px;padding:3px 8px')}>3D · PLAY NOW</span>
                          {mine[g.id] && <span style={sx('font-size:11px;font-weight:900;letter-spacing:.5px;background:#e5f6ee;color:#0c5c3a;border-radius:999px;padding:3px 8px')}>✓ BADGE EARNED</span>}
                        </span>
                      </span>
                    </button>
                    <button onClick={() => patch({ sheet: 'credit', sd: g })} aria-label={'Who made ' + g.name}
                      style={sx('position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;border:1.5px solid #d5e3ea;color:#4f6572;font-size:13px;font-weight:900;display:flex;align-items:center;justify-content:center;background:#fff')}>i</button>
                  </div>
                )))}
              </div>
            </div>
          );
        })}
        {s.filter === 'all' && (
          <div style={sx('display:flex;flex-direction:column;gap:12px;margin-top:4px')}>
            <div style={sx('display:flex;align-items:center;gap:10px;font-size:13px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#4f6572')}>
              <span>🏛️ More to explore</span><span style={sx('flex:1;height:2px;background:#c8d9e2;border-radius:2px')} />
            </div>
            <div style={sx('display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:12px')}><MuseumTile c={c} /></div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Intro({ c }) {
  const { s, patch, mine } = c;
  const g = G.find((x) => x.id === s.gameId) || LIVE[0], gp = pillarOf(g);
  const how = howTo(g, s.mode);
  return (
    <div data-screen-label="Game intro" style={{ ...sx('position:absolute;inset:0;display:flex;flex-direction:column'), background: BG }}>
      <div className="scroll" style={{ ...sx('flex:1;min-height:0'), padding: c.pad }}>
        <div style={sx('max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:16px')}>
          <div style={sx('display:flex;align-items:center;gap:10px')}>
            <button onClick={() => c.go(s.from || 'games')} aria-label="Back" style={sx('width:48px;height:48px;border-radius:16px;background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center;flex:none')}>←</button>
            <div style={sx('flex:1')} />
            {mine[g.id] && <span style={sx('font-size:12px;font-weight:900;background:#e5f6ee;color:#0c5c3a;border-radius:999px;padding:6px 11px')}>✓ {g.badge[0]} badge</span>}
            <button onClick={() => patch({ sheet: 'credit', sd: g })} style={sx('background:#fff;border:2px solid #d5e3ea;border-radius:999px;padding:7px 12px;font-weight:800;font-size:13px;color:#3d5563;white-space:nowrap')}>ⓘ Credits</button>
          </div>
          <div style={{ ...sx('border-radius:28px;color:#fff;padding:20px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;box-shadow:0 6px 0 rgba(0,0,0,.12)'), background: gp.banner }}>
            <span style={sx('width:86px;height:86px;border-radius:26px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:48px;flex:none;box-shadow:0 4px 0 rgba(0,0,0,.15)')}>{g.icon}</span>
            <div style={sx('flex:1 1 220px;min-width:0')}>
              <span style={sx('display:inline-block;font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;background:rgba(0,0,0,.24);border-radius:999px;padding:4px 10px;white-space:nowrap')}>{gp.icon} {gp.name}</span>
              <div style={sx("font:800 28px/1.05 'Baloo 2',sans-serif;margin-top:8px")}>{g.name}</div>
              <p style={sx('margin:6px 0 0;font-size:15px;font-weight:700;line-height:1.45;text-wrap:pretty')}>{g.desc}</p>
            </div>
          </div>
          <div style={sx('display:flex;align-items:flex-end;gap:10px')}>
            <span style={sx('flex:none')}><Mascot size={56} bob /></span>
            <div style={sx('flex:1;min-width:0;background:#fff;border:2px solid #d5e3ea;border-radius:20px 20px 20px 6px;padding:12px 46px 12px 14px;position:relative')}>
              <div style={sx('font-size:11.5px;font-weight:900;letter-spacing:1px;color:#7a5400')}>💬 BAYANI'S TIP</div>
              <p style={sx('margin:3px 0 0;font-weight:700;font-size:15px;line-height:1.45;text-wrap:pretty')}>{how.tip}</p>
              <button onClick={() => c.speak(how.tip, true)} aria-label="Read aloud" style={sx('position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:50%;background:#eef6fa;font-size:14px;display:flex;align-items:center;justify-content:center')}>🔊</button>
            </div>
          </div>
          {g.modes && (
            <>
              <div style={sx("font:800 21px/1 'Baloo 2',sans-serif;margin-top:4px")}>{g.modesLabel}</div>
              <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:10px')}>
                {g.modes.map((m, i) => (
                  <button key={m[1]} onClick={() => patch((p) => ({ mode: i, modes: { ...p.modes, [g.id]: i } }))} aria-pressed={i === s.mode}
                    style={{ ...sx('display:flex;gap:12px;align-items:center;text-align:left;background:#fff;border-radius:20px;padding:12px;box-shadow:0 4px 0 rgba(20,48,66,.08)'), border: '3px solid ' + (i === s.mode ? gp.ring : '#d5e3ea') }}>
                    <span style={{ ...sx('width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;flex:none'), background: gp.tint }}>{m[0]}</span>
                    <span style={sx('flex:1;min-width:0')}>
                      <span style={sx("display:block;font:800 16.5px/1.15 'Baloo 2',sans-serif;padding-top:2px")}>{m[1]}</span>
                      <span style={sx('display:block;font-size:13px;font-weight:700;color:#4f6572;line-height:1.35;margin-top:2px')}>{m[2]}</span>
                    </span>
                    {i === s.mode && <span style={{ ...sx('width:28px;height:28px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;flex:none'), background: gp.text }}>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
          <div style={sx("font:800 21px/1 'Baloo 2',sans-serif;margin-top:4px")}>{g.stepsTitle || 'How to play'}</div>
          <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:10px')}>
            {how.steps.map((st, i) => (
              <div key={i} style={sx('background:#fff;border-radius:18px;padding:14px;box-shadow:0 4px 0 rgba(20,48,66,.08);display:flex;flex-direction:column;gap:6px')}>
                <span style={{ ...sx("width:40px;height:40px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font:800 19px/1 'Baloo 2',sans-serif;padding-top:3px"), background: gp.text }}>{st[0]}</span>
                <b style={sx('font-size:16px;font-weight:900')}>{st[1]}</b>
                <span style={sx('font-size:13.5px;font-weight:700;color:#4f6572;line-height:1.4')}>{st[2]}</span>
              </div>
            ))}
          </div>
          {how.note && <p style={sx('margin:0;font-size:13.5px;color:#3d5563;font-weight:700;font-style:italic;line-height:1.45')}>{how.note}</p>}
        </div>
      </div>
      <div style={sx('flex:none;padding:12px 18px calc(env(safe-area-inset-bottom, 0px) + 22px);background:linear-gradient(rgba(207,230,239,0),#cfe6ef 35%);display:flex;justify-content:center')}>
        <button onClick={() => c.startGame()} {...pr("width:100%;max-width:440px;background:#d9650a;color:#fff;font:800 22px 'Baloo 2',sans-serif;padding:14px 24px 11px;border-radius:999px;box-shadow:0 6px 0 #a34a05", 'transform:translateY(4px);box-shadow:0 2px 0 #a34a05')}>▶ {g.start || 'Start'}</button>
      </div>
    </div>
  );
}
