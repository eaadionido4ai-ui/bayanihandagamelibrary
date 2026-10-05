import { useRef, useState } from 'react';
import { sx, pr } from './ui/sx.js';
import { Mascot } from './ui/art.jsx';
import { Toggle } from './screens/Settings.jsx';
import { LEAD, TRIVIA, game, howTo } from './data.js';
import { renderIdPng, idFileName, savePng, sharePng } from './idcard.js';

const BACKDROP = 'position:absolute;inset:0;background:rgba(14,34,51,.5);animation:bh-fade .2s both';
const H2 = "font:800 23px/1.1 'Baloo 2',sans-serif";
const GHOST = 'flex:1;background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;border-radius:999px;padding:12px;font-weight:900;font-size:15px';
const DANGER = 'flex:1;background:#c62f22;color:#fff;box-shadow:0 4px 0 #922a20;border-radius:999px;padding:12px;font-weight:900;font-size:15px';
const DARK = 'background:#16303f;color:#fff;font-weight:900;font-size:16px;padding:13px;border-radius:999px';
const OPTION = 'display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;background:#f4f8fa;font-weight:900;font-size:16px;text-align:left;width:100%';

export function AskSheet({ c }) {
  const { s, patch, tablet, nick } = c;
  const it = c.askItem();
  const g = it.game ? game(it.game) : null;
  const tab = (on, label, set) => (on
    ? <span style={sx('flex:1;text-align:center;padding:10px;border-radius:999px;background:#d9650a;color:#fff;font-weight:900;font-size:15px;box-shadow:0 3px 0 #a34a05')}>{label}</span>
    : <button onClick={set} style={sx('flex:1;padding:10px;border-radius:999px;font-weight:800;font-size:15px;color:#3d5563')}>{label}</button>);
  return (
    <div style={sx('position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;justify-content:flex-end;align-items:center')}>
      <div onClick={() => patch({ ask: false })} style={sx(BACKDROP)} />
      <div role="dialog" aria-label="Ask Bayani" data-screen-label="Ask Bayani" style={sx('position:relative;width:100%;max-width:540px;background:#fff;border-radius:30px 30px 0 0;padding:12px 18px calc(env(safe-area-inset-bottom, 0px) + 28px);display:flex;flex-direction:column;gap:12px;animation:bh-up .3s cubic-bezier(.2,.9,.3,1.15) both')}>
        <span style={sx('align-self:center;width:40px;height:5px;border-radius:3px;background:#d5e3ea')} />
        <button onClick={() => patch({ ask: false })} aria-label="Close" style={sx('position:absolute;top:14px;right:14px;width:40px;height:40px;border-radius:12px;background:#eef3f6;font-weight:900;font-size:16px;color:#4f6572')}>✕</button>
        <div style={sx('display:flex;align-items:flex-end;gap:12px;margin-top:-4px')}>
          <span style={sx('flex:none')}><Mascot key={'ak' + s.jump} size={tablet ? 112 : 104} wave bob /></span>
          <div style={sx('flex:1;min-width:0;padding-bottom:10px')}>
            <div style={sx("font:800 26px/1.05 'Baloo 2',sans-serif")}>Hi, {nick}!</div>
            <div style={sx('font-size:15px;font-weight:700;color:#4f6572;margin-top:2px')}>What do you want to know?</div>
          </div>
        </div>
        <div style={sx('display:flex;background:#eef3f6;border-radius:999px;padding:4px;gap:4px')}>
          {tab(s.askKind === 'tip', '💡 Safety tip', () => patch({ askKind: 'tip', askN: 0, jump: s.jump + 1 }))}
          {tab(s.askKind === 'trivia', '❓ Fun fact', () => patch({ askKind: 'trivia', askN: Math.floor(Math.random() * TRIVIA.length), jump: s.jump + 1 }))}
        </div>
        <div style={sx('background:#fff5df;border:2px solid #ffe2a8;border-radius:22px;padding:14px 48px 16px 16px;position:relative;min-height:110px')} aria-live="polite">
          <div style={sx('font-size:12px;font-weight:900;letter-spacing:1px;color:#7a5400')}>{it.kind}</div>
          <p style={sx('margin:5px 0 0;font-weight:800;font-size:17.5px;line-height:1.42;text-wrap:pretty')}>{it.text}</p>
          <button onClick={() => c.speak(it.text, true)} aria-label="Read aloud" style={sx('position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;background:#fff;font-size:16px;box-shadow:0 2px 0 #ffe2a8;display:flex;align-items:center;justify-content:center')}>🔊</button>
        </div>
        <div style={sx('display:flex;gap:10px;flex-wrap:wrap')}>
          <button onClick={() => patch({ askN: s.askN + 1, jump: s.jump + 1 })} {...pr('flex:1 1 140px;background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;border-radius:999px;padding:12px 16px;font-weight:900;font-size:15px', 'transform:translateY(3px)')}>🔁 Another one</button>
          {g && !g.soon && s.screen !== 'play' && <button onClick={() => c.openGame(g.id)} {...pr('flex:1 1 180px;background:#128253;color:#fff;box-shadow:0 4px 0 #0b5e3b;border-radius:999px;padding:12px 16px;font-weight:900;font-size:15px', 'transform:translateY(3px)')}>{g.icon} Play {g.name}</button>}
        </div>
      </div>
    </div>
  );
}

