import { sx, pr } from '../ui/sx.js';
import { Mascot, Flame, Dots } from '../ui/art.jsx';
import { AV, MAX_PLAYERS, av } from '../data.js';

const BG = 'radial-gradient(120% 70% at 50% -10%,#eef6fa,#cfe6ef)';
const CTA = 'width:100%;background:#d9650a;color:#fff;font:800 21px \'Baloo 2\',sans-serif;padding:14px 24px 11px;border-radius:999px;box-shadow:0 6px 0 #a34a05';
const CTA_ON = 'transform:translateY(4px);box-shadow:0 2px 0 #a34a05';
const NOTE = 'margin:0;background:#eef6fa;border:1px solid #d5e3ea;border-radius:14px;padding:12px 14px;color:#2f5d77;font-weight:700;font-size:14px;line-height:1.45';
const BACK = 'width:48px;height:48px;border-radius:16px;background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center;flex:none';

export function Splash({ c }) {
  return (
    <div data-screen-label="Splash" onClick={c.afterSplash} style={sx('position:absolute;inset:0;background:radial-gradient(130% 90% at 50% 30%,#f58a1f 0%,#d9650a 50%,#9c4504 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;color:#fff;text-align:center;padding:40px 24px;cursor:pointer')}>
      <div style={sx('width:128px;height:128px;border-radius:38px;background:#fff;box-shadow:0 10px 0 rgba(120,50,0,.35);display:flex;align-items:flex-end;justify-content:center;padding-bottom:24px')}><Flame w={48} /></div>
      <div>
        <div style={sx("font:800 46px/1 'Baloo 2',sans-serif;padding-top:6px")}>BAYANIHanda</div>
        <div style={sx('font-size:15px;font-weight:900;letter-spacing:5px;text-transform:uppercase;margin-top:6px')}>Game Library</div>
      </div>
      <p style={sx('margin:0;font-weight:800;font-size:20px;font-style:italic')}>“Play, learn, and be ready.”</p>
      <Dots />
      <div style={sx('position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom, 0px) + 40px);font-size:12px;font-weight:800;letter-spacing:.6px')}>University of the Philippines Resilience Institute</div>
    </div>
  );
}

const PILLAR_TILES = [
  ['#bfe0ef', '#6db4d6,#2a6b8f', '🛡️', 'Stop Hazards Early'],
  ['#bfe9d4', '#5fd39b,#128253', '🎒', 'Get Ready'],
  ['#ffd9ad', '#ffb04d,#f2760c', '🚨', 'Act Fast'],
  ['#ddcdfa', '#c3a6ff,#7a53c6', '🏘️', 'Bounce Back'],
];

function WelcomeText({ title, children }) {
  return (
    <div style={sx('display:flex;flex-direction:column;gap:8px')}>
      <div style={sx("font:800 32px/1.05 'Baloo 2',sans-serif")}>{title}</div>
      <p style={sx('margin:0;font-size:17px;font-weight:700;color:#3d5563;line-height:1.45;text-wrap:pretty')}>{children}</p>
    </div>
  );
}

