import { useEffect, useRef, useState } from 'react';
import { sx, pr } from '../ui/sx.js';
import { Mascot } from '../ui/art.jsx';
import { LIVE } from '../data.js';
import { loadTour } from '../tour.js';

// Bayani's island tour. The 3D tour itself is built from tour/ into public/tour/ and plays in a frame;
// it tells the library what Bayani says, when the tour is done, and where to go when it closes.
// Here: the frame, the welcome sheet Bayani shows on a player's first visit, and the Tour tab of Ask Bayani.

export const ISLAND = 'tour/island.webp';
const GREEN = 'background:#128253;color:#fff;box-shadow:0 4px 0 #0b5e3b;border-radius:999px;padding:12px 16px;font-weight:900;font-size:16px;min-height:52px;display:flex;align-items:center;justify-content:center;gap:9px';
const GREEN_DOWN = 'transform:translateY(3px);box-shadow:0 1px 0 #0b5e3b';
const GHOST = 'background:#fff;border:2px solid #d5e3ea;box-shadow:0 4px 0 #d5e3ea;border-radius:999px;padding:12px;font-weight:900;font-size:15px;color:#3d5563;min-height:52px';
const PLAY = <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" style={{ flex: 'none' }}><path d="M4 2.6v10.8c0 .8.9 1.3 1.6.8l8-5.4c.6-.4.6-1.2 0-1.6l-8-5.4C4.9 1.3 4 1.8 4 2.6z" fill="#fff" /></svg>;

// for the credits sheet (the i button), like the games' info tags
const TOUR_INFO = { id: 'tour', icon: '🏝️', name: 'Bayani’s island tour', sub: 'A 3D tour of the game library' };

export const welcomeLine = (nick) => 'Want a tour, ' + nick + '? I’m Bayani! Let me show you the games, the stories and the museum. It only takes a minute.';
export const askLine = 'Want a tour? I can show you the games, the stories and the museum on BAYANIHanda Island.';

export function TourPlay({ c }) {
  const frame = useRef(null);
  const live = useRef(c);
  live.current = c;
  // Fixed at the start: the player's name, the games open now, and whether Bayani may speak.
  const [src] = useState(() => 'tour/index.html?embed=1&name=' + encodeURIComponent(c.nick) + '&sound=' + (c.s.sound ? 1 : 0)
    + '&voice=' + (c.s.voice ? 1 : 0) + '&live=' + LIVE.map((g) => g.id).join(','));
  useEffect(() => {
    function onMessage(e) {
      const d = e.data;
      if (!frame.current || e.source !== frame.current.contentWindow || !d || d.source !== 'bayani-tour') return;
      const cc = live.current;
      if (d.type === 'say' && typeof d.text === 'string') cc.speak(d.text.slice(0, 400), !!d.force);
      else if (d.type === 'hush') { try { window.speechSynthesis.cancel(); } catch (err) { /* no speech */ } }
      else if (d.type === 'done') cc.tourDone();
      else if (d.type === 'close') cc.closeTour(d.reason, d.go);
    }
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      try { window.speechSynthesis.cancel(); } catch (err) { /* no speech */ }
    };
  }, []);
  return (
    <div data-screen-label="Tour" style={sx('position:absolute;inset:0;background:#d9eff7;padding:env(safe-area-inset-top, 0px) 0 env(safe-area-inset-bottom, 0px);display:flex')}>
      <iframe ref={frame} src={src} title="Bayani's island tour" style={sx('flex:1;width:100%;height:100%;border:0;display:block;background:#d9eff7')} />
    </div>
  );
}

