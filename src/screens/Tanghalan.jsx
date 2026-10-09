import { sx, pr } from '../ui/sx.js';
import { Mockup } from './GrownUps.jsx';

// TANGHALAN, the BAYANIHanda museum. A placeholder until the walkable museum is built:
// the previews are dimmed mockups, and their images in public/tanghalan come from design/tanghalan.
const IMG = 'tanghalan/';
const BG = 'radial-gradient(120% 70% at 50% -10%,#eef6fa,#cfe6ef)';
const NAVY_CARD = 'linear-gradient(160deg,#16303f,#1f4e6b)';
const LABEL = 'font-size:12px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#4f6572;margin:6px 4px 0';
const NOTE = 'margin:0 4px;font-weight:700;font-size:13.5px;line-height:1.45;color:#3d5563';
const SOON = 'flex:none;font-size:11px;font-weight:900;letter-spacing:.6px;background:#d9650a;color:#fff;border-radius:999px;padding:5px 10px';
const CHIP = 'font-size:11.5px;font-weight:900;border-radius:999px;padding:4px 10px';
const TWO = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:14px;align-items:start';
const ABOUT = 'Roam connected rooms with your player. Look at art, and read and listen to stories and poems made by kids like you.';
const ACRONYM = [['T', 'echnology-'], ['A', 'ssisted '], ['N', 'avigable '], ['G', 'allery '], ['H', 'ighlighting '], ['A', 'rt, '], ['L', 'earning '], ['a', 'nd '], ['N', 'arratives']];

function Frame({ src, w, color, ratio }) {
  return (
    <span style={{ ...sx('display:block;background:#fdfbf5;padding:2px;box-shadow:0 2px 4px rgba(0,0,0,.2)'), width: w, border: '3px solid ' + color }}>
      <img src={IMG + src} alt="" style={{ display: 'block', width: '100%', aspectRatio: ratio }} />
    </span>
  );
}

// Home and Games: a small "coming soon" card that sits after the games, so the library stays first.
const SOON_CARD = 'display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:rgba(255,255,255,.55);border:2px dashed #b9ccd8;border-radius:22px;padding:12px 14px';
const SOON_CHIP = 'font-size:10.5px;font-weight:900;letter-spacing:.5px;background:#eef2f4;color:#4f6572;border-radius:999px;padding:3px 8px';

function Peek({ c, from, big }) {
  const card = pr(SOON_CARD, 'transform:translateY(2px)');
  return (
    <button onClick={() => c.go('museum', { museumFrom: from })} className={card.className} style={card.style}>
      <span style={{ ...sx('flex:none;border-radius:18px;background:#efe5d2;display:flex;align-items:center;justify-content:center;gap:5px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.08)'), width: big ? 66 : 60, height: big ? 66 : 60 }}>
        <Frame src="art-baha.webp" w={big ? 27 : 24} color="#f2760c" ratio="4/3" />
        <Frame src="art-gobag.webp" w={big ? 19 : 17} color="#128253" ratio="3/4" />
      </span>
      <span style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px')}>
        <span style={sx("font:800 18px/1.1 'Baloo 2',sans-serif;padding-top:3px;color:#3d5563")}>TANGHALAN</span>
        <span style={sx('font-size:13px;font-weight:700;color:#4f6572;line-height:1.35')}>A museum of art and stories made by kids. Take a peek!</span>
        <span style={sx('align-self:flex-start;' + SOON_CHIP)}>COMING SOON</span>
      </span>
      <span style={sx('flex:none;font-size:22px;font-weight:900;color:#8fa3b0')}>›</span>
    </button>
  );
}

export function MuseumCard({ c }) { return <Peek c={c} from="home" />; }
export function MuseumTile({ c }) { return <Peek c={c} from="games" big />; }

