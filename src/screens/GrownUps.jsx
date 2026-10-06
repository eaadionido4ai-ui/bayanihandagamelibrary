import { useState } from 'react';
import { sx, pr } from '../ui/sx.js';
import { P, PO, G, LIVE, av } from '../data.js';

const BG = 'radial-gradient(120% 70% at 50% -10%,#eef6fa,#cfe6ef)';
const LABEL = 'font-size:12px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#4f6572;margin:6px 4px 0';
const SOON = 'display:inline-block;font-size:10.5px;font-weight:900;letter-spacing:.6px;background:#eef2f4;color:#4f6572;border-radius:999px;padding:3px 9px;vertical-align:3px';

function Header({ c, title, soon }) {
  return (
    <div style={sx('display:flex;align-items:center;gap:12px')}>
      <button onClick={() => c.go('settings')} aria-label="Back" style={sx('width:48px;height:48px;border-radius:16px;background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center;flex:none')}>←</button>
      <div style={sx("flex:1;min-width:0;font:800 26px/1.05 'Baloo 2',sans-serif;padding-top:4px")}>{title}</div>
      {soon && <span style={sx('flex:none;font-size:11px;font-weight:900;letter-spacing:.6px;background:#d9650a;color:#fff;border-radius:999px;padding:5px 10px')}>COMING SOON</span>}
    </div>
  );
}

// A preview of a planned screen, dimmed so it reads as "not working yet".
function Mockup({ c, label, children }) {
  return (
    <div style={sx('position:relative;border-radius:24px;overflow:hidden')}>
      <div aria-hidden="true" style={sx('padding:46px 12px 12px;display:flex;flex-direction:column;gap:10px;background:rgba(255,255,255,.35);border:2px dashed #9fb6c4;border-radius:24px')}>{children}</div>
      <button onClick={() => c.snackShow('This is a preview. It is not working yet.')} aria-label={label + ', preview only'}
        style={sx('position:absolute;inset:0;background:rgba(14,34,51,.28);border-radius:24px;display:flex;align-items:flex-start;justify-content:center;padding:12px')}>
        <span style={sx('font-size:11px;font-weight:900;letter-spacing:.8px;background:#16303f;color:#fff;border-radius:999px;padding:4px 10px')}>MOCKUP · {label}</span>
      </button>
    </div>
  );
}

function Lessons() {
  const lessons = { mit: '40 min each', prep: '40 min', resp: '30–45 min', rec: '45 min' };
  return (
    <>
      <div style={sx('display:flex;background:#fff;border-radius:999px;padding:4px;gap:4px')}>
        {['📘 Lessons', '📊 Class', '🖨️ Printables'].map((t, i) => <span key={t} style={{ ...sx('flex:1;text-align:center;padding:8px 4px;border-radius:999px;font-weight:800;font-size:13px'), background: i === 0 ? '#16303f' : 'transparent', color: i === 0 ? '#fff' : '#3d5563' }}>{t}</span>)}
      </div>
      {PO.map((pid) => {
        const p = P[pid], gs = G.filter((g) => g.p === pid && !g.soon);
        return (
          <div key={pid} style={sx('display:flex;gap:11px;align-items:center;background:#fff;border-radius:18px;padding:11px;box-shadow:0 4px 0 rgba(20,48,66,.08)')}>
            <span style={{ ...sx('width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:25px;flex:none'), background: p.grad }}>{p.icon}</span>
            <span style={sx('min-width:0')}>
              <b style={sx("display:block;font:800 16px/1.1 'Baloo 2',sans-serif;padding-top:2px")}>{p.name}</b>
              <span style={sx('display:block;font-weight:700;font-size:12px;color:#4f6572;margin-top:2px;line-height:1.3')}>{gs.length} lesson{gs.length === 1 ? '' : 's'} · {gs.map((g) => g.name.replace(/ 3D$/, '').replace(/:.*/, '')).join(', ')}</span>
              <span style={sx('display:inline-block;font-size:10.5px;font-weight:900;border-radius:999px;padding:2px 8px;margin-top:4px;background:#e6f3f9;color:#1f5675')}>{lessons[pid]}</span>
            </span>
          </div>
        );
      })}
    </>
  );
}

