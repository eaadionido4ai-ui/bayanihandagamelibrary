import { sx } from '../ui/sx.js';

const LABEL = 'font-size:12px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#4f6572;margin:6px 4px 0';
const CARD = 'background:#fff;border-radius:22px;box-shadow:0 4px 0 rgba(20,48,66,.08);overflow:hidden';
const ROW = 'display:flex;align-items:center;gap:12px;width:100%;padding:16px;text-align:left';
const ABOUT_P = 'margin:8px 0 0;line-height:1.55;color:#25404e;font-weight:600;font-size:15px';

export function Toggle({ on, small }) {
  return on
    ? <span style={sx('width:52px;height:32px;border-radius:16px;background:#128253;position:relative;flex:none')}><span style={sx('position:absolute;top:4px;left:24px;width:24px;height:24px;border-radius:50%;background:#fff;color:#128253;font-size:13px;font-weight:900;display:flex;align-items:center;justify-content:center')}>{small ? '' : '✓'}</span></span>
    : <span style={sx('width:52px;height:32px;border-radius:16px;background:#e3eaee;border:2px solid #8fa3b0;position:relative;flex:none')}><span style={sx('position:absolute;top:6px;left:6px;width:16px;height:16px;border-radius:50%;background:#8fa3b0')} /></span>;
}

export default function Settings({ c }) {
  const { s, patch, nick } = c;
  const toggleVoice = () => { const v = !s.voice; patch({ voice: v }); if (v) setTimeout(() => c.speak('I will read tips and hints aloud.', true), 0); };
  return (
    <div data-screen-label="Settings" className="scroll" style={{ ...sx('position:absolute;inset:0;background:radial-gradient(120% 70% at 50% -10%,#eef6fa,#cfe6ef)'), padding: c.pad }}>
      <div style={sx('max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:14px')}>
        <div style={sx('display:flex;align-items:center;gap:12px')}>
          <button onClick={() => c.go('home')} aria-label="Back" style={sx('width:48px;height:48px;border-radius:16px;background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center;flex:none')}>←</button>
          <div style={sx("font:800 28px/1 'Baloo 2',sans-serif;padding-top:4px")}>Settings</div>
        </div>
        <div style={sx(LABEL)}>Sound</div>
        <div style={sx(CARD)}>
          <button onClick={() => patch({ sound: !s.sound })} role="switch" aria-checked={s.sound} style={{ ...sx(ROW), borderBottom: '1px solid #e3ecf1' }}>
            <span style={sx('font-size:22px')}>🔈</span><span style={sx('flex:1;font-weight:900;font-size:16px')}>Sound and voice</span><Toggle on={s.sound} />
          </button>
          <button onClick={toggleVoice} role="switch" aria-checked={s.voice} style={sx(ROW)}>
            <span style={sx('font-size:22px')}>🗣️</span><span style={sx('flex:1;font-weight:900;font-size:16px')}>Read tips and hints aloud</span><Toggle on={s.voice} />
          </button>
        </div>
        <div style={sx(LABEL)}>Players</div>
        <div style={sx(CARD)}>
          <button onClick={() => c.go('players')} style={{ ...sx(ROW), borderBottom: '1px solid #e3ecf1' }}><span style={sx('font-size:22px')}>👥</span><span style={sx('flex:1;font-weight:900;font-size:16px')}>Who is playing?</span><span style={sx('font-size:22px;font-weight:900;color:#8fa3b0')}>›</span></button>
          <button onClick={() => patch({ sheet: 'reset' })} style={sx(ROW)}><span style={sx('font-size:22px')}>🔄</span><span style={sx('flex:1;font-weight:900;font-size:16px;color:#c62f22')}>Reset badges for {nick}</span></button>
        </div>
        <div style={sx(LABEL)}>About</div>
        <div style={sx('background:#fff;border-radius:22px;box-shadow:0 4px 0 rgba(20,48,66,.08);padding:18px')}>
          <span style={sx('display:inline-block;background:#fff5df;color:#7a5400;font-weight:900;padding:5px 11px;border-radius:999px;font-size:12px;letter-spacing:.5px')}>ABOUT</span>
          <div style={sx("font:800 20px/1.1 'Baloo 2',sans-serif;margin-top:10px;color:#b35205")}>What is this app?</div>
          <p style={sx('margin:6px 0 0;line-height:1.55;color:#25404e;font-weight:600;font-size:15px')}>BAYANIHanda Game Library turns everyday safety lessons into short, playable adventures for children. The games are grouped around the four parts of disaster risk reduction and management: preventing and reducing hazards, preparing before a disaster, responding when one strikes, and recovering afterward.</p>
          {s.aboutMore && (
            <>
              <p style={sx(ABOUT_P)}>The concepts behind each pillar are turned into short, hands-on games so learning about disasters becomes fun instead of frightening. The playful approach draws young learners in and helps the lessons stick. Every game runs fully offline on a phone or tablet, keeps no personal data, and speaks its tips aloud so younger and older children can play side by side.</p>
              <p style={sx(ABOUT_P)}>Finish a game with flying colors and you earn a badge for your Champion ID. Together the games build the calm, ready habits that help a child act well in the first minutes of an emergency.</p>
            </>
          )}
          <button onClick={() => patch({ aboutMore: !s.aboutMore })} aria-expanded={s.aboutMore} style={sx('margin-top:8px;color:#b35205;font-weight:900;font-size:15px;padding:4px 0')}>{s.aboutMore ? 'See less' : 'See more'}</button>
        </div>
        <button onClick={() => patch({ sheet: 'behind' })} style={sx('display:flex;align-items:center;gap:12px;width:100%;padding:16px;text-align:left;background:#fff;border-radius:22px;box-shadow:0 4px 0 rgba(20,48,66,.08)')}><span style={sx('font-size:22px')}>🔥</span><span style={sx('flex:1;font-weight:900;font-size:16px')}>Behind BAYANIHanda</span><span style={sx('font-size:22px;font-weight:900;color:#8fa3b0')}>›</span></button>
        <p style={sx('margin:4px 0 0;text-align:center;font-size:12.5px;font-weight:700;color:#4f6572')}>Works offline · Version 1.0</p>
      </div>
    </div>
  );
}