function ArtView() {
  return (
    <>
      <div style={sx('background:radial-gradient(120% 60% at 50% 0%,#2a5068,#0e2233);border-radius:18px;padding:16px 18px')}>
        <div style={sx('background:#fdfbf5;padding:6px;border:8px solid #2a6b8f;border-radius:4px;box-shadow:0 10px 26px rgba(0,0,0,.35)')}>
          <img src={IMG + 'art-bayanihan.webp'} alt="" loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '4/3' }} />
        </div>
      </div>
      <div style={sx('background:#fff;border-radius:18px;padding:13px 14px;display:flex;flex-direction:column;gap:8px')}>
        <div style={sx('display:flex;gap:6px;flex-wrap:wrap')}><span style={sx(CHIP + ';background:#e3f0f7;color:#1f5675')}>🛡️ Stop Hazards Early</span><span style={sx(CHIP + ';background:#eef3f6;color:#3d5563')}>🖍️ Crayon on paper</span></div>
        <div style={sx("font:800 24px/1 'Baloo 2',sans-serif;padding-top:3px")}>Bayanihan!</div>
        <div style={sx('font-weight:800;font-size:13px;color:#4f6572;margin-top:-3px')}>by <b style={sx('color:#16303f')}>Ana</b>, 10 · Grade 4 · Iloilo</div>
        <p style={sx('margin:0;font-weight:700;font-size:13.5px;line-height:1.45;color:#25404e')}>“Our old house was by the river, so it always flooded. Our neighbors helped move it to higher ground. Now we are safe.”</p>
        <div style={sx('display:flex;gap:8px')}>
          <span style={sx("flex:1;text-align:center;color:#fff;font:800 15.5px 'Baloo 2',sans-serif;padding:9px 0 6px;border-radius:999px;background:#d9650a;box-shadow:0 4px 0 #a34a05")}>🔊 Listen</span>
          <span style={sx("flex:1;text-align:center;color:#16303f;font:800 14px 'Baloo 2',sans-serif;padding:8px 0 5px;border-radius:999px;background:#fff;border:2px solid #d5e3ea")}>🎙️ Ana's voice</span>
        </div>
        <div style={sx('background:#fff5df;border:2px solid #ffe2a8;border-radius:16px;padding:8px 11px;font-weight:800;font-size:12.5px;line-height:1.4')}>💡 <b>Bayani:</b> Homes away from the riverbank stay safer in floods. <span style={sx('color:#0c5c3a;font-weight:900;white-space:nowrap')}>▶ Play Guide the Stream</span></div>
      </div>
    </>
  );
}

function StandView() {
  const lines = ['Umuulan nang malakas buong gabi.', 'Tumataas ang tubig sa ilog.', '🔊 “Lumikas na tayo!” sabi ni Bayani.', 'Dala nila ang go bag at flashlight.'];
  return (
    <>
      <img src={IMG + 'stand.webp'} alt="" loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '16/9', borderRadius: 18 }} />
      <div style={sx('background:#fff;border-radius:18px;padding:13px 14px;display:flex;flex-direction:column;gap:7px')}>
        <div style={sx('display:flex;gap:6px;flex-wrap:wrap')}><span style={sx(CHIP + ';background:#fff1c7;color:#7a5400')}>📖 Story stand</span><span style={sx(CHIP + ';background:#eef3f6;color:#3d5563')}>Kuwento · 3 pages</span></div>
        <div style={sx("font:800 23px/1 'Baloo 2',sans-serif;padding-top:3px")}>Si Bayani at ang Baha</div>
        <div style={sx('font-weight:800;font-size:13px;color:#4f6572;margin-top:-3px')}>ni <b style={sx('color:#16303f')}>Bea</b>, 11 · Grade 5 · Bulacan</div>
        <div style={sx('display:flex;flex-direction:column;gap:2px;margin:0 -4px')}>
          {lines.map((l, i) => <div key={i} style={{ ...sx('font-weight:800;font-size:14.5px;line-height:1.3;padding:3px 6px;border-radius:10px;color:#25404e'), ...(i === 2 ? sx('background:#ffe58a;color:#16303f;font-weight:900') : {}), opacity: i === 3 ? 0.45 : 1 }}>{l}</div>)}
        </div>
        <div style={sx('display:flex;align-items:center;gap:10px;margin-top:2px')}>
          <span style={sx('font-size:15px;font-weight:900;color:#3d5563')}>⏮</span>
          <span style={sx('width:40px;height:40px;border-radius:50%;background:#d9650a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 0 #a34a05;flex:none')}>⏸</span>
          <span style={sx('font-size:15px;font-weight:900;color:#3d5563')}>⏭</span>
          <span style={sx('flex:1;height:8px;background:#f3e6c4;border-radius:999px;overflow:hidden')}><span style={sx('display:block;width:45%;height:100%;background:#f2a900')} /></span>
          <span style={sx('font-weight:900;font-size:12px;color:#4f6572')}>1 / 3</span>
        </div>
        <div style={sx('display:flex;gap:6px')}>
          {['🦸 Bayani reads', '🎙️ Bea reads', '🌐 English'].map((t, i) => <span key={t} style={{ ...sx('flex:1;text-align:center;font-weight:900;font-size:12px;padding:8px 4px;border-radius:14px;background:#fff;color:#3d5563;border:2px solid #f0dca8'), ...(i === 0 ? sx('border-color:#d9650a;color:#a84d04;background:#fff4e8') : {}) }}>{t}</span>)}
        </div>
      </div>
    </>
  );
}