function ClassProgress({ c }) {
  // Sample rows when fewer than three players are on this device, so the preview reads well.
  const real = c.players.map((p) => ({ nick: p.nick, a: av(p.avatar), n: c.countOf(p.id) }));
  const rows = real.length >= 3 ? real.slice(0, 4) : [
    { nick: 'Mika', a: av('fox'), n: 5 }, { nick: 'Jun', a: av('frog'), n: 2 }, { nick: 'Lia', a: av('butterfly'), n: 3 },
  ];
  return (
    <>
      <div style={sx(LABEL + ';margin:0 4px')}>Class progress · this device</div>
      <div style={sx('background:#fff;border-radius:18px;box-shadow:0 4px 0 rgba(20,48,66,.08);overflow:hidden')}>
        {rows.map((r, i) => (
          <div key={i} style={{ ...sx('display:flex;align-items:center;gap:10px;padding:9px 12px'), borderBottom: i < rows.length - 1 ? '1px solid #e3ecf1' : 'none' }}>
            <span style={{ ...sx('width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;flex:none'), background: r.a.bg }}>{r.a.e}</span>
            <b style={sx('width:64px;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{r.nick}</b>
            <span style={sx('flex:1;height:9px;background:#e3eff4;border-radius:999px;overflow:hidden')}><span style={{ ...sx('display:block;height:100%;background:linear-gradient(90deg,#5fd39b,#128253);border-radius:999px'), width: Math.round(r.n / LIVE.length * 100) + '%' }} /></span>
            <b style={sx('font-size:12.5px')}>{r.n}/{LIVE.length}</b>
          </div>
        ))}
      </div>
    </>
  );
}

function LessonGuide() {
  const steps = [
    ['Warm-up (5 min).', 'Ask: what do you do when the ground shakes?'],
    ['Play (15 min).', 'Pairs play the drill game; aim for 2+ stars.'],
    ['Do it for real (10 min).', 'Whole class practises drop, cover, hold under desks.'],
    ['Talk (10 min).', "Read Bayani's real-life reminder together."],
  ];
  return (
    <>
      <div style={sx('border-radius:20px;color:#fff;padding:14px 15px;background:linear-gradient(135deg,#e06a0a,#a84d04)')}>
        <div style={sx('font-size:11px;font-weight:900;letter-spacing:1px;opacity:.9')}>LESSON 2 OF 3 · 40 MIN</div>
        <div style={sx("font:800 22px/1.1 'Baloo 2',sans-serif;margin-top:4px")}>Duck, Cover, and Hold</div>
        <div style={sx('font-weight:700;font-size:13px;margin-top:4px;line-height:1.35')}>Learners can show the right order of moves in an earthquake and explain why.</div>
      </div>
      <div style={sx('background:#fff;border-radius:18px;padding:12px;display:flex;flex-direction:column;gap:10px;box-shadow:0 4px 0 rgba(20,48,66,.08)')}>
        {steps.map((st, i) => (
          <div key={i} style={sx('display:flex;gap:10px;align-items:flex-start;font-weight:700;font-size:13.5px;line-height:1.35')}>
            <span style={sx("width:26px;height:26px;border-radius:50%;background:#128253;color:#fff;font:800 14px 'Baloo 2',sans-serif;display:flex;align-items:center;justify-content:center;flex:none;padding-top:2px")}>{i + 1}</span>
            <span><b style={sx('font-weight:900')}>{st[0]}</b> {st[1]}</span>
          </div>
        ))}
      </div>
      <div style={sx('background:#fff5df;border:2px solid #ffe2a8;border-radius:16px;padding:10px 12px;font-weight:800;font-size:13px;line-height:1.4')}>💬 Discussion: Why do we walk out only after the shaking stops?</div>
      <div style={sx('display:flex;gap:10px')}>
        <span style={sx("flex:1;text-align:center;color:#fff;font:800 17px 'Baloo 2',sans-serif;padding:11px 0 8px;border-radius:999px;background:#d9650a;box-shadow:0 5px 0 #a34a05")}>▶ Open the game</span>
        <span style={sx("flex:1;text-align:center;color:#16303f;font:800 16px 'Baloo 2',sans-serif;padding:10px 0 7px;border-radius:999px;background:#fff;border:2px solid #d5e3ea")}>🖨️ Worksheet</span>
      </div>
    </>
  );
}

export function TeacherCorner({ c }) {
  return (
    <div data-screen-label="Teacher's corner" className="scroll" style={{ ...sx('position:absolute;inset:0'), background: BG, padding: c.pad }}>
      <div style={sx('max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:14px')}>
        <Header c={c} title="Teacher's corner" soon />
        <p style={sx('margin:0;background:#fff;border-radius:18px;padding:13px 15px;font-weight:700;font-size:14.5px;line-height:1.45;color:#25404e;box-shadow:0 4px 0 rgba(20,48,66,.08)')}>
          🍎 Lesson guides for each adventure, your class's badge progress, and printable worksheets, all offline. Here is a preview of what is coming.
        </p>
        <div style={sx(LABEL)}>Lessons and class progress</div>
        <Mockup c={c} label="LESSONS"><Lessons /><ClassProgress c={c} /></Mockup>
        <div style={sx(LABEL)}>A lesson guide</div>
        <Mockup c={c} label="LESSON GUIDE"><LessonGuide /></Mockup>
      </div>
    </div>
  );
}

const WAYS = [
  ['💡', 'Suggest a game idea', 'Teachers and DRRM workers: tell us what kids need to learn'],
  ['📝', 'Share a lesson plan', 'Your classroom activities for any pillar'],
  ['🧩', 'Build a game', 'Developers: follow the open game template'],
  ['🌏', 'Translate', 'Filipino and regional languages'],
];

const CONTACT_EMAIL = 'eadionido@up.edu.ph';
const CONTACT_LINK = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('BAYANIHanda: I would like to help');

export function BuildWithUs({ c }) {
  return (
    <div data-screen-label="Build with us" className="scroll" style={{ ...sx('position:absolute;inset:0'), background: BG, padding: c.pad }}>
      <div style={sx('max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:14px')}>
        <Header c={c} title="Build with us" />
        <div style={sx('border-radius:22px;color:#fff;padding:16px;background:linear-gradient(135deg,#8c66d9,#5a3a9e);box-shadow:0 5px 0 rgba(0,0,0,.12)')}>
          <div style={sx("font:800 22px/1.1 'Baloo 2',sans-serif")}>Bayanihan for games 🤝</div>
          <div style={sx('font-weight:700;font-size:14px;margin-top:6px;line-height:1.45')}>BAYANIHanda is an open library. Share a game or lesson so it reaches more classrooms and communities.</div>
        </div>
        <div style={sx(LABEL)}>Ways to help</div>
        {WAYS.map((w) => (
          <div key={w[1]} style={sx('display:flex;gap:12px;align-items:center;background:#fff;border-radius:18px;padding:12px;box-shadow:0 4px 0 rgba(20,48,66,.08)')}>
            <span style={sx('width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:25px;flex:none;background:#f1ebfd')}>{w[0]}</span>
            <span style={sx('min-width:0')}><b style={sx('display:block;font-weight:900;font-size:15px')}>{w[1]}</b><span style={sx('display:block;font-weight:700;font-size:12.5px;color:#4f6572;line-height:1.35;margin-top:1px')}>{w[2]}</span></span>
          </div>
        ))}
        <a href={CONTACT_LINK} {...pr("display:block;text-align:center;text-decoration:none;margin-top:4px;width:100%;background:#7a53c6;color:#fff;font:800 20px 'Baloo 2',sans-serif;padding:13px 24px 10px;border-radius:999px;box-shadow:0 5px 0 #5a3a9e", 'transform:translateY(4px);box-shadow:0 1px 0 #5a3a9e')}>✉️ Contact us</a>
        <p style={sx('margin:0;text-align:center;font-weight:700;font-size:13px;color:#4f6572;line-height:1.5;-webkit-user-select:text;user-select:text')}>Email us at <b style={sx('font-weight:900;color:#5a3a9e')}>{CONTACT_EMAIL}</b></p>
      </div>
    </div>
  );
}

// "Grown-ups only" check before the teacher and contributor screens.
export function GateSheet({ c }) {
  const { s, patch } = c;
  const q = s.sd || { a: 7, b: 6, to: 'teacher' };
  const [val, setVal] = useState('');
  const press = (k) => {
    if (k === '⌫') return setVal(val.slice(0, -1));
    if (k === '✓') {
      if (+val === q.a * q.b) c.go(q.to);
      else { setVal(''); c.snackShow('Not quite. Ask a grown-up to help.'); }
      return;
    }
    if (val.length < 3) setVal(val + k);
  };
  return (
    <>
      <div style={sx("font:800 23px/1.1 'Baloo 2',sans-serif")}>Grown-ups only 🔒</div>
      <div style={sx('font-weight:700;font-size:14.5px;color:#3d5563;line-height:1.4')}>Answer to continue. This keeps young players in the games.</div>
      <div style={sx("text-align:center;font:800 34px 'Baloo 2',sans-serif;background:#eef6fa;border-radius:16px;padding:12px 0 6px")} aria-live="polite">
        {q.a} × {q.b} = <span style={{ color: val ? '#d9650a' : '#b9ccd8' }}>{val || '?'}</span>
      </div>
      <div style={sx('display:grid;grid-template-columns:repeat(3,1fr);gap:8px')}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map((k) => (
          <button key={k} onClick={() => press(k)} aria-label={k === '⌫' ? 'Delete' : k === '✓' ? 'Check answer' : k}
            style={{ ...sx("height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font:800 22px 'Baloo 2',sans-serif;padding-top:3px"), background: k === '✓' ? '#128253' : '#eef3f6', color: k === '✓' ? '#fff' : '#16303f' }}>{k}</button>
        ))}
      </div>
      <button onClick={() => patch({ sheet: null })} style={sx('padding:6px;font-weight:900;font-size:15px;color:#4f6572')}>Cancel</button>
    </>
  );
}
