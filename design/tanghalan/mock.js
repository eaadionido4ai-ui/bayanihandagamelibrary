// Fills the mockup pages: Bayani and logo artwork, sample artworks, and the 3D gallery renders.
(function () {
  const BAYANI = '<svg viewBox="0 0 72 80" width="100%" height="100%" style="display:block;overflow:visible"><path d="M24 36 L48 36 L52 70 L20 70 Z" fill="#f2760c" opacity="0.92"/><rect x="24" y="37" width="24" height="26" rx="8" fill="#1f6f8b"/><polygon points="36,41 38.2,46 43.6,46.4 39.4,49.9 40.8,55.2 36,52.2 31.2,55.2 32.6,49.9 28.4,46.4 33.8,46" fill="#ffd24d"/><rect x="18" y="39" width="7" height="18" rx="3.5" fill="#e8ab70"/><rect x="47" y="39" width="7" height="18" rx="3.5" fill="#e8ab70"/><rect x="28" y="61" width="7" height="14" rx="3" fill="#35506b"/><rect x="37" y="61" width="7" height="14" rx="3" fill="#35506b"/><circle cx="36" cy="24" r="13" fill="#e8ab70"/><path d="M23 23 a13 13 0 0 1 26 0 v-3 a13 13 0 0 0 -26 0 Z" fill="#3a2a22"/><path d="M21 18 a15 10 0 0 1 30 0 Z" fill="#ffc53d"/><rect x="19" y="16" width="34" height="4.5" rx="2.25" fill="#eaa100"/><circle cx="31" cy="25" r="1.9" fill="#2a2320"/><circle cx="41" cy="25" r="1.9" fill="#2a2320"/><circle cx="27.5" cy="29" r="2.1" fill="#f29a7a" opacity="0.55"/><circle cx="44.5" cy="29" r="2.1" fill="#f29a7a" opacity="0.55"/><path d="M31 30 q5 4 10 0" stroke="#2a2320" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
  const LOGO = '<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block"><defs><clipPath id="lr"><rect width="100" height="100" rx="25"/></clipPath></defs><g clip-path="url(#lr)"><rect width="100" height="100" fill="#cfe6ef"/><polygon points="50,18 77,40 23,40" fill="#16303f" stroke="#16303f" stroke-width="6" stroke-linejoin="round"/><rect x="30" y="39" width="40" height="18" fill="#fff5df"/><rect x="45" y="44" width="10" height="13" rx="2" fill="#f2760c"/><rect x="18" y="56" width="64" height="6" rx="3" fill="#eaa100"/><circle cx="27" cy="68.5" r="4.6" fill="#2a6b8f"/><rect x="22" y="74.5" width="10" height="14" rx="5" fill="#2a6b8f"/><circle cx="42.3" cy="68.5" r="4.6" fill="#128253"/><rect x="37.3" y="74.5" width="10" height="14" rx="5" fill="#128253"/><circle cx="57.7" cy="68.5" r="4.6" fill="#f2760c"/><rect x="52.7" y="74.5" width="10" height="14" rx="5" fill="#f2760c"/><circle cx="73" cy="68.5" r="4.6" fill="#7a53c6"/><rect x="68" y="74.5" width="10" height="14" rx="5" fill="#7a53c6"/></g></svg>';

  // the museum map: rooms that open into each other, with doorways, rooms you visited and where you are
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
  function mapSVG(mini, me) {
    let s = '<svg viewBox="0 0 360 246" width="100%" height="100%" style="display:block;font-family:Nunito,sans-serif">';
    s += '<rect x="0" y="0" width="360" height="246" rx="16" fill="' + (mini ? 'rgba(14,34,51,.55)' : '#f6f1e7') + '"/>';
    ROOMS.forEach(r => { s += '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" rx="12" fill="' + r[4] + '" stroke="' + r[5] + '" stroke-width="' + (mini ? 5 : 2.5) + '"' + (r[7] === '🚪' ? ' stroke-dasharray="5 4"' : '') + '/>'; });
    DOORS.forEach(d => { s += '<rect x="' + d[0] + '" y="' + d[1] + '" width="' + d[2] + '" height="' + d[3] + '" rx="3" fill="' + (mini ? '#e9dcc4' : '#e9dcc4') + '"/>'; });
    if (!mini) {
      ROOMS.forEach(r => {
        const cx = r[0] + r[2] / 2, top = r[1] + r[3] / 2 - (r[6].length === 2 ? 14 : 8);
        s += '<text x="' + cx + '" y="' + (top - 2) + '" font-size="17" text-anchor="middle">' + r[7] + '</text>';
        r[6].forEach((l, i) => { s += '<text x="' + cx + '" y="' + (top + 17 + i * 12) + '" font-size="11" font-weight="900" text-anchor="middle" fill="' + r[8] + '">' + l + '</text>'; });
      });
      [[240, 170], [92, 82]].forEach(([x, y]) => { s += '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#1aa46a"/><text x="' + x + '" y="' + (y + 4) + '" font-size="11" font-weight="900" fill="#fff" text-anchor="middle">✓</text>'; });
    }
    s += '<polyline points="180,214 180,150 222,140" fill="none" stroke="#f2760c" stroke-width="' + (mini ? 6 : 3) + '" stroke-dasharray="' + (mini ? '10 8' : '5 5') + '" stroke-linecap="round"/>';
    s += mini ? '<circle cx="234" cy="136" r="17" fill="#ffc53d" stroke="#fff" stroke-width="5"/>'
      : '<circle cx="234" cy="136" r="13" fill="#fff" stroke="#f2760c" stroke-width="3"/><text x="234" y="141" font-size="15" text-anchor="middle">' + (me || '🦊') + '</text>';
    return s + '</svg>';
  }

  async function run() {
    document.querySelectorAll('[data-map]').forEach(el => { el.innerHTML = mapSVG(el.dataset.map === 'mini', el.dataset.me); });
    document.querySelectorAll('[data-bayani]').forEach(el => { el.innerHTML = BAYANI; });
    document.querySelectorAll('[data-logo]').forEach(el => { el.innerHTML = LOGO; });
    await KidArt.ready();
    await Promise.all(['800 20px "Baloo 2"', '700 20px Nunito', '800 20px Nunito', '900 20px Nunito'].map(f => document.fonts.load(f)));
    const cache = {};
    document.querySelectorAll('img[data-art]').forEach(img => {
      const n = img.dataset.art; cache[n] = cache[n] || KidArt.draw(n).toDataURL('image/png'); img.src = cache[n];
    });
    for (const cv of document.querySelectorAll('canvas[data-view]')) await renderGallery(cv, JSON.parse(cv.dataset.view));
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    window.__ready = true;
  }
  run().catch(e => { console.log('ERR ' + (e && e.stack || e)); window.__ready = true; });
})();