export function Welcome({ c }) {
  const { s, patch, tablet } = c;
  const nextStep = () => (s.ws < 2 ? patch({ ws: s.ws + 1 }) : c.newPlayer());
  return (
    <div data-screen-label="Welcome" style={sx('position:absolute;inset:0;display:flex;flex-direction:column;background:radial-gradient(120% 70% at 50% 0%,#fff5df,#cfe6ef 75%);padding:calc(env(safe-area-inset-top, 0px) + 12px) 24px calc(env(safe-area-inset-bottom, 0px) + 36px)')}>
      <div style={sx('display:flex;justify-content:flex-end;min-height:40px')}>
        {s.ws < 2 && <button onClick={c.newPlayer} style={sx('font-weight:800;font-size:15px;color:#4f6572;padding:8px 12px')}>Skip</button>}
      </div>
      <div style={sx('flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center;max-width:520px;width:100%;margin:0 auto')}>
        {s.ws === 0 && (
          <>
            <div style={sx('display:flex;flex-direction:column;align-items:center;gap:8px')}>
              <div style={sx("background:#fff;border:2px solid #d5e3ea;border-radius:22px;padding:8px 18px 6px;font:800 21px 'Baloo 2',sans-serif;box-shadow:0 4px 0 rgba(20,48,66,.08)")}>Hello! 👋</div>
              <Mascot size={tablet ? 170 : 150} wave bob />
            </div>
            <WelcomeText title="Hi! I'm Bayani.">I'm a young hero, and I'll help you learn to stay safe, one game at a time.</WelcomeText>
          </>
        )}
        {s.ws === 1 && (
          <>
            <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:320px')}>
              {PILLAR_TILES.map((t) => (
                <div key={t[3]} style={{ ...sx('background:#fff;border-radius:20px;padding:12px;display:flex;flex-direction:column;align-items:center;gap:6px;box-shadow:0 4px 0 rgba(20,48,66,.08)'), border: '2px solid ' + t[0] }}>
                  <span style={{ ...sx('width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:27px'), background: 'linear-gradient(135deg,' + t[1] + ')' }}>{t[2]}</span>
                  <span style={sx("font:800 15px/1.1 'Baloo 2',sans-serif")}>{t[3]}</span>
                </div>
              ))}
            </div>
            <WelcomeText title="Four adventures">Stop hazards early, get ready, act fast, and bounce back. Each adventure has its own games.</WelcomeText>
          </>
        )}
        {s.ws === 2 && (
          <>
            <div style={sx('width:260px;background:#fff;border-radius:22px;overflow:hidden;border:3px solid #f2760c;box-shadow:0 8px 0 rgba(20,48,66,.1);transform:rotate(-3deg)')}>
              <div style={sx("background:linear-gradient(135deg,#d9650a,#c62f22);color:#fff;padding:10px 10px 6px;text-align:center;font:800 22px/1 'Baloo 2',sans-serif")}>BAYANIHanda</div>
              <div style={sx('padding:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px')}>
                {['🎒', '🧯'].map((e) => <span key={e} style={sx('height:48px;border-radius:12px;background:#eafaf1;border:2px solid #7fd8a8;display:flex;align-items:center;justify-content:center;font-size:22px')}>{e}</span>)}
                {['🗺️', '🧭'].map((e) => <span key={e} style={sx('height:48px;border-radius:12px;background:#f6f9fb;border:2px solid #d5e3ea;display:flex;align-items:center;justify-content:center;font-size:22px;filter:grayscale(1);opacity:.45')}>{e}</span>)}
              </div>
            </div>
            <WelcomeText title="Earn badges">Finish a game with flying colors to earn a badge for your Champion ID. Then save it, share it, or print it!</WelcomeText>
          </>
        )}
      </div>
      <div style={sx('display:flex;flex-direction:column;align-items:center;gap:18px;max-width:420px;width:100%;margin:0 auto')}>
        <div style={sx('display:flex;gap:8px')}>
          {[0, 1, 2].map((i) => <span key={i} style={{ display: 'block', width: i === s.ws ? 26 : 10, height: 10, borderRadius: 5, background: i === s.ws ? '#d9650a' : '#b9ccd8' }} />)}
        </div>
        <button onClick={nextStep} {...pr(CTA, CTA_ON)}>{s.ws < 2 ? 'Next' : "Let's start"}</button>
      </div>
    </div>
  );
}