// Shrinks a picked photo so it stays light in memory. It is never stored.
function readPhoto(file) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, 640 / Math.max(im.width, im.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        res(cv.toDataURL('image/jpeg', 0.88));
      };
      im.onerror = () => res(null);
      im.src = r.result;
    };
    r.onerror = () => res(null);
    r.readAsDataURL(file);
  });
}

function PhotoSheet({ c }) {
  const { s, patch, myAv, me } = c;
  const cam = useRef(null), lib = useRef(null);
  const pid = me ? me.id : null;
  const setPhoto = (v) => patch((p) => ({ sheet: null, photos: { ...p.photos, [pid]: v } }));
  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const url = await readPhoto(f);
    if (url) { setPhoto(url); c.snackShow('Photo added'); } else c.snackShow('Sorry, that photo could not be opened.');
  };
  return (
    <>
      <div style={sx("font:800 22px/1.1 'Baloo 2',sans-serif")}>Add a photo</div>
      <input ref={cam} type="file" accept="image/*" capture="user" onChange={onFile} hidden />
      <input ref={lib} type="file" accept="image/*" onChange={onFile} hidden />
      <button onClick={() => cam.current.click()} style={sx(OPTION)}><span style={sx('font-size:24px')}>📷</span>Take a photo</button>
      <button onClick={() => lib.current.click()} style={sx(OPTION)}><span style={sx('font-size:24px')}>🖼️</span>Choose from gallery</button>
      <button onClick={() => { setPhoto('avatar'); c.snackShow('Avatar added'); }} style={sx(OPTION)}><span style={{ ...sx('width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px'), background: myAv.bg }}>{myAv.e}</span>Use my avatar</button>
      {s.photos[pid] && <button onClick={() => setPhoto(null)} style={sx('padding:12px;font-weight:900;font-size:15px;color:#c62f22')}>Remove photo</button>}
      <p style={sx('margin:0;font-size:13.5px;font-weight:700;color:#4f6572;text-align:center')}>Your photo stays on this device only.</p>
    </>
  );
}

