import { useEffect, useRef, useState } from 'react';
import { sx } from '../ui/sx.js';
import { game } from '../data.js';

// Games that are pages of their own (built from games/ into public/games/ by scripts/build-games.mjs) play in a
// frame, the way the Handaventures stories do: the order games (Quake in Order, Heart in Order and Press On),
// Weather Studio, Handa vs. Hazard and Bayanihan Mode. The frame opens at the level picked on the intro (&level=)
// and with the sound setting (&sound=). A game with frameName also gets the voice setting (&voice=) and the nickname
// of the player (&name=): Weather Studio puts it on its cue card, and Bayanihan Mode makes it the first player's name.
// One with frameVoice (Handa vs. Hazard) gets only the voice setting. The game tells the library when a round ends,
// what Bayani should read aloud, and when the player leaves (postMessage with source 'bayani-game').
// The frame may use the microphone, for Weather Studio's voice recording (only after a grown-up's OK in the game).
export function frameSrc(g, mode, sound, more) {
  const level = g.frameModes ? g.frameModes[mode] || g.frameModes[0] : null;
  let src = g.frame + '?embed=1' + (level ? '&level=' + level : '') + '&sound=' + (sound ? 1 : 0);
  if (more) Object.keys(more).forEach((k) => { if (more[k] != null) src += '&' + k + '=' + encodeURIComponent(more[k]); });
  return src;
}
export function GamePlay({ c }) {
  const g = game(c.s.gameId);
  const frame = useRef(null);
  const live = useRef(c);
  live.current = c;
  // Fixed at the start, so earning a badge never reloads the game.
  const [src] = useState(() => frameSrc(g, c.s.mode, c.s.sound, {
    voice: g.frameName || g.frameVoice ? (c.s.voice ? 1 : 0) : null,
    name: g.frameName ? c.nick : null,
  }));
  useEffect(() => {
    function onMessage(e) {
      const d = e.data;
      if (!frame.current || e.source !== frame.current.contentWindow || !d || d.source !== 'bayani-game' || d.game !== g.id) return;
      const cc = live.current;
      if (d.type === 'result') cc.gameEnded(g, d);
      else if (d.type === 'say' && typeof d.text === 'string') cc.speak(d.text.slice(0, 400), !!d.force);
      else if (d.type === 'hush') { try { window.speechSynthesis.cancel(); } catch (err) { /* no speech */ } }
      else if (d.type === 'exit') cc.go('intro');
    }
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      try { window.speechSynthesis.cancel(); } catch (err) { /* no speech */ }
    };
  }, [g]);
  return (
    <div data-screen-label="Gameplay" style={sx('position:absolute;inset:0;background:#e8f2f7;padding:env(safe-area-inset-top, 0px) 0 env(safe-area-inset-bottom, 0px);display:flex')}>
      <iframe ref={frame} src={src} title={g.name} allow="microphone; autoplay" style={sx('flex:1;width:100%;height:100%;border:0;display:block;background:#e8f2f7')} />
    </div>
  );
}