export function AddPlayer({ c }) {
  const { s, patch, players } = c;
  const d = s.draft, da = av(d.av), dn = d.nick.trim();
  const editing = !!d.id;
  const back = () => c.go(players.length ? 'players' : 'welcome', { ws: 2 });
  const cta = editing ? 'Save' : "Let's play";
  return (
    <div data-screen-label="Add player" className="scroll" style={{ ...sx('position:absolute;inset:0'), background: BG, padding: c.pad }}>
      <div style={sx('max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:14px')}>
        <div style={sx('display:flex;align-items:center;gap:12px')}>
          <button onClick={back} aria-label="Back" style={sx(BACK)}>←</button>
          <div style={sx("font:800 26px/1 'Baloo 2',sans-serif;padding-top:4px")}>{editing ? 'Edit player' : 'New player'}</div>
        </div>
        <div style={sx('display:flex;flex-direction:column;align-items:center;gap:8px;margin:6px 0 2px')}>
          <span style={{ ...sx('width:112px;height:112px;border-radius:50%;font-size:62px;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 -5px 0 rgba(0,0,0,.1),0 6px 0 rgba(20,48,66,.1)'), background: da.bg }}>{da.e}</span>
          <span style={{ ...sx("font:800 23px/1.1 'Baloo 2',sans-serif;min-height:26px"), color: dn ? '#16303f' : '#8fa3b0' }}>{dn || 'Your nickname'}</span>
        </div>
        <div style={sx("font:800 19px/1 'Baloo 2',sans-serif")}>Choose your avatar</div>
        <div style={sx('display:grid;grid-template-columns:repeat(4,1fr);gap:12px;justify-items:center')}>
          {AV.map((a) => (
            <button key={a.id} onClick={() => patch({ draft: { ...d, av: a.id } })} aria-label={a.id} aria-pressed={a.id === d.av}
              style={{ ...sx('position:relative;width:70px;height:70px;border-radius:50%;font-size:36px;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 -3px 0 rgba(0,0,0,.08)'), background: a.bg, border: '4px solid ' + (a.id === d.av ? '#f2760c' : 'transparent') }}>
              {a.e}
              {a.id === d.av && <span style={sx('position:absolute;right:-6px;bottom:-4px;width:26px;height:26px;border-radius:50%;background:#d9650a;color:#fff;font-size:14px;font-weight:900;display:flex;align-items:center;justify-content:center;border:3px solid #fff')}>✓</span>}
            </button>
          ))}
        </div>
        <div style={sx("font:800 19px/1 'Baloo 2',sans-serif;margin-top:6px")}>Your nickname</div>
        <div style={sx('position:relative')}>
          <input value={d.nick} onChange={(e) => { const v = e.target.value.replace(/[<>]/g, '').slice(0, 14); patch((p) => ({ draft: { ...p.draft, nick: v } })); }}
            onKeyDown={(e) => { if (e.key === 'Enter') c.savePlayer(); }}
            maxLength={14} placeholder="Your nickname" autoComplete="off" aria-label="Your nickname" className="fo"
            style={sx('width:100%;border:3px solid #d5e3ea;border-radius:18px;padding:15px 64px 15px 16px;font-size:19px;font-weight:800;color:#16303f;background:#fff;outline:none')} />
          <span style={sx('position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:800;color:#4f6572')}>{d.nick.length}/14</span>
        </div>
        <p style={sx(NOTE)}>🔒 We only save a nickname and a picture, right here on this device. No full names, no birthdays, nothing is uploaded.</p>
        <div style={sx('display:flex;flex-direction:column;gap:12px;margin-top:6px')}>
          {dn ? <button onClick={c.savePlayer} {...pr(CTA, CTA_ON)}>{cta}</button>
            : <div style={sx("width:100%;text-align:center;background:#c9d6dd;color:#4f6572;font:800 21px 'Baloo 2',sans-serif;padding:14px 24px 11px;border-radius:999px;box-shadow:0 6px 0 #b3c3cc")}>{cta}</div>}
          {editing && <button onClick={() => patch({ sheet: 'remove', sd: players.find((x) => x.id === d.id) })} style={sx('width:100%;background:#fff;color:#c62f22;font-weight:900;font-size:16px;padding:13px 20px;border-radius:999px;border:2px solid #f3c9c4;box-shadow:0 4px 0 #f3c9c4')}>Remove this player</button>}
        </div>
      </div>
    </div>
  );
}