function ShareSheet({ c }) {
  const { s, patch, myAv, me, nick, rank, count, mine } = c;
  const [busy, setBusy] = useState(false);
  const pid = me ? me.id : null;
  const name = (s.names[pid] != null ? s.names[pid] : nick) || 'Champion';
  const photo = s.photos[pid];
  const run = async (how) => {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await renderIdPng({ name, photo, av: myAv, rank: rank[1], count, mine });
      const r = how === 'share' ? await sharePng(blob, idFileName(name)) : savePng(blob, idFileName(name));
      if (r === 'shared') c.snackShow('Champion ID shared');
      else if (r === 'saved') c.snackShow(how === 'share' ? 'Sharing is not available here, so your ID was saved instead' : 'Champion ID saved to your phone');
      else if (r === 'failed') c.snackShow('Sorry, sharing did not work.');
      if (r !== 'cancelled') patch({ sheet: null });
    } catch (e) {
      c.snackShow('Sorry, the ID could not be made.');
    }
    setBusy(false);
  };
  return (
    <>
      <div style={sx("font:800 22px/1.1 'Baloo 2',sans-serif")}>Share your Champion ID</div>
      <div style={sx('display:flex;align-items:center;gap:12px;background:#f4f8fa;border-radius:18px;padding:10px')}>
        <div style={sx('width:74px;height:96px;border-radius:10px;overflow:hidden;border:2px solid #f2760c;background:#fff;flex:none;display:flex;flex-direction:column')}>
          <span style={sx('height:18px;background:linear-gradient(135deg,#d9650a,#c62f22)')} />
          {photo && photo !== 'avatar'
            ? <img src={photo} alt="" style={sx('flex:1;min-height:0;width:100%;object-fit:cover')} />
            : <span style={{ ...sx('flex:1;display:flex;align-items:center;justify-content:center;font-size:28px'), background: myAv.bg }}>{myAv.e}</span>}
          <span style={sx('height:22px;font-size:8px;font-weight:900;display:flex;align-items:center;justify-content:center')}>🏅 {count} badges</span>
        </div>
        <div style={sx('min-width:0')}><div style={sx('font-weight:900;font-size:15px;word-break:break-word')}>{idFileName(name)}</div><div style={sx('font-size:13px;font-weight:700;color:#4f6572;margin-top:2px')}>{rank[1]}</div></div>
      </div>
      <p style={sx('margin:0;background:#fff5df;border-radius:12px;padding:10px 12px;font-weight:800;font-size:14px;color:#5c4000')}>👪 Ask a grown-up before you share.</p>
      <div style={sx('display:flex;gap:10px')}>
        <button onClick={() => run('save')} disabled={busy} style={sx(GHOST)}>⬇️ Save</button>
        <button onClick={() => run('share')} disabled={busy} style={sx('flex:1;background:#2a6b8f;color:#fff;box-shadow:0 4px 0 #1f5675;border-radius:999px;padding:12px;font-weight:900;font-size:15px')}>↗️ Share</button>
      </div>
    </>
  );
}