// The museum map: every room opens into its neighbors, so kids can walk all the way around.
const ROOMS = [
  [110, 6, 140, 56, '#fff1c7', '#eaa100', ['Kuwentuhan', 'Corner'], '📖', '#16303f'],
  [6, 72, 96, 80, '#e3f0f7', '#2a6b8f', ['Stop Hazards', 'Early'], '🛡️', '#16303f'],
  [110, 72, 140, 80, '#16303f', '#16303f', ['Bulwagan ng', 'Bayanihan'], '⭐', '#ffc53d'],
  [258, 72, 96, 80, '#e2f5ec', '#128253', ['Get Ready'], '🎒', '#16303f'],
  [6, 160, 96, 80, '#ffecd9', '#f2760c', ['Act Fast'], '🚨', '#16303f'],
  [110, 160, 140, 80, '#ffffff', '#8fa3b0', ['Lobby'], '🚪', '#16303f'],
  [258, 160, 96, 80, '#efe8fb', '#7a53c6', ['Bounce Back'], '🏘️', '#16303f'],
];
const DOORS = [[166, 56, 28, 22], [98, 100, 16, 24], [246, 100, 16, 24], [40, 148, 28, 16], [292, 148, 28, 16], [98, 188, 16, 24], [246, 188, 16, 24], [166, 148, 28, 16]];