export function Players({ c }) {
  const { s, patch, players, me } = c;
  const editing = s.editMode;
  return (
    <div data-screen-label="Who's playing" className="scroll" style={{ ...sx('position:absolute;inset:0'), background: BG, padding: c.pad }}>
      <div style={sx('max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:18px')}>
        <div style={sx('display:flex;align-items:flex-start;gap:12px')}>
          <div style={sx('flex:1;min-width:0')}>
            <div style={sx("font:800 31px/1.05 'Baloo 2',sans-serif;padding-top:4px")}>Who is playing?</div>
            <div style={sx('font-size:16px;font-weight:800;font-style:italic;color:#4f6572;margin-top:4px')}>“Tap your picture to play.”</div>
          </div>
          <button onClick={() => patch({ editMode: !editing })} style={sx('flex:none;background:#fff;border:2px solid #d5e3ea;box-shadow:0 3px 0 #d5e3ea;border-radius:999px;padding:9px 14px;font-weight:900;font-size:14px')}>{editing ? 'Done' : 'Edit players'}</button>
        </div>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px')}>
          {players.map((p) => {
            const a = av(p.avatar), n = c.countOf(p.id), active = me && p.id === me.id;
            const card = pr('width:100%;background:#fff;border-radius:24px;padding:18px 10px 14px;box-shadow:0 5px 0 rgba(20,48,66,.1);display:flex;flex-direction:column;align-items:center;gap:6px', 'transform:translateY(3px)');
            return (
              <div key={p.id} style={sx('position:relative')}>
                <button onClick={() => c.pickPlayer(p)} className={card.className}
                  style={{ ...card.style, border: '3px ' + (editing ? 'dashed ' : 'solid ') + (active ? '#f2760c' : '#d5e3ea') }}>
                  <span style={{ ...sx('width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:46px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.1)'), background: a.bg }}>{a.e}</span>
                  <span style={sx("font:800 19px/1.1 'Baloo 2',sans-serif;padding-top:3px")}>{p.nick}</span>
                  <span style={sx('font-size:13px;font-weight:800;color:#4f6572')}>{n} badge{n === 1 ? '' : 's'}</span>
                </button>
                {active && <span style={sx('position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:#d9650a;color:#fff;font-size:11px;font-weight:900;letter-spacing:.6px;padding:3px 10px;border-radius:999px')}>PLAYING</span>}
                {editing && (
                  <>
                    <button onClick={() => patch({ sheet: 'remove', sd: p })} aria-label={'Remove ' + p.nick} style={sx('position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:50%;background:#c62f22;color:#fff;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center')}>✕</button>
                    <span style={sx('position:absolute;top:8px;left:8px;width:32px;height:32px;border-radius:50%;background:#e3eff4;color:#2a6b8f;font-size:15px;display:flex;align-items:center;justify-content:center;pointer-events:none')}>✎</span>
                  </>
                )}
              </div>
            );
          })}
          {players.length < MAX_PLAYERS && (
            <button onClick={c.newPlayer} style={sx('background:transparent;border:3px dashed #9fb6c4;border-radius:24px;padding:18px 10px 14px;display:flex;flex-direction:column;align-items:center;gap:6px;color:#2f5d77')}>
              <span style={sx('width:84px;height:84px;border-radius:50%;background:#eef6fa;display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:700')}>+</span>
              <span style={sx("font:800 19px/1.1 'Baloo 2',sans-serif;padding-top:3px")}>Add player</span>
              <span style={sx('font-size:13px;font-weight:800')}>New hero</span>
            </button>
          )}
        </div>
        <p style={sx(NOTE)}>{editing ? 'Tap a player to rename, change the avatar, or remove them.' : 'You can have up to ' + MAX_PLAYERS + ' players on this device for now.'}</p>
      </div>
    </div>
  );
}
