import { sx, pr } from '../ui/sx.js';
import { Mascot, Confetti } from '../ui/art.jsx';
import { engine } from '../engine/bridge.js';
import { game, pillarOf } from '../data.js';

const STAR_ON = 'display:inline-block;color:#ffc53d;text-shadow:0 3px 0 #d99a00;animation:bh-pop .5s both';

// Where "Next" goes when the game itself has no next map, place or puzzle left.
function nextStep(rg, R) {
  if (R.hasNext) return { label: R.nextLabel || rg.next || 'Next', go: () => engine.next(R.screen) };
  if (!rg.next || !rg.modes) return null;
  if (rg.id === 'cleanup') return { label: rg.next, mode: R.mode === 0 ? 1 : 0 };
  // Move on to the next level or map only after a passing round.
  if (R.stars >= 2 && R.mode < rg.modes.length - 1) return { label: rg.next, mode: R.mode + 1 };
  return null;
}

function Review({ review }) {
  if (!review) return null;
  if (review.perfect) return <p style={sx('margin:0;background:#eafaf1;border:2px solid #b9ecd0;border-radius:20px;padding:14px 16px;color:#12643f;font-weight:800;font-size:15px;line-height:1.45')}>✓ {review.perfect}</p>;
  return review.groups.map((grp) => (
    <div key={grp.title} style={{ ...sx('border-radius:20px;padding:14px 16px;display:flex;flex-direction:column;gap:8px'), background: grp.kind === 'warn' ? '#fff6ef' : '#eef7ff', border: '2px solid ' + (grp.kind === 'warn' ? '#ffd9bf' : '#cfe4f7') }}>
      <div style={sx("font:800 18px/1.1 'Baloo 2',sans-serif;padding-top:2px")}>{grp.title}</div>
      {grp.items.map((it) => (
        <div key={it.name} style={sx('display:flex;gap:12px;align-items:flex-start')}>
          <span style={sx('font-size:26px;line-height:1;flex:none')}>{it.icon}</span>
          <span style={sx('min-width:0')}><b style={sx('display:block;font-weight:900;font-size:15px')}>{it.name}</b><span style={sx('display:block;font-weight:700;font-size:13.5px;color:#4a626f;line-height:1.4')}>{it.info}</span></span>
        </div>
      ))}
    </div>
  ));
}

