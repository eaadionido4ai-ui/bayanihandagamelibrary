import { useState } from 'react';
import { sx, pr } from '../ui/sx.js';
import { BADGES, LIVE, RANKS, game } from '../data.js';
import { renderIdPng, idFileName, savePng } from '../idcard.js';

export function IdCard({ name, onName, photo, onPhoto, av, rank, count, mine, printing }) {
  const photoBox = photo && photo !== 'avatar'
    ? <img src={photo} alt="" style={sx('width:100%;height:100%;object-fit:cover;display:block')} />
    : photo === 'avatar' || printing
      ? <span style={{ ...sx('width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:58px'), background: av.bg }}>{av.e}</span>
      : <span style={sx('width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:#eef3f6;border:2px dashed #b9ccd8;border-radius:18px;color:#4f6572;font-size:12px;font-weight:900;line-height:1.2;text-align:center')}><span style={sx('font-size:24px')}>📷</span>Tap to add photo</span>;
  return (
    <div style={{ ...sx('background:#fff;border-radius:24px;overflow:hidden;border:3px solid #f2760c'), ...(printing ? { width: 420 } : sx('flex:1 1 330px;max-width:440px;box-shadow:0 10px 28px rgba(18,48,63,.15)')) }}>
      <div style={sx('background:linear-gradient(135deg,#d9650a,#c62f22);color:#fff;padding:14px 16px 12px;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact')}>
        <div style={sx("font:800 29px/1 'Baloo 2',sans-serif;letter-spacing:1px;padding-top:4px")}>BAYANIHanda</div>
        <span style={sx('display:inline-block;margin-top:5px;font-size:11.5px;font-weight:900;letter-spacing:2.5px;text-transform:uppercase;background:rgba(0,0,0,.2);border-radius:999px;padding:3px 10px')}>Young DRRM Champion</span>
      </div>
      <div style={sx('padding:16px')}>
        <div style={sx('display:flex;gap:14px;align-items:center')}>
          {onPhoto
            ? <button onClick={onPhoto} aria-label="Photo" style={sx('width:96px;height:96px;border-radius:18px;flex:none;overflow:hidden')}>{photoBox}</button>
            : <div style={sx('width:96px;height:96px;border-radius:18px;flex:none;overflow:hidden')}>{photoBox}</div>}
          <div style={sx('flex:1;min-width:0')}>
            <div style={sx('font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#4f6572')}>Name</div>
            {onName
              ? <input value={name} onChange={(e) => onName(e.target.value.slice(0, 28))} maxLength={28} placeholder="Type your name" aria-label="Name on your Champion ID" className="fob"
                style={sx('width:100%;border:none;border-bottom:2px solid #d5e3ea;font-size:21px;font-weight:900;color:#16303f;padding:4px 2px;background:transparent;outline:none;border-radius:0')} />
              : <div style={sx('font-size:21px;font-weight:900;padding:4px 2px')}>{name}</div>}
            <span style={sx('display:inline-block;margin-top:9px;background:#fff5df;color:#7a5400;font-weight:900;border-radius:999px;padding:4px 12px;font-size:13px')}>🏅 {rank}</span>
          </div>
        </div>
        <div style={sx('margin-top:16px')}>
          <div style={sx('font-size:11.5px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#4f6572;margin-bottom:8px')}>Badges · {count} of {LIVE.length}</div>
          <div style={sx('display:grid;grid-template-columns:repeat(4,1fr);gap:8px')}>
            {BADGES.map((id) => {
              const b = game(id), earned = !b.soon && !!mine[id];
              if (b.soon) return <div key={id} style={sx('border-radius:14px;padding:9px 3px 7px;text-align:center;background:transparent;border:2px dashed #c8d6de')}><div style={sx('font-size:24px;line-height:1.1;filter:grayscale(1);opacity:.3')}>{b.badge[1]}</div><div style={sx('font-size:10.5px;font-weight:800;color:#5b7280;line-height:1.1;margin-top:3px')}>Soon</div></div>;
              if (earned) return <div key={id} style={sx('border-radius:14px;padding:9px 3px 7px;text-align:center;background:#eafaf1;border:2px solid #7fd8a8;box-shadow:0 3px 0 #bfe6d5')}><div style={sx('font-size:24px;line-height:1.1')}>{b.badge[1]}</div><div style={sx('font-size:10.5px;font-weight:900;color:#0c5c3a;line-height:1.1;margin-top:3px')}>{b.badge[0]}</div></div>;
              return <div key={id} style={sx('border-radius:14px;padding:9px 3px 7px;text-align:center;background:#f6f9fb;border:2px solid #d5e3ea')}><div style={sx('font-size:24px;line-height:1.1;filter:grayscale(1);opacity:.4')}>{b.badge[1]}</div><div style={sx('font-size:10.5px;font-weight:800;color:#4f6572;line-height:1.1;margin-top:3px')}>{b.badge[0]}</div></div>;
            })}
          </div>
        </div>
        <div style={sx('margin-top:14px;border-top:1px solid #d5e3ea;padding-top:10px;color:#4f6572;font-size:11.5px;font-weight:700;text-align:center;line-height:1.4')}>University of the Philippines Resilience Institute<br />Awarded for learning to prevent, prepare, respond, and recover.</div>
      </div>
    </div>
  );
}

