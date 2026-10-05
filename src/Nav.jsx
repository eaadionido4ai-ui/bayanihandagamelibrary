import { sx } from './ui/sx.js';
import { Mascot, Logo } from './ui/art.jsx';

function tabs(c) {
  const T = { home: ['🏠', 'Home'], games: ['🎮', 'Games'], id: ['🏆', 'My ID'], players: [c.myAv.e, 'Players'] };
  const mk = (k) => ({ k, icon: T[k][0], label: T[k][1], on: c.tabOf === k, go: () => c.go(k, k === 'games' ? { filter: 'all' } : {}) });
  return { left: [mk('home'), mk('games')], right: [mk('id'), mk('players')] };
}

function Tab({ t, rail }) {
  const w = rail ? 58 : 54, h = rail ? 34 : 32, fs = rail ? 21 : 20, ls = rail ? 13 : 12.5;
  return (
    <button onClick={t.go} aria-current={t.on ? 'page' : undefined} style={rail ? sx('display:flex;flex-direction:column;align-items:center;gap:4px;width:84px;padding:6px 0') : sx('display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;min-height:56px')}>
      {t.on ? (
        <>
          <span style={{ width: w, height: h, borderRadius: h / 2, background: '#ffe4c4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs }}>{t.icon}</span>
          <span style={{ fontSize: ls, fontWeight: 900, color: '#a84d04' }}>{t.label}</span>
        </>
      ) : (
        <>
          <span style={{ width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs, filter: 'grayscale(.45)', opacity: 0.85 }}>{t.icon}</span>
          <span style={{ fontSize: ls, fontWeight: 700, color: '#4f6572' }}>{t.label}</span>
        </>
      )}
    </button>
  );
}

export function NavBar({ c }) {
  const t = tabs(c);
  return (
    <nav style={sx('flex:none;position:relative;z-index:20;background:#fff;border-top:1px solid #d5e3ea;display:grid;grid-template-columns:repeat(5,1fr);align-items:end;padding:8px 2px calc(env(safe-area-inset-bottom, 0px) + 12px)')}>
      {t.left.map((x) => <Tab key={x.k} t={x} />)}
      <button onClick={c.openAsk} aria-label="Ask Bayani" style={sx('display:flex;flex-direction:column;align-items:center;gap:3px;margin-top:-36px')}>
        <span style={sx('width:72px;height:72px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe58a,#ffc53d 60%,#eaa100);border:4px solid #fff;box-shadow:0 5px 0 #c99400,0 8px 18px rgba(14,34,51,.18);display:flex;align-items:flex-end;justify-content:center;overflow:hidden')}><Mascot size={52} bob mb={-6} /></span>
        <span style={sx('font-size:12.5px;font-weight:900')}>Ask Bayani</span>
      </button>
      {t.right.map((x) => <Tab key={x.k} t={x} />)}
    </nav>
  );
}

export function NavRail({ c }) {
  const t = tabs(c);
  return (
    <nav style={sx('flex:none;width:100px;height:100%;background:#fff;border-right:1px solid #d5e3ea;display:flex;flex-direction:column;align-items:center;gap:4px;padding:calc(env(safe-area-inset-top, 0px) + 24px) 0 22px;z-index:20')}>
      <div style={{ marginBottom: 18 }}><Logo size={48} radius={15} flame={[18, 24]} pb={9} shadow="0 4px 12px rgba(242,118,12,.35)" /></div>
      {t.left.map((x) => <Tab key={x.k} t={x} rail />)}
      <button onClick={c.openAsk} aria-label="Ask Bayani" style={sx('display:flex;flex-direction:column;align-items:center;gap:4px;margin:8px 0')}>
        <span style={sx('width:68px;height:68px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe58a,#ffc53d 60%,#eaa100);border:4px solid #fff;box-shadow:0 4px 0 #c99400,0 6px 14px rgba(14,34,51,.16);display:flex;align-items:flex-end;justify-content:center;overflow:hidden')}><Mascot size={48} bob mb={-6} /></span>
        <span style={sx('font-size:12.5px;font-weight:900')}>Ask Bayani</span>
      </button>
      {t.right.map((x) => <Tab key={x.k} t={x} rail />)}
      <div style={{ flex: 1 }} />
      <button onClick={() => c.go('settings')} aria-label="Settings" style={sx('width:48px;height:48px;border-radius:16px;background:#eef6fa;font-size:20px;display:flex;align-items:center;justify-content:center')}>⚙️</button>
    </nav>
  );
}