export default function Result({ c }) {
  const { s, mine } = c;
  const R = s.result || { gameId: 'fire', stars: 0, title: '', line: '', newBadge: false, mode: 0 };
  const rg = game(R.gameId), rp = pillarOf(rg);
  const had = !R.newBadge && !!mine[rg.id];
  const noB = !R.newBadge && !had;
  const nx = nextStep(rg, R);
  const stars = [1, 2, 3].map((n) => (R.stars >= n
    ? <span key={n} style={{ ...sx(STAR_ON), animationDelay: (n - 1) * 0.15 + 's' }}>★</span>
    : <span key={n} style={sx('color:#d5e3ea')}>★</span>));

  return (
    <div data-screen-label="Results" className="scroll" style={{ ...sx('position:absolute;inset:0;overflow-x:hidden;background:radial-gradient(120% 90% at 50% -10%,#eaf7f0,#cdeedd)'), padding: c.pad }}>
      {R.stars >= 2 && <Confetti key={'cf' + s.jump} />}
      <div style={sx('position:relative;z-index:4;max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:14px')}>
        <div style={sx('background:#fff;border-radius:28px;box-shadow:0 10px 28px rgba(18,48,63,.15);padding:24px 20px 22px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px')}>
          <div style={sx('display:flex;gap:6px;font-size:50px;line-height:1')} aria-label={R.stars + ' of 3 stars'}>{stars}</div>
          <div style={sx("font:800 31px/1.05 'Baloo 2',sans-serif;margin-top:8px")}>{R.title || rg.name}</div>
          {R.line && <div style={sx('font-weight:800;color:#4f6572;font-size:15px;line-height:1.4')}>{R.line}</div>}
          {R.newBadge && (
            <div style={sx('margin-top:12px;display:flex;align-items:center;gap:12px;background:#fff5df;border:2px solid #ffe2a8;border-radius:20px;padding:12px 14px;text-align:left;width:100%')}>
              <span style={{ ...sx('width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;flex:none;border:3px solid #fff;box-shadow:0 0 0 3px #ffc53d;animation:bh-pop .6s .45s both'), background: rp.grad }}>{rg.badge[1]}</span>
              <span style={sx('flex:1;min-width:0')}>
                <span style={sx('display:block;font-size:11.5px;font-weight:900;letter-spacing:1px;color:#7a5400;text-transform:uppercase')}>New badge · {rg.badge[0]}</span>
                <span style={sx('display:block;font-weight:800;font-size:15px;margin-top:2px')}>New badge earned for your Champion ID!</span>
              </span>
            </div>
          )}
          {had && <div style={sx('margin-top:10px;font-size:14px;font-weight:800;color:#0c5c3a;background:#e5f6ee;border-radius:999px;padding:6px 14px')}>✓ The {rg.badge[0]} badge is already on your Champion ID</div>}
          {noB && <div style={sx('margin-top:10px;font-size:14px;font-weight:800;color:#2f5d77;background:#eef6fa;border-radius:999px;padding:6px 14px')}>Get {rg.badgeStars || 3} stars to earn the {rg.badge[0]} badge.</div>}
        </div>
        <Review review={R.review} />
        <div style={sx('display:flex;align-items:flex-end;gap:10px')}>
          <span style={sx('flex:none')}><Mascot key={'rm' + s.jump} size={76} jump bob /></span>
          <div style={sx('flex:1;min-width:0;background:#fff6ef;border:2px solid #ffd9bf;border-radius:20px 20px 20px 6px;padding:12px 46px 12px 14px;position:relative')}>
            <div style={sx('font-size:11.5px;font-weight:900;letter-spacing:1px;color:#8a3d0c')}>REAL LIFE REMINDER</div>
            <p style={sx('margin:3px 0 0;font-weight:700;font-size:14.5px;line-height:1.45;color:#5c2f0e;text-wrap:pretty')}>{rg.remind}</p>
            <button onClick={() => c.speak(rg.remind, true)} aria-label="Read aloud" style={sx('position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:50%;background:#fff;font-size:14px;display:flex;align-items:center;justify-content:center')}>🔊</button>
          </div>
        </div>
        <div style={sx('display:flex;flex-direction:column;gap:12px;margin-top:4px;padding-bottom:env(safe-area-inset-bottom, 0px)')}>
          <button onClick={() => engine.retry(R.screen)} {...pr("width:100%;background:#d9650a;color:#fff;font:800 21px 'Baloo 2',sans-serif;padding:13px 24px 10px;border-radius:999px;box-shadow:0 6px 0 #a34a05", 'transform:translateY(4px);box-shadow:0 2px 0 #a34a05')}>↻ Play again</button>
          {nx && <button onClick={() => (nx.go ? nx.go() : c.startGame(rg.id, nx.mode))} {...pr("width:100%;background:#128253;color:#fff;font:800 20px 'Baloo 2',sans-serif;padding:12px 24px 9px;border-radius:999px;box-shadow:0 5px 0 #0b5e3b", 'transform:translateY(4px);box-shadow:0 1px 0 #0b5e3b')}>{nx.label} →</button>}
          <div style={sx('display:flex;gap:10px')}>
            {R.newBadge && <button onClick={() => c.go('id')} style={sx('flex:1;background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;border-radius:999px;padding:12px;font-weight:900;font-size:15px')}>🏆 My ID</button>}
            <button onClick={() => c.go('home')} style={sx('flex:1;background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;border-radius:999px;padding:12px;font-weight:900;font-size:15px')}>🏠 Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}