export function Sheet({ c }) {
  const { s, patch, nick } = c;
  const close = () => patch({ sheet: null });
  const sd = s.sd || {};
  const g = game(s.gameId);
  let body = null;

  if (s.sheet === 'credit') {
    body = (
      <>
        <div style={sx('display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px')}><span style={sx('font-size:48px')}>{sd.icon}</span><div style={sx(H2)}>{sd.name}</div></div>
        <p style={sx('margin:0;text-align:center;font-weight:700;line-height:1.5;color:#25404e')}>Developed by {LEAD}</p>
        {sd.credit && <p style={sx('margin:0;text-align:center;font-weight:700;font-style:italic;line-height:1.5;color:#3d5563')}>{sd.credit}</p>}
        <button onClick={close} style={sx(DARK)}>Close</button>
      </>
    );
  } else if (s.sheet === 'share') body = <ShareSheet c={c} />;
  else if (s.sheet === 'photo') body = <PhotoSheet c={c} />;
  else if (s.sheet === 'remove') {
    body = (
      <>
        <div style={{ ...sx(H2), textAlign: 'center' }}>Remove {sd.nick}?</div>
        <p style={sx('margin:0;text-align:center;font-weight:700;color:#3d5563;line-height:1.45')}>Their badges will be removed from this device too.</p>
        <div style={sx('display:flex;gap:10px')}><button onClick={close} style={sx(GHOST)}>Keep</button><button onClick={() => { patch({ sheet: null }); if (sd.id) c.removePlayer(sd.id); }} style={sx(DANGER)}>Remove</button></div>
      </>
    );
  } else if (s.sheet === 'reset') {
    body = (
      <>
        <div style={{ ...sx(H2), textAlign: 'center' }}>Reset badges for {nick}?</div>
        <p style={sx('margin:0;text-align:center;font-weight:700;color:#3d5563;line-height:1.45')}>All badges on this Champion ID will be cleared.</p>
        <div style={sx('display:flex;gap:10px')}><button onClick={close} style={sx(GHOST)}>Cancel</button><button onClick={() => { c.resetBadges(); patch({ sheet: null }); c.snackShow('Badges reset for ' + nick); }} style={sx(DANGER)}>Reset</button></div>
      </>
    );
  } else if (s.sheet === 'behind') {
    const B = ({ children }) => <b style={sx('color:#b35205;font-weight:900')}>{children}</b>;
    body = (
      <>
        <div style={sx(H2)}>Behind BAYANIHanda</div>
        <p style={sx('margin:0;font-weight:900;font-size:19px;line-height:1.3;color:#b35205')}>BAYANIHanda</p>
        <p style={sx('margin:-6px 0 0;font-weight:700;line-height:1.5;color:#25404e')}><B>B</B>uilding <B>A</B>wareness in <B>Y</B>outh <B>A</B>gainst <B>N</B>atural-hazards and DRRM concepts through <B>I</B>nteractive Games towards Enhanced Preparedness and Resilience.</p>
        <p style={sx('margin:0;font-weight:600;line-height:1.55;color:#33505e')}>The name plays on three Filipino words: bayani, a hero; handa, meaning ready; and bayanihan, the spirit of neighbors helping neighbors.</p>
        <p style={sx('margin:0;font-weight:600;line-height:1.55;color:#33505e')}>BAYANIHanda is also meant to grow as a shared library. It gives educators and developers a place to contribute their own preparedness games and lessons and have that work reach more classrooms and communities. In the spirit of bayanihan, the collection is managed and shared as an open resource, so good ideas for disaster readiness can spread freely.</p>
        <div style={sx('height:1px;background:#d5e3ea')} />
        <p style={sx('margin:0;font-weight:700;font-size:14px;line-height:1.5;color:#4f6572')}>Lead developer: Edward Andrew A. Dionido, Lead Science Research Specialist II, University of the Philippines Resilience Institute. Built with the assistance of AI.</p>
        <button onClick={close} style={sx(DARK)}>Close</button>
      </>
    );
  } else if (s.sheet === 'howto') {
    const how = howTo(g, s.mode);
    body = (
      <>
        <div style={sx(H2)}>{g.stepsTitle || 'How to play'}</div>
        <div style={sx('display:flex;flex-direction:column;gap:10px')}>
          {how.steps.map((x, i) => (
            <div key={i} style={sx('display:flex;align-items:center;gap:12px;font-weight:700;font-size:15px;line-height:1.4')}>
              <span style={sx('width:36px;height:36px;border-radius:12px;background:#eef6fa;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:900;flex:none')}>{x[0]}</span>
              <span><b style={sx('font-weight:900')}>{x[1]}:</b> {x[2]}</span>
            </div>
          ))}
        </div>
        {how.note && <p style={sx('margin:0;font-size:13.5px;color:#3d5563;font-weight:700;font-style:italic;line-height:1.45')}>{how.note}</p>}
        <button onClick={close} style={sx('background:#d9650a;color:#fff;font-weight:900;font-size:16px;padding:13px;border-radius:999px;box-shadow:0 4px 0 #a34a05')}>Got it</button>
      </>
    );
  } else if (s.sheet === 'sound') {
    body = (
      <>
        <div style={sx(H2)}>Settings</div>
        <button onClick={() => patch({ sound: !s.sound })} role="switch" aria-checked={s.sound} style={sx('display:flex;align-items:center;gap:12px;width:100%;padding:12px 0;text-align:left;border-bottom:1px solid #e3ecf1')}><span style={sx('flex:1;font-weight:900;font-size:16px')}>Sound and voice</span><Toggle on={s.sound} small /></button>
        <button onClick={() => patch({ voice: !s.voice })} role="switch" aria-checked={s.voice} style={sx('display:flex;align-items:center;gap:12px;width:100%;padding:12px 0;text-align:left')}><span style={sx('flex:1;font-weight:900;font-size:16px')}>Read tips and hints aloud</span><Toggle on={s.voice} small /></button>
        <button onClick={close} style={sx(DARK)}>Done</button>
      </>
    );
  }
  if (!body) return null;

  return (
    <div style={sx('position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;justify-content:flex-end;align-items:center')}>
      <div onClick={close} style={sx(BACKDROP)} />
      <div role="dialog" style={sx('position:relative;width:100%;max-width:560px;max-height:88%;overflow-y:auto;scrollbar-width:none;background:#fff;border-radius:30px 30px 0 0;padding:12px 20px calc(env(safe-area-inset-bottom, 0px) + 28px);display:flex;flex-direction:column;gap:14px;animation:bh-up .26s ease-out both')}>
        <span style={sx('align-self:center;width:40px;height:5px;border-radius:3px;background:#d5e3ea;flex:none')} />
        {body}
      </div>
    </div>
  );
}

export function Snack({ text, bottom }) {
  return (
    <div role="status" style={{ ...sx('position:fixed;left:16px;right:16px;z-index:85;display:flex;justify-content:center;pointer-events:none'), bottom: 'calc(env(safe-area-inset-bottom, 0px) + ' + bottom + 'px)' }}>
      <div style={sx('background:#16303f;color:#fff;font-weight:800;font-size:15px;padding:13px 18px;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.25);animation:bh-up .2s ease-out both;max-width:440px')}>{text}</div>
    </div>
  );
}