// The sheet Bayani shows over Home on a player's first visit.
export function TourWelcome({ c }) {
  const later = () => c.patch({ sheet: null });
  return (
    <>
      <div style={sx('position:relative;height:186px;flex:none;border-radius:22px;overflow:hidden;background:linear-gradient(180deg,#b9e0f1,#eaf6fb)')}>
        <img src={ISLAND} alt="BAYANIHanda Island, with the game signs, the story board and the museum" style={sx('position:absolute;left:50%;top:8px;width:min(100%, 520px);max-width:none;transform:translateX(-50%)')} />
        <span style={sx('position:absolute;top:12px;left:12px;background:#fff;border-radius:999px;padding:5px 12px;font-size:12.5px;font-weight:900;color:#1f5675;box-shadow:0 2px 0 rgba(20,48,66,.12)')}>🏝️ BAYANIHanda Island</span>
      </div>
      <div style={sx('display:flex;align-items:flex-end;gap:10px;margin-top:-74px;position:relative')}>
        <span style={sx('flex:none')}><Mascot size={100} wave bob /></span>
        <div style={sx("flex:1;min-width:0;padding-bottom:6px;font:800 26px/1.05 'Baloo 2',sans-serif;text-wrap:balance")}>Want a tour, {c.nick}?</div>
        <button onClick={() => c.speak(welcomeLine(c.nick), true)} aria-label="Read aloud" style={sx('flex:none;margin-bottom:6px;width:40px;height:40px;border-radius:50%;background:#fff;font-size:16px;border:2px solid #d5e3ea;box-shadow:0 2px 0 #d5e3ea;display:flex;align-items:center;justify-content:center')}>🔊</button>
      </div>
      <p style={sx('margin:0;font-size:16.5px;font-weight:700;line-height:1.45;color:#3d5563;text-wrap:pretty')}>I’m Bayani! Let me show you the games, the stories and the museum. It only takes a minute.</p>
      <div style={sx('display:flex;gap:10px')}>
        <button onClick={() => c.openTour('home')} {...pr('flex:1.5 1 0;' + GREEN, GREEN_DOWN)}>🏝️ Yes, show me!</button>
        <button onClick={later} {...pr('flex:1 1 0;' + GHOST, 'transform:translateY(3px)')}>Maybe later</button>
      </div>
      <p style={sx('margin:0;display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;font-weight:800;color:#4f6572;text-align:center')}>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none' }}><circle cx="12" cy="12" r="9.5" fill="none" stroke="#4f6572" strokeWidth="2.2" /><path d="M12 11v6" stroke="#4f6572" strokeWidth="2.4" strokeLinecap="round" /><circle cx="12" cy="7.4" r="1.5" fill="#4f6572" /></svg>
        You can find the tour anytime in Ask Bayani.
      </p>
    </>
  );
}

// The Tour tab of Ask Bayani: the tour is always here, before and after it is taken.
export function TourTab({ c }) {
  const done = !!loadTour(c.me ? c.me.id : null).done;
  return (
    <>
      <div style={sx('border:2px solid #bfe0ef;border-radius:22px;overflow:hidden;background:#fff')}>
        <div style={sx('position:relative;height:132px;overflow:hidden;background:linear-gradient(180deg,#b9e0f1,#eaf6fb)')}>
          <img src={ISLAND} alt="" style={sx('position:absolute;left:50%;top:4px;width:min(104%, 560px);max-width:none;transform:translateX(-50%)')} />
          <span style={sx('position:absolute;top:10px;left:10px;background:#fff;border-radius:999px;padding:4px 11px;font-size:12.5px;font-weight:900;color:#1f5675;box-shadow:0 2px 0 rgba(20,48,66,.12)')}>About 1 minute</span>
          <button onClick={() => c.patch({ sheet: 'credit', sd: TOUR_INFO })} aria-label="Who made the island tour"
            style={sx('position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;border:1.5px solid #d5e3ea;color:#4f6572;font-size:13px;font-weight:900;display:flex;align-items:center;justify-content:center;background:#fff')}>i</button>
        </div>
        <div style={sx('padding:12px 16px 14px;display:flex;flex-direction:column;gap:4px')}>
          <div style={sx('font-size:12px;font-weight:900;letter-spacing:1px;color:#1f5675')}>🏝️ ISLAND TOUR</div>
          <div style={sx("font:800 21px/1.1 'Baloo 2',sans-serif;padding-top:2px")}>{done ? 'Take the tour again!' : 'Take a tour with me!'}</div>
          <div style={sx('font-size:15px;font-weight:700;color:#3d5563;line-height:1.4')}>Visit the games, the stories and the museum on BAYANIHanda Island.</div>
        </div>
      </div>
      <button onClick={() => c.openTour()} {...pr(GREEN, GREEN_DOWN)}>{PLAY}{done ? 'Start the tour again' : 'Start the tour'}</button>
    </>
  );
}
