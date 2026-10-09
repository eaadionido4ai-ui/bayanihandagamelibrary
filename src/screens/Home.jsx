import { sx, pr } from '../ui/sx.js';
import { Mascot, Logo, Wordmark } from '../ui/art.jsx';
import { P, PO, G, LIVE, TIPS, TRIVIA, game } from '../data.js';
import { MuseumCard } from './Tanghalan.jsx';

export default function Home({ c }) {
  const { s, patch, tablet, nick, myAv, count, rank, next, mine } = c;
  const today = new Date();
  const doy = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 864e5);
  const tip = TIPS[doy % TIPS.length], tg = game(tip[1]);
  const lines = [
    { t: 'Hi, ' + nick + '!', s: 'Ready to learn and be a hero today?' },
    { t: 'Tap me anytime!', s: 'I know lots of safety tips and fun facts.' },
    { t: count ? 'You have ' + count + ' badge' + (count > 1 ? 's' : '') + '!' : 'Earn your first badge!', s: next ? next.need + ' more to become ' + next.name + '.' : 'You are a Master DRRM Champion!' },
    { t: 'Did you know?', s: TRIVIA[Math.floor(s.homeN / 4) % TRIVIA.length][0] },
  ];
  const line = lines[s.homeN % lines.length], nextLine = lines[(s.homeN + 1) % lines.length];
  const tapMascot = () => { patch({ homeN: s.homeN + 1, jump: s.jump + 1 }); c.speak(nextLine.t + ' ' + nextLine.s); };

  return (
    <div data-screen-label="Home" className="scroll" style={{ ...sx('position:absolute;inset:0;background:radial-gradient(120% 70% at 50% -10%,#eef6fa,#cfe6ef)'), padding: c.pad }}>
      <div style={sx('max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:16px')}>
        <div style={sx('display:flex;align-items:center;gap:10px')}>
          <Logo size={44} />
          <div style={sx('flex:1;min-width:0')}><Wordmark size={22} sub={10.5} /></div>
          {!tablet && <button onClick={() => c.go('settings')} aria-label="Settings" style={sx('width:44px;height:44px;border-radius:15px;background:#fff;border:2px solid #d5e3ea;box-shadow:0 3px 0 #d5e3ea;font-size:18px;display:flex;align-items:center;justify-content:center;flex:none')}>⚙️</button>}
          <button onClick={() => c.go('players')} aria-label="Switch player" style={sx('display:flex;align-items:center;gap:7px;background:#fff;border:2px solid #d5e3ea;border-radius:999px;padding:3px 12px 3px 3px;font-weight:900;font-size:15px;box-shadow:0 3px 0 #d5e3ea;flex:none')}>
            <span style={{ ...sx('width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px'), background: myAv.bg }}>{myAv.e}</span>{nick}
          </button>
        </div>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:18px;align-items:start')}>
          <div style={sx('display:flex;flex-direction:column;gap:16px')}>
            <div style={sx('display:flex;align-items:flex-end;gap:12px;background:#fff;border-radius:24px;padding:14px 14px 12px;border:2px solid #d5e3ea;box-shadow:0 5px 0 rgba(20,48,66,.08)')}>
              <button onClick={tapMascot} aria-label="Tap Bayani" style={sx('flex:none;display:flex;flex-direction:column;align-items:center;gap:4px')}>
                <Mascot key={'hm' + s.jump} size={tablet ? 84 : 72} jump bob />
                <span style={sx('font-size:11.5px;font-weight:900;color:#a84d04;background:#fff1e3;border-radius:999px;padding:2px 9px')}>Tap me!</span>
              </button>
              <div style={sx('flex:1;min-width:0;align-self:stretch;background:#eef6fa;border-radius:18px;padding:12px 40px 12px 14px;position:relative;display:flex;flex-direction:column;justify-content:center')} aria-live="polite">
                <p style={sx("margin:0;font:800 20px/1.15 'Baloo 2',sans-serif")}>{line.t}</p>
                <p style={sx('margin:4px 0 0;font-size:14.5px;color:#3d5563;font-weight:700;line-height:1.4;text-wrap:pretty')}>{line.s}</p>
                <button onClick={() => c.speak(line.t + ' ' + line.s, true)} aria-label="Read aloud" style={sx('position:absolute;top:8px;right:8px;width:30px;height:30px;border-radius:50%;background:#fff;font-size:14px;box-shadow:0 2px 0 #d5e3ea;display:flex;align-items:center;justify-content:center')}>🔊</button>
              </div>
            </div>
            <div style={sx('background:#fff5df;border:2px solid #ffe2a8;border-radius:24px;padding:14px 16px 16px;display:flex;flex-direction:column;gap:10px')}>
              <div style={sx('display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap')}>
                <span style={sx('font-size:12px;font-weight:900;letter-spacing:1px;color:#7a5400')}>💡 TODAY'S SAFETY TIP</span>
                <span style={sx('font-size:12px;font-weight:800;color:#7a5400')}>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
              <p style={sx('margin:0;font-weight:800;font-size:16.5px;line-height:1.4;text-wrap:pretty')}>{tip[0]}</p>
              <button onClick={() => c.openGame(tg.id)} {...pr('align-self:flex-start;display:flex;align-items:center;gap:8px;background:#128253;color:#fff;font-weight:900;font-size:15px;padding:10px 16px;border-radius:999px;box-shadow:0 4px 0 #0b5e3b', 'transform:translateY(3px);box-shadow:0 1px 0 #0b5e3b')}>{tg.icon} Play {tg.name}</button>
            </div>
            <button onClick={() => c.go('id')} {...pr('display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:linear-gradient(135deg,#ffd76a,#f7a23a);color:#4a2a00;border-radius:22px;box-shadow:0 5px 0 #c85e07;padding:14px 16px', 'transform:translateY(3px);box-shadow:0 2px 0 #c85e07')}>
              <span style={sx('font-size:32px;flex:none')}>🏆</span>
              <span style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:6px')}>
                <span style={sx("font:800 18px/1.1 'Baloo 2',sans-serif;padding-top:2px")}>My Champion ID</span>
                <span style={sx('display:block;height:10px;background:rgba(255,255,255,.65);border-radius:999px;overflow:hidden')}><span style={{ ...sx('display:block;height:100%;background:#128253;border-radius:999px'), width: Math.round(count / LIVE.length * 100) + '%' }} /></span>
                <span style={sx('font-size:13px;font-weight:900')}>{count} of {LIVE.length} badges · {rank[1]}</span>
              </span>
              <span style={sx('font-size:26px;font-weight:900;flex:none')}>›</span>
            </button>
          </div>
          <div style={sx('display:flex;flex-direction:column;gap:12px')}>
            <div><div style={sx("font:800 22px/1.1 'Baloo 2',sans-serif")}>Pick an adventure</div><div style={sx('font-size:14px;font-weight:700;color:#4f6572;margin-top:2px')}>Tap a card to see its games.</div></div>
            <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:12px')}>
              {PO.map((pid) => {
                const p = P[pid], gs = G.filter((x) => x.p === pid), live = gs.filter((x) => !x.soon), soon = gs.length - live.length;
                const done = live.filter((x) => mine[x.id]).length;
                const card = pr('position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;background:#fff;border-radius:22px;padding:14px 13px 12px;box-shadow:0 5px 0 rgba(20,48,66,.1);min-height:176px', 'transform:translateY(3px);box-shadow:0 2px 0 rgba(20,48,66,.1)');
                return (
                  <button key={pid} onClick={() => c.go('games', { filter: pid })} className={card.className} style={{ ...card.style, border: '2px solid ' + p.border }}>
                    <span style={{ ...sx('width:58px;height:58px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.12)'), background: p.grad }}>{p.icon}</span>
                    <span style={sx('font-size:10.5px;font-weight:900;letter-spacing:.4px;text-transform:uppercase;color:#4f6572;line-height:1.2')}>{p.sub}</span>
                    <span style={sx("font:800 19px/1.05 'Baloo 2',sans-serif")}>{p.name}</span>
                    <span style={sx('margin-top:auto;font-size:12.5px;font-weight:900;background:#e3eff4;border-radius:999px;padding:4px 10px')}>{live.length}{live.length === 1 ? ' game' : ' games'}{soon ? ' +' + soon + ' soon' : ''}</span>
                    <span style={sx('position:absolute;top:12px;right:12px;width:40px;height:40px')} aria-label={done + ' of ' + live.length + ' badges'}>
                      <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)', display: 'block' }}>
                        <circle cx="20" cy="20" r="15" fill="none" stroke="#d5e3ea" strokeWidth="4" />
                        <circle cx="20" cy="20" r="15" fill="none" stroke={p.ring} strokeWidth="4" strokeLinecap="round" strokeDasharray="94.25" strokeDashoffset={(94.25 * (1 - done / live.length)).toFixed(2)} style={{ transition: 'stroke-dashoffset .6s ease' }} />
                      </svg>
                      <span style={sx('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900')}>{done}/{live.length}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <MuseumCard c={c} />
          </div>
        </div>
      </div>
    </div>
  );
}