function MapView({ me }) {
  return (
    <div style={sx('background:#fff;border-radius:18px;padding:8px 8px 10px;display:flex;flex-direction:column;gap:8px')}>
      <svg viewBox="0 0 360 246" style={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'Nunito,sans-serif' }}>
        <rect width="360" height="246" rx="16" fill="#f6f1e7" />
        {ROOMS.map((r) => <rect key={r[6][0]} x={r[0]} y={r[1]} width={r[2]} height={r[3]} rx="12" fill={r[4]} stroke={r[5]} strokeWidth="2.5" strokeDasharray={r[7] === '🚪' ? '5 4' : undefined} />)}
        {DOORS.map((d, i) => <rect key={i} x={d[0]} y={d[1]} width={d[2]} height={d[3]} rx="3" fill="#e9dcc4" />)}
        {ROOMS.map((r) => {
          const cx = r[0] + r[2] / 2, top = r[1] + r[3] / 2 - (r[6].length === 2 ? 14 : 8);
          return (
            <g key={'t' + r[6][0]}>
              <text x={cx} y={top - 2} fontSize="17" textAnchor="middle">{r[7]}</text>
              {r[6].map((l, i) => <text key={l} x={cx} y={top + 17 + i * 12} fontSize="11" fontWeight="900" textAnchor="middle" fill={r[8]}>{l}</text>)}
            </g>
          );
        })}
        {[[240, 170], [92, 82]].map(([x, y]) => <g key={x}><circle cx={x} cy={y} r="8" fill="#1aa46a" /><text x={x} y={y + 4} fontSize="11" fontWeight="900" fill="#fff" textAnchor="middle">✓</text></g>)}
        <polyline points="180,214 180,150 222,140" fill="none" stroke="#f2760c" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" />
        <circle cx="234" cy="136" r="13" fill="#fff" stroke="#f2760c" strokeWidth="3" />
        <text x="234" y="141" fontSize="15" textAnchor="middle">{me}</text>
      </svg>
      <div style={sx('display:flex;gap:14px;justify-content:center;flex-wrap:wrap;font-weight:800;font-size:12px;color:#4f6572')}>
        <span style={sx('display:flex;align-items:center;gap:6px')}><i style={sx('font-style:normal;width:20px;height:20px;border-radius:50%;background:#1aa46a;color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center')}>✓</i>Rooms you visited</span>
        <span style={sx('display:flex;align-items:center;gap:6px')}><i style={sx('font-style:normal;width:22px;height:22px;border-radius:50%;background:#fff;border:2px solid #f2760c;font-size:12px;display:flex;align-items:center;justify-content:center')}>{me}</i>You are here</span>
      </div>
    </div>
  );
}

const STEPS = [
  ['✏️', 'Learners create', 'Art, stories, poems and letters, made in class.'],
  ['📨', 'A teacher sends them in', 'With a consent form signed by a parent.'],
  ['🔍', 'The team checks each work', 'The safety message is right, and only a first name, age and province are shown.'],
  ['🏛️', 'A new room opens', 'In the next app update, and it works offline.'],
];