export default function ChampionId({ c }) {
  const { s, patch, nick, myAv, rank, next, count, mine, me } = c;
  const [busy, setBusy] = useState(false);
  const pid = me ? me.id : null;
  const name = s.names[pid] != null ? s.names[pid] : nick;
  const pct = next ? Math.round((count - rank[0]) / (next.min - rank[0]) * 100) : 100;

  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await renderIdPng({ name: name || 'Champion', photo: s.photos[pid], av: myAv, rank: rank[1], count, mine });
      savePng(blob, idFileName(name));
      c.snackShow('Champion ID saved to your phone');
    } catch (e) {
      c.snackShow('Sorry, the ID could not be saved.');
    }
    setBusy(false);
  }

  return (
    <div data-screen-label="Champion ID" className="scroll" style={{ ...sx('position:absolute;inset:0;background:radial-gradient(120% 70% at 50% -10%,#fff5df,#cfe6ef 70%)'), padding: c.pad }}>
      <div style={sx('max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:16px')}>
        <div>
          <div style={sx("font:800 31px/1.05 'Baloo 2',sans-serif;padding-top:4px")}>My Champion ID</div>
          <div style={sx('font-size:14.5px;font-weight:700;color:#4f6572;margin-top:2px')}>Earn a badge for every game you finish with flying colors.</div>
        </div>
        <div style={sx('display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;justify-content:center')}>
          <IdCard name={name} onName={(v) => patch((p) => ({ names: { ...p.names, [pid]: v } }))} photo={s.photos[pid]} onPhoto={() => patch({ sheet: 'photo' })}
            av={myAv} rank={rank[1]} count={count} mine={mine} />
          <div style={sx('flex:1 1 280px;max-width:440px;width:100%;display:flex;flex-direction:column;gap:14px')}>
            <div style={sx('background:#fff;border-radius:22px;padding:16px;box-shadow:0 5px 0 rgba(20,48,66,.08);display:flex;flex-direction:column;gap:10px')}>
              <div style={sx("font:800 18px/1.15 'Baloo 2',sans-serif;padding-top:2px")}>{next ? next.need + ' more badge' + (next.need > 1 ? 's' : '') + ' to become ' + next.name + '!' : 'You reached the top rank!'}</div>
              <span style={sx('display:block;height:12px;background:#e3eff4;border-radius:999px;overflow:hidden')}><span style={{ ...sx('display:block;height:100%;background:linear-gradient(90deg,#5fd39b,#128253);border-radius:999px'), width: pct + '%' }} /></span>
              <div style={sx('display:flex;flex-direction:column;gap:6px;margin-top:4px')}>
                {RANKS.map((r) => (
                  <div key={r[1]} style={sx('display:flex;align-items:center;gap:10px')}>
                    {count >= r[0]
                      ? <><span style={sx('width:22px;height:22px;border-radius:50%;background:#128253;color:#fff;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex:none')}>✓</span><span style={sx('flex:1;font-weight:900;font-size:14.5px')}>{r[1]}</span></>
                      : <><span style={sx('width:22px;height:22px;border-radius:50%;border:2px solid #b9ccd8;flex:none')} /><span style={sx('flex:1;font-weight:700;font-size:14.5px;color:#4f6572')}>{r[1]}</span></>}
                    {r[1] === rank[1] && <span style={sx('font-size:10.5px;font-weight:900;letter-spacing:.6px;background:#d9650a;color:#fff;border-radius:999px;padding:2px 8px')}>YOU</span>}
                    <span style={sx('font-size:12.5px;font-weight:800;color:#4f6572')}>{r[0]}{r[0] === 1 ? ' badge' : ' badges'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:10px')}>
              <button onClick={save} {...pr('grid-column:1 / -1;display:flex;align-items:center;justify-content:center;gap:8px;background:#128253;color:#fff;font-weight:900;font-size:16px;padding:14px;border-radius:999px;box-shadow:0 5px 0 #0b5e3b', 'transform:translateY(4px);box-shadow:0 1px 0 #0b5e3b')}>⬇️ Save to phone</button>
              <button onClick={() => patch({ sheet: 'share' })} {...pr('display:flex;align-items:center;justify-content:center;gap:8px;background:#2a6b8f;color:#fff;font-weight:900;font-size:16px;padding:13px;border-radius:999px;box-shadow:0 5px 0 #1f5675', 'transform:translateY(4px);box-shadow:0 1px 0 #1f5675')}>↗️ Share</button>
              <button onClick={() => { try { window.print(); } catch (e) { c.snackShow('Printing is not available here.'); } }} {...pr('display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;border:2px solid #d5e3ea;font-weight:900;font-size:16px;padding:12px;border-radius:999px;box-shadow:0 5px 0 #d5e3ea', 'transform:translateY(4px);box-shadow:0 1px 0 #d5e3ea')}>🖨️ Print</button>
            </div>
            <p style={sx('margin:0;background:#eef6fa;border:1px solid #d5e3ea;border-radius:14px;padding:12px 14px;color:#2f5d77;font-weight:700;font-size:13.5px;line-height:1.45')}><b style={sx('font-weight:900')}>Ask a grown-up before you share.</b> Your name and photo stay on this device only. They are never saved or sent anywhere. Only your badges are kept on this device so your progress is remembered.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
