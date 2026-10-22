import { useEffect, useRef, useState } from 'react';
import { sx } from '../ui/sx.js';
import { game } from '../data.js';

// Games that are pages of their own (built from games/ into public/games/ by scripts/build-games.mjs) play in a
// frame, the way the Handaventures stories do: the order games (Quake in Order, Heart in Order and Press On). The
// frame opens at the level picked on the intro (&level=) and with the sound setting (&sound=). The game tells the
// library when a round ends, what Bayani should read aloud, and when the player leaves (postMessage with source
// 'bayani-game').
export function frameSrc(g, mode, sound) {
  const level = g.frameModes ? g.frameModes[mode] || g.frameModes[0] : null;
  return g.frame + '?embed=1' + (level ? '&level=' + level : '') + '&sound=' + (sound ? 1 : 0);
}
export function GamePlay({ c }) {
  const g = game(c.s.gameId);
  const frame = useRef(null);
  const live = useRef(c);
  live.current = c;
  // Fixed at the start, so earning a badge never reloads the game.
  const [src] = useState(() => frameSrc(g, c.s.mode, c.s.sound));
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
      <iframe ref={frame} src={src} title={g.name} style={sx('flex:1;width:100%;height:100%;border:0;display:block;background:#e8f2f7')} />
    </div>
  );
}