export function Tanghalan({ c }) {
  const { s } = c;
  return (
    <div data-screen-label="TANGHALAN" className="scroll" style={{ ...sx('position:absolute;inset:0'), background: BG, padding: c.pad }}>
      <div style={sx('max-width:980px;margin:0 auto;display:flex;flex-direction:column;gap:14px')}>
        <div style={sx('display:flex;align-items:center;gap:12px')}>
          <button onClick={() => c.go(s.museumFrom || 'home')} aria-label="Back" style={sx('width:48px;height:48px;border-radius:16px;background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center;flex:none')}>←</button>
          <div style={sx('flex:1;min-width:0')}>
            <div style={sx("font:800 26px/1.05 'Baloo 2',sans-serif;padding-top:4px")}>TANGHALAN</div>
            <div style={sx('font-weight:800;font-size:13px;color:#4f6572')}>The BAYANIHanda museum</div>
          </div>
          <span style={sx(SOON)}>COMING SOON</span>
        </div>

        <div style={sx('border-radius:24px;color:#fff;padding:16px 18px;background:' + NAVY_CARD + ';box-shadow:0 5px 0 rgba(0,0,0,.12);display:flex;flex-direction:column;gap:8px')}>
          <span style={sx('font-size:11.5px;font-weight:900;letter-spacing:1.3px;color:#bcd4e0')}>🏛️ VIRTUAL MUSEUM</span>
          <div style={sx("font:800 24px/1.1 'Baloo 2',sans-serif")}>A museum you can walk through</div>
          <div style={sx('font-weight:800;font-size:13px;line-height:1.4;color:#bcd4e0')}>{ACRONYM.map(([a, b], i) => <span key={i}><b style={sx('color:#ffc53d;font-weight:900')}>{a}</b>{b}</span>)}</div>
          <p style={sx('margin:0;font-weight:700;font-size:15px;line-height:1.45')}>{ABOUT}</p>
          <button onClick={() => c.speak('TANGHALAN is coming soon. ' + ABOUT, true)} style={sx('align-self:flex-start;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.25);color:#fff;font-weight:900;font-size:14px;padding:8px 14px;border-radius:999px;margin-top:2px')}>🔊 Listen</button>
        </div>

        <div style={sx(LABEL)}>Roam from room to room</div>
        <div style={sx('width:100%;max-width:760px')}>
          <Mockup c={c} label="WALK">
            <img src={IMG + 'walk.webp'} alt="" style={{ display: 'block', width: '100%', aspectRatio: '16/10', borderRadius: 16 }} />
          </Mockup>
        </div>
        <p style={sx(NOTE + ';max-width:760px')}>Every room opens into the next: one for each adventure, a featured hall, and a story corner. Artworks hang on the walls, and Bayani walks along with you.</p>

        <div style={sx(TWO)}>
          <div style={sx('display:flex;flex-direction:column;gap:12px')}>
            <div style={sx(LABEL)}>Look at art</div>
            <Mockup c={c} label="LOOK"><ArtView /></Mockup>
          </div>
          <div style={sx('display:flex;flex-direction:column;gap:12px')}>
            <div style={sx(LABEL)}>Read and listen</div>
            <Mockup c={c} label="READ"><StandView /></Mockup>
          </div>
        </div>

        <div style={sx(TWO)}>
          <div style={sx('display:flex;flex-direction:column;gap:12px')}>
            <div style={sx(LABEL)}>Museum map</div>
            <Mockup c={c} label="MAP"><MapView me={c.myAv.e} /></Mockup>
          </div>
          <div style={sx('display:flex;flex-direction:column;gap:12px')}>
            <div style={sx(LABEL)}>Where the works come from</div>
            <div style={sx('background:#fff;border-radius:22px;padding:14px;box-shadow:0 4px 0 rgba(20,48,66,.08);display:flex;flex-direction:column;gap:12px')}>
              {STEPS.map((st) => (
                <div key={st[1]} style={sx('display:flex;gap:12px;align-items:flex-start')}>
                  <span style={sx('width:44px;height:44px;border-radius:14px;background:#eef6fa;display:flex;align-items:center;justify-content:center;font-size:22px;flex:none')}>{st[0]}</span>
                  <span style={sx('min-width:0;padding-top:2px')}><b style={sx('display:block;font-weight:900;font-size:15px')}>{st[1]}</b><span style={sx('display:block;font-weight:700;font-size:13px;color:#4f6572;line-height:1.4;margin-top:1px')}>{st[2]}</span></span>
                </div>
              ))}
              <div style={sx('background:#fff5df;border:2px solid #ffe2a8;border-radius:16px;padding:10px 12px;font-weight:800;font-size:13px;line-height:1.45')}>👩‍🏫 Teachers and parents: to share learners' works, open Settings, then Build with us.</div>
            </div>
          </div>
        </div>

        <div style={sx('display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:#fff;border-radius:22px;padding:14px 16px;box-shadow:0 4px 0 rgba(20,48,66,.08);margin-top:4px')}>
          <span style={sx('font-size:30px;flex:none')}>🎮</span>
          <span style={sx('flex:1 1 220px;min-width:0')}><b style={sx("display:block;font:800 18px/1.15 'Baloo 2',sans-serif;padding-top:2px")}>The museum is still being built</b><span style={sx('display:block;font-weight:700;font-size:13.5px;color:#4f6572;line-height:1.4;margin-top:2px')}>Until then, play the games and earn badges for your Champion ID.</span></span>
          <button onClick={() => c.go('games', { filter: 'all' })} {...pr("flex:none;background:#d9650a;color:#fff;font:800 17px 'Baloo 2',sans-serif;padding:11px 20px 8px;border-radius:999px;box-shadow:0 5px 0 #a34a05", 'transform:translateY(3px);box-shadow:0 2px 0 #a34a05')}>▶ Play the games</button>
        </div>
      </div>
    </div>
  );
}
