import { sx } from './sx.js';

// Bayani, the young hero: yellow hard hat, orange cape, blue shirt with a star.
export function Mascot({ size, wave, bob, jump, mb = 0 }) {
  const arm = { x: 47, y: 39, width: 7, height: 18, rx: 3.5, fill: '#e8ab70' };
  if (wave) arm.style = { transformBox: 'fill-box', transformOrigin: '50% 10%', animation: 'bh-wave 1.1s ease-in-out infinite' };
  const anim = [jump ? 'bh-jump .7s ease-out' : null, bob ? 'bh-bob 2.8s ease-in-out ' + (jump ? '.7s' : '0s') + ' infinite' : null].filter(Boolean).join(', ');
  return (
    <div style={{ display: 'inline-block', transformOrigin: '50% 100%', animation: anim || 'none', marginBottom: mb }}>
      <svg width={size} height={Math.round(size * 80 / 72)} viewBox="0 0 72 80" style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
        <path d="M24 36 L48 36 L52 70 L20 70 Z" fill="#f2760c" opacity="0.92" />
        <rect x="24" y="37" width="24" height="26" rx="8" fill="#1f6f8b" />
        <polygon points="36,41 38.2,46 43.6,46.4 39.4,49.9 40.8,55.2 36,52.2 31.2,55.2 32.6,49.9 28.4,46.4 33.8,46" fill="#ffd24d" />
        <rect x="18" y="39" width="7" height="18" rx="3.5" fill="#e8ab70" />
        <rect {...arm} />
        <rect x="28" y="61" width="7" height="14" rx="3" fill="#35506b" />
        <rect x="37" y="61" width="7" height="14" rx="3" fill="#35506b" />
        <circle cx="36" cy="24" r="13" fill="#e8ab70" />
        <path d="M23 23 a13 13 0 0 1 26 0 v-3 a13 13 0 0 0 -26 0 Z" fill="#3a2a22" />
        <path d="M21 18 a15 10 0 0 1 30 0 Z" fill="#ffc53d" />
        <rect x="19" y="16" width="34" height="4.5" rx="2.25" fill="#eaa100" />
        <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'bh-blink 4.2s infinite' }}>
          <circle cx="31" cy="25" r="1.9" fill="#2a2320" />
          <circle cx="41" cy="25" r="1.9" fill="#2a2320" />
        </g>
        <circle cx="27.5" cy="29" r="2.1" fill="#f29a7a" opacity="0.55" />
        <circle cx="44.5" cy="29" r="2.1" fill="#f29a7a" opacity="0.55" />
        <path d="M31 30 q5 4 10 0" stroke="#2a2320" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Flame({ w }) {
  return (
    <div style={{ position: 'relative', width: w, height: Math.round(w * 1.35), animation: 'bh-flicker 1.4s ease-in-out infinite', transformOrigin: '50% 100%' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%', background: 'linear-gradient(#ffd24d, #ff9d2e 55%, #f2760c)' }} />
      <div style={{ position: 'absolute', left: '28%', right: '28%', bottom: '8%', height: '48%', borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%', background: '#fff6d6' }} />
    </div>
  );
}

export function Dots() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', animation: 'bh-dot 1.2s ease-in-out ' + (i * 0.16) + 's infinite' }} />
      ))}
    </div>
  );
}

export function Confetti() {
  const C = ['#f2760c', '#ffc53d', '#1aa46a', '#2a6b8f', '#7a53c6', '#e2382b'];
  const kids = [];
  for (let i = 0; i < 30; i++) {
    const r = (n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
    kids.push(<span key={i} style={{ position: 'absolute', top: -24, left: (r(1) * 100).toFixed(1) + '%', width: 7 + r(2) * 6, height: 10 + r(3) * 8, borderRadius: r(4) > 0.6 ? '50%' : 2, background: C[i % C.length], animation: 'bh-fall ' + (2.2 + r(5) * 1.8).toFixed(2) + 's linear ' + (r(6) * 0.8).toFixed(2) + 's both' }} />);
  }
  return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>{kids}</div>;
}

// Rounded orange square with a flame, the app's logo.
export function Logo({ size = 42, radius = 13, flame = [16, 21], pb = 8, shadow = '0 4px 10px rgba(242,118,12,.35)' }) {
  return (
    <div style={{ ...sx('flex:none;background:linear-gradient(135deg,#ffd76a,#f2760c);display:flex;align-items:flex-end;justify-content:center'), width: size, height: size, borderRadius: radius, boxShadow: shadow, paddingBottom: pb }}>
      <div style={{ width: flame[0], height: flame[1], borderRadius: '50% 50% 50% 50%/70% 70% 30% 30%', background: 'linear-gradient(#fff3c4,#ffd24d 45%,#fff6d6)' }} />
    </div>
  );
}
